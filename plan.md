# Plan Detaliat - Implementare Push Notifications WhatsApp-Style pentru Mesaje

## 🎯 Obiectiv Final
Sistem de mesaje în timp real fără WebSockets/polling - folosind VAPID Push Notifications + Service Worker pentru UX similar cu WhatsApp Web.

## 📋 Arhitectură Generală

### Flux Mesaje (Identic PWA & Browser):
1. User A trimite mesaj → Salvează în MongoDB
2. Server trimite push VAPID către dispozitivul User B
3. Service Worker primește push → Notificare vizuală (+sunet doar PWA)
4. Service Worker → postMessage către tab activ
5. Tab rulează refresh logic → UI se actualizează instant

### Diferențiere Platforme:
- **PWA instalat**: Notificare + sunet + refresh instant
- **Browser normal**: Notificare + refresh instant (fără sunet)

---

## 🚀 Plan Implementare Pas cu Pas

### Faza 1: Setup VAPID Infrastructure
#### 1.1 Instalează web-push package
```bash
npm install web-push
```

#### 1.2 Configurează VAPID Keys
- Adaugă în `.env.local`:
```
VAPID_SUBJECT=mailto:your-email@example.com
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
```

#### 1.3 Generează VAPID Keys (development)
```javascript
// Script temporar pentru generare keys
const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();
console.log(vapidKeys);
```

### Faza 2: Backend Push Logic
#### 2.1 Creează API `/api/push/register`
- Endpoint pentru înregistrare push subscription
- Salvează subscription în user document MongoDB
- Returnează success confirmation

#### 2.2 Modifică `/api/messages` POST
- După salvare mesaj → găsește recipient
- Dacă recipient are push subscription activ → trimite push
- Include metadata: conversationId, sender info

#### 2.3 Funcție helper pentru trimitere push
```javascript
// Într-un utils file
import webpush from 'web-push';

export async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (error) {
    console.error('Push send failed:', error);
  }
}
```

### Faza 3: Service Worker Enhancement
#### 3.1 Modifică `src/worker/index.js`
```javascript
self.addEventListener("push", async (event) => {
  const data = event.data.json();

  // 1. Notificare vizuală (toate platformele)
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon.png",
      vibrate: [200, 100, 200],
      data: { conversationId: data.conversationId }
    })
  );

  // 2. Detectare PWA pentru sunet
  const isPWA = self.matchMedia('(display-mode: standalone)').matches ||
                self.navigator.standalone === true;

  // 3. Sunet doar pentru PWA
  if (isPWA) {
    // Play ping.mp3 (trebuie adăugat în public/)
    // Folosește Audio API sau notificare cu sunet
  }

  // 4. Trimite mesaj către tab activ
  self.clients.matchAll({ type: "window", includeUncontrolled: true })
    .then(clients => {
      for (const client of clients) {
        client.postMessage({
          type: "NEW_MESSAGE",
          conversationId: data.conversationId,
          message: data
        });
      }
    });
});

// Click pe notificare
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(`/messages?conversation=${event.notification.data.conversationId}`)
  );
});
```

### Faza 4: Frontend Message Handler Global
#### 4.1 Creează MessageHandler Component
```javascript
// src/components/MessageHandler.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function MessageHandler() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    // 1. Înregistrează push subscription la login
    const registerPush = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        });

        await fetch('/api/push/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription })
        });
      } catch (error) {
        console.error('Push registration failed:', error);
      }
    };

    registerPush();

    // 2. Ascultă mesaje din Service Worker
    const handleMessage = (event) => {
      if (event.data?.type === "NEW_MESSAGE") {
        handleNewMessage(event.data);
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, [session?.user?.id]);

  const handleNewMessage = (data) => {
    // Dispatch global event pentru toate componentele
    window.dispatchEvent(new CustomEvent('newMessage', {
      detail: {
        conversationId: data.conversationId,
        message: data.message
      }
    }));

    // Actualizează counters
    window.dispatchEvent(new CustomEvent('messagesViewed'));
  };

  return null; // Component invizibil
}
```

#### 4.2 Integrează în ClientLayout
```javascript
// src/app/client-layout.tsx
import MessageHandler from '@/components/MessageHandler';

// În return statement:
<MessageHandler />
```

### Faza 5: Update Logic pentru Pagini
#### 5.1 Modifică pagina Messages (`src/app/messages/page.tsx`)
```javascript
// Adaugă useEffect pentru mesaj nou
useEffect(() => {
  const handleNewMessage = (event) => {
    const { conversationId } = event.detail;

    // Dacă suntem pe pagina mesajului respectiv → refresh
    if (selectedConversation?._id === conversationId) {
      refreshChat(conversationId);
    }

    // Mereu refresh lista conversații pentru counters
    fetchConversations();
  };

  window.addEventListener('newMessage', handleNewMessage);

  return () => window.removeEventListener('newMessage', handleNewMessage);
}, [selectedConversation]);

// Funcție refreshChat
const refreshChat = async (conversationId) => {
  try {
    const res = await fetch(`/api/messages?conversationId=${conversationId}`);
    const messages = await res.json();
    setCurrentMessages(messages);

    // Marchează ca citit
    await fetch(`/api/conversations/${conversationId}/read`, { method: 'POST' });
  } catch (error) {
    console.error('Refresh chat failed:', error);
  }
};
```

#### 5.2 Actualizează Navbar & MobileNav
- Ascultă event `newMessage` pentru refresh counters
- Nu mai au nevoie de modificări suplimentare

### Faza 6: Audio Notification pentru PWA
#### 6.1 Adaugă ping.mp3 în `public/`
#### 6.2 Modifică Service Worker pentru sunet
```javascript
// În event listener push
if (isPWA) {
  // Metoda 1: Folosește Notification cu sunet
  const audio = new Audio('/ping.mp3');
  audio.play().catch(console.error);

  // Metoda 2: Custom notification cu requireInteraction
  // pentru a ține notificarea vizibilă
}
```

### Faza 7: Testing și Fallback
#### 7.1 Test Matrix
- ✅ PWA instalat mobil: Notificare + sunet + refresh instant
- ✅ Browser desktop: Notificare + refresh instant
- ✅ Browser mobil: Notificare + refresh instant
- ✅ User delogat: Nicio acțiune
- ✅ Fără Service Worker: Fallback la polling (opțional)

#### 7.2 Fallback pentru când push nu funcționează
```javascript
// În MessageHandler - polling fallback
useEffect(() => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    // Fallback la polling every 30 seconds
    const interval = setInterval(() => {
      // Check for new messages via API
    }, 30000);

    return () => clearInterval(interval);
  }
}, []);
```

---

## 🛠 Technical Details

### Dependencies
- `web-push`: ^3.6.7
- Service Worker existent
- MongoDB pentru subscriptions

### Environment Variables
```env
VAPID_SUBJECT=mailto:admin@imo.ro
VAPID_PUBLIC_KEY=your-generated-public-key
VAPID_PRIVATE_KEY=your-generated-private-key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=same-as-above
```

### Database Schema Updates
```javascript
// Adaugă în user schema
pushSubscription: {
  endpoint: String,
  keys: {
    p256dh: String,
    auth: String
  }
}
```

### Security Considerations
- VAPID keys în environment (nu în cod)
- Validare subscription la înregistrare
- Error handling pentru push fail
- Rate limiting pentru push requests

---

## 🎯 Expected Results

După implementare:
- ✅ Mesaje apar instant în chat (ca WhatsApp)
- ✅ Notificări push pe toate dispozitivele
- ✅ Sunet doar pentru PWA instalat
- ✅ Counters actualizate în timp real
- ✅ Fără WebSockets sau polling
- ✅ Funcționează offline-ready (PWA)
- ✅ Scalabil pentru mulți users

## 🚀 Implementation Order

1. ✅ Setup VAPID (Faza 1)
2. 🔄 Backend push logic (Faza 2) - În lucru
3. ⏳ Service Worker update (Faza 3) - Următorul
4. ⏳ Global message handler (Faza 4) - După SW
5. ⏳ Page updates (Faza 5) - După handler
6. ⏳ Audio (Faza 6) - Final
7. ⏳ Testing (Faza 7) - Verificare completă

**Ready pentru implementare pas cu pas!** 🎉
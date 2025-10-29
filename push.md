# Plan Implementare Push Notifications pentru PWA Imob.ro

## 🎯 Obiectiv
Implementare push notifications pentru notificări instantanee când cineva trimite mesaje către orice user autentificat, esențial pentru comunicare în timp real pe platforma imobiliară.

## 📋 Cerințe Business
- **Toți userii autentificați** primesc notificări când cineva le trimite mesaje
- **Notificări instantanee** chiar dacă PWA-ul e închis sau telefonul e lock-uit
- **Rate limiting** no rate limiting
- **Cost zero** pentru volume mici/medii
- **Fallback** la badge-uri în app pentru toate mesajele

## 🏗️ Arhitectură

### 1. VAPID (Voluntary Application Server Identification)
- **Chei VAPID**: Pereche publică/privată pentru autentificare server
- **Generare**: Folosim `web-push` library pentru generare chei
- **Stocare**:
  - Cheie publică: În `.env.local` și client-side
  - Cheie privată: Doar server-side în `.env.local`

### 2. Service Worker
- **Fișier**: `public/sw.js` (actualizat pentru push events)
- **Responsabilități**:
  - Gestionare push notifications primite
  - Afișare notificări native
  - Click handler pentru deschidere PWA
  - Background sync pentru offline

### 3. Subscription Management
- **Tabel DB**: `push_subscriptions`
  - `userId`: String (ObjectId user)
  - `subscription`: JSON (PushSubscription object)
  - `createdAt`: Date
  - `updatedAt`: Date
- **API Endpoints**:
  - `POST /api/push/subscribe` - Salvare subscription
  - `DELETE /api/push/unsubscribe` - Ștergere subscription

### 4. Server-side Push Logic
- **Librărie**: `web-push` pentru Node.js
- **Trigger**: Când se creează un mesaj nou în `POST /api/conversations`
- **Filtrare**:
  - Pentru toate mesajele din conversații
  - Rate limiting: max 10 notificări/zi per user
  - Verificare dacă user-ul are push activat în setări

## 📁 Fișiere de Implementat/Modificat

### Frontend
1. **Service Worker** (`public/sw.js`)
   - Event listener pentru `push`
   - Event listener pentru `notificationclick`
   - Gestionare badge app icon

2. **Hook pentru Push** (`src/hooks/usePushNotifications.ts`)
   - Permisiune notifications
   - Subscription la push
   - Salvarea subscription în DB

3. **Componentă Setări** (`src/components/settings/NotificationSettings.tsx`)
   - Toggle pentru push notifications
   - Toggle pentru sunet notificări

4. **Layout Update** (`src/app/layout.tsx`)
   - Înregistrare service worker
   - Inițializare push permissions

### Backend
1. **API Subscription** (`src/app/api/push/subscribe/route.ts`)
   - POST: Salvare subscription
   - DELETE: Ștergere subscription

2. **Service Push** (`src/services/push.service.ts`)
   - `sendPushNotification(userId, message)`
   - Rate limiting logic
   - VAPID configuration

3. **Conversations API Update** (`src/app/api/conversations/route.ts`)
   - Import push service
   - Trigger push după creare mesaj

### Environment Variables
```env
# VAPID Keys
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=your-email@example.com
```

## 🔄 Flow Implementare

### Faza 1: Setup VAPID și Service Worker
1. Generare chei VAPID
2. Configurare service worker cu push events
3. Testare înregistrare service worker

### Faza 2: Subscription Management
1. Creare tabel `push_subscriptions` în DB
2. API endpoints pentru subscribe/unsubscribe
3. Hook pentru gestionare subscriptions

### Faza 3: Server-side Push
1. Service pentru trimitere push notifications
2. Rate limiting și filtrare
3. Integrare în conversations API

### Faza 4: User Experience
1. Setări pentru activare/dezactivare push
2. Fallback la badge-uri în app
3. Testare cross-browser

## 🧪 Testare

### Teste Funcționale
- ✅ Push notification primit când ești offline
- ✅ Click pe notificare deschide conversația
- ✅ Rate limiting funcționează
- ✅ Dezactivare push din setări

### Teste Cross-browser
- ✅ Chrome/Android
- ✅ Firefox
- ✅ Safari (limitări cunoscute)
- ✅ Edge

## 📊 Costuri și Limite

### Gratuit (pentru cazul tău)
- **Firebase Cloud Messaging**: 1 miliard mesaje/lună gratuite
- **Hosting**: Costurile tale actuale de server
- **Scalabilitate**: Suportă creșterea business-ului

### Costuri la Scale Mare
- FCM: $0.01 per 1000 notificări peste 1M/lună
- Pentru 10k notificări/lună: ~$0.10

## 🎯 Beneficii Business

### Pentru Proprietari
- **Răspuns instant** la leads serioase
- **Mai multe vânzări reușite**
- **Experiență superioară**

### Pentru Platformă
- **Conversii mai mari**
- **User retention crescut**
- **Avantaj competitiv**

## ⚠️ Provocări și Soluții

### Subscription Expirare
- **Problemă**: Push subscriptions expiră periodic
- **Soluție**: Reînnoire automată când user-ul vizitează app-ul

### Browser Support
- **Problemă**: Safari are limitări
- **Soluție**: Fallback la badge-uri pentru Safari

### Rate Limiting
- **Problemă**: Evitare spam notificări
- **Soluție**: Max 5 notificări/user/zi, doar pentru primul mesaj

### Privacy
- **Problemă**: Conținut mesajelor în notificări
- **Soluție**: Doar titlu generic ("Ai un mesaj nou"), fără conținut

## 📅 Timeline Estimat

### Săptămâna 1: Setup și bază
- VAPID keys și service worker
- Subscription management
- Testare bază

### Săptămâna 2: Push logic
- Server-side push service
- Integrare în conversations API
- Rate limiting

### Săptămâna 3: UX și testare
- Setări user
- Testare cross-browser
- Optimizări

## ✅ Ready pentru Implementare

Planul e complet și ready pentru implementare. Push notifications vor transforma business-ul tău imobiliar prin răspunsuri instantanee la leads.
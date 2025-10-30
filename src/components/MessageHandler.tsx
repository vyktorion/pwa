'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

console.log('📱 MessageHandler component loaded');

export default function MessageHandler() {
  console.log('🏗️ MessageHandler component rendering');

  const { data: session, status } = useSession();
  console.log('📊 Session hook data:', { status, hasSession: !!session, userId: session?.user?.id });

  // Helper functions
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  function arrayBufferToBase64(buffer: ArrayBuffer | null) {
    if (!buffer) return 'null';
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  const registerPushSubscription = async (userId: string) => {
    try {
      console.log('🔄 Starting push subscription registration for user:', userId);

      if (!('serviceWorker' in navigator)) {
        console.log('❌ Service Worker not supported');
        return;
      }

      if (!('PushManager' in window)) {
        console.log('❌ Push API not supported');
        return;
      }

      console.log('✅ Service Worker and Push API supported');

      const registration = await navigator.serviceWorker.ready;
      console.log('📝 Service Worker ready:', registration);

      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('🔄 Existing subscription found, unsubscribing...');
        await existingSubscription.unsubscribe();
      }

      console.log('📝 Subscribing to push notifications...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      });

      console.log('📝 Subscription created:', subscription);

      console.log('📤 Registering subscription with server...');
      const response = await fetch('/api/push/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      });

      if (response.ok) {
        console.log('✅ Push subscription registered successfully');
        console.log('📱 Push subscription details:', {
          endpoint: subscription.endpoint,
          keys: subscription.getKey ? {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
            auth: arrayBufferToBase64(subscription.getKey('auth'))
          } : 'No keys available'
        });
      } else {
        console.error('❌ Server registration failed:', await response.text());
      }
    } catch (error) {
      console.error('❌ Push registration failed:', error);
    }
  };

  // Setup message listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "NEW_MESSAGE") {
        handleNewMessage(event.data);
      } else if (event.data?.type === "OPEN_CONVERSATION") {
        window.location.href = `/messages?conversation=${event.data.conversationId}`;
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, []);

  // Main effect - runs on mount and when user/session changes
  useEffect(() => {
    const initializePush = async () => {
      // Check if user is authenticated
      if (status !== 'authenticated' || !session?.user?.id) {
        console.log('⏳ Push initialization skipped - user not authenticated');
        return;
      }

      console.log('🚀 Initializing push notifications for authenticated user:', session.user.id);
      await registerPushSubscription(session.user.id);
    };

    initializePush();
  }, [status, session?.user?.id]); // This will run when authentication state changes


  // Main useEffect that runs once on mount and when user changes
  useEffect(() => {
    if (!session?.user?.id || status !== 'authenticated') {
      return;
    }

    console.log('🚀 Initializing push notifications for user:', session.user.id);

    // 1. Înregistrează push subscription la login
    const registerPush = async () => {
      try {
        console.log('🔄 Starting push subscription registration...');

        if (!('serviceWorker' in navigator)) {
          console.log('❌ Service Worker not supported');
          return;
        }

        if (!('PushManager' in window)) {
          console.log('❌ Push API not supported');
          return;
        }

        console.log('✅ Service Worker and Push API supported');

        const registration = await navigator.serviceWorker.ready;
        console.log('📝 Service Worker ready:', registration);

        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          console.log('🔄 Existing subscription found, unsubscribing...');
          await existingSubscription.unsubscribe();
        }

        console.log('📝 Subscribing to push notifications...');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
        });

        console.log('📝 Subscription created:', subscription);

        console.log('📤 Registering subscription with server...');
        const response = await fetch('/api/push/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription })
        });

        if (response.ok) {
          console.log('✅ Push subscription registered successfully');
          console.log('📱 Push subscription details:', {
            endpoint: subscription.endpoint,
            keys: subscription.getKey ? {
              p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
              auth: arrayBufferToBase64(subscription.getKey('auth'))
            } : 'No keys available'
          });
        } else {
          console.error('❌ Server registration failed:', await response.text());
        }
      } catch (error) {
        console.error('❌ Push registration failed:', error);
      }
    };

    // Helper functions
    function urlBase64ToUint8Array(base64String: string) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }

    function arrayBufferToBase64(buffer: ArrayBuffer | null) {
      if (!buffer) return 'null';
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    }

    registerPush();

    // 2. Ascultă mesaje din Service Worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "NEW_MESSAGE") {
        handleNewMessage(event.data);
      } else if (event.data?.type === "OPEN_CONVERSATION") {
        // Pentru când user-ul apasă pe notificare
        window.location.href = `/messages?conversation=${event.data.conversationId}`;
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, []); // Run once on mount, then check session inside

  // Additional effect to watch for session changes - moved helper functions outside
  useEffect(() => {
    if (session?.user?.id && status === 'authenticated') {
      console.log('🔄 Session authenticated, initializing push for user:', session.user.id);

      // Redefine helper functions inside useEffect
      function urlBase64ToUint8Array(base64String: string) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
          .replace(/-/g, '+')
          .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      }

      function arrayBufferToBase64(buffer: ArrayBuffer | null) {
        if (!buffer) return 'null';
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
      }

      const registerPush = async () => {
        try {
          console.log('🔄 Starting push subscription registration...');

          if (!('serviceWorker' in navigator)) {
            console.log('❌ Service Worker not supported');
            return;
          }

          if (!('PushManager' in window)) {
            console.log('❌ Push API not supported');
            return;
          }

          console.log('✅ Service Worker and Push API supported');

          const registration = await navigator.serviceWorker.ready;
          console.log('📝 Service Worker ready:', registration);

          const existingSubscription = await registration.pushManager.getSubscription();
          if (existingSubscription) {
            console.log('🔄 Existing subscription found, unsubscribing...');
            await existingSubscription.unsubscribe();
          }

          console.log('📝 Subscribing to push notifications...');
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
          });

          console.log('📝 Subscription created:', subscription);

          console.log('📤 Registering subscription with server...');
          const response = await fetch('/api/push/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription })
          });

          if (response.ok) {
            console.log('✅ Push subscription registered successfully');
            console.log('📱 Push subscription details:', {
              endpoint: subscription.endpoint,
              keys: subscription.getKey ? {
                p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
                auth: arrayBufferToBase64(subscription.getKey('auth'))
              } : 'No keys available'
            });
          } else {
            console.error('❌ Server registration failed:', await response.text());
          }
        } catch (error) {
          console.error('❌ Push registration failed:', error);
        }
      };

      registerPush();
    }
  }, [session?.user?.id, status]);

  const handleNewMessage = (data: { conversationId: string; message: unknown }) => {
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
'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useNotificationsStore } from '@/stores/notifications.store';

console.log('📱 MessageHandler component loaded');

export default function MessageHandler() {
  console.log('🏗️ MessageHandler component rendering');

  const { data: session, status } = useSession();
  const incrementUnreadCount = useNotificationsStore(state => state.incrementUnreadCount);
  const setUnreadCount = useNotificationsStore(state => state.setUnreadCount);
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


  // Setup message listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('📨 [MessageHandler] Received message from SW:', event.data);

      if (event.data?.type === "NEW_MESSAGE") {
        console.log('📨 [MessageHandler] Processing NEW_MESSAGE event');
        handleNewMessage(event.data);
      } else if (event.data?.type === "OPEN_CONVERSATION") {
        console.log('📨 [MessageHandler] Processing OPEN_CONVERSATION event');
        window.location.href = `/messages?conversation=${event.data.conversationId}`;
      }
    };

    console.log('📨 [MessageHandler] Setting up service worker message listener');
    navigator.serviceWorker?.addEventListener("message", handleMessage);

    return () => {
      console.log('📨 [MessageHandler] Removing service worker message listener');
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, []);

  // Unified useEffect - handles push notifications and initializes unread count for authenticated users
  useEffect(() => {
    if (!session?.user?.id || status !== 'authenticated') {
      return;
    }

    console.log('🚀 Initializing push notifications and unread count for user:', session.user.id);

    // Initialize unread count from server
    const initializeUnreadCount = async () => {
      try {
        const response = await fetch('/api/messages/unread');
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.unreadCount);
          console.log('✅ Unread count initialized from server:', data.unreadCount);
        }
      } catch (error) {
        console.error('❌ Error initializing unread count:', error);
      }
    };

    initializeUnreadCount();

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

    // Listen for messages from Service Worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "NEW_MESSAGE") {
        handleNewMessage(event.data);
      } else if (event.data?.type === "OPEN_CONVERSATION") {
        // For when user clicks on notification
        window.location.href = `/messages?conversation=${event.data.conversationId}`;
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, [session?.user?.id, status]);

  const handleNewMessage = (data: { conversationId: string; senderId: string }) => {
    console.log('📨 [MessageHandler] Received new message:', data);
    console.log('📨 [MessageHandler] Current unread count before increment:', useNotificationsStore.getState().unreadCount);

    // Increment unread count in global state
    incrementUnreadCount();

    console.log('📨 [MessageHandler] Unread count after increment:', useNotificationsStore.getState().unreadCount);
  };

  return null; // Component invizibil
}

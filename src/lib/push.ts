import webpush from 'web-push';

// Configure VAPID
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushPayload {
  title: string;
  body: string;
  conversationId: string;
  senderId: string;
  senderName: string;
}

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: PushPayload
) {
  try {
    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );

    console.log('✅ Push notification sent successfully');
    return { success: true, result };
  } catch (error) {
    console.error('❌ Push notification failed:', error);
    return { success: false, error };
  }
}

export { webpush };
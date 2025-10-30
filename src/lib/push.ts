import webpush from 'web-push';

// Configure VAPID with error checking
if (!process.env.VAPID_SUBJECT || !process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  throw new Error('Missing VAPID environment variables. Please check VAPID_SUBJECT, VAPID_PUBLIC_KEY, and VAPID_PRIVATE_KEY in your .env.local file.');
}

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
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
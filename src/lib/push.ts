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
  payload: PushPayload,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<{ success: boolean; result?: webpush.SendResult; error?: Error }> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await webpush.sendNotification(
        subscription,
        JSON.stringify(payload)
      );

      console.log(`✅ Push notification sent successfully (attempt ${attempt + 1})`);
      return { success: true, result };
    } catch (error) {
      console.error(`❌ Push notification failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if it's a permanent failure that shouldn't be retried
      const errorMessage = lastError.message.toLowerCase();
      if (errorMessage.includes('410') || errorMessage.includes('gone') ||
          errorMessage.includes('invalid') || errorMessage.includes('unregistered')) {
        console.log('🚫 Permanent failure detected, stopping retries');
        return { success: false, error: lastError };
      }

      // Exponential backoff with jitter
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`⏳ Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error('❌ All push notification retry attempts failed');
  return { success: false, error: lastError };
}

export { webpush };
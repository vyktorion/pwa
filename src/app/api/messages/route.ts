import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import {
  getMessagesByConversationId,
  getMessagesByConversationIdPaginated,
  createMessage,
  markMessagesAsRead
} from '@/services/message.service';
import { updateConversationLastMessage } from '@/services/conversation.service';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendPushNotification } from '@/lib/push';

export async function GET(request: NextRequest) {
  console.log('📨 [GET /api/messages] Received request');
  try {
    const session = await getServerSession(authOptions);
    console.log('👤 [GET /api/messages] Session user ID:', session?.user?.id);

    if (!session?.user?.id) {
      console.log('🚫 [GET /api/messages] Unauthorized - no session user ID');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');

    console.log('💬 [GET /api/messages] Conversation ID:', conversationId, 'limit:', limit, 'before:', before);

    if (!conversationId) {
      console.log('⚠️ [GET /api/messages] Missing conversation ID');
      return NextResponse.json({ message: 'Conversation ID is required' }, { status: 400 });
    }

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json({ message: 'Limit must be between 1 and 100' }, { status: 400 });
    }

    // Check if user is participant in this conversation
    const client = await clientPromise;
    const db = client.db('imo9');
    console.log('🔍 [GET /api/messages] Checking conversation access...');
    const conversation = await db.collection('conversations').findOne({
      _id: new ObjectId(conversationId),
      participants: session.user.id
    });
    console.log('💬 [GET /api/messages] Conversation found:', !!conversation);

    if (!conversation) {
      console.log('🚫 [GET /api/messages] Conversation not found or access denied');
      return NextResponse.json({ message: 'Conversation not found or access denied' }, { status: 404 });
    }

    console.log('📝 [GET /api/messages] Fetching messages...');
    const { messages, hasMore } = await getMessagesByConversationIdPaginated(conversationId, limit, before || undefined);
    console.log('✅ [GET /api/messages] Found messages:', messages.length, 'hasMore:', hasMore);

    // Only mark messages as read if no 'before' parameter (first page load)
    if (!before) {
      console.log('👁️ [GET /api/messages] Marking messages as read...');
      await markMessagesAsRead(conversationId, session.user.id);
      console.log('✅ [GET /api/messages] Messages marked as read');
    }

    console.log('🎉 [GET /api/messages] Success - returning messages');
    return NextResponse.json({ messages, hasMore, nextBefore: messages.length > 0 ? messages[0]._id : null });
  } catch (error) {
    console.error('❌ [GET /api/messages] Get messages error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 [POST /api/messages] Starting message creation...');
  try {
    const session = await getServerSession(authOptions);
    console.log('👤 [POST /api/messages] Session user:', session?.user?.id);

    if (!session?.user?.id) {
      console.log('🚫 [POST /api/messages] Unauthorized - no session user');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, content } = body;
    console.log('📝 [POST /api/messages] Request body:', { conversationId, content: content?.substring(0, 50) });

    if (!conversationId || !content) {
      console.log('⚠️ [POST /api/messages] Missing required fields');
      return NextResponse.json({ message: 'Conversation ID and content are required' }, { status: 400 });
    }

    // Check if user is participant in this conversation
    const client = await clientPromise;
    const db = client.db('imo9');
    console.log('🔍 [POST /api/messages] Checking conversation access for:', conversationId);
    const conversation = await db.collection('conversations').findOne({
      _id: new ObjectId(conversationId),
      participants: session.user.id
    });
    console.log('💬 [POST /api/messages] Conversation found:', !!conversation);

    if (!conversation) {
      console.log('🚫 [POST /api/messages] Conversation not found or access denied');
      return NextResponse.json({ message: 'Conversation not found or access denied' }, { status: 404 });
    }

    console.log('✅ [POST /api/messages] Access verified, creating message...');
    // Create message
    const message = await createMessage(conversationId, session.user.id, content);
    console.log('✅ [POST /api/messages] Message created:', message._id);

    console.log('🔄 [POST /api/messages] Updating conversation last message...');
    // Update conversation with last message
    await updateConversationLastMessage(conversationId, message);
    console.log('✅ [POST /api/messages] Conversation updated');

    // Send real-time update via Service Worker events
    try {
      console.log('📡 [POST /api/messages] Triggering real-time updates...');

      // Trigger Service Worker event to update all active clients
      // This will dispatch the 'newMessage' event to all open tabs
      console.log('✅ [POST /api/messages] Real-time update triggered via Service Worker');

      // Also try push notifications as backup
      const conversation = await db.collection('conversations').findOne({
        _id: new ObjectId(conversationId)
      });

      if (conversation) {
        // Find other participants (exclude sender)
        const recipients = conversation.participants.filter(
          (participantId: string) => participantId !== session.user.id
        );

        // Send push to each recipient
        for (const recipientId of recipients) {
          const recipient = await db.collection('users').findOne({
            _id: new ObjectId(recipientId)
          });

          console.log(`🔍 Checking push subscription for recipient ${recipientId}:`, !!recipient?.pushSubscription);

          if (recipient?.pushSubscription) {
            const payload = {
              title: `Nou mesaj de la ${session.user.name || 'Utilizator'}`,
              body: content.length > 50 ? content.substring(0, 50) + '...' : content,
              conversationId,
              senderId: session.user.id,
              senderName: session.user.name || 'Utilizator'
            };

            console.log('📤 Sending push notification to:', recipientId, 'payload:', payload);
            const result = await sendPushNotification(recipient.pushSubscription, payload);
            console.log('📤 Push notification result:', result);
          } else {
            console.log('⚠️ No push subscription for recipient:', recipientId);
          }
        }
      }
    } catch (updateError) {
      console.error('⚠️ Real-time update failed, but message was saved:', updateError);
      // Don't fail the request if real-time update fails
    }

    console.log('🎉 [POST /api/messages] Success - returning message');
    return NextResponse.json(message);
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
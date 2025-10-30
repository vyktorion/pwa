import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import {
  getMessagesByConversationId,
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
    console.log('💬 [GET /api/messages] Conversation ID:', conversationId);

    if (!conversationId) {
      console.log('⚠️ [GET /api/messages] Missing conversation ID');
      return NextResponse.json({ message: 'Conversation ID is required' }, { status: 400 });
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
    const messages = await getMessagesByConversationId(conversationId);
    console.log('✅ [GET /api/messages] Found messages:', messages.length);

    console.log('👁️ [GET /api/messages] Marking messages as read...');
    // Mark messages as read for this user
    await markMessagesAsRead(conversationId, session.user.id);
    console.log('✅ [GET /api/messages] Messages marked as read');

    console.log('🎉 [GET /api/messages] Success - returning messages');
    return NextResponse.json(messages);
  } catch (error) {
    console.error('❌ [GET /api/messages] Get messages error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, content } = body;

    if (!conversationId || !content) {
      return NextResponse.json({ message: 'Conversation ID and content are required' }, { status: 400 });
    }

    // Check if user is participant in this conversation
    const client = await clientPromise;
    const db = client.db('imo9');
    const conversation = await db.collection('conversations').findOne({
      _id: new ObjectId(conversationId),
      participants: session.user.id
    });

    if (!conversation) {
      return NextResponse.json({ message: 'Conversation not found or access denied' }, { status: 404 });
    }

    // Create message
    const message = await createMessage(conversationId, session.user.id, content);

    // Update conversation with last message
    await updateConversationLastMessage(conversationId, message);

    // Send push notification to other participants
    try {
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
    } catch (pushError) {
      console.error('⚠️ Push notification failed, but message was saved:', pushError);
      // Don't fail the request if push fails
    }

    console.log('🎉 [POST /api/messages] Success - returning message');
    return NextResponse.json(message);
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
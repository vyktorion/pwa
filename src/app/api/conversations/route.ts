import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import {
  getUserConversations,
  createConversation,
  getConversationByParticipantsAndProperty
} from '@/services/conversation.service';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await getUserConversations(session.user.id);
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId, message } = await request.json();

    if (!propertyId || !message) {
      return NextResponse.json({ message: 'Property ID and message are required' }, { status: 400 });
    }

    // Get property details from sale database
    const { saleDbClient } = await import('@/lib/mongodb');
    const saleClient = await saleDbClient;
    const saleDb = saleClient.db();
    const property = await saleDb.collection('properties').findOne({ _id: new ObjectId(propertyId) });
    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 });
    }

    // Don't allow messaging own property
    if (property.userId === session.user.id) {
      return NextResponse.json({ message: 'Cannot message your own property' }, { status: 400 });
    }

    // Check if conversation already exists
    let conversation = await getConversationByParticipantsAndProperty(
      [session.user.id, property.userId],
      propertyId
    );

    if (!conversation) {
      // Create new conversation
      conversation = await createConversation(
        [session.user.id, property.userId],
        propertyId,
        property.title,
        property.images[0] || ''
      );
    }

    // Import message service functions
    const { createMessage } = await import('@/services/message.service');
    const { updateConversationLastMessage } = await import('@/services/conversation.service');

    // Create first message
    const newMessage = await createMessage(conversation._id, session.user.id, message);

    // Update conversation with last message
    await updateConversationLastMessage(conversation._id, newMessage);

    // Send push notification to recipient
    const { sendPushNotification } = await import('@/lib/push');
    const pushDb = await clientPromise;
    const db = pushDb.db('imo9');
    const pushSubscriptions = await db.collection('pushSubscriptions').find({
      userId: property.userId,
      'subscription.endpoint': { $exists: true }
    }).toArray();

    console.log(`📱 [POST /api/conversations] Found ${pushSubscriptions.length} push subscriptions for new conversation`);

    if (pushSubscriptions.length > 0) {
      // Get sender info
      const { getUserById } = await import('@/services/user.service');
      const sender = await getUserById(session.user.id);
      const senderName = sender?.name || 'Utilizator';

      for (const pushSub of pushSubscriptions) {
        try {
          const payload = {
            title: `Conversație nouă cu ${senderName}`,
            body: message.length > 100 ? message.substring(0, 100) + '...' : message,
            conversationId: conversation._id.toString(),
            senderId: session.user.id,
            senderName: senderName,
          };

          console.log(`📱 [POST /api/conversations] Sending first message push to user ${pushSub.userId}...`);
          const result = await sendPushNotification(pushSub.subscription, payload);
          if (result.success) {
            console.log(`✅ [POST /api/conversations] Push notification sent to user ${pushSub.userId}`);
          } else {
            console.error(`❌ [POST /api/conversations] Failed to send push to user ${pushSub.userId}:`, result.error?.message);
          }
        } catch (error) {
          console.error(`❌ [POST /api/conversations] Error sending push to user ${pushSub.userId}:`, error);
        }
      }
    }

    console.log('🎉 [POST /api/conversations] Success - returning conversation and message');
    return NextResponse.json({
      conversation,
      message: newMessage,
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
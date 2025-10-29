import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import {
  getUserConversations,
  createConversation,
  getConversationByParticipantsAndProperty
} from '@/services/conversation.service';
import { saleDbClient } from '@/lib/mongodb';
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

    // Get property details
    const client = await saleDbClient;
    const db = client.db();
    const property = await db.collection('properties').findOne({ _id: new ObjectId(propertyId) });
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
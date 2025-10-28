import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import {
  getMessagesByConversationId,
  createMessage,
  markMessagesAsRead
} from '@/services/message.service';
import { updateConversationLastMessage } from '@/services/conversation.service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ message: 'Conversation ID is required' }, { status: 400 });
    }

    const messages = await getMessagesByConversationId(conversationId);

    // Mark messages as read for this user
    await markMessagesAsRead(conversationId, session.user.id);

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, content } = await request.json();

    if (!conversationId || !content) {
      return NextResponse.json({ message: 'Conversation ID and content are required' }, { status: 400 });
    }

    // Create message
    const message = await createMessage(conversationId, session.user.id, content);

    // Update conversation with last message
    await updateConversationLastMessage(conversationId, message);

    return NextResponse.json(message);
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
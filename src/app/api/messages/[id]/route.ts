import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { deleteMessage, getMessageById } from '@/services/message.service';
import { getConversationById } from '@/services/conversation.service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // Get the message to verify ownership
    const message = await getMessageById(id);
    if (!message) {
      return NextResponse.json({ message: 'Message not found' }, { status: 404 });
    }

    // Only allow the sender to delete their own messages
    if (message.senderId !== userId) {
      return NextResponse.json({ message: 'Unauthorized to delete this message' }, { status: 403 });
    }

    // Verify user is still a participant in the conversation
    const conversation = await getConversationById(message.conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return NextResponse.json({ message: 'Unauthorized - not a participant in this conversation' }, { status: 403 });
    }

    const success = await deleteMessage(id);
    if (!success) {
      return NextResponse.json({ message: 'Failed to delete message' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
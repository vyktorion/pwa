import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { getUnreadCount } from '@/services/message.service';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const unreadCount = await getUnreadCount(session.user.id);
    console.log('Unread count for user', session.user.id, ':', unreadCount);

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
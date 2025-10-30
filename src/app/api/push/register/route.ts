import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscription } = body;

    if (!subscription) {
      return NextResponse.json({ message: 'Subscription is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('imo9');

    // Update user with push subscription
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          pushSubscription: subscription,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('✅ Push subscription registered for user:', session.user.id);

    return NextResponse.json({
      message: 'Push subscription registered successfully',
      success: true
    });
  } catch (error) {
    console.error('❌ Push registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
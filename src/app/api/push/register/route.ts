import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

async function cleanupExpiredSubscriptions() {
  try {
    const client = await clientPromise;
    const db = client.db('imo9');

    // Remove subscriptions that are null or have expired
    const result = await db.collection('users').updateMany(
      {
        $or: [
          { pushSubscription: null },
          { pushSubscription: { $exists: false } },
          // You could add more conditions here based on subscription validity
        ]
      },
      {
        $unset: { pushSubscription: 1 },
        $set: { updatedAt: new Date() }
      }
    );

    console.log(`🧹 Cleaned up ${result.modifiedCount} expired/invalid push subscriptions`);
  } catch (error) {
    console.error('❌ Error cleaning up expired subscriptions:', error);
  }
}

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

    // Validate subscription structure
    if (!subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      console.warn('⚠️ Invalid subscription structure received');
      return NextResponse.json({ message: 'Invalid subscription format' }, { status: 400 });
    }

    // Clean up expired subscriptions periodically (run in background)
    cleanupExpiredSubscriptions();

    // Update user with push subscription
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          pushSubscription: {
            ...subscription,
            registeredAt: new Date(),
            lastUsed: new Date()
          },
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

    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        return NextResponse.json({ message: 'Invalid subscription data' }, { status: 400 });
      }
      if (error.message.includes('database')) {
        return NextResponse.json({ message: 'Database error' }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
import { ObjectId } from 'mongodb';
import clientPromise from '../lib/mongodb';
import { Message } from '../types';

export async function createMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message> {
  console.log('💬 [createMessage] Creating message for conversation:', conversationId, 'from user:', senderId);
  const client = await clientPromise;
  const db = client.db('imo9');

  const message: Omit<Message, '_id'> = {
    conversationId,
    senderId,
    content,
    read: false,
    createdAt: new Date(),
  };

  console.log('📝 [createMessage] Message data:', message);
  const result = await db.collection('messages').insertOne(message);
  console.log('✅ [createMessage] Message inserted with ID:', result.insertedId);

  return {
    _id: result.insertedId.toString(),
    ...message,
  };
}

export async function getMessagesByConversationId(conversationId: string): Promise<Message[]> {
  console.log('🔍 [getMessagesByConversationId] Looking for messages in conversation:', conversationId);
  const client = await clientPromise;
  const db = client.db('imo9');

  // First check all messages in the database to debug
  const allMessages = await db.collection('messages').find({}).limit(10).toArray();
  console.log('📊 [getMessagesByConversationId] Sample of ALL messages in DB:', allMessages.map(m => ({ id: m._id, convId: m.conversationId, content: m.content?.substring(0, 30), sender: m.senderId })));

  // Try both string and ObjectId queries to debug
  console.log('🔍 [getMessagesByConversationId] Searching with string:', conversationId);
  const messagesByString = await db
    .collection('messages')
    .find({ conversationId })
    .sort({ createdAt: 1 })
    .toArray();
  console.log('💬 [getMessagesByConversationId] Messages found with string query:', messagesByString.length);

  console.log('🔍 [getMessagesByConversationId] Searching with ObjectId:', conversationId);
  const messagesByObjectId = await db
    .collection('messages')
    .find({ conversationId: new ObjectId(conversationId) })
    .sort({ createdAt: 1 })
    .toArray();
  console.log('💬 [getMessagesByConversationId] Messages found with ObjectId query:', messagesByObjectId.length);

  // Use the one that finds messages
  const messages = messagesByString.length > 0 ? messagesByString : messagesByObjectId;

  console.log('💬 [getMessagesByConversationId] Final messages found:', messages.length);
  console.log('💬 [getMessagesByConversationId] Messages content:', messages.map(m => ({ id: m._id, content: m.content, sender: m.senderId })));

  return messages.map(msg => ({
    ...msg,
    _id: msg._id.toString(),
  })) as Message[];
}

export async function getMessageById(id: string): Promise<Message | null> {
  const client = await clientPromise;
  const db = client.db('imo9');

  const message = await db.collection('messages').findOne({ _id: new ObjectId(id) });
  if (!message) return null;

  return {
    ...message,
    _id: message._id.toString(),
  } as Message;
}

export async function markMessageAsRead(id: string): Promise<void> {
  const client = await clientPromise;
  const db = client.db('imo9');

  await db.collection('messages').updateOne(
    { _id: new ObjectId(id) },
    {
      $set: { read: true },
    }
  );
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  const client = await clientPromise;
  const db = client.db('imo9');

  await db.collection('messages').updateMany(
    {
      conversationId,
      senderId: { $ne: userId },
      read: false,
    },
    {
      $set: { read: true },
    }
  );
}

export async function deleteMessage(id: string): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db('imo9');

  const result = await db.collection('messages').deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function deleteMessagesByConversationId(conversationId: string): Promise<void> {
  const client = await clientPromise;
  const db = client.db('imo9');

  await db.collection('messages').deleteMany({ conversationId });
}

export async function getUnreadCount(userId: string): Promise<number> {
  const client = await clientPromise;
  const db = client.db('imo9');

  // Only count messages from last 30 days to avoid old unread messages
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Optimized query: use aggregation to count unread messages in one query
  const result = await db.collection('messages').aggregate([
    {
      $match: {
        senderId: { $ne: userId },
        read: false,
        createdAt: { $gte: thirtyDaysAgo },
      }
    },
    {
      $lookup: {
        from: 'conversations',
        localField: 'conversationId',
        foreignField: '_id',
        as: 'conversation'
      }
    },
    {
      $unwind: '$conversation'
    },
    {
      $match: {
        'conversation.participants': userId
      }
    },
    {
      $count: 'totalUnread'
    }
  ]).toArray();

  return result.length > 0 ? result[0].totalUnread : 0;
}
import { ObjectId } from 'mongodb';
import clientPromise from '../lib/mongodb';
import { Message } from '../types';

export async function createMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message> {
  console.log('💬 [createMessage] Creating message for conversation:', conversationId, 'from user:', senderId);
  console.log('💬 [createMessage] Content length:', content.length, 'Content preview:', content.substring(0, 50));

  const client = await clientPromise;
  const db = client.db('imo9');

  const message: Omit<Message, '_id'> = {
    conversationId: new ObjectId(conversationId).toString(), // Ensure string format
    senderId,
    content,
    read: false,
    createdAt: new Date(),
  };

  console.log('📝 [createMessage] Final message data:', message);
  const result = await db.collection('messages').insertOne({
    ...message,
    conversationId: new ObjectId(conversationId), // Store as ObjectId in DB
  });
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

  const messages = await db
    .collection('messages')
    .find({ conversationId: new ObjectId(conversationId) })
    .sort({ createdAt: 1 })
    .toArray();

  console.log('💬 [getMessagesByConversationId] Messages found:', messages.length);

  return messages.map(msg => ({
    ...msg,
    _id: msg._id.toString(),
  })) as Message[];
}

export async function getMessagesByConversationIdPaginated(
  conversationId: string,
  limit: number = 50,
  before?: string
): Promise<{ messages: Message[]; hasMore: boolean }> {
  console.log('🔍 [getMessagesByConversationIdPaginated] Looking for messages in conversation:', conversationId, 'limit:', limit, 'before:', before);
  const client = await clientPromise;
  const db = client.db('imo9');

  const query: Record<string, any> = { conversationId: new ObjectId(conversationId) };
  if (before) {
    query._id = { $lt: new ObjectId(before) };
  }

  const messages = await db
    .collection('messages')
    .find(query)
    .sort({ createdAt: -1 }) // Get newest first for pagination
    .limit(limit + 1) // +1 to check if there are more
    .toArray();

  const hasMore = messages.length > limit;
  const messagesToReturn = hasMore ? messages.slice(0, limit) : messages;

  console.log('💬 [getMessagesByConversationIdPaginated] Messages found:', messagesToReturn.length, 'hasMore:', hasMore);

  return {
    messages: messagesToReturn.reverse().map(msg => ({ // Reverse back to chronological order
      ...msg,
      _id: msg._id.toString(),
    })) as Message[],
    hasMore
  };
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
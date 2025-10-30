import { ObjectId } from 'mongodb';
import clientPromise from '../lib/mongodb';
import { Conversation, Message } from '../types';

export async function createConversation(
  participants: [string, string],
  propertyId: string,
  propertyTitle: string,
  propertyImage: string
): Promise<Conversation> {
  const client = await clientPromise;
  const db = client.db('imo9');

  const conversation: Omit<Conversation, '_id'> = {
    participants,
    propertyId,
    propertyTitle,
    propertyImage,
    unreadCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('conversations').insertOne(conversation);

  return {
    _id: result.insertedId.toString(),
    ...conversation,
  };
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const client = await clientPromise;
  const db = client.db('imo9');

  const conversations = await db
    .collection('conversations')
    .find({ participants: userId })
    .sort({ updatedAt: -1 })
    .toArray();

  // Optimize: Get only the last message and unread count, not all messages
  const conversationsWithData = await Promise.all(
    conversations.map(async (conv) => {
      // Get only the last message
      const lastMessage = await db
        .collection('messages')
        .find({ conversationId: conv._id.toString() })
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();

      // Count total messages
      const messageCount = await db
        .collection('messages')
        .countDocuments({ conversationId: conv._id.toString() });

      // Count unread messages for this user (only from last 30 days for performance)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const unreadCount = await db
        .collection('messages')
        .countDocuments({
          conversationId: conv._id.toString(),
          senderId: { $ne: userId },
          read: false,
          createdAt: { $gte: thirtyDaysAgo },
        });

      return {
        ...conv,
        _id: conv._id.toString(),
        lastMessage: lastMessage.length > 0 ? {
          ...lastMessage[0],
          _id: lastMessage[0]._id.toString(),
        } : undefined,
        unreadCount,
        messageCount,
      };
    })
  );

  return conversationsWithData as Conversation[];
}

export async function getConversationById(id: string): Promise<Conversation | null> {
  const client = await clientPromise;
  const db = client.db('imo9');

  const conversation = await db.collection('conversations').findOne({ _id: new ObjectId(id) });
  if (!conversation) return null;

  return {
    ...conversation,
    _id: conversation._id.toString(),
  } as Conversation;
}

export async function getConversationByParticipantsAndProperty(
  participants: [string, string],
  propertyId: string
): Promise<Conversation | null> {
  const client = await clientPromise;
  const db = client.db('imo9');

  const conversation = await db.collection('conversations').findOne({
    participants: { $all: participants },
    propertyId,
  });

  if (!conversation) return null;

  return {
    ...conversation,
    _id: conversation._id.toString(),
  } as Conversation;
}

export async function updateConversationLastMessage(conversationId: string, lastMessage: Message): Promise<void> {
  const client = await clientPromise;
  const db = client.db('imo9');

  await db.collection('conversations').updateOne(
    { _id: new ObjectId(conversationId) },
    {
      $set: {
        lastMessage,
        updatedAt: new Date(),
      },
    }
  );
}

export async function markConversationAsRead(conversationId: string, userId: string): Promise<void> {
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

export async function deleteConversation(id: string): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db('imo9');

  // Delete conversation and all its messages
  const conversationResult = await db.collection('conversations').deleteOne({ _id: new ObjectId(id) });
  await db.collection('messages').deleteMany({ conversationId: id });

  return conversationResult.deletedCount === 1;
}
import { ObjectId } from 'mongodb';
import clientPromise from '../lib/mongodb';
import { User, UserRole } from '../types';

export async function createUser(userData: {
  name: string;
  email: string;
  role: UserRole;
  hashedPassword?: string;
  avatar?: string;
  phone?: string;
}): Promise<User> {
  const client = await clientPromise;
  const db = client.db('imo9');

  const user: Omit<User, '_id'> = {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('users').insertOne(user);

  return {
    _id: result.insertedId.toString(),
    ...user,
  };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const client = await clientPromise;
  const db = client.db('imo9');

  const user = await db.collection('users').findOne({ email });
  if (!user) return null;

  return {
    ...user,
    _id: user._id.toString(),
  } as User;
}

export async function getUserById(id: string): Promise<User | null> {
  const client = await clientPromise;
  const db = client.db('imo9');

  const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
  if (!user) return null;

  return {
    ...user,
    _id: user._id.toString(),
  } as User;
}

export async function updateUser(id: string, updateData: Partial<Pick<User, 'name' | 'phone' | 'avatar' | 'role'>>): Promise<User | null> {
  const client = await clientPromise;
  const db = client.db('imo9');

  const result = await db.collection('users').findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  );

  if (!result) return null;

  return {
    ...result,
    _id: result._id.toString(),
  } as User;
}

export async function updatePassword(id: string, newHashedPassword: string): Promise<User | null> {
  const client = await clientPromise;
  const db = client.db('imo9');

  const result = await db.collection('users').findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        hashedPassword: newHashedPassword,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  );

  if (!result) return null;

  return {
    ...result,
    _id: result._id.toString(),
  } as User;
}

export async function deleteUser(id: string): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db('imo9');

  const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
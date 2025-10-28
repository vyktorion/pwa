import { ObjectId } from 'mongodb';
import clientPromise from '../lib/mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  name: string;
  hashedPassword?: string;
  avatar?: string;
  role: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<User>('users');

  const user = await collection.findOne({ email });
  return user;
}

export async function createUser(userData: Omit<User, '_id'>): Promise<User> {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<User>('users');

  const now = new Date();
  const user: User = {
    ...userData,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(user);
  return { ...user, _id: result.insertedId };
}

export async function updateUserById(id: string, updateData: Partial<User>): Promise<User | null> {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<User>('users');

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...updateData, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );

  return result;
}

export async function deleteUserById(id: string): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<User>('users');

  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
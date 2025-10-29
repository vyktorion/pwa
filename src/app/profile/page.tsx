import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/nextauth';
import { MongoClient } from 'mongodb';
import ProfileClient from './ProfileClient';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  image?: string;
  role: string;
}

interface Property {
  _id: string;
  title: string;
  images: string[];
  price: number;
  currency: string;
  location: {
    city: string;
    county: string;
    zone?: string;
  };
  rooms?: number;
  area: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  features: string[];
  propertyType: string;
  createdAt: Date | string;
  isActive: boolean;
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect('/login');
  }

  // Use user data from session instead of additional API call
  const user: User = {
    _id: session.user.id,
    name: session.user.name || '',
    email: session.user.email || '',
    phone: (session.user as { phone?: string }).phone || undefined,
    avatar: (session.user as { avatar?: string }).avatar || session.user.image || undefined,
    image: session.user.image || undefined,
    role: (session.user as { role?: string }).role || 'Proprietar'
  };

  // Fetch user properties
  let userProperties: Property[] = [];
  try {
    const client = new MongoClient(process.env.MONGODB_SALE!);
    const db = await client.db();

    const properties = await db.collection('properties')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    userProperties = properties.map((prop: unknown) => {
      const property = prop as {
        _id: { toString(): string };
        createdAt: Date;
        updatedAt?: Date;
        title: string;
        images: string[];
        price: number;
        currency: string;
        location: { city: string; county: string; zone?: string };
        rooms?: number;
        area: number;
        floor?: number;
        totalFloors?: number;
        yearBuilt?: number;
        features: string[];
        propertyType: string;
        isActive: boolean;
        [key: string]: unknown;
      };
      return {
        ...property,
        _id: property._id.toString(),
        createdAt: property.createdAt.toISOString(),
        updatedAt: property.updatedAt?.toISOString() || property.createdAt.toISOString(),
      };
    }) as Property[];

    await client.close();
  } catch (error) {
    console.error('Error fetching user properties:', error);
    userProperties = [];
  }

  return <ProfileClient user={user} userProperties={userProperties} />;
}
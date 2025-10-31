import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { mainDbClient } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const { id } = await params;
    const client = new MongoClient(process.env.MONGODB_SALE!);
    const db = await client.db();

    // Try to find by _id first (MongoDB ObjectId)
    let property;
    try {
      property = await db.collection('properties').findOne({
        _id: new ObjectId(id)
      });
    } catch {
      // If not a valid ObjectId, return null
      property = null;
    }

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Populate user information from the users collection using mainDbClient
    let userData = null;
    if (property.userId) {
      try {
        const userClient = await mainDbClient;
        const userDb = userClient.db('imo9');
        userData = await userDb.collection('users').findOne(
          { _id: new ObjectId(property.userId) },
          { projection: { name: 1, email: 1, phone: 1, avatar: 1, image: 1, role: 1 } }
        );
      } catch (userError) {
        console.error('Error fetching user data:', userError);
        // Continue without user data if there's an error
      }
    }

    // Merge user data with property contact info
    const propertyWithUser = {
      ...property,
      contactInfo: userData ? {
        name: userData.name || property.contactInfo?.name || 'Proprietar',
        phone: userData.phone || property.contactInfo?.phone || '',
        showPhone: property.contactInfo?.showPhone || false,
        avatar: userData.avatar || userData.image || null,
        role: userData.role || 'Proprietar',
      } : property.contactInfo || {
        name: 'Proprietar',
        phone: '',
        showPhone: false,
        avatar: null,
        role: 'Proprietar',
      }
    };

    const endTime = Date.now();

    return NextResponse.json(propertyWithUser);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = new MongoClient(process.env.MONGODB_SALE!);
    const db = await client.db();
    const body = await request.json();
    const updateData = body;

    const result = await db.collection('properties').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const updatedProperty = await db.collection('properties').findOne({
      _id: new ObjectId(id)
    });
    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = new MongoClient(process.env.MONGODB_SALE!);
    const db = await client.db();

    const result = await db.collection('properties').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
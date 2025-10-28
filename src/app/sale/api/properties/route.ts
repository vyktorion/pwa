import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { MongoClient, ObjectId } from 'mongodb';
import { saleDbClient } from '@/lib/mongodb';

// Helper function to build MongoDB query
function buildSearchQuery(params: URLSearchParams) {
  const query: Record<string, unknown> = { isActive: true };

  // Text search
  const q = params.get('q');
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { 'location.city': { $regex: q, $options: 'i' } },
      { 'location.county': { $regex: q, $options: 'i' } },
    ];
  }

  // City filter
  const city = params.get('city');
  if (city) {
    query['location.city'] = { $regex: city, $options: 'i' };
  }

  // Price range
  const minPrice = params.get('minPrice');
  const maxPrice = params.get('maxPrice');
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) (query.price as Record<string, unknown>).$gte = parseInt(minPrice);
    if (maxPrice) (query.price as Record<string, unknown>).$lte = parseInt(maxPrice);
  }

  // Rooms filter
  const rooms = params.get('rooms');
  if (rooms) {
    query.rooms = parseInt(rooms);
  }

  // Property type filter
  const propertyType = params.get('propertyType');
  if (propertyType) {
    query.propertyType = propertyType;
  }

  return query;
}

export async function GET(request: NextRequest) {
  try {
    const client = await saleDbClient;
    const db = client.db();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const query = buildSearchQuery(searchParams);

    // Ensure indexes exist for better performance
    try {
      await db.collection('properties').createIndex({ createdAt: -1 });
      await db.collection('properties').createIndex({ isActive: 1 });
      await db.collection('properties').createIndex({ 'location.city': 1 });
      await db.collection('properties').createIndex({ propertyType: 1 });
    } catch {
    }

    // Sortare dinamică bazată pe parametrii de căutare
    let sortCriteria: Record<string, 1 | -1> = { createdAt: -1 };

    // Dacă există parametru de sortare din frontend (momentan nu se trimite, dar pentru viitor)
    const sortParam = searchParams.get('sortBy');
    if (sortParam) {
      switch (sortParam) {
        case 'price-low':
          sortCriteria = { price: 1 };
          break;
        case 'price-high':
          sortCriteria = { price: -1 };
          break;
        case 'newest':
          sortCriteria = { createdAt: -1 };
          break;
        case 'oldest':
          sortCriteria = { createdAt: 1 };
          break;
        default:
          sortCriteria = { createdAt: -1 };
      }
    }

    const properties = await db.collection('properties').find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('properties').countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      properties,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Error searching properties:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = new MongoClient((globalThis as any).process.env.MONGODB_SALE!);
    const db = await client.db();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData = body;

    const result = await db.collection('properties').updateOne(
      { _id: new ObjectId(id), userId: session.user.id },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Property not found or not owned by user' },
        { status: 404 }
      );
    }

    const updatedProperty = await db.collection('properties').findOne({ _id: new ObjectId(id) });
    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

  const client = new MongoClient((globalThis as any).process.env.MONGODB_SALE!);
    const db = await client.db();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const result = await db.collection('properties').deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Property not found or not owned by user' },
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

  const client = new MongoClient((globalThis as any).process.env.MONGODB_SALE!);
    const db = await client.db();
    const body = await request.json();

    const propertyData = {
      ...body,
      userId: session.user.id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('properties').insertOne(propertyData);
    const property = { _id: result.insertedId, ...propertyData };

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
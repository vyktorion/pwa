import { Property } from "@/types";
import SaleClient from "./SaleClient";
import { saleDbClient } from "@/lib/mongodb";

// Server-side function to fetch initial properties
async function getInitialProperties() {
  console.log('🏠 Page: getInitialProperties called');
  try {
    console.log('🌐 Page: Connecting to salesDbClient...');
    const client = await saleDbClient;
    const db = client.db();
    console.log('📊 Page: Connected to database, querying properties...');

    // Query for active properties, sorted by newest first
    const properties = await db.collection('properties')
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    console.log(`✅ Page: Found ${properties.length} properties`);
    return properties.map(prop => ({
      ...prop,
      _id: prop._id.toString(),
    })) as Property[];
  } catch (error) {
    console.error('❌ Page: Error fetching initial properties:', error);
    return [];
  }
}

export default async function Home() {
  const initialProperties = await getInitialProperties();

  return <SaleClient initialProperties={initialProperties} />;
}

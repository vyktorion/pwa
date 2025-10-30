import { Property } from "@/types";
import SaleClient from "./SaleClient";
import { saleDbClient } from "@/lib/mongodb";

// Server-side function to fetch initial properties
async function getInitialProperties() {
  try {
    const client = await saleDbClient;
    const db = client.db();

    // Query for active properties, sorted by newest first
    const properties = await db.collection('properties')
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return properties.map(prop => ({
      ...prop,
      _id: prop._id.toString(),
    })) as Property[];
  } catch {
    return [];
  }
}

export default async function Home() {
  const initialProperties = await getInitialProperties();

  return <SaleClient initialProperties={initialProperties} />;
}

import { MongoClient } from 'mongodb';

declare global {
  var _mongoClientPromiseMain: Promise<MongoClient> | undefined;
  var _mongoClientPromiseSales: Promise<MongoClient> | undefined;
}

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (!process.env.MONGODB_SALE) {
  throw new Error('Please add your MongoDB SALE URI to .env.local');
}

const options = {};

let clientMain: MongoClient;
let clientSales: MongoClient;

let clientPromiseMain: Promise<MongoClient>;
let clientPromiseSales: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromiseMain) {
    clientMain = new MongoClient(process.env.MONGODB_URI, options);
    global._mongoClientPromiseMain = clientMain.connect();
  }
  if (!global._mongoClientPromiseSales) {
    clientSales = new MongoClient(process.env.MONGODB_SALE, options);
    global._mongoClientPromiseSales = clientSales.connect();
  }

  clientPromiseMain = global._mongoClientPromiseMain;
  clientPromiseSales = global._mongoClientPromiseSales;
} else {
  // In production mode, it's best to not use a global variable.
  clientMain = new MongoClient(process.env.MONGODB_URI, options);
  clientSales = new MongoClient(process.env.MONGODB_SALE, options);

  clientPromiseMain = clientMain.connect();
  clientPromiseSales = clientSales.connect();
}

// Export both connections
export const mainDbClient = clientPromiseMain;
export const saleDbClient = clientPromiseSales;

// Keep backward compatibility
export default clientPromiseMain;
import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;

if (!uri) throw new Error("MONGODB_URI is not defined in environment variables");

const options = {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
  socketTimeoutMS: 30000,
};

declare global {
  var _mongoClient: MongoClient | undefined;
}

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, options);
  }
  client = global._mongoClient;
} else {
  client = new MongoClient(uri, options);
}

export async function getDb(): Promise<Db> {
  await client.connect();
  return client.db("ziva");
}

import { Db, MongoClient } from "mongodb";

const connectionString = process.env.MONGODB_CONN_STRING;

if (!connectionString) {
  throw new Error("MONGODB_CONN_STRING is not set");
}

let client: MongoClient;

export const getClient = async () => {
  if (!client) {
    client = await MongoClient.connect(connectionString);
  }

  return client;
};

export const getDb = async () => {
  const client = await getClient();
  const db: Db = client.db(process.env.MONGODB_NAME);

  return db;
};

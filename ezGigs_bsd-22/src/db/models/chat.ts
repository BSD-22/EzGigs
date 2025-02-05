import { Document, ObjectId } from "mongodb";
import { getDb } from "../config/mongo-connection";

export const updateUserChatList = async (userId: string, chatId: string) => {
  const db = await getDb();
  const collection = db.collection("User");

  // Add to hiddenChats array instead of removing
  await collection.updateOne({ _id: ObjectId.createFromHexString(userId) }, { $addToSet: { hiddenChats: chatId } } as Document);
};

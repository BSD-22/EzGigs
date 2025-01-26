import { ObjectId } from "mongodb";
import { getDb } from "../config/mongo-connection";
import { UserModel } from "./user";
import { TicketModel } from "./ticket";
import { CustomResponse } from "@/types";

export type MarketplaceModel = {
  _id: ObjectId;
  ticketId: ObjectId;
  userId: ObjectId;
};

export type MarketplaceDetailModel = {
  _id: ObjectId;
  user: UserModel;
  ticket: TicketModel;
};

export const getAllMarketplace = async (): Promise<CustomResponse<MarketplaceDetailModel[]>> => {
  const db = await getDb();
  const collection = db.collection("Marketplace");

  const marketplace = (await collection
    .aggregate([
      {
        $lookup: {
          from: "User",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "Ticket",
          localField: "ticketId",
          foreignField: "_id",
          as: "ticket",
        },
      },
      {
        $unwind: "$ticket",
      },
    ])
    .toArray()) as MarketplaceDetailModel[];

  return {
    statusCode: 200,
    data: marketplace,
  };
};

export const getMarketplaceById = async (id: string): Promise<CustomResponse<MarketplaceDetailModel>> => {
  const db = await getDb();
  const collection = db.collection("Marketplace");

  const marketplace = (await collection
    .aggregate([
      {
        $match: { _id: new ObjectId(id) },
      },
      {
        $lookup: {
          from: "User",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "Ticket",
          localField: "ticketId",
          foreignField: "_id",
          as: "ticket",
        },
      },
      {
        $unwind: "$ticket",
      },
      {
        $limit: 1,
      },
    ])
    .next()) as MarketplaceDetailModel;

  return {
    statusCode: 200,
    data: marketplace,
  };
};

export const createMarketplace = async (userId: ObjectId, ticketId: ObjectId): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const collection = db.collection("Marketplace");

  const newMarketplace = {
    userId,
    ticketId,
  };

  const insertedMarketplace = await collection.insertOne(newMarketplace);

  const result: MarketplaceModel = {
    _id: insertedMarketplace.insertedId,
    userId,
    ticketId,
  };

  return {
    statusCode: 201,
    data: result,
  };
};

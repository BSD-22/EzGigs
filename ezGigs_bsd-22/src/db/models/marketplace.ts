import { ObjectId } from "mongodb";
import { getDb } from "../config/mongo-connection";
import { UserModel } from "./user";
import { TicketModel } from "./ticket";
import { CustomResponse } from "@/types";

export type MarketplaceModel = {
  _id: ObjectId;
  ticketId: ObjectId;
  userId: ObjectId;
  price: number;
  description?: string;
  categoryName: string;
  seatNumber: string;
};

export type MarketplaceDetailModel = {
  _id: ObjectId;
  user: UserModel;
  ticket: TicketModel;
  price: number;
  description?: string;
  categoryName: string;
  seatNumber: string;
};

export const createMarketplace = async (userId: string, ticketId: string, price: number, categoryName: string, seatNumber: string, description?: string): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const collection = db.collection("Marketplace");

  const newMarketplace = {
    userId: ObjectId.createFromHexString(userId),
    ticketId: ObjectId.createFromHexString(ticketId),
    price,
    categoryName,
    seatNumber,
    description,
  };

  const insertedMarketplace = await collection.insertOne(newMarketplace);

  const result: MarketplaceModel = {
    _id: insertedMarketplace.insertedId,
    ...newMarketplace,
  };

  return {
    statusCode: 201,
    data: result,
  };
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
      {
        $project: {
          _id: 1,
          price: 1,
          description: 1,
          categoryName: 1,
          seatNumber: 1,
          user: 1,
          ticket: 1,
        },
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
        $project: {
          _id: 1,
          price: 1,
          description: 1,
          categoryName: 1,
          seatNumber: 1,
          user: {
            _id: 1,
            name: 1,
            email: 1,
          },
          ticket: {
            _id: 1,
            name: 1,
            venue: 1,
            date: 1,
            time: 1,
            image: 1,
            seatCategories: 1,
          },
        },
      },
    ])
    .next()) as MarketplaceDetailModel | null;

  if (!marketplace) {
    return {
      statusCode: 404,
      message: "Marketplace listing not found",
    };
  }

  return {
    statusCode: 200,
    data: marketplace,
  };
};

export const deleteMarketplace = async (userId: string, ticketId: string): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const collection = db.collection("Marketplace");

  const foundMarketplace = await collection.findOne({ userId: ObjectId.createFromHexString(userId), ticketId: ObjectId.createFromHexString(ticketId) });

  if (!foundMarketplace) {
    return {
      statusCode: 404,
      message: "Marketplace not found",
    };
  }

  const result = await collection.deleteOne({ userId: ObjectId.createFromHexString(userId), ticketId: ObjectId.createFromHexString(ticketId) });

  return {
    statusCode: 200,
    data: result.acknowledged,
  };
};

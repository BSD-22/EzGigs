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
  buyerEmail?: string;
  buyerName?: string;
  buyerPhone?: string;
  identityType?: "KTP" | "Passport" | "SIM" | "Student";
  identityNumber?: string;
  paymentSessionId?: string;
};

export type MarketplaceDetailModel = {
  _id: ObjectId;
  user: UserModel;
  ticket: TicketModel;
  price: number;
  description?: string;
  categoryName: string;
  seatNumber: string;
  buyerEmail?: string;
  buyerName?: string;
  buyerPhone?: string;
  identityType?: "KTP" | "Passport" | "SIM" | "Student";
  identityNumber?: string;
  paymentSessionId?: string;
};

export const createMarketplace = async (userId: string, ticketId: string, price: number, categoryName: string, seatNumber: string, description?: string): Promise<CustomResponse<MarketplaceModel>> => {
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
          buyerEmail: 1,
          buyerName: 1,
          buyerPhone: 1,
          identityType: 1,
          identityNumber: 1,
          paymentSessionId: 1,
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
        $match: { _id: ObjectId.createFromHexString(id) },
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
          buyerEmail: 1,
          buyerName: 1,
          buyerPhone: 1,
          identityType: 1,
          identityNumber: 1,
          paymentSessionId: 1,
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
            status: 1,
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

type BuyerUpdateData = {
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
  identityType: "KTP" | "Passport" | "SIM" | "Student";
  identityNumber: string;
  paymentSessionId?: string;
};

type BuyerUpdateInput = {
  buyerEmail: string | null;
  buyerName: string | null;
  buyerPhone: string | null;
  identityType: "KTP" | "Passport" | "SIM" | "Student" | null;
  identityDetails: string | null;
  paymentSessionId?: string | null;
};

export const updateMarketplaceBuyerDetails = async (listingId: string, buyerDetails: BuyerUpdateInput): Promise<CustomResponse<MarketplaceModel>> => {
  const db = await getDb();
  const collection = db.collection("Marketplace");

  const updateData: Partial<BuyerUpdateData> = {};

  Object.entries(buyerDetails).forEach(([key, value]) => {
    if (value !== null) {
      if (key === "identityDetails") {
        updateData.identityNumber = value;
      } else if (key === "identityType" && (value === "KTP" || value === "Passport" || value === "SIM" || value === "Student")) {
        updateData.identityType = value;
      } else if (key === "paymentSessionId" && value !== undefined) {
        updateData.paymentSessionId = value;
      } else if (key === "buyerEmail" || key === "buyerName" || key === "buyerPhone") {
        updateData[key] = value;
      }
    }
  });

  const result = await collection.findOneAndUpdate({ _id: ObjectId.createFromHexString(listingId) }, { $set: updateData }, { returnDocument: "after" });

  return {
    statusCode: 200,
    data: result as MarketplaceModel,
  };
};

export const deleteMarketplace = async (userId: string, ticketId: string): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const collection = db.collection("Marketplace");

  const foundMarketplace = await collection.findOne({
    userId: ObjectId.createFromHexString(userId),
    ticketId: ObjectId.createFromHexString(ticketId),
  });

  if (!foundMarketplace) {
    return {
      statusCode: 404,
      message: "Marketplace not found",
    };
  }

  const result = await collection.deleteOne({
    userId: ObjectId.createFromHexString(userId),
    ticketId: ObjectId.createFromHexString(ticketId),
  });

  return {
    statusCode: 200,
    data: result.acknowledged,
  };
};

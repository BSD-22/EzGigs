import { ObjectId, UpdateFilter } from "mongodb";
import { getDb } from "../config/mongo-connection";
import { CustomResponse } from "@/types";
import { hashText } from "@/utils/bcrypt";
import { TicketModel } from "./ticket";
// import { TicketModel } from "./ticket";

export type UserModel = {
  _id: ObjectId;
  email: string;
  name: string;
  password: string;
  role: "seller" | "buyer";
  ownedTickets?: {
    ticketId: ObjectId;
    status: "owned" | "selling" | "sold";
    purchasePrice?: number; // Add this field
  }[];
  soldTickets?: {
    ticketId: ObjectId;
    toUserId: ObjectId;
    soldPrice?: number; // Add this field
  }[];
};

export type UserTicketsResponse = {
  _id: ObjectId;
  email: string;
  name: string;
  password: string;
  ownedTickets: {
    ticketId: ObjectId;
    status: "owned" | "selling" | "sold";
    purchasePrice?: number;
  }[];
  soldTickets: {
    ticketId: ObjectId;
    toUserId: ObjectId;
    soldPrice?: number;
  }[];
  ticketDetails: TicketModel[];
  buyerDetails: UserModel[];
};

export type UserModelWithoutPassword = Omit<UserModel, "password">;

export const createUser = async (email: string, name: string, password: string): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const collection = db.collection("User");

  const modifiedUser = {
    email,
    name,
    password: hashText(password),
    role: "buyer" as const,
    ownedTickets: [] as UserModel["ownedTickets"],
    soldTickets: [] as UserModel["soldTickets"],
  };

  const insertedUser = await collection.insertOne(modifiedUser);

  const result: UserModelWithoutPassword = {
    _id: insertedUser.insertedId,
    email,
    name,
    role: "buyer",
    ownedTickets: [],
    soldTickets: [],
  };

  return {
    statusCode: 201,
    data: result,
  };
};

export const getAllUsers = async (): Promise<CustomResponse<UserModel[]>> => {
  const db = await getDb();
  const collection = db.collection("User");

  const users = (await collection
    .aggregate([
      {
        $lookup: {
          from: "Ticket",
          localField: "ownedTickets.ticketId",
          foreignField: "_id",
          as: "ticketDetails",
        },
      },
    ])
    .toArray()) as UserModel[];

  return {
    statusCode: 200,
    data: users,
  };
};

export const getUserByEmail = async (email: string): Promise<CustomResponse<UserModel>> => {
  const db = await getDb();
  const collection = db.collection("User");

  const user = (await collection
    .aggregate([
      {
        $match: { email },
      },
    ])
    .next()) as UserModel;

  return {
    statusCode: 200,
    data: user,
  };
};

export const getUserTickets = async (email: string): Promise<CustomResponse<UserTicketsResponse>> => {
  const db = await getDb();
  const collection = db.collection("User");

  const user = (await collection
    .aggregate([
      {
        $match: { email },
      },
      {
        $lookup: {
          from: "Ticket",
          localField: "ownedTickets.ticketId",
          foreignField: "_id",
          as: "ownedTicketDetails",
        },
      },
      {
        $lookup: {
          from: "Ticket",
          localField: "soldTickets.ticketId",
          foreignField: "_id",
          as: "soldTicketDetails",
        },
      },
      {
        $addFields: {
          ticketDetails: {
            $concatArrays: ["$ownedTicketDetails", "$soldTicketDetails"],
          },
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "soldTickets.toUserId",
          foreignField: "_id",
          as: "buyerDetails",
        },
      },
      {
        $project: {
          ownedTicketDetails: 0,
          soldTicketDetails: 0,
        },
      },
    ])
    .next()) as UserTicketsResponse;

  return {
    statusCode: 200,
    data: user,
  };
};

export const addTicketToUser = async (userId: string, ticketId: string, purchasePrice?: number) => {
  const db = await getDb();
  const collection = db.collection<UserModel>("User");

  const result = await collection.updateOne({ _id: ObjectId.createFromHexString(userId) }, {
    $push: {
      ownedTickets: {
        ticketId: ObjectId.createFromHexString(ticketId),
        status: "owned",
        purchasePrice,
      },
    },
  } satisfies UpdateFilter<UserModel>);

  return {
    statusCode: 200,
    data: result.acknowledged,
  };
};

export const updateTicketStatus = async (userId: string, ticketId: string, status: "owned" | "selling" | "sold", buyerId?: string, soldPrice?: number): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const collection = db.collection<UserModel>("User");

  const result = await collection.updateOne(
    {
      _id: ObjectId.createFromHexString(userId),
      "ownedTickets.ticketId": ObjectId.createFromHexString(ticketId),
    },
    {
      $set: {
        "ownedTickets.$.status": status,
      },
    } satisfies UpdateFilter<UserModel>
  );

  if (status === "sold" && buyerId) {
    const updateSoldTicket = {
      $pull: {
        ownedTickets: {
          ticketId: ObjectId.createFromHexString(ticketId),
        },
      },
      $push: {
        soldTickets: {
          ticketId: ObjectId.createFromHexString(ticketId),
          toUserId: ObjectId.createFromHexString(buyerId),
          soldPrice, // Add the marketplace price to soldTickets
        },
      },
    } satisfies UpdateFilter<UserModel>;

    await collection.updateOne({ _id: ObjectId.createFromHexString(userId) }, updateSoldTicket);
  }

  return {
    statusCode: 200,
    data: result.acknowledged,
  };
};

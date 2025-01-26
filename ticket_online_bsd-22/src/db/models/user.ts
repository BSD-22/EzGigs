import { ObjectId, UpdateFilter } from "mongodb";
import { getDb } from "../config/mongo-connection";
import { CustomResponse } from "@/types";
import { hashText } from "@/utils/bcrypt";
import { TicketModel } from "./ticket";

export type UserModel = {
  _id: ObjectId;
  email: string;
  name: string;
  password: string;
  ownedTickets?: {
    ticketId: ObjectId;
    status: "owned" | "selling" | "sold";
  }[];
  soldTickets?: {
    ticketId: ObjectId;
    toUserId: ObjectId;
  }[];
};

export type UserModelWithoutPassword = Omit<UserModel, "password">;

export const createUser = async (email: string, name: string, password: string): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const collection = db.collection("User");

  const modifiedUser = {
    email,
    name,
    password: hashText(password),
    ownedTickets: [] as UserModel["ownedTickets"],
    soldTickets: [] as UserModel["soldTickets"],
  };

  const insertedUser = await collection.insertOne(modifiedUser);

  const result: UserModelWithoutPassword = {
    _id: insertedUser.insertedId,
    email,
    name,
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

export const getUserTickets = async (email: string): Promise<CustomResponse<UserModel & { ticketDetails: TicketModel[] }>> => {
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
          as: "ticketDetails",
        },
      },
    ])
    .next()) as UserModel & { ticketDetails: TicketModel[] };

  return {
    statusCode: 200,
    data: user,
  };
};

export const addTicketToUser = async (userId: string, ticketId: string): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const collection = db.collection<UserModel>("User");

  const updateDocument = {
    $push: {
      ownedTickets: {
        ticketId: ObjectId.createFromHexString(ticketId),
        status: "owned" as const,
      },
    },
  } satisfies UpdateFilter<UserModel>;

  const result = await collection.updateOne({ _id: ObjectId.createFromHexString(userId) }, updateDocument);

  return {
    statusCode: 200,
    data: result.acknowledged,
  };
};

export const updateTicketStatus = async (userId: string, ticketId: string, status: "owned" | "selling" | "sold", buyerId?: string): Promise<CustomResponse<unknown>> => {
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

import { ObjectId, UpdateFilter } from "mongodb";
import { getDb } from "../config/mongo-connection";
import { CustomResponse } from "@/types";
import { hashText } from "@/utils/bcrypt";
import { TicketModel } from "./ticket";

export type UserTicket = {
  ticketId: ObjectId;
  categoryName: string;
  seatNumber: string;
  status: "owned" | "selling" | "sold";
  purchasePrice: number;
  purchaseDate: Date;
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
  identityType: "KTP" | "Passport" | "SIM" | "Student";
  identityDetails: string;
};

export type SoldTicket = {
  ticketId: ObjectId;
  categoryName: string;
  seatNumber: string;
  toUserId: ObjectId;
  soldPrice: number;
  soldDate: Date;
  Event?: {
    name: string;
  };
};

export type UserModel = {
  _id: ObjectId;
  email: string;
  name: string;
  password: string;
  role: "seller" | "buyer";
  ownedTickets: UserTicket[];
  soldTickets: SoldTicket[];
};

export type UserTicketsResponse = {
  _id: ObjectId;
  email: string;
  name: string;
  role: "seller" | "buyer";
  ownedTickets: UserTicket[];
  soldTickets: SoldTicket[];
  ticketDetails: TicketModel[];
  buyerDetails: Omit<UserModel, "password" | "ownedTickets" | "soldTickets">[];
  eventDetails: TicketModel[]; // Add this line to include eventDetails
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

export const getUserById = async (id: string): Promise<CustomResponse<UserModel>> => {
  const db = await getDb();
  const collection = db.collection("User");

  const user = (await collection.findOne({ _id: ObjectId.createFromHexString(id) })) as UserModel;

  return {
    statusCode: 200,
    data: user,
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
          from: "Ticket",
          localField: "soldTickets.ticketId",
          foreignField: "_id",
          as: "eventDetails",
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

  // Map event names to sold tickets
  user.soldTickets = user.soldTickets.map((ticket) => {
    const eventDetail = user.eventDetails.find((event: TicketModel) => event._id.equals(ticket.ticketId)); // Explicitly type 'event'
    return {
      ...ticket,
      Event: {
        name: eventDetail ? eventDetail.name : "Unknown Event",
      },
    };
  });

  return {
    statusCode: 200,
    data: user,
  };
};

// Update addTicketToUser function to include buyer details
export const addTicketToUser = async (
  userId: string,
  ticketId: string,
  categoryName: string,
  seatNumber: string,
  purchasePrice: number,
  buyerData: {
    email: string;
    name: string;
    phone: string;
    identityType: UserTicket["identityType"];
    identityNumber: string;
  }
): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const collection = db.collection<UserModel>("User");

  const result = await collection.updateOne({ _id: new ObjectId(userId) }, {
    $push: {
      ownedTickets: {
        ticketId: new ObjectId(ticketId),
        categoryName,
        seatNumber,
        status: "owned",
        purchasePrice,
        purchaseDate: new Date(),
        // Add buyer details
        buyerEmail: buyerData.email,
        buyerName: buyerData.name,
        buyerPhone: buyerData.phone,
        identityType: buyerData.identityType,
        identityDetails: buyerData.identityNumber,
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

  const user = await collection.findOne({
    _id: new ObjectId(userId),
    "ownedTickets.ticketId": new ObjectId(ticketId),
  });

  if (!user) {
    return {
      statusCode: 404,
      message: "Ticket not found in user's owned tickets",
    };
  }

  const ticket = user.ownedTickets.find((t) => t.ticketId.toString() === ticketId);
  if (!ticket) {
    return {
      statusCode: 404,
      message: "Ticket not found",
    };
  }

  const result = await collection.updateOne(
    {
      _id: new ObjectId(userId),
      "ownedTickets.ticketId": new ObjectId(ticketId),
    },
    {
      $set: {
        "ownedTickets.$.status": status,
      },
    } satisfies UpdateFilter<UserModel>
  );

  if (status === "sold" && buyerId && soldPrice) {
    const updateSoldTicket = {
      $pull: {
        ownedTickets: {
          ticketId: new ObjectId(ticketId),
        },
      },
      $push: {
        soldTickets: {
          ticketId: new ObjectId(ticketId),
          categoryName: ticket.categoryName,
          seatNumber: ticket.seatNumber,
          toUserId: new ObjectId(buyerId),
          soldPrice,
          soldDate: new Date(),
        },
      },
    } satisfies UpdateFilter<UserModel>;

    await collection.updateOne({ _id: new ObjectId(userId) }, updateSoldTicket);
  }

  return {
    statusCode: 200,
    data: result.acknowledged,
  };
};

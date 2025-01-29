import { ObjectId, UpdateFilter, Collection, WithoutId } from "mongodb";
import { getDb } from "../config/mongo-connection";
import { CustomResponse } from "@/types";
import { UserModel } from "./user";

export type SeatCategory = {
  name: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  soldSeats: string[];
};

export type TicketModel = {
  _id: ObjectId;
  name: string;
  venue: string;
  date: string;
  time: string;
  description: string;
  image: string;
  sellerId?: ObjectId;
  seatCategories: SeatCategory[];
};

export type TicketPurchase = {
  _id: ObjectId;
  ticketId: ObjectId;
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
  identityType: "KTP" | "Passport" | "SIM" | "Student";
  identityNumber: string;
  categoryName: string;
  seatNumber: string;
  price: number;
  paymentStatus: "pending" | "paid" | "failed";
  paymentIntentId?: string;
  purchaseDate: Date;
};

export const purchaseTicket = async (
  ticketId: string,
  categoryName: string,
  buyerData: {
    email: string;
    name: string;
    phone: string;
    identityType: TicketPurchase["identityType"];
    identityNumber: string;
    userId: string;
  }
): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const ticketsCollection: Collection<TicketModel> = db.collection("Ticket");
  const purchasesCollection: Collection<WithoutId<TicketPurchase>> = db.collection("TicketPurchase");
  const usersCollection: Collection<UserModel> = db.collection<UserModel>("User");

  // Find the ticket
  const ticket = await ticketsCollection.findOne({ _id: ObjectId.createFromHexString(ticketId) });
  if (!ticket) {
    return {
      statusCode: 404,
      message: "Ticket not found",
    };
  }

  // Find the category
  const category = ticket.seatCategories.find((cat) => cat.name === categoryName);
  if (!category) {
    return {
      statusCode: 400,
      message: "Category not found",
    };
  }

  if (category.availableSeats <= 0) {
    return {
      statusCode: 400,
      message: "No seats available in this category",
    };
  }

  const nextSeatNumber = `${categoryName}-${category.soldSeats.length + 1}`;

  // Create the purchase record
  const purchase: WithoutId<TicketPurchase> = {
    ticketId: ObjectId.createFromHexString(ticketId),
    buyerEmail: buyerData.email,
    buyerName: buyerData.name,
    buyerPhone: buyerData.phone,
    identityType: buyerData.identityType,
    identityNumber: buyerData.identityNumber,
    categoryName,
    seatNumber: nextSeatNumber,
    price: category.price,
    paymentStatus: "pending",
    purchaseDate: new Date(),
  };

  // Update the ticket availability
  const updateOperation: UpdateFilter<TicketModel> = {
    $push: { "seatCategories.$.soldSeats": nextSeatNumber },
    $inc: { "seatCategories.$.availableSeats": -1 },
  };

  await ticketsCollection.updateOne({ _id: ObjectId.createFromHexString(ticketId), "seatCategories.name": categoryName }, updateOperation);

  // Insert the purchase record
  const insertedPurchase = await purchasesCollection.insertOne(purchase);

  // Update buyer's ownedTickets when payment is verified
  // In purchaseTicket function
  if (purchase.paymentStatus === "paid") {
    const buyerUpdateDoc: UpdateFilter<UserModel> = {
      $push: {
        ownedTickets: {
          ticketId: ObjectId.createFromHexString(ticketId),
          categoryName,
          seatNumber: nextSeatNumber,
          status: "owned",
          purchasePrice: category.price,
          purchaseDate: new Date(),
          buyerEmail: buyerData.email,
          buyerName: buyerData.name,
          buyerPhone: buyerData.phone,
          identityType: buyerData.identityType,
          identityNumber: buyerData.identityNumber,
        },
      },
    };
    await usersCollection.updateOne({ _id: ObjectId.createFromHexString(buyerData.userId) }, buyerUpdateDoc);
  }

  return {
    statusCode: 201,
    message: "Ticket purchase initiated",
    data: {
      purchaseId: insertedPurchase.insertedId,
      seatNumber: nextSeatNumber,
    },
  };
};

// Update updateTicketPurchaseStatus function similarly
export const updateTicketPurchaseStatus = async (
  purchaseId: string,
  status: TicketPurchase["paymentStatus"],
  paymentIntentId?: string,
  metadata?: { userId: string }
): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const purchasesCollection = db.collection<TicketPurchase>("TicketPurchase");
  const ticketsCollection = db.collection<TicketModel>("Ticket");
  const usersCollection: Collection<UserModel> = db.collection<UserModel>("User");

  const purchase = await purchasesCollection.findOne({ _id: ObjectId.createFromHexString(purchaseId) });
  if (!purchase) {
    return {
      statusCode: 404,
      message: "Purchase record not found",
    };
  }

  const ticket = await ticketsCollection.findOne({ _id: purchase.ticketId });
  if (!ticket || !ticket.sellerId) {
    return {
      statusCode: 404,
      message: "Ticket or seller not found",
    };
  }

  const result = await purchasesCollection.updateOne(
    { _id: ObjectId.createFromHexString(purchaseId) },
    {
      $set: {
        paymentStatus: status,
        paymentIntentId,
      },
    }
  );

  if (status === "paid" && metadata?.userId) {
    const updateDoc: UpdateFilter<UserModel> = {
      $push: {
        soldTickets: {
          ticketId: purchase.ticketId,
          categoryName: purchase.categoryName,
          seatNumber: purchase.seatNumber,
          toUserId: ObjectId.createFromHexString(metadata.userId),
          soldPrice: purchase.price,
          soldDate: new Date(),
        },
      },
    };
    await usersCollection.updateOne({ _id: ticket.sellerId }, updateDoc);
  }

  // If payment is verified, update the records
  if (status === "paid" && metadata?.userId) {
    // Update buyer's ownedTickets
    const buyerUpdateDoc: UpdateFilter<UserModel> = {
      $push: {
        ownedTickets: {
          ticketId: purchase.ticketId,
          categoryName: purchase.categoryName,
          seatNumber: purchase.seatNumber,
          status: "owned",
          purchasePrice: purchase.price,
          purchaseDate: new Date(),
          buyerEmail: purchase.buyerEmail,
          buyerName: purchase.buyerName,
          buyerPhone: purchase.buyerPhone,
          identityType: purchase.identityType,
          identityNumber: purchase.identityNumber,
        },
      },
    };

    await usersCollection.updateOne({ _id: ObjectId.createFromHexString(metadata.userId) }, buyerUpdateDoc);
  }

  return {
    statusCode: 200,
    data: result.acknowledged,
  };
};

export const getAllTickets = async (): Promise<CustomResponse<TicketModel[]>> => {
  const db = await getDb();
  const collection: Collection<TicketModel> = db.collection("Ticket");

  const tickets = await collection.find({}).toArray();

  return {
    statusCode: 200,
    data: tickets,
  };
};

export const getTicketById = async (id: string): Promise<CustomResponse<TicketModel>> => {
  const db = await getDb();
  const collection: Collection<TicketModel> = db.collection("Ticket");

  const ticket = await collection.findOne({ _id: ObjectId.createFromHexString(id) });

  if (!ticket) {
    return {
      statusCode: 404,
      message: "Ticket not found",
    };
  }

  return {
    statusCode: 200,
    data: ticket,
  };
};

export const createTicket = async (
  name: string,
  venue: string,
  date: string,
  time: string,
  description: string,
  image: string,
  seatCategories: Omit<SeatCategory, "availableSeats" | "soldSeats">[],
  sellerId: string
): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const collection: Collection<WithoutId<TicketModel>> = db.collection("Ticket");

  const formattedSeatCategories = seatCategories.map((category) => ({
    ...category,
    availableSeats: category.totalSeats,
    soldSeats: [],
  }));

  const newTicket: WithoutId<TicketModel> = {
    name,
    venue,
    date,
    time,
    description,
    image,
    sellerId: ObjectId.createFromHexString(sellerId),
    seatCategories: formattedSeatCategories,
  };

  const result = await collection.insertOne(newTicket);

  return {
    statusCode: 201,
    message: "Ticket created successfully",
    data: {
      _id: result.insertedId,
      ...newTicket,
    },
  };
};

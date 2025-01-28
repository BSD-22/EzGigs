import { ObjectId, UpdateFilter, Collection, WithoutId } from "mongodb";
import { getDb } from "../config/mongo-connection";
import { CustomResponse } from "@/types";

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
  }
): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const ticketsCollection: Collection<TicketModel> = db.collection("Ticket");
  const purchasesCollection: Collection<WithoutId<TicketPurchase>> = db.collection("TicketPurchase");

  // Find the ticket
  const ticket = await ticketsCollection.findOne({ _id: new ObjectId(ticketId) });
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
    ticketId: new ObjectId(ticketId),
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

  await ticketsCollection.updateOne({ _id: new ObjectId(ticketId), "seatCategories.name": categoryName }, updateOperation);

  // Insert the purchase record
  const insertedPurchase = await purchasesCollection.insertOne(purchase);

  return {
    statusCode: 201,
    message: "Ticket purchase initiated",
    data: {
      purchaseId: insertedPurchase.insertedId,
      seatNumber: nextSeatNumber,
    },
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

  const ticket = await collection.findOne({ _id: new ObjectId(id) });

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
    sellerId: new ObjectId(sellerId),
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

export const updateTicketPurchaseStatus = async (purchaseId: string, status: TicketPurchase["paymentStatus"], paymentIntentId?: string): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const collection = db.collection("TicketPurchase");

  const result = await collection.updateOne(
    { _id: new ObjectId(purchaseId) },
    {
      $set: {
        paymentStatus: status,
        paymentIntentId,
      },
    }
  );

  return {
    statusCode: 200,
    data: result.acknowledged,
  };
};

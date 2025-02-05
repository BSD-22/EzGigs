import { ObjectId, UpdateFilter, Collection, WithoutId } from "mongodb";
import { getDb } from "../config/mongo-connection";
import { CustomResponse } from "@/types";
import { UserModel } from "./user";
import redis from "@/services/redis";

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
  location?: {
    latitude: number;
    longitude: number;
  }; // Add this line to store location
};

export type TicketPurchase = {
  _id: ObjectId;
  ticketId: ObjectId;
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
  identityType: "KTP" | "Passport" | "SIM" | "Student";
  identityDetails: string;
  categoryName: string;
  seatNumber: string;
  price: number;
  paymentStatus: "pending" | "paid" | "failed";
  paymentIntentId?: string;
  purchaseDate: Date;
};

export type SerializedTicket = {
  _id: string;
  name: string;
  venue: string;
  date: string;
  time: string;
  description: string;
  image: string;
  sellerId?: string;
  seatCategories: SeatCategory[];
  location?: {
    latitude: number;
    longitude: number;
  };
};

export const purchaseTicket = async (
  ticketId: string,
  categoryName: string,
  buyerData: {
    email: string;
    name: string;
    phone: string;
    identityType: TicketPurchase["identityType"];
    identityDetails: string;
    userId: string;
  }
): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const ticketsCollection: Collection<TicketModel> = db.collection("Ticket");
  const purchasesCollection: Collection<WithoutId<TicketPurchase>> =
    db.collection("TicketPurchase");
  const usersCollection: Collection<UserModel> =
    db.collection<UserModel>("User");

  const ticket = await ticketsCollection.findOne({
    _id: ObjectId.createFromHexString(ticketId),
  });
  if (!ticket) {
    return {
      statusCode: 404,
      message: "Ticket not found",
    };
  }

  const category = ticket.seatCategories.find(
    (cat) => cat.name === categoryName
  );
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

  const purchase: WithoutId<TicketPurchase> = {
    ticketId: ObjectId.createFromHexString(ticketId),
    buyerEmail: buyerData.email,
    buyerName: buyerData.name,
    buyerPhone: buyerData.phone,
    identityType: buyerData.identityType,
    identityDetails: buyerData.identityDetails,
    categoryName,
    seatNumber: nextSeatNumber,
    price: category.price,
    paymentStatus: "pending",
    purchaseDate: new Date(),
  };

  const updateOperation: UpdateFilter<TicketModel> = {
    $push: { "seatCategories.$.soldSeats": nextSeatNumber },
    $inc: { "seatCategories.$.availableSeats": -1 },
  };

  await ticketsCollection.updateOne(
    {
      _id: ObjectId.createFromHexString(ticketId),
      "seatCategories.name": categoryName,
    },
    updateOperation
  );

  await redis.del("tickets");

  const insertedPurchase = await purchasesCollection.insertOne(purchase);

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
          identityDetails: buyerData.identityDetails,
        },
      },
    };
    await usersCollection.updateOne(
      { _id: ObjectId.createFromHexString(buyerData.userId) },
      buyerUpdateDoc
    );
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

export const updateTicketPurchaseStatus = async (
  purchaseId: string,
  status: "paid" | "failed",
  paymentIntent: { id: string } | undefined,
  { userId }: { userId: string }
) => {
  const db = await getDb();
  const purchasesCollection = db.collection<TicketPurchase>("TicketPurchase");
  const ticketsCollection = db.collection<TicketModel>("Ticket");
  const usersCollection: Collection<UserModel> =
    db.collection<UserModel>("User");

  const purchase = await purchasesCollection.findOne({
    _id: ObjectId.createFromHexString(purchaseId),
  });
  if (!purchase) {
    return {
      statusCode: 404,
      message: "Purchase record not found",
    };
  }

  const ticket = await ticketsCollection.findOne({ _id: purchase.ticketId });

  if (!ticket) {
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
        paymentIntentId: paymentIntent?.id,
      },
    }
  );

  if (status === "paid" && userId) {
    // Changed from metadata?.userId to userId
    const updateDoc: UpdateFilter<UserModel> = {
      $push: {
        soldTickets: {
          ticketId: purchase.ticketId,
          categoryName: purchase.categoryName,
          seatNumber: purchase.seatNumber,
          toUserId: ObjectId.createFromHexString(userId), // Changed from metadata.userId to userId
          soldPrice: purchase.price,
          soldDate: new Date(),
        },
      },
    };
    await usersCollection.updateOne({ _id: ticket.sellerId }, updateDoc);

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
          identityDetails: purchase.identityDetails,
        },
      },
    };

    await usersCollection.updateOne(
      { _id: ObjectId.createFromHexString(userId) },
      buyerUpdateDoc
    ); // Changed from metadata.userId to userId
  }

  return {
    statusCode: 200,
    data: result.acknowledged,
  };
};

export const deleteExpiredTickets = async (): Promise<void> => {
  const db = await getDb();
  const ticketsCollection: Collection<TicketModel> = db.collection("Ticket");
  const purchasesCollection = db.collection<TicketPurchase>("TicketPurchase");

  const currentDate = new Date();

  const expiredTickets = await ticketsCollection.find({}).toArray();

  for (const ticket of expiredTickets) {
    const ticketDate = new Date(`${ticket.date} ${ticket.time}`);

    if (ticketDate < currentDate) {
      await ticketsCollection.deleteOne({ _id: ticket._id });
      await purchasesCollection.deleteMany({ ticketId: ticket._id });

      await redis.del("tickets");
    }
  }
};

export const getAllTickets = async (): Promise<
  CustomResponse<TicketModel[]>
> => {
  await deleteExpiredTickets();

  const db = await getDb();
  const collection: Collection<TicketModel> = db.collection("Ticket");

  const tickets = await collection.find({}).toArray();

  const cachedTickets = await redis.get("tickets");

  if (cachedTickets) {
    return {
      statusCode: 200,
      data: JSON.parse(cachedTickets),
    };
  }

  await redis.set("tickets", JSON.stringify(tickets));

  return {
    statusCode: 200,
    data: tickets,
  };
};

export const getTicketById = async (
  id: string
): Promise<CustomResponse<TicketModel>> => {
  const db = await getDb();
  const collection: Collection<TicketModel> = db.collection("Ticket");

  const ticket = await collection.findOne({
    _id: ObjectId.createFromHexString(id),
  });

  if (!ticket) {
    return {
      statusCode: 404,
      message: "Ticket not found",
    };
  }

  // Cek apakah tiket sudah kadaluwarsa
  const ticketDate = new Date(`${ticket.date} ${ticket.time}`);
  if (ticketDate < new Date()) {
    await deleteExpiredTickets(); // Hapus tiket kadaluwarsa
    return {
      statusCode: 404,
      message: "Ticket has expired",
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
  sellerId: string,
  location: { latitude: number; longitude: number }
): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const collection: Collection<WithoutId<TicketModel>> =
    db.collection("Ticket");

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
    location,
  };

  const result = await collection.insertOne(newTicket);

  await redis.del("tickets");

  return {
    statusCode: 201,
    message: "Ticket created successfully",
    data: {
      _id: result.insertedId,
      ...newTicket,
    },
  };
};

export const getTicketByPurchaseId = async (
  purchaseId: string
): Promise<
  CustomResponse<TicketModel & { seatNumber: string; price: number }>
> => {
  const db = await getDb();
  const purchasesCollection = db.collection<TicketPurchase>("TicketPurchase");
  const ticketsCollection = db.collection<TicketModel>("Ticket");

  const purchase = await purchasesCollection.findOne({
    _id: ObjectId.createFromHexString(purchaseId),
  });

  if (!purchase) {
    return {
      statusCode: 404,
      message: "Ticket purchase not found",
    };
  }

  const ticket = await ticketsCollection.findOne({ _id: purchase.ticketId });

  if (!ticket) {
    return {
      statusCode: 404,
      message: "Ticket not found",
    };
  }

  return {
    statusCode: 200,
    data: {
      ...ticket,
      seatNumber: purchase.seatNumber,
      price: purchase.price,
    },
  };
};

export const updateTicket = async (
  ticketId: string,
  updateData: Partial<TicketModel>
): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const collection: Collection<TicketModel> = db.collection("Ticket");

  const result = await collection.updateOne(
    { _id: ObjectId.createFromHexString(ticketId) },
    { $set: updateData }
  );

  await redis.del("tickets");
  return {
    statusCode: 200,
    data: result.acknowledged,
  };
};

import { ObjectId } from "mongodb";
import { getDb } from "../config/mongo-connection";
import { CustomResponse } from "@/types";

export type TicketModel = {
  _id: ObjectId;
  name: string;
  price: number;
  seats: string;
  venue: string;
  date: string;
  time: string;
  description: string;
  image: string;
};

export const createTicket = async (
  userId: ObjectId,
  name: string,
  price: number,
  seats: number,
  venue: string,
  date: string,
  time: string,
  description: string,
  image: string
): Promise<CustomResponse<unknown>> => {
  const db = await getDb();
  const collection = db.collection("Ticket");

  const newTicket = {
    userId,
    name,
    price,
    seats,
    venue,
    date,
    time,
    description,
    image,
  };

  const insertedTicket = await collection.insertOne(newTicket);

  const result: CustomResponse<unknown> = {
    statusCode: 201,
    message: "Ticket created successfully",
    data: insertedTicket.acknowledged,
  };

  return result;
};

export const getAllTickets = async (): Promise<CustomResponse<TicketModel[]>> => {
  const db = await getDb();
  const collection = db.collection("Ticket");

  const tickets = (await collection.find({}).toArray()) as TicketModel[];

  const result: CustomResponse<TicketModel[]> = {
    statusCode: 200,
    data: tickets,
  };

  return result;
};

export const getTicketById = async (id: string): Promise<CustomResponse<TicketModel>> => {
  const db = await getDb();
  const collection = db.collection("Ticket");

  const ticket = (await collection.findOne({ _id: ObjectId.createFromHexString(id) })) as TicketModel;

  const result: CustomResponse<TicketModel> = {
    statusCode: 200,
    data: ticket,
  };

  return result;
};

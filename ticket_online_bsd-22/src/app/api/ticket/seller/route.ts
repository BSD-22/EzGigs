import { NextRequest, NextResponse } from "next/server";
import { createTicket, getAllTickets, TicketModel } from "@/db/models/ticket";
import { CustomResponse } from "@/types";
import { z } from "zod";
import { ref, set } from "firebase/database";
import { database } from "@/services/firebase";

const SeatCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  price: z.number().min(0, "Price must be 0 or greater"),
  totalSeats: z.number().min(1, "Must have at least 1 seat"),
});

// Update the TicketSchema to include location
const TicketSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  venue: z.string().min(1, "Venue is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Must be a valid URL"),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  seatCategories: z.array(SeatCategorySchema).min(1, "At least one seat category is required"),
});

export const GET = async (req: NextRequest) => {
  try {
    const sellerId = req.headers.get("x-user-id");

    if (!sellerId) {
      return NextResponse.json<CustomResponse<unknown>>(
        {
          statusCode: 401,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const tickets = await getAllTickets();
    return NextResponse.json<CustomResponse<TicketModel[]>>({
      statusCode: 200,
      data: tickets.data || [],
    });
  } catch (error) {
    console.error("Failed to fetch seller tickets:", error);
    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const sellerId = req.headers.get("x-user-id");

    if (!sellerId) {
      return NextResponse.json<CustomResponse<unknown>>(
        {
          statusCode: 401,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsedTicket = TicketSchema.safeParse(body);

    if (!parsedTicket.success) {
      return NextResponse.json<CustomResponse<unknown>>(
        {
          statusCode: 400,
          message: "Invalid input",
          data: parsedTicket.error.format(),
        },
        { status: 400 }
      );
    }

    const { name, venue, date, time, description, image, seatCategories, location } = parsedTicket.data;

    const result = await createTicket(name, venue, date, time, description, image, seatCategories, sellerId, location);

    await set(ref(database, "newTickets/latest"), {
      eventName: name,
      eventDate: date,
      eventTime: time,
      venue: venue,
      image: image,
      timestamp: Date.now(),
    });

    return NextResponse.json<CustomResponse<unknown>>(result);
  } catch (error) {
    console.error("Failed to create ticket:", error);
    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
};

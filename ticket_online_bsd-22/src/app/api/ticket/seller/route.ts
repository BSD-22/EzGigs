import { NextRequest, NextResponse } from "next/server";
import { createTicket, getAllTickets, TicketModel } from "@/db/models/ticket";
import { CustomResponse } from "@/types";
import { z } from "zod";

const SeatCategorySchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  totalSeats: z.number().min(1),
});

const TicketSchema = z.object({
  name: z.string().min(1),
  venue: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
  sellerId: z.string().min(1),
  seatCategories: z.array(SeatCategorySchema).min(1),
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
    const sellerTickets = tickets.data?.filter((ticket) => ticket.sellerId?.toString() === sellerId);

    return NextResponse.json<CustomResponse<TicketModel[]>>({
      statusCode: 200,
      data: sellerTickets || [],
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
    body.sellerId = sellerId; // Ensure sellerId from auth is used

    const parsedTicket = TicketSchema.safeParse(body);

    if (!parsedTicket.success) {
      return NextResponse.json<CustomResponse<unknown>>(
        {
          statusCode: 400,
          message: "Invalid input",
          data: parsedTicket.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, venue, date, time, description, image, seatCategories } = parsedTicket.data;

    const result = await createTicket(name, venue, date, time, description, image, seatCategories, sellerId);

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

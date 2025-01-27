import { NextRequest, NextResponse } from "next/server";
import { createTicket } from "@/db/models/ticket";
import { CustomResponse } from "@/types";
import { z } from "zod";

const TicketSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  seats: z.number().min(1),
  venue: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
  sellerId: z.string().min(1),
});

export const POST = async (req: NextRequest) => {
  try {
    const { name, price, seats, venue, date, time, description, image, sellerId } = await req.json();

    const parsedTicket = TicketSchema.safeParse({ name, price, seats, venue, date, time, description, image, sellerId });

    if (!parsedTicket.success) {
      return NextResponse.json<CustomResponse<unknown>>(
        {
          statusCode: 400,
          message: "Invalid input",
        },
        { status: 400 }
      );
    }

    const result = await createTicket(name, Number(price), Number(seats), venue, date, time, description, image, sellerId);

    return NextResponse.json<CustomResponse<unknown>>({
      statusCode: 201,
      message: result.message,
      data: result.data,
    });
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

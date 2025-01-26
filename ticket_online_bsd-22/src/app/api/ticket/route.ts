import { getAllTickets, getTicketById, TicketModel } from "@/db/models/ticket";
import { addTicketToUser } from "@/db/models/user";
import { createPaymentSession } from "@/services/stripe";
import { CustomResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  const tickets = await getAllTickets();
  return NextResponse.json<CustomResponse<TicketModel[]>>({
    statusCode: 200,
    data: tickets.data,
  });
};

export const POST = async (request: NextRequest) => {
  try {
    const { ticketId } = await request.json();
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        {
          statusCode: 401,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const ticket = await getTicketById(ticketId);
    if (!ticket.data) {
      return NextResponse.json(
        {
          statusCode: 404,
          message: "Ticket not found",
        },
        { status: 404 }
      );
    }

    const stripeSession = await createPaymentSession(ticket.data, userId);
    if (stripeSession.statusCode !== 200) {
      return NextResponse.json(stripeSession, { status: stripeSession.statusCode });
    }

    await addTicketToUser(userId, ticketId);

    return NextResponse.json(stripeSession);
  } catch (error) {
    console.error("Buy Ticket Error:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
};

import { getAllTickets, getTicketById, purchaseTicket, TicketModel } from "@/db/models/ticket";
import { createPaymentSession } from "@/services/stripe";
import { CustomResponse } from "@/types";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  const tickets = await getAllTickets();
  return NextResponse.json<CustomResponse<TicketModel[]>>({
    statusCode: 200,
    data: tickets.data,
  });
};

type PurchaseResponse = {
  purchaseId: ObjectId;
  seatNumber: string;
};

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { ticketId, categoryName, email: buyerEmail, name: buyerName, phone: buyerPhone, identityType, identityNumber } = body;

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

    // First, purchase the ticket and get seat number (status will be pending)
    const purchaseResult = (await purchaseTicket(ticketId, categoryName, {
      email: buyerEmail,
      name: buyerName,
      phone: buyerPhone,
      identityType,
      identityNumber,
    })) as CustomResponse<PurchaseResponse>;

    if (purchaseResult.statusCode !== 201 || !purchaseResult.data) {
      return NextResponse.json(purchaseResult, { status: purchaseResult.statusCode });
    }

    const stripeSession = await createPaymentSession(
      ticket.data,
      categoryName,
      userId,
      purchaseResult.data.purchaseId.toString(),
      purchaseResult.data.seatNumber // Add the missing seatNumber parameter
    );
    if (stripeSession.statusCode !== 200) {
      return NextResponse.json(stripeSession, { status: stripeSession.statusCode });
    }

    return NextResponse.json({
      ...stripeSession,
      purchaseId: purchaseResult.data.purchaseId,
      seatNumber: purchaseResult.data.seatNumber,
    });
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

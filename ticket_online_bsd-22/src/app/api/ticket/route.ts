import { getAllTickets, getTicketById, purchaseTicket, TicketModel, TicketPurchase } from "@/db/models/ticket";
import { createPaymentSession } from "@/services/stripe";
import { CustomResponse } from "@/types";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

type PurchaseResponse = {
  purchaseId: ObjectId;
  seatNumber: string;
};

type PurchaseRequestBody = {
  ticketId: string;
  categoryName: string;
  email: string;
  name: string;
  phone: string;
  identityType: TicketPurchase["identityType"];
  identityNumber: string;
};

export const GET = async () => {
  const tickets = await getAllTickets();
  return NextResponse.json<CustomResponse<TicketModel[]>>({
    statusCode: 200,
    data: tickets.data,
  });
};

export const POST = async (request: NextRequest) => {
  try {
    const body = (await request.json()) as PurchaseRequestBody;
    const { ticketId, categoryName, email: buyerEmail, name: buyerName, phone: buyerPhone, identityType, identityNumber } = body;

    // Validate required fields
    if (!ticketId || !categoryName || !buyerEmail || !buyerName || !buyerPhone || !identityType || !identityNumber) {
      return NextResponse.json<CustomResponse<null>>(
        {
          statusCode: 400,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json<CustomResponse<null>>(
        {
          statusCode: 401,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const ticket = await getTicketById(ticketId);
    if (!ticket.data) {
      return NextResponse.json<CustomResponse<null>>(
        {
          statusCode: 404,
          message: "Ticket not found",
        },
        { status: 404 }
      );
    }

    // First, purchase the ticket and get seat number (status will be pending)
    const purchaseResult = await purchaseTicket(ticketId, categoryName, {
      email: buyerEmail,
      name: buyerName,
      phone: buyerPhone,
      identityType,
      identityNumber,
      userId,
    });

    if (purchaseResult.statusCode !== 201 || !purchaseResult.data) {
      return NextResponse.json(purchaseResult, { status: purchaseResult.statusCode });
    }

    const purchaseData = purchaseResult.data as PurchaseResponse;

    const stripeSession = await createPaymentSession(ticket.data, categoryName, userId, purchaseData.purchaseId.toString(), purchaseData.seatNumber);

    if (stripeSession.statusCode !== 200) {
      return NextResponse.json(stripeSession, { status: stripeSession.statusCode });
    }

    return NextResponse.json<CustomResponse<unknown>>({
      statusCode: 200,
      data: {
        ...stripeSession,
        purchaseId: purchaseData.purchaseId,
        seatNumber: purchaseData.seatNumber,
      },
    });
  } catch (error) {
    console.error("Buy Ticket Error:", error);
    return NextResponse.json<CustomResponse<null>>(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
};

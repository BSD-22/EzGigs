import { NextRequest, NextResponse } from "next/server";
import { CustomResponse } from "@/types";
import { sendETicket } from "@/services/nodemailer";
import { getTicketByPurchaseId } from "@/db/models/ticket";

export const POST = async (req: NextRequest) => {
  try {
    const { userData, buyerData, purchaseId } = await req.json();

    const ticketData = await getTicketByPurchaseId(purchaseId);

    if (!ticketData.data) {
      return NextResponse.json<CustomResponse<unknown>>(
        {
          statusCode: 404,
          message: "Ticket not found",
        },
        { status: 404 }
      );
    }

    await sendETicket(
      {
        name: userData.name,
        email: userData.email,
      },
      buyerData,
      {
        name: ticketData.data.name || "",
        date: ticketData.data.date || new Date().toISOString(),
        time: ticketData.data.time || "",
        venue: ticketData.data.venue || "",
        category: ticketData.data.seatNumber,
        price: ticketData.data.price,
        ticketId: ticketData.data._id.toString(),
      }
    );

    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 200,
        message: "E-ticket sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending e-ticket:", error);
    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 500,
        message: "Failed to send e-ticket",
      },
      { status: 500 }
    );
  }
};

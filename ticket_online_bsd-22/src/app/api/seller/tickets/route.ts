import { NextRequest, NextResponse } from "next/server";
import { CustomResponse } from "@/types";
import { getUserTickets } from "@/db/models/user";
import { analyzeTicket } from "@/services/gemini";

export const GET = async (req: NextRequest) => {
  const email = req.headers.get("x-user-email");

  if (!email) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const userData = await getUserTickets(email);
    if (!userData.data) {
      return NextResponse.json<CustomResponse<unknown>>({
        statusCode: 404,
        message: "User not found",
      });
    }

    const tickets = [];
    for (const ticket of userData.data.ownedTickets) {
      const analysis = await analyzeTicket({
        categoryName: ticket.categoryName,
        purchasePrice: ticket.purchasePrice,
        status: ticket.status,
        soldDate: ticket.purchaseDate,
      });

      tickets.push({
        ticketId: ticket.ticketId.toString(),
        name: ticket.categoryName,
        status: ticket.status,
        price: ticket.purchasePrice,
        demand: analysis.demand,
        recommendedPrice: analysis.recommendedPrice,
        insights: analysis.insights,
      });
    }

    return NextResponse.json<CustomResponse<unknown>>({
      statusCode: 200,
      data: tickets,
    });
  } catch (error) {
    console.error("Tickets Error:", error);
    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
};

// export const PATCH = async (req: NextRequest) => {
//   const email = req.headers.get("x-user-email");

//   if (!email) {
//     return new Response("Unauthorized", { status: 401 });
//   }

//   try {
//     const { ticketId, price } = await req.json();

//     // Here you would update the ticket price in your database
//     // For now, we'll just return success
//     return NextResponse.json<CustomResponse<unknown>>({
//       statusCode: 200,
//       message: "Ticket price updated successfully",
//     });
//   } catch (error) {
//     console.error("Ticket Update Error:", error);
//     return NextResponse.json<CustomResponse<unknown>>(
//       {
//         statusCode: 500,
//         message: "Failed to update ticket price",
//       },
//       { status: 500 }
//     );
//   }
// };

// export const DELETE = async (req: NextRequest) => {
//   const email = req.headers.get("x-user-email");

//   if (!email) {
//     return new Response("Unauthorized", { status: 401 });
//   }

//   try {
//     const { ticketId } = await req.json();

//     // Here you would delete/deactivate the ticket in your database
//     // For now, we'll just return success
//     return NextResponse.json<CustomResponse<unknown>>({
//       statusCode: 200,
//       message: "Ticket removed successfully",
//     });
//   } catch (error) {
//     console.error("Ticket Delete Error:", error);
//     return NextResponse.json<CustomResponse<unknown>>(
//       {
//         statusCode: 500,
//         message: "Failed to remove ticket",
//       },
//       { status: 500 }
//     );
//   }
// };

import { createMarketplace, getAllMarketplace } from "@/db/models/marketplace";
import { getUserTickets, updateTicketStatus } from "@/db/models/user";
import { CustomResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const email = request.headers.get("x-user-email");

  if (!email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const usersTicket = await getUserTickets(email);
  const marketplaceListings = await getAllMarketplace();

  return NextResponse.json<CustomResponse<unknown>>({
    statusCode: 200,
    data: {
      ...usersTicket.data,
      marketplaceListings: marketplaceListings.data,
    },
  });
};

export const POST = async (request: NextRequest) => {
  const userId = request.headers.get("x-user-id");
  const { ticketId, price, description, categoryName, seatNumber } = await request.json();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // First update the ticket status
    const result = await updateTicketStatus(userId, ticketId, "selling");

    if (!result.data) {
      throw new Error("Failed to update ticket status");
    }

    // Then create the marketplace listing
    const updateMarketplace = await createMarketplace(userId, ticketId, price, categoryName, seatNumber, description);

    return NextResponse.json<CustomResponse<unknown>>({
      statusCode: 200,
      data: {
        result: result.data,
        updateMarketplace: updateMarketplace.data,
      },
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json<CustomResponse<unknown>>({
      statusCode: 500,
      message: "Failed to create marketplace listing",
    });
  }
};

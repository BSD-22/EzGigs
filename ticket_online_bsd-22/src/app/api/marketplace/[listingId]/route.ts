import { NextRequest, NextResponse } from "next/server";
import { CustomResponse } from "@/types";
import { updateTicketStatus, addTicketToUser } from "@/db/models/user";
import { getMarketplaceById, deleteMarketplace } from "@/db/models/marketplace";

export const POST = async (request: NextRequest, { params }: { params: { listingId: string } }) => {
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const listing = await getMarketplaceById(params.listingId);

  if (!listing.data) {
    return new Response("Listing not found", { status: 404 });
  }

  try {
    // Update seller's ticket status to sold with the sale price
    const updateSeller = await updateTicketStatus(
      listing.data.user._id.toString(),
      listing.data.ticket._id.toString(),
      "sold",
      userId,
      listing.data.price // Pass the marketplace price
    );

    // Add ticket to buyer's owned tickets with purchase price
    const updateBuyer = await addTicketToUser(
      userId,
      listing.data.ticket._id.toString(),
      listing.data.price // Pass the marketplace price
    );

    // Remove listing from marketplace
    const removeListing = await deleteMarketplace(listing.data.user._id.toString(), listing.data.ticket._id.toString());

    return NextResponse.json<CustomResponse<unknown>>({
      statusCode: 200,
      data: {
        seller: updateSeller.data,
        buyer: updateBuyer.data,
        marketplace: removeListing.data,
      },
    });
  } catch (error) {
    console.log(error);
    return new Response("Transaction failed", { status: 500 });
  }
};

import { NextRequest, NextResponse } from "next/server";
import { CustomResponse } from "@/types";
import { updateTicketStatus, addTicketToUser } from "@/db/models/user";
import { getMarketplaceById, deleteMarketplace } from "@/db/models/marketplace";

export const POST = async (request: NextRequest, { params }: { params: { listingId: string } }) => {
  const userId = request.headers.get("x-user-id");
  const { buyerEmail, buyerName, buyerPhone, identityType, identityNumber } = await request.json();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!buyerEmail || !buyerName || !buyerPhone || !identityType || !identityNumber) {
    return new Response("Missing buyer details", { status: 400 });
  }

  const listing = await getMarketplaceById(params.listingId);

  if (!listing.data) {
    return new Response("Listing not found", { status: 404 });
  }

  try {
    // Update seller's ticket status to sold with the sale price
    const updateSeller = await updateTicketStatus(listing.data.user._id.toString(), listing.data.ticket._id.toString(), "sold", userId, listing.data.price);

    // Add ticket to buyer's owned tickets with purchase price and buyer details
    const updateBuyer = await addTicketToUser(userId, listing.data.ticket._id.toString(), listing.data.categoryName, listing.data.seatNumber, listing.data.price, {
      email: buyerEmail,
      name: buyerName,
      phone: buyerPhone,
      identityType,
      identityNumber,
    });

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

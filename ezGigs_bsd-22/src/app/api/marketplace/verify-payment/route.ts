import { NextRequest, NextResponse } from "next/server";
import { CustomResponse } from "@/types";
import { verifyPaymentSession } from "@/services/stripe";
import { updateTicketStatus, addTicketToUser } from "@/db/models/user";
import { getMarketplaceById, deleteMarketplace } from "@/db/models/marketplace";

export const POST = async (request: NextRequest) => {
  const userId = request.headers.get("x-user-id");
  const { sessionId, purchaseId } = await request.json();

  if (!userId || !sessionId || !purchaseId) {
    return new Response("Missing required data", { status: 400 });
  }

  try {
    // Verify the payment session
    const verifyResult = await verifyPaymentSession(sessionId);

    if (verifyResult.statusCode !== 200 || !verifyResult.data) {
      throw new Error("Payment verification failed");
    }

    const { metadata } = verifyResult.data;

    if (!metadata?.isMarketplace) {
      throw new Error("Invalid payment metadata");
    }

    // Get marketplace listing
    const listingId = purchaseId.split("_")[2]; // Extract listing ID from purchaseId
    const listing = await getMarketplaceById(listingId);

    if (!listing.data) {
      throw new Error("Marketplace listing not found");
    }

    // Update seller's ticket status
    const updateSeller = await updateTicketStatus(listing.data.user._id.toString(), listing.data.ticket._id.toString(), "sold", userId, listing.data.price);

    // Add ticket to buyer's account
    const updateBuyer = await addTicketToUser(userId, listing.data.ticket._id.toString(), listing.data.categoryName, listing.data.seatNumber, listing.data.price, {
      email: listing.data.buyerEmail!,
      name: listing.data.buyerName!,
      phone: listing.data.buyerPhone!,
      identityType: listing.data.identityType!,
      identityNumber: listing.data.identityNumber!,
    });

    // Remove the marketplace listing
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
    console.error("Error verifying marketplace payment:", error);
    return new Response("Payment verification failed", { status: 500 });
  }
};

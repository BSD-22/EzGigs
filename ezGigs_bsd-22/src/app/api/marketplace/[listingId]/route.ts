import { NextRequest, NextResponse } from "next/server";
import { CustomResponse } from "@/types";
import { updateTicketStatus, addTicketToUser } from "@/db/models/user";
import { getMarketplaceById, deleteMarketplace, updateMarketplaceBuyerDetails } from "@/db/models/marketplace";
import { createMarketplacePaymentSession } from "@/services/stripe";

export const POST = async (request: NextRequest, { params }: { params: Promise<{ listingId: string }> }) => {
  const userId = request.headers.get("x-user-id");
  const { buyerEmail, buyerName, buyerPhone, identityType, identityDetails } = await request.json();
  const { listingId } = await params;

  console.log(listingId, "listingId");

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!buyerEmail || !buyerName || !buyerPhone || !identityType || !identityDetails) {
    return new Response("Missing buyer details", { status: 400 });
  }

  const listing = await getMarketplaceById(listingId);

  if (!listing.data) {
    return new Response("Listing not found", { status: 404 });
  }

  // Check if the ticket is still available (not sold)
  if (listing.data.ticket.status === "sold") {
    return new Response("Ticket has already been sold", { status: 400 });
  }

  console.log("sblm try catch");

  try {
    const purchaseId = `mp_${new Date().getTime()}_${listingId}`;

    // Update buyer details using the model function
    const updateResult = await updateMarketplaceBuyerDetails(listingId, {
      buyerEmail,
      buyerName,
      buyerPhone,
      identityType,
      identityDetails,
      paymentSessionId: null,
    });

    console.log(updateResult, "updateResult");

    if (updateResult.statusCode !== 200) {
      throw new Error(updateResult.message || "Failed to update buyer details");
    }

    const stripeSession = await createMarketplacePaymentSession(listing.data.ticket, listing.data.categoryName, userId, purchaseId, listing.data.seatNumber, "free", listing.data.price);

    if (stripeSession.statusCode !== 200 || !stripeSession.data) {
      throw new Error("Failed to create payment session");
    }

    await updateMarketplaceBuyerDetails(listingId, {
      buyerEmail: updateResult.data?.buyerEmail || null,
      buyerName: updateResult.data?.buyerName || null,
      buyerPhone: updateResult.data?.buyerPhone || null,
      identityType: updateResult.data?.identityType || null,
      identityDetails: updateResult.data?.identityNumber || null,
      paymentSessionId: stripeSession.data.sessionId,
    });

    return NextResponse.json(stripeSession);
  } catch (error) {
    console.error("Error processing marketplace purchase:", error);
    // Cleanup: Remove buyer details if payment session creation fails
    await updateMarketplaceBuyerDetails(listingId, {
      buyerEmail: null,
      buyerName: null,
      buyerPhone: null,
      identityType: null,
      identityDetails: null,
      paymentSessionId: null,
    });
    return new Response("Failed to process payment", { status: 500 });
  }
};

export const PUT = async (request: NextRequest, { params }: { params: Promise<{ listingId: string }> }) => {
  const { sessionId } = await request.json();
  const userId = request.headers.get("x-user-id");
  const { listingId } = await params;

  if (!userId || !sessionId) {
    return new Response("Unauthorized or missing session ID", { status: 401 });
  }

  const listing = await getMarketplaceById(listingId);

  if (!listing.data) {
    return new Response("Listing not found", { status: 404 });
  }

  try {
    if (!listing.data.buyerEmail || !listing.data.buyerName || !listing.data.buyerPhone || !listing.data.identityType || !listing.data.identityNumber) {
      return NextResponse.json<CustomResponse<unknown>>({ statusCode: 400, message: "Buyer data not found" }, { status: 400 });
    }

    // Update seller's ticket status
    const updateSeller = await updateTicketStatus(listing.data.user._id.toString(), listing.data.ticket._id.toString(), "sold", userId, listing.data.price);

    // Add ticket to buyer's account
    const updateBuyer = await addTicketToUser(userId, listing.data.ticket._id.toString(), listing.data.categoryName, listing.data.seatNumber, listing.data.price, {
      email: listing.data.buyerEmail,
      name: listing.data.buyerName,
      phone: listing.data.buyerPhone,
      identityType: listing.data.identityType,
      identityNumber: listing.data.identityNumber,
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
    console.error(error);
    return new Response("Transaction failed", { status: 500 });
  }
};

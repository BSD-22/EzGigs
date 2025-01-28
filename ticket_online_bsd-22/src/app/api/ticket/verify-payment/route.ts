import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSession } from "@/services/stripe";
import { updateTicketPurchaseStatus, getTicketById } from "@/db/models/ticket";
import { addTicketToUser } from "@/db/models/user";
import { getDb } from "@/db/config/mongo-connection";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, purchaseId } = await request.json();

    const verificationResult = await verifyPaymentSession(sessionId);

    if (verificationResult.statusCode === 200 && verificationResult.data) {
      const { status, metadata, payment_intent } = verificationResult.data as {
        status: string;
        payment_intent: string;
        metadata: {
          ticketId: string;
          categoryName: string;
          userId: string;
          seatNumber: string;
          purchaseId: string;
        };
      };

      if (status === "paid") {
        // Get purchase details to get buyer information
        const db = await getDb();
        const purchaseCollection = db.collection("TicketPurchase");
        const purchase = await purchaseCollection.findOne({ _id: ObjectId.createFromHexString(purchaseId) });

        if (!purchase) {
          return NextResponse.json({ message: "Purchase not found" }, { status: 404 });
        }

        // Update purchase status
        await updateTicketPurchaseStatus(purchaseId, "paid", payment_intent);

        // Get ticket details for price
        const ticket = await getTicketById(metadata.ticketId);
        const category = ticket.data?.seatCategories.find((cat) => cat.name === metadata.categoryName);

        if (ticket.data && category) {
          // Add ticket to user's owned tickets with buyer details
          await addTicketToUser(
            metadata.userId,
            metadata.ticketId,
            metadata.categoryName,
            purchase.seatNumber, // Use the seatNumber from purchase record
            category.price,
            {
              email: purchase.buyerEmail,
              name: purchase.buyerName,
              phone: purchase.buyerPhone,
              identityType: purchase.identityType,
              identityNumber: purchase.identityNumber,
            }
          );
        }

        return NextResponse.json({ message: "Payment verified and ticket added to user" });
      } else {
        await updateTicketPurchaseStatus(purchaseId, "failed");
        return NextResponse.json({ message: "Payment failed" }, { status: 400 });
      }
    }

    return NextResponse.json({ message: "Payment verification failed" }, { status: 400 });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

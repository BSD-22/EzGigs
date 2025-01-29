import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSession } from "@/services/stripe";
import { updateTicketPurchaseStatus } from "@/db/models/ticket";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, purchaseId } = await request.json();

    const verificationResult = await verifyPaymentSession(sessionId);

    if (verificationResult.statusCode === 200 && verificationResult.data) {
      const { status, metadata, payment_intent } = verificationResult.data as {
        status: string;
        payment_intent: { id: string };
        metadata: {
          ticketId: string;
          categoryName: string;
          userId: string;
          seatNumber: string;
          purchaseId: string;
        };
      };

      if (status === "paid" || status === "complete") {
        await updateTicketPurchaseStatus(purchaseId, "paid", payment_intent, { userId: metadata.userId });

        return NextResponse.json({
          statusCode: 200,
          message: "Payment verified and ticket added to user",
        });
      } else {
        await updateTicketPurchaseStatus(purchaseId, "failed");
        return NextResponse.json(
          {
            statusCode: 400,
            message: "Payment failed",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        statusCode: 400,
        message: "Payment verification failed",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSession } from "@/services/stripe";
import { updateTicketPurchaseStatus } from "@/db/models/ticket";
import { CustomResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, purchaseId } = await request.json();

    if (!sessionId || !purchaseId) {
      return NextResponse.json<CustomResponse<unknown>>(
        {
          statusCode: 400,
          message: "Missing required parameters",
        },
        { status: 400 }
      );
    }

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
          discountApplied: string;
        };
      };

      if (status === "paid" || status === "complete") {
        // Update ticket purchase status with payment details
        // Update the type for the options parameter
        await updateTicketPurchaseStatus(
          purchaseId,
          "paid",
          payment_intent,
          { userId: metadata.userId } // Remove discountApplied from here
        );

        return NextResponse.json<CustomResponse<unknown>>({
          statusCode: 200,
          message: "Payment verified and ticket added to user",
          data: {
            paymentStatus: status,
            discountApplied: metadata.discountApplied,
          },
        });
      } else {
        // Update status to failed if payment wasn't successful
        await updateTicketPurchaseStatus(purchaseId, "failed", undefined, { userId: metadata.userId });
        return NextResponse.json<CustomResponse<unknown>>(
          {
            statusCode: 400,
            message: "Payment failed",
            data: { paymentStatus: status },
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 400,
        message: "Payment verification failed",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

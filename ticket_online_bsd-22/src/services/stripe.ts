import Stripe from "stripe";
import { TicketModel } from "@/db/models/ticket";
import { CustomResponse } from "@/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

export type StripeResponse = {
  sessionId: string;
  url: string;
};

export const createPaymentSession = async (
  ticket: TicketModel,
  categoryName: string,
  userId: string,
  purchaseId: string,
  seatNumber: string // Add seatNumber parameter
): Promise<CustomResponse<StripeResponse>> => {
  try {
    const category = ticket.seatCategories.find((cat) => cat.name === categoryName);
    if (!category) {
      return {
        statusCode: 400,
        message: "Category not found",
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "idr",
            product_data: {
              name: `${ticket.name} - ${category.name}`,
              description: `Event at ${ticket.venue} on ${ticket.date} ${ticket.time}`,
              images: [ticket.image],
            },
            unit_amount: category.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/home/ticket?success=true&session_id={CHECKOUT_SESSION_ID}&purchase_id=${purchaseId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/home/ticket`,
      metadata: {
        ticketId: ticket._id.toString(),
        categoryName,
        userId,
        purchaseId,
        seatNumber, // Add seatNumber to metadata
      },
    });

    return {
      statusCode: 200,
      data: {
        sessionId: session.id,
        url: session.url || "",
      },
    };
  } catch (error) {
    console.error("Stripe Error:", error);
    return {
      statusCode: 500,
      message: "Failed to create payment session",
    };
  }
};

export const verifyPaymentSession = async (sessionId: string): Promise<CustomResponse<unknown>> => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return {
      statusCode: 200,
      data: {
        status: session.payment_status,
        metadata: session.metadata,
        amount_total: session.amount_total,
        payment_intent: session.payment_intent, // Add this line
      },
    };
  } catch (error) {
    console.error("Stripe Verification Error:", error);
    return {
      statusCode: 500,
      message: "Failed to verify payment",
    };
  }
};

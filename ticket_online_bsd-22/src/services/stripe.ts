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

export const createPaymentSession = async (ticket: TicketModel, userId: string): Promise<CustomResponse<StripeResponse>> => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "idr",
            product_data: {
              name: ticket.name,
              description: `Seat: ${ticket.seats} at ${ticket.venue}`,
              images: [ticket.image],
            },
            unit_amount: ticket.price * 10,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/home/ticket?success=true&session_id={CHECKOUT_SESSION_ID}&ticket_id={TICKET_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/home/ticket`,
      metadata: {
        ticketId: ticket._id.toString(),
        userId,
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

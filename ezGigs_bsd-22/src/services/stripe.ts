import Stripe from "stripe";
import { TicketModel } from "@/db/models/ticket";
import { CustomResponse } from "@/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-01-27.acacia",
});

export type StripeResponse = {
  sessionId: string;
  url: string;
};

type VerifyPaymentResponse = {
  status: string;
  metadata: {
    isMarketplace?: string;
    status?: string;
    ticketId: string;
    categoryName: string;
    userId: string;
    purchaseId: string;
    seatNumber: string;
    discountApplied: string;
  };
  amount_total: number;
  payment_intent: {
    id: string;
  };
};

export const createPaymentSession = async (
  ticket: TicketModel,
  categoryName: string,
  userId: string,
  purchaseId: string,
  seatNumber: string,
  subscriptionType: "free" | "premium" | "vip" = "free"
): Promise<CustomResponse<StripeResponse>> => {
  try {
    const category = ticket.seatCategories.find((cat) => cat.name === categoryName);
    if (!category) {
      return {
        statusCode: 400,
        message: "Category not found",
      };
    }

    let finalPrice = category.price;
    let discountPercentage = 0;

    if (subscriptionType === "premium") {
      discountPercentage = 5;
      finalPrice = category.price * 0.95;
    } else if (subscriptionType === "vip") {
      discountPercentage = 8;
      finalPrice = category.price * 0.92;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "idr",
            product_data: {
              name: `${ticket.name} - ${category.name}`,
              description: `Event at ${ticket.venue} on ${ticket.date} ${ticket.time}${discountPercentage > 0 ? ` (${discountPercentage}% Subscription Discount Applied)` : ""}`,
              images: [ticket.image],
            },
            unit_amount: Math.round(finalPrice * 100),
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
        seatNumber,
        discountApplied: discountPercentage.toString(),
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

export const createMarketplacePaymentSession = async (
  ticket: TicketModel,
  categoryName: string,
  userId: string,
  purchaseId: string,
  seatNumber: string,
  subscriptionType: "free" | "premium" | "vip" = "free",
  resalePrice: number
): Promise<CustomResponse<StripeResponse>> => {
  try {
    let finalPrice = resalePrice;
    let discountPercentage = 0;

    if (subscriptionType === "premium") {
      discountPercentage = 5;
      finalPrice = resalePrice * 0.95;
    } else if (subscriptionType === "vip") {
      discountPercentage = 8;
      finalPrice = resalePrice * 0.92;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "idr",
            product_data: {
              name: `${ticket.name} - ${categoryName} (Resale)`,
              description: `Event at ${ticket.venue} on ${ticket.date} ${ticket.time}${discountPercentage > 0 ? ` (${discountPercentage}% Subscription Discount Applied)` : ""}\nSeat: ${seatNumber}`,
              images: [ticket.image],
            },
            unit_amount: Math.round(finalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/home/marketplace?success=true&session_id={CHECKOUT_SESSION_ID}&purchase_id=${purchaseId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/home/marketplace`,
      metadata: {
        ticketId: ticket._id.toString(),
        categoryName,
        userId,
        purchaseId,
        seatNumber,
        discountApplied: discountPercentage.toString(),
        isMarketplace: "true",
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
      message: "Failed to create marketplace payment session",
    };
  }
};

export const verifyPaymentSession = async (sessionId: string): Promise<CustomResponse<VerifyPaymentResponse>> => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    return {
      statusCode: 200,
      data: {
        status: session.payment_status,
        metadata: session.metadata as VerifyPaymentResponse["metadata"],
        amount_total: session.amount_total || 0,
        payment_intent: session.payment_intent as VerifyPaymentResponse["payment_intent"],
      },
    };
  } catch (error) {
    console.error("Stripe Verification Error:", error);
    return {
      statusCode: 500,
      message: "Failed to verify payment session",
    };
  }
};

export const createSubscriptionPaymentSession = async (planName: string, userId: string): Promise<CustomResponse<StripeResponse>> => {
  try {
    const prices = {
      Silver: 149999,
      Gold: 249999,
    };

    const price = prices[planName as keyof typeof prices];
    if (!price) {
      return {
        statusCode: 400,
        message: "Invalid subscription plan",
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "idr",
            product_data: {
              name: `${planName} Subscription`,
              description: `${planName} membership subscription`,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/home/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/home/subscription`,
      metadata: {
        userId,
        subscriptionType: planName.toLowerCase(),
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
      message: "Failed to create subscription payment session",
    };
  }
};

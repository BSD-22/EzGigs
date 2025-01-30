import { NextRequest, NextResponse } from "next/server";
import { CustomResponse } from "@/types";
import Stripe from "stripe";
import { updateUserSubscription } from "@/db/models/user";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

export const POST = async (req: NextRequest) => {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json<CustomResponse<unknown>>(
        {
          statusCode: 400,
          message: "Session ID is required",
        },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json<CustomResponse<unknown>>(
        {
          statusCode: 404,
          message: "Session not found",
        },
        { status: 404 }
      );
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json<CustomResponse<unknown>>(
        {
          statusCode: 400,
          message: "Payment not completed",
        },
        { status: 400 }
      );
    }

    const subscriptionMap = {
      silver: "premium",
      gold: "vip",
    } as const;

    const userId = session.metadata?.userId;
    const planName = session.metadata?.subscriptionType?.toLowerCase();

    if (!userId || !planName) {
      return NextResponse.json<CustomResponse<unknown>>(
        {
          statusCode: 400,
          message: "Invalid metadata",
        },
        { status: 400 }
      );
    }

    const subscriptionType = subscriptionMap[planName as keyof typeof subscriptionMap];

    if (!subscriptionType) {
      return NextResponse.json<CustomResponse<unknown>>(
        {
          statusCode: 400,
          message: "Invalid subscription type",
        },
        { status: 400 }
      );
    }

    const result = await updateUserSubscription(userId, subscriptionType);

    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 200,
        message: "Subscription updated successfully",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Subscription verification error:", error);
    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
};

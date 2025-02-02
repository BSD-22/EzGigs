import { NextRequest, NextResponse } from "next/server";
import { CustomResponse } from "@/types";
import { createSubscriptionPaymentSession } from "@/services/stripe";

export const POST = async (req: NextRequest) => {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json<CustomResponse<unknown>>(
        {
          statusCode: 401,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { planName } = await req.json();

    const result = await createSubscriptionPaymentSession(planName, userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to create subscription:", error);
    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
};

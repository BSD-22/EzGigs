import { NextRequest, NextResponse } from "next/server";
import { CustomResponse } from "@/types";

export const POST = async (req: NextRequest) => {
  const email = req.headers.get("x-user-email");

  if (!email) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const settings = await req.json();

    // Here you would typically save the settings to your database
    // For now, we'll just return success

    return NextResponse.json<CustomResponse<unknown>>({
      statusCode: 200,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Settings Error:", error);
    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
};

export const GET = async (req: NextRequest) => {
  const email = req.headers.get("x-user-email");

  if (!email) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Here you would typically fetch the settings from your database
    // For now, we'll return default settings

    return NextResponse.json<CustomResponse<unknown>>({
      statusCode: 200,
      data: {
        notifications: {
          email: true,
          sales: true,
          priceAlerts: true,
          marketUpdates: false,
        },
        display: {
          currency: "IDR",
          theme: "dark",
          language: "en",
        },
        pricing: {
          autoAdjust: false,
          minPriceMargin: 10,
          maxPriceMargin: 50,
        },
      },
    });
  } catch (error) {
    console.error("Settings Error:", error);
    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
};

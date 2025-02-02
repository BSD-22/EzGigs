import { NextRequest, NextResponse } from "next/server";
import { CustomResponse } from "@/types";
import { getUserTickets } from "@/db/models/user";
import { analyzeDashboardData } from "@/services/gemini";

export const GET = async (req: NextRequest) => {
  const email = req.headers.get("x-user-email");

  if (!email) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const userData = await getUserTickets(email);

    if (!userData.data) {
      return NextResponse.json<CustomResponse<unknown>>({
        statusCode: 404,
        message: "User not found",
      });
    }

    const dashboardStats = await analyzeDashboardData(userData.data);

    // console.log(dashboardStats, "dashboardstats");

    return NextResponse.json<CustomResponse<unknown>>({
      statusCode: 200,
      data: dashboardStats,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
};

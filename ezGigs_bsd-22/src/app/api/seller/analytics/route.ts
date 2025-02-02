import { NextRequest, NextResponse } from "next/server";
import { CustomResponse } from "@/types";
import { analyzeDashboardData } from "@/services/gemini";
import { getUserTickets } from "@/db/models/user";

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

    const analysis = await analyzeDashboardData(userData.data);

    // Process revenue by month from actual sold tickets
    const monthlyRevenue = new Map<string, number>();
    userData.data.soldTickets.forEach((ticket) => {
      const date = new Date(ticket.soldDate);
      const monthKey = date.toLocaleString("default", { month: "short" });
      monthlyRevenue.set(monthKey, (monthlyRevenue.get(monthKey) || 0) + ticket.soldPrice);
    });

    // Get last 6 months
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toLocaleString("default", { month: "short" });
    }).reverse();

    const revenueByMonth = months.map((month) => ({
      month,
      revenue: monthlyRevenue.get(month) || 0,
    }));

    // Process top performing events
    const eventPerformance = new Map<string, { revenue: number; soldCount: number }>();
    userData.data.soldTickets.forEach((ticket) => {
      const current = eventPerformance.get(ticket.categoryName) || { revenue: 0, soldCount: 0 };
      eventPerformance.set(ticket.categoryName, {
        revenue: current.revenue + ticket.soldPrice,
        soldCount: current.soldCount + 1,
      });
    });

    const topPerformingEvents = Array.from(eventPerformance.entries())
      .map(([name, stats]) => ({
        name,
        revenue: stats.revenue,
        soldCount: stats.soldCount,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    // Process sales by category
    const categorySales = new Map<string, { count: number; revenue: number }>();
    userData.data.soldTickets.forEach((ticket) => {
      const current = categorySales.get(ticket.categoryName) || { count: 0, revenue: 0 };
      categorySales.set(ticket.categoryName, {
        count: current.count + 1,
        revenue: current.revenue + ticket.soldPrice,
      });
    });

    const salesByCategory = Array.from(categorySales.entries()).map(([category, stats]) => ({
      category,
      count: stats.count,
      revenue: stats.revenue,
    }));

    return NextResponse.json<CustomResponse<unknown>>({
      statusCode: 200,
      data: {
        revenueByMonth,
        topPerformingEvents,
        salesByCategory,
        predictions: {
          nextMonthRevenue: analysis.revenue * (1 + analysis.revenueGrowth),
          growthTrend: analysis.revenueGrowth > 0 ? "up" : analysis.revenueGrowth < 0 ? "down" : "stable",
          confidence: Math.round(analysis.successRate * 100),
        },
        insights: [
          `Your success rate is ${(analysis.successRate * 100).toFixed(1)}%`,
          `Revenue growth is ${(analysis.revenueGrowth * 100).toFixed(1)}%`,
          // `You have ${analysis.activeListings} active listings`,
        ],
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
};

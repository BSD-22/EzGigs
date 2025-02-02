import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserTicketsResponse } from "@/db/models/user";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

type DashboardStats = {
  totalTickets: number;
  ticketsSold: number;
  revenue: number;
  averagePrice: number;
  revenueGrowth: number;
  successRate: number;
  recentActivities: {
    type: "sale";
    ticketId: string;
    eventName: string;
    price: number;
    date: Date;
  }[];
};

type TicketAnalysis = {
  demand: "High" | "Medium" | "Low";
  recommendedPrice: number;
  insights: string[];
};

type TicketData = {
  categoryName: string;
  purchasePrice: number;
  status: string;
  soldDate: Date;
};

export const analyzeTicket = async (ticketData: TicketData): Promise<TicketAnalysis> => {
  try {
    const prompt = `
      Analyze this ticket data and provide insights:
      Category: ${ticketData.categoryName}
      Purchase Price: ${ticketData.purchasePrice}
      Status: ${ticketData.status}
      Purchase Date: ${ticketData.soldDate}

      Provide analysis in JSON format with these fields:
      1. demand: "High", "Medium", or "Low"
      2. recommendedPrice: number (suggested selling price)
      3. insights: array of strings (2-3 key insights)

      Example format:
      {
        "demand": "High",
        "recommendedPrice": 150000,
        "insights": [
          "Premium category with strong demand",
          "Price could be increased by 20%"
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();
    return JSON.parse(aiResponse.substring(aiResponse.indexOf("{"), aiResponse.lastIndexOf("}") + 1));
  } catch (error) {
    console.error("Ticket Analysis Error:", error);
    return {
      demand: "Medium",
      recommendedPrice: ticketData.purchasePrice,
      insights: ["Unable to analyze ticket data"],
    };
  }
};

export const analyzeDashboardData = async (userData: UserTicketsResponse): Promise<DashboardStats> => {
  try {
    const data = {
      soldTickets: userData.soldTickets.length,
      totalRevenue: userData.soldTickets.reduce((sum, ticket) => sum + ticket.soldPrice, 0),
      averagePrice: userData.soldTickets.reduce((sum, ticket) => sum + ticket.soldPrice, 0) / (userData.soldTickets.length || 1),
      lastMonthSales: userData.soldTickets.filter((ticket) => {
        const soldDate = new Date(ticket.soldDate);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return soldDate >= lastMonth;
      }),
    };

    const prompt = `
      Analyze this seller's ticket sales performance:
      Total Tickets Sold: ${data.soldTickets}
      Total Revenue: ${data.totalRevenue}
      Average Selling Price: ${data.averagePrice}
      Recent Sales: ${JSON.stringify(data.lastMonthSales)}

      Provide analysis in JSON format with these exact numeric values:
      1. successRate: number between 0-100
      2. revenueGrowth: number (percentage change)

      Example format:
      {
        "successRate": 85,
        "revenueGrowth": 12.5
      }

      Focus on realistic metrics based on the provided data.
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();
    const aiStats = JSON.parse(aiResponse.substring(aiResponse.indexOf("{"), aiResponse.lastIndexOf("}") + 1));

    console.log(userData, "userdata");

    // console.log(userData.soldTickets, "userdata.soldtickets");

    const recentActivities = userData.soldTickets
      .sort((a, b) => new Date(b.soldDate).getTime() - new Date(a.soldDate).getTime())
      .slice(0, 3)
      .map((ticket) => ({
        type: "sale" as const,
        ticketId: ticket.ticketId.toString(),
        eventName: ticket.Event?.name || "Unknown Event", // Ensure Event is populated
        price: ticket.soldPrice,
        date: new Date(ticket.soldDate),
      }));

    return {
      totalTickets: userData.ownedTickets.length + userData.soldTickets.length,
      ticketsSold: data.soldTickets,
      revenue: data.totalRevenue,
      averagePrice: data.averagePrice,
      revenueGrowth: typeof aiStats.revenueGrowth === "number" ? Math.round(aiStats.revenueGrowth) : 0,
      successRate: typeof aiStats.successRate === "number" ? Math.round(aiStats.successRate) : 0,
      recentActivities,
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      totalTickets: userData.soldTickets.length,
      ticketsSold: userData.soldTickets.length,
      revenue: userData.soldTickets.reduce((sum, ticket) => sum + ticket.soldPrice, 0),
      averagePrice: 0,
      revenueGrowth: 0,
      successRate: 0,
      recentActivities: [],
    };
  }
};

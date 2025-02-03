import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { baseUrl } from "@/constants/baseUrl";
import cron from "node-cron";
import { TicketModel } from "@/db/models/ticket";

const isWithinOneWeek = (eventDate: Date): boolean => {
  const now = new Date();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const timeDiff = eventDate.getTime() - now.getTime();
  return timeDiff <= oneWeek && timeDiff > 0;
};

const checkUpcomingEvents = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const response = await fetch(`${baseUrl}/api/ticket`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token?.value}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tickets");
    }

    const data = await response.json();
    return data.data.filter((ticket: TicketModel) => isWithinOneWeek(new Date(ticket.date)));
  } catch (error) {
    console.error("Error checking upcoming events:", error);
    return [];
  }
};

// Initialize cron jobs when the server starts
const morningJob = cron.schedule("0 9 * * *", checkUpcomingEvents);
const eveningJob = cron.schedule("0 17 * * *", checkUpcomingEvents);

export async function GET() {
  try {
    const upcomingEvents = await checkUpcomingEvents();

    return NextResponse.json({
      message: "Notifications checked successfully",
      upcomingEvents,
    });
  } catch (error) {
    console.log(error, "rounde handler notifications");

    return NextResponse.json({ error: "Failed to check notifications" }, { status: 500 });
  }
}

// Clean up cron jobs when server shuts down
process.on("SIGTERM", () => {
  morningJob.stop();
  eveningJob.stop();
});

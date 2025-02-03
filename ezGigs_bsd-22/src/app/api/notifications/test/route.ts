import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { baseUrl } from "@/constants/baseUrl";
import { TicketModel } from "@/db/models/ticket";

export async function GET(request: Request) {
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
    const now = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    const upcomingEvents = data.data.filter((ticket: TicketModel) => {
      const eventDate = new Date(ticket.date);
      const timeDiff = eventDate.getTime() - now.getTime();
      return timeDiff <= oneWeek && timeDiff > 0;
    });

    // Send SSE headers for real-time notifications
    if (request.headers.get("accept") === "text/event-stream") {
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();
      const encoder = new TextEncoder();

      // Send each upcoming event as a notification
      for (const ticket of upcomingEvents) {
        const notification = {
          title: "Upcoming Event Reminder! 🎫",
          body: `${ticket.name} is starting in less than a week!\nDate: ${new Date(ticket.date).toLocaleDateString()}\nTime: ${ticket.time}\nVenue: ${ticket.venue}`,
          icon: ticket.image,
          tag: `event-reminder-${ticket._id}`,
        };

        await writer.write(encoder.encode(`data: ${JSON.stringify(notification)}\n\n`));
      }

      writer.close();

      return new Response(stream.readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    return NextResponse.json({
      message: "Test notifications checked successfully",
      upcomingEvents,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.log(error, "di test api notifications");
    return NextResponse.json({ error: "Failed to check notifications" }, { status: 500 });
  }
}

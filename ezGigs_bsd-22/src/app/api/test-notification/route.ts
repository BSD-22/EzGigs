import { checkAndSendReminders } from "@/services/notification";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    await checkAndSendReminders(force);
    return NextResponse.json({ message: "Notifications processed successfully" });
  } catch (error) {
    console.error("Test notification error:", error);
    return NextResponse.json({ error: "Failed to process notifications" }, { status: 500 });
  }
};

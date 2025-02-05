import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/db/models/user";
import { updateUserChatList } from "@/db/models/chat";

export const POST = async (req: NextRequest) => {
  try {
    const { chatId } = await req.json();
    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json({ statusCode: 401, message: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByEmail(userEmail);
    if (!user.data) {
      return NextResponse.json({ statusCode: 404, message: "User not found" }, { status: 404 });
    }

    // Remove from hiddenChats array
    await updateUserChatList(user.data._id.toString(), chatId);

    return NextResponse.json({ statusCode: 200, message: "Chat removed from user history" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ statusCode: 500, message: "Internal server error" }, { status: 500 });
  }
};

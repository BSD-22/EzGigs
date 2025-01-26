import { getUserTickets, updateTicketStatus, UserModel } from "@/db/models/user";
import { CustomResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const email = request.headers.get("x-user-email");

  if (!email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const usersTicket = await getUserTickets(email);

  return NextResponse.json<CustomResponse<UserModel>>({
    statusCode: 200,
    data: usersTicket.data,
  });
};

export const POST = async (request: NextRequest) => {
  const userId = request.headers.get("x-user-id");
  const { ticketId } = await request.json();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await updateTicketStatus(userId, ticketId, "selling");

  return NextResponse.json(result);
};

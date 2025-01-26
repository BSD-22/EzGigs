import { getAllTickets, TicketModel } from "@/db/models/ticket";
import { CustomResponse } from "@/types";
import { NextResponse } from "next/server";

export const GET = async () => {
  const tickets = await getAllTickets();

  console.log(tickets, "di api ticket");

  const response: CustomResponse<TicketModel[]> = {
    statusCode: 200,
    data: tickets.data,
  };

  return NextResponse.json(response);
};

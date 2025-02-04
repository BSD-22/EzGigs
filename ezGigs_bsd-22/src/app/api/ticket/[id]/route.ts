import { NextRequest, NextResponse } from "next/server";
import { getTicketById, updateTicket } from "@/db/models/ticket";
import { CustomResponse } from "@/types";

export const GET = async (_: never, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const result = await getTicketById(id);

    return NextResponse.json<CustomResponse<unknown>>(result);
  } catch (error) {
    console.error("Failed to fetch ticket:", error);
    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
};

export const PUT = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const updateData = await req.json();
    const { id } = await params;

    const result = await updateTicket(id, updateData);
    return NextResponse.json<CustomResponse<unknown>>(result);
  } catch (error) {
    console.error("Update Ticket Error:", error);
    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
};

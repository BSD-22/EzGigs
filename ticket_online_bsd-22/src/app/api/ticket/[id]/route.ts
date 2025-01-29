import { NextRequest, NextResponse } from "next/server";
import { getTicketById } from "@/db/models/ticket";
import { CustomResponse } from "@/types";

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
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

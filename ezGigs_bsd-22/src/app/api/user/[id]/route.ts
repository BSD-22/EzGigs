import { getUserById } from "@/db/models/user";
import { CustomResponse } from "@/types";
import { NextResponse } from "next/server";

export const GET = async (_: never, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    const user = await getUserById(id as string);
    if (!user) {
      throw new Error("User not found");
    }

    return NextResponse.json<CustomResponse<unknown>>({
      statusCode: 200,
      data: user,
    });
  } catch (err) {
    console.error(err);

    if ((err as Error).message === "User not found") {
      return NextResponse.json<CustomResponse<unknown>>({
        statusCode: 404,
        message: (err as Error).message,
      });
    }

    return NextResponse.json<CustomResponse<unknown>>({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

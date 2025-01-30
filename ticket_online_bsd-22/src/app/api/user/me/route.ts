import { NextRequest, NextResponse } from "next/server";
import { CustomResponse } from "@/types";
import { getUserByEmail } from "@/db/models/user";

export const GET = async (req: NextRequest) => {
  console.log(req, "req");
  try {
    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json<CustomResponse<unknown>>(
        {
          statusCode: 401,
          message: "Unauthorized: No user email found",
        },
        { status: 401 }
      );
    }

    const foundUser = await getUserByEmail(userEmail);

    if (!foundUser.data) {
      return NextResponse.json<CustomResponse<unknown>>(
        {
          statusCode: 404,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 200,
        data: {
          _id: foundUser.data._id,
          email: foundUser.data.email,
          name: foundUser.data.name,
          role: foundUser.data.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
};

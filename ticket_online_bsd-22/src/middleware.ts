import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CustomResponse, JosePayload } from "./types";
import { verifyToken } from "./utils/jose";

export const middleware = async (request: NextRequest) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token || token.value.length <= 0) {
    console.log("Malah masuk ke sini");
    return NextResponse.json<CustomResponse<unknown>>(
      {
        statusCode: 401,
        message: "Unauthorized: Please login first",
      },
      { status: 401 }
    );
  }

  const payload = await verifyToken<JosePayload>(token.value);

  if (request.nextUrl.pathname.startsWith("/seller") && payload.role !== "seller") {
    return NextResponse.redirect(new URL("/home/ticket", request.url));
  }

  const headers = new Headers(request.headers);
  headers.set("x-user-id", payload.id);
  headers.set("x-user-email", payload.email);
  headers.set("x-user-name", payload.name);
  headers.set("x-user-role", payload.role);

  return NextResponse.next({ headers });
};

// Add matcher config
export const config = {
  matcher: ["/home/:path*", "/api/:path*", "/seller/:path*"],
};

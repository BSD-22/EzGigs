import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CustomResponse, JosePayload } from "./types";
import { verifyToken } from "./utils/jose";

export const middleware = async (request: NextRequest) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const isProtectedRoute = request.nextUrl.pathname.startsWith("/home") || request.nextUrl.pathname.startsWith("/api/ticket") || request.nextUrl.pathname.startsWith("/seller");

  if (isProtectedRoute && (!token || token.value.length <= 0)) {
    if (request.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json<CustomResponse<unknown>>(
        {
          statusCode: 401,
          message: "Unauthorized: Please login first",
        },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login?error=Please%20login%20first", request.url));
  }

  const payload = await verifyToken<JosePayload>(token?.value as string);

  if (request.nextUrl.pathname.startsWith("/seller") && payload.role !== "seller") {
    return NextResponse.redirect(new URL("/home/ticket", request.url));
  }

  const headers = new Headers(request.headers);
  headers.set("x-user-id", payload.id);
  headers.set("x-user-email", payload.email);
  headers.set("x-user-name", payload.name);
  headers.set("x-user-role", payload.role);
  headers.set("x-user-subscriptionType", payload.subscriptionType);

  return NextResponse.next({ headers });
};

export const config = {
  matcher: [
    "/home/:path*",
    "/api/:path*",
    "/seller/:path*",
    // Add any other protected routes here
  ],
};

import { SignJWT, jwtVerify, decodeJwt } from "jose";
import { JosePayload } from "@/types";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function signToken(payload: JosePayload, options: { expiresIn?: string } = {}) {
  try {
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(options.expiresIn || "24h")
      .sign(JWT_SECRET);

    return jwt;
  } catch (error) {
    console.log(error);

    throw new Error("Failed to sign token");
  }
}

export async function verifyToken<T>(token: string) {
  try {
    const { payload } = await jwtVerify<T>(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.log(error);

    throw new Error("Invalid token");
  }
}

export function decodeToken<T>(token: string) {
  try {
    const payload = decodeJwt<T>(token);
    return payload;
  } catch (error) {
    console.log(error);
    throw new Error("Invalid token");
  }
}

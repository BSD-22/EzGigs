import { cookies } from "next/headers";
import { verifyToken } from "@/utils/jose";
import { JosePayload } from "@/types";

export async function getUserData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return null;
  }

  const payload = await verifyToken<JosePayload>(token.value);
  return payload;
}
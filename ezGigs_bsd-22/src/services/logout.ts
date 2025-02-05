"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const actionLogoutHandler = async () => {
  const funCookie = await cookies();
  funCookie.delete("token");
  redirect("/");
};

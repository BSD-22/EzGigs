"use server";

import { getUserByEmail } from "@/db/models/user";
import { ActionResponse, JosePayload } from "@/types";
import { compareText } from "@/utils/bcrypt";
import { signToken } from "@/utils/jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email({
    message: "Invalid email format",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const actionLoginHandler = async (_prevState: unknown, formData: FormData): Promise<ActionResponse<LoginInput>> => {
  const email = formData.get("email");
  const password = formData.get("password");

  const rawData: LoginInput = {
    email: email as string,
    password: password as string,
  };

  const parsedData = loginSchema.safeParse({ email, password });

  if (!parsedData.success) {
    return {
      success: false,
      message: "Email must be valid and password must be at least 6 characters",
      input: rawData,
    };
  }

  const foundUser = await getUserByEmail(parsedData.data.email);

  if (!foundUser.data || !compareText(parsedData.data.password, foundUser.data.password)) {
    return {
      success: false,
      message: "Invalid email or password",
    };
  }

  const payload: JosePayload = {
    id: foundUser.data._id.toString(),
    email: foundUser.data.email,
    name: foundUser.data.name,
  };

  const token = await signToken(payload);

  const cookieStore = await cookies();
  cookieStore.set("token", token);

  return redirect("/home/ticket");
};

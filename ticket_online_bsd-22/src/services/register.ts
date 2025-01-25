"use server";

import { createUser, getUserByEmail } from "@/db/models/user";
import { ActionResponse } from "@/types";
import { redirect } from "next/navigation";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters",
  }),
  email: z.string().email({
    message: "Invalid email format",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

type RegisterInput = z.infer<typeof registerSchema>;

export const actionRegisterHandler = async (_prevState: unknown, formData: FormData): Promise<ActionResponse<RegisterInput>> => {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  const rawData: RegisterInput = {
    name: name as string,
    email: email as string,
    password: password as string,
  };

  const parsedData = registerSchema.safeParse({ name, email, password });

  if (!parsedData.success) {
    return {
      success: false,
      message: "Invalid registration data",
      error: parsedData.error.flatten().fieldErrors,
      input: rawData,
    };
  }

  const existingUser = await getUserByEmail(parsedData.data.email);
  if (existingUser.data) {
    return {
      success: false,
      message: "Email already registered",
    };
  }

  const newUser = await createUser(parsedData.data.email, parsedData.data.name, parsedData.data.password);

  if (!newUser.data) {
    return {
      success: false,
      message: "Failed to create user",
    };
  }

  return redirect("/login");
};

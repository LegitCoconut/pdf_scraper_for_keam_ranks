
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const AUTH_COOKIE_NAME = "auth-token";

export async function login(password: string) {
  const correctPassword = process.env.APP_PASSWORD;

  if (!correctPassword) {
    console.error("APP_PASSWORD is not set in .env file");
    return { error: "Server configuration error. Please contact support." };
  }

  if (password === correctPassword) {
    const cookieStore = cookies();
    cookieStore.set(AUTH_COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    // No explicit redirect here, client-side will handle it on success
    return { success: true };
  } else {
    return { error: "Invalid password." };
  }
}

export async function logout() {
  const cookieStore = cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  redirect("/login");
}

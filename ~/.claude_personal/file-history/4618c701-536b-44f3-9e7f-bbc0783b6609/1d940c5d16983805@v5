"use server";

import { redirect } from "next/navigation";
import { isValidEmail, isValidPassword } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error: string | null;
  message: string | null;
};

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Invalid form submission.", message: null };
  }

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address.", message: null };
  }

  if (!isValidPassword(password)) {
    return { error: "Password must be at least 8 characters.", message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message, message: null };
  }

  redirect("/periods?toast=login");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?toast=logout");
}

export async function signup(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return { error: "Invalid form submission.", message: null };
  }

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address.", message: null };
  }

  if (!isValidPassword(password)) {
    return { error: "Password must be at least 8 characters.", message: null };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match.", message: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message, message: null };
  }

  // No session means the project requires email confirmation before login.
  if (!data.session) {
    return {
      error: null,
      message: "Check your email to confirm your account before logging in.",
    };
  }

  redirect("/periods?toast=signup");
}

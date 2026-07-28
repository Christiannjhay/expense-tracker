"use server";

import { createClient } from "@/lib/supabase/server";

export type CategoryFormState = {
  error: string | null;
  success?: boolean;
};

export async function createCategory(
  context: "general" | "trip",
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const name = formData.get("name");
  if (typeof name !== "string" || name.trim().length === 0) {
    return { error: "Name is required." };
  }

  const { error } = await supabase.from("categories").insert({
    name: name.trim(),
    context,
    user_id: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You already have a category with that name." };
    }
    return { error: error.message };
  }

  return { error: null, success: true };
}

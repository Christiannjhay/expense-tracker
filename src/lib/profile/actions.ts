"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CURRENCIES } from "@/lib/currency";

export type ProfileFormState = {
  error: string | null;
  success: boolean;
};

export async function updateDisplayName(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", success: false };
  }

  const displayName = formData.get("display_name");
  if (typeof displayName !== "string") {
    return { error: "Invalid form submission.", success: false };
  }

  const trimmed = displayName.trim();

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: trimmed.length > 0 ? trimmed : null })
    .eq("id", user.id);

  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath("/", "layout");
  return { error: null, success: true };
}

export async function updateCurrency(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in.", success: false };
  }

  const currency = formData.get("currency");
  if (
    typeof currency !== "string" ||
    !CURRENCIES.some((c) => c.code === currency)
  ) {
    return { error: "Choose a valid currency.", success: false };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ currency })
    .eq("id", user.id);

  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath("/", "layout");
  return { error: null, success: true };
}

import { createClient } from "@/lib/supabase/server";

export type Profile = {
  full_name: string | null;
  currency: string;
};

export async function getProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<Profile> {
  const { data } = await supabase
    .from("profiles")
    .select("full_name, currency")
    .eq("id", userId)
    .maybeSingle();

  return {
    full_name: data?.full_name ?? null,
    currency: data?.currency ?? "USD",
  };
}

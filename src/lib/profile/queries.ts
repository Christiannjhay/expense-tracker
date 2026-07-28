import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  full_name: string | null;
  currency: string;
};

// Same rationale as getAuthedUser: Nav plus the current page both need
// the profile on every navigation, so this is memoized per-request.
export const getProfile = cache(async (userId: string): Promise<Profile> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name, currency")
    .eq("id", userId)
    .maybeSingle();

  return {
    full_name: data?.full_name ?? null,
    currency: data?.currency ?? "USD",
  };
});

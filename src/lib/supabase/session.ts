import { cache } from "react";
import { createClient } from "./server";

// Nav (in the root layout) and every page independently need the
// current user. Without this, a single navigation triggers a fresh
// network round trip to Supabase Auth for each of them. React's cache()
// memoizes per-request, so only the first call actually hits the network.
export const getAuthedUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile/queries";
import { ProfileMenu } from "./profile-menu";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  if (user) {
    const profile = await getProfile(supabase, user.id);
    displayName = profile.full_name || user.email || null;
  }

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Expense Tracker
        </Link>

        {user && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">
              {displayName}
            </span>
            <ProfileMenu />
          </div>
        )}
      </div>
    </header>
  );
}

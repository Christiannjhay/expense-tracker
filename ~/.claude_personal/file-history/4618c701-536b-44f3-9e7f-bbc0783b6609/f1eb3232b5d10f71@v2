import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile/queries";
import { BackLink } from "@/app/back-link";
import { AccountForm } from "./account-form";

export const metadata: Metadata = {
  title: "Account — Expense Tracker",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await getProfile(supabase, user.id);

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10">
      <BackLink href="/periods" />

      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Account
      </h1>

      <AccountForm initialDisplayName={profile.full_name ?? ""} />
    </main>
  );
}

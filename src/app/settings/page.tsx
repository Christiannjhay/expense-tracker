import type { Metadata } from "next";
import { getAuthedUser } from "@/lib/supabase/session";
import { getProfile } from "@/lib/profile/queries";
import { BackLink } from "@/app/back-link";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Settings — Expense Tracker",
};

export default async function SettingsPage() {
  const user = await getAuthedUser();

  if (!user) {
    return null;
  }

  const profile = await getProfile(user.id);

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10">
      <BackLink href="/periods" />

      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Settings
      </h1>

      <SettingsForm initialCurrency={profile.currency} />
    </main>
  );
}

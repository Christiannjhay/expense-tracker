import type { Metadata } from "next";
import { getAuthedUser } from "@/lib/supabase/session";
import { BackLink } from "@/app/back-link";
import { BanknotesIcon } from "@/app/icons";

export const metadata: Metadata = {
  title: "Debt Tracker — Expense Tracker",
};

export default async function DebtTrackerPage() {
  const user = await getAuthedUser();

  if (!user) {
    return null;
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <BackLink href="/target" />

      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Debt Tracker
      </h1>

      <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
          <BanknotesIcon className="h-6 w-6" />
        </span>
        <p className="font-semibold text-zinc-900 dark:text-zinc-50">
          Coming soon
        </p>
        <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          Track balances and pay-down progress here once this section is
          built out.
        </p>
      </div>
    </main>
  );
}

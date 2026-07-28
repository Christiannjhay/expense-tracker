import type { Metadata } from "next";
import { BackLink } from "@/app/back-link";
import { createPeriod } from "@/lib/periods/actions";
import { PeriodForm } from "@/app/periods/period-form";

export const metadata: Metadata = {
  title: "New period — Expense Tracker",
};

export default function NewPeriodPage() {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10">
      <BackLink href="/periods" />

      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        New period
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Track a month of spending or a trip budget.
      </p>

      <PeriodForm action={createPeriod} />
    </main>
  );
}

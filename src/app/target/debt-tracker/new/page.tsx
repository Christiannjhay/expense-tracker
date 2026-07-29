import type { Metadata } from "next";
import { BackLink } from "@/app/back-link";
import { createDebt } from "@/lib/debts/actions";
import { DebtForm } from "@/app/target/debt-tracker/debt-form";

export const metadata: Metadata = {
  title: "New debt — Expense Tracker",
};

export default function NewDebtPage() {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10">
      <BackLink href="/target/debt-tracker" />

      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        New debt
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Track a balance and log payments toward it.
      </p>

      <DebtForm action={createDebt} />
    </main>
  );
}

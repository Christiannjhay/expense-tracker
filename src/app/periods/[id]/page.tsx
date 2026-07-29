import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/supabase/session";
import { getProfile } from "@/lib/profile/queries";
import { formatBudget, formatPeriodRange } from "@/lib/periods/format";
import { formatMoney } from "@/lib/currency";
import type { Period } from "@/lib/periods/types";
import type { ExpenseWithCategory } from "@/lib/expenses/types";
import { aggregateByCategory } from "@/lib/expenses/aggregate";
import { BackLink } from "@/app/back-link";
import { ChartBarIcon, PlusIcon } from "@/app/icons";
import { SpendingByCategory } from "@/app/periods/spending-by-category";
import { PeriodEditModal } from "./period-edit-modal";
import { ExpenseCard, ExpenseTableRow } from "./expense-item";

export const metadata: Metadata = {
  title: "Period — Expense Tracker",
};

export default async function PeriodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // getAuthedUser() doesn't gate the period/expenses queries — RLS
  // already scopes them via the request's cookies — so it runs
  // alongside them instead of blocking them first.
  const [user, { data: period }, { data: expenses }] = await Promise.all([
    getAuthedUser(),
    supabase.from("periods").select("*").eq("id", id).maybeSingle<Period>(),
    supabase
      .from("expenses")
      .select("id, category_id, amount, description, spent_at, categories(name)")
      .eq("period_id", id)
      .order("spent_at", { ascending: false })
      .returns<ExpenseWithCategory[]>(),
  ]);

  if (!user) {
    return null;
  }

  if (!period) {
    notFound();
  }

  const profile = await getProfile(user.id);

  const context = period.type === "trip" ? "trip" : "general";
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("context", context)
    .order("name");

  const categorySlices = aggregateByCategory(expenses ?? []);
  const totalSpent = (expenses ?? []).reduce((sum, e) => sum + e.amount, 0);
  const balance =
    period.total_budget != null ? period.total_budget - totalSpent : null;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <BackLink href="/periods" />

      <div className="mt-4 flex min-w-0 items-center gap-1">
        <h1 className="truncate text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {period.name}
        </h1>
        <PeriodEditModal
          periodId={period.id}
          periodName={period.name}
          defaults={{
            name: period.name,
            type: period.type,
            year: period.year,
            month: period.month,
            start_date: period.start_date,
            end_date: period.end_date,
            total_budget: period.total_budget,
          }}
        />
      </div>

      <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          <ChartBarIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          Spending by category
        </h2>

        <dl
          className={`mt-3 grid gap-4 text-sm ${
            balance != null ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"
          }`}
        >
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Type</dt>
            <dd className="capitalize text-zinc-900 dark:text-zinc-50">
              {period.type}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">When</dt>
            <dd className="text-zinc-900 dark:text-zinc-50">
              {formatPeriodRange(period)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Budget</dt>
            <dd className="text-zinc-900 dark:text-zinc-50">
              {formatBudget(period.total_budget, profile.currency)}
            </dd>
          </div>
          {balance != null && (
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Balance</dt>
              <dd
                className={
                  balance < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-zinc-900 dark:text-zinc-50"
                }
              >
                {formatMoney(balance, profile.currency)}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <SpendingByCategory
            slices={categorySlices}
            currency={profile.currency}
          />
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Expenses
        </h2>
        <Link
          href={`/periods/${period.id}/expenses/new`}
          className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:w-auto"
        >
          <PlusIcon />
          Add expense
        </Link>
      </div>

      {(!expenses || expenses.length === 0) && (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          No expenses yet for this period.
        </p>
      )}

      {expenses && expenses.length > 0 && (
        <>
          {/* Mobile: stacked cards — a 4-column table reads too tight below sm. */}
          <div className="mt-4 flex flex-col gap-3 sm:hidden">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                categories={categories ?? []}
                context={context}
                currency={profile.currency}
              />
            ))}
          </div>

          {/* sm and up: table */}
          <div className="mt-4 hidden overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 sm:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {expenses.map((expense) => (
                  <ExpenseTableRow
                    key={expense.id}
                    expense={expense}
                    categories={categories ?? []}
                    context={context}
                    currency={profile.currency}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

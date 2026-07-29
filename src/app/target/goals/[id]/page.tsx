import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/supabase/session";
import { getProfile } from "@/lib/profile/queries";
import { formatMoney } from "@/lib/currency";
import { formatDate } from "@/lib/periods/format";
import type { Goal, GoalContribution } from "@/lib/goals/types";
import { BackLink } from "@/app/back-link";
import { BanknotesIcon, CalendarIcon, PlusIcon } from "@/app/icons";
import { EmptyState } from "@/app/empty-state";
import { GoalEditModal } from "./goal-edit-modal";
import { ContributionCard, ContributionTableRow } from "./contribution-item";

export const metadata: Metadata = {
  title: "Goal — Expense Tracker",
};

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [user, { data: goal }, { data: contributions }] = await Promise.all([
    getAuthedUser(),
    supabase.from("goals").select("*").eq("id", id).maybeSingle<Goal>(),
    supabase
      .from("goal_contributions")
      .select("id, amount, contributed_at")
      .eq("goal_id", id)
      .order("contributed_at", { ascending: false })
      .returns<GoalContribution[]>(),
  ]);

  if (!user) {
    return null;
  }

  if (!goal) {
    notFound();
  }

  const profile = await getProfile(user.id);
  const totalSaved = (contributions ?? []).reduce(
    (sum, c) => sum + c.amount,
    0
  );

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <BackLink href="/target/goals" />

      <div className="mt-4 flex min-w-0 items-center gap-1">
        <h1 className="truncate text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {goal.name}
        </h1>
        <GoalEditModal
          goalId={goal.id}
          goalName={goal.name}
          defaults={{
            name: goal.name,
            description: goal.description,
            target_date: goal.target_date,
          }}
        />
      </div>

      {goal.description && (
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {goal.description}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
            <CalendarIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Target date
            </p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              {formatDate(goal.target_date)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
            <BanknotesIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Total saved
            </p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              {formatMoney(totalSaved, profile.currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Contributions
        </h2>
        <Link
          href={`/target/goals/${goal.id}/contributions/new`}
          className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:w-auto"
        >
          <PlusIcon />
          Add contribution
        </Link>
      </div>

      {(!contributions || contributions.length === 0) && (
        <EmptyState
          icon={BanknotesIcon}
          title="No contributions yet"
          description="Add one to start saving toward this goal."
          className="mt-4"
        />
      )}

      {contributions && contributions.length > 0 && (
        <>
          {/* Mobile: stacked cards */}
          <div className="mt-4 flex flex-col gap-3 sm:hidden">
            {contributions.map((contribution) => (
              <ContributionCard
                key={contribution.id}
                goalId={goal.id}
                contribution={contribution}
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
                  <th className="px-4 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {contributions.map((contribution) => (
                  <ContributionTableRow
                    key={contribution.id}
                    goalId={goal.id}
                    contribution={contribution}
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

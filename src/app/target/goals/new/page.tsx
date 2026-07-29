import type { Metadata } from "next";
import { BackLink } from "@/app/back-link";
import { createGoal } from "@/lib/goals/actions";
import { GoalForm } from "@/app/target/goals/goal-form";

export const metadata: Metadata = {
  title: "New goal — Expense Tracker",
};

export default function NewGoalPage() {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10">
      <BackLink href="/target/goals" />

      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        New goal
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Set a savings goal and track contributions toward it.
      </p>

      <GoalForm action={createGoal} />
    </main>
  );
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type GoalFormState = { error: string | null; success?: boolean };
export type ContributionFormState = { error: string | null; success?: boolean };

type GoalInput = {
  name: string;
  description: string | null;
  target_date: string;
};

function parseGoalInput(
  formData: FormData
): { data: GoalInput } | { error: string } {
  const name = formData.get("name");
  const description = formData.get("description");
  const targetDate = formData.get("target_date");

  if (typeof name !== "string" || name.trim().length === 0) {
    return { error: "Name is required." };
  }

  if (typeof targetDate !== "string" || !targetDate) {
    return { error: "Enter a date." };
  }

  return {
    data: {
      name: name.trim(),
      description:
        typeof description === "string" && description.trim()
          ? description.trim()
          : null,
      target_date: targetDate,
    },
  };
}

export async function createGoal(
  _prevState: GoalFormState,
  formData: FormData
): Promise<GoalFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const parsed = parseGoalInput(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const { data: goal, error } = await supabase
    .from("goals")
    .insert({ ...parsed.data, user_id: user.id })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/target/goals");
  redirect(`/target/goals/${goal.id}?toast=goal-created`);
}

export async function updateGoal(
  goalId: number,
  _prevState: GoalFormState,
  formData: FormData
): Promise<GoalFormState> {
  const supabase = await createClient();

  const parsed = parseGoalInput(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const { error } = await supabase
    .from("goals")
    .update(parsed.data)
    .eq("id", goalId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/target/goals");
  revalidatePath(`/target/goals/${goalId}`);
  return { error: null, success: true };
}

export async function deleteGoal(
  goalId: number
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("goals").delete().eq("id", goalId);
  if (!error) {
    revalidatePath("/target/goals");
  }
  return { error: error?.message ?? null };
}

type ContributionInput = { amount: number; contributed_at: string };

function parseContributionInput(
  formData: FormData
): { data: ContributionInput } | { error: string } {
  const amountRaw = formData.get("amount");
  const contributedAt = formData.get("contributed_at");

  if (typeof amountRaw !== "string" || amountRaw.trim() === "") {
    return { error: "Enter an amount." };
  }
  const amount = Number(amountRaw);
  if (Number.isNaN(amount) || amount <= 0) {
    return { error: "Amount must be a positive number." };
  }

  if (typeof contributedAt !== "string" || !contributedAt) {
    return { error: "Enter a date." };
  }

  return { data: { amount, contributed_at: contributedAt } };
}

export async function createContribution(
  goalId: number,
  _prevState: ContributionFormState,
  formData: FormData
): Promise<ContributionFormState> {
  const supabase = await createClient();

  const parsed = parseContributionInput(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const { error } = await supabase
    .from("goal_contributions")
    .insert({ ...parsed.data, goal_id: goalId });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/target/goals");
  redirect(`/target/goals/${goalId}?toast=contribution-created`);
}

export async function updateContribution(
  goalId: number,
  contributionId: number,
  _prevState: ContributionFormState,
  formData: FormData
): Promise<ContributionFormState> {
  const supabase = await createClient();

  const parsed = parseContributionInput(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const { error } = await supabase
    .from("goal_contributions")
    .update(parsed.data)
    .eq("id", contributionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/target/goals");
  revalidatePath(`/target/goals/${goalId}`);
  return { error: null, success: true };
}

export async function deleteContribution(
  goalId: number,
  contributionId: number
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("goal_contributions")
    .delete()
    .eq("id", contributionId);
  if (!error) {
    revalidatePath("/target/goals");
    revalidatePath(`/target/goals/${goalId}`);
  }
  return { error: error?.message ?? null };
}

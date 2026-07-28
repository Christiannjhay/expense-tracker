"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ExpenseFormState = {
  error: string | null;
  success?: boolean;
};

type ExpenseInput = {
  category_id: number;
  amount: number;
  description: string | null;
  spent_at: string;
};

function parseExpenseInput(
  formData: FormData
): { data: ExpenseInput } | { error: string } {
  const categoryId = formData.get("category_id");
  const amountRaw = formData.get("amount");
  const description = formData.get("description");
  const spentAt = formData.get("spent_at");

  if (typeof categoryId !== "string" || !categoryId) {
    return { error: "Choose a category." };
  }

  if (typeof amountRaw !== "string" || amountRaw.trim() === "") {
    return { error: "Enter an amount." };
  }
  const amount = Number(amountRaw);
  if (Number.isNaN(amount) || amount <= 0) {
    return { error: "Amount must be a positive number." };
  }

  if (typeof spentAt !== "string" || !spentAt) {
    return { error: "Enter a date." };
  }

  return {
    data: {
      category_id: Number(categoryId),
      amount,
      description:
        typeof description === "string" && description.trim()
          ? description.trim()
          : null,
      spent_at: spentAt,
    },
  };
}

export async function createExpense(
  periodId: number,
  _prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const supabase = await createClient();

  const parsed = parseExpenseInput(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const { error } = await supabase
    .from("expenses")
    .insert({ ...parsed.data, period_id: periodId });

  if (error) {
    return { error: error.message };
  }

  redirect(`/periods/${periodId}`);
}

export async function updateExpense(
  expenseId: number,
  _prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const supabase = await createClient();

  const parsed = parseExpenseInput(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const { error } = await supabase
    .from("expenses")
    .update(parsed.data)
    .eq("id", expenseId);

  if (error) {
    return { error: error.message };
  }

  return { error: null, success: true };
}

export async function deleteExpense(
  expenseId: number
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
  return { error: error?.message ?? null };
}

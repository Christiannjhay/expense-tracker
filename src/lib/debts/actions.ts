"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type DebtFormState = { error: string | null; success?: boolean };
export type PaymentFormState = { error: string | null; success?: boolean };

type DebtInput = { name: string; total_amount: number; started_at: string };

function parseDebtInput(
  formData: FormData
): { data: DebtInput } | { error: string } {
  const name = formData.get("name");
  const totalAmountRaw = formData.get("total_amount");
  const startedAt = formData.get("started_at");

  if (typeof name !== "string" || name.trim().length === 0) {
    return { error: "Name is required." };
  }

  if (typeof totalAmountRaw !== "string" || totalAmountRaw.trim() === "") {
    return { error: "Enter a total amount." };
  }
  const totalAmount = Number(totalAmountRaw);
  if (Number.isNaN(totalAmount) || totalAmount <= 0) {
    return { error: "Total amount must be a positive number." };
  }

  if (typeof startedAt !== "string" || !startedAt) {
    return { error: "Enter a date." };
  }

  return {
    data: { name: name.trim(), total_amount: totalAmount, started_at: startedAt },
  };
}

export async function createDebt(
  _prevState: DebtFormState,
  formData: FormData
): Promise<DebtFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const parsed = parseDebtInput(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const { data: debt, error } = await supabase
    .from("debts")
    .insert({ ...parsed.data, user_id: user.id })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/target/debt-tracker");
  redirect(`/target/debt-tracker/${debt.id}?toast=debt-created`);
}

export async function updateDebt(
  debtId: number,
  _prevState: DebtFormState,
  formData: FormData
): Promise<DebtFormState> {
  const supabase = await createClient();

  const parsed = parseDebtInput(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const { error } = await supabase
    .from("debts")
    .update(parsed.data)
    .eq("id", debtId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/target/debt-tracker");
  revalidatePath(`/target/debt-tracker/${debtId}`);
  return { error: null, success: true };
}

export async function deleteDebt(
  debtId: number
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("debts").delete().eq("id", debtId);
  if (!error) {
    revalidatePath("/target/debt-tracker");
  }
  return { error: error?.message ?? null };
}

type PaymentInput = { amount: number; paid_at: string };

function parsePaymentInput(
  formData: FormData
): { data: PaymentInput } | { error: string } {
  const amountRaw = formData.get("amount");
  const paidAt = formData.get("paid_at");

  if (typeof amountRaw !== "string" || amountRaw.trim() === "") {
    return { error: "Enter an amount." };
  }
  const amount = Number(amountRaw);
  if (Number.isNaN(amount) || amount <= 0) {
    return { error: "Amount must be a positive number." };
  }

  if (typeof paidAt !== "string" || !paidAt) {
    return { error: "Enter a date." };
  }

  return { data: { amount, paid_at: paidAt } };
}

export async function createPayment(
  debtId: number,
  _prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const supabase = await createClient();

  const parsed = parsePaymentInput(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const { error } = await supabase
    .from("debt_payments")
    .insert({ ...parsed.data, debt_id: debtId });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/target/debt-tracker");
  redirect(`/target/debt-tracker/${debtId}?toast=payment-created`);
}

export async function updatePayment(
  debtId: number,
  paymentId: number,
  _prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const supabase = await createClient();

  const parsed = parsePaymentInput(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const { error } = await supabase
    .from("debt_payments")
    .update(parsed.data)
    .eq("id", paymentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/target/debt-tracker");
  revalidatePath(`/target/debt-tracker/${debtId}`);
  return { error: null, success: true };
}

export async function deletePayment(
  debtId: number,
  paymentId: number
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("debt_payments")
    .delete()
    .eq("id", paymentId);
  if (!error) {
    revalidatePath("/target/debt-tracker");
    revalidatePath(`/target/debt-tracker/${debtId}`);
  }
  return { error: error?.message ?? null };
}

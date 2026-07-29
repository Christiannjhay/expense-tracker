import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPayment } from "@/lib/debts/actions";
import type { Debt } from "@/lib/debts/types";
import { BackLink } from "@/app/back-link";
import { PaymentForm } from "@/app/target/debt-tracker/payment-form";

export const metadata: Metadata = {
  title: "Add payment — Expense Tracker",
};

export default async function NewPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: debt } = await supabase
    .from("debts")
    .select("*")
    .eq("id", id)
    .maybeSingle<Debt>();

  if (!debt) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10">
      <BackLink href={`/target/debt-tracker/${debt.id}`} />

      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Add payment
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        This payment will be added to {debt.name} only.
      </p>

      <PaymentForm action={createPayment.bind(null, debt.id)} />
    </main>
  );
}

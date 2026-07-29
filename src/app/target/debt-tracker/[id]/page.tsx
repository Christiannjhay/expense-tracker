import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/supabase/session";
import { getProfile } from "@/lib/profile/queries";
import { formatMoney } from "@/lib/currency";
import { formatDate } from "@/lib/periods/format";
import type { Debt, DebtPayment } from "@/lib/debts/types";
import { BackLink } from "@/app/back-link";
import {
  BanknotesIcon,
  CalendarIcon,
  MinusCircleIcon,
  PlusIcon,
  WalletIcon,
} from "@/app/icons";
import { EmptyState } from "@/app/empty-state";
import { DebtEditModal } from "./debt-edit-modal";
import { PaymentCard, PaymentTableRow } from "./payment-item";

export const metadata: Metadata = {
  title: "Debt — Expense Tracker",
};

export default async function DebtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [user, { data: debt }, { data: payments }] = await Promise.all([
    getAuthedUser(),
    supabase.from("debts").select("*").eq("id", id).maybeSingle<Debt>(),
    supabase
      .from("debt_payments")
      .select("id, amount, paid_at")
      .eq("debt_id", id)
      .order("paid_at", { ascending: false })
      .returns<DebtPayment[]>(),
  ]);

  if (!user) {
    return null;
  }

  if (!debt) {
    notFound();
  }

  const profile = await getProfile(user.id);
  const totalPaid = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const remaining = debt.total_amount - totalPaid;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <BackLink href="/target/debt-tracker" />

      <div className="mt-4 flex min-w-0 items-center gap-1">
        <h1 className="truncate text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {debt.name}
        </h1>
        <DebtEditModal
          debtId={debt.id}
          debtName={debt.name}
          defaults={{
            name: debt.name,
            total_amount: debt.total_amount,
            started_at: debt.started_at,
          }}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
            <CalendarIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Date</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              {formatDate(debt.started_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
            <WalletIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Total amount
            </p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              {formatMoney(debt.total_amount, profile.currency)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
            <BanknotesIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Amount paid
            </p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              {formatMoney(totalPaid, profile.currency)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
            <MinusCircleIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Remaining balance
            </p>
            <p
              className={`font-semibold ${
                remaining < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-zinc-900 dark:text-zinc-50"
              }`}
            >
              {formatMoney(remaining, profile.currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Payments
        </h2>
        <Link
          href={`/target/debt-tracker/${debt.id}/payments/new`}
          className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:w-auto"
        >
          <PlusIcon />
          Add payment
        </Link>
      </div>

      {(!payments || payments.length === 0) && (
        <EmptyState
          icon={BanknotesIcon}
          title="No payments yet"
          description="Add one to log progress on this debt."
          className="mt-4"
        />
      )}

      {payments && payments.length > 0 && (
        <>
          {/* Mobile: stacked cards */}
          <div className="mt-4 flex flex-col gap-3 sm:hidden">
            {payments.map((payment) => (
              <PaymentCard
                key={payment.id}
                debtId={debt.id}
                payment={payment}
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
                {payments.map((payment) => (
                  <PaymentTableRow
                    key={payment.id}
                    debtId={debt.id}
                    payment={payment}
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

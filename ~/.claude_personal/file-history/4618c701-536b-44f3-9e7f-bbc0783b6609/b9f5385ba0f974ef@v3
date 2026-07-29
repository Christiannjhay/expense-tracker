"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePayment, updatePayment } from "@/lib/debts/actions";
import { PaymentForm } from "@/app/target/debt-tracker/payment-form";
import { Modal } from "@/app/modal";
import { DeleteConfirm } from "@/app/delete-confirm";
import { formatMoney } from "@/lib/currency";
import { formatDate } from "@/lib/periods/format";
import { useToast } from "@/app/toast-context";

type PaymentData = {
  id: number;
  amount: number;
  paid_at: string;
};

function usePaymentEditModal(debtId: number, paymentId: number) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  async function handleDelete() {
    const result = await deletePayment(debtId, paymentId);
    if (!result.error) {
      setOpen(false);
      showToast("Payment deleted");
      router.refresh();
    }
    return result;
  }

  function handleSuccess() {
    setOpen(false);
    showToast("Payment saved");
    router.refresh();
  }

  return { open, setOpen, handleDelete, handleSuccess };
}

function EditPaymentModalBody({
  debtId,
  payment,
  open,
  onSuccess,
  onDelete,
}: {
  debtId: number;
  payment: PaymentData;
  open: boolean;
  onSuccess: () => void;
  onDelete: () => Promise<{ error: string | null }>;
}) {
  return (
    <>
      <PaymentForm
        action={updatePayment.bind(null, debtId, payment.id)}
        defaults={{ amount: payment.amount, paid_at: payment.paid_at }}
        submitLabel="Save changes"
        pendingLabel="Saving…"
        onSuccess={onSuccess}
      />
      <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <DeleteConfirm
          key={String(open)}
          label="Delete payment"
          confirmMessage="Delete this payment? This can't be undone."
          onConfirm={onDelete}
        />
      </div>
    </>
  );
}

export function PaymentCard({
  debtId,
  payment,
  currency,
}: {
  debtId: number;
  payment: PaymentData;
  currency: string;
}) {
  const { open, setOpen, handleDelete, handleSuccess } = usePaymentEditModal(
    debtId,
    payment.id
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white p-4 text-left active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:active:bg-zinc-900"
      >
        <span className="font-medium text-zinc-900 dark:text-zinc-50">
          {formatMoney(payment.amount, currency)}
        </span>
        <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
          {formatDate(payment.paid_at)}
        </span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit payment">
        <EditPaymentModalBody
          debtId={debtId}
          payment={payment}
          open={open}
          onSuccess={handleSuccess}
          onDelete={handleDelete}
        />
      </Modal>
    </>
  );
}

export function PaymentTableRow({
  debtId,
  payment,
  currency,
}: {
  debtId: number;
  payment: PaymentData;
  currency: string;
}) {
  const { open, setOpen, handleDelete, handleSuccess } = usePaymentEditModal(
    debtId,
    payment.id
  );

  return (
    <>
      <tr
        onClick={() => setOpen(true)}
        className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
          {formatDate(payment.paid_at)}
        </td>
        <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
          {formatMoney(payment.amount, currency)}
        </td>
      </tr>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit payment">
        <EditPaymentModalBody
          debtId={debtId}
          payment={payment}
          open={open}
          onSuccess={handleSuccess}
          onDelete={handleDelete}
        />
      </Modal>
    </>
  );
}

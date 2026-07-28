"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePeriod, updatePeriod } from "@/lib/periods/actions";
import { PeriodForm, type PeriodFormDefaults } from "@/app/periods/period-form";
import { Modal } from "@/app/modal";
import { PencilIcon } from "@/app/icons";
import { useToast } from "@/app/toast-context";
import { DeleteConfirm } from "@/app/delete-confirm";

export function PeriodEditModal({
  periodId,
  periodName,
  defaults,
}: {
  periodId: number;
  periodName: string;
  defaults: PeriodFormDefaults;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  async function handleDelete() {
    const result = await deletePeriod(periodId);
    if (!result.error) {
      showToast("Period deleted");
      router.push("/periods");
    }
    return result;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Edit period"
        className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
      >
        <PencilIcon />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit period">
        <PeriodForm
          action={updatePeriod.bind(null, periodId)}
          defaults={defaults}
          submitLabel="Save changes"
          pendingLabel="Saving…"
          onSuccess={() => {
            setOpen(false);
            showToast("Period saved");
            router.refresh();
          }}
        />

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <DeleteConfirm
            key={String(open)}
            label="Delete period"
            confirmMessage={`Delete "${periodName}" and all its expenses? This can't be undone.`}
            onConfirm={handleDelete}
          />
        </div>
      </Modal>
    </>
  );
}

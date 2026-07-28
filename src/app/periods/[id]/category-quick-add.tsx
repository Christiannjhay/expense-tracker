"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCategory,
  type CategoryFormState,
} from "@/lib/categories/actions";
import { Modal } from "@/app/modal";

const initialState: CategoryFormState = { error: null };

export function CategoryQuickAdd({
  context,
}: {
  context: "general" | "trip";
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const action = createCategory.bind(null, context);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      // Closing the modal here is structurally the same as the
      // onSuccess-prop pattern used by PeriodForm/ExpenseForm (a parent
      // setState triggered by a state.success transition) — it's just
      // local instead of delegated, so the linter can see it directly.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-zinc-500 hover:underline dark:text-zinc-400"
      >
        + New category
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={context === "trip" ? "New trip category" : "New category"}
      >
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="new_category_name"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Name
            </label>
            <input
              id="new_category_name"
              name="name"
              required
              autoFocus
              placeholder="e.g. Car Rental"
              className="rounded-lg border border-zinc-300 px-3 py-2.5 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
            />
          </div>

          {state.error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex h-11 items-center justify-center rounded-lg bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {pending ? "Adding…" : "Add category"}
          </button>
        </form>
      </Modal>
    </>
  );
}

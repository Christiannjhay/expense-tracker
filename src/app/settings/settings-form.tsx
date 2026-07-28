"use client";

import { useActionState } from "react";
import { updateCurrency, type ProfileFormState } from "@/lib/profile/actions";
import { CURRENCIES } from "@/lib/currency";

const initialState: ProfileFormState = { error: null, success: false };

export function SettingsForm({
  initialCurrency,
}: {
  initialCurrency: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateCurrency,
    initialState
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="currency"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Currency
        </label>
        <select
          key={initialCurrency}
          id="currency"
          name="currency"
          defaultValue={initialCurrency}
          className="rounded-lg border border-zinc-300 px-3 py-2.5 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
        >
          {CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Applies to budgets and expenses across the whole app.
        </p>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      {state.success && (
        <p role="status" className="text-sm text-zinc-700 dark:text-zinc-300">
          Saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex h-11 items-center justify-center rounded-lg bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

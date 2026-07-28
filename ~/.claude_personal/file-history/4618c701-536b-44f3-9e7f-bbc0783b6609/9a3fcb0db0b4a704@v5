"use client";

import { useActionState, useEffect, useState } from "react";
import type { PeriodFormState } from "@/lib/periods/actions";

const initialState: PeriodFormState = { error: null };

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-2.5 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

export type PeriodFormDefaults = {
  name: string;
  type: "month" | "trip" | "period";
  year: number | null;
  month: number | null;
  start_date: string | null;
  end_date: string | null;
  total_budget: number | null;
};

export function PeriodForm({
  action,
  defaults,
  submitLabel = "Create period",
  pendingLabel = "Creating…",
  onSuccess,
}: {
  action: (
    prevState: PeriodFormState,
    formData: FormData
  ) => Promise<PeriodFormState>;
  defaults?: PeriodFormDefaults;
  submitLabel?: string;
  pendingLabel?: string;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [type, setType] = useState<"month" | "trip" | "period">(
    defaults?.type ?? "month"
  );
  const now = new Date();

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
    // onSuccess intentionally omitted: it's a fresh closure each render,
    // and only a real state.success transition should trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaults?.name}
          placeholder="e.g. July groceries, Tokyo trip"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="type" className={labelClass}>
          Type
        </label>
        <select
          id="type"
          name="type"
          value={type}
          onChange={(e) =>
            setType(e.target.value as "month" | "trip" | "period")
          }
          className={inputClass}
        >
          <option value="month">Month</option>
          <option value="trip">Trip</option>
          <option value="period">Period</option>
        </select>
      </div>

      {type === "month" ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="year" className={labelClass}>
              Year
            </label>
            <input
              id="year"
              name="year"
              type="number"
              defaultValue={defaults?.year ?? now.getFullYear()}
              required
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="month" className={labelClass}>
              Month
            </label>
            <select
              id="month"
              name="month"
              defaultValue={defaults?.month ?? now.getMonth() + 1}
              required
              className={inputClass}
            >
              {MONTHS.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="start_date" className={labelClass}>
              Start date
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              defaultValue={defaults?.start_date ?? undefined}
              required
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="end_date" className={labelClass}>
              End date
            </label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              defaultValue={defaults?.end_date ?? undefined}
              required
              className={inputClass}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="total_budget" className={labelClass}>
          Budget (optional)
        </label>
        <input
          id="total_budget"
          name="total_budget"
          type="number"
          min="0"
          step="0.01"
          defaultValue={defaults?.total_budget ?? undefined}
          placeholder="0.00"
          className={inputClass}
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
        className="mt-2 flex h-11 items-center justify-center rounded-lg bg-zinc-900 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}

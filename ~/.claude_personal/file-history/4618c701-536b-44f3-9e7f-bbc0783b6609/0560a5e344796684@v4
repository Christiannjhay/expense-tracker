"use client";

import { useActionState } from "react";
import {
  updateDisplayName,
  type ProfileFormState,
} from "@/lib/profile/actions";

const initialState: ProfileFormState = { error: null, success: false };

export function AccountForm({
  initialDisplayName,
}: {
  initialDisplayName: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateDisplayName,
    initialState
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="display_name"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Display name
        </label>
        <input
          key={initialDisplayName}
          id="display_name"
          name="display_name"
          defaultValue={initialDisplayName}
          placeholder="e.g. Alex"
          className="rounded-lg border border-zinc-300 px-3 py-2.5 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
        />
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

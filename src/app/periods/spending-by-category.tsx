"use client";

import { useState } from "react";
import type { CategorySlice } from "@/lib/expenses/aggregate";
import { formatMoney } from "@/lib/currency";

export function SpendingByCategory({
  slices,
  currency,
  showTotal = true,
}: {
  slices: CategorySlice[];
  currency: string;
  showTotal?: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (slices.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Add an expense to see your spending breakdown.
      </p>
    );
  }

  const top = slices[0];
  const total = slices.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="viz-root">
      {showTotal && (
        <>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Total spent
          </p>
          <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {formatMoney(total, currency)}
          </p>
        </>
      )}

      <p
        className={`text-sm text-zinc-600 dark:text-zinc-400 ${showTotal ? "mt-2" : ""}`}
      >
        Highest:{" "}
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">
          {top.name}
        </span>{" "}
        — {formatMoney(top.amount, currency)} ({Math.round(top.percent)}%)
      </p>

      <div
        role="img"
        aria-label={`Spending by category: ${slices
          .map((s) => `${s.name} ${Math.round(s.percent)}%`)
          .join(", ")}`}
        className="mt-3 flex h-6 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900"
      >
        {slices.map((slice, i) => (
          <div
            key={slice.name}
            tabIndex={0}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            className="relative h-full outline-none"
            style={{
              width: `${slice.percent}%`,
              backgroundColor: slice.color,
              opacity: hovered === null || hovered === i ? 1 : 0.55,
              marginRight: i < slices.length - 1 ? 2 : 0,
            }}
          >
            {hovered === i && (
              <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs text-white shadow-lg dark:bg-zinc-50 dark:text-zinc-900">
                <span className="font-semibold">
                  {formatMoney(slice.amount, currency)}
                </span>{" "}
                {slice.name}
              </div>
            )}
          </div>
        ))}
      </div>

      <ul className="mt-4 flex flex-col gap-2 text-sm">
        {slices.map((slice, i) => (
          <li key={slice.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
              aria-hidden="true"
            />
            <span
              className={
                i === 0
                  ? "font-semibold text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 dark:text-zinc-400"
              }
            >
              {slice.name}
            </span>
            <span className="ml-auto text-zinc-500 dark:text-zinc-400">
              {formatMoney(slice.amount, currency)} ·{" "}
              {Math.round(slice.percent)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

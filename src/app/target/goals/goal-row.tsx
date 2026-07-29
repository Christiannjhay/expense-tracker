"use client";

import { useRouter } from "next/navigation";

export function GoalRow({
  id,
  name,
  targetDate,
  totalSaved,
}: {
  id: number;
  name: string;
  targetDate: string;
  totalSaved: string;
}) {
  const router = useRouter();
  const href = `/target/goals/${id}`;

  return (
    <tr
      onClick={() => router.push(href)}
      onMouseEnter={() => router.prefetch(href)}
      onTouchStart={() => router.prefetch(href)}
      className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
    >
      <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-50">
        {name}
      </td>
      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
        {targetDate}
      </td>
      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
        {totalSaved}
      </td>
    </tr>
  );
}

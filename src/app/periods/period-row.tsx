"use client";

import { useRouter } from "next/navigation";
import { PeriodTypeIcon } from "@/app/icons";

export function PeriodRow({
  id,
  name,
  type,
  when,
  budget,
  showBudget,
}: {
  id: number;
  name: string;
  type: string;
  when: string;
  budget: string;
  showBudget: boolean;
}) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(`/periods/${id}`)}
      className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
    >
      <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-50">
        {name}
      </td>
      <td className="px-4 py-3 capitalize text-zinc-600 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <PeriodTypeIcon type={type} />
          {type}
        </span>
      </td>
      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{when}</td>
      {showBudget && (
        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
          {budget}
        </td>
      )}
    </tr>
  );
}

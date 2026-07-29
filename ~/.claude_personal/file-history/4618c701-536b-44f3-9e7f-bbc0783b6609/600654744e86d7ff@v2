import type { ComponentType } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  className = "mt-6",
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-xl border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-950 ${className}`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
        <Icon className="h-6 w-6" />
      </span>
      <p className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
    </div>
  );
}

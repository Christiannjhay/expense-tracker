const SERIES_VARS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
] as const;

const MAX_SLOTS = SERIES_VARS.length;

export type CategorySlice = {
  name: string;
  amount: number;
  percent: number;
  color: string;
};

export function aggregateByCategory(
  expenses: { amount: number; categories: { name: string } | null }[]
): CategorySlice[] {
  const totals = new Map<string, number>();
  for (const expense of expenses) {
    const name = expense.categories?.name ?? "Uncategorized";
    totals.set(name, (totals.get(name) ?? 0) + expense.amount);
  }

  const sorted = Array.from(totals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Fixed categorical hue order caps at 8 slots; fold the tail into "Other"
  // rather than generating a 9th hue.
  const visible =
    sorted.length > MAX_SLOTS ? sorted.slice(0, MAX_SLOTS - 1) : sorted;
  const overflow = sorted.length > MAX_SLOTS ? sorted.slice(MAX_SLOTS - 1) : [];

  const grandTotal = sorted.reduce((sum, s) => sum + s.amount, 0);
  if (grandTotal === 0) return [];

  const slices: CategorySlice[] = visible.map((s, i) => ({
    name: s.name,
    amount: s.amount,
    percent: (s.amount / grandTotal) * 100,
    color: SERIES_VARS[i],
  }));

  if (overflow.length > 0) {
    const overflowAmount = overflow.reduce((sum, s) => sum + s.amount, 0);
    slices.push({
      name: "Other",
      amount: overflowAmount,
      percent: (overflowAmount / grandTotal) * 100,
      color: "var(--series-other)",
    });
  }

  return slices;
}

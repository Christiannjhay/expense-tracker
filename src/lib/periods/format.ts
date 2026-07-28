import { formatMoney } from "@/lib/currency";
import type { Period } from "./types";

const MONTH_NAMES = [
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

export function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatPeriodRange(
  period: Pick<Period, "type" | "year" | "month" | "start_date" | "end_date">
): string {
  if (period.type === "month") {
    if (period.year == null || period.month == null) return "—";
    return `${MONTH_NAMES[period.month - 1] ?? period.month} ${period.year}`;
  }

  if (!period.start_date || !period.end_date) return "—";
  return `${formatDate(period.start_date)} – ${formatDate(period.end_date)}`;
}

export function formatBudget(
  totalBudget: number | null,
  currency: string
): string {
  if (totalBudget == null) return "—";
  return formatMoney(totalBudget, currency);
}

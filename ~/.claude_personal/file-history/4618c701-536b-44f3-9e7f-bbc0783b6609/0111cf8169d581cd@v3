export type Expense = {
  id: number;
  period_id: number;
  category_id: number;
  amount: number;
  description: string | null;
  spent_at: string;
  created_at: string;
};

export type ExpenseWithCategory = Expense & {
  categories: { name: string } | null;
};

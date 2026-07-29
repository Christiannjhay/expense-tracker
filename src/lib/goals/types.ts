export type Goal = {
  id: number;
  user_id: string;
  name: string;
  description: string | null;
  target_date: string;
  created_at: string;
};

export type GoalContribution = {
  id: number;
  goal_id: number;
  amount: number;
  contributed_at: string;
  created_at: string;
};

export type TransactionCategory =
  | "essential_fixed"
  | "nonessential_fixed"
  | "variable"
  | "income_extra";

export interface IncomeExtra {
  id: string;
  description: string;
  amount: number;
}

export interface Income {
  salary: number;
  vr: number;
  extra: IncomeExtra[];
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO format YYYY-MM-DD
  category: TransactionCategory;
}

export interface Expenses {
  essential_fixed: Expense[];
  nonessential_fixed: Expense[];
  variable: Expense[];
}

export interface MonthData {
  income: Income;
  expenses: Expenses;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
}

export interface YearlyData {
  year: number;
  goals?: Goal[];
  months: {
    [month: string]: MonthData; // "1" to "12"
  };
}

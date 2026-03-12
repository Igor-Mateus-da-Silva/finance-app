import { Expense, Income, TransactionCategory } from "@/types";

export function calculateTotalIncome(income?: Income): number {
  if (!income) return 0;
  const extras = income.extra?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  return (income.salary || 0) + (income.vr || 0) + extras;
}

export function calculateTotalExpenses(expenses?: {
  [key in "essential_fixed" | "nonessential_fixed" | "variable"]: Expense[];
}): number {
  if (!expenses) return 0;
  const essential =
    expenses.essential_fixed?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const nonessential =
    expenses.nonessential_fixed?.reduce((acc, curr) => acc + curr.amount, 0) ||
    0;
  const variable =
    expenses.variable?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  return essential + nonessential + variable;
}

export function calculateExpensesByCategory(expenses?: {
  [key in "essential_fixed" | "nonessential_fixed" | "variable"]: Expense[];
}) {
  if (!expenses) return { essential: 0, nonessential: 0, variable: 0 };
  return {
    essential:
      expenses.essential_fixed?.reduce((acc, curr) => acc + curr.amount, 0) ||
      0,
    nonessential:
      expenses.nonessential_fixed?.reduce(
        (acc, curr) => acc + curr.amount,
        0,
      ) || 0,
    variable:
      expenses.variable?.reduce((acc, curr) => acc + curr.amount, 0) || 0,
  };
}

export function calculateBalance(
  totalIncome: number,
  totalExpenses: number,
): number {
  return totalIncome - totalExpenses;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

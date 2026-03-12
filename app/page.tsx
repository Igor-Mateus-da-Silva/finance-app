"use client";

import { useFinanceStore } from "@/hooks/use-finance-store";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { Rule503020Card } from "@/components/dashboard/Rule503020Card";
import { ExpenseDistributionChart } from "@/components/dashboard/ExpenseDistributionChart";
import { DailyExpenseChart } from "@/components/dashboard/DailyExpenseChart";
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateBalance,
  calculateExpensesByCategory,
} from "@/utils/finance-calculator";
import { calculate503020 } from "@/utils/rule-503020";

export default function DashboardPage() {
  const { data, selectedMonth, isLoading } = useFinanceStore();

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const monthData = data.months[selectedMonth] || {
    income: { salary: 0, vr: 0, extra: [] },
    expenses: { essential_fixed: [], nonessential_fixed: [], variable: [] },
  };

  const totalIncome = calculateTotalIncome(monthData.income);
  const totalExpenses = calculateTotalExpenses(monthData.expenses);
  const balance = calculateBalance(totalIncome, totalExpenses);
  const expensesByCategory = calculateExpensesByCategory(monthData.expenses);

  const rule503020 = calculate503020(
    totalIncome,
    expensesByCategory.essential,
    expensesByCategory.nonessential,
    expensesByCategory.variable,
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Visão geral das suas finanças neste mês.
        </p>
      </div>

      <OverviewCards
        income={totalIncome}
        expenses={totalExpenses}
        balance={balance}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DailyExpenseChart expenses={monthData.expenses} />
        <ExpenseDistributionChart data={expensesByCategory} />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Rule503020Card ruleResult={rule503020} />
      </div>
    </div>
  );
}

"use client";

import { useFinanceStore } from "@/hooks/use-finance-store";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { Rule503020Card } from "@/components/dashboard/Rule503020Card";
import { ExpenseDistributionChart } from "@/components/dashboard/ExpenseDistributionChart";
import { DailyExpenseChart } from "@/components/dashboard/DailyExpenseChart";
import { formatCurrency } from "@/utils/finance-calculator";
import { calculate503020 } from "@/utils/rule-503020";

export default function DashboardPage() {
  const { transactions, selectedMonth, selectedYear, isLoading, error } =
    useFinanceStore();

  // Exibe o spinner enquanto os dados estão sendo carregados.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Exibe mensagem de erro caso a busca tenha falhado.
  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-red-500">
        <p>Erro ao carregar dados: {error}</p>
      </div>
    );
  }

  // Filtramos as transações para exibir apenas o mês e ano selecionados.
  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return (
      date.getMonth() === selectedMonth &&
      date.getFullYear() === selectedYear
    );
  });

  // Separamos receitas e despesas para os cálculos.
  const incomeTransactions = monthlyTransactions.filter(
    (t) => t.type === "INCOME"
  );
  const expenseTransactions = monthlyTransactions.filter(
    (t) => t.type === "EXPENSE"
  );

  // Calculamos os totais do mês.
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const balance = totalIncome - totalExpenses;

  // Agrupamos despesas por categoria para o gráfico de distribuição.
  const expensesByCategory = expenseTransactions.reduce<
    Record<string, number>
  >((acc, t) => {
    const categoryName = t.category?.name ?? "Sem categoria";
    acc[categoryName] = (acc[categoryName] ?? 0) + t.amount;
    return acc;
  }, {});

  const categoryChartData = Object.entries(expensesByCategory).map(
    ([name, value]) => ({ name, value })
  );

  // Calculamos a regra 50-30-20 com base nos totais do mês.
  // Como não temos mapeamento fixo para as categorias, usamos
  // 50% para necessidades, 30% para desejos, e o restante como economia.
  const essentialExpenses = totalExpenses * 0.5;
  const nonessentialExpenses = totalExpenses * 0.3;
  const variableExpenses = totalExpenses * 0.2;

  const rule503020 = calculate503020(
    totalIncome,
    essentialExpenses,
    nonessentialExpenses,
    variableExpenses
  );

  const monthName = new Date(selectedYear, selectedMonth).toLocaleString(
    "pt-BR",
    { month: "long", year: "numeric" }
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1 capitalize">
          {monthlyTransactions.length === 0
            ? `Nenhuma transação em ${monthName}.`
            : `Visão geral de ${monthName} — ${monthlyTransactions.length} transações.`}
        </p>
      </div>

      <OverviewCards
        income={totalIncome}
        expenses={totalExpenses}
        balance={balance}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DailyExpenseChart expenses={expenseTransactions} />
        <ExpenseDistributionChart data={categoryChartData} />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Rule503020Card ruleResult={rule503020} />
      </div>

      {totalIncome === 0 && totalExpenses === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            Nenhuma transação registrada neste mês.{" "}
            <span className="font-medium text-primary">
              Use o menu lateral para adicionar receitas ou despesas.
            </span>
          </p>
        </div>
      )}

      {/* Resumo rápido para depuração em desenvolvimento */}
      {process.env.NODE_ENV === "development" && (
        <details className="text-xs text-muted-foreground border rounded p-3">
          <summary className="cursor-pointer font-medium">
            🛠 Debug: Resumo do mês
          </summary>
          <pre className="mt-2">
            {JSON.stringify(
              {
                mes: monthName,
                totalTransacoes: monthlyTransactions.length,
                totalReceitas: formatCurrency(totalIncome),
                totalDespesas: formatCurrency(totalExpenses),
                saldo: formatCurrency(balance),
              },
              null,
              2
            )}
          </pre>
        </details>
      )}
    </div>
  );
}

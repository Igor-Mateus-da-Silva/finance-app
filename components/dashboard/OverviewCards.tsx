import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/finance-calculator";
import { Wallet, TrendingDown, DollarSign, Percent } from "lucide-react";

interface OverviewCardsProps {
  income: number;
  expenses: number;
  balance: number;
}

export function OverviewCards({
  income,
  expenses,
  balance,
}: OverviewCardsProps) {
  const percentSpent = income > 0 ? (expenses / income) * 100 : 0;
  const leftToSpend = income - expenses;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Renda Total</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">
            {formatCurrency(income)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-500">
            {formatCurrency(expenses)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${balance >= 0 ? "text-primary" : "text-red-600"}`}
          >
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {leftToSpend >= 0 ? "Sobra ainda no mês" : "Déficit no mês"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Renda Comprometida
          </CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{percentSpent.toFixed(1)}%</div>
          <div className="w-full bg-secondary h-2 mt-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${percentSpent > 100 ? "bg-red-500" : percentSpent > 80 ? "bg-yellow-500" : "bg-primary"}`}
              style={{ width: `${Math.min(percentSpent, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Expense } from "@/types";
import { formatCurrency } from "@/utils/finance-calculator";
import { format, parseISO, compareAsc } from "date-fns";

interface Props {
  expenses: {
    [key in "essential_fixed" | "nonessential_fixed" | "variable"]: Expense[];
  };
}

export function DailyExpenseChart({ expenses }: Props) {
  // Flatten and sort by date
  const allExpenses = [
    ...(expenses.essential_fixed || []),
    ...(expenses.nonessential_fixed || []),
    ...(expenses.variable || []),
  ].sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)));

  // Group by day using date-fns
  const groupedData: Record<string, number> = {};
  allExpenses.forEach((exp) => {
    // Expected format: YYYY-MM-DD
    const dateStr = format(parseISO(exp.date), "dd/MM");
    if (!groupedData[dateStr]) groupedData[dateStr] = 0;
    groupedData[dateStr] += exp.amount;
  });

  const chartData = Object.keys(groupedData).map((key) => ({
    date: key,
    total: groupedData[key],
  }));

  return (
    <Card className="col-span-1 lg:col-span-2 border shadow-sm">
      <CardHeader>
        <CardTitle>Evolução de Gastos Diários</CardTitle>
        <CardDescription>Gastos acumulados por dia neste mês</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full mt-4">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Sem gastos registrados.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                strokeOpacity={0.2}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => `R$ ${val}`}
              />
              <Tooltip
                formatter={(val: any) => formatCurrency(Number(val) || 0)}
                cursor={{ fill: "transparent" }}
              />
              <Bar
                dataKey="total"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
                className="fill-primary"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

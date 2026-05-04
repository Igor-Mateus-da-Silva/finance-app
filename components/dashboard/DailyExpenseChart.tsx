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
import { formatCurrency } from "@/utils/finance-calculator";
import { format } from "date-fns";

// Tipo simplificado de transação que o componente precisa.
interface SimpleTransaction {
  amount: number;
  date: Date | string;
  type: string;
}

interface Props {
  // Agora recebe diretamente o array de transações de despesa do mês.
  expenses: SimpleTransaction[];
}

export function DailyExpenseChart({ expenses }: Props) {
  // Agrupamos os gastos por dia para exibir no gráfico de barras.
  const groupedData: Record<string, number> = {};

  expenses.forEach((t) => {
    // Garantimos que a data seja um objeto Date, pois pode vir como string do JSON.
    const date = typeof t.date === "string" ? new Date(t.date) : t.date;
    const dateStr = format(date, "dd/MM");

    if (!groupedData[dateStr]) groupedData[dateStr] = 0;
    groupedData[dateStr] += t.amount;
  });

  const chartData = Object.keys(groupedData)
    .sort()
    .map((key) => ({
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
                formatter={(val: unknown) => formatCurrency(Number(val) || 0)}
                cursor={{ fill: "transparent" }}
              />
              <Bar
                dataKey="total"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

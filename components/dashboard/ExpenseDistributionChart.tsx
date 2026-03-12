import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/utils/finance-calculator";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6"]; // Red, Amber, Blue

interface Props {
  data: {
    essential: number;
    nonessential: number;
    variable: number;
  };
}

export function ExpenseDistributionChart({ data }: Props) {
  const chartData = [
    { name: "Essenciais", value: data.essential },
    { name: "Não Essenciais", value: data.nonessential },
    { name: "Variáveis", value: data.variable },
  ].filter((item) => item.value > 0);

  return (
    <Card className="col-span-1 border shadow-sm">
      <CardHeader>
        <CardTitle>Distribuição de Gastos</CardTitle>
        <CardDescription>Por categoria principal</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full mt-4">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Sem dados de gastos para este mês.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => formatCurrency(Number(val) || 0)}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

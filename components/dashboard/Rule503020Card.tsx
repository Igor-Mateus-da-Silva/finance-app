import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Rule503020Result } from "@/utils/rule-503020";
import { formatCurrency } from "@/utils/finance-calculator";

export function Rule503020Card({
  ruleResult,
}: {
  ruleResult: Rule503020Result;
}) {
  const getStatusColor = (status: "ok" | "warning" | "danger") => {
    switch (status) {
      case "ok":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "danger":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: "ok" | "warning" | "danger") => {
    switch (status) {
      case "ok":
        return "Dentro do Ideal";
      case "warning":
        return "Atenção";
      case "danger":
        return "Acima do Recomendado";
      default:
        return "";
    }
  };

  const renderSection = (
    title: string,
    data: any,
    isSavings: boolean = false,
  ) => (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold">{title}</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] text-white ${getStatusColor(data.status)}`}
        >
          {getStatusText(data.status)}
        </span>
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Gasto Atual: {formatCurrency(data.actual)}</span>
        <span>
          Ideal {isSavings ? "(Mínimo)" : "(Máx)"}: {formatCurrency(data.ideal)}
        </span>
      </div>
      <div className="w-full bg-secondary h-2 mt-1 rounded-full overflow-hidden">
        {/* For savings, progress makes sense relative to ideal. If actual > ideal, bar is full and green. */}
        {isSavings ? (
          <div
            className={`h-full ${data.actual >= data.ideal ? "bg-green-500" : "bg-yellow-500"}`}
            style={{
              width: `${Math.min((data.actual / (data.ideal || 1)) * 100, 100)}%`,
            }}
          />
        ) : (
          <div
            className={`h-full ${data.status === "danger" ? "bg-red-500" : data.status === "warning" ? "bg-yellow-500" : "bg-primary"}`}
            style={{
              width: `${Math.min((data.actual / (data.ideal || 1)) * 100, 100)}%`,
            }}
          />
        )}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regra 50/30/20</CardTitle>
        <CardDescription>
          Comparativo dos seus gastos com o modelo ideal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderSection("Necessidades (50%)", ruleResult.essential)}
        {renderSection("Desejos (30%)", ruleResult.nonessential)}
        {renderSection(
          "Poupança / Investimentos (20%)",
          ruleResult.savings,
          true,
        )}
      </CardContent>
    </Card>
  );
}

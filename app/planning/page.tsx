"use client";

import { useState } from "react";
import { useFinanceStore } from "@/hooks/use-finance-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { addGoalAction, updateGoalAmountAction, deleteGoalAction } from "@/app/actions/goals";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/finance-calculator";
import { Trash2, Plus, Target } from "lucide-react";

export default function PlanningPage() {
  const { goals, selectedYear, refreshData } = useFinanceStore();

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [contributeAmounts, setContributeAmounts] = useState<Record<string, string>>({});

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !deadline) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsAdding(true);
    try {
      const parsedTarget = Number(targetAmount.replace(",", "."));
      const parsedCurrent = currentAmount ? Number(currentAmount.replace(",", ".")) : 0;

      if (isNaN(parsedTarget) || parsedTarget <= 0) {
        throw new Error("O valor objetivo deve ser um número positivo.");
      }

      const result = await addGoalAction({
        name,
        targetAmount: parsedTarget,
        currentAmount: isNaN(parsedCurrent) ? 0 : parsedCurrent,
        deadline: new Date(deadline),
      });

      if (result.success) {
        await refreshData();
        toast.success("Meta financeira criada!");
        setName("");
        setTargetAmount("");
        setCurrentAmount("");
        setDeadline("");
      } else {
        throw new Error(result.message);
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao adicionar meta.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const result = await deleteGoalAction(id);
      if (result.success) {
        await refreshData();
        toast.success("Meta removida!");
      }
    } catch (e) {
      toast.error("Erro ao remover meta.");
    }
  };

  const handleContribute = async (id: string) => {
    const val = contributeAmounts[id];
    if (!val) return;

    try {
      const parsedAmount = Number(val.replace(",", "."));
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        toast.error("Valor inválido");
        return;
      }

      const result = await updateGoalAmountAction(id, parsedAmount);
      if (result.success) {
        await refreshData();
        toast.success("Valor adicionado à meta!");
        setContributeAmounts((prev) => ({ ...prev, [id]: "" }));
      }
    } catch (e) {
      toast.error("Erro ao atualizar meta.");
    }
  };

  const calculateProgress = (goal: any) => {
    const current = Number(goal.currentAmount);
    const target = Number(goal.targetAmount);
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Planejamento e Objetivos
        </h2>
        <p className="text-muted-foreground mt-1">
          Defina metas financeiras sincronizadas com o PostgreSQL.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Nova Meta</CardTitle>
            <CardDescription>
              Crie um novo objetivo financeiro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Meta</Label>
                <Input
                  id="name"
                  placeholder="Ex: Viagem de Férias"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Valor Objetivo (R$)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentAmount">Valor Atual Já Poupado (R$)</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Prazo Máximo</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isAdding} className="w-full mt-2">
                {isAdding ? "Criando..." : "Criar Meta"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Suas Metas Atuais</h3>

          {goals.length === 0 ? (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                <Target className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">Nenhuma meta criada.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {goals.map((goal) => {
                const progress = calculateProgress(goal);
                const isComplete = progress >= 100;

                return (
                  <Card key={goal.id} className="flex flex-col shadow-sm">
                    <CardHeader className="pb-3 flex-row justify-between items-start space-y-0">
                      <div>
                        <CardTitle className="text-base">{goal.name}</CardTitle>
                        <CardDescription className="text-xs">
                          Prazo: {new Date(goal.deadline).toLocaleDateString("pt-BR")}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-muted-foreground hover:text-red-500 h-8 w-8 -mt-2 -mr-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="flex-1 pb-3 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-muted-foreground">
                          {formatCurrency(Number(goal.currentAmount))}
                        </span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(Number(goal.targetAmount))}
                        </span>
                      </div>

                      <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${isComplete ? "bg-green-500" : "bg-primary"} transition-all duration-500`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-right text-muted-foreground">
                        {progress.toFixed(1)}%
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0 border-t mt-auto">
                      {!isComplete ? (
                        <div className="flex items-center gap-2 pt-3 w-full">
                          <Input
                            type="number"
                            placeholder="Contribuir"
                            className="h-8 text-xs"
                            value={contributeAmounts[goal.id] || ""}
                            onChange={(e) =>
                              setContributeAmounts((prev) => ({
                                ...prev,
                                [goal.id]: e.target.value,
                              }))
                            }
                          />
                          <Button
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleContribute(goal.id)}
                            disabled={!contributeAmounts[goal.id]}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            OK
                          </Button>
                        </div>
                      ) : (
                        <div className="pt-3 text-sm text-green-600 dark:text-green-500 font-medium text-center w-full">
                          🎉 Meta Concluída!
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

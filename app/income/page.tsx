"use client";

import { useState } from "react";
import { useFinanceStore } from "@/hooks/use-finance-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  updateBaseIncome,
  addExtraIncome,
  deleteExtraIncome,
} from "@/app/actions/finance";
import { toast } from "sonner";
import {
  formatCurrency,
  calculateTotalIncome,
} from "@/utils/finance-calculator";
import { Trash2 } from "lucide-react";

export default function IncomePage() {
  const { data, selectedYear, selectedMonth, refreshData } = useFinanceStore();

  // Local state for forms
  const [salary, setSalary] = useState<string>("");
  const [vr, setVr] = useState<string>("");
  const [extraDesc, setExtraDesc] = useState("");
  const [extraAmount, setExtraAmount] = useState("");
  const [isUpdatingBase, setIsUpdatingBase] = useState(false);
  const [isAddingExtra, setIsAddingExtra] = useState(false);

  if (!data) return null;

  const monthData = data.months[selectedMonth] || {
    income: { salary: 0, vr: 0, extra: [] },
  };
  const totalIncome = calculateTotalIncome(monthData.income);

  // Sync local state when month/data changes
  // It's better to use initial values on load or controlled inputs
  // We'll update the initial state in a useEffect or directly use monthData if local is empty?
  // Let's use controlled with a "save" button that compares with original.

  const handleUpdateBase = async () => {
    setIsUpdatingBase(true);
    try {
      const parsedSalary = parseFloat(salary.replace(",", "."));
      const parsedVr = parseFloat(vr.replace(",", "."));

      const newSalary = isNaN(parsedSalary)
        ? monthData.income.salary
        : parsedSalary;
      const newVr = isNaN(parsedVr) ? monthData.income.vr : parsedVr;

      await updateBaseIncome(selectedYear, selectedMonth, newSalary, newVr);
      await refreshData();
      toast.success("Renda base atualizada com sucesso!");
      setSalary("");
      setVr("");
    } catch (e) {
      toast.error("Erro ao atualizar renda.");
    } finally {
      setIsUpdatingBase(false);
    }
  };

  const handleAddExtra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraDesc || !extraAmount) return;

    setIsAddingExtra(true);
    try {
      const amount = parseFloat(extraAmount.replace(",", "."));
      if (isNaN(amount) || amount <= 0) throw new Error("Valor inválido");

      await addExtraIncome(selectedYear, selectedMonth, {
        id: crypto.randomUUID(),
        description: extraDesc,
        amount,
      });
      await refreshData();
      toast.success("Renda extra adicionada!");
      setExtraDesc("");
      setExtraAmount("");
    } catch (e) {
      toast.error("Erro ao adicionar renda extra. Verifique o valor.");
    } finally {
      setIsAddingExtra(false);
    }
  };

  const handleDeleteExtra = async (id: string) => {
    try {
      await deleteExtraIncome(selectedYear, selectedMonth, id);
      await refreshData();
      toast.success("Renda extra removida!");
    } catch (e) {
      toast.error("Erro ao remover.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Renda</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie seus ganhos mensais.
          </p>
        </div>
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-4">
            <div className="text-sm opacity-80">Renda Total do Mês</div>
            <div className="text-2xl font-bold">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Renda Base</CardTitle>
            <CardDescription>
              Atualize seu salário e benefícios fixos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>
                Salário Atual: {formatCurrency(monthData.income.salary || 0)}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Novo Salário"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                Vale Refeição / Alimentação:{" "}
                {formatCurrency(monthData.income.vr || 0)}
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Novo VR/VA"
                  value={vr}
                  onChange={(e) => setVr(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleUpdateBase}
              className="w-full mt-4"
              disabled={isUpdatingBase || (!salary && !vr)}
            >
              Atualizar Renda Base
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nova Renda Extra</CardTitle>
            <CardDescription>
              Adicione bônus, freelas ou outros ganhos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddExtra} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="desc">Descrição</Label>
                <Input
                  id="desc"
                  placeholder="Ex: Trabalho Freelancer"
                  value={extraDesc}
                  onChange={(e) => setExtraDesc(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={extraAmount}
                  onChange={(e) => setExtraAmount(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isAddingExtra} className="w-full">
                Adicionar Extra
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Rendas Extras</CardTitle>
        </CardHeader>
        <CardContent>
          {monthData.income.extra.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma renda extra adicionada neste mês.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[80px] text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthData.income.extra.map((extra) => (
                  <TableRow key={extra.id}>
                    <TableCell className="font-medium">
                      {extra.description}
                    </TableCell>
                    <TableCell className="text-right text-green-600 dark:text-green-500 font-medium">
                      {formatCurrency(extra.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteExtra(extra.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addExpense, deleteExpense } from "@/app/actions/finance";
import { toast } from "sonner";
import {
  formatCurrency,
  calculateTotalExpenses,
} from "@/utils/finance-calculator";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2 } from "lucide-react";

export default function ExpensesPage() {
  const { data, selectedYear, selectedMonth, refreshData } = useFinanceStore();

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<
    "essential_fixed" | "nonessential_fixed" | "variable"
  >("essential_fixed");
  const [isAdding, setIsAdding] = useState(false);

  if (!data) return null;

  const monthData = data.months[selectedMonth] || {
    expenses: { essential_fixed: [], nonessential_fixed: [], variable: [] },
  };
  const totalExpenses = calculateTotalExpenses(monthData.expenses);

  // Flatten for table display
  const allExpenses = [
    ...(monthData.expenses.essential_fixed || []).map((e) => ({
      ...e,
      categoryLabel: "Fixo Essencial",
    })),
    ...(monthData.expenses.nonessential_fixed || []).map((e) => ({
      ...e,
      categoryLabel: "Fixo Não Essencial",
    })),
    ...(monthData.expenses.variable || []).map((e) => ({
      ...e,
      categoryLabel: "Variável",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || !date) return;

    setIsAdding(true);
    try {
      const parsedAmount = parseFloat(amount.replace(",", "."));
      if (isNaN(parsedAmount) || parsedAmount <= 0)
        throw new Error("Valor inválido");

      await addExpense(selectedYear, selectedMonth, {
        id: crypto.randomUUID(),
        description: desc,
        amount: parsedAmount,
        date: date,
        category: category,
      });
      await refreshData();
      toast.success("Despesa adicionada!");
      setDesc("");
      setAmount("");
      setDate("");
    } catch (e) {
      toast.error("Erro ao adicionar. Verifique os dados.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteExpense = async (id: string, cat: string) => {
    try {
      await deleteExpense(selectedYear, selectedMonth, cat as any, id);
      await refreshData();
      toast.success("Despesa removida!");
    } catch (e) {
      toast.error("Erro ao remover despesa.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gastos</h2>
          <p className="text-muted-foreground mt-1">
            Registre e acompanhe suas despesas.
          </p>
        </div>
        <Card className="bg-destructive text-destructive-foreground">
          <CardContent className="py-4">
            <div className="text-sm opacity-80">Gasto Total do Mês</div>
            <div className="text-2xl font-bold">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Nova Despesa</CardTitle>
            <CardDescription>Insira os detalhes do gasto</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="desc">Descrição</Label>
                <Input
                  id="desc"
                  placeholder="Ex: Conta de Luz"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={category}
                  onValueChange={(val: any) => setCategory(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essential_fixed">
                      Fixo Essencial (Necessidade)
                    </SelectItem>
                    <SelectItem value="nonessential_fixed">
                      Fixo Não Essencial (Desejo)
                    </SelectItem>
                    <SelectItem value="variable">
                      Variável (Lazer, Compras)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isAdding} className="w-full mt-2">
                Adicionar Despesa
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Despesas</CardTitle>
            <CardDescription>
              Todas as despesas de {selectedMonth}/{selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allExpenses.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Nenhuma despesa registrada neste mês.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(parseISO(expense.date), "dd 'de' MMM", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {expense.description}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            {expense.categoryLabel}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDeleteExpense(expense.id, expense.category)
                            }
                            className="text-muted-foreground hover:text-red-600 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

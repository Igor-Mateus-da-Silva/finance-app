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
import { addTransactionAction } from "@/app/actions/transactions";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/finance-calculator";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, ShoppingCart } from "lucide-react";

export default function ExpensesPage() {
  const { 
    transactions, 
    categories, 
    selectedYear, 
    selectedMonth, 
    refreshData, 
    deleteTransactionOptimistic 
  } = useFinanceStore();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Filtramos as despesas do mês selecionado
  const expenseTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return (
      t.type === "EXPENSE" &&
      d.getMonth() === selectedMonth &&
      d.getFullYear() === selectedYear
    );
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || !categoryId) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    setIsAdding(true);
    try {
      const parsedAmount = Number(amount.replace(",", "."));
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("O valor deve ser um número positivo.");
      }

      const result = await addTransactionAction({
        description,
        amount: parsedAmount,
        date: new Date(date),
        type: "EXPENSE",
        categoryId,
      });

      if (result.success) {
        await refreshData();
        toast.success("Despesa adicionada com sucesso!");
        setDescription("");
        setAmount("");
        setDate("");
        setCategoryId("");
      } else {
        throw new Error(result.message);
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao adicionar despesa.");
    } finally {
      setIsAdding(false);
    }
  };

  const expenseCategories = categories.filter(c => 
    !["Salário", "Freelance", "Renda Extra", "Investimentos"].includes(c.name)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gastos</h2>
          <p className="text-muted-foreground mt-1">
            Registre e acompanhe suas despesas no PostgreSQL.
          </p>
        </div>
        <Card className="bg-destructive text-destructive-foreground">
          <CardContent className="py-4 flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm opacity-80">Gasto Total do Mês</div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalExpenses)}
              </div>
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                <Select value={categoryId} onValueChange={(val) => setCategoryId(val ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.length > 0 ? (
                      expenseCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isAdding} className="w-full mt-2">
                {isAdding ? "Adicionando..." : "Adicionar Despesa"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Despesas</CardTitle>
            <CardDescription>
              Todas as despesas de {selectedMonth + 1}/{selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenseTransactions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-12 border-2 border-dashed rounded-lg">
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
                    {expenseTransactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(t.date), "dd 'de' MMM", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {t.description}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                            {t.category?.name || "Sem categoria"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold text-red-600 dark:text-red-500">
                          {formatCurrency(t.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTransactionOptimistic(t.id)}
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

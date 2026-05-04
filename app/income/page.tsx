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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addTransactionAction } from "@/app/actions/transactions";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/finance-calculator";
import { Trash2, Wallet } from "lucide-react";

export default function IncomePage() {
  const { 
    transactions, 
    categories, 
    selectedYear, 
    selectedMonth, 
    refreshData, 
    deleteTransactionOptimistic 
  } = useFinanceStore();

  // Estados locais para os formulários
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Filtramos as receitas do mês selecionado
  const incomeTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return (
      t.type === "INCOME" &&
      date.getMonth() === selectedMonth &&
      date.getFullYear() === selectedYear
    );
  });

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !categoryId) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    setIsAdding(true);
    try {
      const parsedAmount = Number(amount.replace(",", "."));
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("O valor deve ser um número positivo.");
      }

      // Criamos a transação para o dia 1 do mês selecionado (simplificação)
      const date = new Date(selectedYear, selectedMonth, 1);

      const result = await addTransactionAction({
        description,
        amount: parsedAmount,
        date,
        type: "INCOME",
        categoryId,
      });

      if (result.success) {
        await refreshData();
        toast.success("Receita adicionada com sucesso!");
        setDescription("");
        setAmount("");
        setCategoryId("");
      } else {
        throw new Error(result.message);
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao adicionar receita.");
    } finally {
      setIsAdding(false);
    }
  };

  const incomeCategories = categories.filter(c => 
    ["Salário", "Freelance", "Renda Extra", "Investimentos", "Venda", "Bônus"].includes(c.name) || 
    c.name.toLowerCase().includes("renda") || 
    c.name.toLowerCase().includes("ganho")
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Renda</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie seus ganhos mensais no banco de dados.
          </p>
        </div>
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-4 flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm opacity-80">Renda Total do Mês</div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalIncome)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nova Receita</CardTitle>
            <CardDescription>
              Adicione salário, bônus ou qualquer entrada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddIncome} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="desc">Descrição</Label>
                <Input
                  id="desc"
                  placeholder="Ex: Salário Mensal"
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
                <Label htmlFor="category">Categoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeCategories.length > 0 ? (
                      incomeCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isAdding} className="w-full">
                {isAdding ? "Adicionando..." : "Adicionar Receita"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Receitas</CardTitle>
            <CardDescription>
              Entradas registradas para este período.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {incomeTransactions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Nenhuma receita encontrada.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomeTransactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">
                          {t.description}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                            {t.category?.name || "Sem categoria"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-green-600 dark:text-green-500 font-bold">
                          {formatCurrency(t.amount)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTransactionOptimistic(t.id)}
                            className="text-muted-foreground hover:text-red-500"
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

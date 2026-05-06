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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Moon, Plus, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { createCategoryAction } from "@/app/actions/categories";

export default function SettingsPage() {
  const { transactions, goals, selectedYear, user, addCategory } =
    useFinanceStore();
  const { theme, setTheme } = useTheme();

  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  const handleExport = () => {
    const exportData = {
      year: selectedYear,
      transactions,
      goals,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_financeiro_${selectedYear}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Dados exportados com sucesso!");
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("O nome da categoria não pode estar vazio.");
      return;
    }

    setIsCreatingCat(true);
    try {
      const result = await createCategoryAction(newCatName.trim(), newCatType);
      if (result.success && result.data) {
        addCategory(result.data);
        toast.success("Categoria criada com sucesso!");
        setNewCatName("");
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar categoria.");
    } finally {
      setIsCreatingCat(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground mt-1">
          Gerencie suas preferências e exporte seus dados do banco de dados.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>
              Altere o tema visual do aplicativo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Escolha o Tema</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-4 w-4 mr-2" /> Claro
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-4 w-4 mr-2" /> Escuro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exportar Dados</CardTitle>
            <CardDescription>
              Baixe uma cópia dos seus dados do ano {selectedYear} salvos no
              PostgreSQL.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleExport} className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar JSON de {selectedYear}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Gestão de Categorias</CardTitle>
            <CardDescription>
              Crie novas categorias de Renda ou Gastos para organizar suas
              finanças.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleCreateCategory}
              className="flex flex-col sm:flex-row gap-4 items-end"
            >
              <div className="space-y-2 flex-1">
                <Label htmlFor="catName">Nome da Categoria</Label>
                <Input
                  id="catName"
                  placeholder="Ex: Aluguel, Supermercado..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  disabled={isCreatingCat}
                  className="h-10"
                />
              </div>
              <div className="space-y-2 w-full sm:w-48">
                <Label>Tipo</Label>
                <Select
                  value={newCatType}
                  onValueChange={(val: "INCOME" | "EXPENSE") =>
                    setNewCatType(val)
                  }
                  disabled={isCreatingCat}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Renda (Receita)</SelectItem>
                    <SelectItem value="EXPENSE">Gasto (Despesa)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={isCreatingCat}
                className="w-full sm:w-auto h-10"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-muted/30 border-dashed">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Sobre seus dados</CardTitle>
              <CardDescription>
                Usuário logado: <strong>{user?.name || "Buscando..."}</strong> (
                {user?.email || "..."})
                <br />
                Seus dados estão armazenados com segurança no Neon PostgreSQL. O
                sistema de backup manual foi substituído pela exportação de
                dados para compatibilidade.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

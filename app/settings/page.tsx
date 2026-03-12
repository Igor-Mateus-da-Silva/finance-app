"use client";

import { useState, useRef } from "react";
import { useFinanceStore } from "@/hooks/use-finance-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { importYearlyData } from "@/app/actions/settings";
import { toast } from "sonner";
import { Download, Upload, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { data, selectedYear, refreshData } = useFinanceStore();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleDownload = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financas_${selectedYear}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Backup do ano baixado com sucesso!");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const result = await importYearlyData(selectedYear, text);

      if (result.success) {
        await refreshData();
        toast.success(`Dados de ${selectedYear} importados com sucesso!`);
      } else {
        toast.error(`Erro ao importar: ${result.error}`);
      }
    } catch (err) {
      toast.error("Erro na leitura do arquivo.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground mt-1">
          Gerencie seus dados e preferências.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>Altere o tema do aplicativo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Tema Atual</Label>
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
            <CardTitle>Backup de Dados ({selectedYear})</CardTitle>
            <CardDescription>
              Seus dados são salvos localmente no servidor em formato JSON. Você
              pode fazer o download como backup de segurança.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleDownload}
              className="w-full"
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar JSON do Ano {selectedYear}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Restaurar Dados</CardTitle>
            <CardDescription>
              Importe um arquivo JSON para substituir os dados do ano{" "}
              {selectedYear}. CUIDADO: Isso sobrescreverá os dados atuais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              accept=".json"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImport}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="destructive"
              className="w-full"
              disabled={isImporting}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? "Importando..." : "Importar Arquivo JSON"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useFinanceStore } from "@/hooks/use-finance-store";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Exemplo de Componente que demonstra o Update Otimista.
 * Quando o usuário clica em excluir, o item some da tela ANTES
 * da resposta do servidor chegar.
 */
export function TransactionListOptimistic() {
  const { transactions, isLoading, deleteTransactionOptimistic } = useFinanceStore();

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados do banco...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <p className="text-center text-muted-foreground">Nenhuma transação encontrada.</p>
      ) : (
        transactions.map((transaction) => (
          <div 
            key={transaction.id} 
            className="flex items-center justify-between p-4 bg-card border rounded-lg shadow-sm transition-all hover:shadow-md"
          >
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(transaction.date), "dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className={transaction.type === "INCOME" ? "text-green-600" : "text-red-600"}>
                {transaction.type === "INCOME" ? "+" : "-"} 
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(transaction.amount))}
              </span>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:bg-destructive/10"
                onClick={() => deleteTransactionOptimistic(transaction.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

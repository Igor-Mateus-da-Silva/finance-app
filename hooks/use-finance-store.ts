import { create } from "zustand";
import { Transaction } from "@prisma/client";
import { getTransactions, deleteTransactionAction } from "@/app/actions/transactions";
import { toast } from "sonner";

interface FinanceState {
  selectedYear: number;
  selectedMonth: number; // Agora usamos número (0-11) para bater com Date
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setYear: (year: number) => Promise<void>;
  setMonth: (month: number) => void;
  loadTransactions: () => Promise<void>;
  
  // Atualização Otimista: Excluir
  deleteTransactionOptimistic: (id: string) => Promise<void>;
}

const getCurrentYear = () => new Date().getFullYear();
const getCurrentMonth = () => new Date().getMonth();

export const useFinanceStore = create<FinanceState>((set, get) => ({
  selectedYear: getCurrentYear(),
  selectedMonth: getCurrentMonth(),
  transactions: [],
  isLoading: false,
  error: null,

  setYear: async (year: number) => {
    set({ selectedYear: year });
    await get().loadTransactions();
  },

  setMonth: (month: number) => {
    set({ selectedMonth: month });
  },

  loadTransactions: async () => {
    const { selectedYear } = get();
    set({ isLoading: true, error: null });
    
    const result = await getTransactions(selectedYear);
    
    if (result.success && result.data) {
      set({ transactions: result.data as Transaction[], isLoading: false });
    } else {
      set({ error: result.message || "Erro ao carregar", isLoading: false });
      toast.error(result.message || "Falha ao sincronizar com o banco.");
    }
  },

  /**
   * Exemplo de Atualização Otimista para Exclusão
   */
  deleteTransactionOptimistic: async (id: string) => {
    const { transactions } = get();
    // 1. Guardamos o estado anterior para o caso de erro (Rollback)
    const previousTransactions = [...transactions];

    // 2. Atualizamos o estado local INSTANTANEAMENTE (Otimismo)
    set({
      transactions: transactions.filter((t) => t.id !== id),
    });

    try {
      // 3. Chamamos o servidor em segundo plano
      const result = await deleteTransactionAction(id);

      if (!result.success) {
        // Se o servidor recusar, voltamos os dados (Rollback)
        set({ transactions: previousTransactions });
        toast.error(result.message || "Não foi possível excluir no servidor.");
      } else {
        toast.success("Excluído com sucesso!");
      }
    } catch (error) {
      // Em caso de erro de rede, também fazemos Rollback
      set({ transactions: previousTransactions });
      toast.error("Erro de conexão. A transação foi restaurada.");
    }
  },
}));

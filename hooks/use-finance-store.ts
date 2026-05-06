import { create } from "zustand";
import { getTransactions, deleteTransactionAction } from "@/app/actions/transactions";
import { getCategoriesAction } from "@/app/actions/categories";
import { getGoalsAction, deleteGoalAction } from "@/app/actions/goals";
import { getUserProfileAction } from "@/app/actions/user";
import { SerializedTransaction, SerializedCategory, SerializedGoal } from "@/types/serialized";
import { toast } from "sonner";

interface FinanceState {
  selectedYear: number;
  selectedMonth: number;
  transactions: SerializedTransaction[];
  categories: SerializedCategory[];
  goals: SerializedGoal[];
  isLoading: boolean;
  error: string | null;

  user: { name: string; email: string } | null;

  // Actions
  setYear: (year: number) => Promise<void>;
  setMonth: (month: number) => void;
  loadUser: () => Promise<void>;
  loadTransactions: () => Promise<void>;
  loadCategories: () => Promise<void>;
  addCategory: (category: SerializedCategory) => void;
  loadGoals: () => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Atualização Otimista: Excluir
  deleteTransactionOptimistic: (id: string) => Promise<void>;
}

const getCurrentYear = () => new Date().getFullYear();
const getCurrentMonth = () => new Date().getMonth();

export const useFinanceStore = create<FinanceState>((set, get) => ({
  selectedYear: getCurrentYear(),
  selectedMonth: getCurrentMonth(),
  transactions: [],
  categories: [],
  goals: [],
  user: null,
  isLoading: false,
  error: null,

  loadUser: async () => {
    const result = await getUserProfileAction();
    if (result.success && result.data) {
      set({ user: { name: result.data.name || "Usuário", email: result.data.email } });
    }
  },

  addCategory: (category) => {
    set((state) => ({ categories: [...state.categories, category] }));
  },

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
      set({ transactions: result.data as unknown as SerializedTransaction[], isLoading: false });
    } else {
      set({ error: result.message || "Erro ao carregar", isLoading: false });
      toast.error(result.message || "Falha ao sincronizar com o banco.");
    }
  },

  loadCategories: async () => {
    const result = await getCategoriesAction();
    if (result.success && result.data) {
      set({ categories: result.data as SerializedCategory[] });
    } else {
      toast.error(result.message || "Falha ao carregar categorias.");
    }
  },

  loadGoals: async () => {
    const result = await getGoalsAction();
    if (result.success && result.data) {
      set({ goals: result.data as unknown as SerializedGoal[] });
    }
  },

  refreshData: async () => {
    await Promise.all([
      get().loadUser(),
      get().loadTransactions(), 
      get().loadCategories(),
      get().loadGoals()
    ]);
  },

  /**
   * Exemplo de Atualização Otimista para Exclusão
   */
  deleteTransactionOptimistic: async (id: string) => {
    const { transactions } = get();
    const previousTransactions = [...transactions];

    set({
      transactions: transactions.filter((t) => t.id !== id),
    });

    try {
      const result = await deleteTransactionAction(id);

      if (!result.success) {
        set({ transactions: previousTransactions });
        toast.error(result.message || "Não foi possível excluir no servidor.");
      } else {
        toast.success("Excluído com sucesso!");
      }
    } catch (_error) {
      set({ transactions: previousTransactions });
      toast.error("Erro de conexão. A transação foi restaurada.");
    }
  },
}));

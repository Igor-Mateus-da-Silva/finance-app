import { create } from "zustand";
import { YearlyData } from "@/types";
import { fetchYear } from "@/app/actions/finance";

interface FinanceState {
  selectedYear: number;
  selectedMonth: string;
  data: YearlyData | null;
  isLoading: boolean;

  // Actions
  setYear: (year: number) => Promise<void>;
  setMonth: (month: string) => void;
  loadInitialData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const getCurrentYear = () => new Date().getFullYear();
const getCurrentMonth = () => (new Date().getMonth() + 1).toString();

export const useFinanceStore = create<FinanceState>((set, get) => ({
  selectedYear: getCurrentYear(),
  selectedMonth: getCurrentMonth(),
  data: null,
  isLoading: true,

  setYear: async (year: number) => {
    set({ selectedYear: year, isLoading: true });
    try {
      const data = await fetchYear(year);
      set({ data, isLoading: false });
    } catch (error) {
      console.error("Failed to load year data", error);
      set({ isLoading: false });
    }
  },

  setMonth: (month: string) => {
    set({ selectedMonth: month });
  },

  loadInitialData: async () => {
    const { selectedYear } = get();
    set({ isLoading: true });
    try {
      const data = await fetchYear(selectedYear);
      set({ data, isLoading: false });
    } catch (error) {
      console.error("Failed to load initial data", error);
      set({ isLoading: false });
    }
  },

  refreshData: async () => {
    const { selectedYear } = get();
    try {
      const data = await fetchYear(selectedYear);
      set({ data });
    } catch (error) {
      console.error("Failed to refresh data", error);
    }
  },
}));

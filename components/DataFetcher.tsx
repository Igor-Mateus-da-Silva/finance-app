"use client";

import { useEffect, useRef } from "react";
import { useFinanceStore } from "@/hooks/use-finance-store";

export function DataFetcher() {
  const { selectedYear, loadTransactions, loadCategories, loadGoals, loadUser, setYear } = useFinanceStore();
  const loadedYear = useRef<number | null>(null);
  const hasLoadedInitial = useRef(false);

  useEffect(() => {
    if (loadedYear.current !== selectedYear) {
      // Sempre carregamos as transações do novo ano selecionado
      loadTransactions();
      
      // Apenas carrega dados globais na montagem inicial
      if (!hasLoadedInitial.current) {
        loadUser();
        loadCategories();
        loadGoals();
        hasLoadedInitial.current = true;
      }
      
      loadedYear.current = selectedYear;
    }
  }, [selectedYear, loadTransactions, loadCategories, loadGoals, loadUser]);

  return null;
}

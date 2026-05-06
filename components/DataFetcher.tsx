"use client";

import { useEffect, useRef } from "react";
import { useFinanceStore } from "@/hooks/use-finance-store";

export function DataFetcher() {
  const { selectedYear, loadTransactions, loadCategories, loadGoals, setYear } = useFinanceStore();
  const loadedYear = useRef<number | null>(null);

  useEffect(() => {
    if (loadedYear.current !== selectedYear) {
      // Sempre carregamos as transações do novo ano selecionado
      loadTransactions();
      
      // Categorias e Metas carregamos apenas na primeira vez (são globais)
      if (loadedYear.current === null) {
        loadCategories();
        loadGoals();
      }
      
      loadedYear.current = selectedYear;
    }
  }, [selectedYear, loadTransactions, loadCategories, loadGoals]);

  return null;
}

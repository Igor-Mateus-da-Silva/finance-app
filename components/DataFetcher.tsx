"use client";

import { useEffect, useRef } from "react";
import { useFinanceStore } from "@/hooks/use-finance-store";

export function DataFetcher() {
  const { selectedYear, loadTransactions, loadCategories, loadGoals, setYear } = useFinanceStore();
  const loadedYear = useRef<number | null>(null);

  useEffect(() => {
    if (loadedYear.current !== selectedYear) {
      // Carregamos as transações e as categorias na primeira vez ou quando o ano muda.
      if (loadedYear.current === null) {
        loadTransactions();
        loadCategories();
        loadGoals();
      }
      loadedYear.current = selectedYear;
    }
  }, [selectedYear, loadTransactions, loadCategories, loadGoals]);

  return null;
}

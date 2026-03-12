"use client";

import { useEffect, useRef } from "react";
import { useFinanceStore } from "@/hooks/use-finance-store";

export function DataFetcher() {
  const { selectedYear, loadInitialData, setYear } = useFinanceStore();
  const loadedYear = useRef<number | null>(null);

  useEffect(() => {
    if (loadedYear.current !== selectedYear) {
      // Actually setYear already fetches data inside the store, but on very first load:
      if (loadedYear.current === null) {
        loadInitialData();
      }
      loadedYear.current = selectedYear;
    }
  }, [selectedYear, loadInitialData]);

  return null;
}

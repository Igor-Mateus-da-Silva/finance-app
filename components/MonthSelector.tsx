"use client";

import { useFinanceStore } from "@/hooks/use-finance-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  { value: "0", label: "Janeiro" },
  { value: "1", label: "Fevereiro" },
  { value: "2", label: "Março" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Maio" },
  { value: "5", label: "Junho" },
  { value: "6", label: "Julho" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" },
  { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" },
  { value: "11", label: "Dezembro" },
];

export function MonthSelector() {
  const { selectedYear, selectedMonth, setYear, setMonth } = useFinanceStore();
  const currentYear = new Date().getFullYear();

  // Allow creating years from current year onwards up to +5 years for planning
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear + i);
  // Also include the currently selected year if it's somehow in the past
  if (!availableYears.includes(selectedYear)) {
    availableYears.unshift(selectedYear);
  }

  const handlePrevMonth = () => {
    let m = selectedMonth;
    let y = selectedYear;
    if (m === 0) {
      m = 11;
      y = y - 1;
      setYear(y);
    } else {
      m = m - 1;
    }
    setMonth(m);
  };

  const handleNextMonth = () => {
    let m = selectedMonth;
    let y = selectedYear;
    if (m === 11) {
      m = 0;
      y = y + 1;
      setYear(y);
    } else {
      m = m + 1;
    }
    setMonth(m);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="icon" onClick={handlePrevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Select
        value={selectedMonth.toString()}
        onValueChange={(val) => {
          if (val !== null) setMonth(parseInt(val));
        }}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Mês">
            {MONTHS.find((m) => m.value === selectedMonth.toString())?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedYear.toString()}
        onValueChange={(val) => {
          if (val !== null) setYear(parseInt(val));
        }}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {availableYears
            .sort((a, b) => a - b)
            .map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="icon" onClick={handleNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

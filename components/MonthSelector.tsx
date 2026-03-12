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
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

export function MonthSelector() {
  const { selectedYear, selectedMonth, setYear, setMonth } = useFinanceStore();
  const currentYear = new Date().getFullYear();

  // Allow creating years from current year onwards up to +5 years for planning
  // Wait, the requirement says "permitir criar apenas anos do ano atual para frente"
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear + i);
  // Also include the currently selected year if it's somehow in the past (e.g., viewing history)
  if (!availableYears.includes(selectedYear)) {
    availableYears.unshift(selectedYear);
  }

  const handlePrevMonth = () => {
    let m = parseInt(selectedMonth);
    let y = selectedYear;
    if (m === 1) {
      m = 12;
      y = y - 1;
      setYear(y);
    } else {
      m = m - 1;
    }
    setMonth(m.toString());
  };

  const handleNextMonth = () => {
    let m = parseInt(selectedMonth);
    let y = selectedYear;
    if (m === 12) {
      m = 1;
      y = y + 1;
      setYear(y);
    } else {
      m = m + 1;
    }
    setMonth(m.toString());
  };

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="icon" onClick={handlePrevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Select
        value={selectedMonth}
        onValueChange={(val) => {
          if (val) setMonth(val);
        }}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Mês" />
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
          if (val) setYear(parseInt(val));
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

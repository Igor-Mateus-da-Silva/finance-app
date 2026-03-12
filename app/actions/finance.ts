"use server";

import { revalidatePath } from "next/cache";
import { getYearlyData, saveYearlyData } from "@/utils/json-storage";
import { Expense, IncomeExtra, YearlyData } from "@/types";

export async function fetchYear(year: number): Promise<YearlyData> {
  return await getYearlyData(year);
}

export async function updateBaseIncome(
  year: number,
  month: string,
  salary: number,
  vr: number,
) {
  const data = await getYearlyData(year);
  if (!data.months[month]) {
    // Just in case, handled by storage but let's be safe
    data.months[month] = {
      income: { salary: 0, vr: 0, extra: [] },
      expenses: { essential_fixed: [], nonessential_fixed: [], variable: [] },
    };
  }

  data.months[month].income.salary = salary;
  data.months[month].income.vr = vr;

  await saveYearlyData(year, data);
  revalidatePath("/");
  return data;
}

export async function addExtraIncome(
  year: number,
  month: string,
  extra: IncomeExtra,
) {
  const data = await getYearlyData(year);
  data.months[month].income.extra.push(extra);
  await saveYearlyData(year, data);
  revalidatePath("/");
  return data;
}

export async function deleteExtraIncome(
  year: number,
  month: string,
  id: string,
) {
  const data = await getYearlyData(year);
  data.months[month].income.extra = data.months[month].income.extra.filter(
    (e) => e.id !== id,
  );
  await saveYearlyData(year, data);
  revalidatePath("/");
  return data;
}

export async function addExpense(
  year: number,
  month: string,
  expense: Expense,
) {
  const data = await getYearlyData(year);
  // category is e.g 'essential_fixed'
  const categoryStr = expense.category as
    | "essential_fixed"
    | "nonessential_fixed"
    | "variable";

  if (!data.months[month].expenses[categoryStr]) {
    data.months[month].expenses[categoryStr] = [];
  }

  data.months[month].expenses[categoryStr].push(expense);
  await saveYearlyData(year, data);
  revalidatePath("/");
  return data;
}

export async function deleteExpense(
  year: number,
  month: string,
  category: "essential_fixed" | "nonessential_fixed" | "variable",
  id: string,
) {
  const data = await getYearlyData(year);
  data.months[month].expenses[category] = data.months[month].expenses[
    category
  ].filter((e) => e.id !== id);
  await saveYearlyData(year, data);
  revalidatePath("/");
  return data;
}

export async function updateExpense(
  year: number,
  month: string,
  category: "essential_fixed" | "nonessential_fixed" | "variable",
  updatedExpense: Expense,
) {
  const data = await getYearlyData(year);
  const index = data.months[month].expenses[category].findIndex(
    (e) => e.id === updatedExpense.id,
  );
  if (index !== -1) {
    data.months[month].expenses[category][index] = updatedExpense;
    await saveYearlyData(year, data);
    revalidatePath("/");
  }
  return data;
}

"use server";

import { revalidatePath } from "next/cache";
import { getYearlyData, saveYearlyData } from "@/utils/json-storage";
import { Goal } from "@/types";

export async function addGoal(year: number, month: string, goal: Goal) {
  const data = await getYearlyData(year);
  if (!data.months[month].goals) {
    data.months[month].goals = [];
  }
  data.months[month].goals.push(goal);
  await saveYearlyData(year, data);
  revalidatePath("/");
  return data;
}

export async function updateGoalAmount(
  year: number,
  id: string,
  addedAmount: number,
) {
  const data = await getYearlyData(year);

  // Scan all months to find the goal
  for (const month of Object.values(data.months)) {
    const goal = month.goals?.find((g) => g.id === id);
    if (goal) {
      goal.currentAmount += addedAmount;
      await saveYearlyData(year, data);
      revalidatePath("/");
      return data;
    }
  }
  return data;
}

export async function deleteGoal(year: number, id: string) {
  const data = await getYearlyData(year);

  // Scan all months to remove the goal
  for (const month of Object.values(data.months)) {
    if (month.goals) {
      const initialLength = month.goals.length;
      month.goals = month.goals.filter((g) => g.id !== id);
      if (month.goals.length !== initialLength) {
        await saveYearlyData(year, data);
        revalidatePath("/");
        return data;
      }
    }
  }
  return data;
}

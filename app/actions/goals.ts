"use server";

import { revalidatePath } from "next/cache";
import { getYearlyData, saveYearlyData } from "@/utils/json-storage";
import { Goal } from "@/types";

export async function addGoal(year: number, goal: Goal) {
  const data = await getYearlyData(year);
  if (!data.goals) data.goals = [];
  data.goals.push(goal);
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
  if (!data.goals) return data;

  const goal = data.goals.find((g) => g.id === id);
  if (goal) {
    goal.currentAmount += addedAmount;
    await saveYearlyData(year, data);
    revalidatePath("/");
  }
  return data;
}

export async function deleteGoal(year: number, id: string) {
  const data = await getYearlyData(year);
  if (!data.goals) return data;

  data.goals = data.goals.filter((g) => g.id !== id);
  await saveYearlyData(year, data);
  revalidatePath("/");
  return data;
}

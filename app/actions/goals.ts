"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { GoalService } from "@/lib/services/goal.service";

/**
 * Helper para recuperar o userId dos headers
 */
async function getUserId() {
  const headerList = await headers();
  const userId = headerList.get("x-user-id");
  if (!userId) {
    throw new Error("Usuário não autenticado");
  }
  return userId;
}

/**
 * Ação para buscar todas as metas do usuário
 */
export async function getGoalsAction() {
  try {
    const userId = await getUserId();
    const data = await GoalService.getGoalsByUserId(userId);
    return { success: true, data };
  } catch (error) {
    return { success: false, message: "Falha ao carregar metas." };
  }
}

/**
 * Ação para criar uma nova meta
 */
export async function addGoalAction(data: any) {
  try {
    const userId = await getUserId();
    const newGoal = await GoalService.createGoal(userId, data);
    revalidatePath("/planning");
    return { success: true, data: newGoal };
  } catch (error) {
    return { success: false, message: "Erro ao salvar meta." };
  }
}

/**
 * Ação para contribuir com um valor para a meta
 */
export async function updateGoalAmountAction(id: string, amount: number) {
  try {
    const userId = await getUserId();
    const updated = await GoalService.updateGoalAmount(id, userId, amount);
    revalidatePath("/planning");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, message: "Erro ao atualizar meta." };
  }
}

/**
 * Ação para excluir uma meta
 */
export async function deleteGoalAction(id: string) {
  try {
    const userId = await getUserId();
    await GoalService.deleteGoal(id, userId);
    revalidatePath("/planning");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Erro ao excluir meta." };
  }
}

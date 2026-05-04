import prisma from "@/lib/prisma";
import { Goal } from "@prisma/client";

/**
 * Função para serializar objetos Goal convertendo Decimal para number.
 */
function serializeGoal(g: any): any {
  return {
    ...g,
    targetAmount: typeof g.targetAmount === "object" && g.targetAmount !== null
      ? g.targetAmount.toNumber()
      : Number(g.targetAmount),
    currentAmount: typeof g.currentAmount === "object" && g.currentAmount !== null
      ? g.currentAmount.toNumber()
      : Number(g.currentAmount),
  };
}

/**
 * Serviço responsável por gerenciar as metas financeiras no banco de dados.
 */
export const GoalService = {
  async getGoalsByUserId(userId: string): Promise<Goal[]> {
    try {
      const goals = await prisma.goal.findMany({
        where: { userId },
        orderBy: { deadline: "asc" },
      });
      return goals.map(serializeGoal);
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
      throw new Error("Erro ao carregar metas.");
    }
  },

  async createGoal(userId: string, data: any): Promise<Goal> {
    try {
      const created = await prisma.goal.create({
        data: {
          ...data,
          userId,
        },
      });
      return serializeGoal(created);
    } catch (error) {
      console.error("Erro ao criar meta:", error);
      throw new Error("Erro ao criar meta.");
    }
  },

  async updateGoalAmount(id: string, userId: string, contribution: number): Promise<Goal> {
    try {
      const goal = await prisma.goal.findFirst({
        where: { id, userId },
      });

      if (!goal) throw new Error("Meta não encontrada.");

      const updated = await prisma.goal.update({
        where: { id },
        data: {
          currentAmount: { increment: contribution },
        },
      });
      return serializeGoal(updated);
    } catch (error) {
      console.error("Erro ao atualizar meta:", error);
      throw new Error("Erro ao atualizar valor da meta.");
    }
  },

  async deleteGoal(id: string, userId: string): Promise<void> {
    try {
      await prisma.goal.deleteMany({
        where: { id, userId },
      });
    } catch (error) {
      console.error("Erro ao excluir meta:", error);
      throw new Error("Erro ao excluir meta.");
    }
  },
};

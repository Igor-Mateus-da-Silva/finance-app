import { Transaction, Category, Goal } from "@prisma/client";

/**
 * Versão serializada da Transação para uso no Frontend.
 * O Prisma retorna Decimal, mas o Next.js exige tipos planos (number).
 */
export type SerializedTransaction = Omit<Transaction, "amount"> & {
  amount: number;
  category?: { id: string; name: string; userId: string } | null;
};

/**
 * Versão serializada da Categoria.
 */
export type SerializedCategory = Omit<Category, "type"> & {
  type: "INCOME" | "EXPENSE";
};

/**
 * Versão serializada da Meta Financeira.
 */
export type SerializedGoal = Omit<Goal, "targetAmount" | "currentAmount"> & {
  targetAmount: number;
  currentAmount: number;
};

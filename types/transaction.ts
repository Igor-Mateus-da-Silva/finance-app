import { TransactionType } from "@prisma/client";

/**
 * Interface para criação de uma nova transação.
 */
export interface CreateTransactionDTO {
  description: string;
  amount: number;
  date: Date;
  type: TransactionType;
  categoryId: string;
  userId: string; // Obrigatório para garantir o dono da transação.
}

/**
 * Interface para atualização de uma transação existente.
 * Todos os campos são opcionais, exceto os identificadores.
 */
export interface UpdateTransactionDTO {
  description?: string;
  amount?: number;
  date?: Date;
  type?: TransactionType;
  categoryId?: string;
}

/**
 * Interface para o resumo financeiro do mês.
 */
export interface TransactionSummary {
  totalIncomes: number;
  totalExpenses: number;
  balance: number;
}

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { TransactionService } from "@/lib/services/transaction.service";
import { CreateTransactionDTO, UpdateTransactionDTO } from "@/types/transaction";

/**
 * Helper para recuperar o userId dos headers (injetado pelo Middleware)
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
 * Ação para buscar transações de um ano específico
 */
export async function getTransactions(year: number) {
  try {
    const userId = await getUserId();
    const data = await TransactionService.getTransactionsByUserId(userId, year);
    return { success: true, data };
  } catch (_error) {
    return { success: false, message: "Falha ao carregar transações." };
  }
}

/**
 * Ação para adicionar uma nova transação (Receita ou Despesa)
 */
export async function addTransactionAction(data: Omit<CreateTransactionDTO, "userId">) {
  try {
    const userId = await getUserId();
    
    const newTransaction = await TransactionService.createTransaction({
      ...data,
      userId,
    });

    // Avisamos o Next.js que os dados mudaram e a página precisa ser atualizada
    revalidatePath("/");
    revalidatePath("/expenses");
    revalidatePath("/income");

    return { 
      success: true, 
      message: "Transação adicionada com sucesso!", 
      data: newTransaction 
    };
  } catch (error) {
    console.error("Erro na Action addTransaction:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro ao salvar transação." 
    };
  }
}

/**
 * Ação para atualizar uma transação existente
 */
export async function updateTransactionAction(id: string, data: UpdateTransactionDTO) {
  try {
    const userId = await getUserId();
    
    const updated = await TransactionService.updateTransaction(id, userId, data);

    revalidatePath("/");
    revalidatePath("/expenses");
    revalidatePath("/income");

    return { 
      success: true, 
      message: "Transação atualizada com sucesso!", 
      data: updated 
    };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro ao atualizar transação." 
    };
  }
}

/**
 * Ação para excluir uma transação
 */
export async function deleteTransactionAction(id: string) {
  try {
    const userId = await getUserId();
    
    await TransactionService.deleteTransaction(id, userId);

    revalidatePath("/");
    revalidatePath("/expenses");
    revalidatePath("/income");

    return { 
      success: true, 
      message: "Transação excluída com sucesso!" 
    };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro ao excluir transação." 
    };
  }
}

/**
 * Ação para obter o resumo mensal
 */
export async function getMonthlySummaryAction(month: number, year: number) {
  try {
    const userId = await getUserId();
    const summary = await TransactionService.getTransactionSummary(userId, month, year);
    return { success: true, data: summary };
  } catch (_error) {
    return { success: false, message: "Erro ao carregar resumo financeiro." };
  }
}

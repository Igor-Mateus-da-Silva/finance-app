import prisma from "@/lib/prisma";
import { Transaction } from "@prisma/client";
import { CreateTransactionDTO, UpdateTransactionDTO, TransactionSummary } from "@/types/transaction";

/**
 * O Prisma retorna valores monetários como Decimal (objeto especial para precisão).
 * O Next.js só aceita objetos "planos" (números, strings, etc.) para enviar ao Client Component.
 * Esta função converte todas as transações para um formato seguro, transformando Decimal em number.
 */
type SerializedTransaction = Omit<Transaction, "amount"> & {
  amount: number;
  category?: { id: string; name: string; userId: string } | null;
};

function serializeTransaction(t: Transaction & { category?: { id: string; name: string; userId: string } | null }): SerializedTransaction {
  return {
    ...t,
    // Convertemos o Decimal para número simples usando toNumber()
    amount: typeof t.amount === "object" && t.amount !== null
      ? (t.amount as { toNumber: () => number }).toNumber()
      : Number(t.amount),
  };
}

/**
 * Serviço responsável por gerenciar as operações de transações no banco de dados.
 */
export const TransactionService = {
  /**
   * Busca todas as transações de um usuário específico em um determinado ano.
   */
  async getTransactionsByUserId(userId: string, year: number): Promise<SerializedTransaction[]> {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: "desc" },
        include: { category: true },
      });

      // Convertemos cada transação para um objeto plano antes de retornar
      return transactions.map(serializeTransaction);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      throw new Error("Erro ao carregar transações.");
    }
  },

  /**
   * Cria uma nova transação após validar a categoria.
   */
  async createTransaction(data: CreateTransactionDTO): Promise<SerializedTransaction> {
    try {
      // Validação de segurança: a categoria deve pertencer ao mesmo usuário.
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category || category.userId !== data.userId) {
        throw new Error("Categoria inválida ou não pertence ao usuário.");
      }

      const created = await prisma.transaction.create({ data });

      // Serializamos o Decimal antes de retornar ao Client Component
      return serializeTransaction(created);
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      throw error instanceof Error ? error : new Error("Erro ao criar transação.");
    }
  },

  /**
   * Atualiza uma transação garantindo que o usuário seja o dono.
   */
  async updateTransaction(id: string, userId: string, data: Partial<UpdateTransactionDTO>): Promise<SerializedTransaction> {
    try {
      // Se estiver mudando a categoria, precisamos validar novamente.
      if (data.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: data.categoryId },
        });
        if (!category || category.userId !== userId) {
          throw new Error("Nova categoria inválida ou não pertence ao usuário.");
        }
      }

      // Verificamos primeiro se o usuário é dono da transação.
      const transaction = await prisma.transaction.findFirst({
        where: { id, userId },
      });

      if (!transaction) {
        throw new Error("Transação não encontrada ou acesso negado.");
      }

      const updated = await prisma.transaction.update({
        where: { id },
        data,
      });

      // Serializamos o Decimal antes de retornar ao Client Component
      return serializeTransaction(updated);
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      throw error instanceof Error ? error : new Error("Erro ao atualizar transação.");
    }
  },

  /**
   * Exclui uma transação garantindo a posse dos dados.
   */
  async deleteTransaction(id: string, userId: string): Promise<void> {
    try {
      // Deletamos apenas se o ID e o userId baterem.
      const result = await prisma.transaction.deleteMany({
        where: { id, userId },
      });

      if (result.count === 0) {
        throw new Error("Transação não encontrada ou já excluída.");
      }
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      throw error instanceof Error ? error : new Error("Erro ao excluir transação.");
    }
  },

  /**
   * Calcula o resumo (receitas, despesas e saldo) de um mês específico.
   */
  async getTransactionSummary(userId: string, month: number, year: number): Promise<TransactionSummary> {
    try {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);

      // Usamos o agregador do Prisma para somar os valores de forma eficiente.
      const stats = await prisma.transaction.groupBy({
        by: ['type'],
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        _sum: {
          amount: true,
        },
      });

      const incomes = stats.find(s => s.type === 'INCOME')?._sum.amount?.toNumber() || 0;
      const expenses = stats.find(s => s.type === 'EXPENSE')?._sum.amount?.toNumber() || 0;

      return {
        totalIncomes: incomes,
        totalExpenses: expenses,
        balance: incomes - expenses,
      };
    } catch (error) {
      console.error("Erro ao calcular resumo:", error);
      throw new Error("Erro ao calcular resumo financeiro.");
    }
  },
};

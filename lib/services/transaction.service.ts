import prisma from "@/lib/prisma";
import { Transaction } from "@prisma/client";

/**
 * Serviço responsável por gerenciar as operações de transações no banco de dados.
 * Este serviço substitui a antiga lógica de leitura e escrita em arquivos JSON.
 */
export const TransactionService = {
  /**
   * Busca todas as transações de um usuário específico em um determinado ano.
   * 
   * @param userId O identificador único do usuário (obrigatório para segurança).
   * @param year O ano que desejamos filtrar.
   * @returns Uma lista de transações formatada de acordo com o banco de dados.
   */
  async getTransactionsByUserId(userId: string, year: number): Promise<Transaction[]> {
    try {
      // Definimos o primeiro e o último dia do ano para a busca.
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

      // O Prisma vai até o banco e busca apenas o que pedimos.
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: userId, // Regra de segurança: filtrando pelo dono dos dados.
          date: {
            gte: startDate, // "gte" significa "maior ou igual a"
            lte: endDate,   // "lte" significa "menor ou igual a"
          },
        },
        orderBy: {
          date: "desc", // Mostramos as mais recentes primeiro.
        },
        include: {
          category: true, // Já trazemos os dados da categoria vinculada.
        },
      });

      return transactions;
    } catch (error) {
      // Se algo der errado (como queda de conexão), avisamos no console e lançamos o erro.
      console.error(`Erro ao buscar transações do usuário ${userId} para o ano ${year}:`, error);
      throw new Error("Não foi possível carregar as transações. Tente novamente mais tarde.");
    }
  },

  /**
   * Exemplo de como criaremos uma nova transação no futuro.
   */
  async createTransaction(userId: string, data: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt">) {
    try {
      return await prisma.transaction.create({
        data: {
          ...data,
          userId, // Garantindo que a transação pertença ao usuário logado.
        },
      });
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      throw new Error("Falha ao salvar a transação.");
    }
  }
};

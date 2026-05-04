import prisma from "@/lib/prisma";
import { Category } from "@prisma/client";

/**
 * Serviço responsável por gerenciar as operações de categorias no banco de dados.
 */
export const CategoryService = {
  /**
   * Busca todas as categorias de um usuário específico.
   */
  async getCategoriesByUserId(userId: string): Promise<Category[]> {
    try {
      return await prisma.category.findMany({
        where: { userId },
        orderBy: { name: "asc" },
      });
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      throw new Error("Erro ao carregar categorias.");
    }
  },

  /**
   * Busca ou cria categorias padrão para um novo usuário.
   */
  async ensureDefaultCategories(userId: string) {
    const defaults = ["Alimentação", "Transporte", "Lazer", "Moradia", "Salário"];
    
    for (const name of defaults) {
      const existing = await prisma.category.findFirst({
        where: { name, userId }
      });
      
      if (!existing) {
        await prisma.category.create({
          data: { name, userId }
        });
      }
    }
  }
};

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
    const defaults: { name: string; type: "INCOME" | "EXPENSE" }[] = [
      { name: "Alimentação", type: "EXPENSE" },
      { name: "Transporte", type: "EXPENSE" },
      { name: "Lazer", type: "EXPENSE" },
      { name: "Moradia", type: "EXPENSE" },
      { name: "Salário", type: "INCOME" },
    ];
    
    for (const cat of defaults) {
      const existing = await prisma.category.findFirst({
        where: { name: cat.name, userId }
      });
      
      if (!existing) {
        await prisma.category.create({
          data: { name: cat.name, type: cat.type, userId }
        });
      }
    }
  },

  /**
   * Cria uma nova categoria.
   */
  async createCategory(userId: string, name: string, type: "INCOME" | "EXPENSE") {
    try {
      return await prisma.category.create({
        data: { name, type, userId }
      });
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      throw new Error("Não foi possível criar a categoria.");
    }
  }
};

"use server";

import { headers } from "next/headers";
import { CategoryService } from "@/lib/services/category.service";

/**
 * Helper para recuperar o userId dos headers (injetado pelo Proxy/Middleware)
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
 * Ação para buscar todas as categorias do usuário logado
 */
export async function getCategoriesAction() {
  try {
    const userId = await getUserId();
    
    // Garantimos que o usuário tenha categorias padrão se for a primeira vez.
    await CategoryService.ensureDefaultCategories(userId);
    
    const categories = await CategoryService.getCategoriesByUserId(userId);
    return { success: true, data: categories };
  } catch (error) {
    console.error("Erro na Action getCategories:", error);
    return { success: false, message: "Falha ao carregar categorias." };
  }
}

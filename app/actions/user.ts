"use server";

import { headers } from "next/headers";
import { UserService } from "@/lib/services/user.service";

async function getUserId() {
  const headerList = await headers();
  const userId = headerList.get("x-user-id");
  if (!userId) {
    throw new Error("Usuário não autenticado");
  }
  return userId;
}

export async function getUserProfileAction() {
  try {
    const userId = await getUserId();
    const user = await UserService.getUserById(userId);
    return { success: true, data: user };
  } catch (error) {
    console.error("Erro na Action getUserProfile:", error);
    return { success: false, message: "Falha ao carregar o perfil do usuário." };
  }
}

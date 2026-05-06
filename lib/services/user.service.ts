import prisma from "@/lib/prisma";

export const UserService = {
  async getUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
      return user;
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      throw new Error("Não foi possível carregar o usuário.");
    }
  },
};

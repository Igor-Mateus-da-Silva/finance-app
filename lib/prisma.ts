import { PrismaClient } from "@prisma/client";

// O padrão Singleton garante que teremos apenas UMA instância do Prisma rodando.
// Isso é muito importante no Next.js porque, durante o desenvolvimento,
// o código é recarregado muitas vezes (Hot Reload), e não queremos abrir 
// centenas de conexões com o banco de dados ao mesmo tempo.

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  // Isso evita que o TypeScript reclame de estarmos mexendo no objeto global
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Se já existir uma instância (no ambiente global), usamos ela. 
// Caso contrário, criamos uma nova.
const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// O padrão Singleton garante que teremos apenas UMA instância do Prisma rodando.
// Usamos o adaptador @prisma/adapter-pg (driver padrão do PostgreSQL para Node.js).
// O adapter do Neon Serverless seria apenas para Edge Runtime (Cloudflare Workers etc.).

const prismaClientSingleton = () => {
  // Criamos uma "piscina" (Pool) de conexões com o banco PostgreSQL.
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // Criamos o adaptador que faz a ponte entre o Prisma e o driver do pg.
  const adapter = new PrismaPg(pool);

  // Entregamos o adaptador para o motor do Prisma.
  return new PrismaClient({ adapter });
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

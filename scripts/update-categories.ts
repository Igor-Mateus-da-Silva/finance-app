import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", override: true });
dotenv.config({ path: ".env", override: true });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Atualizando categorias de Renda para INCOME...");

  const incomeNames = ["Salário", "Freelance", "Renda Extra", "Investimentos", "Venda", "Bônus"];

  for (const name of incomeNames) {
    const result = await prisma.category.updateMany({
      where: { name },
      data: { type: "INCOME" },
    });
    if (result.count > 0) {
      console.log(`Atualizadas ${result.count} categorias '${name}' para INCOME.`);
    }
  }

  console.log("Atualização concluída.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Erro ao atualizar categorias:", e);
  process.exit(1);
});

// Script de Seed em CommonJS para garantir que dotenv carregue antes de tudo.
require("dotenv").config({ path: ".env.local", override: true });
require("dotenv").config({ path: ".env", override: true });

// Agora importamos os módulos após as variáveis de ambiente estarem prontas.
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");


async function main() {
  console.log("DATABASE_URL carregada:", process.env.DATABASE_URL ? "SIM" : "NAO");

  // Usando o driver padrão do PostgreSQL (pg) para ambientes Node.js.
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Iniciando o processo de semente (Seed)...");

  // 1. Limpar dados existentes na ordem inversa das relações.
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Criar um Usuário de Teste com senha criptografada.
  const hashedPassword = await bcrypt.hash("senha123", 10);
  const user = await prisma.user.create({
    data: {
      name: "Usuário de Teste",
      email: "teste@exemplo.com",
      password: hashedPassword,
    },
  });

  console.log(`Usuário criado: ${user.email}`);

  // 3. Criar Categorias Padrão vinculadas ao usuário.
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Alimentação", userId: user.id } }),
    prisma.category.create({ data: { name: "Transporte", userId: user.id } }),
    prisma.category.create({ data: { name: "Salário", userId: user.id } }),
    prisma.category.create({ data: { name: "Lazer", userId: user.id } }),
  ]);

  console.log(`${categories.length} categorias criadas.`);

  // 4. Criar Transações Fictícias para validar a estrutura.
  await prisma.transaction.createMany({
    data: [
      {
        description: "Salário Mensal",
        amount: 5000.00,
        date: new Date(),
        type: "INCOME",
        userId: user.id,
        categoryId: categories.find((c) => c.name === "Salário").id,
      },
      {
        description: "Almoço de Trabalho",
        amount: 45.90,
        date: new Date(),
        type: "EXPENSE",
        userId: user.id,
        categoryId: categories.find((c) => c.name === "Alimentação").id,
      },
      {
        description: "Gasolina",
        amount: 250.00,
        date: new Date(),
        type: "EXPENSE",
        userId: user.id,
        categoryId: categories.find((c) => c.name === "Transporte").id,
      },
      {
        description: "Cinema",
        amount: 60.00,
        date: new Date(),
        type: "EXPENSE",
        userId: user.id,
        categoryId: categories.find((c) => c.name === "Lazer").id,
      },
    ],
  });

  console.log("Transações fictícias criadas com sucesso!");
  console.log("Seed finalizado!");
  console.log("-------------------------------------------");
  console.log("Credenciais de teste:");
  console.log("  E-mail : teste@exemplo.com");
  console.log("  Senha  : senha123");
  console.log("-------------------------------------------");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Erro ao executar o seed:", e);
  process.exit(1);
});

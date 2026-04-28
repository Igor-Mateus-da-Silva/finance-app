import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

// O PrismaClient é o nosso tradutor que conversa com o banco de dados.
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando o processo de semente (Seed)...");

  // 1. Limpar dados existentes (opcional, mas bom para desenvolvimento)
  // Deletamos na ordem inversa das relações para não dar erro de "chave estrangeira".
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Criar um Usuário de Teste
  // Usamos o bcrypt para "esconder" a senha, transformando-a em um código secreto.
  const hashedPassword = await bcrypt.hash("senha123", 10);
  const user = await prisma.user.create({
    data: {
      name: "Usuário de Teste",
      email: "teste@exemplo.com",
      password: hashedPassword,
    },
  });

  console.log(`Usuário criado: ${user.email}`);

  // 3. Criar Categorias Padrão
  // Note que vinculamos cada categoria ao ID do usuário que acabamos de criar.
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: "Alimentação", userId: user.id },
    }),
    prisma.category.create({
      data: { name: "Transporte", userId: user.id },
    }),
    prisma.category.create({
      data: { name: "Salário", userId: user.id },
    }),
    prisma.category.create({
      data: { name: "Lazer", userId: user.id },
    }),
  ]);

  console.log(`${categories.length} categorias criadas.`);

  // 4. Criar Transações Fictícias
  // Aqui criamos exemplos de ganhos e gastos para ver como fica no sistema.
  await prisma.transaction.createMany({
    data: [
      {
        description: "Salário Mensal",
        amount: 5000.00,
        date: new Date(),
        type: "INCOME",
        userId: user.id,
        categoryId: categories.find(c => c.name === "Salário")!.id,
      },
      {
        description: "Almoço de Trabalho",
        amount: 45.90,
        date: new Date(),
        type: "EXPENSE",
        userId: user.id,
        categoryId: categories.find(c => c.name === "Alimentação")!.id,
      },
      {
        description: "Gasolina",
        amount: 250.00,
        date: new Date(),
        type: "EXPENSE",
        userId: user.id,
        categoryId: categories.find(c => c.name === "Transporte")!.id,
      },
      {
        description: "Cinema",
        amount: 60.00,
        date: new Date(),
        type: "EXPENSE",
        userId: user.id,
        categoryId: categories.find(c => c.name === "Lazer")!.id,
      },
    ],
  });

  console.log("Transações fictícias criadas com sucesso!");
  console.log("Seed finalizado!");
}

main()
  .catch((e) => {
    console.error("Erro ao executar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Sempre fechamos a conexão com o banco ao terminar.
    await prisma.$disconnect();
  });

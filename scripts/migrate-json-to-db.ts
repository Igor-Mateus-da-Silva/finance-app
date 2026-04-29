import fs from "fs";
import path from "path";
import prisma from "../lib/prisma";
import { TransactionType } from "@prisma/client";

/**
 * Script de Migração: JSON -> PostgreSQL
 * Este script lê os dados legados da pasta /data e os insira no novo banco.
 */

const DATA_DIR = path.join(process.cwd(), "data");
// Você pode passar o email via variável de ambiente: TARGET_USER_EMAIL=teste@exemplo.com
const TARGET_USER_EMAIL = process.env.TARGET_USER_EMAIL || "teste@exemplo.com";

async function migrate() {
  console.log(`🚀 Iniciando migração para o usuário: ${TARGET_USER_EMAIL}`);

  // 1. Verificar se o usuário existe
  const user = await prisma.user.findUnique({
    where: { email: TARGET_USER_EMAIL },
  });

  if (!user) {
    console.error(`❌ Usuário ${TARGET_USER_EMAIL} não encontrado. Por favor, crie o usuário primeiro.`);
    process.exit(1);
  }

  // 2. Ler arquivos da pasta /data
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json") && f !== "user.json");

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    console.log(`📦 Processando arquivo: ${file}...`);

    try {
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const year = content.year;

      for (const monthKey in content.months) {
        const monthData = content.months[monthKey];
        const month = parseInt(monthKey);

        // Processar Receitas (Incomes)
        await processIncomes(user.id, year, month, monthData.income);

        // Processar Despesas (Expenses)
        await processExpenses(user.id, monthData.expenses);
      }
    } catch (error) {
      console.error(`⚠️ Erro ao processar o arquivo ${file}:`, error);
      // Continuamos para o próximo arquivo mesmo se um falhar
    }
  }

  console.log("✅ Migração concluída com sucesso!");
}

/**
 * Processa as rendas (Salário, VR e Extras)
 */
async function processIncomes(userId: string, year: number, month: number, income: any) {
  const defaultDate = new Date(year, month - 1, 1);

  // Função auxiliar para criar transação de renda
  const addIncome = async (description: string, amount: number, categoryName: string, date: Date = defaultDate) => {
    if (amount <= 0) return;

    const category = await getOrCreateCategory(userId, categoryName);
    await prisma.transaction.create({
      data: {
        description,
        amount,
        date,
        type: TransactionType.INCOME,
        userId,
        categoryId: category.id,
      },
    });
  };

  await addIncome("Salário", income.salary, "Salário");
  await addIncome("Vale Refeição", income.vr, "Benefícios");

  if (Array.isArray(income.extra)) {
    for (const extra of income.extra) {
      await addIncome(extra.description, extra.amount, "Renda Extra");
    }
  }
}

/**
 * Processa as listas de despesas
 */
async function processExpenses(userId: string, expenses: any) {
  const categories = ["essential_fixed", "nonessential_fixed", "variable"];

  for (const catType of categories) {
    const items = expenses[catType];
    if (Array.isArray(items)) {
      for (const item of items) {
        // Mapeamos o nome da categoria para algo mais amigável
        const friendlyCategory = mapCategoryName(catType);
        const category = await getOrCreateCategory(userId, friendlyCategory);

        await prisma.transaction.create({
          data: {
            description: item.description,
            amount: item.amount,
            date: new Date(item.date),
            type: TransactionType.EXPENSE,
            userId,
            categoryId: category.id,
          },
        });
      }
    }
  }
}

/**
 * Busca uma categoria ou cria se não existir
 */
async function getOrCreateCategory(userId: string, name: string) {
  let category = await prisma.category.findFirst({
    where: { name, userId },
  });

  if (!category) {
    category = await prisma.category.create({
      data: { name, userId },
    });
  }

  return category;
}

/**
 * Traduz os termos técnicos do JSON para nomes mais bonitos
 */
function mapCategoryName(technicalName: string): string {
  const mapping: Record<string, string> = {
    essential_fixed: "Essencial Fixo",
    nonessential_fixed: "Lazer/Estilo de Vida",
    variable: "Variável",
  };
  return mapping[technicalName] || technicalName;
}

// Executar a migração
migrate()
  .catch(e => {
    console.error("❌ Erro fatal na migração:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

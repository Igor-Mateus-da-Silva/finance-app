import { defineConfig } from "prisma/config";

// No Prisma 7, as configurações de infraestrutura (como a URL do banco)
// ficam separadas do desenho das tabelas. Isso é uma boa prática para
// manter o projeto organizado.

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Aqui dizemos ao Prisma para pegar a URL da variável de ambiente DATABASE_URL
    url: process.env.DATABASE_URL,
  },
});

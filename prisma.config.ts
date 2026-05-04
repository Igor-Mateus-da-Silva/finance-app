// O CLI do Prisma não lê .env.local automaticamente — apenas .env.
// Carregamos manualmente para que db push e migrate funcionem.
import { config } from "dotenv";
config({ path: ".env.local", override: true });
config({ path: ".env", override: true });

import { defineConfig, env } from "prisma/config";

// O parâmetro 'channel_binding=require' é incompatível com o motor interno
// do Prisma CLI. Removemos ele e o '-pooler' para garantir conexão direta.
const rawUrl = env("DATABASE_URL");
const cliUrl = rawUrl
  .replace("&channel_binding=require", "")   // caso venha após outros parâmetros
  .replace("?channel_binding=require&", "?") // caso seja o primeiro parâmetro
  .replace("?channel_binding=require", "");  // caso seja o único parâmetro

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: cliUrl,
  },
});

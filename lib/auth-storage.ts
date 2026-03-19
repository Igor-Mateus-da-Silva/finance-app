import { kv } from "@vercel/kv";
import bcrypt from "bcryptjs";

const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !process.env.KV_REST_API_URL) {
  throw new Error("KV não configurado corretamente na Vercel");
}

let localUser: any = null;

export async function getUser() {
  if (!isProduction) {
    console.warn("Usando fallback local (apenas dev)");
    if (!localUser) {
      const passwordHash = await bcrypt.hash("S@nt0sIM7", 10);

      localUser = {
        username: "admin",
        passwordHash,
      };
    }

    return localUser;
  }

  return await kv.get("auth:user");
}

export async function createDefaultUser() {
  if (!isProduction) {
    return;
  }

  const existing = await kv.get("auth:user");

  if (!existing) {
    const passwordHash = await bcrypt.hash("S@nt0sIM7", 10);

    await kv.set("auth:user", {
      username: "admin",
      passwordHash,
    });
  }
}

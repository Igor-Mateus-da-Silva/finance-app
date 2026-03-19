import { kv } from "@vercel/kv";
import bcrypt from "bcryptjs";

const isServer = typeof window === "undefined";
const isKVConfigured = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

let localUser: any = null;

export async function getUser() {
  if (!isServer || !isKVConfigured) {
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
  if (!isServer || !isKVConfigured) {
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

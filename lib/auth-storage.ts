import { kv } from "@vercel/kv";
import bcrypt from "bcryptjs";

let localUser: any = null;

export async function getUser() {
  if (!process.env.KV_REST_API_URL) {
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
  if (!process.env.KV_REST_API_URL) {
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

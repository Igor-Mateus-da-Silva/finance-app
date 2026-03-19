import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUser, createDefaultUser } from "@/lib/auth-storage";
import { createSession } from "@/auth/session";

// Simple in-memory rate limiting
// Store structure: { [ip: string]: { count: number, resetTime: number } }
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(ip: string): {
  allowed: boolean;
  remainingTimeMs?: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + LOCKOUT_TIME_MS });
    return { allowed: true };
  }

  if (now > record.resetTime) {
    // Reset window
    rateLimitStore.set(ip, { count: 1, resetTime: now + LOCKOUT_TIME_MS });
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remainingTimeMs: record.resetTime - now };
  }

  record.count += 1;
  return { allowed: true };
}

export async function POST(request: Request) {
  // Try to get IP (Next.js App router edge case, often from headers)
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  const rateStatus = checkRateLimit(ip);
  if (!rateStatus.allowed) {
    const minLeft = Math.ceil((rateStatus.remainingTimeMs || 0) / 60000);
    return NextResponse.json(
      {
        error: `Muitas tentativas falhas. Tente novamente em ${minLeft} minutos.`,
      },
      { status: 429 },
    );
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuário e senha são obrigatórios" },
        { status: 400 },
      );
    }

    await createDefaultUser();

    const user: any = await getUser();
    console.log("User from storage:", user);

    if (!user || user.username !== username) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 },
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    console.log("Password valid:", valid);

    if (!valid) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 },
      );
    }

    // Success - Reset rate limit for this IP
    rateLimitStore.delete(ip);

    await createSession(username);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}

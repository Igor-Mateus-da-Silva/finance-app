import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { createSession } from "@/auth/session";

// Sistema simples de limite de tentativas (Rate Limiting)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 10 * 60 * 1000; // 10 minutos

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
        { error: "E-mail e senha são obrigatórios" },
        { status: 400 },
      );
    }

    // 1. Buscar o usuário no banco de dados pelo e-mail
    // (O formulário envia o campo como 'username', mas tratamos como e-mail no banco)
    const user = await prisma.user.findUnique({
      where: { email: username },
    });

    // Se o usuário não existir, retornamos erro genérico por segurança
    if (!user) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos" },
        { status: 401 },
      );
    }

    // 2. Comparar a senha enviada com o hash guardado no banco
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos" },
        { status: 401 },
      );
    }

    // Sucesso - Limpa o contador de tentativas para este IP
    rateLimitStore.delete(ip);

    // 3. Criar a sessão usando o ID e o E-mail reais do banco
    await createSession(user.id, user.email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no processo de login:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}

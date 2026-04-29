import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { JWTPayload } from "@/types/auth";

const secretKey = process.env.JWT_SECRET || "chave-secreta-padrao-troque-em-producao";
const encodedKey = new TextEncoder().encode(secretKey);

/**
 * Cria uma nova sessão para o usuário e guarda no cookie do navegador.
 * 
 * @param userId O ID único do usuário vindo do banco de dados.
 * @param email O e-mail do usuário logado.
 */
export async function createSession(userId: string, email: string) {
  // O "crachá" vai valer por 7 dias.
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  const payload: JWTPayload = {
    userId,
    email,
    sub: userId, // Padronização do campo "sub" (subject) com o ID.
  };

  const session = await encrypt(payload);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true, // Segurança: impede que scripts maliciosos leiam o cookie.
    secure: process.env.NODE_ENV === "production", // Só envia via HTTPS em produção.
    expires: expiresAt,
    sameSite: "strict",
    path: "/",
  });
}

/**
 * Verifica se o usuário tem um "crachá" válido e retorna os dados dele.
 */
export async function verifySession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return null;
  }

  return { 
    isAuth: true, 
    userId: session.userId as string, 
    email: session.email as string 
  };
}

/**
 * Destrói o "crachá" (cookie) quando o usuário faz logout.
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

/**
 * Transforma as informações em um código secreto assinado.
 */
export async function encrypt(payload: JWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Validade de 7 dias.
    .sign(encodedKey);
}

/**
 * Lê o código secreto e recupera as informações originais.
 */
export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as JWTPayload;
  } catch (error) {
    return null;
  }
}

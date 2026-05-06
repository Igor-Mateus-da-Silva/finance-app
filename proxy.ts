import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Proxy de Segurança: Atua como a "portaria" do aplicativo.
 * Ele verifica se o usuário está logado antes de permitir o acesso às páginas.
 * No Next.js 16, este arquivo se chama proxy.ts e a função deve se chamar 'proxy'.
 */

// 1. Definimos quais rotas são abertas ao público e quais são protegidas.
const publicRoutes = ["/login", "/api/login"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignoramos arquivos estáticos e pastas do Next.js para não pesar no sistema.
  if (
    pathname.includes(".") || 
    pathname.startsWith("/_next/") || 
    pathname.startsWith("/api/public")
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.includes(pathname);
  const sessionCookie = request.cookies.get("session")?.value;

  try {
    // 2. Se houver um cookie, tentamos validar o "crachá" (JWT).
    if (sessionCookie) {
      const secret = process.env.JWT_SECRET || "chave-secreta-padrao-troque-em-producao";
      const encodedKey = new TextEncoder().encode(secret);

      // A biblioteca 'jose' verifica se o token é autêntico e não expirou.
      const { payload } = await jwtVerify(sessionCookie, encodedKey, {
        algorithms: ["HS256"],
      });

      const userId = payload.userId as string;

      // Se o usuário já está logado e tenta ir para o login, mandamos para o Dashboard.
      if (isPublicRoute && pathname === "/login") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // 3. TÉCNICA DE CONTEXTO: Passamos o ID do usuário adiante através de um Header customizado.
      // Isso evita que o restante do sistema precise decodificar o JWT novamente.
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", userId);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // 4. Se NÃO houver cookie e a rota for protegida, mandamos para o Login.
    if (!isPublicRoute) {
      const loginUrl = new URL("/login", request.url);
      // Podemos até salvar para onde o usuário queria ir para redirecionar depois.
      // loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

  } catch (error) {
    // Se o token for inválido ou expirado, limpamos a sessão e mandamos para o login.
    console.error("Sessão inválida ou expirada no Middleware:", error);
    
    if (!isPublicRoute) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  return NextResponse.next();
}

// Configuração para dizer ao Next.js em quais caminhos este Proxy deve rodar.
export const config = {
  matcher: [
    /*
     * Roda em todas as rotas, exceto nas que começam com:
     * - api/auth (rotas de autenticação que precisam ser livres)
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (ícone do site)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};

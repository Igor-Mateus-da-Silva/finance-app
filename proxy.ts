import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Define public and protected routes
const publicRoutes = ["/login", "/api/login"];
const protectedRoutes = [
  "/",
  "/dashboard",
  "/renda",
  "/gastos",
  "/planejamento",
  "/relatorios",
  "/settings",
  "/api/logout",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude static files, images, etc.
  if (pathname.includes(".") || pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.includes(pathname);
  const cookie = request.cookies.get("session")?.value;
  let isValidSession = false;

  if (cookie) {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error("Missing JWT_SECRET");

      const encodedKey = new TextEncoder().encode(secret);
      await jwtVerify(cookie, encodedKey, { algorithms: ["HS256"] });
      isValidSession = true;
    } catch (err) {
      // Invalid token
      isValidSession = false;
    }
  }

  // Redirect to /login if navigating to protected route without valid session
  if (!isPublicRoute && !isValidSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect to Dashboard (/) if going to /login while already authenticated
  if (isPublicRoute && isValidSession && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) -> Except we manually handle our auth API paths so we just run it on all but let our logic decide
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

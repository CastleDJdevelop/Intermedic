import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

/**
 * Protección server-side de páginas (Fase 4 del ROADMAP).
 * - /crm/**        y /inventario/** requieren sesión.
 * - /inventario/** además requiere role === "Administrador"
 *   (los Vendedores usan el CRM, pero no editan stock/costos/productos).
 * - Si no hay sesión: redirige a /login?next=<ruta original>.
 * - Si hay sesión pero el rol no alcanza: redirige a /crm/dashboard con ?denied=1.
 *
 * La protección de las rutas de API (app/api/**) se hace aparte, dentro de
 * cada route handler, porque ahí interesa devolver 401/403 en JSON, no un
 * redirect de página.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAuth = pathname.startsWith("/crm") || pathname.startsWith("/inventario");
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/inventario") && session.role !== "Administrador") {
    const deniedUrl = new URL("/crm/dashboard", req.url);
    deniedUrl.searchParams.set("denied", "1");
    return NextResponse.redirect(deniedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/crm/:path*", "/inventario/:path*"],
};

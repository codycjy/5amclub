import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 公开路由列表
  const publicRoutes = ["/auth"];
  // API 路由列表
  const apiRoutes = ["/api"];
  // 当前路径
  const isPublicRoute = publicRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route),
  );
  const isApiRoute = apiRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route),
  );

  // 如果是 API 路由，直接放行
  if (isApiRoute) {
    return res;
  }

  // 如果用户未登录且不是公开路由，重定向到登录页
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  // 如果用户已登录且是公开路由，重定向到首页
  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

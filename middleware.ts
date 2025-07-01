import { NextRequest, NextResponse } from 'next/server';

import { generateAuthToken } from '@/lib/auth';

// 路由白名单：登录页、静态资源、API 等无需校验
const PUBLIC_PATHS = [
  '/login',
  '/api',
  '/favicon.ico',
  '/manifest.json',
  '/logo',
  '/icons',
  '/sitemap.xml',
  '/robots.txt',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 跳过公共路径
  if (isPublicPath(pathname) || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  const password = process.env.PASSWORD;
  // 未设置密码时放行
  if (!password) {
    return NextResponse.next();
  }

  const expectedToken = await generateAuthToken(password);
  const authCookie = request.cookies.get('auth')?.value;

  if (authCookie === expectedToken) {
    return NextResponse.next();
  }

  // 未认证，重定向到登录页
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.searchParams.set('redirect', `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: '/:path*',
};

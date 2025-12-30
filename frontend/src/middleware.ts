//frontend/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const supportedLangs = ['pt-br', 'en', 'es', 'zh'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  const cookieLang = request.cookies.get('virtuscloud.locale')?.value;

  // ✅ Se a URL já contém um idioma válido, salva no cookie
  if (supportedLangs.includes(firstSegment)) {
    const response = NextResponse.next();
    response.cookies.set('virtuscloud.locale', firstSegment, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      sameSite: 'lax',
    });
    return response;
  }

  // ✅ Se está na raiz "/", redireciona para o idioma salvo ou detectado
  if (pathname === '/') {
    const lang = supportedLangs.includes(cookieLang || '')
      ? cookieLang!
      : 'pt-br'; // fallback

    const url = request.nextUrl.clone();
    url.pathname = `/${lang}`;
    return NextResponse.redirect(url);
  }

  // ✅ Todas as outras rotas passam direto
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/(pt-br|en|es|zh)*'],
};

//frontend/middleware.ts

//import { NextResponse } from 'next/server';
//import type { NextRequest } from 'next/server';
//
//const supportedLangs = ['pt-br', 'en', 'es', 'zh'];
//
//export function middleware(request: NextRequest) {
//  const { pathname } = request.nextUrl;
//  const segments = pathname.split('/').filter(Boolean);
//  const firstSegment = segments[0];
//
//  const cookieLang = request.cookies.get('virtuscloud.lang')?.value;
//
//  // ✅ Se a URL já contém um idioma válido, salva no cookie
//  if (supportedLangs.includes(firstSegment)) {
//    const response = NextResponse.next();
//    response.cookies.set('virtuscloud.lang', firstSegment, {
//      path: '/',
//      maxAge: 60 * 60 * 24 * 30, // 30 dias
//      sameSite: 'lax',
//    });
//    return response;
//  }
//
//  // ✅ Se está na raiz "/", redireciona para o idioma salvo ou detectado
//  if (pathname === '/') {
//    const lang = supportedLangs.includes(cookieLang || '')
//      ? cookieLang!
//      : 'pt-br'; // fallback
//
//    const url = request.nextUrl.clone();
//    url.pathname = `/${lang}`;
//    return NextResponse.redirect(url);
//  }
//
//  // ✅ Todas as outras rotas passam direto
//  return NextResponse.next();
//}
//
//export const config = {
//  matcher: ['/', '/(pt-br|en|es|zh)*'],
//};

//import { NextResponse } from 'next/server';
//import type { NextRequest } from 'next/server';
//
//const supportedLangs = ['pt-br', 'en', 'es', 'zh'];
//
//function detectPreferredLang(request: NextRequest): string {
//  const header = request.headers.get('accept-language') || '';
//  const preferred = header.split(',')[0]?.toLowerCase();
//
//  for (const lang of supportedLangs) {
//    if (preferred.includes(lang)) return lang;
//  }
//
//  return 'pt-br';
//}
//
//export function middleware(request: NextRequest) {
//  const { pathname } = request.nextUrl;
//
//  // Só intercepta a raiz "/"
//  if (pathname === '/') {
//    const cookieLang = request.cookies.get('virtuscloud.lang')?.value;
//
//    const lang = supportedLangs.includes(cookieLang || '')
//      ? cookieLang!
//      : detectPreferredLang(request);
//
//    const response = NextResponse.redirect(new URL(`/${lang}`, request.url));
//
//    // Se não havia cookie, define agora
//    if (!cookieLang) {
//      response.cookies.set('virtuscloud.lang', lang, {
//        path: '/',
//        maxAge: 60 * 60 * 24 * 30, // 30 dias
//        sameSite: 'lax',
//      });
//    }
//
//    return response;
//  }
//
//  return NextResponse.next();
//}
//
//export const config = {
//  matcher: ['/'],
//};

//import { NextResponse } from 'next/server';
//import type { NextRequest } from 'next/server';
//
//const supportedLangs = ['pt-br', 'en', 'es', 'zh'];
//
//function detectPreferredLang(request: NextRequest): string {
//  const header = request.headers.get('accept-language') || '';
//  const preferred = header.split(',')[0]?.toLowerCase();
//
//  // Match com os idiomas suportados
//  for (const lang of supportedLangs) {
//    if (preferred.includes(lang)) return lang;
//  }
//
//  return 'pt-br'; // fallback
//}
//
//export function middleware(request: NextRequest) {
//  const { pathname } = request.nextUrl;
//
//  // Só intercepta a raiz "/"
//  if (pathname === '/') {
//    const lang = detectPreferredLang(request);
//    const url = request.nextUrl.clone();
//    url.pathname = `/${lang}`;
//    return NextResponse.redirect(url);
//  }
//
//  return NextResponse.next();
//}
//
//export const config = {
//  matcher: ['/'],
//};

//import { NextResponse } from 'next/server';
//import type { NextRequest } from 'next/server';
//
//const supportedLangs = ['pt-br', 'en', 'es', 'zh'];
//
//export function middleware(request: NextRequest) {
//  const { pathname } = request.nextUrl;
//
//  // Só intercepta a raiz "/"
//  if (pathname === '/') {
//    const defaultLang = 'pt-br'; // ou detecte via header se quiser
//    const url = request.nextUrl.clone();
//    url.pathname = `/${defaultLang}`;
//    return NextResponse.redirect(url);
//  }
//
//  // Ignora todas as outras rotas
//  return NextResponse.next();
//}
//
//// Aplica apenas na raiz
//export const config = {
//  matcher: ['/'],
//};

//import { NextRequest, NextResponse } from 'next/server';
//import { roleSections } from './utils/permissions'; // ajuste o caminho conforme sua estrutura
//
//const supportedLocales = ['en', 'pt-br', 'es', 'zh'];
//
//function isProtectedRoute(pathname: string): boolean {
//  const parts = pathname.split('/');
//  const maybeLang = parts[1];
//  const section = supportedLocales.includes(maybeLang) ? parts[2] : parts[1];
//
//  if (!section) return false;
//
//  const allProtected = new Set(Object.values(roleSections).flat());
//  return allProtected.has(section);
//}
//
//export async function middleware(request: NextRequest) {
//  const pathname = request.nextUrl.pathname;
//
//  // ⛔ Ignora rotas internas
//  if (
//    pathname.startsWith('/api') ||
//    pathname.startsWith('/_next') ||
//    pathname.startsWith('/favicon') ||
//    pathname.startsWith('/static')
//  ) {
//    return NextResponse.next();
//  }
//
//  // 🌐 Redireciona / para /[lang]
//  if (pathname === '/') {
//    const lang =
//      request.cookies.get('locale')?.value ||
//      request.headers.get('accept-language')?.split(',')[0].toLowerCase() ||
//      'en';
//
//    const finalLang = supportedLocales.includes(lang) ? lang : 'en';
//
//    const response = NextResponse.redirect(new URL(`/${finalLang}`, request.url));
//    response.cookies.set('locale', finalLang);
//    return response;
//  }
//
//  // ✅ Já tem idioma na URL
//  const hasLang = supportedLocales.some((loc) => pathname.startsWith(`/${loc}`));
//  const lang = hasLang
//    ? pathname.split('/')[1]
//    : request.cookies.get('locale')?.value ||
//      request.headers.get('accept-language')?.split(',')[0].toLowerCase() ||
//      'en';
//
//  const finalLang = supportedLocales.includes(lang) ? lang : 'en';
//
//  // 🔐 Verifica token no cookie
//  const token = request.cookies.get('token')?.value;
//
//  // 🔒 Verifica se a rota exige autenticação
//  const isProtected = isProtectedRoute(pathname);
//
//  if (isProtected) {
//    if (!token) {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//
//    try {
//      const res = await fetch('http://localhost:8080/api/verify-token', {
//        method: 'GET',
//        headers: { Cookie: `token=${token}` },
//      });
//
//      if (!res.ok) {
//        return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//      }
//    } catch {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//  }
//
//  // 🌐 Redireciona para rota com idioma se ainda não tiver
//  if (!hasLang) {
//    const newPathname = pathname === '/' ? `/${finalLang}` : `/${finalLang}${pathname}`;
//    return NextResponse.redirect(new URL(newPathname, request.url));
//  }
//
//  return NextResponse.next();
//}

//import { NextRequest, NextResponse } from 'next/server';
//
//// 🌍 Idiomas suportados
//const supportedLocales = ['en', 'pt-br', 'es', 'zh'];
//
//// 🔓 Rotas públicas (acessíveis sem autenticação)
//const publicRoutes = ['/', '', '/signin', '/signup', '/about'];
//
//export async function middleware(request: NextRequest) {
//  const pathname = request.nextUrl.pathname;
//
//  // ⛔ Ignora rotas internas
//  if (
//    pathname.startsWith('/api') ||
//    pathname.startsWith('/_next') ||
//    pathname.startsWith('/favicon') ||
//    pathname.startsWith('/static')
//  ) {
//    return NextResponse.next();
//  }
//
//  if (pathname === '/') {
//    const lang =
//      request.cookies.get('locale')?.value ||
//      request.headers.get('accept-language')?.split(',')[0].toLowerCase() ||
//      'en';
//
//    const finalLang = supportedLocales.includes(lang) ? lang : 'en';
//
//    const response = NextResponse.redirect(new URL(`/${finalLang}`, request.url));
//    response.cookies.set('locale', finalLang); // opcional: salva idioma
//    return response;
//  }
//
//  // ✅ Já tem idioma na URL
//  const hasLang = supportedLocales.some((loc) => pathname.startsWith(`/${loc}`));
//  const lang = hasLang
//    ? pathname.split('/')[1]
//    : request.cookies.get('locale')?.value ||
//    request.headers.get('accept-language')?.split(',')[0].toLowerCase() ||
//    'en';
//
//  const finalLang = supportedLocales.includes(lang) ? lang : 'en';
//
//  // 🔐 Verifica token no cookie
//  const token = request.cookies.get('token')?.value;
//
//  // 🔒 Verifica se a rota é pública
//  const isPublic = supportedLocales.some((loc) =>
//    pathname === `/${loc}` ||
//    publicRoutes.some((route) => pathname === `/${loc}${route}` || pathname === route)
//  );
//
//  // 🧠 Se a rota não for pública, exige autenticação
//  if (!isPublic) {
//    if (!token) {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//
//    try {
//      const res = await fetch('http://localhost:8080/api/verify-token', {
//        method: 'GET',
//        headers: { Cookie: `token=${token}` },
//      });
//
//      if (!res.ok) {
//        return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//      }
//    } catch {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//  }
//
//  // 🌐 Redireciona para rota com idioma se ainda não tiver
//  if (!hasLang) {
//    const newPathname = pathname === '/' ? `/${finalLang}` : `/${finalLang}${pathname}`;
//    return NextResponse.redirect(new URL(newPathname, request.url));
//  }
//
//  return NextResponse.next();
//}

//frontend/midlleware.ts

//import { NextRequest, NextResponse } from 'next/server';
//
//// 🌍 Idiomas suportados
//const supportedLocales = ['en', 'pt-br', 'es', 'zh'];
//
//// 🔓 Rotas públicas (acessíveis sem autenticação)
//const publicRoutes = ['/', '/signin', '/signup', '/about'];
//
//export async function middleware(request: NextRequest) {
//  const pathname = request.nextUrl.pathname;
//
//  // ⛔ Ignora rotas internas
//  if (
//    pathname.startsWith('/api') ||
//    pathname.startsWith('/_next') ||
//    pathname.startsWith('/favicon') ||
//    pathname.startsWith('/static')
//  ) {
//    return NextResponse.next();
//  }
//
//  // ✅ Já tem idioma na URL
//  const hasLang = supportedLocales.some((loc) => pathname.startsWith(`/${loc}`));
//  const lang = hasLang
//    ? pathname.split('/')[1]
//    : request.cookies.get('locale')?.value ||
//    request.headers.get('accept-language')?.split(',')[0].toLowerCase() ||
//    'en';
//
//  const finalLang = supportedLocales.includes(lang) ? lang : 'en';
//
//  // 🔐 Verifica token no cookie
//  const token = request.cookies.get('token')?.value;
//
//  // 🔒 Verifica se a rota é pública
//  const isPublic = publicRoutes.some((route) =>
//    pathname === `/${finalLang}${route}` || pathname === route
//  );
//
//  // 🧠 Se a rota não for pública, exige autenticação
//  if (!isPublic) {
//    if (!token) {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//
//    try {
//      const res = await fetch('http://localhost:8080/api/verify-token', {
//        method: 'GET',
//        headers: { Cookie: `token=${token}` },
//      });
//
//      if (!res.ok) {
//        return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//      }
//    } catch {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//  }
//
//  // 🌐 Redireciona para rota com idioma se ainda não tiver
//  if (!hasLang) {
//    const newPathname = pathname === '/' ? `/${finalLang}` : `/${finalLang}${pathname}`;
//    return NextResponse.redirect(new URL(newPathname, request.url));
//  }
//
//  return NextResponse.next();
//}

// frontend/middleware.ts

//import { NextRequest, NextResponse } from 'next/server';
//import { hasSectionPermission } from '@utils/permissions';
//import { routeSectionMap } from '@utils/routeSections';
//
//// 🌍 Idiomas suportados
//const supportedLocales = ['en', 'pt-br', 'es', 'zh'];
//
//// 🔓 Rotas públicas (acessíveis sem autenticação)
//const publicRoutes = ['/', '/signin', '/signup', '/about'];
//
//// 🔍 Extrai a seção lógica da URL
//function getSectionFromPath(pathname: string): string {
//  const segments = pathname.split('/');
//  const path = '/' + segments.slice(2).join('/'); // remove idioma
//  return routeSectionMap[path] || 'unknown';
//}
//
//export async function middleware(request: NextRequest) {
//  const pathname = request.nextUrl.pathname;
//
//  // ⛔ Ignora rotas internas
//  if (
//    pathname.startsWith('/api') ||
//    pathname.startsWith('/_next') ||
//    pathname.startsWith('/favicon') ||
//    pathname.startsWith('/static')
//  ) {
//    return NextResponse.next();
//  }
//
//  // ✅ Já tem idioma na URL
//  const hasLang = supportedLocales.some((loc) => pathname.startsWith(`/${loc}`));
//  const lang = hasLang
//    ? pathname.split('/')[1]
//    : request.cookies.get('locale')?.value ||
//      request.headers.get('accept-language')?.split(',')[0].toLowerCase() ||
//      'en';
//
//  const finalLang = supportedLocales.includes(lang) ? lang : 'en';
//
//  // 🔐 Verifica token no cookie
//  const token = request.cookies.get('token')?.value;
//
//  // 🔒 Verifica se a rota é pública
//  const isPublic = publicRoutes.some((route) =>
//    pathname === `/${finalLang}${route}` || pathname === route
//  );
//
//  // 🧠 Se a rota não for pública, exige autenticação
//  if (!isPublic) {
//    if (!token) {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//
//    try {
//      const res = await fetch('http://localhost:8080/api/verify-token', {
//        method: 'GET',
//        headers: { Cookie: `token=${token}` },
//      });
//
//      if (!res.ok) {
//        return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//      }
//
//      const user = await res.json();
//      const section = getSectionFromPath(pathname);
//
//      // 🔐 Verifica se a role tem permissão para acessar a seção
//      if (!hasSectionPermission(user.role, section)) {
//        console.warn(`[DENIED] ${user.username} tentou acessar "${section}" sem permissão.`);
//        return NextResponse.redirect(new URL(`/${finalLang}/`, request.url));
//      }
//    } catch {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//  }
//
//  // 🌐 Redireciona para rota com idioma se ainda não tiver
//  if (!hasLang) {
//    const newPathname = pathname === '/' ? `/${finalLang}` : `/${finalLang}${pathname}`;
//    return NextResponse.redirect(new URL(newPathname, request.url));
//  }
//
//  return NextResponse.next();
//}

// frontend/middleware.ts

//import { NextRequest, NextResponse } from 'next/server';
//
//// 🌍 Idiomas suportados
//const supportedLocales = ['en', 'pt-br', 'es', 'zh'];
//
//// 🔓 Rotas públicas (acessíveis sem autenticação)
//const publicRoutes = ['/', '/signin', '/signup', '/about'];
//
//// 🔐 Permissões por cargo (espelhadas do backend)
//const rolePermissions: Record<string, string[]> = {
//  admin:   ['dashboard', 'upload', 'settings', 'admin', 'metrics', 'containers', 'plans', 'users'],
//  staff:   ['dashboard', 'upload', 'settings', 'metrics', 'containers'],
//  dev:     ['dashboard', 'upload', 'settings', 'deploy', 'containers', 'export'],
//  support: ['dashboard', 'metrics', 'history'],
//  user:    ['dashboard', 'upload', 'settings', 'apps'],
//};
//
//export async function middleware(request: NextRequest) {
//  const pathname = request.nextUrl.pathname;
//
//  // ⛔ Ignora rotas internas
//  if (
//    pathname.startsWith('/api') ||
//    pathname.startsWith('/_next') ||
//    pathname.startsWith('/favicon') ||
//    pathname.startsWith('/static')
//  ) {
//    return NextResponse.next();
//  }
//
//  // ✅ Já tem idioma na URL
//  const hasLang = supportedLocales.some((loc) => pathname.startsWith(`/${loc}`));
//  const lang = hasLang
//    ? pathname.split('/')[1]
//    : request.cookies.get('locale')?.value ||
//      request.headers.get('accept-language')?.split(',')[0].toLowerCase() ||
//      'en';
//
//  const finalLang = supportedLocales.includes(lang) ? lang : 'en';
//
//  // 🔐 Verifica token no cookie
//  const token = request.cookies.get('token')?.value;
//
//  // 🔒 Verifica se a rota é pública
//  const isPublic = publicRoutes.some((route) =>
//    pathname === `/${finalLang}${route}` || pathname === route
//  );
//
//  // 🧠 Se a rota não for pública, exige autenticação
//  if (!isPublic) {
//    if (!token) {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//
//    try {
//      const res = await fetch('http://localhost:8080/api/verify-token', {
//        method: 'GET',
//        headers: { Cookie: `token=${token}` },
//      });
//
//      if (!res.ok) {
//        return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//      }
//
//      const user = await res.json(); // espera que o backend retorne { username, role }
//
//      // 🔐 Verifica permissões por cargo
//      const role = user.role || 'user';
//      const allowedPaths = rolePermissions[role] || [];
//
//      // Extrai o segmento da rota após o idioma
//      const segments = pathname.split('/');
//      const section = segments[2]; // ex: /pt-br/dashboard → 'dashboard'
//
//      if (section && !allowedPaths.includes(section)) {
//        // 🚫 Sem permissão → redireciona para home com erro 404
//        return NextResponse.rewrite(new URL(`/${finalLang}/404`, request.url));
//      }
//
//    } catch (err) {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//  }
//
//  // 🌐 Redireciona para rota com idioma se ainda não tiver
//  if (!hasLang) {
//    const newPathname = pathname === '/' ? `/${finalLang}` : `/${finalLang}${pathname}`;
//    return NextResponse.redirect(new URL(newPathname, request.url));
//  }
//
//  return NextResponse.next();
//}
//
//// 🔁 Define quais rotas o middleware deve interceptar
//export const config = {
//  matcher: [
//    // Intercepta rotas com idioma
//    '/(en|pt-br|es|zh)/:path*',
//
//    // Intercepta rotas sem idioma, exceto rotas internas
//    '/((?!_next|api|static|favicon\\.ico).*)',
//  ],
//};

//export const config = {
//  matcher: [
//    '/((en|pt-br|es|zh)/:path*)',
//    '/((?!_next|api|static|favicon.ico).*)',
//  ],
//};

//import { NextRequest, NextResponse } from 'next/server';
//
//// 🌍 Idiomas suportados
//const supportedLocales = ['en', 'pt-br', 'es', 'zh'];
//
//// 🔓 Rotas públicas (acessíveis sem autenticação)
//const publicRoutes = ['/', '/signin', '/signup', '/about'];
//
//// 🔐 Permissões por cargo (espelhadas do backend)
//const rolePermissions: Record<string, string[]> = {
//  admin:   ['dashboard', 'upload', 'settings', 'admin', 'metrics', 'containers', 'plans', 'users'],
//  staff:   ['dashboard', 'upload', 'settings', 'metrics', 'containers'],
//  dev:     ['dashboard', 'upload', 'settings', 'deploy', 'containers', 'export'],
//  support: ['dashboard', 'metrics', 'history'],
//  user:    ['dashboard', 'upload', 'settings', 'apps'],
//};
//
//export async function middleware(request: NextRequest) {
//  const pathname = request.nextUrl.pathname;
//
//  // ⛔ Ignora rotas internas
//  if (
//    pathname.startsWith('/api') ||
//    pathname.startsWith('/_next') ||
//    pathname.startsWith('/favicon') ||
//    pathname.startsWith('/static')
//  ) {
//    return NextResponse.next();
//  }
//
//  // ✅ Já tem idioma na URL
//  const hasLang = supportedLocales.some((loc) => pathname.startsWith(`/${loc}`));
//  const lang = hasLang
//    ? pathname.split('/')[1]
//    : request.cookies.get('locale')?.value ||
//      request.headers.get('accept-language')?.split(',')[0].toLowerCase() ||
//      'en';
//
//  const finalLang = supportedLocales.includes(lang) ? lang : 'en';
//
//  // 🔐 Verifica token no cookie
//  const token = request.cookies.get('token')?.value;
//
//  // 🔒 Verifica se a rota é pública
//  const isPublic = publicRoutes.some((route) =>
//    pathname === `/${finalLang}${route}` || pathname === route
//  );
//
//  // 🧠 Se a rota não for pública, exige autenticação
//  if (!isPublic) {
//    if (!token) {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//
//    try {
//      const res = await fetch('http://localhost:8080/api/verify-token', {
//        method: 'GET',
//        headers: { Cookie: `token=${token}` },
//      });
//
//      if (!res.ok) {
//        return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//      }
//
//      const user = await res.json(); // espera que o backend retorne { username, role }
//
//      // 🔐 Verifica permissões por cargo
//      const role = user.role || 'user';
//      const allowedPaths = rolePermissions[role] || [];
//
//      // Extrai o segmento da rota após o idioma
//      const segments = pathname.split('/');
//      const section = segments[2]; // ex: /pt-br/dashboard → 'dashboard'
//
//      if (section && !allowedPaths.includes(section)) {
//        // 🚫 Sem permissão → redireciona para home com erro 404
//        return NextResponse.rewrite(new URL(`/${finalLang}/404`, request.url));
//      }
//
//    } catch (err) {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//  }
//
//  // 🌐 Redireciona para rota com idioma se ainda não tiver
//  if (!hasLang) {
//    const newPathname = pathname === '/' ? `/${finalLang}` : `/${finalLang}${pathname}`;
//    return NextResponse.redirect(new URL(newPathname, request.url));
//  }
//
//  return NextResponse.next();
//}

//import { NextRequest, NextResponse } from 'next/server';
//
//// 🌍 Idiomas suportados
//const supportedLocales = ['en', 'pt-br', 'es', 'zh'];
//
//// 🔓 Rotas públicas (acessíveis sem autenticação)
//const publicRoutes = ['/', '/signin', '/signup', '/about'];
//
//export async function middleware(request: NextRequest) {
//  const pathname = request.nextUrl.pathname;
//
//  // ⛔ Ignora rotas internas
//  if (
//    pathname.startsWith('/api') ||
//    pathname.startsWith('/_next') ||
//    pathname.startsWith('/favicon') ||
//    pathname.startsWith('/static')
//  ) {
//    return NextResponse.next();
//  }
//
//  // ✅ Já tem idioma na URL
//  const hasLang = supportedLocales.some((loc) => pathname.startsWith(`/${loc}`));
//  const lang = hasLang
//    ? pathname.split('/')[1]
//    : request.cookies.get('locale')?.value ||
//    request.headers.get('accept-language')?.split(',')[0].toLowerCase() ||
//    'en';
//
//  const finalLang = supportedLocales.includes(lang) ? lang : 'en';
//
//  // 🔐 Verifica token no cookie
//  const token = request.cookies.get('token')?.value;
//
//  // 🔒 Verifica se a rota é pública
//  const isPublic = publicRoutes.some((route) =>
//    pathname === `/${finalLang}${route}` || pathname === route
//  );
//
//  // 🧠 Se a rota não for pública, exige autenticação
//  if (!isPublic) {
//    if (!token) {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//
//    try {
//      const res = await fetch('http://localhost:8080/api/verify-token', {
//        method: 'GET',
//        headers: { Cookie: `token=${token}` },
//      });
//
//      if (!res.ok) {
//        return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//      }
//    } catch {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//  }
//
//  // 🌐 Redireciona para rota com idioma se ainda não tiver
//  if (!hasLang) {
//    const newPathname = pathname === '/' ? `/${finalLang}` : `/${finalLang}${pathname}`;
//    return NextResponse.redirect(new URL(newPathname, request.url));
//  }
//
//  return NextResponse.next();
//}

//frontend/midlleware.ts

//import { NextRequest, NextResponse } from 'next/server';
//
//// 🌍 Idiomas suportados
//const supportedLocales = ['en', 'pt-br', 'es', 'zh'];
//
//// 🔓 Rotas públicas (acessíveis sem autenticação)
//const publicRoutes = ['/', '/signin', '/signup', '/about'];
//
//// 🔐 Permissões por cargo (espelhadas do backend)
//const rolePermissions: Record<string, string[]> = {
//  admin:   ['dashboard', 'upload', 'settings', 'admin', 'metrics', 'containers', 'plans', 'users'],
//  staff:   ['dashboard', 'upload', 'settings', 'metrics', 'containers'],
//  dev:     ['dashboard', 'upload', 'settings', 'deploy', 'containers', 'export'],
//  support: ['dashboard', 'metrics', 'history'],
//  user:    ['dashboard', 'upload', 'settings', 'apps'],
//};
//
//// 🔍 Verifica se o papel tem acesso à seção
//function hasPermission(role: string, section: string): boolean {
//  return rolePermissions[role]?.includes(section) ?? false;
//}
//
//export async function middleware(request: NextRequest) {
//  const pathname = request.nextUrl.pathname;
//
//  // ⛔ Ignora rotas internas
//  if (
//    pathname.startsWith('/api') ||
//    pathname.startsWith('/_next') ||
//    pathname.startsWith('/favicon') ||
//    pathname.startsWith('/static')
//  ) {
//    return NextResponse.next();
//  }
//
//  // ✅ Já tem idioma na URL
//  const hasLang = supportedLocales.some((loc) => pathname.startsWith(`/${loc}`));
//  const lang = hasLang
//    ? pathname.split('/')[1]
//    : request.cookies.get('locale')?.value ||
//      request.headers.get('accept-language')?.split(',')[0].toLowerCase() ||
//      'en';
//
//  const finalLang = supportedLocales.includes(lang) ? lang : 'en';
//
//  // 🔐 Verifica token no cookie
//  const token = request.cookies.get('token')?.value;
//
//  // 🔒 Verifica se a rota é pública
//  const isPublic = publicRoutes.some((route) =>
//    pathname === `/${finalLang}${route}` || pathname === route
//  );
//
//  // 🧠 Se a rota não for pública, exige autenticação
//  if (!isPublic) {
//    if (!token) {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//
//    try {
//      const res = await fetch('http://localhost:8080/api/verify-token', {
//        method: 'GET',
//        headers: { Cookie: `token=${token}` },
//      });
//
//      if (!res.ok) {
//        return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//      }
//
//      const data = await res.json();
//      const userRole = data.role;
//
//      // 🔐 Extrai a seção da rota (ex: /pt-br/dashboard/admin → "admin")
//      const section = pathname.split('/')[2] || 'dashboard';
//
//      if (!hasPermission(userRole, section)) {
//        return NextResponse.redirect(new URL(`/${finalLang}/unauthorized`, request.url));
//      }
//    } catch {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//  }
//
//  // 🌐 Redireciona para rota com idioma se ainda não tiver
//  if (!hasLang) {
//    const newPathname = pathname === '/' ? `/${finalLang}` : `/${finalLang}${pathname}`;
//    return NextResponse.redirect(new URL(newPathname, request.url));
//  }
//
//  return NextResponse.next();
//}

//import { NextRequest, NextResponse } from 'next/server';
//
//// 🌍 Idiomas suportados
//const supportedLocales = ['en', 'pt-br', 'es', 'zh'];
//
//// 🔓 Rotas públicas (acessíveis sem autenticação)
//const publicRoutes = ['/', '/signin', '/signup', '/about'];
//
//export async function middleware(request: NextRequest) {
//  const pathname = request.nextUrl.pathname;
//
//  // ⛔ Ignora rotas internas
//  if (
//    pathname.startsWith('/api') ||
//    pathname.startsWith('/_next') ||
//    pathname.startsWith('/favicon') ||
//    pathname.startsWith('/static')
//  ) {
//    return NextResponse.next();
//  }
//
//  // ✅ Já tem idioma na URL
//  const hasLang = supportedLocales.some((loc) => pathname.startsWith(`/${loc}`));
//  const lang = hasLang
//    ? pathname.split('/')[1]
//    : request.cookies.get('locale')?.value ||
//      request.headers.get('accept-language')?.split(',')[0].toLowerCase() ||
//      'en';
//
//  const finalLang = supportedLocales.includes(lang) ? lang : 'en';
//
//  // 🔐 Verifica token no cookie
//  const token = request.cookies.get('token')?.value;
//
//  // 🔒 Verifica se a rota é pública
//  const isPublic = publicRoutes.some((route) =>
//    pathname === `/${finalLang}${route}` || pathname === route
//  );
//
//  // 🧠 Se a rota não for pública, exige autenticação
//  if (!isPublic) {
//    if (!token) {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//
//    try {
//      const res = await fetch('http://localhost:8080/api/verify-token', {
//        method: 'GET',
//        headers: { Cookie: `token=${token}` },
//      });
//
//      if (!res.ok) {
//        return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//      }
//    } catch {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//  }
//
//  // 🌐 Redireciona para rota com idioma se ainda não tiver
//  if (!hasLang) {
//    const newPathname = pathname === '/' ? `/${finalLang}` : `/${finalLang}${pathname}`;
//    return NextResponse.redirect(new URL(newPathname, request.url));
//  }
//
//  return NextResponse.next();
//}

//
//import { NextRequest, NextResponse } from 'next/server';
//
//// 🌍 Idiomas suportados
//const supportedLocales = ['en', 'pt-br', 'es', 'zh'];
//
//export async function middleware(request: NextRequest) {
//  const pathname = request.nextUrl.pathname;
//
//  // ⛔ Ignora rotas internas
//  if (
//    pathname.startsWith('/api') ||
//    pathname.startsWith('/_next') ||
//    pathname.startsWith('/favicon') ||
//    pathname.startsWith('/static')
//  ) {
//    return NextResponse.next();
//  }
//
//  // ✅ Já tem idioma na URL
//  const hasLang = supportedLocales.some((loc) => pathname.startsWith(`/${loc}`));
//  const lang = hasLang
//    ? pathname.split('/')[1]
//    : request.cookies.get('locale')?.value ||
//      request.headers.get('accept-language')?.split(',')[0].toLowerCase() ||
//      'en';
//
//  const finalLang = supportedLocales.includes(lang) ? lang : 'en';
//
//  // 🔐 Verifica token no cookie
//  const token = request.cookies.get('token')?.value;
//
//  // 🧠 Se estiver acessando rota protegida (ex: dashboard), valida token
//  if (pathname.includes('/dashboard')) {
//    if (!token) {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//
//    try {
//      const res = await fetch('http://localhost:8080/api/verify-token', {
//        method: 'GET',
//        headers: { Cookie: `token=${token}` },
//      });
//
//      if (!res.ok) {
//        return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//      }
//    } catch {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//  }
//
//  // 🌐 Redireciona para rota com idioma se ainda não tiver
//  if (!hasLang) {
//    const newPathname = pathname === '/' ? `/${finalLang}` : `/${finalLang}${pathname}`;
//    return NextResponse.redirect(new URL(newPathname, request.url));
//  }
//
//  return NextResponse.next();
//}

//import { NextRequest, NextResponse } from 'next/server';
//import { hasPermission } from './utils/permissions';
//import { decodeJwt } from './utils/jwt'; // sua função de decodificação
//
//// 🌍 Idiomas suportados
//const supportedLocales = ['en', 'pt-br', 'es', 'zh'];
//
//export async function middleware(request: NextRequest) {
//  const pathname = request.nextUrl.pathname;
//
//  // ⛔ Ignora rotas internas
//  if (
//    pathname.startsWith('/api') ||
//    pathname.startsWith('/_next') ||
//    pathname.startsWith('/favicon') ||
//    pathname.startsWith('/static')
//  ) {
//    return NextResponse.next();
//  }
//
//  // ✅ Já tem idioma na URL
//  const hasLang = supportedLocales.some((loc) => pathname.startsWith(`/${loc}`));
//  const lang = hasLang
//    ? pathname.split('/')[1]
//    : request.cookies.get('locale')?.value ||
//      request.headers.get('accept-language')?.split(',')[0].toLowerCase() ||
//      'en';
//
//  const finalLang = supportedLocales.includes(lang) ? lang : 'en';
//
//  // 🔐 Verifica token no cookie
//  const token = request.cookies.get('token')?.value;
//
//  // 🧠 Se estiver acessando rota protegida (ex: dashboard, upload, admin), valida token e permissões
//  const protectedSections = ['dashboard', 'upload', 'admin'];
//  const section = pathname.split('/')[2]; // ex: 'dashboard'
//
//  if (protectedSections.includes(section)) {
//    if (!token) {
//      const redirectTo = encodeURIComponent(pathname);
//      return NextResponse.redirect(new URL(`/${finalLang}/signin?redirect=${redirectTo}`, request.url));
//    }
//
//    try {
//      const res = await fetch('http://localhost:8080/api/verify-token', {
//        method: 'GET',
//        headers: { Cookie: `token=${token}` },
//      });
//
//      if (!res.ok) {
//        const redirectTo = encodeURIComponent(pathname);
//        return NextResponse.redirect(new URL(`/${finalLang}/signin?redirect=${redirectTo}`, request.url));
//      }
//
//      const user = await res.json(); // deve conter { role, plan }
//
//      // 🔒 Verifica permissão com base na função
//      if (!hasPermission(user.role, section)) {
//        return NextResponse.redirect(new URL(`/${finalLang}`, request.url)); // redireciona para home
//      }
//
//    } catch {
//      const redirectTo = encodeURIComponent(pathname);
//      return NextResponse.redirect(new URL(`/${finalLang}/signin?redirect=${redirectTo}`, request.url));
//    }
//  }
//
//  // 🌐 Redireciona para rota com idioma se ainda não tiver
//  if (!hasLang) {
//    const newPathname = pathname === '/' ? `/${finalLang}` : `/${finalLang}${pathname}`;
//    return NextResponse.redirect(new URL(newPathname, request.url));
//  }
//
//  return NextResponse.next();
//}

//import { NextRequest, NextResponse } from 'next/server';
//import { hasPermission } from './utils/permissions';
//import { decodeJwt } from './utils/jwt'; // sua função de decodificação
//
//// 🌍 Idiomas suportados
//const supportedLocales = ['en', 'pt-br', 'es', 'zh'];
//
//export async function middleware(request: NextRequest) {
//  const pathname = request.nextUrl.pathname;
//
//  // ⛔ Ignora rotas internas
//  if (
//    pathname.startsWith('/api') ||
//    pathname.startsWith('/_next') ||
//    pathname.startsWith('/favicon') ||
//    pathname.startsWith('/static')
//  ) {
//    return NextResponse.next();
//  }
//
//  // ✅ Já tem idioma na URL
//  const hasLang = supportedLocales.some((loc) => pathname.startsWith(`/${loc}`));
//  const lang = hasLang
//    ? pathname.split('/')[1]
//    : request.cookies.get('locale')?.value ||
//      request.headers.get('accept-language')?.split(',')[0].toLowerCase() ||
//      'en';
//
//  const finalLang = supportedLocales.includes(lang) ? lang : 'en';
//
//  // 🔐 Verifica token no cookie
//  const token = request.cookies.get('token')?.value;
//
//  // 🧠 Se estiver acessando rota protegida (ex: dashboard), valida token
//  if (pathname.startsWith(`/${finalLang}/dashboard`)) {
//    if (!token) {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//
//    try {
//      const res = await fetch('http://localhost:8080/api/verify-token', {
//        method: 'GET',
//        headers: { Cookie: `token=${token}` },
//      });
//
//      if (!res.ok) {
//        return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//      }
//    } catch {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//  }
//
//  // 🌐 Redireciona para rota com idioma se ainda não tiver
//  if (!hasLang) {
//    const newPathname = pathname === '/' ? `/${finalLang}` : `/${finalLang}${pathname}`;
//    return NextResponse.redirect(new URL(newPathname, request.url));
//  }
//
//  return NextResponse.next();
//}

//import { NextRequest, NextResponse } from 'next/server';
//import { hasPermission } from './utils/permissions';
//
//// 🌍 Idiomas suportados
//const supportedLocales = ['en', 'pt-br', 'es', 'zh'];
//
//export async function middleware(request: NextRequest) {
//  const pathname = request.nextUrl.pathname;
//
//  // ⛔ Ignora rotas internas
//  if (
//    pathname.startsWith('/api') ||
//    pathname.startsWith('/_next') ||
//    pathname.startsWith('/favicon') ||
//    pathname.startsWith('/static')
//  ) {
//    return NextResponse.next();
//  }
//
//  // ✅ Já tem idioma na URL
//  const hasLang = supportedLocales.some((loc) => pathname.startsWith(`/${loc}`));
//  const lang = hasLang
//    ? pathname.split('/')[1]
//    : request.cookies.get('locale')?.value ||
//      request.headers.get('accept-language')?.split(',')[0].toLowerCase() ||
//      'en';
//
//  const finalLang = supportedLocales.includes(lang) ? lang : 'en';
//
//  // 🔐 Verifica token no cookie
//  const token = request.cookies.get('token')?.value;
//
//  // 🧠 Se estiver acessando rota protegida (ex: dashboard), valida token
//  if (pathname.startsWith(`/${finalLang}/dashboard`)) {
//    if (!token) {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//
//    try {
//      const res = await fetch('http://localhost:8080/api/verify-token', {
//        method: 'GET',
//        headers: { Cookie: `token=${token}` },
//      });
//
//      if (!res.ok) {
//        return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//      }
//    } catch {
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//  }
//
//  // 🌐 Redireciona para rota com idioma se ainda não tiver
//  if (!hasLang) {
//    const newPathname = pathname === '/' ? `/${finalLang}` : `/${finalLang}${pathname}`;
//    return NextResponse.redirect(new URL(newPathname, request.url));
//  }
//
//  return NextResponse.next();
//}

//import { NextRequest, NextResponse } from 'next/server';
//import { hasPermission } from './utils/permissions';
//
//// 🌍 Idiomas suportados
//const supportedLocales = ['en', 'pt-br', 'es', 'zh'];
//
//export async function middleware(request: NextRequest) {
//  const pathname = request.nextUrl.pathname;
//
//  // ⛔ Ignora rotas internas
//  if (
//    pathname.startsWith('/api') ||
//    pathname.startsWith('/_next') ||
//    pathname.startsWith('/favicon') ||
//    pathname.startsWith('/static')
//  ) {
//    return NextResponse.next();
//  }
//
//  // ✅ Já tem idioma na URL
//  const hasLang = supportedLocales.some((loc) => pathname.startsWith(`/${loc}`));
//  const lang = hasLang
//    ? pathname.split('/')[1]
//    : request.cookies.get('locale')?.value ||
//      request.headers.get('accept-language')?.split(',')[0].toLowerCase() ||
//      'en';
//
//  const finalLang = supportedLocales.includes(lang) ? lang : 'en';
//
//  // 🔐 Verifica token no cookie
//  const token = request.cookies.get('token')?.value;
//
//  // 🧠 Se estiver acessando rota protegida (ex: dashboard), valida token
//  if (pathname.startsWith(`/${finalLang}/dashboard`)) {
//    if (!token) {
//      // 🚫 Sem token → redireciona para login
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//
//    try {
//      // 📡 Valida token com backend
//      const res = await fetch('http://localhost:8080/api/verify-token', {
//        method: 'GET',
//        headers: { Cookie: `token=${token}` },
//      });
//
//      if (!res.ok) {
//        // ❌ Token inválido → redireciona para login
//        return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//      }
//    } catch {
//      // ⚠️ Erro na verificação → redireciona para login
//      return NextResponse.redirect(new URL(`/${finalLang}/signin`, request.url));
//    }
//  }
//
//  // 🌐 Redireciona para rota com idioma se ainda não tiver
//  if (!hasLang) {
//    const newPathname = pathname === '/' ? `/${finalLang}` : `/${finalLang}${pathname}`;
//    return NextResponse.redirect(new URL(newPathname, request.url));
//  }
//
//  // ✅ Continua normalmente
//  return NextResponse.next();
//}

// 🧩 Garante que o middleware seja aplicado nas rotas protegidas
//export const config = {
//  matcher: [
//    '/((pt-br|en|es|zh)/dashboard)',         // rota raiz do dashboard
//    '/((pt-br|en|es|zh)/dashboard/:path*)',  // subrotas como /dashboard/upload
//  ],
//};

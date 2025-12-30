//frontend/src/hooks/useAuthRedirect.ts

//'use client';
//
//import { useEffect } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//
//const supportedLocales = ['pt-br', 'en', 'es', 'zh'];
//
//function getLang(pathname: string): string {
//  const segment = pathname.split('/')[1];
//  return supportedLocales.includes(segment) ? segment : 'en';
//}
//
//export default function useAuthRedirect() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) {
//          router.replace(`/${lang}/signin?redirect=${encodeURIComponent(pathname)}`);
//          return;
//        }
//
//        const data = await res.json();
//        if (!data.username) {
//          router.replace(`/${lang}/signin?redirect=${encodeURIComponent(pathname)}`);
//        }
//      } catch (err) {
//        console.error('Erro ao verificar sessão:', err);
//        router.replace(`/${lang}/signin?redirect=${encodeURIComponent(pathname)}`);
//      }
//    };
//
//    checkSession();
//  }, []);
//}

//'use client';
//
//import { useEffect } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//
//const supportedLocales = ['pt-br', 'en', 'es', 'zh'];
//
//function getLang(pathname: string): string {
//  const segment = pathname.split('/')[1];
//  return supportedLocales.includes(segment) ? segment : 'en';
//}
//
//export default function useAuthRedirect(options?: { redirectTo?: string }) {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const redirectPath = options?.redirectTo || `/${lang}/signin?redirect=${encodeURIComponent(pathname)}`;
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (!data.username) {
//          router.replace(redirectPath);
//        }
//      } catch {
//        router.replace(redirectPath);
//      }
//    };
//
//    checkSession();
//  }, []);
//}


//'use client';
//
//import { useEffect } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//
//const supportedLocales = ['pt-br', 'en', 'es', 'zh'];
//
//function getLang(pathname: string): string {
//  const segment = pathname.split('/')[1];
//  return supportedLocales.includes(segment) ? segment : 'en';
//}
//
//export default function useAuthRedirect() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        // 🔐 Se não estiver logado, redireciona para login com retorno
//        if (!data.username) {
//          const redirectTo = encodeURIComponent(pathname);
//          router.replace(`/${lang}/signin?redirect=${redirectTo}`);
//        }
//      } catch {
//        const redirectTo = encodeURIComponent(pathname);
//        router.replace(`/${lang}/signin?redirect=${redirectTo}`);
//      }
//    };
//
//    checkSession();
//  }, []);
//}
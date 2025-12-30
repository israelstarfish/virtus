//frontend/src/hooks/useSessionGuard.ts

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasSectionPermission } from '@/utils/permissions';

interface SessionGuardOptions {
  lang: string;
  permission: string;
  redirectTo?: string;
  onValidSession?: (data: { username: string; role: string }) => void;
}

export function useSessionGuard({ lang, permission, redirectTo, onValidSession }: SessionGuardOptions) {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
        const data = await res.json();
        
        // 👇 Adicione aqui para inspecionar os dados recebidos
        console.log("🔍 Sessão recebida:", data);
        console.log("🔐 Permissão:", hasSectionPermission(data.role, permission));

        if (!data.username || !data.role || !hasSectionPermission(data.role, permission)) {
          const fallback = redirectTo || `/${lang}/signin`;
          router.replace(fallback);
        } else {
          onValidSession?.(data); // ← aqui é onde destrava o loading
        }
      } catch {
        const fallback = redirectTo || `/${lang}/signin`;
        router.replace(fallback);
      }
    };

    checkSession();
  }, [lang, permission, redirectTo, onValidSession, router]);
}

//frontend/src/hooks/useSessionGuard.ts

//import { useEffect } from 'react';
//import { useRouter } from 'next/navigation';
//import { hasPermission } from '@/utils/permissions';
//
//interface SessionGuardOptions {
//  lang: string;
//  permission: string;
//  redirectTo?: string;
//  onValidSession?: (data: { username: string; role: string }) => void;
//}
//
//export function useSessionGuard({ lang, permission, redirectTo, onValidSession }: SessionGuardOptions) {
//  const router = useRouter();
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//        const data = await res.json();
//        
//        // 👇 Adicione aqui para inspecionar os dados recebidos
//        console.log("🔍 Sessão recebida:", data);
//        console.log("🔐 Permissão:", hasPermission(data.role, permission));
//
//        if (!data.username || !data.role || !hasPermission(data.role, permission)) {
//          const fallback = redirectTo || `/${lang}/signin`;
//          router.replace(fallback);
//        } else {
//          onValidSession?.(data); // ← aqui é onde destrava o loading
//        }
//      } catch {
//        const fallback = redirectTo || `/${lang}/signin`;
//        router.replace(fallback);
//      }
//    };
//
//    checkSession();
//  }, [lang, permission, redirectTo, onValidSession, router]);
//}

//import { useEffect } from 'react';
//import { useRouter } from 'next/navigation';
//import { hasPermission } from '@/utils/permissions';
//
//interface SessionGuardOptions {
//  lang: string;
//  permission: string;
//  redirectTo?: string; // ← novo parâmetro opcional
//}
//
//export function useSessionGuard({ lang, permission, redirectTo }: SessionGuardOptions) {
//  const router = useRouter();
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//        const data = await res.json();
//
//        if (!data.username || !data.role || !hasPermission(data.role, permission)) {
//          const fallback = redirectTo || `/${lang}/signin`;
//          router.replace(fallback);
//        }
//      } catch {
//        const fallback = redirectTo || `/${lang}/signin`;
//        router.replace(fallback);
//      }
//    };
//
//    checkSession();
//  }, [lang, permission, redirectTo, router]);
//}

//import { useEffect } from 'react';
//import { useRouter } from 'next/navigation';
//import { hasPermission } from '@/utils/permissions';
//
//export function useSessionGuard({ lang, permission }: { lang: string; permission: string }) {
//  const router = useRouter();
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//        const data = await res.json();
//
//        if (!data.username || !data.role || !hasPermission(data.role, permission)) {
//          router.replace(`/${lang}/signin`);
//        }
//      } catch {
//        router.replace(`/${lang}/signin`);
//      }
//    };
//
//    checkSession();
//  }, [lang, permission, router]);
//}
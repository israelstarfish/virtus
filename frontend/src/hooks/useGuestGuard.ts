// frontend/src/hooks/useGuestGuard.ts

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface GuestGuardOptions {
  lang: string;
  redirectTo?: string;
}

export function useGuestGuard({ lang, redirectTo }: GuestGuardOptions) {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
        const data = await res.json();

        if (data.username && data.role) {
          const fallback = redirectTo || `/${lang}/dashboard`;
          router.replace(fallback);
        }
      } catch {
        // se falhar, assume que não está logado → segue na página
      }
    };

    checkSession();
  }, [lang, redirectTo, router]);
}
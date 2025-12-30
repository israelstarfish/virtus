//frontend/src/hooks/useRedirectIfAuthenticated.ts

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const supportedLocales = ['pt-br', 'en', 'es', 'zh'];

function getLang(pathname: string): string {
  const segment = pathname.split('/')[1];
  return supportedLocales.includes(segment) ? segment : 'en';
}

export default function useRedirectIfAuthenticated() {
  const router = useRouter();
  const pathname = usePathname();
  const lang = getLang(pathname);

  useEffect(() => {
    const checkSession = async () => {
      const res = await fetch('/api/verify-token', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.username) {
        router.replace(`/${lang}/dashboard`);
      }
    };
    checkSession();
  }, []);
}
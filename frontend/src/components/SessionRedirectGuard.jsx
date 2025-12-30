'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// 🌐 Detecta idioma da URL
function getLang(pathname) {
  const segment = pathname.split('/')[1];
  const supported = ['pt-br', 'en', 'es', 'zh'];
  return supported.includes(segment) ? segment : 'en';
}

export default function SessionRedirectGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const lang = getLang(pathname);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch('/api/verify-token', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        if (data.username) {
          router.replace(`/${lang}/dashboard`);
        }
      } catch {
        // ignora erro, segue renderização
      } finally {
        setChecking(false);
      }
    };
    verify();
  }, [router, lang]);

  // ⏳ Enquanto verifica, não renderiza nada
  if (checking) return null;

  return null;
}
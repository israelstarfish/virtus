// frontend/src/hooks/useLang.js

'use client';
import { usePathname } from 'next/navigation';

export function useLang() {
  const pathname = usePathname();
  const segment = pathname.split('/')[1];
  const supported = ['pt-br', 'en', 'es', 'zh'];
  return supported.includes(segment) ? segment : 'pt-br';
}
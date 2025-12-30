// frontend/src/components/ProtectedPage.tsx

'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSessionGuard } from '@/hooks/useSessionGuard';

export default function ProtectedPage({ permission, children }: { permission: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const lang = pathname.split('/')[1] || 'en';
  const [allowed, setAllowed] = useState(false);

  useSessionGuard({
    lang,
    permission,
    onValidSession: () => setAllowed(true),
  });

  if (!allowed) return null;
  return <>{children}</>;
}
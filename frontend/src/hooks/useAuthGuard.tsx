//frontend/src/hooks/useAuthGuard.tsx

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthGuard() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
  const verify = async () => {
    try {
      const res = await fetch('/api/verify-token', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();

      if (data.username) {
        setUsername(data.username);
        setPlan(data.plan || 'no-plan');
        setVerified(true);
      } else {
        console.warn('⚠️ Sessão não verificada:', data);
        setVerified(false);
      }
    } catch (err) {
      console.error('⚠️ Erro ao verificar sessão:', err);
      setVerified(false);
    } finally {
      setLoading(false);
    }
  };

  verify();
}, []);

useEffect(() => {
  if (!loading && !verified) {
    // Aguarda 300ms antes de redirecionar
    setTimeout(() => router.replace('/signin'), 300);
  }
}, [loading, verified, router]);

  return { username, plan, loading };
}


//'use client';
//import { useEffect, useState } from 'react';
//import { useRouter } from 'next/navigation';
//
//export function useAuthGuard() {
//  const router = useRouter();
//  const [username, setUsername] = useState('');
//  const [plan, setPlan] = useState('no-plan');
//  const [loading, setLoading] = useState(true);
//  const [verified, setVerified] = useState(false); // ✅ evita redirecionamento precoce
//
//  useEffect(() => {
//    const verify = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setPlan(data.plan || 'no-plan');
//          setVerified(true);
//        } else {
//          setVerified(false);
//        }
//      } catch {
//        setVerified(false);
//      } finally {
//        setLoading(false);
//      }
//    };
//
//    verify();
//  }, [router]);
//
//  // 🔐 Redireciona somente após verificação completa
//  useEffect(() => {
//    if (!loading && !verified) {
//      router.replace('/signin');
//    }
//  }, [loading, verified, router]);
//
//  // 🔄 Atualiza plano dinamicamente a cada 10s
//  useEffect(() => {
//    const interval = setInterval(() => {
//      fetch('/api/verify-token', { credentials: 'include' })
//        .then((res) => res.json())
//        .then((data) => {
//          if (data.plan && data.plan !== plan) {
//            setPlan(data.plan);
//          }
//        });
//    }, 10000);
//
//    return () => clearInterval(interval);
//  }, [plan]);
//
//  return { username, plan, loading };
//}

//'use client';
//import { useEffect, useState } from 'react';
//import { useRouter } from 'next/navigation';
//
//export function useAuthGuard() {
//  const router = useRouter();
//  const [username, setUsername] = useState('');
//  const [plan, setPlan] = useState('no-plan');
//  const [loading, setLoading] = useState(true);
//
//  useEffect(() => {
//    const verify = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (!data.username) {
//          router.replace('/signin'); // 🔐 redireciona se não estiver logado
//        } else {
//          setUsername(data.username);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch {
//        router.replace('/signin');
//      } finally {
//        setLoading(false);
//      }
//    };
//
//    verify();
//
//    // 🔄 Atualiza plano dinamicamente a cada 10s
//    const interval = setInterval(() => {
//      fetch('/api/verify-token', { credentials: 'include' })
//        .then((res) => res.json())
//        .then((data) => {
//          if (data.plan && data.plan !== plan) {
//            setPlan(data.plan);
//          }
//        });
//    }, 10000);
//
//    return () => clearInterval(interval);
//  }, [router, plan]);
//
//  return { username, plan, loading };
//}
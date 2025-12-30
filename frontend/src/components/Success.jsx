'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Success() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push(`/${locale}/dashboard`);
    }, 2000); // 2 segundos para o usuário ver a mensagem

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="bg-gray-900 p-8 rounded shadow max-w-sm w-full text-center">
      <h2 className="text-2xl mb-4">🎉 Login realizado com sucesso!</h2>
      <p>Bem-vindo ao sistema Virtus Cloud.</p>
      <p className="mt-2 text-sm text-gray-400">Você será redirecionado em instantes...</p>
    </div>
  );
}

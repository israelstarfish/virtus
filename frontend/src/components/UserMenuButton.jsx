'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function UserMenuButton({ lang }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
        const data = await res.json();

        if (data?.username && data?.email) {
          setUser({ username: data.username, email: data.email });
        }
      } catch {
        // Sessão inválida — ignora
      }
    };

    checkSession();
  }, []);

  return (
    <div className="xl:flex hidden items-center gap-4 justify-self-end">
      {!user ? (
        <Link
          href={`/${lang}/signin`}
          role="button"
          className="group relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
        >
          Iniciar sessão
        </Link>
      ) : (
        <button
          type="button"
          role="button"
          aria-haspopup="menu"
          aria-expanded="false"
          className="group relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 group h-12 w-full justify-between px-2.5 md:w-fit"
        >
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-sm leading-none">{user.username}</span>
            <span className="text-[10px] text-secondary leading-none">
              {user.email.replace(/(.{3}).+(@.+)/, '$1••••••••••••$2')}
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 256 256"
            className="text-secondary transition-transform duration-250 group-data-[state=open]:rotate-180"
          >
            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
          </svg>
        </button>
      )}

      {/* Seletor de idioma */}
      <button
        type="button"
        role="button"
        aria-haspopup="menu"
        aria-expanded="false"
        className="group relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
      >
        <img
          alt={lang}
          src={`/assets/contries/${lang}.svg`}
          width={24}
          height={24}
          className="size-6 shrink-0 select-none"
          style={{ color: 'transparent' }}
        />
      </button>
    </div>
  );
}
//frontend/src/components/PlanOrDashboardButton.jsx

'use client';

import { usePathname } from 'next/navigation';

const supportedLangs = ['pt-br', 'en', 'es', 'zh'];

function getLang(pathname) {
  const segment = pathname.split('/')[1];
  return supportedLangs.includes(segment) ? segment : 'pt-br';
}

export function PlanOrDashboardButton({ dict, username }) {
  const pathname = usePathname();
  const lang = getLang(pathname);
  const isLoggedIn = !!username;

  return (
    <a
      href={isLoggedIn ? `/${lang}/dashboard` : `/${lang}/pricing`}
      role="button"
      className="group relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
    >
      <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
        {isLoggedIn ? dict.dashboard : dict.plans}
      </span>
    </a>
  );
}

//'use client';
//
//export function PlanOrDashboardButton({ dict, username }) {
//  const isLoggedIn = !!username;
//
//  return (
//    <a
//      href={isLoggedIn ? `/${lang}/dashboard` : `/${lang}/pricing`}
//      role="button"
//      className="group relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
//    >
//      <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//        {isLoggedIn ? dict.dashboard : dict.plans}
//      </span>
//    </a>
//  );
//}

//'use client';
//
//export function PlanOrDashboardButton({ dict, username }) {
//  const isLoggedIn = !!username;
//
//  return (
//    <a
//      href={isLoggedIn ? '/pt-br/dashboard' : '/pt-br/pricing'}
//      role="button"
//      className="group relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
//    >
//      <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//        {isLoggedIn ? dict.dashboard : dict.plans}
//      </span>
//    </a>
//  );
//}

//      <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//          <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//        </svg>
//      </div>

//'use client';
//import { useSession } from 'next-auth/react';
//
//export function PlanOrDashboardButton({ dict }) {
//  const { data: session } = useSession();
//  const isLoggedIn = !!session?.user;
//
//  return (
//    <a
//      href={isLoggedIn ? '/pt-br/dashboard' : '/pt-br/pricing'}
//      role="button"
//      className="group relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
//    >
//      <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//        {isLoggedIn ? dict.dashboard : dict.plans}
//      </span>
//      <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//          <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//        </svg>
//      </div>
//    </a>
//  );
//}

//import { useSession } from 'next-auth/react';
//
//export function PlanOrDashboardButton() {
//  const { data: session } = useSession(); // ou qualquer lógica de autenticação que você use
//
//  const isLoggedIn = !!session?.user;
//
//  return (
//    <a
//      href={isLoggedIn ? '/pt-br/dashboard' : '/pt-br/pricing'}
//      role="button"
//      className="group relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
//    >
//      <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//        {isLoggedIn ? 'Ir para o painel' : 'Confira nossos planos'}
//      </span>
//      <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//          <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//        </svg>
//      </div>
//    </a>
//  );
//}
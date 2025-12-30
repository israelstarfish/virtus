//frontend/src/components/Recycles/ProfileButton.jsx

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserDropdownMenu } from '@/components/UserDropdownMenu';
import { headerMessages } from '@/app/[lang]/messages/header';
import LanguageSelector from '@/components/Recycles/LanguageSelector';

export default function ProfileButton({
    loading,
    username,
    email,
    role,
    plan,
    lang,
    pathname,
    showLangMenu,
    setShowLangMenu,
    onLogout,
}) {
    const router = useRouter();
    const dict = headerMessages[lang] || headerMessages['pt-br'];

    return (
        <div className="hidden items-center gap-4 justify-self-end sm:flex">
            {/* Sessão do usuário */}
            {loading ? (
                <div className="flex flex-col gap-1">
                    <div className="relative overflow-hidden rounded-md bg-virtus-100/5 before:-translate-x-full before:block before:size-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-virtus-100/10 before:to-transparent h-4 w-24" />
                    <div className="relative overflow-hidden rounded-md bg-virtus-100/5 before:-translate-x-full before:block before:size-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-virtus-100/10 before:to-transparent h-3 w-32" />
                </div>
            ) : username ? (
                <UserDropdownMenu
                    username={username}
                    email={email}
                    role={role}
                    plan={plan}
                    lang={lang}
                    onLogout={onLogout}
                    loading={loading}
                />
            ) : (
                <Link
                    href={`/${lang}/signin`}
                    role="button"
                    className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
                >
                    Entrar
                </Link>
            )}

            {/* Botão de idioma */}
            <div className="relative">
                {/* Botão de idioma sempre renderizado */}
                <LanguageSelector lang={lang} pathname={pathname} dict={dict} />
            </div>
        </div>
    );
}

//frontend/src/components/Recycles/ProfileButton.jsx

//'use client';
//
//import Link from 'next/link';
//import { useRouter } from 'next/navigation';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//
//export default function ProfileButton({
//    loading,
//    username,
//    email,
//    role,
//    plan,
//    lang,
//    pathname,
//    showLangMenu,
//    setShowLangMenu,
//    onLogout,
//}) {
//    const router = useRouter();
//
//    return (
//        <div className="hidden items-center gap-4 justify-self-end sm:flex">
//            {/* Sessão do usuário */}
//            {loading ? (
//                <div className="flex flex-col gap-1">
//                    <div className="relative overflow-hidden rounded-md bg-virtus-100/5 before:-translate-x-full before:block before:size-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-virtus-100/10 before:to-transparent h-4 w-24" />
//                    <div className="relative overflow-hidden rounded-md bg-virtus-100/5 before:-translate-x-full before:block before:size-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-virtus-100/10 before:to-transparent h-3 w-32" />
//                </div>
//            ) : username ? (
//                <UserDropdownMenu
//                    username={username}
//                    email={email}
//                    role={role}
//                    plan={plan}
//                    lang={lang}
//                    onLogout={onLogout}
//                    loading={loading}
//                />
//            ) : (
//                <Link
//                    href={`/${lang}/signin`}
//                    role="button"
//                    className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//                >
//                    Entrar
//                </Link>
//            )}
//
//            {/* Botão de idioma */}
//            <div className="relative">
//                <button
//                    type="button"
//                    onClick={() => setShowLangMenu(!showLangMenu)}
//                    className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//                >
//                    <img
//                        alt={lang}
//                        src={`/assets/countries/${lang}.svg`}
//                        width={24}
//                        height={24}
//                        loading="lazy"
//                        decoding="async"
//                        className="size-6 shrink-0 select-none"
//                        style={{ color: 'transparent' }}
//                    />
//                </button>
//
//                {showLangMenu && (
//                    <div className="absolute right-0 mt-2 min-w-fit rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-2 z-50">
//                        <span className="block p-2 text-secondary text-xs">Selecione um idioma</span>
//                        {[
//                            { code: 'en', label: 'English' },
//                            { code: 'pt-br', label: 'Português' },
//                            { code: 'es', label: 'Español' },
//                            { code: 'zh', label: '中国人' },
//                        ].map(({ code, label }) => (
//                            <button
//                                key={code}
//                                type="button"
//                                onClick={() => router.replace(pathname.replace(lang, code))}
//                                className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                            >
//                                <img
//                                    alt={label}
//                                    src={`/assets/countries/${code}.svg`}
//                                    width={20}
//                                    height={20}
//                                    loading="lazy"
//                                    decoding="async"
//                                    style={{ color: 'transparent' }}
//                                />
//                                {label}
//                            </button>
//                        ))}
//                    </div>
//                )}
//            </div>
//        </div>
//    );
//}

//frontend/src/components/Recycles/ProfileButton.jsx

//'use client';
//
//import Link from 'next/link';
//import { useRouter } from 'next/navigation';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//
//export default function ProfileButton({
//  loading,
//  username,
//  email,
//  role,
//  plan,
//  lang,
//  pathname,
//  showLangMenu,
//  setShowLangMenu,
//  onLogout,
//}) {
//  const router = useRouter();
//
//  return (
//    <div className="hidden items-center gap-4 justify-self-end sm:flex">
//      {/* Sessão do usuário */}
//      {loading ? (
//        <div className="flex flex-col gap-1">
//          <div className="relative overflow-hidden rounded-md bg-virtus-100/5 before:-translate-x-full before:block before:size-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-virtus-100/10 before:to-transparent h-4 w-24" />
//          <div className="relative overflow-hidden rounded-md bg-virtus-100/5 before:-translate-x-full before:block before:size-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-virtus-100/10 before:to-transparent h-3 w-32" />
//        </div>
//      ) : username ? (
//        <UserDropdownMenu
//          username={username}
//          email={email}
//          role={role}
//          plan={plan}
//          lang={lang}
//          onLogout={onLogout}
//        />
//      ) : (
//        <Link
//          href={`/${lang}/signin`}
//          role="button"
//          className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//        >
//          Entrar
//        </Link>
//      )}
//
//      {/* Botão de idioma */}
//      <div className="relative">
//        <button
//          type="button"
//          onClick={() => setShowLangMenu(!showLangMenu)}
//          className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//        >
//          <img
//            alt={lang}
//            src={`/assets/countries/${lang}.svg`}
//            width={24}
//            height={24}
//            loading="lazy"
//            decoding="async"
//            className="size-6 shrink-0 select-none"
//            style={{ color: 'transparent' }}
//          />
//        </button>
//
//        {showLangMenu && (
//          <div className="absolute right-0 mt-2 min-w-fit rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-2 z-50">
//            <span className="block p-2 text-secondary text-xs">Selecione um idioma</span>
//            {[
//              { code: 'en', label: 'English' },
//              { code: 'pt-br', label: 'Português' },
//              { code: 'es', label: 'Español' },
//              { code: 'zh', label: '中国人' },
//            ].map(({ code, label }) => (
//              <button
//                key={code}
//                type="button"
//                onClick={() => router.replace(pathname.replace(lang, code))}
//                className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//              >
//                <img
//                  alt={label}
//                  src={`/assets/countries/${code}.svg`}
//                  width={20}
//                  height={20}
//                  loading="lazy"
//                  decoding="async"
//                  style={{ color: 'transparent' }}
//                />
//                {label}
//              </button>
//            ))}
//          </div>
//        )}
//      </div>
//    </div>
//  );
//}
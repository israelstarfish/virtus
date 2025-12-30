//frontend/src/app/[lang]/signin/page.jsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { messages } from '../messages/signin';
import '../../styles/virtus.css';

// 🌐 Detecta idioma da URL
function getLang(pathname) {
  const segment = pathname.split('/')[1];
  const supported = ['pt-br', 'en', 'es', 'zh'];
  return supported.includes(segment) ? segment : 'en';
}

export default function SignInPage() {
  const pathname = usePathname();
  const lang = getLang(pathname);
  const dict = messages[lang] || messages['pt-br'];
  //const dict = { ...commonMessages[lang], ...messages[lang] };
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const emailInputRef = useRef(null);
  const [loadingDiscord, setLoadingDiscord] = useState(false);

  // ✅ Redireciona se já estiver logado
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/verify-token', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();

        if (data.username && data.role) {
          router.replace(`/${lang}/dashboard`);
        }
      } catch {
        // erro silencioso
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100); // ⏳ pequeno delay para garantir renderização
    return () => clearTimeout(timeout);
  }, []);

  // 🚀 Envia código de login
  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    setEmailError('');

    if (!email || !email.includes('@')) {
      setEmailError(dict.invalidEmail || 'Insira um endereço de email válido *L_*');
      return;
    }

    setSendingCode(true);

    try {
      const res = await fetch('/api/verify-code/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        document.cookie = `virtuscloud.login=${encodeURIComponent(JSON.stringify({ email }))}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `virtuscloud.canAccessConfirm=true; path=/; max-age=86400; SameSite=Lax`;

        // ✅ Transição suave após sucesso
        setTimeout(() => {
          router.push(`/${lang}/signin/confirm`);
          //router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
        }, 1000);
      } else {
        // ✅ Delay antes de mostrar erro
        setTimeout(() => {
          setError(data?.error || dict.errorSending || 'Erro ao enviar código');
          setSendingCode(false);
        }, 1000);
      }
    } catch {
      // ✅ Delay antes de mostrar erro de rede
      setTimeout(() => {
        setError(dict.networkError || 'Erro de rede ou servidor');
        setSendingCode(false);
      }, 1000);
    }
  }

  return (
    <main className="min-h-screen w-full bg-background flex items-center justify-center">
      <div className="transition-opacity duration-300 opacity-100">
        <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
          <div className="relative flex flex-col items-center justify-center">
            <div className="mb-6 flex flex-col items-center gap-2 text-center">
              <button
                className="absolute top-0 left-0 cursor-pointer sm:left-10"
                onClick={() => router.push(`/${lang}/`)} //onClick={() => router.back()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
                </svg>
              </button>
              <img alt="Virtus Cloud Logo" className="mb-4 block w-28" src="/assets/logo.jpg" />
            </div>

            <div className="w-full max-w-96">
              <div className="mb-6 flex flex-col items-center gap-2 text-center">
                <h1 className="font-bold text-2xl">{dict.welcome}</h1>
              </div>

              <form className="flex w-full max-w-100 flex-col gap-4" onSubmit={handleLogin}>
                {/* Campo: E-mail */}
                <div className="flex flex-col gap-2" data-slot="form-item">
                  <label htmlFor="email" className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']" data-error="false" data-required="true" data-slot="form-label">
                    {dict.emailLabel}
                  </label>
                  <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
                    <input
                      ref={emailInputRef} // ✅ conecta o ref
                      className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={dict.emailPlaceholder}
                      autoComplete="off"
                      aria-describedby="email-description"
                      aria-invalid="false"
                      data-slot="form-control"
                    />
                  </div>
                  {emailError && (
                    <div className="text-red-500 text-sm mt-1">{emailError}</div>
                  )}
                </div>

                {/* Botão com spinner */}
                <button
                  type="submit"
                  disabled={sendingCode}
                  aria-disabled={sendingCode}
                  role="button"
                  className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none
      ${sendingCode ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
      bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
                >
                  {sendingCode && (
                    <span className="absolute flex size-full items-center justify-center bg-inherit">
                      <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
                    </span>
                  )}
                  {!sendingCode && (
                    <span>{dict.loginButton}</span>
                  )}
                </button>

                {/* Turnstile */}
                <div className="my-0 w-full">
                  <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
                    {/* Turnstile embed */}
                  </div>
                </div>

                {/* Feedback visual */}
                {success && (
                  <div className="text-green-400 font-medium text-sm flex items-center gap-1">
                  </div>
                )}
                {error && (
                  <div className="text-red-400 font-medium text-sm flex items-center gap-1">
                    <span>⚠</span> {dict.errorSending}
                  </div>
                )}

                {/* Separador OU */}
                <div className="flex select-none items-center gap-4">
                  <span className="block h-px w-full bg-border"></span>
                  <span className="font-medium text-secondary text-sm">OU</span> {/* opcional: criar dict.separator */}
                  <span className="block h-px w-full bg-border"></span>
                </div>

                {/* Botão GitHub */}
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    role="button"
                    aria-disabled={loading}
                    disabled={loading}
                    onClick={() => {
                      setLoading(true);
                      window.open(githubAuthUrl, '_blank', 'noopener,noreferrer');
                      setTimeout(() => setLoading(false), 2000); // opcional: reseta após 2s
                    }}        //onClick={() => window.open(githubAuthUrl, '_blank', 'noopener,noreferrer')}

                    className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full ${loading ? 'opacity-50 pointer-events-none' : ''
                      }`}
                  >
                    {loading && (
                      <span className="absolute flex size-full items-center justify-center bg-inherit">
                        <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
                      </span>
                    )}
                    <img
                      alt="Github"
                      width={20}
                      height={20}
                      className="absolute left-4"
                      src="/assets/companies/small/github.svg"
                    />
                    {dict.githubButton}
                  </button>

                  {/* Botão Discord */}
                  <button
                    type="button"
                    role="button"
                    aria-disabled={loadingDiscord}
                    disabled={loadingDiscord}
                    onClick={() => {
                      setLoadingDiscord(true);
                      window.open(discordAuthUrl, '_blank', 'noopener,noreferrer');
                      setTimeout(() => setLoadingDiscord(false), 2000); // opcional: reseta após 2s
                    }}
                    className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full ${loadingDiscord ? 'opacity-50 pointer-events-none' : ''
                      }`}
                  >
                    {loadingDiscord && (
                      <span className="absolute flex size-full items-center justify-center bg-inherit">
                        <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
                      </span>
                    )}
                    <img
                      alt="Discord"
                      width={20}
                      height={20}
                      className="absolute left-4"
                      src="/assets/companies/small/discord.svg"
                    />
                    {dict.discordButton}
                  </button>
                  
                  {/* Link para criar conta */}
                  <div className="flex w-full justify-center gap-1.5">
                    <span className="text-sm">{dict.noAccount}</span>
                    <Link href={`/${lang}/signup`} className="flex items-center gap-1 text-center text-blue-500 text-sm">
                      {dict.create}
                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Rodapé com termos */}
                <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
                  <Link href={`/${lang}/legal/policy`} className="hover:text-white">{dict.privacy}</Link>
                  <Link href={`/${lang}/legal`} className="hover:text-white">{dict.terms}</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

//frontend/src/app/[lang]/signin/page.jsx

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import { messages } from './messages';
//import '../../styles/virtus.css';
//
//// 🌐 Detecta idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang] || messages['pt-br'];
//  //const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const [loading, setLoading] = useState(false);
//
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [emailError, setEmailError] = useState('');
//  const [sendingCode, setSendingCode] = useState(false);
//  const [checkingSession, setCheckingSession] = useState(true);
//  const emailInputRef = useRef(null);
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (data.username && data.role) {
//          router.replace(`/${lang}/dashboard`);
//        }
//      } catch {
//        // erro silencioso
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    const timeout = setTimeout(() => {
//      emailInputRef.current?.focus();
//    }, 100); // ⏳ pequeno delay para garantir renderização
//    return () => clearTimeout(timeout);
//  }, []);
//
//  // 🚀 Envia código de login
//  async function handleLogin(event) {
//    event.preventDefault();
//    setError('');
//    setEmailError('');
//
//    if (!email || !email.includes('@')) {
//      setEmailError(dict.invalidEmail || 'Insira um endereço de email válido *L_*');
//      return;
//    }
//
//    setSendingCode(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        document.cookie = `virtuscloud.login=${encodeURIComponent(JSON.stringify({ email }))}; path=/; max-age=86400; SameSite=Lax`;
//        document.cookie = `virtuscloud.canAccessConfirm=true; path=/; max-age=86400; SameSite=Lax`;
//
//        // ✅ Transição suave após sucesso
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm`);
//          //router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        // ✅ Delay antes de mostrar erro
//        setTimeout(() => {
//          setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//          setSendingCode(false);
//        }, 1000);
//      }
//    } catch {
//      // ✅ Delay antes de mostrar erro de rede
//      setTimeout(() => {
//        setError(dict.networkError || 'Erro de rede ou servidor');
//        setSendingCode(false);
//      }, 1000);
//    }
//  }
//
//  return (
//    <main className="min-h-screen w-full bg-background flex items-center justify-center">
//      <div className="transition-opacity duration-300 opacity-100">
//        <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//          <div className="relative flex flex-col items-center justify-center">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <button
//                className="absolute top-0 left-0 cursor-pointer sm:left-10"
//                onClick={() => router.push(`/${lang}/`)} //onClick={() => router.back()}
//              >
//                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                </svg>
//              </button>
//              <img alt="Virtus Cloud Logo" className="mb-4 block w-28" src="/assets/logo.jpg" />
//            </div>
//
//            <div className="w-full max-w-96">
//              <div className="mb-6 flex flex-col items-center gap-2 text-center">
//                <h1 className="font-bold text-2xl">{dict.welcome}</h1>
//              </div>
//
//              <form className="flex w-full max-w-100 flex-col gap-4" onSubmit={handleLogin}>
//                {/* Campo: E-mail */}
//                <div className="flex flex-col gap-2" data-slot="form-item">
//                  <label htmlFor="email" className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']" data-error="false" data-required="true" data-slot="form-label">
//                    {dict.emailLabel}
//                  </label>
//                  <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                    <input
//                      ref={emailInputRef} // ✅ conecta o ref
//                      className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                      type="email"
//                      id="email"
//                      name="email"
//                      value={email}
//                      onChange={e => setEmail(e.target.value)}
//                      placeholder={dict.emailPlaceholder}
//                      autoComplete="off"
//                      aria-describedby="email-description"
//                      aria-invalid="false"
//                      data-slot="form-control"
//                    />
//                  </div>
//                  {emailError && (
//                    <div className="text-red-500 text-sm mt-1">{emailError}</div>
//                  )}
//                </div>
//
//                {/* Botão com spinner */}
//                <button
//                  type="submit"
//                  disabled={sendingCode}
//                  aria-disabled={sendingCode}
//                  role="button"
//                  className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none
//      ${sendingCode ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//      bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                >
//                  {sendingCode && (
//                    <span className="absolute flex size-full items-center justify-center bg-inherit">
//                      <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//                    </span>
//                  )}
//                  {!sendingCode && (
//                    <span>{dict.loginButton}</span>
//                  )}
//                </button>
//
//                {/* Turnstile */}
//                <div className="my-0 w-full">
//                  <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                    {/* Turnstile embed */}
//                  </div>
//                </div>
//
//                {/* Feedback visual */}
//                {success && (
//                  <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//                  </div>
//                )}
//                {error && (
//                  <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//                    <span>⚠</span> {dict.errorSending}
//                  </div>
//                )}
//
//                {/* Separador OU */}
//                <div className="flex select-none items-center gap-4">
//                  <span className="block h-px w-full bg-border"></span>
//                  <span className="font-medium text-secondary text-sm">OU</span> {/* opcional: criar dict.separator */}
//                  <span className="block h-px w-full bg-border"></span>
//                </div>
//
//                {/* Botão GitHub */}
//                <div className="flex flex-col gap-3">
//                  <button
//                    type="button"
//                    role="button"
//                    aria-disabled={loading}
//                    disabled={loading}
//                    onClick={() => {
//                      setLoading(true);
//                      window.open(githubAuthUrl, '_blank', 'noopener,noreferrer');
//                      setTimeout(() => setLoading(false), 2000); // opcional: reseta após 2s
//                    }}        //onClick={() => window.open(githubAuthUrl, '_blank', 'noopener,noreferrer')}
//
//                    className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full ${loading ? 'opacity-50 pointer-events-none' : ''
//                      }`}
//                  >
//                    {loading && (
//                      <span className="absolute flex size-full items-center justify-center bg-inherit">
//                        <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
//                      </span>
//                    )}
//                    <img
//                      alt="Github"
//                      width={20}
//                      height={20}
//                      className="absolute left-4"
//                      src="/assets/companies/small/github.svg"
//                    />
//                    {dict.githubButton}
//                  </button>
//
//                  <button
//                    type="button"
//                    role="button"
//                    aria-disabled={false}
//                    className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full"
//                  >
//                    <img
//                      alt="Discord"
//                      width={20}
//                      height={20}
//                      className="absolute left-4"
//                      src="/assets/companies/small/discord.svg"
//                    />
//                    Entrar com o Discord
//                  </button>
//
//                  {/* Link para criar conta */}
//                  <div className="flex w-full justify-center gap-1.5">
//                    <span className="text-sm">{dict.noAccount}</span>
//                    <Link href={`/${lang}/signup`} className="flex items-center gap-1 text-center text-blue-500 text-sm">
//                      {dict.create}
//                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                      </svg>
//                    </Link>
//                  </div>
//                </div>
//
//                {/* Rodapé com termos */}
//                <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//                  <Link href={`/${lang}/legal/policy`} className="hover:text-white">{dict.privacy}</Link>
//                  <Link href={`/${lang}/legal`} className="hover:text-white">{dict.terms}</Link>
//                </div>
//              </form>
//            </div>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signin/page.jsx

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import { messages } from './messages';
//import '../../styles/virtus.css';
//
//// 🌐 Detecta idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang] || messages['pt-br'];
//  //const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const [loading, setLoading] = useState(false);
//
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [emailError, setEmailError] = useState('');
//  const [sendingCode, setSendingCode] = useState(false);
//  const [checkingSession, setCheckingSession] = useState(true);
//  const emailInputRef = useRef(null);
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (data.username && data.role) {
//          router.replace(`/${lang}/dashboard`);
//        }
//      } catch {
//        // erro silencioso
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    const timeout = setTimeout(() => {
//      emailInputRef.current?.focus();
//    }, 100); // ⏳ pequeno delay para garantir renderização
//    return () => clearTimeout(timeout);
//  }, []);
//
//  // 🚀 Envia código de login
//  async function handleLogin(event) {
//    event.preventDefault();
//    setError('');
//    setEmailError('');
//
//    if (!email || !email.includes('@')) {
//      setEmailError(dict.invalidEmail || 'Insira um endereço de email válido *L_*');
//      return;
//    }
//
//    setSendingCode(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        document.cookie = `virtuscloud.login=${encodeURIComponent(JSON.stringify({ email }))}; path=/; max-age=86400; SameSite=Lax`;
//        document.cookie = `virtuscloud.canAccessConfirm=true; path=/; max-age=86400; SameSite=Lax`;
//
//        // ✅ Transição suave após sucesso
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm`);
//          //router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        // ✅ Delay antes de mostrar erro
//        setTimeout(() => {
//          setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//          setSendingCode(false);
//        }, 1000);
//      }
//    } catch {
//      // ✅ Delay antes de mostrar erro de rede
//      setTimeout(() => {
//        setError(dict.networkError || 'Erro de rede ou servidor');
//        setSendingCode(false);
//      }, 1000);
//    }
//  }
//
//  return (
//    <main className="min-h-screen w-full bg-background flex items-center justify-center">
//      <div className="transition-opacity duration-300 opacity-100">
//        <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//          <div className="relative flex flex-col items-center justify-center">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <button
//                className="absolute top-0 left-0 cursor-pointer sm:left-10"
//                onClick={() => router.push(`/${lang}/`)} //onClick={() => router.back()}
//              >
//                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                </svg>
//              </button>
//              <img alt="Virtus Cloud Logo" className="mb-4 block w-28" src="/assets/logo.jpg" />
//            </div>
//
//            <div className="w-full max-w-96">
//              <div className="mb-6 flex flex-col items-center gap-2 text-center">
//                <h1 className="font-bold text-2xl">{dict.welcome}</h1>
//              </div>
//
//              <form className="flex w-full max-w-100 flex-col gap-4" onSubmit={handleLogin}>
//                {/* Campo: E-mail */}
//                <div className="flex flex-col gap-2" data-slot="form-item">
//                  <label htmlFor="email" className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']" data-error="false" data-required="true" data-slot="form-label">
//                    {dict.emailLabel}
//                  </label>
//                  <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                    <input
//                      ref={emailInputRef} // ✅ conecta o ref
//                      className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                      type="email"
//                      id="email"
//                      name="email"
//                      value={email}
//                      onChange={e => setEmail(e.target.value)}
//                      placeholder={dict.emailPlaceholder}
//                      autoComplete="off"
//                      aria-describedby="email-description"
//                      aria-invalid="false"
//                      data-slot="form-control"
//                    />
//                  </div>
//                  {emailError && (
//                    <div className="text-red-500 text-sm mt-1">{emailError}</div>
//                  )}
//                </div>
//
//                {/* Botão com spinner */}
//                <button
//                  type="submit"
//                  disabled={sendingCode}
//                  aria-disabled={sendingCode}
//                  role="button"
//                  className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none
//      ${sendingCode ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//      bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                >
//                  {sendingCode && (
//                    <span className="absolute flex size-full items-center justify-center bg-inherit">
//                      <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//                    </span>
//                  )}
//                  {!sendingCode && (
//                    <span>{dict.loginButton}</span>
//                  )}
//                </button>
//
//                {/* Turnstile */}
//                <div className="my-0 w-full">
//                  <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                    {/* Turnstile embed */}
//                  </div>
//                </div>
//
//                {/* Feedback visual */}
//                {success && (
//                  <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//                  </div>
//                )}
//                {error && (
//                  <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//                    <span>⚠</span> {dict.errorSending}
//                  </div>
//                )}
//
//                {/* Separador OU */}
//                <div className="flex select-none items-center gap-4">
//                  <span className="block h-px w-full bg-border"></span>
//                  <span className="font-medium text-secondary text-sm">OU</span> {/* opcional: criar dict.separator */}
//                  <span className="block h-px w-full bg-border"></span>
//                </div>
//
//                {/* Botão GitHub */}
//                <div className="flex flex-col gap-3">
//                  <button
//                    type="button"
//                    role="button"
//                    aria-disabled={loading}
//                    disabled={loading}
//                    onClick={() => {
//                      setLoading(true);
//                      window.open(githubAuthUrl, '_blank', 'noopener,noreferrer');
//                      setTimeout(() => setLoading(false), 2000); // opcional: reseta após 2s
//                    }}        //onClick={() => window.open(githubAuthUrl, '_blank', 'noopener,noreferrer')}
//
//                    className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full ${loading ? 'opacity-50 pointer-events-none' : ''
//                      }`}
//                  >
//                    {loading && (
//                      <span className="absolute flex size-full items-center justify-center bg-inherit">
//                        <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
//                      </span>
//                    )}
//                    <img
//                      alt="Github"
//                      width={20}
//                      height={20}
//                      className="absolute left-4"
//                      src="/assets/companies/small/github.svg"
//                    />
//                    {dict.githubButton}
//                  </button>
//
//
//                  {/* Link para criar conta */}
//                  <div className="flex w-full justify-center gap-1.5">
//                    <span className="text-sm">{dict.noAccount}</span>
//                    <Link href={`/${lang}/signup`} className="flex items-center gap-1 text-center text-blue-500 text-sm">
//                      {dict.create}
//                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                      </svg>
//                    </Link>
//                  </div>
//                </div>
//
//                {/* Rodapé com termos */}
//                <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//                  <Link href={`/${lang}/legal/policy`} className="hover:text-white">{dict.privacy}</Link>
//                  <Link href={`/${lang}/legal`} className="hover:text-white">{dict.terms}</Link>
//                </div>
//              </form>
//            </div>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signin/page.jsx

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import { messages } from './messages';
//import '../../styles/virtus.css';
////import Image from 'next/image';
////import { commonMessages } from '@/app/i18n/commonMessages';
//
//// 🌐 Detecta idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang] || messages['pt-br'];
//  //const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const [loading, setLoading] = useState(false);
//
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [emailError, setEmailError] = useState('');
//  const [sendingCode, setSendingCode] = useState(false);
//  const [checkingSession, setCheckingSession] = useState(true);
//  const emailInputRef = useRef(null);
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (data.username && data.role) {
//          router.replace(`/${lang}/dashboard`);
//        }
//      } catch {
//        // erro silencioso
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    const timeout = setTimeout(() => {
//      emailInputRef.current?.focus();
//    }, 100); // ⏳ pequeno delay para garantir renderização
//    return () => clearTimeout(timeout);
//  }, []);
//
//  // ⏳ Enquanto verifica sessão, não renderiza nada
//  //if (checkingSession) {
//  //  return (
//  //    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//  //      <div className="size-6 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
//  //    </main>
//  //  );
//  //}
//  //if (checkingSession) return null;
//
//  // 🚀 Envia código de login
//  async function handleLogin(event) {
//    event.preventDefault();
//    setError('');
//    setEmailError('');
//
//    if (!email || !email.includes('@')) {
//      setEmailError(dict.invalidEmail || 'Insira um endereço de email válido *L_*');
//      return;
//    }
//
//    setSendingCode(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        document.cookie = `virtuscloud.login=${encodeURIComponent(JSON.stringify({ email }))}; path=/; max-age=86400; SameSite=Lax`;
//        document.cookie = `virtuscloud.canAccessConfirm=true; path=/; max-age=86400; SameSite=Lax`;
//      //if (res.ok && data.success) {
//      //  localStorage.setItem('canAccessConfirm', 'true');
//      //  localStorage.setItem('signinEmail', email);
//
//        // ✅ Transição suave após sucesso
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm`);
//          //router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        // ✅ Delay antes de mostrar erro
//        setTimeout(() => {
//          setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//          setSendingCode(false);
//        }, 1000);
//      }
//    } catch {
//      // ✅ Delay antes de mostrar erro de rede
//      setTimeout(() => {
//        setError(dict.networkError || 'Erro de rede ou servidor');
//        setSendingCode(false);
//      }, 1000);
//    }
//  }
//
//  return (
//    <main className="min-h-screen w-full bg-background flex items-center justify-center">
//      <div className="transition-opacity duration-300 opacity-100">
//        <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//          <div className="relative flex flex-col items-center justify-center">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <button
//                className="absolute top-0 left-0 cursor-pointer sm:left-10"
//                onClick={() => router.push(`/${lang}/`)} //onClick={() => router.back()}
//              >
//                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                </svg>
//              </button>
//              <img alt="Virtus Cloud Logo" className="mb-4 block w-28" src="/assets/logo.jpg" />
//            </div>
//
//            <div className="w-full max-w-96">
//              <div className="mb-6 flex flex-col items-center gap-2 text-center">
//                <h1 className="font-bold text-2xl">{dict.welcome}</h1>
//              </div>
//
//              <form className="flex w-full max-w-100 flex-col gap-4" onSubmit={handleLogin}>
//                {/* Campo: E-mail */}
//                <div className="flex flex-col gap-2" data-slot="form-item">
//                  <label htmlFor="email" className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']" data-error="false" data-required="true" data-slot="form-label">
//                    {dict.emailLabel}
//                  </label>
//                  <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                    <input
//                      ref={emailInputRef} // ✅ conecta o ref
//                      className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                      type="email"
//                      id="email"
//                      name="email"
//                      value={email}
//                      onChange={e => setEmail(e.target.value)}
//                      placeholder={dict.emailPlaceholder}
//                      autoComplete="off"
//                      aria-describedby="email-description"
//                      aria-invalid="false"
//                      data-slot="form-control"
//                    />
//                  </div>
//                  {emailError && (
//                    <div className="text-red-500 text-sm mt-1">{emailError}</div>
//                  )}
//                </div>
//
//                {/* Botão com spinner */}
//                <button
//                  type="submit"
//                  disabled={sendingCode}
//                  aria-disabled={sendingCode}
//                  role="button"
//                  className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none
//      ${sendingCode ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//      bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                >
//                  {sendingCode && (
//                    <span className="absolute flex size-full items-center justify-center bg-inherit">
//                      <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//                    </span>
//                  )}
//                  {!sendingCode && (
//                    <span>{dict.loginButton}</span>
//                  )}
//                </button>
//
//                {/* Turnstile */}
//                <div className="my-0 w-full">
//                  <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                    {/* Turnstile embed */}
//                  </div>
//                </div>
//
//                {/* Feedback visual */}
//                {success && (
//                  <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//                  </div>
//                )}
//                {error && (
//                  <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//                    <span>⚠</span> {dict.errorSending}
//                  </div>
//                )}
//
//                {/* Separador OU */}
//                <div className="flex select-none items-center gap-4">
//                  <span className="block h-px w-full bg-border"></span>
//                  <span className="font-medium text-secondary text-sm">OU</span> {/* opcional: criar dict.separator */}
//                  <span className="block h-px w-full bg-border"></span>
//                </div>
//
//                {/* Botão GitHub */}
//                <div className="flex flex-col gap-3">
//                  <button
//                    type="button"
//                    role="button"
//                    aria-disabled={loading}
//                    disabled={loading}
//                    onClick={() => {
//                      setLoading(true);
//                      window.open(githubAuthUrl, '_blank', 'noopener,noreferrer');
//                      setTimeout(() => setLoading(false), 2000); // opcional: reseta após 2s
//                    }}        //onClick={() => window.open(githubAuthUrl, '_blank', 'noopener,noreferrer')}
//
//                    className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full ${loading ? 'opacity-50 pointer-events-none' : ''
//                      }`}
//                  >
//                    {loading && (
//                      <span className="absolute flex size-full items-center justify-center bg-inherit">
//                        <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
//                      </span>
//                    )}
//                    <img
//                      alt="Github"
//                      width={20}
//                      height={20}
//                      className="absolute left-4"
//                      src="/assets/companies/small/github.svg"
//                    />
//                    {dict.githubButton}
//                  </button>
//
//
//                  {/* Link para criar conta */}
//                  <div className="flex w-full justify-center gap-1.5">
//                    <span className="text-sm">{dict.noAccount}</span>
//                    <Link href={`/${lang}/signup`} className="flex items-center gap-1 text-center text-blue-500 text-sm">
//                      {dict.create}
//                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                      </svg>
//                    </Link>
//                  </div>
//                </div>
//
//                {/* Rodapé com termos */}
//                <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//                  <Link href={`/${lang}/legal/policy`} className="hover:text-white">{dict.privacy}</Link>
//                  <Link href={`/${lang}/legal`} className="hover:text-white">{dict.terms}</Link>
//                </div>
//              </form>
//            </div>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signin/page.jsx

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import { messages } from './messages';
//import '../../styles/virtus.css';
////import Image from 'next/image';
////import { commonMessages } from '@/app/i18n/commonMessages';
//
//// 🌐 Detecta idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang] || messages['pt-br'];
//  //const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const [loading, setLoading] = useState(false);
//
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [emailError, setEmailError] = useState('');
//  const [sendingCode, setSendingCode] = useState(false);
//  const [checkingSession, setCheckingSession] = useState(true);
//  const emailInputRef = useRef(null);
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (data.username && data.role) {
//          router.replace(`/${lang}/dashboard`);
//        }
//      } catch {
//        // erro silencioso
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    const timeout = setTimeout(() => {
//      emailInputRef.current?.focus();
//    }, 100); // ⏳ pequeno delay para garantir renderização
//    return () => clearTimeout(timeout);
//  }, []);
//
//  // ⏳ Enquanto verifica sessão, não renderiza nada
//  //if (checkingSession) {
//  //  return (
//  //    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//  //      <div className="size-6 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
//  //    </main>
//  //  );
//  //}
//  //if (checkingSession) return null;
//
//  // 🚀 Envia código de login
//  async function handleLogin(event) {
//    event.preventDefault();
//    setError('');
//    setEmailError('');
//
//    if (!email || !email.includes('@')) {
//      setEmailError(dict.invalidEmail || 'Insira um endereço de email válido *L_*');
//      return;
//    }
//
//    setSendingCode(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        document.cookie = `virtuscloud.login=${encodeURIComponent(JSON.stringify({ email }))}; path=/; max-age=86400; SameSite=Lax`;
//        document.cookie = `virtuscloud.canAccessConfirm=true; path=/; max-age=86400; SameSite=Lax`;
//      //if (res.ok && data.success) {
//      //  localStorage.setItem('canAccessConfirm', 'true');
//      //  localStorage.setItem('signinEmail', email);
//
//        // ✅ Transição suave após sucesso
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm`);
//          //router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        // ✅ Delay antes de mostrar erro
//        setTimeout(() => {
//          setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//          setSendingCode(false);
//        }, 1000);
//      }
//    } catch {
//      // ✅ Delay antes de mostrar erro de rede
//      setTimeout(() => {
//        setError(dict.networkError || 'Erro de rede ou servidor');
//        setSendingCode(false);
//      }, 1000);
//    }
//  }
//
//  return (
//    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//      <div className="transition-opacity duration-300 opacity-100">
//        <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//          <div className="relative flex flex-col items-center justify-center">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <button
//                className="absolute top-0 left-0 cursor-pointer sm:left-10"
//                onClick={() => router.push(`/${lang}/`)} //onClick={() => router.back()}
//              >
//                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                </svg>
//              </button>
//              <img alt="Virtus Cloud Logo" className="mb-4 block w-28" src="/assets/logo.jpg" />
//            </div>
//
//            <div className="w-full max-w-96">
//              <div className="mb-6 flex flex-col items-center gap-2 text-center">
//                <h1 className="font-bold text-2xl">{dict.welcome}</h1>
//              </div>
//
//              <form className="flex w-full max-w-100 flex-col gap-4" onSubmit={handleLogin}>
//                {/* Campo: E-mail */}
//                <div className="flex flex-col gap-2" data-slot="form-item">
//                  <label htmlFor="email" className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']" data-error="false" data-required="true" data-slot="form-label">
//                    {dict.emailLabel}
//                  </label>
//                  <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                    <input
//                      ref={emailInputRef} // ✅ conecta o ref
//                      className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                      type="email"
//                      id="email"
//                      name="email"
//                      value={email}
//                      onChange={e => setEmail(e.target.value)}
//                      placeholder={dict.emailPlaceholder}
//                      autoComplete="off"
//                      aria-describedby="email-description"
//                      aria-invalid="false"
//                      data-slot="form-control"
//                    />
//                  </div>
//                  {emailError && (
//                    <div className="text-red-500 text-sm mt-1">{emailError}</div>
//                  )}
//                </div>
//
//                {/* Botão com spinner */}
//                <button
//                  type="submit"
//                  disabled={sendingCode}
//                  aria-disabled={sendingCode}
//                  role="button"
//                  className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none
//      ${sendingCode ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//      bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                >
//                  {sendingCode && (
//                    <span className="absolute flex size-full items-center justify-center bg-inherit">
//                      <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//                    </span>
//                  )}
//                  {!sendingCode && (
//                    <span>{dict.loginButton}</span>
//                  )}
//                </button>
//
//                {/* Turnstile */}
//                <div className="my-0 w-full">
//                  <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                    {/* Turnstile embed */}
//                  </div>
//                </div>
//
//                {/* Feedback visual */}
//                {success && (
//                  <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//                  </div>
//                )}
//                {error && (
//                  <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//                    <span>⚠</span> {dict.errorSending}
//                  </div>
//                )}
//
//                {/* Separador OU */}
//                <div className="flex select-none items-center gap-4">
//                  <span className="block h-px w-full bg-border"></span>
//                  <span className="font-medium text-secondary text-sm">OU</span> {/* opcional: criar dict.separator */}
//                  <span className="block h-px w-full bg-border"></span>
//                </div>
//
//                {/* Botão GitHub */}
//                <div className="flex flex-col gap-3">
//                  <button
//                    type="button"
//                    role="button"
//                    aria-disabled={loading}
//                    disabled={loading}
//                    onClick={() => {
//                      setLoading(true);
//                      window.open(githubAuthUrl, '_blank', 'noopener,noreferrer');
//                      setTimeout(() => setLoading(false), 2000); // opcional: reseta após 2s
//                    }}        //onClick={() => window.open(githubAuthUrl, '_blank', 'noopener,noreferrer')}
//
//                    className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full ${loading ? 'opacity-50 pointer-events-none' : ''
//                      }`}
//                  >
//                    {loading && (
//                      <span className="absolute flex size-full items-center justify-center bg-inherit">
//                        <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
//                      </span>
//                    )}
//                    <img
//                      alt="Github"
//                      width={20}
//                      height={20}
//                      className="absolute left-4"
//                      src="/assets/companies/small/github.svg"
//                    />
//                    {dict.githubButton}
//                  </button>
//
//
//                  {/* Link para criar conta */}
//                  <div className="flex w-full justify-center gap-1.5">
//                    <span className="text-sm">{dict.noAccount}</span>
//                    <Link href={`/${lang}/signup`} className="flex items-center gap-1 text-center text-blue-500 text-sm">
//                      {dict.create}
//                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                      </svg>
//                    </Link>
//                  </div>
//                </div>
//
//                {/* Rodapé com termos */}
//                <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//                  <Link href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</Link>
//                  <Link href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</Link>
//                </div>
//              </form>
//            </div>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signin/page.jsx

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import { messages } from './messages';
//import '../../styles/virtus.css';
//import { commonMessages } from '@/app/i18n/commonMessages';
//import { useSession } from '@/context/SessionContext'; // novo hook
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang] || messages['pt-br'];
//  const router = useRouter();
//
//  const { session, loading } = useSession(); // usa contexto
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [emailError, setEmailError] = useState('');
//  const [sendingCode, setSendingCode] = useState(false);
//  const emailInputRef = useRef(null);
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    if (!loading && session?.username && session?.role) {
//      router.replace(`/${lang}/dashboard`);
//    }
//  }, [loading, session]);
//
//  useEffect(() => {
//    const timeout = setTimeout(() => {
//      emailInputRef.current?.focus();
//    }, 100);
//    return () => clearTimeout(timeout);
//  }, []);
//
//  // 🚀 Envia código de login
//  async function handleLogin(event) {
//    event.preventDefault();
//    setError('');
//    setEmailError('');
//
//    if (!email || !email.includes('@')) {
//      setEmailError(dict.invalidEmail || 'Insira um endereço de email válido *L_*');
//      return;
//    }
//
//    setSendingCode(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        document.cookie = `virtuscloud.login=${encodeURIComponent(JSON.stringify({ email }))}; path=/; max-age=86400; SameSite=Lax`;
//        document.cookie = `virtuscloud.canAccessConfirm=true; path=/; max-age=86400; SameSite=Lax`;
//
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm`);
//        }, 1000);
//      } else {
//        setTimeout(() => {
//          setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//          setSendingCode(false);
//        }, 1000);
//      }
//    } catch {
//      setTimeout(() => {
//        setError(dict.networkError || 'Erro de rede ou servidor');
//        setSendingCode(false);
//      }, 1000);
//    }
//  }
//
//
//  return (
//    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//      <div className="transition-opacity duration-300 opacity-100">
//        <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//          <div className="relative flex flex-col items-center justify-center">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <button
//                className="absolute top-0 left-0 cursor-pointer sm:left-10"
//                onClick={() => router.push(`/${lang}/`)} //onClick={() => router.back()}
//              >
//                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                </svg>
//              </button>
//              <img alt="Virtus Cloud Logo" className="mb-4 block w-28" src="/assets/logo.jpg" />
//            </div>
//
//            <div className="w-full max-w-96">
//              <div className="mb-6 flex flex-col items-center gap-2 text-center">
//                <h1 className="font-bold text-2xl">{dict.welcome}</h1>
//              </div>
//
//              <form className="flex w-full max-w-100 flex-col gap-4" onSubmit={handleLogin}>
//                {/* Campo: E-mail */}
//                <div className="flex flex-col gap-2" data-slot="form-item">
//                  <label htmlFor="email" className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']" data-error="false" data-required="true" data-slot="form-label">
//                    {dict.emailLabel}
//                  </label>
//                  <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                    <input
//                      ref={emailInputRef} // ✅ conecta o ref
//                      className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                      type="email"
//                      id="email"
//                      name="email"
//                      value={email}
//                      onChange={e => setEmail(e.target.value)}
//                      placeholder={dict.emailPlaceholder}
//                      autoComplete="off"
//                      aria-describedby="email-description"
//                      aria-invalid="false"
//                      data-slot="form-control"
//                    />
//                  </div>
//                  {emailError && (
//                    <div className="text-red-500 text-sm mt-1">{emailError}</div>
//                  )}
//                </div>
//
//                {/* Botão com spinner */}
//                <button
//                  type="submit"
//                  disabled={sendingCode}
//                  aria-disabled={sendingCode}
//                  role="button"
//                  className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none
//      ${sendingCode ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//      bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                >
//                  {sendingCode && (
//                    <span className="absolute flex size-full items-center justify-center bg-inherit">
//                      <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//                    </span>
//                  )}
//                  {!sendingCode && (
//                    <span>{dict.loginButton}</span>
//                  )}
//                </button>
//
//                {/* Turnstile */}
//                <div className="my-0 w-full">
//                  <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                    {/* Turnstile embed */}
//                  </div>
//                </div>
//
//                {/* Feedback visual */}
//                {success && (
//                  <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//                  </div>
//                )}
//                {error && (
//                  <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//                    <span>⚠</span> {dict.errorSending}
//                  </div>
//                )}
//
//                {/* Separador OU */}
//                <div className="flex select-none items-center gap-4">
//                  <span className="block h-px w-full bg-border"></span>
//                  <span className="font-medium text-secondary text-sm">OU</span> {/* opcional: criar dict.separator */}
//                  <span className="block h-px w-full bg-border"></span>
//                </div>
//
//                {/* Botão GitHub */}
//                <div className="flex flex-col gap-3">
//                  <button
//                    type="button"
//                    role="button"
//                    aria-disabled={loading}
//                    disabled={loading}
//                    onClick={() => {
//                      setLoading(true);
//                      window.open(githubAuthUrl, '_blank', 'noopener,noreferrer');
//                      setTimeout(() => setLoading(false), 2000); // opcional: reseta após 2s
//                    }}        //onClick={() => window.open(githubAuthUrl, '_blank', 'noopener,noreferrer')}
//
//                    className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full ${loading ? 'opacity-50 pointer-events-none' : ''
//                      }`}
//                  >
//                    {loading && (
//                      <span className="absolute flex size-full items-center justify-center bg-inherit">
//                        <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
//                      </span>
//                    )}
//                    <img
//                      alt="Github"
//                      width={20}
//                      height={20}
//                      className="absolute left-4"
//                      src="/assets/companies/small/github.svg"
//                    />
//                    {dict.githubButton}
//                  </button>
//
//
//                  {/* Link para criar conta */}
//                  <div className="flex w-full justify-center gap-1.5">
//                    <span className="text-sm">{dict.noAccount}</span>
//                    <Link href={`/${lang}/signup`} className="flex items-center gap-1 text-center text-blue-500 text-sm">
//                      {dict.create}
//                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                      </svg>
//                    </Link>
//                  </div>
//                </div>
//
//                {/* Rodapé com termos */}
//                <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//                  <Link href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</Link>
//                  <Link href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</Link>
//                </div>
//              </form>
//            </div>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signin/page.jsx

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
////import Image from 'next/image';
//import { messages } from './messages';
//import '../../styles/virtus.css';
//import { commonMessages } from '@/app/i18n/commonMessages';
//
//// 🌐 Detecta idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang] || messages['pt-br'];
//  //const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const [loading, setLoading] = useState(false);
//
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [emailError, setEmailError] = useState('');
//  const [sendingCode, setSendingCode] = useState(false);
//  const [checkingSession, setCheckingSession] = useState(true);
//  const emailInputRef = useRef(null);
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (data.username && data.role) {
//          router.replace(`/${lang}/dashboard`);
//        }
//      } catch {
//        // erro silencioso
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    const timeout = setTimeout(() => {
//      emailInputRef.current?.focus();
//    }, 100); // ⏳ pequeno delay para garantir renderização
//    return () => clearTimeout(timeout);
//  }, []);
//
//  // ⏳ Enquanto verifica sessão, não renderiza nada
//  //if (checkingSession) {
//  //  return (
//  //    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//  //      <div className="size-6 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
//  //    </main>
//  //  );
//  //}
//  //if (checkingSession) return null;
//
//  // 🚀 Envia código de login
//  async function handleLogin(event) {
//    event.preventDefault();
//    setError('');
//    setEmailError('');
//
//    if (!email || !email.includes('@')) {
//      setEmailError(dict.invalidEmail || 'Insira um endereço de email válido *L_*');
//      return;
//    }
//
//    setSendingCode(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        localStorage.setItem('canAccessConfirm', 'true');
//        localStorage.setItem('signinEmail', email);
//
//        // ✅ Transição suave após sucesso
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        // ✅ Delay antes de mostrar erro
//        setTimeout(() => {
//          setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//          setSendingCode(false);
//        }, 1000);
//      }
//    } catch {
//      // ✅ Delay antes de mostrar erro de rede
//      setTimeout(() => {
//        setError(dict.networkError || 'Erro de rede ou servidor');
//        setSendingCode(false);
//      }, 1000);
//    }
//  }
//
//  return (
//    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//      <div className="transition-opacity duration-300 opacity-100">
//        <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//          <div className="relative flex flex-col items-center justify-center">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <button
//                className="absolute top-0 left-0 cursor-pointer sm:left-10"
//                onClick={() => router.push(`/${lang}/`)} //onClick={() => router.back()}
//              >
//                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                </svg>
//              </button>
//              <img alt="Virtus Cloud Logo" className="mb-4 block w-28" src="/assets/logo.jpg" />
//            </div>
//
//            <div className="w-full max-w-96">
//              <div className="mb-6 flex flex-col items-center gap-2 text-center">
//                <h1 className="font-bold text-2xl">{dict.welcome}</h1>
//              </div>
//
//              <form className="flex w-full max-w-100 flex-col gap-4" onSubmit={handleLogin}>
//                {/* Campo: E-mail */}
//                <div className="flex flex-col gap-2" data-slot="form-item">
//                  <label htmlFor="email" className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']" data-error="false" data-required="true" data-slot="form-label">
//                    {dict.emailLabel}
//                  </label>
//                  <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                    <input
//                      ref={emailInputRef} // ✅ conecta o ref
//                      className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                      type="email"
//                      id="email"
//                      name="email"
//                      value={email}
//                      onChange={e => setEmail(e.target.value)}
//                      placeholder={dict.emailPlaceholder}
//                      autoComplete="off"
//                      aria-describedby="email-description"
//                      aria-invalid="false"
//                      data-slot="form-control"
//                    />
//                  </div>
//                  {emailError && (
//                    <div className="text-red-500 text-sm mt-1">{emailError}</div>
//                  )}
//                </div>
//
//                {/* Botão com spinner */}
//                <button
//                  type="submit"
//                  disabled={sendingCode}
//                  aria-disabled={sendingCode}
//                  role="button"
//                  className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none
//      ${sendingCode ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//      bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                >
//                  {sendingCode && (
//                    <span className="absolute flex size-full items-center justify-center bg-inherit">
//                      <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//                    </span>
//                  )}
//                  {!sendingCode && (
//                    <span>{dict.loginButton}</span>
//                  )}
//                </button>
//
//                {/* Turnstile */}
//                <div className="my-0 w-full">
//                  <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                    {/* Turnstile embed */}
//                  </div>
//                </div>
//
//                {/* Feedback visual */}
//                {success && (
//                  <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//                  </div>
//                )}
//                {error && (
//                  <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//                    <span>⚠</span> {dict.errorSending}
//                  </div>
//                )}
//
//                {/* Separador OU */}
//                <div className="flex select-none items-center gap-4">
//                  <span className="block h-px w-full bg-border"></span>
//                  <span className="font-medium text-secondary text-sm">OU</span> {/* opcional: criar dict.separator */}
//                  <span className="block h-px w-full bg-border"></span>
//                </div>
//
//                {/* Botão GitHub */}
//                <div className="flex flex-col gap-3">
//                  <button
//                    type="button"
//                    role="button"
//                    aria-disabled={loading}
//                    disabled={loading}
//                    onClick={() => {
//                      setLoading(true);
//                      window.open(githubAuthUrl, '_blank', 'noopener,noreferrer');
//                      setTimeout(() => setLoading(false), 2000); // opcional: reseta após 2s
//                    }}        //onClick={() => window.open(githubAuthUrl, '_blank', 'noopener,noreferrer')}
//
//                    className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full ${loading ? 'opacity-50 pointer-events-none' : ''
//                      }`}
//                  >
//                    {loading && (
//                      <span className="absolute flex size-full items-center justify-center bg-inherit">
//                        <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
//                      </span>
//                    )}
//                    <img
//                      alt="Github"
//                      width={20}
//                      height={20}
//                      className="absolute left-4"
//                      src="/assets/companies/small/github.svg"
//                    />
//                    {dict.githubButton}
//                  </button>
//
//
//                  {/* Link para criar conta */}
//                  <div className="flex w-full justify-center gap-1.5">
//                    <span className="text-sm">{dict.noAccount}</span>
//                    <Link href={`/${lang}/signup`} className="flex items-center gap-1 text-center text-blue-500 text-sm">
//                      {dict.create}
//                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                      </svg>
//                    </Link>
//                  </div>
//                </div>
//
//                {/* Rodapé com termos */}
//                <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//                  <Link href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</Link>
//                  <Link href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</Link>
//                </div>
//              </form>
//            </div>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signin/page.jsx

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
////import Image from 'next/image';
//import { messages } from './messages';
//import '../../styles/virtus.css';
//import { commonMessages } from '@/app/i18n/commonMessages';
//
//// 🌐 Detecta idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang] || messages['pt-br'];
//  //const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const [loading, setLoading] = useState(false);
//
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [emailError, setEmailError] = useState('');
//  const [sendingCode, setSendingCode] = useState(false);
//  const [checkingSession, setCheckingSession] = useState(true);
//  const emailInputRef = useRef(null);
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (data.username && data.role) {
//          router.replace(`/${lang}/dashboard`);
//          return;
//        }
//
//        setCheckingSession(false);
//      } catch {
//        setCheckingSession(false);
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    const timeout = setTimeout(() => {
//      emailInputRef.current?.focus();
//    }, 100); // ⏳ pequeno delay para garantir renderização
//    return () => clearTimeout(timeout);
//  }, []);
//
//  // ⏳ Enquanto verifica sessão, não renderiza nada
//  if (checkingSession) {
//    return (
//      <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//        <div className="size-6 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
//      </main>
//    );
//  }
//  //if (checkingSession) return null;
//
//  // 🚀 Envia código de login
//
//  // 🚀 Envia código de login
//  async function handleLogin(event) {
//    event.preventDefault();
//    setError('');
//    setEmailError('');
//
//    if (!email || !email.includes('@')) {
//      setEmailError(dict.invalidEmail || 'Insira um endereço de email válido *L_*');
//      return;
//    }
//
//    setSendingCode(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        localStorage.setItem('canAccessConfirm', 'true');
//        localStorage.setItem('signinEmail', email);
//
//        // ✅ Transição suave após sucesso
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        // ✅ Delay antes de mostrar erro
//        setTimeout(() => {
//          setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//          setSendingCode(false);
//        }, 1000);
//      }
//    } catch {
//      // ✅ Delay antes de mostrar erro de rede
//      setTimeout(() => {
//        setError(dict.networkError || 'Erro de rede ou servidor');
//        setSendingCode(false);
//      }, 1000);
//    }
//  }
//
//  return (
//    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//      <div className="transition-opacity duration-300 opacity-100">
//        <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//          <div className="relative flex flex-col items-center justify-center">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <button
//                className="absolute top-0 left-0 cursor-pointer sm:left-10"
//                onClick={() => router.push(`/${lang}/`)} //onClick={() => router.back()}
//              >
//                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                </svg>
//              </button>
//              <img alt="Virtus Cloud Logo" className="mb-4 block w-28" src="/assets/logo.jpg" />
//            </div>
//
//            <div className="w-full max-w-96">
//              <div className="mb-6 flex flex-col items-center gap-2 text-center">
//                <h1 className="font-bold text-2xl">{dict.welcome}</h1>
//              </div>
//
//              <form className="flex w-full max-w-100 flex-col gap-4" onSubmit={handleLogin}>
//                {/* Campo: E-mail */}
//                <div className="flex flex-col gap-2" data-slot="form-item">
//                  <label htmlFor="email" className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']" data-error="false" data-required="true" data-slot="form-label">
//                    {dict.emailLabel}
//                  </label>
//                  <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                    <input
//                      ref={emailInputRef} // ✅ conecta o ref
//                      className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                      type="email"
//                      id="email"
//                      name="email"
//                      value={email}
//                      onChange={e => setEmail(e.target.value)}
//                      placeholder={dict.emailPlaceholder}
//                      autoComplete="off"
//                      aria-describedby="email-description"
//                      aria-invalid="false"
//                      data-slot="form-control"
//                    />
//                  </div>
//                  {emailError && (
//                    <div className="text-red-500 text-sm mt-1">{emailError}</div>
//                  )}
//                </div>
//
//                {/* Botão com spinner */}
//                <button
//                  type="submit"
//                  disabled={sendingCode}
//                  aria-disabled={sendingCode}
//                  role="button"
//                  className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none
//      ${sendingCode ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//      bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                >
//                  {sendingCode && (
//                    <span className="absolute flex size-full items-center justify-center bg-inherit">
//                      <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//                    </span>
//                  )}
//                  {!sendingCode && (
//                    <span>{dict.loginButton}</span>
//                  )}
//                </button>
//
//                {/* Turnstile */}
//                <div className="my-0 w-full">
//                  <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                    {/* Turnstile embed */}
//                  </div>
//                </div>
//
//                {/* Feedback visual */}
//                {success && (
//                  <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//                  </div>
//                )}
//                {error && (
//                  <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//                    <span>⚠</span> {dict.errorSending}
//                  </div>
//                )}
//
//                {/* Separador OU */}
//                <div className="flex select-none items-center gap-4">
//                  <span className="block h-px w-full bg-border"></span>
//                  <span className="font-medium text-secondary text-sm">OU</span> {/* opcional: criar dict.separator */}
//                  <span className="block h-px w-full bg-border"></span>
//                </div>
//
//                {/* Botão GitHub */}
//                <div className="flex flex-col gap-3">
//                  <button
//                    type="button"
//                    role="button"
//                    aria-disabled={loading}
//                    disabled={loading}
//                    onClick={() => {
//                      setLoading(true);
//                      window.open(githubAuthUrl, '_blank', 'noopener,noreferrer');
//                      setTimeout(() => setLoading(false), 2000); // opcional: reseta após 2s
//                    }}        //onClick={() => window.open(githubAuthUrl, '_blank', 'noopener,noreferrer')}
//
//                    className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full ${loading ? 'opacity-50 pointer-events-none' : ''
//                      }`}
//                  >
//                    {loading && (
//                      <span className="absolute flex size-full items-center justify-center bg-inherit">
//                        <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
//                      </span>
//                    )}
//                    <img
//                      alt="Github"
//                      width={20}
//                      height={20}
//                      className="absolute left-4"
//                      src="/assets/companies/small/github.svg"
//                    />
//                    {dict.githubButton}
//                  </button>
//
//
//                  {/* Link para criar conta */}
//                  <div className="flex w-full justify-center gap-1.5">
//                    <span className="text-sm">{dict.noAccount}</span>
//                    <Link href={`/${lang}/signup`} className="flex items-center gap-1 text-center text-blue-500 text-sm">
//                      {dict.create}
//                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                      </svg>
//                    </Link>
//                  </div>
//                </div>
//
//                {/* Rodapé com termos */}
//                <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//                  <Link href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</Link>
//                  <Link href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</Link>
//                </div>
//              </form>
//            </div>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signin/page.jsx

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
////import Image from 'next/image';
//import { messages } from './messages';
//import '../../styles/virtus.css';
//import { commonMessages } from '@/app/i18n/commonMessages';
//
//// 🌐 Detecta idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const [loading, setLoading] = useState(false);
//
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [emailError, setEmailError] = useState('');
//  const [sendingCode, setSendingCode] = useState(false);
//  const [checkingSession, setCheckingSession] = useState(true);
//  const emailInputRef = useRef(null);
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (data.username && data.role) {
//          router.replace(`/${lang}/dashboard`);
//          return;
//        }
//
//        setCheckingSession(false);
//      } catch {
//        setCheckingSession(false);
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    const timeout = setTimeout(() => {
//      emailInputRef.current?.focus();
//    }, 100); // ⏳ pequeno delay para garantir renderização
//    return () => clearTimeout(timeout);
//  }, []);
//
//  // ⏳ Enquanto verifica sessão, não renderiza nada
//  if (checkingSession) {
//    return (
//      <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//        <div className="size-6 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
//      </main>
//    );
//  }
//  //if (checkingSession) return null;
//
//  // 🚀 Envia código de login
//
//  // 🚀 Envia código de login
//  async function handleLogin(event) {
//    event.preventDefault();
//    setError('');
//    setEmailError('');
//
//    if (!email || !email.includes('@')) {
//      setEmailError(dict.invalidEmail || 'Insira um endereço de email válido *L_*');
//      return;
//    }
//
//    setSendingCode(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        localStorage.setItem('canAccessConfirm', 'true');
//        localStorage.setItem('signinEmail', email);
//
//        // ✅ Transição suave após sucesso
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        // ✅ Delay antes de mostrar erro
//        setTimeout(() => {
//          setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//          setSendingCode(false);
//        }, 1000);
//      }
//    } catch {
//      // ✅ Delay antes de mostrar erro de rede
//      setTimeout(() => {
//        setError(dict.networkError || 'Erro de rede ou servidor');
//        setSendingCode(false);
//      }, 1000);
//    }
//  }
//
//  return (
//    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//      <div className="transition-opacity duration-300 opacity-100">
//        <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//          <div className="relative flex flex-col items-center justify-center">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <button
//                className="absolute top-0 left-0 cursor-pointer sm:left-10"
//                onClick={() => router.back()}
//              >
//                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                </svg>
//              </button>
//              <img alt="Virtus Cloud Logo" className="mb-4 block w-28" src="/assets/logo.jpg" />
//            </div>
//
//            <div className="w-full max-w-96">
//              <div className="mb-6 flex flex-col items-center gap-2 text-center">
//                <h1 className="font-bold text-2xl">{dict.welcome}</h1>
//              </div>
//
//              <form className="flex w-full max-w-100 flex-col gap-4" onSubmit={handleLogin}>
//                {/* Campo: E-mail */}
//                <div className="flex flex-col gap-2" data-slot="form-item">
//                  <label htmlFor="email" className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']" data-error="false" data-required="true" data-slot="form-label">
//                    {dict.emailLabel}
//                  </label>
//                  <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                    <input
//                      ref={emailInputRef} // ✅ conecta o ref
//                      className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                      type="email"
//                      id="email"
//                      name="email"
//                      value={email}
//                      onChange={e => setEmail(e.target.value)}
//                      placeholder={dict.emailPlaceholder}
//                      autoComplete="off"
//                      aria-describedby="email-description"
//                      aria-invalid="false"
//                      data-slot="form-control"
//                    />
//                  </div>
//                  {emailError && (
//                    <div className="text-red-500 text-sm mt-1">{emailError}</div>
//                  )}
//                </div>
//
//                {/* Botão com spinner */}
//                <button
//                  type="submit"
//                  disabled={sendingCode}
//                  aria-disabled={sendingCode}
//                  role="button"
//                  className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none
//      ${sendingCode ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//      bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                >
//                  {sendingCode && (
//                    <span className="absolute flex size-full items-center justify-center bg-inherit">
//                      <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//                    </span>
//                  )}
//                  {!sendingCode && (
//                    <span>{dict.loginButton}</span>
//                  )}
//                </button>
//
//                {/* Turnstile */}
//                <div className="my-0 w-full">
//                  <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                    {/* Turnstile embed */}
//                  </div>
//                </div>
//
//                {/* Feedback visual */}
//                {success && (
//                  <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//                  </div>
//                )}
//                {error && (
//                  <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//                    <span>⚠</span> {dict.errorSending}
//                  </div>
//                )}
//
//                {/* Separador OU */}
//                <div className="flex select-none items-center gap-4">
//                  <span className="block h-px w-full bg-border"></span>
//                  <span className="font-medium text-secondary text-sm">OU</span> {/* opcional: criar dict.separator */}
//                  <span className="block h-px w-full bg-border"></span>
//                </div>
//
//                {/* Botão GitHub */}
//                <div className="flex flex-col gap-3">
//                  <button
//                    type="button"
//                    role="button"
//                    aria-disabled={loading}
//                    disabled={loading}
//                    onClick={() => {
//                      setLoading(true);
//                      window.open(githubAuthUrl, '_blank', 'noopener,noreferrer');
//                      setTimeout(() => setLoading(false), 2000); // opcional: reseta após 2s
//                    }}        //onClick={() => window.open(githubAuthUrl, '_blank', 'noopener,noreferrer')}
//
//                    className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full ${loading ? 'opacity-50 pointer-events-none' : ''
//                      }`}
//                  >
//                    {loading && (
//                      <span className="absolute flex size-full items-center justify-center bg-inherit">
//                        <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
//                      </span>
//                    )}
//                    <img
//                      alt="Github"
//                      width={20}
//                      height={20}
//                      className="absolute left-4"
//                      src="/assets/companies/small/github.svg"
//                    />
//                    {dict.githubButton}
//                  </button>
//
//
//                  {/* Link para criar conta */}
//                  <div className="flex w-full justify-center gap-1.5">
//                    <span className="text-sm">{dict.noAccount}</span>
//                    <Link href={`/${lang}/signup`} className="flex items-center gap-1 text-center text-blue-500 text-sm">
//                      {dict.create}
//                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                      </svg>
//                    </Link>
//                  </div>
//                </div>
//
//                {/* Rodapé com termos */}
//                <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//                  <Link href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</Link>
//                  <Link href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</Link>
//                </div>
//              </form>
//            </div>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signin/page.jsx

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
////import Image from 'next/image';
//import { messages } from './messages';
//import '../../styles/virtus.css';
//import { commonMessages } from '@/app/i18n/commonMessages';
//
//// 🌐 Detecta idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [emailError, setEmailError] = useState('');
//  const [sendingCode, setSendingCode] = useState(false);
//  const [checkingSession, setCheckingSession] = useState(true);
//  const emailInputRef = useRef(null);
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (data.username && data.role) {
//          router.replace(`/${lang}/dashboard`);
//          return;
//        }
//
//        setCheckingSession(false);
//      } catch {
//        setCheckingSession(false);
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    const timeout = setTimeout(() => {
//      emailInputRef.current?.focus();
//    }, 100); // ⏳ pequeno delay para garantir renderização
//    return () => clearTimeout(timeout);
//  }, []);
//
//  // ⏳ Enquanto verifica sessão, não renderiza nada
//  if (checkingSession) {
//    return (
//      <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//        <div className="size-6 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
//      </main>
//    );
//  }
//  //if (checkingSession) return null;
//
//  // 🚀 Envia código de login
//
//  // 🚀 Envia código de login
//  async function handleLogin(event) {
//    event.preventDefault();
//    setError('');
//    setEmailError('');
//
//    if (!email || !email.includes('@')) {
//      setEmailError(dict.invalidEmail || 'Insira um endereço de email válido *L_*');
//      return;
//    }
//
//    setSendingCode(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        localStorage.setItem('canAccessConfirm', 'true');
//        localStorage.setItem('signinEmail', email);
//
//        // ✅ Transição suave após sucesso
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        // ✅ Delay antes de mostrar erro
//        setTimeout(() => {
//          setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//          setSendingCode(false);
//        }, 1000);
//      }
//    } catch {
//      // ✅ Delay antes de mostrar erro de rede
//      setTimeout(() => {
//        setError(dict.networkError || 'Erro de rede ou servidor');
//        setSendingCode(false);
//      }, 1000);
//    }
//  }
//
//  return (
//    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//      <div className="transition-opacity duration-300 opacity-100">
//        <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//          <div className="relative flex flex-col items-center justify-center">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <button
//                className="absolute top-0 left-0 cursor-pointer sm:left-10"
//                onClick={() => router.back()}
//              >
//                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                </svg>
//              </button>
//              <img alt="Virtus Cloud Logo" className="mb-4 block w-28" src="/assets/logo.jpg" />
//            </div>
//
//            <div className="w-full max-w-96">
//              <div className="mb-6 flex flex-col items-center gap-2 text-center">
//                <h1 className="font-bold text-2xl">{dict.welcome}</h1>
//              </div>
//
//              <form className="flex w-full max-w-100 flex-col gap-4" onSubmit={handleLogin}>
//                {/* Campo: E-mail */}
//                <div className="flex flex-col gap-2" data-slot="form-item">
//                  <label htmlFor="email" className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']" data-error="false" data-required="true" data-slot="form-label">
//                    {dict.emailLabel}
//                  </label>
//                  <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                    <input
//                      ref={emailInputRef} // ✅ conecta o ref
//                      className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                      type="email"
//                      id="email"
//                      name="email"
//                      value={email}
//                      onChange={e => setEmail(e.target.value)}
//                      placeholder={dict.emailPlaceholder}
//                      autoComplete="off"
//                      aria-describedby="email-description"
//                      aria-invalid="false"
//                      data-slot="form-control"
//                    />
//                  </div>
//                  {emailError && (
//                    <div className="text-red-500 text-sm mt-1">{emailError}</div>
//                  )}
//                </div>
//
//                {/* Botão com spinner */}
//                <button
//                  type="submit"
//                  disabled={sendingCode}
//                  aria-disabled={sendingCode}
//                  role="button"
//                  className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none
//      ${sendingCode ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//      bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                >
//                  {sendingCode && (
//                    <span className="absolute flex size-full items-center justify-center bg-inherit">
//                      <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//                    </span>
//                  )}
//                  {!sendingCode && (
//                    <span>{dict.loginButton}</span>
//                  )}
//                </button>
//
//                {/* Turnstile */}
//                <div className="my-0 w-full">
//                  <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                    {/* Turnstile embed */}
//                  </div>
//                </div>
//
//                {/* Feedback visual */}
//                {success && (
//                  <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//                  </div>
//                )}
//                {error && (
//                  <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//                    <span>⚠</span> {dict.errorSending}
//                  </div>
//                )}
//
//                {/* Separador OU */}
//                <div className="flex select-none items-center gap-4">
//                  <span className="block h-px w-full bg-border"></span>
//                  <span className="font-medium text-secondary text-sm">OU</span> {/* opcional: criar dict.separator */}
//                  <span className="block h-px w-full bg-border"></span>
//                </div>
//
//                {/* Botão GitHub */}
//                <div className="flex flex-col gap-3">
//                  <button type="button" aria-disabled="false" role="button" className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full">
//                    <img alt="Github" width="20" height="20" className="absolute left-4" src="/assets/companies/small/github.svg" />
//                    {dict.githubButton}
//                  </button>
//
//                  {/* Link para criar conta */}
//                  <div className="flex w-full justify-center gap-1.5">
//                    <span className="text-sm">{dict.noAccount}</span>
//                    <Link href={`/${lang}/signup`} className="flex items-center gap-1 text-center text-blue-500 text-sm">
//                      {dict.create}
//                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                      </svg>
//                    </Link>
//                  </div>
//                </div>
//
//                {/* Rodapé com termos */}
//                <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//                  <Link href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</Link>
//                  <Link href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</Link>
//                </div>
//              </form>
//            </div>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//  async function handleLogin(event) {
//    event.preventDefault();
//    setError('');
//    setEmailError('');
//    setSuccess(false);
//
//    if (!email || !email.includes('@')) {
//      setEmailError(dict.invalidEmail || 'Insira um endereço de email válido *L_*');
//      return;
//    }
//
//    setSendingCode(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      if (res.ok) {
//        setSuccess(true);
//        localStorage.setItem('canAccessConfirm', 'true');
//        localStorage.setItem('signinEmail', email);
//
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        const data = await res.json();
//        setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//      }
//    } catch {
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    }
//
//    setSendingCode(false);
//  }

//frontend/src/app/[lang]/signin/page.jsx

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
////import Image from 'next/image';
//import { messages } from './messages';
//import '../../styles/virtus.css';
//import { commonMessages } from '@/app/i18n/commonMessages';
//
//// 🌐 Detecta idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [emailError, setEmailError] = useState('');
//  const [sendingCode, setSendingCode] = useState(false);
//  const [checkingSession, setCheckingSession] = useState(true);
//  const emailInputRef = useRef(null);
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (data.username && data.role) {
//          router.replace(`/${lang}/dashboard`);
//          return;
//        }
//
//        setCheckingSession(false);
//      } catch {
//        setCheckingSession(false);
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    const timeout = setTimeout(() => {
//      emailInputRef.current?.focus();
//    }, 100); // ⏳ pequeno delay para garantir renderização
//    return () => clearTimeout(timeout);
//  }, []);
//
//  // ⏳ Enquanto verifica sessão, não renderiza nada
//  if (checkingSession) return null;
//
//  // 🚀 Envia código de login
//
//  // 🚀 Envia código de login
//  async function handleLogin(event) {
//    event.preventDefault();
//    setError('');
//    setEmailError('');
//
//    if (!email || !email.includes('@')) {
//      setEmailError(dict.invalidEmail || 'Insira um endereço de email válido *L_*');
//      return;
//    }
//
//    setSendingCode(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        localStorage.setItem('canAccessConfirm', 'true');
//        localStorage.setItem('signinEmail', email);
//
//        // ✅ Transição suave após sucesso
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        // ✅ Delay antes de mostrar erro
//        setTimeout(() => {
//          setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//          setSendingCode(false);
//        }, 1000);
//      }
//    } catch {
//      // ✅ Delay antes de mostrar erro de rede
//      setTimeout(() => {
//        setError(dict.networkError || 'Erro de rede ou servidor');
//        setSendingCode(false);
//      }, 1000);
//    }
//  }
//  //  async function handleLogin(event) {
//  //    event.preventDefault();
//  //    setError('');
//  //    setEmailError('');
//  //    setSuccess(false);
//  //
//  //    if (!email || !email.includes('@')) {
//  //      setEmailError(dict.invalidEmail || 'Insira um endereço de email válido *L_*');
//  //      return;
//  //    }
//  //
//  //    setSendingCode(true);
//  //
//  //    try {
//  //      const res = await fetch('/api/verify-code/signin', {
//  //        method: 'POST',
//  //        headers: { 'Content-Type': 'application/json' },
//  //        body: JSON.stringify({ email }),
//  //      });
//  //
//  //      if (res.ok) {
//  //        setSuccess(true);
//  //        localStorage.setItem('canAccessConfirm', 'true');
//  //        localStorage.setItem('signinEmail', email);
//  //
//  //        setTimeout(() => {
//  //          router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//  //        }, 1000);
//  //      } else {
//  //        const data = await res.json();
//  //        setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//  //      }
//  //    } catch {
//  //      setError(dict.networkError || 'Erro de rede ou servidor');
//  //    }
//  //
//  //    setSendingCode(false);
//  //  }
//  return (
//    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//      <div className="transition-opacity duration-300 opacity-100">
//      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//        <div className="relative flex flex-col items-center justify-center">
//          <div className="mb-6 flex flex-col items-center gap-2 text-center">
//            <Link href="/" className="absolute top-0 left-0 cursor-pointer sm:left-10">
//              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//              </svg>
//            </Link>
//            <img alt="Virtus Cloud Logo" className="mb-4 block w-28" src="/assets/logo.jpg" />
//          </div>
//
//          <div className="w-full max-w-96">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <h1 className="font-bold text-2xl">{dict.welcome}</h1>
//            </div>
//
//            <form className="flex w-full max-w-100 flex-col gap-4" onSubmit={handleLogin}>
//              {/* Campo: E-mail */}
//              <div className="flex flex-col gap-2" data-slot="form-item">
//                <label htmlFor="email" className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']" data-error="false" data-required="true" data-slot="form-label">
//                  {dict.emailLabel}
//                </label>
//                <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                  <input
//                    ref={emailInputRef} // ✅ conecta o ref
//                    className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                    type="email"
//                    id="email"
//                    name="email"
//                    value={email}
//                    onChange={e => setEmail(e.target.value)}
//                    placeholder={dict.emailPlaceholder}
//                    autoComplete="off"
//                    aria-describedby="email-description"
//                    aria-invalid="false"
//                    data-slot="form-control"
//                  />
//                </div>
//                {emailError && (
//                  <div className="text-red-500 text-sm mt-1">{emailError}</div>
//                )}
//              </div>
//
//              {/* Botão com spinner */}
//              <button
//                type="submit"
//                disabled={sendingCode}
//                aria-disabled={sendingCode}
//                role="button"
//                className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none
//      ${sendingCode ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//      bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//              >
//                {sendingCode && (
//                  <span className="absolute flex size-full items-center justify-center bg-inherit">
//                    <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//                  </span>
//                )}
//                {!sendingCode && (
//                  <span>{dict.loginButton}</span>
//                )}
//              </button>
//
//              {/* Turnstile */}
//              <div className="my-0 w-full">
//                <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                  {/* Turnstile embed */}
//                </div>
//              </div>
//
//              {/* Feedback visual */}
//              {success && (
//                <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//                </div>
//              )}
//              {error && (
//                <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//                  <span>⚠</span> {dict.errorSending}
//                </div>
//              )}
//
//              {/* Separador OU */}
//              <div className="flex select-none items-center gap-4">
//                <span className="block h-px w-full bg-border"></span>
//                <span className="font-medium text-secondary text-sm">OU</span> {/* opcional: criar dict.separator */}
//                <span className="block h-px w-full bg-border"></span>
//              </div>
//
//              {/* Botão GitHub */}
//              <div className="flex flex-col gap-3">
//                <button type="button" aria-disabled="false" role="button" className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full">
//                  <img alt="Github" width="20" height="20" className="absolute left-4" src="/assets/companies/small/github.svg" />
//                  {dict.githubButton}
//                </button>
//
//                {/* Link para criar conta */}
//                <div className="flex w-full justify-center gap-1.5">
//                  <span className="text-sm">{dict.noAccount}</span>
//                  <Link href={`/${lang}/signup`} className="flex items-center gap-1 text-center text-blue-500 text-sm">
//                    {dict.create}
//                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                    </svg>
//                  </Link>
//                </div>
//              </div>
//
//              {/* Rodapé com termos */}
//              <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//                <Link href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</Link>
//                <Link href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</Link>
//              </div>
//            </form>
//          </div>
//        </div>
//      </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signin/page.jsx

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
////import Image from 'next/image';
//import { messages } from './messages';
//import '../../styles/virtus.css';
//import { commonMessages } from '@/app/i18n/commonMessages';
//
//// 🌐 Detecta idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [emailError, setEmailError] = useState('');
//  const [sendingCode, setSendingCode] = useState(false);
//  const [checkingSession, setCheckingSession] = useState(true);
//  const emailInputRef = useRef(null);
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (data.username && data.role) {
//          router.replace(`/${lang}/dashboard`);
//          return;
//        }
//
//        setCheckingSession(false);
//      } catch {
//        setCheckingSession(false);
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    const timeout = setTimeout(() => {
//      emailInputRef.current?.focus();
//    }, 100); // ⏳ pequeno delay para garantir renderização
//    return () => clearTimeout(timeout);
//  }, []);
//
//  // ⏳ Enquanto verifica sessão, não renderiza nada
//  if (checkingSession) return null;
//
//  // 🚀 Envia código de login
//  async function handleLogin(event) {
//    event.preventDefault();
//    setError('');
//    setEmailError('');
//    setSuccess(false);
//
//    if (!email || !email.includes('@')) {
//      setEmailError(dict.invalidEmail || 'Insira um endereço de email válido *L_*');
//      return;
//    }
//
//    setSendingCode(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      if (res.ok) {
//        setSuccess(true);
//        localStorage.setItem('canAccessConfirm', 'true');
//        localStorage.setItem('signinEmail', email);
//
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        const data = await res.json();
//        setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//      }
//    } catch {
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    }
//
//    setSendingCode(false);
//  }
//  return (
//    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//        <div className="relative flex flex-col items-center justify-center">
//          <div className="mb-6 flex flex-col items-center gap-2 text-center">
//            <Link href="/" className="absolute top-0 left-0 cursor-pointer sm:left-10">
//              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//              </svg>
//            </Link>
//            <img alt="Virtus Cloud Logo" className="mb-4 block w-28" src="/assets/logo.jpg" />
//          </div>
//
//          <div className="w-full max-w-96">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <h1 className="font-bold text-2xl">{dict.welcome}</h1>
//            </div>
//
//            <form className="flex w-full max-w-100 flex-col gap-4" onSubmit={handleLogin}>
//              {/* Campo: E-mail */}
//              <div className="flex flex-col gap-2" data-slot="form-item">
//                <label htmlFor="email" className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']" data-error="false" data-required="true" data-slot="form-label">
//                  {dict.emailLabel}
//                </label>
//                <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                  <input
//                    ref={emailInputRef} // ✅ conecta o ref
//                    className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                    type="email"
//                    id="email"
//                    name="email"
//                    value={email}
//                    onChange={e => setEmail(e.target.value)}
//                    placeholder={dict.emailPlaceholder}
//                    autoComplete="off"
//                    aria-describedby="email-description"
//                    aria-invalid="false"
//                    data-slot="form-control"
//                  />
//                </div>
//                {emailError && (
//                  <div className="text-red-500 text-sm mt-1">{emailError}</div>
//                )}
//              </div>
//
//              {/* Botão com spinner */}
//              <button
//                type="submit"
//                disabled={sendingCode}
//                aria-disabled={sendingCode}
//                role="button"
//                className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none
//      ${sendingCode ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//      bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//              >
//                {sendingCode && (
//                  <span className="absolute flex size-full items-center justify-center bg-inherit">
//                    <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//                  </span>
//                )}
//                <span className={sendingCode ? 'invisible' : 'visible'}>
//                  {sendingCode ? dict.sending : dict.loginButton}
//                </span>
//              </button>
//
//              {/* Turnstile */}
//              <div className="my-0 w-full">
//                <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                  {/* Turnstile embed */}
//                </div>
//              </div>
//
//              {/* Feedback visual */}
//              {success && (
//                <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//                </div>
//              )}
//              {error && (
//                <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//                  <span>⚠</span> {dict.errorSending}
//                </div>
//              )}
//
//              {/* Separador OU */}
//              <div className="flex select-none items-center gap-4">
//                <span className="block h-px w-full bg-border"></span>
//                <span className="font-medium text-secondary text-sm">OU</span> {/* opcional: criar dict.separator */}
//                <span className="block h-px w-full bg-border"></span>
//              </div>
//
//              {/* Botão GitHub */}
//              <div className="flex flex-col gap-3">
//                <button type="button" aria-disabled="false" role="button" className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full">
//                  <img alt="Github" width="20" height="20" className="absolute left-4" src="/assets/companies/small/github.svg" />
//                  {dict.githubButton}
//                </button>
//
//                {/* Link para criar conta */}
//                <div className="flex w-full justify-center gap-1.5">
//                  <span className="text-sm">{dict.noAccount}</span>
//                  <Link href={`/${lang}/signup`} className="flex items-center gap-1 text-center text-blue-500 text-sm">
//                    {dict.create}
//                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                    </svg>
//                  </Link>
//                </div>
//              </div>
//
//              {/* Rodapé com termos */}
//              <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//                <Link href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</Link>
//                <Link href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</Link>
//              </div>
//            </form>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//{/* Feedback visual */}
//{success && (
//  <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//    <span>✔</span> {dict.success}
//  </div>
//)}
//{error && (
//  <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//    <span>⚠</span> {dict.networkError}
//  </div>
//)}

//frontend/src/app/[lang]/signin/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import Image from 'next/image';
//import { messages } from './messages';
//import '../../styles/virtus.css';
//import { commonMessages } from '@/app/i18n/commonMessages';
//
//// 🌐 Detecta idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [emailError, setEmailError] = useState('');
//  const [sendingCode, setSendingCode] = useState(false);
//  const [checkingSession, setCheckingSession] = useState(true);
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (data.username && data.role) {
//          router.replace(`/${lang}/dashboard`);
//          return;
//        }
//
//        setCheckingSession(false);
//      } catch {
//        setCheckingSession(false);
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  // ⏳ Enquanto verifica sessão, não renderiza nada
//  if (checkingSession) return null;
//
//  // 🚀 Envia código de login
//  async function handleLogin(event) {
//    event.preventDefault();
//    setError('');
//    setEmailError('');
//    setSuccess(false);
//
//    if (!email || !email.includes('@')) {
//      setEmailError(dict.invalidEmail || 'Insira um endereço de email válido *L_*');
//      return;
//    }
//
//    setSendingCode(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      if (res.ok) {
//        setSuccess(true);
//        localStorage.setItem('canAccessConfirm', 'true');
//        localStorage.setItem('signinEmail', email);
//
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        const data = await res.json();
//        setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//      }
//    } catch {
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    }
//
//    setSendingCode(false);
//  }
//    return (
//    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//        <div className="relative flex flex-col items-center justify-center">
//          <div className="mb-6 flex flex-col items-center gap-2 text-center">
//            <Link href="/" className="absolute top-0 left-0 cursor-pointer sm:left-10">
//              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//              </svg>
//            </Link>
//            <img alt="Virtus Cloud Logo" className="mb-4 block w-28" src="/assets/logo.jpg" />
//          </div>
//
//          <div className="w-full max-w-96">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <h1 className="font-bold text-2xl">{dict.welcome}</h1>
//            </div>
//
//            <form className="flex w-full max-w-100 flex-col gap-4" onSubmit={handleLogin}>
//              {/* Campo: E-mail */}
//              <div className="flex flex-col gap-2" data-slot="form-item">
//                <label
//                  htmlFor="email"
//                  className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']"
//                  data-error="false"
//                  data-required="true"
//                  data-slot="form-label"
//                >
//                  E-mail
//                </label>
//                <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                  <input
//                    className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                    type="email"
//                    id="email"
//                    name="email"
//                    value={email}
//                    onChange={e => setEmail(e.target.value)}
//                    placeholder="Digite o seu e-mail"
//                    autoComplete="off"
//                    aria-describedby="email-description"
//                    aria-invalid="false"
//                    data-slot="form-control"
//                  />
//                </div>
//                {emailError && (
//                  <div className="text-red-500 text-sm mt-1">{emailError}</div>
//                )}
//              </div>
//
//              {/* Botão com spinner */}
//              <button
//                type="submit"
//                disabled={sendingCode}
//                aria-disabled={sendingCode}
//                role="button"
//                className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none
//                  ${sendingCode ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//                  bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//              >
//                {sendingCode && (
//                  <span className="absolute flex size-full items-center justify-center bg-inherit">
//                    <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//                  </span>
//                )}
//                <span className={sendingCode ? 'invisible' : 'visible'}>
//                  Entrar com endereço de e-mail
//                </span>
//              </button>
//
//              {/* Turnstile */}
//              <div className="my-0 w-full">
//                <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                  {/* Turnstile embed */}
//                </div>
//              </div>
//
//              {/* Feedback visual */}
//              {success && (
//                <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//                  <span>✔</span> {dict.success}
//                </div>
//              )}
//              {error && (
//                <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//                  <span>⚠</span> {error}
//                </div>
//              )}
//
//              {/* Separador OU */}
//              <div className="flex select-none items-center gap-4">
//                <span className="block h-px w-full bg-border"></span>
//                <span className="font-medium text-secondary text-sm">OU</span>
//                <span className="block h-px w-full bg-border"></span>
//              </div>
//
//              {/* Botão GitHub */}
//              <div className="flex flex-col gap-3">
//                <button
//                  type="button"
//                  aria-disabled="false"
//                  role="button"
//                  className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full"
//                >
//                  <img
//                    alt="Github"
//                    width="20"
//                    height="20"
//                    className="absolute left-4"
//                    src="/assets/companies/small/github.svg"
//                  />
//                  Entrar com o Github
//                </button>
//
//                {/* Link para criar conta */}
//                <div className="flex w-full justify-center gap-1.5">
//                  <span className="text-sm">Não possui uma conta?</span>
//                  <Link href={`/${lang}/signup`} className="flex items-center gap-1 text-center text-blue-500 text-sm">
//                    Criar uma conta
//                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                    </svg>
//                  </Link>
//                </div>
//              </div>
//
//              {/* Rodapé com termos */}
//              <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//                <Link href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</Link>
//                <Link href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</Link>
//              </div>
//
//              {/* Logo Cloudflare */}
//              <div className="flex justify-center mt-6">
//                <Image src="/cloudflare-logo.png" alt="Cloudflare" width={100} height={24} />
//              </div>
//            </form>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import Image from 'next/image';
//import { messages } from './messages';
//import '../../styles/virtus.css';
//import { commonMessages } from '@/app/i18n/commonMessages';
//
//// 🌐 Detecta idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [emailError, setEmailError] = useState('');
//  const [sendingCode, setSendingCode] = useState(false);
//  const [checkingSession, setCheckingSession] = useState(true);
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (data.username && data.role) {
//          router.replace(`/${lang}/dashboard`);
//          return;
//        }
//
//        setCheckingSession(false);
//      } catch {
//        setCheckingSession(false);
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  // ⏳ Enquanto verifica sessão, não renderiza nada
//  if (checkingSession) return null;
//
//  // 🚀 Envia código de login
//  async function handleLogin(event) {
//    event.preventDefault();
//    setError('');
//    setEmailError('');
//    setSuccess(false);
//
//    if (!email || !email.includes('@')) {
//      setEmailError(dict.invalidEmail || 'Este não é um endereço de email válido.');
//      return;
//    }
//
//    setSendingCode(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      if (res.ok) {
//        setSuccess(true);
//        localStorage.setItem('canAccessConfirm', 'true');
//        localStorage.setItem('signinEmail', email);
//
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        const data = await res.json();
//        setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//      }
//    } catch {
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    }
//
//    setSendingCode(false);
//  }
//    return (
//    <main className="container flex h-dvh items-center justify-center">
//      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//        <div className="relative flex flex-col items-center justify-center">
//          <div className="mb-6 flex flex-col items-center gap-2 text-center">
//            <Link href="/" className="absolute top-0 left-0 cursor-pointer sm:left-10">
//              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//              </svg>
//            </Link>
//            <img alt="Virtus Cloud Logo" className="mb-4 block w-28" src="/assets/logo.jpg" />
//          </div>
//
//          <div className="w-full max-w-96">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <h1 className="font-bold text-2xl">{dict.welcome}</h1>
//            </div>
//
//            <form className="flex w-full max-w-100 flex-col gap-4" onSubmit={handleLogin}>
//              {/* Campo: E-mail */}
//              <div className="flex flex-col gap-2" data-slot="form-item">
//                <label
//                  htmlFor="email"
//                  className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']"
//                  data-error="false"
//                  data-required="true"
//                  data-slot="form-label"
//                >
//                  E-mail
//                </label>
//                <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                  <input
//                    className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                    type="email"
//                    id="email"
//                    name="email"
//                    value={email}
//                    onChange={e => setEmail(e.target.value)}
//                    placeholder="Digite o seu e-mail"
//                    autoComplete="off"
//                    aria-describedby="email-description"
//                    aria-invalid="false"
//                    data-slot="form-control"
//                  />
//                </div>
//                {emailError && (
//                  <div className="text-red-500 text-sm mt-1">{emailError}</div>
//                )}
//              </div>
//
//              {/* Botão com spinner */}
//              <button
//                type="submit"
//                disabled={sendingCode}
//                aria-disabled={sendingCode}
//                role="button"
//                className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none
//                  ${sendingCode ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//                  bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//              >
//                {sendingCode && (
//                  <span className="absolute flex size-full items-center justify-center bg-inherit">
//                    <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//                  </span>
//                )}
//                <span className={sendingCode ? 'invisible' : 'visible'}>
//                  Entrar com endereço de e-mail
//                </span>
//              </button>
//
//              {/* Turnstile */}
//              <div className="my-0 w-full">
//                <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                  {/* Turnstile embed */}
//                </div>
//              </div>
//
//              {/* Feedback visual */}
//              {success && (
//                <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//                  <span>✔</span> {dict.success}
//                </div>
//              )}
//              {error && (
//                <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//                  <span>⚠</span> {error}
//                </div>
//              )}
//
//              {/* Separador OU */}
//              <div className="flex select-none items-center gap-4">
//                <span className="block h-px w-full bg-border"></span>
//                <span className="font-medium text-secondary text-sm">OU</span>
//                <span className="block h-px w-full bg-border"></span>
//              </div>
//
//              {/* Botão GitHub */}
//              <div className="flex flex-col gap-3">
//                <button
//                  type="button"
//                  aria-disabled="false"
//                  role="button"
//                  className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full"
//                >
//                  <img
//                    alt="Github"
//                    width="20"
//                    height="20"
//                    className="absolute left-4"
//                    src="/assets/companies/small/github.svg"
//                  />
//                  Entrar com o Github
//                </button>
//
//                {/* Link para criar conta */}
//                <div className="flex w-full justify-center gap-1.5">
//                  <span className="text-sm">Não possui uma conta?</span>
//                  <Link href={`/${lang}/signup`} className="flex items-center gap-1 text-center text-blue-500 text-sm">
//                    Criar uma conta
//                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                    </svg>
//                  </Link>
//                </div>
//              </div>
//
//              {/* Rodapé com termos */}
//              <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//                <Link href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</Link>
//                <Link href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</Link>
//              </div>
//
//              {/* Logo Cloudflare */}
//              <div className="flex justify-center mt-6">
//                <Image src="/cloudflare-logo.png" alt="Cloudflare" width={100} height={24} />
//              </div>
//            </form>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import Image from 'next/image';
//import { messages } from './messages';
//import '../../styles/virtus.css';
//import { commonMessages } from '@/app/i18n/commonMessages';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [loading, setLoading] = useState(true); // ← atualizado
//  const [status, setStatus] = useState('');
//  const [username, setUsername] = useState('');
//  const [role, setRole] = useState('');
//  const [checkingSession, setCheckingSession] = useState(true); // para o useEffect inicial
//  const [sendingCode, setSendingCode] = useState(false); // para o botão "Enviando..."
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (data.username && data.role) {
//          router.replace(`/${lang}/dashboard`);
//          return;
//        }
//
//        setCheckingSession(false); // libera renderização
//      } catch {
//        setCheckingSession(false);
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  // ⏳ Enquanto verifica sessão, não renderiza nada
//  if (checkingSession) return null;
//
//  async function handleLogin() {
//    setError('');
//    setSuccess(false);
//
//    if (!email || !email.includes('@')) {
//      setError('E-mail inválido');
//      return;
//    }
//
//    setSendingCode(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      if (res.ok) {
//        setSuccess(true);
//        localStorage.setItem('canAccessConfirm', 'true');
//        localStorage.setItem('signinEmail', email);
//
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        const data = await res.json();
//        setError(data?.error || 'Erro ao enviar código');
//      }
//    } catch {
//      setError('Erro de rede ou servidor');
//    }
//
//    setSendingCode(false);
//  }
//
//  return (
//    <main className="min-h-screen flex items-center justify-center bg-black text-white px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6 signin-container">
//        <h1 className="text-2xl font-bold text-center">{dict.welcome}</h1>
//
//        <label htmlFor="email" className="block text-sm text-gray-300">{dict.emailLabel}</label>
//        <input
//          id="email"
//          type="email"
//          value={email}
//          onChange={e => setEmail(e.target.value)}
//          placeholder={dict.emailPlaceholder}
//          className="w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400"
//        />
//
//        {success && (
//          <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//            <span>✔</span> {dict.success}
//          </div>
//        )}
//
//        {error && (
//          <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//            <span>⚠</span> {error}
//          </div>
//        )}
//
//        <button
//          type="submit"
//          onClick={handleLogin}
//          disabled={sendingCode}
//          aria-disabled={sendingCode}
//          role="button"
//          className={`w-full group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none
//    ${sendingCode ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//    bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//        >
//          {sendingCode && (
//            <span className="absolute flex size-full items-center justify-center bg-inherit">
//              <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//            </span>
//          )}
//          <span className={`${sendingCode ? 'invisible' : 'visible'}`}>
//            Entrar com endereço de e-mail
//          </span>
//        </button>
//
//        <div className="text-center text-gray-400 text-sm">OU</div>
//
//        <button
//          disabled
//          className="w-full border border-gray-500 py-2 rounded text-gray-500 bg-gray-800 cursor-not-allowed"
//        >
//          {dict.loginKey}
//        </button>
//
//        <div className="text-center text-sm text-gray-400">
//          {dict.noAccount}{' '}
//          <Link href={`/${lang}/signup`} className="text-green-400 underline hover:text-green-300">
//            {dict.create}
//          </Link>
//        </div>
//
//        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//          <Link href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</Link>
//          <Link href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</Link>
//        </div>
//
//        <div className="flex justify-center mt-6">
//          <Image src="/cloudflare-logo.png" alt="Cloudflare" width={100} height={24} />
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signin/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import Image from 'next/image';
//import { messages } from './messages';
//import '../../styles/virtus.css';
//import { commonMessages } from '@/app/i18n/commonMessages';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [loading, setLoading] = useState(true); // ← atualizado
//  const [status, setStatus] = useState('');
//  const [username, setUsername] = useState('');
//  const [role, setRole] = useState('');
//  const [checkingSession, setCheckingSession] = useState(true); // para o useEffect inicial
//  const [sendingCode, setSendingCode] = useState(false); // para o botão "Enviando..."
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (data.username && data.role) {
//          router.replace(`/${lang}/dashboard`);
//          return;
//        }
//
//        setCheckingSession(false); // libera renderização
//      } catch {
//        setCheckingSession(false);
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  // ⏳ Enquanto verifica sessão, não renderiza nada
//  if (checkingSession) return null;
//
//  async function handleLogin() {
//    setError('');
//    setSuccess(false);
//
//    if (!email || !email.includes('@')) {
//      setError('E-mail inválido');
//      return;
//    }
//
//    setSendingCode(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      if (res.ok) {
//        setSuccess(true);
//        localStorage.setItem('canAccessConfirm', 'true');
//        localStorage.setItem('signinEmail', email);
//
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        const data = await res.json();
//        setError(data?.error || 'Erro ao enviar código');
//      }
//    } catch {
//      setError('Erro de rede ou servidor');
//    }
//
//    setSendingCode(false);
//  }
//
//  return (
//    <main className="min-h-screen flex items-center justify-center bg-black text-white px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6 signin-container">
//        <h1 className="text-2xl font-bold text-center">{dict.welcome}</h1>
//
//        <label htmlFor="email" className="block text-sm text-gray-300">{dict.emailLabel}</label>
//        <input
//          id="email"
//          type="email"
//          value={email}
//          onChange={e => setEmail(e.target.value)}
//          placeholder={dict.emailPlaceholder}
//          className="w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400"
//        />
//
//        {success && (
//          <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//            <span>✔</span> {dict.success}
//          </div>
//        )}
//
//        {error && (
//          <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//            <span>⚠</span> {error}
//          </div>
//        )}
//
//        <button
//          onClick={handleLogin}
//          disabled={sendingCode}
//          className={`w-full py-2 rounded text-white font-semibold ${sendingCode ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
//            }`}
//        >
//          {sendingCode ? 'Enviando...' : dict.loginButton}
//        </button>
//
//        <div className="text-center text-gray-400 text-sm">OU</div>
//
//        <button
//          disabled
//          className="w-full border border-gray-500 py-2 rounded text-gray-500 bg-gray-800 cursor-not-allowed"
//        >
//          {dict.loginKey}
//        </button>
//
//        <div className="text-center text-sm text-gray-400">
//          {dict.noAccount}{' '}
//          <Link href={`/${lang}/signup`} className="text-green-400 underline hover:text-green-300">
//            {dict.create}
//          </Link>
//        </div>
//
//        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//          <Link href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</Link>
//          <Link href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</Link>
//        </div>
//
//        <div className="flex justify-center mt-6">
//          <Image src="/cloudflare-logo.png" alt="Cloudflare" width={100} height={24} />
//        </div>
//      </div>
//    </main>
//  );
//}

//
//frontend/src/app/[lang]/signin/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import Image from 'next/image';
//import { messages } from './messages';
//import '../../styles/globais.css';
//import { commonMessages } from '@/app/i18n/commonMessages';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [loading, setLoading] = useState(true); // ← atualizado
//  const [status, setStatus] = useState('');
//  const [username, setUsername] = useState('');
//  const [role, setRole] = useState('');
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (data.username && data.role) {
//          router.replace(`/${lang}/dashboard`);
//          return;
//        }
//
//        setLoading(false); // libera renderização se não estiver logado
//      } catch {
//        setLoading(false);
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  // ⏳ Enquanto verifica sessão, não renderiza nada
//
//  if (loading) return null;
//
//  async function handleLogin() {
//    setError('');
//    setSuccess(false);
//
//    if (!email || !email.includes('@')) {
//      setError('E-mail inválido');
//      return;
//    }
//
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      if (res.ok) {
//        setSuccess(true);
//        localStorage.setItem('canAccessConfirm', 'true'); // ✅ Permite acesso à página de confirmação
//        localStorage.setItem('signinEmail', email);       // ✅ Armazena email temporariamente
//
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        const data = await res.json();
//        setError(data?.error || 'Erro ao enviar código');
//      }
//    } catch {
//      setError('Erro de rede ou servidor');
//    }
//
//    setLoading(false);
//  }
//
//  return (
//    <main className="min-h-screen flex items-center justify-center bg-black text-white px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6 signin-container">
//        <h1 className="text-2xl font-bold text-center">{dict.welcome}</h1>
//
//        <label htmlFor="email" className="block text-sm text-gray-300">{dict.emailLabel}</label>
//        <input
//          id="email"
//          type="email"
//          value={email}
//          onChange={e => setEmail(e.target.value)}
//          placeholder={dict.emailPlaceholder}
//          className="w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400"
//        />
//
//        {success && (
//          <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//            <span>✔</span> {dict.success}
//          </div>
//        )}
//
//        {error && (
//          <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//            <span>⚠</span> {error}
//          </div>
//        )}
//
//        <button
//          onClick={handleLogin}
//          disabled={loading}
//          className={`w-full py-2 rounded text-white font-semibold ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
//            }`}
//        >
//          {loading ? 'Enviando...' : dict.loginButton}
//        </button>
//
//        <div className="text-center text-gray-400 text-sm">OU</div>
//
//        <button
//          disabled
//          className="w-full border border-gray-500 py-2 rounded text-gray-500 bg-gray-800 cursor-not-allowed"
//        >
//          {dict.loginKey}
//        </button>
//
//        <div className="text-center text-sm text-gray-400">
//          {dict.noAccount}{' '}
//          <Link href={`/${lang}/signup`} className="text-green-400 underline hover:text-green-300">
//            {dict.create}
//          </Link>
//        </div>
//
//        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//          <Link href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</Link>
//          <Link href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</Link>
//        </div>
//
//        <div className="flex justify-center mt-6">
//          <Image src="/cloudflare-logo.png" alt="Cloudflare" width={100} height={24} />
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signin/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import Image from 'next/image';
//import { messages } from './messages';
//import '../../styles/globais.css';
//import { commonMessages } from '@/app/i18n/commonMessages';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] }; // ✅ Agora lang já existe
//  const router = useRouter();
//
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [loading, setLoading] = useState(false);
//  const [status, setStatus] = useState("");
//
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//        const data = await res.json();
//
//        if (data.username && data.role) {
//          router.replace(`/${lang}/dashboard`);
//          return;
//        }
//
//        setLoading(false); // libera renderização se não estiver logado
//      } catch {
//        setLoading(false); // mesmo com erro, libera renderização
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  // ⏳ Enquanto verifica sessão, não renderiza nada
//  useEffect(() => {
//    if (!loading) {
//      setStatus("");
//    }
//  }, [loading]);
//
//  if (loading) return null;
//
//  //useEffect(() => {
//  //  const checkSession = async () => {
//  //    const res = await fetch('/api/verify-token', {
//  //      method: 'GET',
//  //      credentials: 'include',
//  //    });
//  //    const data = await res.json();
//  //    if (data.username) {
//  //      router.replace(`/${lang}/dashboard`);
//  //    }
//  //  };
//  //  checkSession();
//  //}, []);
//
//  async function handleLogin() {
//    setError('');
//    setSuccess(false);
//
//    if (!email || !email.includes('@')) {
//      setError('E-mail inválido');
//      return;
//    }
//
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      if (res.ok) {
//        setSuccess(true);
//        localStorage.setItem('canAccessConfirm', 'true'); // ✅ Permite acesso à página de confirmação
//        localStorage.setItem('signinEmail', email);       // ✅ Armazena email temporariamente
//
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        const data = await res.json();
//        setError(data?.error || 'Erro ao enviar código');
//      }
//    } catch {
//      setError('Erro de rede ou servidor');
//    }
//
//    setLoading(false);
//  }
//
//  return (
//    <main className="min-h-screen flex items-center justify-center bg-black text-white px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6 signin-container">
//        <h1 className="text-2xl font-bold text-center">{dict.welcome}</h1>
//
//        <label htmlFor="email" className="block text-sm text-gray-300">{dict.emailLabel}</label>
//        <input
//          id="email"
//          type="email"
//          value={email}
//          onChange={e => setEmail(e.target.value)}
//          placeholder={dict.emailPlaceholder}
//          className="w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400"
//        />
//
//        {success && (
//          <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//            <span>✔</span> {dict.success}
//          </div>
//        )}
//
//        {error && (
//          <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//            <span>⚠</span> {error}
//          </div>
//        )}
//
//        <button
//          onClick={handleLogin}
//          disabled={loading}
//          className={`w-full py-2 rounded text-white font-semibold ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
//            }`}
//        >
//          {loading ? 'Enviando...' : dict.loginButton}
//        </button>
//
//        <div className="text-center text-gray-400 text-sm">OU</div>
//
//        <button
//          disabled
//          className="w-full border border-gray-500 py-2 rounded text-gray-500 bg-gray-800 cursor-not-allowed"
//        >
//          {dict.loginKey}
//        </button>
//
//        <div className="text-center text-sm text-gray-400">
//          {dict.noAccount}{' '}
//          <Link href={`/${lang}/signup`} className="text-green-400 underline hover:text-green-300">
//            {dict.create}
//          </Link>
//        </div>
//
//        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//          <Link href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</Link>
//          <Link href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</Link>
//        </div>
//
//        <div className="flex justify-center mt-6">
//          <Image src="/cloudflare-logo.png" alt="Cloudflare" width={100} height={24} />
//        </div>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import Image from 'next/image';
//import { messages } from './messages';
//import '../../styles/globais.css';
//import { commonMessages } from '@/app/i18n/commonMessages';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function SignInPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] }; // ✅ Agora lang já existe
//  const router = useRouter();
//
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [loading, setLoading] = useState(false);
//
//  // ✅ Redireciona se já estiver logado
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (data.username) {
//        router.replace(`/${lang}/dashboard`);
//      }
//    };
//    checkSession();
//  }, []);
//
//  async function handleLogin() {
//    setError('');
//    setSuccess(false);
//
//    if (!email || !email.includes('@')) {
//      setError('E-mail inválido');
//      return;
//    }
//
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      if (res.ok) {
//        setSuccess(true);
//        localStorage.setItem('canAccessConfirm', 'true'); // ✅ Permite acesso à página de confirmação
//        localStorage.setItem('signinEmail', email);       // ✅ Armazena email temporariamente
//
//        setTimeout(() => {
//          router.push(`/${lang}/signin/confirm?email=${encodeURIComponent(email)}`);
//        }, 1000);
//      } else {
//        const data = await res.json();
//        setError(data?.error || 'Erro ao enviar código');
//      }
//    } catch {
//      setError('Erro de rede ou servidor');
//    }
//
//    setLoading(false);
//  }
//
//  return (
//    <main className="min-h-screen flex items-center justify-center bg-black text-white px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6 signin-container">
//        <h1 className="text-2xl font-bold text-center">{dict.welcome}</h1>
//
//        <label htmlFor="email" className="block text-sm text-gray-300">{dict.emailLabel}</label>
//        <input
//          id="email"
//          type="email"
//          value={email}
//          onChange={e => setEmail(e.target.value)}
//          placeholder={dict.emailPlaceholder}
//          className="w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400"
//        />
//
//        {success && (
//          <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//            <span>✔</span> {dict.success}
//          </div>
//        )}
//
//        {error && (
//          <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//            <span>⚠</span> {error}
//          </div>
//        )}
//
//        <button
//          onClick={handleLogin}
//          disabled={loading}
//          className={`w-full py-2 rounded text-white font-semibold ${
//            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
//          }`}
//        >
//          {loading ? 'Enviando...' : dict.loginButton}
//        </button>
//
//        <div className="text-center text-gray-400 text-sm">OU</div>
//
//        <button
//          disabled
//          className="w-full border border-gray-500 py-2 rounded text-gray-500 bg-gray-800 cursor-not-allowed"
//        >
//          {dict.loginKey}
//        </button>
//
//        <div className="text-center text-sm text-gray-400">
//          {dict.noAccount}{' '}
//          <Link href={`/${lang}/signup`} className="text-green-400 underline hover:text-green-300">
//            {dict.create}
//          </Link>
//        </div>
//
//        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//          <Link href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</Link>
//          <Link href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</Link>
//        </div>
//
//        <div className="flex justify-center mt-6">
//          <Image src="/cloudflare-logo.png" alt="Cloudflare" width={100} height={24} />
//        </div>
//      </div>
//    </main>
//  );
//}
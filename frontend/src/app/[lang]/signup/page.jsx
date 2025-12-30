//frontend/src/app/[lang]/signup/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { messages } from '../messages/signup';
import '../../styles/virtus.css';
import { commonMessages } from '@/app/i18n/commonMessages';

// 🌐 Detecta idioma da URL
function getLang(pathname) {
  const segment = pathname.split('/')[1];
  const supported = ['pt-br', 'en', 'es', 'zh'];
  return supported.includes(segment) ? segment : 'en';
}

// 📧 Valida formato de e-mail
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignUpPage() {
  const pathname = usePathname();
  const lang = getLang(pathname);
  const dict = { ...commonMessages[lang], ...messages[lang] };
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Redireciona se já estiver logado
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

  // 🔍 Verifica se username ou email já estão em uso
  async function checkUserAvailability() {
    const res = await fetch('/api/check-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username }),
    });
    const data = await res.json();
    if (data.exists) {
      setError(dict.userExists || 'Nome de usuário ou e-mail já estão em uso');
      setLoading(false);
      return false;
    }
    return true;
  }

  // 🚀 Envia dados para o backend e redireciona para confirmação
  async function handleSignup() {
    event.preventDefault(); // ⛔ Impede o reload da página
    setUsernameError('');
    setEmailError('');
    setError('');
    setSuccess(false);
    setLoading(true);

    // ⚠️ Validações básicas
    if (!email || !username) {
      if (!username) setUsernameError(dict.fillFields || 'Preencha o nome de usuário');
      if (!email) setEmailError(dict.fillFields || 'Preencha o e-mail');
      setLoading(false);
      return;
    }
    if (username.trim().length < 3) {
      setUsernameError(dict.usernameTooShort || 'Este não é um nome de usuário válido.');
      setLoading(false);
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError(dict.invalidEmail || 'Este não é um endereço de email válido.');
      setLoading(false);
      return;
    }

    // ✅ Verifica disponibilidade antes de enviar
    const available = await checkUserAvailability();
    if (!available) return;

    try {
      const res = await fetch('/api/verify-code/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(true);

        // 🧠 Armazena dados temporários e libera acesso à página de confirmação
        document.cookie = `virtuscloud.signup=${encodeURIComponent(JSON.stringify({ email, username }))}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `virtuscloud.canAccessConfirm=true; path=/; max-age=86400; SameSite=Lax`;
        //localStorage.setItem('signupEmail', email);
        //localStorage.setItem('signupUsername', username);
        //localStorage.setItem('canAccessConfirm', 'true');

        // ⏱️ Inicia o timer de reenvio com chave única
        localStorage.setItem(`resendStartedAt:signup:${email}:${username}`, Date.now().toString());

        // 🚀 Redireciona para confirmação
        router.push(`/${lang}/signup/confirm`);
        //router.push(`/${lang}/signup/confirm?email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}`);
      } else {
        const data = await res.json();
        setError(data?.error || dict.errorSending || 'Erro ao enviar código');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(dict.networkError || 'Erro de rede ou servidor');
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="min-h-screen w-full bg-background flex items-center justify-center">
      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
        <div className="relative flex flex-col items-center justify-center">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <button
              className="absolute top-0 left-0 cursor-pointer sm:left-10"
              onClick={() => router.push(`/${lang}/signin`)} //onClick={() => router.back()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
              </svg>
            </button>
            <img
              alt="Virtus Cloud Logo"
              className="mb-4 block w-28"
              src="/assets/logo.jpg"
            />
          </div>

          <div className="w-full max-w-96">
            <div className="mb-6 flex flex-col items-center gap-2 text-center">
              <h1 className="font-bold text-2xl">{dict.welcome}</h1>
            </div>

            <form className="flex w-full flex-col gap-4">
              {/* Nome de usuário */}
              <div className="flex flex-col gap-2" data-slot="form-item">
                <label
                  htmlFor="username"
                  className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']"
                  data-error="false"
                  data-required="true"
                  data-slot="form-label"
                >
                  {dict.usernameLabel}
                </label>
                <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
                  <input
                    className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder={dict.usernamePlaceholder}
                    autoComplete="off"
                    aria-describedby="username-description"
                    aria-invalid="false"
                    data-slot="form-control"
                  />
                </div>
                {usernameError && (
                  <div className="text-red-500 text-sm mt-1">{usernameError}</div>
                )}

              </div>

              {/* E-mail */}
              <div className="flex flex-col gap-2" data-slot="form-item">
                <label
                  htmlFor="email"
                  className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']"
                  data-error="false"
                  data-required="true"
                  data-slot="form-label"
                >
                  {dict.emailLabel}
                </label>
                <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
                  <input
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

              {/* Turnstile */}
              <div className="flex flex-col gap-2" data-slot="form-item">
                <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
                  {/* Turnstile embed */}
                </div>
              </div>

              {/* Botão com spinner */}
              <div className="space-y-2">
                <button
                  type="submit"
                  onClick={handleSignup}
                  disabled={loading}
                  aria-disabled={loading}
                  role="button"
                  className={`group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-white transition-all select-none
    ${loading ? 'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-gray-600' : 'hover:cursor-pointer bg-blue-700 hover:bg-blue-800'}
    focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
                >
                  {loading && (
                    <span className="absolute flex size-full items-center justify-center bg-inherit">
                      <span className="size-5 animate-spin rounded-full border-2 border-gray-400 border-l-white"></span>
                    </span>
                  )}
                  <span className={loading ? 'invisible' : 'visible'}>
                    {dict.signupButton || 'Inscrever-se com e-mail'}
                  </span>
                </button>
              </div>

              {/* Termos */}
              <span className="text-secondary text-xs">
                {dict.agreeText}{' '}
                <Link href={`/${lang}/legal`} className="text-link" target="_blank">{dict.termsLink}</Link> e{' '}
                <Link href={`/${lang}/legal/policy`} className="text-link" target="_blank">{dict.privacyLink}</Link>.
              </span>

              {/* Separador OU */}
              <div className="flex select-none items-center gap-4">
                <span className="block h-px w-full bg-border"></span>
                <span className="font-medium text-secondary text-sm">{dict.separator}</span>
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
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

//frontend/src/app/[lang]/signup/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { usePathname, useRouter } from 'next/navigation';
//import Link from 'next/link';
//import { messages } from '../messages/signup';
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
//// 📧 Valida formato de e-mail
//function isValidEmail(email) {
//  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//}
//
//export default function SignUpPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [usernameError, setUsernameError] = useState('');
//  const [emailError, setEmailError] = useState('');
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
//  // 🔍 Verifica se username ou email já estão em uso
//  async function checkUserAvailability() {
//    const res = await fetch('/api/check-user', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ email, username }),
//    });
//    const data = await res.json();
//    if (data.exists) {
//      setError(dict.userExists || 'Nome de usuário ou e-mail já estão em uso');
//      setLoading(false);
//      return false;
//    }
//    return true;
//  }
//
//  // 🚀 Envia dados para o backend e redireciona para confirmação
//  async function handleSignup() {
//    event.preventDefault(); // ⛔ Impede o reload da página
//    setUsernameError('');
//    setEmailError('');
//    setError('');
//    setSuccess(false);
//    setLoading(true);
//
//    // ⚠️ Validações básicas
//    if (!email || !username) {
//      if (!username) setUsernameError(dict.fillFields || 'Preencha o nome de usuário');
//      if (!email) setEmailError(dict.fillFields || 'Preencha o e-mail');
//      setLoading(false);
//      return;
//    }
//    if (username.trim().length < 3) {
//      setUsernameError(dict.usernameTooShort || 'Este não é um nome de usuário válido.');
//      setLoading(false);
//      return;
//    }
//    if (!isValidEmail(email)) {
//      setEmailError(dict.invalidEmail || 'Este não é um endereço de email válido.');
//      setLoading(false);
//      return;
//    }
//
//    // ✅ Verifica disponibilidade antes de enviar
//    const available = await checkUserAvailability();
//    if (!available) return;
//
//    try {
//      const res = await fetch('/api/verify-code/signup', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      if (res.ok) {
//        const data = await res.json();
//        setSuccess(true);
//
//        // 🧠 Armazena dados temporários e libera acesso à página de confirmação
//        document.cookie = `virtuscloud.signup=${encodeURIComponent(JSON.stringify({ email, username }))}; path=/; max-age=86400; SameSite=Lax`;
//        document.cookie = `virtuscloud.canAccessConfirm=true; path=/; max-age=86400; SameSite=Lax`;
//        //localStorage.setItem('signupEmail', email);
//        //localStorage.setItem('signupUsername', username);
//        //localStorage.setItem('canAccessConfirm', 'true');
//
//        // ⏱️ Inicia o timer de reenvio com chave única
//        localStorage.setItem(`resendStartedAt:signup:${email}:${username}`, Date.now().toString());
//
//        // 🚀 Redireciona para confirmação
//        router.push(`/${lang}/signup/confirm`);
//        //router.push(`/${lang}/signup/confirm?email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}`);
//      } else {
//        const data = await res.json();
//        setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//      }
//    } catch (err) {
//      console.error('Signup error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setLoading(false);
//    }
//  }
//  return (
//    <main className="min-h-screen w-full bg-background flex items-center justify-center">
//      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//        <div className="relative flex flex-col items-center justify-center">
//          <div className="mb-6 flex flex-col items-center gap-2 text-center">
//            <button
//              className="absolute top-0 left-0 cursor-pointer sm:left-10"
//              onClick={() => router.push(`/${lang}/signin`)} //onClick={() => router.back()}
//            >
//              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//              </svg>
//            </button>
//            <img
//              alt="Virtus Cloud Logo"
//              className="mb-4 block w-28"
//              src="/assets/logo.jpg"
//            />
//          </div>
//
//          <div className="w-full max-w-96">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <h1 className="font-bold text-2xl">{dict.welcome}</h1>
//            </div>
//
//            <form className="flex w-full flex-col gap-4">
//              {/* Nome de usuário */}
//              <div className="flex flex-col gap-2" data-slot="form-item">
//                <label
//                  htmlFor="username"
//                  className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']"
//                  data-error="false"
//                  data-required="true"
//                  data-slot="form-label"
//                >
//                  {dict.usernameLabel}
//                </label>
//                <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                  <input
//                    className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                    type="text"
//                    id="username"
//                    name="username"
//                    value={username}
//                    onChange={e => setUsername(e.target.value)}
//                    placeholder={dict.usernamePlaceholder}
//                    autoComplete="off"
//                    aria-describedby="username-description"
//                    aria-invalid="false"
//                    data-slot="form-control"
//                  />
//                </div>
//                {usernameError && (
//                  <div className="text-red-500 text-sm mt-1">{usernameError}</div>
//                )}
//
//              </div>
//
//              {/* E-mail */}
//              <div className="flex flex-col gap-2" data-slot="form-item">
//                <label
//                  htmlFor="email"
//                  className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']"
//                  data-error="false"
//                  data-required="true"
//                  data-slot="form-label"
//                >
//                  {dict.emailLabel}
//                </label>
//                <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                  <input
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
//              {/* Turnstile */}
//              <div className="flex flex-col gap-2" data-slot="form-item">
//                <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                  {/* Turnstile embed */}
//                </div>
//              </div>
//
//              {/* Botão com spinner */}
//              <div className="space-y-2">
//                <button
//                  type="submit"
//                  onClick={handleSignup}
//                  disabled={loading}
//                  aria-disabled={loading}
//                  role="button"
//                  className={`group/button relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-white transition-all select-none
//                  ${loading ? 'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-gray-600' : 'hover:cursor-pointer bg-blue-700 hover:bg-blue-800'}
//                  focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                >
//                  {loading && (
//                    <span className="absolute flex size-full items-center justify-center bg-inherit">
//                      <span className="size-5 animate-spin rounded-full border-2 border-gray-400 border-l-white"></span>
//                    </span>
//                  )}
//                  <span className={loading ? 'invisible' : 'visible'}>
//                    {dict.signupButton || 'Inscrever-se com e-mail'}
//                  </span>
//                </button>
//              </div>
//
//              {/* Termos */}
//              <span className="text-secondary text-xs">
//                {dict.agreeText}{' '}
//                <Link href={`/${lang}/legal`} className="text-link" target="_blank">{dict.termsLink}</Link> e{' '}
//                <Link href={`/${lang}/legal/policy`} className="text-link" target="_blank">{dict.privacyLink}</Link>.
//              </span>
//
//              {/* Separador OU */}
//              <div className="flex select-none items-center gap-4">
//                <span className="block h-px w-full bg-border"></span>
//                <span className="font-medium text-secondary text-sm">{dict.separator}</span>
//                <span className="block h-px w-full bg-border"></span>
//              </div>
//
//              {/* Botão GitHub */}
//              <div className="flex flex-col gap-3">
//                <button
//                  type="button"
//                  role="button"
//                  aria-disabled={loading}
//                  disabled={loading}
//                  onClick={() => {
//                    setLoading(true);
//                    window.open(githubAuthUrl, '_blank', 'noopener,noreferrer');
//                    setTimeout(() => setLoading(false), 2000); // opcional: reseta após 2s
//                  }}        //onClick={() => window.open(githubAuthUrl, '_blank', 'noopener,noreferrer')}
//
//                  className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full ${loading ? 'opacity-50 pointer-events-none' : ''
//                    }`}
//                >
//                  {loading && (
//                    <span className="absolute flex size-full items-center justify-center bg-inherit">
//                      <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
//                    </span>
//                  )}
//                  <img
//                    alt="Github"
//                    width={20}
//                    height={20}
//                    className="absolute left-4"
//                    src="/assets/companies/small/github.svg"
//                  />
//                  {dict.githubButton}
//                </button>
//              </div>
//            </form>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signup/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { usePathname, useRouter } from 'next/navigation';
//import Link from 'next/link';
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
//// 📧 Valida formato de e-mail
//function isValidEmail(email) {
//  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//}
//
//export default function SignUpPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [usernameError, setUsernameError] = useState('');
//  const [emailError, setEmailError] = useState('');
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
//  // 🔍 Verifica se username ou email já estão em uso
//  async function checkUserAvailability() {
//    const res = await fetch('/api/check-user', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ email, username }),
//    });
//    const data = await res.json();
//    if (data.exists) {
//      setError(dict.userExists || 'Nome de usuário ou e-mail já estão em uso');
//      setLoading(false);
//      return false;
//    }
//    return true;
//  }
//
//  // 🚀 Envia dados para o backend e redireciona para confirmação
//  async function handleSignup() {
//    event.preventDefault(); // ⛔ Impede o reload da página
//    setUsernameError('');
//    setEmailError('');
//    setError('');
//    setSuccess(false);
//    setLoading(true);
//
//    // ⚠️ Validações básicas
//    if (!email || !username) {
//      if (!username) setUsernameError(dict.fillFields || 'Preencha o nome de usuário');
//      if (!email) setEmailError(dict.fillFields || 'Preencha o e-mail');
//      setLoading(false);
//      return;
//    }
//    if (username.trim().length < 3) {
//      setUsernameError(dict.usernameTooShort || 'Este não é um nome de usuário válido.');
//      setLoading(false);
//      return;
//    }
//    if (!isValidEmail(email)) {
//      setEmailError(dict.invalidEmail || 'Este não é um endereço de email válido.');
//      setLoading(false);
//      return;
//    }
//
//    // ✅ Verifica disponibilidade antes de enviar
//    const available = await checkUserAvailability();
//    if (!available) return;
//
//    try {
//      const res = await fetch('/api/verify-code/signup', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      if (res.ok) {
//        const data = await res.json();
//        setSuccess(true);
//
//        // 🧠 Armazena dados temporários e libera acesso à página de confirmação
//        document.cookie = `virtuscloud.signup=${encodeURIComponent(JSON.stringify({ email, username }))}; path=/; max-age=86400; SameSite=Lax`;
//        document.cookie = `virtuscloud.canAccessConfirm=true; path=/; max-age=86400; SameSite=Lax`;
//        //localStorage.setItem('signupEmail', email);
//        //localStorage.setItem('signupUsername', username);
//        //localStorage.setItem('canAccessConfirm', 'true');
//
//        // ⏱️ Inicia o timer de reenvio com chave única
//        localStorage.setItem(`resendStartedAt:signup:${email}:${username}`, Date.now().toString());
//
//        // 🚀 Redireciona para confirmação
//        router.push(`/${lang}/signup/confirm`);
//        //router.push(`/${lang}/signup/confirm?email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}`);
//      } else {
//        const data = await res.json();
//        setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//      }
//    } catch (err) {
//      console.error('Signup error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setLoading(false);
//    }
//  }
//  return (
//    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//        <div className="relative flex flex-col items-center justify-center">
//          <div className="mb-6 flex flex-col items-center gap-2 text-center">
//            <button
//              className="absolute top-0 left-0 cursor-pointer sm:left-10"
//              onClick={() => router.push(`/${lang}/signin`)} //onClick={() => router.back()}
//            >
//              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//              </svg>
//            </button>
//            <img
//              alt="Virtus Cloud Logo"
//              className="mb-4 block w-28"
//              src="/assets/logo.jpg"
//            />
//          </div>
//
//          <div className="w-full max-w-96">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <h1 className="font-bold text-2xl">{dict.welcome}</h1>
//            </div>
//
//            <form className="flex w-full flex-col gap-4">
//              {/* Nome de usuário */}
//              <div className="flex flex-col gap-2" data-slot="form-item">
//                <label
//                  htmlFor="username"
//                  className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']"
//                  data-error="false"
//                  data-required="true"
//                  data-slot="form-label"
//                >
//                  {dict.usernameLabel}
//                </label>
//                <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                  <input
//                    className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                    type="text"
//                    id="username"
//                    name="username"
//                    value={username}
//                    onChange={e => setUsername(e.target.value)}
//                    placeholder={dict.usernamePlaceholder}
//                    autoComplete="off"
//                    aria-describedby="username-description"
//                    aria-invalid="false"
//                    data-slot="form-control"
//                  />
//                </div>
//                {usernameError && (
//                  <div className="text-red-500 text-sm mt-1">{usernameError}</div>
//                )}
//
//              </div>
//
//              {/* E-mail */}
//              <div className="flex flex-col gap-2" data-slot="form-item">
//                <label
//                  htmlFor="email"
//                  className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']"
//                  data-error="false"
//                  data-required="true"
//                  data-slot="form-label"
//                >
//                  {dict.emailLabel}
//                </label>
//                <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                  <input
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
//              {/* Turnstile */}
//              <div className="flex flex-col gap-2" data-slot="form-item">
//                <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                  {/* Turnstile embed */}
//                </div>
//              </div>
//
//              {/* Botão com spinner */}
//              <div className="space-y-2">
//                <button
//                  type="submit"
//                  onClick={handleSignup}
//                  disabled={loading}
//                  aria-disabled={loading}
//                  role="button"
//                  className={`group/button relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-white transition-all select-none
//                  ${loading ? 'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-gray-600' : 'hover:cursor-pointer bg-blue-700 hover:bg-blue-800'}
//                  focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                >
//                  {loading && (
//                    <span className="absolute flex size-full items-center justify-center bg-inherit">
//                      <span className="size-5 animate-spin rounded-full border-2 border-gray-400 border-l-white"></span>
//                    </span>
//                  )}
//                  <span className={loading ? 'invisible' : 'visible'}>
//                    {dict.signupButton || 'Inscrever-se com e-mail'}
//                  </span>
//                </button>
//              </div>
//
//              {/* Termos */}
//              <span className="text-secondary text-xs">
//                {dict.agreeText}{' '}
//                <Link href={`/${lang}/terms`} className="text-link" target="_blank">{dict.termsLink}</Link> e{' '}
//                <Link href={`/${lang}/privacy`} className="text-link" target="_blank">{dict.privacyLink}</Link>.
//              </span>
//
//              {/* Separador OU */}
//              <div className="flex select-none items-center gap-4">
//                <span className="block h-px w-full bg-border"></span>
//                <span className="font-medium text-secondary text-sm">{dict.separator}</span>
//                <span className="block h-px w-full bg-border"></span>
//              </div>
//
//              {/* Botão GitHub */}
//              <div className="flex flex-col gap-3">
//                <button
//                  type="button"
//                  role="button"
//                  aria-disabled={loading}
//                  disabled={loading}
//                  onClick={() => {
//                    setLoading(true);
//                    window.open(githubAuthUrl, '_blank', 'noopener,noreferrer');
//                    setTimeout(() => setLoading(false), 2000); // opcional: reseta após 2s
//                  }}        //onClick={() => window.open(githubAuthUrl, '_blank', 'noopener,noreferrer')}
//
//                  className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 w-full ${loading ? 'opacity-50 pointer-events-none' : ''
//                    }`}
//                >
//                  {loading && (
//                    <span className="absolute flex size-full items-center justify-center bg-inherit">
//                      <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50" />
//                    </span>
//                  )}
//                  <img
//                    alt="Github"
//                    width={20}
//                    height={20}
//                    className="absolute left-4"
//                    src="/assets/companies/small/github.svg"
//                  />
//                  {dict.githubButton}
//                </button>
//              </div>
//            </form>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signup/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { usePathname, useRouter } from 'next/navigation';
//import Link from 'next/link';
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
//// 📧 Valida formato de e-mail
//function isValidEmail(email) {
//  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//}
//
//export default function SignUpPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [usernameError, setUsernameError] = useState('');
//  const [emailError, setEmailError] = useState('');
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
//  // 🔍 Verifica se username ou email já estão em uso
//  async function checkUserAvailability() {
//    const res = await fetch('/api/check-user', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ email, username }),
//    });
//    const data = await res.json();
//    if (data.exists) {
//      setError(dict.userExists || 'Nome de usuário ou e-mail já estão em uso');
//      setLoading(false);
//      return false;
//    }
//    return true;
//  }
//
//  // 🚀 Envia dados para o backend e redireciona para confirmação
//  async function handleSignup() {
//    event.preventDefault(); // ⛔ Impede o reload da página
//    setUsernameError('');
//    setEmailError('');
//    setError('');
//    setSuccess(false);
//    setLoading(true);
//
//    // ⚠️ Validações básicas
//    if (!email || !username) {
//      if (!username) setUsernameError(dict.fillFields || 'Preencha o nome de usuário');
//      if (!email) setEmailError(dict.fillFields || 'Preencha o e-mail');
//      setLoading(false);
//      return;
//    }
//    if (username.trim().length < 3) {
//      setUsernameError(dict.usernameTooShort || 'Este não é um nome de usuário válido.');
//      setLoading(false);
//      return;
//    }
//    if (!isValidEmail(email)) {
//      setEmailError(dict.invalidEmail || 'Este não é um endereço de email válido.');
//      setLoading(false);
//      return;
//    }
//
//    // ✅ Verifica disponibilidade antes de enviar
//    const available = await checkUserAvailability();
//    if (!available) return;
//
//    try {
//      const res = await fetch('/api/verify-code/signup', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      if (res.ok) {
//        const data = await res.json();
//        setSuccess(true);
//
//        // 🧠 Armazena dados temporários e libera acesso à página de confirmação
//        localStorage.setItem('signupEmail', email);
//        localStorage.setItem('signupUsername', username);
//        localStorage.setItem('canAccessConfirm', 'true');
//
//        // ⏱️ Inicia o timer de reenvio com chave única
//        localStorage.setItem(`resendStartedAt:signup:${email}:${username}`, Date.now().toString());
//
//        // 🚀 Redireciona para confirmação
//        router.push(`/${lang}/signup/confirm?email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}`);
//      } else {
//        const data = await res.json();
//        setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//      }
//    } catch (err) {
//      console.error('Signup error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setLoading(false);
//    }
//  }
//  return (
//    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//        <div className="relative flex flex-col items-center justify-center">
//          <div className="mb-6 flex flex-col items-center gap-2 text-center">
//            <button
//              className="absolute top-0 left-0 cursor-pointer sm:left-10"
//              onClick={() => router.push(`/${lang}/signin`)} //onClick={() => router.back()}
//            >
//              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//              </svg>
//            </button>
//            <img
//              alt="Virtus Cloud Logo"
//              className="mb-4 block w-28"
//              src="/assets/logo.jpg"
//            />
//          </div>
//
//          <div className="w-full max-w-96">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <h1 className="font-bold text-2xl">{dict.welcome}</h1>
//            </div>
//
//            <form className="flex w-full flex-col gap-4">
//              {/* Nome de usuário */}
//              <div className="flex flex-col gap-2" data-slot="form-item">
//                <label
//                  htmlFor="username"
//                  className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']"
//                  data-error="false"
//                  data-required="true"
//                  data-slot="form-label"
//                >
//                  {dict.usernameLabel}
//                </label>
//                <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                  <input
//                    className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                    type="text"
//                    id="username"
//                    name="username"
//                    value={username}
//                    onChange={e => setUsername(e.target.value)}
//                    placeholder={dict.usernamePlaceholder}
//                    autoComplete="off"
//                    aria-describedby="username-description"
//                    aria-invalid="false"
//                    data-slot="form-control"
//                  />
//                </div>
//                {usernameError && (
//                  <div className="text-red-500 text-sm mt-1">{usernameError}</div>
//                )}
//
//              </div>
//
//              {/* E-mail */}
//              <div className="flex flex-col gap-2" data-slot="form-item">
//                <label
//                  htmlFor="email"
//                  className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']"
//                  data-error="false"
//                  data-required="true"
//                  data-slot="form-label"
//                >
//                  {dict.emailLabel}
//                </label>
//                <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                  <input
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
//              {/* Turnstile */}
//              <div className="flex flex-col gap-2" data-slot="form-item">
//                <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                  {/* Turnstile embed */}
//                </div>
//              </div>
//
//              {/* Botão com spinner */}
//              <div className="space-y-2">
//                <button
//                  type="submit"
//                  onClick={handleSignup}
//                  disabled={loading}
//                  aria-disabled={loading}
//                  role="button"
//                  className={`group/button relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-white transition-all select-none
//                  ${loading ? 'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-gray-600' : 'hover:cursor-pointer bg-blue-700 hover:bg-blue-800'}
//                  focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                >
//                  {loading && (
//                    <span className="absolute flex size-full items-center justify-center bg-inherit">
//                      <span className="size-5 animate-spin rounded-full border-2 border-gray-400 border-l-white"></span>
//                    </span>
//                  )}
//                  <span className={loading ? 'invisible' : 'visible'}>
//                    {dict.signupButton || 'Inscrever-se com e-mail'}
//                  </span>
//                </button>
//              </div>
//
//              {/* Termos */}
//              <span className="text-secondary text-xs">
//                {dict.agreeText}{' '}
//                <Link href={`/${lang}/terms`} className="text-link" target="_blank">{dict.termsLink}</Link> e{' '}
//                <Link href={`/${lang}/privacy`} className="text-link" target="_blank">{dict.privacyLink}</Link>.
//              </span>
//
//              {/* Separador OU */}
//              <div className="flex select-none items-center gap-4">
//                <span className="block h-px w-full bg-border"></span>
//                <span className="font-medium text-secondary text-sm">{dict.separator}</span>
//                <span className="block h-px w-full bg-border"></span>
//              </div>
//
//              {/* Botão GitHub */}
//              <div className="flex flex-col gap-3">
//                <button
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
//              </div>
//            </form>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signup/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { usePathname, useRouter } from 'next/navigation';
//import Link from 'next/link';
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
//// 📧 Valida formato de e-mail
//function isValidEmail(email) {
//  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//}
//
//export default function SignUpPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [usernameError, setUsernameError] = useState('');
//  const [emailError, setEmailError] = useState('');
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
//  // 🔍 Verifica se username ou email já estão em uso
//  async function checkUserAvailability() {
//    const res = await fetch('/api/check-user', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ email, username }),
//    });
//    const data = await res.json();
//    if (data.exists) {
//      setError(dict.userExists || 'Nome de usuário ou e-mail já estão em uso');
//      setLoading(false);
//      return false;
//    }
//    return true;
//  }
//
//  // 🚀 Envia dados para o backend e redireciona para confirmação
//  async function handleSignup() {
//    event.preventDefault(); // ⛔ Impede o reload da página
//    setUsernameError('');
//    setEmailError('');
//    setError('');
//    setSuccess(false);
//    setLoading(true);
//
//    // ⚠️ Validações básicas
//    if (!email || !username) {
//      if (!username) setUsernameError(dict.fillFields || 'Preencha o nome de usuário');
//      if (!email) setEmailError(dict.fillFields || 'Preencha o e-mail');
//      setLoading(false);
//      return;
//    }
//    if (username.trim().length < 3) {
//      setUsernameError(dict.usernameTooShort || 'Este não é um nome de usuário válido.');
//      setLoading(false);
//      return;
//    }
//    if (!isValidEmail(email)) {
//      setEmailError(dict.invalidEmail || 'Este não é um endereço de email válido.');
//      setLoading(false);
//      return;
//    }
//
//    // ✅ Verifica disponibilidade antes de enviar
//    const available = await checkUserAvailability();
//    if (!available) return;
//
//    try {
//      const res = await fetch('/api/verify-code/signup', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      if (res.ok) {
//        const data = await res.json();
//        setSuccess(true);
//
//        // 🧠 Armazena dados temporários e libera acesso à página de confirmação
//        localStorage.setItem('signupEmail', email);
//        localStorage.setItem('signupUsername', username);
//        localStorage.setItem('canAccessConfirm', 'true');
//
//        // ⏱️ Inicia o timer de reenvio com chave única
//        localStorage.setItem(`resendStartedAt:signup:${email}:${username}`, Date.now().toString());
//
//        // 🚀 Redireciona para confirmação
//        router.push(`/${lang}/signup/confirm?email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}`);
//      } else {
//        const data = await res.json();
//        setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//      }
//    } catch (err) {
//      console.error('Signup error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setLoading(false);
//    }
//  }
//  return (
//    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//        <div className="relative flex flex-col items-center justify-center">
//          <div className="mb-6 flex flex-col items-center gap-2 text-center">
//            <button
//              className="absolute top-0 left-0 cursor-pointer sm:left-10"
//              onClick={() => router.back()}
//            >
//              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//              </svg>
//            </button>
//            <img
//              alt="Virtus Cloud Logo"
//              className="mb-4 block w-28"
//              src="/assets/logo.jpg"
//            />
//          </div>
//
//          <div className="w-full max-w-96">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <h1 className="font-bold text-2xl">Bem vindo de volta!</h1>
//            </div>
//
//            <form className="flex w-full flex-col gap-4">
//              {/* Nome de usuário */}
//              <div className="flex flex-col gap-2" data-slot="form-item">
//                <label
//                  htmlFor="username"
//                  className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']"
//                  data-error="false"
//                  data-required="true"
//                  data-slot="form-label"
//                >
//                  Nome de usuário
//                </label>
//                <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                  <input
//                    className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                    type="text"
//                    id="username"
//                    name="username"
//                    value={username}
//                    onChange={e => setUsername(e.target.value)}
//                    placeholder="Digite um nome de usuário"
//                    autoComplete="off"
//                    aria-describedby="username-description"
//                    aria-invalid="false"
//                    data-slot="form-control"
//                  />
//                </div>
//                {usernameError && (
//                  <div className="text-red-500 text-sm mt-1">{usernameError}</div>
//                )}
//
//              </div>
//
//              {/* E-mail */}
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
//              {/* Turnstile */}
//              <div className="flex flex-col gap-2" data-slot="form-item">
//                <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                  {/* Turnstile embed */}
//                </div>
//              </div>
//
//              {/* Botão com spinner */}
//              <div className="space-y-2">
//                <button
//                  type="submit"
//                  onClick={handleSignup}
//                  disabled={loading}
//                  aria-disabled={loading}
//                  role="button"
//                  className={`group/button relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-white transition-all select-none
//                  ${loading ? 'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-gray-600' : 'hover:cursor-pointer bg-blue-700 hover:bg-blue-800'}
//                  focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                >
//                  {loading && (
//                    <span className="absolute flex size-full items-center justify-center bg-inherit">
//                      <span className="size-5 animate-spin rounded-full border-2 border-gray-400 border-l-white"></span>
//                    </span>
//                  )}
//                  <span className={loading ? 'invisible' : 'visible'}>
//                    {dict.signupButton || 'Inscrever-se com e-mail'}
//                  </span>
//                </button>
//              </div>
//
//              {/* Termos */}
//              <span className="text-secondary text-xs">
//                Ao clicar em Inscrever-se, você concorda com nossos{' '}
//                <Link href={`/${lang}/terms`} className="text-link" target="_blank">Termos de Serviço</Link> e{' '}
//                <Link href={`/${lang}/privacy`} className="text-link" target="_blank">Política de Uso</Link>.
//              </span>
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
//              </div>
//            </form>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}


//frontend/src/app/[lang]/signup/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { usePathname, useRouter } from 'next/navigation';
//import Link from 'next/link';
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
//// 📧 Valida formato de e-mail
//function isValidEmail(email) {
//  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//}
//
//export default function SignUpPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [usernameError, setUsernameError] = useState('');
//  const [emailError, setEmailError] = useState('');
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
//  // 🔍 Verifica se username ou email já estão em uso
//  async function checkUserAvailability() {
//    const res = await fetch('/api/check-user', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ email, username }),
//    });
//    const data = await res.json();
//    if (data.exists) {
//      setError(dict.userExists || 'Nome de usuário ou e-mail já estão em uso');
//      setLoading(false);
//      return false;
//    }
//    return true;
//  }
//
//  // 🚀 Envia dados para o backend e redireciona para confirmação
//  async function handleSignup() {
//    event.preventDefault(); // ⛔ Impede o reload da página
//    setUsernameError('');
//    setEmailError('');
//    setError('');
//    setSuccess(false);
//    setLoading(true);
//
//    // ⚠️ Validações básicas
//    if (!email || !username) {
//      if (!username) setUsernameError(dict.fillFields || 'Preencha o nome de usuário');
//      if (!email) setEmailError(dict.fillFields || 'Preencha o e-mail');
//      setLoading(false);
//      return;
//    }
//    if (username.trim().length < 3) {
//      setUsernameError(dict.usernameTooShort || 'Este não é um nome de usuário válido.');
//      setLoading(false);
//      return;
//    }
//    if (!isValidEmail(email)) {
//      setEmailError(dict.invalidEmail || 'Este não é um endereço de email válido.');
//      setLoading(false);
//      return;
//    }
//
//    // ✅ Verifica disponibilidade antes de enviar
//    const available = await checkUserAvailability();
//    if (!available) return;
//
//    try {
//      const res = await fetch('/api/verify-code/signup', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      if (res.ok) {
//        const data = await res.json();
//        setSuccess(true);
//
//        // 🧠 Armazena dados temporários e libera acesso à página de confirmação
//        localStorage.setItem('signupEmail', email);
//        localStorage.setItem('signupUsername', username);
//        localStorage.setItem('canAccessConfirm', 'true');
//
//        // ⏱️ Inicia o timer de reenvio com chave única
//        localStorage.setItem(`resendStartedAt:signup:${email}:${username}`, Date.now().toString());
//
//        // 🚀 Redireciona para confirmação
//        router.push(`/${lang}/signup/confirm?email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}`);
//      } else {
//        const data = await res.json();
//        setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//      }
//    } catch (err) {
//      console.error('Signup error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setLoading(false);
//    }
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
//            <img
//              alt="Virtus Cloud Logo"
//              className="mb-4 block w-28"
//              src="/assets/logo.jpg"
//            />
//          </div>
//
//          <div className="w-full max-w-96">
//            <div className="mb-6 flex flex-col items-center gap-2 text-center">
//              <h1 className="font-bold text-2xl">Bem vindo de volta!</h1>
//            </div>
//
//            <form className="flex w-full flex-col gap-4">
//              {/* Nome de usuário */}
//              <div className="flex flex-col gap-2" data-slot="form-item">
//                <label
//                  htmlFor="username"
//                  className="font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70 data-[error=true]:text-destructive data-[required=true]:after:ml-1 data-[required=true]:after:text-destructive data-[required=true]:after:content-['*']"
//                  data-error="false"
//                  data-required="true"
//                  data-slot="form-label"
//                >
//                  Nome de usuário
//                </label>
//                <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//                  <input
//                    className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                    type="text"
//                    id="username"
//                    name="username"
//                    value={username}
//                    onChange={e => setUsername(e.target.value)}
//                    placeholder="Digite um nome de usuário"
//                    autoComplete="off"
//                    aria-describedby="username-description"
//                    aria-invalid="false"
//                    data-slot="form-control"
//                  />
//                </div>
//                {usernameError && (
//                  <div className="text-red-500 text-sm mt-1">{usernameError}</div>
//                )}
//
//              </div>
//
//              {/* E-mail */}
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
//              {/* Turnstile */}
//              <div className="flex flex-col gap-2" data-slot="form-item">
//                <div id="cf-turnstile" style={{ minWidth: '300px', width: '100%', height: '65px' }}>
//                  {/* Turnstile embed */}
//                </div>
//              </div>
//
//              {/* Botão com spinner */}
//              <div className="space-y-2">
//                <button
//                  type="submit"
//                  onClick={handleSignup}
//                  disabled={loading}
//                  aria-disabled={loading}
//                  role="button"
//                  className={`group/button relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-white transition-all select-none
//                  ${loading ? 'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-gray-600' : 'hover:cursor-pointer bg-blue-700 hover:bg-blue-800'}
//                  focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                >
//                  {loading && (
//                    <span className="absolute flex size-full items-center justify-center bg-inherit">
//                      <span className="size-5 animate-spin rounded-full border-2 border-gray-400 border-l-white"></span>
//                    </span>
//                  )}
//                  <span className={loading ? 'invisible' : 'visible'}>
//                    {dict.signupButton || 'Inscrever-se com e-mail'}
//                  </span>
//                </button>
//              </div>
//
//              {/* Termos */}
//              <span className="text-secondary text-xs">
//                Ao clicar em Inscrever-se, você concorda com nossos{' '}
//                <Link href={`/${lang}/terms`} className="text-link" target="_blank">Termos de Serviço</Link> e{' '}
//                <Link href={`/${lang}/privacy`} className="text-link" target="_blank">Política de Uso</Link>.
//              </span>
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
//import { usePathname, useRouter } from 'next/navigation';
//import Link from 'next/link';
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
//// 📧 Valida formato de e-mail
//function isValidEmail(email) {
//  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//}
//
//export default function SignUpPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [username, setUsername] = useState('');
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
//  // 🔍 Verifica se username ou email já estão em uso
//  async function checkUserAvailability() {
//    const res = await fetch('/api/check-user', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ email, username }),
//    });
//    const data = await res.json();
//    if (data.exists) {
//      setError(dict.userExists || 'Nome de usuário ou e-mail já estão em uso');
//      setLoading(false);
//      return false;
//    }
//    return true;
//  }
//
//  // 🚀 Envia dados para o backend e redireciona para confirmação
//  async function handleSignup() {
//    setError('');
//    setSuccess(false);
//    setLoading(true);
//
//    // ⚠️ Validações básicas
//    if (!email || !username) {
//      setError(dict.fillFields || 'Preencha todos os campos');
//      setLoading(false);
//      return;
//    }
//    if (username.trim().length < 3) {
//      setError(dict.usernameTooShort || 'Nome de usuário muito curto');
//      setLoading(false);
//      return;
//    }
//    if (!isValidEmail(email)) {
//      setError(dict.invalidEmail || 'E-mail inválido');
//      setLoading(false);
//      return;
//    }
//
//    // ✅ Verifica disponibilidade antes de enviar
//    const available = await checkUserAvailability();
//    if (!available) return;
//
//    try {
//      const res = await fetch('/api/verify-code/signup', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      if (res.ok) {
//        const data = await res.json();
//        setSuccess(true);
//
//        // 🧠 Armazena dados temporários e libera acesso à página de confirmação
//        localStorage.setItem('signupEmail', email);
//        localStorage.setItem('signupUsername', username);
//        localStorage.setItem('canAccessConfirm', 'true');
//
//        // ⏱️ Inicia o timer de reenvio com chave única
//        localStorage.setItem(`resendStartedAt:signup:${email}:${username}`, Date.now().toString());
//
//        // 🚀 Redireciona para confirmação
//        router.push(`/${lang}/signup/confirm?email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}`);
//      } else {
//        const data = await res.json();
//        setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//      }
//    } catch (err) {
//      console.error('Signup error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setLoading(false);
//    }
//  }
//    return (
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6 signin-container">
//        <h1 className="text-2xl font-bold text-center">{dict.title}</h1>
//
//        {/* Campo: Nome de usuário */}
//        <label htmlFor="username" className="block text-sm text-gray-300">{dict.usernameLabel}</label>
//        <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//          <input
//            className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//            type="text"
//            id="_R_minpfiualivb_-form-item"
//            name="name"
//            value={username}
//            onChange={e => setUsername(e.target.value)}
//            placeholder="Digite um nome de usuário"
//            autoComplete="off"
//            aria-describedby="_R_minpfiualivb_-form-item-description"
//            aria-invalid="false"
//            data-slot="form-control"
//          />
//        </div>
//
//        {/* Campo: E-mail */}
//        <label htmlFor="email" className="block text-sm text-gray-300">{dict.emailLabel}</label>
//        <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//          <input
//            className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//            type="email"
//            id="_r_6_-form-item"
//            name="email"
//            value={email}
//            onChange={e => setEmail(e.target.value)}
//            placeholder="Digite o seu e-mail"
//            autoComplete="off"
//            aria-describedby="_r_6_-form-item-description"
//            aria-invalid="false"
//            data-slot="form-control"
//          />
//        </div>
//
//        {/* Feedback visual */}
//        {success && (
//          <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//            <span>✔</span> {dict.success}
//          </div>
//        )}
//        {error && (
//          <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//            <span>⚠</span> {error}
//          </div>
//        )}
//
//        {/* Botão com spinner */}
//        <div className="space-y-2">
//          <button
//            type="submit"
//            onClick={handleSignup}
//            disabled={loading}
//            aria-disabled={loading}
//            role="button"
//            aria-label="Enviar código de verificação"
//            className={`group/button relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-white transition-all select-none
//              ${loading ? 'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-gray-600' : 'hover:cursor-pointer bg-blue-700 hover:bg-blue-800'}
//              focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//          >
//            {loading && (
//              <span className="absolute flex size-full items-center justify-center bg-inherit">
//                <span className="size-5 animate-spin rounded-full border-2 border-gray-400 border-l-white"></span>
//              </span>
//            )}
//            <span className={loading ? 'invisible' : 'visible'}>
//              {dict.signupButton || 'Inscrever-se com e-mail'}
//            </span>
//          </button>
//        </div>
//
//        {/* Termos e política */}
//        <div className="text-center text-xs text-gray-400">
//          {dict.agreeText}{' '}
//          <Link href={`/${lang}/privacy`} className="underline text-gray-300 hover:text-white">
//            {dict.privacy}
//          </Link>{' '}
//          &{' '}
//          <Link href={`/${lang}/terms`} className="underline text-gray-300 hover:text-white">
//            {dict.terms}
//          </Link>
//        </div>
//
//        {/* Link para login */}
//        <div className="text-center text-sm text-gray-400 mt-4">
//          {dict.hasAccount}{' '}
//          <Link href={`/${lang}/signin`} className="text-green-400 underline hover:text-green-300">
//            {dict.signin}
//          </Link>
//        </div>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { useState, useEffect } from 'react';
//import { usePathname, useRouter } from 'next/navigation';
//import Link from 'next/link';
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
//// 📧 Valida formato de e-mail
//function isValidEmail(email) {
//  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//}
//
//export default function SignUpPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [username, setUsername] = useState('');
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
//  // 🔍 Verifica se username ou email já estão em uso
//  async function checkUserAvailability() {
//    const res = await fetch('/api/check-user', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ email, username }),
//    });
//    const data = await res.json();
//    if (data.exists) {
//      setError(dict.userExists || 'Nome de usuário ou e-mail já estão em uso');
//      setLoading(false);
//      return false;
//    }
//    return true;
//  }
//
//  // 🚀 Envia dados para o backend e redireciona para confirmação
//  async function handleSignup() {
//    setError('');
//    setSuccess(false);
//    setLoading(true);
//
//    // ⚠️ Validações básicas
//    if (!email || !username) {
//      setError(dict.fillFields || 'Preencha todos os campos');
//      setLoading(false);
//      return;
//    }
//    if (username.trim().length < 3) {
//      setError(dict.usernameTooShort || 'Nome de usuário muito curto');
//      setLoading(false);
//      return;
//    }
//    if (!isValidEmail(email)) {
//      setError(dict.invalidEmail || 'E-mail inválido');
//      setLoading(false);
//      return;
//    }
//
//    // ✅ Verifica disponibilidade antes de enviar
//    const available = await checkUserAvailability();
//    if (!available) return;
//
//    try {
//      const res = await fetch('/api/verify-code/signup', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      if (res.ok) {
//        const data = await res.json();
//        setSuccess(true);
//
//        // 🧠 Armazena dados temporários e libera acesso à página de confirmação
//        localStorage.setItem('signupEmail', email);
//        localStorage.setItem('signupUsername', username);
//        localStorage.setItem('canAccessConfirm', 'true'); // ✅ ESSENCIAL
//
//        // ⏱️ Inicia o timer de reenvio com chave única
//        localStorage.setItem(`resendStartedAt:signup:${email}:${username}`, Date.now().toString());
//
//        // 🚀 Redireciona para confirmação
//        router.push(`/${lang}/signup/confirm?email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}`);
//      } else {
//        const data = await res.json();
//        setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//      }
//    } catch (err) {
//      console.error('Signup error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  return (
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6 signin-container">
//        <h1 className="text-2xl font-bold text-center">{dict.title}</h1>
//
//        <label htmlFor="username" className="block text-sm text-gray-300">{dict.usernameLabel}</label>
//        <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//          <input
//            className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//            type="text"
//            id="_R_minpfiualivb_-form-item"
//            name="name"
//            value={username}
//            onChange={e => setUsername(e.target.value)}
//            placeholder="Digite um nome de usuário"
//            autoComplete="off"
//            aria-describedby="_R_minpfiualivb_-form-item-description"
//            aria-invalid="false"
//            data-slot="form-control"
//          />
//        </div>
//
//        <label htmlFor="email" className="block text-sm text-gray-300">{dict.emailLabel}</label>
//        <div className="group relative flex max-h-10 min-h-10 flex-1 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text">
//          <input
//            className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//            type="email"
//            id="_r_6_-form-item"
//            name="email"
//            value={email}
//            onChange={e => setEmail(e.target.value)}
//            placeholder="Digite o seu e-mail"
//            autoComplete="off"
//            aria-describedby="_r_6_-form-item-description"
//            aria-invalid="false"
//            data-slot="form-control"
//          />
//        </div>
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
//        <div className="space-y-2">
//          <button
//            type="submit"
//            onClick={handleSignup}
//            disabled={loading}
//            aria-disabled={loading}
//            role="button"
//            aria-label="Enviar código de verificação"
//            className={`group/button relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-white transition-all select-none
//      ${loading ? 'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-gray-600' : 'hover:cursor-pointer bg-blue-700 hover:bg-blue-800'}
//      focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//          >
//            {loading && (
//              <span className="absolute flex size-full items-center justify-center bg-inherit">
//                <span className="size-5 animate-spin rounded-full border-2 border-gray-400 border-l-white"></span>
//              </span>
//            )}
//            <span className={loading ? 'invisible' : 'visible'}>
//              {dict.signupButton || 'Inscrever-se com e-mail'}
//            </span>
//          </button>
//        </div>
//
//        <div className="text-center text-xs text-gray-400">
//          {dict.agreeText}{' '}
//          <Link href={`/${lang}/privacy`} className="underline text-gray-300 hover:text-white">
//            {dict.privacy}
//          </Link>{' '}
//          &{' '}
//          <Link href={`/${lang}/terms`} className="underline text-gray-300 hover:text-white">
//            {dict.terms}
//          </Link>
//        </div>
//
//        <div className="text-center text-sm text-gray-400 mt-4">
//          {dict.hasAccount}{' '}
//          <Link href={`/${lang}/signin`} className="text-green-400 underline hover:text-green-300">
//            {dict.signin}
//          </Link>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signup/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { usePathname, useRouter } from 'next/navigation';
//import Link from 'next/link';
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
//// 📧 Valida formato de e-mail
//function isValidEmail(email) {
//  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//}
//
//export default function SignUpPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [username, setUsername] = useState('');
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
//  // 🔍 Verifica se username ou email já estão em uso
//  async function checkUserAvailability() {
//    const res = await fetch('/api/check-user', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ email, username }),
//    });
//    const data = await res.json();
//    if (data.exists) {
//      setError(dict.userExists || 'Nome de usuário ou e-mail já estão em uso');
//      setLoading(false);
//      return false;
//    }
//    return true;
//  }
//
//  // 🚀 Envia dados para o backend e redireciona para confirmação
//  async function handleSignup() {
//    setError('');
//    setSuccess(false);
//    setLoading(true);
//
//    // ⚠️ Validações básicas
//    if (!email || !username) {
//      setError(dict.fillFields || 'Preencha todos os campos');
//      setLoading(false);
//      return;
//    }
//    if (username.trim().length < 3) {
//      setError(dict.usernameTooShort || 'Nome de usuário muito curto');
//      setLoading(false);
//      return;
//    }
//    if (!isValidEmail(email)) {
//      setError(dict.invalidEmail || 'E-mail inválido');
//      setLoading(false);
//      return;
//    }
//
//    // ✅ Verifica disponibilidade antes de enviar
//    const available = await checkUserAvailability();
//    if (!available) return;
//
//    try {
//      const res = await fetch('/api/verify-code/signup', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      if (res.ok) {
//        const data = await res.json();
//        setSuccess(true);
//
//        // 🧠 Armazena dados temporários e libera acesso à página de confirmação
//        localStorage.setItem('signupEmail', email);
//        localStorage.setItem('signupUsername', username);
//        localStorage.setItem('canAccessConfirm', 'true'); // ✅ ESSENCIAL
//
//        // ⏱️ Inicia o timer de reenvio com chave única
//        localStorage.setItem(`resendStartedAt:signup:${email}:${username}`, Date.now().toString());
//
//        // 🚀 Redireciona para confirmação
//        router.push(`/${lang}/signup/confirm?email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}`);
//      } else {
//        const data = await res.json();
//        setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//      }
//    } catch (err) {
//      console.error('Signup error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  return (
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6 signin-container">
//        <h1 className="text-2xl font-bold text-center">{dict.title}</h1>
//
//        <label htmlFor="username" className="block text-sm text-gray-300">{dict.usernameLabel}</label>
//        <input
//          id="username"
//          aria-label="Nome de usuário"
//          type="text"
//          value={username}
//          onChange={e => setUsername(e.target.value)}
//          placeholder={dict.usernamePlaceholder}
//          className="w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400"
//        />
//
//        <label htmlFor="email" className="block text-sm text-gray-300">{dict.emailLabel}</label>
//        <input
//          id="email"
//          aria-label="E-mail"
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
//          onClick={handleSignup}
//          disabled={loading}
//          aria-label="Enviar código de verificação"
//          className={`w-full py-2 rounded text-white font-semibold ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
//            }`}
//        >
//          {loading ? dict.sending || 'Enviando...' : dict.signupButton}
//        </button>
//
//        <div className="text-center text-xs text-gray-400">
//          {dict.agreeText}{' '}
//          <Link href={`/${lang}/privacy`} className="underline text-gray-300 hover:text-white">
//            {dict.privacy}
//          </Link>{' '}
//          &{' '}
//          <Link href={`/${lang}/terms`} className="underline text-gray-300 hover:text-white">
//            {dict.terms}
//          </Link>
//        </div>
//
//        <div className="text-center text-sm text-gray-400 mt-4">
//          {dict.hasAccount}{' '}
//          <Link href={`/${lang}/signin`} className="text-green-400 underline hover:text-green-300">
//            {dict.signin}
//          </Link>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signup/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { usePathname, useRouter } from 'next/navigation';
//import Link from 'next/link';
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
//// 📧 Valida formato de e-mail
//function isValidEmail(email) {
//  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//}
//
//export default function SignUpPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [username, setUsername] = useState('');
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
//  // 🔍 Verifica se username ou email já estão em uso
//  async function checkUserAvailability() {
//    const res = await fetch('/api/check-user', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ email, username }),
//    });
//    const data = await res.json();
//    if (data.exists) {
//      setError(dict.userExists || 'Nome de usuário ou e-mail já estão em uso');
//      setLoading(false);
//      return false;
//    }
//    return true;
//  }
//
//  // 🚀 Envia dados para o backend e redireciona para confirmação
//  async function handleSignup() {
//    setError('');
//    setSuccess(false);
//    setLoading(true);
//
//    // ⚠️ Validações básicas
//    if (!email || !username) {
//      setError(dict.fillFields || 'Preencha todos os campos');
//      setLoading(false);
//      return;
//    }
//    if (username.trim().length < 3) {
//      setError(dict.usernameTooShort || 'Nome de usuário muito curto');
//      setLoading(false);
//      return;
//    }
//    if (!isValidEmail(email)) {
//      setError(dict.invalidEmail || 'E-mail inválido');
//      setLoading(false);
//      return;
//    }
//
//    // ✅ Verifica disponibilidade antes de enviar
//    const available = await checkUserAvailability();
//    if (!available) return;
//
//    try {
//      const res = await fetch('/api/verify-code/signup', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      if (res.ok) {
//        const data = await res.json();
//        setSuccess(true);
//
//        // 🧠 Armazena dados temporários e libera acesso à página de confirmação
//        localStorage.setItem('signupEmail', email);
//        localStorage.setItem('signupUsername', username);
//        localStorage.setItem('canAccessConfirm', 'true'); // ✅ ESSENCIAL
//
//        // ⏱️ Inicia o timer de reenvio com chave única
//        localStorage.setItem(`resendStartedAt:signup:${email}:${username}`, Date.now().toString());
//
//        // 🚀 Redireciona para confirmação
//        router.push(`/${lang}/signup/confirm?email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}`);
//      } else {
//        const data = await res.json();
//        setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//      }
//    } catch (err) {
//      console.error('Signup error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  return (
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6 signin-container">
//        <h1 className="text-2xl font-bold text-center">{dict.title}</h1>
//
//        <label htmlFor="username" className="block text-sm text-gray-300">{dict.usernameLabel}</label>
//        <input
//          id="username"
//          aria-label="Nome de usuário"
//          type="text"
//          value={username}
//          onChange={e => setUsername(e.target.value)}
//          placeholder={dict.usernamePlaceholder}
//          className="w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400"
//        />
//
//        <label htmlFor="email" className="block text-sm text-gray-300">{dict.emailLabel}</label>
//        <input
//          id="email"
//          aria-label="E-mail"
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
//          onClick={handleSignup}
//          disabled={loading}
//          aria-label="Enviar código de verificação"
//          className={`w-full py-2 rounded text-white font-semibold ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
//            }`}
//        >
//          {loading ? dict.sending || 'Enviando...' : dict.signupButton}
//        </button>
//
//        <div className="text-center text-xs text-gray-400">
//          {dict.agreeText}{' '}
//          <Link href={`/${lang}/privacy`} className="underline text-gray-300 hover:text-white">
//            {dict.privacy}
//          </Link>{' '}
//          &{' '}
//          <Link href={`/${lang}/terms`} className="underline text-gray-300 hover:text-white">
//            {dict.terms}
//          </Link>
//        </div>
//
//        <div className="text-center text-sm text-gray-400 mt-4">
//          {dict.hasAccount}{' '}
//          <Link href={`/${lang}/signin`} className="text-green-400 underline hover:text-green-300">
//            {dict.signin}
//          </Link>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signup/page.jsx

//'use client';
//
//import { useState } from 'react';
//import { usePathname, useRouter } from 'next/navigation';
//import Link from 'next/link';
//import { messages } from './messages';
//import '../../styles/globais.css';
//import { commonMessages } from '@/app/i18n/commonMessages';
//import SessionRedirectGuard from '@/components/SessionRedirectGuard'; // 🔐 Proteção centralizada
//
//// 🌐 Detecta idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//// 📧 Valida formato de e-mail
//function isValidEmail(email) {
//  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//}
//
//export default function SignUpPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [error, setError] = useState('');
//  const [loading, setLoading] = useState(false);
//
//  // 🔍 Verifica se username ou email já estão em uso
//  async function checkUserAvailability() {
//    const res = await fetch('/api/check-user', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ email, username }),
//    });
//    const data = await res.json();
//    if (data.exists) {
//      setError(dict.userExists || 'Nome de usuário ou e-mail já estão em uso');
//      setLoading(false);
//      return false;
//    }
//    return true;
//  }
//
//  // 🚀 Envia dados para o backend e redireciona para confirmação
//  async function handleSignup() {
//    setError('');
//    setSuccess(false);
//    setLoading(true);
//
//    if (!email || !username) {
//      setError(dict.fillFields || 'Preencha todos os campos');
//      setLoading(false);
//      return;
//    }
//    if (username.trim().length < 3) {
//      setError(dict.usernameTooShort || 'Nome de usuário muito curto');
//      setLoading(false);
//      return;
//    }
//    if (!isValidEmail(email)) {
//      setError(dict.invalidEmail || 'E-mail inválido');
//      setLoading(false);
//      return;
//    }
//
//    const available = await checkUserAvailability();
//    if (!available) return;
//
//    try {
//      const res = await fetch('/api/send-code', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      if (res.ok) {
//        const data = await res.json();
//        setSuccess(true);
//
//        localStorage.setItem('signupEmail', email);
//        localStorage.setItem('signupUsername', username);
//        localStorage.setItem('canAccessConfirm', 'true');
//        localStorage.setItem(`resendStartedAt:signup:${email}:${username}`, Date.now().toString());
//
//        router.push(`/${lang}/signup/confirm?email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}`);
//      } else {
//        const data = await res.json();
//        setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//      }
//    } catch (err) {
//      console.error('Signup error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  return (
//    <>
//      <SessionRedirectGuard />
//      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//        <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6 signin-container">
//          <h1 className="text-2xl font-bold text-center">{dict.title}</h1>
//
//          <label htmlFor="username" className="block text-sm text-gray-300">{dict.usernameLabel}</label>
//          <input
//            id="username"
//            aria-label="Nome de usuário"
//            type="text"
//            value={username}
//            onChange={e => setUsername(e.target.value)}
//            placeholder={dict.usernamePlaceholder}
//            className="w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400"
//          />
//
//          <label htmlFor="email" className="block text-sm text-gray-300">{dict.emailLabel}</label>
//          <input
//            id="email"
//            aria-label="E-mail"
//            type="email"
//            value={email}
//            onChange={e => setEmail(e.target.value)}
//            placeholder={dict.emailPlaceholder}
//            className="w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400"
//          />
//
//          {success && (
//            <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//              <span>✔</span> {dict.success}
//            </div>
//          )}
//
//          {error && (
//            <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//              <span>⚠</span> {error}
//            </div>
//          )}
//
//          <button
//            onClick={handleSignup}
//            disabled={loading}
//            aria-label="Enviar código de verificação"
//            className={`w-full py-2 rounded text-white font-semibold ${
//              loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
//            }`}
//          >
//            {loading ? dict.sending || 'Enviando...' : dict.signupButton}
//          </button>
//
//          <div className="text-center text-xs text-gray-400">
//            {dict.agreeText}{' '}
//            <Link href={`/${lang}/privacy`} className="underline text-gray-300 hover:text-white">
//              {dict.privacy}
//            </Link>{' '}
//            &{' '}
//            <Link href={`/${lang}/terms`} className="underline text-gray-300 hover:text-white">
//              {dict.terms}
//            </Link>
//          </div>
//
//          <div className="text-center text-sm text-gray-400 mt-4">
//            {dict.hasAccount}{' '}
//            <Link href={`/${lang}/signin`} className="text-green-400 underline hover:text-green-300">
//              {dict.signin}
//            </Link>
//          </div>
//        </div>
//      </main>
//    </>
//  );
//}

//'use client';
//
//import { useState, useEffect } from 'react';
//import { usePathname, useRouter } from 'next/navigation';
//import Link from 'next/link';
//import { messages } from './messages';
//import '../../styles/globais.css';
//import { commonMessages } from '@/app/i18n/commonMessages';
//
//// 🌐 Detecta idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//// 📧 Valida formato de e-mail
//function isValidEmail(email) {
//  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//}
//
//export default function SignUpPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const [username, setUsername] = useState('');
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
//  // 🔍 Verifica se username ou email já estão em uso
//  async function checkUserAvailability() {
//    const res = await fetch('/api/check-user', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ email, username }),
//    });
//    const data = await res.json();
//    if (data.exists) {
//      setError(dict.userExists || 'Nome de usuário ou e-mail já estão em uso');
//      setLoading(false);
//      return false;
//    }
//    return true;
//  }
//
//  // 🚀 Envia dados para o backend e redireciona para confirmação
//  async function handleSignup() {
//    setError('');
//    setSuccess(false);
//    setLoading(true);
//
//    // ⚠️ Validações básicas
//    if (!email || !username) {
//      setError(dict.fillFields || 'Preencha todos os campos');
//      setLoading(false);
//      return;
//    }
//    if (username.trim().length < 3) {
//      setError(dict.usernameTooShort || 'Nome de usuário muito curto');
//      setLoading(false);
//      return;
//    }
//    if (!isValidEmail(email)) {
//      setError(dict.invalidEmail || 'E-mail inválido');
//      setLoading(false);
//      return;
//    }
//
//    // ✅ Verifica disponibilidade antes de enviar
//    const available = await checkUserAvailability();
//    if (!available) return;
//
//    try {
//      const res = await fetch('/api/send-code', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      if (res.ok) {
//        const data = await res.json();
//        setSuccess(true);
//
//        // 🧠 Armazena dados temporários e libera acesso à página de confirmação
//        localStorage.setItem('signupEmail', email);
//        localStorage.setItem('signupUsername', username);
//        localStorage.setItem('canAccessConfirm', 'true'); // ✅ ESSENCIAL
//
//        // ⏱️ Inicia o timer de reenvio com chave única
//        localStorage.setItem(`resendStartedAt:signup:${email}:${username}`, Date.now().toString());
//
//        // 🚀 Redireciona para confirmação
//        router.push(`/${lang}/signup/confirm?email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}`);
//      } else {
//        const data = await res.json();
//        setError(data?.error || dict.errorSending || 'Erro ao enviar código');
//      }
//    } catch (err) {
//      console.error('Signup error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  return (
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6 signin-container">
//        <h1 className="text-2xl font-bold text-center">{dict.title}</h1>
//
//        <label htmlFor="username" className="block text-sm text-gray-300">{dict.usernameLabel}</label>
//        <input
//          id="username"
//          aria-label="Nome de usuário"
//          type="text"
//          value={username}
//          onChange={e => setUsername(e.target.value)}
//          placeholder={dict.usernamePlaceholder}
//          className="w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400"
//        />
//
//        <label htmlFor="email" className="block text-sm text-gray-300">{dict.emailLabel}</label>
//        <input
//          id="email"
//          aria-label="E-mail"
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
//          onClick={handleSignup}
//          disabled={loading}
//          aria-label="Enviar código de verificação"
//          className={`w-full py-2 rounded text-white font-semibold ${
//            loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
//          }`}
//        >
//          {loading ? dict.sending || 'Enviando...' : dict.signupButton}
//        </button>
//
//        <div className="text-center text-xs text-gray-400">
//          {dict.agreeText}{' '}
//          <Link href={`/${lang}/privacy`} className="underline text-gray-300 hover:text-white">
//            {dict.privacy}
//          </Link>{' '}
//          &{' '}
//          <Link href={`/${lang}/terms`} className="underline text-gray-300 hover:text-white">
//            {dict.terms}
//          </Link>
//        </div>
//
//        <div className="text-center text-sm text-gray-400 mt-4">
//          {dict.hasAccount}{' '}
//          <Link href={`/${lang}/signin`} className="text-green-400 underline hover:text-green-300">
//            {dict.signin}
//          </Link>
//        </div>
//      </div>
//    </main>
//  );
//}
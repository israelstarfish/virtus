//frontend/src/app/[lang]/signup/confirm/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { messages } from '../../messages/signup';
import { commonMessages } from '@/app/i18n/commonMessages';
import OTPInput from '@/components/OTPInput';
import '../../../styles/virtus.css';

function getLang(pathname) {
  const segment = pathname.split('/')[1];
  const supported = ['pt-br', 'en', 'es', 'zh'];
  return supported.includes(segment) ? segment : 'en';
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (!match) return null;
  return decodeURIComponent(match[2]);
}

export default function ConfirmCodePage() {
  const pathname = usePathname();
  const lang = getLang(pathname);
  const dict = { ...commonMessages[lang], ...messages[lang] };
  const router = useRouter();
  const searchParams = useSearchParams();
  const signupCookie = getCookie('virtuscloud.signup');
  let email = '';
  let username = '';

  try {
    const parsed = JSON.parse(signupCookie);
    email = parsed.email || '';
    username = parsed.username || '';
  } catch { }

  //const email = searchParams.get('email') || '';
  //const username = searchParams.get('username') || '';
  const timerKey = `resendStartedAt:signup:${email}:${username}`;
  const CODE_LENGTH = 8;

  const [startedAt, setStartedAt] = useState(null);
  const [error, setError] = useState('');
  const [otpError, setOtpError] = useState(false); // 🚨 Controle visual do erro no input
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [resendTimer, setResendTimer] = useState(null);
  const [canResend, setCanResend] = useState(true);

  // 🔐 Verifica se pode acessar a página
  useEffect(() => {
    const allowed = getCookie('virtuscloud.canAccessConfirm');
    //const allowed = localStorage.getItem('canAccessConfirm');
    if (allowed === 'true') {
      setIsReady(true);
    } else {
      setAccessDenied(true);
      setTimeout(() => {
        router.replace('/');
      }, 4000);
    }
  }, [router]);

  // ⏱️ Inicia ou continua o timer de reenvio
  useEffect(() => {
    const raw = localStorage.getItem(timerKey);
    const parsed = parseInt(raw);

    if (!raw || isNaN(parsed)) {
      const now = Date.now();
      localStorage.setItem(timerKey, now.toString());
      setStartedAt(now);
      setCanResend(false);
      setResendTimer(120);
    } else {
      setStartedAt(parsed);
    }
  }, [timerKey]);

  useEffect(() => {
    if (!startedAt) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startedAt) / 1000);
      const remaining = Math.max(120 - elapsed, 0);

      setResendTimer(remaining);
      setCanResend(remaining === 0);

      if (remaining === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt]);

  // ✅ Envia código para verificação
  async function handleConfirm(fullCode) {
    setError('');
    setOtpError(false); // 🧼 Limpa erro visual
    setLoading(true);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code: fullCode, username }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.removeItem('canAccessConfirm');
        localStorage.removeItem(timerKey);
        setSuccess(true);

        // 🚀 Redireciona para dashboard
        setTimeout(() => {
          router.push(`/${lang}/dashboard`);
        }, 1000);
      } else {
        setError(data?.error || dict.invalidCode || 'Código inválido');
        setOtpError(true); // 🚨 Ativa erro visual
      }
    } catch (err) {
      console.error('Confirm error:', err);
      setError(dict.networkError || 'Erro de rede ou servidor');
      setOtpError(true); // 🚨 Ativa erro visual
    } finally {
      setLoading(false);
    }
  }

  // 🔁 Reenvia código
  async function handleResendCode() {
    setResending(true);
    setError('');
    setOtpError(false); // 🧼 Limpa erro visual

    const now = Date.now();
    localStorage.setItem(timerKey, now.toString());
    setStartedAt(now);
    setCanResend(false);
    setResendTimer(120);

    try {
      const res = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
        setOtpError(true); // 🚨 Ativa erro visual
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError(dict.networkError || 'Erro de rede ou servidor');
      setOtpError(true); // 🚨 Ativa erro visual
    } finally {
      setResending(false);
    }
  }

  // 🛑 Bloqueio de acesso
  if (!isReady && !accessDenied) return null;

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="text-5xl font-bold text-blue-400">404</h1>
          <p className="text-lg font-semibold">Ooops! Página não encontrada!</p>
          <p className="text-sm text-gray-400">
            A página que você está tentando buscar parece que não existe.
          </p>
          <p className="text-sm text-gray-500 mt-4">Redirecionando para a página inicial...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-background flex items-center justify-center">
      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
        <div className="relative flex flex-col items-center justify-center">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            {/* Botão de voltar */}
            <button
              className="absolute top-0 cursor-pointer sm:left-10"
              onClick={() => router.back()} //onClick={() => router.push(`/${lang}/signup`)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
              </svg>
            </button>
            {/* Logo ou imagem */}
            <img src="/logo.png" alt="Virtus Cloud" className="mb-4 block w-28" />
          </div>

          <div className="space-y-4">
            <div className="flex max-w-96 flex-col items-center gap-2 text-center">
              <h1 className="font-bold text-2xl">{dict.confirmTitle}</h1>
              <span className="text-secondary text-sm">{dict.confirmDescription}</span>
            </div>

            <form>
              <div className="mx-auto flex flex-col gap-4">
                <div className="mx-auto w-fit">
                  <OTPInput
                    length={CODE_LENGTH}
                    onComplete={handleConfirm}
                    error={otpError}
                  />
                </div>
              </div>
            </form>

            {/* Mensagens */}
            {success && (
              <div className="text-green-400 font-medium text-sm flex items-center justify-center gap-1">
                <span>✔</span> {dict.success}
              </div>
            )}
            {error && (
              <div className="text-red-400 font-medium text-sm flex items-center justify-center gap-1">
                <span>⚠</span> {error}
              </div>
            )}

            {/* Ações secundárias */}
            <div className="flex flex-col items-center justify-center space-y-3 mt-6">
              {/* Ir para caixa de entrada */}
              <a
                className="flex w-full items-center justify-center gap-2 text-link text-sm"
                target="_blank"
                href={`https://${email.split('@')[1]}`}
              >
                Ir para caixa de entrada
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                </svg>
              </a>

              {/* Trocar de conta */}
              <div className="space-y-1.5 text-center">
                <p className="text-nowrap text-secondary text-sm max-sm:justify-center">
                  Não é {email}?{' '}
                  <a className="text-link" href={`/${lang}/signup?state=reset`}>
                    Trocar de conta
                  </a>
                </p>

                {/* Reenviar código */}
                <button
                  onClick={handleResendCode}
                  disabled={!canResend || resending}
                  className={`flex w-full cursor-pointer justify-center text-link text-sm ${!canResend || resending ? 'opacity-50 cursor-not-allowed' : 'hover:underline'
                    }`}
                >
                  {resending
                    ? dict.sending || 'Reenviando...'
                    : resendTimer !== null
                      ? !canResend
                        ? `Aguarde ${formatTime(resendTimer)} para reenviar`
                        : dict.resendCode || 'Não recebi o código de acesso'
                      : dict.resendCode || 'Não recebi o código de acesso'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

//frontend/src/app/[lang]/signup/confirm/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, useSearchParams, usePathname } from 'next/navigation';
//import { messages } from '../messages';
//import { commonMessages } from '@/app/i18n/commonMessages';
//import OTPInput from '@/components/OTPInput';
//import '../../../styles/virtus.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function formatTime(seconds) {
//  const m = Math.floor(seconds / 60);
//  const s = seconds % 60;
//  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//}
//
//function getCookie(name) {
//  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//  if (!match) return null;
//  return decodeURIComponent(match[2]);
//}
//
//export default function ConfirmCodePage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//  const signupCookie = getCookie('virtuscloud.signup');
//  let email = '';
//  let username = '';
//
//  try {
//    const parsed = JSON.parse(signupCookie);
//    email = parsed.email || '';
//    username = parsed.username || '';
//  } catch { }
//
//  //const email = searchParams.get('email') || '';
//  //const username = searchParams.get('username') || '';
//  const timerKey = `resendStartedAt:signup:${email}:${username}`;
//  const CODE_LENGTH = 8;
//
//  const [startedAt, setStartedAt] = useState(null);
//  const [error, setError] = useState('');
//  const [otpError, setOtpError] = useState(false); // 🚨 Controle visual do erro no input
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(true);
//
//  // 🔐 Verifica se pode acessar a página
//  useEffect(() => {
//    const allowed = getCookie('virtuscloud.canAccessConfirm');
//    //const allowed = localStorage.getItem('canAccessConfirm');
//    if (allowed === 'true') {
//      setIsReady(true);
//    } else {
//      setAccessDenied(true);
//      setTimeout(() => {
//        router.replace('/');
//      }, 4000);
//    }
//  }, [router]);
//
//  // ⏱️ Inicia ou continua o timer de reenvio
//  useEffect(() => {
//    const raw = localStorage.getItem(timerKey);
//    const parsed = parseInt(raw);
//
//    if (!raw || isNaN(parsed)) {
//      const now = Date.now();
//      localStorage.setItem(timerKey, now.toString());
//      setStartedAt(now);
//      setCanResend(false);
//      setResendTimer(120);
//    } else {
//      setStartedAt(parsed);
//    }
//  }, [timerKey]);
//
//  useEffect(() => {
//    if (!startedAt) return;
//
//    const timer = setInterval(() => {
//      const now = Date.now();
//      const elapsed = Math.floor((now - startedAt) / 1000);
//      const remaining = Math.max(120 - elapsed, 0);
//
//      setResendTimer(remaining);
//      setCanResend(remaining === 0);
//
//      if (remaining === 0) {
//        clearInterval(timer);
//      }
//    }, 1000);
//
//    return () => clearInterval(timer);
//  }, [startedAt]);
//
//  // ✅ Envia código para verificação
//  async function handleConfirm(fullCode) {
//    setError('');
//    setOtpError(false); // 🧼 Limpa erro visual
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode, username }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        localStorage.setItem('user', JSON.stringify(data.user));
//        localStorage.removeItem('canAccessConfirm');
//        localStorage.removeItem(timerKey);
//        setSuccess(true);
//
//        // 🚀 Redireciona para dashboard
//        setTimeout(() => {
//          router.push(`/${lang}/dashboard`);
//        }, 1000);
//      } else {
//        setError(data?.error || dict.invalidCode || 'Código inválido');
//        setOtpError(true); // 🚨 Ativa erro visual
//      }
//    } catch (err) {
//      console.error('Confirm error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//      setOtpError(true); // 🚨 Ativa erro visual
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  // 🔁 Reenvia código
//  async function handleResendCode() {
//    setResending(true);
//    setError('');
//    setOtpError(false); // 🧼 Limpa erro visual
//
//    const now = Date.now();
//    localStorage.setItem(timerKey, now.toString());
//    setStartedAt(now);
//    setCanResend(false);
//    setResendTimer(120);
//
//    try {
//      const res = await fetch('/api/send-code', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//        setOtpError(true); // 🚨 Ativa erro visual
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//      setOtpError(true); // 🚨 Ativa erro visual
//    } finally {
//      setResending(false);
//    }
//  }
//
//  // 🛑 Bloqueio de acesso
//  if (!isReady && !accessDenied) return null;
//
//  if (accessDenied) {
//    return (
//      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//        <div className="w-full max-w-sm text-center space-y-4">
//          <h1 className="text-5xl font-bold text-blue-400">404</h1>
//          <p className="text-lg font-semibold">Ooops! Página não encontrada!</p>
//          <p className="text-sm text-gray-400">
//            A página que você está tentando buscar parece que não existe.
//          </p>
//          <p className="text-sm text-gray-500 mt-4">Redirecionando para a página inicial...</p>
//        </div>
//      </main>
//    );
//  }
//
//  return (
//    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//        <div className="relative flex flex-col items-center justify-center">
//          <div className="mb-6 flex flex-col items-center gap-2 text-center">
//            {/* Botão de voltar */}
//            <button
//              className="absolute top-0 cursor-pointer sm:left-10"
//              onClick={() => router.back()} //onClick={() => router.push(`/${lang}/signup`)}
//            >
//              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
//              </svg>
//            </button>
//            {/* Logo ou imagem */}
//            <img src="/logo.png" alt="Virtus Cloud" className="mb-4 block w-28" />
//          </div>
//
//          <div className="space-y-4">
//            <div className="flex max-w-96 flex-col items-center gap-2 text-center">
//              <h1 className="font-bold text-2xl">{dict.confirmTitle}</h1>
//              <span className="text-secondary text-sm">{dict.confirmDescription}</span>
//            </div>
//
//            <form>
//              <div className="mx-auto flex flex-col gap-4">
//                <div className="mx-auto w-fit">
//                  <OTPInput
//                    length={CODE_LENGTH}
//                    onComplete={handleConfirm}
//                    error={otpError}
//                  />
//                </div>
//              </div>
//            </form>
//
//            {/* Mensagens */}
//            {success && (
//              <div className="text-green-400 font-medium text-sm flex items-center justify-center gap-1">
//                <span>✔</span> {dict.success}
//              </div>
//            )}
//            {error && (
//              <div className="text-red-400 font-medium text-sm flex items-center justify-center gap-1">
//                <span>⚠</span> {error}
//              </div>
//            )}
//
//            {/* Ações secundárias */}
//            <div className="flex flex-col items-center justify-center space-y-3 mt-6">
//              {/* Ir para caixa de entrada */}
//              <a
//                className="flex w-full items-center justify-center gap-2 text-link text-sm"
//                target="_blank"
//                href={`https://${email.split('@')[1]}`}
//              >
//                Ir para caixa de entrada
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
//                </svg>
//              </a>
//
//              {/* Trocar de conta */}
//              <div className="space-y-1.5 text-center">
//                <p className="text-nowrap text-secondary text-sm max-sm:justify-center">
//                  Não é {email}?{' '}
//                  <a className="text-link" href={`/${lang}/signup?state=reset`}>
//                    Trocar de conta
//                  </a>
//                </p>
//
//                {/* Reenviar código */}
//                <button
//                  onClick={handleResendCode}
//                  disabled={!canResend || resending}
//                  className={`flex w-full cursor-pointer justify-center text-link text-sm ${!canResend || resending ? 'opacity-50 cursor-not-allowed' : 'hover:underline'
//                    }`}
//                >
//                  {resending
//                    ? dict.sending || 'Reenviando...'
//                    : resendTimer !== null
//                      ? !canResend
//                        ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//                        : dict.resendCode || 'Não recebi o código de acesso'
//                      : dict.resendCode || 'Não recebi o código de acesso'}
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signup/confirm/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, useSearchParams, usePathname } from 'next/navigation';
//import { messages } from '../messages';
//import { commonMessages } from '@/app/i18n/commonMessages';
//import OTPInput from '@/components/OTPInput';
//import '../../../styles/virtus.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function formatTime(seconds) {
//  const m = Math.floor(seconds / 60);
//  const s = seconds % 60;
//  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//}
//
//export default function ConfirmCodePage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const username = searchParams.get('username') || '';
//  const timerKey = `resendStartedAt:signup:${email}:${username}`;
//  const CODE_LENGTH = 8;
//
//  const [startedAt, setStartedAt] = useState(null);
//  const [error, setError] = useState('');
//  const [otpError, setOtpError] = useState(false); // 🚨 Controle visual do erro no input
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(true);
//
//  // 🔐 Verifica se pode acessar a página
//  useEffect(() => {
//    const allowed = localStorage.getItem('canAccessConfirm');
//    if (allowed === 'true') {
//      setIsReady(true);
//    } else {
//      setAccessDenied(true);
//      setTimeout(() => {
//        router.replace('/');
//      }, 4000);
//    }
//  }, [router]);
//
//  // ⏱️ Inicia ou continua o timer de reenvio
//  useEffect(() => {
//    const raw = localStorage.getItem(timerKey);
//    const parsed = parseInt(raw);
//
//    if (!raw || isNaN(parsed)) {
//      const now = Date.now();
//      localStorage.setItem(timerKey, now.toString());
//      setStartedAt(now);
//      setCanResend(false);
//      setResendTimer(120);
//    } else {
//      setStartedAt(parsed);
//    }
//  }, [timerKey]);
//
//  useEffect(() => {
//    if (!startedAt) return;
//
//    const timer = setInterval(() => {
//      const now = Date.now();
//      const elapsed = Math.floor((now - startedAt) / 1000);
//      const remaining = Math.max(120 - elapsed, 0);
//
//      setResendTimer(remaining);
//      setCanResend(remaining === 0);
//
//      if (remaining === 0) {
//        clearInterval(timer);
//      }
//    }, 1000);
//
//    return () => clearInterval(timer);
//  }, [startedAt]);
//
//  // ✅ Envia código para verificação
//  async function handleConfirm(fullCode) {
//    setError('');
//    setOtpError(false); // 🧼 Limpa erro visual
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode, username }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        localStorage.setItem('user', JSON.stringify(data.user));
//        localStorage.removeItem('canAccessConfirm');
//        localStorage.removeItem(timerKey);
//        setSuccess(true);
//
//        // 🚀 Redireciona para dashboard
//        setTimeout(() => {
//          router.push(`/${lang}/dashboard`);
//        }, 1000);
//      } else {
//        setError(data?.error || dict.invalidCode || 'Código inválido');
//        setOtpError(true); // 🚨 Ativa erro visual
//      }
//    } catch (err) {
//      console.error('Confirm error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//      setOtpError(true); // 🚨 Ativa erro visual
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  // 🔁 Reenvia código
//  async function handleResendCode() {
//    setResending(true);
//    setError('');
//    setOtpError(false); // 🧼 Limpa erro visual
//
//    const now = Date.now();
//    localStorage.setItem(timerKey, now.toString());
//    setStartedAt(now);
//    setCanResend(false);
//    setResendTimer(120);
//
//    try {
//      const res = await fetch('/api/send-code', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//        setOtpError(true); // 🚨 Ativa erro visual
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//      setOtpError(true); // 🚨 Ativa erro visual
//    } finally {
//      setResending(false);
//    }
//  }
//
//  // 🛑 Bloqueio de acesso
//  if (!isReady && !accessDenied) return null;
//
//  if (accessDenied) {
//    return (
//      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//        <div className="w-full max-w-sm text-center space-y-4">
//          <h1 className="text-5xl font-bold text-blue-400">404</h1>
//          <p className="text-lg font-semibold">Ooops! Página não encontrada!</p>
//          <p className="text-sm text-gray-400">
//            A página que você está tentando buscar parece que não existe.
//          </p>
//          <p className="text-sm text-gray-500 mt-4">Redirecionando para a página inicial...</p>
//        </div>
//      </main>
//    );
//  }
//
//  return (
//    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//        <div className="relative flex flex-col items-center justify-center">
//          <div className="mb-6 flex flex-col items-center gap-2 text-center">
//            {/* Botão de voltar */}
//            <button
//              className="absolute top-0 cursor-pointer sm:left-10"
//              onClick={() => router.back()} //onClick={() => router.push(`/${lang}/signup`)}
//            >
//              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
//              </svg>
//            </button>
//            {/* Logo ou imagem */}
//            <img src="/logo.png" alt="Virtus Cloud" className="mb-4 block w-28" />
//          </div>
//
//          <div className="space-y-4">
//            <div className="flex max-w-96 flex-col items-center gap-2 text-center">
//              <h1 className="font-bold text-2xl">{dict.confirmTitle}</h1>
//              <span className="text-secondary text-sm">{dict.confirmDescription}</span>
//            </div>
//
//            <form>
//              <div className="mx-auto flex flex-col gap-4">
//                <div className="mx-auto w-fit">
//                  <OTPInput
//                    length={CODE_LENGTH}
//                    onComplete={handleConfirm}
//                    error={otpError}
//                  />
//                </div>
//              </div>
//            </form>
//
//            {/* Mensagens */}
//            {success && (
//              <div className="text-green-400 font-medium text-sm flex items-center justify-center gap-1">
//                <span>✔</span> {dict.success}
//              </div>
//            )}
//            {error && (
//              <div className="text-red-400 font-medium text-sm flex items-center justify-center gap-1">
//                <span>⚠</span> {error}
//              </div>
//            )}
//
//            {/* Ações secundárias */}
//            <div className="flex flex-col items-center justify-center space-y-3 mt-6">
//              {/* Ir para caixa de entrada */}
//              <a
//                className="flex w-full items-center justify-center gap-2 text-link text-sm"
//                target="_blank"
//                href={`https://${email.split('@')[1]}`}
//              >
//                Ir para caixa de entrada
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
//                </svg>
//              </a>
//
//              {/* Trocar de conta */}
//              <div className="space-y-1.5 text-center">
//                <p className="text-nowrap text-secondary text-sm max-sm:justify-center">
//                  Não é {email}?{' '}
//                  <a className="text-link" href={`/${lang}/signup?state=reset`}>
//                    Trocar de conta
//                  </a>
//                </p>
//
//                {/* Reenviar código */}
//                <button
//                  onClick={handleResendCode}
//                  disabled={!canResend || resending}
//                  className={`flex w-full cursor-pointer justify-center text-link text-sm ${!canResend || resending ? 'opacity-50 cursor-not-allowed' : 'hover:underline'
//                    }`}
//                >
//                  {resending
//                    ? dict.sending || 'Reenviando...'
//                    : resendTimer !== null
//                      ? !canResend
//                        ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//                        : dict.resendCode || 'Não recebi o código de acesso'
//                      : dict.resendCode || 'Não recebi o código de acesso'}
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signup/confirm/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, useSearchParams, usePathname } from 'next/navigation';
//import { messages } from '../messages';
//import { commonMessages } from '@/app/i18n/commonMessages';
//import OTPInput from '@/components/OTPInput';
//import '../../../styles/virtus.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function formatTime(seconds) {
//  const m = Math.floor(seconds / 60);
//  const s = seconds % 60;
//  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//}
//
//export default function ConfirmCodePage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const username = searchParams.get('username') || '';
//  const timerKey = `resendStartedAt:signup:${email}:${username}`;
//  const CODE_LENGTH = 8;
//
//  const [startedAt, setStartedAt] = useState(null);
//  const [error, setError] = useState('');
//  const [otpError, setOtpError] = useState(false); // 🚨 Controle visual do erro no input
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(true);
//
//  // 🔐 Verifica se pode acessar a página
//  useEffect(() => {
//    const allowed = localStorage.getItem('canAccessConfirm');
//    if (allowed === 'true') {
//      setIsReady(true);
//    } else {
//      setAccessDenied(true);
//      setTimeout(() => {
//        router.replace('/');
//      }, 4000);
//    }
//  }, [router]);
//
//  // ⏱️ Inicia ou continua o timer de reenvio
//  useEffect(() => {
//    const raw = localStorage.getItem(timerKey);
//    const parsed = parseInt(raw);
//
//    if (!raw || isNaN(parsed)) {
//      const now = Date.now();
//      localStorage.setItem(timerKey, now.toString());
//      setStartedAt(now);
//      setCanResend(false);
//      setResendTimer(120);
//    } else {
//      setStartedAt(parsed);
//    }
//  }, [timerKey]);
//
//  useEffect(() => {
//    if (!startedAt) return;
//
//    const timer = setInterval(() => {
//      const now = Date.now();
//      const elapsed = Math.floor((now - startedAt) / 1000);
//      const remaining = Math.max(120 - elapsed, 0);
//
//      setResendTimer(remaining);
//      setCanResend(remaining === 0);
//
//      if (remaining === 0) {
//        clearInterval(timer);
//      }
//    }, 1000);
//
//    return () => clearInterval(timer);
//  }, [startedAt]);
//
//  // ✅ Envia código para verificação
//  async function handleConfirm(fullCode) {
//    setError('');
//    setOtpError(false); // 🧼 Limpa erro visual
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode, username }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        localStorage.setItem('user', JSON.stringify(data.user));
//        localStorage.removeItem('canAccessConfirm');
//        localStorage.removeItem(timerKey);
//        setSuccess(true);
//
//        // 🚀 Redireciona para dashboard
//        setTimeout(() => {
//          router.push(`/${lang}/dashboard`);
//        }, 1000);
//      } else {
//        setError(data?.error || dict.invalidCode || 'Código inválido');
//        setOtpError(true); // 🚨 Ativa erro visual
//      }
//    } catch (err) {
//      console.error('Confirm error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//      setOtpError(true); // 🚨 Ativa erro visual
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  // 🔁 Reenvia código
//  async function handleResendCode() {
//    setResending(true);
//    setError('');
//    setOtpError(false); // 🧼 Limpa erro visual
//
//    const now = Date.now();
//    localStorage.setItem(timerKey, now.toString());
//    setStartedAt(now);
//    setCanResend(false);
//    setResendTimer(120);
//
//    try {
//      const res = await fetch('/api/send-code', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//        setOtpError(true); // 🚨 Ativa erro visual
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//      setOtpError(true); // 🚨 Ativa erro visual
//    } finally {
//      setResending(false);
//    }
//  }
//
//  // 🛑 Bloqueio de acesso
//  if (!isReady && !accessDenied) return null;
//
//  if (accessDenied) {
//    return (
//      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//        <div className="w-full max-w-sm text-center space-y-4">
//          <h1 className="text-5xl font-bold text-blue-400">404</h1>
//          <p className="text-lg font-semibold">Ooops! Página não encontrada!</p>
//          <p className="text-sm text-gray-400">
//            A página que você está tentando buscar parece que não existe.
//          </p>
//          <p className="text-sm text-gray-500 mt-4">Redirecionando para a página inicial...</p>
//        </div>
//      </main>
//    );
//  }
//
//  return (
//    <main className="container flex h-dvh items-center justify-center">
//      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//        <div className="relative flex flex-col items-center justify-center">
//          <div className="mb-6 flex flex-col items-center gap-2 text-center">
//            {/* Logo ou imagem */}
//            <img src="/logo.png" alt="Virtus Cloud" className="mb-4 block w-28" />
//          </div>
//
//          <div className="space-y-4">
//            <div className="flex max-w-96 flex-col items-center gap-2 text-center">
//              <h1 className="font-bold text-2xl">{dict.confirmTitle}</h1>
//              <span className="text-secondary text-sm">{dict.confirmDescription}</span>
//            </div>
//
//            <form>
//              <div className="mx-auto flex flex-col gap-4">
//                <div className="mx-auto w-fit">
//                  <OTPInput
//                    length={CODE_LENGTH}
//                    onComplete={handleConfirm}
//                    error={otpError}
//                  />
//                </div>
//              </div>
//            </form>
//
//            {/* Mensagens */}
//            {success && (
//              <div className="text-green-400 font-medium text-sm flex items-center justify-center gap-1">
//                <span>✔</span> {dict.success}
//              </div>
//            )}
//            {error && (
//              <div className="text-red-400 font-medium text-sm flex items-center justify-center gap-1">
//                <span>⚠</span> {error}
//              </div>
//            )}
//
//                        {/* Ações secundárias */}
//            <div className="flex flex-col items-center justify-center space-y-3 mt-6">
//              <button
//                onClick={() => router.push(`/${lang}/signup`)}
//                className="text-gray-400 hover:underline text-sm"
//              >
//                Trocar de conta
//              </button>
//
//              <button
//                onClick={handleResendCode}
//                disabled={!canResend || resending}
//                className={`text-sm ${
//                  !canResend || resending
//                    ? 'text-gray-600 cursor-not-allowed'
//                    : 'text-red-400 hover:underline'
//                }`}
//              >
//                {resending
//                  ? dict.sending || 'Reenviando...'
//                  : resendTimer !== null
//                  ? !canResend
//                    ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//                    : dict.resendCode || 'Não recebi o código de acesso'
//                  : dict.resendCode || 'Não recebi o código de acesso'}
//              </button>
//            </div>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, useSearchParams, usePathname } from 'next/navigation';
//import { messages } from '../messages';
//import { commonMessages } from '@/app/i18n/commonMessages';
//import '../../../styles/virtus.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function formatTime(seconds) {
//  const m = Math.floor(seconds / 60);
//  const s = seconds % 60;
//  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//}
//
//export default function ConfirmCodePage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const username = searchParams.get('username') || '';
//  const timerKey = `resendStartedAt:signup:${email}:${username}`;
//
//  const [code, setCode] = useState('');
//  const [error, setError] = useState('');
//  const [otpError, setOtpError] = useState(false); // 🚨 Controle visual do erro no input
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(false);
//
//  // 🔐 Verifica se pode acessar a página
//  useEffect(() => {
//    const allowed = localStorage.getItem('canAccessConfirm');
//    if (allowed === 'true') {
//      setIsReady(true);
//    } else {
//      setAccessDenied(true);
//      setTimeout(() => {
//        router.replace('/');
//      }, 4000);
//    }
//  }, [router]);
//
//  // ⏱️ Inicia ou continua o timer de reenvio
//  useEffect(() => {
//    const startedAtRaw = localStorage.getItem(timerKey);
//    const startedAt = parseInt(startedAtRaw);
//    let remaining = 120;
//
//    if (!startedAtRaw || isNaN(startedAt)) {
//      localStorage.setItem(timerKey, Date.now().toString());
//      setResendTimer(120);
//      setCanResend(false);
//      return;
//    }
//
//    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
//    remaining = Math.max(120 - elapsed, 0);
//
//    setResendTimer(remaining);
//    setCanResend(remaining === 0);
//
//    if (remaining > 0) {
//      const timer = setInterval(() => {
//        setResendTimer(prev => {
//          if (prev <= 1) {
//            clearInterval(timer);
//            setCanResend(true);
//            return 0;
//          }
//          return prev - 1;
//        });
//      }, 1000);
//
//      return () => clearInterval(timer);
//    }
//  }, [timerKey]);
//
//  // 🚀 Confirma automaticamente quando o código estiver completo
//  useEffect(() => {
//    if (code.length === 8 && !loading && !success) {
//      handleConfirm();
//    }
//  }, [code]);
//
//  // ✅ Envia código para verificação
//  async function handleConfirm() {
//    setError('');
//    setOtpError(false); // 🧼 Limpa erro visual
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code, username }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        localStorage.setItem('user', JSON.stringify(data.user));
//        localStorage.removeItem('canAccessConfirm');
//        localStorage.removeItem(timerKey);
//        setSuccess(true);
//
//        // 🚀 Redireciona para dashboard
//        setTimeout(() => {
//          router.push(`/${lang}/dashboard`);
//        }, 1000);
//      } else {
//        setError(data?.error || dict.invalidCode || 'Código inválido');
//        setOtpError(true); // 🚨 Ativa erro visual
//      }
//    } catch (err) {
//      console.error('Confirm error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//      setOtpError(true); // 🚨 Ativa erro visual
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  // 🔁 Reenvia código
//  async function handleResendCode() {
//    setResending(true);
//    setError('');
//    setOtpError(false); // 🧼 Limpa erro visual
//
//    try {
//      const res = await fetch('/api/send-code', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//        setOtpError(true); // 🚨 Ativa erro visual
//      } else {
//        localStorage.setItem(timerKey, Date.now().toString());
//        setCanResend(false);
//        setResendTimer(120);
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//      setOtpError(true); // 🚨 Ativa erro visual
//    } finally {
//      setResending(false);
//    }
//  }
//
//  // 🛑 Bloqueio de acesso
//  if (!isReady && !accessDenied) return null;
//
//  if (accessDenied) {
//    return (
//      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//        <div className="w-full max-w-md text-center space-y-4">
//          <h1 className="text-5xl font-bold text-blue-400">404</h1>
//          <p className="text-lg font-semibold">Ooops! Página não encontrada!</p>
//          <p className="text-sm text-gray-400">
//            A página que você está tentando buscar parece que não existe.
//          </p>
//          <p className="text-sm text-gray-500 mt-4">Redirecionando para a página inicial...</p>
//        </div>
//      </main>
//    );
//  }
//    return (
//    <main className="container flex h-dvh items-center justify-center">
//      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//        <div className="relative flex flex-col items-center justify-center">
//          <div className="mb-6 flex flex-col items-center gap-2 text-center">
//            {/* Logo ou imagem */}
//            <img src="/logo.png" alt="Virtus Cloud" className="mb-4 block w-28" />
//          </div>
//
//          <div className="space-y-4">
//            <div className="flex max-w-96 flex-col items-center gap-2 text-center">
//              <h1 className="font-bold text-2xl">{dict.confirmTitle}</h1>
//              <span className="text-secondary text-sm">{dict.confirmDescription}</span>
//            </div>
//
//            <form>
//              <div className="mx-auto flex flex-col gap-4">
//                <input
//                  type="text"
//                  value={code}
//                  onChange={e => setCode(e.target.value)}
//                  placeholder={dict.codePlaceholder}
//                  aria-label="Código de verificação"
//                  className={`w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400 ${
//                    otpError ? 'border border-red-500' : 'border border-border-tertiary'
//                  }`}
//                />
//              </div>
//            </form>
//
//            {/* Mensagens */}
//            {success && (
//              <div className="text-green-400 font-medium text-sm flex items-center justify-center gap-1">
//                <span>✔</span> {dict.success}
//              </div>
//            )}
//            {error && (
//              <div className="text-red-400 font-medium text-sm flex items-center justify-center gap-1">
//                <span>⚠</span> {error}
//              </div>
//            )}
//
//            {/* Ações secundárias */}
//            <div className="flex flex-col items-center justify-center space-y-3 mt-6">
//              <button
//                onClick={() => router.push(`/${lang}/signup`)}
//                className="text-gray-400 hover:underline text-sm"
//              >
//                Trocar de conta
//              </button>
//
//              <button
//                onClick={handleResendCode}
//                disabled={!canResend || resending}
//                className={`text-sm ${
//                  !canResend || resending
//                    ? 'text-gray-600 cursor-not-allowed'
//                    : 'text-red-400 hover:underline'
//                }`}
//              >
//                {resending
//                  ? dict.sending || 'Reenviando...'
//                  : resendTimer !== null
//                  ? !canResend
//                    ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//                    : dict.resendCode || 'Não recebi o código de acesso'
//                  : dict.resendCode || 'Não recebi o código de acesso'}
//              </button>
//            </div>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, useSearchParams, usePathname } from 'next/navigation';
//import { messages } from '../messages';
//import { commonMessages } from '@/app/i18n/commonMessages';
//import '../../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function formatTime(seconds) {
//  const m = Math.floor(seconds / 60);
//  const s = seconds % 60;
//  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//}
//
//export default function ConfirmCodePage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const username = searchParams.get('username') || '';
//  const timerKey = `resendStartedAt:signup:${email}:${username}`;
//
//  const [code, setCode] = useState('');
//  const [error, setError] = useState('');
//  const [otpError, setOtpError] = useState(false); // 🚨 Controle visual do erro no input
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(false);
//
//  // 🔐 Verifica se pode acessar a página
//  useEffect(() => {
//    const allowed = localStorage.getItem('canAccessConfirm');
//    if (allowed === 'true') {
//      setIsReady(true);
//    } else {
//      setAccessDenied(true);
//      setTimeout(() => {
//        router.replace('/');
//      }, 4000);
//    }
//  }, [router]);
//
//  // ⏱️ Inicia ou continua o timer de reenvio
//  useEffect(() => {
//    const startedAtRaw = localStorage.getItem(timerKey);
//    const startedAt = parseInt(startedAtRaw);
//    let remaining = 120;
//
//    if (!startedAtRaw || isNaN(startedAt)) {
//      localStorage.setItem(timerKey, Date.now().toString());
//      setResendTimer(120);
//      setCanResend(false);
//      return;
//    }
//
//    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
//    remaining = Math.max(120 - elapsed, 0);
//
//    setResendTimer(remaining);
//    setCanResend(remaining === 0);
//
//    if (remaining > 0) {
//      const timer = setInterval(() => {
//        setResendTimer(prev => {
//          if (prev <= 1) {
//            clearInterval(timer);
//            setCanResend(true);
//            return 0;
//          }
//          return prev - 1;
//        });
//      }, 1000);
//
//      return () => clearInterval(timer);
//    }
//  }, [timerKey]);
//
//  // 🚀 Confirma automaticamente quando o código estiver completo
//  useEffect(() => {
//    if (code.length === 8 && !loading && !success) {
//      handleConfirm();
//    }
//  }, [code]);
//
//  // ✅ Envia código para verificação
//  async function handleConfirm() {
//    setError('');
//    setOtpError(false); // 🧼 Limpa erro visual
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code, username }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        localStorage.setItem('user', JSON.stringify(data.user));
//        localStorage.removeItem('canAccessConfirm');
//        localStorage.removeItem(timerKey);
//        setSuccess(true);
//
//        // 🚀 Redireciona para dashboard
//        setTimeout(() => {
//          router.push(`/${lang}/dashboard`);
//        }, 1000);
//      } else {
//        setError(data?.error || dict.invalidCode || 'Código inválido');
//        setOtpError(true); // 🚨 Ativa erro visual
//      }
//    } catch (err) {
//      console.error('Confirm error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//      setOtpError(true); // 🚨 Ativa erro visual
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  // 🔁 Reenvia código
//  async function handleResendCode() {
//    setResending(true);
//    setError('');
//    setOtpError(false); // 🧼 Limpa erro visual
//
//    try {
//      const res = await fetch('/api/send-code', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//        setOtpError(true); // 🚨 Ativa erro visual
//      } else {
//        localStorage.setItem(timerKey, Date.now().toString());
//        setCanResend(false);
//        setResendTimer(120);
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//      setOtpError(true); // 🚨 Ativa erro visual
//    } finally {
//      setResending(false);
//    }
//  }
//
//  // 🛑 Bloqueio de acesso
//  if (!isReady && !accessDenied) return null;
//
//  if (accessDenied) {
//    return (
//      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//        <div className="w-full max-w-md text-center space-y-4">
//          <h1 className="text-5xl font-bold text-blue-400">404</h1>
//          <p className="text-lg font-semibold">Ooops! Página não encontrada!</p>
//          <p className="text-sm text-gray-400">
//            A página que você está tentando buscar parece que não existe.
//          </p>
//          <p className="text-sm text-gray-500 mt-4">Redirecionando para a página inicial...</p>
//        </div>
//      </main>
//    );
//  }
//    return (
//    <main className="container flex h-dvh items-center justify-center">
//      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//        <div className="relative flex flex-col items-center justify-center">
//          <div className="mb-6 flex flex-col items-center gap-2 text-center">
//            {/* Logo ou imagem */}
//            <img src="/logo.png" alt="Virtus Cloud" className="mb-4 block w-28" />
//          </div>
//
//          <div className="space-y-4">
//            <div className="flex max-w-96 flex-col items-center gap-2 text-center">
//              <h1 className="font-bold text-2xl">{dict.confirmTitle}</h1>
//              <span className="text-secondary text-sm">{dict.confirmDescription}</span>
//            </div>
//
//            <form>
//              <div className="mx-auto flex flex-col gap-4">
//                <input
//                  type="text"
//                  value={code}
//                  onChange={e => setCode(e.target.value)}
//                  placeholder={dict.codePlaceholder}
//                  aria-label="Código de verificação"
//                  className={`w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400 ${
//                    otpError ? 'border border-red-500' : 'border border-border-tertiary'
//                  }`}
//                />
//              </div>
//            </form>
//
//            {/* Mensagens */}
//            {success && (
//              <div className="text-green-400 font-medium text-sm flex items-center justify-center gap-1">
//                <span>✔</span> {dict.success}
//              </div>
//            )}
//            {error && (
//              <div className="text-red-400 font-medium text-sm flex items-center justify-center gap-1">
//                <span>⚠</span> {error}
//              </div>
//            )}
//
//            {/* Ações secundárias */}
//            <div className="flex flex-col items-center justify-center space-y-3 mt-6">
//              <button
//                onClick={() => router.push(`/${lang}/signup`)}
//                className="text-gray-400 hover:underline text-sm"
//              >
//                Trocar de conta
//              </button>
//
//              <button
//                onClick={handleResendCode}
//                disabled={!canResend || resending}
//                className={`text-sm ${
//                  !canResend || resending
//                    ? 'text-gray-600 cursor-not-allowed'
//                    : 'text-red-400 hover:underline'
//                }`}
//              >
//                {resending
//                  ? dict.sending || 'Reenviando...'
//                  : resendTimer !== null
//                  ? !canResend
//                    ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//                    : dict.resendCode || 'Não recebi o código de acesso'
//                  : dict.resendCode || 'Não recebi o código de acesso'}
//              </button>
//            </div>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, useSearchParams, usePathname } from 'next/navigation';
//import { messages } from '../messages';
//import { commonMessages } from '@/app/i18n/commonMessages';
//import '../../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function formatTime(seconds) {
//  const m = Math.floor(seconds / 60);
//  const s = seconds % 60;
//  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//}
//
//export default function ConfirmCodePage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const username = searchParams.get('username') || '';
//  const timerKey = `resendStartedAt:signup:${email}:${username}`;
//
//  const [code, setCode] = useState('');
//  const [error, setError] = useState('');
//  const [otpError, setOtpError] = useState(false); // 🚨 Controle visual do erro no input
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(false);
//
//  useEffect(() => {
//    const allowed = localStorage.getItem('canAccessConfirm');
//    if (allowed === 'true') {
//      setIsReady(true);
//    } else {
//      setAccessDenied(true);
//      setTimeout(() => {
//        router.replace('/');
//      }, 4000);
//    }
//  }, [router]);
//
//  useEffect(() => {
//    const startedAtRaw = localStorage.getItem(timerKey);
//    const startedAt = parseInt(startedAtRaw);
//    let remaining = 120;
//
//    if (!startedAtRaw || isNaN(startedAt)) {
//      localStorage.setItem(timerKey, Date.now().toString());
//      setResendTimer(120);
//      setCanResend(false);
//      return;
//    }
//
//    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
//    remaining = Math.max(120 - elapsed, 0);
//
//    setResendTimer(remaining);
//    setCanResend(remaining === 0);
//
//    if (remaining > 0) {
//      const timer = setInterval(() => {
//        setResendTimer(prev => {
//          if (prev <= 1) {
//            clearInterval(timer);
//            setCanResend(true);
//            return 0;
//          }
//          return prev - 1;
//        });
//      }, 1000);
//
//      return () => clearInterval(timer);
//    }
//  }, [timerKey]);
//
//  useEffect(() => {
//    if (code.length === 8 && !loading && !success) {
//      handleConfirm();
//    }
//  }, [code]);
//
//  async function handleConfirm() {
//    setError('');
//    setOtpError(false); // 🧼 Limpa erro visual
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code, username }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        localStorage.setItem('user', JSON.stringify(data.user));
//        localStorage.removeItem('canAccessConfirm');
//        localStorage.removeItem(timerKey);
//        setSuccess(true);
//
//        // 🚀 Redireciona para dashboard
//        setTimeout(() => {
//          router.push(`/${lang}/dashboard`);
//        }, 1000);
//      } else {
//        setError(data?.error || dict.invalidCode || 'Código inválido');
//        setOtpError(true); // 🚨 Ativa erro visual
//      }
//    } catch (err) {
//      console.error('Confirm error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//      setOtpError(true); // 🚨 Ativa erro visual
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  async function handleResendCode() {
//    setResending(true);
//    setError('');
//    setOtpError(false); // 🧼 Limpa erro visual
//
//    try {
//      const res = await fetch('/api/send-code', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//        setOtpError(true); // 🚨 Ativa erro visual
//      } else {
//        localStorage.setItem(timerKey, Date.now().toString());
//        setCanResend(false);
//        setResendTimer(120);
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//      setOtpError(true); // 🚨 Ativa erro visual
//    } finally {
//      setResending(false);
//    }
//  }
//
//  if (!isReady && !accessDenied) {
//    return null;
//  }
//
//  if (accessDenied) {
//    return (
//      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//        <div className="w-full max-w-md text-center space-y-4">
//          <h1 className="text-5xl font-bold text-blue-400">404</h1>
//          <p className="text-lg font-semibold">Ooops! Página não encontrada!</p>
//          <p className="text-sm text-gray-400">
//            A página que você está tentando buscar parece que não existe.
//          </p>
//          <p className="text-sm text-gray-500 mt-4">Redirecionando para a página inicial...</p>
//        </div>
//      </main>
//    );
//  }
//
//  return (
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6">
//        <h1 className="text-2xl font-bold text-center">{dict.confirmTitle}</h1>
//        <p className="text-sm text-gray-400 text-center">{dict.confirmDescription}</p>
//
//        <input
//          type="text"
//          value={code}
//          onChange={e => setCode(e.target.value)}
//          placeholder={dict.codePlaceholder}
//          aria-label="Código de verificação"
//          className={`w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400 ${
//            error ? 'border border-red-500' : ''
//          }`}
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
//        <div className="text-center text-sm text-gray-400 mt-4 space-y-2">
//          <button
//            onClick={() => router.push(`/${lang}/signup`)}
//            className="text-gray-400 hover:underline block"
//          >
//            Trocar de conta
//          </button>
//
//          <button
//            onClick={handleResendCode}
//            disabled={!canResend || resending}
//            className={`block ${
//              !canResend || resending ? 'text-gray-600' : 'text-red-400 hover:underline'
//            }`}
//          >
//            {resending
//              ? dict.sending || 'Reenviando...'
//              : resendTimer !== null
//              ? !canResend
//                ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//                : dict.resendCode || 'Não recebi o código de acesso'
//              : dict.resendCode || 'Não recebi o código de acesso'}
//          </button>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signup/confirm/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, useSearchParams, usePathname } from 'next/navigation';
//import { messages } from '../messages';
//import { commonMessages } from '@/app/i18n/commonMessages';
//import '../../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function formatTime(seconds) {
//  const m = Math.floor(seconds / 60);
//  const s = seconds % 60;
//  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//}
//
//export default function ConfirmCodePage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const username = searchParams.get('username') || '';
//  const timerKey = `resendStartedAt:signup:${email}:${username}`;
//
//  const [code, setCode] = useState('');
//  const [error, setError] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(false);
//
//  useEffect(() => {
//    const allowed = localStorage.getItem('canAccessConfirm');
//    if (allowed === 'true') {
//      setIsReady(true);
//    } else {
//      setAccessDenied(true);
//      setTimeout(() => {
//        router.replace('/');
//      }, 4000);
//    }
//  }, [router]);
//
//  useEffect(() => {
//    const startedAtRaw = localStorage.getItem(timerKey);
//    const startedAt = parseInt(startedAtRaw);
//    let remaining = 120;
//
//    if (!startedAtRaw || isNaN(startedAt)) {
//      localStorage.setItem(timerKey, Date.now().toString());
//      setResendTimer(120);
//      setCanResend(false);
//      return;
//    }
//
//    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
//    remaining = Math.max(120 - elapsed, 0);
//
//    setResendTimer(remaining);
//    setCanResend(remaining === 0);
//
//    if (remaining > 0) {
//      const timer = setInterval(() => {
//        setResendTimer(prev => {
//          if (prev <= 1) {
//            clearInterval(timer);
//            setCanResend(true);
//            return 0;
//          }
//          return prev - 1;
//        });
//      }, 1000);
//
//      return () => clearInterval(timer);
//    }
//  }, [timerKey]);
//
//  useEffect(() => {
//    if (code.length === 8 && !loading && !success) {
//      handleConfirm();
//    }
//  }, [code]);
//
//  async function handleConfirm() {
//    setError('');
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code, username }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        localStorage.setItem('user', JSON.stringify(data.user));
//        localStorage.removeItem('canAccessConfirm');
//        localStorage.removeItem(timerKey);
//        setSuccess(true);
//        setTimeout(() => {
//          router.push(`/${lang}/dashboard`);
//        }, 1000);
//      } else {
//        setError(data?.error || dict.invalidCode || 'Código inválido');
//      }
//    } catch (err) {
//      console.error('Confirm error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  async function handleResendCode() {
//    setResending(true);
//    setError('');
//    try {
//      const res = await fetch('/api/send-code', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//      } else {
//        localStorage.setItem(timerKey, Date.now().toString());
//        setCanResend(false);
//        setResendTimer(120);
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setResending(false);
//    }
//  }
//
//  if (!isReady && !accessDenied) {
//    return null;
//  }
//
//  if (accessDenied) {
//    return (
//      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//        <div className="w-full max-w-md text-center space-y-4">
//          <h1 className="text-5xl font-bold text-blue-400">404</h1>
//          <p className="text-lg font-semibold">Ooops! Página não encontrada!</p>
//          <p className="text-sm text-gray-400">
//            A página que você está tentando buscar parece que não existe.
//          </p>
//          <p className="text-sm text-gray-500 mt-4">Redirecionando para a página inicial...</p>
//        </div>
//      </main>
//    );
//  }
//
//  return (
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6">
//        <h1 className="text-2xl font-bold text-center">{dict.confirmTitle}</h1>
//        <p className="text-sm text-gray-400 text-center">{dict.confirmDescription}</p>
//
//        <input
//          type="text"
//          value={code}
//          onChange={e => setCode(e.target.value)}
//          placeholder={dict.codePlaceholder}
//          aria-label="Código de verificação"
//          className={`w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400 ${
//            error ? 'border border-red-500' : ''
//          }`}
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
//        <div className="text-center text-sm text-gray-400 mt-4 space-y-2">
//          <button
//            onClick={() => router.push(`/${lang}/signup`)}
//            className="text-gray-400 hover:underline block"
//          >
//            Trocar de conta
//          </button>
//
//          <button
//            onClick={handleResendCode}
//            disabled={!canResend || resending}
//            className={`block ${
//              !canResend || resending ? 'text-gray-600' : 'text-red-400 hover:underline'
//            }`}
//          >
//            {resending
//              ? dict.sending || 'Reenviando...'
//              : resendTimer !== null
//              ? !canResend
//                ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//                : dict.resendCode || 'Não recebi o código de acesso'
//              : dict.resendCode || 'Não recebi o código de acesso'}
//          </button>
//        </div>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, useSearchParams, usePathname } from 'next/navigation';
//import { messages } from '../messages';
//import { commonMessages } from '@/app/i18n/commonMessages';
//import '../../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function formatTime(seconds) {
//  const m = Math.floor(seconds / 60);
//  const s = seconds % 60;
//  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//}
//
//export default function ConfirmCodePage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const username = searchParams.get('username') || '';
//  const timerKey = `resendStartedAt:signup:${email}:${username}`;
//
//  const [code, setCode] = useState('');
//  const [error, setError] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(false);
//
//  useEffect(() => {
//    const allowed = localStorage.getItem('canAccessConfirm');
//    if (allowed === 'true') {
//      setIsReady(true);
//    } else {
//      setAccessDenied(true);
//      setTimeout(() => {
//        router.replace('/');
//      }, 4000);
//    }
//  }, [router]);
//
//  useEffect(() => {
//  const startedAtRaw = localStorage.getItem(timerKey);
//  const startedAt = parseInt(startedAtRaw);
//  let remaining = 120;
//
//  if (!startedAtRaw || isNaN(startedAt)) {
//    // 🔒 Timer ausente ou inválido — reinicia
//    localStorage.setItem(timerKey, Date.now().toString());
//    setResendTimer(120);
//    setCanResend(false);
//    return;
//  }
//
//  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
//  remaining = Math.max(120 - elapsed, 0);
//
//  setResendTimer(remaining);
//  setCanResend(remaining === 0);
//
//  if (remaining > 0) {
//    const timer = setInterval(() => {
//      setResendTimer(prev => {
//        if (prev <= 1) {
//          clearInterval(timer);
//          setCanResend(true);
//          return 0;
//        }
//        return prev - 1;
//      });
//    }, 1000);
//
//    return () => clearInterval(timer);
//  }
//}, [timerKey]);
//
//  async function handleConfirm() {
//    setError('');
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code, username }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        localStorage.setItem('user', JSON.stringify(data.user));
//        localStorage.removeItem('canAccessConfirm');
//        localStorage.removeItem(timerKey);
//        setSuccess(true);
//        setTimeout(() => {
//          router.push(`/${lang}/dashboard`);
//        }, 1000);
//      } else {
//        setError(data?.error || dict.invalidCode || 'Código inválido');
//      }
//    } catch (err) {
//      console.error('Confirm error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  async function handleResendCode() {
//    setResending(true);
//    setError('');
//    try {
//      const res = await fetch('/api/send-code', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//      } else {
//        localStorage.setItem(timerKey, Date.now().toString());
//        setCanResend(false);
//        setResendTimer(120);
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setResending(false);
//    }
//  }
//
//  if (!isReady && !accessDenied) {
//    return null;
//  }
//
//  if (accessDenied) {
//    return (
//      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//        <div className="w-full max-w-md text-center space-y-4">
//          <h1 className="text-5xl font-bold text-blue-400">404</h1>
//          <p className="text-lg font-semibold">Ooops! Página não encontrada!</p>
//          <p className="text-sm text-gray-400">
//            A página que você está tentando buscar parece que não existe.
//          </p>
//          <p className="text-sm text-gray-500 mt-4">Redirecionando para a página inicial...</p>
//        </div>
//      </main>
//    );
//  }
//
//  return (
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6">
//        <h1 className="text-2xl font-bold text-center">{dict.confirmTitle}</h1>
//        <p className="text-sm text-gray-400 text-center">{dict.confirmDescription}</p>
//
//        <input
//          type="text"
//          value={code}
//          onChange={e => setCode(e.target.value)}
//          placeholder={dict.codePlaceholder}
//          aria-label="Código de verificação"
//          className={`w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400 ${error ? 'border border-red-500' : ''}`}
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
//          onClick={handleConfirm}
//          disabled={loading}
//          aria-label="Confirmar código"
//          className={`w-full py-2 rounded text-white font-semibold ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
//        >
//          {loading ? dict.sending || 'Confirmando...' : dict.confirmButton}
//        </button>
//
//        <div className="text-center text-sm text-gray-400 mt-4 space-y-2">
//          <a href="https://mail.google.com" className="text-blue-400 hover:underline block">
//            Ir para caixa de entrada
//          </a>
//          <button onClick={() => router.push(`/${lang}/signup`)} className="text-gray-400 hover:underline block">
//            Trocar de conta
//          </button>
//          <button
//            onClick={handleResendCode}
//            disabled={!canResend || resending}
//            className={`block ${!canResend || resending ? 'text-gray-600' : 'text-red-400 hover:underline'}`}
//          >
//            {resendTimer === null
//              ? ''
//              : !canResend
//              ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//              : resending
//              ? dict.sending || 'Reenviando...'
//              : dict.resendCode || 'Não recebi o código de acesso'}
//          </button>
//        </div>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, useSearchParams, usePathname } from 'next/navigation';
//import { messages } from '../messages';
//import { commonMessages } from '@/app/i18n/commonMessages';
//import '../../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function formatTime(seconds) {
//  const m = Math.floor(seconds / 60);
//  const s = seconds % 60;
//  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//}
//
//export default function ConfirmCodePage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const username = searchParams.get('username') || '';
//  const timerKey = `resendStartedAt:signup:${email}:${username}`;
//
//  const [code, setCode] = useState('');
//  const [error, setError] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(false);
//
//  useEffect(() => {
//    const allowed = localStorage.getItem('canAccessConfirm');
//    if (allowed === 'true') {
//      setIsReady(true);
//    } else {
//      setAccessDenied(true);
//      setTimeout(() => {
//        router.replace('/');
//      }, 4000);
//    }
//  }, [router]);
//
//  useEffect(() => {
//  const startedAtRaw = localStorage.getItem(timerKey);
//  const startedAt = parseInt(startedAtRaw);
//  let remaining = 120;
//
//  if (!startedAtRaw || isNaN(startedAt)) {
//    // 🔒 Timer ausente ou inválido — reinicia
//    localStorage.setItem(timerKey, Date.now().toString());
//    setResendTimer(120);
//    setCanResend(false);
//    return;
//  }
//
//  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
//  remaining = Math.max(120 - elapsed, 0);
//
//  setResendTimer(remaining);
//  setCanResend(remaining === 0);
//
//  if (remaining > 0) {
//    const timer = setInterval(() => {
//      setResendTimer(prev => {
//        if (prev <= 1) {
//          clearInterval(timer);
//          setCanResend(true);
//          return 0;
//        }
//        return prev - 1;
//      });
//    }, 1000);
//
//    return () => clearInterval(timer);
//  }
//}, [timerKey]);
//
//  async function handleConfirm() {
//    setError('');
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code, username }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        localStorage.setItem('user', JSON.stringify(data.user));
//        localStorage.removeItem('canAccessConfirm');
//        localStorage.removeItem(timerKey);
//        setSuccess(true);
//        setTimeout(() => {
//          router.push(`/${lang}/dashboard`);
//        }, 1000);
//      } else {
//        setError(data?.error || dict.invalidCode || 'Código inválido');
//      }
//    } catch (err) {
//      console.error('Confirm error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  async function handleResendCode() {
//    setResending(true);
//    setError('');
//    try {
//      const res = await fetch('/api/send-code', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email, username }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//      } else {
//        localStorage.setItem(timerKey, Date.now().toString());
//        setCanResend(false);
//        setResendTimer(120);
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setResending(false);
//    }
//  }
//
//  if (!isReady && !accessDenied) {
//    return null;
//  }
//
//  if (accessDenied) {
//    return (
//      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//        <div className="w-full max-w-md text-center space-y-4">
//          <h1 className="text-5xl font-bold text-blue-400">404</h1>
//          <p className="text-lg font-semibold">Ooops! Página não encontrada!</p>
//          <p className="text-sm text-gray-400">
//            A página que você está tentando buscar parece que não existe.
//          </p>
//          <p className="text-sm text-gray-500 mt-4">Redirecionando para a página inicial...</p>
//        </div>
//      </main>
//    );
//  }
//
//  return (
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6">
//        <h1 className="text-2xl font-bold text-center">{dict.confirmTitle}</h1>
//        <p className="text-sm text-gray-400 text-center">{dict.confirmDescription}</p>
//
//        <input
//          type="text"
//          value={code}
//          onChange={e => setCode(e.target.value)}
//          placeholder={dict.codePlaceholder}
//          aria-label="Código de verificação"
//          className={`w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400 ${error ? 'border border-red-500' : ''}`}
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
//          onClick={handleConfirm}
//          disabled={loading}
//          aria-label="Confirmar código"
//          className={`w-full py-2 rounded text-white font-semibold ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
//        >
//          {loading ? dict.sending || 'Confirmando...' : dict.confirmButton}
//        </button>
//
//        <div className="text-center text-sm text-gray-400 mt-4 space-y-2">
//          <a href="https://mail.google.com" className="text-blue-400 hover:underline block">
//            Ir para caixa de entrada
//          </a>
//          <button onClick={() => router.push(`/${lang}/signup`)} className="text-gray-400 hover:underline block">
//            Trocar de conta
//          </button>
//          <button
//            onClick={handleResendCode}
//            disabled={!canResend || resending}
//            className={`block ${!canResend || resending ? 'text-gray-600' : 'text-red-400 hover:underline'}`}
//          >
//            {resendTimer === null
//              ? ''
//              : !canResend
//              ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//              : resending
//              ? dict.sending || 'Reenviando...'
//              : dict.resendCode || 'Não recebi o código de acesso'}
//          </button>
//        </div>
//      </div>
//    </main>
//  );
//}
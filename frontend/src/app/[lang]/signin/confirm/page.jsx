//frontend/src/app/[lang]/signin/confirm/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { messages } from '../../messages/signin';
import { commonMessages } from '@/app/i18n/commonMessages';
import OTPInput from '@/components/OTPInput';
import '../../../styles/virtus.css';

// 🌐 Detecta idioma da URL
function getLang(pathname) {
  const segment = pathname.split('/')[1];
  const supported = ['pt-br', 'en', 'es', 'zh'];
  return supported.includes(segment) ? segment : 'en';
}

// ⏱️ Formata tempo em mm:ss
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
function getEmailFromCookie() {
  const match = document.cookie.match(/virtuscloud\.login=([^;]+)/);
  if (!match) return '';
  try {
    const decoded = decodeURIComponent(match[1]);
    const parsed = JSON.parse(decoded);
    return parsed.email || '';
  } catch {
    return '';
  }
}

export default function ConfirmLoginPage() {
  const pathname = usePathname();
  const lang = getLang(pathname);
  const dict = { ...commonMessages[lang], ...messages[lang] };
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = getEmailFromCookie();
  //const email = searchParams.get('email') || '';
  const timerKey = `resendStartedAt:signin:${email}`;
  const CODE_LENGTH = 8;

  const [startedAt, setStartedAt] = useState(null);
  const [error, setError] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [initialDelay, setInitialDelay] = useState(true);
  const [resendTimer, setResendTimer] = useState(null);
  const [canResend, setCanResend] = useState(true);

  // 🔐 Verifica se o usuário pode acessar a página
  useEffect(() => {
    const delay = setTimeout(() => {
      // 🧠 Recupera dados salvos no Cookies
      const allowed = getCookie('virtuscloud.canAccessConfirm');
      const loginCookie = getCookie('virtuscloud.login');
      let storedEmail = '';

      try {
        storedEmail = JSON.parse(loginCookie)?.email || '';
      } catch { }

      //const allowed = localStorage.getItem('canAccessConfirm');
      //const storedEmail = localStorage.getItem('signinEmail');
      const requestedAtRaw = localStorage.getItem(timerKey);
      const requestedAt = parseInt(requestedAtRaw);

      // ✅ Valida se o acesso é permitido e está dentro do tempo limite
      const isValid =
        allowed === 'true' &&
        storedEmail === email &&
        requestedAt &&
        Date.now() - requestedAt <= 30 * 60 * 1000; // ⏳ 30 minutos de validade

      if (isValid) {
        setIsReady(true);
        localStorage.setItem('lastInteraction:signin', Date.now().toString()); // 🕒 marca início da sessão
      } else {
        setAccessDenied(true);
        setTimeout(() => {
          router.replace('/'); // 🚫 redireciona se acesso inválido
        }, 4000);
      }
    }, 150); // ⏳ aguarda 300ms para garantir que localStorage esteja pronto

    return () => clearTimeout(delay); // 🧹 limpa timeout ao desmontar
  }, [router, email, timerKey]);

  // 🕒 Expira sessão após 5 minutos de inatividade
  useEffect(() => {
    const interval = setInterval(() => {
      const last = parseInt(localStorage.getItem('lastInteraction:signin'));
      if (last && Date.now() - last > 5 * 60 * 1000) {
        localStorage.removeItem('canAccessConfirm');
        localStorage.removeItem('signinEmail');
        localStorage.removeItem(timerKey);
        localStorage.removeItem('lastInteraction:signin');
        router.replace('/');
      }
    }, 10000); // verifica a cada 10s

    return () => clearInterval(interval);
  }, []);

  // 🧠 Atualiza interação em qualquer ação
  const updateInteraction = () => {
    localStorage.setItem('lastInteraction:signin', Date.now().toString());
  };

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

  // ⏳ Atualiza contador regressivo
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

  // ⏳ Delay inicial para evitar clique precoce
  useEffect(() => {
    const delay = setTimeout(() => {
      setInitialDelay(false);
    }, 1500);
    return () => clearTimeout(delay);
  }, []);

  async function handleConfirm(fullCode) {
    setError('');
    setOtpError(false); // 👈 limpa erro visual
    setLoading(true);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.removeItem('canAccessConfirm');
        localStorage.removeItem(timerKey);
        setSuccess(true);
        setTimeout(() => {
          router.push(`/${lang}/dashboard`);
        }, 1000);
      } else {
        setError(data?.error || dict.invalidCode || 'Código inválido');
        setOtpError(true); // 👈 ativa erro visual
      }
    } catch (err) {
      console.error('Confirm error:', err);
      setError(dict.networkError || 'Erro de rede ou servidor');
      setOtpError(true); // 👈 ativa erro visual
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    setResending(true);
    setError('');
    setOtpError(false); // 👈 limpa erro visual

    const now = Date.now();
    localStorage.setItem(timerKey, now.toString());
    setStartedAt(now);
    setCanResend(false);
    setResendTimer(120);

    try {
      const res = await fetch('/api/send-code/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
      } else if (!data.codeSent) {
        setError('⏳ Código já foi enviado recentemente. Aguarde o tempo de espera.');
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError(dict.networkError || 'Erro de rede ou servidor');
    } finally {
      setResending(false);
    }
  }

  // ⛔️ Se ainda não verificou ou negado acesso, não renderiza nada
  if (!isReady && !accessDenied) return null;

  // 🚫 Página negada — redireciona após 4s
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

  // ✅ Página de confirmação
  return (
    <main className="min-h-screen w-full bg-background flex items-center justify-center">
      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
        <div className="relative flex flex-col items-center justify-center">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            {/* 🔙 Botão de voltar */}
            <button
              className="absolute top-0 cursor-pointer sm:left-10"
              onClick={() => {
                updateInteraction();
                router.back(); //router.push(`/${lang}/signin`);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
              </svg>
            </button>

            {/* 🖼️ Logo */}
            <img src="/logo.png" alt="Virtus Cloud" className="mb-4 block w-28" />
          </div>

          <div className="space-y-4">
            {/* 📝 Título e descrição */}
            <div className="flex max-w-96 flex-col items-center gap-2 text-center">
              <h1 className="font-bold text-2xl">{dict.confirmTitle}</h1>
              <span className="text-secondary text-sm">{dict.confirmDescription}</span>
            </div>

            {/* 🔢 Campo de código */}
            <form>
              <div className="mx-auto flex flex-col gap-4">
                <div className="mx-auto w-fit">
                  <OTPInput
                    length={CODE_LENGTH}
                    onComplete={code => {
                      updateInteraction();
                      handleConfirm(code);
                    }}
                    error={otpError}
                  />
                </div>
              </div>
            </form>

            {/* ✅ Mensagens de sucesso/erro */}
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

            {/* 🧭 Ações secundárias */}
            <div className="flex flex-col items-center justify-center space-y-3 mt-6">
              {/* 📬 Link dinâmico para caixa de entrada */}
              <a
                className="flex w-full items-center justify-center gap-2 text-link text-sm"
                target="_blank"
                href={`https://${email.split('@')[1]}`}
                onClick={updateInteraction}
              >
                Ir para caixa de entrada
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                </svg>
              </a>

              {/* 🔄 Trocar conta + Reenviar código */}
              <div className="space-y-1.5 text-center">
                <p className="text-nowrap text-secondary text-sm max-sm:justify-center">
                  Não é {email}?{' '}
                  <a className="text-link" href={`/${lang}/signin?state=reset`} onClick={updateInteraction}>
                    Trocar de conta
                  </a>
                </p>

                <button
                  onClick={() => {
                    updateInteraction();
                    handleResendCode();
                  }}
                  disabled={!canResend || resending || initialDelay}
                  className={`flex w-full cursor-pointer justify-center text-link text-sm ${!canResend || resending || initialDelay ? 'opacity-50 cursor-not-allowed' : 'hover:underline'
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

//frontend/src/app/[lang]/signin/confirm/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, useSearchParams, usePathname } from 'next/navigation';
//import { messages } from '../messages';
//import { commonMessages } from '@/app/i18n/commonMessages';
//import OTPInput from '@/components/OTPInput';
//import '../../../styles/virtus.css';
//
//// 🌐 Detecta idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//// ⏱️ Formata tempo em mm:ss
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
//function getEmailFromCookie() {
//  const match = document.cookie.match(/virtuscloud\.login=([^;]+)/);
//  if (!match) return '';
//  try {
//    const decoded = decodeURIComponent(match[1]);
//    const parsed = JSON.parse(decoded);
//    return parsed.email || '';
//  } catch {
//    return '';
//  }
//}
//
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = getEmailFromCookie();
//  //const email = searchParams.get('email') || '';
//  const timerKey = `resendStartedAt:signin:${email}`;
//  const CODE_LENGTH = 8;
//
//  const [startedAt, setStartedAt] = useState(null);
//  const [error, setError] = useState('');
//  const [otpError, setOtpError] = useState(false);
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//  const [initialDelay, setInitialDelay] = useState(true);
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(true);
//
//  // 🔐 Verifica se o usuário pode acessar a página
//  useEffect(() => {
//    const delay = setTimeout(() => {
//      // 🧠 Recupera dados salvos no Cookies
//      const allowed = getCookie('virtuscloud.canAccessConfirm');
//      const loginCookie = getCookie('virtuscloud.login');
//      let storedEmail = '';
//
//      try {
//        storedEmail = JSON.parse(loginCookie)?.email || '';
//      } catch { }
//
//      //const allowed = localStorage.getItem('canAccessConfirm');
//      //const storedEmail = localStorage.getItem('signinEmail');
//      const requestedAtRaw = localStorage.getItem(timerKey);
//      const requestedAt = parseInt(requestedAtRaw);
//
//      // ✅ Valida se o acesso é permitido e está dentro do tempo limite
//      const isValid =
//        allowed === 'true' &&
//        storedEmail === email &&
//        requestedAt &&
//        Date.now() - requestedAt <= 30 * 60 * 1000; // ⏳ 30 minutos de validade
//
//      if (isValid) {
//        setIsReady(true);
//        localStorage.setItem('lastInteraction:signin', Date.now().toString()); // 🕒 marca início da sessão
//      } else {
//        setAccessDenied(true);
//        setTimeout(() => {
//          router.replace('/'); // 🚫 redireciona se acesso inválido
//        }, 4000);
//      }
//    }, 150); // ⏳ aguarda 300ms para garantir que localStorage esteja pronto
//
//    return () => clearTimeout(delay); // 🧹 limpa timeout ao desmontar
//  }, [router, email, timerKey]);
//
//  // 🕒 Expira sessão após 5 minutos de inatividade
//  useEffect(() => {
//    const interval = setInterval(() => {
//      const last = parseInt(localStorage.getItem('lastInteraction:signin'));
//      if (last && Date.now() - last > 5 * 60 * 1000) {
//        localStorage.removeItem('canAccessConfirm');
//        localStorage.removeItem('signinEmail');
//        localStorage.removeItem(timerKey);
//        localStorage.removeItem('lastInteraction:signin');
//        router.replace('/');
//      }
//    }, 10000); // verifica a cada 10s
//
//    return () => clearInterval(interval);
//  }, []);
//
//  // 🧠 Atualiza interação em qualquer ação
//  const updateInteraction = () => {
//    localStorage.setItem('lastInteraction:signin', Date.now().toString());
//  };
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
//  // ⏳ Atualiza contador regressivo
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
//  // ⏳ Delay inicial para evitar clique precoce
//  useEffect(() => {
//    const delay = setTimeout(() => {
//      setInitialDelay(false);
//    }, 1500);
//    return () => clearTimeout(delay);
//  }, []);
//
//  async function handleConfirm(fullCode) {
//    setError('');
//    setOtpError(false); // 👈 limpa erro visual
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode }),
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
//        setOtpError(true); // 👈 ativa erro visual
//      }
//    } catch (err) {
//      console.error('Confirm error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//      setOtpError(true); // 👈 ativa erro visual
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  async function handleResendCode() {
//    setResending(true);
//    setError('');
//    setOtpError(false); // 👈 limpa erro visual
//
//    const now = Date.now();
//    localStorage.setItem(timerKey, now.toString());
//    setStartedAt(now);
//    setCanResend(false);
//    setResendTimer(120);
//
//    try {
//      const res = await fetch('/api/send-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//      } else if (!data.codeSent) {
//        setError('⏳ Código já foi enviado recentemente. Aguarde o tempo de espera.');
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setResending(false);
//    }
//  }
//
//  // ⛔️ Se ainda não verificou ou negado acesso, não renderiza nada
//  if (!isReady && !accessDenied) return null;
//
//  // 🚫 Página negada — redireciona após 4s
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
//  // ✅ Página de confirmação
//  return (
//    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//        <div className="relative flex flex-col items-center justify-center">
//          <div className="mb-6 flex flex-col items-center gap-2 text-center">
//            {/* 🔙 Botão de voltar */}
//            <button
//              className="absolute top-0 cursor-pointer sm:left-10"
//              onClick={() => {
//                updateInteraction();
//                router.back(); //router.push(`/${lang}/signin`);
//              }}
//            >
//              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
//              </svg>
//            </button>
//
//            {/* 🖼️ Logo */}
//            <img src="/logo.png" alt="Virtus Cloud" className="mb-4 block w-28" />
//          </div>
//
//          <div className="space-y-4">
//            {/* 📝 Título e descrição */}
//            <div className="flex max-w-96 flex-col items-center gap-2 text-center">
//              <h1 className="font-bold text-2xl">{dict.confirmTitle}</h1>
//              <span className="text-secondary text-sm">{dict.confirmDescription}</span>
//            </div>
//
//            {/* 🔢 Campo de código */}
//            <form>
//              <div className="mx-auto flex flex-col gap-4">
//                <div className="mx-auto w-fit">
//                  <OTPInput
//                    length={CODE_LENGTH}
//                    onComplete={code => {
//                      updateInteraction();
//                      handleConfirm(code);
//                    }}
//                    error={otpError}
//                  />
//                </div>
//              </div>
//            </form>
//
//            {/* ✅ Mensagens de sucesso/erro */}
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
//            {/* 🧭 Ações secundárias */}
//            <div className="flex flex-col items-center justify-center space-y-3 mt-6">
//              {/* 📬 Link dinâmico para caixa de entrada */}
//              <a
//                className="flex w-full items-center justify-center gap-2 text-link text-sm"
//                target="_blank"
//                href={`https://${email.split('@')[1]}`}
//                onClick={updateInteraction}
//              >
//                Ir para caixa de entrada
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
//                </svg>
//              </a>
//
//              {/* 🔄 Trocar conta + Reenviar código */}
//              <div className="space-y-1.5 text-center">
//                <p className="text-nowrap text-secondary text-sm max-sm:justify-center">
//                  Não é {email}?{' '}
//                  <a className="text-link" href={`/${lang}/signin?state=reset`} onClick={updateInteraction}>
//                    Trocar de conta
//                  </a>
//                </p>
//
//                <button
//                  onClick={() => {
//                    updateInteraction();
//                    handleResendCode();
//                  }}
//                  disabled={!canResend || resending || initialDelay}
//                  className={`flex w-full cursor-pointer justify-center text-link text-sm ${!canResend || resending || initialDelay ? 'opacity-50 cursor-not-allowed' : 'hover:underline'
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

//frontend/src/app/[lang]/signin/confirm/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, useSearchParams, usePathname } from 'next/navigation';
//import { messages } from '../messages';
//import { commonMessages } from '@/app/i18n/commonMessages';
//import OTPInput from '@/components/OTPInput';
//import '../../../styles/virtus.css';
//
//// 🌐 Detecta idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//// ⏱️ Formata tempo em mm:ss
//function formatTime(seconds) {
//  const m = Math.floor(seconds / 60);
//  const s = seconds % 60;
//  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//}
//
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const timerKey = `resendStartedAt:signin:${email}`;
//  const CODE_LENGTH = 8;
//
//  const [startedAt, setStartedAt] = useState(null);
//  const [error, setError] = useState('');
//  const [otpError, setOtpError] = useState(false);
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//  const [initialDelay, setInitialDelay] = useState(true);
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(true);
//
//  // 🔐 Verifica se o usuário pode acessar a página
//  useEffect(() => {
//    const delay = setTimeout(() => {
//      // 🧠 Recupera dados salvos no localStorage
//      const allowed = localStorage.getItem('canAccessConfirm');
//      const storedEmail = localStorage.getItem('signinEmail');
//      const requestedAtRaw = localStorage.getItem(timerKey);
//      const requestedAt = parseInt(requestedAtRaw);
//
//      // ✅ Valida se o acesso é permitido e está dentro do tempo limite
//      const isValid =
//        allowed === 'true' &&
//        storedEmail === email &&
//        requestedAt &&
//        Date.now() - requestedAt <= 30 * 60 * 1000; // ⏳ 30 minutos de validade
//
//      if (isValid) {
//        setIsReady(true);
//        localStorage.setItem('lastInteraction:signin', Date.now().toString()); // 🕒 marca início da sessão
//      } else {
//        setAccessDenied(true);
//        setTimeout(() => {
//          router.replace('/'); // 🚫 redireciona se acesso inválido
//        }, 4000);
//      }
//    }, 150); // ⏳ aguarda 300ms para garantir que localStorage esteja pronto
//
//    return () => clearTimeout(delay); // 🧹 limpa timeout ao desmontar
//  }, [router, email, timerKey]);
//
//  // 🕒 Expira sessão após 5 minutos de inatividade
//  useEffect(() => {
//    const interval = setInterval(() => {
//      const last = parseInt(localStorage.getItem('lastInteraction:signin'));
//      if (last && Date.now() - last > 5 * 60 * 1000) {
//        localStorage.removeItem('canAccessConfirm');
//        localStorage.removeItem('signinEmail');
//        localStorage.removeItem(timerKey);
//        localStorage.removeItem('lastInteraction:signin');
//        router.replace('/');
//      }
//    }, 10000); // verifica a cada 10s
//
//    return () => clearInterval(interval);
//  }, []);
//
//  // 🧠 Atualiza interação em qualquer ação
//  const updateInteraction = () => {
//    localStorage.setItem('lastInteraction:signin', Date.now().toString());
//  };
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
//  // ⏳ Atualiza contador regressivo
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
//  // ⏳ Delay inicial para evitar clique precoce
//  useEffect(() => {
//    const delay = setTimeout(() => {
//      setInitialDelay(false);
//    }, 1500);
//    return () => clearTimeout(delay);
//  }, []);
//
//  async function handleConfirm(fullCode) {
//    setError('');
//    setOtpError(false); // 👈 limpa erro visual
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode }),
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
//        setOtpError(true); // 👈 ativa erro visual
//      }
//    } catch (err) {
//      console.error('Confirm error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//      setOtpError(true); // 👈 ativa erro visual
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  async function handleResendCode() {
//    setResending(true);
//    setError('');
//    setOtpError(false); // 👈 limpa erro visual
//
//    const now = Date.now();
//    localStorage.setItem(timerKey, now.toString());
//    setStartedAt(now);
//    setCanResend(false);
//    setResendTimer(120);
//
//    try {
//      const res = await fetch('/api/send-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//      } else if (!data.codeSent) {
//        setError('⏳ Código já foi enviado recentemente. Aguarde o tempo de espera.');
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setResending(false);
//    }
//  }
//
//    // ⛔️ Se ainda não verificou ou negado acesso, não renderiza nada
//  if (!isReady && !accessDenied) return null;
//
//  // 🚫 Página negada — redireciona após 4s
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
//  // ✅ Página de confirmação
//  return (
//    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//        <div className="relative flex flex-col items-center justify-center">
//          <div className="mb-6 flex flex-col items-center gap-2 text-center">
//            {/* 🔙 Botão de voltar */}
//            <button
//              className="absolute top-0 cursor-pointer sm:left-10"
//              onClick={() => {
//                updateInteraction();
//                router.back(); //router.push(`/${lang}/signin`);
//              }}
//            >
//              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
//              </svg>
//            </button>
//
//            {/* 🖼️ Logo */}
//            <img src="/logo.png" alt="Virtus Cloud" className="mb-4 block w-28" />
//          </div>
//
//          <div className="space-y-4">
//            {/* 📝 Título e descrição */}
//            <div className="flex max-w-96 flex-col items-center gap-2 text-center">
//              <h1 className="font-bold text-2xl">{dict.confirmTitle}</h1>
//              <span className="text-secondary text-sm">{dict.confirmDescription}</span>
//            </div>
//
//            {/* 🔢 Campo de código */}
//            <form>
//              <div className="mx-auto flex flex-col gap-4">
//                <div className="mx-auto w-fit">
//                  <OTPInput
//                    length={CODE_LENGTH}
//                    onComplete={code => {
//                      updateInteraction();
//                      handleConfirm(code);
//                    }}
//                    error={otpError}
//                  />
//                </div>
//              </div>
//            </form>
//
//            {/* ✅ Mensagens de sucesso/erro */}
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
//            {/* 🧭 Ações secundárias */}
//            <div className="flex flex-col items-center justify-center space-y-3 mt-6">
//              {/* 📬 Link dinâmico para caixa de entrada */}
//              <a
//                className="flex w-full items-center justify-center gap-2 text-link text-sm"
//                target="_blank"
//                href={`https://${email.split('@')[1]}`}
//                onClick={updateInteraction}
//              >
//                Ir para caixa de entrada
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
//                </svg>
//              </a>
//
//              {/* 🔄 Trocar conta + Reenviar código */}
//              <div className="space-y-1.5 text-center">
//                <p className="text-nowrap text-secondary text-sm max-sm:justify-center">
//                  Não é {email}?{' '}
//                  <a className="text-link" href={`/${lang}/signin?state=reset`} onClick={updateInteraction}>
//                    Trocar de conta
//                  </a>
//                </p>
//
//                <button
//                  onClick={() => {
//                    updateInteraction();
//                    handleResendCode();
//                  }}
//                  disabled={!canResend || resending || initialDelay}
//                  className={`flex w-full cursor-pointer justify-center text-link text-sm ${
//                    !canResend || resending || initialDelay ? 'opacity-50 cursor-not-allowed' : 'hover:underline'
//                  }`}
//                >
//                  {resending
//                    ? dict.sending || 'Reenviando...'
//                    : resendTimer !== null
//                    ? !canResend
//                      ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//                      : dict.resendCode || 'Não recebi o código de acesso'
//                    : dict.resendCode || 'Não recebi o código de acesso'}
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signin/confirm/page.jsx

//'use client';
//
//import { useState, useEffect } from 'react';
//import { useRouter, useSearchParams, usePathname } from 'next/navigation';
//import { messages } from '../messages';
//import { commonMessages } from '@/app/i18n/commonMessages';
//import OTPInput from '@/components/OTPInput';
//import '../../../styles/virtus.css';
//
//// 🌐 Detecta idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//// ⏱️ Formata tempo em mm:ss
//function formatTime(seconds) {
//  const m = Math.floor(seconds / 60);
//  const s = seconds % 60;
//  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//}
//
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const timerKey = `resendStartedAt:signin:${email}`;
//  const CODE_LENGTH = 8;
//
//  const [startedAt, setStartedAt] = useState(null);
//  const [error, setError] = useState('');
//  const [otpError, setOtpError] = useState(false);
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//  const [initialDelay, setInitialDelay] = useState(true);
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(true);
//
//  // 🔐 Verifica se o usuário pode acessar a página
//  useEffect(() => {
//    const allowed = localStorage.getItem('canAccessConfirm');
//    const storedEmail = localStorage.getItem('signinEmail');
//    const requestedAtRaw = localStorage.getItem(timerKey);
//    const requestedAt = parseInt(requestedAtRaw);
//
//    const isValid =
//      allowed === 'true' &&
//      storedEmail === email &&
//      requestedAt &&
//      Date.now() - requestedAt <= 30 * 60 * 1000; // ⏳ 30 minutos de validade
//
//    if (isValid) {
//      setIsReady(true);
//      localStorage.setItem('lastInteraction:signin', Date.now().toString()); // 🕒 marca início
//    } else {
//      setAccessDenied(true);
//      setTimeout(() => {
//        router.replace('/');
//      }, 4000);
//    }
//  }, [router]);
//
//  // 🕒 Expira sessão após 5 minutos de inatividade
//  useEffect(() => {
//    const interval = setInterval(() => {
//      const last = parseInt(localStorage.getItem('lastInteraction:signin'));
//      if (last && Date.now() - last > 5 * 60 * 1000) {
//        localStorage.removeItem('canAccessConfirm');
//        localStorage.removeItem('signinEmail');
//        localStorage.removeItem(timerKey);
//        localStorage.removeItem('lastInteraction:signin');
//        router.replace('/');
//      }
//    }, 10000); // verifica a cada 10s
//
//    return () => clearInterval(interval);
//  }, []);
//
//  // 🧠 Atualiza interação em qualquer ação
//  const updateInteraction = () => {
//    localStorage.setItem('lastInteraction:signin', Date.now().toString());
//  };
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
//  // ⏳ Atualiza contador regressivo
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
//  // ⏳ Delay inicial para evitar clique precoce
//  useEffect(() => {
//    const delay = setTimeout(() => {
//      setInitialDelay(false);
//    }, 1500);
//    return () => clearTimeout(delay);
//  }, []);
//
//  async function handleConfirm(fullCode) {
//    setError('');
//    setOtpError(false); // 👈 limpa erro visual
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode }),
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
//        setOtpError(true); // 👈 ativa erro visual
//      }
//    } catch (err) {
//      console.error('Confirm error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//      setOtpError(true); // 👈 ativa erro visual
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  async function handleResendCode() {
//    setResending(true);
//    setError('');
//    setOtpError(false); // 👈 limpa erro visual
//
//    const now = Date.now();
//    localStorage.setItem(timerKey, now.toString());
//    setStartedAt(now);
//    setCanResend(false);
//    setResendTimer(120);
//
//    try {
//      const res = await fetch('/api/send-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//      } else if (!data.codeSent) {
//        setError('⏳ Código já foi enviado recentemente. Aguarde o tempo de espera.');
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setResending(false);
//    }
//  }
//
//    // ⛔️ Se ainda não verificou ou negado acesso, não renderiza nada
//  if (!isReady && !accessDenied) return null;
//
//  // 🚫 Página negada — redireciona após 4s
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
//  // ✅ Página de confirmação
//  return (
//    <main className="min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//      <div className="xs:w-126 xs:rounded-md xs:border xs:border-border xs:bg-background px-4 py-12 xs:shadow-sm">
//        <div className="relative flex flex-col items-center justify-center">
//          <div className="mb-6 flex flex-col items-center gap-2 text-center">
//            {/* 🔙 Botão de voltar */}
//            <button
//              className="absolute top-0 cursor-pointer sm:left-10"
//              onClick={() => {
//                updateInteraction();
//                router.push(`/${lang}/signin`);
//              }}
//            >
//              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
//              </svg>
//            </button>
//
//            {/* 🖼️ Logo */}
//            <img src="/logo.png" alt="Virtus Cloud" className="mb-4 block w-28" />
//          </div>
//
//          <div className="space-y-4">
//            {/* 📝 Título e descrição */}
//            <div className="flex max-w-96 flex-col items-center gap-2 text-center">
//              <h1 className="font-bold text-2xl">{dict.confirmTitle}</h1>
//              <span className="text-secondary text-sm">{dict.confirmDescription}</span>
//            </div>
//
//            {/* 🔢 Campo de código */}
//            <form>
//              <div className="mx-auto flex flex-col gap-4">
//                <div className="mx-auto w-fit">
//                  <OTPInput
//                    length={CODE_LENGTH}
//                    onComplete={code => {
//                      updateInteraction();
//                      handleConfirm(code);
//                    }}
//                    error={otpError}
//                  />
//                </div>
//              </div>
//            </form>
//
//            {/* ✅ Mensagens de sucesso/erro */}
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
//            {/* 🧭 Ações secundárias */}
//            <div className="flex flex-col items-center justify-center space-y-3 mt-6">
//              {/* 📬 Link dinâmico para caixa de entrada */}
//              <a
//                className="flex w-full items-center justify-center gap-2 text-link text-sm"
//                target="_blank"
//                href={`https://${email.split('@')[1]}`}
//                onClick={updateInteraction}
//              >
//                Ir para caixa de entrada
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
//                </svg>
//              </a>
//
//              {/* 🔄 Trocar conta + Reenviar código */}
//              <div className="space-y-1.5 text-center">
//                <p className="text-nowrap text-secondary text-sm max-sm:justify-center">
//                  Não é {email}?{' '}
//                  <a className="text-link" href={`/${lang}/signin?state=reset`} onClick={updateInteraction}>
//                    Trocar de conta
//                  </a>
//                </p>
//
//                <button
//                  onClick={() => {
//                    updateInteraction();
//                    handleResendCode();
//                  }}
//                  disabled={!canResend || resending || initialDelay}
//                  className={`flex w-full cursor-pointer justify-center text-link text-sm ${
//                    !canResend || resending || initialDelay ? 'opacity-50 cursor-not-allowed' : 'hover:underline'
//                  }`}
//                >
//                  {resending
//                    ? dict.sending || 'Reenviando...'
//                    : resendTimer !== null
//                    ? !canResend
//                      ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//                      : dict.resendCode || 'Não recebi o código de acesso'
//                    : dict.resendCode || 'Não recebi o código de acesso'}
//                </button>
//              </div>
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
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const timerKey = `resendStartedAt:signin:${email}`;
//  const CODE_LENGTH = 8;
//
//  const [startedAt, setStartedAt] = useState(null);
//  const [error, setError] = useState('');
//  const [otpError, setOtpError] = useState(false); // 👈 novo estado
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//  const [initialDelay, setInitialDelay] = useState(true);
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(true);
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
//  useEffect(() => {
//    const delay = setTimeout(() => {
//      setInitialDelay(false);
//    }, 1500);
//    return () => clearTimeout(delay);
//  }, []);
//
//  async function handleConfirm(fullCode) {
//    setError('');
//    setOtpError(false); // 👈 limpa erro visual
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode }),
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
//        setOtpError(true); // 👈 ativa erro visual
//      }
//    } catch (err) {
//      console.error('Confirm error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//      setOtpError(true); // 👈 ativa erro visual
//    } finally {
//      setLoading(false);
//    }
//  }
//
//  async function handleResendCode() {
//    setResending(true);
//    setError('');
//    setOtpError(false); // 👈 limpa erro visual
//
//    const now = Date.now();
//    localStorage.setItem(timerKey, now.toString());
//    setStartedAt(now);
//    setCanResend(false);
//    setResendTimer(120);
//
//    try {
//      const res = await fetch('/api/send-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//      } else if (!data.codeSent) {
//        setError('⏳ Código já foi enviado recentemente. Aguarde o tempo de espera.');
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setResending(false);
//    }
//  }
//
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
//            {/* Ícone de voltar */}
//            <button className="absolute top-0 cursor-pointer sm:left-10" onClick={() => router.push(`/${lang}/signin`)}>
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
//                    error={!!error}
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
//              <a
//                className="flex w-full items-center justify-center gap-2 text-link text-sm"
//                target="_blank"
//                href="https://mail.google.com/"
//              >
//                Ir para caixa de entrada
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
//                </svg>
//              </a>
//
//              <div className="space-y-1.5 text-center">
//                <p className="text-nowrap text-secondary text-sm max-sm:justify-center">
//                  Não é {email}?{' '}
//                  <a className="text-link" href={`/${lang}/signin?state=reset`}>
//                    Trocar de conta
//                  </a>
//                </p>
//
//                <button
//                  onClick={handleResendCode}
//                  disabled={!canResend || resending || initialDelay}
//                  className={`flex w-full cursor-pointer justify-center text-link text-sm ${!canResend || resending || initialDelay ? 'opacity-50 cursor-not-allowed' : 'hover:underline'
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

//frontend/src/app/[lang]/signin/confirm/page.jsx

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
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const timerKey = `resendStartedAt:signin:${email}`;
//  const CODE_LENGTH = 8;
//
//  const [startedAt, setStartedAt] = useState(null);
//  const [error, setError] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//  const [initialDelay, setInitialDelay] = useState(true);
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(true);
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
//  useEffect(() => {
//    const delay = setTimeout(() => {
//      setInitialDelay(false);
//    }, 1500);
//    return () => clearTimeout(delay);
//  }, []);
//
//  async function handleConfirm(fullCode) {
//    setError('');
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode }),
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
//
//    const now = Date.now();
//    localStorage.setItem(timerKey, now.toString());
//    setStartedAt(now);
//    setCanResend(false);
//    setResendTimer(120);
//
//    try {
//      const res = await fetch('/api/send-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//      } else if (!data.codeSent) {
//        setError('⏳ Código já foi enviado recentemente. Aguarde o tempo de espera.');
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setResending(false);
//    }
//  }
//
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
//            {/* Ícone de voltar */}
//            <button className="absolute top-0 cursor-pointer sm:left-10" onClick={() => router.push(`/${lang}/signin`)}>
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
//                    error={!!error}
//                  />
//                </div>
//              </div>
//            </form>
//
//                        {/* Mensagens */}
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
//              <a
//                className="flex w-full items-center justify-center gap-2 text-link text-sm"
//                target="_blank"
//                href="https://mail.google.com/"
//              >
//                Ir para caixa de entrada
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
//                </svg>
//              </a>
//
//              <div className="space-y-1.5 text-center">
//                <p className="text-nowrap text-secondary text-sm max-sm:justify-center">
//                  Não é {email}?{' '}
//                  <a className="text-link" href={`/${lang}/signin?state=reset`}>
//                    Trocar de conta
//                  </a>
//                </p>
//
//                <button
//                  onClick={handleResendCode}
//                  disabled={!canResend || resending || initialDelay}
//                  className={`flex w-full cursor-pointer justify-center text-link text-sm ${
//                    !canResend || resending || initialDelay ? 'opacity-50 cursor-not-allowed' : 'hover:underline'
//                  }`}
//                >
//                  {resending
//                    ? dict.sending || 'Reenviando...'
//                    : resendTimer !== null
//                    ? !canResend
//                      ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//                      : dict.resendCode || 'Não recebi o código de acesso'
//                    : dict.resendCode || 'Não recebi o código de acesso'}
//                </button>
//              </div>
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
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const timerKey = `resendStartedAt:signin:${email}`;
//  const CODE_LENGTH = 8;
//
//  const [startedAt, setStartedAt] = useState(null);
//  const [error, setError] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//  const [initialDelay, setInitialDelay] = useState(true);
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(true);
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
//  useEffect(() => {
//    const delay = setTimeout(() => {
//      setInitialDelay(false);
//    }, 1500);
//    return () => clearTimeout(delay);
//  }, []);
//
//  async function handleConfirm(fullCode) {
//    setError('');
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode }),
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
//
//    const now = Date.now();
//    localStorage.setItem(timerKey, now.toString());
//    setStartedAt(now);
//    setCanResend(false);
//    setResendTimer(120);
//
//    try {
//      const res = await fetch('/api/send-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//      } else if (!data.codeSent) {
//        setError('⏳ Código já foi enviado recentemente. Aguarde o tempo de espera.');
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setResending(false);
//    }
//  }
//
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
//            {/* Ícone de voltar */}
//            <button className="absolute top-0 cursor-pointer sm:left-10" onClick={() => router.push(`/${lang}/signin`)}>
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
//                    error={!!error}
//                  />
//                </div>
//              </div>
//            </form>
//
//                        {/* Mensagens */}
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
//              <a
//                className="flex w-full items-center justify-center gap-2 text-link text-sm"
//                target="_blank"
//                href="https://mail.google.com/"
//              >
//                Ir para caixa de entrada
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
//                </svg>
//              </a>
//
//              <div className="space-y-1.5 text-center">
//                <p className="text-nowrap text-secondary text-sm max-sm:justify-center">
//                  Não é {email}?{' '}
//                  <a className="text-link" href={`/${lang}/signin?state=reset`}>
//                    Trocar de conta
//                  </a>
//                </p>
//
//                <button
//                  onClick={handleResendCode}
//                  disabled={!canResend || resending || initialDelay}
//                  className={`flex w-full cursor-pointer justify-center text-link text-sm ${
//                    !canResend || resending || initialDelay ? 'opacity-50 cursor-not-allowed' : 'hover:underline'
//                  }`}
//                >
//                  {resending
//                    ? dict.sending || 'Reenviando...'
//                    : resendTimer !== null
//                    ? !canResend
//                      ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//                      : dict.resendCode || 'Não recebi o código de acesso'
//                    : dict.resendCode || 'Não recebi o código de acesso'}
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
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
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const timerKey = `resendStartedAt:signin:${email}`;
//
//  const CODE_LENGTH = 8;
//  const [codeBlocks, setCodeBlocks] = useState(Array(CODE_LENGTH).fill(''));
//  const inputsRef = useRef([]);
//  const [startedAt, setStartedAt] = useState(null);
//  const [error, setError] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//  const [initialDelay, setInitialDelay] = useState(true);
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(true); // ← liberado ao entrar
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
//  useEffect(() => {
//    const fullCode = codeBlocks.join('');
//    if (fullCode.length === CODE_LENGTH && !loading && !success) {
//      handleConfirm(fullCode);
//    }
//  }, [codeBlocks]);
//
//  function handleInputChange(index, value) {
//    if (!/^[0-9a-zA-Z]?$/.test(value)) return;
//
//    const updated = [...codeBlocks];
//    updated[index] = value.toUpperCase();
//    setCodeBlocks(updated);
//
//    if (value && index < CODE_LENGTH - 1) {
//      inputsRef.current[index + 1]?.focus();
//    }
//  }
//  useEffect(() => {
//    const delay = setTimeout(() => {
//      setInitialDelay(false);
//    }, 1500); // ⏱️ 1.5 segundos
//
//    return () => clearTimeout(delay);
//  }, []);
//
//  function handlePaste(e) {
//    const pasted = e.clipboardData.getData('text').slice(0, CODE_LENGTH).split('');
//    const updated = Array(CODE_LENGTH).fill('');
//    pasted.forEach((char, i) => {
//      updated[i] = char.toUpperCase();
//    });
//    setCodeBlocks(updated);
//  }
//  async function handleConfirm(fullCode) {
//    setError('');
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode }),
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
//
//    const now = Date.now(); // ⏱️ define o timestamp logo no início
//    localStorage.setItem(timerKey, now.toString());
//    setStartedAt(now);
//    setCanResend(false);
//    setResendTimer(120);
//
//    try {
//      const res = await fetch('/api/send-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//      } else if (!data.codeSent) {
//        setError('⏳ Código já foi enviado recentemente. Aguarde o tempo de espera.');
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setResending(false);
//    }
//  }
//
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
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
//      <div className="w-full max-w-sm bg-gray-900 rounded-lg p-6 shadow-lg space-y-6 text-center">
//        <h1 className="text-xl font-bold">{dict.confirmTitle}</h1>
//        <p className="text-sm text-gray-400">{dict.confirmDescription}</p>
//
//        {/* 🔢 Blocos de código compactos */}
//        <div className="flex justify-center gap-2">
//          {codeBlocks.map((char, index) => (
//            <input
//              key={index}
//              type="text"
//              maxLength={1}
//              value={char}
//              onChange={e => handleInputChange(index, e.target.value)}
//              onPaste={handlePaste}
//              onKeyDown={(e) => {
//                if (e.key === 'Backspace' && !codeBlocks[index] && index > 0) {
//                  inputsRef.current[index - 1]?.focus();
//                }
//              }}
//              ref={el => (inputsRef.current[index] = el)}
//              className={`w-8 h-10 text-center text-lg font-bold rounded bg-gray-800 text-white border ${error ? 'border-red-500' : 'border-gray-600'
//                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
//            />
//          ))}
//        </div>
//
//        {/* ✅ Mensagem de sucesso */}
//        {success && (
//          <div className="text-green-400 font-medium text-sm flex items-center justify-center gap-1">
//            <span>✔</span> {dict.success}
//          </div>
//        )}
//
//        {/* ⚠️ Mensagem de erro */}
//        {error && (
//          <div className="text-red-400 font-medium text-sm flex items-center justify-center gap-1">
//            <span>⚠</span> {error}
//          </div>
//        )}
//
//        {/* 🔁 Ações secundárias */}
//        <div className="space-y-2 text-sm text-gray-400">
//          <button
//            onClick={() => router.push(`/${lang}/signin`)}
//            className="hover:underline block"
//          >
//            Não é: {email}? Trocar de conta
//          </button>
//
//          <button
//            onClick={handleResendCode}
//            disabled={!canResend || resending || initialDelay}
//            className={`block ${!canResend || resending || initialDelay ? 'text-gray-600' : 'text-red-400 hover:underline'
//              }`}
//          >
//            {resending
//              ? dict.sending || 'Reenviando...'
//              : resendTimer !== null
//                ? !canResend
//                  ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//                  : dict.resendCode || 'Não recebi o código de acesso'
//                : dict.resendCode || 'Não recebi o código de acesso'}
//          </button>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signin/confirm/page.jsx

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
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
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const timerKey = `resendStartedAt:signin:${email}`;
//
//  const CODE_LENGTH = 8;
//  const [codeBlocks, setCodeBlocks] = useState(Array(CODE_LENGTH).fill(''));
//  const inputsRef = useRef([]);
//  const [startedAt, setStartedAt] = useState(null);
//  const [error, setError] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//  const [initialDelay, setInitialDelay] = useState(true);
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(true); // ← liberado ao entrar
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
//  useEffect(() => {
//    const fullCode = codeBlocks.join('');
//    if (fullCode.length === CODE_LENGTH && !loading && !success) {
//      handleConfirm(fullCode);
//    }
//  }, [codeBlocks]);
//
//  function handleInputChange(index, value) {
//    if (!/^[0-9a-zA-Z]?$/.test(value)) return;
//
//    const updated = [...codeBlocks];
//    updated[index] = value.toUpperCase();
//    setCodeBlocks(updated);
//
//    if (value && index < CODE_LENGTH - 1) {
//      inputsRef.current[index + 1]?.focus();
//    }
//  }
//  useEffect(() => {
//    const delay = setTimeout(() => {
//      setInitialDelay(false);
//    }, 1500); // ⏱️ 1.5 segundos
//
//    return () => clearTimeout(delay);
//  }, []);
//
//  function handlePaste(e) {
//    const pasted = e.clipboardData.getData('text').slice(0, CODE_LENGTH).split('');
//    const updated = Array(CODE_LENGTH).fill('');
//    pasted.forEach((char, i) => {
//      updated[i] = char.toUpperCase();
//    });
//    setCodeBlocks(updated);
//  }
//  async function handleConfirm(fullCode) {
//    setError('');
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode }),
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
//
//    const now = Date.now(); // ⏱️ define o timestamp logo no início
//    localStorage.setItem(timerKey, now.toString());
//    setStartedAt(now);
//    setCanResend(false);
//    setResendTimer(120);
//
//    try {
//      const res = await fetch('/api/send-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//      } else if (!data.codeSent) {
//        setError('⏳ Código já foi enviado recentemente. Aguarde o tempo de espera.');
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setResending(false);
//    }
//  }
//
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
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
//      <div className="w-full max-w-sm bg-gray-900 rounded-lg p-6 shadow-lg space-y-6 text-center">
//        <h1 className="text-xl font-bold">{dict.confirmTitle}</h1>
//        <p className="text-sm text-gray-400">{dict.confirmDescription}</p>
//
//        {/* 🔢 Blocos de código compactos */}
//        <div className="flex justify-center gap-2">
//          {codeBlocks.map((char, index) => (
//            <input
//              key={index}
//              type="text"
//              maxLength={1}
//              value={char}
//              onChange={e => handleInputChange(index, e.target.value)}
//              onPaste={handlePaste}
//              onKeyDown={(e) => {
//                if (e.key === 'Backspace' && !codeBlocks[index] && index > 0) {
//                  inputsRef.current[index - 1]?.focus();
//                }
//              }}
//              ref={el => (inputsRef.current[index] = el)}
//              className={`w-8 h-10 text-center text-lg font-bold rounded bg-gray-800 text-white border ${error ? 'border-red-500' : 'border-gray-600'
//                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
//            />
//          ))}
//        </div>
//
//        {/* ✅ Mensagem de sucesso */}
//        {success && (
//          <div className="text-green-400 font-medium text-sm flex items-center justify-center gap-1">
//            <span>✔</span> {dict.success}
//          </div>
//        )}
//
//        {/* ⚠️ Mensagem de erro */}
//        {error && (
//          <div className="text-red-400 font-medium text-sm flex items-center justify-center gap-1">
//            <span>⚠</span> {error}
//          </div>
//        )}
//
//        {/* 🔁 Ações secundárias */}
//        <div className="space-y-2 text-sm text-gray-400">
//          <button
//            onClick={() => router.push(`/${lang}/signin`)}
//            className="hover:underline block"
//          >
//            Não é: {email}? Trocar de conta
//          </button>
//
//          <button
//            onClick={handleResendCode}
//            disabled={!canResend || resending || initialDelay}
//            className={`block ${!canResend || resending || initialDelay ? 'text-gray-600' : 'text-red-400 hover:underline'
//              }`}
//          >
//            {resending
//              ? dict.sending || 'Reenviando...'
//              : resendTimer !== null
//                ? !canResend
//                  ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//                  : dict.resendCode || 'Não recebi o código de acesso'
//                : dict.resendCode || 'Não recebi o código de acesso'}
//          </button>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signin/confirm/page.jsx

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
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
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const timerKey = `resendStartedAt:signin:${email}`;
//
//  const CODE_LENGTH = 8;
//  const [codeBlocks, setCodeBlocks] = useState(Array(CODE_LENGTH).fill(''));
//  const inputsRef = useRef([]);
//  const [startedAt, setStartedAt] = useState(null);
//  const [error, setError] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//  const [initialDelay, setInitialDelay] = useState(true);
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(true); // ← liberado ao entrar
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
//  useEffect(() => {
//    const fullCode = codeBlocks.join('');
//    if (fullCode.length === CODE_LENGTH && !loading && !success) {
//      handleConfirm(fullCode);
//    }
//  }, [codeBlocks]);
//
//  function handleInputChange(index, value) {
//    if (!/^[0-9a-zA-Z]?$/.test(value)) return;
//
//    const updated = [...codeBlocks];
//    updated[index] = value.toUpperCase();
//    setCodeBlocks(updated);
//
//    if (value && index < CODE_LENGTH - 1) {
//      inputsRef.current[index + 1]?.focus();
//    }
//  }
//  useEffect(() => {
//    const delay = setTimeout(() => {
//      setInitialDelay(false);
//    }, 1500); // ⏱️ 1.5 segundos
//
//    return () => clearTimeout(delay);
//  }, []);
//
//  function handlePaste(e) {
//    const pasted = e.clipboardData.getData('text').slice(0, CODE_LENGTH).split('');
//    const updated = Array(CODE_LENGTH).fill('');
//    pasted.forEach((char, i) => {
//      updated[i] = char.toUpperCase();
//    });
//    setCodeBlocks(updated);
//  }
//  async function handleConfirm(fullCode) {
//    setError('');
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode }),
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
//
//    const now = Date.now(); // ⏱️ define o timestamp logo no início
//    localStorage.setItem(timerKey, now.toString());
//    setStartedAt(now);
//    setCanResend(false);
//    setResendTimer(120);
//
//    try {
//      const res = await fetch('/api/send-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//      } else if (!data.codeSent) {
//        setError('⏳ Código já foi enviado recentemente. Aguarde o tempo de espera.');
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setResending(false);
//    }
//  }
//
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
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
//      <div className="w-full max-w-sm bg-gray-900 rounded-lg p-6 shadow-lg space-y-6 text-center">
//        <h1 className="text-xl font-bold">{dict.confirmTitle}</h1>
//        <p className="text-sm text-gray-400">{dict.confirmDescription}</p>
//
//        {/* 🔢 Blocos de código compactos */}
//        <div className="flex justify-center gap-2">
//          {codeBlocks.map((char, index) => (
//            <input
//              key={index}
//              type="text"
//              maxLength={1}
//              value={char}
//              onChange={e => handleInputChange(index, e.target.value)}
//              onPaste={handlePaste}
//              onKeyDown={(e) => {
//                if (e.key === 'Backspace' && !codeBlocks[index] && index > 0) {
//                  inputsRef.current[index - 1]?.focus();
//                }
//              }}
//              ref={el => (inputsRef.current[index] = el)}
//              className={`w-8 h-10 text-center text-lg font-bold rounded bg-gray-800 text-white border ${error ? 'border-red-500' : 'border-gray-600'
//                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
//            />
//          ))}
//        </div>
//
//        {/* ✅ Mensagem de sucesso */}
//        {success && (
//          <div className="text-green-400 font-medium text-sm flex items-center justify-center gap-1">
//            <span>✔</span> {dict.success}
//          </div>
//        )}
//
//        {/* ⚠️ Mensagem de erro */}
//        {error && (
//          <div className="text-red-400 font-medium text-sm flex items-center justify-center gap-1">
//            <span>⚠</span> {error}
//          </div>
//        )}
//
//        {/* 🔁 Ações secundárias */}
//        <div className="space-y-2 text-sm text-gray-400">
//          <button
//            onClick={() => {
//              localStorage.removeItem(timerKey); // ⏱️ limpa o timer ao trocar de conta
//              router.push(`/${lang}/signin`);
//            }}
//            className="hover:underline block"
//          >
//            Não é: {email}? Trocar de conta
//          </button>
//
//          <button
//            onClick={handleResendCode}
//            disabled={!canResend || resending || initialDelay}
//            className={`block ${!canResend || resending || initialDelay ? 'text-gray-600' : 'text-red-400 hover:underline'
//              }`}
//          >
//            {resending
//              ? dict.sending || 'Reenviando...'
//              : resendTimer !== null
//                ? !canResend
//                  ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//                  : dict.resendCode || 'Não recebi o código de acesso'
//                : dict.resendCode || 'Não recebi o código de acesso'}
//          </button>
//        </div>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/signin/confirm/page.jsx

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
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
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const timerKey = `resendStartedAt:signin:${email}`;
//
//  const CODE_LENGTH = 8;
//  const [codeBlocks, setCodeBlocks] = useState(Array(CODE_LENGTH).fill(''));
//  const inputsRef = useRef([]);
//  const [startedAt, setStartedAt] = useState(null);
//  const [error, setError] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//  const [initialDelay, setInitialDelay] = useState(true);
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(true); // ← liberado ao entrar
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
//  useEffect(() => {
//    const fullCode = codeBlocks.join('');
//    if (fullCode.length === CODE_LENGTH && !loading && !success) {
//      handleConfirm(fullCode);
//    }
//  }, [codeBlocks]);
//
//  function handleInputChange(index, value) {
//    if (!/^[0-9a-zA-Z]?$/.test(value)) return;
//
//    const updated = [...codeBlocks];
//    updated[index] = value.toUpperCase();
//    setCodeBlocks(updated);
//
//    if (value && index < CODE_LENGTH - 1) {
//      inputsRef.current[index + 1]?.focus();
//    }
//  }
//  useEffect(() => {
//    const delay = setTimeout(() => {
//      setInitialDelay(false);
//    }, 1500); // ⏱️ 1.5 segundos
//
//    return () => clearTimeout(delay);
//  }, []);
//
//  function handlePaste(e) {
//    const pasted = e.clipboardData.getData('text').slice(0, CODE_LENGTH).split('');
//    const updated = Array(CODE_LENGTH).fill('');
//    pasted.forEach((char, i) => {
//      updated[i] = char.toUpperCase();
//    });
//    setCodeBlocks(updated);
//  }
//  async function handleConfirm(fullCode) {
//    setError('');
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode }),
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
//
//    const now = Date.now(); // ⏱️ define o timestamp logo no início
//    localStorage.setItem(timerKey, now.toString());
//    setStartedAt(now);
//    setCanResend(false);
//    setResendTimer(120);
//
//    try {
//      const res = await fetch('/api/send-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//      } else if (!data.codeSent) {
//        setError('⏳ Código já foi enviado recentemente. Aguarde o tempo de espera.');
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setResending(false);
//    }
//  }
//
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
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
//      <div className="w-full max-w-sm bg-gray-900 rounded-lg p-6 shadow-lg space-y-6 text-center">
//        <h1 className="text-xl font-bold">{dict.confirmTitle}</h1>
//        <p className="text-sm text-gray-400">{dict.confirmDescription}</p>
//
//        {/* 🔢 Blocos de código compactos */}
//        <div className="flex justify-center gap-2">
//          {codeBlocks.map((char, index) => (
//            <input
//              key={index}
//              type="text"
//              maxLength={1}
//              value={char}
//              onChange={e => handleInputChange(index, e.target.value)}
//              onPaste={handlePaste}
//              onKeyDown={(e) => {
//                if (e.key === 'Backspace' && !codeBlocks[index] && index > 0) {
//                  inputsRef.current[index - 1]?.focus();
//                }
//              }}
//              ref={el => (inputsRef.current[index] = el)}
//              className={`w-8 h-10 text-center text-lg font-bold rounded bg-gray-800 text-white border ${error ? 'border-red-500' : 'border-gray-600'
//                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
//            />
//          ))}
//        </div>
//
//        {/* ✅ Mensagem de sucesso */}
//        {success && (
//          <div className="text-green-400 font-medium text-sm flex items-center justify-center gap-1">
//            <span>✔</span> {dict.success}
//          </div>
//        )}
//
//        {/* ⚠️ Mensagem de erro */}
//        {error && (
//          <div className="text-red-400 font-medium text-sm flex items-center justify-center gap-1">
//            <span>⚠</span> {error}
//          </div>
//        )}
//
//        {/* 🔁 Ações secundárias */}
//        <div className="space-y-2 text-sm text-gray-400">
//          <button
//            onClick={() => router.push(`/${lang}/signin`)}
//            className="hover:underline block"
//          >
//            Não é: {email}? Trocar de conta
//          </button>
//
//          <button
//            onClick={handleResendCode}
//            disabled={!canResend || resending || initialDelay}
//            className={`block ${!canResend || resending || initialDelay ? 'text-gray-600' : 'text-red-400 hover:underline'
//              }`}
//          >
//            {resending
//              ? dict.sending || 'Reenviando...'
//              : resendTimer !== null
//                ? !canResend
//                  ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//                  : dict.resendCode || 'Não recebi o código de acesso'
//                : dict.resendCode || 'Não recebi o código de acesso'}
//          </button>
//        </div>
//      </div>
//    </main>
//  );
//}

//useEffect(() => {
//  const startedAtRaw = localStorage.getItem(timerKey);
//  let startedAt = parseInt(startedAtRaw);
//
//  // ⏱️ Se não houver timer salvo, inicia agora
//  if (!startedAtRaw || isNaN(startedAt)) {
//    startedAt = Date.now();
//    localStorage.setItem(timerKey, startedAt.toString());
//    setCanResend(false);
//    setResendTimer(120);
//  }
//
//  const timer = setInterval(() => {
//    const now = Date.now();
//    const elapsed = Math.floor((now - startedAt) / 1000);
//    const updatedRemaining = Math.max(120 - elapsed, 0);
//    setResendTimer(updatedRemaining);
//    setCanResend(updatedRemaining === 0);
//
//    if (updatedRemaining === 0) {
//      clearInterval(timer);
//    }
//  }, 1000);
//
//  return () => clearInterval(timer);
//}, [timerKey]);

//async function handleResendCode() {
//  setResending(true);
//  setError('');
//  try {
//    const res = await fetch('/api/send-code/signin', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ email }),
//    });
//
//    const data = await res.json();
//    if (!res.ok || !data.success) {
//      setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//    } else if (data.codeSent) {
//      localStorage.setItem(timerKey, Date.now().toString()); // ⏱️ inicia timer local
//      setStartedAt(now);
//      setCanResend(false);
//      setResendTimer(120);
//    } else {
//      setError('⏳ Código já foi enviado recentemente. Aguarde o tempo de espera.');
//    }
//  } catch (err) {
//    console.error('Resend error:', err);
//    setError(dict.networkError || 'Erro de rede ou servidor');
//  } finally {
//    setResending(false);
//  }
//}

//frontend/src/app/[lang]/signin/confirm/page.jsx

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
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
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const timerKey = `resendStartedAt:signin:${email}`;
//
//  const CODE_LENGTH = 8;
//  const [codeBlocks, setCodeBlocks] = useState(Array(CODE_LENGTH).fill(''));
//  const inputsRef = useRef([]);
//
//  const [error, setError] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//  const [accessDenied, setAccessDenied] = useState(false);
//  const [isReady, setIsReady] = useState(false);
//
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(true); // ← liberado ao entrar
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
//
//    if (!startedAtRaw || isNaN(startedAt)) {
//      return; // timer só começa após clique em reenviar
//    }
//
//    const timer = setInterval(() => {
//      const now = Date.now();
//      const elapsed = Math.floor((now - startedAt) / 1000);
//      const updatedRemaining = Math.max(120 - elapsed, 0);
//      setResendTimer(updatedRemaining);
//      setCanResend(updatedRemaining === 0);
//
//      if (updatedRemaining === 0) {
//        clearInterval(timer);
//      }
//    }, 1000);
//
//    return () => clearInterval(timer);
//  }, [timerKey]);
//
//  useEffect(() => {
//    const fullCode = codeBlocks.join('');
//    if (fullCode.length === CODE_LENGTH && !loading && !success) {
//      handleConfirm(fullCode);
//    }
//  }, [codeBlocks]);
//
//  function handleInputChange(index, value) {
//    if (!/^[0-9a-zA-Z]?$/.test(value)) return;
//
//    const updated = [...codeBlocks];
//    updated[index] = value.toUpperCase();
//    setCodeBlocks(updated);
//
//    if (value && index < CODE_LENGTH - 1) {
//      inputsRef.current[index + 1]?.focus();
//    }
//  }
//
//  function handlePaste(e) {
//    const pasted = e.clipboardData.getData('text').slice(0, CODE_LENGTH).split('');
//    const updated = Array(CODE_LENGTH).fill('');
//    pasted.forEach((char, i) => {
//      updated[i] = char.toUpperCase();
//    });
//    setCodeBlocks(updated);
//  }
//  async function handleConfirm(fullCode) {
//    setError('');
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode }),
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
//      const res = await fetch('/api/send-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//      } else if (data.codeSent) {
//        localStorage.setItem(timerKey, Date.now().toString()); // ⏱️ inicia timer local
//        setCanResend(false);
//        setResendTimer(120);
//      } else {
//        setError('⏳ Código já foi enviado recentemente. Aguarde o tempo de espera.');
//      }
//    } catch (err) {
//      console.error('Resend error:', err);
//      setError(dict.networkError || 'Erro de rede ou servidor');
//    } finally {
//      setResending(false);
//    }
//  }
//
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
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
//      <div className="w-full max-w-sm bg-gray-900 rounded-lg p-6 shadow-lg space-y-6 text-center">
//        <h1 className="text-xl font-bold">{dict.confirmTitle}</h1>
//        <p className="text-sm text-gray-400">{dict.confirmDescription}</p>
//
//        {/* 🔢 Blocos de código compactos */}
//        <div className="flex justify-center gap-2">
//          {codeBlocks.map((char, index) => (
//            <input
//              key={index}
//              type="text"
//              maxLength={1}
//              value={char}
//              onChange={e => handleInputChange(index, e.target.value)}
//              onPaste={handlePaste}
//              onKeyDown={(e) => {
//                if (e.key === 'Backspace' && !codeBlocks[index] && index > 0) {
//                  inputsRef.current[index - 1]?.focus();
//                }
//              }}
//              ref={el => (inputsRef.current[index] = el)}
//              className={`w-8 h-10 text-center text-lg font-bold rounded bg-gray-800 text-white border ${error ? 'border-red-500' : 'border-gray-600'
//                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
//            />
//          ))}
//        </div>
//
//        {/* ✅ Mensagem de sucesso */}
//        {success && (
//          <div className="text-green-400 font-medium text-sm flex items-center justify-center gap-1">
//            <span>✔</span> {dict.success}
//          </div>
//        )}
//
//        {/* ⚠️ Mensagem de erro */}
//        {error && (
//          <div className="text-red-400 font-medium text-sm flex items-center justify-center gap-1">
//            <span>⚠</span> {error}
//          </div>
//        )}
//
//        {/* 🔁 Ações secundárias */}
//        <div className="space-y-2 text-sm text-gray-400">
//          <button
//            onClick={() => router.push(`/${lang}/signin`)}
//            className="hover:underline block"
//          >
//            Não é: {email}? Trocar de conta
//          </button>
//
//          <button
//            onClick={handleResendCode}
//            disabled={!canResend || resending}
//            className={`block ${!canResend || resending ? 'text-gray-600' : 'text-red-400 hover:underline'
//              }`}
//          >
//            {resending
//              ? dict.sending || 'Reenviando...'
//              : resendTimer !== null
//                ? !canResend
//                  ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//                  : dict.resendCode || 'Não recebi o código de acesso'
//                : dict.resendCode || 'Não recebi o código de acesso'}
//          </button>
//        </div>
//      </div>
//    </main>
//  );
//}

//async function handleResendCode() {
//  setResending(true);
//  setError('');
//  try {
//    const res = await fetch('/api/send-code/signin', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ email }),
//    });
//
//    const data = await res.json();
//    if (!res.ok || !data.success) {
//      setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//    } else {
//      localStorage.setItem(timerKey, Date.now().toString());
//      setCanResend(false);
//      setResendTimer(120);
//    }
//  } catch (err) {
//    console.error('Resend error:', err);
//    setError(dict.networkError || 'Erro de rede ou servidor');
//  } finally {
//    setResending(false);
//  }
//}

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
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
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const timerKey = `resendStartedAt:signin:${email}`;
//
//  const CODE_LENGTH = 8;
//  const [codeBlocks, setCodeBlocks] = useState(Array(CODE_LENGTH).fill(''));
//  const inputsRef = useRef([]);
//
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
//    const timer = setInterval(() => {
//      const now = Date.now();
//      const elapsed = Math.floor((now - startedAt) / 1000);
//      const updatedRemaining = Math.max(120 - elapsed, 0);
//      setResendTimer(updatedRemaining);
//      setCanResend(updatedRemaining === 0);
//
//      if (updatedRemaining === 0) {
//        clearInterval(timer);
//      }
//    }, 1000);
//
//    return () => clearInterval(timer);
//  }, [timerKey]);
//
//  useEffect(() => {
//    const fullCode = codeBlocks.join('');
//    if (fullCode.length === CODE_LENGTH && !loading && !success) {
//      handleConfirm(fullCode);
//    }
//  }, [codeBlocks]);
//
//  function handleInputChange(index, value) {
//    if (!/^[0-9a-zA-Z]?$/.test(value)) return;
//
//    const updated = [...codeBlocks];
//    updated[index] = value.toUpperCase(); // ← UpperCase
//    setCodeBlocks(updated);
//
//    if (value && index < CODE_LENGTH - 1) {
//      inputsRef.current[index + 1]?.focus();
//    }
//  }
//
//  function handlePaste(e) {
//    const pasted = e.clipboardData.getData('text').slice(0, CODE_LENGTH).split('');
//    const updated = Array(CODE_LENGTH).fill('');
//    pasted.forEach((char, i) => {
//      updated[i] = char;
//    });
//    setCodeBlocks(updated);
//  }
//
//  async function handleConfirm(fullCode) {
//    setError('');
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode }),
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
//      const res = await fetch('/api/send-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
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
//  return (
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
//      <div className="w-full max-w-sm bg-gray-900 rounded-lg p-6 shadow-lg space-y-6 text-center">
//        <h1 className="text-xl font-bold">{dict.confirmTitle}</h1>
//        <p className="text-sm text-gray-400">{dict.confirmDescription}</p>
//
//        {/* 🔢 Blocos de código compactos */}
//        <div className="flex justify-center gap-2">
//          {codeBlocks.map((char, index) => (
//            <input
//              key={index}
//              type="text"
//              maxLength={1}
//              value={char}
//              onChange={e => handleInputChange(index, e.target.value)}
//              onPaste={handlePaste}
//              onKeyDown={(e) => {
//                if (e.key === 'Backspace' && !codeBlocks[index] && index > 0) {
//                  inputsRef.current[index - 1]?.focus();
//                }
//              }}
//              ref={el => (inputsRef.current[index] = el)}
//              className={`w-8 h-10 text-center text-lg font-bold rounded bg-gray-800 text-white border ${error ? 'border-red-500' : 'border-gray-600'
//                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
//            />
//          ))}
//        </div>
//
//        {/* ✅ Mensagem de sucesso */}
//        {success && (
//          <div className="text-green-400 font-medium text-sm flex items-center justify-center gap-1">
//            <span>✔</span> {dict.success}
//          </div>
//        )}
//
//        {/* ⚠️ Mensagem de erro */}
//        {error && (
//          <div className="text-red-400 font-medium text-sm flex items-center justify-center gap-1">
//            <span>⚠</span> {error}
//          </div>
//        )}
//
//        {/* 🔁 Ações secundárias */}
//        <div className="space-y-2 text-sm text-gray-400">
//          <button
//            onClick={() => router.push(`/${lang}/signin`)}
//            className="hover:underline block"
//          >
//            Não é: {email}? Trocar de conta
//          </button>
//
//          <button
//            onClick={handleResendCode}
//            disabled={!canResend || resending}
//            className={`block ${!canResend || resending ? 'text-gray-600' : 'text-red-400 hover:underline'
//              }`}
//          >
//            {resending
//              ? dict.sending || 'Reenviando...'
//              : resendTimer !== null
//                ? !canResend
//                  ? `Aguarde ${formatTime(resendTimer)} para reenviar`
//                  : dict.resendCode || 'Não recebi o código de acesso'
//                : dict.resendCode || 'Não recebi o código de acesso'}
//          </button>
//        </div>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { useState, useEffect, useRef } from 'react';
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
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const timerKey = `resendStartedAt:signin:${email}`;
//
//  const CODE_LENGTH = 8;
//  const [codeBlocks, setCodeBlocks] = useState(Array(CODE_LENGTH).fill(''));
//  const inputsRef = useRef([]);
//
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
//    const timer = setInterval(() => {
//      const now = Date.now();
//      const elapsed = Math.floor((now - startedAt) / 1000);
//      const updatedRemaining = Math.max(120 - elapsed, 0);
//      setResendTimer(updatedRemaining);
//      setCanResend(updatedRemaining === 0);
//
//      if (updatedRemaining === 0) {
//        clearInterval(timer);
//      }
//    }, 1000);
//
//    return () => clearInterval(timer);
//  }, [timerKey]);
//
//  useEffect(() => {
//    const fullCode = codeBlocks.join('');
//    if (fullCode.length === CODE_LENGTH && !loading && !success) {
//      handleConfirm(fullCode);
//    }
//  }, [codeBlocks]);
//
//  function handleInputChange(index, value) {
//    if (!/^[0-9a-zA-Z]?$/.test(value)) return;
//
//    const updated = [...codeBlocks];
//    updated[index] = value;
//    setCodeBlocks(updated);
//
//    if (value && index < CODE_LENGTH - 1) {
//      inputsRef.current[index + 1]?.focus();
//    }
//  }
//
//  function handlePaste(e) {
//    const pasted = e.clipboardData.getData('text').slice(0, CODE_LENGTH).split('');
//    const updated = Array(CODE_LENGTH).fill('');
//    pasted.forEach((char, i) => {
//      updated[i] = char;
//    });
//    setCodeBlocks(updated);
//  }
//
//  async function handleConfirm(fullCode) {
//    setError('');
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode }),
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
//      const res = await fetch('/api/send-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
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
//    return (
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
//      <div className="w-full max-w-sm bg-gray-900 rounded-lg p-6 shadow-lg space-y-6 text-center">
//        <h1 className="text-xl font-bold">{dict.confirmTitle}</h1>
//        <p className="text-sm text-gray-400">{dict.confirmDescription}</p>
//
//        {/* 🔢 Blocos de código compactos */}
//        <div className="flex justify-center gap-2">
//          {codeBlocks.map((char, index) => (
//            <input
//              key={index}
//              type="text"
//              maxLength={1}
//              value={char}
//              onChange={e => handleInputChange(index, e.target.value)}
//              onPaste={handlePaste}
//              ref={el => (inputsRef.current[index] = el)}
//              className={`w-8 h-10 text-center text-lg font-bold rounded bg-gray-800 text-white border ${
//                error ? 'border-red-500' : 'border-gray-600'
//              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
//            />
//          ))}
//        </div>
//
//        {/* ✅ Mensagem de sucesso */}
//        {success && (
//          <div className="text-green-400 font-medium text-sm flex items-center justify-center gap-1">
//            <span>✔</span> {dict.success}
//          </div>
//        )}
//
//        {/* ⚠️ Mensagem de erro */}
//        {error && (
//          <div className="text-red-400 font-medium text-sm flex items-center justify-center gap-1">
//            <span>⚠</span> {error}
//          </div>
//        )}
//
//        {/* 🔁 Ações secundárias */}
//        <div className="space-y-2 text-sm text-gray-400">
//          <button
//            onClick={() => router.push(`/${lang}/signin`)}
//            className="hover:underline block"
//          >
//            Não é: {email}? Trocar de conta
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
//import { useState, useEffect, useRef } from 'react';
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
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const timerKey = `resendStartedAt:signin:${email}`;
//
//  const CODE_LENGTH = 8;
//  const [codeBlocks, setCodeBlocks] = useState(Array(CODE_LENGTH).fill(''));
//  const inputsRef = useRef([]);
//
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
//    const timer = setInterval(() => {
//      const now = Date.now();
//      const elapsed = Math.floor((now - startedAt) / 1000);
//      const updatedRemaining = Math.max(120 - elapsed, 0);
//      setResendTimer(updatedRemaining);
//      setCanResend(updatedRemaining === 0);
//
//      if (updatedRemaining === 0) {
//        clearInterval(timer);
//      }
//    }, 1000);
//
//    return () => clearInterval(timer);
//  }, [timerKey]);
//
//  useEffect(() => {
//    const fullCode = codeBlocks.join('');
//    if (fullCode.length === CODE_LENGTH && !loading && !success) {
//      handleConfirm(fullCode);
//    }
//  }, [codeBlocks]);
//
//  function handleInputChange(index, value) {
//    if (!/^[0-9a-zA-Z]?$/.test(value)) return;
//
//    const updated = [...codeBlocks];
//    updated[index] = value;
//    setCodeBlocks(updated);
//
//    if (value && index < CODE_LENGTH - 1) {
//      inputsRef.current[index + 1]?.focus();
//    }
//  }
//
//  function handlePaste(e) {
//    const pasted = e.clipboardData.getData('text').slice(0, CODE_LENGTH).split('');
//    const updated = Array(CODE_LENGTH).fill('');
//    pasted.forEach((char, i) => {
//      updated[i] = char;
//    });
//    setCodeBlocks(updated);
//  }
//
//  async function handleConfirm(fullCode) {
//    setError('');
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode }),
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
//      const res = await fetch('/api/send-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
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
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6">
//        <h1 className="text-2xl font-bold text-center">{dict.confirmTitle}</h1>
//        <p className="text-sm text-gray-400 text-center">{dict.confirmDescription}</p>
//
//        {/* 🔢 Blocos de código compactos */}
//        <div className="flex justify-center gap-2">
//          {codeBlocks.map((char, index) => (
//            <input
//              key={index}
//              type="text"
//              maxLength={1}
//              value={char}
//              onChange={e => handleInputChange(index, e.target.value)}
//              onPaste={handlePaste}
//              ref={el => (inputsRef.current[index] = el)}
//              className={`w-8 h-10 text-center text-lg font-bold rounded bg-gray-800 text-white border ${
//                error ? 'border-red-500' : 'border-gray-600'
//              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
//            />
//          ))}
//        </div>
//
//        {/* ✅ Mensagem de sucesso */}
//        {success && (
//          <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//            <span>✔</span> {dict.success}
//          </div>
//        )}
//
//        {/* ⚠️ Mensagem de erro */}
//        {error && (
//          <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//            <span>⚠</span> {error}
//          </div>
//        )}
//
//        {/* 🔁 Ações secundárias */}
//        <div className="text-center text-sm text-gray-400 mt-4 space-y-2">
//          <button
//            onClick={() => router.push(`/${lang}/signin`)}
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
//import { useState, useEffect, useRef } from 'react';
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
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const timerKey = `resendStartedAt:signin:${email}`;
//
//  const CODE_LENGTH = 8;
//  const [codeBlocks, setCodeBlocks] = useState(Array(CODE_LENGTH).fill(''));
//  const inputsRef = useRef([]);
//
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
//    const fullCode = codeBlocks.join('');
//    if (fullCode.length === CODE_LENGTH && !loading && !success) {
//      handleConfirm(fullCode);
//    }
//  }, [codeBlocks]);
//
//  function handleInputChange(index, value) {
//    if (!/^[0-9a-zA-Z]?$/.test(value)) return;
//
//    const updated = [...codeBlocks];
//    updated[index] = value;
//    setCodeBlocks(updated);
//
//    if (value && index < CODE_LENGTH - 1) {
//      inputsRef.current[index + 1]?.focus();
//    }
//  }
//
//  function handlePaste(e) {
//    const pasted = e.clipboardData.getData('text').slice(0, CODE_LENGTH).split('');
//    const updated = Array(CODE_LENGTH).fill('');
//    pasted.forEach((char, i) => {
//      updated[i] = char;
//    });
//    setCodeBlocks(updated);
//  }
//
//  async function handleConfirm(fullCode) {
//    setError('');
//    setLoading(true);
//
//    try {
//      const res = await fetch('/api/verify', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        credentials: 'include',
//        body: JSON.stringify({ email, code: fullCode }),
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
//      const res = await fetch('/api/send-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
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
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6">
//        <h1 className="text-2xl font-bold text-center">{dict.confirmTitle}</h1>
//        <p className="text-sm text-gray-400 text-center">{dict.confirmDescription}</p>
//
//        {/* 🔢 Blocos de código */}
//        <div className="flex justify-center gap-2">
//          {codeBlocks.map((char, index) => (
//            <input
//              key={index}
//              type="text"
//              maxLength={1}
//              value={char}
//              onChange={e => handleInputChange(index, e.target.value)}
//              onPaste={handlePaste}
//              ref={el => (inputsRef.current[index] = el)}
//              className={`w-10 h-12 text-center text-xl font-bold rounded-md bg-gray-800 text-white border ${
//                error ? 'border-red-500' : 'border-gray-600'
//              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
//            />
//          ))}
//        </div>
//
//        {/* ✅ Mensagem de sucesso */}
//        {success && (
//          <div className="text-green-400 font-medium text-sm flex items-center gap-1">
//            <span>✔</span> {dict.success}
//          </div>
//        )}
//
//        {/* ⚠️ Mensagem de erro */}
//        {error && (
//          <div className="text-red-400 font-medium text-sm flex items-center gap-1">
//            <span>⚠</span> {error}
//          </div>
//        )}
//
//        {/* 🔁 Ações secundárias */}
//        <div className="text-center text-sm text-gray-400 mt-4 space-y-2">
//          <button
//            onClick={() => router.push(`/${lang}/signin`)}
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
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
//  const timerKey = `resendStartedAt:signin:${email}`;
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
//        body: JSON.stringify({ email, code }),
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
//      const res = await fetch('/api/send-code/signin', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ email }),
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
//            onClick={() => router.push(`/${lang}/signin`)}
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
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const initialEmail = searchParams.get('email') || '';
//  const [email, setEmail] = useState(initialEmail);
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
//    if (!email) {
//      const storedEmail = localStorage.getItem('signupEmail');
//      if (storedEmail) setEmail(storedEmail);
//    } else {
//      localStorage.setItem('signupEmail', email);
//    }
//  }, [email]);
//
//  useEffect(() => {
//    const startedAt = localStorage.getItem('resendStartedAt');
//    let remaining = 120;
//
//    if (startedAt) {
//      const elapsed = Math.floor((Date.now() - parseInt(startedAt)) / 1000);
//      remaining = Math.max(120 - elapsed, 0);
//    } else {
//      localStorage.setItem('resendStartedAt', Date.now().toString());
//    }
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
//  }, []);
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
//        body: JSON.stringify({ email, code }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        localStorage.setItem('user', JSON.stringify(data.user));
//        localStorage.removeItem('canAccessConfirm');
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
//  setResending(true);
//  setError('');
//
//  const safeEmail = email || localStorage.getItem('signupEmail');
//
//  if (!safeEmail) {
//    setError('⚠ E-mail é obrigatório para reenviar o código.');
//    setResending(false);
//    return;
//  }
//
//  try {
//    const res = await fetch('/api/send-code/signin', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ email: safeEmail }),
//    });
//
//    const data = await res.json();
//    if (!res.ok || !data.success) {
//      setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//    } else {
//      localStorage.setItem(`resendStartedAt:signup:${safeEmail}`, Date.now().toString());
//      setCanResend(false);
//      setResendTimer(120);
//    }
//  } catch (err) {
//    console.error('Resend error:', err);
//    setError(dict.networkError || 'Erro de rede ou servidor');
//  } finally {
//    setResending(false);
//  }
//}
//
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
//        <button
//          onClick={handleConfirm}
//          disabled={loading}
//          aria-label="Confirmar código"
//          className={`w-full py-2 rounded text-white font-semibold ${
//            loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
//          }`}
//        >
//          {loading ? dict.sending || 'Confirmando...' : dict.confirmButton}
//        </button>
//
//        <div className="text-center text-sm text-gray-400 mt-4 space-y-2">
//          <a href="https://mail.google.com" className="text-blue-400 hover:underline block">
//            Ir para caixa de entrada
//          </a>
//          <button onClick={() => router.push(`/${lang}/signin`)} className="text-gray-400 hover:underline block">
//            Trocar de conta
//          </button>
//          <button
//            onClick={handleResendCode}
//            disabled={!canResend || resending}
//            className={`block ${
//              !canResend || resending ? 'text-gray-600' : 'text-red-400 hover:underline'
//            }`}
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
//export default function ConfirmLoginPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//  const searchParams = useSearchParams();
//
//  const email = searchParams.get('email') || '';
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
//    const startedAt = localStorage.getItem('resendStartedAt');
//    let remaining = 120;
//
//    if (startedAt) {
//      const elapsed = Math.floor((Date.now() - parseInt(startedAt)) / 1000);
//      remaining = Math.max(120 - elapsed, 0);
//    } else {
//      localStorage.setItem('resendStartedAt', Date.now().toString());
//    }
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
//  }, []);
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
//        body: JSON.stringify({ email, code }),
//      });
//
//      const data = await res.json();
//
//      if (res.ok && data.success) {
//        localStorage.setItem('user', JSON.stringify(data.user));
//        localStorage.removeItem('canAccessConfirm');
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
//        body: JSON.stringify({ email }),
//      });
//
//      const data = await res.json();
//      if (!res.ok) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//      } else {
//        localStorage.setItem('resendStartedAt', Date.now().toString());
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
//          <button onClick={() => router.push(`/${lang}/signin`)} className="text-gray-400 hover:underline block">
//            Trocar de conta
//          </button>
//          <button
//            onClick={handleResendCode}
//            disabled={!canResend || resending}
//            className={`block ${
//              !canResend || resending ? 'text-gray-600' : 'text-red-400 hover:underline'
//            }`}
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
//import { useRouter, usePathname } from 'next/navigation';
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
//export default function ConfirmLoginCodePage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = { ...commonMessages[lang], ...messages[lang] };
//  const router = useRouter();
//
//  const email = localStorage.getItem('signinEmail') || '';
//  const username = localStorage.getItem('signinUsername') || '';
//  const [code, setCode] = useState('');
//  const [error, setError] = useState('');
//  const [success, setSuccess] = useState(false);
//  const [resending, setResending] = useState(false);
//  const [loading, setLoading] = useState(false);
//
//  const [resendTimer, setResendTimer] = useState(null);
//  const [canResend, setCanResend] = useState(false);
//
//  // ⏱️ Inicializa timer com base no localStorage
//  useEffect(() => {
//    const startedAt = localStorage.getItem('resendStartedAt');
//    let remaining = 120;
//
//    if (startedAt) {
//      const elapsed = Math.floor((Date.now() - parseInt(startedAt)) / 1000);
//      remaining = Math.max(120 - elapsed, 0);
//    } else {
//      localStorage.setItem('resendStartedAt', Date.now().toString());
//    }
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
//  }, []);
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
//        localStorage.removeItem('resendStartedAt');
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
//        body: JSON.stringify({ email }), // ✅ apenas email no login
//      });
//
//      let data;
//      try {
//        data = await res.json();
//      } catch {
//        const text = await res.text();
//        console.error('Resposta inesperada do backend:', text);
//        setError('Resposta inválida do servidor');
//        return;
//      }
//
//      if (!res.ok || !data.success) {
//        setError(data?.error || dict.errorSending || 'Erro ao reenviar código');
//      } else {
//        localStorage.setItem('resendStartedAt', Date.now().toString());
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
//          <button onClick={() => router.push(`/${lang}/signin`)} className="text-gray-400 hover:underline block">
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
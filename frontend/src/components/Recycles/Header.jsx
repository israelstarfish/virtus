// frontend/src/components/Recycles/Header.jsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Recycles/Header/Logo';
import Link from 'next/link';
import { UserDropdownMenu } from '@/components/UserDropdownMenu';
import { headerMessages } from '@/app/[lang]/messages/header';
import LanguageSelector from '@/components/Recycles/LanguageSelector';
import { useLang } from '@/hooks/useLang';   // <-- import do hook

export default function Header() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const lang = useLang();                     // <-- uso do hook
  const dict = headerMessages[lang] || headerMessages['pt-br'];

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/verify-token', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Sessão inválida');

        const data = await res.json();

        if (data.username) {
          setUsername(data.username);
          setEmail(data.email || null);
          setRole(data.role || null);
          setPlan(data.plan || 'no-plan');
        }
      } catch (err) {
        console.warn('Erro ao verificar sessão:', err);
        setUsername('');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (!username) return;

    const fetchUserStatus = async () => {
      try {
        const res = await fetch('/api/user/status', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Unauthorized');

        const data = await res.json();
        setPlan(data.plan || 'no-plan');
      } catch (err) {
        console.warn('Erro ao buscar status do usuário:', err);
      }
    };

    fetchUserStatus();
    const interval = setInterval(fetchUserStatus, 2000);

    return () => clearInterval(interval);
  }, [username]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });

    function getCookie(name) {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      if (!match) return null;
      return decodeURIComponent(match[2]);
    }

    const loginCookie = getCookie('virtuscloud.login');
    let email = '';

    try {
      email = JSON.parse(loginCookie)?.email || '';
    } catch {}

    if (email) {
      localStorage.removeItem(`resendStartedAt:signin:${email}`);
    }

    localStorage.removeItem('user');
    localStorage.removeItem('canAccessConfirm');
    localStorage.removeItem('lastInteraction:signin');

    document.cookie = 'virtuscloud.login=; path=/; max-age=0';
    document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
    document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';

    setUsername('');
    router.replace(`/${lang}/signin`);
  };

  return (
    <header className="sticky top-0 z-50 w-full min-h-20 flex flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3 border-b border-virtus-700 bg-background/75 backdrop-blur-2xl transition-all duration-300 ease-in-out">
      {/* Logo */}
      <div>
        <Logo lang={lang} />
      </div>

      {/* Navegação principal */}
      <div className="flex items-center justify-center gap-6">
        <nav aria-label="Main" className="flex items-center gap-2">
          <div style={{ position: 'relative' }}>
            <ul className="group flex flex-1 list-none items-center justify-center gap-1">
              <li>
                <Link href={`/${lang}/pricing`} className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
                  {dict.pricing}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/enterprise`} className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
                  {dict.enterprise}
                </Link>
              </li>
              <li>
                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
                  {dict.services}
                </button>
              </li>
              <li>
                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
                  {dict.downloads}
                </button>
              </li>
              <li>
                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
                  {dict.support}
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Login + Idioma */}
<div className="flex items-center gap-3">
  {/* Wrapper para signin/menu com altura fixa */}
  <div className="relative h-10">
    {/* User menu sempre montado por cima */}
    <div className={`absolute inset-0 ${username ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <UserDropdownMenu
        username={username}
        email={email}
        role={role}
        plan={plan}
        lang={lang}
        onLogout={handleLogout}
      />
    </div>

    {/* Signin Link sempre montado por baixo */}
    <Link
      href={`/${lang}/signin`}
      role="button"
      className={`group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1
        ${username ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
    >
      <span className={loading ? 'invisible' : 'visible'}>
        {dict.signin}
      </span>
    </Link>
  </div>

  {/* Botão de idioma sempre renderizado */}
  <div className="h-10 flex items-center">
    <LanguageSelector lang={lang} dict={dict} />
  </div>
</div>
    </header>
  );
}

// frontend/src/components/Recycles/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter } from 'next/navigation';
//import Logo from '@/components/Recycles/Header/Logo';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import { headerMessages } from '@/app/[lang]/messages/header';
//import LanguageSelector from '@/components/Recycles/LanguageSelector';
//import { useLang } from '@/hooks/useLang';   // <-- import do hook
//
//export default function Header() {
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//  const [loading, setLoading] = useState(true);
//
//  const router = useRouter();
//  const lang = useLang();                     // <-- uso do hook
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false);
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return;
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus();
//    const interval = setInterval(fetchUserStatus, 2000);
//
//    return () => clearInterval(interval);
//  }, [username]);
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    function getCookie(name) {
//      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//      if (!match) return null;
//      return decodeURIComponent(match[2]);
//    }
//
//    const loginCookie = getCookie('virtuscloud.login');
//    let email = '';
//
//    try {
//      email = JSON.parse(loginCookie)?.email || '';
//    } catch {}
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('lastInteraction:signin');
//
//    document.cookie = 'virtuscloud.login=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    <header className="sticky top-0 z-50 w-full min-h-20 flex flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3 border-b border-virtus-700 bg-background/75 backdrop-blur-2xl transition-all duration-300 ease-in-out">
//      {/* Logo */}
//      <div>
//        <Logo lang={lang} />
//      </div>
//
//      {/* Navegação principal */}
//      <div className="flex items-center justify-center gap-6">
//        <nav aria-label="Main" className="flex items-center gap-2">
//          <div style={{ position: 'relative' }}>
//            <ul className="group flex flex-1 list-none items-center justify-center gap-1">
//              <li>
//                <Link href={`/${lang}/pricing`} className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.pricing}
//                </Link>
//              </li>
//              <li>
//                <Link href={`/${lang}/enterprise`} className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.enterprise}
//                </Link>
//              </li>
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.services}
//                </button>
//              </li>
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.downloads}
//                </button>
//              </li>
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.support}
//                </button>
//              </li>
//            </ul>
//          </div>
//        </nav>
//      </div>
//
//      {/* Login + Idioma */}
//      <div className="flex items-center gap-3">
//        {loading ? (
//          <div className="h-10 px-4 flex items-center rounded-md bg-blue-700 text-primary text-sm">
//            {/* Placeholder enquanto carrega */}
//          </div>
//        ) : username ? (
//          <UserDropdownMenu
//            username={username}
//            email={email}
//            role={role}
//            plan={plan}
//            lang={lang}
//            onLogout={handleLogout}
//          />
//        ) : (
//          <Link
//            href={`/${lang}/signin`}
//            role="button"
//            className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//          >
//            {dict.signin}
//          </Link>
//        )}
//
//        {/* Botão de idioma sempre renderizado */}
//        <LanguageSelector lang={lang} dict={dict} />
//      </div>
//    </header>
//  );
//}

// frontend/src/components/Recycles/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Logo from '@/components/Recycles/Header/Logo';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import { headerMessages } from '@/app/[lang]/messages/header';
//import LanguageSelector from '@/components/Recycles/LanguageSelector';
//
//export default function Header() {
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//  const [loading, setLoading] = useState(true);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//    useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false);
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return;
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus();
//    const interval = setInterval(fetchUserStatus, 2000);
//
//    return () => clearInterval(interval);
//  }, [username]);
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    function getCookie(name) {
//      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//      if (!match) return null;
//      return decodeURIComponent(match[2]);
//    }
//
//    const loginCookie = getCookie('virtuscloud.login');
//    let email = '';
//
//    try {
//      email = JSON.parse(loginCookie)?.email || '';
//    } catch {}
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('lastInteraction:signin');
//
//    document.cookie = 'virtuscloud.login=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//    return (
//    <header className="sticky top-0 z-50 w-full min-h-20 flex flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3 border-b border-virtus-700 bg-background/75 backdrop-blur-2xl transition-all duration-300 ease-in-out">
//      {/* Logo */}
//      <div>
//        <Logo lang={lang} />
//      </div>
//
//      {/* Navegação principal */}
//      <div className="flex items-center justify-center gap-6">
//        <nav aria-label="Main" className="flex items-center gap-2">
//          <div style={{ position: 'relative' }}>
//            <ul className="group flex flex-1 list-none items-center justify-center gap-1">
//              <li>
//                <Link href={`/${lang}/pricing`} className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.pricing}
//                </Link>
//              </li>
//              <li>
//                <Link href={`/${lang}/enterprise`} className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.enterprise}
//                </Link>
//              </li>
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.services}
//                </button>
//              </li>
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.downloads}
//                </button>
//              </li>
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.support}
//                </button>
//              </li>
//            </ul>
//          </div>
//        </nav>
//      </div>
//
//      {/* Login + Idioma */}
//      <div className="flex items-center gap-3">
//        {loading ? (
//          <div className="h-10 px-4 flex items-center rounded-md bg-blue-700 text-primary text-sm">
//            {/* Placeholder enquanto carrega */}
//          </div>
//        ) : username ? (
//          <UserDropdownMenu
//            username={username}
//            email={email}
//            role={role}
//            plan={plan}
//            lang={lang}
//            onLogout={handleLogout}
//          />
//        ) : (
//          <Link
//            href={`/${lang}/signin`}
//            role="button"
//            className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//          >
//            {dict.signin}
//          </Link>
//        )}
//
//        {/* Botão de idioma sempre renderizado */}
//        <LanguageSelector lang={lang} pathname={pathname} dict={dict} />
//      </div>
//    </header>
//  );
//}

//frontend/src/components/Recycles/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Logo from '@/components/Recycles/Header/Logo';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import { headerMessages } from '@/app/[lang]/messages/header';
//import LanguageSelector from '@/components/Recycles/LanguageSelector';
//
//export default function Header() {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false); // garante renderização
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return; // só roda se logado
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//
//    return () => clearInterval(interval);
//  }, [username]);
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    function getCookie(name) {
//      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//      if (!match) return null;
//      return decodeURIComponent(match[2]);
//    }
//
//    const loginCookie = getCookie('virtuscloud.login');
//    let email = '';
//
//    try {
//      email = JSON.parse(loginCookie)?.email || '';
//    } catch {}
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('lastInteraction:signin');
//
//    document.cookie = 'virtuscloud.login=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//    return (
//    <header className="sticky top-0 z-50 w-full min-h-20 flex flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3 border-b border-virtus-700 bg-background/75 backdrop-blur-2xl transition-all duration-300 ease-in-out">
//      {/* Logo */}
//      <div>
//        <Logo lang={lang} />
//      </div>
//
//      {/* Navegação principal */}
//      <div className="flex items-center justify-center gap-6">
//        <nav
//          aria-label="Main"
//          className="flex items-center gap-2"
//        >
//          <div style={{ position: 'relative' }}>
//            <ul className="group flex flex-1 list-none items-center justify-center gap-1">
//              {/* Preços */}
//              <li>
//                <Link
//                  href={`/${lang}/pricing`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.pricing}
//                </Link>
//              </li>
//
//              {/* Enterprise */}
//              <li>
//                <Link
//                  href={`/${lang}/enterprise`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.enterprise}
//                </Link>
//              </li>
//
//              {/* Serviços */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.services}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Downloads */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.downloads}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Centro de Suporte */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.support}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//        </nav>
//      </div>
//
//      {!loading && (
//       <div className="flex items-center gap-3">
//    {!loading && (
//      username ? (
//        <UserDropdownMenu
//          username={username}
//          email={email}
//          role={role}
//          plan={plan}
//          lang={lang}
//          onLogout={handleLogout}
//        />
//      ) : (
//        <Link
//          href={`/${lang}/signin`}
//          role="button"
//          className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//        >
//          {dict.signin}
//        </Link>
//      )
//    )}
//
//    {/* Botão de idioma sempre renderizado */}
//    <LanguageSelector lang={lang} pathname={pathname} dict={dict} />
//  </div>
//  )}
//</header>
//
//  );
//}

//frontend/src/components/Recycles/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Logo from '@/components/Recycles/Header/Logo';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import { headerMessages } from '@/app/[lang]/messages/header';
//import LanguageSelector from '@/components/Recycles/LanguageSelector';
//
//export default function Header() {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false); // garante renderização
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return; // só roda se logado
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//
//    return () => clearInterval(interval);
//  }, [username]);
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    function getCookie(name) {
//      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//      if (!match) return null;
//      return decodeURIComponent(match[2]);
//    }
//
//    const loginCookie = getCookie('virtuscloud.login');
//    let email = '';
//
//    try {
//      email = JSON.parse(loginCookie)?.email || '';
//    } catch {}
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('lastInteraction:signin');
//
//    document.cookie = 'virtuscloud.login=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//    return (
//    <header className="sticky top-0 z-50 w-full min-h-20 flex flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3 border-b border-virtus-700 bg-background/75 backdrop-blur-2xl transition-all duration-300 ease-in-out">
//      {/* Logo */}
//      <div>
//        <Logo lang={lang} />
//      </div>
//
//      {/* Navegação principal */}
//      <div className="flex items-center justify-center gap-6">
//        <nav
//          aria-label="Main"
//          className="flex items-center gap-2"
//        >
//          <div style={{ position: 'relative' }}>
//            <ul className="group flex flex-1 list-none items-center justify-center gap-1">
//              {/* Preços */}
//              <li>
//                <Link
//                  href={`/${lang}/pricing`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.pricing}
//                </Link>
//              </li>
//
//              {/* Enterprise */}
//              <li>
//                <Link
//                  href={`/${lang}/enterprise`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.enterprise}
//                </Link>
//              </li>
//
//              {/* Serviços */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.services}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Downloads */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.downloads}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Centro de Suporte */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.support}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//        </nav>
//      </div>
//
//      {!loading && (
//        <div className="flex items-center gap-3">
//          {username ? (
//            <UserDropdownMenu
//              username={username}
//              email={email}
//              role={role}
//              plan={plan}
//              lang={lang}
//              onLogout={handleLogout}
//            />
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              role="button"
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//            >
//              {dict.signin}
//            </Link>
//          )}
//
//          {/* Botão de idioma */}
//          <LanguageSelector lang={lang} pathname={pathname} dict={dict} />
//        </div>
//      )}
//    </header>
//  );
//}

//frontend/src/components/Recycles/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Logo from '@/components/Recycles/Header/Logo';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import { headerMessages } from '@/app/[lang]/messages/home';
//import LanguageSelector from '@/components/Recycles/LanguageSelector';
//
//export default function Header() {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false); // garante renderização
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return; // só roda se logado
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//
//    return () => clearInterval(interval);
//  }, [username]);
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    function getCookie(name) {
//      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//      if (!match) return null;
//      return decodeURIComponent(match[2]);
//    }
//
//    const loginCookie = getCookie('virtuscloud.login');
//    let email = '';
//
//    try {
//      email = JSON.parse(loginCookie)?.email || '';
//    } catch {}
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('lastInteraction:signin');
//
//    document.cookie = 'virtuscloud.login=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//    return (
//    <header className="sticky top-0 z-50 w-full min-h-20 flex flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3 border-b border-virtus-700 bg-background/75 backdrop-blur-2xl transition-all duration-300 ease-in-out">
//      {/* Logo */}
//      <div className="flex h-[80px] items-center gap-2 justify-self-start">
//        <Logo lang={lang} />
//      </div>
//
//      {/* Navegação principal */}
//      <div className="flex items-center justify-center gap-6">
//        <nav
//          aria-label="Main"
//          className="flex items-center gap-2"
//        >
//          <div style={{ position: 'relative' }}>
//            <ul className="group flex flex-1 list-none items-center justify-center gap-1">
//              {/* Preços */}
//              <li>
//                <Link
//                  href={`/${lang}/pricing`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.pricing}
//                </Link>
//              </li>
//
//              {/* Enterprise */}
//              <li>
//                <Link
//                  href={`/${lang}/enterprise`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.enterprise}
//                </Link>
//              </li>
//
//              {/* Serviços */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.services}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Downloads */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.downloads}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Centro de Suporte */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.support}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//        </nav>
//      </div>
//
//      {!loading && (
//        <div className="flex items-center gap-3">
//          {username ? (
//            <UserDropdownMenu
//              username={username}
//              email={email}
//              role={role}
//              plan={plan}
//              lang={lang}
//              onLogout={handleLogout}
//            />
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              role="button"
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//            >
//              {dict.signin}
//            </Link>
//          )}
//
//          {/* Botão de idioma */}
//          <LanguageSelector lang={lang} pathname={pathname} dict={dict} />
//        </div>
//      )}
//    </header>
//  );
//}

//frontend/src/components/Recycles/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Logo from '@/components/Header/Logo';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import { headerMessages } from '@/app/[lang]/messages/home';
//
//export default function Header() {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false); // garante renderização
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return; // só roda se logado
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//
//    return () => clearInterval(interval);
//  }, [username]);
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    function getCookie(name) {
//      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//      if (!match) return null;
//      return decodeURIComponent(match[2]);
//    }
//
//    const loginCookie = getCookie('virtuscloud.login');
//    let email = '';
//
//    try {
//      email = JSON.parse(loginCookie)?.email || '';
//    } catch {}
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('lastInteraction:signin');
//
//    document.cookie = 'virtuscloud.login=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//    return (
//    <header className="sticky top-0 z-50 w-full min-h-20 flex flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3 border-b border-virtus-700 bg-background/75 backdrop-blur-2xl transition-all duration-300 ease-in-out">
//      {/* Logo */}
//      <div className="flex h-[80px] items-center gap-2 justify-self-start">
//        <Logo lang={lang} />
//      </div>
//
//      {/* Navegação principal */}
//      <div className="flex items-center justify-center gap-6">
//        <nav
//          aria-label="Main"
//          className="flex items-center gap-2"
//        >
//          <div style={{ position: 'relative' }}>
//            <ul className="group flex flex-1 list-none items-center justify-center gap-1">
//              {/* Preços */}
//              <li>
//                <Link
//                  href={`/${lang}/pricing`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.pricing}
//                </Link>
//              </li>
//
//              {/* Enterprise */}
//              <li>
//                <Link
//                  href={`/${lang}/enterprise`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.enterprise}
//                </Link>
//              </li>
//
//              {/* Serviços */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.services}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Downloads */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.downloads}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Centro de Suporte */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.support}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//        </nav>
//      </div>
//
//      {!loading && (
//        <div className="flex items-center gap-3">
//          {username ? (
//            <UserDropdownMenu
//              username={username}
//              email={email}
//              role={role}
//              plan={plan}
//              lang={lang}
//              onLogout={handleLogout}
//            />
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              role="button"
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//            >
//              {dict.signin}
//            </Link>
//          )}
//
//          {/* Botão de idioma */}
//          <div className="relative">
//            <button
//              type="button"
//              onClick={() => setShowLangMenu(!showLangMenu)}
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//            >
//              <img
//                alt={lang}
//                src={`/assets/countries/${lang}.svg`}
//                width={24}
//                height={24}
//                loading="lazy"
//                decoding="async"
//                className="size-6 shrink-0 select-none"
//                style={{ color: 'transparent' }}
//              />
//            </button>
//
//            {showLangMenu && (
//              <div className="absolute right-0 mt-2 z-50 min-w-fit rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-1 motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300">
//                <span className="block w-full px-2 py-2 text-secondary text-xs whitespace-nowrap text-center">Selecione um idioma</span>
//                {[
//                  { code: 'en', label: 'English' },
//                  { code: 'pt-br', label: 'Português' },
//                  { code: 'es', label: 'Español' },
//                  { code: 'zh', label: '中国人' },
//                ].map(({ code, label }) => (
//                  <button
//                    key={code}
//                    type="button"
//                    onClick={() => {
//                      if (code !== lang) {
//                        router.replace(pathname.replace(lang, code));
//                      }
//                      setShowLangMenu(false); // fecha sempre, mesmo se clicar no idioma atual
//                    }}
//                    className="w-full flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                  >
//                    <img
//                      alt={label}
//                      src={`/assets/countries/${code}.svg`}
//                      width={20}
//                      height={20}
//                      loading="lazy"
//                      decoding="async"
//                      style={{ color: 'transparent' }}
//                    />
//                    {label}
//                  </button>
//                ))}
//              </div>
//            )}
//          </div>
//        </div>
//      )}
//    </header>
//  );
//}

//frontend/src/components/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Logo from '@/components/Header/Logo';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import { headerMessages } from '@/app/[lang]/messages/home';
//
//export default function Header() {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false); // garante renderização
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return; // só roda se logado
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//
//    return () => clearInterval(interval);
//  }, [username]);
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    function getCookie(name) {
//      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//      if (!match) return null;
//      return decodeURIComponent(match[2]);
//    }
//
//    const loginCookie = getCookie('virtuscloud.login');
//    let email = '';
//
//    try {
//      email = JSON.parse(loginCookie)?.email || '';
//    } catch {}
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('lastInteraction:signin');
//
//    document.cookie = 'virtuscloud.login=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//    return (
//    <header className="sticky top-0 z-50 w-full min-h-20 flex flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3 border-b border-virtus-700 bg-background/75 backdrop-blur-2xl transition-all duration-300 ease-in-out">
//      {/* Logo */}
//      <div className="flex h-[80px] items-center gap-2 justify-self-start">
//        <Logo lang={lang} />
//      </div>
//
//      {/* Navegação principal */}
//      <div className="flex items-center justify-center gap-6">
//        <nav
//          aria-label="Main"
//          className="flex items-center gap-2"
//        >
//          <div style={{ position: 'relative' }}>
//            <ul className="group flex flex-1 list-none items-center justify-center gap-1">
//              {/* Preços */}
//              <li>
//                <Link
//                  href={`/${lang}/pricing`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.pricing}
//                </Link>
//              </li>
//
//              {/* Enterprise */}
//              <li>
//                <Link
//                  href={`/${lang}/enterprise`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.enterprise}
//                </Link>
//              </li>
//
//              {/* Serviços */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.services}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Downloads */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.downloads}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Centro de Suporte */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.support}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//        </nav>
//      </div>
//
//      {!loading && (
//        <div className="flex items-center gap-3">
//          {username ? (
//            <UserDropdownMenu
//              username={username}
//              email={email}
//              role={role}
//              plan={plan}
//              lang={lang}
//              onLogout={handleLogout}
//            />
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              role="button"
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//            >
//              {dict.signin}
//            </Link>
//          )}
//
//          {/* Botão de idioma */}
//          <div className="relative">
//            <button
//              type="button"
//              onClick={() => setShowLangMenu(!showLangMenu)}
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//            >
//              <img
//                alt={lang}
//                src={`/assets/countries/${lang}.svg`}
//                width={24}
//                height={24}
//                loading="lazy"
//                decoding="async"
//                className="size-6 shrink-0 select-none"
//                style={{ color: 'transparent' }}
//              />
//            </button>
//
//            {showLangMenu && (
//              <div className="absolute right-0 mt-2 min-w-fit rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-2 z-50">
//                <span className="block p-2 text-secondary text-xs">Selecione um idioma</span>
//                {[
//                  { code: 'en', label: 'English' },
//                  { code: 'pt-br', label: 'Português' },
//                  { code: 'es', label: 'Español' },
//                  { code: 'zh', label: '中国人' },
//                ].map(({ code, label }) => (
//                  <button
//                    key={code}
//                    type="button"
//                    onClick={() => {
//                      if (code !== lang) {
//                        router.replace(pathname.replace(lang, code));
//                      }
//                      setShowLangMenu(false); // fecha sempre, mesmo se clicar no idioma atual
//                    }}
//                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                  >
//                    <img
//                      alt={label}
//                      src={`/assets/countries/${code}.svg`}
//                      width={20}
//                      height={20}
//                      loading="lazy"
//                      decoding="async"
//                      style={{ color: 'transparent' }}
//                    />
//                    {label}
//                  </button>
//                ))}
//              </div>
//            )}
//          </div>
//        </div>
//      )}
//    </header>
//  );
//}

//frontend/src/components/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Logo from '@/components/Header/Logo';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import { headerMessages } from '@/app/[lang]/messages/home';
//
//export default function Header() {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false); // garante renderização
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return; // só roda se logado
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//
//    return () => clearInterval(interval);
//  }, [username]);
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    function getCookie(name) {
//      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//      if (!match) return null;
//      return decodeURIComponent(match[2]);
//    }
//
//    const loginCookie = getCookie('virtuscloud.login');
//    let email = '';
//
//    try {
//      email = JSON.parse(loginCookie)?.email || '';
//    } catch {}
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('lastInteraction:signin');
//
//    document.cookie = 'virtuscloud.login=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//    return (
//    <header className="sticky top-0 z-50 w-full min-h-20 flex flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3 border-b border-virtus-700 bg-background/75 backdrop-blur-2xl transition-all duration-300 ease-in-out">
//      {/* Logo */}
//      <div className="flex h-[80px] items-center gap-2 justify-self-start">
//        <Logo lang={lang} />
//      </div>
//
//      {/* Navegação principal */}
//      <div className="hidden w-fit place-self-center xl:block">
//        <nav
//          aria-label="Main"
//          className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
//        >
//          <div style={{ position: 'relative' }}>
//            <ul className="group flex flex-1 list-none items-center justify-center gap-1">
//              {/* Preços */}
//              <li>
//                <Link
//                  href={`/${lang}/pricing`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.pricing}
//                </Link>
//              </li>
//
//              {/* Enterprise */}
//              <li>
//                <Link
//                  href={`/${lang}/enterprise`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.enterprise}
//                </Link>
//              </li>
//
//              {/* Serviços */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.services}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Downloads */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.downloads}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Centro de Suporte */}
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  {dict.support}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//        </nav>
//      </div>
//
//      {!loading && (
//        <div className="xl:flex! hidden items-center gap-4 justify-self-end">
//          {username ? (
//            <UserDropdownMenu
//              username={username}
//              email={email}
//              role={role}
//              plan={plan}
//              lang={lang}
//              onLogout={handleLogout}
//            />
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              role="button"
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//            >
//              {dict.signin}
//            </Link>
//          )}
//
//          {/* Botão de idioma */}
//          <div className="relative">
//            <button
//              type="button"
//              onClick={() => setShowLangMenu(!showLangMenu)}
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//            >
//              <img
//                alt={lang}
//                src={`/assets/countries/${lang}.svg`}
//                width={24}
//                height={24}
//                loading="lazy"
//                decoding="async"
//                className="size-6 shrink-0 select-none"
//                style={{ color: 'transparent' }}
//              />
//            </button>
//
//            {showLangMenu && (
//              <div className="absolute right-0 mt-2 min-w-fit rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-2 z-50">
//                <span className="block p-2 text-secondary text-xs">Selecione um idioma</span>
//                {[
//                  { code: 'en', label: 'English' },
//                  { code: 'pt-br', label: 'Português' },
//                  { code: 'es', label: 'Español' },
//                  { code: 'zh', label: '中国人' },
//                ].map(({ code, label }) => (
//                  <button
//                    key={code}
//                    type="button"
//                    onClick={() => {
//                      if (code !== lang) {
//                        router.replace(pathname.replace(lang, code));
//                      }
//                      setShowLangMenu(false); // fecha sempre, mesmo se clicar no idioma atual
//                    }}
//                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                  >
//                    <img
//                      alt={label}
//                      src={`/assets/countries/${code}.svg`}
//                      width={20}
//                      height={20}
//                      loading="lazy"
//                      decoding="async"
//                      style={{ color: 'transparent' }}
//                    />
//                    {label}
//                  </button>
//                ))}
//              </div>
//            )}
//          </div>
//        </div>
//      )}
//    </header>
//  );
//}

//frontend/src/components/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Logo from '@/components/Header/Logo';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import { headerMessages } from '@/app/[lang]/messages/home';
//
//export default function Header() {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false); // ← garante renderização
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return; // ← só roda se logado
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 5s
//
//    return () => clearInterval(interval);
//  }, [username]); // ← depende de username
//
//  const handleLogout = async () => {
//    // 🔐 Chama o backend para invalidar o token
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    // 🍪 Função para ler cookies
//    function getCookie(name) {
//      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//      if (!match) return null;
//      return decodeURIComponent(match[2]);
//    }
//
//  // 📧 Recupera e-mail do cookie de login
//    const loginCookie = getCookie('virtuscloud.login');
//    let email = '';
//    
//    try {
//      email = JSON.parse(loginCookie)?.email || '';
//    } catch {}
//
//    //const user = JSON.parse(localStorage.getItem('user'));
//    //const email = user?.email || localStorage.getItem('signinEmail');
//
//    // 🧹 Limpa timer de reenvio (signin)
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('lastInteraction:signin');
//    //localStorage.removeItem('signinEmail');
//    
//    // 🍪 Limpa cookies de login e signup
//    document.cookie = 'virtuscloud.login=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';
//
//    // 🧭 Redireciona para página de login
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    //<header className="w-full bg-background border-b border-virtus-700 shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.6)] flex min-h-20 flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3">
//      <header className="sticky top-0 z-50 w-full min-h-20 flex flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3 border-b border-virtus-700 bg-background/75 backdrop-blur-2xl transition-all duration-300 ease-in-out">
//      {/* Logo */}
//      <div className="flex h-[80px] items-center gap-2 justify-self-start">
//        <Logo lang={lang} />
//        </div>
//
//      {/* Navegação principal */}
//      <div className="hidden w-fit place-self-center xl:block">
//        <nav
//          aria-label="Main"
//          data-orientation="horizontal"
//          dir="ltr"
//          data-slot="navigation-menu"
//          data-viewport="false"
//          className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
//        >
//          <div style={{ position: 'relative' }}>
//            <ul
//              data-orientation="horizontal"
//              dir="ltr"
//              data-slot="navigation-menu-list"
//              className="group flex flex-1 list-none items-center justify-center gap-1"
//            >
//              {/* Preços */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href={`/${lang}/pricing`}
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.pricing}
//                </Link>
//              </li>
//
//              {/* Enterprise */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href={`/${lang}/enterprise`}
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.enterprise}
//                </Link>
//              </li>
//
//              {/* Serviços */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_3_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_3_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.services}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Downloads */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_4_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_4_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.downloads}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Centro de Suporte */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_5_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_5_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.support}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//
//          {/* Dropdown container */}
//          <div className="absolute top-full left-0 isolate z-50 flex justify-center" />
//        </nav>
//      </div>
//
//      {!loading && (
//        console.log('Renderizando sessão:', { loading, username }),
//        <div className="xl:flex! hidden items-center gap-4 justify-self-end">
//          {username ? (
//            <UserDropdownMenu
//              username={username}
//              email={email}
//              role={role}
//              plan={plan}
//              lang={lang}
//              onLogout={handleLogout}
//            />
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              role="button"
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//            >
//              {dict.signin}
//            </Link>
//          )}
//
//          <div className="relative">
//            {/* Botão de idioma */}
//            <button
//              type="button"
//              onClick={() => setShowLangMenu(!showLangMenu)}
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//            >
//              <img
//                alt={lang}
//                src={`/assets/countries/${lang}.svg`}
//                width={24}
//                height={24}
//                loading="lazy"
//                decoding="async"
//                className="size-6 shrink-0 select-none"
//                style={{ color: 'transparent' }}
//              />
//            </button>
//
//            {/* Menu de idiomas */}
//            {showLangMenu && (
//              <div className="absolute right-0 mt-2 min-w-fit rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-2 z-50">
//                <span className="block p-2 text-secondary text-xs">Selecione um idioma</span>
//                {[
//                  { code: 'en', label: 'English' },
//                  { code: 'pt-br', label: 'Português' },
//                  { code: 'es', label: 'Español' },
//                  { code: 'zh', label: '中国人' },
//                ].map(({ code, label }) => (
//                  <button
//                    key={code}
//                    type="button"
//                    onClick={() => router.replace(pathname.replace(lang, code))}
//                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                  >
//                    <img
//                      alt={label}
//                      src={`/assets/countries/${code}.svg`}
//                      width={20}
//                      height={20}
//                      loading="lazy"
//                      decoding="async"
//                      style={{ color: 'transparent' }}
//                    />
//                    {label}
//                  </button>
//                ))}
//              </div>
//            )}
//          </div>
//        </div>
//      )}
//    </header>
//  );
//}

//frontend/src/components/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Logo from '@/components/Header/Logo';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import { headerMessages } from '@/app/[lang]/messages/home';
//
//export default function Header() {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false); // ← garante renderização
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return; // ← só roda se logado
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 5s
//
//    return () => clearInterval(interval);
//  }, [username]); // ← depende de username
//
//  const handleLogout = async () => {
//    // 🔐 Chama o backend para invalidar o token
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    // 🍪 Função para ler cookies
//    function getCookie(name) {
//      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//      if (!match) return null;
//      return decodeURIComponent(match[2]);
//    }
//
//  // 📧 Recupera e-mail do cookie de login
//    const loginCookie = getCookie('virtuscloud.login');
//    let email = '';
//    
//    try {
//      email = JSON.parse(loginCookie)?.email || '';
//    } catch {}
//
//    //const user = JSON.parse(localStorage.getItem('user'));
//    //const email = user?.email || localStorage.getItem('signinEmail');
//
//    // 🧹 Limpa timer de reenvio (signin)
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('lastInteraction:signin');
//    //localStorage.removeItem('signinEmail');
//    
//    // 🍪 Limpa cookies de login e signup
//    document.cookie = 'virtuscloud.login=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';
//
//    // 🧭 Redireciona para página de login
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    //<header className="w-full bg-background border-b border-virtus-700 shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.6)] flex min-h-20 flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3">
//      <header className="sticky top-0 z-50 w-full min-h-20 flex flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3 border-b border-virtus-700 bg-background/75 backdrop-blur-2xl transition-all duration-300 ease-in-out">
//      {/* Logo */}
//      <div className="flex h-[80px] items-center gap-2 justify-self-start">
//        <div className="transition-opacity hover:opacity-75"><div><Logo /></div>
//          <Link href={`/${lang}/home`}>
//            <div className="relative block aspect-[419/128] h-8.5" />
//            
//          </Link>
//        </div>
//      </div>
//
//      {/* Navegação principal */}
//      <div className="hidden w-fit place-self-center xl:block">
//        <nav
//          aria-label="Main"
//          data-orientation="horizontal"
//          dir="ltr"
//          data-slot="navigation-menu"
//          data-viewport="false"
//          className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
//        >
//          <div style={{ position: 'relative' }}>
//            <ul
//              data-orientation="horizontal"
//              dir="ltr"
//              data-slot="navigation-menu-list"
//              className="group flex flex-1 list-none items-center justify-center gap-1"
//            >
//              {/* Preços */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href={`/${lang}/pricing`}
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.pricing}
//                </Link>
//              </li>
//
//              {/* Enterprise */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href={`/${lang}/enterprise`}
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.enterprise}
//                </Link>
//              </li>
//
//              {/* Serviços */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_3_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_3_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.services}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Downloads */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_4_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_4_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.downloads}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Centro de Suporte */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_5_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_5_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.support}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//
//          {/* Dropdown container */}
//          <div className="absolute top-full left-0 isolate z-50 flex justify-center" />
//        </nav>
//      </div>
//
//      {!loading && (
//        console.log('Renderizando sessão:', { loading, username }),
//        <div className="xl:flex! hidden items-center gap-4 justify-self-end">
//          {username ? (
//            <UserDropdownMenu
//              username={username}
//              email={email}
//              role={role}
//              plan={plan}
//              lang={lang}
//              onLogout={handleLogout}
//            />
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              role="button"
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//            >
//              {dict.signin}
//            </Link>
//          )}
//
//          <div className="relative">
//            {/* Botão de idioma */}
//            <button
//              type="button"
//              onClick={() => setShowLangMenu(!showLangMenu)}
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//            >
//              <img
//                alt={lang}
//                src={`/assets/countries/${lang}.svg`}
//                width={24}
//                height={24}
//                loading="lazy"
//                decoding="async"
//                className="size-6 shrink-0 select-none"
//                style={{ color: 'transparent' }}
//              />
//            </button>
//
//            {/* Menu de idiomas */}
//            {showLangMenu && (
//              <div className="absolute right-0 mt-2 min-w-fit rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-2 z-50">
//                <span className="block p-2 text-secondary text-xs">Selecione um idioma</span>
//                {[
//                  { code: 'en', label: 'English' },
//                  { code: 'pt-br', label: 'Português' },
//                  { code: 'es', label: 'Español' },
//                  { code: 'zh', label: '中国人' },
//                ].map(({ code, label }) => (
//                  <button
//                    key={code}
//                    type="button"
//                    onClick={() => router.replace(pathname.replace(lang, code))}
//                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                  >
//                    <img
//                      alt={label}
//                      src={`/assets/countries/${code}.svg`}
//                      width={20}
//                      height={20}
//                      loading="lazy"
//                      decoding="async"
//                      style={{ color: 'transparent' }}
//                    />
//                    {label}
//                  </button>
//                ))}
//              </div>
//            )}
//          </div>
//        </div>
//      )}
//    </header>
//  );
//}

//frontend/src/components/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import { headerMessages } from '@/app/[lang]/messages/home';
//
//export default function Header() {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false); // ← garante renderização
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return; // ← só roda se logado
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 5s
//
//    return () => clearInterval(interval);
//  }, [username]); // ← depende de username
//
//  const handleLogout = async () => {
//    // 🔐 Chama o backend para invalidar o token
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    // 🍪 Função para ler cookies
//    function getCookie(name) {
//      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//      if (!match) return null;
//      return decodeURIComponent(match[2]);
//    }
//
//  // 📧 Recupera e-mail do cookie de login
//    const loginCookie = getCookie('virtuscloud.login');
//    let email = '';
//    
//    try {
//      email = JSON.parse(loginCookie)?.email || '';
//    } catch {}
//
//    //const user = JSON.parse(localStorage.getItem('user'));
//    //const email = user?.email || localStorage.getItem('signinEmail');
//
//    // 🧹 Limpa timer de reenvio (signin)
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('lastInteraction:signin');
//    //localStorage.removeItem('signinEmail');
//    
//    // 🍪 Limpa cookies de login e signup
//    document.cookie = 'virtuscloud.login=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';
//
//    // 🧭 Redireciona para página de login
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    //<header className="w-full bg-background border-b border-virtus-700 shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.6)] flex min-h-20 flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3">
//      <header className="sticky top-0 z-50 w-full min-h-20 flex flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3 border-b border-virtus-700 bg-background/75 backdrop-blur-2xl transition-all duration-300 ease-in-out">
//      {/* Logo */}
//      <div className="flex h-[80px] items-center gap-2 justify-self-start">
//        <div className="transition-opacity hover:opacity-75">
//          <Link href={`/${lang}/home`}>
//            <div className="relative block aspect-[419/128] h-8.5" />
//          </Link>
//        </div>
//      </div>
//
//      {/* Navegação principal */}
//      <div className="hidden w-fit place-self-center xl:block">
//        <nav
//          aria-label="Main"
//          data-orientation="horizontal"
//          dir="ltr"
//          data-slot="navigation-menu"
//          data-viewport="false"
//          className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
//        >
//          <div style={{ position: 'relative' }}>
//            <ul
//              data-orientation="horizontal"
//              dir="ltr"
//              data-slot="navigation-menu-list"
//              className="group flex flex-1 list-none items-center justify-center gap-1"
//            >
//              {/* Preços */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href={`/${lang}/pricing`}
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.pricing}
//                </Link>
//              </li>
//
//              {/* Enterprise */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href={`/${lang}/enterprise`}
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.enterprise}
//                </Link>
//              </li>
//
//              {/* Serviços */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_3_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_3_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.services}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Downloads */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_4_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_4_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.downloads}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Centro de Suporte */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_5_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_5_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.support}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//
//          {/* Dropdown container */}
//          <div className="absolute top-full left-0 isolate z-50 flex justify-center" />
//        </nav>
//      </div>
//
//      {!loading && (
//        console.log('Renderizando sessão:', { loading, username }),
//        <div className="xl:flex! hidden items-center gap-4 justify-self-end">
//          {username ? (
//            <UserDropdownMenu
//              username={username}
//              email={email}
//              role={role}
//              plan={plan}
//              lang={lang}
//              onLogout={handleLogout}
//            />
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              role="button"
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//            >
//              {dict.signin}
//            </Link>
//          )}
//
//          <div className="relative">
//            {/* Botão de idioma */}
//            <button
//              type="button"
//              onClick={() => setShowLangMenu(!showLangMenu)}
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//            >
//              <img
//                alt={lang}
//                src={`/assets/countries/${lang}.svg`}
//                width={24}
//                height={24}
//                loading="lazy"
//                decoding="async"
//                className="size-6 shrink-0 select-none"
//                style={{ color: 'transparent' }}
//              />
//            </button>
//
//            {/* Menu de idiomas */}
//            {showLangMenu && (
//              <div className="absolute right-0 mt-2 min-w-fit rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-2 z-50">
//                <span className="block p-2 text-secondary text-xs">Selecione um idioma</span>
//                {[
//                  { code: 'en', label: 'English' },
//                  { code: 'pt-br', label: 'Português' },
//                  { code: 'es', label: 'Español' },
//                  { code: 'zh', label: '中国人' },
//                ].map(({ code, label }) => (
//                  <button
//                    key={code}
//                    type="button"
//                    onClick={() => router.replace(pathname.replace(lang, code))}
//                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                  >
//                    <img
//                      alt={label}
//                      src={`/assets/countries/${code}.svg`}
//                      width={20}
//                      height={20}
//                      loading="lazy"
//                      decoding="async"
//                      style={{ color: 'transparent' }}
//                    />
//                    {label}
//                  </button>
//                ))}
//              </div>
//            )}
//          </div>
//        </div>
//      )}
//    </header>
//  );
//}

//frontend/src/components/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import { headerMessages } from '@/app/[lang]/messages/home';
//
//export default function Header() {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false); // ← garante renderização
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return; // ← só roda se logado
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 5000); // atualiza a cada 5s
//
//    return () => clearInterval(interval);
//  }, [username]); // ← depende de username
//
//  const handleLogout = async () => {
//    // 🔐 Chama o backend para invalidar o token
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    // 🍪 Função para ler cookies
//    function getCookie(name) {
//      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//      if (!match) return null;
//      return decodeURIComponent(match[2]);
//    }
//
//  // 📧 Recupera e-mail do cookie de login
//    const loginCookie = getCookie('virtuscloud.login');
//    let email = '';
//    
//    try {
//      email = JSON.parse(loginCookie)?.email || '';
//    } catch {}
//
//    //const user = JSON.parse(localStorage.getItem('user'));
//    //const email = user?.email || localStorage.getItem('signinEmail');
//
//    // 🧹 Limpa timer de reenvio (signin)
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('lastInteraction:signin');
//    //localStorage.removeItem('signinEmail');
//    
//    // 🍪 Limpa cookies de login e signup
//    document.cookie = 'virtuscloud.login=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';
//
//    // 🧭 Redireciona para página de login
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    //<header className="w-full bg-background border-b border-virtus-700 shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.6)] flex min-h-20 flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3">
//      <header className="sticky top-0 z-50 w-full min-h-20 flex flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3 border-b border-virtus-700 bg-background/75 backdrop-blur-2xl transition-all duration-300 ease-in-out">
//      {/* Logo */}
//      <div className="flex h-[80px] items-center gap-2 justify-self-start">
//        <div className="transition-opacity hover:opacity-75">
//          <Link href={`/${lang}/home`}>
//            <div className="relative block aspect-[419/128] h-8.5" />
//          </Link>
//        </div>
//      </div>
//
//      {/* Navegação principal */}
//      <div className="hidden w-fit place-self-center xl:block">
//        <nav
//          aria-label="Main"
//          data-orientation="horizontal"
//          dir="ltr"
//          data-slot="navigation-menu"
//          data-viewport="false"
//          className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
//        >
//          <div style={{ position: 'relative' }}>
//            <ul
//              data-orientation="horizontal"
//              dir="ltr"
//              data-slot="navigation-menu-list"
//              className="group flex flex-1 list-none items-center justify-center gap-1"
//            >
//              {/* Preços */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href={`/${lang}/pricing`}
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.pricing}
//                </Link>
//              </li>
//
//              {/* Enterprise */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href={`/${lang}/enterprise`}
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.enterprise}
//                </Link>
//              </li>
//
//              {/* Serviços */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_3_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_3_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.services}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Downloads */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_4_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_4_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.downloads}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Centro de Suporte */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_5_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_5_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.support}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//
//          {/* Dropdown container */}
//          <div className="absolute top-full left-0 isolate z-50 flex justify-center" />
//        </nav>
//      </div>
//
//      {!loading && (
//        console.log('Renderizando sessão:', { loading, username }),
//        <div className="xl:flex! hidden items-center gap-4 justify-self-end">
//          {username ? (
//            <UserDropdownMenu
//              username={username}
//              email={email}
//              role={role}
//              plan={plan}
//              lang={lang}
//              onLogout={handleLogout}
//            />
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              role="button"
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//            >
//              {dict.signin}
//            </Link>
//          )}
//
//          <div className="relative">
//            {/* Botão de idioma */}
//            <button
//              type="button"
//              onClick={() => setShowLangMenu(!showLangMenu)}
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//            >
//              <img
//                alt={lang}
//                src={`/assets/countries/${lang}.svg`}
//                width={24}
//                height={24}
//                loading="lazy"
//                decoding="async"
//                className="size-6 shrink-0 select-none"
//                style={{ color: 'transparent' }}
//              />
//            </button>
//
//            {/* Menu de idiomas */}
//            {showLangMenu && (
//              <div className="absolute right-0 mt-2 min-w-fit rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-2 z-50">
//                <span className="block p-2 text-secondary text-xs">Selecione um idioma</span>
//                {[
//                  { code: 'en', label: 'English' },
//                  { code: 'pt-br', label: 'Português' },
//                  { code: 'es', label: 'Español' },
//                  { code: 'zh', label: '中国人' },
//                ].map(({ code, label }) => (
//                  <button
//                    key={code}
//                    type="button"
//                    onClick={() => router.replace(pathname.replace(lang, code))}
//                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                  >
//                    <img
//                      alt={label}
//                      src={`/assets/countries/${code}.svg`}
//                      width={20}
//                      height={20}
//                      loading="lazy"
//                      decoding="async"
//                      style={{ color: 'transparent' }}
//                    />
//                    {label}
//                  </button>
//                ))}
//              </div>
//            )}
//          </div>
//        </div>
//      )}
//    </header>
//  );
//}

//frontend/src/components/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import { headerMessages } from '@/app/[lang]/messages/home';
//
//export default function Header() {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false); // ← garante renderização
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return; // ← só roda se logado
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 5000); // atualiza a cada 5s
//
//    return () => clearInterval(interval);
//  }, [username]); // ← depende de username
//
//  const handleLogout = async () => {
//    // 🔐 Chama o backend para invalidar o token
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    // 🍪 Função para ler cookies
//    function getCookie(name) {
//      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//      if (!match) return null;
//      return decodeURIComponent(match[2]);
//    }
//
//  // 📧 Recupera e-mail do cookie de login
//    const loginCookie = getCookie('virtuscloud.login');
//    let email = '';
//    
//    try {
//      email = JSON.parse(loginCookie)?.email || '';
//    } catch {}
//
//    //const user = JSON.parse(localStorage.getItem('user'));
//    //const email = user?.email || localStorage.getItem('signinEmail');
//
//    // 🧹 Limpa timer de reenvio (signin)
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('lastInteraction:signin');
//    //localStorage.removeItem('signinEmail');
//    
//    // 🍪 Limpa cookies de login e signup
//    document.cookie = 'virtuscloud.login=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';
//
//    // 🧭 Redireciona para página de login
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    <header className="group sticky top-0 z-50 max-h-screen min-h-20 w-full border-virtus-600 border-b bg-background/75 backdrop-blur-2xl max-xl:overflow-auto">
//      <div className="container flex min-h-20 flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3">
//        {/* Logo */}
//        <div className="flex h-[80px] items-center gap-2 justify-self-start">
//          <div className="transition-opacity hover:opacity-75">
//            <Link href="/pt-br/home" tabIndex={-1}>
//              <div className="relative block aspect-[419/128] h-8.5">
//              </div>
//            </Link>
//          </div>
//        </div>
//
//        {/* Desktop Navigation */}
//        <div className="hidden w-fit place-self-center xl:block">
//          <nav
//            aria-label="Main"
//            className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
//          >
//            <ul className="group flex flex-1 list-none items-center justify-center gap-1">
//              <li>
//                <Link
//                  href="/pt-br/pricing"
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-secondary text-sm transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Preços
//                </Link>
//              </li>
//              <li>
//                <Link
//                  href="/pt-br/enterprise"
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-secondary text-sm transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Enterprise
//                </Link>
//              </li>
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-secondary text-sm transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  Serviços
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-secondary text-sm transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  Downloads
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-secondary text-sm transition-colors hover:bg-blue-200/5 hover:text-primary">
//                  Centro de Suporte
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </nav>
//        </div>
//
//        {/* User + Language */}
//        <div className="xl:flex hidden items-center gap-4 justify-self-end">
//          <button
//            type="button"
//            className="group/button relative inline-flex min-w-fit shrink-0 items-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 group h-12 w-full justify-between px-2.5 md:w-fit"
//          >
//            <div className="flex flex-col items-start gap-0.5">
//              <span className="text-sm leading-none">israelmacyel</span>
//              <span className="text-[10px] text-secondary leading-none">••••••••••••@gmail.com</span>
//            </div>
//            <svg
//              xmlns="http://www.w3.org/2000/svg"
//              width="20"
//              height="20"
//              fill="currentColor"
//              viewBox="0 0 256 256"
//              className="text-secondary transition-transform duration-250 group-data-[state=open]:rotate-180"
//            >
//              <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//            </svg>
//          </button>
//
//          <button
//            type="button"
//            className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//          >
//          </button>
//        </div>
//
//        {/* Mobile menu toggle and dropdowns — omitted for brevity */}
//      </div>
//    </header>
//  );
//}

//frontend/src/components/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import { headerMessages } from '@/app/[lang]/messages/home';
//
//export default function Header() {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false); // ← garante renderização
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return; // ← só roda se logado
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 5000); // atualiza a cada 5s
//
//    return () => clearInterval(interval);
//  }, [username]); // ← depende de username
//
//  const handleLogout = async () => {
//    // 🔐 Chama o backend para invalidar o token
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    // 🍪 Função para ler cookies
//    function getCookie(name) {
//      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//      if (!match) return null;
//      return decodeURIComponent(match[2]);
//    }
//
//  // 📧 Recupera e-mail do cookie de login
//    const loginCookie = getCookie('virtuscloud.login');
//    let email = '';
//    
//    try {
//      email = JSON.parse(loginCookie)?.email || '';
//    } catch {}
//
//    //const user = JSON.parse(localStorage.getItem('user'));
//    //const email = user?.email || localStorage.getItem('signinEmail');
//
//    // 🧹 Limpa timer de reenvio (signin)
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('lastInteraction:signin');
//    //localStorage.removeItem('signinEmail');
//    
//    // 🍪 Limpa cookies de login e signup
//    document.cookie = 'virtuscloud.login=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';
//
//    // 🧭 Redireciona para página de login
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    <header className="w-full bg-background border-b border-virtus-700 shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.6)] flex min-h-20 flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3">
//      {/* Logo */}
//      <div className="flex h-[80px] items-center gap-2 justify-self-start">
//        <div className="transition-opacity hover:opacity-75">
//          <Link href={`/${lang}/home`}>
//            <div className="relative block aspect-[419/128] h-8.5" />
//          </Link>
//        </div>
//      </div>
//
//      {/* Navegação principal */}
//      <div className="hidden w-fit place-self-center xl:block">
//        <nav
//          aria-label="Main"
//          data-orientation="horizontal"
//          dir="ltr"
//          data-slot="navigation-menu"
//          data-viewport="false"
//          className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
//        >
//          <div style={{ position: 'relative' }}>
//            <ul
//              data-orientation="horizontal"
//              dir="ltr"
//              data-slot="navigation-menu-list"
//              className="group flex flex-1 list-none items-center justify-center gap-1"
//            >
//              {/* Preços */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href={`/${lang}/pricing`}
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.pricing}
//                </Link>
//              </li>
//
//              {/* Enterprise */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href={`/${lang}/enterprise`}
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.enterprise}
//                </Link>
//              </li>
//
//              {/* Serviços */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_3_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_3_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.services}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Downloads */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_4_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_4_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.downloads}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Centro de Suporte */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_5_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_5_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.support}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//
//          {/* Dropdown container */}
//          <div className="absolute top-full left-0 isolate z-50 flex justify-center" />
//        </nav>
//      </div>
//
//      {!loading && (
//        console.log('Renderizando sessão:', { loading, username }),
//        <div className="xl:flex! hidden items-center gap-4 justify-self-end">
//          {username ? (
//            <UserDropdownMenu
//              username={username}
//              email={email}
//              role={role}
//              plan={plan}
//              lang={lang}
//              onLogout={handleLogout}
//            />
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              role="button"
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//            >
//              {dict.signin}
//            </Link>
//          )}
//
//          <div className="relative">
//            {/* Botão de idioma */}
//            <button
//              type="button"
//              onClick={() => setShowLangMenu(!showLangMenu)}
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//            >
//              <img
//                alt={lang}
//                src={`/assets/countries/${lang}.svg`}
//                width={24}
//                height={24}
//                loading="lazy"
//                decoding="async"
//                className="size-6 shrink-0 select-none"
//                style={{ color: 'transparent' }}
//              />
//            </button>
//
//            {/* Menu de idiomas */}
//            {showLangMenu && (
//              <div className="absolute right-0 mt-2 min-w-fit rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-2 z-50">
//                <span className="block p-2 text-secondary text-xs">Selecione um idioma</span>
//                {[
//                  { code: 'en', label: 'English' },
//                  { code: 'pt-br', label: 'Português' },
//                  { code: 'es', label: 'Español' },
//                  { code: 'zh', label: '中国人' },
//                ].map(({ code, label }) => (
//                  <button
//                    key={code}
//                    type="button"
//                    onClick={() => router.replace(pathname.replace(lang, code))}
//                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                  >
//                    <img
//                      alt={label}
//                      src={`/assets/countries/${code}.svg`}
//                      width={20}
//                      height={20}
//                      loading="lazy"
//                      decoding="async"
//                      style={{ color: 'transparent' }}
//                    />
//                    {label}
//                  </button>
//                ))}
//              </div>
//            )}
//          </div>
//        </div>
//      )}
//    </header>
//  );
//}

//frontend/src/components/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import { headerMessages } from '@/app/[lang]/messages/home';
//
//export default function Header() {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false); // ← garante renderização
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return; // ← só roda se logado
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 5000); // atualiza a cada 5s
//
//    return () => clearInterval(interval);
//  }, [username]); // ← depende de username
//
//  const handleLogout = async () => {
//    // 🔐 Chama o backend para invalidar o token
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    // 🍪 Função para ler cookies
//    function getCookie(name) {
//      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//      if (!match) return null;
//      return decodeURIComponent(match[2]);
//    }
//
//  // 📧 Recupera e-mail do cookie de login
//    const loginCookie = getCookie('virtuscloud.login');
//    let email = '';
//    
//    try {
//      email = JSON.parse(loginCookie)?.email || '';
//    } catch {}
//
//    //const user = JSON.parse(localStorage.getItem('user'));
//    //const email = user?.email || localStorage.getItem('signinEmail');
//
//    // 🧹 Limpa timer de reenvio (signin)
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('lastInteraction:signin');
//    //localStorage.removeItem('signinEmail');
//    
//    // 🍪 Limpa cookies de login e signup
//    document.cookie = 'virtuscloud.login=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
//    document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';
//
//    // 🧭 Redireciona para página de login
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    <header className="w-full bg-background border-b border-virtus-700 shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.6)] flex min-h-20 flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3">
//      {/* Logo */}
//      <div className="flex h-[80px] items-center gap-2 justify-self-start">
//        <div className="transition-opacity hover:opacity-75">
//          <Link href={`/${lang}/home`}>
//            <div className="relative block aspect-[419/128] h-8.5" />
//          </Link>
//        </div>
//      </div>
//
//      {/* Navegação principal */}
//      <div className="hidden w-fit place-self-center xl:block">
//        <nav
//          aria-label="Main"
//          data-orientation="horizontal"
//          dir="ltr"
//          data-slot="navigation-menu"
//          data-viewport="false"
//          className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
//        >
//          <div style={{ position: 'relative' }}>
//            <ul
//              data-orientation="horizontal"
//              dir="ltr"
//              data-slot="navigation-menu-list"
//              className="group flex flex-1 list-none items-center justify-center gap-1"
//            >
//              {/* Preços */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href="/pt-br/pricing"
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.pricing}
//                </Link>
//              </li>
//
//              {/* Enterprise */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href="/pt-br/enterprise"
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.enterprise}
//                </Link>
//              </li>
//
//              {/* Serviços */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_3_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_3_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.services}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Downloads */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_4_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_4_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.downloads}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Centro de Suporte */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_5_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_5_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.support}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//
//          {/* Dropdown container */}
//          <div className="absolute top-full left-0 isolate z-50 flex justify-center" />
//        </nav>
//      </div>
//
//      {!loading && (
//        console.log('Renderizando sessão:', { loading, username }),
//        <div className="xl:flex! hidden items-center gap-4 justify-self-end">
//          {username ? (
//            <UserDropdownMenu
//              username={username}
//              email={email}
//              role={role}
//              plan={plan}
//              lang={lang}
//              onLogout={handleLogout}
//            />
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              role="button"
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//            >
//              {dict.signin}
//            </Link>
//          )}
//
//          <div className="relative">
//            {/* Botão de idioma */}
//            <button
//              type="button"
//              onClick={() => setShowLangMenu(!showLangMenu)}
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//            >
//              <img
//                alt={lang}
//                src={`/assets/countries/${lang}.svg`}
//                width={24}
//                height={24}
//                loading="lazy"
//                decoding="async"
//                className="size-6 shrink-0 select-none"
//                style={{ color: 'transparent' }}
//              />
//            </button>
//
//            {/* Menu de idiomas */}
//            {showLangMenu && (
//              <div className="absolute right-0 mt-2 min-w-fit rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-2 z-50">
//                <span className="block p-2 text-secondary text-xs">Selecione um idioma</span>
//                {[
//                  { code: 'en', label: 'English' },
//                  { code: 'pt-br', label: 'Português' },
//                  { code: 'es', label: 'Español' },
//                  { code: 'zh', label: '中国人' },
//                ].map(({ code, label }) => (
//                  <button
//                    key={code}
//                    type="button"
//                    onClick={() => router.replace(pathname.replace(lang, code))}
//                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                  >
//                    <img
//                      alt={label}
//                      src={`/assets/countries/${code}.svg`}
//                      width={20}
//                      height={20}
//                      loading="lazy"
//                      decoding="async"
//                      style={{ color: 'transparent' }}
//                    />
//                    {label}
//                  </button>
//                ))}
//              </div>
//            )}
//          </div>
//        </div>
//      )}
//    </header>
//  );
//}

//frontend/src/components/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import { headerMessages } from '@/app/[lang]/messages/home';
//
//export default function Header() {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//  
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false); // ← garante renderização
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return; // ← só roda se logado
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 5000); // atualiza a cada 5s
//
//    return () => clearInterval(interval);
//  }, [username]); // ← depende de username
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    const user = JSON.parse(localStorage.getItem('user'));
//    const email = user?.email || localStorage.getItem('signinEmail');
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('signinEmail');
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    <header className="w-full bg-background border-b border-virtus-700 shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.6)] flex min-h-20 flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3">
//      {/* Logo */}
//      <div className="flex h-[80px] items-center gap-2 justify-self-start">
//        <div className="transition-opacity hover:opacity-75">
//          <Link href={`/${lang}/home`}>
//            <div className="relative block aspect-[419/128] h-8.5" />
//          </Link>
//        </div>
//      </div>
//
//      {/* Navegação principal */}
//      <div className="hidden w-fit place-self-center xl:block">
//        <nav
//          aria-label="Main"
//          data-orientation="horizontal"
//          dir="ltr"
//          data-slot="navigation-menu"
//          data-viewport="false"
//          className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
//        >
//          <div style={{ position: 'relative' }}>
//            <ul
//              data-orientation="horizontal"
//              dir="ltr"
//              data-slot="navigation-menu-list"
//              className="group flex flex-1 list-none items-center justify-center gap-1"
//            >
//              {/* Preços */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href="/pt-br/pricing"
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.pricing}
//                </Link>
//              </li>
//
//              {/* Enterprise */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href="/pt-br/enterprise"
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.enterprise}
//                </Link>
//              </li>
//
//              {/* Serviços */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_3_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_3_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.services}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Downloads */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_4_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_4_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.downloads}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Centro de Suporte */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_5_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_5_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  {dict.support}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//
//          {/* Dropdown container */}
//          <div className="absolute top-full left-0 isolate z-50 flex justify-center" />
//        </nav>
//      </div>
//
//      {!loading && (
//        console.log('Renderizando sessão:', { loading, username }),
//        <div className="xl:flex! hidden items-center gap-4 justify-self-end">
//          {username ? (
//            <UserDropdownMenu
//              username={username}
//              email={email}
//              role={role}
//              plan={plan}
//              lang={lang}
//              onLogout={handleLogout}
//            />
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              role="button"
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//            >
//              {dict.signin}
//            </Link>
//          )}
//
//          <div className="relative">
//            {/* Botão de idioma */}
//            <button
//              type="button"
//              onClick={() => setShowLangMenu(!showLangMenu)}
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//            >
//              <img
//                alt={lang}
//                src={`/assets/countries/${lang}.svg`}
//                width={24}
//                height={24}
//                loading="lazy"
//                decoding="async"
//                className="size-6 shrink-0 select-none"
//                style={{ color: 'transparent' }}
//              />
//            </button>
//
//            {/* Menu de idiomas */}
//            {showLangMenu && (
//              <div className="absolute right-0 mt-2 min-w-fit rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-2 z-50">
//                <span className="block p-2 text-secondary text-xs">Selecione um idioma</span>
//                {[
//                  { code: 'en', label: 'English' },
//                  { code: 'pt-br', label: 'Português' },
//                  { code: 'es', label: 'Español' },
//                  { code: 'zh', label: '中国人' },
//                ].map(({ code, label }) => (
//                  <button
//                    key={code}
//                    type="button"
//                    onClick={() => router.replace(pathname.replace(lang, code))}
//                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                  >
//                    <img
//                      alt={label}
//                      src={`/assets/countries/${code}.svg`}
//                      width={20}
//                      height={20}
//                      loading="lazy"
//                      decoding="async"
//                      style={{ color: 'transparent' }}
//                    />
//                    {label}
//                  </button>
//                ))}
//              </div>
//            )}
//          </div>
//        </div>
//      )}
//    </header>
//  );
//}

//frontend/src/components/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//
//export default function Header() {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false); // ← garante renderização
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return; // ← só roda se logado
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 5000); // atualiza a cada 5s
//
//    return () => clearInterval(interval);
//  }, [username]); // ← depende de username
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    const user = JSON.parse(localStorage.getItem('user'));
//    const email = user?.email || localStorage.getItem('signinEmail');
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('signinEmail');
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    <header className="w-full bg-background flex min-h-20 flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3">
//      {/* Logo */}
//      <div className="flex h-[80px] items-center gap-2 justify-self-start">
//        <div className="transition-opacity hover:opacity-75">
//          <Link href={`/${lang}/home`}>
//            <div className="relative block aspect-[419/128] h-8.5" />
//          </Link>
//        </div>
//      </div>
//
//      {/* Navegação principal */}
//      <div className="hidden w-fit place-self-center xl:block">
//        <nav
//          aria-label="Main"
//          data-orientation="horizontal"
//          dir="ltr"
//          data-slot="navigation-menu"
//          data-viewport="false"
//          className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
//        >
//          <div style={{ position: 'relative' }}>
//            <ul
//              data-orientation="horizontal"
//              dir="ltr"
//              data-slot="navigation-menu-list"
//              className="group flex flex-1 list-none items-center justify-center gap-1"
//            >
//              {/* Preços */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href="/pt-br/pricing"
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Preços
//                </Link>
//              </li>
//
//              {/* Enterprise */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href="/pt-br/enterprise"
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Enterprise
//                </Link>
//              </li>
//
//              {/* Serviços */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_3_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_3_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Serviços
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Downloads */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_4_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_4_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Downloads
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Centro de Suporte */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_5_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_5_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Centro de Suporte
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//
//          {/* Dropdown container */}
//          <div className="absolute top-full left-0 isolate z-50 flex justify-center" />
//        </nav>
//      </div>
//
//      {!loading && (
//        console.log('Renderizando sessão:', { loading, username }),
//        <div className="xl:flex hidden items-center gap-4 justify-self-end">
//          {username ? (
//            <UserDropdownMenu
//              username={username}
//              email={email}
//              role={role}
//              plan={plan}
//              lang={lang}
//              onLogout={handleLogout}
//            />
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              role="button"
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//            >
//              Iniciar sessão
//            </Link>
//          )}
//
//          <div className="relative">
//            {/* Botão de idioma */}
//            <button
//              type="button"
//              onClick={() => setShowLangMenu(!showLangMenu)}
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//            >
//              <img
//                alt={lang}
//                src={`/assets/countries/${lang}.svg`}
//                width={24}
//                height={24}
//                loading="lazy"
//                decoding="async"
//                className="size-6 shrink-0 select-none"
//                style={{ color: 'transparent' }}
//              />
//            </button>
//
//            {/* Menu de idiomas */}
//            {showLangMenu && (
//              <div className="absolute right-0 mt-2 min-w-fit rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-2 z-50">
//                <span className="block p-2 text-secondary text-xs">Selecione um idioma</span>
//                {[
//                  { code: 'en', label: 'English' },
//                  { code: 'pt-br', label: 'Português' },
//                  { code: 'es', label: 'Español' },
//                  { code: 'zh', label: '中国人' },
//                ].map(({ code, label }) => (
//                  <button
//                    key={code}
//                    type="button"
//                    onClick={() => router.replace(pathname.replace(lang, code))}
//                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                  >
//                    <img
//                      alt={label}
//                      src={`/assets/countries/${code}.svg`}
//                      width={20}
//                      height={20}
//                      loading="lazy"
//                      decoding="async"
//                      style={{ color: 'transparent' }}
//                    />
//                    {label}
//                  </button>
//                ))}
//              </div>
//            )}
//          </div>
//        </div>
//      )}
//    </header>
//  );
//}

//frontend/src/components/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//
//export default function Header() {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Sessão inválida');
//
//        const data = await res.json();
//
//        if (data.username) {
//          setUsername(data.username);
//          setEmail(data.email || null);
//          setRole(data.role || null);
//          setPlan(data.plan || 'no-plan');
//        }
//      } catch (err) {
//        console.warn('Erro ao verificar sessão:', err);
//        setUsername('');
//      } finally {
//        setLoading(false); // ← garante renderização
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    if (!username) return; // ← só roda se logado
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 5000); // atualiza a cada 5s
//
//    return () => clearInterval(interval);
//  }, [username]); // ← depende de username
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    const user = JSON.parse(localStorage.getItem('user'));
//    const email = user?.email || localStorage.getItem('signinEmail');
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('signinEmail');
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    <header className="w-full bg-background flex min-h-20 flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3">
//      {/* Logo */}
//      <div className="flex h-[80px] items-center gap-2 justify-self-start">
//        <div className="transition-opacity hover:opacity-75">
//          <Link href={`/${lang}/home`}>
//            <div className="relative block aspect-[419/128] h-8.5" />
//          </Link>
//        </div>
//      </div>
//
//      {/* Navegação principal */}
//      <div className="hidden w-fit place-self-center xl:block">
//        <nav
//          aria-label="Main"
//          data-orientation="horizontal"
//          dir="ltr"
//          data-slot="navigation-menu"
//          data-viewport="false"
//          className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
//        >
//          <div style={{ position: 'relative' }}>
//            <ul
//              data-orientation="horizontal"
//              dir="ltr"
//              data-slot="navigation-menu-list"
//              className="group flex flex-1 list-none items-center justify-center gap-1"
//            >
//              {/* Preços */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href="/pt-br/pricing"
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Preços
//                </Link>
//              </li>
//
//              {/* Enterprise */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href="/pt-br/enterprise"
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Enterprise
//                </Link>
//              </li>
//
//              {/* Serviços */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_3_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_3_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Serviços
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Downloads */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_4_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_4_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Downloads
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Centro de Suporte */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_5_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_5_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Centro de Suporte
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//
//          {/* Dropdown container */}
//          <div className="absolute top-full left-0 isolate z-50 flex justify-center" />
//        </nav>
//      </div>
//
//      {!loading && (
//        console.log('Renderizando sessão:', { loading, username }),
//        <div className="xl:flex hidden items-center gap-4 justify-self-end">
//          {username ? (
//            <UserDropdownMenu
//              username={username}
//              email={email}
//              role={role}
//              plan={plan}
//              lang={lang}
//              onLogout={handleLogout}
//            />
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              role="button"
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 max-xl:flex-1"
//            >
//              Iniciar sessão
//            </Link>
//          )}
//
//          <div className="relative">
//            {/* Botão de idioma */}
//            <button
//              type="button"
//              onClick={() => setShowLangMenu(!showLangMenu)}
//              className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//            >
//              <img
//                alt={lang}
//                src={`/assets/countries/${lang}.svg`}
//                width={24}
//                height={24}
//                loading="lazy"
//                decoding="async"
//                className="size-6 shrink-0 select-none"
//                style={{ color: 'transparent' }}
//              />
//            </button>
//
//            {/* Menu de idiomas */}
//            {showLangMenu && (
//              <div className="absolute right-0 mt-2 min-w-fit rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-2 z-50">
//                <span className="block p-2 text-secondary text-xs">Selecione um idioma</span>
//                {[
//                  { code: 'en', label: 'English' },
//                  { code: 'pt-br', label: 'Português' },
//                  { code: 'es', label: 'Español' },
//                  { code: 'zh', label: '中国人' },
//                ].map(({ code, label }) => (
//                  <button
//                    key={code}
//                    type="button"
//                    onClick={() => router.replace(pathname.replace(lang, code))}
//                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                  >
//                    <img
//                      alt={label}
//                      src={`/assets/countries/${code}.svg`}
//                      width={20}
//                      height={20}
//                      loading="lazy"
//                      decoding="async"
//                      style={{ color: 'transparent' }}
//                    />
//                    {label}
//                  </button>
//                ))}
//              </div>
//            )}
//          </div>
//        </div>
//      )}
//    </header>
//  );
//}
  
  //  useEffect(() => {
  //    const checkSession = async () => {
  //      const res = await fetch('/api/verify-token', {
  //        method: 'GET',
  //        credentials: 'include',
  //      });
  //      const data = await res.json();
  //
  //      if (data.username) {
  //        setUsername(data.username);
  //        setEmail(data.email || null);
  //        setRole(data.role || null);
  //        setPlan(data.plan || 'no-plan'); // ← ESSENCIAL!
  //      }
  //
  //      setLoading(false);
  //    };
  //
  //    checkSession();
  //  }, []);

  //  useEffect(() => {
  //    const fetchUserStatus = async () => {
  //      try {
  //        const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
  //        const data = await res.json();
  //        setPlan(data.plan || 'no-plan');
  //      } catch {
  //        // Silenciar erros
  //      }
  //    };
  //
  //    fetchUserStatus(); // inicial
  //    const interval = setInterval(fetchUserStatus, 5000); // atualiza a cada 5s
  //
  //    return () => clearInterval(interval);
  //  }, []);

// useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//
//      if (data.username) {
//        setUsername(data.username);
//        setEmail(data.email || null);
//        setRole(data.role || null);
//        setPlan(data.plan || 'no-plan'); // ← ESSENCIAL!
//      }
//
//      setLoading(false);
//    };
//
//    checkSession();
//  }, []);

//useEffect(() => {
//  if (!username) return; // ← só executa se estiver logado
//
//  const fetchUserStatus = async () => {
//    try {
//      const res = await fetch('/api/user/status', {
//        method: 'GET',
//        credentials: 'include',
//      });
//
//      if (!res.ok) throw new Error('Unauthorized');
//
//      const data = await res.json();
//      setPlan(data.plan || 'no-plan');
//    } catch (err) {
//      console.warn('Erro ao buscar status do usuário:', err);
//    }
//  };
//
//  fetchUserStatus(); // inicial
//  const interval = setInterval(fetchUserStatus, 5000); // atualiza a cada 5s
//
//  return () => clearInterval(interval);
//}, [username]); // ← depende de username

//  useEffect(() => {
//    if (!username) return; // ← só roda se estiver logado
//
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', {
//          method: 'GET',
//          credentials: 'include',
//        });
//
//        if (!res.ok) throw new Error('Unauthorized');
//
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch (err) {
//        console.warn('Erro ao buscar status do usuário:', err);
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 5000); // atualiza a cada 5s
//
//    return () => clearInterval(interval);
//  }, [username]); // ← depende de username

//frontend/src/components/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//
//export default function Header() {
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//
//      if (data.username) {
//        setUsername(data.username);
//        setEmail(data.email || null);
//        setRole(data.role || null);
//        setPlan(data.plan || 'no-plan'); // ← ESSENCIAL!
//      }
//
//      setLoading(false);
//    };
//
//    checkSession();
//  }, []);
//
//  useEffect(() => {
//    const fetchUserStatus = async () => {
//      try {
//        const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//        const data = await res.json();
//        setPlan(data.plan || 'no-plan');
//      } catch {
//        // Silenciar erros
//      }
//    };
//
//    fetchUserStatus(); // inicial
//    const interval = setInterval(fetchUserStatus, 5000); // atualiza a cada 5s
//
//    return () => clearInterval(interval);
//  }, []);
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    const user = JSON.parse(localStorage.getItem('user'));
//    const email = user?.email || localStorage.getItem('signinEmail');
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('signinEmail');
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    <header className="w-full bg-background flex min-h-20 flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3">
//      {/* Logo */}
//      <div className="flex h-[80px] items-center gap-2 justify-self-start">
//        <div className="transition-opacity hover:opacity-75">
//          <Link href={`/${lang}/home`}>
//            <div className="relative block aspect-[419/128] h-8.5" />
//          </Link>
//        </div>
//      </div>
//
//      {/* Navegação principal */}
//      <div className="hidden w-fit place-self-center xl:block">
//        <nav
//          aria-label="Main"
//          data-orientation="horizontal"
//          dir="ltr"
//          data-slot="navigation-menu"
//          data-viewport="false"
//          className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
//        >
//          <div style={{ position: 'relative' }}>
//            <ul
//              data-orientation="horizontal"
//              dir="ltr"
//              data-slot="navigation-menu-list"
//              className="group flex flex-1 list-none items-center justify-center gap-1"
//            >
//              {/* Preços */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href="/pt-br/pricing"
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Preços
//                </Link>
//              </li>
//
//              {/* Enterprise */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href="/pt-br/enterprise"
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Enterprise
//                </Link>
//              </li>
//
//              {/* Serviços */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_3_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_3_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Serviços
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Downloads */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_4_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_4_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Downloads
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Centro de Suporte */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_5_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_5_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Centro de Suporte
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//
//          {/* Dropdown container */}
//          <div className="absolute top-full left-0 isolate z-50 flex justify-center" />
//        </nav>
//      </div>
//
//      {/* Sessão do usuário */}
//      {!loading && (
//        <UserDropdownMenu
//          username={username}
//          email={email}
//          role={role}
//          plan={plan}
//          lang={lang}
//          onLogout={handleLogout}
//        />
//      )}
//    </header>
//  );
//}

//frontend/src/components/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//
//export default function Header() {
//  const [username, setUsername] = useState('');
//  const [email, setEmail] = useState(null);
//  const [role, setRole] = useState(null);
//  const [plan, setPlan] = useState(null);
//
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (data.username) {
//        setUsername(data.username);
//      }
//      setLoading(false);
//    };
//    checkSession();
//  }, []);
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    const user = JSON.parse(localStorage.getItem('user'));
//    const email = user?.email || localStorage.getItem('signinEmail');
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('signinEmail');
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    <header className="w-full bg-background flex min-h-20 flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3">
//      {/* Logo */}
//      <div className="flex h-[80px] items-center gap-2 justify-self-start">
//        <div className="transition-opacity hover:opacity-75">
//          <Link href={`/${lang}/home`}>
//            <div className="relative block aspect-[419/128] h-8.5" />
//          </Link>
//        </div>
//      </div>
//
//      {/* Navegação principal */}
//      <div className="hidden w-fit place-self-center xl:block">
//        <nav
//          aria-label="Main"
//          data-orientation="horizontal"
//          dir="ltr"
//          data-slot="navigation-menu"
//          data-viewport="false"
//          className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
//        >
//          <div style={{ position: 'relative' }}>
//            <ul
//              data-orientation="horizontal"
//              dir="ltr"
//              data-slot="navigation-menu-list"
//              className="group flex flex-1 list-none items-center justify-center gap-1"
//            >
//              {/* Preços */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href="/pt-br/pricing"
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Preços
//                </Link>
//              </li>
//
//              {/* Enterprise */}
//              <li className="justify-start" data-slot="navigation-menu-item">
//                <Link
//                  href="/pt-br/enterprise"
//                  data-slot="navigation-menu-link"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Enterprise
//                </Link>
//              </li>
//
//              {/* Serviços */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_3_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_3_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Serviços
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Downloads */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_4_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_4_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Downloads
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//
//              {/* Centro de Suporte */}
//              <li data-slot="navigation-menu-item">
//                <button
//                  id="radix-_r_0_-trigger-radix-_r_5_"
//                  data-state="closed"
//                  aria-expanded="false"
//                  aria-controls="radix-_r_0_-content-radix-_r_5_"
//                  data-slot="navigation-menu-trigger"
//                  data-radix-collection-item=""
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary"
//                >
//                  Centro de Suporte
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    aria-hidden="true"
//                    className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//
//          {/* Dropdown container */}
//          <div className="absolute top-full left-0 isolate z-50 flex justify-center" />
//        </nav>
//      </div>
//
//      {/* Sessão do usuário */}
//      {!loading && (
//        <UserDropdownMenu
//          username={username}
//          email={email}
//          role={role}
//          plan={plan}
//          lang={lang}
//          onLogout={handleLogout}
//        />
//      )}
//    </header>
//  );
//}


//      {/* Sessão do usuário */}
//      {!loading && (
//        <div className="text-sm">
//          {username ? (
//            <div className="flex items-center gap-4">
//              <Link href={`/${lang}/dashboard`} className="hover:underline">
//                Olá, {username}
//              </Link>
//              <button
//                onClick={handleLogout}
//                className="text-red-400 hover:text-red-300 underline"
//              >
//                Sair
//              </button>
//            </div>
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              className="text-green-400 hover:text-green-300 underline"
//            >
//              Iniciar sessão
//            </Link>
//          )}
//        </div>
//      )}
//    </header>
//  );
//}

//frontend/src/components/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//
//export default function Header() {
//  const [username, setUsername] = useState('');
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (data.username) {
//        setUsername(data.username);
//      }
//      setLoading(false);
//    };
//    checkSession();
//  }, []);
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    const user = JSON.parse(localStorage.getItem('user'));
//    const email = user?.email || localStorage.getItem('signinEmail');
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('signinEmail');
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//
//    <header className="w-full bg-background flex min-h-20 flex-wrap place-items-center justify-between px-4 sm:px-6 xl:grid xl:grid-cols-3">
//      {/* Logo */}
//      <div className="flex h-[80px] items-center gap-2 justify-self-start">
//        <div className="transition-opacity hover:opacity-75">
//          <Link href={`/${lang}/home`}>
//            <div className="relative block aspect-[419/128] h-8.5" />
//          </Link>
//        </div>
//      </div>
//
//      {/* Navegação principal */}
//      <div className="hidden w-fit place-self-center xl:block">
//        <nav
//  aria-label="Main"
//  data-orientation="horizontal"
//  dir="ltr"
//  data-slot="navigation-menu"
//  data-viewport="false"
//  className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
//>
//  <div style={{ position: 'relative' }}>
//    <ul
//      data-orientation="horizontal"
//      dir="ltr"
//      data-slot="navigation-menu-list"
//      className="group flex flex-1 list-none items-center justify-center gap-1"
//    >
//      {/* Preços */}
//      <li className="justify-start" data-slot="navigation-menu-item">
//        <Link
//          href="/pt-br/pricing"
//          data-slot="navigation-menu-link"
//          data-radix-collection-item=""
//          className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-active:bg-blue-200/10 data-active:text-primary data-[state=open]:bg-blue-200/10"
//        >
//          Preços
//        </Link>
//      </li>
//
//      {/* Enterprise */}
//      <li className="justify-start" data-slot="navigation-menu-item">
//        <Link
//          href="/pt-br/enterprise"
//          data-slot="navigation-menu-link"
//          data-radix-collection-item=""
//          className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-active:bg-blue-200/10 data-active:text-primary data-[state=open]:bg-blue-200/10"
//        >
//          Enterprise
//        </Link>
//      </li>
//
//      {/* Serviços */}
//      <li data-slot="navigation-menu-item">
//        <button
//          id="radix-_r_0_-trigger-radix-_r_3_"
//          data-state="closed"
//          aria-expanded="false"
//          aria-controls="radix-_r_0_-content-radix-_r_3_"
//          data-slot="navigation-menu-trigger"
//          data-radix-collection-item=""
//          className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-active:bg-blue-200/10 data-active:text-primary data-[state=open]:bg-blue-200/10 group"
//        >
//          Serviços
//          <svg
//            xmlns="http://www.w3.org/2000/svg"
//            width="1em"
//            height="1em"
//            fill="currentColor"
//            viewBox="0 0 256 256"
//            aria-hidden="true"
//            className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//          >
//            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//          </svg>
//        </button>
//      </li>
//
//      {/* Downloads */}
//      <li data-slot="navigation-menu-item">
//        <button
//          id="radix-_r_0_-trigger-radix-_r_4_"
//          data-state="closed"
//          aria-expanded="false"
//          aria-controls="radix-_r_0_-content-radix-_r_4_"
//          data-slot="navigation-menu-trigger"
//          data-radix-collection-item=""
//          className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-active:bg-blue-200/10 data-active:text-primary data-[state=open]:bg-blue-200/10 group"
//        >
//          Downloads
//          <svg
//            xmlns="http://www.w3.org/2000/svg"
//            width="1em"
//            height="1em"
//            fill="currentColor"
//            viewBox="0 0 256 256"
//            aria-hidden="true"
//            className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//          >
//            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//          </svg>
//        </button>
//      </li>
//
//      {/* Centro de Suporte */}
//      <li data-slot="navigation-menu-item">
//        <button
//          id="radix-_r_0_-trigger-radix-_r_5_"
//          data-state="closed"
//          aria-expanded="false"
//          aria-controls="radix-_r_0_-content-radix-_r_5_"
//          data-slot="navigation-menu-trigger"
//          data-radix-collection-item=""
//          className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-active:bg-blue-200/10 data-active:text-primary data-[state=open]:bg-blue-200/10 group"
//        >
//          Centro de Suporte
//          <svg
//            xmlns="http://www.w3.org/2000/svg"
//            width="1em"
//            height="1em"
//            fill="currentColor"
//            viewBox="0 0 256 256"
//            aria-hidden="true"
//            className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
//          >
//            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//          </svg>
//        </button>
//      </li>
//    </ul>
//  </div>
//
//  {/* Dropdown container */}
//  <div className="absolute top-full left-0 isolate z-50 flex justify-center" />
//</nav>
//      </div>
//      {/* Sessão do usuário */}
//      {!loading && (
//        <div className="text-sm">
//          {username ? (
//            <div className="flex items-center gap-4">
//              <Link href={`/${lang}/dashboard`} className="hover:underline">
//                Olá, {username}
//              </Link>
//              <button
//                onClick={handleLogout}
//                className="text-red-400 hover:text-red-300 underline"
//              >
//                Sair
//              </button>
//            </div>
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              className="text-green-400 hover:text-green-300 underline"
//            >
//              Iniciar sessão
//            </Link>
//          )}
//        </div>
//      )}
//    </header>
//  );
//}

//frontend/src/components/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//
//export default function Header() {
//  const [username, setUsername] = useState('');
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false);
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (data.username) {
//        setUsername(data.username);
//      }
//      setLoading(false);
//    };
//    checkSession();
//  }, []);
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    const user = JSON.parse(localStorage.getItem('user'));
//    const email = user?.email || localStorage.getItem('signinEmail');
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('signinEmail');
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md text-white shadow-md">
//      {/* Logo */}
//      <Link href={`/${lang}`} className="flex items-center text-2xl font-bold">
//        <img src="/logo.png" alt="Virtus Cloud Logo" className="w-10 h-10 mr-3" />
//        Virtus Cloud
//      </Link>
//
//      {/* Navegação customizada */}
//      <div className="hidden xl:block w-fit place-self-center">
//        <nav
//          aria-label="Main"
//          dir="ltr"
//          className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
//        >
//          <div className="relative">
//            <ul className="group flex flex-1 list-none items-center justify-center gap-1">
//              <li className="justify-start">
//                <Link
//                  href={`/${lang}/pricing`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden"
//                >
//                  Preços
//                </Link>
//              </li>
//              <li className="justify-start">
//                <Link
//                  href={`/${lang}/enterprise`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden"
//                >
//                  Enterprise
//                </Link>
//              </li>
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden">
//                  Serviços
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180">
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//              <li>
//                <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden">
//                  Downloads
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180">
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//              <li onMouseEnter={() => setSupportOpen(true)} onMouseLeave={() => setSupportOpen(false)}>
//                <button
//                  data-state={supportOpen ? 'open' : 'closed'}
//                  aria-expanded={supportOpen}
//                  className={`group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm transition-colors focus:outline-hidden ${supportOpen ? 'bg-blue-200/10 text-primary' : 'text-secondary hover:bg-blue-200/5 hover:text-primary'
//                    }`}
//                >
//                  Centro de Suporte
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className={`relative top-[1px] ml-1 size-3 transition duration-250 ${supportOpen ? 'rotate-180' : ''}`}>
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//
//                {/* Dropdown */}
//                {supportOpen && (
//                  <div className="absolute top-full left-0 isolate z-50 flex justify-center w-full">
//                    <div
//                      data-state="open"
//                      className="relative mt-1.5 h-[206px] w-full origin-top-center overflow-hidden rounded-md border bg-popover text-popover-foreground shadow transition-all duration-250 md:w-[690px]"
//                    >
//                      <div
//                        id="radix-support-content"
//                        aria-labelledby="radix-support-trigger"
//                        className="top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto"
//                      >
//                        <ul className="min-w-2xl p-2">
//                          <p className="pb-4 pl-2 font-medium text-secondary text-xs">Centro de Suporte</p>
//                          <div className="grid w-full grid-cols-2 gap-4">
//                            {/* Atendimento ao Cliente */}
//                            <Link href={`/${lang}/sac`} className="block" data-slot="navigation-menu-link">
//                              <div className="flex h-full flex-col justify-between gap-4 rounded-md border border-border p-4 hover:bg-blue-50/5">
//                                <div>
//                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M201.89,54.66A103.43,103.43,0,0,0,128.79,24H128A104,104,0,0,0,24,128v56a24,24,0,0,0,24,24H64a24,24,0,0,0,24-24V144a24,24,0,0,0-24-24H40.36A88.12,88.12,0,0,1,190.54,65.93,87.39,87.39,0,0,1,215.65,120H192a24,24,0,0,0-24,24v40a24,24,0,0,0,24,24h24a24,24,0,0,1-24,24H136a8,8,0,0,0,0,16h56a40,40,0,0,0,40-40V128A103.41,103.41,0,0,0,201.89,54.66ZM64,136a8,8,0,0,1,8,8v40a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V136Zm128,56a8,8,0,0,1-8-8V144a8,8,0,0,1,8-8h24v56Z" />
//                                  </svg>
//                                </div>
//                                <div className="space-y-1">
//                                  <p className="font-medium text-sm">Atendimento ao Cliente</p>
//                                  <span className="block text-secondary text-xs">
//                                    Suporte imediato pelo site: chat ao vivo, abertura e acompanhamento de tickets, com respostas ágeis para resolver dúvidas.
//                                  </span>
//                                </div>
//                              </div>
//                            </Link>
//
//                            {/* Documentação */}
//                            <a
//                              href="https://docs.virtuscloud.app/"
//                              target="_blank"
//                              className="block"
//                              data-slot="navigation-menu-link"
//                            >
//                              <div className="flex h-full flex-col justify-between gap-4 rounded-md border border-border p-4 hover:bg-blue-50/5">
//                                <div>
//                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M232,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H24a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h72a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64ZM160,88h40a8,8,0,0,1,0,16H160a8,8,0,0,1,0-16Zm48,40a8,8,0,0,1-8,8H160a8,8,0,0,1,0-16h40A8,8,0,0,1,208,128Zm0,32a8,8,0,0,1-8,8H160a8,8,0,0,1,0-16h40A8,8,0,0,1,208,160Z" />
//                                  </svg>
//                                </div>
//                                <div className="space-y-1">
//                                  <p className="font-medium text-sm">Documentação</p>
//                                  <span className="block text-secondary text-xs">
//                                    Acesse guias completos, tutoriais passo a passo e referências de API para configurar, integrar e otimizar seus projetos sem complicações.
//                                  </span>
//                                </div>
//                              </div>
//                            </a>
//                          </div>
//                        </ul>
//                      </div>
//                    </div>
//                  </div>
//                )}
//              </li>
//            </ul>
//          </div>
//        </nav>
//      </div>
//
//      {/* Sessão do usuário */}
//      {!loading && (
//        <div className="text-sm">
//          {username ? (
//            <div className="flex items-center gap-4">
//              <Link href={`/${lang}/dashboard`} className="hover:underline">
//                Olá, {username}
//              </Link>
//              <button
//                onClick={handleLogout}
//                className="text-red-400 hover:text-red-300 underline"
//              >
//                Sair
//              </button>
//            </div>
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              className="text-green-400 hover:text-green-300 underline"
//            >
//              Iniciar sessão
//            </Link>
//          )}
//        </div>
//      )}
//    </header>
//  );
//}

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//
//export default function Header() {
//  const [username, setUsername] = useState('');
//  const [loading, setLoading] = useState(true);
//  const [supportOpen, setSupportOpen] = useState(false); // 👈 controle de hover
//
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (data.username) {
//        setUsername(data.username);
//      }
//      setLoading(false);
//    };
//    checkSession();
//  }, []);
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    const user = JSON.parse(localStorage.getItem('user'));
//    const email = user?.email || localStorage.getItem('signinEmail');
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('signinEmail');
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md text-white shadow-md">
//      {/* Logo */}
//      <Link href={`/${lang}`} className="flex items-center text-2xl font-bold">
//        <img src="/logo.png" alt="Virtus Cloud Logo" className="w-10 h-10 mr-3" />
//        Virtus Cloud
//      </Link>
//
//      {/* Navegação customizada */}
//      <div className="hidden xl:block w-fit place-self-center">
//        <nav
//          aria-label="Main"
//          dir="ltr"
//          className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
//        >
//          <div className="relative">
//            <ul className="group flex flex-1 list-none items-center justify-center gap-1">
//              <li className="justify-start">
//                <Link
//                  href={`/${lang}/pricing`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden"
//                >
//                  Preços
//                </Link>
//              </li>
//              <li className="justify-start">
//                <Link
//                  href={`/${lang}/enterprise`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden"
//                >
//                  Enterprise
//                </Link>
//              </li>
//              <li>
//                <button
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden"
//                >
//                  Serviços
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180">
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//              <li>
//                <button
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden"
//                >
//                  Downloads
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180">
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//              <li>
//                <button
//                  onMouseEnter={() => setSupportOpen(true)}
//                  onMouseLeave={() => setSupportOpen(false)}
//                  data-state={supportOpen ? 'open' : 'closed'}
//                  aria-expanded={supportOpen}
//                  className={`group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm transition-colors focus:outline-hidden ${
//                    supportOpen
//                      ? 'bg-blue-200/10 text-primary'
//                      : 'text-secondary hover:bg-blue-200/5 hover:text-primary'
//                  }`}
//                >
//                  Centro de Suporte
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="1em"
//                    height="1em"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                    className={`relative top-[1px] ml-1 size-3 transition duration-250 ${
//                      supportOpen ? 'rotate-180' : ''
//                    }`}
//                  >
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//        </nav>
//      </div>
//
//      {/* Sessão do usuário */}
//      {!loading && (
//        <div className="text-sm">
//          {username ? (
//            <div className="flex items-center gap-4">
//              <Link href={`/${lang}/dashboard`} className="hover:underline">
//                Olá, {username}
//              </Link>
//              <button
//                onClick={handleLogout}
//                className="text-red-400 hover:text-red-300 underline"
//              >
//                Sair
//              </button>
//            </div>
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              className="text-green-400 hover:text-green-300 underline"
//            >
//              Iniciar sessão
//            </Link>
//          )}
//        </div>
//      )}
//    </header>
//  );
//}

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//
//export default function Header() {
//  const [username, setUsername] = useState('');
//  const [loading, setLoading] = useState(true);
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (data.username) {
//        setUsername(data.username);
//      }
//      setLoading(false);
//    };
//    checkSession();
//  }, []);
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    const user = JSON.parse(localStorage.getItem('user'));
//    const email = user?.email || localStorage.getItem('signinEmail');
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('signinEmail');
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md text-white shadow-md">
//      {/* Logo */}
//      <Link href={`/${lang}`} className="flex items-center text-2xl font-bold">
//        <img src="/logo.png" alt="Virtus Cloud Logo" className="w-10 h-10 mr-3" />
//        Virtus Cloud
//      </Link>
//
//      {/* Navegação customizada */}
//      <div className="hidden xl:block w-fit place-self-center">
//        <nav
//          aria-label="Main"
//          dir="ltr"
//          className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
//        >
//          <div className="relative">
//            <ul className="group flex flex-1 list-none items-center justify-center gap-1">
//              <li className="justify-start">
//                <Link
//                  href={`/${lang}/pricing`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden"
//                >
//                  Preços
//                </Link>
//              </li>
//              <li className="justify-start">
//                <Link
//                  href={`/${lang}/enterprise`}
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden"
//                >
//                  Enterprise
//                </Link>
//              </li>
//              <li>
//                <button
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden"
//                >
//                  Serviços
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180">
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//              <li>
//                <button
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden"
//                >
//                  Downloads
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180">
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//              <li>
//                <button
//                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm text-secondary transition-colors hover:bg-blue-200/5 hover:text-primary focus:outline-hidden"
//                >
//                  Centro de Suporte
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180">
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//              </li>
//            </ul>
//          </div>
//        </nav>
//      </div>
//
//      {/* Sessão do usuário */}
//      {!loading && (
//        <div className="text-sm">
//          {username ? (
//            <div className="flex items-center gap-4">
//              <Link href={`/${lang}/dashboard`} className="hover:underline">
//                Olá, {username}
//              </Link>
//              <button
//                onClick={handleLogout}
//                className="text-red-400 hover:text-red-300 underline"
//              >
//                Sair
//              </button>
//            </div>
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              className="text-green-400 hover:text-green-300 underline"
//            >
//              Iniciar sessão
//            </Link>
//          )}
//        </div>
//      )}
//    </header>
//  );
//}

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//
//export default function Header() {
//  const [username, setUsername] = useState('');
//  const [loading, setLoading] = useState(true);
//  const router = useRouter();
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (data.username) {
//        setUsername(data.username);
//      }
//      setLoading(false);
//    };
//    checkSession();
//  }, []);
//
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    const user = JSON.parse(localStorage.getItem('user'));
//    const email = user?.email || localStorage.getItem('signinEmail');
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`);
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('signinEmail');
//
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-md text-white shadow-md">
//      {/* Logo */}
//      <Link href={`/${lang}`} className="flex items-center text-2xl font-bold">
//        <img src="/logo.png" alt="Virtus Cloud Logo" className="w-10 h-10 mr-3" />
//        Virtus Cloud
//      </Link>
//
//      {/* Navegação */}
//      <nav className="hidden md:flex space-x-6 text-sm font-medium">
//        <Link href={`/${lang}/pricing`} className="hover:underline">Preços</Link>
//        <Link href={`/${lang}/enterprise`} className="hover:underline">Enterprise</Link>
//        <Link href={`/${lang}/services`} className="hover:underline">Serviços</Link>
//        <Link href={`/${lang}/domains`} className="hover:underline">Domínios</Link>
//        <Link href={`/${lang}/support`} className="hover:underline">Centro de Suporte</Link>
//      </nav>
//
//      {/* Sessão do usuário */}
//      {!loading && (
//        <div className="text-sm">
//          {username ? (
//            <div className="flex items-center gap-4">
//              <Link href={`/${lang}/dashboard`} className="hover:underline">
//                Olá, {username}
//              </Link>
//              <button
//                onClick={handleLogout}
//                className="text-red-400 hover:text-red-300 underline"
//              >
//                Sair
//              </button>
//            </div>
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              className="text-green-400 hover:text-green-300 underline"
//            >
//              Iniciar sessão
//            </Link>
//          )}
//        </div>
//      )}
//    </header>
//  );
//}

//frontend/src/components/Header.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//
//export default function Header() {
//  const [username, setUsername] = useState('');
//  const [loading, setLoading] = useState(true);
//  const router = useRouter();
//  const pathname = usePathname();
//
//  // 🌐 Detecta idioma da URL (se estiver usando rotas por idioma)
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//
//  // ✅ Verifica se o usuário está logado
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (data.username) {
//        setUsername(data.username);
//      }
//      setLoading(false);
//    };
//    checkSession();
//  }, []);
//
//  // 🔓 Função de logout
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    // 🔥 Limpa dados locais
//    const user = JSON.parse(localStorage.getItem('user'));
//    const email = user?.email || localStorage.getItem('signinEmail');
//
//    if (email) {
//      localStorage.removeItem(`resendStartedAt:signin:${email}`); // ⏱️ limpa timer de reenvio
//    }
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//    localStorage.removeItem('signinEmail');
//
//    // 🔄 Força recarregamento para limpar sessão
//    setUsername('');
//    router.replace(`/${lang}/signin`);
//  };
//  //const handleLogout = async () => {
//  //  await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//  //
//  //  // 🔥 Limpa dados locais
//  //  localStorage.removeItem('user');
//  //  localStorage.removeItem('canAccessConfirm');
//  //
//  //  // 🔄 Força recarregamento para limpar sessão
//  //  setUsername('');
//  //  router.replace(`/${lang}/signin`);
//  //};
//  //const handleLogout = async () => {
//  //  await fetch('/api/logout', { method: 'POST' });
//  //  setUsername('');
//  //  router.replace(`/${lang}/signin`);
//  //};
//
//  return (
//    <header className="flex justify-between items-center px-6 py-4 bg-black text-white">
//      {/* Logo */}
//      <div className="text-2xl font-bold flex items-center">
//        <img src="/logo.png" alt="Virtus Cloud Logo" className="w-12 h-12 mr-3" />
//        Virtus Cloud
//      </div>
//
//      {/* Navegação - Menus na versão desktop */}
//      <nav className="space-x-6 hidden md:flex">
//        <a href="#" className="text-lg hover:underline">Preços</a>
//        <a href="#" className="text-lg hover:underline">Enterprise</a>
//        <a href="#" className="text-lg hover:underline">Serviços</a>
//        <a href="#" className="text-lg hover:underline">Downloads</a>
//        <a href="#" className="text-lg hover:underline">Suporte</a>
//        <a href="#" className="text-lg hover:underline">Blog</a>
//      </nav>
//
//      {/* Sessão do usuário */}
//      {!loading && (
//        <div className="text-sm">
//          {username ? (
//            <div className="flex items-center gap-4">
//              <Link href={`/${lang}/dashboard`} className="hover:underline">
//                Olá, {username}
//              </Link>
//              <button
//                onClick={handleLogout}
//                className="text-red-400 hover:text-red-300 underline"
//              >
//                Sair
//              </button>
//            </div>
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              className="text-green-400 hover:text-green-300 underline"
//            >
//              Acessar conta
//            </Link>
//          )}
//        </div>
//      )}
//    </header>
//  );
//}

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//
//export default function Header() {
//  const [username, setUsername] = useState('');
//  const [loading, setLoading] = useState(true);
//  const router = useRouter();
//  const pathname = usePathname();
//
//  // 🌐 Detecta idioma da URL (se estiver usando rotas por idioma)
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//
//  // ✅ Verifica se o usuário está logado
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (data.username) {
//        setUsername(data.username);
//      }
//      setLoading(false);
//    };
//    checkSession();
//  }, []);
//
//  // 🔓 Função de logout
//  const handleLogout = async () => {
//  await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//  // 🔥 Limpa dados locais
//  localStorage.removeItem('user');
//  localStorage.removeItem('canAccessConfirm');
//
//  // 🔄 Força recarregamento para limpar sessão
//  setUsername('');
//  router.replace(`/${lang}/signin`);
//};
//  //const handleLogout = async () => {
//  //  await fetch('/api/logout', { method: 'POST' });
//  //  setUsername('');
//  //  router.replace(`/${lang}/signin`);
//  //};
//
//  return (
//    <header className="flex justify-between items-center px-6 py-4 bg-black text-white">
//      {/* Logo */}
//      <div className="text-2xl font-bold flex items-center">
//        <img src="/logo.png" alt="Virtus Cloud Logo" className="w-12 h-12 mr-3" />
//        Virtus Cloud
//      </div>
//
//      {/* Navegação - Menus na versão desktop */}
//      <nav className="space-x-6 hidden md:flex">
//        <a href="#" className="text-lg hover:underline">Preços</a>
//        <a href="#" className="text-lg hover:underline">Enterprise</a>
//        <a href="#" className="text-lg hover:underline">Serviços</a>
//        <a href="#" className="text-lg hover:underline">Downloads</a>
//        <a href="#" className="text-lg hover:underline">Suporte</a>
//        <a href="#" className="text-lg hover:underline">Blog</a>
//      </nav>
//
//      {/* Sessão do usuário */}
//      {!loading && (
//        <div className="text-sm">
//          {username ? (
//            <div className="flex items-center gap-4">
//              <Link href={`/${lang}/dashboard`} className="hover:underline">
//                Olá, {username}
//              </Link>
//              <button
//                onClick={handleLogout}
//                className="text-red-400 hover:text-red-300 underline"
//              >
//                Sair
//              </button>
//            </div>
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              className="text-green-400 hover:text-green-300 underline"
//            >
//              Acessar conta
//            </Link>
//          )}
//        </div>
//      )}
//    </header>
//  );
//}

//'use client';
//
//import { useRouter, usePathname } from 'next/navigation';
//import Link from 'next/link';
//import { useAuthGuard } from '@/hooks/useAuthGuard'; // ⛑️ Hook de proteção
//
//export default function Header() {
//  const router = useRouter();
//  const pathname = usePathname();
//
//  // 🌐 Detecta idioma da URL (se estiver usando rotas por idioma)
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//
//  // 🔐 Dados do usuário via hook
//  const { username, loading } = useAuthGuard();
//
//  // 🔓 Função de logout
//  const handleLogout = async () => {
//    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//    localStorage.removeItem('user');
//    localStorage.removeItem('canAccessConfirm');
//
//    router.replace(`/${lang}/signin`);
//  };
//
//  return (
//    <header className="flex justify-between items-center px-6 py-4 bg-black text-white">
//      {/* Logo */}
//      <div className="text-2xl font-bold flex items-center">
//        <img src="/logo.png" alt="Virtus Cloud Logo" className="w-12 h-12 mr-3" />
//        Virtus Cloud
//      </div>
//
//      {/* Navegação - Menus na versão desktop */}
//      <nav className="space-x-6 hidden md:flex">
//        <a href="#" className="text-lg hover:underline">Preços</a>
//        <a href="#" className="text-lg hover:underline">Enterprise</a>
//        <a href="#" className="text-lg hover:underline">Serviços</a>
//        <a href="#" className="text-lg hover:underline">Downloads</a>
//        <a href="#" className="text-lg hover:underline">Suporte</a>
//        <a href="#" className="text-lg hover:underline">Blog</a>
//      </nav>
//
//      {/* Sessão do usuário */}
//      {!loading && (
//        <div className="text-sm">
//          {username ? (
//            <div className="flex items-center gap-4">
//              <Link href={`/${lang}/dashboard`} className="hover:underline">
//                Olá, {username}
//              </Link>
//              <button
//                onClick={handleLogout}
//                className="text-red-400 hover:text-red-300 underline"
//              >
//                Sair
//              </button>
//            </div>
//          ) : (
//            <Link
//              href={`/${lang}/signin`}
//              className="text-green-400 hover:text-green-300 underline"
//            >
//              Acessar conta
//            </Link>
//          )}
//        </div>
//      )}
//    </header>
//  );
//}


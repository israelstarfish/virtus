

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Logo from '@/components/Recycles/Header/Logo';
//import Link from 'next/link';
//import { UserDropdownMenu } from '@/components/UserDropdownMenu';
import ProfileButton from '@/components/Recycles/ProfileButton';
import { headerMessages } from '@/app/[lang]/messages/home';

export default function DefaultHeader() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState(null);
    const [role, setRole] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLangMenu, setShowLangMenu] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    const getLang = (pathname) => {
        const segment = pathname.split('/')[1];
        const supported = ['pt-br', 'en', 'es', 'zh'];
        return supported.includes(segment) ? segment : 'pt-br';
    };

    const lang = getLang(pathname);
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

        const getCookie = (name) => {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? decodeURIComponent(match[2]) : null;
        };

        const loginCookie = getCookie('virtuscloud.login');
        let email = '';

        try {
            email = JSON.parse(loginCookie)?.email || '';
        } catch { }

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
        <header className="group sticky top-0 z-50 max-h-screen min-h-20 w-full border-b border-virtus-600 bg-black-900/75 backdrop-blur-2xl max-xl:overflow-auto">
            <div className="container flex min-h-[80px] flex-col">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex h-[80px] items-center gap-2 justify-self-start">
                        <Logo />
                    </div>

                    {/* Perfil + idioma */}
                    <ProfileButton
                        loading={loading}
                        username={username}
                        email={email}
                        role={role}
                        plan={plan}
                        lang={lang}
                        pathname={pathname}
                        showLangMenu={showLangMenu}
                        setShowLangMenu={setShowLangMenu}
                        onLogout={handleLogout}
                    />

                    {/* Menu mobile */}
                    <div className="flex items-center gap-4 sm:hidden">
                        <button
                            aria-label="Abrir navbar"
                            className="group relative size-10 cursor-pointer select-none"
                            type="button"
                            aria-expanded="false"
                        >
                            <span className="absolute top-[30%] left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 -translate-x-1/2 -translate-y-1/2 group-aria-expanded:top-1/2 group-aria-expanded:rotate-45" />
                            <span className="absolute top-1/2 left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 -translate-x-1/2 -translate-y-1/2 group-aria-expanded:opacity-0" />
                            <span className="absolute top-[70%] left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 -translate-x-1/2 -translate-y-1/2 group-aria-expanded:top-1/2 group-aria-expanded:-rotate-45" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}


//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Logo from '@/components/Header/Logo';
////import Link from 'next/link';
////import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import ProfileButton from '@/components/Recycles/ProfileButton';
//import { headerMessages } from '@/app/[lang]/messages/home';
//
//export default function DefaultHeader() {
//    const [username, setUsername] = useState('');
//    const [email, setEmail] = useState(null);
//    const [role, setRole] = useState(null);
//    const [plan, setPlan] = useState(null);
//    const [loading, setLoading] = useState(true);
//    const [showLangMenu, setShowLangMenu] = useState(false);
//
//    const router = useRouter();
//    const pathname = usePathname();
//
//    const getLang = (pathname) => {
//        const segment = pathname.split('/')[1];
//        const supported = ['pt-br', 'en', 'es', 'zh'];
//        return supported.includes(segment) ? segment : 'pt-br';
//    };
//
//    const lang = getLang(pathname);
//    const dict = headerMessages[lang] || headerMessages['pt-br'];
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', {
//                    method: 'GET',
//                    credentials: 'include',
//                });
//
//                if (!res.ok) throw new Error('Sessão inválida');
//
//                const data = await res.json();
//
//                if (data.username) {
//                    setUsername(data.username);
//                    setEmail(data.email || null);
//                    setRole(data.role || null);
//                    setPlan(data.plan || 'no-plan');
//                }
//            } catch (err) {
//                console.warn('Erro ao verificar sessão:', err);
//                setUsername('');
//            } finally {
//                setLoading(false);
//            }
//        };
//
//        checkSession();
//    }, []);
//
//    useEffect(() => {
//        if (!username) return;
//
//        const fetchUserStatus = async () => {
//            try {
//                const res = await fetch('/api/user/status', {
//                    method: 'GET',
//                    credentials: 'include',
//                });
//
//                if (!res.ok) throw new Error('Unauthorized');
//
//                const data = await res.json();
//                setPlan(data.plan || 'no-plan');
//            } catch (err) {
//                console.warn('Erro ao buscar status do usuário:', err);
//            }
//        };
//
//        fetchUserStatus();
//        const interval = setInterval(fetchUserStatus, 2000);
//        return () => clearInterval(interval);
//    }, [username]);
//
//    const handleLogout = async () => {
//        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//        const getCookie = (name) => {
//            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//            return match ? decodeURIComponent(match[2]) : null;
//        };
//
//        const loginCookie = getCookie('virtuscloud.login');
//        let email = '';
//
//        try {
//            email = JSON.parse(loginCookie)?.email || '';
//        } catch { }
//
//        if (email) {
//            localStorage.removeItem(`resendStartedAt:signin:${email}`);
//        }
//
//        localStorage.removeItem('user');
//        localStorage.removeItem('canAccessConfirm');
//        localStorage.removeItem('lastInteraction:signin');
//
//        document.cookie = 'virtuscloud.login=; path=/; max-age=0';
//        document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
//        document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';
//
//        setUsername('');
//        router.replace(`/${lang}/signin`);
//    };
//
//    return (
//        <header className="group sticky top-0 z-50 max-h-screen min-h-20 w-full border-b border-virtus-600 bg-black-900/75 backdrop-blur-2xl max-xl:overflow-auto">
//            <div className="container flex min-h-[80px] flex-col">
//                <div className="flex items-center justify-between">
//                    {/* Logo */}
//                    <div className="flex h-[80px] items-center gap-2 justify-self-start">
//                        <a className="transition-opacity hover:opacity-75" tabIndex={-1} href={`/${lang}/home`}>
//                            <div className="relative block aspect-[419/128] h-8.5">
//                                <Logo />
//                            </div>
//                        </a>
//                    </div>
//
//                    {/* Perfil + idioma */}
//                    <ProfileButton
//                        loading={loading}
//                        username={username}
//                        email={email}
//                        role={role}
//                        plan={plan}
//                        lang={lang}
//                        pathname={pathname}
//                        showLangMenu={showLangMenu}
//                        setShowLangMenu={setShowLangMenu}
//                        onLogout={handleLogout}
//                    />
//
//                    {/* Menu mobile */}
//                    <div className="flex items-center gap-4 sm:hidden">
//                        <button
//                            aria-label="Abrir navbar"
//                            className="group relative size-10 cursor-pointer select-none"
//                            type="button"
//                            aria-expanded="false"
//                        >
//                            <span className="absolute top-[30%] left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 -translate-x-1/2 -translate-y-1/2 group-aria-expanded:top-1/2 group-aria-expanded:rotate-45" />
//                            <span className="absolute top-1/2 left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 -translate-x-1/2 -translate-y-1/2 group-aria-expanded:opacity-0" />
//                            <span className="absolute top-[70%] left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 -translate-x-1/2 -translate-y-1/2 group-aria-expanded:top-1/2 group-aria-expanded:-rotate-45" />
//                        </button>
//                    </div>
//                </div>
//            </div>
//        </header>
//    );
//}

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
////import Link from 'next/link';
////import { UserDropdownMenu } from '@/components/UserDropdownMenu';
//import ProfileButton from '@/components/Recycles/ProfileButton';
//import { headerMessages } from '@/app/[lang]/messages/home';
//
//export default function DefaultHeader() {
//    const [username, setUsername] = useState('');
//    const [email, setEmail] = useState(null);
//    const [role, setRole] = useState(null);
//    const [plan, setPlan] = useState(null);
//    const [loading, setLoading] = useState(true);
//    const [showLangMenu, setShowLangMenu] = useState(false);
//
//    const router = useRouter();
//    const pathname = usePathname();
//
//    const getLang = (pathname) => {
//        const segment = pathname.split('/')[1];
//        const supported = ['pt-br', 'en', 'es', 'zh'];
//        return supported.includes(segment) ? segment : 'pt-br';
//    };
//
//    const lang = getLang(pathname);
//    const dict = headerMessages[lang] || headerMessages['pt-br'];
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', {
//                    method: 'GET',
//                    credentials: 'include',
//                });
//
//                if (!res.ok) throw new Error('Sessão inválida');
//
//                const data = await res.json();
//
//                if (data.username) {
//                    setUsername(data.username);
//                    setEmail(data.email || null);
//                    setRole(data.role || null);
//                    setPlan(data.plan || 'no-plan');
//                }
//            } catch (err) {
//                console.warn('Erro ao verificar sessão:', err);
//                setUsername('');
//            } finally {
//                setLoading(false);
//            }
//        };
//
//        checkSession();
//    }, []);
//
//    useEffect(() => {
//        if (!username) return;
//
//        const fetchUserStatus = async () => {
//            try {
//                const res = await fetch('/api/user/status', {
//                    method: 'GET',
//                    credentials: 'include',
//                });
//
//                if (!res.ok) throw new Error('Unauthorized');
//
//                const data = await res.json();
//                setPlan(data.plan || 'no-plan');
//            } catch (err) {
//                console.warn('Erro ao buscar status do usuário:', err);
//            }
//        };
//
//        fetchUserStatus();
//        const interval = setInterval(fetchUserStatus, 2000);
//        return () => clearInterval(interval);
//    }, [username]);
//
//    const handleLogout = async () => {
//        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//
//        const getCookie = (name) => {
//            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//            return match ? decodeURIComponent(match[2]) : null;
//        };
//
//        const loginCookie = getCookie('virtuscloud.login');
//        let email = '';
//
//        try {
//            email = JSON.parse(loginCookie)?.email || '';
//        } catch { }
//
//        if (email) {
//            localStorage.removeItem(`resendStartedAt:signin:${email}`);
//        }
//
//        localStorage.removeItem('user');
//        localStorage.removeItem('canAccessConfirm');
//        localStorage.removeItem('lastInteraction:signin');
//
//        document.cookie = 'virtuscloud.login=; path=/; max-age=0';
//        document.cookie = 'virtuscloud.signup=; path=/; max-age=0';
//        document.cookie = 'virtuscloud.canAccessConfirm=; path=/; max-age=0';
//
//        setUsername('');
//        router.replace(`/${lang}/signin`);
//    };
//
//    return (
//        <header className="group sticky top-0 z-50 max-h-screen min-h-20 w-full border-b border-virtus-600 bg-black-900/75 backdrop-blur-2xl max-xl:overflow-auto">
//            <div className="container flex min-h-[80px] flex-col">
//                <div className="flex items-center justify-between">
//                    {/* Logo */}
//                    <div className="flex h-[80px] items-center gap-2 justify-self-start">
//                        <a className="transition-opacity hover:opacity-75" tabIndex={-1} href={`/${lang}/home`}>
//                            <div className="relative block aspect-[419/128] h-8.5">
//                                <Image
//                                    alt="Virtus Cloud Logo"
//                                    width={55}
//                                    height={16}
//                                    decoding="async"
//                                    src="/_next/image?url=%2Fassets%2Flogo-with-name.png&w=256&q=75"
//                                    style={{ color: 'transparent' }}
//                                />
//                            </div>
//                        </a>
//                    </div>
//
//                    {/* Perfil + idioma */}
//                    <ProfileButton
//                        loading={loading}
//                        username={username}
//                        email={email}
//                        role={role}
//                        plan={plan}
//                        lang={lang}
//                        pathname={pathname}
//                        showLangMenu={showLangMenu}
//                        setShowLangMenu={setShowLangMenu}
//                        onLogout={handleLogout}
//                    />
//
//                    {/* Menu mobile */}
//                    <div className="flex items-center gap-4 sm:hidden">
//                        <button
//                            aria-label="Abrir navbar"
//                            className="group relative size-10 cursor-pointer select-none"
//                            type="button"
//                            aria-expanded="false"
//                        >
//                            <span className="absolute top-[30%] left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 -translate-x-1/2 -translate-y-1/2 group-aria-expanded:top-1/2 group-aria-expanded:rotate-45" />
//                            <span className="absolute top-1/2 left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 -translate-x-1/2 -translate-y-1/2 group-aria-expanded:opacity-0" />
//                            <span className="absolute top-[70%] left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 -translate-x-1/2 -translate-y-1/2 group-aria-expanded:top-1/2 group-aria-expanded:-rotate-45" />
//                        </button>
//                    </div>
//                </div>
//            </div>
//        </header>
//    );
//}
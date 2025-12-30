//frontend/src/app/[lang]/dashboard/page.jsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from '@/components/Recycles/DashboardHeader';
import Footer from '@/components/Recycles/Footer';
import { hasPermission } from '@/utils/permissions';
import UpgradeModal from '@/components/modals/UpgradeModal';
import PlanModal from '@/components/modals/PlanModal'
import { PlanBadge } from '@/components/PlanBadge';
import { getPlanTier } from '@/utils/planUtils';
//import { planOrder } from '@/utils/planUtils';
import '../../styles/virtus.css';
import { AppDropdownMenu } from '@/components/AppDropdownMenu';
import { handleAction } from '@/utils/appActions';
import PlanActionButton from '@/components/PlanActionButton';
import PermissionNewApp from '@/components/buttons/PermissionNewApp';

//import NewApplicationButton from '@/components/buttons/NewApplicationButton';

function getLang(pathname) {
    const segment = pathname.split('/')[1];
    const supported = ['pt-br', 'en', 'es', 'zh'];
    return supported.includes(segment) ? segment : 'en';
}

function getStatusStyle(status = '') {
    const key = status.toLowerCase();
    if (key === 'running' || key === 'online') {
        return {
            label: 'ONLINE',
            color: 'green-500',
            gradient: 'from-green-400/20 to-green-700/20',
            animate: true
        };
    }
    if (key === 'stopped' || key === 'offline') {
        return {
            label: 'OFFLINE',
            color: 'red-500',
            gradient: 'from-red-400/20 to-red-700/20',
            animate: false
        };
    }
    return {
        label: 'DESCONHECIDO',
        color: 'gray-500',
        gradient: 'from-gray-400/20 to-gray-700/20',
        animate: false
    };
}

//function shouldShowUpgrade(plan) {
//    return ['no-plan', 'test', 'basic'].includes(plan);
//}

function isPersonalPlan(plan) {
    return ['test', 'basic'].includes(plan);
}

function isNoPlan(plan) {
    return plan === 'no-plan';
}

export default function WorkspaceArea() {
    const router = useRouter();
    const pathname = usePathname();
    const supported = ['pt-br', 'en', 'es', 'zh'];
    const lang = supported.includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'en';
    //const lang = getLang(pathname);
    const [username, setUsername] = useState('');
    const [accountId, setAccountId] = useState('');
    const [plan, setPlan] = useState('no-plan');
    const tier = getPlanTier(plan);
    const [canDeploy, setCanDeploy] = useState(true);
    const [usedMB, setUsedMB] = useState(0);     // memória usada pelo usuário
    const [totalMB, setTotalMB] = useState(256); // limite do plano (default mínimo)
    const [loading, setLoading] = useState(true);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [search, setSearch] = useState('');
    const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
    const totalApps =
        appsByStatus.active.length +
        appsByStatus.stopped.length +
        appsByStatus.backups.length;

    const onlineApps = appsByStatus.active.length;
    const offlineApps = appsByStatus.stopped.length;
    const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);

    //const handleClick = () => {
    //    router.push(`/${lang}/upload`);
    //};

    //const runtime = getRuntimeInfo(app.Image); // ou app.image, dependendo da estrutura
    //const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];

    useEffect(() => {
        if (isPersonalPlan(plan)) {
            setShowUpgradeBanner(true);
        } else {
            setShowUpgradeBanner(false); // garante que o banner suma se o plano mudar
        }
    }, [plan]);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
                const data = await res.json();

                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
                    router.replace(`/${lang}/signin`);
                    return;
                }

                setUsername(data.username);
                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
                setLoading(false);
            } catch {
                router.replace(`/${lang}/signin`);
            }
        };

        const fetchUserStatus = async () => {
            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
            const data = await res.json();
            setPlan((data.plan || 'no-plan').trim().toLowerCase());
            console.log('Plano recebido:', data.plan);
            setCanDeploy(data.canDeploy);
            // ✅ usa os nomes corretos vindos do backend
            setUsedMB(data.ramUsedMB || 0);       // uso atual
            setTotalMB(data.totalMB || 256);     // limite do plano
        };

        checkSession().then(fetchUserStatus);
        const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchAppsByStatus = async () => {
            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
            const data = await res.json();

            const removeDuplicates = (apps) => {
                if (!Array.isArray(apps)) return [];
                const seen = new Set();
                return apps.filter(app => {
                    const key = app.ID || app.ContainerName;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
            };

            setAppsByStatus({
                active: removeDuplicates(data.active),
                stopped: removeDuplicates(data.stopped),
                backups: removeDuplicates(data.backups),
            });
        };

        fetchAppsByStatus(); // primeira chamada imediata
        const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s

        return () => clearInterval(interval); // limpa ao desmontar
    }, []);

    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // Simula carregamento inicial
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return null;

    // ✅ cálculo da porcentagem baseado nos valores reais do backend
    const percentUsed = Math.round((usedMB / totalMB) * 100);

    // ... resto do componente renderizando o grid e resumo


    return (
        <>
            <Header />
            <div className="relative min-h-[calc(100dvh-80px)] flex-1 pt-8 pb-12">
                <div className="container flex flex-col gap-4">
                    <div className="space-y-2">
                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
                            <div className="flex flex-1 flex-col gap-1">
                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
                                        <div className="flex items-center gap-2">
                                            {isLoading ? (
                                                <>
                                                    <div className="h-5 w-32 rounded bg-virtus-600 animate-pulse" />
                                                    <div className="h-5 w-20 rounded bg-blue-600/50 animate-pulse" />
                                                </>
                                            ) : (
                                                <>
                                                    <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
                                                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">
                                                        Sua conta
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <span className="truncate text-secondary text-xs">{accountId}</span>
                                    </div>
                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                                        </svg>
                                    </div>
                                </button>
                            </div>

                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
                                <div className="flex gap-2">
                                    <span
                                        className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md"
                                    >
                                        <PlanBadge plan={plan} tier={tier} />
                                    </span>

                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
                                            {/* ✅ Global: uso do plano */}
                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
                                                <span className="text-muted text-xs">{usedMB} MB usado</span>
                                                <span className="text-nowrap text-muted text-xs">
                                                    {totalMB - usedMB} MB disponível de {totalMB} MB
                                                </span>
                                            </p>

                                            {/* Barra de uso com cor dinâmica */}
                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
                                                {(() => {
                                                    const percentUsed = (usedMB / totalMB) * 100;

                                                    // só amarelo até 79.99%, vermelho a partir de 80%
                                                    let barColor = "rgb(229, 212, 93)"; // amarelo
                                                    if (percentUsed >= 80) {
                                                        barColor = "rgb(220, 38, 38)"; // vermelho (tailwind red-600)
                                                    }

                                                    return (
                                                        <div
                                                            className="absolute inset-0 h-full rounded-full"
                                                            style={{
                                                                backgroundColor: barColor,
                                                                width: `${percentUsed}%`,
                                                                transition: "width 0.3s ease, background-color 0.3s ease",
                                                            }}
                                                        />
                                                    );
                                                })()}
                                                <div className="size-full rounded-full bg-virtus-400/30" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-1 items-end gap-2">
                                    {plan !== 'no-plan' ? (
                                        <>
                                            {/* Botão Renovar */}
                                            <button
                                                className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1"
                                                role="button"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
                                                    <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
                                                </svg>
                                                Renovar
                                            </button>

                                            {/* Botão Upgrade */}
                                            <PlanActionButton
                                                plan={plan}
                                                setShowPlanModal={setShowPlanModal}
                                                setShowUpgradeModal={setShowUpgradeModal}
                                            />
                                        </>
                                    ) : (
                                        <div className="flex justify-end w-full">
                                            <PlanActionButton
                                                plan={plan}
                                                setShowPlanModal={setShowPlanModal}
                                                setShowUpgradeModal={setShowUpgradeModal}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Aviso de plano pessoal */}
                        {showUpgradeBanner && (
                            <div className="relative bg-background">
                                <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
                                    <div className="flex items-center gap-2.5 md:gap-3.5">
                                        <div className="flex size-5 items-center justify-center text-blue-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                                                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
                                        <span className="block w-full text-sm text-secondary">
                                            Está pronto para transformar sua experiência? Com o{" "}
                                            <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
                                                standard
                                            </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
                                            <ul className="list-inside list-disc mt-1">
                                                <li>Armazenamento empresarial para máxima segurança e performance</li>
                                                <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
                                                <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
                                            </ul>
                                        </span>

                                        <button
                                            onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
                                            className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
                                        >
                                            Fazer upgrade
                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
                                            </svg>
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setShowUpgradeBanner(false)}
                                        className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                                            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                        {/* Barra de pesquisa + ações */}
                        <div className="flex min-h-[512px] flex-col gap-3">
                            {/* Barra de busca e botões */}
                            <div className="flex flex-col gap-2 md:flex-row">
                                <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Pesquisar em aplicações..."
                                        className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-background shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                            <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
                                        </svg>
                                        Organizar
                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                                        </svg>
                                    </button>

                                    <PermissionNewApp plan={plan} lang={lang} setShowPlanModal={setShowPlanModal} />
                                    {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}

                                </div>
                            </div>

                            {/* Grid de aplicações */}
                            {plan === 'no-plan' ? (
                                <>
                                    {/* Tela de obtenção de plano */}
                                    <div className="flex flex-1 flex-col min-h-[calc(100dvh-80px)] bg-blue-950">
                                        <div className="flex h-full flex-1 items-center justify-center rounded-md border border-blue-700 bg-gradient-to-b from-blue-700/25 to-blue-950">
                                            <div className="flex flex-col gap-4 text-center">
                                                <div className="mx-auto rounded-xl border border-blue-700/25 bg-blue-700/10 p-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                                                        <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.4,16.4,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
                                                    </svg>
                                                </div>
                                                <div className="space-y-1">
                                                    <h1 className="font-bold text-2xl">Obtenha um plano para suas aplicações</h1>
                                                    <p className="max-w-md text-secondary-foreground text-sm">
                                                        Escolha um plano para atender às suas necessidades e comece a desenvolver com uma infraestrutura otimizada para produção.
                                                    </p>
                                                </div>
                                                <button
                                                    role="button"
                                                    onClick={() => setShowPlanModal(true)}
                                                    className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                                        <path d="M208,144a15.78,15.78,0,0,1-10.42,14.94L146,178l-19,51.62a15.92,15.92,0,0,1-29.88,0L78,178l-51.62-19a15.92,15.92,0,0,1,0-29.88L78,110l19-51.62a15.92,15.92,0,0,1,29.88,0L146,110l51.62,19A15.78,15.78,0,0,1,208,144ZM152,48h16V64a8,8,0,0,0,16,0V48h16a8,8,0,0,0,0-16H184V16a8,8,0,0,0-16,0V32H152a8,8,0,0,0,0,16Zm88,32h-8V72a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0V96h8a8,8,0,0,0,0-16Z" />
                                                    </svg>
                                                    Obter um plano
                                                    <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-[25deg] animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
                                                </button>
                                                {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Grid de aplicações */}
                                    <div className="flex min-h-[752px] flex-col gap-4 lg:h-[calc(100dvh-300px)]">
                                        <div className="flex min-h-0 flex-1 flex-col">
                                            <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
                                                {isLoading
                                                    ? Array.from({ length: 6 }).map((_, i) => (
                                                        <li
                                                            key={`skeleton-${i}`}
                                                            className="animate-pulse flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-700/50 p-4"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="shrink-0 rounded-sm bg-virtus-900 p-1.5">
                                                                    <div className="size-[26px] rounded-sm bg-virtus-600" />
                                                                </div>
                                                                <div className="flex flex-col gap-1 truncate w-full">
                                                                    <div className="h-4 w-3/4 rounded bg-virtus-600" />
                                                                    <div className="h-3 w-1/2 rounded bg-virtus-600" />
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-between items-end mt-4">
                                                                <div className="flex gap-2">
                                                                    <div className="h-5 w-16 rounded bg-virtus-600" />
                                                                    <div className="h-5 w-20 rounded bg-virtus-600" />
                                                                </div>
                                                                <div className="h-5 w-16 rounded bg-virtus-600" />
                                                            </div>
                                                        </li>
                                                    ))
                                                    : Object.entries(appsByStatus).map(([key, apps]) =>
                                                        apps.map((app, index) => {

                                                            const runtime = app.runtime || 'unknown';

                                                            const runtimeIconMap = {
                                                                angular: '/assets/languages/angular.svg',
                                                                csharp: '/assets/languages/csharp.svg',
                                                                django: '/assets/languages/django.svg',
                                                                dotnet: '/assets/languages/dotnet.svg',
                                                                dotnetcore: '/assets/languages/dotnetcore.svg',
                                                                elixir: '/assets/languages/elixir.svg',
                                                                go: '/assets/languages/go.svg',
                                                                golang: '/assets/languages/go.svg',
                                                                java: '/assets/languages/java.svg',
                                                                javascript: '/assets/languages/javascript.svg',
                                                                kotlin: '/assets/languages/kotlin.svg',
                                                                laravel: '/assets/languages/laravel.svg',
                                                                lua: '/assets/languages/lua.svg',
                                                                nestjs: '/assets/languages/nestjs.svg',
                                                                nextjs: '/assets/languages/nextjs.svg',
                                                                node: '/assets/languages/node.svg',
                                                                nuxtjs: '/assets/languages/nuxtjs.svg',
                                                                php: '/assets/languages/php.svg',
                                                                python: '/assets/languages/python.svg',
                                                                react: '/assets/languages/react.svg',
                                                                rust: '/assets/languages/rust.svg',
                                                                springboot: '/assets/languages/springboot.svg',
                                                                'springboot-gradle': '/assets/languages/springboot-gradle.svg',
                                                                typescript: '/assets/languages/typescript.svg',
                                                                vite: '/assets/languages/vite.svg',
                                                                vuejs: '/assets/languages/vuejs.svg',
                                                                unknown: '/assets/languages/unknown.svg',
                                                            };

                                                            const runtimeIcon = runtimeIconMap[runtime];
                                                            const statusInfo = getStatusStyle(app.status);
                                                            //const statusKey = app.status?.toLowerCase?.() || "unknown";
                                                            const uniqueKey = `${key}-${app.ID || index}`;

                                                            return (
                                                                <li key={uniqueKey} className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700!">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
                                                                            <img
                                                                                alt={runtime}
                                                                                src={runtimeIcon}
                                                                                width={26}
                                                                                height={26}
                                                                                className="overflow-hidden rounded-sm"
                                                                            />
                                                                        </div>
                                                                        <div className="flex flex-col gap-0.5 truncate">
                                                                            <p className="font-semibold text-sm/[1.2]">{app.name || runtime.name}</p>
                                                                            <span className="line-clamp-1 max-w-[85%] truncate text-secondary text-xs/[1.25]">{app.ID}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex w-full items-end justify-between gap-2">
                                                                        <div className="flex max-w-full flex-wrap gap-2 truncate">
                                                                            <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-700! focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                                                                    <path d="M208,48H176V32a8,8,0,0,0-16,0V48H96V32a8,8,0,0,0-16,0V48H48A16,16,0,0,0,32,64V192a16,16,0,0,0,16,16H80v16a8,8,0,0,0,16,0V208h64v16a8,8,0,0,0,16,0V208h32a16,16,0,0,0,16-16V64A16,16,0,0,0,208,48ZM160,144a16,16,0,1,1-16-16A16,16,0,0,1,160,144Z" />
                                                                                </svg>
                                                                                {Math.round(app.cpuPercent ?? 0)}% de {app.cpuLimit} vCPU
                                                                            </span>
                                                                            {(() => {
                                                                                const usage = app.ramUsage || 0;          // uso atual em MB
                                                                                const limit = app.memoryLimit || 256;     // limite do plano em MB
                                                                                const percent = Math.round((usage / limit) * 100);

                                                                                return (
                                                                                    <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                                                                            <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z" />
                                                                                        </svg>
                                                                                        {Math.round(app.ramPercent ?? 0)}% de {app.ramLimit} MB
                                                                                    </span>
                                                                                );
                                                                            })()}
                                                                        </div>
                                                                        <span className={`font-semibold transition-all h-5 rounded-sm px-2 text-[10px]/5 flex items-center gap-1.5 uppercase text-${statusInfo.color} bg-gradient-to-br ${statusInfo.gradient}`}>
                                                                            <span className={`relative block size-2.5 rounded-full bg-${statusInfo.color}`}>
                                                                                {statusInfo.animate && <span className="absolute size-2.5 rounded-full bg-inherit animate-ping" />}
                                                                            </span>
                                                                            {statusInfo.label}
                                                                        </span>
                                                                    </div>

                                                                    <div
                                                                        className="absolute inset-0 z-0 cursor-pointer"
                                                                        onClick={() => router.push(`/${lang}/dashboard/applications/${app.ID}`)}
                                                                    />
                                                                    <div className="absolute top-4 right-4 flex gap-2">
                                                                        <button
                                                                            type="button"
                                                                            aria-haspopup="dialog"
                                                                            aria-expanded="false"
                                                                            aria-controls="radix-_r_8_"
                                                                            data-state="closed"
                                                                            data-slot="dialog-trigger"
                                                                            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
                                                                                <path d="M120,137,48,201A12,12,0,1,1,32,183l61.91-55L32,73A12,12,0,1,1,48,55l72,64A12,12,0,0,1,120,137Zm96,43H120a12,12,0,0,0,0,24h96a12,12,0,0,0,0-24Z" />
                                                                            </svg>
                                                                        </button>
                                                                        <AppDropdownMenu app={app} onAction={handleAction} />
                                                                    </div>
                                                                </li>
                                                            );
                                                        })
                                                    )}
                                            </ul>
                                        </div>

                                        {/* Paginação e contador */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between gap-4">
                                                <button
                                                    disabled
                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                                        <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
                                                    </svg>
                                                    <span className="hidden md:block">Anterior</span>
                                                </button>

                                                <div className="flex flex-col items-center">
                                                    <div className="flex justify-center gap-x-1.5">
                                                        <button className="inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
                                                            1
                                                        </button>
                                                    </div>
                                                </div>

                                                <button
                                                    disabled
                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
                                                >
                                                    <span className="hidden md:block">Próximo</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                                        <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-muted text-xs">
                                                    Total de {totalApps} aplicação{totalApps !== 1 ? 's' : ''}, {onlineApps} estão online e {offlineApps} estão offline.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            {/* Modal de upgrade */}
                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
                        </div> {/* fim do container interno */}
                    </div> {/* fim do container externo */}
                </div> {/* fim da área de trabalho */}
            </div >
            <Footer />
        </>
    );
}

//frontend/src/app/[lang]/dashboard/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import PlanModal from '@/components/modals/PlanModal'
//import { PlanBadge } from '@/components/PlanBadge';
//import { getPlanTier } from '@/utils/planUtils';
////import { planOrder } from '@/utils/planUtils';
//import '../../styles/virtus.css';
//import { AppDropdownMenu } from '@/components/AppDropdownMenu';
//import { handleAction } from '@/utils/appActions';
//import PlanActionButton from '@/components/PlanActionButton';
//import PermissionNewApp from '@/components/buttons/PermissionNewApp';
//
////import NewApplicationButton from '@/components/buttons/NewApplicationButton';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//function getStatusStyle(status = '') {
//    const key = status.toLowerCase();
//    if (key === 'running' || key === 'online') {
//        return {
//            label: 'ONLINE',
//            color: 'green-500',
//            gradient: 'from-green-400/20 to-green-700/20',
//            animate: true
//        };
//    }
//    if (key === 'stopped' || key === 'offline') {
//        return {
//            label: 'OFFLINE',
//            color: 'red-500',
//            gradient: 'from-red-400/20 to-red-700/20',
//            animate: false
//        };
//    }
//    return {
//        label: 'DESCONHECIDO',
//        color: 'gray-500',
//        gradient: 'from-gray-400/20 to-gray-700/20',
//        animate: false
//    };
//}
//
////function shouldShowUpgrade(plan) {
////    return ['no-plan', 'test', 'basic'].includes(plan);
////}
//
//function isPersonalPlan(plan) {
//    return ['test', 'basic'].includes(plan);
//}
//
//function isNoPlan(plan) {
//    return plan === 'no-plan';
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    const lang = supported.includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'en';
//    //const lang = getLang(pathname);
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const tier = getPlanTier(plan);
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);     // memória usada pelo usuário
//    const [totalMB, setTotalMB] = useState(256); // limite do plano (default mínimo)
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const [showPlanModal, setShowPlanModal] = useState(false);
//    const [search, setSearch] = useState('');
//    const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//    const totalApps =
//        appsByStatus.active.length +
//        appsByStatus.stopped.length +
//        appsByStatus.backups.length;
//
//    const onlineApps = appsByStatus.active.length;
//    const offlineApps = appsByStatus.stopped.length;
//    const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
//
//    //const handleClick = () => {
//    //    router.push(`/${lang}/upload`);
//    //};
//
//    //const runtime = getRuntimeInfo(app.Image); // ou app.image, dependendo da estrutura
//    //const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//    useEffect(() => {
//        if (isPersonalPlan(plan)) {
//            setShowUpgradeBanner(true);
//        } else {
//            setShowUpgradeBanner(false); // garante que o banner suma se o plano mudar
//        }
//    }, [plan]);
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan((data.plan || 'no-plan').trim().toLowerCase());
//            console.log('Plano recebido:', data.plan);
//            setCanDeploy(data.canDeploy);
//            // ✅ usa os nomes corretos vindos do backend
//            setUsedMB(data.ramUsedMB || 0);       // uso atual
//            setTotalMB(data.totalMB || 256);     // limite do plano
//        };
//
//        checkSession().then(fetchUserStatus);
//        const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//        return () => clearInterval(interval);
//    }, []);
//
//    useEffect(() => {
//        const fetchAppsByStatus = async () => {
//            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//            const data = await res.json();
//
//            const removeDuplicates = (apps) => {
//                if (!Array.isArray(apps)) return [];
//                const seen = new Set();
//                return apps.filter(app => {
//                    const key = app.ID || app.ContainerName;
//                    if (seen.has(key)) return false;
//                    seen.add(key);
//                    return true;
//                });
//            };
//
//            setAppsByStatus({
//                active: removeDuplicates(data.active),
//                stopped: removeDuplicates(data.stopped),
//                backups: removeDuplicates(data.backups),
//            });
//        };
//
//        fetchAppsByStatus(); // primeira chamada imediata
//        const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//
//        return () => clearInterval(interval); // limpa ao desmontar
//    }, []);
//
//    const [isLoading, setIsLoading] = useState(true);
//    useEffect(() => {
//        // Simula carregamento inicial
//        const timer = setTimeout(() => setIsLoading(false), 2000);
//        return () => clearTimeout(timer);
//    }, []);
//
//    if (loading) return null;
//
//    // ✅ cálculo da porcentagem baseado nos valores reais do backend
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    // ... resto do componente renderizando o grid e resumo
//
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            {isLoading ? (
//                                                <>
//                                                    <div className="h-5 w-32 rounded bg-virtus-600 animate-pulse" />
//                                                    <div className="h-5 w-20 rounded bg-blue-600/50 animate-pulse" />
//                                                </>
//                                            ) : (
//                                                <>
//                                                    <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">
//                                                        Sua conta
//                                                    </span>
//                                                </>
//                                            )}
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span
//                                        className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md"
//                                    >
//                                        <PlanBadge plan={plan} tier={tier} />
//                                    </span>
//
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            {/* ✅ Global: uso do plano */}
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">{usedMB} MB usado</span>
//                                                <span className="text-nowrap text-muted text-xs">
//                                                    {totalMB - usedMB} MB disponível de {totalMB} MB
//                                                </span>
//                                            </p>
//
//                                            {/* Barra de uso com cor dinâmica */}
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                {(() => {
//                                                    const percentUsed = (usedMB / totalMB) * 100;
//
//                                                    // só amarelo até 79.99%, vermelho a partir de 80%
//                                                    let barColor = "rgb(229, 212, 93)"; // amarelo
//                                                    if (percentUsed >= 80) {
//                                                        barColor = "rgb(220, 38, 38)"; // vermelho (tailwind red-600)
//                                                    }
//
//                                                    return (
//                                                        <div
//                                                            className="absolute inset-0 h-full rounded-full"
//                                                            style={{
//                                                                backgroundColor: barColor,
//                                                                width: `${percentUsed}%`,
//                                                                transition: "width 0.3s ease, background-color 0.3s ease",
//                                                            }}
//                                                        />
//                                                    );
//                                                })()}
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    {plan !== 'no-plan' ? (
//                                        <>
//                                            {/* Botão Renovar */}
//                                            <button
//                                                className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1"
//                                                role="button"
//                                            >
//                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                                    <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                                </svg>
//                                                Renovar
//                                            </button>
//
//                                            {/* Botão Upgrade */}
//                                            <PlanActionButton
//                                                plan={plan}
//                                                setShowPlanModal={setShowPlanModal}
//                                                setShowUpgradeModal={setShowUpgradeModal}
//                                            />
//                                        </>
//                                    ) : (
//                                        <div className="flex justify-end w-full">
//                                            <PlanActionButton
//                                                plan={plan}
//                                                setShowPlanModal={setShowPlanModal}
//                                                setShowUpgradeModal={setShowUpgradeModal}
//                                            />
//                                        </div>
//                                    )}
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        {showUpgradeBanner && (
//                            <div className="relative bg-background">
//                                <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                    <div className="flex items-center gap-2.5 md:gap-3.5">
//                                        <div className="flex size-5 items-center justify-center text-blue-500">
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                            </svg>
//                                        </div>
//                                        <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                    </div>
//
//                                    <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                        <span className="block w-full text-sm text-secondary">
//                                            Está pronto para transformar sua experiência? Com o{" "}
//                                            <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                                standard
//                                            </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                            <ul className="list-inside list-disc mt-1">
//                                                <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                                <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                                <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                            </ul>
//                                        </span>
//
//                                        <button
//                                            onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                            className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                        >
//                                            Fazer upgrade
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                            </svg>
//                                        </button>
//                                    </div>
//
//                                    <button
//                                        onClick={() => setShowUpgradeBanner(false)}
//                                        className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//                            </div>
//                        )}
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            {/* Barra de busca e botões */}
//                            <div className="flex flex-col gap-2 md:flex-row">
//                                <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                    <input
//                                        value={search}
//                                        onChange={(e) => setSearch(e.target.value)}
//                                        placeholder="Pesquisar em aplicações..."
//                                        className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                                    />
//                                    <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                        </svg>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-wrap gap-2">
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-background shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                        </svg>
//                                        Organizar
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    <PermissionNewApp plan={plan} lang={lang} setShowPlanModal={setShowPlanModal} />
//                                    {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
//
//                                </div>
//                            </div>
//
//                            {/* Grid de aplicações */}
//                            {plan === 'no-plan' ? (
//                                <>
//                                    {/* Tela de obtenção de plano */}
//                                    <div className="flex flex-1 flex-col min-h-[calc(100dvh-80px)] bg-blue-950">
//                                        <div className="flex h-full flex-1 items-center justify-center rounded-md border border-blue-700 bg-gradient-to-b from-blue-700/25 to-blue-950">
//                                            <div className="flex flex-col gap-4 text-center">
//                                                <div className="mx-auto rounded-xl border border-blue-700/25 bg-blue-700/10 p-4">
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.4,16.4,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//                                                    </svg>
//                                                </div>
//                                                <div className="space-y-1">
//                                                    <h1 className="font-bold text-2xl">Obtenha um plano para suas aplicações</h1>
//                                                    <p className="max-w-md text-secondary-foreground text-sm">
//                                                        Escolha um plano para atender às suas necessidades e comece a desenvolver com uma infraestrutura otimizada para produção.
//                                                    </p>
//                                                </div>
//                                                <button
//                                                    role="button"
//                                                    onClick={() => setShowPlanModal(true)}
//                                                    className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
//                                                >
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M208,144a15.78,15.78,0,0,1-10.42,14.94L146,178l-19,51.62a15.92,15.92,0,0,1-29.88,0L78,178l-51.62-19a15.92,15.92,0,0,1,0-29.88L78,110l19-51.62a15.92,15.92,0,0,1,29.88,0L146,110l51.62,19A15.78,15.78,0,0,1,208,144ZM152,48h16V64a8,8,0,0,0,16,0V48h16a8,8,0,0,0,0-16H184V16a8,8,0,0,0-16,0V32H152a8,8,0,0,0,0,16Zm88,32h-8V72a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0V96h8a8,8,0,0,0,0-16Z" />
//                                                    </svg>
//                                                    Obter um plano
//                                                    <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-[25deg] animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//                                                </button>
//                                                {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
//                                            </div>
//                                        </div>
//                                    </div>
//                                </>
//                            ) : (
//                                <>
//                                    {/* Grid de aplicações */}
//                                    <div className="flex min-h-[752px] flex-col gap-4 lg:h-[calc(100dvh-300px)]">
//                                        <div className="flex min-h-0 flex-1 flex-col">
//                                            <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                                {isLoading
//                                                    ? Array.from({ length: 6 }).map((_, i) => (
//                                                        <li
//                                                            key={`skeleton-${i}`}
//                                                            className="animate-pulse flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-700/50 p-4"
//                                                        >
//                                                            <div className="flex items-center gap-2.5">
//                                                                <div className="shrink-0 rounded-sm bg-virtus-900 p-1.5">
//                                                                    <div className="size-[26px] rounded-sm bg-virtus-600" />
//                                                                </div>
//                                                                <div className="flex flex-col gap-1 truncate w-full">
//                                                                    <div className="h-4 w-3/4 rounded bg-virtus-600" />
//                                                                    <div className="h-3 w-1/2 rounded bg-virtus-600" />
//                                                                </div>
//                                                            </div>
//
//                                                            <div className="flex justify-between items-end mt-4">
//                                                                <div className="flex gap-2">
//                                                                    <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                                    <div className="h-5 w-20 rounded bg-virtus-600" />
//                                                                </div>
//                                                                <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                            </div>
//                                                        </li>
//                                                    ))
//                                                    : Object.entries(appsByStatus).map(([key, apps]) =>
//                                                        apps.map((app, index) => {
//
//                                                            const runtime = app.runtime || 'unknown';
//
//                                                            const runtimeIconMap = {
//                                                                angular: '/assets/languages/angular.svg',
//                                                                csharp: '/assets/languages/csharp.svg',
//                                                                django: '/assets/languages/django.svg',
//                                                                dotnet: '/assets/languages/dotnet.svg',
//                                                                dotnetcore: '/assets/languages/dotnetcore.svg',
//                                                                elixir: '/assets/languages/elixir.svg',
//                                                                go: '/assets/languages/go.svg',
//                                                                golang: '/assets/languages/go.svg',
//                                                                java: '/assets/languages/java.svg',
//                                                                javascript: '/assets/languages/javascript.svg',
//                                                                kotlin: '/assets/languages/kotlin.svg',
//                                                                laravel: '/assets/languages/laravel.svg',
//                                                                lua: '/assets/languages/lua.svg',
//                                                                nestjs: '/assets/languages/nestjs.svg',
//                                                                nextjs: '/assets/languages/nextjs.svg',
//                                                                node: '/assets/languages/node.svg',
//                                                                nuxtjs: '/assets/languages/nuxtjs.svg',
//                                                                php: '/assets/languages/php.svg',
//                                                                python: '/assets/languages/python.svg',
//                                                                react: '/assets/languages/react.svg',
//                                                                rust: '/assets/languages/rust.svg',
//                                                                springboot: '/assets/languages/springboot.svg',
//                                                                'springboot-gradle': '/assets/languages/springboot-gradle.svg',
//                                                                typescript: '/assets/languages/typescript.svg',
//                                                                vite: '/assets/languages/vite.svg',
//                                                                vuejs: '/assets/languages/vuejs.svg',
//                                                                unknown: '/assets/languages/unknown.svg',
//                                                            };
//
//                                                            const runtimeIcon = runtimeIconMap[runtime];
//                                                            const statusInfo = getStatusStyle(app.status);
//                                                            //const statusKey = app.status?.toLowerCase?.() || "unknown";
//                                                            const uniqueKey = `${key}-${app.ID || index}`;
//
//                                                            return (
//                                                                <li key={uniqueKey} className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700!">
//                                                                    <div className="flex items-center gap-2.5">
//                                                                        <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                                                            <img
//                                                                                alt={runtime}
//                                                                                src={runtimeIcon}
//                                                                                width={26}
//                                                                                height={26}
//                                                                                className="overflow-hidden rounded-sm"
//                                                                            />
//                                                                        </div>
//                                                                        <div className="flex flex-col gap-0.5 truncate">
//                                                                            <p className="font-semibold text-sm/[1.2]">{app.name || runtime.name}</p>
//                                                                            <span className="line-clamp-1 max-w-[85%] truncate text-secondary text-xs/[1.25]">{app.ID}</span>
//                                                                        </div>
//                                                                    </div>
//
//                                                                    <div className="flex w-full items-end justify-between gap-2">
//                                                                        <div className="flex max-w-full flex-wrap gap-2 truncate">
//                                                                            <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-700! focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                                    <path d="M208,48H176V32a8,8,0,0,0-16,0V48H96V32a8,8,0,0,0-16,0V48H48A16,16,0,0,0,32,64V192a16,16,0,0,0,16,16H80v16a8,8,0,0,0,16,0V208h64v16a8,8,0,0,0,16,0V208h32a16,16,0,0,0,16-16V64A16,16,0,0,0,208,48ZM160,144a16,16,0,1,1-16-16A16,16,0,0,1,160,144Z" />
//                                                                                </svg>
//                                                                                {Math.round(app.cpuPercent ?? 0)}% de {app.cpuLimit} vCPU
//                                                                            </span>
//                                                                            {(() => {
//                                                                                const usage = app.ramUsage || 0;          // uso atual em MB
//                                                                                const limit = app.memoryLimit || 256;     // limite do plano em MB
//                                                                                const percent = Math.round((usage / limit) * 100);
//
//                                                                                return (
//                                                                                    <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                                            <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z" />
//                                                                                        </svg>
//                                                                                        {Math.round(app.ramPercent ?? 0)}% de {app.ramLimit} MB
//                                                                                    </span>
//                                                                                );
//                                                                            })()}
//                                                                        </div>
//                                                                        <span className={`font-semibold transition-all h-5 rounded-sm px-2 text-[10px]/5 flex items-center gap-1.5 uppercase text-${statusInfo.color} bg-gradient-to-br ${statusInfo.gradient}`}>
//                                                                            <span className={`relative block size-2.5 rounded-full bg-${statusInfo.color}`}>
//                                                                                {statusInfo.animate && <span className="absolute size-2.5 rounded-full bg-inherit animate-ping" />}
//                                                                            </span>
//                                                                            {statusInfo.label}
//                                                                        </span>
//                                                                    </div>
//
//                                                                    <div
//                                                                        className="absolute inset-0 z-0 cursor-pointer"
//                                                                        onClick={() => router.push(`/${lang}/dashboard/applications/${app.ID}`)}
//                                                                    />
//                                                                    <div className="absolute top-4 right-4 flex gap-2">
//                                                                        <button
//                                                                            type="button"
//                                                                            aria-haspopup="dialog"
//                                                                            aria-expanded="false"
//                                                                            aria-controls="radix-_r_8_"
//                                                                            data-state="closed"
//                                                                            data-slot="dialog-trigger"
//                                                                            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//                                                                        >
//                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
//                                                                                <path d="M120,137,48,201A12,12,0,1,1,32,183l61.91-55L32,73A12,12,0,1,1,48,55l72,64A12,12,0,0,1,120,137Zm96,43H120a12,12,0,0,0,0,24h96a12,12,0,0,0,0-24Z" />
//                                                                            </svg>
//                                                                        </button>
//                                                                        <AppDropdownMenu app={app} onAction={handleAction} />
//                                                                    </div>
//                                                                </li>
//                                                            );
//                                                        })
//                                                    )}
//                                            </ul>
//                                        </div>
//
//                                        {/* Paginação e contador */}
//                                        <div className="space-y-2">
//                                            <div className="flex justify-between gap-4">
//                                                <button
//                                                    disabled
//                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                                >
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                                    </svg>
//                                                    <span className="hidden md:block">Anterior</span>
//                                                </button>
//
//                                                <div className="flex flex-col items-center">
//                                                    <div className="flex justify-center gap-x-1.5">
//                                                        <button className="inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                            1
//                                                        </button>
//                                                    </div>
//                                                </div>
//
//                                                <button
//                                                    disabled
//                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                                >
//                                                    <span className="hidden md:block">Próximo</span>
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                                    </svg>
//                                                </button>
//                                            </div>
//
//                                            <div className="text-right">
//                                                <span className="text-muted text-xs">
//                                                    Total de {totalApps} aplicação{totalApps !== 1 ? 's' : ''}, {onlineApps} estão online e {offlineApps} estão offline.
//                                                </span>
//                                            </div>
//                                        </div>
//                                    </div>
//                                </>
//                            )}
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div >
//            <Footer />
//        </>
//    );
//}

//frontend/src/app/[lang]/dashboard/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import PlanModal from '@/components/modals/PlanModal'
//import { PlanBadge } from '@/components/PlanBadge';
//import { getPlanTier } from '@/utils/planUtils';
////import { planOrder } from '@/utils/planUtils';
//import '../../styles/virtus.css';
//import { AppDropdownMenu } from '@/components/AppDropdownMenu';
//import { handleAction } from '@/utils/appActions';
//import PlanActionButton from '@/components/PlanActionButton';
//import PermissionNewApp from '@/components/buttons/PermissionNewApp';
//
////import NewApplicationButton from '@/components/buttons/NewApplicationButton';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//function getStatusStyle(status = '') {
//    const key = status.toLowerCase();
//    if (key === 'running' || key === 'online') {
//        return {
//            label: 'ONLINE',
//            color: 'green-500',
//            gradient: 'from-green-400/20 to-green-700/20',
//            animate: true
//        };
//    }
//    if (key === 'stopped' || key === 'offline') {
//        return {
//            label: 'OFFLINE',
//            color: 'red-500',
//            gradient: 'from-red-400/20 to-red-700/20',
//            animate: false
//        };
//    }
//    return {
//        label: 'DESCONHECIDO',
//        color: 'gray-500',
//        gradient: 'from-gray-400/20 to-gray-700/20',
//        animate: false
//    };
//}
//
////function shouldShowUpgrade(plan) {
////    return ['no-plan', 'test', 'basic'].includes(plan);
////}
//
//function isPersonalPlan(plan) {
//    return ['test', 'basic'].includes(plan);
//}
//
//function isNoPlan(plan) {
//    return plan === 'no-plan';
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    const lang = supported.includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'en';
//    //const lang = getLang(pathname);
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const tier = getPlanTier(plan);
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);     // memória usada pelo usuário
//    const [totalMB, setTotalMB] = useState(256); // limite do plano (default mínimo)
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const [showPlanModal, setShowPlanModal] = useState(false);
//    const [search, setSearch] = useState('');
//    const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//    const totalApps =
//        appsByStatus.active.length +
//        appsByStatus.stopped.length +
//        appsByStatus.backups.length;
//
//    const onlineApps = appsByStatus.active.length;
//    const offlineApps = appsByStatus.stopped.length;
//    const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
//
//    //const handleClick = () => {
//    //    router.push(`/${lang}/upload`);
//    //};
//
//    //const runtime = getRuntimeInfo(app.Image); // ou app.image, dependendo da estrutura
//    //const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//    useEffect(() => {
//        if (isPersonalPlan(plan)) {
//            setShowUpgradeBanner(true);
//        } else {
//            setShowUpgradeBanner(false); // garante que o banner suma se o plano mudar
//        }
//    }, [plan]);
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan((data.plan || 'no-plan').trim().toLowerCase());
//            console.log('Plano recebido:', data.plan);
//            setCanDeploy(data.canDeploy);
//            // ✅ usa os nomes corretos vindos do backend
//            setUsedMB(data.ramUsedMB || 0);       // uso atual
//            setTotalMB(data.totalMB || 256);     // limite do plano
//        };
//
//        checkSession().then(fetchUserStatus);
//        const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//        return () => clearInterval(interval);
//    }, []);
//
//    useEffect(() => {
//        const fetchAppsByStatus = async () => {
//            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//            const data = await res.json();
//
//            const removeDuplicates = (apps) => {
//                if (!Array.isArray(apps)) return [];
//                const seen = new Set();
//                return apps.filter(app => {
//                    const key = app.ID || app.ContainerName;
//                    if (seen.has(key)) return false;
//                    seen.add(key);
//                    return true;
//                });
//            };
//
//            setAppsByStatus({
//                active: removeDuplicates(data.active),
//                stopped: removeDuplicates(data.stopped),
//                backups: removeDuplicates(data.backups),
//            });
//        };
//
//        fetchAppsByStatus(); // primeira chamada imediata
//        const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//
//        return () => clearInterval(interval); // limpa ao desmontar
//    }, []);
//
//    const [isLoading, setIsLoading] = useState(true);
//    useEffect(() => {
//        // Simula carregamento inicial
//        const timer = setTimeout(() => setIsLoading(false), 2000);
//        return () => clearTimeout(timer);
//    }, []);
//
//    if (loading) return null;
//
//    // ✅ cálculo da porcentagem baseado nos valores reais do backend
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    // ... resto do componente renderizando o grid e resumo
//
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            {isLoading ? (
//                                                <>
//                                                    <div className="h-5 w-32 rounded bg-virtus-600 animate-pulse" />
//                                                    <div className="h-5 w-20 rounded bg-blue-600/50 animate-pulse" />
//                                                </>
//                                            ) : (
//                                                <>
//                                                    <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">
//                                                        Sua conta
//                                                    </span>
//                                                </>
//                                            )}
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span
//                                        className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md"
//                                    >
//                                        <PlanBadge plan={plan} tier={tier} />
//                                    </span>
//
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            {/* ✅ Global: uso do plano */}
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">{usedMB} MB usado</span>
//                                                <span className="text-nowrap text-muted text-xs">
//                                                    {totalMB - usedMB} MB disponível de {totalMB} MB
//                                                </span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div
//                                                    className="absolute inset-0 h-full rounded-full"
//                                                    style={{ backgroundColor: 'rgb(229, 212, 93)', width: `${percentUsed}%` }}
//                                                />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    {plan !== 'no-plan' ? (
//                                        <>
//                                            {/* Botão Renovar */}
//                                            <button
//                                                className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1"
//                                                role="button"
//                                            >
//                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                                    <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                                </svg>
//                                                Renovar
//                                            </button>
//
//                                            {/* Botão Upgrade */}
//                                            <PlanActionButton
//                                                plan={plan}
//                                                setShowPlanModal={setShowPlanModal}
//                                                setShowUpgradeModal={setShowUpgradeModal}
//                                            />
//                                        </>
//                                    ) : (
//                                        <div className="flex justify-end w-full">
//                                            <PlanActionButton
//                                                plan={plan}
//                                                setShowPlanModal={setShowPlanModal}
//                                                setShowUpgradeModal={setShowUpgradeModal}
//                                            />
//                                        </div>
//                                    )}
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        {showUpgradeBanner && (
//                            <div className="relative bg-background">
//                                <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                    <div className="flex items-center gap-2.5 md:gap-3.5">
//                                        <div className="flex size-5 items-center justify-center text-blue-500">
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                            </svg>
//                                        </div>
//                                        <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                    </div>
//
//                                    <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                        <span className="block w-full text-sm text-secondary">
//                                            Está pronto para transformar sua experiência? Com o{" "}
//                                            <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                                standard
//                                            </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                            <ul className="list-inside list-disc mt-1">
//                                                <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                                <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                                <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                            </ul>
//                                        </span>
//
//                                        <button
//                                            onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                            className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                        >
//                                            Fazer upgrade
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                            </svg>
//                                        </button>
//                                    </div>
//
//                                    <button
//                                        onClick={() => setShowUpgradeBanner(false)}
//                                        className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//                            </div>
//                        )}
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            {/* Barra de busca e botões */}
//                            <div className="flex flex-col gap-2 md:flex-row">
//                                <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                    <input
//                                        value={search}
//                                        onChange={(e) => setSearch(e.target.value)}
//                                        placeholder="Pesquisar em aplicações..."
//                                        className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                                    />
//                                    <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                        </svg>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-wrap gap-2">
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-background shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                        </svg>
//                                        Organizar
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    <PermissionNewApp plan={plan} lang={lang} setShowPlanModal={setShowPlanModal} />
//                                    {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
//
//                                </div>
//                            </div>
//
//                            {/* Grid de aplicações */}
//                            {plan === 'no-plan' ? (
//                                <>
//                                    {/* Tela de obtenção de plano */}
//                                    <div className="flex flex-1 flex-col min-h-[calc(100dvh-80px)] bg-blue-950">
//                                        <div className="flex h-full flex-1 items-center justify-center rounded-md border border-blue-700 bg-gradient-to-b from-blue-700/25 to-blue-950">
//                                            <div className="flex flex-col gap-4 text-center">
//                                                <div className="mx-auto rounded-xl border border-blue-700/25 bg-blue-700/10 p-4">
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.4,16.4,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//                                                    </svg>
//                                                </div>
//                                                <div className="space-y-1">
//                                                    <h1 className="font-bold text-2xl">Obtenha um plano para suas aplicações</h1>
//                                                    <p className="max-w-md text-secondary-foreground text-sm">
//                                                        Escolha um plano para atender às suas necessidades e comece a desenvolver com uma infraestrutura otimizada para produção.
//                                                    </p>
//                                                </div>
//                                                <button
//                                                    role="button"
//                                                    onClick={() => setShowPlanModal(true)}
//                                                    className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
//                                                >
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M208,144a15.78,15.78,0,0,1-10.42,14.94L146,178l-19,51.62a15.92,15.92,0,0,1-29.88,0L78,178l-51.62-19a15.92,15.92,0,0,1,0-29.88L78,110l19-51.62a15.92,15.92,0,0,1,29.88,0L146,110l51.62,19A15.78,15.78,0,0,1,208,144ZM152,48h16V64a8,8,0,0,0,16,0V48h16a8,8,0,0,0,0-16H184V16a8,8,0,0,0-16,0V32H152a8,8,0,0,0,0,16Zm88,32h-8V72a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0V96h8a8,8,0,0,0,0-16Z" />
//                                                    </svg>
//                                                    Obter um plano
//                                                    <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-[25deg] animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//                                                </button>
//                                                {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
//                                            </div>
//                                        </div>
//                                    </div>
//                                </>
//                            ) : (
//                                <>
//                                    {/* Grid de aplicações */}
//                                    <div className="flex min-h-[752px] flex-col gap-4 lg:h-[calc(100dvh-300px)]">
//                                        <div className="flex min-h-0 flex-1 flex-col">
//                                            <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                                {isLoading
//                                                    ? Array.from({ length: 6 }).map((_, i) => (
//                                                        <li
//                                                            key={`skeleton-${i}`}
//                                                            className="animate-pulse flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-700/50 p-4"
//                                                        >
//                                                            <div className="flex items-center gap-2.5">
//                                                                <div className="shrink-0 rounded-sm bg-virtus-900 p-1.5">
//                                                                    <div className="size-[26px] rounded-sm bg-virtus-600" />
//                                                                </div>
//                                                                <div className="flex flex-col gap-1 truncate w-full">
//                                                                    <div className="h-4 w-3/4 rounded bg-virtus-600" />
//                                                                    <div className="h-3 w-1/2 rounded bg-virtus-600" />
//                                                                </div>
//                                                            </div>
//
//                                                            <div className="flex justify-between items-end mt-4">
//                                                                <div className="flex gap-2">
//                                                                    <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                                    <div className="h-5 w-20 rounded bg-virtus-600" />
//                                                                </div>
//                                                                <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                            </div>
//                                                        </li>
//                                                    ))
//                                                    : Object.entries(appsByStatus).map(([key, apps]) =>
//                                                        apps.map((app, index) => {
//
//                                                            const runtime = app.runtime || 'unknown';
//
//                                                            const runtimeIconMap = {
//                                                                angular: '/assets/languages/angular.svg',
//                                                                csharp: '/assets/languages/csharp.svg',
//                                                                django: '/assets/languages/django.svg',
//                                                                dotnet: '/assets/languages/dotnet.svg',
//                                                                dotnetcore: '/assets/languages/dotnetcore.svg',
//                                                                elixir: '/assets/languages/elixir.svg',
//                                                                go: '/assets/languages/go.svg',
//                                                                golang: '/assets/languages/go.svg',
//                                                                java: '/assets/languages/java.svg',
//                                                                javascript: '/assets/languages/javascript.svg',
//                                                                kotlin: '/assets/languages/kotlin.svg',
//                                                                laravel: '/assets/languages/laravel.svg',
//                                                                lua: '/assets/languages/lua.svg',
//                                                                nestjs: '/assets/languages/nestjs.svg',
//                                                                nextjs: '/assets/languages/nextjs.svg',
//                                                                node: '/assets/languages/node.svg',
//                                                                nuxtjs: '/assets/languages/nuxtjs.svg',
//                                                                php: '/assets/languages/php.svg',
//                                                                python: '/assets/languages/python.svg',
//                                                                react: '/assets/languages/react.svg',
//                                                                rust: '/assets/languages/rust.svg',
//                                                                springboot: '/assets/languages/springboot.svg',
//                                                                'springboot-gradle': '/assets/languages/springboot-gradle.svg',
//                                                                typescript: '/assets/languages/typescript.svg',
//                                                                vite: '/assets/languages/vite.svg',
//                                                                vuejs: '/assets/languages/vuejs.svg',
//                                                                unknown: '/assets/languages/unknown.svg',
//                                                            };
//
//                                                            const runtimeIcon = runtimeIconMap[runtime];
//                                                            const statusInfo = getStatusStyle(app.status);
//                                                            //const statusKey = app.status?.toLowerCase?.() || "unknown";
//                                                            const uniqueKey = `${key}-${app.ID || index}`;
//
//                                                            return (
//                                                                <li key={uniqueKey} className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700!">
//                                                                    <div className="flex items-center gap-2.5">
//                                                                        <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                                                            <img
//                                                                                alt={runtime}
//                                                                                src={runtimeIcon}
//                                                                                width={26}
//                                                                                height={26}
//                                                                                className="overflow-hidden rounded-sm"
//                                                                            />
//                                                                        </div>
//                                                                        <div className="flex flex-col gap-0.5 truncate">
//                                                                            <p className="font-semibold text-sm/[1.2]">{app.name || runtime.name}</p>
//                                                                            <span className="line-clamp-1 max-w-[85%] truncate text-secondary text-xs/[1.25]">{app.ID}</span>
//                                                                        </div>
//                                                                    </div>
//
//                                                                    <div className="flex w-full items-end justify-between gap-2">
//                                                                        <div className="flex max-w-full flex-wrap gap-2 truncate">
//                                                                            <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-700! focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                                    <path d="M208,48H176V32a8,8,0,0,0-16,0V48H96V32a8,8,0,0,0-16,0V48H48A16,16,0,0,0,32,64V192a16,16,0,0,0,16,16H80v16a8,8,0,0,0,16,0V208h64v16a8,8,0,0,0,16,0V208h32a16,16,0,0,0,16-16V64A16,16,0,0,0,208,48ZM160,144a16,16,0,1,1-16-16A16,16,0,0,1,160,144Z" />
//                                                                                </svg>
//                                                                                {Math.round(app.cpuPercent ?? 0)}% de {app.cpuLimit} vCPU
//                                                                            </span>
//                                                                            {(() => {
//                                                                                const usage = app.ramUsage || 0;          // uso atual em MB
//                                                                                const limit = app.memoryLimit || 256;     // limite do plano em MB
//                                                                                const percent = Math.round((usage / limit) * 100);
//
//                                                                                return (
//                                                                                    <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                                            <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z" />
//                                                                                        </svg>
//                                                                                        {Math.round(app.ramPercent ?? 0)}% de {app.ramLimit} MB
//                                                                                    </span>
//                                                                                );
//                                                                            })()}
//                                                                        </div>
//                                                                        <span className={`font-semibold transition-all h-5 rounded-sm px-2 text-[10px]/5 flex items-center gap-1.5 uppercase text-${statusInfo.color} bg-gradient-to-br ${statusInfo.gradient}`}>
//                                                                            <span className={`relative block size-2.5 rounded-full bg-${statusInfo.color}`}>
//                                                                                {statusInfo.animate && <span className="absolute size-2.5 rounded-full bg-inherit animate-ping" />}
//                                                                            </span>
//                                                                            {statusInfo.label}
//                                                                        </span>
//                                                                    </div>
//
//                                                                    <div
//                                                                        className="absolute inset-0 z-0 cursor-pointer"
//                                                                        onClick={() => router.push(`/${lang}/dashboard/applications/${app.ID}`)}
//                                                                    />
//                                                                    <div className="absolute top-4 right-4 flex gap-2">
//                                                                        <button
//                                                                            type="button"
//                                                                            aria-haspopup="dialog"
//                                                                            aria-expanded="false"
//                                                                            aria-controls="radix-_r_8_"
//                                                                            data-state="closed"
//                                                                            data-slot="dialog-trigger"
//                                                                            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//                                                                        >
//                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
//                                                                                <path d="M120,137,48,201A12,12,0,1,1,32,183l61.91-55L32,73A12,12,0,1,1,48,55l72,64A12,12,0,0,1,120,137Zm96,43H120a12,12,0,0,0,0,24h96a12,12,0,0,0,0-24Z" />
//                                                                            </svg>
//                                                                        </button>
//                                                                        <AppDropdownMenu app={app} onAction={handleAction} />
//                                                                    </div>
//                                                                </li>
//                                                            );
//                                                        })
//                                                    )}
//                                            </ul>
//                                        </div>
//
//                                        {/* Paginação e contador */}
//                                        <div className="space-y-2">
//                                            <div className="flex justify-between gap-4">
//                                                <button
//                                                    disabled
//                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                                >
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                                    </svg>
//                                                    <span className="hidden md:block">Anterior</span>
//                                                </button>
//
//                                                <div className="flex flex-col items-center">
//                                                    <div className="flex justify-center gap-x-1.5">
//                                                        <button className="inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                            1
//                                                        </button>
//                                                    </div>
//                                                </div>
//
//                                                <button
//                                                    disabled
//                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                                >
//                                                    <span className="hidden md:block">Próximo</span>
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                                    </svg>
//                                                </button>
//                                            </div>
//
//                                            <div className="text-right">
//                                                <span className="text-muted text-xs">
//                                                    Total de {totalApps} aplicação{totalApps !== 1 ? 's' : ''}, {onlineApps} estão online e {offlineApps} estão offline.
//                                                </span>
//                                            </div>
//                                        </div>
//                                    </div>
//                                </>
//                            )}
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div >
//            <Footer />
//        </>
//    );
//}

//frontend/src/app/[lang]/dashboard/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import PlanModal from '@/components/modals/PlanModal'
//import { PlanBadge } from '@/components/PlanBadge';
//import { getPlanTier } from '@/utils/planUtils';
////import { planOrder } from '@/utils/planUtils';
//import '../../styles/virtus.css';
//import { AppDropdownMenu } from '@/components/AppDropdownMenu';
//import { handleAction } from '@/utils/appActions';
//import PlanActionButton from '@/components/PlanActionButton';
//import PermissionNewApp from '@/components/buttons/PermissionNewApp';
//
////import NewApplicationButton from '@/components/buttons/NewApplicationButton';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//function getStatusStyle(status = '') {
//    const key = status.toLowerCase();
//    if (key === 'running' || key === 'online') {
//        return {
//            label: 'ONLINE',
//            color: 'green-500',
//            gradient: 'from-green-400/20 to-green-700/20',
//            animate: true
//        };
//    }
//    if (key === 'stopped' || key === 'offline') {
//        return {
//            label: 'OFFLINE',
//            color: 'red-500',
//            gradient: 'from-red-400/20 to-red-700/20',
//            animate: false
//        };
//    }
//    return {
//        label: 'DESCONHECIDO',
//        color: 'gray-500',
//        gradient: 'from-gray-400/20 to-gray-700/20',
//        animate: false
//    };
//}
//
////function shouldShowUpgrade(plan) {
////    return ['no-plan', 'test', 'basic'].includes(plan);
////}
//
//function isPersonalPlan(plan) {
//    return ['test', 'basic'].includes(plan);
//}
//
//function isNoPlan(plan) {
//    return plan === 'no-plan';
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    const lang = supported.includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'en';
//    //const lang = getLang(pathname);
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const tier = getPlanTier(plan);
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);     // memória usada pelo usuário
//    const [totalMB, setTotalMB] = useState(256); // limite do plano (default mínimo)
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const [showPlanModal, setShowPlanModal] = useState(false);
//    const [search, setSearch] = useState('');
//    const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//    const totalApps =
//        appsByStatus.active.length +
//        appsByStatus.stopped.length +
//        appsByStatus.backups.length;
//
//    const onlineApps = appsByStatus.active.length;
//    const offlineApps = appsByStatus.stopped.length;
//    const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
//
//    //const handleClick = () => {
//    //    router.push(`/${lang}/upload`);
//    //};
//
//    //const runtime = getRuntimeInfo(app.Image); // ou app.image, dependendo da estrutura
//    //const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//    useEffect(() => {
//        if (isPersonalPlan(plan)) {
//            setShowUpgradeBanner(true);
//        } else {
//            setShowUpgradeBanner(false); // garante que o banner suma se o plano mudar
//        }
//    }, [plan]);
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan((data.plan || 'no-plan').trim().toLowerCase());
//            console.log('Plano recebido:', data.plan);
//            setCanDeploy(data.canDeploy);
//            // ✅ usa os nomes corretos vindos do backend
//            setUsedMB(data.ramUsedMB || 0);       // uso atual
//            setTotalMB(data.totalMB || 256);     // limite do plano
//        };
//
//        checkSession().then(fetchUserStatus);
//        const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//        return () => clearInterval(interval);
//    }, []);
//
//    useEffect(() => {
//        const fetchAppsByStatus = async () => {
//            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//            const data = await res.json();
//
//            const removeDuplicates = (apps) => {
//                if (!Array.isArray(apps)) return [];
//                const seen = new Set();
//                return apps.filter(app => {
//                    const key = app.ID || app.ContainerName;
//                    if (seen.has(key)) return false;
//                    seen.add(key);
//                    return true;
//                });
//            };
//
//            setAppsByStatus({
//                active: removeDuplicates(data.active),
//                stopped: removeDuplicates(data.stopped),
//                backups: removeDuplicates(data.backups),
//            });
//        };
//
//        fetchAppsByStatus(); // primeira chamada imediata
//        const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//
//        return () => clearInterval(interval); // limpa ao desmontar
//    }, []);
//
//    const [isLoading, setIsLoading] = useState(true);
//    useEffect(() => {
//        // Simula carregamento inicial
//        const timer = setTimeout(() => setIsLoading(false), 2000);
//        return () => clearTimeout(timer);
//    }, []);
//
//    if (loading) return null;
//
//    // ✅ cálculo da porcentagem baseado nos valores reais do backend
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    // ... resto do componente renderizando o grid e resumo
//
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            {isLoading ? (
//                                                <>
//                                                    <div className="h-5 w-32 rounded bg-virtus-600 animate-pulse" />
//                                                    <div className="h-5 w-20 rounded bg-blue-600/50 animate-pulse" />
//                                                </>
//                                            ) : (
//                                                <>
//                                                    <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">
//                                                        Sua conta
//                                                    </span>
//                                                </>
//                                            )}
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span
//                                        className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md"
//                                    >
//                                        <PlanBadge plan={plan} tier={tier} />
//                                    </span>
//
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            {/* ✅ Global: uso do plano */}
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">{usedMB} MB usado</span>
//                                                <span className="text-nowrap text-muted text-xs">
//                                                    {totalMB - usedMB} MB disponível de {totalMB} MB
//                                                </span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div
//                                                    className="absolute inset-0 h-full rounded-full"
//                                                    style={{ backgroundColor: 'rgb(229, 212, 93)', width: `${percentUsed}%` }}
//                                                />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    {plan !== 'no-plan' ? (
//                                        <>
//                                            {/* Botão Renovar */}
//                                            <button
//                                                className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1"
//                                                role="button"
//                                            >
//                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                                    <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                                </svg>
//                                                Renovar
//                                            </button>
//
//                                            {/* Botão Upgrade */}
//                                            <PlanActionButton
//                                                plan={plan}
//                                                setShowPlanModal={setShowPlanModal}
//                                                setShowUpgradeModal={setShowUpgradeModal}
//                                            />
//                                        </>
//                                    ) : (
//                                        <div className="flex justify-end w-full">
//                                            <PlanActionButton
//                                                plan={plan}
//                                                setShowPlanModal={setShowPlanModal}
//                                                setShowUpgradeModal={setShowUpgradeModal}
//                                            />
//                                        </div>
//                                    )}
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        {showUpgradeBanner && (
//                            <div className="relative bg-background">
//                                <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                    <div className="flex items-center gap-2.5 md:gap-3.5">
//                                        <div className="flex size-5 items-center justify-center text-blue-500">
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                            </svg>
//                                        </div>
//                                        <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                    </div>
//
//                                    <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                        <span className="block w-full text-sm text-secondary">
//                                            Está pronto para transformar sua experiência? Com o{" "}
//                                            <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                                standard
//                                            </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                            <ul className="list-inside list-disc mt-1">
//                                                <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                                <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                                <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                            </ul>
//                                        </span>
//
//                                        <button
//                                            onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                            className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                        >
//                                            Fazer upgrade
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                            </svg>
//                                        </button>
//                                    </div>
//
//                                    <button
//                                        onClick={() => setShowUpgradeBanner(false)}
//                                        className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//                            </div>
//                        )}
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            {/* Barra de busca e botões */}
//                            <div className="flex flex-col gap-2 md:flex-row">
//                                <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                    <input
//                                        value={search}
//                                        onChange={(e) => setSearch(e.target.value)}
//                                        placeholder="Pesquisar em aplicações..."
//                                        className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                                    />
//                                    <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                        </svg>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-wrap gap-2">
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-background shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                        </svg>
//                                        Organizar
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    <PermissionNewApp plan={plan} lang={lang} setShowPlanModal={setShowPlanModal} />
//                                    {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
//
//                                </div>
//                            </div>
//
//                            {/* Grid de aplicações */}
//                            {plan === 'no-plan' ? (
//                                <>
//                                    {/* Tela de obtenção de plano */}
//                                    <div className="flex flex-1 flex-col min-h-[calc(100dvh-80px)] bg-blue-950">
//                                        <div className="flex h-full flex-1 items-center justify-center rounded-md border border-blue-700 bg-gradient-to-b from-blue-700/25 to-blue-950">
//                                            <div className="flex flex-col gap-4 text-center">
//                                                <div className="mx-auto rounded-xl border border-blue-700/25 bg-blue-700/10 p-4">
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.4,16.4,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//                                                    </svg>
//                                                </div>
//                                                <div className="space-y-1">
//                                                    <h1 className="font-bold text-2xl">Obtenha um plano para suas aplicações</h1>
//                                                    <p className="max-w-md text-secondary-foreground text-sm">
//                                                        Escolha um plano para atender às suas necessidades e comece a desenvolver com uma infraestrutura otimizada para produção.
//                                                    </p>
//                                                </div>
//                                                <button
//                                                    role="button"
//                                                    onClick={() => setShowPlanModal(true)}
//                                                    className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
//                                                >
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M208,144a15.78,15.78,0,0,1-10.42,14.94L146,178l-19,51.62a15.92,15.92,0,0,1-29.88,0L78,178l-51.62-19a15.92,15.92,0,0,1,0-29.88L78,110l19-51.62a15.92,15.92,0,0,1,29.88,0L146,110l51.62,19A15.78,15.78,0,0,1,208,144ZM152,48h16V64a8,8,0,0,0,16,0V48h16a8,8,0,0,0,0-16H184V16a8,8,0,0,0-16,0V32H152a8,8,0,0,0,0,16Zm88,32h-8V72a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0V96h8a8,8,0,0,0,0-16Z" />
//                                                    </svg>
//                                                    Obter um plano
//                                                    <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-[25deg] animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//                                                </button>
//                                                {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
//                                            </div>
//                                        </div>
//                                    </div>
//                                </>
//                            ) : (
//                                <>
//                                    {/* Grid de aplicações */}
//                                    <div className="flex min-h-[752px] flex-col gap-4 lg:h-[calc(100dvh-300px)]">
//                                        <div className="flex min-h-0 flex-1 flex-col">
//                                            <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                                {isLoading
//                                                    ? Array.from({ length: 6 }).map((_, i) => (
//                                                        <li
//                                                            key={`skeleton-${i}`}
//                                                            className="animate-pulse flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-700/50 p-4"
//                                                        >
//                                                            <div className="flex items-center gap-2.5">
//                                                                <div className="shrink-0 rounded-sm bg-virtus-900 p-1.5">
//                                                                    <div className="size-[26px] rounded-sm bg-virtus-600" />
//                                                                </div>
//                                                                <div className="flex flex-col gap-1 truncate w-full">
//                                                                    <div className="h-4 w-3/4 rounded bg-virtus-600" />
//                                                                    <div className="h-3 w-1/2 rounded bg-virtus-600" />
//                                                                </div>
//                                                            </div>
//
//                                                            <div className="flex justify-between items-end mt-4">
//                                                                <div className="flex gap-2">
//                                                                    <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                                    <div className="h-5 w-20 rounded bg-virtus-600" />
//                                                                </div>
//                                                                <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                            </div>
//                                                        </li>
//                                                    ))
//                                                    : Object.entries(appsByStatus).map(([key, apps]) =>
//                                                        apps.map((app, index) => {
//
//                                                            const runtime = app.runtime || 'unknown';
//
//                                                            const runtimeIconMap = {
//                                                                angular: '/assets/languages/angular.svg',
//                                                                csharp: '/assets/languages/csharp.svg',
//                                                                django: '/assets/languages/django.svg',
//                                                                dotnet: '/assets/languages/dotnet.svg',
//                                                                dotnetcore: '/assets/languages/dotnetcore.svg',
//                                                                elixir: '/assets/languages/elixir.svg',
//                                                                go: '/assets/languages/go.svg',
//                                                                golang: '/assets/languages/go.svg',
//                                                                java: '/assets/languages/java.svg',
//                                                                javascript: '/assets/languages/javascript.svg',
//                                                                kotlin: '/assets/languages/kotlin.svg',
//                                                                laravel: '/assets/languages/laravel.svg',
//                                                                lua: '/assets/languages/lua.svg',
//                                                                nestjs: '/assets/languages/nestjs.svg',
//                                                                nextjs: '/assets/languages/nextjs.svg',
//                                                                node: '/assets/languages/node.svg',
//                                                                nuxtjs: '/assets/languages/nuxtjs.svg',
//                                                                php: '/assets/languages/php.svg',
//                                                                python: '/assets/languages/python.svg',
//                                                                react: '/assets/languages/react.svg',
//                                                                rust: '/assets/languages/rust.svg',
//                                                                springboot: '/assets/languages/springboot.svg',
//                                                                'springboot-gradle': '/assets/languages/springboot-gradle.svg',
//                                                                typescript: '/assets/languages/typescript.svg',
//                                                                vite: '/assets/languages/vite.svg',
//                                                                vuejs: '/assets/languages/vuejs.svg',
//                                                                unknown: '/assets/languages/unknown.svg',
//                                                            };
//
//                                                            const runtimeIcon = runtimeIconMap[runtime];
//                                                            const statusInfo = getStatusStyle(app.status);
//                                                            //const statusKey = app.status?.toLowerCase?.() || "unknown";
//                                                            const uniqueKey = `${key}-${app.ID || index}`;
//
//                                                            return (
//                                                                <li key={uniqueKey} className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700!">
//                                                                    <div className="flex items-center gap-2.5">
//                                                                        <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                                                            <img
//                                                                                alt={runtime}
//                                                                                src={runtimeIcon}
//                                                                                width={26}
//                                                                                height={26}
//                                                                                className="overflow-hidden rounded-sm"
//                                                                            />
//                                                                        </div>
//                                                                        <div className="flex flex-col gap-0.5 truncate">
//                                                                            <p className="font-semibold text-sm/[1.2]">{app.name || runtime.name}</p>
//                                                                            <span className="line-clamp-1 max-w-[85%] truncate text-secondary text-xs/[1.25]">{app.ID}</span>
//                                                                        </div>
//                                                                    </div>
//
//                                                                    <div className="flex w-full items-end justify-between gap-2">
//                                                                        <div className="flex max-w-full flex-wrap gap-2 truncate">
//                                                                            <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-700! focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                                    <path d="M208,48H176V32a8,8,0,0,0-16,0V48H96V32a8,8,0,0,0-16,0V48H48A16,16,0,0,0,32,64V192a16,16,0,0,0,16,16H80v16a8,8,0,0,0,16,0V208h64v16a8,8,0,0,0,16,0V208h32a16,16,0,0,0,16-16V64A16,16,0,0,0,208,48ZM160,144a16,16,0,1,1-16-16A16,16,0,0,1,160,144Z" />
//                                                                                </svg>
//                                                                                {app.cpu || '0%'}
//                                                                            </span>
//                                                                            {(() => {
//                                                                                const usage = app.ramUsage || 0;          // uso atual em MB
//                                                                                const limit = app.memoryLimit || 256;     // limite do plano em MB
//                                                                                const percent = Math.round((usage / limit) * 100);
//
//                                                                                return (
//                                                                                    <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                                            <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z" />
//                                                                                        </svg>
//                                                                                        {percent}% usado
//                                                                                    </span>
//                                                                                );
//                                                                            })()}
//                                                                        </div>
//                                                                        <span className={`font-semibold transition-all h-5 rounded-sm px-2 text-[10px]/5 flex items-center gap-1.5 uppercase text-${statusInfo.color} bg-gradient-to-br ${statusInfo.gradient}`}>
//                                                                            <span className={`relative block size-2.5 rounded-full bg-${statusInfo.color}`}>
//                                                                                {statusInfo.animate && <span className="absolute size-2.5 rounded-full bg-inherit animate-ping" />}
//                                                                            </span>
//                                                                            {statusInfo.label}
//                                                                        </span>
//                                                                    </div>
//
//                                                                    <div
//                                                                        className="absolute inset-0 z-0 cursor-pointer"
//                                                                        onClick={() => router.push(`/${lang}/dashboard/applications/${app.ID}`)}
//                                                                    />
//                                                                    <div className="absolute top-4 right-4 flex gap-2">
//                                                                        <button
//                                                                            type="button"
//                                                                            aria-haspopup="dialog"
//                                                                            aria-expanded="false"
//                                                                            aria-controls="radix-_r_8_"
//                                                                            data-state="closed"
//                                                                            data-slot="dialog-trigger"
//                                                                            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//                                                                        >
//                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
//                                                                                <path d="M120,137,48,201A12,12,0,1,1,32,183l61.91-55L32,73A12,12,0,1,1,48,55l72,64A12,12,0,0,1,120,137Zm96,43H120a12,12,0,0,0,0,24h96a12,12,0,0,0,0-24Z" />
//                                                                            </svg>
//                                                                        </button>
//                                                                        <AppDropdownMenu app={app} onAction={handleAction} />
//                                                                    </div>
//                                                                </li>
//                                                            );
//                                                        })
//                                                    )}
//                                            </ul>
//                                        </div>
//
//                                        {/* Paginação e contador */}
//                                        <div className="space-y-2">
//                                            <div className="flex justify-between gap-4">
//                                                <button
//                                                    disabled
//                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                                >
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                                    </svg>
//                                                    <span className="hidden md:block">Anterior</span>
//                                                </button>
//
//                                                <div className="flex flex-col items-center">
//                                                    <div className="flex justify-center gap-x-1.5">
//                                                        <button className="inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                            1
//                                                        </button>
//                                                    </div>
//                                                </div>
//
//                                                <button
//                                                    disabled
//                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                                >
//                                                    <span className="hidden md:block">Próximo</span>
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                                    </svg>
//                                                </button>
//                                            </div>
//
//                                            <div className="text-right">
//                                                <span className="text-muted text-xs">
//                                                    Total de {totalApps} aplicação{totalApps !== 1 ? 's' : ''}, {onlineApps} estão online e {offlineApps} estão offline.
//                                                </span>
//                                            </div>
//                                        </div>
//                                    </div>
//                                </>
//                            )}
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div >
//            <Footer />
//        </>
//    );
//}

//frontend/src/app/[lang]/dashboard/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import PlanModal from '@/components/modals/PlanModal'
//import { PlanBadge } from '@/components/PlanBadge';
//import { getPlanTier } from '@/utils/planUtils';
////import { planOrder } from '@/utils/planUtils';
//import '../../styles/virtus.css';
//import { AppDropdownMenu } from '@/components/AppDropdownMenu';
//import { handleAction } from '@/utils/appActions';
//import PlanActionButton from '@/components/PlanActionButton';
//import PermissionNewApp from '@/components/buttons/PermissionNewApp';
//
////import NewApplicationButton from '@/components/buttons/NewApplicationButton';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//function getStatusStyle(status = '') {
//    const key = status.toLowerCase();
//    if (key === 'running' || key === 'online') {
//        return {
//            label: 'ONLINE',
//            color: 'green-500',
//            gradient: 'from-green-400/20 to-green-700/20',
//            animate: true
//        };
//    }
//    if (key === 'stopped' || key === 'offline') {
//        return {
//            label: 'OFFLINE',
//            color: 'red-500',
//            gradient: 'from-red-400/20 to-red-700/20',
//            animate: false
//        };
//    }
//    return {
//        label: 'DESCONHECIDO',
//        color: 'gray-500',
//        gradient: 'from-gray-400/20 to-gray-700/20',
//        animate: false
//    };
//}
//
////function shouldShowUpgrade(plan) {
////    return ['no-plan', 'test', 'basic'].includes(plan);
////}
//
//function isPersonalPlan(plan) {
//    return ['test', 'basic'].includes(plan);
//}
//
//function isNoPlan(plan) {
//    return plan === 'no-plan';
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    const lang = supported.includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'en';
//    //const lang = getLang(pathname);
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const tier = getPlanTier(plan);
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);     // memória usada pelo usuário
//    const [totalMB, setTotalMB] = useState(256); // limite do plano (default mínimo)
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const [showPlanModal, setShowPlanModal] = useState(false);
//    const [search, setSearch] = useState('');
//    const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//    const totalApps =
//        appsByStatus.active.length +
//        appsByStatus.stopped.length +
//        appsByStatus.backups.length;
//
//    const onlineApps = appsByStatus.active.length;
//    const offlineApps = appsByStatus.stopped.length;
//    const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
//
//    //const handleClick = () => {
//    //    router.push(`/${lang}/upload`);
//    //};
//
//    //const runtime = getRuntimeInfo(app.Image); // ou app.image, dependendo da estrutura
//    //const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//    useEffect(() => {
//        if (isPersonalPlan(plan)) {
//            setShowUpgradeBanner(true);
//        } else {
//            setShowUpgradeBanner(false); // garante que o banner suma se o plano mudar
//        }
//    }, [plan]);
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan((data.plan || 'no-plan').trim().toLowerCase());
//            console.log('Plano recebido:', data.plan);
//            setCanDeploy(data.canDeploy);
//            // ✅ usa os nomes corretos vindos do backend
//            setUsedMB(data.ramUsedMB || 0);       // uso atual
//            setTotalMB(data.memoryMB || 256);     // limite do plano
//        };
//
//        checkSession().then(fetchUserStatus);
//        const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//        return () => clearInterval(interval);
//    }, []);
//
//    useEffect(() => {
//        const fetchAppsByStatus = async () => {
//            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//            const data = await res.json();
//
//            const removeDuplicates = (apps) => {
//                if (!Array.isArray(apps)) return [];
//                const seen = new Set();
//                return apps.filter(app => {
//                    const key = app.ID || app.ContainerName;
//                    if (seen.has(key)) return false;
//                    seen.add(key);
//                    return true;
//                });
//            };
//
//            setAppsByStatus({
//                active: removeDuplicates(data.active),
//                stopped: removeDuplicates(data.stopped),
//                backups: removeDuplicates(data.backups),
//            });
//        };
//
//        fetchAppsByStatus(); // primeira chamada imediata
//        const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//
//        return () => clearInterval(interval); // limpa ao desmontar
//    }, []);
//
//    const [isLoading, setIsLoading] = useState(true);
//    useEffect(() => {
//        // Simula carregamento inicial
//        const timer = setTimeout(() => setIsLoading(false), 2000);
//        return () => clearTimeout(timer);
//    }, []);
//
//    if (loading) return null;
//
//    // ✅ cálculo da porcentagem baseado nos valores reais do backend
//    const percentUsed = Math.round((usedMB / totalMB) * 256);
//
//    // ... resto do componente renderizando o grid e resumo
//
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            {isLoading ? (
//                                                <>
//                                                    <div className="h-5 w-32 rounded bg-virtus-600 animate-pulse" />
//                                                    <div className="h-5 w-20 rounded bg-blue-600/50 animate-pulse" />
//                                                </>
//                                            ) : (
//                                                <>
//                                                    <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">
//                                                        Sua conta
//                                                    </span>
//                                                </>
//                                            )}
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span
//                                        className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md"
//                                    >
//                                        <PlanBadge plan={plan} tier={tier} />
//                                    </span>
//
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">{usedMB} MB usado</span>
//                                                <span className="text-nowrap text-muted text-xs">
//                                                    {totalMB - usedMB} MB disponível de {totalMB} MB
//                                                </span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div
//                                                    className="absolute inset-0 h-full rounded-full"
//                                                    style={{ backgroundColor: 'rgb(229, 212, 93)', width: `${percentUsed}%` }}
//                                                />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    {plan !== 'no-plan' ? (
//                                        <>
//                                            {/* Botão Renovar */}
//                                            <button
//                                                className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1"
//                                                role="button"
//                                            >
//                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                                    <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                                </svg>
//                                                Renovar
//                                            </button>
//
//                                            {/* Botão Upgrade */}
//                                            <PlanActionButton
//                                                plan={plan}
//                                                setShowPlanModal={setShowPlanModal}
//                                                setShowUpgradeModal={setShowUpgradeModal}
//                                            />
//                                        </>
//                                    ) : (
//                                        <div className="flex justify-end w-full">
//                                            <PlanActionButton
//                                                plan={plan}
//                                                setShowPlanModal={setShowPlanModal}
//                                                setShowUpgradeModal={setShowUpgradeModal}
//                                            />
//                                        </div>
//                                    )}
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        {showUpgradeBanner && (
//                            <div className="relative bg-background">
//                                <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                    <div className="flex items-center gap-2.5 md:gap-3.5">
//                                        <div className="flex size-5 items-center justify-center text-blue-500">
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                            </svg>
//                                        </div>
//                                        <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                    </div>
//
//                                    <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                        <span className="block w-full text-sm text-secondary">
//                                            Está pronto para transformar sua experiência? Com o{" "}
//                                            <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                                standard
//                                            </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                            <ul className="list-inside list-disc mt-1">
//                                                <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                                <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                                <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                            </ul>
//                                        </span>
//
//                                        <button
//                                            onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                            className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                        >
//                                            Fazer upgrade
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                            </svg>
//                                        </button>
//                                    </div>
//
//                                    <button
//                                        onClick={() => setShowUpgradeBanner(false)}
//                                        className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//                            </div>
//                        )}
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            {/* Barra de busca e botões */}
//                            <div className="flex flex-col gap-2 md:flex-row">
//                                <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                    <input
//                                        value={search}
//                                        onChange={(e) => setSearch(e.target.value)}
//                                        placeholder="Pesquisar em aplicações..."
//                                        className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                                    />
//                                    <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                        </svg>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-wrap gap-2">
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-background shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                        </svg>
//                                        Organizar
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    <PermissionNewApp plan={plan} lang={lang} setShowPlanModal={setShowPlanModal} />
//                                    {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
//
//                                </div>
//                            </div>
//
//                            {/* Grid de aplicações */}
//                            {plan === 'no-plan' ? (
//                                <>
//                                    {/* Tela de obtenção de plano */}
//                                    <div className="flex flex-1 flex-col min-h-[calc(100dvh-80px)] bg-blue-950">
//                                        <div className="flex h-full flex-1 items-center justify-center rounded-md border border-blue-700 bg-gradient-to-b from-blue-700/25 to-blue-950">
//                                            <div className="flex flex-col gap-4 text-center">
//                                                <div className="mx-auto rounded-xl border border-blue-700/25 bg-blue-700/10 p-4">
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.4,16.4,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//                                                    </svg>
//                                                </div>
//                                                <div className="space-y-1">
//                                                    <h1 className="font-bold text-2xl">Obtenha um plano para suas aplicações</h1>
//                                                    <p className="max-w-md text-secondary-foreground text-sm">
//                                                        Escolha um plano para atender às suas necessidades e comece a desenvolver com uma infraestrutura otimizada para produção.
//                                                    </p>
//                                                </div>
//                                                <button
//                                                    role="button"
//                                                    onClick={() => setShowPlanModal(true)}
//                                                    className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
//                                                >
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M208,144a15.78,15.78,0,0,1-10.42,14.94L146,178l-19,51.62a15.92,15.92,0,0,1-29.88,0L78,178l-51.62-19a15.92,15.92,0,0,1,0-29.88L78,110l19-51.62a15.92,15.92,0,0,1,29.88,0L146,110l51.62,19A15.78,15.78,0,0,1,208,144ZM152,48h16V64a8,8,0,0,0,16,0V48h16a8,8,0,0,0,0-16H184V16a8,8,0,0,0-16,0V32H152a8,8,0,0,0,0,16Zm88,32h-8V72a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0V96h8a8,8,0,0,0,0-16Z" />
//                                                    </svg>
//                                                    Obter um plano
//                                                    <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-[25deg] animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//                                                </button>
//                                                {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
//                                            </div>
//                                        </div>
//                                    </div>
//                                </>
//                            ) : (
//                                <>
//                                    {/* Grid de aplicações */}
//                                    <div className="flex min-h-[752px] flex-col gap-4 lg:h-[calc(100dvh-300px)]">
//                                        <div className="flex min-h-0 flex-1 flex-col">
//                                            <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                                {isLoading
//                                                    ? Array.from({ length: 6 }).map((_, i) => (
//                                                        <li
//                                                            key={`skeleton-${i}`}
//                                                            className="animate-pulse flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-700/50 p-4"
//                                                        >
//                                                            <div className="flex items-center gap-2.5">
//                                                                <div className="shrink-0 rounded-sm bg-virtus-900 p-1.5">
//                                                                    <div className="size-[26px] rounded-sm bg-virtus-600" />
//                                                                </div>
//                                                                <div className="flex flex-col gap-1 truncate w-full">
//                                                                    <div className="h-4 w-3/4 rounded bg-virtus-600" />
//                                                                    <div className="h-3 w-1/2 rounded bg-virtus-600" />
//                                                                </div>
//                                                            </div>
//
//                                                            <div className="flex justify-between items-end mt-4">
//                                                                <div className="flex gap-2">
//                                                                    <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                                    <div className="h-5 w-20 rounded bg-virtus-600" />
//                                                                </div>
//                                                                <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                            </div>
//                                                        </li>
//                                                    ))
//                                                    : Object.entries(appsByStatus).map(([key, apps]) =>
//                                                        apps.map((app, index) => {
//
//                                                            const runtime = app.runtime || 'unknown';
//
//                                                            const runtimeIconMap = {
//                                                                angular: '/assets/languages/angular.svg',
//                                                                csharp: '/assets/languages/csharp.svg',
//                                                                django: '/assets/languages/django.svg',
//                                                                dotnet: '/assets/languages/dotnet.svg',
//                                                                dotnetcore: '/assets/languages/dotnetcore.svg',
//                                                                elixir: '/assets/languages/elixir.svg',
//                                                                go: '/assets/languages/go.svg',
//                                                                golang: '/assets/languages/go.svg',
//                                                                java: '/assets/languages/java.svg',
//                                                                javascript: '/assets/languages/javascript.svg',
//                                                                kotlin: '/assets/languages/kotlin.svg',
//                                                                laravel: '/assets/languages/laravel.svg',
//                                                                lua: '/assets/languages/lua.svg',
//                                                                nestjs: '/assets/languages/nestjs.svg',
//                                                                nextjs: '/assets/languages/nextjs.svg',
//                                                                node: '/assets/languages/node.svg',
//                                                                nuxtjs: '/assets/languages/nuxtjs.svg',
//                                                                php: '/assets/languages/php.svg',
//                                                                python: '/assets/languages/python.svg',
//                                                                react: '/assets/languages/react.svg',
//                                                                rust: '/assets/languages/rust.svg',
//                                                                springboot: '/assets/languages/springboot.svg',
//                                                                'springboot-gradle': '/assets/languages/springboot-gradle.svg',
//                                                                typescript: '/assets/languages/typescript.svg',
//                                                                vite: '/assets/languages/vite.svg',
//                                                                vuejs: '/assets/languages/vuejs.svg',
//                                                                unknown: '/assets/languages/unknown.svg',
//                                                            };
//
//                                                            const runtimeIcon = runtimeIconMap[runtime];
//                                                            const statusInfo = getStatusStyle(app.status);
//                                                            //const statusKey = app.status?.toLowerCase?.() || "unknown";
//                                                            const uniqueKey = `${key}-${app.ID || index}`;
//
//                                                            return (
//                                                                <li key={uniqueKey} className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700!">
//                                                                    <div className="flex items-center gap-2.5">
//                                                                        <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                                                            <img
//                                                                                alt={runtime}
//                                                                                src={runtimeIcon}
//                                                                                width={26}
//                                                                                height={26}
//                                                                                className="overflow-hidden rounded-sm"
//                                                                            />
//                                                                        </div>
//                                                                        <div className="flex flex-col gap-0.5 truncate">
//                                                                            <p className="font-semibold text-sm/[1.2]">{app.name || runtime.name}</p>
//                                                                            <span className="line-clamp-1 max-w-[85%] truncate text-secondary text-xs/[1.25]">{app.ID}</span>
//                                                                        </div>
//                                                                    </div>
//
//                                                                    <div className="flex w-full items-end justify-between gap-2">
//                                                                        <div className="flex max-w-full flex-wrap gap-2 truncate">
//                                                                            <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-700! focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                                    <path d="M208,48H176V32a8,8,0,0,0-16,0V48H96V32a8,8,0,0,0-16,0V48H48A16,16,0,0,0,32,64V192a16,16,0,0,0,16,16H80v16a8,8,0,0,0,16,0V208h64v16a8,8,0,0,0,16,0V208h32a16,16,0,0,0,16-16V64A16,16,0,0,0,208,48ZM160,144a16,16,0,1,1-16-16A16,16,0,0,1,160,144Z" />
//                                                                                </svg>
//                                                                                {app.cpu || '0%'}
//                                                                            </span>
//                                                                            {(() => {
//                                                                                const usage = app.ramUsage || 0;          // uso atual em MB
//                                                                                const limit = app.memoryLimit || 256;     // limite do plano em MB
//                                                                                const percent = Math.round((usage / limit) * 100);
//
//                                                                                return (
//                                                                                    <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                                            <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z" />
//                                                                                        </svg>
//                                                                                        {percent}% usado
//                                                                                    </span>
//                                                                                );
//                                                                            })()}
//                                                                        </div>
//                                                                        <span className={`font-semibold transition-all h-5 rounded-sm px-2 text-[10px]/5 flex items-center gap-1.5 uppercase text-${statusInfo.color} bg-gradient-to-br ${statusInfo.gradient}`}>
//                                                                            <span className={`relative block size-2.5 rounded-full bg-${statusInfo.color}`}>
//                                                                                {statusInfo.animate && <span className="absolute size-2.5 rounded-full bg-inherit animate-ping" />}
//                                                                            </span>
//                                                                            {statusInfo.label}
//                                                                        </span>
//                                                                    </div>
//
//                                                                    <div
//                                                                        className="absolute inset-0 z-0 cursor-pointer"
//                                                                        onClick={() => router.push(`/${lang}/dashboard/applications/${app.ID}`)}
//                                                                    />
//                                                                    <div className="absolute top-4 right-4 flex gap-2">
//                                                                        <button
//                                                                            type="button"
//                                                                            aria-haspopup="dialog"
//                                                                            aria-expanded="false"
//                                                                            aria-controls="radix-_r_8_"
//                                                                            data-state="closed"
//                                                                            data-slot="dialog-trigger"
//                                                                            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//                                                                        >
//                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
//                                                                                <path d="M120,137,48,201A12,12,0,1,1,32,183l61.91-55L32,73A12,12,0,1,1,48,55l72,64A12,12,0,0,1,120,137Zm96,43H120a12,12,0,0,0,0,24h96a12,12,0,0,0,0-24Z" />
//                                                                            </svg>
//                                                                        </button>
//                                                                        <AppDropdownMenu app={app} onAction={handleAction} />
//                                                                    </div>
//                                                                </li>
//                                                            );
//                                                        })
//                                                    )}
//                                            </ul>
//                                        </div>
//
//                                        {/* Paginação e contador */}
//                                        <div className="space-y-2">
//                                            <div className="flex justify-between gap-4">
//                                                <button
//                                                    disabled
//                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                                >
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                                    </svg>
//                                                    <span className="hidden md:block">Anterior</span>
//                                                </button>
//
//                                                <div className="flex flex-col items-center">
//                                                    <div className="flex justify-center gap-x-1.5">
//                                                        <button className="inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                            1
//                                                        </button>
//                                                    </div>
//                                                </div>
//
//                                                <button
//                                                    disabled
//                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                                >
//                                                    <span className="hidden md:block">Próximo</span>
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                                    </svg>
//                                                </button>
//                                            </div>
//
//                                            <div className="text-right">
//                                                <span className="text-muted text-xs">
//                                                    Total de {totalApps} aplicação{totalApps !== 1 ? 's' : ''}, {onlineApps} estão online e {offlineApps} estão offline.
//                                                </span>
//                                            </div>
//                                        </div>
//                                    </div>
//                                </>
//                            )}
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div >
//            <Footer />
//        </>
//    );
//}

//frontend/src/app/[lang]/dashboard/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import PlanModal from '@/components/modals/PlanModal'
//import { PlanBadge } from '@/components/PlanBadge';
//import { getPlanTier } from '@/utils/planUtils';
////import { planOrder } from '@/utils/planUtils';
//import '../../styles/virtus.css';
//import { AppDropdownMenu } from '@/components/AppDropdownMenu';
//import { handleAction } from '@/utils/appActions';
//import PlanActionButton from '@/components/PlanActionButton';
//import PermissionNewApp from '@/components/buttons/PermissionNewApp';
//
////import NewApplicationButton from '@/components/buttons/NewApplicationButton';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//function getStatusStyle(status = '') {
//    const key = status.toLowerCase();
//    if (key === 'running' || key === 'online') {
//        return {
//            label: 'ONLINE',
//            color: 'green-500',
//            gradient: 'from-green-400/20 to-green-700/20',
//            animate: true
//        };
//    }
//    if (key === 'stopped' || key === 'offline') {
//        return {
//            label: 'OFFLINE',
//            color: 'red-500',
//            gradient: 'from-red-400/20 to-red-700/20',
//            animate: false
//        };
//    }
//    return {
//        label: 'DESCONHECIDO',
//        color: 'gray-500',
//        gradient: 'from-gray-400/20 to-gray-700/20',
//        animate: false
//    };
//}
//
////function shouldShowUpgrade(plan) {
////    return ['no-plan', 'test', 'basic'].includes(plan);
////}
//
//function isPersonalPlan(plan) {
//    return ['test', 'basic'].includes(plan);
//}
//
//function isNoPlan(plan) {
//    return plan === 'no-plan';
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    const lang = supported.includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'en';
//    //const lang = getLang(pathname);
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const tier = getPlanTier(plan);
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);
//    const [totalMB, setTotalMB] = useState(2048);
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const [showPlanModal, setShowPlanModal] = useState(false);
//    const [search, setSearch] = useState('');
//    const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//    const totalApps =
//        appsByStatus.active.length +
//        appsByStatus.stopped.length +
//        appsByStatus.backups.length;
//
//    const onlineApps = appsByStatus.active.length;
//    const offlineApps = appsByStatus.stopped.length;
//    const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
//
//    //const handleClick = () => {
//    //    router.push(`/${lang}/upload`);
//    //};
//
//    //const runtime = getRuntimeInfo(app.Image); // ou app.image, dependendo da estrutura
//    //const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//    useEffect(() => {
//        if (isPersonalPlan(plan)) {
//            setShowUpgradeBanner(true);
//        } else {
//            setShowUpgradeBanner(false); // garante que o banner suma se o plano mudar
//        }
//    }, [plan]);
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan((data.plan || 'no-plan').trim().toLowerCase());
//            console.log('Plano recebido:', data.plan);
//            setCanDeploy(data.canDeploy);
//            setUsedMB(data.usedMB || 0);
//            setTotalMB(data.totalMB || 2048);
//        };
//
//        checkSession().then(fetchUserStatus);
//        const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//        return () => clearInterval(interval);
//    }, []);
//
//    useEffect(() => {
//        const fetchAppsByStatus = async () => {
//            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//            const data = await res.json();
//
//            const removeDuplicates = (apps) => {
//                if (!Array.isArray(apps)) return [];
//                const seen = new Set();
//                return apps.filter(app => {
//                    const key = app.ID || app.ContainerName;
//                    if (seen.has(key)) return false;
//                    seen.add(key);
//                    return true;
//                });
//            };
//
//            setAppsByStatus({
//                active: removeDuplicates(data.active),
//                stopped: removeDuplicates(data.stopped),
//                backups: removeDuplicates(data.backups),
//            });
//        };
//
//        fetchAppsByStatus(); // primeira chamada imediata
//        const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//
//        return () => clearInterval(interval); // limpa ao desmontar
//    }, []);
//
//    const [isLoading, setIsLoading] = useState(true);
//    useEffect(() => {
//        // Simula carregamento inicial
//        const timer = setTimeout(() => setIsLoading(false), 2000);
//        return () => clearTimeout(timer);
//    }, []);
//
//    if (loading) return null;
//
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            {isLoading ? (
//                                                <>
//                                                    <div className="h-5 w-32 rounded bg-virtus-600 animate-pulse" />
//                                                    <div className="h-5 w-20 rounded bg-blue-600/50 animate-pulse" />
//                                                </>
//                                            ) : (
//                                                <>
//                                                    <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">
//                                                        Sua conta
//                                                    </span>
//                                                </>
//                                            )}
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span
//                                        className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md"
//                                    >
//                                        <PlanBadge plan={plan} tier={tier} />
//                                    </span>
//
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">{usedMB} MB usado</span>
//                                                <span className="text-nowrap text-muted text-xs">
//                                                    {totalMB - usedMB} MB disponível de {totalMB} MB
//                                                </span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div
//                                                    className="absolute inset-0 h-full rounded-full"
//                                                    style={{ backgroundColor: 'rgb(229, 212, 93)', width: `${percentUsed}%` }}
//                                                />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    {plan !== 'no-plan' ? (
//                                        <>
//                                            {/* Botão Renovar */}
//                                            <button
//                                                className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1"
//                                                role="button"
//                                            >
//                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                                    <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                                </svg>
//                                                Renovar
//                                            </button>
//
//                                            {/* Botão Upgrade */}
//                                            <PlanActionButton
//                                                plan={plan}
//                                                setShowPlanModal={setShowPlanModal}
//                                                setShowUpgradeModal={setShowUpgradeModal}
//                                            />
//                                        </>
//                                    ) : (
//                                        <div className="flex justify-end w-full">
//                                            <PlanActionButton
//                                                plan={plan}
//                                                setShowPlanModal={setShowPlanModal}
//                                                setShowUpgradeModal={setShowUpgradeModal}
//                                            />
//                                        </div>
//                                    )}
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        {showUpgradeBanner && (
//                            <div className="relative bg-background">
//                                <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                    <div className="flex items-center gap-2.5 md:gap-3.5">
//                                        <div className="flex size-5 items-center justify-center text-blue-500">
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                            </svg>
//                                        </div>
//                                        <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                    </div>
//
//                                    <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                        <span className="block w-full text-sm text-secondary">
//                                            Está pronto para transformar sua experiência? Com o{" "}
//                                            <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                                standard
//                                            </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                            <ul className="list-inside list-disc mt-1">
//                                                <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                                <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                                <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                            </ul>
//                                        </span>
//
//                                        <button
//                                            onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                            className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                        >
//                                            Fazer upgrade
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                            </svg>
//                                        </button>
//                                    </div>
//
//                                    <button
//                                        onClick={() => setShowUpgradeBanner(false)}
//                                        className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//                            </div>
//                        )}
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            {/* Barra de busca e botões */}
//                            <div className="flex flex-col gap-2 md:flex-row">
//                                <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                    <input
//                                        value={search}
//                                        onChange={(e) => setSearch(e.target.value)}
//                                        placeholder="Pesquisar em aplicações..."
//                                        className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                                    />
//                                    <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                        </svg>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-wrap gap-2">
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-background shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                        </svg>
//                                        Organizar
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    <PermissionNewApp plan={plan} lang={lang} setShowPlanModal={setShowPlanModal} />
//                                    {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
//
//                                </div>
//                            </div>
//
//                            {/* Grid de aplicações */}
//                            {plan === 'no-plan' ? (
//                                <>
//                                    {/* Tela de obtenção de plano */}
//                                    <div className="flex flex-1 flex-col min-h-[calc(100dvh-80px)] bg-blue-950">
//                                        <div className="flex h-full flex-1 items-center justify-center rounded-md border border-blue-700 bg-gradient-to-b from-blue-700/25 to-blue-950">
//                                            <div className="flex flex-col gap-4 text-center">
//                                                <div className="mx-auto rounded-xl border border-blue-700/25 bg-blue-700/10 p-4">
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.4,16.4,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//                                                    </svg>
//                                                </div>
//                                                <div className="space-y-1">
//                                                    <h1 className="font-bold text-2xl">Obtenha um plano para suas aplicações</h1>
//                                                    <p className="max-w-md text-secondary-foreground text-sm">
//                                                        Escolha um plano para atender às suas necessidades e comece a desenvolver com uma infraestrutura otimizada para produção.
//                                                    </p>
//                                                </div>
//                                                <button
//                                                    role="button"
//                                                    onClick={() => setShowPlanModal(true)}
//                                                    className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
//                                                >
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M208,144a15.78,15.78,0,0,1-10.42,14.94L146,178l-19,51.62a15.92,15.92,0,0,1-29.88,0L78,178l-51.62-19a15.92,15.92,0,0,1,0-29.88L78,110l19-51.62a15.92,15.92,0,0,1,29.88,0L146,110l51.62,19A15.78,15.78,0,0,1,208,144ZM152,48h16V64a8,8,0,0,0,16,0V48h16a8,8,0,0,0,0-16H184V16a8,8,0,0,0-16,0V32H152a8,8,0,0,0,0,16Zm88,32h-8V72a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0V96h8a8,8,0,0,0,0-16Z" />
//                                                    </svg>
//                                                    Obter um plano
//                                                    <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-[25deg] animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//                                                </button>
//                                                {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
//                                            </div>
//                                        </div>
//                                    </div>
//                                </>
//                            ) : (
//                                <>
//                                    {/* Grid de aplicações */}
//                                    <div className="flex min-h-[752px] flex-col gap-4 lg:h-[calc(100dvh-300px)]">
//                                        <div className="flex min-h-0 flex-1 flex-col">
//                                            <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                                {isLoading
//                                                    ? Array.from({ length: 6 }).map((_, i) => (
//                                                        <li
//                                                            key={`skeleton-${i}`}
//                                                            className="animate-pulse flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-700/50 p-4"
//                                                        >
//                                                            <div className="flex items-center gap-2.5">
//                                                                <div className="shrink-0 rounded-sm bg-virtus-900 p-1.5">
//                                                                    <div className="size-[26px] rounded-sm bg-virtus-600" />
//                                                                </div>
//                                                                <div className="flex flex-col gap-1 truncate w-full">
//                                                                    <div className="h-4 w-3/4 rounded bg-virtus-600" />
//                                                                    <div className="h-3 w-1/2 rounded bg-virtus-600" />
//                                                                </div>
//                                                            </div>
//
//                                                            <div className="flex justify-between items-end mt-4">
//                                                                <div className="flex gap-2">
//                                                                    <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                                    <div className="h-5 w-20 rounded bg-virtus-600" />
//                                                                </div>
//                                                                <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                            </div>
//                                                        </li>
//                                                    ))
//                                                    : Object.entries(appsByStatus).map(([key, apps]) =>
//                                                        apps.map((app, index) => {
//
//                                                            const runtime = app.runtime || 'unknown';
//
//                                                            const runtimeIconMap = {
//                                                                angular: '/assets/languages/angular.svg',
//                                                                csharp: '/assets/languages/csharp.svg',
//                                                                django: '/assets/languages/django.svg',
//                                                                dotnet: '/assets/languages/dotnet.svg',
//                                                                dotnetcore: '/assets/languages/dotnetcore.svg',
//                                                                elixir: '/assets/languages/elixir.svg',
//                                                                go: '/assets/languages/go.svg',
//                                                                golang: '/assets/languages/go.svg',
//                                                                java: '/assets/languages/java.svg',
//                                                                javascript: '/assets/languages/javascript.svg',
//                                                                kotlin: '/assets/languages/kotlin.svg',
//                                                                laravel: '/assets/languages/laravel.svg',
//                                                                lua: '/assets/languages/lua.svg',
//                                                                nestjs: '/assets/languages/nestjs.svg',
//                                                                nextjs: '/assets/languages/nextjs.svg',
//                                                                node: '/assets/languages/node.svg',
//                                                                nuxtjs: '/assets/languages/nuxtjs.svg',
//                                                                php: '/assets/languages/php.svg',
//                                                                python: '/assets/languages/python.svg',
//                                                                react: '/assets/languages/react.svg',
//                                                                rust: '/assets/languages/rust.svg',
//                                                                springboot: '/assets/languages/springboot.svg',
//                                                                'springboot-gradle': '/assets/languages/springboot-gradle.svg',
//                                                                typescript: '/assets/languages/typescript.svg',
//                                                                vite: '/assets/languages/vite.svg',
//                                                                vuejs: '/assets/languages/vuejs.svg',
//                                                                unknown: '/assets/languages/unknown.svg',
//                                                            };
//
//                                                            const runtimeIcon = runtimeIconMap[runtime];
//                                                            const statusInfo = getStatusStyle(app.status);
//                                                            //const statusKey = app.status?.toLowerCase?.() || "unknown";
//                                                            const uniqueKey = `${key}-${app.ID || index}`;
//
//                                                            return (
//                                                                <li key={uniqueKey} className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700!">
//                                                                    <div className="flex items-center gap-2.5">
//                                                                        <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                                                            <img
//                                                                                alt={runtime}
//                                                                                src={runtimeIcon}
//                                                                                width={26}
//                                                                                height={26}
//                                                                                className="overflow-hidden rounded-sm"
//                                                                            />
//                                                                        </div>
//                                                                        <div className="flex flex-col gap-0.5 truncate">
//                                                                            <p className="font-semibold text-sm/[1.2]">{app.name || runtime.name}</p>
//                                                                            <span className="line-clamp-1 max-w-[85%] truncate text-secondary text-xs/[1.25]">{app.ID}</span>
//                                                                        </div>
//                                                                    </div>
//
//                                                                    <div className="flex w-full items-end justify-between gap-2">
//                                                                        <div className="flex max-w-full flex-wrap gap-2 truncate">
//                                                                            <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-700! focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                                    <path d="M208,48H176V32a8,8,0,0,0-16,0V48H96V32a8,8,0,0,0-16,0V48H48A16,16,0,0,0,32,64V192a16,16,0,0,0,16,16H80v16a8,8,0,0,0,16,0V208h64v16a8,8,0,0,0,16,0V208h32a16,16,0,0,0,16-16V64A16,16,0,0,0,208,48ZM160,144a16,16,0,1,1-16-16A16,16,0,0,1,160,144Z" />
//                                                                                </svg>
//                                                                                {app.cpu || '0%'}
//                                                                            </span>
//                                                                            {(() => {
//                                                                                const usage = app.ramUsage || 0;          // uso atual em MB
//                                                                                const limit = app.memoryLimit || 256;     // limite do plano em MB
//                                                                                const percent = Math.round((usage / limit) * 100);
//
//                                                                                return (
//                                                                                    <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                                            <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z" />
//                                                                                        </svg>
//                                                                                        {percent}% usado
//                                                                                    </span>
//                                                                                );
//                                                                            })()}
//                                                                        </div>
//                                                                        <span className={`font-semibold transition-all h-5 rounded-sm px-2 text-[10px]/5 flex items-center gap-1.5 uppercase text-${statusInfo.color} bg-gradient-to-br ${statusInfo.gradient}`}>
//                                                                            <span className={`relative block size-2.5 rounded-full bg-${statusInfo.color}`}>
//                                                                                {statusInfo.animate && <span className="absolute size-2.5 rounded-full bg-inherit animate-ping" />}
//                                                                            </span>
//                                                                            {statusInfo.label}
//                                                                        </span>
//                                                                    </div>
//
//                                                                    <div
//                                                                        className="absolute inset-0 z-0 cursor-pointer"
//                                                                        onClick={() => router.push(`/${lang}/dashboard/applications/${app.ID}`)}
//                                                                    />
//                                                                    <div className="absolute top-4 right-4 flex gap-2">
//                                                                        <button
//                                                                            type="button"
//                                                                            aria-haspopup="dialog"
//                                                                            aria-expanded="false"
//                                                                            aria-controls="radix-_r_8_"
//                                                                            data-state="closed"
//                                                                            data-slot="dialog-trigger"
//                                                                            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//                                                                        >
//                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
//                                                                                <path d="M120,137,48,201A12,12,0,1,1,32,183l61.91-55L32,73A12,12,0,1,1,48,55l72,64A12,12,0,0,1,120,137Zm96,43H120a12,12,0,0,0,0,24h96a12,12,0,0,0,0-24Z" />
//                                                                            </svg>
//                                                                        </button>
//                                                                        <AppDropdownMenu app={app} onAction={handleAction} />
//                                                                    </div>
//                                                                </li>
//                                                            );
//                                                        })
//                                                    )}
//                                            </ul>
//                                        </div>
//
//                                        {/* Paginação e contador */}
//                                        <div className="space-y-2">
//                                            <div className="flex justify-between gap-4">
//                                                <button
//                                                    disabled
//                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                                >
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                                    </svg>
//                                                    <span className="hidden md:block">Anterior</span>
//                                                </button>
//
//                                                <div className="flex flex-col items-center">
//                                                    <div className="flex justify-center gap-x-1.5">
//                                                        <button className="inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                            1
//                                                        </button>
//                                                    </div>
//                                                </div>
//
//                                                <button
//                                                    disabled
//                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                                >
//                                                    <span className="hidden md:block">Próximo</span>
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                                    </svg>
//                                                </button>
//                                            </div>
//
//                                            <div className="text-right">
//                                                <span className="text-muted text-xs">
//                                                    Total de {totalApps} aplicação{totalApps !== 1 ? 's' : ''}, {onlineApps} estão online e {offlineApps} estão offline.
//                                                </span>
//                                            </div>
//                                        </div>
//                                    </div>
//                                </>
//                            )}
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div >
//            <Footer />
//        </>
//    );
//}

//frontend/src/app/[lang]/dashboard/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import PlanModal from '@/components/modals/PlanModal'
//import { PlanBadge } from '@/components/PlanBadge';
//import { getPlanTier } from '@/utils/planUtils';
////import { planOrder } from '@/utils/planUtils';
//import '../../styles/virtus.css';
//import { AppDropdownMenu } from '@/components/AppDropdownMenu';
//import { handleAction } from '@/utils/appActions';
//import PlanActionButton from '@/components/PlanActionButton';
//import PermissionNewApp from '@/components/buttons/PermissionNewApp';
//
////import NewApplicationButton from '@/components/buttons/NewApplicationButton';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//function getStatusStyle(status = '') {
//    const key = status.toLowerCase();
//    if (key === 'running' || key === 'online') {
//        return {
//            label: 'ONLINE',
//            color: 'green-500',
//            gradient: 'from-green-400/20 to-green-700/20',
//            animate: true
//        };
//    }
//    if (key === 'stopped' || key === 'offline') {
//        return {
//            label: 'OFFLINE',
//            color: 'red-500',
//            gradient: 'from-red-400/20 to-red-700/20',
//            animate: false
//        };
//    }
//    return {
//        label: 'DESCONHECIDO',
//        color: 'gray-500',
//        gradient: 'from-gray-400/20 to-gray-700/20',
//        animate: false
//    };
//}
//
////function shouldShowUpgrade(plan) {
////    return ['no-plan', 'test', 'basic'].includes(plan);
////}
//
//function isPersonalPlan(plan) {
//    return ['test', 'basic'].includes(plan);
//}
//
//function isNoPlan(plan) {
//    return plan === 'no-plan';
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    const lang = supported.includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'en';
//    //const lang = getLang(pathname);
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const tier = getPlanTier(plan);
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);
//    const [totalMB, setTotalMB] = useState(2048);
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const [showPlanModal, setShowPlanModal] = useState(false);
//    const [search, setSearch] = useState('');
//    const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//    const totalApps =
//        appsByStatus.active.length +
//        appsByStatus.stopped.length +
//        appsByStatus.backups.length;
//
//    const onlineApps = appsByStatus.active.length;
//    const offlineApps = appsByStatus.stopped.length;
//    const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
//
//    //const handleClick = () => {
//    //    router.push(`/${lang}/upload`);
//    //};
//
//    //const runtime = getRuntimeInfo(app.Image); // ou app.image, dependendo da estrutura
//    //const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//    useEffect(() => {
//        if (isPersonalPlan(plan)) {
//            setShowUpgradeBanner(true);
//        } else {
//            setShowUpgradeBanner(false); // garante que o banner suma se o plano mudar
//        }
//    }, [plan]);
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan((data.plan || 'no-plan').trim().toLowerCase());
//            console.log('Plano recebido:', data.plan);
//            setCanDeploy(data.canDeploy);
//            setUsedMB(data.usedMB || 0);
//            setTotalMB(data.totalMB || 2048);
//        };
//
//        checkSession().then(fetchUserStatus);
//        const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//        return () => clearInterval(interval);
//    }, []);
//
//    useEffect(() => {
//        const fetchAppsByStatus = async () => {
//            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//            const data = await res.json();
//
//            const removeDuplicates = (apps) => {
//                if (!Array.isArray(apps)) return [];
//                const seen = new Set();
//                return apps.filter(app => {
//                    const key = app.ID || app.ContainerName;
//                    if (seen.has(key)) return false;
//                    seen.add(key);
//                    return true;
//                });
//            };
//
//            setAppsByStatus({
//                active: removeDuplicates(data.active),
//                stopped: removeDuplicates(data.stopped),
//                backups: removeDuplicates(data.backups),
//            });
//        };
//
//        fetchAppsByStatus(); // primeira chamada imediata
//        const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//
//        return () => clearInterval(interval); // limpa ao desmontar
//    }, []);
//
//    const [isLoading, setIsLoading] = useState(true);
//    useEffect(() => {
//        // Simula carregamento inicial
//        const timer = setTimeout(() => setIsLoading(false), 2000);
//        return () => clearTimeout(timer);
//    }, []);
//
//    if (loading) return null;
//
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            {isLoading ? (
//                                                <>
//                                                    <div className="h-5 w-32 rounded bg-virtus-600 animate-pulse" />
//                                                    <div className="h-5 w-20 rounded bg-blue-600/50 animate-pulse" />
//                                                </>
//                                            ) : (
//                                                <>
//                                                    <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">
//                                                        Sua conta
//                                                    </span>
//                                                </>
//                                            )}
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span
//                                        className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md"
//                                    >
//                                        <PlanBadge plan={plan} tier={tier} />
//                                    </span>
//
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">1.280 MB</span>
//                                                <span className="text-nowrap text-muted text-xs">768 MB disponível de 2.048 MB</span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div
//                                                    className="absolute inset-0 h-full rounded-full"
//                                                    style={{ backgroundColor: 'rgb(229, 212, 93)', width: '62.5%' }}
//                                                />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    {plan !== 'no-plan' ? (
//                                        <>
//                                            {/* Botão Renovar */}
//                                            <button
//                                                className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1"
//                                                role="button"
//                                            >
//                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                                    <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                                </svg>
//                                                Renovar
//                                            </button>
//
//                                            {/* Botão Upgrade */}
//                                            <PlanActionButton
//                                                plan={plan}
//                                                setShowPlanModal={setShowPlanModal}
//                                                setShowUpgradeModal={setShowUpgradeModal}
//                                            />
//                                        </>
//                                    ) : (
//                                        <div className="flex justify-end w-full">
//                                            <PlanActionButton
//                                                plan={plan}
//                                                setShowPlanModal={setShowPlanModal}
//                                                setShowUpgradeModal={setShowUpgradeModal}
//                                            />
//                                        </div>
//                                    )}
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        {showUpgradeBanner && (
//                            <div className="relative bg-background">
//                                <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                    <div className="flex items-center gap-2.5 md:gap-3.5">
//                                        <div className="flex size-5 items-center justify-center text-blue-500">
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                            </svg>
//                                        </div>
//                                        <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                    </div>
//
//                                    <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                        <span className="block w-full text-sm text-secondary">
//                                            Está pronto para transformar sua experiência? Com o{" "}
//                                            <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                                standard
//                                            </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                            <ul className="list-inside list-disc mt-1">
//                                                <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                                <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                                <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                            </ul>
//                                        </span>
//
//                                        <button
//                                            onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                            className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                        >
//                                            Fazer upgrade
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                            </svg>
//                                        </button>
//                                    </div>
//
//                                    <button
//                                        onClick={() => setShowUpgradeBanner(false)}
//                                        className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//                            </div>
//                        )}
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            {/* Barra de busca e botões */}
//                            <div className="flex flex-col gap-2 md:flex-row">
//                                <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                    <input
//                                        value={search}
//                                        onChange={(e) => setSearch(e.target.value)}
//                                        placeholder="Pesquisar em aplicações..."
//                                        className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                                    />
//                                    <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                        </svg>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-wrap gap-2">
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-background shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                        </svg>
//                                        Organizar
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    <PermissionNewApp plan={plan} lang={lang} setShowPlanModal={setShowPlanModal} />
//                                    {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
//
//                                </div>
//                            </div>
//
//                            {/* Grid de aplicações */}
//                            {plan === 'no-plan' ? (
//                                <>
//                                    {/* Tela de obtenção de plano */}
//                                    <div className="flex flex-1 flex-col min-h-[calc(100dvh-80px)] bg-blue-950">
//                                        <div className="flex h-full flex-1 items-center justify-center rounded-md border border-blue-700 bg-gradient-to-b from-blue-700/25 to-blue-950">
//                                            <div className="flex flex-col gap-4 text-center">
//                                                <div className="mx-auto rounded-xl border border-blue-700/25 bg-blue-700/10 p-4">
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.4,16.4,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//                                                    </svg>
//                                                </div>
//                                                <div className="space-y-1">
//                                                    <h1 className="font-bold text-2xl">Obtenha um plano para suas aplicações</h1>
//                                                    <p className="max-w-md text-secondary-foreground text-sm">
//                                                        Escolha um plano para atender às suas necessidades e comece a desenvolver com uma infraestrutura otimizada para produção.
//                                                    </p>
//                                                </div>
//                                                <button
//                                                    role="button"
//                                                    onClick={() => setShowPlanModal(true)}
//                                                    className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
//                                                >
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M208,144a15.78,15.78,0,0,1-10.42,14.94L146,178l-19,51.62a15.92,15.92,0,0,1-29.88,0L78,178l-51.62-19a15.92,15.92,0,0,1,0-29.88L78,110l19-51.62a15.92,15.92,0,0,1,29.88,0L146,110l51.62,19A15.78,15.78,0,0,1,208,144ZM152,48h16V64a8,8,0,0,0,16,0V48h16a8,8,0,0,0,0-16H184V16a8,8,0,0,0-16,0V32H152a8,8,0,0,0,0,16Zm88,32h-8V72a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0V96h8a8,8,0,0,0,0-16Z" />
//                                                    </svg>
//                                                    Obter um plano
//                                                    <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-[25deg] animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//                                                </button>
//                                                {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
//                                            </div>
//                                        </div>
//                                    </div>
//                                </>
//                            ) : (
//                                <>
//                                    {/* Grid de aplicações */}
//                                    <div className="flex min-h-[752px] flex-col gap-4 lg:h-[calc(100dvh-300px)]">
//                                        <div className="flex min-h-0 flex-1 flex-col">
//                                            <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                                {isLoading
//                                                    ? Array.from({ length: 6 }).map((_, i) => (
//                                                        <li
//                                                            key={`skeleton-${i}`}
//                                                            className="animate-pulse flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-700/50 p-4"
//                                                        >
//                                                            <div className="flex items-center gap-2.5">
//                                                                <div className="shrink-0 rounded-sm bg-virtus-900 p-1.5">
//                                                                    <div className="size-[26px] rounded-sm bg-virtus-600" />
//                                                                </div>
//                                                                <div className="flex flex-col gap-1 truncate w-full">
//                                                                    <div className="h-4 w-3/4 rounded bg-virtus-600" />
//                                                                    <div className="h-3 w-1/2 rounded bg-virtus-600" />
//                                                                </div>
//                                                            </div>
//
//                                                            <div className="flex justify-between items-end mt-4">
//                                                                <div className="flex gap-2">
//                                                                    <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                                    <div className="h-5 w-20 rounded bg-virtus-600" />
//                                                                </div>
//                                                                <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                            </div>
//                                                        </li>
//                                                    ))
//                                                    : Object.entries(appsByStatus).map(([key, apps]) =>
//                                                        apps.map((app, index) => {
//
//                                                            const runtime = app.runtime || 'unknown';
//
//                                                            const runtimeIconMap = {
//                                                                angular: '/assets/languages/angular.svg',
//                                                                csharp: '/assets/languages/csharp.svg',
//                                                                django: '/assets/languages/django.svg',
//                                                                dotnet: '/assets/languages/dotnet.svg',
//                                                                dotnetcore: '/assets/languages/dotnetcore.svg',
//                                                                elixir: '/assets/languages/elixir.svg',
//                                                                go: '/assets/languages/go.svg',
//                                                                golang: '/assets/languages/go.svg',
//                                                                java: '/assets/languages/java.svg',
//                                                                javascript: '/assets/languages/javascript.svg',
//                                                                kotlin: '/assets/languages/kotlin.svg',
//                                                                laravel: '/assets/languages/laravel.svg',
//                                                                lua: '/assets/languages/lua.svg',
//                                                                nestjs: '/assets/languages/nestjs.svg',
//                                                                nextjs: '/assets/languages/nextjs.svg',
//                                                                node: '/assets/languages/node.svg',
//                                                                nuxtjs: '/assets/languages/nuxtjs.svg',
//                                                                php: '/assets/languages/php.svg',
//                                                                python: '/assets/languages/python.svg',
//                                                                react: '/assets/languages/react.svg',
//                                                                rust: '/assets/languages/rust.svg',
//                                                                springboot: '/assets/languages/springboot.svg',
//                                                                'springboot-gradle': '/assets/languages/springboot-gradle.svg',
//                                                                typescript: '/assets/languages/typescript.svg',
//                                                                vite: '/assets/languages/vite.svg',
//                                                                vuejs: '/assets/languages/vuejs.svg',
//                                                                unknown: '/assets/languages/unknown.svg',
//                                                            };
//
//                                                            const runtimeIcon = runtimeIconMap[runtime];
//                                                            const statusInfo = getStatusStyle(app.status);
//                                                            //const statusKey = app.status?.toLowerCase?.() || "unknown";
//                                                            const uniqueKey = `${key}-${app.ID || index}`;
//
//                                                            return (
//                                                                <li key={uniqueKey} className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700!">
//                                                                    <div className="flex items-center gap-2.5">
//                                                                        <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                                                            <img
//                                                                                alt={runtime}
//                                                                                src={runtimeIcon}
//                                                                                width={26}
//                                                                                height={26}
//                                                                                className="overflow-hidden rounded-sm"
//                                                                            />
//                                                                        </div>
//                                                                        <div className="flex flex-col gap-0.5 truncate">
//                                                                            <p className="font-semibold text-sm/[1.2]">{app.name || runtime.name}</p>
//                                                                            <span className="line-clamp-1 max-w-[85%] truncate text-secondary text-xs/[1.25]">{app.ID}</span>
//                                                                        </div>
//                                                                    </div>
//
//                                                                    <div className="flex w-full items-end justify-between gap-2">
//                                                                        <div className="flex max-w-full flex-wrap gap-2 truncate">
//                                                                            <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-700! focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                                    <path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Z" />
//                                                                                </svg>
//                                                                                {app.cpu || '0%'}
//                                                                            </span>
//                                                                            <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                                    <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z" />
//                                                                                </svg>
//                                                                                {app.memory || '256 MB'}
//                                                                            </span>
//                                                                        </div>
//                                                                        <span className={`font-semibold transition-all h-5 rounded-sm px-2 text-[10px]/5 flex items-center gap-1.5 uppercase text-${statusInfo.color} bg-gradient-to-br ${statusInfo.gradient}`}>
//                                                                            <span className={`relative block size-2.5 rounded-full bg-${statusInfo.color}`}>
//                                                                                {statusInfo.animate && <span className="absolute size-2.5 rounded-full bg-inherit animate-ping" />}
//                                                                            </span>
//                                                                            {statusInfo.label}
//                                                                        </span>
//                                                                    </div>
//
//                                                                    <div
//                                                                        className="absolute inset-0 z-0 cursor-pointer"
//                                                                        onClick={() => router.push(`/${lang}/dashboard/applications/${app.ID}`)}
//                                                                    />
//                                                                    <div className="absolute top-4 right-4 flex gap-2">
//                                                                        <button
//                                                                            type="button"
//                                                                            aria-haspopup="dialog"
//                                                                            aria-expanded="false"
//                                                                            aria-controls="radix-_r_8_"
//                                                                            data-state="closed"
//                                                                            data-slot="dialog-trigger"
//                                                                            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//                                                                        >
//                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
//                                                                                <path d="M120,137,48,201A12,12,0,1,1,32,183l61.91-55L32,73A12,12,0,1,1,48,55l72,64A12,12,0,0,1,120,137Zm96,43H120a12,12,0,0,0,0,24h96a12,12,0,0,0,0-24Z" />
//                                                                            </svg>
//                                                                        </button>
//                                                                        <AppDropdownMenu app={app} onAction={handleAction} />
//                                                                    </div>
//                                                                </li>
//                                                            );
//                                                        })
//                                                    )}
//                                            </ul>
//                                        </div>
//
//                                        {/* Paginação e contador */}
//                                        <div className="space-y-2">
//                                            <div className="flex justify-between gap-4">
//                                                <button
//                                                    disabled
//                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                                >
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                                    </svg>
//                                                    <span className="hidden md:block">Anterior</span>
//                                                </button>
//
//                                                <div className="flex flex-col items-center">
//                                                    <div className="flex justify-center gap-x-1.5">
//                                                        <button className="inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                            1
//                                                        </button>
//                                                    </div>
//                                                </div>
//
//                                                <button
//                                                    disabled
//                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                                >
//                                                    <span className="hidden md:block">Próximo</span>
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                                    </svg>
//                                                </button>
//                                            </div>
//
//                                            <div className="text-right">
//                                                <span className="text-muted text-xs">
//                                                    Total de {totalApps} aplicação{totalApps !== 1 ? 's' : ''}, {onlineApps} estão online e {offlineApps} estão offline.
//                                                </span>
//                                            </div>
//                                        </div>
//                                    </div>
//                                </>
//                            )}
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div >
//            <Footer />
//        </>
//    );
//}


//frontend/src/app/[lang]/dashboard/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import PlanModal from '@/components/modals/PlanModal'
//import { PlanBadge } from '@/components/PlanBadge';
//import { getPlanTier } from '@/utils/planUtils';
////import { planOrder } from '@/utils/planUtils';
//import '../../styles/virtus.css';
//import { AppDropdownMenu } from '@/components/AppDropdownMenu';
//import { handleAction } from '@/utils/appActions';
////import NewApplicationButton from '@/components/buttons/NewApplicationButton';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//function getStatusStyle(status = '') {
//    const key = status.toLowerCase();
//    if (key === 'running' || key === 'online') {
//        return {
//            label: 'ONLINE',
//            color: 'green-500',
//            gradient: 'from-green-400/20 to-green-700/20',
//            animate: true
//        };
//    }
//    if (key === 'stopped' || key === 'offline') {
//        return {
//            label: 'OFFLINE',
//            color: 'red-500',
//            gradient: 'from-red-400/20 to-red-700/20',
//            animate: false
//        };
//    }
//    return {
//        label: 'DESCONHECIDO',
//        color: 'gray-500',
//        gradient: 'from-gray-400/20 to-gray-700/20',
//        animate: false
//    };
//}
//
////function shouldShowUpgrade(plan) {
////    return ['no-plan', 'test', 'basic'].includes(plan);
////}
//
//function isPersonalPlan(plan) {
//    return ['test', 'basic'].includes(plan);
//}
//
//function isNoPlan(plan) {
//    return plan === 'no-plan';
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    const lang = supported.includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'en';
//    //const lang = getLang(pathname);
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const tier = getPlanTier(plan);
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);
//    const [totalMB, setTotalMB] = useState(2048);
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const [showPlanModal, setShowPlanModal] = useState(false);
//    const [search, setSearch] = useState('');
//    const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//    const totalApps =
//        appsByStatus.active.length +
//        appsByStatus.stopped.length +
//        appsByStatus.backups.length;
//
//    const onlineApps = appsByStatus.active.length;
//    const offlineApps = appsByStatus.stopped.length;
//    const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
//
//    const handleClick = () => {
//        router.push(`/${lang}/upload`);
//    };
//
//    //const runtime = getRuntimeInfo(app.Image); // ou app.image, dependendo da estrutura
//    //const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//    useEffect(() => {
//        if (isPersonalPlan(plan)) {
//            setShowUpgradeBanner(true);
//        } else {
//            setShowUpgradeBanner(false); // garante que o banner suma se o plano mudar
//        }
//    }, [plan]);
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan((data.plan || 'no-plan').trim().toLowerCase());
//            console.log('Plano recebido:', data.plan);
//            setCanDeploy(data.canDeploy);
//            setUsedMB(data.usedMB || 0);
//            setTotalMB(data.totalMB || 2048);
//        };
//
//        checkSession().then(fetchUserStatus);
//        const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//        return () => clearInterval(interval);
//    }, []);
//
//    useEffect(() => {
//        const fetchAppsByStatus = async () => {
//            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//            const data = await res.json();
//
//            const removeDuplicates = (apps) => {
//                if (!Array.isArray(apps)) return [];
//                const seen = new Set();
//                return apps.filter(app => {
//                    const key = app.ID || app.ContainerName;
//                    if (seen.has(key)) return false;
//                    seen.add(key);
//                    return true;
//                });
//            };
//
//            setAppsByStatus({
//                active: removeDuplicates(data.active),
//                stopped: removeDuplicates(data.stopped),
//                backups: removeDuplicates(data.backups),
//            });
//        };
//
//        fetchAppsByStatus(); // primeira chamada imediata
//        const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//
//        return () => clearInterval(interval); // limpa ao desmontar
//    }, []);
//
//    const [isLoading, setIsLoading] = useState(true);
//    useEffect(() => {
//        // Simula carregamento inicial
//        const timer = setTimeout(() => setIsLoading(false), 2000);
//        return () => clearTimeout(timer);
//    }, []);
//
//    if (loading) return null;
//
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            {isLoading ? (
//                                                <>
//                                                    <div className="h-5 w-32 rounded bg-virtus-600 animate-pulse" />
//                                                    <div className="h-5 w-20 rounded bg-blue-600/50 animate-pulse" />
//                                                </>
//                                            ) : (
//                                                <>
//                                                    <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">
//                                                        Sua conta
//                                                    </span>
//                                                </>
//                                            )}
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span
//                                        className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md"
//                                    >
//                                        <PlanBadge plan={plan} tier={tier} />
//                                    </span>
//
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">1.280 MB</span>
//                                                <span className="text-nowrap text-muted text-xs">768 MB disponível de 2.048 MB</span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div
//                                                    className="absolute inset-0 h-full rounded-full"
//                                                    style={{ backgroundColor: 'rgb(229, 212, 93)', width: '62.5%' }}
//                                                />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    <button
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                            <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                        </svg>
//                                        Renovar
//                                    </button>
//
//                                    <button
//                                        onClick={() => setShowUpgradeModal(true)}
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1 border-virtus-500 bg-transparent"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-600">
//                                            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//                                        </svg>
//                                        Upgrade
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        {showUpgradeBanner && (
//                            <div className="relative bg-background">
//                                <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                    <div className="flex items-center gap-2.5 md:gap-3.5">
//                                        <div className="flex size-5 items-center justify-center text-blue-500">
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                            </svg>
//                                        </div>
//                                        <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                    </div>
//
//                                    <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                        <span className="block w-full text-sm text-secondary">
//                                            Está pronto para transformar sua experiência? Com o{" "}
//                                            <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                                standard
//                                            </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                            <ul className="list-inside list-disc mt-1">
//                                                <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                                <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                                <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                            </ul>
//                                        </span>
//
//                                        <button
//                                            onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                            className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                        >
//                                            Fazer upgrade
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                            </svg>
//                                        </button>
//                                    </div>
//
//                                    <button
//                                        onClick={() => setShowUpgradeBanner(false)}
//                                        className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//                            </div>
//                        )}
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            {/* Barra de busca e botões */}
//                            <div className="flex flex-col gap-2 md:flex-row">
//                                <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                    <input
//                                        value={search}
//                                        onChange={(e) => setSearch(e.target.value)}
//                                        placeholder="Pesquisar em aplicações..."
//                                        className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                                    />
//                                    <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                        </svg>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-wrap gap-2">
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-background shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                        </svg>
//                                        Organizar
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    <button
//                                        onClick={handleClick}
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 w-52 flex-auto"
//                                        role="button"
//                                    >
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="16"
//                                            height="16"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                        >
//                                            <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
//                                        </svg>
//                                        Nova aplicação
//                                        <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]"></div>
//                                    </button>
//
//                                </div>
//                            </div>
//
//                            {/* Grid de aplicações */}
//                            {plan === 'no-plan' ? (
//                                <>
//                                    {/* Tela de obtenção de plano */}
//                                    <div className="flex flex-1 flex-col min-h-[calc(100dvh-80px)] bg-blue-950">
//                                        <div className="flex h-full flex-1 items-center justify-center rounded-md border border-blue-700 bg-gradient-to-b from-blue-700/25 to-blue-950">
//                                            <div className="flex flex-col gap-4 text-center">
//                                                <div className="mx-auto rounded-xl border border-blue-700/25 bg-blue-700/10 p-4">
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.4,16.4,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//                                                    </svg>
//                                                </div>
//                                                <div className="space-y-1">
//                                                    <h1 className="font-bold text-2xl">Obtenha um plano para suas aplicações</h1>
//                                                    <p className="max-w-md text-secondary-foreground text-sm">
//                                                        Escolha um plano para atender às suas necessidades e comece a desenvolver com uma infraestrutura otimizada para produção.
//                                                    </p>
//                                                </div>
//                                                <button
//                                                    role="button"
//                                                    onClick={() => setShowPlanModal(true)}
//                                                    className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
//                                                >
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M208,144a15.78,15.78,0,0,1-10.42,14.94L146,178l-19,51.62a15.92,15.92,0,0,1-29.88,0L78,178l-51.62-19a15.92,15.92,0,0,1,0-29.88L78,110l19-51.62a15.92,15.92,0,0,1,29.88,0L146,110l51.62,19A15.78,15.78,0,0,1,208,144ZM152,48h16V64a8,8,0,0,0,16,0V48h16a8,8,0,0,0,0-16H184V16a8,8,0,0,0-16,0V32H152a8,8,0,0,0,0,16Zm88,32h-8V72a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0V96h8a8,8,0,0,0,0-16Z" />
//                                                    </svg>
//                                                    Obter um plano
//                                                    <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-[25deg] animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//                                                </button>
//                                                {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
//                                            </div>
//                                        </div>
//                                    </div>
//                                </>
//                            ) : (
//                                <>
//                                    {/* Grid de aplicações */}
//                                    <div className="flex min-h-[752px] flex-col gap-4 lg:h-[calc(100dvh-300px)]">
//                                        <div className="flex min-h-0 flex-1 flex-col">
//                                            <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                                {isLoading
//                                                    ? Array.from({ length: 6 }).map((_, i) => (
//                                                        <li
//                                                            key={`skeleton-${i}`}
//                                                            className="animate-pulse flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-700/50 p-4"
//                                                        >
//                                                            <div className="flex items-center gap-2.5">
//                                                                <div className="shrink-0 rounded-sm bg-virtus-900 p-1.5">
//                                                                    <div className="size-[26px] rounded-sm bg-virtus-600" />
//                                                                </div>
//                                                                <div className="flex flex-col gap-1 truncate w-full">
//                                                                    <div className="h-4 w-3/4 rounded bg-virtus-600" />
//                                                                    <div className="h-3 w-1/2 rounded bg-virtus-600" />
//                                                                </div>
//                                                            </div>
//
//                                                            <div className="flex justify-between items-end mt-4">
//                                                                <div className="flex gap-2">
//                                                                    <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                                    <div className="h-5 w-20 rounded bg-virtus-600" />
//                                                                </div>
//                                                                <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                            </div>
//                                                        </li>
//                                                    ))
//                                                    : Object.entries(appsByStatus).map(([key, apps]) =>
//                                                        apps.map((app, index) => {
//
//                                                            const runtime = app.runtime || 'unknown';
//
//                                                            const runtimeIconMap = {
//                                                                angular: '/assets/languages/angular.svg',
//                                                                csharp: '/assets/languages/csharp.svg',
//                                                                django: '/assets/languages/django.svg',
//                                                                dotnet: '/assets/languages/dotnet.svg',
//                                                                dotnetcore: '/assets/languages/dotnetcore.svg',
//                                                                elixir: '/assets/languages/elixir.svg',
//                                                                go: '/assets/languages/go.svg',
//                                                                golang: '/assets/languages/go.svg',
//                                                                java: '/assets/languages/java.svg',
//                                                                javascript: '/assets/languages/javascript.svg',
//                                                                kotlin: '/assets/languages/kotlin.svg',
//                                                                laravel: '/assets/languages/laravel.svg',
//                                                                lua: '/assets/languages/lua.svg',
//                                                                nestjs: '/assets/languages/nestjs.svg',
//                                                                nextjs: '/assets/languages/nextjs.svg',
//                                                                node: '/assets/languages/node.svg',
//                                                                nuxtjs: '/assets/languages/nuxtjs.svg',
//                                                                php: '/assets/languages/php.svg',
//                                                                python: '/assets/languages/python.svg',
//                                                                react: '/assets/languages/react.svg',
//                                                                rust: '/assets/languages/rust.svg',
//                                                                springboot: '/assets/languages/springboot.svg',
//                                                                'springboot-gradle': '/assets/languages/springboot-gradle.svg',
//                                                                typescript: '/assets/languages/typescript.svg',
//                                                                vite: '/assets/languages/vite.svg',
//                                                                vuejs: '/assets/languages/vuejs.svg',
//                                                                unknown: '/assets/languages/unknown.svg',
//                                                            };
//
//                                                            const runtimeIcon = runtimeIconMap[runtime];
//                                                            const statusInfo = getStatusStyle(app.status);
//                                                            //const statusKey = app.status?.toLowerCase?.() || "unknown";
//                                                            const uniqueKey = `${key}-${app.ID || index}`;
//
//                                                            return (
//                                                                <li key={uniqueKey} className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700!">
//                                                                    <div className="flex items-center gap-2.5">
//                                                                        <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                                                            <img
//                                                                                alt={runtime}
//                                                                                src={runtimeIcon}
//                                                                                width={26}
//                                                                                height={26}
//                                                                                className="overflow-hidden rounded-sm"
//                                                                            />
//                                                                        </div>
//                                                                        <div className="flex flex-col gap-0.5 truncate">
//                                                                            <p className="font-semibold text-sm/[1.2]">{app.name || runtime.name}</p>
//                                                                            <span className="line-clamp-1 max-w-[85%] truncate text-secondary text-xs/[1.25]">{app.ID}</span>
//                                                                        </div>
//                                                                    </div>
//
//                                                                    <div className="flex w-full items-end justify-between gap-2">
//                                                                        <div className="flex max-w-full flex-wrap gap-2 truncate">
//                                                                            <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-700! focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                                    <path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Z" />
//                                                                                </svg>
//                                                                                {app.cpu || '0%'}
//                                                                            </span>
//                                                                            <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                                    <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z" />
//                                                                                </svg>
//                                                                                {app.memory || '256 MB'}
//                                                                            </span>
//                                                                        </div>
//                                                                        <span className={`font-semibold transition-all h-5 rounded-sm px-2 text-[10px]/5 flex items-center gap-1.5 uppercase text-${statusInfo.color} bg-gradient-to-br ${statusInfo.gradient}`}>
//                                                                            <span className={`relative block size-2.5 rounded-full bg-${statusInfo.color}`}>
//                                                                                {statusInfo.animate && <span className="absolute size-2.5 rounded-full bg-inherit animate-ping" />}
//                                                                            </span>
//                                                                            {statusInfo.label}
//                                                                        </span>
//                                                                    </div>
//
//                                                                    <div
//                                                                        className="absolute inset-0 z-0 cursor-pointer"
//                                                                        onClick={() => router.push(`/${lang}/dashboard/applications/${app.ID}`)}
//                                                                    />
//                                                                    <div className="absolute top-4 right-4 flex gap-2">
//                                                                        <button
//                                                                            type="button"
//                                                                            aria-haspopup="dialog"
//                                                                            aria-expanded="false"
//                                                                            aria-controls="radix-_r_8_"
//                                                                            data-state="closed"
//                                                                            data-slot="dialog-trigger"
//                                                                            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//                                                                        >
//                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
//                                                                                <path d="M120,137,48,201A12,12,0,1,1,32,183l61.91-55L32,73A12,12,0,1,1,48,55l72,64A12,12,0,0,1,120,137Zm96,43H120a12,12,0,0,0,0,24h96a12,12,0,0,0,0-24Z" />
//                                                                            </svg>
//                                                                        </button>
//                                                                        <AppDropdownMenu app={app} onAction={handleAction} />
//                                                                    </div>
//                                                                </li>
//                                                            );
//                                                        })
//                                                    )}
//                                            </ul>
//                                        </div>
//
//                                        {/* Paginação e contador */}
//                                        <div className="space-y-2">
//                                            <div className="flex justify-between gap-4">
//                                                <button
//                                                    disabled
//                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                                >
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                                    </svg>
//                                                    <span className="hidden md:block">Anterior</span>
//                                                </button>
//
//                                                <div className="flex flex-col items-center">
//                                                    <div className="flex justify-center gap-x-1.5">
//                                                        <button className="inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                            1
//                                                        </button>
//                                                    </div>
//                                                </div>
//
//                                                <button
//                                                    disabled
//                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                                >
//                                                    <span className="hidden md:block">Próximo</span>
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                                    </svg>
//                                                </button>
//                                            </div>
//
//                                            <div className="text-right">
//                                                <span className="text-muted text-xs">
//                                                    Total de {totalApps} aplicação{totalApps !== 1 ? 's' : ''}, {onlineApps} estão online e {offlineApps} estão offline.
//                                                </span>
//                                            </div>
//                                        </div>
//                                    </div>
//                                </>
//                            )}
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div >
//            <Footer />
//        </>
//    );
//}

//frontend/src/app/[lang]/dashboard/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import PlanModal from '@/components/modals/PlanModal'
//import { PlanBadge } from '@/components/PlanBadge';
//import { getPlanTier } from '@/utils/planUtils';
////import { planOrder } from '@/utils/planUtils';
//import '../../styles/virtus.css';
//import { AppDropdownMenu } from '@/components/AppDropdownMenu';
//import { handleAction } from '@/utils/appActions';
////import NewApplicationButton from '@/components/buttons/NewApplicationButton';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//function getStatusStyle(status = '') {
//    const key = status.toLowerCase();
//    if (key === 'running' || key === 'online') {
//        return {
//            label: 'ONLINE',
//            color: 'green-500',
//            gradient: 'from-green-400/20 to-green-700/20',
//            animate: true
//        };
//    }
//    if (key === 'stopped' || key === 'offline') {
//        return {
//            label: 'OFFLINE',
//            color: 'red-500',
//            gradient: 'from-red-400/20 to-red-700/20',
//            animate: false
//        };
//    }
//    return {
//        label: 'DESCONHECIDO',
//        color: 'gray-500',
//        gradient: 'from-gray-400/20 to-gray-700/20',
//        animate: false
//    };
//}
//
////function shouldShowUpgrade(plan) {
////    return ['no-plan', 'test', 'basic'].includes(plan);
////}
//
//function isPersonalPlan(plan) {
//    return ['test', 'basic'].includes(plan);
//}
//
//function isNoPlan(plan) {
//    return plan === 'no-plan';
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    const lang = supported.includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'en';
//    //const lang = getLang(pathname);
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const tier = getPlanTier(plan);
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);
//    const [totalMB, setTotalMB] = useState(2048);
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const [showPlanModal, setShowPlanModal] = useState(false);
//    const [search, setSearch] = useState('');
//    const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//    const totalApps =
//        appsByStatus.active.length +
//        appsByStatus.stopped.length +
//        appsByStatus.backups.length;
//
//    const onlineApps = appsByStatus.active.length;
//    const offlineApps = appsByStatus.stopped.length;
//    const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
//
//    const handleClick = () => {
//        router.push(`/${lang}/upload`);
//    };
//
//    //const runtime = getRuntimeInfo(app.Image); // ou app.image, dependendo da estrutura
//    //const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//    useEffect(() => {
//        if (isPersonalPlan(plan)) {
//            setShowUpgradeBanner(true);
//        } else {
//            setShowUpgradeBanner(false); // garante que o banner suma se o plano mudar
//        }
//    }, [plan]);
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan((data.plan || 'no-plan').trim().toLowerCase());
//            console.log('Plano recebido:', data.plan);
//            setCanDeploy(data.canDeploy);
//            setUsedMB(data.usedMB || 0);
//            setTotalMB(data.totalMB || 2048);
//        };
//
//        checkSession().then(fetchUserStatus);
//        const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//        return () => clearInterval(interval);
//    }, []);
//
//    useEffect(() => {
//        const fetchAppsByStatus = async () => {
//            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//            const data = await res.json();
//
//            const removeDuplicates = (apps) => {
//                if (!Array.isArray(apps)) return [];
//                const seen = new Set();
//                return apps.filter(app => {
//                    const key = app.ID || app.ContainerName;
//                    if (seen.has(key)) return false;
//                    seen.add(key);
//                    return true;
//                });
//            };
//
//            setAppsByStatus({
//                active: removeDuplicates(data.active),
//                stopped: removeDuplicates(data.stopped),
//                backups: removeDuplicates(data.backups),
//            });
//        };
//
//        fetchAppsByStatus(); // primeira chamada imediata
//        const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//
//        return () => clearInterval(interval); // limpa ao desmontar
//    }, []);
//
//    const [isLoading, setIsLoading] = useState(true);
//    useEffect(() => {
//        // Simula carregamento inicial
//        const timer = setTimeout(() => setIsLoading(false), 2000);
//        return () => clearTimeout(timer);
//    }, []);
//
//
//    //useEffect(() => {
//    //    const fetchAppsByStatus = async () => {
//    //        try {
//    //            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//    //            if (!res.ok) throw new Error(`HTTP ${res.status}`);
//    //            const data = await res.json();
//    //
//    //            const removeDuplicates = (apps) => {
//    //                if (!Array.isArray(apps)) return [];
//    //                const seen = new Set();
//    //                return apps.filter(app => {
//    //                    const key = app.ID || app.ContainerName;
//    //                    if (seen.has(key)) return false;
//    //                    seen.add(key);
//    //                    return true;
//    //                });
//    //            };
//    //
//    //            setAppsByStatus({
//    //                active: removeDuplicates(data.active),
//    //                stopped: removeDuplicates(data.stopped),
//    //                backups: removeDuplicates(data.backups),
//    //            });
//    //        } catch (err) {
//    //            console.error("Erro ao buscar apps:", err);
//    //            // opcional: mostrar fallback visual ou retry
//    //        }
//    //    };
//    //
//    //    fetchAppsByStatus(); // primeira chamada imediata
//    //    const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//    //
//    //    return () => clearInterval(interval); // limpa ao desmontar
//    //}, []);
//
//    //    useEffect(() => {
//    //        const fetchAppsByStatus = async () => {
//    //            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//    //            const data = await res.json();
//    //
//    //            const removeDuplicates = (apps) => {
//    //                if (!Array.isArray(apps)) return [];
//    //                const seen = new Set();
//    //                return apps.filter(app => {
//    //                    const key = app.ID || app.ContainerName;
//    //                    if (seen.has(key)) return false;
//    //                    seen.add(key);
//    //                    return true;
//    //                });
//    //            };
//    //
//    //            setAppsByStatus({
//    //                active: removeDuplicates(data.active),
//    //                stopped: removeDuplicates(data.stopped),
//    //                backups: removeDuplicates(data.backups),
//    //            });
//    //        };
//    //
//    //        fetchAppsByStatus();
//    //    }, []);
//
//    if (loading) return null;
//
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            {isLoading ? (
//                                                <>
//                                                    <div className="h-5 w-32 rounded bg-virtus-600 animate-pulse" />
//                                                    <div className="h-5 w-20 rounded bg-blue-600/50 animate-pulse" />
//                                                </>
//                                            ) : (
//                                                <>
//                                                    <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">
//                                                        Sua conta
//                                                    </span>
//                                                </>
//                                            )}
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span
//                                        className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md"
//                                    >
//                                        <PlanBadge plan={plan} tier={tier} />
//                                    </span>
//
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">1.280 MB</span>
//                                                <span className="text-nowrap text-muted text-xs">768 MB disponível de 2.048 MB</span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div
//                                                    className="absolute inset-0 h-full rounded-full"
//                                                    style={{ backgroundColor: 'rgb(229, 212, 93)', width: '62.5%' }}
//                                                />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    <button
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                            <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                        </svg>
//                                        Renovar
//                                    </button>
//
//                                    <button
//                                        onClick={() => setShowUpgradeModal(true)}
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1 border-virtus-500 bg-transparent"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-600">
//                                            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//                                        </svg>
//                                        Upgrade
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        {showUpgradeBanner && (
//                            <div className="relative bg-background">
//                                <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                    <div className="flex items-center gap-2.5 md:gap-3.5">
//                                        <div className="flex size-5 items-center justify-center text-blue-500">
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                            </svg>
//                                        </div>
//                                        <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                    </div>
//
//                                    <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                        <span className="block w-full text-sm text-secondary">
//                                            Está pronto para transformar sua experiência? Com o{" "}
//                                            <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                                standard
//                                            </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                            <ul className="list-inside list-disc mt-1">
//                                                <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                                <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                                <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                            </ul>
//                                        </span>
//
//                                        <button
//                                            onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                            className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                        >
//                                            Fazer upgrade
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                            </svg>
//                                        </button>
//                                    </div>
//
//                                    <button
//                                        onClick={() => setShowUpgradeBanner(false)}
//                                        className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//                            </div>
//                        )}
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            {/* Barra de busca e botões */}
//                            <div className="flex flex-col gap-2 md:flex-row">
//                                <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                    <input
//                                        value={search}
//                                        onChange={(e) => setSearch(e.target.value)}
//                                        placeholder="Pesquisar em aplicações..."
//                                        className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                                    />
//                                    <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                        </svg>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-wrap gap-2">
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-background shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                        </svg>
//                                        Organizar
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    <button
//                                        onClick={handleClick}
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 w-52 flex-auto"
//                                        role="button"
//                                    >
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="16"
//                                            height="16"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                        >
//                                            <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
//                                        </svg>
//                                        Nova aplicação
//                                        <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]"></div>
//                                    </button>
//
//                                </div>
//                            </div>
//
//                            {/* Grid de aplicações */}
//                            {plan === 'no-plan' ? (
//                                <>
//                                    {/* Tela de obtenção de plano */}
//                                    <div className="flex flex-1 flex-col min-h-[calc(100dvh-80px)] bg-blue-950">
//                                        <div className="flex h-full flex-1 items-center justify-center rounded-md border border-blue-700 bg-gradient-to-b from-blue-700/25 to-blue-950">
//                                            <div className="flex flex-col gap-4 text-center">
//                                                <div className="mx-auto rounded-xl border border-blue-700/25 bg-blue-700/10 p-4">
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.4,16.4,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//                                                    </svg>
//                                                </div>
//                                                <div className="space-y-1">
//                                                    <h1 className="font-bold text-2xl">Obtenha um plano para suas aplicações</h1>
//                                                    <p className="max-w-md text-secondary-foreground text-sm">
//                                                        Escolha um plano para atender às suas necessidades e comece a desenvolver com uma infraestrutura otimizada para produção.
//                                                    </p>
//                                                </div>
//                                                <button
//                                                    role="button"
//                                                    onClick={() => setShowPlanModal(true)}
//                                                    className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
//                                                >
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M208,144a15.78,15.78,0,0,1-10.42,14.94L146,178l-19,51.62a15.92,15.92,0,0,1-29.88,0L78,178l-51.62-19a15.92,15.92,0,0,1,0-29.88L78,110l19-51.62a15.92,15.92,0,0,1,29.88,0L146,110l51.62,19A15.78,15.78,0,0,1,208,144ZM152,48h16V64a8,8,0,0,0,16,0V48h16a8,8,0,0,0,0-16H184V16a8,8,0,0,0-16,0V32H152a8,8,0,0,0,0,16Zm88,32h-8V72a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0V96h8a8,8,0,0,0,0-16Z" />
//                                                    </svg>
//                                                    Obter um plano
//                                                    <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-[25deg] animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//                                                </button>
//                                                {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
//                                            </div>
//                                        </div>
//                                    </div>
//                                </>
//                            ) : (
//                                <>
//                                    {/* Grid de aplicações */}
//                                    <div className="flex min-h-[752px] flex-col gap-4 lg:h-[calc(100dvh-300px)]">
//                                        <div className="flex min-h-0 flex-1 flex-col">
//                                            <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                                {isLoading
//                                                    ? Array.from({ length: 6 }).map((_, i) => (
//                                                        <li
//                                                            key={`skeleton-${i}`}
//                                                            className="animate-pulse flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-700/50 p-4"
//                                                        >
//                                                            <div className="flex items-center gap-2.5">
//                                                                <div className="shrink-0 rounded-sm bg-virtus-900 p-1.5">
//                                                                    <div className="size-[26px] rounded-sm bg-virtus-600" />
//                                                                </div>
//                                                                <div className="flex flex-col gap-1 truncate w-full">
//                                                                    <div className="h-4 w-3/4 rounded bg-virtus-600" />
//                                                                    <div className="h-3 w-1/2 rounded bg-virtus-600" />
//                                                                </div>
//                                                            </div>
//
//                                                            <div className="flex justify-between items-end mt-4">
//                                                                <div className="flex gap-2">
//                                                                    <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                                    <div className="h-5 w-20 rounded bg-virtus-600" />
//                                                                </div>
//                                                                <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                            </div>
//                                                        </li>
//                                                    ))
//                                                    : Object.entries(appsByStatus).map(([key, apps]) =>
//                                                        apps.map((app, index) => {
//
//                                                            const runtime = app.runtime || 'unknown';
//
//                                                            const runtimeIconMap = {
//                                                                angular: '/assets/languages/angular.svg',
//                                                                csharp: '/assets/languages/csharp.svg',
//                                                                django: '/assets/languages/django.svg',
//                                                                dotnet: '/assets/languages/dotnet.svg',
//                                                                dotnetcore: '/assets/languages/dotnetcore.svg',
//                                                                elixir: '/assets/languages/elixir.svg',
//                                                                go: '/assets/languages/go.svg',
//                                                                golang: '/assets/languages/go.svg',
//                                                                java: '/assets/languages/java.svg',
//                                                                javascript: '/assets/languages/javascript.svg',
//                                                                kotlin: '/assets/languages/kotlin.svg',
//                                                                laravel: '/assets/languages/laravel.svg',
//                                                                lua: '/assets/languages/lua.svg',
//                                                                nestjs: '/assets/languages/nestjs.svg',
//                                                                nextjs: '/assets/languages/nextjs.svg',
//                                                                node: '/assets/languages/node.svg',
//                                                                nuxtjs: '/assets/languages/nuxtjs.svg',
//                                                                php: '/assets/languages/php.svg',
//                                                                python: '/assets/languages/python.svg',
//                                                                react: '/assets/languages/react.svg',
//                                                                rust: '/assets/languages/rust.svg',
//                                                                springboot: '/assets/languages/springboot.svg',
//                                                                'springboot-gradle': '/assets/languages/springboot-gradle.svg',
//                                                                typescript: '/assets/languages/typescript.svg',
//                                                                vite: '/assets/languages/vite.svg',
//                                                                vuejs: '/assets/languages/vuejs.svg',
//                                                                unknown: '/assets/languages/unknown.svg',
//                                                            };
//
//                                                            const runtimeIcon = runtimeIconMap[runtime];
//                                                            const statusInfo = getStatusStyle(app.status);
//                                                            //const statusKey = app.status?.toLowerCase?.() || "unknown";
//                                                            const uniqueKey = `${key}-${app.ID || index}`;
//
//                                                            return (
//                                                                <li key={uniqueKey} className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700!">
//                                                                    <div className="flex items-center gap-2.5">
//                                                                        <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                                                            <img
//                                                                                alt={runtime}
//                                                                                src={runtimeIcon}
//                                                                                width={26}
//                                                                                height={26}
//                                                                                className="overflow-hidden rounded-sm"
//                                                                            />
//                                                                        </div>
//                                                                        <div className="flex flex-col gap-0.5 truncate">
//                                                                            <p className="font-semibold text-sm/[1.2]">{app.name || runtime.name}</p>
//                                                                            <span className="line-clamp-1 max-w-[85%] truncate text-secondary text-xs/[1.25]">{app.ID}</span>
//                                                                        </div>
//                                                                    </div>
//
//                                                                    <div className="flex w-full items-end justify-between gap-2">
//                                                                        <div className="flex max-w-full flex-wrap gap-2 truncate">
//                                                                            <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-700! focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                                    <path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Z" />
//                                                                                </svg>
//                                                                                {app.cpu || '0%'}
//                                                                            </span>
//                                                                            <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                                    <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z" />
//                                                                                </svg>
//                                                                                {app.memory || '256 MB'}
//                                                                            </span>
//                                                                        </div>
//                                                                        <span className={`font-semibold transition-all h-5 rounded-sm px-2 text-[10px]/5 flex items-center gap-1.5 uppercase text-${statusInfo.color} bg-gradient-to-br ${statusInfo.gradient}`}>
//                                                                            <span className={`relative block size-2.5 rounded-full bg-${statusInfo.color}`}>
//                                                                                {statusInfo.animate && <span className="absolute size-2.5 rounded-full bg-inherit animate-ping" />}
//                                                                            </span>
//                                                                            {statusInfo.label}
//                                                                        </span>
//                                                                    </div>
//
//                                                                    <div
//                                                                        className="absolute inset-0 z-0 cursor-pointer"
//                                                                        onClick={() => router.push(`/${lang}/dashboard/applications/${app.ID}`)}
//                                                                    />
//                                                                    <div className="absolute top-4 right-4 flex gap-2">
//                                                                        <button
//                                                                            type="button"
//                                                                            aria-haspopup="dialog"
//                                                                            aria-expanded="false"
//                                                                            aria-controls="radix-_r_8_"
//                                                                            data-state="closed"
//                                                                            data-slot="dialog-trigger"
//                                                                            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//                                                                        >
//                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
//                                                                                <path d="M120,137,48,201A12,12,0,1,1,32,183l61.91-55L32,73A12,12,0,1,1,48,55l72,64A12,12,0,0,1,120,137Zm96,43H120a12,12,0,0,0,0,24h96a12,12,0,0,0,0-24Z" />
//                                                                            </svg>
//                                                                        </button>
//                                                                        <AppDropdownMenu app={app} onAction={handleAction} />
//                                                                    </div>
//                                                                </li>
//                                                            );
//                                                        })
//                                                    )}
//                                            </ul>
//                                        </div>
//
//                                        {/* Paginação e contador */}
//                                        <div className="space-y-2">
//                                            <div className="flex justify-between gap-4">
//                                                <button
//                                                    disabled
//                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                                >
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                                    </svg>
//                                                    <span className="hidden md:block">Anterior</span>
//                                                </button>
//
//                                                <div className="flex flex-col items-center">
//                                                    <div className="flex justify-center gap-x-1.5">
//                                                        <button className="inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                            1
//                                                        </button>
//                                                    </div>
//                                                </div>
//
//                                                <button
//                                                    disabled
//                                                    className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                                >
//                                                    <span className="hidden md:block">Próximo</span>
//                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                        <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                                    </svg>
//                                                </button>
//                                            </div>
//
//                                            <div className="text-right">
//                                                <span className="text-muted text-xs">
//                                                    Total de {totalApps} aplicação{totalApps !== 1 ? 's' : ''}, {onlineApps} estão online e {offlineApps} estão offline.
//                                                </span>
//                                            </div>
//                                        </div>
//                                    </div>
//                                </>
//                            )}
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div >
//            <Footer />
//        </>
//    );
//}

//frontend/src/app/[lang]/dashboard/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import { PlanBadge } from '@/components/PlanBadge';
//import { planOrder, getPlanTier } from '@/utils/planUtils';
//import '../../styles/virtus.css';
//import { AppDropdownMenu } from '@/components/AppDropdownMenu';
//import { handleAction } from '@/utils/appActions';
////import NewApplicationButton from '@/components/buttons/NewApplicationButton';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//function getStatusStyle(status = '') {
//    const key = status.toLowerCase();
//    if (key === 'running' || key === 'online') {
//        return {
//            label: 'ONLINE',
//            color: 'green-500',
//            gradient: 'from-green-400/20 to-green-700/20',
//            animate: true
//        };
//    }
//    if (key === 'stopped' || key === 'offline') {
//        return {
//            label: 'OFFLINE',
//            color: 'red-500',
//            gradient: 'from-red-400/20 to-red-700/20',
//            animate: false
//        };
//    }
//    return {
//        label: 'DESCONHECIDO',
//        color: 'gray-500',
//        gradient: 'from-gray-400/20 to-gray-700/20',
//        animate: false
//    };
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    const lang = supported.includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'en';
//    //const lang = getLang(pathname);
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const tier = getPlanTier(plan);
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);
//    const [totalMB, setTotalMB] = useState(2048);
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const [search, setSearch] = useState('');
//    const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//    const totalApps =
//        appsByStatus.active.length +
//        appsByStatus.stopped.length +
//        appsByStatus.backups.length;
//
//    const onlineApps = appsByStatus.active.length;
//    const offlineApps = appsByStatus.stopped.length;
//
//    const handleClick = () => {
//        router.push(`/${lang}/upload`);
//    };
//
//    //const runtime = getRuntimeInfo(app.Image); // ou app.image, dependendo da estrutura
//    //const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan(data.plan || 'no-plan');
//            setCanDeploy(data.canDeploy);
//            setUsedMB(data.usedMB || 0);
//            setTotalMB(data.totalMB || 2048);
//        };
//
//        checkSession().then(fetchUserStatus);
//        const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//        return () => clearInterval(interval);
//    }, []);
//
//    useEffect(() => {
//        const fetchAppsByStatus = async () => {
//            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//            const data = await res.json();
//
//            const removeDuplicates = (apps) => {
//                if (!Array.isArray(apps)) return [];
//                const seen = new Set();
//                return apps.filter(app => {
//                    const key = app.ID || app.ContainerName;
//                    if (seen.has(key)) return false;
//                    seen.add(key);
//                    return true;
//                });
//            };
//
//            setAppsByStatus({
//                active: removeDuplicates(data.active),
//                stopped: removeDuplicates(data.stopped),
//                backups: removeDuplicates(data.backups),
//            });
//        };
//
//        fetchAppsByStatus(); // primeira chamada imediata
//        const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//
//        return () => clearInterval(interval); // limpa ao desmontar
//    }, []);
//
//    const [isLoading, setIsLoading] = useState(true);
//    useEffect(() => {
//        // Simula carregamento inicial
//        const timer = setTimeout(() => setIsLoading(false), 2000);
//        return () => clearTimeout(timer);
//    }, []);
//
//
//    //useEffect(() => {
//    //    const fetchAppsByStatus = async () => {
//    //        try {
//    //            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//    //            if (!res.ok) throw new Error(`HTTP ${res.status}`);
//    //            const data = await res.json();
//    //
//    //            const removeDuplicates = (apps) => {
//    //                if (!Array.isArray(apps)) return [];
//    //                const seen = new Set();
//    //                return apps.filter(app => {
//    //                    const key = app.ID || app.ContainerName;
//    //                    if (seen.has(key)) return false;
//    //                    seen.add(key);
//    //                    return true;
//    //                });
//    //            };
//    //
//    //            setAppsByStatus({
//    //                active: removeDuplicates(data.active),
//    //                stopped: removeDuplicates(data.stopped),
//    //                backups: removeDuplicates(data.backups),
//    //            });
//    //        } catch (err) {
//    //            console.error("Erro ao buscar apps:", err);
//    //            // opcional: mostrar fallback visual ou retry
//    //        }
//    //    };
//    //
//    //    fetchAppsByStatus(); // primeira chamada imediata
//    //    const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//    //
//    //    return () => clearInterval(interval); // limpa ao desmontar
//    //}, []);
//
//    //    useEffect(() => {
//    //        const fetchAppsByStatus = async () => {
//    //            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//    //            const data = await res.json();
//    //
//    //            const removeDuplicates = (apps) => {
//    //                if (!Array.isArray(apps)) return [];
//    //                const seen = new Set();
//    //                return apps.filter(app => {
//    //                    const key = app.ID || app.ContainerName;
//    //                    if (seen.has(key)) return false;
//    //                    seen.add(key);
//    //                    return true;
//    //                });
//    //            };
//    //
//    //            setAppsByStatus({
//    //                active: removeDuplicates(data.active),
//    //                stopped: removeDuplicates(data.stopped),
//    //                backups: removeDuplicates(data.backups),
//    //            });
//    //        };
//    //
//    //        fetchAppsByStatus();
//    //    }, []);
//
//    if (loading) return null;
//
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            {isLoading ? (
//                                                <>
//                                                    <div className="h-5 w-32 rounded bg-virtus-600 animate-pulse" />
//                                                    <div className="h-5 w-20 rounded bg-blue-600/50 animate-pulse" />
//                                                </>
//                                            ) : (
//                                                <>
//                                                    <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">
//                                                        Sua conta
//                                                    </span>
//                                                </>
//                                            )}
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span
//                                        className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md"
//                                    >
//                                        <PlanBadge plan={plan} tier={tier} />
//                                    </span>
//
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">1.280 MB</span>
//                                                <span className="text-nowrap text-muted text-xs">768 MB disponível de 2.048 MB</span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div
//                                                    className="absolute inset-0 h-full rounded-full"
//                                                    style={{ backgroundColor: 'rgb(229, 212, 93)', width: '62.5%' }}
//                                                />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    <button
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                            <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                        </svg>
//                                        Renovar
//                                    </button>
//
//                                    <button
//                                        onClick={() => setShowUpgradeModal(true)}
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1 border-virtus-500 bg-transparent"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-600">
//                                            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//                                        </svg>
//                                        Upgrade
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        <div className="relative bg-background">
//                            <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                <div className="flex items-center gap-2.5 md:gap-3.5">
//                                    <div className="flex size-5 items-center justify-center text-blue-500">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                        </svg>
//                                    </div>
//                                    <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                </div>
//
//                                <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                    <span className="block w-full text-sm text-secondary">
//                                        Está pronto para transformar sua experiência? Com o{" "}
//                                        <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                            standard
//                                        </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                        <ul className="list-inside list-disc mt-1">
//                                            <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                            <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                            <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                        </ul>
//                                    </span>
//
//                                    <button
//                                        onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                        className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                    >
//                                        Fazer upgrade
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//
//                                <button
//                                    onClick={() => setShowUpgradeModal(false)}
//                                    className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                >
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                    </svg>
//                                </button>
//                            </div>
//                        </div>
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            {/* Barra de busca e botões */}
//                            <div className="flex flex-col gap-2 md:flex-row">
//                                <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                    <input
//                                        value={search}
//                                        onChange={(e) => setSearch(e.target.value)}
//                                        placeholder="Pesquisar em aplicações..."
//                                        className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                                    />
//                                    <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                        </svg>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-wrap gap-2">
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-background shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                        </svg>
//                                        Organizar
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    <button
//                                        onClick={handleClick}
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 w-52 flex-auto"
//                                        role="button"
//                                    >
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="16"
//                                            height="16"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                        >
//                                            <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
//                                        </svg>
//                                        Nova aplicação
//                                        <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]"></div>
//                                    </button>
//
//                                </div>
//                            </div>
//
//                            {/* Grid de aplicações */}
//                            <div className="flex min-h-[752px] flex-col gap-4 lg:h-[calc(100dvh-300px)]">
//                                <div className="flex min-h-0 flex-1 flex-col">
//                                    <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                        {isLoading
//                                            ? Array.from({ length: 6 }).map((_, i) => (
//                                                <li
//                                                    key={`skeleton-${i}`}
//                                                    className="animate-pulse flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-700/50 p-4"
//                                                >
//                                                    <div className="flex items-center gap-2.5">
//                                                        <div className="shrink-0 rounded-sm bg-virtus-900 p-1.5">
//                                                            <div className="size-[26px] rounded-sm bg-virtus-600" />
//                                                        </div>
//                                                        <div className="flex flex-col gap-1 truncate w-full">
//                                                            <div className="h-4 w-3/4 rounded bg-virtus-600" />
//                                                            <div className="h-3 w-1/2 rounded bg-virtus-600" />
//                                                        </div>
//                                                    </div>
//
//                                                    <div className="flex justify-between items-end mt-4">
//                                                        <div className="flex gap-2">
//                                                            <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                            <div className="h-5 w-20 rounded bg-virtus-600" />
//                                                        </div>
//                                                        <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                    </div>
//                                                </li>
//                                            ))
//                                            : Object.entries(appsByStatus).map(([key, apps]) =>
//                                                apps.map((app, index) => {
//
//                                                    const runtime = app.runtime || 'unknown';
//
//                                                    const runtimeIconMap = {
//                                                        angular: '/assets/languages/angular.svg',
//                                                        csharp: '/assets/languages/csharp.svg',
//                                                        django: '/assets/languages/django.svg',
//                                                        dotnet: '/assets/languages/dotnet.svg',
//                                                        dotnetcore: '/assets/languages/dotnetcore.svg',
//                                                        elixir: '/assets/languages/elixir.svg',
//                                                        go: '/assets/languages/go.svg',
//                                                        golang: '/assets/languages/go.svg',
//                                                        java: '/assets/languages/java.svg',
//                                                        javascript: '/assets/languages/javascript.svg',
//                                                        kotlin: '/assets/languages/kotlin.svg',
//                                                        laravel: '/assets/languages/laravel.svg',
//                                                        lua: '/assets/languages/lua.svg',
//                                                        nestjs: '/assets/languages/nestjs.svg',
//                                                        nextjs: '/assets/languages/nextjs.svg',
//                                                        node: '/assets/languages/node.svg',
//                                                        nuxtjs: '/assets/languages/nuxtjs.svg',
//                                                        php: '/assets/languages/php.svg',
//                                                        python: '/assets/languages/python.svg',
//                                                        react: '/assets/languages/react.svg',
//                                                        rust: '/assets/languages/rust.svg',
//                                                        springboot: '/assets/languages/springboot.svg',
//                                                        'springboot-gradle': '/assets/languages/springboot-gradle.svg',
//                                                        typescript: '/assets/languages/typescript.svg',
//                                                        vite: '/assets/languages/vite.svg',
//                                                        vuejs: '/assets/languages/vuejs.svg',
//                                                        unknown: '/assets/languages/unknown.svg',
//                                                    };
//
//                                                    const runtimeIcon = runtimeIconMap[runtime];
//                                                    const statusInfo = getStatusStyle(app.status);
//                                                    //const statusKey = app.status?.toLowerCase?.() || "unknown";
//                                                    const uniqueKey = `${key}-${app.ID || index}`;
//
//                                                    return (
//                                                        <li key={uniqueKey} className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700!">
//                                                            <div className="flex items-center gap-2.5">
//                                                                <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                                                    <img
//                                                                        alt={runtime}
//                                                                        src={runtimeIcon}
//                                                                        width={26}
//                                                                        height={26}
//                                                                        className="overflow-hidden rounded-sm"
//                                                                    />
//                                                                </div>
//                                                                <div className="flex flex-col gap-0.5 truncate">
//                                                                    <p className="font-semibold text-sm/[1.2]">{app.name || runtime.name}</p>
//                                                                    <span className="line-clamp-1 max-w-[85%] truncate text-secondary text-xs/[1.25]">{app.ID}</span>
//                                                                </div>
//                                                            </div>
//
//                                                            <div className="flex w-full items-end justify-between gap-2">
//                                                                <div className="flex max-w-full flex-wrap gap-2 truncate">
//                                                                    <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-700! focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                            <path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Z" />
//                                                                        </svg>
//                                                                        {app.cpu || '0%'}
//                                                                    </span>
//                                                                    <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                            <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z" />
//                                                                        </svg>
//                                                                        {app.memory || '256 MB'}
//                                                                    </span>
//                                                                </div>
//                                                                <span className={`font-semibold transition-all h-5 rounded-sm px-2 text-[10px]/5 flex items-center gap-1.5 uppercase text-${statusInfo.color} bg-gradient-to-br ${statusInfo.gradient}`}>
//                                                                    <span className={`relative block size-2.5 rounded-full bg-${statusInfo.color}`}>
//                                                                        {statusInfo.animate && <span className="absolute size-2.5 rounded-full bg-inherit animate-ping" />}
//                                                                    </span>
//                                                                    {statusInfo.label}
//                                                                </span>
//                                                            </div>
//
//                                                            <div
//                                                                className="absolute inset-0 z-0 cursor-pointer"
//                                                                onClick={() => router.push(`/${lang}/dashboard/applications/${app.ID}`)}
//                                                            />
//                                                            <div className="absolute top-4 right-4 flex gap-2">
//                                                                <button
//                                                                    type="button"
//                                                                    aria-haspopup="dialog"
//                                                                    aria-expanded="false"
//                                                                    aria-controls="radix-_r_8_"
//                                                                    data-state="closed"
//                                                                    data-slot="dialog-trigger"
//                                                                    className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//                                                                >
//                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
//                                                                        <path d="M120,137,48,201A12,12,0,1,1,32,183l61.91-55L32,73A12,12,0,1,1,48,55l72,64A12,12,0,0,1,120,137Zm96,43H120a12,12,0,0,0,0,24h96a12,12,0,0,0,0-24Z" />
//                                                                    </svg>
//                                                                </button>
//                                                                <AppDropdownMenu app={app} onAction={handleAction} />
//                                                            </div>
//                                                        </li>
//                                                    );
//                                                })
//                                            )}
//                                    </ul>
//                                </div>
//
//                                {/* Paginação e contador */}
//                                <div className="space-y-2">
//                                    <div className="flex justify-between gap-4">
//                                        <button
//                                            disabled
//                                            className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                        >
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                            </svg>
//                                            <span className="hidden md:block">Anterior</span>
//                                        </button>
//
//                                        <div className="flex flex-col items-center">
//                                            <div className="flex justify-center gap-x-1.5">
//                                                <button className="inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                    1
//                                                </button>
//                                            </div>
//                                        </div>
//
//                                        <button
//                                            disabled
//                                            className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                        >
//                                            <span className="hidden md:block">Próximo</span>
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                            </svg>
//                                        </button>
//                                    </div>
//
//                                    <div className="text-right">
//                                        <span className="text-muted text-xs">
//                                            Total de {totalApps} aplicação{totalApps !== 1 ? 's' : ''}, {onlineApps} estão online e {offlineApps} estão offline.
//                                        </span>
//                                    </div>
//                                </div>
//                            </div>
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div >
//            <Footer />
//        </>
//    );
//}

//frontend/src/app/[lang]/dashboard/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import { PlanBadge } from '@/components/PlanBadge';
//import { planOrder, getPlanTier } from '@/utils/planUtils';
//import '../../styles/virtus.css';
//import { AppDropdownMenu } from '@/components/AppDropdownMenu';
//import { handleAction } from '@/utils/appActions';
////import NewApplicationButton from '@/components/buttons/NewApplicationButton';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//function getStatusStyle(status = '') {
//    const key = status.toLowerCase();
//    if (key === 'running' || key === 'online') {
//        return {
//            label: 'ONLINE',
//            color: 'green-500',
//            gradient: 'from-green-400/20 to-green-700/20',
//            animate: true
//        };
//    }
//    if (key === 'stopped' || key === 'offline') {
//        return {
//            label: 'OFFLINE',
//            color: 'red-500',
//            gradient: 'from-red-400/20 to-red-700/20',
//            animate: false
//        };
//    }
//    return {
//        label: 'DESCONHECIDO',
//        color: 'gray-500',
//        gradient: 'from-gray-400/20 to-gray-700/20',
//        animate: false
//    };
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    const lang = supported.includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'en';
//    //const lang = getLang(pathname);
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const tier = getPlanTier(plan);
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);
//    const [totalMB, setTotalMB] = useState(2048);
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const [search, setSearch] = useState('');
//    const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//    const totalApps =
//        appsByStatus.active.length +
//        appsByStatus.stopped.length +
//        appsByStatus.backups.length;
//
//    const onlineApps = appsByStatus.active.length;
//    const offlineApps = appsByStatus.stopped.length;
//    
//    const handleClick = () => {
//        router.push(`/${lang}/upload`);
//    };
//
//    //const runtime = getRuntimeInfo(app.Image); // ou app.image, dependendo da estrutura
//    //const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan(data.plan || 'no-plan');
//            setCanDeploy(data.canDeploy);
//            setUsedMB(data.usedMB || 0);
//            setTotalMB(data.totalMB || 2048);
//        };
//
//        checkSession().then(fetchUserStatus);
//        const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//        return () => clearInterval(interval);
//    }, []);
//
//    useEffect(() => {
//        const fetchAppsByStatus = async () => {
//            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//            const data = await res.json();
//
//            const removeDuplicates = (apps) => {
//                if (!Array.isArray(apps)) return [];
//                const seen = new Set();
//                return apps.filter(app => {
//                    const key = app.ID || app.ContainerName;
//                    if (seen.has(key)) return false;
//                    seen.add(key);
//                    return true;
//                });
//            };
//
//            setAppsByStatus({
//                active: removeDuplicates(data.active),
//                stopped: removeDuplicates(data.stopped),
//                backups: removeDuplicates(data.backups),
//            });
//        };
//
//        fetchAppsByStatus(); // primeira chamada imediata
//        const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//
//        return () => clearInterval(interval); // limpa ao desmontar
//    }, []);
//
//    const [isLoading, setIsLoading] = useState(true);
//    useEffect(() => {
//        // Simula carregamento inicial
//        const timer = setTimeout(() => setIsLoading(false), 2000);
//        return () => clearTimeout(timer);
//    }, []);
//
//
//    //useEffect(() => {
//    //    const fetchAppsByStatus = async () => {
//    //        try {
//    //            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//    //            if (!res.ok) throw new Error(`HTTP ${res.status}`);
//    //            const data = await res.json();
//    //
//    //            const removeDuplicates = (apps) => {
//    //                if (!Array.isArray(apps)) return [];
//    //                const seen = new Set();
//    //                return apps.filter(app => {
//    //                    const key = app.ID || app.ContainerName;
//    //                    if (seen.has(key)) return false;
//    //                    seen.add(key);
//    //                    return true;
//    //                });
//    //            };
//    //
//    //            setAppsByStatus({
//    //                active: removeDuplicates(data.active),
//    //                stopped: removeDuplicates(data.stopped),
//    //                backups: removeDuplicates(data.backups),
//    //            });
//    //        } catch (err) {
//    //            console.error("Erro ao buscar apps:", err);
//    //            // opcional: mostrar fallback visual ou retry
//    //        }
//    //    };
//    //
//    //    fetchAppsByStatus(); // primeira chamada imediata
//    //    const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//    //
//    //    return () => clearInterval(interval); // limpa ao desmontar
//    //}, []);
//
//    //    useEffect(() => {
//    //        const fetchAppsByStatus = async () => {
//    //            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//    //            const data = await res.json();
//    //
//    //            const removeDuplicates = (apps) => {
//    //                if (!Array.isArray(apps)) return [];
//    //                const seen = new Set();
//    //                return apps.filter(app => {
//    //                    const key = app.ID || app.ContainerName;
//    //                    if (seen.has(key)) return false;
//    //                    seen.add(key);
//    //                    return true;
//    //                });
//    //            };
//    //
//    //            setAppsByStatus({
//    //                active: removeDuplicates(data.active),
//    //                stopped: removeDuplicates(data.stopped),
//    //                backups: removeDuplicates(data.backups),
//    //            });
//    //        };
//    //
//    //        fetchAppsByStatus();
//    //    }, []);
//
//    if (loading) return null;
//
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            {isLoading ? (
//                                                <>
//                                                    <div className="h-5 w-32 rounded bg-virtus-600 animate-pulse" />
//                                                    <div className="h-5 w-20 rounded bg-blue-600/50 animate-pulse" />
//                                                </>
//                                            ) : (
//                                                <>
//                                                    <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">
//                                                        Sua conta
//                                                    </span>
//                                                </>
//                                            )}
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span
//                                        className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md"
//                                    >
//                                        <PlanBadge plan={plan} tier={tier} />
//                                    </span>
//
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">1.280 MB</span>
//                                                <span className="text-nowrap text-muted text-xs">768 MB disponível de 2.048 MB</span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div
//                                                    className="absolute inset-0 h-full rounded-full"
//                                                    style={{ backgroundColor: 'rgb(229, 212, 93)', width: '62.5%' }}
//                                                />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    <button
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                            <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                        </svg>
//                                        Renovar
//                                    </button>
//
//                                    <button
//                                        onClick={() => setShowUpgradeModal(true)}
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1 border-virtus-500 bg-transparent"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-600">
//                                            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//                                        </svg>
//                                        Upgrade
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        <div className="relative bg-background">
//                            <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                <div className="flex items-center gap-2.5 md:gap-3.5">
//                                    <div className="flex size-5 items-center justify-center text-blue-500">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                        </svg>
//                                    </div>
//                                    <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                </div>
//
//                                <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                    <span className="block w-full text-sm text-secondary">
//                                        Está pronto para transformar sua experiência? Com o{" "}
//                                        <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                            standard
//                                        </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                        <ul className="list-inside list-disc mt-1">
//                                            <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                            <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                            <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                        </ul>
//                                    </span>
//
//                                    <button
//                                        onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                        className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                    >
//                                        Fazer upgrade
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//
//                                <button
//                                    onClick={() => setShowUpgradeModal(false)}
//                                    className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                >
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                    </svg>
//                                </button>
//                            </div>
//                        </div>
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            {/* Barra de busca e botões */}
//                            <div className="flex flex-col gap-2 md:flex-row">
//                                <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                    <input
//                                        value={search}
//                                        onChange={(e) => setSearch(e.target.value)}
//                                        placeholder="Pesquisar em aplicações..."
//                                        className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                                    />
//                                    <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                        </svg>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-wrap gap-2">
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-background shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                        </svg>
//                                        Organizar
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    <button
//                                        onClick={handleClick}
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 w-52 flex-auto"
//                                        role="button"
//                                    >
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="16"
//                                            height="16"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                        >
//                                            <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
//                                        </svg>
//                                        Nova aplicação
//                                        <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]"></div>
//                                    </button>
//
//                                </div>
//                            </div>
//
//                            {/* Grid de aplicações */}
//                            <div className="flex min-h-[752px] flex-col gap-4 lg:h-[calc(100dvh-300px)]">
//                                <div className="flex min-h-0 flex-1 flex-col">
//                                    <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                        {isLoading
//                                            ? Array.from({ length: 6 }).map((_, i) => (
//                                                <li
//                                                    key={`skeleton-${i}`}
//                                                    className="animate-pulse flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-700/50 p-4"
//                                                >
//                                                    <div className="flex items-center gap-2.5">
//                                                        <div className="shrink-0 rounded-sm bg-virtus-900 p-1.5">
//                                                            <div className="size-[26px] rounded-sm bg-virtus-600" />
//                                                        </div>
//                                                        <div className="flex flex-col gap-1 truncate w-full">
//                                                            <div className="h-4 w-3/4 rounded bg-virtus-600" />
//                                                            <div className="h-3 w-1/2 rounded bg-virtus-600" />
//                                                        </div>
//                                                    </div>
//
//                                                    <div className="flex justify-between items-end mt-4">
//                                                        <div className="flex gap-2">
//                                                            <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                            <div className="h-5 w-20 rounded bg-virtus-600" />
//                                                        </div>
//                                                        <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                    </div>
//                                                </li>
//                                            ))
//                                            : Object.entries(appsByStatus).map(([key, apps]) =>
//                                                apps.map((app, index) => {
//
//                                                    const runtime = app.runtime || 'unknown';
//
//                                                    const runtimeIconMap = {
//                                                        angular: '/assets/languages/angular.svg',
//                                                        csharp: '/assets/languages/csharp.svg',
//                                                        django: '/assets/languages/django.svg',
//                                                        dotnet: '/assets/languages/dotnet.svg',
//                                                        dotnetcore: '/assets/languages/dotnetcore.svg',
//                                                        elixir: '/assets/languages/elixir.svg',
//                                                        go: '/assets/languages/go.svg',
//                                                        golang: '/assets/languages/go.svg',
//                                                        java: '/assets/languages/java.svg',
//                                                        javascript: '/assets/languages/javascript.svg',
//                                                        kotlin: '/assets/languages/kotlin.svg',
//                                                        laravel: '/assets/languages/laravel.svg',
//                                                        lua: '/assets/languages/lua.svg',
//                                                        nestjs: '/assets/languages/nestjs.svg',
//                                                        nextjs: '/assets/languages/nextjs.svg',
//                                                        node: '/assets/languages/node.svg',
//                                                        nuxtjs: '/assets/languages/nuxtjs.svg',
//                                                        php: '/assets/languages/php.svg',
//                                                        python: '/assets/languages/python.svg',
//                                                        react: '/assets/languages/react.svg',
//                                                        rust: '/assets/languages/rust.svg',
//                                                        springboot: '/assets/languages/springboot.svg',
//                                                        'springboot-gradle': '/assets/languages/springboot-gradle.svg',
//                                                        typescript: '/assets/languages/typescript.svg',
//                                                        vite: '/assets/languages/vite.svg',
//                                                        vuejs: '/assets/languages/vuejs.svg',
//                                                        unknown: '/assets/languages/unknown.svg',
//                                                    };
//
//                                                    const runtimeIcon = runtimeIconMap[runtime];
//                                                    const statusInfo = getStatusStyle(app.status);
//                                                    //const statusKey = app.status?.toLowerCase?.() || "unknown";
//                                                    const uniqueKey = `${key}-${app.ID || index}`;
//
//                                                    return (
//                                                        <li key={uniqueKey} className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700!">
//                                                            <div className="flex items-center gap-2.5">
//                                                                <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                                                    <img
//                                                                        alt={runtime}
//                                                                        src={runtimeIcon}
//                                                                        width={26}
//                                                                        height={26}
//                                                                        className="overflow-hidden rounded-sm"
//                                                                    />
//                                                                </div>
//                                                                <div className="flex flex-col gap-0.5 truncate">
//                                                                    <p className="font-semibold text-sm/[1.2]">{app.name || runtime.name}</p>
//                                                                    <span className="line-clamp-1 max-w-[85%] truncate text-secondary text-xs/[1.25]">{app.ID}</span>
//                                                                </div>
//                                                            </div>
//
//                                                            <div className="flex w-full items-end justify-between gap-2">
//                                                                <div className="flex max-w-full flex-wrap gap-2 truncate">
//                                                                    <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-700! focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                            <path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Z" />
//                                                                        </svg>
//                                                                        {app.cpu || '0%'}
//                                                                    </span>
//                                                                    <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                            <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z" />
//                                                                        </svg>
//                                                                        {app.memory || '256 MB'}
//                                                                    </span>
//                                                                </div>
//                                                                <span className={`font-semibold transition-all h-5 rounded-sm px-2 text-[10px]/5 flex items-center gap-1.5 uppercase text-${statusInfo.color} bg-gradient-to-br ${statusInfo.gradient}`}>
//                                                                    <span className={`relative block size-2.5 rounded-full bg-${statusInfo.color}`}>
//                                                                        {statusInfo.animate && <span className="absolute size-2.5 rounded-full bg-inherit animate-ping" />}
//                                                                    </span>
//                                                                    {statusInfo.label}
//                                                                </span>
//                                                            </div>
//
//                                                            <a className="absolute inset-0" href={`/${lang}/dashboard/applications/${app.ID}`} />
//                                                            <div className="absolute top-4 right-4 flex gap-2">
//                                                                <button
//                                                                    type="button"
//                                                                    aria-haspopup="dialog"
//                                                                    aria-expanded="false"
//                                                                    aria-controls="radix-_r_8_"
//                                                                    data-state="closed"
//                                                                    data-slot="dialog-trigger"
//                                                                    className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//                                                                >
//                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
//                                                                        <path d="M120,137,48,201A12,12,0,1,1,32,183l61.91-55L32,73A12,12,0,1,1,48,55l72,64A12,12,0,0,1,120,137Zm96,43H120a12,12,0,0,0,0,24h96a12,12,0,0,0,0-24Z" />
//                                                                    </svg>
//                                                                </button>
//                                                                <AppDropdownMenu app={app} onAction={handleAction} />
//                                                            </div>
//                                                        </li>
//                                                    );
//                                                })
//                                            )}
//                                    </ul>
//                                </div>
//
//                                {/* Paginação e contador */}
//                                <div className="space-y-2">
//                                    <div className="flex justify-between gap-4">
//                                        <button
//                                            disabled
//                                            className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                        >
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                            </svg>
//                                            <span className="hidden md:block">Anterior</span>
//                                        </button>
//
//                                        <div className="flex flex-col items-center">
//                                            <div className="flex justify-center gap-x-1.5">
//                                                <button className="inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                    1
//                                                </button>
//                                            </div>
//                                        </div>
//
//                                        <button
//                                            disabled
//                                            className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                        >
//                                            <span className="hidden md:block">Próximo</span>
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                            </svg>
//                                        </button>
//                                    </div>
//
//                                    <div className="text-right">
//                                        <span className="text-muted text-xs">
//                                            Total de {totalApps} aplicação{totalApps !== 1 ? 's' : ''}, {onlineApps} estão online e {offlineApps} estão offline.
//                                        </span>
//                                    </div>
//                                </div>
//                            </div>
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div >
//            <Footer />
//        </>
//    );
//}

//frontend/src/app/[lang]/dashboard/test/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import { PlanBadge } from '@/components/PlanBadge';
//import { planOrder, getPlanTier } from '@/utils/planUtils';
//import '../../../styles/virtus.css';
//import { AppDropdownMenu } from '@/components/AppDropdownMenu';
//import { handleAction } from '@/utils/appActions';
////import NewApplicationButton from '@/components/buttons/NewApplicationButton';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//function getStatusStyle(status = '') {
//    const key = status.toLowerCase();
//    if (key === 'running' || key === 'online') {
//        return {
//            label: 'ONLINE',
//            color: 'green-500',
//            gradient: 'from-green-400/20 to-green-700/20',
//            animate: true
//        };
//    }
//    if (key === 'stopped' || key === 'offline') {
//        return {
//            label: 'OFFLINE',
//            color: 'red-500',
//            gradient: 'from-red-400/20 to-red-700/20',
//            animate: false
//        };
//    }
//    return {
//        label: 'DESCONHECIDO',
//        color: 'gray-500',
//        gradient: 'from-gray-400/20 to-gray-700/20',
//        animate: false
//    };
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    const lang = supported.includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'en';
//    //const lang = getLang(pathname);
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const tier = getPlanTier(plan);
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);
//    const [totalMB, setTotalMB] = useState(2048);
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const [search, setSearch] = useState('');
//    const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//    const handleClick = () => {
//        router.push(`/${lang}/upload`);
//    };
//
//    //const runtime = getRuntimeInfo(app.Image); // ou app.image, dependendo da estrutura
//    //const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan(data.plan || 'no-plan');
//            setCanDeploy(data.canDeploy);
//            setUsedMB(data.usedMB || 0);
//            setTotalMB(data.totalMB || 2048);
//        };
//
//        checkSession().then(fetchUserStatus);
//        const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//        return () => clearInterval(interval);
//    }, []);
//
//    useEffect(() => {
//        const fetchAppsByStatus = async () => {
//            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//            const data = await res.json();
//
//            const removeDuplicates = (apps) => {
//                if (!Array.isArray(apps)) return [];
//                const seen = new Set();
//                return apps.filter(app => {
//                    const key = app.ID || app.ContainerName;
//                    if (seen.has(key)) return false;
//                    seen.add(key);
//                    return true;
//                });
//            };
//
//            setAppsByStatus({
//                active: removeDuplicates(data.active),
//                stopped: removeDuplicates(data.stopped),
//                backups: removeDuplicates(data.backups),
//            });
//        };
//
//        fetchAppsByStatus(); // primeira chamada imediata
//        const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//
//        return () => clearInterval(interval); // limpa ao desmontar
//    }, []);
//
//    const [isLoading, setIsLoading] = useState(true);
//    useEffect(() => {
//        // Simula carregamento inicial
//        const timer = setTimeout(() => setIsLoading(false), 2000);
//        return () => clearTimeout(timer);
//    }, []);
//
//
//    //useEffect(() => {
//    //    const fetchAppsByStatus = async () => {
//    //        try {
//    //            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//    //            if (!res.ok) throw new Error(`HTTP ${res.status}`);
//    //            const data = await res.json();
//    //
//    //            const removeDuplicates = (apps) => {
//    //                if (!Array.isArray(apps)) return [];
//    //                const seen = new Set();
//    //                return apps.filter(app => {
//    //                    const key = app.ID || app.ContainerName;
//    //                    if (seen.has(key)) return false;
//    //                    seen.add(key);
//    //                    return true;
//    //                });
//    //            };
//    //
//    //            setAppsByStatus({
//    //                active: removeDuplicates(data.active),
//    //                stopped: removeDuplicates(data.stopped),
//    //                backups: removeDuplicates(data.backups),
//    //            });
//    //        } catch (err) {
//    //            console.error("Erro ao buscar apps:", err);
//    //            // opcional: mostrar fallback visual ou retry
//    //        }
//    //    };
//    //
//    //    fetchAppsByStatus(); // primeira chamada imediata
//    //    const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//    //
//    //    return () => clearInterval(interval); // limpa ao desmontar
//    //}, []);
//
//    //    useEffect(() => {
//    //        const fetchAppsByStatus = async () => {
//    //            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//    //            const data = await res.json();
//    //
//    //            const removeDuplicates = (apps) => {
//    //                if (!Array.isArray(apps)) return [];
//    //                const seen = new Set();
//    //                return apps.filter(app => {
//    //                    const key = app.ID || app.ContainerName;
//    //                    if (seen.has(key)) return false;
//    //                    seen.add(key);
//    //                    return true;
//    //                });
//    //            };
//    //
//    //            setAppsByStatus({
//    //                active: removeDuplicates(data.active),
//    //                stopped: removeDuplicates(data.stopped),
//    //                backups: removeDuplicates(data.backups),
//    //            });
//    //        };
//    //
//    //        fetchAppsByStatus();
//    //    }, []);
//
//    if (loading) return null;
//
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            {isLoading ? (
//                                                <>
//                                                    <div className="h-5 w-32 rounded bg-virtus-600 animate-pulse" />
//                                                    <div className="h-5 w-20 rounded bg-blue-600/50 animate-pulse" />
//                                                </>
//                                            ) : (
//                                                <>
//                                                    <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">
//                                                        Sua conta
//                                                    </span>
//                                                </>
//                                            )}
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span
//                                        className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md"
//                                    >
//                                        <PlanBadge plan={plan} tier={tier} />
//                                    </span>
//
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">1.280 MB</span>
//                                                <span className="text-nowrap text-muted text-xs">768 MB disponível de 2.048 MB</span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div
//                                                    className="absolute inset-0 h-full rounded-full"
//                                                    style={{ backgroundColor: 'rgb(229, 212, 93)', width: '62.5%' }}
//                                                />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    <button
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                            <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                        </svg>
//                                        Renovar
//                                    </button>
//
//                                    <button
//                                        onClick={() => setShowUpgradeModal(true)}
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1 border-virtus-500 bg-transparent"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-600">
//                                            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//                                        </svg>
//                                        Upgrade
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        <div className="relative bg-background">
//                            <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                <div className="flex items-center gap-2.5 md:gap-3.5">
//                                    <div className="flex size-5 items-center justify-center text-blue-500">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                        </svg>
//                                    </div>
//                                    <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                </div>
//
//                                <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                    <span className="block w-full text-sm text-secondary">
//                                        Está pronto para transformar sua experiência? Com o{" "}
//                                        <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                            standard
//                                        </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                        <ul className="list-inside list-disc mt-1">
//                                            <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                            <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                            <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                        </ul>
//                                    </span>
//
//                                    <button
//                                        onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                        className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                    >
//                                        Fazer upgrade
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//
//                                <button
//                                    onClick={() => setShowUpgradeModal(false)}
//                                    className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                >
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                    </svg>
//                                </button>
//                            </div>
//                        </div>
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            {/* Barra de busca e botões */}
//                            <div className="flex flex-col gap-2 md:flex-row">
//                                <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                    <input
//                                        value={search}
//                                        onChange={(e) => setSearch(e.target.value)}
//                                        placeholder="Pesquisar em aplicações..."
//                                        className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                                    />
//                                    <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                        </svg>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-wrap gap-2">
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-background shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                        </svg>
//                                        Organizar
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    <button
//                                        onClick={handleClick}
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 w-52 flex-auto"
//                                        role="button"
//                                    >
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="16"
//                                            height="16"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                        >
//                                            <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
//                                        </svg>
//                                        Nova aplicação
//                                        <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]"></div>
//                                    </button>
//
//                                </div>
//                            </div>
//
//                            {/* Grid de aplicações */}
//                            <div className="flex min-h-[752px] flex-col gap-4 lg:h-[calc(100dvh-300px)]">
//                                <div className="flex min-h-0 flex-1 flex-col">
//                                    <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                        {isLoading
//                                            ? Array.from({ length: 6 }).map((_, i) => (
//                                                <li
//                                                    key={`skeleton-${i}`}
//                                                    className="animate-pulse flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-700/50 p-4"
//                                                >
//                                                    <div className="flex items-center gap-2.5">
//                                                        <div className="shrink-0 rounded-sm bg-virtus-900 p-1.5">
//                                                            <div className="size-[26px] rounded-sm bg-virtus-600" />
//                                                        </div>
//                                                        <div className="flex flex-col gap-1 truncate w-full">
//                                                            <div className="h-4 w-3/4 rounded bg-virtus-600" />
//                                                            <div className="h-3 w-1/2 rounded bg-virtus-600" />
//                                                        </div>
//                                                    </div>
//
//                                                    <div className="flex justify-between items-end mt-4">
//                                                        <div className="flex gap-2">
//                                                            <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                            <div className="h-5 w-20 rounded bg-virtus-600" />
//                                                        </div>
//                                                        <div className="h-5 w-16 rounded bg-virtus-600" />
//                                                    </div>
//                                                </li>
//                                            ))
//                                            : Object.entries(appsByStatus).map(([key, apps]) =>
//                                                apps.map((app, index) => {
//
//                                                    const runtime = app.runtime || 'unknown';
//
//                                                    const runtimeIconMap = {
//                                                        angular: '/assets/languages/angular.svg',
//                                                        csharp: '/assets/languages/csharp.svg',
//                                                        django: '/assets/languages/django.svg',
//                                                        dotnet: '/assets/languages/dotnet.svg',
//                                                        dotnetcore: '/assets/languages/dotnetcore.svg',
//                                                        elixir: '/assets/languages/elixir.svg',
//                                                        go: '/assets/languages/go.svg',
//                                                        golang: '/assets/languages/go.svg',
//                                                        java: '/assets/languages/java.svg',
//                                                        javascript: '/assets/languages/javascript.svg',
//                                                        kotlin: '/assets/languages/kotlin.svg',
//                                                        laravel: '/assets/languages/laravel.svg',
//                                                        lua: '/assets/languages/lua.svg',
//                                                        nestjs: '/assets/languages/nestjs.svg',
//                                                        nextjs: '/assets/languages/nextjs.svg',
//                                                        node: '/assets/languages/node.svg',
//                                                        nuxtjs: '/assets/languages/nuxtjs.svg',
//                                                        php: '/assets/languages/php.svg',
//                                                        python: '/assets/languages/python.svg',
//                                                        react: '/assets/languages/react.svg',
//                                                        rust: '/assets/languages/rust.svg',
//                                                        springboot: '/assets/languages/springboot.svg',
//                                                        'springboot-gradle': '/assets/languages/springboot-gradle.svg',
//                                                        typescript: '/assets/languages/typescript.svg',
//                                                        vite: '/assets/languages/vite.svg',
//                                                        vuejs: '/assets/languages/vuejs.svg',
//                                                        unknown: '/assets/languages/unknown.svg',
//                                                    };
//
//                                                    const runtimeIcon = runtimeIconMap[runtime];
//                                                    const statusInfo = getStatusStyle(app.status);
//                                                    //const statusKey = app.status?.toLowerCase?.() || "unknown";
//                                                    const uniqueKey = `${key}-${app.ID || index}`;
//
//                                                    return (
//                                                        <li key={uniqueKey} className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700!">
//                                                            <div className="flex items-center gap-2.5">
//                                                                <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                                                    <img
//                                                                        alt={runtime}
//                                                                        src={runtimeIcon}
//                                                                        width={26}
//                                                                        height={26}
//                                                                        className="overflow-hidden rounded-sm"
//                                                                    />
//                                                                </div>
//                                                                <div className="flex flex-col gap-0.5 truncate">
//                                                                    <p className="font-semibold text-sm/[1.2]">{app.name || runtime.name}</p>
//                                                                    <span className="line-clamp-1 max-w-[85%] truncate text-secondary text-xs/[1.25]">{app.ID}</span>
//                                                                </div>
//                                                            </div>
//
//                                                            <div className="flex w-full items-end justify-between gap-2">
//                                                                <div className="flex max-w-full flex-wrap gap-2 truncate">
//                                                                    <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-700! focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                            <path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Z" />
//                                                                        </svg>
//                                                                        {app.cpu || '0%'}
//                                                                    </span>
//                                                                    <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                            <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z" />
//                                                                        </svg>
//                                                                        {app.memory || '256 MB'}
//                                                                    </span>
//                                                                </div>
//                                                                <span className={`font-semibold transition-all h-5 rounded-sm px-2 text-[10px]/5 flex items-center gap-1.5 uppercase text-${statusInfo.color} bg-gradient-to-br ${statusInfo.gradient}`}>
//                                                                    <span className={`relative block size-2.5 rounded-full bg-${statusInfo.color}`}>
//                                                                        {statusInfo.animate && <span className="absolute size-2.5 rounded-full bg-inherit animate-ping" />}
//                                                                    </span>
//                                                                    {statusInfo.label}
//                                                                </span>
//                                                            </div>
//
//                                                            <a className="absolute inset-0" href={`/${lang}/dashboard/applications/${app.ID}`} />
//                                                            <div className="absolute top-4 right-4 flex gap-2">
//                                                                <button
//                                                                    type="button"
//                                                                    aria-haspopup="dialog"
//                                                                    aria-expanded="false"
//                                                                    aria-controls="radix-_r_8_"
//                                                                    data-state="closed"
//                                                                    data-slot="dialog-trigger"
//                                                                    className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//                                                                >
//                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
//                                                                        <path d="M120,137,48,201A12,12,0,1,1,32,183l61.91-55L32,73A12,12,0,1,1,48,55l72,64A12,12,0,0,1,120,137Zm96,43H120a12,12,0,0,0,0,24h96a12,12,0,0,0,0-24Z" />
//                                                                    </svg>
//                                                                </button>
//                                                                <AppDropdownMenu app={app} onAction={handleAction} />
//                                                            </div>
//                                                        </li>
//                                                    );
//                                                })
//                                            )}
//                                    </ul>
//                                </div>
//
//                                {/* Paginação e contador */}
//                                <div className="space-y-2">
//                                    <div className="flex justify-between gap-4">
//                                        <button
//                                            disabled
//                                            className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                        >
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                            </svg>
//                                            <span className="hidden md:block">Anterior</span>
//                                        </button>
//
//                                        <div className="flex flex-col items-center">
//                                            <div className="flex justify-center gap-x-1.5">
//                                                <button className="inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                    1
//                                                </button>
//                                            </div>
//                                        </div>
//
//                                        <button
//                                            disabled
//                                            className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                        >
//                                            <span className="hidden md:block">Próximo</span>
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                            </svg>
//                                        </button>
//                                    </div>
//
//                                    <div className="text-right">
//                                        <span className="text-muted text-xs">
//                                            Total de 1 aplicação, 0 estão online e 1 está offline.
//                                        </span>
//                                    </div>
//                                </div>
//                            </div>
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div >
//            <Footer />
//        </>
//    );
//}

//frontend/src/app/[lang]/dashboard/test/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import { PlanBadge } from '@/components/PlanBadge';
//import { planOrder, getPlanTier } from '@/utils/planUtils';
//import '../../../styles/virtus.css';
//import { AppDropdownMenu } from '@/components/AppDropdownMenu';
//import { handleAction } from '@/utils/appActions';
//import NewApplicationButton from '@/components/buttons/NewApplicationButton';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//function getStatusStyle(status = '') {
//    const key = status.toLowerCase();
//    if (key === 'running' || key === 'online') {
//        return {
//            label: 'ONLINE',
//            color: 'green-500',
//            gradient: 'from-green-400/20 to-green-700/20',
//            animate: true
//        };
//    }
//    if (key === 'stopped' || key === 'offline') {
//        return {
//            label: 'OFFLINE',
//            color: 'red-500',
//            gradient: 'from-red-400/20 to-red-700/20',
//            animate: false
//        };
//    }
//    return {
//        label: 'DESCONHECIDO',
//        color: 'gray-500',
//        gradient: 'from-gray-400/20 to-gray-700/20',
//        animate: false
//    };
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    const lang = supported.includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'en';
//    //const lang = getLang(pathname);
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const tier = getPlanTier(plan);
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);
//    const [totalMB, setTotalMB] = useState(2048);
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const [search, setSearch] = useState('');
//    const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//    const handleClick = () => {
//        router.push(`/${lang}/upload`);
//    };
//
//    //const runtime = getRuntimeInfo(app.Image); // ou app.image, dependendo da estrutura
//    //const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan(data.plan || 'no-plan');
//            setCanDeploy(data.canDeploy);
//            setUsedMB(data.usedMB || 0);
//            setTotalMB(data.totalMB || 2048);
//        };
//
//        checkSession().then(fetchUserStatus);
//        const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//        return () => clearInterval(interval);
//    }, []);
//
//    useEffect(() => {
//        const fetchAppsByStatus = async () => {
//            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//            const data = await res.json();
//
//            const removeDuplicates = (apps) => {
//                if (!Array.isArray(apps)) return [];
//                const seen = new Set();
//                return apps.filter(app => {
//                    const key = app.ID || app.ContainerName;
//                    if (seen.has(key)) return false;
//                    seen.add(key);
//                    return true;
//                });
//            };
//
//            setAppsByStatus({
//                active: removeDuplicates(data.active),
//                stopped: removeDuplicates(data.stopped),
//                backups: removeDuplicates(data.backups),
//            });
//        };
//
//        fetchAppsByStatus(); // primeira chamada imediata
//        const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//
//        return () => clearInterval(interval); // limpa ao desmontar
//    }, []);
//
//    //useEffect(() => {
//    //    const fetchAppsByStatus = async () => {
//    //        try {
//    //            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//    //            if (!res.ok) throw new Error(`HTTP ${res.status}`);
//    //            const data = await res.json();
//    //
//    //            const removeDuplicates = (apps) => {
//    //                if (!Array.isArray(apps)) return [];
//    //                const seen = new Set();
//    //                return apps.filter(app => {
//    //                    const key = app.ID || app.ContainerName;
//    //                    if (seen.has(key)) return false;
//    //                    seen.add(key);
//    //                    return true;
//    //                });
//    //            };
//    //
//    //            setAppsByStatus({
//    //                active: removeDuplicates(data.active),
//    //                stopped: removeDuplicates(data.stopped),
//    //                backups: removeDuplicates(data.backups),
//    //            });
//    //        } catch (err) {
//    //            console.error("Erro ao buscar apps:", err);
//    //            // opcional: mostrar fallback visual ou retry
//    //        }
//    //    };
//    //
//    //    fetchAppsByStatus(); // primeira chamada imediata
//    //    const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//    //
//    //    return () => clearInterval(interval); // limpa ao desmontar
//    //}, []);
//
//    //    useEffect(() => {
//    //        const fetchAppsByStatus = async () => {
//    //            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//    //            const data = await res.json();
//    //
//    //            const removeDuplicates = (apps) => {
//    //                if (!Array.isArray(apps)) return [];
//    //                const seen = new Set();
//    //                return apps.filter(app => {
//    //                    const key = app.ID || app.ContainerName;
//    //                    if (seen.has(key)) return false;
//    //                    seen.add(key);
//    //                    return true;
//    //                });
//    //            };
//    //
//    //            setAppsByStatus({
//    //                active: removeDuplicates(data.active),
//    //                stopped: removeDuplicates(data.stopped),
//    //                backups: removeDuplicates(data.backups),
//    //            });
//    //        };
//    //
//    //        fetchAppsByStatus();
//    //    }, []);
//
//    if (loading) return null;
//
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 bg-grid-virtus-600/[0.2] pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                            <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">Sua conta</span>
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span
//                                        className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md"
//                                    >
//                                        <PlanBadge plan={plan} tier={tier} />
//                                    </span>
//
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">1.280 MB</span>
//                                                <span className="text-nowrap text-muted text-xs">768 MB disponível de 2.048 MB</span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div
//                                                    className="absolute inset-0 h-full rounded-full"
//                                                    style={{ backgroundColor: 'rgb(229, 212, 93)', width: '62.5%' }}
//                                                />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    <button
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                            <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                        </svg>
//                                        Renovar
//                                    </button>
//
//                                    <button
//                                        onClick={() => setShowUpgradeModal(true)}
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1 border-virtus-500 bg-transparent"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-600">
//                                            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//                                        </svg>
//                                        Upgrade
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        <div className="relative bg-background">
//                            <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                <div className="flex items-center gap-2.5 md:gap-3.5">
//                                    <div className="flex size-5 items-center justify-center text-blue-500">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                        </svg>
//                                    </div>
//                                    <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                </div>
//
//                                <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                    <span className="block w-full text-sm text-secondary">
//                                        Está pronto para transformar sua experiência? Com o{" "}
//                                        <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                            standard
//                                        </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                        <ul className="list-inside list-disc mt-1">
//                                            <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                            <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                            <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                        </ul>
//                                    </span>
//
//                                    <button
//                                        onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                        className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                    >
//                                        Fazer upgrade
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//
//                                <button
//                                    onClick={() => setShowUpgradeModal(false)}
//                                    className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                >
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                    </svg>
//                                </button>
//                            </div>
//                        </div>
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            {/* Barra de busca e botões */}
//                            <div className="flex flex-col gap-2 md:flex-row">
//                                <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                    <input
//                                        value={search}
//                                        onChange={(e) => setSearch(e.target.value)}
//                                        placeholder="Pesquisar em aplicações..."
//                                        className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                                    />
//                                    <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                        </svg>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-wrap gap-2">
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-background shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                        </svg>
//                                        Organizar
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    <button
//                                        onClick={handleClick}
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 w-52 flex-auto"
//                                        role="button"
//                                    >
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="16"
//                                            height="16"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                        >
//                                            <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
//                                        </svg>
//                                        Nova aplicação
//                                        <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]"></div>
//                                    </button>
//
//                                </div>
//                            </div>
//
//                            {/* Grid de aplicações */}
//                            <div className="flex min-h-[752px] flex-col gap-4 lg:h-[calc(100dvh-300px)]">
//                                <div className="flex min-h-0 flex-1 flex-col">
//                                    <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                        {Object.entries(appsByStatus).map(([key, apps]) => apps.map((app, index) => {
//
//                                            const runtime = app.runtime || 'unknown';
//
//                                            const runtimeIconMap = {
//                                                angular: '/assets/languages/angular.svg',
//                                                csharp: '/assets/languages/csharp.svg',
//                                                django: '/assets/languages/django.svg',
//                                                dotnet: '/assets/languages/dotnet.svg',
//                                                dotnetcore: '/assets/languages/dotnetcore.svg',
//                                                elixir: '/assets/languages/elixir.svg',
//                                                go: '/assets/languages/go.svg',
//                                                golang: '/assets/languages/go.svg',
//                                                java: '/assets/languages/java.svg',
//                                                javascript: '/assets/languages/javascript.svg',
//                                                kotlin: '/assets/languages/kotlin.svg',
//                                                laravel: '/assets/languages/laravel.svg',
//                                                lua: '/assets/languages/lua.svg',
//                                                nestjs: '/assets/languages/nestjs.svg',
//                                                nextjs: '/assets/languages/nextjs.svg',
//                                                node: '/assets/languages/node.svg',
//                                                nuxtjs: '/assets/languages/nuxtjs.svg',
//                                                php: '/assets/languages/php.svg',
//                                                python: '/assets/languages/python.svg',
//                                                react: '/assets/languages/react.svg',
//                                                rust: '/assets/languages/rust.svg',
//                                                springboot: '/assets/languages/springboot.svg',
//                                                'springboot-gradle': '/assets/languages/springboot-gradle.svg',
//                                                typescript: '/assets/languages/typescript.svg',
//                                                vite: '/assets/languages/vite.svg',
//                                                vuejs: '/assets/languages/vuejs.svg',
//                                                unknown: '/assets/languages/unknown.svg',
//                                            };
//
//                                            const runtimeIcon = runtimeIconMap[runtime];
//                                            const statusInfo = getStatusStyle(app.status);
//                                            //const statusKey = app.status?.toLowerCase?.() || "unknown";
//                                            const uniqueKey = `${key}-${app.ID || index}`;
//
//                                            return (
//                                                <li key={uniqueKey} className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700!">
//                                                    <div className="flex items-center gap-2.5">
//                                                        <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                                            <img
//                                                                alt={runtime}
//                                                                src={runtimeIcon}
//                                                                width={26}
//                                                                height={26}
//                                                                className="overflow-hidden rounded-sm"
//                                                            />
//                                                        </div>
//                                                        <div className="flex flex-col gap-0.5 truncate">
//                                                            <p className="font-semibold text-sm/[1.2]">{app.name || runtime.name}</p>
//                                                            <span className="line-clamp-1 max-w-[85%] truncate text-secondary text-xs/[1.25]">{app.ID}</span>
//                                                        </div>
//                                                    </div>
//
//                                                    <div className="flex w-full items-end justify-between gap-2">
//                                                        <div className="flex max-w-full flex-wrap gap-2 truncate">
//                                                            <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-700! focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                    <path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Z" />
//                                                                </svg>
//                                                                {app.cpu || '0%'}
//                                                            </span>
//                                                            <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                    <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z" />
//                                                                </svg>
//                                                                {app.memory || '256 MB'}
//                                                            </span>
//                                                        </div>
//                                                        <span className={`font-semibold transition-all h-5 rounded-sm px-2 text-[10px]/5 flex items-center gap-1.5 uppercase text-${statusInfo.color} bg-gradient-to-br ${statusInfo.gradient}`}>
//                                                            <span className={`relative block size-2.5 rounded-full bg-${statusInfo.color}`}>
//                                                                {statusInfo.animate && <span className="absolute size-2.5 rounded-full bg-inherit animate-ping" />}
//                                                            </span>
//                                                            {statusInfo.label}
//                                                        </span>
//                                                    </div>
//
//                                                    <a className="absolute inset-0" href={`/${lang}/dashboard/applications/${app.ID}`} />
//                                                    <div className="absolute top-4 right-4 flex gap-2">
//                                                        <button
//                                                            type="button"
//                                                            aria-haspopup="dialog"
//                                                            aria-expanded="false"
//                                                            aria-controls="radix-_r_8_"
//                                                            data-state="closed"
//                                                            data-slot="dialog-trigger"
//                                                            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//                                                        >
//                                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
//                                                                <path d="M120,137,48,201A12,12,0,1,1,32,183l61.91-55L32,73A12,12,0,1,1,48,55l72,64A12,12,0,0,1,120,137Zm96,43H120a12,12,0,0,0,0,24h96a12,12,0,0,0,0-24Z" />
//                                                            </svg>
//                                                        </button>
//                                                        <AppDropdownMenu app={app} onAction={handleAction} />
//                                                    </div>
//                                                </li>
//                                            );
//                                        })
//                                        )}
//
//                                    </ul>
//                                </div>
//
//                                {/* Paginação e contador */}
//                                <div className="space-y-2">
//                                    <div className="flex justify-between gap-4">
//                                        <button
//                                            disabled
//                                            className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                        >
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                            </svg>
//                                            <span className="hidden md:block">Anterior</span>
//                                        </button>
//
//                                        <div className="flex flex-col items-center">
//                                            <div className="flex justify-center gap-x-1.5">
//                                                <button className="inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                    1
//                                                </button>
//                                            </div>
//                                        </div>
//
//                                        <button
//                                            disabled
//                                            className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                        >
//                                            <span className="hidden md:block">Próximo</span>
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                            </svg>
//                                        </button>
//                                    </div>
//
//                                    <div className="text-right">
//                                        <span className="text-muted text-xs">
//                                            Total de 1 aplicação, 0 estão online e 1 está offline.
//                                        </span>
//                                    </div>
//                                </div>
//                            </div>
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div >
//            <Footer />
//        </>
//    );
//}

//frontend/src/app/[lang]/dashboard/test/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import { PlanBadge } from '@/components/PlanBadge';
//import { planOrder, getPlanTier } from '@/utils/planUtils';
//import '../../../styles/virtus.css';
//import { AppDropdownMenu } from '@/components/AppDropdownMenu';
//import { handleAction } from '@/utils/appActions';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//function getStatusStyle(status = '') {
//    const key = status.toLowerCase();
//    if (key === 'running' || key === 'online') {
//        return {
//            label: 'ONLINE',
//            color: 'green-500',
//            gradient: 'from-green-400/20 to-green-700/20',
//            animate: true
//        };
//    }
//    if (key === 'stopped' || key === 'offline') {
//        return {
//            label: 'OFFLINE',
//            color: 'red-500',
//            gradient: 'from-red-400/20 to-red-700/20',
//            animate: false
//        };
//    }
//    return {
//        label: 'DESCONHECIDO',
//        color: 'gray-500',
//        gradient: 'from-gray-400/20 to-gray-700/20',
//        animate: false
//    };
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const lang = getLang(pathname);
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const tier = getPlanTier(plan);
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);
//    const [totalMB, setTotalMB] = useState(2048);
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const [search, setSearch] = useState('');
//    const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//    //const runtime = getRuntimeInfo(app.Image); // ou app.image, dependendo da estrutura
//    //const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan(data.plan || 'no-plan');
//            setCanDeploy(data.canDeploy);
//            setUsedMB(data.usedMB || 0);
//            setTotalMB(data.totalMB || 2048);
//        };
//
//        checkSession().then(fetchUserStatus);
//        const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//        return () => clearInterval(interval);
//    }, []);
//
//    useEffect(() => {
//        const fetchAppsByStatus = async () => {
//            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//            const data = await res.json();
//
//            const removeDuplicates = (apps) => {
//                if (!Array.isArray(apps)) return [];
//                const seen = new Set();
//                return apps.filter(app => {
//                    const key = app.ID || app.ContainerName;
//                    if (seen.has(key)) return false;
//                    seen.add(key);
//                    return true;
//                });
//            };
//
//            setAppsByStatus({
//                active: removeDuplicates(data.active),
//                stopped: removeDuplicates(data.stopped),
//                backups: removeDuplicates(data.backups),
//            });
//        };
//
//        fetchAppsByStatus(); // primeira chamada imediata
//        const interval = setInterval(fetchAppsByStatus, 2000); // atualiza a cada 2s
//
//        return () => clearInterval(interval); // limpa ao desmontar
//    }, []);
//
//    //    useEffect(() => {
//    //        const fetchAppsByStatus = async () => {
//    //            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//    //            const data = await res.json();
//    //
//    //            const removeDuplicates = (apps) => {
//    //                if (!Array.isArray(apps)) return [];
//    //                const seen = new Set();
//    //                return apps.filter(app => {
//    //                    const key = app.ID || app.ContainerName;
//    //                    if (seen.has(key)) return false;
//    //                    seen.add(key);
//    //                    return true;
//    //                });
//    //            };
//    //
//    //            setAppsByStatus({
//    //                active: removeDuplicates(data.active),
//    //                stopped: removeDuplicates(data.stopped),
//    //                backups: removeDuplicates(data.backups),
//    //            });
//    //        };
//    //
//    //        fetchAppsByStatus();
//    //    }, []);
//
//    if (loading) return null;
//
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 bg-grid-virtus-600/[0.2] pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                            <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">Sua conta</span>
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span
//                                        className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md"
//                                    >
//                                        <PlanBadge plan={plan} tier={tier} />
//                                    </span>
//
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">1.280 MB</span>
//                                                <span className="text-nowrap text-muted text-xs">768 MB disponível de 2.048 MB</span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div
//                                                    className="absolute inset-0 h-full rounded-full"
//                                                    style={{ backgroundColor: 'rgb(229, 212, 93)', width: '62.5%' }}
//                                                />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    <button
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                            <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                        </svg>
//                                        Renovar
//                                    </button>
//
//                                    <button
//                                        onClick={() => setShowUpgradeModal(true)}
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1 border-virtus-500 bg-transparent"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-600">
//                                            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//                                        </svg>
//                                        Upgrade
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        <div className="relative bg-background">
//                            <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                <div className="flex items-center gap-2.5 md:gap-3.5">
//                                    <div className="flex size-5 items-center justify-center text-blue-500">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                        </svg>
//                                    </div>
//                                    <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                </div>
//
//                                <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                    <span className="block w-full text-sm text-secondary">
//                                        Está pronto para transformar sua experiência? Com o{" "}
//                                        <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                            standard
//                                        </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                        <ul className="list-inside list-disc mt-1">
//                                            <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                            <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                            <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                        </ul>
//                                    </span>
//
//                                    <button
//                                        onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                        className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                    >
//                                        Fazer upgrade
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//
//                                <button
//                                    onClick={() => setShowUpgradeModal(false)}
//                                    className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                >
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                    </svg>
//                                </button>
//                            </div>
//                        </div>
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            {/* Barra de busca e botões */}
//                            <div className="flex flex-col gap-2 md:flex-row">
//                                <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                    <input
//                                        value={search}
//                                        onChange={(e) => setSearch(e.target.value)}
//                                        placeholder="Pesquisar em aplicações..."
//                                        className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                                    />
//                                    <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                        </svg>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-wrap gap-2">
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-background shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                        </svg>
//                                        Organizar
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-blue-700 hover:bg-blue-800 h-10 px-4 w-52 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
//                                        </svg>
//                                        Nova aplicação
//                                    </button>
//                                </div>
//                            </div>
//
//                            {/* Grid de aplicações */}
//                            <div className="flex min-h-[752px] flex-col gap-4 lg:h-[calc(100dvh-300px)]">
//                                <div className="flex min-h-0 flex-1 flex-col">
//                                    <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                        {Object.entries(appsByStatus).map(([key, apps]) => apps.map((app, index) => {
//
//                                            const runtime = app.runtime || 'unknown';
//
//                                            const runtimeIconMap = {
//                                                node: '/assets/languages/javascript.svg',
//                                                python: '/assets/languages/python.svg',
//                                                golang: '/assets/languages/go.svg',
//                                                php: '/assets/languages/php.svg',
//                                                java: '/assets/languages/java.svg',
//                                                rust: '/assets/languages/rust.svg',
//                                                csharp: '/assets/languages/csharp.svg',
//                                                elixir: '/assets/languages/elixir.svg',
//                                                kotlin: '/assets/languages/kotlin.svg',
//                                                lua: '/assets/languages/lua.svg',
//                                                unknown: '/assets/languages/unknown.svg',
//                                            };
//
//                                            const runtimeIcon = runtimeIconMap[runtime];
//                                            const statusInfo = getStatusStyle(app.status);
//                                            //const statusKey = app.status?.toLowerCase?.() || "unknown";
//                                            const uniqueKey = `${key}-${app.ID || index}`;
//
//                                            return (
//                                                <li key={uniqueKey} className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700">
//                                                    <div className="flex items-center gap-2.5">
//                                                        <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                                            <img
//                                                                alt={runtime}
//                                                                src={runtimeIcon}
//                                                                width={26}
//                                                                height={26}
//                                                                className="overflow-hidden rounded-sm"
//                                                            />
//                                                        </div>
//                                                        <div className="flex flex-col gap-0.5 truncate">
//                                                            <p className="font-semibold text-sm/[1.2]">{app.name || runtime.name}</p>
//                                                            <span className="line-clamp-1 max-w-[85%] truncate text-secondary text-xs/[1.25]">{app.ID}</span>
//                                                        </div>
//                                                    </div>
//
//                                                    <div className="flex w-full items-end justify-between gap-2">
//                                                        <div className="flex max-w-full flex-wrap gap-2 truncate">
//                                                            <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                    <path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Z" />
//                                                                </svg>
//                                                                {app.cpu || '0%'}
//                                                            </span>
//                                                            <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                    <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z" />
//                                                                </svg>
//                                                                {app.memory || '256 MB'}
//                                                            </span>
//                                                        </div>
//                                                        <span className={`font-semibold transition-all h-5 rounded-sm px-2 text-[10px]/5 flex items-center gap-1.5 uppercase text-${statusInfo.color} bg-gradient-to-br ${statusInfo.gradient}`}>
//                                                            <span className={`relative block size-2.5 rounded-full bg-${statusInfo.color}`}>
//                                                                {statusInfo.animate && <span className="absolute size-2.5 rounded-full bg-inherit animate-ping" />}
//                                                            </span>
//                                                            {statusInfo.label}
//                                                        </span>
//                                                    </div>
//
//                                                    <a className="absolute inset-0" href={`/${lang}/dashboard/applications/${app.ID}`} />
//                                                    <div className="absolute top-4 right-4 flex gap-2">
//                                                        <button
//                                                            type="button"
//                                                            aria-haspopup="dialog"
//                                                            aria-expanded="false"
//                                                            aria-controls="radix-_r_8_"
//                                                            data-state="closed"
//                                                            data-slot="dialog-trigger"
//                                                            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//                                                        >
//                                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
//                                                                <path d="M120,137,48,201A12,12,0,1,1,32,183l61.91-55L32,73A12,12,0,1,1,48,55l72,64A12,12,0,0,1,120,137Zm96,43H120a12,12,0,0,0,0,24h96a12,12,0,0,0,0-24Z" />
//                                                            </svg>
//                                                        </button>
//                                                        <AppDropdownMenu app={app} onAction={handleAction} />
//                                                    </div>
//                                                </li>
//                                            );
//                                        })
//                                        )}
//
//                                    </ul>
//                                </div>
//
//                                {/* Paginação e contador */}
//                                <div className="space-y-2">
//                                    <div className="flex justify-between gap-4">
//                                        <button
//                                            disabled
//                                            className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                        >
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                            </svg>
//                                            <span className="hidden md:block">Anterior</span>
//                                        </button>
//
//                                        <div className="flex flex-col items-center">
//                                            <div className="flex justify-center gap-x-1.5">
//                                                <button className="inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                    1
//                                                </button>
//                                            </div>
//                                        </div>
//
//                                        <button
//                                            disabled
//                                            className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                        >
//                                            <span className="hidden md:block">Próximo</span>
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                            </svg>
//                                        </button>
//                                    </div>
//
//                                    <div className="text-right">
//                                        <span className="text-muted text-xs">
//                                            Total de 1 aplicação, 0 estão online e 1 está offline.
//                                        </span>
//                                    </div>
//                                </div>
//                            </div>
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div >
//            <Footer />
//        </>
//    );
//}

//frontend/src/app/[lang]/dashboard/test/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import { PlanBadge } from '@/components/PlanBadge';
//import { planOrder, getPlanTier } from '@/utils/planUtils';
//import '../../../styles/virtus.css';
//import { AppDropdownMenu } from '@/components/AppDropdownMenu';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//function getRuntimeInfo(imageName = '') {
//    const lower = imageName.toLowerCase();
//    if (lower.includes('python')) return { name: 'Python', icon: '/assets/languages/python.svg' };
//    if (lower.includes('node') || lower.includes('javascript')) return { name: 'JavaScript', icon: '/assets/languages/javascript.svg' };
//    if (lower.includes('ruby')) return { name: 'Ruby', icon: '/assets/languages/ruby.svg' };
//    if (lower.includes('java')) return { name: 'Java', icon: '/assets/languages/java.svg' };
//    if (lower.includes('go')) return { name: 'Go', icon: '/assets/languages/go.svg' };
//    return { name: 'Desconhecido', icon: '/assets/languages/unknown.svg' };
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const lang = getLang(pathname);
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const tier = getPlanTier(plan);
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);
//    const [totalMB, setTotalMB] = useState(2048);
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const [search, setSearch] = useState('');
//    const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//    //const runtime = getRuntimeInfo(app.Image); // ou app.image, dependendo da estrutura
//    //const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan(data.plan || 'no-plan');
//            setCanDeploy(data.canDeploy);
//            setUsedMB(data.usedMB || 0);
//            setTotalMB(data.totalMB || 2048);
//        };
//
//        checkSession().then(fetchUserStatus);
//        const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//        return () => clearInterval(interval);
//    }, []);
//
//    useEffect(() => {
//        const fetchAppsByStatus = async () => {
//            const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//            const data = await res.json();
//
//            const removeDuplicates = (apps) => {
//                if (!Array.isArray(apps)) return [];
//                const seen = new Set();
//                return apps.filter(app => {
//                    const key = app.ID || app.ContainerName;
//                    if (seen.has(key)) return false;
//                    seen.add(key);
//                    return true;
//                });
//            };
//
//            setAppsByStatus({
//                active: removeDuplicates(data.active),
//                stopped: removeDuplicates(data.stopped),
//                backups: removeDuplicates(data.backups),
//            });
//        };
//
//        fetchAppsByStatus();
//    }, []);
//
//    if (loading) return null;
//
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 bg-grid-virtus-600/[0.2] pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                            <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">Sua conta</span>
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span
//                                        className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md"
//                                    >
//                                        <PlanBadge plan={plan} tier={tier} />
//                                    </span>
//
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">1.280 MB</span>
//                                                <span className="text-nowrap text-muted text-xs">768 MB disponível de 2.048 MB</span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div
//                                                    className="absolute inset-0 h-full rounded-full"
//                                                    style={{ backgroundColor: 'rgb(229, 212, 93)', width: '62.5%' }}
//                                                />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    <button
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                            <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                        </svg>
//                                        Renovar
//                                    </button>
//
//                                    <button
//                                        onClick={() => setShowUpgradeModal(true)}
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1 border-virtus-500 bg-transparent"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-600">
//                                            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//                                        </svg>
//                                        Upgrade
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        <div className="relative bg-background">
//                            <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                <div className="flex items-center gap-2.5 md:gap-3.5">
//                                    <div className="flex size-5 items-center justify-center text-blue-500">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                        </svg>
//                                    </div>
//                                    <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                </div>
//
//                                <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                    <span className="block w-full text-sm text-secondary">
//                                        Está pronto para transformar sua experiência? Com o{" "}
//                                        <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                            standard
//                                        </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                        <ul className="list-inside list-disc mt-1">
//                                            <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                            <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                            <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                        </ul>
//                                    </span>
//
//                                    <button
//                                        onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                        className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                    >
//                                        Fazer upgrade
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//
//                                <button
//                                    onClick={() => setShowUpgradeModal(false)}
//                                    className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                >
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                    </svg>
//                                </button>
//                            </div>
//                        </div>
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            {/* Barra de busca e botões */}
//                            <div className="flex flex-col gap-2 md:flex-row">
//                                <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                    <input
//                                        value={search}
//                                        onChange={(e) => setSearch(e.target.value)}
//                                        placeholder="Pesquisar em aplicações..."
//                                        className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                                    />
//                                    <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                        </svg>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-wrap gap-2">
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-background shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                        </svg>
//                                        Organizar
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-blue-700 hover:bg-blue-800 h-10 px-4 w-52 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
//                                        </svg>
//                                        Nova aplicação
//                                    </button>
//                                </div>
//                            </div>
//
//                            {/* Grid de aplicações */}
//                            <div className="flex min-h-[752px] flex-col gap-4 lg:h-[calc(100dvh-300px)]">
//                                <div className="flex min-h-0 flex-1 flex-col">
//                                    <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                        {Object.entries(appsByStatus).map(([key, apps]) => apps.map((app, index) => {
//
//                                            const runtime = getRuntimeInfo(app.Image); // ou app.image
//                                            const statusKey = app.status?.toLowerCase?.() || "unknown";
//                                            const uniqueKey = `${key}-${app.ID || index}`;
//
//                                            return (
//                                                <li key={uniqueKey} className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700">
//                                                    <div className="flex items-center gap-2.5">
//                                                        <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                                            <img
//                                                                alt={runtime.name}
//                                                                src={runtime.icon}
//                                                                width={26}
//                                                                height={26}
//                                                                className="overflow-hidden rounded-sm"
//                                                            />
//                                                        </div>
//                                                        <div className="flex flex-col gap-0.5 truncate">
//                                                            <p className="font-semibold text-sm/[1.2]">{app.name || runtime.name}</p>
//                                                            <span className="line-clamp-1 max-w-[85%] truncate text-secondary text-xs/[1.25]">{app.ID}</span>
//                                                        </div>
//                                                    </div>
//
//                                                    <div className="flex w-full items-end justify-between gap-2">
//                                                        <div className="flex max-w-full flex-wrap gap-2 truncate">
//                                                            <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                    <path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Z" />
//                                                                </svg>
//                                                                {app.cpu || '0%'}
//                                                            </span>
//                                                            <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                                    <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z" />
//                                                                </svg>
//                                                                {app.memory || '256 MB'}
//                                                            </span>
//                                                        </div>
//                                                        <span className="font-semibold transition-all h-5 rounded-sm px-2 text-[10px]/5 flex items-center gap-1.5 uppercase bg-gradient-to-br from-red-400/20 to-red-700/20 text-red-500">
//                                                            <span className="relative block size-2.5 rounded-full bg-red-500">
//                                                                <span className="absolute size-2.5 rounded-full bg-inherit" />
//                                                            </span>
//                                                            {app.status || 'Offline'}
//                                                        </span>
//                                                    </div>
//
//                                                    <a className="absolute inset-0" href={`/${lang}/dashboard/applications/${app.ID}`} />
//                                                    <div className="absolute top-4 right-4 flex gap-2">
//                                                        <button
//                                                            type="button"
//                                                            aria-haspopup="dialog"
//                                                            aria-expanded="false"
//                                                            aria-controls="radix-_r_8_"
//                                                            data-state="closed"
//                                                            data-slot="dialog-trigger"
//                                                            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//                                                        >
//                                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
//                                                                <path d="M120,137,48,201A12,12,0,1,1,32,183l61.91-55L32,73A12,12,0,1,1,48,55l72,64A12,12,0,0,1,120,137Zm96,43H120a12,12,0,0,0,0,24h96a12,12,0,0,0,0-24Z" />
//                                                            </svg>
//                                                        </button>
//                                                        <AppDropdownMenu appId={app.ID} />
//                                                    </div>
//                                                </li>
//                                            );
//                                        })
//                                        )}
//
//                                    </ul>
//                                </div>
//
//                                {/* Paginação e contador */}
//                                <div className="space-y-2">
//                                    <div className="flex justify-between gap-4">
//                                        <button
//                                            disabled
//                                            className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                        >
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                            </svg>
//                                            <span className="hidden md:block">Anterior</span>
//                                        </button>
//
//                                        <div className="flex flex-col items-center">
//                                            <div className="flex justify-center gap-x-1.5">
//                                                <button className="inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                    1
//                                                </button>
//                                            </div>
//                                        </div>
//
//                                        <button
//                                            disabled
//                                            className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                        >
//                                            <span className="hidden md:block">Próximo</span>
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                            </svg>
//                                        </button>
//                                    </div>
//
//                                    <div className="text-right">
//                                        <span className="text-muted text-xs">
//                                            Total de 1 aplicação, 0 estão online e 1 está offline.
//                                        </span>
//                                    </div>
//                                </div>
//                            </div>
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div >
//            <Footer />
//        </>
//    );
//}

//frontend/src/app/[lang]/dashboard/test/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import { PlanBadge } from '@/components/PlanBadge';
//import { planOrder, getPlanTier } from '@/utils/planUtils';
//import '../../../styles/virtus.css';
//import { AppDropdownMenu } from '@/components/AppDropdownMenu';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const lang = getLang(pathname);
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const tier = getPlanTier(plan);
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);
//    const [totalMB, setTotalMB] = useState(2048);
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const [search, setSearch] = useState('');
//    //const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan(data.plan || 'no-plan');
//            setCanDeploy(data.canDeploy);
//            setUsedMB(data.usedMB || 0);
//            setTotalMB(data.totalMB || 2048);
//        };
//
//        checkSession().then(fetchUserStatus);
//        const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//        return () => clearInterval(interval);
//    }, []);
//
//    if (loading) return null;
//
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 bg-grid-virtus-600/[0.2] pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                            <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">Sua conta</span>
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span
//                                        className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md"
//                                    >
//                                        <PlanBadge plan={plan} tier={tier} />
//                                    </span>
//
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">1.280 MB</span>
//                                                <span className="text-nowrap text-muted text-xs">768 MB disponível de 2.048 MB</span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div
//                                                    className="absolute inset-0 h-full rounded-full"
//                                                    style={{ backgroundColor: 'rgb(229, 212, 93)', width: '62.5%' }}
//                                                />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    <button
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                            <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                        </svg>
//                                        Renovar
//                                    </button>
//
//                                    <button
//                                        onClick={() => setShowUpgradeModal(true)}
//                                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1 border-virtus-500 bg-transparent"
//                                        role="button"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-600">
//                                            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//                                        </svg>
//                                        Upgrade
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        <div className="relative bg-background">
//                            <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                <div className="flex items-center gap-2.5 md:gap-3.5">
//                                    <div className="flex size-5 items-center justify-center text-blue-500">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                        </svg>
//                                    </div>
//                                    <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                </div>
//
//                                <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                    <span className="block w-full text-sm text-secondary">
//                                        Está pronto para transformar sua experiência? Com o{" "}
//                                        <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                            standard
//                                        </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                        <ul className="list-inside list-disc mt-1">
//                                            <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                            <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                            <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                        </ul>
//                                    </span>
//
//                                    <button
//                                        onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                        className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                    >
//                                        Fazer upgrade
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//
//                                <button
//                                    onClick={() => setShowUpgradeModal(false)}
//                                    className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                >
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                    </svg>
//                                </button>
//                            </div>
//                        </div>
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            {/* Barra de busca e botões */}
//                            <div className="flex flex-col gap-2 md:flex-row">
//                                <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                    <input
//                                        value={search}
//                                        onChange={(e) => setSearch(e.target.value)}
//                                        placeholder="Pesquisar em aplicações..."
//                                        className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                                    />
//                                    <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                        </svg>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-wrap gap-2">
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-background shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                        </svg>
//                                        Organizar
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    <button className="group/button relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium text-primary bg-blue-700 hover:bg-blue-800 h-10 px-4 w-52 flex-auto">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
//                                        </svg>
//                                        Nova aplicação
//                                    </button>
//                                </div>
//                            </div>
//
//                            {/* Grid de aplicações */}
//                            <div className="flex min-h-[752px] flex-col gap-4 lg:h-[calc(100dvh-300px)]">
//                                <div className="flex min-h-0 flex-1 flex-col">
//                                    <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                        <li className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700" style={{ opacity: 1 }}>
//                                            <div className="flex items-center gap-2.5">
//                                                <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                                    <img
//                                                        alt="javascript"
//                                                        loading="lazy"
//                                                        width={26}
//                                                        height={26}
//                                                        decoding="async"
//                                                        data-nimg="1"
//                                                        className="overflow-hidden rounded-sm"
//                                                        src="/assets/languages/javascript.svg"
//                                                        style={{ color: 'transparent' }}
//                                                    />
//                                                </div>
//                                                <div className="flex flex-col gap-0.5 truncate">
//                                                    <p className="font-semibold text-sm/[1.2]">Voice Maker</p>
//                                                    <span className="line-clamp-1 max-w-[85%] truncate text-secondary text-xs/[1.25]">baa95673b53845478d218620ffd128ec</span>
//                                                </div>
//                                            </div>
//
//                                            <div className="flex w-full items-end justify-between gap-2">
//                                                <div className="flex max-w-full flex-wrap gap-2 truncate">
//                                                    <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                            <path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Z" />
//                                                        </svg>
//                                                        0%
//                                                    </span>
//                                                    <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted">
//                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                            <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z" />
//                                                        </svg>
//                                                        256 MB
//                                                    </span>
//                                                </div>
//                                                <span className="font-semibold transition-all h-5 rounded-sm px-2 text-[10px]/5 flex items-center gap-1.5 uppercase bg-gradient-to-br from-red-400/20 to-red-700/20 text-red-500">
//                                                    <span className="relative block size-2.5 rounded-full bg-red-500">
//                                                        <span className="absolute size-2.5 rounded-full bg-inherit" />
//                                                    </span>
//                                                    Offline
//                                                </span>
//                                            </div>
//
//                                            <a className="absolute inset-0" href="/pt-br/dashboard/applications/baa95673b53845478d218620ffd128ec" />
//
//                                            <div className="absolute top-4 right-4 flex gap-2">
//                                                <button
//                                                    type="button"
//                                                    aria-haspopup="dialog"
//                                                    aria-expanded="false"
//                                                    aria-controls="radix-_r_8_"
//                                                    data-state="closed"
//                                                    data-slot="dialog-trigger"
//                                                    className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//                                                >
//                                                    <svg
//                                                        xmlns="http://www.w3.org/2000/svg"
//                                                        width="1em"
//                                                        height="1em"
//                                                        fill="currentColor"
//                                                        viewBox="0 0 256 256"
//                                                        className="size-4"
//                                                    >
//                                                        <path d="M120,137,48,201A12,12,0,1,1,32,183l61.91-55L32,73A12,12,0,1,1,48,55l72,64A12,12,0,0,1,120,137Zm96,43H120a12,12,0,0,0,0,24h96a12,12,0,0,0,0-24Z" />
//                                                    </svg>
//                                                </button>
//                                                <AppDropdownMenu />
//                                            </div>
//                                        </li>
//                                    </ul>
//                                </div>
//
//                                {/* Paginação e contador */}
//                                <div className="space-y-2">
//                                    <div className="flex justify-between gap-4">
//                                        <button
//                                            disabled
//                                            className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                        >
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                            </svg>
//                                            <span className="hidden md:block">Anterior</span>
//                                        </button>
//
//                                        <div className="flex flex-col items-center">
//                                            <div className="flex justify-center gap-x-1.5">
//                                                <button className="inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                    1
//                                                </button>
//                                            </div>
//                                        </div>
//
//                                        <button
//                                            disabled
//                                            className="inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                        >
//                                            <span className="hidden md:block">Próximo</span>
//                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                            </svg>
//                                        </button>
//                                    </div>
//
//                                    <div className="text-right">
//                                        <span className="text-muted text-xs">
//                                            Total de 1 aplicação, 0 estão online e 1 está offline.
//                                        </span>
//                                    </div>
//                                </div>
//                            </div>
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div >
//            <Footer />
//        </>
//    );
//}

//<div id="dropdown-root"> /

//frontend/src/app/[lang]/dashboard/test/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import { PlanBadge } from '@/components/PlanBadge';
//import { planOrder, getPlanTier } from '@/utils/planUtils';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const lang = getLang(pathname);
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const tier = getPlanTier(plan);
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);
//    const [totalMB, setTotalMB] = useState(2048);
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    //const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan(data.plan || 'no-plan');
//            setCanDeploy(data.canDeploy);
//            setUsedMB(data.usedMB || 0);
//            setTotalMB(data.totalMB || 2048);
//        };
//
//        checkSession().then(fetchUserStatus);
//        const interval = setInterval(fetchUserStatus, 2000); // atualiza a cada 2s
//        return () => clearInterval(interval);
//    }, []);
//
//    if (loading) return null;
//
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 bg-grid-virtus-600/[0.2] pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                            <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">Sua conta</span>
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md">
//                                        <PlanBadge plan={plan} tier={tier} />
//                                    </span>
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88">
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">{usedMB} MB</span>
//                                                <span className="text-muted text-xs">{totalMB - usedMB} MB disponível de {totalMB} MB</span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div className="absolute inset-0 h-full rounded-full" style={{ backgroundColor: 'rgb(229, 212, 93)', width: `${percentUsed}%` }} />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 flex-1 text-sm text-primary font-medium">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                            <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                        </svg>
//                                        Renovar
//                                    </button>
//                                    <button onClick={() => setShowUpgradeModal(true)} className="group/button inline-flex items-center justify-center gap-2 rounded-md border border-virtus-500 bg-transparent hover:bg-virtus-600 h-10 px-4 flex-1 text-sm text-primary font-medium">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-600">
//                                            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//                                        </svg>
//                                        Upgrade
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        <div className="relative bg-background">
//                            <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                <div className="flex items-center gap-2.5 md:gap-3.5">
//                                    <div className="flex size-5 items-center justify-center text-blue-500">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                        </svg>
//                                    </div>
//                                    <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                </div>
//
//                                <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                    <span className="block w-full text-sm text-secondary">
//                                        Está pronto para transformar sua experiência? Com o{" "}
//                                        <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                            standard
//                                        </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                        <ul className="list-inside list-disc mt-1">
//                                            <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                            <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                            <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                        </ul>
//                                    </span>
//
//                                    <button
//                                        onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                        className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                    >
//                                        Fazer upgrade
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//
//                                <button
//                                    onClick={() => setShowUpgradeModal(false)}
//                                    className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                >
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                    </svg>
//                                </button>
//                            </div>
//                        </div>
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex flex-col gap-2 md:flex-row">
//                            <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                <input
//                                    className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted"
//                                    placeholder="Pesquisar em aplicações..."
//                                />
//                                <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                    </svg>
//                                </div>
//                            </div>
//
//                            <div className="flex flex-wrap gap-2">
//                                <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto text-sm text-primary font-medium">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                    </svg>
//                                    Organizar
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                    </svg>
//                                </button>
//
//                                <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 hover:bg-blue-800 h-10 px-4 w-52 flex-auto text-sm text-white font-medium">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
//                                    </svg>
//                                    Nova aplicação
//                                    {/* <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" /> */}
//                                </button>
//                            </div>
//                        </div>
//
//                        {/* Card de aplicação (exemplo) */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                <li className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700">
//                                    <div className="flex items-center gap-2.5">
//                                        <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                            <img alt="javascript" width="26" height="26" src="/assets/languages/javascript.svg" className="rounded-sm" />
//                                        </div>
//                                        <div className="flex flex-col gap-0.5 truncate">
//                                            <p className="font-semibold text-sm">Voice Maker</p>
//                                            <span className="truncate text-secondary text-xs">baa95673b53845478d218620ffd128ec</span>
//                                        </div>
//                                    </div>
//                                    <div className="flex w-full items-end justify-between gap-2">
//                                        <div className="flex flex-wrap gap-2">
//                                            <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Zm88,0H216V112h16a8,8,0,0,0,0-16H216V56a16,16,0,0,0-16-16H160V24a8,8,0,0,0-16,0V40H112V24a8,8,0,0,0-16,0V40H56A16,16,0,0,0,40,56V96H24a8,8,0,0,0,0,16H40v32H24a8,8,0,0,0,0,16H40v40a16,16,0,0,0,16,16H96v16a8,8,0,0,0,16,0V216h32v16a8,8,0,0,0,16,0V216h40a16,16,0,0,0,16-16V160h16a8,8,0,0,0,0-16Zm-32,56H56V56H200v95.87s0,.09,0,.13,0,.09,0,.13V200Z"></path></svg>0%</span>
//                                            <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z"></path></svg>256 MB</span>
//                                        </div>
//                                        <span className="font-semibold h-5 px-2 text-[10px] uppercase bg-gradient-to-br from-red-400/20 to-red-700/20 text-red-500 flex items-center gap-1.5 rounded-sm">
//                                            <span className="relative block size-2.5 rounded-full bg-red-500" />
//                                            Offline
//                                        </span>
//                                    </div>
//                                    <a className="absolute inset-0" href="/pt-br/dashboard/applications/baa95673b53845478d218620ffd128ec" />
//                                </li>
//                            </ul>
//                            {/* Paginação + contador */}
//                            <div className="space-y-2">
//                                <div className="flex justify-between gap-4">
//                                    <button
//                                        disabled
//                                        className="group/button inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                        </svg>
//                                        <span className="hidden md:block">Anterior</span>
//                                    </button>
//
//                                    <div className="flex flex-col items-center">
//                                        <div className="flex justify-center gap-x-1.5">
//                                            <button className="group/button inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                1
//                                            </button>
//                                        </div>
//                                    </div>
//
//                                    <button
//                                        disabled
//                                        className="group/button inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                    >
//                                        <span className="hidden md:block">Próximo</span>
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//
//                                <div className="text-right">
//                                    <span className="text-muted text-xs">
//                                        Total de 1 aplicação, 0 estão online e 1 está offline.
//                                    </span>
//                                </div>
//                            </div>
//
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div>
//            <Footer />
//        </>
//    );
//}

//frontend/src/app/[lang]/dashboard/test/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import { PlanBadge } from '@/components/PlanBadge';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const lang = getLang(pathname);
//
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);
//    const [totalMB, setTotalMB] = useState(2048);
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan(data.plan || 'no-plan');
//            setCanDeploy(data.canDeploy);
//            setUsedMB(data.usedMB || 0);
//            setTotalMB(data.totalMB || 2048);
//        };
//
//        checkSession().then(fetchUserStatus);
//    }, []);
//
//    if (loading) return null;
//
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 bg-grid-virtus-600/[0.2] pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                            <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">Sua conta</span>
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md">
//                                        <PlanBadge plan={plan} tier={`${usedMB / 512}`}/>
//                                    </span>
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88">
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">{usedMB} MB</span>
//                                                <span className="text-muted text-xs">{totalMB - usedMB} MB disponível de {totalMB} MB</span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div className="absolute inset-0 h-full rounded-full" style={{ backgroundColor: 'rgb(229, 212, 93)', width: `${percentUsed}%` }} />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 flex-1 text-sm text-primary font-medium">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                            <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                        </svg>
//                                        Renovar
//                                    </button>
//                                    <button onClick={() => setShowUpgradeModal(true)} className="group/button inline-flex items-center justify-center gap-2 rounded-md border border-virtus-500 bg-transparent hover:bg-virtus-600 h-10 px-4 flex-1 text-sm text-primary font-medium">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-600">
//                                            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//                                        </svg>
//                                        Upgrade
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        <div className="relative bg-background">
//                            <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                <div className="flex items-center gap-2.5 md:gap-3.5">
//                                    <div className="flex size-5 items-center justify-center text-blue-500">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                        </svg>
//                                    </div>
//                                    <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                </div>
//
//                                <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                    <span className="block w-full text-sm text-secondary">
//                                        Está pronto para transformar sua experiência? Com o{" "}
//                                        <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                            standard
//                                        </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                        <ul className="list-inside list-disc mt-1">
//                                            <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                            <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                            <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                        </ul>
//                                    </span>
//
//                                    <button
//                                        onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                        className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                    >
//                                        Fazer upgrade
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//
//                                <button
//                                    onClick={() => setShowUpgradeModal(false)}
//                                    className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                >
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                    </svg>
//                                </button>
//                            </div>
//                        </div>
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex flex-col gap-2 md:flex-row">
//                            <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                <input
//                                    className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted"
//                                    placeholder="Pesquisar em aplicações..."
//                                />
//                                <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                    </svg>
//                                </div>
//                            </div>
//
//                            <div className="flex flex-wrap gap-2">
//                                <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto text-sm text-primary font-medium">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                    </svg>
//                                    Organizar
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                    </svg>
//                                </button>
//
//                                <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 hover:bg-blue-800 h-10 px-4 w-52 flex-auto text-sm text-white font-medium">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
//                                    </svg>
//                                    Nova aplicação
//                                    {/* <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" /> */}
//                                </button>
//                            </div>
//                        </div>
//
//                        {/* Card de aplicação (exemplo) */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                <li className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700">
//                                    <div className="flex items-center gap-2.5">
//                                        <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                            <img alt="javascript" width="26" height="26" src="/assets/languages/javascript.svg" className="rounded-sm" />
//                                        </div>
//                                        <div className="flex flex-col gap-0.5 truncate">
//                                            <p className="font-semibold text-sm">Voice Maker</p>
//                                            <span className="truncate text-secondary text-xs">baa95673b53845478d218620ffd128ec</span>
//                                        </div>
//                                    </div>
//                                    <div className="flex w-full items-end justify-between gap-2">
//                                        <div className="flex flex-wrap gap-2">
//                                            <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Zm88,0H216V112h16a8,8,0,0,0,0-16H216V56a16,16,0,0,0-16-16H160V24a8,8,0,0,0-16,0V40H112V24a8,8,0,0,0-16,0V40H56A16,16,0,0,0,40,56V96H24a8,8,0,0,0,0,16H40v32H24a8,8,0,0,0,0,16H40v40a16,16,0,0,0,16,16H96v16a8,8,0,0,0,16,0V216h32v16a8,8,0,0,0,16,0V216h40a16,16,0,0,0,16-16V160h16a8,8,0,0,0,0-16Zm-32,56H56V56H200v95.87s0,.09,0,.13,0,.09,0,.13V200Z"></path></svg>0%</span>
//                                            <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z"></path></svg>256 MB</span>
//                                        </div>
//                                        <span className="font-semibold h-5 px-2 text-[10px] uppercase bg-gradient-to-br from-red-400/20 to-red-700/20 text-red-500 flex items-center gap-1.5 rounded-sm">
//                                            <span className="relative block size-2.5 rounded-full bg-red-500" />
//                                            Offline
//                                        </span>
//                                    </div>
//                                    <a className="absolute inset-0" href="/pt-br/dashboard/applications/baa95673b53845478d218620ffd128ec" />
//                                </li>
//                            </ul>
//                            {/* Paginação + contador */}
//                            <div className="space-y-2">
//                                <div className="flex justify-between gap-4">
//                                    <button
//                                        disabled
//                                        className="group/button inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                        </svg>
//                                        <span className="hidden md:block">Anterior</span>
//                                    </button>
//
//                                    <div className="flex flex-col items-center">
//                                        <div className="flex justify-center gap-x-1.5">
//                                            <button className="group/button inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                1
//                                            </button>
//                                        </div>
//                                    </div>
//
//                                    <button
//                                        disabled
//                                        className="group/button inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                    >
//                                        <span className="hidden md:block">Próximo</span>
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//
//                                <div className="text-right">
//                                    <span className="text-muted text-xs">
//                                        Total de 1 aplicação, 0 estão online e 1 está offline.
//                                    </span>
//                                </div>
//                            </div>
//
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div>
//            <Footer />
//        </>
//    );
//}

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//import { PlanBadge } from '@/components/PlanBadge';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const lang = getLang(pathname);
//
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);
//    const [totalMB, setTotalMB] = useState(2048);
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan(data.plan || 'no-plan');
//            setCanDeploy(data.canDeploy);
//            setUsedMB(data.usedMB || 0);
//            setTotalMB(data.totalMB || 2048);
//        };
//
//        checkSession().then(fetchUserStatus);
//    }, []);
//
//    if (loading) return null;
//
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 bg-grid-virtus-600/[0.2] pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                            <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">Sua conta</span>
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md">
//                                        {plan} ({usedMB / 512})
//                                    </span>
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88">
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">{usedMB} MB</span>
//                                                <span className="text-muted text-xs">{totalMB - usedMB} MB disponível de {totalMB} MB</span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div className="absolute inset-0 h-full rounded-full" style={{ backgroundColor: 'rgb(229, 212, 93)', width: `${percentUsed}%` }} />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 flex-1 text-sm text-primary font-medium">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                            <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                        </svg>
//                                        Renovar
//                                    </button>
//                                    <button onClick={() => setShowUpgradeModal(true)} className="group/button inline-flex items-center justify-center gap-2 rounded-md border border-virtus-500 bg-transparent hover:bg-virtus-600 h-10 px-4 flex-1 text-sm text-primary font-medium">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-600">
//                                            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//                                        </svg>
//                                        Upgrade
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        <div className="relative bg-background">
//                            <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                <div className="flex items-center gap-2.5 md:gap-3.5">
//                                    <div className="flex size-5 items-center justify-center text-blue-500">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                        </svg>
//                                    </div>
//                                    <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                </div>
//
//                                <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                    <span className="block w-full text-sm text-secondary">
//                                        Está pronto para transformar sua experiência? Com o{" "}
//                                        <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                            standard
//                                        </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                        <ul className="list-inside list-disc mt-1">
//                                            <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                            <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                            <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                        </ul>
//                                    </span>
//
//                                    <button
//                                        onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                        className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                    >
//                                        Fazer upgrade
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//
//                                <button
//                                    onClick={() => setShowUpgradeModal(false)}
//                                    className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                >
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                    </svg>
//                                </button>
//                            </div>
//                        </div>
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex flex-col gap-2 md:flex-row">
//                            <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                <input
//                                    className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted"
//                                    placeholder="Pesquisar em aplicações..."
//                                />
//                                <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                    </svg>
//                                </div>
//                            </div>
//
//                            <div className="flex flex-wrap gap-2">
//                                <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto text-sm text-primary font-medium">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                    </svg>
//                                    Organizar
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                    </svg>
//                                </button>
//
//                                <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 hover:bg-blue-800 h-10 px-4 w-52 flex-auto text-sm text-white font-medium">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
//                                    </svg>
//                                    Nova aplicação
//                                    {/* <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" /> */}
//                                </button>
//                            </div>
//                        </div>
//
//                        {/* Card de aplicação (exemplo) */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                <li className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700">
//                                    <div className="flex items-center gap-2.5">
//                                        <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                            <img alt="javascript" width="26" height="26" src="/assets/languages/javascript.svg" className="rounded-sm" />
//                                        </div>
//                                        <div className="flex flex-col gap-0.5 truncate">
//                                            <p className="font-semibold text-sm">Voice Maker</p>
//                                            <span className="truncate text-secondary text-xs">baa95673b53845478d218620ffd128ec</span>
//                                        </div>
//                                    </div>
//                                    <div className="flex w-full items-end justify-between gap-2">
//                                        <div className="flex flex-wrap gap-2">
//                                            <span className="inline-flex items-center gap-1.5 transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Zm88,0H216V112h16a8,8,0,0,0,0-16H216V56a16,16,0,0,0-16-16H160V24a8,8,0,0,0-16,0V40H112V24a8,8,0,0,0-16,0V40H56A16,16,0,0,0,40,56V96H24a8,8,0,0,0,0,16H40v32H24a8,8,0,0,0,0,16H40v40a16,16,0,0,0,16,16H96v16a8,8,0,0,0,16,0V216h32v16a8,8,0,0,0,16,0V216h40a16,16,0,0,0,16-16V160h16a8,8,0,0,0,0-16Zm-32,56H56V56H200v95.87s0,.09,0,.13,0,.09,0,.13V200Z"></path></svg>0%</span>
//                                            <span className="inline-flex items-center gap-1.5 transition-all h-5 rounded-sm px-2 text-xs/5 border border-virtus-600 bg-virtus-700/50 font-normal text-muted"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256"><path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z"></path></svg>256 MB</span>
//                                        </div>
//                                        <span className="font-semibold h-5 px-2 text-[10px] uppercase bg-gradient-to-br from-red-400/20 to-red-700/20 text-red-500 flex items-center gap-1.5 rounded-sm">
//                                            <span className="relative block size-2.5 rounded-full bg-red-500" />
//                                            Offline
//                                        </span>
//                                    </div>
//                                    <a className="absolute inset-0" href="/pt-br/dashboard/applications/baa95673b53845478d218620ffd128ec" />
//                                </li>
//                            </ul>
//                            {/* Paginação + contador */}
//                            <div className="space-y-2">
//                                <div className="flex justify-between gap-4">
//                                    <button
//                                        disabled
//                                        className="group/button inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                        </svg>
//                                        <span className="hidden md:block">Anterior</span>
//                                    </button>
//
//                                    <div className="flex flex-col items-center">
//                                        <div className="flex justify-center gap-x-1.5">
//                                            <button className="group/button inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                1
//                                            </button>
//                                        </div>
//                                    </div>
//
//                                    <button
//                                        disabled
//                                        className="group/button inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                    >
//                                        <span className="hidden md:block">Próximo</span>
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//
//                                <div className="text-right">
//                                    <span className="text-muted text-xs">
//                                        Total de 1 aplicação, 0 estão online e 1 está offline.
//                                    </span>
//                                </div>
//                            </div>
//
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div>
//            <Footer />
//        </>
//    );
//}

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//import UpgradeModal from '@/components/modals/UpgradeModal';
//
//function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'en';
//}
//
//export default function WorkspaceArea() {
//    const router = useRouter();
//    const pathname = usePathname();
//    const lang = getLang(pathname);
//
//    const [username, setUsername] = useState('');
//    const [accountId, setAccountId] = useState('');
//    const [plan, setPlan] = useState('no-plan');
//    const [canDeploy, setCanDeploy] = useState(true);
//    const [usedMB, setUsedMB] = useState(0);
//    const [totalMB, setTotalMB] = useState(2048);
//    const [loading, setLoading] = useState(true);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setUsername(data.username);
//                setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//                setLoading(false);
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        const fetchUserStatus = async () => {
//            const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//            const data = await res.json();
//            setPlan(data.plan || 'no-plan');
//            setCanDeploy(data.canDeploy);
//            setUsedMB(data.usedMB || 0);
//            setTotalMB(data.totalMB || 2048);
//        };
//
//        checkSession().then(fetchUserStatus);
//    }, []);
//
//    if (loading) return null;
//
//    const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//    return (
//        <>
//            <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 bg-grid-virtus-600/[0.2] pt-8 pb-12">
//                <div className="container flex flex-col gap-4">
//                    <div className="space-y-2">
//                        <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//                            <div className="flex flex-1 flex-col gap-1">
//                                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                                    <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                                        <div className="flex items-center gap-2">
//                                            <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                                            <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">Sua conta</span>
//                                        </div>
//                                        <span className="truncate text-secondary text-xs">{accountId}</span>
//                                    </div>
//                                    <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </div>
//                                </button>
//                            </div>
//
//                            <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                                <div className="flex gap-2">
//                                    <span className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md">
//                                        {plan} ({usedMB / 512})
//                                    </span>
//                                    <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88">
//                                        <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                                            <p className="flex justify-between gap-4 text-nowrap leading-none">
//                                                <span className="text-muted text-xs">{usedMB} MB</span>
//                                                <span className="text-muted text-xs">{totalMB - usedMB} MB disponível de {totalMB} MB</span>
//                                            </p>
//                                            <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                                                <div className="absolute inset-0 h-full rounded-full" style={{ backgroundColor: 'rgb(229, 212, 93)', width: `${percentUsed}%` }} />
//                                                <div className="size-full rounded-full bg-virtus-400/30" />
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>
//
//                                <div className="flex flex-1 items-end gap-2">
//                                    <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 flex-1 text-sm text-primary font-medium">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                                            <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                                        </svg>
//                                        Renovar
//                                    </button>
//                                    <button onClick={() => setShowUpgradeModal(true)} className="group/button inline-flex items-center justify-center gap-2 rounded-md border border-virtus-500 bg-transparent hover:bg-virtus-600 h-10 px-4 flex-1 text-sm text-primary font-medium">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-600">
//                                            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//                                        </svg>
//                                        Upgrade
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Aviso de plano pessoal */}
//                        <div className="relative bg-background">
//                            <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                                <div className="flex items-center gap-2.5 md:gap-3.5">
//                                    <div className="flex size-5 items-center justify-center text-blue-500">
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                                        </svg>
//                                    </div>
//                                    <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                                </div>
//
//                                <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                                    <span className="block w-full text-sm text-secondary">
//                                        Está pronto para transformar sua experiência? Com o{" "}
//                                        <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                                            standard
//                                        </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                                        <ul className="list-inside list-disc mt-1">
//                                            <li>Armazenamento empresarial para máxima segurança e performance</li>
//                                            <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                                            <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                                        </ul>
//                                    </span>
//
//                                    <button
//                                        onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                                        className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                                    >
//                                        Fazer upgrade
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//
//                                <button
//                                    onClick={() => setShowUpgradeModal(false)}
//                                    className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                                >
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                                    </svg>
//                                </button>
//                            </div>
//                        </div>
//                        {/* Barra de pesquisa + ações */}
//                        <div className="flex flex-col gap-2 md:flex-row">
//                            <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                                <input
//                                    className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted"
//                                    placeholder="Pesquisar em aplicações..."
//                                />
//                                <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                                    </svg>
//                                </div>
//                            </div>
//
//                            <div className="flex flex-wrap gap-2">
//                                <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto text-sm text-primary font-medium">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                                    </svg>
//                                    Organizar
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                    </svg>
//                                </button>
//
//                                <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 hover:bg-blue-800 h-10 px-4 w-52 flex-auto text-sm text-white font-medium">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
//                                    </svg>
//                                    Nova aplicação
//                                    <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//                                </button>
//                            </div>
//                        </div>
//
//                        {/* Card de aplicação (exemplo) */}
//                        <div className="flex min-h-[512px] flex-col gap-3">
//                            <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                                <li className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700">
//                                    <div className="flex items-center gap-2.5">
//                                        <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                                            <img alt="javascript" width="26" height="26" src="/assets/languages/javascript.svg" className="rounded-sm" />
//                                        </div>
//                                        <div className="flex flex-col gap-0.5 truncate">
//                                            <p className="font-semibold text-sm">Voice Maker</p>
//                                            <span className="truncate text-secondary text-xs">baa95673b53845478d218620ffd128ec</span>
//                                        </div>
//                                    </div>
//                                    <div className="flex w-full items-end justify-between gap-2">
//                                        <div className="flex flex-wrap gap-2">
//                                            <span className="inline-flex items-center gap-1.5 h-5 rounded-sm px-2 text-xs border border-virtus-600 bg-virtus-700/50 text-muted">
//                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                    <path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Z" />
//                                                </svg>
//                                                0%
//                                            </span>
//                                            <span className="inline-flex items-center gap-1.5 h-5 rounded-sm px-2 text-xs border border-virtus-600 bg-virtus-700/50 text-muted">
//                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                                    <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Z" />
//                                                </svg>
//                                                256 MB
//                                            </span>
//                                        </div>
//                                        <span className="font-semibold h-5 px-2 text-[10px] uppercase bg-gradient-to-br from-red-400/20 to-red-700/20 text-red-500 flex items-center gap-1.5 rounded-sm">
//                                            <span className="relative block size-2.5 rounded-full bg-red-500" />
//                                            Offline
//                                        </span>
//                                    </div>
//                                    <a className="absolute inset-0" href="/pt-br/dashboard/applications/baa95673b53845478d218620ffd128ec" />
//                                </li>
//                            </ul>
//                            {/* Paginação + contador */}
//                            <div className="space-y-2">
//                                <div className="flex justify-between gap-4">
//                                    <button
//                                        disabled
//                                        className="group/button inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                    >
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                                        </svg>
//                                        <span className="hidden md:block">Anterior</span>
//                                    </button>
//
//                                    <div className="flex flex-col items-center">
//                                        <div className="flex justify-center gap-x-1.5">
//                                            <button className="group/button inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                                                1
//                                            </button>
//                                        </div>
//                                    </div>
//
//                                    <button
//                                        disabled
//                                        className="group/button inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                                    >
//                                        <span className="hidden md:block">Próximo</span>
//                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                            <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                                        </svg>
//                                    </button>
//                                </div>
//
//                                <div className="text-right">
//                                    <span className="text-muted text-xs">
//                                        Total de 1 aplicação, 0 estão online e 1 está offline.
//                                    </span>
//                                </div>
//                            </div>
//
//                            {/* Modal de upgrade */}
//                            {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
//                        </div> {/* fim do container interno */}
//                    </div> {/* fim do container externo */}
//                </div> {/* fim da área de trabalho */}
//            </div>
//            <Footer />
//        </>
//    );
//}

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from '@/components/Recycles/DashboardHeader';
//import Footer from '@/components/Recycles/Footer';
//import { hasPermission } from '@/utils/permissions';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function WorkspaceArea() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//
//  const [username, setUsername] = useState('');
//  const [accountId, setAccountId] = useState('');
//  const [plan, setPlan] = useState('no-plan');
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [usedMB, setUsedMB] = useState(0);
//  const [totalMB, setTotalMB] = useState(2048);
//  const [loading, setLoading] = useState(true);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//        const data = await res.json();
//
//        if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//          router.replace(`/${lang}/signin`);
//          return;
//        }
//
//        setUsername(data.username);
//        setAccountId(data.accountId || '••••••••••••••••••••••••••••••');
//        setLoading(false);
//      } catch {
//        router.replace(`/${lang}/signin`);
//      }
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      setPlan(data.plan || 'no-plan');
//      setCanDeploy(data.canDeploy);
//      setUsedMB(data.usedMB || 0);
//      setTotalMB(data.totalMB || 2048);
//    };
//
//    checkSession().then(fetchUserStatus);
//  }, []);
//
//  if (loading) return null;
//
//  const percentUsed = Math.round((usedMB / totalMB) * 100);
//
//  return (
//    <>
//      <Header />
//            <div className="relative min-h-[calc(100dvh-80px)] flex-1 bg-grid-virtus-600/[0.2] pt-8 pb-12">
//        <div className="container flex flex-col gap-4">
//          <div className="space-y-2">
//            <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//              <div className="flex flex-1 flex-col gap-1">
//                <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//                <button className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer">
//                  <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                    <div className="flex items-center gap-2">
//                      <span className="flex items-center gap-2 truncate font-semibold text-lg">{username}</span>
//                      <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">Sua conta</span>
//                    </div>
//                    <span className="truncate text-secondary text-xs">{accountId}</span>
//                  </div>
//                  <div className="group/button relative inline-flex items-center justify-center rounded-md text-primary bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-2.5 py-2">
//                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                    </svg>
//                  </div>
//                </button>
//              </div>
//
//              <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//                <div className="flex gap-2">
//                  <span className="select-none items-center text-nowrap bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md">
//                    {plan} ({usedMB / 512})
//                  </span>
//                  <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88">
//                    <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                      <p className="flex justify-between gap-4 text-nowrap leading-none">
//                        <span className="text-muted text-xs">{usedMB} MB</span>
//                        <span className="text-muted text-xs">{totalMB - usedMB} MB disponível de {totalMB} MB</span>
//                      </p>
//                      <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                        <div className="absolute inset-0 h-full rounded-full" style={{ backgroundColor: 'rgb(229, 212, 93)', width: `${percentUsed}%` }} />
//                        <div className="size-full rounded-full bg-virtus-400/30" />
//                      </div>
//                    </div>
//                  </div>
//                </div>
//
//                <div className="flex flex-1 items-end gap-2">
//                  <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 flex-1 text-sm text-primary font-medium">
//                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                      <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z" />
//                    </svg>
//                    Renovar
//                  </button>
//                  <button onClick={() => setShowUpgradeModal(true)} className="group/button inline-flex items-center justify-center gap-2 rounded-md border border-virtus-500 bg-transparent hover:bg-virtus-600 h-10 px-4 flex-1 text-sm text-primary font-medium">
//                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-600">
//                      <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//                    </svg>
//                    Upgrade
//                  </button>
//                </div>
//              </div>
//            </div>
//                        {/* Aviso de plano pessoal */}
//            <div className="relative bg-background">
//              <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-blue-600 bg-blue-800/5">
//                <div className="flex items-center gap-2.5 md:gap-3.5">
//                  <div className="flex size-5 items-center justify-center text-blue-500">
//                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
//                    </svg>
//                  </div>
//                  <h2 className="text-sm font-medium text-blue-500">Você está em um plano de uso pessoal!</h2>
//                </div>
//
//                <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//                  <span className="block w-full text-sm text-secondary">
//                    Está pronto para transformar sua experiência? Com o{" "}
//                    <span className="inline-flex items-center text-nowrap rounded-sm bg-linear-to-b from-[rgba(125,125,125,0.25)] to-[rgba(125,125,125,0.075)] font-medium text-primary capitalize hover:bg-virtus-800 px-1 py-0.5 text-xs">
//                      standard
//                    </span>, você desbloqueia recursos exclusivos que elevam o seu projeto a um novo patamar:
//                    <ul className="list-inside list-disc mt-1">
//                      <li>Armazenamento empresarial para máxima segurança e performance</li>
//                      <li>30 GB gratuitos no Blob Storage para começar sem preocupações</li>
//                      <li>Domínio personalizado para reforçar sua marca com identidade profissional</li>
//                    </ul>
//                  </span>
//
//                  <button
//                    onClick={() => router.push(`/${lang}/upgrade?start=standard`)}
//                    className="group/button inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm h-10 px-4 w-full md:w-fit bg-white/4 text-link hover:bg-white/5 hover:underline"
//                  >
//                    Fazer upgrade
//                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                    </svg>
//                  </button>
//                </div>
//
//                <button
//                  onClick={() => setShowUpgradeModal(false)}
//                  className="group/button absolute top-2.5 right-2.5 inline-flex items-center justify-center gap-2 rounded-md text-primary text-sm h-8 px-2 hover:bg-white/5"
//                >
//                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//                  </svg>
//                </button>
//              </div>
//            </div>
//                        {/* Barra de pesquisa + ações */}
//            <div className="flex flex-col gap-2 md:flex-row">
//              <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//                <input
//                  className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted"
//                  placeholder="Pesquisar em aplicações..."
//                />
//                <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                  </svg>
//                </div>
//              </div>
//
//              <div className="flex flex-wrap gap-2">
//                <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 flex-auto text-sm text-primary font-medium">
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                  </svg>
//                  Organizar
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </button>
//
//                <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 hover:bg-blue-800 h-10 px-4 w-52 flex-auto text-sm text-white font-medium">
//                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
//                  </svg>
//                  Nova aplicação
//                  <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//                </button>
//              </div>
//            </div>
//
//            {/* Card de aplicação (exemplo) */}
//            <div className="flex min-h-[512px] flex-col gap-3">
//              <ul className="grid h-full auto-rows-min gap-3 overflow-auto rounded-md sm:grid-cols-2 lg:grid-cols-3">
//                <li className="relative flex min-h-36 flex-col justify-between gap-2.5 rounded-md border border-virtus-600 bg-virtus-800 p-4 transition-colors hover:border-blue-700">
//                  <div className="flex items-center gap-2.5">
//                    <div className="shrink-0 overflow-hidden rounded-sm border bg-virtus-900 p-1.5">
//                      <img alt="javascript" width="26" height="26" src="/assets/languages/javascript.svg" className="rounded-sm" />
//                    </div>
//                    <div className="flex flex-col gap-0.5 truncate">
//                      <p className="font-semibold text-sm">Voice Maker</p>
//                      <span className="truncate text-secondary text-xs">baa95673b53845478d218620ffd128ec</span>
//                    </div>
//                  </div>
//                  <div className="flex w-full items-end justify-between gap-2">
//                    <div className="flex flex-wrap gap-2">
//                      <span className="inline-flex items-center gap-1.5 h-5 rounded-sm px-2 text-xs border border-virtus-600 bg-virtus-700/50 text-muted">
//                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                          <path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Z" />
//                        </svg>
//                        0%
//                      </span>
//                      <span className="inline-flex items-center gap-1.5 h-5 rounded-sm px-2 text-xs border border-virtus-600 bg-virtus-700/50 text-muted">
//                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                          <path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Z" />
//                        </svg>
//                        256 MB
//                      </span>
//                    </div>
//                    <span className="font-semibold h-5 px-2 text-[10px] uppercase bg-gradient-to-br from-red-400/20 to-red-700/20 text-red-500 flex items-center gap-1.5 rounded-sm">
//                      <span className="relative block size-2.5 rounded-full bg-red-500" />
//                      Offline
//                    </span>
//                  </div>
//                  <a className="absolute inset-0" href="/pt-br/dashboard/applications/baa95673b53845478d218620ffd128ec" />
//                </li>
//              </ul>
//                            {/* Paginação + contador */}
//              <div className="space-y-2">
//                <div className="flex justify-between gap-4">
//                  <button
//                    disabled
//                    className="group/button inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                  >
//                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                    </svg>
//                    <span className="hidden md:block">Anterior</span>
//                  </button>
//
//                  <div className="flex flex-col items-center">
//                    <div className="flex justify-center gap-x-1.5">
//                      <button className="group/button inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 bg-virtus-600 hover:bg-virtus-700 text-primary text-sm font-medium">
//                        1
//                      </button>
//                    </div>
//                  </div>
//
//                  <button
//                    disabled
//                    className="group/button inline-flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-10 px-4 text-sm text-primary opacity-50 cursor-not-allowed"
//                  >
//                    <span className="hidden md:block">Próximo</span>
//                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                    </svg>
//                  </button>
//                </div>
//
//                <div className="text-right">
//                  <span className="text-muted text-xs">
//                    Total de 1 aplicação, 0 estão online e 1 está offline.
//                  </span>
//                </div>
//              </div>
//
//              {/* Modal de upgrade */}
//              {showUpgradeModal && (
//                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                  <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//                    <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//                    <p className="mb-4 text-gray-700">
//                      Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//                      Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//                      banco de dados, snapshots e ambientes dedicados.
//                    </p>
//                    <div className="flex justify-end space-x-3">
//                      <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//                      <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//                      <button onClick={() => setShowUpgradeModal(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//                    </div>
//                  </div>
//                </div>
//              )}
//            </div> {/* fim do container interno */}
//          </div> {/* fim do container externo */}
//        </div> {/* fim da área de trabalho */}
//      </div>
//      <Footer />
//    </>
//  );
//}

//import Header from "../../../../components/Recycles/DashboardHeader"
////import Header from "@/components/Header"; // ajuste o caminho conforme sua estrutura
//
//export default function Dashboard() {
//    return (
//        <div className="flex min-h-screen flex-col bg-background">
//            <Header />
//
//            {/* Linha de navegação abaixo do Header */}
//            <div className="flex h-[45px] flex-col justify-between lg:flex-row lg:items-center border-b border-virtus-600 px-4 sm:px-6">
//                <nav className="flex flex-1 items-center">
//                    <ul className="flex w-full items-center overflow-x-hidden overflow-y-hidden">
//                        <a
//                            href="/pt-br/dashboard"
//                            className="group relative z-20 mx-0.5 flex items-center gap-1 whitespace-nowrap py-1.5 transition-all hover:rounded-md"
//                            aria-selected="true"
//                        >
//                            <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-secondary text-sm hover:bg-virtus-700 group-aria-selected:text-primary">
//                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z" />
//                                </svg>
//                                Aplicações
//                            </span>
//                            <span className="absolute inset-0 top-[96%] z-50 h-[2px] rounded-md bg-blue-500" />
//                        </a>
//
//                        {/* Adicione os outros links aqui como Databases, Snapshots, Blob, etc. */}
//
//                    </ul>
//                </nav>
//            </div>
//
//            {/* Conteúdo do dashboard */}
//            <main className="flex-1 px-4 py-8 sm:px-6 max-w-7xl mx-auto">
//                <h1 className="text-2xl font-bold text-primary">Bem-vindo ao seu Dashboard</h1>
//                {/* Aqui você pode adicionar cards, gráficos, tabelas, etc */}
//            </main>
//        </div>
//    );
//}

//import Header from "../../../../components/Recycles/DashboardHeader"
////import Header from "@/components/Header"; // ajuste o caminho conforme sua estrutura
//
//export default function Dashboard() {
//  return (
//    <div className="flex min-h-screen flex-col bg-background">
//      <Header />
//
//      {/* Linha de navegação abaixo do Header */}
//      <div className="flex h-[45px] flex-col justify-between lg:flex-row lg:items-center border-b border-virtus-600 px-4 sm:px-6">
//        <nav className="flex flex-1 items-center">
//          <ul className="flex w-full items-center overflow-x-hidden overflow-y-hidden">
//            <a
//              href="/pt-br/dashboard"
//              className="group relative z-20 mx-0.5 flex items-center gap-1 whitespace-nowrap py-1.5 transition-all hover:rounded-md"
//              aria-selected="true"
//            >
//              <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-secondary text-sm hover:bg-virtus-700 group-aria-selected:text-primary">
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z" />
//                </svg>
//                Aplicações
//              </span>
//              <span className="absolute inset-0 top-[96%] z-50 h-[2px] rounded-md bg-blue-500" />
//            </a>
//
//            {/* Adicione os outros links aqui como Databases, Snapshots, Blob, etc. */}
//          </ul>
//        </nav>
//
//        {/* Ações extras (CLI, VSCode) */}
//        <div className="hidden items-center gap-4 lg:flex">
//          <a
//            className="flex h-10 items-center gap-2 text-sm"
//            target="_blank"
//            href="/pt-br/resources/cli"
//          >
//            Baixar CLI
//            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//            </svg>
//          </a>
//          <div className="h-5 w-[2px] bg-virtus-600" />
//          <a
//            className="flex h-10 items-center gap-2 text-sm"
//            target="_blank"
//            href="/pt-br/resources/vscode-extension"
//          >
//            Extensão VSCode
//            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//            </svg>
//          </a>
//        </div>
//      </div>
//
//      {/* Conteúdo do dashboard */}
//      <main className="flex-1 px-4 py-8 sm:px-6 max-w-7xl mx-auto">
//        <h1 className="text-2xl font-bold text-primary">Bem-vindo ao seu Dashboard</h1>
//        {/* Aqui você pode adicionar cards, gráficos, tabelas, etc */}
//      </main>
//    </div>
//  );
//}
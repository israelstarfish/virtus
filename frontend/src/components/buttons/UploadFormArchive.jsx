//frontend/src/components/buttons/UploadFormArchive.jsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import Footer from "../Recycles/Footer";
import ZipUploadArea from '@/components/buttons/ZipUploadArea';
import Link from 'next/link';
import '@/app/styles/virtus.css';

export default function UploadFormArchive() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [entryFile, setEntryFile] = useState('');
    const [status, setStatus] = useState("");
    const [appID, setAppID] = useState("");
    const [entryPoints, setEntryPoints] = useState([]);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const { lang } = useParams();
    const router = useRouter();
    const [executionMode, setExecutionMode] = useState('auto');
    const [showModeOptions, setShowModeOptions] = useState(false);
    const [showEntrypointOptions, setShowEntrypointOptions] = useState(false);
    const [fileTree, setFileTree] = useState([]);
    const [resetCounter, setResetCounter] = useState(0);
    const [isDeploying, setIsDeploying] = useState(false); // ✅ controle do spinner
    const [hasFile, setHasFile] = useState(false);
    const [isChecking, setIsChecking] = useState(true); // ✅ bloqueia renderização

    // ✅ Verificação automática ao carregar
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
                const data = await res.json();

                if (!data.username || !data.role) {
                    router.replace(`/${lang}/signin`);
                    return;
                }

                setIsChecking(false); // ✅ libera renderização mais cedo

                const statusRes = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
                const statusData = await statusRes.json();

                if (!statusData.canDeploy) {
                    router.replace(`/${lang}/upload#get-plan`);
                }
            } catch {
                router.replace(`/${lang}/signin`);
            }
        };

        checkSession();
    }, [lang, router]);

    if (isChecking) return null;

    const handleDeployClick = async () => {
        if (!selectedFile) {
            setStatus("🚫 Nenhum arquivo selecionado.");
            setTimeout(() => setStatus(""), 5000);
            return;
        }

        setIsDeploying(true);

        try {
            const resStatus = await fetch("/api/user/status", {
                method: "GET",
                credentials: "include",
            });

            const data = await resStatus.json();
            const currentPlan = data.plan || "no-plan";
            const canDeploy = data.canDeploy;

            if (!canDeploy) {
                setShowUpgradeModal(true);
                setStatus("❌ Limite atingido pelo plano atual.");
                setTimeout(() => setStatus(""), 5000);
                setIsDeploying(false);
                return;
            }

            const formData = new FormData();
            formData.append("file", selectedFile);

            if (executionMode === 'manual' && entryFile) {
                formData.append("entrypoint", entryFile);
            }

            const res = await fetch(`/api/upload?plan=${currentPlan}`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            const contentType = res.headers.get("content-type") || "";
            let result = {};

            if (contentType.includes("application/json")) {
                result = await res.json();
            } else {
                const raw = await res.text();
                throw new Error(raw || "Resposta inválida do servidor.");
            }

            if (res.ok) {
                setStatus("✅ Deploy realizado com sucesso!");
                setTimeout(() => setStatus(""), 10000);
                setSelectedFile(null); // ✅ limpa o arquivo
                setEntryFile("");       // ✅ limpa entrypoint manual
                setResetCounter((prev) => prev + 1); // ✅ força reset visual no ZipUploadArea

                if (result.app?.ID) {
                    setAppID(result.app.ID);

                    try {
                        const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`, {
                            method: "GET",
                            credentials: "include",
                        });

                        const entryContentType = resEntries.headers.get("content-type") || "";
                        const raw = await resEntries.text();

                        if (entryContentType.includes("application/json")) {
                            const parsed = JSON.parse(raw);
                            setEntryPoints(parsed.entryPoints || []);
                        } else {
                            throw new Error(raw || "Resposta inválida ao buscar entrypoints.");
                        }
                    } catch (err) {
                        console.error("Erro ao buscar entrypoints:", err);
                        setStatus("⚠️ Deploy feito, mas falha ao buscar entrypoints.");
                        setTimeout(() => setStatus(""), 10000);
                    }
                }
            } else {
                const msg = result.error || result.message || "Falha no deploy";
                setStatus(`⚠️ ${msg}`);
                setTimeout(() => setStatus(""), 10000);
                if (currentPlan === "no-plan") {
                    setShowUpgradeModal(true);
                }
            }
        } catch (err) {
            setStatus(`🚫 Erro: ${err.message}`);
            setTimeout(() => setStatus(""), 10000);
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 py-6">
            <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleDeployClick();
                }}
            >
                <div className="flex flex-col gap-4 lg:flex-row">
                    <div className="mx-auto w-full max-w-5xl space-y-8">
                        {/* Header */}
                        <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="w-full text-left">
                                <Link
                                    className="mb-4 flex items-center gap-2 text-secondary text-xs"
                                    href={`/${lang}/dashboard`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
                                    </svg>
                                    Voltar para a dashboard
                                </Link>
                                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
                                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
                            </div>
                            <Link
                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
                                href={`/${lang}/upload`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
                                </svg>
                                Fazer deploy de outra forma
                            </Link>
                        </header>

                        {/* Upload ZIP */}
                        <div className="flex flex-col gap-6 rounded-md border bg-card py-6 text-card-foreground" data-slot="card">
                            <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 border-b" data-slot="card-header">
                                <div className="font-semibold text-base" data-slot="card-title">Quase lá! Agora, configure o seu zip.</div>
                                <div className="text-secondary-foreground text-sm" data-slot="card-description">
                                    Selecione o zip que será importado. Se for um monorepo, não se esqueça de alterar o diretório raiz para a pasta correta.
                                </div>
                            </div>

                            <div className="px-6 md:h-100" data-slot="card-content">
                                <ZipUploadArea
                                    onFileSelect={(file) => {
                                        setSelectedFile(file);
                                        setHasFile(!!file); // ✅ ativa o botão após upload
                                    }}
                                    manualMode={executionMode === 'manual'}
                                    onEntrypointSelect={(entry) => setEntryFile(entry)}
                                    onEntrypointListUpdate={(list) => setEntryPoints(list)}
                                    resetTrigger={resetCounter} // ✅ aqui
                                />
                            </div>
                        </div>

                        {/* Execução do ambiente */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">
                                Execução do ambiente<span className="ml-1.5 text-red-500">*</span>
                            </label>
                            <p className="text-muted-foreground text-sm">
                                A execução do ambiente pode ser feita de duas formas: no modo Automático, a Virtus Cloud detecta o arquivo principal; no modo Manual, você poderá escolher qual arquivo iniciar.
                            </p>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row md:gap-4 mt-2">
                                {/* Botão de entrada com dropdown */}
                                <div className="relative sm:w-80">
                                    <button
                                        type="button"
                                        disabled={executionMode !== 'manual'}
                                        onClick={() => {
                                            if (executionMode === 'manual') {
                                                setShowEntrypointOptions((prev) => !prev);
                                            }
                                        }}
                                        className={`flex justify-between items-center px-4 h-10 rounded-md text-sm w-full ${executionMode === 'manual'
                                            ? 'bg-background text-white border border-border hover:bg-virtus-600'
                                            : 'bg-input text-muted cursor-not-allowed'
                                            }`}
                                    >
                                        {entryFile || 'Selecione um arquivo principal'}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="1em"
                                            height="1em"
                                            fill="currentColor"
                                            viewBox="0 0 256 256"
                                            className={`ml-2 size-4 opacity-50 transition-transform duration-250 ${showEntrypointOptions ? 'rotate-180' : ''}`}
                                        >
                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                                        </svg>
                                    </button>

                                    {executionMode === 'manual' && showEntrypointOptions && entryPoints.length > 0 && (
                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white max-h-64 overflow-y-auto">
                                            {entryPoints.map((entry, i) => (
                                                <li
                                                    key={i}
                                                    className="px-4 py-2 hover:bg-virtus-600 cursor-pointer truncate"
                                                    onClick={() => {
                                                        setEntryFile(entry);
                                                        setShowEntrypointOptions(false);
                                                    }}
                                                >
                                                    {entry}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {/* Botão de modo com menu suspenso */}
                                <div className="relative sm:w-80">
                                    <button
                                        type="button"
                                        disabled={!hasFile}
                                        onClick={() => {
                                            if (hasFile) setShowModeOptions((prev) => !prev);
                                        }}
                                        className={`flex items-center justify-between rounded-md px-4 h-10 text-sm w-full ${hasFile
                                            ? 'border border-input bg-input text-white hover:bg-virtus-600'
                                            : 'bg-input text-muted cursor-not-allowed border border-border'
                                            }`}
                                    >
                                        {executionMode === 'auto' ? 'Detectar automaticamente' : 'Definir manualmente'}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            fill="currentColor"
                                            viewBox="0 0 256 256"
                                            className={`text-secondary transition-transform duration-250 ${showModeOptions ? 'rotate-180' : ''}`}
                                        >
                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                                        </svg>
                                    </button>

                                    {showModeOptions && (
                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white">
                                            <li
                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
                                                onClick={() => {
                                                    setExecutionMode('auto');
                                                    setShowModeOptions(false);
                                                }}
                                            >
                                                Detectar automaticamente
                                            </li>
                                            <li
                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
                                                onClick={() => {
                                                    setExecutionMode('manual');
                                                    setShowModeOptions(false);
                                                }}
                                            >
                                                Definir manualmente
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Separador */}
                        <div className="shrink-0 bg-virtus-600 h-px w-full" />

                        {/* Variáveis de Ambiente */}
                        <div className="flex flex-col gap-1.5">
                            <div className="rounded-md border border-border bg-background px-6">
                                <div className="border-b">
                                    <h3 className="flex justify-between py-4 text-sm font-medium hover:underline">
                                        <span>Variáveis de Ambiente</span>
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Publicação na Web */}
                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
                            <div className="px-6 border-b">
                                <div className="font-semibold text-sm">Publicação na Web</div>
                                <div className="text-secondary-foreground text-sm">
                                    Se o seu projeto for um site ou uma API, ativar esta opção permitirá o roteamento da aplicação pela porta 80, possibilitando acesso externo via HTTPS e WSS. Além disso, será necessário atribuir um subdomínio ao projeto.
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Comando de inicialização */}
                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
                            <div className="px-6 border-b">
                                <div className="font-semibold text-sm">Comando de inicialização</div>
                                <div className="text-secondary-foreground text-sm">
                                    Defina um comando personalizado para iniciar sua aplicação conforme necessária.
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Auto Restart */}
                        <div className="flex flex-col gap-6 rounded-md py-6 text-card-foreground border border-blue-700/75 bg-gradient-to-bl from-blue-700/15 to-blue-700/5">
                            <div className="px-6">
                                <div className="font-semibold text-sm">
                                    Auto Restart
                                    <span className="ml-2 inline-flex items-center gap-1.5 font-semibold text-primary bg-blue-700 hover:bg-blue-800 rounded-sm px-1.5 text-[10px]/4">
                                        Tecnologia Exclusiva
                                    </span>
                                </div>
                                <div className="text-secondary-foreground text-sm">
                                    Se sua aplicação travar devido a falhas inesperadas, a tecnologia exclusiva da Virtus Cloud tentará reiniciá-la automaticamente para garantir máxima disponibilidade e estabilidade.
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button type="button" role="switch" aria-checked="true" className="peer h-5 w-9 rounded-full bg-blue-600">
                                        <span className="block size-4.5 rounded-full bg-primary translate-x-[calc(100%-2px)] transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Botão de Deploy com spinner */}
                        <button
                            type="submit"
                            disabled={isDeploying}
                            aria-disabled={isDeploying}
                            role="button"
                            className={`group/button relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-white transition-all select-none
                                ${isDeploying ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
                                bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
                        >
                            {isDeploying ? (
                                <span className="absolute flex size-full items-center justify-center bg-inherit">
                                    <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
                                </span>
                            ) : (
                                <span>Realizar o deploy</span>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Toast centralizado */}
            {status && (
                <div className="toast-message">
                    {status}
                </div>
            )}

            <Footer />
        </div>
    );
}

//frontend/src/components/buttons/UploadFormArchive.jsx

//'use client';
//
//import { useParams, useRouter } from 'next/navigation';
//import { useState, useEffect } from "react";
//import Footer from "../Recycles/Footer";
//import ZipUploadArea from '@/components/buttons/ZipUploadArea';
//import Link from 'next/link';
//import '@/app/styles/virtus.css';
//
//export default function UploadFormArchive() {
//    const [selectedFile, setSelectedFile] = useState(null);
//    const [entryFile, setEntryFile] = useState('');
//    const [status, setStatus] = useState("");
//    const [appID, setAppID] = useState("");
//    const [entryPoints, setEntryPoints] = useState([]);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const { lang } = useParams();
//    const router = useRouter();
//    const [executionMode, setExecutionMode] = useState('auto');
//    const [showModeOptions, setShowModeOptions] = useState(false);
//    const [showEntrypointOptions, setShowEntrypointOptions] = useState(false);
//    const [fileTree, setFileTree] = useState([]);
//    const [resetCounter, setResetCounter] = useState(0);
//    const [isDeploying, setIsDeploying] = useState(false); // ✅ controle do spinner
//    const [hasFile, setHasFile] = useState(false);
//    const [isChecking, setIsChecking] = useState(true); // ✅ bloqueia renderização
//
//    // ✅ Verificação automática ao carregar
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setIsChecking(false); // ✅ libera renderização mais cedo
//
//                const statusRes = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//                const statusData = await statusRes.json();
//
//                if (!statusData.canDeploy) {
//                    router.replace(`/${lang}/upload#get-plan`);
//                }
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        checkSession();
//    }, [lang, router]);
//
//    if (isChecking) return null;
//
//    const handleDeployClick = async () => {
//        if (!selectedFile) {
//            setStatus("🚫 Nenhum arquivo selecionado.");
//            setTimeout(() => setStatus(""), 5000);
//            return;
//        }
//
//        setIsDeploying(true);
//
//        try {
//            const resStatus = await fetch("/api/user/status", {
//                method: "GET",
//                credentials: "include",
//            });
//
//            const data = await resStatus.json();
//            const currentPlan = data.plan || "no-plan";
//            const canDeploy = data.canDeploy;
//
//            if (!canDeploy) {
//                setShowUpgradeModal(true);
//                setStatus("❌ Limite atingido pelo plano atual.");
//                setTimeout(() => setStatus(""), 5000);
//                setIsDeploying(false);
//                return;
//            }
//
//            const formData = new FormData();
//            formData.append("file", selectedFile);
//
//            if (executionMode === 'manual' && entryFile) {
//                formData.append("entrypoint", entryFile);
//            }
//
//            const res = await fetch(`/api/upload?plan=${currentPlan}`, {
//                method: "POST",
//                body: formData,
//                credentials: "include",
//            });
//
//            const contentType = res.headers.get("content-type") || "";
//            let result = {};
//
//            if (contentType.includes("application/json")) {
//                result = await res.json();
//            } else {
//                const raw = await res.text();
//                throw new Error(raw || "Resposta inválida do servidor.");
//            }
//
//            if (res.ok) {
//                setStatus("✅ Deploy realizado com sucesso!");
//                setTimeout(() => setStatus(""), 10000);
//                setSelectedFile(null); // ✅ limpa o arquivo
//                setEntryFile("");       // ✅ limpa entrypoint manual
//                setResetCounter((prev) => prev + 1); // ✅ força reset visual no ZipUploadArea
//
//                if (result.app?.ID) {
//                    setAppID(result.app.ID);
//
//                    try {
//                        const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`, {
//                            method: "GET",
//                            credentials: "include",
//                        });
//
//                        const entryContentType = resEntries.headers.get("content-type") || "";
//                        const raw = await resEntries.text();
//
//                        if (entryContentType.includes("application/json")) {
//                            const parsed = JSON.parse(raw);
//                            setEntryPoints(parsed.entryPoints || []);
//                        } else {
//                            throw new Error(raw || "Resposta inválida ao buscar entrypoints.");
//                        }
//                    } catch (err) {
//                        console.error("Erro ao buscar entrypoints:", err);
//                        setStatus("⚠️ Deploy feito, mas falha ao buscar entrypoints.");
//                        setTimeout(() => setStatus(""), 10000);
//                    }
//                }
//            } else {
//                const msg = result.error || result.message || "Falha no deploy";
//                setStatus(`⚠️ ${msg}`);
//                setTimeout(() => setStatus(""), 10000);
//                if (currentPlan === "no-plan") {
//                    setShowUpgradeModal(true);
//                }
//            }
//        } catch (err) {
//            setStatus(`🚫 Erro: ${err.message}`);
//            setTimeout(() => setStatus(""), 10000);
//        } finally {
//            setIsDeploying(false);
//        }
//    };
//
//    return (
//        <div className="flex flex-col gap-6 py-6">
//            <form
//                className="flex flex-col gap-4"
//                onSubmit={(e) => {
//                    e.preventDefault();
//                    handleDeployClick();
//                }}
//            >
//                <div className="flex flex-col gap-4 lg:flex-row">
//                    <div className="mx-auto w-full max-w-5xl space-y-8">
//                        {/* Header */}
//                        <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                            <div className="w-full text-left">
//                                <Link
//                                    className="mb-4 flex items-center gap-2 text-secondary text-xs"
//                                    href={`/${lang}/dashboard`}
//                                >
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                    </svg>
//                                    Voltar para a dashboard
//                                </Link>
//                                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                            </div>
//                            <a
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                                href="/upload"
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                </svg>
//                                Fazer deploy de outra forma
//                            </a>
//                        </header>
//
//                        {/* Upload ZIP */}
//                        <div className="flex flex-col gap-6 rounded-md border bg-card py-6 text-card-foreground" data-slot="card">
//                            <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 border-b" data-slot="card-header">
//                                <div className="font-semibold text-base" data-slot="card-title">Quase lá! Agora, configure o seu zip.</div>
//                                <div className="text-secondary-foreground text-sm" data-slot="card-description">
//                                    Selecione o zip que será importado. Se for um monorepo, não se esqueça de alterar o diretório raiz para a pasta correta.
//                                </div>
//                            </div>
//
//                            <div className="px-6 md:h-100" data-slot="card-content">
//                                <ZipUploadArea
//                                    onFileSelect={(file) => {
//                                        setSelectedFile(file);
//                                        setHasFile(!!file); // ✅ ativa o botão após upload
//                                    }}
//                                    manualMode={executionMode === 'manual'}
//                                    onEntrypointSelect={(entry) => setEntryFile(entry)}
//                                    onEntrypointListUpdate={(list) => setEntryPoints(list)}
//                                    resetTrigger={resetCounter} // ✅ aqui
//                                />
//                            </div>
//                        </div>
//
//                        {/* Execução do ambiente */}
//                        <div className="flex flex-col gap-2">
//                            <label className="text-sm font-medium">
//                                Execução do ambiente<span className="ml-1.5 text-red-500">*</span>
//                            </label>
//                            <p className="text-muted-foreground text-sm">
//                                A execução do ambiente pode ser feita de duas formas: no modo Automático, a Virtus Cloud detecta o arquivo principal; no modo Manual, você poderá escolher qual arquivo iniciar.
//                            </p>
//
//                            <div className="flex flex-col-reverse gap-2 sm:flex-row md:gap-4 mt-2">
//                                {/* Botão de entrada com dropdown */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        disabled={executionMode !== 'manual'}
//                                        onClick={() => {
//                                            if (executionMode === 'manual') {
//                                                setShowEntrypointOptions((prev) => !prev);
//                                            }
//                                        }}
//                                        className={`flex justify-between items-center px-4 h-10 rounded-md text-sm w-full ${executionMode === 'manual'
//                                            ? 'bg-background text-white border border-border hover:bg-virtus-600'
//                                            : 'bg-input text-muted cursor-not-allowed'
//                                            }`}
//                                    >
//                                        {entryFile || 'Selecione um arquivo principal'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="1em"
//                                            height="1em"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`ml-2 size-4 opacity-50 transition-transform duration-250 ${showEntrypointOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {executionMode === 'manual' && showEntrypointOptions && entryPoints.length > 0 && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white max-h-64 overflow-y-auto">
//                                            {entryPoints.map((entry, i) => (
//                                                <li
//                                                    key={i}
//                                                    className="px-4 py-2 hover:bg-virtus-600 cursor-pointer truncate"
//                                                    onClick={() => {
//                                                        setEntryFile(entry);
//                                                        setShowEntrypointOptions(false);
//                                                    }}
//                                                >
//                                                    {entry}
//                                                </li>
//                                            ))}
//                                        </ul>
//                                    )}
//                                </div>
//                                {/* Botão de modo com menu suspenso */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        disabled={!hasFile}
//                                        onClick={() => {
//                                            if (hasFile) setShowModeOptions((prev) => !prev);
//                                        }}
//                                        className={`flex items-center justify-between rounded-md px-4 h-10 text-sm w-full ${hasFile
//                                            ? 'border border-input bg-input text-white hover:bg-virtus-600'
//                                            : 'bg-input text-muted cursor-not-allowed border border-border'
//                                            }`}
//                                    >
//                                        {executionMode === 'auto' ? 'Detectar automaticamente' : 'Definir manualmente'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="20"
//                                            height="20"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`text-secondary transition-transform duration-250 ${showModeOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {showModeOptions && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white">
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('auto');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Detectar automaticamente
//                                            </li>
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('manual');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Definir manualmente
//                                            </li>
//                                        </ul>
//                                    )}
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Separador */}
//                        <div className="shrink-0 bg-virtus-600 h-px w-full" />
//
//                        {/* Variáveis de Ambiente */}
//                        <div className="flex flex-col gap-1.5">
//                            <div className="rounded-md border border-border bg-background px-6">
//                                <div className="border-b">
//                                    <h3 className="flex justify-between py-4 text-sm font-medium hover:underline">
//                                        <span>Variáveis de Ambiente</span>
//                                    </h3>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Publicação na Web */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Publicação na Web</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se o seu projeto for um site ou uma API, ativar esta opção permitirá o roteamento da aplicação pela porta 80, possibilitando acesso externo via HTTPS e WSS. Além disso, será necessário atribuir um subdomínio ao projeto.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Comando de inicialização */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Comando de inicialização</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Defina um comando personalizado para iniciar sua aplicação conforme necessária.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Auto Restart */}
//                        <div className="flex flex-col gap-6 rounded-md py-6 text-card-foreground border border-blue-700/75 bg-gradient-to-bl from-blue-700/15 to-blue-700/5">
//                            <div className="px-6">
//                                <div className="font-semibold text-sm">
//                                    Auto Restart
//                                    <span className="ml-2 inline-flex items-center gap-1.5 font-semibold text-primary bg-blue-700 hover:bg-blue-800 rounded-sm px-1.5 text-[10px]/4">
//                                        Tecnologia Exclusiva
//                                    </span>
//                                </div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se sua aplicação travar devido a falhas inesperadas, a tecnologia exclusiva da Virtus Cloud tentará reiniciá-la automaticamente para garantir máxima disponibilidade e estabilidade.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="true" className="peer h-5 w-9 rounded-full bg-blue-600">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-[calc(100%-2px)] transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão de Deploy com spinner */}
//                        <button
//                            type="submit"
//                            disabled={isDeploying}
//                            aria-disabled={isDeploying}
//                            role="button"
//                            className={`group/button relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-white transition-all select-none
//                                ${isDeploying ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//                                bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                        >
//                            {isDeploying ? (
//                                <span className="absolute flex size-full items-center justify-center bg-inherit">
//                                    <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//                                </span>
//                            ) : (
//                                <span>Realizar o deploy</span>
//                            )}
//                        </button>
//                    </div>
//                </div>
//            </form>
//
//            {/* Toast centralizado */}
//            {status && (
//                <div className="toast-message">
//                    {status}
//                </div>
//            )}
//
//            <Footer />
//        </div>
//    );
//}

//frontend/src/components/buttons/UploadFormArchive.jsx

//'use client';
//
//import { useParams, useRouter } from 'next/navigation';
//import { useState, useEffect } from "react";
//import Footer from "../Recycles/Footer";
//import ZipUploadArea from '@/components/buttons/ZipUploadArea';
//import Link from 'next/link';
//import '@/app/styles/virtus.css';
//
//export default function UploadFormArchive() {
//    const [selectedFile, setSelectedFile] = useState(null);
//    const [entryFile, setEntryFile] = useState('');
//    const [status, setStatus] = useState("");
//    const [appID, setAppID] = useState("");
//    const [entryPoints, setEntryPoints] = useState([]);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const { lang } = useParams();
//    const router = useRouter();
//    const [executionMode, setExecutionMode] = useState('auto');
//    const [showModeOptions, setShowModeOptions] = useState(false);
//    const [showEntrypointOptions, setShowEntrypointOptions] = useState(false);
//    const [fileTree, setFileTree] = useState([]);
//    const [resetCounter, setResetCounter] = useState(0);
//    const [isDeploying, setIsDeploying] = useState(false); // ✅ controle do spinner
//    const [hasFile, setHasFile] = useState(false);
//    const [isChecking, setIsChecking] = useState(true); // ✅ bloqueia renderização
//
//    // ✅ Verificação automática ao carregar
//    useEffect(() => {
//        const checkSession = async () => {
//            try {
//                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//                const data = await res.json();
//
//                if (!data.username || !data.role) {
//                    router.replace(`/${lang}/signin`);
//                    return;
//                }
//
//                setIsChecking(false); // ✅ libera renderização mais cedo
//
//                const statusRes = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//                const statusData = await statusRes.json();
//
//                if (!statusData.canDeploy) {
//                    router.replace(`/${lang}/upload`);
//                }
//            } catch {
//                router.replace(`/${lang}/signin`);
//            }
//        };
//
//        checkSession();
//    }, [lang, router]);
//
//    if (isChecking) return null;
//
//    const handleDeployClick = async () => {
//        if (!selectedFile) {
//            setStatus("🚫 Nenhum arquivo selecionado.");
//            setTimeout(() => setStatus(""), 5000);
//            return;
//        }
//
//        setIsDeploying(true);
//
//        try {
//            const resStatus = await fetch("/api/user/status", {
//                method: "GET",
//                credentials: "include",
//            });
//
//            const data = await resStatus.json();
//            const currentPlan = data.plan || "no-plan";
//            const canDeploy = data.canDeploy;
//
//            if (!canDeploy) {
//                setShowUpgradeModal(true);
//                setStatus("❌ Limite atingido pelo plano atual.");
//                setTimeout(() => setStatus(""), 5000);
//                setIsDeploying(false);
//                return;
//            }
//
//            const formData = new FormData();
//            formData.append("file", selectedFile);
//
//            if (executionMode === 'manual' && entryFile) {
//                formData.append("entrypoint", entryFile);
//            }
//
//            const res = await fetch(`/api/upload?plan=${currentPlan}`, {
//                method: "POST",
//                body: formData,
//                credentials: "include",
//            });
//
//            const contentType = res.headers.get("content-type") || "";
//            let result = {};
//
//            if (contentType.includes("application/json")) {
//                result = await res.json();
//            } else {
//                const raw = await res.text();
//                throw new Error(raw || "Resposta inválida do servidor.");
//            }
//
//            if (res.ok) {
//                setStatus("✅ Deploy realizado com sucesso!");
//                setTimeout(() => setStatus(""), 10000);
//                setSelectedFile(null); // ✅ limpa o arquivo
//                setEntryFile("");       // ✅ limpa entrypoint manual
//                setResetCounter((prev) => prev + 1); // ✅ força reset visual no ZipUploadArea
//
//                if (result.app?.ID) {
//                    setAppID(result.app.ID);
//
//                    try {
//                        const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`, {
//                            method: "GET",
//                            credentials: "include",
//                        });
//
//                        const entryContentType = resEntries.headers.get("content-type") || "";
//                        const raw = await resEntries.text();
//
//                        if (entryContentType.includes("application/json")) {
//                            const parsed = JSON.parse(raw);
//                            setEntryPoints(parsed.entryPoints || []);
//                        } else {
//                            throw new Error(raw || "Resposta inválida ao buscar entrypoints.");
//                        }
//                    } catch (err) {
//                        console.error("Erro ao buscar entrypoints:", err);
//                        setStatus("⚠️ Deploy feito, mas falha ao buscar entrypoints.");
//                        setTimeout(() => setStatus(""), 10000);
//                    }
//                }
//            } else {
//                const msg = result.error || result.message || "Falha no deploy";
//                setStatus(`⚠️ ${msg}`);
//                setTimeout(() => setStatus(""), 10000);
//                if (currentPlan === "no-plan") {
//                    setShowUpgradeModal(true);
//                }
//            }
//        } catch (err) {
//            setStatus(`🚫 Erro: ${err.message}`);
//            setTimeout(() => setStatus(""), 10000);
//        } finally {
//            setIsDeploying(false);
//        }
//    };
//
//    return (
//        <div className="flex flex-col gap-6 py-6">
//            <form
//                className="flex flex-col gap-4"
//                onSubmit={(e) => {
//                    e.preventDefault();
//                    handleDeployClick();
//                }}
//            >
//                <div className="flex flex-col gap-4 lg:flex-row">
//                    <div className="mx-auto w-full max-w-5xl space-y-8">
//                        {/* Header */}
//                        <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                            <div className="w-full text-left">
//                                <Link
//                                    className="mb-4 flex items-center gap-2 text-secondary text-xs"
//                                    href={`/${lang}/dashboard`}
//                                >
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                    </svg>
//                                    Voltar para a dashboard
//                                </Link>
//                                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                            </div>
//                            <a
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                                href="/upload"
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                </svg>
//                                Fazer deploy de outra forma
//                            </a>
//                        </header>
//
//                        {/* Upload ZIP */}
//                        <div className="flex flex-col gap-6 rounded-md border bg-card py-6 text-card-foreground" data-slot="card">
//                            <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 border-b" data-slot="card-header">
//                                <div className="font-semibold text-base" data-slot="card-title">Quase lá! Agora, configure o seu zip.</div>
//                                <div className="text-secondary-foreground text-sm" data-slot="card-description">
//                                    Selecione o zip que será importado. Se for um monorepo, não se esqueça de alterar o diretório raiz para a pasta correta.
//                                </div>
//                            </div>
//
//                            <div className="px-6 md:h-100" data-slot="card-content">
//                                <ZipUploadArea
//                                    onFileSelect={(file) => {
//                                        setSelectedFile(file);
//                                        setHasFile(!!file); // ✅ ativa o botão após upload
//                                    }}
//                                    manualMode={executionMode === 'manual'}
//                                    onEntrypointSelect={(entry) => setEntryFile(entry)}
//                                    onEntrypointListUpdate={(list) => setEntryPoints(list)}
//                                    resetTrigger={resetCounter} // ✅ aqui
//                                />
//                            </div>
//                        </div>
//
//                        {/* Execução do ambiente */}
//                        <div className="flex flex-col gap-2">
//                            <label className="text-sm font-medium">
//                                Execução do ambiente<span className="ml-1.5 text-red-500">*</span>
//                            </label>
//                            <p className="text-muted-foreground text-sm">
//                                A execução do ambiente pode ser feita de duas formas: no modo Automático, a Virtus Cloud detecta o arquivo principal; no modo Manual, você poderá escolher qual arquivo iniciar.
//                            </p>
//
//                            <div className="flex flex-col-reverse gap-2 sm:flex-row md:gap-4 mt-2">
//                                {/* Botão de entrada com dropdown */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        disabled={executionMode !== 'manual'}
//                                        onClick={() => {
//                                            if (executionMode === 'manual') {
//                                                setShowEntrypointOptions((prev) => !prev);
//                                            }
//                                        }}
//                                        className={`flex justify-between items-center px-4 h-10 rounded-md text-sm w-full ${executionMode === 'manual'
//                                            ? 'bg-background text-white border border-border hover:bg-virtus-600'
//                                            : 'bg-input text-muted cursor-not-allowed'
//                                            }`}
//                                    >
//                                        {entryFile || 'Selecione um arquivo principal'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="1em"
//                                            height="1em"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`ml-2 size-4 opacity-50 transition-transform duration-250 ${showEntrypointOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {executionMode === 'manual' && showEntrypointOptions && entryPoints.length > 0 && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white max-h-64 overflow-y-auto">
//                                            {entryPoints.map((entry, i) => (
//                                                <li
//                                                    key={i}
//                                                    className="px-4 py-2 hover:bg-virtus-600 cursor-pointer truncate"
//                                                    onClick={() => {
//                                                        setEntryFile(entry);
//                                                        setShowEntrypointOptions(false);
//                                                    }}
//                                                >
//                                                    {entry}
//                                                </li>
//                                            ))}
//                                        </ul>
//                                    )}
//                                </div>
//                                {/* Botão de modo com menu suspenso */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        disabled={!hasFile}
//                                        onClick={() => {
//                                            if (hasFile) setShowModeOptions((prev) => !prev);
//                                        }}
//                                        className={`flex items-center justify-between rounded-md px-4 h-10 text-sm w-full ${hasFile
//                                            ? 'border border-input bg-input text-white hover:bg-virtus-600'
//                                            : 'bg-input text-muted cursor-not-allowed border border-border'
//                                            }`}
//                                    >
//                                        {executionMode === 'auto' ? 'Detectar automaticamente' : 'Definir manualmente'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="20"
//                                            height="20"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`text-secondary transition-transform duration-250 ${showModeOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {showModeOptions && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white">
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('auto');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Detectar automaticamente
//                                            </li>
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('manual');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Definir manualmente
//                                            </li>
//                                        </ul>
//                                    )}
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Separador */}
//                        <div className="shrink-0 bg-virtus-600 h-px w-full" />
//
//                        {/* Variáveis de Ambiente */}
//                        <div className="flex flex-col gap-1.5">
//                            <div className="rounded-md border border-border bg-background px-6">
//                                <div className="border-b">
//                                    <h3 className="flex justify-between py-4 text-sm font-medium hover:underline">
//                                        <span>Variáveis de Ambiente</span>
//                                    </h3>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Publicação na Web */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Publicação na Web</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se o seu projeto for um site ou uma API, ativar esta opção permitirá o roteamento da aplicação pela porta 80, possibilitando acesso externo via HTTPS e WSS. Além disso, será necessário atribuir um subdomínio ao projeto.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Comando de inicialização */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Comando de inicialização</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Defina um comando personalizado para iniciar sua aplicação conforme necessária.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Auto Restart */}
//                        <div className="flex flex-col gap-6 rounded-md py-6 text-card-foreground border border-blue-700/75 bg-gradient-to-bl from-blue-700/15 to-blue-700/5">
//                            <div className="px-6">
//                                <div className="font-semibold text-sm">
//                                    Auto Restart
//                                    <span className="ml-2 inline-flex items-center gap-1.5 font-semibold text-primary bg-blue-700 hover:bg-blue-800 rounded-sm px-1.5 text-[10px]/4">
//                                        Tecnologia Exclusiva
//                                    </span>
//                                </div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se sua aplicação travar devido a falhas inesperadas, a tecnologia exclusiva da Virtus Cloud tentará reiniciá-la automaticamente para garantir máxima disponibilidade e estabilidade.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="true" className="peer h-5 w-9 rounded-full bg-blue-600">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-[calc(100%-2px)] transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão de Deploy com spinner */}
//                        <button
//                            type="submit"
//                            disabled={isDeploying}
//                            aria-disabled={isDeploying}
//                            role="button"
//                            className={`group/button relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-white transition-all select-none
//                                ${isDeploying ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//                                bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                        >
//                            {isDeploying ? (
//                                <span className="absolute flex size-full items-center justify-center bg-inherit">
//                                    <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//                                </span>
//                            ) : (
//                                <span>Realizar o deploy</span>
//                            )}
//                        </button>
//                    </div>
//                </div>
//            </form>
//
//            {/* Toast centralizado */}
//            {status && (
//                <div className="toast-message">
//                    {status}
//                </div>
//            )}
//
//            <Footer />
//        </div>
//    );
//}

//frontend/src/components/buttons/UploadFormArchive.jsx

//'use client';
//
//import { useParams } from 'next/navigation';
//import { useState,  } from "react";
//import Footer from "../Recycles/Footer";
//import ZipUploadArea from '@/components/buttons/ZipUploadArea';
//import Link from 'next/link';
//import '@/app/styles/virtus.css';
//
//export default function UploadFormArchive() {
//    const [selectedFile, setSelectedFile] = useState(null);
//    const [entryFile, setEntryFile] = useState('');
//    const [status, setStatus] = useState("");
//    const [appID, setAppID] = useState("");
//    const [entryPoints, setEntryPoints] = useState([]);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//    const { lang } = useParams();
//    const [executionMode, setExecutionMode] = useState('auto');
//    const [showModeOptions, setShowModeOptions] = useState(false);
//    const [showEntrypointOptions, setShowEntrypointOptions] = useState(false);
//    const [fileTree, setFileTree] = useState([]);
//    const [resetCounter, setResetCounter] = useState(0);
//    const [isDeploying, setIsDeploying] = useState(false); // ✅ controle do spinner
//    const [hasFile, setHasFile] = useState(false);
//
//    const handleDeployClick = async () => {
//        if (!selectedFile) {
//            setStatus("🚫 Nenhum arquivo selecionado.");
//            setTimeout(() => setStatus(""), 5000);
//            return;
//        }
//
//        setIsDeploying(true);
//
//        try {
//            const resStatus = await fetch("/api/user/status", {
//                method: "GET",
//                credentials: "include",
//            });
//
//            const data = await resStatus.json();
//            const currentPlan = data.plan || "no-plan";
//            const canDeploy = data.canDeploy;
//
//            if (!canDeploy) {
//                setShowUpgradeModal(true);
//                setStatus("❌ Limite atingido pelo plano atual.");
//                setTimeout(() => setStatus(""), 5000);
//                setIsDeploying(false);
//                return;
//            }
//
//            const formData = new FormData();
//            formData.append("file", selectedFile);
//
//            if (executionMode === 'manual' && entryFile) {
//                formData.append("entrypoint", entryFile);
//            }
//
//            const res = await fetch(`/api/upload?plan=${currentPlan}`, {
//                method: "POST",
//                body: formData,
//                credentials: "include",
//            });
//
//            const contentType = res.headers.get("content-type") || "";
//            let result = {};
//
//            if (contentType.includes("application/json")) {
//                result = await res.json();
//            } else {
//                const raw = await res.text();
//                throw new Error(raw || "Resposta inválida do servidor.");
//            }
//
//            if (res.ok) {
//                setStatus("✅ Deploy realizado com sucesso!");
//                setTimeout(() => setStatus(""), 10000);
//                setSelectedFile(null); // ✅ limpa o arquivo
//                setEntryFile("");       // ✅ limpa entrypoint manual
//                setResetCounter((prev) => prev + 1); // ✅ força reset visual no ZipUploadArea
//
//                if (result.app?.ID) {
//                    setAppID(result.app.ID);
//
//                    try {
//                        const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`, {
//                            method: "GET",
//                            credentials: "include",
//                        });
//
//                        const entryContentType = resEntries.headers.get("content-type") || "";
//                        const raw = await resEntries.text();
//
//                        if (entryContentType.includes("application/json")) {
//                            const parsed = JSON.parse(raw);
//                            setEntryPoints(parsed.entryPoints || []);
//                        } else {
//                            throw new Error(raw || "Resposta inválida ao buscar entrypoints.");
//                        }
//                    } catch (err) {
//                        console.error("Erro ao buscar entrypoints:", err);
//                        setStatus("⚠️ Deploy feito, mas falha ao buscar entrypoints.");
//                        setTimeout(() => setStatus(""), 10000);
//                    }
//                }
//            } else {
//                const msg = result.error || result.message || "Falha no deploy";
//                setStatus(`⚠️ ${msg}`);
//                setTimeout(() => setStatus(""), 10000);
//                if (currentPlan === "no-plan") {
//                    setShowUpgradeModal(true);
//                }
//            }
//        } catch (err) {
//            setStatus(`🚫 Erro: ${err.message}`);
//            setTimeout(() => setStatus(""), 10000);
//        } finally {
//            setIsDeploying(false);
//        }
//    };
//    return (
//        <div className="flex flex-col gap-6 py-6">
//            <form
//                className="flex flex-col gap-4"
//                onSubmit={(e) => {
//                    e.preventDefault();
//                    handleDeployClick();
//                }}
//            >
//                <div className="flex flex-col gap-4 lg:flex-row">
//                    <div className="mx-auto w-full max-w-5xl space-y-8">
//                        {/* Header */}
//                        <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                            <div className="w-full text-left">
//                                <Link
//                                    className="mb-4 flex items-center gap-2 text-secondary text-xs"
//                                    href={`/${lang}/dashboard`}
//                                >
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                    </svg>
//                                    Voltar para a dashboard
//                                </Link>
//                                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                            </div>
//                            <a
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                                href="/upload"
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                </svg>
//                                Fazer deploy de outra forma
//                            </a>
//                        </header>
//
//                        {/* Upload ZIP */}
//                        <div className="flex flex-col gap-6 rounded-md border bg-card py-6 text-card-foreground" data-slot="card">
//                            <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 border-b" data-slot="card-header">
//                                <div className="font-semibold text-base" data-slot="card-title">Quase lá! Agora, configure o seu zip.</div>
//                                <div className="text-secondary-foreground text-sm" data-slot="card-description">
//                                    Selecione o zip que será importado. Se for um monorepo, não se esqueça de alterar o diretório raiz para a pasta correta.
//                                </div>
//                            </div>
//
//                            <div className="px-6 md:h-100" data-slot="card-content">
//                                <ZipUploadArea
//                                    onFileSelect={(file) => {
//                                        setSelectedFile(file);
//                                        setHasFile(!!file); // ✅ ativa o botão após upload
//                                    }}
//                                    manualMode={executionMode === 'manual'}
//                                    onEntrypointSelect={(entry) => setEntryFile(entry)}
//                                    onEntrypointListUpdate={(list) => setEntryPoints(list)}
//                                    resetTrigger={resetCounter} // ✅ aqui
//                                />
//                            </div>
//                        </div>
//
//                        {/* Execução do ambiente */}
//                        <div className="flex flex-col gap-2">
//                            <label className="text-sm font-medium">
//                                Execução do ambiente<span className="ml-1.5 text-red-500">*</span>
//                            </label>
//                            <p className="text-muted-foreground text-sm">
//                                A execução do ambiente pode ser feita de duas formas: no modo Automático, a Virtus Cloud detecta o arquivo principal; no modo Manual, você poderá escolher qual arquivo iniciar.
//                            </p>
//
//                            <div className="flex flex-col-reverse gap-2 sm:flex-row md:gap-4 mt-2">
//                                {/* Botão de entrada com dropdown */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        disabled={executionMode !== 'manual'}
//                                        onClick={() => {
//                                            if (executionMode === 'manual') {
//                                                setShowEntrypointOptions((prev) => !prev);
//                                            }
//                                        }}
//                                        className={`flex justify-between items-center px-4 h-10 rounded-md text-sm w-full ${executionMode === 'manual'
//                                            ? 'bg-background text-white border border-border hover:bg-virtus-600'
//                                            : 'bg-input text-muted cursor-not-allowed'
//                                            }`}
//                                    >
//                                        {entryFile || 'Selecione um arquivo principal'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="1em"
//                                            height="1em"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`ml-2 size-4 opacity-50 transition-transform duration-250 ${showEntrypointOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {executionMode === 'manual' && showEntrypointOptions && entryPoints.length > 0 && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white max-h-64 overflow-y-auto">
//                                            {entryPoints.map((entry, i) => (
//                                                <li
//                                                    key={i}
//                                                    className="px-4 py-2 hover:bg-virtus-600 cursor-pointer truncate"
//                                                    onClick={() => {
//                                                        setEntryFile(entry);
//                                                        setShowEntrypointOptions(false);
//                                                    }}
//                                                >
//                                                    {entry}
//                                                </li>
//                                            ))}
//                                        </ul>
//                                    )}
//                                </div>
//
//                                {/* Botão de modo com menu suspenso */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        disabled={!hasFile}
//                                        onClick={() => {
//                                            if (hasFile) setShowModeOptions((prev) => !prev);
//                                        }}
//                                        className={`flex items-center justify-between rounded-md px-4 h-10 text-sm w-full ${hasFile
//                                            ? 'border border-input bg-input text-white hover:bg-virtus-600'
//                                            : 'bg-input text-muted cursor-not-allowed border border-border'
//                                            }`}
//                                    >
//                                        {executionMode === 'auto' ? 'Detectar automaticamente' : 'Definir manualmente'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="20"
//                                            height="20"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`text-secondary transition-transform duration-250 ${showModeOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {showModeOptions && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white">
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('auto');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Detectar automaticamente
//                                            </li>
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('manual');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Definir manualmente
//                                            </li>
//                                        </ul>
//                                    )}
//                                </div>
//                            </div>
//                        </div>
//                        {/* Separador */}
//                        <div className="shrink-0 bg-virtus-600 h-px w-full" />
//
//                        {/* Variáveis de Ambiente */}
//                        <div className="flex flex-col gap-1.5">
//                            <div className="rounded-md border border-border bg-background px-6">
//                                <div className="border-b">
//                                    <h3 className="flex justify-between py-4 text-sm font-medium hover:underline">
//                                        <span>Variáveis de Ambiente</span>
//                                    </h3>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Publicação na Web */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Publicação na Web</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se o seu projeto for um site ou uma API, ativar esta opção permitirá o roteamento da aplicação pela porta 80, possibilitando acesso externo via HTTPS e WSS. Além disso, será necessário atribuir um subdomínio ao projeto.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Comando de inicialização */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Comando de inicialização</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Defina um comando personalizado para iniciar sua aplicação conforme necessária.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Auto Restart */}
//                        <div className="flex flex-col gap-6 rounded-md py-6 text-card-foreground border border-blue-700/75 bg-gradient-to-bl from-blue-700/15 to-blue-700/5">
//                            <div className="px-6">
//                                <div className="font-semibold text-sm">
//                                    Auto Restart
//                                    <span className="ml-2 inline-flex items-center gap-1.5 font-semibold text-primary bg-blue-700 hover:bg-blue-800 rounded-sm px-1.5 text-[10px]/4">
//                                        Tecnologia Exclusiva
//                                    </span>
//                                </div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se sua aplicação travar devido a falhas inesperadas, a tecnologia exclusiva da Virtus Cloud tentará reiniciá-la automaticamente para garantir máxima disponibilidade e estabilidade.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="true" className="peer h-5 w-9 rounded-full bg-blue-600">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-[calc(100%-2px)] transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão de Deploy com spinner */}
//                        <button
//                            type="submit"
//                            disabled={isDeploying}
//                            aria-disabled={isDeploying}
//                            role="button"
//                            className={`group/button relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-white transition-all select-none
//                ${isDeploying ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//                bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                        >
//                            {isDeploying ? (
//                                <span className="absolute flex size-full items-center justify-center bg-inherit">
//                                    <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//                                </span>
//                            ) : (
//                                <span>Realizar o deploy</span>
//                            )}
//                        </button>
//
//                        {/* Entrypoints detectados */}
//                    </div>
//                </div>
//            </form>
//
//            {/* Toast centralizado */}
//            {status && (
//                <div className="toast-message">
//                    {status}
//                </div>
//            )}
//
//            <Footer />
//        </div>
//    );
//}

//frontend/src/components/buttons/UploadFormArchive.jsx

//'use client';
//
//import { useState } from "react";
//import Footer from "../Recycles/Footer";
//import ZipUploadArea from '@/components/buttons/ZipUploadArea';
//import '@/app/styles/virtus.css';
//
//export default function UploadFormArchive() {
//    const [selectedFile, setSelectedFile] = useState(null);
//    const [entryFile, setEntryFile] = useState('');
//    const [status, setStatus] = useState("");
//    const [appID, setAppID] = useState("");
//    const [entryPoints, setEntryPoints] = useState([]);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//
//    const [executionMode, setExecutionMode] = useState('auto');
//    const [showModeOptions, setShowModeOptions] = useState(false);
//    const [showEntrypointOptions, setShowEntrypointOptions] = useState(false);
//    const [fileTree, setFileTree] = useState([]);
//    const [resetCounter, setResetCounter] = useState(0);
//    const [isDeploying, setIsDeploying] = useState(false); // ✅ controle do spinner
//    const [hasFile, setHasFile] = useState(false);
//
//    const handleDeployClick = async () => {
//        if (!selectedFile) {
//            setStatus("🚫 Nenhum arquivo selecionado.");
//            setTimeout(() => setStatus(""), 5000);
//            return;
//        }
//
//        setIsDeploying(true);
//
//        try {
//            const resStatus = await fetch("/api/user/status", {
//                method: "GET",
//                credentials: "include",
//            });
//
//            const data = await resStatus.json();
//            const currentPlan = data.plan || "no-plan";
//            const canDeploy = data.canDeploy;
//
//            if (!canDeploy) {
//                setShowUpgradeModal(true);
//                setStatus("❌ Deploy bloqueado pelo plano atual.");
//                setTimeout(() => setStatus(""), 5000);
//                setIsDeploying(false);
//                return;
//            }
//
//            const formData = new FormData();
//            formData.append("file", selectedFile);
//
//            if (executionMode === 'manual' && entryFile) {
//                formData.append("entrypoint", entryFile);
//            }
//
//            const res = await fetch(`/api/upload?plan=${currentPlan}`, {
//                method: "POST",
//                body: formData,
//                credentials: "include",
//            });
//
//            const contentType = res.headers.get("content-type") || "";
//            let result = {};
//
//            if (contentType.includes("application/json")) {
//                result = await res.json();
//            } else {
//                const raw = await res.text();
//                throw new Error(raw || "Resposta inválida do servidor.");
//            }
//
//            if (res.ok) {
//                setStatus("✅ Deploy realizado com sucesso!");
//                setTimeout(() => setStatus(""), 10000);
//                setSelectedFile(null); // ✅ limpa o arquivo
//                setEntryFile("");       // ✅ limpa entrypoint manual
//                setResetCounter((prev) => prev + 1); // ✅ força reset visual no ZipUploadArea
//
//                if (result.app?.ID) {
//                    setAppID(result.app.ID);
//
//                    try {
//                        const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`, {
//                            method: "GET",
//                            credentials: "include",
//                        });
//
//                        const entryContentType = resEntries.headers.get("content-type") || "";
//                        const raw = await resEntries.text();
//
//                        if (entryContentType.includes("application/json")) {
//                            const parsed = JSON.parse(raw);
//                            setEntryPoints(parsed.entryPoints || []);
//                        } else {
//                            throw new Error(raw || "Resposta inválida ao buscar entrypoints.");
//                        }
//                    } catch (err) {
//                        console.error("Erro ao buscar entrypoints:", err);
//                        setStatus("⚠️ Deploy feito, mas falha ao buscar entrypoints.");
//                        setTimeout(() => setStatus(""), 10000);
//                    }
//                }
//            } else {
//                const msg = result.error || result.message || "Falha no deploy";
//                setStatus(`⚠️ ${msg}`);
//                setTimeout(() => setStatus(""), 10000);
//                if (currentPlan === "no-plan") {
//                    setShowUpgradeModal(true);
//                }
//            }
//        } catch (err) {
//            setStatus(`🚫 Erro: ${err.message}`);
//            setTimeout(() => setStatus(""), 10000);
//        } finally {
//            setIsDeploying(false);
//        }
//    };
//    return (
//        <div className="flex flex-col gap-6 py-6">
//            <form
//                className="flex flex-col gap-4"
//                onSubmit={(e) => {
//                    e.preventDefault();
//                    handleDeployClick();
//                }}
//            >
//                <div className="flex flex-col gap-4 lg:flex-row">
//                    <div className="mx-auto w-full max-w-5xl space-y-8">
//                        {/* Header */}
//                        <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                            <div className="w-full text-left">
//                                <a className="mb-4 flex items-center gap-2 text-secondary text-xs" href="/dashboard">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                    </svg>
//                                    Voltar para a dashboard
//                                </a>
//                                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                            </div>
//                            <a
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                                href="/upload"
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                </svg>
//                                Fazer deploy de outra forma
//                            </a>
//                        </header>
//
//                        {/* Upload ZIP */}
//                        <div className="flex flex-col gap-6 rounded-md border bg-card py-6 text-card-foreground" data-slot="card">
//                            <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 border-b" data-slot="card-header">
//                                <div className="font-semibold text-base" data-slot="card-title">Quase lá! Agora, configure o seu zip.</div>
//                                <div className="text-secondary-foreground text-sm" data-slot="card-description">
//                                    Selecione o zip que será importado. Se for um monorepo, não se esqueça de alterar o diretório raiz para a pasta correta.
//                                </div>
//                            </div>
//
//                            <div className="px-6 md:h-100" data-slot="card-content">
//                                <ZipUploadArea
//                                    onFileSelect={(file) => {
//                                        setSelectedFile(file);
//                                        setHasFile(!!file); // ✅ ativa o botão após upload
//                                    }}
//                                    manualMode={executionMode === 'manual'}
//                                    onEntrypointSelect={(entry) => setEntryFile(entry)}
//                                    onEntrypointListUpdate={(list) => setEntryPoints(list)}
//                                    resetTrigger={resetCounter} // ✅ aqui
//                                />
//                            </div>
//                        </div>
//
//                        {/* Execução do ambiente */}
//                        <div className="flex flex-col gap-2">
//                            <label className="text-sm font-medium">
//                                Execução do ambiente<span className="ml-1.5 text-red-500">*</span>
//                            </label>
//                            <p className="text-muted-foreground text-sm">
//                                A execução do ambiente pode ser feita de duas formas: no modo Automático, a Virtus Cloud detecta o arquivo principal; no modo Manual, você poderá escolher qual arquivo iniciar.
//                            </p>
//
//                            <div className="flex flex-col-reverse gap-2 sm:flex-row md:gap-4 mt-2">
//                                {/* Botão de entrada com dropdown */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        disabled={executionMode !== 'manual'}
//                                        onClick={() => {
//                                            if (executionMode === 'manual') {
//                                                setShowEntrypointOptions((prev) => !prev);
//                                            }
//                                        }}
//                                        className={`flex justify-between items-center px-4 h-10 rounded-md text-sm w-full ${executionMode === 'manual'
//                                            ? 'bg-background text-white border border-border hover:bg-virtus-600'
//                                            : 'bg-input text-muted cursor-not-allowed'
//                                            }`}
//                                    >
//                                        {entryFile || 'Selecione um arquivo principal'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="1em"
//                                            height="1em"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`ml-2 size-4 opacity-50 transition-transform duration-250 ${showEntrypointOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {executionMode === 'manual' && showEntrypointOptions && entryPoints.length > 0 && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white max-h-64 overflow-y-auto">
//                                            {entryPoints.map((entry, i) => (
//                                                <li
//                                                    key={i}
//                                                    className="px-4 py-2 hover:bg-virtus-600 cursor-pointer truncate"
//                                                    onClick={() => {
//                                                        setEntryFile(entry);
//                                                        setShowEntrypointOptions(false);
//                                                    }}
//                                                >
//                                                    {entry}
//                                                </li>
//                                            ))}
//                                        </ul>
//                                    )}
//                                </div>
//
//                                {/* Botão de modo com menu suspenso */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        disabled={!hasFile}
//                                        onClick={() => {
//                                            if (hasFile) setShowModeOptions((prev) => !prev);
//                                        }}
//                                        className={`flex items-center justify-between rounded-md px-4 h-10 text-sm w-full ${hasFile
//                                            ? 'border border-input bg-input text-white hover:bg-virtus-600'
//                                            : 'bg-input text-muted cursor-not-allowed border border-border'
//                                            }`}
//                                    >
//                                        {executionMode === 'auto' ? 'Detectar automaticamente' : 'Definir manualmente'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="20"
//                                            height="20"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`text-secondary transition-transform duration-250 ${showModeOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {showModeOptions && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white">
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('auto');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Detectar automaticamente
//                                            </li>
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('manual');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Definir manualmente
//                                            </li>
//                                        </ul>
//                                    )}
//                                </div>
//                            </div>
//                        </div>
//                        {/* Separador */}
//                        <div className="shrink-0 bg-virtus-600 h-px w-full" />
//
//                        {/* Variáveis de Ambiente */}
//                        <div className="flex flex-col gap-1.5">
//                            <div className="rounded-md border border-border bg-background px-6">
//                                <div className="border-b">
//                                    <h3 className="flex justify-between py-4 text-sm font-medium hover:underline">
//                                        <span>Variáveis de Ambiente</span>
//                                    </h3>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Publicação na Web */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Publicação na Web</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se o seu projeto for um site ou uma API, ativar esta opção permitirá o roteamento da aplicação pela porta 80, possibilitando acesso externo via HTTPS e WSS. Além disso, será necessário atribuir um subdomínio ao projeto.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Comando de inicialização */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Comando de inicialização</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Defina um comando personalizado para iniciar sua aplicação conforme necessária.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Auto Restart */}
//                        <div className="flex flex-col gap-6 rounded-md py-6 text-card-foreground border border-blue-700/75 bg-gradient-to-bl from-blue-700/15 to-blue-700/5">
//                            <div className="px-6">
//                                <div className="font-semibold text-sm">
//                                    Auto Restart
//                                    <span className="ml-2 inline-flex items-center gap-1.5 font-semibold text-primary bg-blue-700 hover:bg-blue-800 rounded-sm px-1.5 text-[10px]/4">
//                                        Tecnologia Exclusiva
//                                    </span>
//                                </div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se sua aplicação travar devido a falhas inesperadas, a tecnologia exclusiva da Virtus Cloud tentará reiniciá-la automaticamente para garantir máxima disponibilidade e estabilidade.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="true" className="peer h-5 w-9 rounded-full bg-blue-600">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-[calc(100%-2px)] transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão de Deploy com spinner */}
//                        <button
//                            type="submit"
//                            disabled={isDeploying}
//                            aria-disabled={isDeploying}
//                            role="button"
//                            className={`group/button relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-white transition-all select-none
//                ${isDeploying ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//                bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                        >
//                            {isDeploying ? (
//                                <span className="absolute flex size-full items-center justify-center bg-inherit">
//                                    <span className="size-5 animate-spin rounded-full border-2 border-virtus-200 border-l-virtus-50"></span>
//                                </span>
//                            ) : (
//                                <span>Realizar o deploy</span>
//                            )}
//                        </button>
//
//                        {/* Entrypoints detectados */}
//                    </div>
//                </div>
//            </form>
//
//            {/* Toast centralizado */}
//            {status && (
//                <div className="toast-message">
//                    {status}
//                </div>
//            )}
//
//            <Footer />
//        </div>
//    );
//}

//'use client';
//
//import { useState } from "react";
//import Footer from "../Recycles/Footer";
//import ZipUploadArea from '@/components/buttons/ZipUploadArea';
//import '@/app/styles/virtus.css';
//
//export default function UploadFormArchive() {
//    const [selectedFile, setSelectedFile] = useState(null);
//    const [entryFile, setEntryFile] = useState('');
//    const [status, setStatus] = useState("");
//    const [appID, setAppID] = useState("");
//    const [entryPoints, setEntryPoints] = useState([]);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//
//    const [executionMode, setExecutionMode] = useState('auto');
//    const [showModeOptions, setShowModeOptions] = useState(false);
//    const [showEntrypointOptions, setShowEntrypointOptions] = useState(false);
//    const [fileTree, setFileTree] = useState([]);
//    const [resetCounter, setResetCounter] = useState(0);
//    const [isDeploying, setIsDeploying] = useState(false); // ✅ controle do spinner
//    const [hasFile, setHasFile] = useState(false);
//
//    const handleDeployClick = async () => {
//        if (!selectedFile) {
//            setStatus("🚫 Nenhum arquivo selecionado.");
//            setTimeout(() => setStatus(""), 5000);
//            return;
//        }
//
//        setIsDeploying(true);
//
//        try {
//            const resStatus = await fetch("/api/user/status", {
//                method: "GET",
//                credentials: "include",
//            });
//
//            const data = await resStatus.json();
//            const currentPlan = data.plan || "no-plan";
//            const canDeploy = data.canDeploy;
//
//            if (!canDeploy) {
//                setShowUpgradeModal(true);
//                setStatus("❌ Deploy bloqueado pelo plano atual.");
//                setTimeout(() => setStatus(""), 5000);
//                setIsDeploying(false);
//                return;
//            }
//
//            const formData = new FormData();
//            formData.append("file", selectedFile);
//
//            if (executionMode === 'manual' && entryFile) {
//                formData.append("entrypoint", entryFile);
//            }
//
//            const res = await fetch(`/api/upload?plan=${currentPlan}`, {
//                method: "POST",
//                body: formData,
//                credentials: "include",
//            });
//
//            const contentType = res.headers.get("content-type") || "";
//            let result = {};
//
//            if (contentType.includes("application/json")) {
//                result = await res.json();
//            } else {
//                const raw = await res.text();
//                throw new Error(raw || "Resposta inválida do servidor.");
//            }
//
//            if (res.ok) {
//                setStatus("✅ Deploy realizado com sucesso!");
//                setTimeout(() => setStatus(""), 10000);
//                setSelectedFile(null); // ✅ limpa o arquivo
//                setEntryFile("");       // ✅ limpa entrypoint manual
//                setResetCounter((prev) => prev + 1); // ✅ força reset visual no ZipUploadArea
//
//                if (result.app?.ID) {
//                    setAppID(result.app.ID);
//
//                    try {
//                        const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`, {
//                            method: "GET",
//                            credentials: "include",
//                        });
//
//                        const entryContentType = resEntries.headers.get("content-type") || "";
//                        const raw = await resEntries.text();
//
//                        if (entryContentType.includes("application/json")) {
//                            const parsed = JSON.parse(raw);
//                            setEntryPoints(parsed.entryPoints || []);
//                        } else {
//                            throw new Error(raw || "Resposta inválida ao buscar entrypoints.");
//                        }
//                    } catch (err) {
//                        console.error("Erro ao buscar entrypoints:", err);
//                        setStatus("⚠️ Deploy feito, mas falha ao buscar entrypoints.");
//                        setTimeout(() => setStatus(""), 10000);
//                    }
//                }
//            } else {
//                const msg = result.error || result.message || "Falha no deploy";
//                setStatus(`⚠️ ${msg}`);
//                setTimeout(() => setStatus(""), 10000);
//                if (currentPlan === "no-plan") {
//                    setShowUpgradeModal(true);
//                }
//            }
//        } catch (err) {
//            setStatus(`🚫 Erro: ${err.message}`);
//            setTimeout(() => setStatus(""), 10000);
//        } finally {
//            setIsDeploying(false);
//        }
//    };
//    return (
//        <div className="flex flex-col gap-6 py-6">
//            <form
//                className="flex flex-col gap-4"
//                onSubmit={(e) => {
//                    e.preventDefault();
//                    handleDeployClick();
//                }}
//            >
//                <div className="flex flex-col gap-4 lg:flex-row">
//                    <div className="mx-auto w-full max-w-5xl space-y-8">
//                        {/* Header */}
//                        <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                            <div className="w-full text-left">
//                                <a className="mb-4 flex items-center gap-2 text-secondary text-xs" href="/dashboard">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                    </svg>
//                                    Voltar para a dashboard
//                                </a>
//                                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                            </div>
//                            <a
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                                href="/upload"
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                </svg>
//                                Fazer deploy de outra forma
//                            </a>
//                        </header>
//
//                        {/* Upload ZIP */}
//                        <ZipUploadArea
//                            onFileSelect={(file) => {
//                                setSelectedFile(file);
//                                setHasFile(!!file); // ✅ ativa o botão após upload
//                            }}
//                            manualMode={executionMode === 'manual'}
//                            onEntrypointSelect={(entry) => setEntryFile(entry)}
//                            onEntrypointListUpdate={(list) => setEntryPoints(list)}
//                            resetTrigger={resetCounter} // ✅ aqui
//                        />
//
//                        {/* Execução do ambiente */}
//                        <div className="flex flex-col gap-2">
//                            <label className="text-sm font-medium">
//                                Execução do ambiente<span className="ml-1.5 text-red-500">*</span>
//                            </label>
//                            <p className="text-muted-foreground text-sm">
//                                A execução do ambiente pode ser feita de duas formas: no modo Automático, a Virtus Cloud detecta o arquivo principal; no modo Manual, você poderá escolher qual arquivo iniciar.
//                            </p>
//
//                            <div className="flex flex-col-reverse gap-2 sm:flex-row md:gap-4 mt-2">
//                                {/* Botão de entrada com dropdown */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        disabled={executionMode !== 'manual'}
//                                        onClick={() => {
//                                            if (executionMode === 'manual') {
//                                                setShowEntrypointOptions((prev) => !prev);
//                                            }
//                                        }}
//                                        className={`flex justify-between items-center px-4 h-10 rounded-md text-sm w-full ${executionMode === 'manual'
//                                            ? 'bg-background text-white border border-border hover:bg-virtus-600'
//                                            : 'bg-input text-muted cursor-not-allowed'
//                                            }`}
//                                    >
//                                        {entryFile || 'Selecione um arquivo principal'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="1em"
//                                            height="1em"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`ml-2 size-4 opacity-50 transition-transform duration-250 ${showEntrypointOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {executionMode === 'manual' && showEntrypointOptions && entryPoints.length > 0 && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white max-h-64 overflow-y-auto">
//                                            {entryPoints.map((entry, i) => (
//                                                <li
//                                                    key={i}
//                                                    className="px-4 py-2 hover:bg-virtus-600 cursor-pointer truncate"
//                                                    onClick={() => {
//                                                        setEntryFile(entry);
//                                                        setShowEntrypointOptions(false);
//                                                    }}
//                                                >
//                                                    {entry}
//                                                </li>
//                                            ))}
//                                        </ul>
//                                    )}
//                                </div>
//
//                                {/* Botão de modo com menu suspenso */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        disabled={!hasFile}
//                                        onClick={() => {
//                                            if (hasFile) setShowModeOptions((prev) => !prev);
//                                        }}
//                                        className={`flex items-center justify-between rounded-md px-4 h-10 text-sm w-full ${hasFile
//                                                ? 'border border-input bg-input text-white hover:bg-virtus-600'
//                                                : 'bg-input text-muted cursor-not-allowed border border-border'
//                                            }`}
//                                    >
//                                        {executionMode === 'auto' ? 'Detectar automaticamente' : 'Definir manualmente'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="20"
//                                            height="20"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`text-secondary transition-transform duration-250 ${showModeOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {showModeOptions && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white">
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('auto');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Detectar automaticamente
//                                            </li>
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('manual');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Definir manualmente
//                                            </li>
//                                        </ul>
//                                    )}
//                                </div>
//                            </div>
//                        </div>
//                        {/* Separador */}
//                        <div className="shrink-0 bg-virtus-600 h-px w-full" />
//
//                        {/* Variáveis de Ambiente */}
//                        <div className="flex flex-col gap-1.5">
//                            <div className="rounded-md border border-border bg-background px-6">
//                                <div className="border-b">
//                                    <h3 className="flex justify-between py-4 text-sm font-medium hover:underline">
//                                        <span>Variáveis de Ambiente</span>
//                                    </h3>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Publicação na Web */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Publicação na Web</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se o seu projeto for um site ou uma API, ativar esta opção permitirá o roteamento da aplicação pela porta 80, possibilitando acesso externo via HTTPS e WSS. Além disso, será necessário atribuir um subdomínio ao projeto.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Comando de inicialização */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Comando de inicialização</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Defina um comando personalizado para iniciar sua aplicação conforme necessária.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Auto Restart */}
//                        <div className="flex flex-col gap-6 rounded-md py-6 text-card-foreground border border-blue-700/75 bg-gradient-to-bl from-blue-700/15 to-blue-700/5">
//                            <div className="px-6">
//                                <div className="font-semibold text-sm">
//                                    Auto Restart
//                                    <span className="ml-2 inline-flex items-center gap-1.5 font-semibold text-primary bg-blue-700 hover:bg-blue-800 rounded-sm px-1.5 text-[10px]/4">
//                                        Tecnologia Exclusiva
//                                    </span>
//                                </div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se sua aplicação travar devido a falhas inesperadas, a tecnologia exclusiva da Virtus Cloud tentará reiniciá-la automaticamente para garantir máxima disponibilidade e estabilidade.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="true" className="peer h-5 w-9 rounded-full bg-blue-600">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-[calc(100%-2px)] transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão de Deploy com spinner */}
//                        <button
//                            type="submit"
//                            disabled={isDeploying}
//                            aria-disabled={isDeploying}
//                            role="button"
//                            className={`group/button relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-white transition-all select-none
//                ${isDeploying ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//                bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                        >
//                            {isDeploying ? (
//                                <span className="absolute flex size-full items-center justify-center bg-inherit">
//                                    <span className="size-5 animate-spin rounded-full border-2 border-white border-l-transparent"></span>
//                                </span>
//                            ) : (
//                                <span>Realizar o deploy</span>
//                            )}
//                        </button>
//
//                        {/* Entrypoints detectados */}
//                    </div>
//                </div>
//            </form>
//
//            {/* Toast centralizado */}
//            {status && (
//                <div className="toast-message">
//                    {status}
//                </div>
//            )}
//
//            <Footer />
//        </div>
//    );
//}

//frontend/src/components/buttons/UploadFormArchive.jsx

//'use client';
//
//import { useState } from "react";
//import Footer from "../Recycles/Footer";
//import ZipUploadArea from '@/components/buttons/ZipUploadArea';
//import '@/app/styles/virtus.css';
//
//export default function UploadFormArchive() {
//    const [selectedFile, setSelectedFile] = useState(null);
//    const [entryFile, setEntryFile] = useState('');
//    const [status, setStatus] = useState("");
//    const [appID, setAppID] = useState("");
//    const [entryPoints, setEntryPoints] = useState([]);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//
//    const [executionMode, setExecutionMode] = useState('auto');
//    const [showModeOptions, setShowModeOptions] = useState(false);
//    const [showEntrypointOptions, setShowEntrypointOptions] = useState(false);
//    const [fileTree, setFileTree] = useState([]);
//    const [resetCounter, setResetCounter] = useState(0);
//    const [isDeploying, setIsDeploying] = useState(false); // ✅ controle do spinner
//
//    const handleDeployClick = async () => {
//        if (!selectedFile) {
//            setStatus("🚫 Nenhum arquivo selecionado.");
//            setTimeout(() => setStatus(""), 5000);
//            return;
//        }
//
//        setIsDeploying(true);
//
//        try {
//            const resStatus = await fetch("/api/user/status", {
//                method: "GET",
//                credentials: "include",
//            });
//
//            const data = await resStatus.json();
//            const currentPlan = data.plan || "no-plan";
//            const canDeploy = data.canDeploy;
//
//            if (!canDeploy) {
//                setShowUpgradeModal(true);
//                setStatus("❌ Deploy bloqueado pelo plano atual.");
//                setTimeout(() => setStatus(""), 5000);
//                setIsDeploying(false);
//                return;
//            }
//
//            const formData = new FormData();
//            formData.append("file", selectedFile);
//
//            if (executionMode === 'manual' && entryFile) {
//                formData.append("entrypoint", entryFile);
//            }
//
//            const res = await fetch(`/api/upload?plan=${currentPlan}`, {
//                method: "POST",
//                body: formData,
//                credentials: "include",
//            });
//
//            const contentType = res.headers.get("content-type") || "";
//            let result = {};
//
//            if (contentType.includes("application/json")) {
//                result = await res.json();
//            } else {
//                const raw = await res.text();
//                throw new Error(raw || "Resposta inválida do servidor.");
//            }
//
//            if (res.ok) {
//                setStatus("✅ Deploy realizado com sucesso!");
//                setTimeout(() => setStatus(""), 10000);
//                setSelectedFile(null); // ✅ limpa o arquivo
//                setEntryFile("");       // ✅ limpa entrypoint manual
//                setResetCounter((prev) => prev + 1); // ✅ força reset visual no ZipUploadArea
//
//                if (result.app?.ID) {
//                    setAppID(result.app.ID);
//
//                    try {
//                        const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`, {
//                            method: "GET",
//                            credentials: "include",
//                        });
//
//                        const entryContentType = resEntries.headers.get("content-type") || "";
//                        const raw = await resEntries.text();
//
//                        if (entryContentType.includes("application/json")) {
//                            const parsed = JSON.parse(raw);
//                            setEntryPoints(parsed.entryPoints || []);
//                        } else {
//                            throw new Error(raw || "Resposta inválida ao buscar entrypoints.");
//                        }
//                    } catch (err) {
//                        console.error("Erro ao buscar entrypoints:", err);
//                        setStatus("⚠️ Deploy feito, mas falha ao buscar entrypoints.");
//                        setTimeout(() => setStatus(""), 10000);
//                    }
//                }
//            } else {
//                const msg = result.error || result.message || "Falha no deploy";
//                setStatus(`⚠️ ${msg}`);
//                setTimeout(() => setStatus(""), 10000);
//                if (currentPlan === "no-plan") {
//                    setShowUpgradeModal(true);
//                }
//            }
//        } catch (err) {
//            setStatus(`🚫 Erro: ${err.message}`);
//            setTimeout(() => setStatus(""), 10000);
//        } finally {
//            setIsDeploying(false);
//        }
//    };
//    return (
//        <div className="flex flex-col gap-6 py-6">
//            <form
//                className="flex flex-col gap-4"
//                onSubmit={(e) => {
//                    e.preventDefault();
//                    handleDeployClick();
//                }}
//            >
//                <div className="flex flex-col gap-4 lg:flex-row">
//                    <div className="mx-auto w-full max-w-5xl space-y-8">
//                        {/* Header */}
//                        <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                            <div className="w-full text-left">
//                                <a className="mb-4 flex items-center gap-2 text-secondary text-xs" href="/dashboard">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                    </svg>
//                                    Voltar para a dashboard
//                                </a>
//                                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                            </div>
//                            <a
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                                href="/upload"
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                </svg>
//                                Fazer deploy de outra forma
//                            </a>
//                        </header>
//
//                        {/* Upload ZIP */}
//                        <ZipUploadArea
//                            onFileSelect={(file) => setSelectedFile(file)}
//                            manualMode={executionMode === 'manual'}
//                            onEntrypointSelect={(entry) => setEntryFile(entry)}
//                            onEntrypointListUpdate={(list) => setEntryPoints(list)}
//                            resetTrigger={resetCounter} // ✅ aqui
//                        />
//
//                        {/* Execução do ambiente */}
//                        <div className="flex flex-col gap-2">
//                            <label className="text-sm font-medium">
//                                Execução do ambiente<span className="ml-1.5 text-red-500">*</span>
//                            </label>
//                            <p className="text-muted-foreground text-sm">
//                                A execução do ambiente pode ser feita de duas formas: no modo Automático, a Virtus Cloud detecta o arquivo principal; no modo Manual, você poderá escolher qual arquivo iniciar.
//                            </p>
//
//                            <div className="flex flex-col-reverse gap-2 sm:flex-row md:gap-4 mt-2">
//                                {/* Botão de entrada com dropdown */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        disabled={executionMode !== 'manual'}
//                                        onClick={() => {
//                                            if (executionMode === 'manual') {
//                                                setShowEntrypointOptions((prev) => !prev);
//                                            }
//                                        }}
//                                        className={`flex justify-between items-center px-4 h-10 rounded-md text-sm w-full ${executionMode === 'manual'
//                                            ? 'bg-background text-white border border-border hover:bg-virtus-600'
//                                            : 'bg-input text-muted cursor-not-allowed'
//                                            }`}
//                                    >
//                                        {entryFile || 'Selecione um arquivo principal'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="1em"
//                                            height="1em"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`ml-2 size-4 opacity-50 transition-transform duration-250 ${showEntrypointOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {executionMode === 'manual' && showEntrypointOptions && entryPoints.length > 0 && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white max-h-64 overflow-y-auto">
//                                            {entryPoints.map((entry, i) => (
//                                                <li
//                                                    key={i}
//                                                    className="px-4 py-2 hover:bg-virtus-600 cursor-pointer truncate"
//                                                    onClick={() => {
//                                                        setEntryFile(entry);
//                                                        setShowEntrypointOptions(false);
//                                                    }}
//                                                >
//                                                    {entry}
//                                                </li>
//                                            ))}
//                                        </ul>
//                                    )}
//                                </div>
//
//                                {/* Botão de modo com menu suspenso */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        onClick={() => setShowModeOptions((prev) => !prev)}
//                                        className="flex items-center justify-between rounded-md border border-input bg-input px-4 h-10 text-sm text-white"
//                                    >
//                                        {executionMode === 'auto' ? 'Detectar automaticamente' : 'Definir manualmente'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="20"
//                                            height="20"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`text-secondary transition-transform duration-250 ${showModeOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {showModeOptions && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white">
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('auto');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Detectar automaticamente
//                                            </li>
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('manual');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Definir manualmente
//                                            </li>
//                                        </ul>
//                                    )}
//                                </div>
//                            </div>
//                        </div>
//                        {/* Separador */}
//                        <div className="shrink-0 bg-virtus-600 h-px w-full" />
//
//                        {/* Variáveis de Ambiente */}
//                        <div className="flex flex-col gap-1.5">
//                            <div className="rounded-md border border-border bg-background px-6">
//                                <div className="border-b">
//                                    <h3 className="flex justify-between py-4 text-sm font-medium hover:underline">
//                                        <span>Variáveis de Ambiente</span>
//                                    </h3>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Publicação na Web */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Publicação na Web</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se o seu projeto for um site ou uma API, ativar esta opção permitirá o roteamento da aplicação pela porta 80, possibilitando acesso externo via HTTPS e WSS. Além disso, será necessário atribuir um subdomínio ao projeto.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Comando de inicialização */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Comando de inicialização</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Defina um comando personalizado para iniciar sua aplicação conforme necessária.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Auto Restart */}
//                        <div className="flex flex-col gap-6 rounded-md py-6 text-card-foreground border border-blue-700/75 bg-gradient-to-bl from-blue-700/15 to-blue-700/5">
//                            <div className="px-6">
//                                <div className="font-semibold text-sm">
//                                    Auto Restart
//                                    <span className="ml-2 inline-flex items-center gap-1.5 font-semibold text-primary bg-blue-700 hover:bg-blue-800 rounded-sm px-1.5 text-[10px]/4">
//                                        Tecnologia Exclusiva
//                                    </span>
//                                </div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se sua aplicação travar devido a falhas inesperadas, a tecnologia exclusiva da Virtus Cloud tentará reiniciá-la automaticamente para garantir máxima disponibilidade e estabilidade.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="true" className="peer h-5 w-9 rounded-full bg-blue-600">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-[calc(100%-2px)] transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão de Deploy com spinner */}
//                        <button
//                            type="submit"
//                            disabled={isDeploying}
//                            aria-disabled={isDeploying}
//                            role="button"
//                            className={`group/button relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-white transition-all select-none
//                ${isDeploying ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//                bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                        >
//                            {isDeploying ? (
//                                <span className="absolute flex size-full items-center justify-center bg-inherit">
//                                    <span className="size-5 animate-spin rounded-full border-2 border-white border-l-transparent"></span>
//                                </span>
//                            ) : (
//                                <span>Realizar o deploy</span>
//                            )}
//                        </button>
//
//                        {/* Entrypoints detectados */}
//                    </div>
//                </div>
//            </form>
//
//            {/* Toast centralizado */}
//            {status && (
//                <div className="toast-message">
//                    {status}
//                </div>
//            )}
//
//            <Footer />
//        </div>
//    );
//}

//frontend/src/components/buttons/UploadFormArchive.jsx

//'use client';
//
//import { useState } from "react";
//import Footer from "../Recycles/Footer";
//import ZipUploadArea from '@/components/buttons/ZipUploadArea';
//import '@/app/styles/virtus.css';
//
//export default function UploadFormArchive() {
//    const [selectedFile, setSelectedFile] = useState(null);
//    const [entryFile, setEntryFile] = useState('');
//    const [status, setStatus] = useState("");
//    const [appID, setAppID] = useState("");
//    const [entryPoints, setEntryPoints] = useState([]);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//
//    const [executionMode, setExecutionMode] = useState('auto');
//    const [showModeOptions, setShowModeOptions] = useState(false);
//    const [showEntrypointOptions, setShowEntrypointOptions] = useState(false);
//    const [fileTree, setFileTree] = useState([]);
//    const [resetCounter, setResetCounter] = useState(0);
//    const [isDeploying, setIsDeploying] = useState(false); // ✅ controle do spinner
//
//    const handleDeployClick = async () => {
//        if (!selectedFile) {
//            setStatus("🚫 Nenhum arquivo selecionado.");
//            setTimeout(() => setStatus(""), 5000);
//            return;
//        }
//
//        setIsDeploying(true);
//
//        try {
//            const resStatus = await fetch("/api/user/status", {
//                method: "GET",
//                credentials: "include",
//            });
//
//            const data = await resStatus.json();
//            const currentPlan = data.plan || "no-plan";
//            const canDeploy = data.canDeploy;
//
//            if (!canDeploy) {
//                setShowUpgradeModal(true);
//                setStatus("❌ Deploy bloqueado pelo plano atual.");
//                setTimeout(() => setStatus(""), 5000);
//                setIsDeploying(false);
//                return;
//            }
//
//            const formData = new FormData();
//            formData.append("file", selectedFile);
//
//            if (executionMode === 'manual' && entryFile) {
//                formData.append("entrypoint", entryFile);
//            }
//
//            const res = await fetch(`/api/upload?plan=${currentPlan}`, {
//                method: "POST",
//                body: formData,
//                credentials: "include",
//            });
//
//            const contentType = res.headers.get("content-type") || "";
//            let result = {};
//
//            if (contentType.includes("application/json")) {
//                result = await res.json();
//            } else {
//                const raw = await res.text();
//                throw new Error(raw || "Resposta inválida do servidor.");
//            }
//
//            if (res.ok) {
//                setStatus("✅ Deploy realizado com sucesso!");
//                setTimeout(() => setStatus(""), 10000);
//                setSelectedFile(null); // ✅ limpa o arquivo
//                setEntryFile("");       // ✅ limpa entrypoint manual
//                setResetCounter((prev) => prev + 1); // ✅ força reset visual no ZipUploadArea
//
//                if (result.app?.ID) {
//                    setAppID(result.app.ID);
//
//                    try {
//                        const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`, {
//                            method: "GET",
//                            credentials: "include",
//                        });
//
//                        const entryContentType = resEntries.headers.get("content-type") || "";
//                        const raw = await resEntries.text();
//
//                        if (entryContentType.includes("application/json")) {
//                            const parsed = JSON.parse(raw);
//                            setEntryPoints(parsed.entryPoints || []);
//                        } else {
//                            throw new Error(raw || "Resposta inválida ao buscar entrypoints.");
//                        }
//                    } catch (err) {
//                        console.error("Erro ao buscar entrypoints:", err);
//                        setStatus("⚠️ Deploy feito, mas falha ao buscar entrypoints.");
//                        setTimeout(() => setStatus(""), 10000);
//                    }
//                }
//            } else {
//                const msg = result.error || result.message || "Falha no deploy";
//                setStatus(`⚠️ ${msg}`);
//                setTimeout(() => setStatus(""), 10000);
//                if (currentPlan === "no-plan") {
//                    setShowUpgradeModal(true);
//                }
//            }
//        } catch (err) {
//            setStatus(`🚫 Erro: ${err.message}`);
//            setTimeout(() => setStatus(""), 10000);
//        } finally {
//            setIsDeploying(false);
//        }
//    };
//    return (
//        <div className="flex flex-col gap-6 py-6">
//            <form
//                className="flex flex-col gap-4"
//                onSubmit={(e) => {
//                    e.preventDefault();
//                    handleDeployClick();
//                }}
//            >
//                <div className="flex flex-col gap-4 lg:flex-row">
//                    <div className="mx-auto w-full max-w-5xl space-y-8">
//                        {/* Header */}
//                        <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                            <div className="w-full text-left">
//                                <a className="mb-4 flex items-center gap-2 text-secondary text-xs" href="/dashboard">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                    </svg>
//                                    Voltar para a dashboard
//                                </a>
//                                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                            </div>
//                            <a
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                                href="/upload"
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                </svg>
//                                Fazer deploy de outra forma
//                            </a>
//                        </header>
//
//                        {/* Upload ZIP */}
//                        <ZipUploadArea
//                            onFileSelect={(file) => setSelectedFile(file)}
//                            manualMode={executionMode === 'manual'}
//                            onEntrypointSelect={(entry) => setEntryFile(entry)}
//                            onEntrypointListUpdate={(list) => setEntryPoints(list)}
//                            resetTrigger={resetCounter} // ✅ aqui
//                        />
//
//                        {/* Execução do ambiente */}
//                        <div className="flex flex-col gap-2">
//                            <label className="text-sm font-medium">
//                                Execução do ambiente<span className="ml-1.5 text-red-500">*</span>
//                            </label>
//                            <p className="text-muted-foreground text-sm">
//                                A execução do ambiente pode ser feita de duas formas: no modo Automático, a Virtus Cloud detecta o arquivo principal; no modo Manual, você poderá escolher qual arquivo iniciar.
//                            </p>
//
//                            <div className="flex flex-col-reverse gap-2 sm:flex-row md:gap-4 mt-2">
//                                {/* Botão de entrada com dropdown */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        disabled={executionMode !== 'manual'}
//                                        onClick={() => {
//                                            if (executionMode === 'manual') {
//                                                setShowEntrypointOptions((prev) => !prev);
//                                            }
//                                        }}
//                                        className={`flex justify-between items-center px-4 h-10 rounded-md text-sm w-full ${executionMode === 'manual'
//                                            ? 'bg-background text-white border border-border hover:bg-virtus-600'
//                                            : 'bg-input text-muted cursor-not-allowed'
//                                            }`}
//                                    >
//                                        {entryFile || 'Selecione um arquivo principal'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="1em"
//                                            height="1em"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`ml-2 size-4 opacity-50 transition-transform duration-250 ${showEntrypointOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {executionMode === 'manual' && showEntrypointOptions && entryPoints.length > 0 && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white max-h-64 overflow-y-auto">
//                                            {entryPoints.map((entry, i) => (
//                                                <li
//                                                    key={i}
//                                                    className="px-4 py-2 hover:bg-virtus-600 cursor-pointer truncate"
//                                                    onClick={() => {
//                                                        setEntryFile(entry);
//                                                        setShowEntrypointOptions(false);
//                                                    }}
//                                                >
//                                                    {entry}
//                                                </li>
//                                            ))}
//                                        </ul>
//                                    )}
//                                </div>
//
//                                {/* Botão de modo com menu suspenso */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        onClick={() => setShowModeOptions((prev) => !prev)}
//                                        className="flex items-center justify-between rounded-md border border-input bg-input px-4 h-10 text-sm text-white"
//                                    >
//                                        {executionMode === 'auto' ? 'Detectar automaticamente' : 'Definir manualmente'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="20"
//                                            height="20"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`text-secondary transition-transform duration-250 ${showModeOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {showModeOptions && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white">
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('auto');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Detectar automaticamente
//                                            </li>
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('manual');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Definir manualmente
//                                            </li>
//                                        </ul>
//                                    )}
//                                </div>
//                            </div>
//                        </div>
//                        {/* Separador */}
//                        <div className="shrink-0 bg-virtus-600 h-px w-full" />
//
//                        {/* Variáveis de Ambiente */}
//                        <div className="flex flex-col gap-1.5">
//                            <div className="rounded-md border border-border bg-background px-6">
//                                <div className="border-b">
//                                    <h3 className="flex justify-between py-4 text-sm font-medium hover:underline">
//                                        <span>Variáveis de Ambiente</span>
//                                    </h3>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Publicação na Web */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Publicação na Web</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se o seu projeto for um site ou uma API, ativar esta opção permitirá o roteamento da aplicação pela porta 80, possibilitando acesso externo via HTTPS e WSS. Além disso, será necessário atribuir um subdomínio ao projeto.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Comando de inicialização */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Comando de inicialização</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Defina um comando personalizado para iniciar sua aplicação conforme necessária.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Auto Restart */}
//                        <div className="flex flex-col gap-6 rounded-md py-6 text-card-foreground border border-blue-700/75 bg-gradient-to-bl from-blue-700/15 to-blue-700/5">
//                            <div className="px-6">
//                                <div className="font-semibold text-sm">
//                                    Auto Restart
//                                    <span className="ml-2 inline-flex items-center gap-1.5 font-semibold text-primary bg-blue-700 hover:bg-blue-800 rounded-sm px-1.5 text-[10px]/4">
//                                        Tecnologia Exclusiva
//                                    </span>
//                                </div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se sua aplicação travar devido a falhas inesperadas, a tecnologia exclusiva da Virtus Cloud tentará reiniciá-la automaticamente para garantir máxima disponibilidade e estabilidade.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="true" className="peer h-5 w-9 rounded-full bg-blue-600">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-[calc(100%-2px)] transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão de Deploy com spinner */}
//                        <button
//                            type="submit"
//                            disabled={isDeploying}
//                            aria-disabled={isDeploying}
//                            role="button"
//                            className={`group/button relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-white transition-all select-none
//                ${isDeploying ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer'}
//                bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4`}
//                        >
//                            {isDeploying ? (
//                                <span className="absolute flex size-full items-center justify-center bg-inherit">
//                                    <span className="size-5 animate-spin rounded-full border-2 border-white border-l-transparent"></span>
//                                </span>
//                            ) : (
//                                <span>Realizar o deploy</span>
//                            )}
//                        </button>
//
//                        {/* Entrypoints detectados */}
//                        {entryPoints.length > 0 && appID && (
//                            <div className="mt-4 text-sm text-white">
//                                <p>Entrypoints detectados:</p>
//                                <ul className="list-disc ml-4">
//                                    {entryPoints.map((entry, i) => (
//                                        <li key={i}>{entry}</li>
//                                    ))}
//                                </ul>
//                            </div>
//                        )}
//                    </div>
//                </div>
//            </form>
//
//            {/* Toast centralizado */}
//            {status && (
//                <div className="toast-message">
//                    {status}
//                </div>
//            )}
//
//            <Footer />
//        </div>
//    );
//}

//frontend/src/components/buttons/UploadFormArchive.jsx

//'use client';
//
//import { useState } from "react";
//import Footer from "../Recycles/Footer";
//import ZipUploadArea from '@/components/buttons/ZipUploadArea';
//import '@/app/styles/virtus.css';
//
//export default function UploadFormArchive() {
//    const [selectedFile, setSelectedFile] = useState(null);
//    const [entryFile, setEntryFile] = useState('');
//    const [status, setStatus] = useState("");
//    const [appID, setAppID] = useState("");
//    const [entryPoints, setEntryPoints] = useState([]);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//
//    const [executionMode, setExecutionMode] = useState('auto');
//    const [showModeOptions, setShowModeOptions] = useState(false);
//    const [showEntrypointOptions, setShowEntrypointOptions] = useState(false);
//    const [fileTree, setFileTree] = useState([]);
//
//    const handleDeployClick = async () => {
//        if (!selectedFile) {
//            setStatus("🚫 Nenhum arquivo selecionado.");
//            return;
//        }
//
//        try {
//            const resStatus = await fetch("/api/user/status", {
//                method: "GET",
//                credentials: "include",
//            });
//
//            const data = await resStatus.json();
//            const currentPlan = data.plan || "no-plan";
//            const canDeploy = data.canDeploy;
//
//            if (!canDeploy) {
//                setShowUpgradeModal(true);
//                setStatus("❌ Deploy bloqueado pelo plano atual.");
//                return;
//            }
//
//            const formData = new FormData();
//            formData.append("file", selectedFile);
//
//            if (executionMode === 'manual' && entryFile) {
//                formData.append("entrypoint", entryFile);
//            }
//
//            const res = await fetch(`/api/upload?plan=${currentPlan}`, {
//                method: "POST",
//                body: formData,
//                credentials: "include",
//            });
//
//            const contentType = res.headers.get("content-type") || "";
//            let result = {};
//
//            if (contentType.includes("application/json")) {
//                result = await res.json();
//            } else {
//                const raw = await res.text();
//                throw new Error(raw || "Resposta inválida do servidor.");
//            }
//
//            if (res.ok) {
//                setStatus("✅ Deploy realizado com sucesso!");
//                setTimeout(() => setStatus(""), 10000);
//                if (result.app?.ID) {
//                    setAppID(result.app.ID);
//
//                    try {
//                        const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`, {
//                            method: "GET",
//                            credentials: "include",
//                        });
//
//                        const entryContentType = resEntries.headers.get("content-type") || "";
//                        const raw = await resEntries.text();
//
//                        if (entryContentType.includes("application/json")) {
//                            const parsed = JSON.parse(raw);
//                            setEntryPoints(parsed.entryPoints || []);
//                        } else {
//                            throw new Error(raw || "Resposta inválida ao buscar entrypoints.");
//                        }
//                    } catch (err) {
//                        console.error("Erro ao buscar entrypoints:", err);
//                        setStatus("⚠️ Deploy feito, mas falha ao buscar entrypoints.");
//                    }
//                }
//            } else {
//                const msg = result.error || result.message || "Falha no deploy";
//                setStatus(`⚠️ ${msg}`);
//                if (currentPlan === "no-plan") {
//                    setShowUpgradeModal(true);
//                }
//            }
//        } catch (err) {
//            setStatus(`🚫 Erro: ${err.message}`);
//        }
//    };
//
//    return (
//        <div className="flex flex-col gap-6 py-6">
//            <form className="flex flex-col gap-4" onSubmit={(e) => {
//                e.preventDefault();
//                handleDeployClick();
//            }}>
//                <div className="flex flex-col gap-4 lg:flex-row">
//                    <div className="mx-auto w-full max-w-5xl space-y-8">
//                        {/* Header */}
//                        <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                            <div className="w-full text-left">
//                                <a className="mb-4 flex items-center gap-2 text-secondary text-xs" href="/dashboard">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                    </svg>
//                                    Voltar para a dashboard
//                                </a>
//                                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                            </div>
//                            <a
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                                href="/upload"
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                </svg>
//                                Fazer deploy de outra forma
//                            </a>
//                        </header>
//
//                        {/* Upload ZIP */}
//                        <ZipUploadArea
//                            onFileSelect={(file) => setSelectedFile(file)}
//                            manualMode={executionMode === 'manual'}
//                            onEntrypointSelect={(entry) => setEntryFile(entry)}
//                            onEntrypointListUpdate={(list) => setEntryPoints(list)}
//                        />
//                        {/* Execução do ambiente */}
//                        <div className="flex flex-col gap-2">
//                            <label className="text-sm font-medium">
//                                Execução do ambiente<span className="ml-1.5 text-red-500">*</span>
//                            </label>
//                            <p className="text-muted-foreground text-sm">
//                                A execução do ambiente pode ser feita de duas formas: no modo Automático, a Virtus Cloud detecta o arquivo principal; no modo Manual, você poderá escolher qual arquivo iniciar.
//                            </p>
//
//                            <div className="flex flex-col-reverse gap-2 sm:flex-row md:gap-4 mt-2">
//                                {/* Botão de entrada com dropdown */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        disabled={executionMode !== 'manual'}
//                                        onClick={() => {
//                                            if (executionMode === 'manual') {
//                                                setShowEntrypointOptions((prev) => !prev);
//                                            }
//                                        }}
//                                        className={`flex justify-between items-center px-4 h-10 rounded-md text-sm w-full ${executionMode === 'manual'
//                                            ? 'bg-background text-white border border-border hover:bg-virtus-600'
//                                            : 'bg-input text-muted cursor-not-allowed'
//                                            }`}
//                                    >
//                                        {entryFile || 'Selecione um arquivo principal'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="1em"
//                                            height="1em"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`ml-2 size-4 opacity-50 transition-transform duration-250 ${showEntrypointOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {executionMode === 'manual' && showEntrypointOptions && entryPoints.length > 0 && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white max-h-64 overflow-y-auto">
//                                            {entryPoints.map((entry, i) => (
//                                                <li
//                                                    key={i}
//                                                    className="px-4 py-2 hover:bg-virtus-600 cursor-pointer truncate"
//                                                    onClick={() => {
//                                                        setEntryFile(entry);
//                                                        setShowEntrypointOptions(false);
//                                                    }}
//                                                >
//                                                    {entry}
//                                                </li>
//                                            ))}
//                                        </ul>
//                                    )}
//                                </div>
//
//                                {/* Botão de modo com menu suspenso */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        onClick={() => setShowModeOptions((prev) => !prev)}
//                                        className="flex items-center justify-between rounded-md border border-input bg-input px-4 h-10 text-sm text-white"
//                                    >
//                                        {executionMode === 'auto' ? 'Detectar automaticamente' : 'Definir manualmente'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="20"
//                                            height="20"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`text-secondary transition-transform duration-250 ${showModeOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {showModeOptions && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white">
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('auto');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Detectar automaticamente
//                                            </li>
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('manual');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Definir manualmente
//                                            </li>
//                                        </ul>
//                                    )}
//                                </div>
//                            </div>
//                        </div>
//                        {/* Separador */}
//                        <div className="shrink-0 bg-virtus-600 h-px w-full" />
//
//                        {/* Variáveis de Ambiente */}
//                        <div className="flex flex-col gap-1.5">
//                            <div className="rounded-md border border-border bg-background px-6">
//                                <div className="border-b">
//                                    <h3 className="flex justify-between py-4 text-sm font-medium hover:underline">
//                                        <span>Variáveis de Ambiente</span>
//                                    </h3>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Publicação na Web */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Publicação na Web</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se o seu projeto for um site ou uma API, ativar esta opção permitirá o roteamento da aplicação pela porta 80, possibilitando acesso externo via HTTPS e WSS. Além disso, será necessário atribuir um subdomínio ao projeto.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Comando de inicialização */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Comando de inicialização</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Defina um comando personalizado para iniciar sua aplicação conforme necessária.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Auto Restart */}
//                        <div className="flex flex-col gap-6 rounded-md py-6 text-card-foreground border border-blue-700/75 bg-gradient-to-bl from-blue-700/15 to-blue-700/5">
//                            <div className="px-6">
//                                <div className="font-semibold text-sm">
//                                    Auto Restart
//                                    <span className="ml-2 inline-flex items-center gap-1.5 font-semibold text-primary bg-blue-700 hover:bg-blue-800 rounded-sm px-1.5 text-[10px]/4">
//                                        Tecnologia Exclusiva
//                                    </span>
//                                </div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se sua aplicação travar devido a falhas inesperadas, a tecnologia exclusiva da Virtus Cloud tentará reiniciá-la automaticamente para garantir máxima disponibilidade e estabilidade.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="true" className="peer h-5 w-9 rounded-full bg-blue-600">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-[calc(100%-2px)] transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão de Deploy */}
//                        <button
//                            type="submit"
//                            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium w-full mx-auto cursor-pointer"
//                        >
//                            Realizar o deploy
//                        </button>
//
//                        {/* Status do upload */}
//
//                        {/* Entrypoints detectados */}
//                        {entryPoints.length > 0 && appID && (
//                            <div className="mt-4 text-sm text-white">
//                                <p>Entrypoints detectados:</p>
//                                <ul className="list-disc ml-4">
//                                    {entryPoints.map((entry, i) => (
//                                        <li key={i}>{entry}</li>
//                                    ))}
//                                </ul>
//                            </div>
//                        )}
//                    </div>
//                </div>
//            </form>
//            {status && (
//                <div className="toast-message">
//                    {status}
//                </div>
//            )}
//            <Footer />
//        </div>
//    );
//}

//frontend/src/components/buttons/UploadFormArchive.jsx

//'use client';
//
//import { useState } from "react";
//import Footer from "../Recycles/Footer";
//import ZipUploadArea from '@/components/buttons/ZipUploadArea';
//import '@/app/styles/virtus.css';
//
//export default function UploadFormArchive() {
//    const [selectedFile, setSelectedFile] = useState(null);
//    const [entryFile, setEntryFile] = useState('');
//    const [status, setStatus] = useState("");
//    const [appID, setAppID] = useState("");
//    const [entryPoints, setEntryPoints] = useState([]);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//
//    const [executionMode, setExecutionMode] = useState('auto');
//    const [showModeOptions, setShowModeOptions] = useState(false);
//    const [showEntrypointOptions, setShowEntrypointOptions] = useState(false);
//    const [fileTree, setFileTree] = useState([]);
//
//    const handleDeployClick = async () => {
//        if (!selectedFile) {
//            setStatus("🚫 Nenhum arquivo selecionado.");
//            return;
//        }
//
//        try {
//            const resStatus = await fetch("/api/user/status", {
//                method: "GET",
//                credentials: "include",
//            });
//
//            const data = await resStatus.json();
//            const currentPlan = data.plan || "no-plan";
//            const canDeploy = data.canDeploy;
//
//            if (!canDeploy) {
//                setShowUpgradeModal(true);
//                setStatus("❌ Deploy bloqueado pelo plano atual.");
//                return;
//            }
//
//            const formData = new FormData();
//            formData.append("file", selectedFile);
//
//            if (executionMode === 'manual' && entryFile) {
//                formData.append("entrypoint", entryFile);
//            }
//
//            const res = await fetch(`/api/upload?plan=${currentPlan}`, {
//                method: "POST",
//                body: formData,
//                credentials: "include",
//            });
//
//            const contentType = res.headers.get("content-type") || "";
//            let result = {};
//
//            if (contentType.includes("application/json")) {
//                result = await res.json();
//            } else {
//                const raw = await res.text();
//                throw new Error(raw || "Resposta inválida do servidor.");
//            }
//
//            if (res.ok) {
//                setStatus("✅ Deploy realizado com sucesso!");
//                setTimeout(() => setStatus(""), 5000);
//                if (result.app?.ID) {
//                    setAppID(result.app.ID);
//
//                    try {
//                        const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`, {
//                            method: "GET",
//                            credentials: "include",
//                        });
//
//                        const entryContentType = resEntries.headers.get("content-type") || "";
//                        const raw = await resEntries.text();
//
//                        if (entryContentType.includes("application/json")) {
//                            const parsed = JSON.parse(raw);
//                            setEntryPoints(parsed.entryPoints || []);
//                        } else {
//                            throw new Error(raw || "Resposta inválida ao buscar entrypoints.");
//                        }
//                    } catch (err) {
//                        console.error("Erro ao buscar entrypoints:", err);
//                        setStatus("⚠️ Deploy feito, mas falha ao buscar entrypoints.");
//                    }
//                }
//            } else {
//                const msg = result.error || result.message || "Falha no deploy";
//                setStatus(`⚠️ ${msg}`);
//                if (currentPlan === "no-plan") {
//                    setShowUpgradeModal(true);
//                }
//            }
//        } catch (err) {
//            setStatus(`🚫 Erro: ${err.message}`);
//        }
//    };
//
//    return (
//        <div className="flex flex-col gap-6 py-6">
//            <form className="flex flex-col gap-4" onSubmit={(e) => {
//                e.preventDefault();
//                handleDeployClick();
//            }}>
//                <div className="flex flex-col gap-4 lg:flex-row">
//                    <div className="mx-auto w-full max-w-5xl space-y-8">
//                        {/* Header */}
//                        <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                            <div className="w-full text-left">
//                                <a className="mb-4 flex items-center gap-2 text-secondary text-xs" href="/dashboard">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                    </svg>
//                                    Voltar para a dashboard
//                                </a>
//                                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                            </div>
//                            <a
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                                href="/upload"
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                </svg>
//                                Fazer deploy de outra forma
//                            </a>
//                        </header>
//
//                        {/* Upload ZIP */}
//                        <ZipUploadArea
//                            onFileSelect={(file) => setSelectedFile(file)}
//                            manualMode={executionMode === 'manual'}
//                            onEntrypointSelect={(entry) => setEntryFile(entry)}
//                            onEntrypointListUpdate={(list) => setEntryPoints(list)}
//                        />
//                        {/* Execução do ambiente */}
//                        <div className="flex flex-col gap-2">
//                            <label className="text-sm font-medium">
//                                Execução do ambiente<span className="ml-1.5 text-red-500">*</span>
//                            </label>
//                            <p className="text-muted-foreground text-sm">
//                                A execução do ambiente pode ser feita de duas formas: no modo Automático, a Virtus Cloud detecta o arquivo principal; no modo Manual, você poderá escolher qual arquivo iniciar.
//                            </p>
//
//                            <div className="flex flex-col-reverse gap-2 sm:flex-row md:gap-4 mt-2">
//                                {/* Botão de entrada com dropdown */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        disabled={executionMode !== 'manual'}
//                                        onClick={() => {
//                                            if (executionMode === 'manual') {
//                                                setShowEntrypointOptions((prev) => !prev);
//                                            }
//                                        }}
//                                        className={`flex justify-between items-center px-4 h-10 rounded-md text-sm w-full ${executionMode === 'manual'
//                                            ? 'bg-background text-white border border-border hover:bg-virtus-600'
//                                            : 'bg-input text-muted cursor-not-allowed'
//                                            }`}
//                                    >
//                                        {entryFile || 'Selecione um arquivo principal'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="1em"
//                                            height="1em"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`ml-2 size-4 opacity-50 transition-transform duration-250 ${showEntrypointOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {executionMode === 'manual' && showEntrypointOptions && entryPoints.length > 0 && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white max-h-64 overflow-y-auto">
//                                            {entryPoints.map((entry, i) => (
//                                                <li
//                                                    key={i}
//                                                    className="px-4 py-2 hover:bg-virtus-600 cursor-pointer truncate"
//                                                    onClick={() => {
//                                                        setEntryFile(entry);
//                                                        setShowEntrypointOptions(false);
//                                                    }}
//                                                >
//                                                    {entry}
//                                                </li>
//                                            ))}
//                                        </ul>
//                                    )}
//                                </div>
//
//                                {/* Botão de modo com menu suspenso */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        onClick={() => setShowModeOptions((prev) => !prev)}
//                                        className="flex items-center justify-between rounded-md border border-input bg-input px-4 h-10 text-sm text-white"
//                                    >
//                                        {executionMode === 'auto' ? 'Detectar automaticamente' : 'Definir manualmente'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="20"
//                                            height="20"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`text-secondary transition-transform duration-250 ${showModeOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {showModeOptions && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white">
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('auto');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Detectar automaticamente
//                                            </li>
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('manual');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Definir manualmente
//                                            </li>
//                                        </ul>
//                                    )}
//                                </div>
//                            </div>
//                        </div>
//                        {/* Separador */}
//                        <div className="shrink-0 bg-virtus-600 h-px w-full" />
//
//                        {/* Variáveis de Ambiente */}
//                        <div className="flex flex-col gap-1.5">
//                            <div className="rounded-md border border-border bg-background px-6">
//                                <div className="border-b">
//                                    <h3 className="flex justify-between py-4 text-sm font-medium hover:underline">
//                                        <span>Variáveis de Ambiente</span>
//                                    </h3>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Publicação na Web */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Publicação na Web</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se o seu projeto for um site ou uma API, ativar esta opção permitirá o roteamento da aplicação pela porta 80, possibilitando acesso externo via HTTPS e WSS. Além disso, será necessário atribuir um subdomínio ao projeto.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Comando de inicialização */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Comando de inicialização</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Defina um comando personalizado para iniciar sua aplicação conforme necessária.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Auto Restart */}
//                        <div className="flex flex-col gap-6 rounded-md py-6 text-card-foreground border border-blue-700/75 bg-gradient-to-bl from-blue-700/15 to-blue-700/5">
//                            <div className="px-6">
//                                <div className="font-semibold text-sm">
//                                    Auto Restart
//                                    <span className="ml-2 inline-flex items-center gap-1.5 font-semibold text-primary bg-blue-700 hover:bg-blue-800 rounded-sm px-1.5 text-[10px]/4">
//                                        Tecnologia Exclusiva
//                                    </span>
//                                </div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se sua aplicação travar devido a falhas inesperadas, a tecnologia exclusiva da Virtus Cloud tentará reiniciá-la automaticamente para garantir máxima disponibilidade e estabilidade.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="true" className="peer h-5 w-9 rounded-full bg-blue-600">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-[calc(100%-2px)] transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão de Deploy */}
//                        <button
//                            type="submit"
//                            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium w-full mx-auto cursor-pointer"
//                        >
//                            Realizar o deploy
//                        </button>
//
//                        {/* Status do upload */}
//                        {status && (
//                            <p className="mt-4 text-gray-300 whitespace-pre-line">{status}</p>
//                        )}
//
//                        {/* Entrypoints detectados */}
//                        {entryPoints.length > 0 && appID && (
//                            <div className="mt-4 text-sm text-white">
//                                <p>Entrypoints detectados:</p>
//                                <ul className="list-disc ml-4">
//                                    {entryPoints.map((entry, i) => (
//                                        <li key={i}>{entry}</li>
//                                    ))}
//                                </ul>
//                            </div>
//                        )}
//                    </div>
//                </div>
//            </form>
//            {status && (
//                <div className="toast-message">
//                    {status}
//                </div>
//            )}
//            <Footer />
//        </div>
//    );
//}

//frontend/src/components/buttons/UploadFormArchive.jsx

//'use client';
//
//import { useState } from "react";
//import Footer from "../Recycles/Footer";
//import ZipUploadArea from '@/components/buttons/ZipUploadArea';
//
//export default function UploadFormArchive() {
//    const [selectedFile, setSelectedFile] = useState(null);
//    const [entryFile, setEntryFile] = useState('');
//    const [status, setStatus] = useState("");
//    const [appID, setAppID] = useState("");
//    const [entryPoints, setEntryPoints] = useState([]);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//
//    const [executionMode, setExecutionMode] = useState('auto');
//    const [showModeOptions, setShowModeOptions] = useState(false);
//    const [showEntrypointOptions, setShowEntrypointOptions] = useState(false);
//    const [fileTree, setFileTree] = useState([]);
//
//    const handleDeployClick = async () => {
//        if (!selectedFile) {
//            setStatus("🚫 Nenhum arquivo selecionado.");
//            return;
//        }
//
//        try {
//            const resStatus = await fetch("/api/user/status", {
//                method: "GET",
//                credentials: "include",
//            });
//
//            const data = await resStatus.json();
//            const currentPlan = data.plan || "no-plan";
//            const canDeploy = data.canDeploy;
//
//            if (!canDeploy) {
//                setShowUpgradeModal(true);
//                setStatus("❌ Deploy bloqueado pelo plano atual.");
//                return;
//            }
//
//            const formData = new FormData();
//            formData.append("file", selectedFile);
//
//            if (executionMode === 'manual' && entryFile) {
//                formData.append("entrypoint", entryFile);
//            }
//
//            const res = await fetch(`/api/upload?plan=${currentPlan}`, {
//                method: "POST",
//                body: formData,
//                credentials: "include",
//            });
//
//            const contentType = res.headers.get("content-type") || "";
//            let result = {};
//
//            if (contentType.includes("application/json")) {
//                result = await res.json();
//            } else {
//                const raw = await res.text();
//                throw new Error(raw || "Resposta inválida do servidor.");
//            }
//
//            if (res.ok) {
//                setStatus("✅ Deploy realizado com sucesso!");
//                if (result.app?.ID) {
//                    setAppID(result.app.ID);
//                    const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//                    const entries = await resEntries.json();
//                    setEntryPoints(entries);
//                }
//            } else {
//                const msg = result.error || result.message || "Falha no deploy";
//                setStatus(`⚠️ ${msg}`);
//                if (currentPlan === "no-plan") {
//                    setShowUpgradeModal(true);
//                }
//            }
//        } catch (err) {
//            setStatus(`🚫 Erro: ${err.message}`);
//        }
//    };
//    return (
//        <div className="flex flex-col gap-6 py-6">
//            <form className="flex flex-col gap-4" onSubmit={(e) => {
//                e.preventDefault();
//                handleDeployClick();
//            }}>
//                <div className="flex flex-col gap-4 lg:flex-row">
//                    <div className="mx-auto w-full max-w-5xl space-y-8">
//                        {/* Header */}
//                        <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                            <div className="w-full text-left">
//                                <a className="mb-4 flex items-center gap-2 text-secondary text-xs" href="/dashboard">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                    </svg>
//                                    Voltar para a dashboard
//                                </a>
//                                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                            </div>
//                            <a
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                                href="/upload"
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                </svg>
//                                Fazer deploy de outra forma
//                            </a>
//                        </header>
//
//                        {/* Upload ZIP */}
//                        <ZipUploadArea
//                            onFileSelect={(file) => setSelectedFile(file)}
//                            manualMode={executionMode === 'manual'}
//                            onEntrypointSelect={(entry) => setEntryFile(entry)}
//                            onEntrypointListUpdate={(list) => setEntryPoints(list)}
//                        />
//                        {/* Execução do ambiente */}
//                        <div className="flex flex-col gap-2">
//                            <label className="text-sm font-medium">
//                                Execução do ambiente<span className="ml-1.5 text-red-500">*</span>
//                            </label>
//                            <p className="text-muted-foreground text-sm">
//                                A execução do ambiente pode ser feita de duas formas: no modo Automático, a Virtus Cloud detecta o arquivo principal; no modo Manual, você poderá escolher qual arquivo iniciar.
//                            </p>
//
//                            <div className="flex flex-col-reverse gap-2 sm:flex-row md:gap-4 mt-2">
//                                {/* Botão de entrada com dropdown */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        disabled={executionMode !== 'manual'}
//                                        onClick={() => {
//                                            if (executionMode === 'manual') {
//                                                setShowEntrypointOptions((prev) => !prev);
//                                            }
//                                        }}
//                                        className={`flex justify-between items-center px-4 h-10 rounded-md text-sm w-full ${executionMode === 'manual'
//                                            ? 'bg-background text-white border border-border hover:bg-virtus-600'
//                                            : 'bg-input text-muted cursor-not-allowed'
//                                            }`}
//                                    >
//                                        {entryFile || 'Selecione um arquivo principal'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="1em"
//                                            height="1em"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`ml-2 size-4 opacity-50 transition-transform duration-250 ${showEntrypointOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {executionMode === 'manual' && showEntrypointOptions && entryPoints.length > 0 && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white max-h-64 overflow-y-auto">
//                                            {entryPoints.map((entry, i) => (
//                                                <li
//                                                    key={i}
//                                                    className="px-4 py-2 hover:bg-virtus-600 cursor-pointer truncate"
//                                                    onClick={() => {
//                                                        setEntryFile(entry);
//                                                        setShowEntrypointOptions(false);
//                                                    }}
//                                                >
//                                                    {entry}
//                                                </li>
//                                            ))}
//                                        </ul>
//                                    )}
//                                </div>
//
//                                {/* Botão de modo com menu suspenso */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        onClick={() => setShowModeOptions((prev) => !prev)}
//                                        className="flex items-center justify-between rounded-md border border-input bg-input px-4 h-10 text-sm text-white"
//                                    >
//                                        {executionMode === 'auto' ? 'Detectar automaticamente' : 'Definir manualmente'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="20"
//                                            height="20"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`text-secondary transition-transform duration-250 ${showModeOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {showModeOptions && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white">
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('auto');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Detectar automaticamente
//                                            </li>
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('manual');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Definir manualmente
//                                            </li>
//                                        </ul>
//                                    )}
//                                </div>
//                            </div>
//                        </div>
//                        {/* Separador */}
//                        <div className="shrink-0 bg-virtus-600 h-px w-full" />
//
//                        {/* Variáveis de Ambiente */}
//                        <div className="flex flex-col gap-1.5">
//                            <div className="rounded-md border border-border bg-background px-6">
//                                <div className="border-b">
//                                    <h3 className="flex justify-between py-4 text-sm font-medium hover:underline">
//                                        <span>Variáveis de Ambiente</span>
//                                    </h3>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Publicação na Web */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Publicação na Web</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se o seu projeto for um site ou uma API, ativar esta opção permitirá o roteamento da aplicação pela porta 80, possibilitando acesso externo via HTTPS e WSS. Além disso, será necessário atribuir um subdomínio ao projeto.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Comando de inicialização */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Comando de inicialização</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Defina um comando personalizado para iniciar sua aplicação conforme necessária.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Auto Restart */}
//                        <div className="flex flex-col gap-6 rounded-md py-6 text-card-foreground border border-blue-700/75 bg-gradient-to-bl from-blue-700/15 to-blue-700/5">
//                            <div className="px-6">
//                                <div className="font-semibold text-sm">
//                                    Auto Restart
//                                    <span className="ml-2 inline-flex items-center gap-1.5 font-semibold text-primary bg-blue-700 hover:bg-blue-800 rounded-sm px-1.5 text-[10px]/4">
//                                        Tecnologia Exclusiva
//                                    </span>
//                                </div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se sua aplicação travar devido a falhas inesperadas, a tecnologia exclusiva da Virtus Cloud tentará reiniciá-la automaticamente para garantir máxima disponibilidade e estabilidade.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="true" className="peer h-5 w-9 rounded-full bg-blue-600">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-[calc(100%-2px)] transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão de Deploy */}
//                        <button
//                            type="submit"
//                            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium w-full mx-auto cursor-pointer"
//                        >
//                            Realizar o deploy
//                        </button>
//
//                        {/* Status do upload */}
//                        {status && (
//                            <p className="mt-4 text-gray-300 whitespace-pre-line">{status}</p>
//                        )}
//
//                        {/* Entrypoints detectados */}
//                        {entryPoints.length > 0 && appID && (
//                            <div className="mt-4 text-sm text-white">
//                                <p>Entrypoints detectados:</p>
//                                <ul className="list-disc ml-4">
//                                    {entryPoints.map((entry, i) => (
//                                        <li key={i}>{entry}</li>
//                                    ))}
//                                </ul>
//                            </div>
//                        )}
//                    </div>
//                </div>
//            </form>
//            <Footer />
//        </div>
//    );
//}

//frontend/src/components/buttons/UploadFormArchive.jsx

//'use client';
//
//import { useState } from "react";
//import Footer from "../Recycles/Footer";
//import ZipUploadArea from '@/components/buttons/ZipUploadArea';
//
//export default function UploadFormArchive() {
//    const [selectedFile, setSelectedFile] = useState(null);
//    const [entryFile, setEntryFile] = useState('');
//    const [status, setStatus] = useState("");
//    const [appID, setAppID] = useState("");
//    const [entryPoints, setEntryPoints] = useState([]);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//
//    const [executionMode, setExecutionMode] = useState('auto');
//    const [showModeOptions, setShowModeOptions] = useState(false);
//    const handleDeployClick = async () => {
//        if (!selectedFile) {
//            setStatus("🚫 Nenhum arquivo selecionado.");
//            return;
//        }
//
//        try {
//            const resStatus = await fetch("/api/user/status", {
//                method: "GET",
//                credentials: "include",
//            });
//
//            const data = await resStatus.json();
//            const currentPlan = data.plan || "no-plan";
//            const canDeploy = data.canDeploy;
//
//            if (!canDeploy) {
//                setShowUpgradeModal(true);
//                setStatus("❌ Deploy bloqueado pelo plano atual.");
//                return;
//            }
//
//            const formData = new FormData();
//            formData.append("file", selectedFile);
//
//            if (executionMode === 'manual' && entryFile) {
//                formData.append("entrypoint", entryFile);
//            }
//
//            const res = await fetch(`/api/upload?plan=${currentPlan}`, {
//                method: "POST",
//                body: formData,
//                credentials: "include",
//            });
//
//            const contentType = res.headers.get("content-type") || "";
//            let result = {};
//
//            if (contentType.includes("application/json")) {
//                result = await res.json();
//            } else {
//                const raw = await res.text();
//                throw new Error(raw || "Resposta inválida do servidor.");
//            }
//
//            if (res.ok) {
//                setStatus("✅ Deploy realizado com sucesso!");
//                if (result.app?.ID) {
//                    setAppID(result.app.ID);
//                    const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//                    const entries = await resEntries.json();
//                    setEntryPoints(entries);
//                }
//            } else {
//                const msg = result.error || result.message || "Falha no deploy";
//                setStatus(`⚠️ ${msg}`);
//                if (currentPlan === "no-plan") {
//                    setShowUpgradeModal(true);
//                }
//            }
//        } catch (err) {
//            setStatus(`🚫 Erro: ${err.message}`);
//        }
//    };
//    return (
//        <div className="flex flex-col gap-6 py-6">
//            <form className="flex flex-col gap-4" onSubmit={(e) => {
//                e.preventDefault();
//                handleDeployClick();
//            }}>
//                <div className="flex flex-col gap-4 lg:flex-row">
//                    <div className="mx-auto w-full max-w-5xl space-y-8">
//                        {/* Header */}
//                        <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                            <div className="w-full text-left">
//                                <a className="mb-4 flex items-center gap-2 text-secondary text-xs" href="/dashboard">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                    </svg>
//                                    Voltar para a dashboard
//                                </a>
//                                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                            </div>
//                            <a
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                                href="/upload"
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                </svg>
//                                Fazer deploy de outra forma
//                            </a>
//                        </header>
//
//                        {/* Upload ZIP */}
//                        <ZipUploadArea
//                            onFileSelect={(file) => setSelectedFile(file)}
//                            manualMode={executionMode === 'manual'}
//                            onEntrypointSelect={(entry) => setEntryFile(entry)}
//                        />
//                        {/* Execução do ambiente */}
//                        <div className="flex flex-col gap-2">
//                            <label className="text-sm font-medium">
//                                Execução do ambiente<span className="ml-1.5 text-red-500">*</span>
//                            </label>
//                            <p className="text-muted-foreground text-sm">
//                                A execução do ambiente pode ser feita de duas formas: no modo Automático, a Virtus Cloud detecta o arquivo principal; no modo Manual, você poderá escolher qual arquivo iniciar.
//                            </p>
//
//                            <div className="flex flex-col-reverse gap-2 sm:flex-row md:gap-4 mt-2">
//                                {/* Botão de entrada (indicativo visual) */}
//                                <button
//                                    type="button"
//                                    disabled={executionMode !== 'manual'}
//                                    className={`flex justify-between items-center px-4 h-10 rounded-md text-sm sm:w-80 ${executionMode === 'manual'
//                                            ? 'bg-background text-white border border-border hover:bg-virtus-600'
//                                            : 'bg-input text-muted cursor-not-allowed'
//                                        }`}
//                                >
//                                    Selecione um arquivo principal
//                                    <svg
//                                        xmlns="http://www.w3.org/2000/svg"
//                                        width="1em"
//                                        height="1em"
//                                        fill="currentColor"
//                                        viewBox="0 0 256 256"
//                                        className="ml-2 size-4 opacity-50"
//                                    >
//                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                    </svg>
//                                </button>
//
//                                {/* Botão de modo com menu suspenso */}
//                                <div className="relative sm:w-80">
//                                    <button
//                                        type="button"
//                                        onClick={() => setShowModeOptions((prev) => !prev)}
//                                        className="flex items-center justify-between rounded-md border border-input bg-input px-4 h-10 text-sm text-white"
//                                    >
//                                        {executionMode === 'auto' ? 'Detectar automaticamente' : 'Definir manualmente'}
//                                        <svg
//                                            xmlns="http://www.w3.org/2000/svg"
//                                            width="20"
//                                            height="20"
//                                            fill="currentColor"
//                                            viewBox="0 0 256 256"
//                                            className={`text-secondary transition-transform duration-250 ${showModeOptions ? 'rotate-180' : ''}`}
//                                        >
//                                            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                        </svg>
//                                    </button>
//
//                                    {showModeOptions && (
//                                        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-sm text-white">
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('auto');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Detectar automaticamente
//                                            </li>
//                                            <li
//                                                className="px-4 py-2 hover:bg-virtus-600 cursor-pointer"
//                                                onClick={() => {
//                                                    setExecutionMode('manual');
//                                                    setShowModeOptions(false);
//                                                }}
//                                            >
//                                                Definir manualmente
//                                            </li>
//                                        </ul>
//                                    )}
//                                </div>
//                            </div>
//                        </div>
//                        {/* Separador */}
//                        <div className="shrink-0 bg-virtus-600 h-px w-full" />
//
//                        {/* Variáveis de Ambiente */}
//                        <div className="flex flex-col gap-1.5">
//                            <div className="rounded-md border border-border bg-background px-6">
//                                <div className="border-b">
//                                    <h3 className="flex justify-between py-4 text-sm font-medium hover:underline">
//                                        <span>Variáveis de Ambiente</span>
//                                    </h3>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Publicação na Web */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Publicação na Web</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se o seu projeto for um site ou uma API, ativar esta opção permitirá o roteamento da aplicação pela porta 80, possibilitando acesso externo via HTTPS e WSS. Além disso, será necessário atribuir um subdomínio ao projeto.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Comando de inicialização */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Comando de inicialização</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Defina um comando personalizado para iniciar sua aplicação conforme necessária.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Auto Restart */}
//                        <div className="flex flex-col gap-6 rounded-md py-6 text-card-foreground border border-blue-700/75 bg-gradient-to-bl from-blue-700/15 to-blue-700/5">
//                            <div className="px-6">
//                                <div className="font-semibold text-sm">
//                                    Auto Restart
//                                    <span className="ml-2 inline-flex items-center gap-1.5 font-semibold text-primary bg-blue-700 hover:bg-blue-800 rounded-sm px-1.5 text-[10px]/4">
//                                        Tecnologia Exclusiva
//                                    </span>
//                                </div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se sua aplicação travar devido a falhas inesperadas, a tecnologia exclusiva da Virtus Cloud tentará reiniciá-la automaticamente para garantir máxima disponibilidade e estabilidade.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="true" className="peer h-5 w-9 rounded-full bg-blue-600">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-[calc(100%-2px)] transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão de Deploy */}
//                        <button
//                            type="submit"
//                            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium w-full mx-auto cursor-pointer"
//                        >
//                            Realizar o deploy
//                        </button>
//
//                        {/* Status do upload */}
//                        {status && (
//                            <p className="mt-4 text-gray-300 whitespace-pre-line">{status}</p>
//                        )}
//
//                        {/* Entrypoints detectados */}
//                        {entryPoints.length > 0 && appID && (
//                            <div className="mt-4 text-sm text-white">
//                                <p>Entrypoints detectados:</p>
//                                <ul className="list-disc ml-4">
//                                    {entryPoints.map((entry, i) => (
//                                        <li key={i}>{entry}</li>
//                                    ))}
//                                </ul>
//                            </div>
//                        )}
//                    </div>
//                </div>
//            </form>
//            <Footer />
//        </div>
//    );
//}

//'use client';
//
//import { useState } from "react";
//import Footer from "../Recycles/Footer";
//import ZipUploadArea from '@/components/buttons/ZipUploadArea';
//
//export default function UploadFormArchive() {
//    const [selectedFile, setSelectedFile] = useState(null);
//    const [status, setStatus] = useState("");
//    const [appID, setAppID] = useState("");
//    const [entryPoints, setEntryPoints] = useState([]);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//
//    const handleDeployClick = async () => {
//        if (!selectedFile) {
//            setStatus("🚫 Nenhum arquivo selecionado.");
//            return;
//        }
//
//        try {
//            const resStatus = await fetch("/api/user/status", {
//                method: "GET",
//                credentials: "include",
//            });
//
//            const data = await resStatus.json();
//            const currentPlan = data.plan || "no-plan";
//            const canDeploy = data.canDeploy;
//
//            if (!canDeploy) {
//                setShowUpgradeModal(true);
//                setStatus("❌ Deploy bloqueado pelo plano atual.");
//                return;
//            }
//
//            const formData = new FormData();
//            formData.append("file", selectedFile);
//
//            const res = await fetch(`/api/upload?plan=${currentPlan}`, {
//                method: "POST",
//                body: formData,
//                credentials: "include",
//            });
//
//            const contentType = res.headers.get("content-type") || "";
//            let result = {};
//
//            if (contentType.includes("application/json")) {
//                result = await res.json();
//            } else {
//                const raw = await res.text();
//                throw new Error(raw || "Resposta inválida do servidor.");
//            }
//
//            if (res.ok) {
//                setStatus("✅ Deploy realizado com sucesso!");
//                if (result.app?.ID) {
//                    setAppID(result.app.ID);
//                    const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//                    const entries = await resEntries.json();
//                    setEntryPoints(entries);
//                }
//            } else {
//                const msg = result.error || result.message || "Falha no deploy";
//                setStatus(`⚠️ ${msg}`);
//                if (currentPlan === "no-plan") {
//                    setShowUpgradeModal(true);
//                }
//            }
//        } catch (err) {
//            setStatus(`🚫 Erro: ${err.message}`);
//        }
//    };
//
//    return (
//        <div className="flex flex-col gap-6 py-6">
//            <form className="flex flex-col gap-4" onSubmit={(e) => {
//                e.preventDefault();
//                handleDeployClick();
//            }}>
//                <div className="flex flex-col gap-4 lg:flex-row">
//                    <div className="mx-auto w-full max-w-5xl space-y-8">
//                        {/* Header */}
//                        <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                            <div className="w-full text-left">
//                                <a className="mb-4 flex items-center gap-2 text-secondary text-xs" href="/dashboard">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                    </svg>
//                                    Voltar para a dashboard
//                                </a>
//                                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                            </div>
//                            <a
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                                href="/upload"
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                </svg>
//                                Fazer deploy de outra forma
//                            </a>
//                        </header>
//                        {/* Upload ZIP */}
//                        <ZipUploadArea onFileSelect={(file) => setSelectedFile(file)} />
//
//                        {/* Campos de Memória e Versão */}
//                        <div className="flex flex-col gap-4 sm:flex-row">
//                            <div className="flex flex-col gap-3 flex-1">
//                                <label className="text-sm font-medium flex justify-between">
//                                    <span>Memória<span className="ml-1.5 text-red-500">*</span></span>
//                                    <span className="text-green-500 text-sm">768 MB</span>
//                                </label>
//                                <div className="flex items-center rounded-md border border-virtus-600 bg-input px-4 h-10">
//                                    <input
//                                        name="config.MEMORY"
//                                        type="number"
//                                        min={256}
//                                        placeholder="256"
//                                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-semi-muted"
//                                    />
//                                </div>
//                            </div>
//
//                            <div className="flex flex-col gap-3 flex-1">
//                                <label className="text-sm font-medium">
//                                    Versão<span className="ml-1.5 text-red-500">*</span>
//                                </label>
//                                <div className="flex items-center justify-between rounded-md border border-input bg-input px-4 h-10">
//                                    <span className="text-sm">Recomendado</span>
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 opacity-50">
//                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                    </svg>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Execução do ambiente */}
//                        <div className="flex flex-col gap-2">
//                            <label className="text-sm font-medium">
//                                Execução do ambiente<span className="ml-1.5 text-red-500">*</span>
//                            </label>
//                            <p className="text-muted-foreground text-sm">
//                                A execução do ambiente pode ser feita de duas formas: no modo Automático, você escolhe o arquivo principal e a Virtus Cloud o executa; no modo Manual, é preciso definir o ambiente e informar o comando de inicialização.
//                            </p>
//                            <div className="flex flex-col-reverse gap-2 sm:flex-row md:gap-4">
//                                <button
//                                    type="button"
//                                    disabled
//                                    className="bg-input text-muted flex justify-between items-center px-4 h-10 rounded-md text-sm cursor-not-allowed"
//                                >
//                                    Selecione um arquivo principal
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="ml-2 size-4 opacity-50">
//                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                    </svg>
//                                </button>
//                                <div className="flex items-center justify-between rounded-md border border-input bg-input px-4 h-10 sm:w-80">
//                                    <span className="text-sm">Detectar automaticamente</span>
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 opacity-50">
//                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                    </svg>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Separador */}
//                        <div className="shrink-0 bg-virtus-600 h-px w-full" />
//                        {/* Variáveis de Ambiente */}
//                        <div className="flex flex-col gap-1.5">
//                            <div className="rounded-md border border-border bg-background px-6">
//                                <div className="border-b">
//                                    <h3 className="flex justify-between py-4 text-sm font-medium hover:underline">
//                                        <span>Variáveis de Ambiente</span>
//                                    </h3>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Publicação na Web */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Publicação na Web</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se o seu projeto for um site ou uma API, ativar esta opção permitirá o roteamento da aplicação pela porta 80, possibilitando acesso externo via HTTPS e WSS. Além disso, será necessário atribuir um subdomínio ao projeto.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Comando de inicialização */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Comando de inicialização</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Defina um comando personalizado para iniciar sua aplicação conforme necessária.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Auto Restart */}
//                        <div className="flex flex-col gap-6 rounded-md py-6 text-card-foreground border border-blue-700/75 bg-gradient-to-bl from-blue-700/15 to-blue-700/5">
//                            <div className="px-6">
//                                <div className="font-semibold text-sm">
//                                    Auto Restart
//                                    <span className="ml-2 inline-flex items-center gap-1.5 font-semibold text-primary bg-blue-700 hover:bg-blue-800 rounded-sm px-1.5 text-[10px]/4">
//                                        Tecnologia Exclusiva
//                                    </span>
//                                </div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se sua aplicação travar devido a falhas inesperadas, a tecnologia exclusiva da Virtus Cloud tentará reiniciá-la automaticamente para garantir máxima disponibilidade e estabilidade.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="true" className="peer h-5 w-9 rounded-full bg-blue-600">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-[calc(100%-2px)] transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão de Deploy */}
//                        <button
//                            type="submit"
//                            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium w-full mx-auto cursor-pointer"
//                        >
//                            Realizar o deploy
//                        </button>
//
//                        {/* Status do upload */}
//                        {status && (
//                            <p className="mt-4 text-gray-300 whitespace-pre-line">{status}</p>
//                        )}
//
//                        {/* Entrypoints detectados */}
//                        {entryPoints.length > 0 && appID && (
//                            <div className="mt-4 text-sm text-white">
//                                <p>Entrypoints detectados:</p>
//                                <ul className="list-disc ml-4">
//                                    {entryPoints.map((entry, i) => (
//                                        <li key={i}>{entry}</li>
//                                    ))}
//                                </ul>
//                            </div>
//                        )}
//                    </div>
//                </div>
//            </form>
//            <Footer />
//        </div>
//    );
//}

//frontend/src/components/buttons/UploadFormArchive.jsx

//'use client';
//
//import { useState } from "react";
//import Footer from "../Recycles/Footer";
//import ZipUploadArea from '@/components/buttons/ZipUploadArea';
//
//export default function UploadFormArchive() {
//    const [selectedFile, setSelectedFile] = useState(null);
//    const [status, setStatus] = useState("");
//    const [appID, setAppID] = useState("");
//    const [entryPoints, setEntryPoints] = useState([]);
//    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//
//    const handleDeployClick = async () => {
//        if (!selectedFile) {
//            setStatus("🚫 Nenhum arquivo selecionado.");
//            return;
//        }
//
//        try {
//            const resStatus = await fetch("/api/user/status", {
//                method: "GET",
//                credentials: "include",
//            });
//
//            const data = await resStatus.json();
//            const currentPlan = data.plan || "no-plan";
//            const canDeploy = data.canDeploy;
//
//            if (!canDeploy) {
//                setShowUpgradeModal(true);
//                setStatus("❌ Deploy bloqueado pelo plano atual.");
//                return;
//            }
//
//            const formData = new FormData();
//            formData.append("file", selectedFile);
//
//            const res = await fetch(`/api/upload?plan=${currentPlan}`, {
//                method: "POST",
//                body: formData,
//                credentials: "include",
//            });
//
//            const contentType = res.headers.get("content-type") || "";
//            let result = {};
//
//            if (contentType.includes("application/json")) {
//                result = await res.json();
//            } else {
//                const raw = await res.text();
//                throw new Error(raw || "Resposta inválida do servidor.");
//            }
//
//            if (res.ok) {
//                setStatus("✅ Deploy realizado com sucesso!");
//                if (result.app?.ID) {
//                    setAppID(result.app.ID);
//                    const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//                    const entries = await resEntries.json();
//                    setEntryPoints(entries);
//                }
//            } else {
//                const msg = result.error || result.message || "Falha no deploy";
//                setStatus(`⚠️ ${msg}`);
//                if (currentPlan === "no-plan") {
//                    setShowUpgradeModal(true);
//                }
//            }
//        } catch (err) {
//            setStatus(`🚫 Erro: ${err.message}`);
//        }
//    };
//
//    return (
//        <div className="flex flex-col gap-6 py-6">
//            <form className="flex flex-col gap-4" onSubmit={(e) => {
//                e.preventDefault();
//                handleDeployClick();
//            }}>
//                <div className="flex flex-col gap-4 lg:flex-row">
//                    <div className="mx-auto w-full max-w-5xl space-y-8">
//                        {/* Header */}
//                        <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                            <div className="w-full text-left">
//                                <a className="mb-4 flex items-center gap-2 text-secondary text-xs" href="/dashboard">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                    </svg>
//                                    Voltar para a dashboard
//                                </a>
//                                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                            </div>
//                            <a
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                                href="/upload"
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                </svg>
//                                Fazer deploy de outra forma
//                            </a>
//                        </header>
//                        {/* Upload ZIP */}
//                        <ZipUploadArea onFileSelect={(file) => setSelectedFile(file)} />
//
//                        {/* Campos de Memória e Versão */}
//                        <div className="flex flex-col gap-4 sm:flex-row">
//                            <div className="flex flex-col gap-3 flex-1">
//                                <label className="text-sm font-medium flex justify-between">
//                                    <span>Memória<span className="ml-1.5 text-red-500">*</span></span>
//                                    <span className="text-green-500 text-sm">768 MB</span>
//                                </label>
//                                <div className="flex items-center rounded-md border border-virtus-600 bg-input px-4 h-10">
//                                    <input
//                                        name="config.MEMORY"
//                                        type="number"
//                                        min={256}
//                                        placeholder="256"
//                                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-semi-muted"
//                                    />
//                                </div>
//                            </div>
//
//                            <div className="flex flex-col gap-3 flex-1">
//                                <label className="text-sm font-medium">
//                                    Versão<span className="ml-1.5 text-red-500">*</span>
//                                </label>
//                                <div className="flex items-center justify-between rounded-md border border-input bg-input px-4 h-10">
//                                    <span className="text-sm">Recomendado</span>
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 opacity-50">
//                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                    </svg>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Execução do ambiente */}
//                        <div className="flex flex-col gap-2">
//                            <label className="text-sm font-medium">
//                                Execução do ambiente<span className="ml-1.5 text-red-500">*</span>
//                            </label>
//                            <p className="text-muted-foreground text-sm">
//                                A execução do ambiente pode ser feita de duas formas: no modo Automático, você escolhe o arquivo principal e a Virtus Cloud o executa; no modo Manual, é preciso definir o ambiente e informar o comando de inicialização.
//                            </p>
//                            <div className="flex flex-col-reverse gap-2 sm:flex-row md:gap-4">
//                                <button
//                                    type="button"
//                                    disabled
//                                    className="bg-input text-muted flex justify-between items-center px-4 h-10 rounded-md text-sm cursor-not-allowed"
//                                >
//                                    Selecione um arquivo principal
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="ml-2 size-4 opacity-50">
//                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                    </svg>
//                                </button>
//                                <div className="flex items-center justify-between rounded-md border border-input bg-input px-4 h-10 sm:w-80">
//                                    <span className="text-sm">Detectar automaticamente</span>
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 opacity-50">
//                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                    </svg>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Separador */}
//                        <div className="shrink-0 bg-virtus-600 h-px w-full" />
//                        {/* Variáveis de Ambiente */}
//                        <div className="flex flex-col gap-1.5">
//                            <div className="rounded-md border border-border bg-background px-6">
//                                <div className="border-b">
//                                    <h3 className="flex justify-between py-4 text-sm font-medium hover:underline">
//                                        <span>Variáveis de Ambiente</span>
//                                    </h3>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Publicação na Web */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Publicação na Web</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se o seu projeto for um site ou uma API, ativar esta opção permitirá o roteamento da aplicação pela porta 80, possibilitando acesso externo via HTTPS e WSS. Além disso, será necessário atribuir um subdomínio ao projeto.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Comando de inicialização */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Comando de inicialização</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Defina um comando personalizado para iniciar sua aplicação conforme necessária.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Auto Restart */}
//                        <div className="flex flex-col gap-6 rounded-md py-6 text-card-foreground border border-blue-700/75 bg-gradient-to-bl from-blue-700/15 to-blue-700/5">
//                            <div className="px-6">
//                                <div className="font-semibold text-sm">
//                                    Auto Restart
//                                    <span className="ml-2 inline-flex items-center gap-1.5 font-semibold text-primary bg-blue-700 hover:bg-blue-800 rounded-sm px-1.5 text-[10px]/4">
//                                        Tecnologia Exclusiva
//                                    </span>
//                                </div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se sua aplicação travar devido a falhas inesperadas, a tecnologia exclusiva da Virtus Cloud tentará reiniciá-la automaticamente para garantir máxima disponibilidade e estabilidade.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="true" className="peer h-5 w-9 rounded-full bg-blue-600">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-[calc(100%-2px)] transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão de Deploy */}
//                        <button
//                            type="submit"
//                            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium w-full mx-auto cursor-pointer"
//                        >
//                            Realizar o deploy
//                        </button>
//
//                        {/* Status do upload */}
//                        {status && (
//                            <p className="mt-4 text-gray-300 whitespace-pre-line">{status}</p>
//                        )}
//
//                        {/* Entrypoints detectados */}
//                        {entryPoints.length > 0 && appID && (
//                            <div className="mt-4 text-sm text-white">
//                                <p>Entrypoints detectados:</p>
//                                <ul className="list-disc ml-4">
//                                    {entryPoints.map((entry, i) => (
//                                        <li key={i}>{entry}</li>
//                                    ))}
//                                </ul>
//                            </div>
//                        )}
//                    </div>
//                </div>
//            </form>
//            <Footer />
//        </div>
//    );
//}

//'use client';
//
//import Footer from "../Recycles/Footer";
//import ZipUploadArea from '@/components/buttons/ZipUploadArea';
//
//export default function UploadFormArchive() {
//    return (
//        <div className="flex flex-col gap-6 py-6">
//            <form className="flex flex-col gap-4">
//                <div className="flex flex-col gap-4 lg:flex-row">
//                    <div className="mx-auto w-full max-w-5xl space-y-8">
//                        {/* Header */}
//                        <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                            <div className="w-full text-left">
//                                <a className="mb-4 flex items-center gap-2 text-secondary text-xs" href="/dashboard">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                    </svg>
//                                    Voltar para a dashboard
//                                </a>
//                                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                            </div>
//                            <a
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                                href="/upload"
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                </svg>
//                                Fazer deploy de outra forma
//                            </a>
//                        </header>
//                        {/* Upload ZIP */}
//                        <ZipUploadArea />
//                        <div className="flex flex-col gap-4 sm:flex-row">
//                            {/* Memória */}
//                            <div className="flex flex-col gap-3 flex-1">
//                                <label className="text-sm font-medium flex justify-between">
//                                    <span>Memória<span className="ml-1.5 text-red-500">*</span></span>
//                                    <span className="text-green-500 text-sm">768 MB</span>
//                                </label>
//                                <div className="flex items-center rounded-md border border-virtus-600 bg-input px-4 h-10">
//                                    <input
//                                        name="config.MEMORY"
//                                        type="number"
//                                        min={256}
//                                        placeholder="256"
//                                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-semi-muted"
//                                    />
//                                </div>
//                            </div>
//
//                            {/* Versão */}
//                            <div className="flex flex-col gap-3 flex-1">
//                                <label className="text-sm font-medium">
//                                    Versão<span className="ml-1.5 text-red-500">*</span>
//                                </label>
//                                <div className="flex items-center justify-between rounded-md border border-input bg-input px-4 h-10">
//                                    <span className="text-sm">Recomendado</span>
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 opacity-50">
//                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                    </svg>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Execução do ambiente */}
//                        <div className="flex flex-col gap-2">
//                            <label className="text-sm font-medium">
//                                Execução do ambiente<span className="ml-1.5 text-red-500">*</span>
//                            </label>
//                            <p className="text-muted-foreground text-sm">
//                                A execução do ambiente pode ser feita de duas formas: no modo Automático, você escolhe o arquivo principal e a Virtus Cloud o executa; no modo Manual, é preciso definir o ambiente e informar o comando de inicialização.
//                            </p>
//                            <div className="flex flex-col-reverse gap-2 sm:flex-row md:gap-4">
//                                <button
//                                    type="button"
//                                    disabled
//                                    className="bg-input text-muted flex justify-between items-center px-4 h-10 rounded-md text-sm cursor-not-allowed"
//                                >
//                                    Selecione um arquivo principal
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="ml-2 size-4 opacity-50">
//                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                    </svg>
//                                </button>
//                                <div className="flex items-center justify-between rounded-md border border-input bg-input px-4 h-10 sm:w-80">
//                                    <span className="text-sm">Detectar automaticamente</span>
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 opacity-50">
//                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                    </svg>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Separador */}
//                        <div className="shrink-0 bg-virtus-600 h-px w-full" />
//
//                        {/* Variáveis de Ambiente */}
//                        <div className="flex flex-col gap-1.5">
//                            <div className="rounded-md border border-border bg-background px-6">
//                                <div className="border-b">
//                                    <h3 className="flex justify-between py-4 text-sm font-medium hover:underline">
//                                        <span>Variáveis de Ambiente</span>
//                                    </h3>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Publicação na Web */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Publicação na Web</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se o seu projeto for um site ou uma API, ativar esta opção permitirá o roteamento da aplicação pela porta 80, possibilitando acesso externo via HTTPS e WSS. Além disso, será necessário atribuir um subdomínio ao projeto.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Comando de inicialização */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Comando de inicialização</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Defina um comando personalizado para iniciar sua aplicação conforme necessária.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Auto Restart */}
//                        <div className="flex flex-col gap-6 rounded-md py-6 text-card-foreground border border-blue-700/75 bg-gradient-to-bl from-blue-700/15 to-blue-700/5">
//                            <div className="px-6">
//                                <div className="font-semibold text-sm">
//                                    Auto Restart
//                                    <span className="ml-2 inline-flex items-center gap-1.5 font-semibold text-primary bg-blue-700 hover:bg-blue-800 rounded-sm px-1.5 text-[10px]/4">
//                                        Tecnologia Exclusiva
//                                    </span>
//                                </div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se sua aplicação travar devido a falhas inesperadas, a tecnologia exclusiva da Virtus Cloud tentará reiniciá-la automaticamente para garantir máxima disponibilidade e estabilidade.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="true" className="peer h-5 w-9 rounded-full bg-blue-600">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-[calc(100%-2px)] transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão de Deploy */}
//                        <button
//                            type="submit"
//                            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium w-fit self-start"
//                        >
//                            Realizar o deploy
//                        </button>
//                    </div>
//                </div>
//            </form>
//            <Footer />
//        </div>
//    );
//}

//frontend/src/components/buttons/UploadFormArchive.tsx

//'use client';
//
//import Footer from "../Recycles/Footer";
//
//export default function UploadFormArchive() {
//    return (
//        <div className="flex flex-col gap-6 py-6">
//            <form className="flex flex-col gap-4">
//                <div className="flex flex-col gap-4 lg:flex-row">
//                    <div className="mx-auto w-full max-w-5xl space-y-8">
//                        {/* Header */}
//                        <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                            <div className="w-full text-left">
//                                <a className="mb-4 flex items-center gap-2 text-secondary text-xs" href="/dashboard">
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                    </svg>
//                                    Voltar para a dashboard
//                                </a>
//                                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                            </div>
//                            <a
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                                href="/upload"
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                                </svg>
//                                Fazer deploy de outra forma
//                            </a>
//                        </header>
//                        {/* Upload ZIP */}
//                        <div className="flex flex-col gap-6 rounded-md border bg-card py-6 text-card-foreground">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-base">Quase lá! Agora, configure o seu zip.</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Selecione o zip que será importado. Se for um monorepo, não se esqueça de alterar o diretório raiz para a pasta correta.
//                                </div>
//                            </div>
//
//                            <div className="px-6 md:h-100">
//                                <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//                                    {/* Área de upload */}
//                                    <div className="flex select-none flex-col gap-1.5">
//                                        <input
//                                            accept="application/zip,.zip"
//                                            multiple
//                                            tabIndex={-1}
//                                            type="file"
//                                            style={{
//                                                border: 0,
//                                                clip: 'rect(0px, 0px, 0px, 0px)',
//                                                clipPath: 'inset(50%)',
//                                                height: '1px',
//                                                margin: '0px -1px -1px 0px',
//                                                overflow: 'hidden',
//                                                padding: 0,
//                                                position: 'absolute',
//                                                width: '1px',
//                                                whiteSpace: 'nowrap',
//                                            }}
//                                        />
//                                        <div
//                                            role="presentation"
//                                            tabIndex={0}
//                                            className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//                                            data-dragging="false"
//                                        >
//                                            <div className="flex size-full flex-col items-center justify-center">
//                                                <img
//                                                    alt="File Upload"
//                                                    draggable={false}
//                                                    loading="lazy"
//                                                    width={256}
//                                                    height={155}
//                                                    decoding="async"
//                                                    src="/assets/pages/upload/file-upload.svg"
//                                                    style={{ color: 'transparent' }}
//                                                />
//                                                <div className="mt-4 flex flex-col items-center text-center">
//                                                    <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                                                    <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//                                                </div>
//                                                <div className="mt-6">
//                                                    <button
//                                                        type="button"
//                                                        role="button"
//                                                        className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4"
//                                                    >
//                                                        Selecione seu arquivo
//                                                    </button>
//                                                </div>
//                                            </div>
//                                        </div>
//                                    </div>
//
//                                    {/* Placeholder da árvore de arquivos */}
//                                    <div className="motion-opacity-in-0 flex h-100 items-center justify-center">
//                                        <p className="text-center text-secondary text-sm">
//                                            Selecione um arquivo para visualizar sua árvore de arquivos.
//                                        </p>
//                                    </div>
//                                </div>
//                            </div>
//                        </div>
//                        <div className="flex flex-col gap-4 sm:flex-row">
//                            {/* Memória */}
//                            <div className="flex flex-col gap-3 flex-1">
//                                <label className="text-sm font-medium flex justify-between">
//                                    <span>Memória<span className="ml-1.5 text-red-500">*</span></span>
//                                    <span className="text-green-500 text-sm">768 MB</span>
//                                </label>
//                                <div className="flex items-center rounded-md border border-virtus-600 bg-input px-4 h-10">
//                                    <input
//                                        name="config.MEMORY"
//                                        type="number"
//                                        min={256}
//                                        placeholder="256"
//                                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-semi-muted"
//                                    />
//                                </div>
//                            </div>
//
//                            {/* Versão */}
//                            <div className="flex flex-col gap-3 flex-1">
//                                <label className="text-sm font-medium">
//                                    Versão<span className="ml-1.5 text-red-500">*</span>
//                                </label>
//                                <div className="flex items-center justify-between rounded-md border border-input bg-input px-4 h-10">
//                                    <span className="text-sm">Recomendado</span>
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 opacity-50">
//                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                    </svg>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Execução do ambiente */}
//                        <div className="flex flex-col gap-2">
//                            <label className="text-sm font-medium">
//                                Execução do ambiente<span className="ml-1.5 text-red-500">*</span>
//                            </label>
//                            <p className="text-muted-foreground text-sm">
//                                A execução do ambiente pode ser feita de duas formas: no modo Automático, você escolhe o arquivo principal e a Virtus Cloud o executa; no modo Manual, é preciso definir o ambiente e informar o comando de inicialização.
//                            </p>
//                            <div className="flex flex-col-reverse gap-2 sm:flex-row md:gap-4">
//                                <button
//                                    type="button"
//                                    disabled
//                                    className="bg-input text-muted flex justify-between items-center px-4 h-10 rounded-md text-sm cursor-not-allowed"
//                                >
//                                    Selecione um arquivo principal
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="ml-2 size-4 opacity-50">
//                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                    </svg>
//                                </button>
//                                <div className="flex items-center justify-between rounded-md border border-input bg-input px-4 h-10 sm:w-80">
//                                    <span className="text-sm">Detectar automaticamente</span>
//                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 opacity-50">
//                                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                                    </svg>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Separador */}
//                        <div className="shrink-0 bg-virtus-600 h-px w-full" />
//
//                        {/* Variáveis de Ambiente */}
//                        <div className="flex flex-col gap-1.5">
//                            <div className="rounded-md border border-border bg-background px-6">
//                                <div className="border-b">
//                                    <h3 className="flex justify-between py-4 text-sm font-medium hover:underline">
//                                        <span>Variáveis de Ambiente</span>
//                                    </h3>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Publicação na Web */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Publicação na Web</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se o seu projeto for um site ou uma API, ativar esta opção permitirá o roteamento da aplicação pela porta 80, possibilitando acesso externo via HTTPS e WSS. Além disso, será necessário atribuir um subdomínio ao projeto.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Comando de inicialização */}
//                        <div className="flex flex-col rounded-md border bg-card py-6 text-card-foreground gap-0">
//                            <div className="px-6 border-b">
//                                <div className="font-semibold text-sm">Comando de inicialização</div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Defina um comando personalizado para iniciar sua aplicação conforme necessária.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="false" className="peer h-5 w-9 rounded-full bg-input">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-0 transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Auto Restart */}
//                        <div className="flex flex-col gap-6 rounded-md py-6 text-card-foreground border border-blue-700/75 bg-gradient-to-bl from-blue-700/15 to-blue-700/5">
//                            <div className="px-6">
//                                <div className="font-semibold text-sm">
//                                    Auto Restart
//                                    <span className="ml-2 inline-flex items-center gap-1.5 font-semibold text-primary bg-blue-700 hover:bg-blue-800 rounded-sm px-1.5 text-[10px]/4">
//                                        Tecnologia Exclusiva
//                                    </span>
//                                </div>
//                                <div className="text-secondary-foreground text-sm">
//                                    Se sua aplicação travar devido a falhas inesperadas, a tecnologia exclusiva da Virtus Cloud tentará reiniciá-la automaticamente para garantir máxima disponibilidade e estabilidade.
//                                </div>
//                                <div className="flex justify-end mt-4">
//                                    <button type="button" role="switch" aria-checked="true" className="peer h-5 w-9 rounded-full bg-blue-600">
//                                        <span className="block size-4.5 rounded-full bg-primary translate-x-[calc(100%-2px)] transition-transform" />
//                                    </button>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão de Deploy */}
//                        <button
//                            type="submit"
//                            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium w-fit self-start"
//                        >
//                            Realizar o deploy
//                        </button>
//                    </div>
//                </div>
//            </form>
//            <Footer />
//        </div>
//    );
//}

//frontend/src/components/buttons/UploadFormArchive.tsx

//'use client';
//
//export default function UploadFormArchive() {
//  return (
//    <div className="flex flex-col gap-6 py-6">
//      <form className="flex flex-col gap-4">
//        <div className="flex flex-col gap-4 lg:flex-row">
//          <div className="mx-auto w-full max-w-5xl space-y-8">
//            {/* Header */}
//            <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//              <div className="w-full text-left">
//                <a className="mb-4 flex items-center gap-2 text-secondary text-xs" href="/dashboard">
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                  </svg>
//                  Voltar para a dashboard
//                </a>
//                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//              </div>
//              <a
//                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                href="/upload"
//              >
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                </svg>
//                Fazer deploy de outra forma
//              </a>
//            </header>
//
//            {/* Upload ZIP */}
//            <div className="flex flex-col gap-6 rounded-md border bg-card py-6 text-card-foreground">
//              <div className="px-6 border-b">
//                <div className="font-semibold text-base">Quase lá! Agora, configure o seu zip.</div>
//                <div className="text-secondary-foreground text-sm">
//                  Selecione o zip que será importado. Se for um monorepo, não se esqueça de alterar o diretório raiz para a pasta correta.
//                </div>
//              </div>
//
//              <div className="px-6 md:h-100">
//                <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//                  {/* File Upload */}
//                  <div className="flex select-none flex-col gap-1.5">
//                    <input
//                      type="file"
//                      accept=".zip"
//                      multiple
//                      tabIndex={-1}
//                      style={{
//                        border: 0,
//                        clip: 'rect(0px, 0px, 0px, 0px)',
//                        clipPath: 'inset(50%)',
//                        height: '1px',
//                        margin: '0px -1px -1px 0px',
//                        overflow: 'hidden',
//                        padding: 0,
//                        position: 'absolute',
//                        width: '1px',
//                        whiteSpace: 'nowrap',
//                      }}
//                    />
//                    <div
//                      role="presentation"
//                      tabIndex={0}
//                      className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//                    >
//                      <div className="flex size-full flex-col items-center justify-center">
//                        <img
//                          alt="File Upload"
//                          width={256}
//                          height={155}
//                          src="/assets/pages/upload/file-upload.svg"
//                          style={{ color: 'transparent' }}
//                        />
//                        <div className="mt-4 flex flex-col items-center text-center">
//                          <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                          <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//                        </div>
//                        <div className="mt-6">
//                          <button type="button" className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm">
//                            Selecionar seu arquivo
//                          </button>
//                        </div>
//                      </div>
//                    </div>
//                  </div>
//
//                  {/* Placeholder para árvore de arquivos */}
//                  <div className="flex h-100 items-center justify-center">
//                    <p className="text-center text-secondary text-sm">
//                      Selecione um arquivo para visualizar sua árvore de arquivos.
//                    </p>
//                  </div>
//                </div>
//              </div>
//            </div>
//
//            {/* Aqui você pode continuar com os cards de configuração da aplicação */}
//            {/* Sugestão: modularizar cada card como <AppConfigCard />, <EnvCard />, <RestartCard />, etc. */}
//          </div>
//        </div>
//      </form>
//    </div>
//  );
//}

//'use client';
//
//export default function UploadFormArchive() {
//  return (
//    <div className="flex flex-col gap-6 py-6">
//      <form className="flex flex-col gap-4">
//        <div className="flex flex-col gap-4 lg:flex-row">
//          <div className="mx-auto w-full max-w-5xl space-y-8">
//            {/* Header */}
//            <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//              <div className="w-full text-left">
//                <a className="mb-4 flex items-center gap-2 text-secondary text-xs" href="/dashboard">
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                  </svg>
//                  Voltar para a dashboard
//                </a>
//                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//              </div>
//              <a
//                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                href="/upload"
//              >
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                </svg>
//                Fazer deploy de outra forma
//              </a>
//            </header>
//
//            {/* Card: ZIP Upload */}
//            <div className="flex flex-col gap-6 rounded-md border bg-card py-6 text-card-foreground">
//              <div className="px-6 border-b">
//                <div className="font-semibold text-base">Quase lá! Agora, configure o seu zip.</div>
//                <div className="text-secondary-foreground text-sm">
//                  Selecione o zip que será importado. Se for um monorepo, não se esqueça de alterar o diretório raiz para a pasta correta.
//                </div>
//              </div>
//
//              <div className="px-6 md:h-100">
//                <div className="flex h-full flex-col gap-4 md:grid md:grid-cols-2">
//                  {/* File Upload */}
//                  <div className="flex select-none flex-col gap-1.5">
//                    <input
//                      type="file"
//                      accept=".zip"
//                      multiple
//                      tabIndex={-1}
//                      style={{
//                        border: 0,
//                        clip: 'rect(0px, 0px, 0px, 0px)',
//                        clipPath: 'inset(50%)',
//                        height: '1px',
//                        margin: '0px -1px -1px 0px',
//                        overflow: 'hidden',
//                        padding: 0,
//                        position: 'absolute',
//                        width: '1px',
//                        whiteSpace: 'nowrap',
//                      }}
//                    />
//                    <div
//                      role="presentation"
//                      tabIndex={0}
//                      className="flex h-full min-h-[230px] rounded-md border-2 border-border border-dashed px-4 py-6 hover:cursor-pointer"
//                    >
//                      <div className="flex size-full flex-col items-center justify-center">
//                        <img
//                          alt="File Upload"
//                          width={256}
//                          height={155}
//                          src="/assets/pages/upload/file-upload.svg"
//                          style={{ color: 'transparent' }}
//                        />
//                        <div className="mt-4 flex flex-col items-center text-center">
//                          <p className="font-semibold text-primary text-sm">Arraste e solte seu arquivo .zip</p>
//                          <p className="text-secondary text-sm">Você só pode enviar arquivos até 100 MB</p>
//                        </div>
//                        <div className="mt-6">
//                          <button type="button" className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm">
//                            Selecionar seu arquivo
//                          </button>
//                        </div>
//                      </div>
//                    </div>
//                  </div>
//
//                  {/* Placeholder para árvore de arquivos */}
//                  <div className="flex h-100 items-center justify-center">
//                    <p className="text-center text-secondary text-sm">
//                      Selecione um arquivo para visualizar sua árvore de arquivos.
//                    </p>
//                  </div>
//                </div>
//              </div>
//            </div>
//
//            {/* Aqui você pode continuar com os cards de configuração da aplicação, ambiente, domínio, etc. */}
//          </div>
//        </div>
//      </form>
//    </div>
//  );
//}
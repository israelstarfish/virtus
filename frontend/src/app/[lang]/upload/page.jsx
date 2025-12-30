//frontend/src/app/[lang]/upload/page.jsx

'use client';

import { useSearchParams, useRouter, usePathname, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/Recycles/Header';
import Footer from '@/components/Recycles/Footer';
import UploadFormArchive from '@/components/buttons/UploadFormArchive';
import Link from 'next/link';
import FaqSection from '@/components/sections/FaqSection';
import PlanModal from '@/components/modals/PlanModal';

export default function UploadPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const type = searchParams.get('type');
  const { lang } = useParams();

  const [username, setUsername] = useState('');
  const [plan, setPlan] = useState('');
  const [canDeploy, setCanDeploy] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  useEffect(() => {
    const checkAccess = async () => {
      const typeParam = searchParams.get('type');
      if (typeParam !== 'archive') return;

      try {
        const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
        const data = await res.json();

        if (!data.username || !data.role) {
          router.replace(`/${lang}/upload`);
          return;
        }

        const statusRes = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
        const statusData = await statusRes.json();

        if (!statusData.canDeploy) {
          router.replace(`/${lang}/upload#get-plan`);
          return;
        }

        // Tudo certo, permanece em /upload?type=archive
      } catch {
        router.replace(`/${lang}/upload`);
      }
    };

    checkAccess();
  }, [searchParams]);

  // ✅ Abre o modal automaticamente se vier com #get-plan
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#get-plan') {
      setShowPlanModal(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, '', window.location.pathname); // limpa o hash
    }
  }, []);


  // ✅ Verificação acontece apenas ao clicar nos cards
  const handleSelect = async (selectedType) => {
    try {
      const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
      const data = await res.json();

      if (!data.username || !data.role) {
        router.replace(`/${lang}/signin`);
        return;
      }

      const statusRes = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
      const statusData = await statusRes.json();

      if (!statusData.canDeploy) {
        setShowPlanModal(true);
        return;
      }

      const url = `${pathname}?type=${selectedType}`;
      router.replace(url);
    } catch {
      router.replace(`/${lang}/signin`);
    }
  };

  return (
    <>
      <Header />

      <div className="relative min-h-[calc(100dvh-80px)] flex-1 bg-grid-virtus-600/[0.2] pt-8 pb-12">
        {!type && (
          <div className="container flex max-w-5xl flex-col items-center gap-24 font-sans text-gray-200 sm:py-6">
            <div className="w-full space-y-6">
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

                {/* Botão de snapshot */}
                <Link
                  role="button"
                  href={`/${lang}/dashboard/snapshots`}
                  className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm-8-48A95.44,95.44,0,0,0,60.08,60.15C52.81,67.51,46.35,74.59,40,82V64a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H49c7.15-8.42,14.27-16.35,22.39-24.57a80,80,0,1,1,1.66,114.75,8,8,0,1,0-11,11.64A96,96,0,1,0,128,32Z" />
                  </svg>
                  Importar de uma Snapshot
                </Link>
              </header>

              <main className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* GitHub Card */}
                <div
                  role="button"
                  tabIndex={0}
                  style={{ opacity: 1 }}
                  onClick={() => handleSelect('github')}
                  className="group relative flex h-70 cursor-pointer flex-col justify-between rounded-xl border border-gray-800 bg-background p-6 transition-all duration-300 hover:border-blue-800"
                >
                  <div>
                    <img alt="Github Logo" width={48} height={48} src="/assets/companies/small/github.svg" style={{ color: 'transparent' }} />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-semibold text-base text-gray-200 transition-colors group-hover:text-white sm:text-lg">
                      Importar projeto diretamente do GitHub
                    </h2>
                    <span className="text-secondary text-sm">
                      Conecte seu repositório do GitHub e importe o código em poucos cliques. Sempre que quiser, basta reenviar ou atualizar o projeto sem complicação.
                    </span>
                  </div>
                </div>
                {/* ZIP Card */}
                <div
                  role="button"
                  tabIndex={0}
                  style={{ opacity: 1 }}
                  onClick={() => handleSelect('archive')}
                  className="group relative flex h-70 cursor-pointer flex-col justify-between rounded-xl border border-gray-800 bg-background p-6 transition-all duration-300 hover:border-blue-800"
                >
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M224,48H32A16,16,0,0,0,16,64V88a16,16,0,0,0,16,16v88a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM208,192H48V104H208ZM224,88H32V64H224V88ZM96,136a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,136Z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-semibold text-base text-gray-200 transition-colors group-hover:text-white sm:text-lg">
                      Enviar projeto a partir de um arquivo ZIP
                    </h2>
                    <span className="text-secondary text-sm">
                      Faça upload de um arquivo .zip contendo o seu projeto já preparado. É rápido, simples e ideal para quem prefere enviar os arquivos manualmente.
                    </span>
                  </div>
                </div>
              </main>

              {/* Seção de perguntas frequentes */}
              <FaqSection />
            </div>
          </div>
        )}

        {/* Renderiza o formulário de upload se o tipo for 'archive' e plano permitir */}
        {type === 'archive' && <UploadFormArchive />}

        {/* Modal de plano se não puder fazer deploy */}
        {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
      </div>

      <Footer />
    </>
  );
}

//frontend/src/app/[lang]/upload/page.jsx

//'use client';
//
//import { useSearchParams, useRouter, usePathname, useParams } from 'next/navigation';
//import { useState, useEffect } from 'react';
//import DefaultHeader from '@/components/Recycles/DefaultHeader';
//import Footer from '@/components/Recycles/Footer';
//import UploadFormArchive from '@/components/buttons/UploadFormArchive';
//import Link from 'next/link';
//import FaqSection from '@/components/sections/FaqSection';
//import PlanModal from '@/components/modals/PlanModal';
//
//export default function UploadPage() {
//  const searchParams = useSearchParams();
//  const router = useRouter();
//  const pathname = usePathname();
//  const type = searchParams.get('type');
//  const { lang } = useParams();
//
//  const [username, setUsername] = useState('');
//  const [plan, setPlan] = useState('');
//  const [canDeploy, setCanDeploy] = useState(false);
//  const [showPlanModal, setShowPlanModal] = useState(false);
//
//  // ✅ Abre o modal automaticamente se vier com #get-plan
//  useEffect(() => {
//    if (typeof window !== 'undefined' && window.location.hash === '#get-plan') {
//      setShowPlanModal(true);
//      window.scrollTo({ top: 0, behavior: 'smooth' });
//      history.replaceState(null, '', window.location.pathname); // limpa o hash
//    }
//  }, []);
//
//
//  // ✅ Verificação acontece apenas ao clicar nos cards
//  const handleSelect = async (selectedType) => {
//    try {
//      const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//
//      if (!data.username || !data.role) {
//        router.replace(`/${lang}/signin`);
//        return;
//      }
//
//      const statusRes = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const statusData = await statusRes.json();
//
//      if (!statusData.canDeploy) {
//        setShowPlanModal(true);
//        return;
//      }
//
//      const url = `${pathname}?type=${selectedType}`;
//      router.replace(url);
//    } catch {
//      router.replace(`/${lang}/signin`);
//    }
//  };
//
//  return (
//    <>
//      <DefaultHeader />
//
//      <div className="relative min-h-[calc(100dvh-80px)] flex-1 bg-grid-virtus-600/[0.2] pt-8 pb-12">
//        {!type && (
//          <div className="container flex max-w-5xl flex-col items-center gap-24 font-sans text-gray-200 sm:py-6">
//            <div className="w-full space-y-6">
//              <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                <div className="w-full text-left">
//                  <Link
//                    className="mb-4 flex items-center gap-2 text-secondary text-xs"
//                    href={`/${lang}/dashboard`}
//                  >
//                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                    </svg>
//                    Voltar para a dashboard
//                  </Link>
//                  <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                  <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                </div>
//
//                {/* Botão de snapshot */}
//                <Link
//                  role="button"
//                  href={`/${lang}/dashboard/snapshots`}
//                  className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                >
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm-8-48A95.44,95.44,0,0,0,60.08,60.15C52.81,67.51,46.35,74.59,40,82V64a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H49c7.15-8.42,14.27-16.35,22.39-24.57a80,80,0,1,1,1.66,114.75,8,8,0,1,0-11,11.64A96,96,0,1,0,128,32Z" />
//                  </svg>
//                  Importar de uma Snapshot
//                </Link>
//              </header>
//
//              <main className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                {/* GitHub Card */}
//                <div
//                  role="button"
//                  tabIndex={0}
//                  style={{ opacity: 1 }}
//                  onClick={() => handleSelect('github')}
//                  className="group relative flex h-70 cursor-pointer flex-col justify-between rounded-xl border border-gray-800 bg-background p-6 transition-all duration-300 hover:border-blue-800"
//                >
//                  <div>
//                    <img alt="Github Logo" width={48} height={48} src="/assets/companies/small/github.svg" style={{ color: 'transparent' }} />
//                  </div>
//                  <div className="space-y-1">
//                    <h2 className="font-semibold text-base text-gray-200 transition-colors group-hover:text-white sm:text-lg">
//                      Importar projeto diretamente do GitHub
//                    </h2>
//                    <span className="text-secondary text-sm">
//                      Conecte seu repositório do GitHub e importe o código em poucos cliques. Sempre que quiser, basta reenviar ou atualizar o projeto sem complicação.
//                    </span>
//                  </div>
//                </div>
//                {/* ZIP Card */}
//                <div
//                  role="button"
//                  tabIndex={0}
//                  style={{ opacity: 1 }}
//                  onClick={() => handleSelect('archive')}
//                  className="group relative flex h-70 cursor-pointer flex-col justify-between rounded-xl border border-gray-800 bg-background p-6 transition-all duration-300 hover:border-blue-800"
//                >
//                  <div>
//                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M224,48H32A16,16,0,0,0,16,64V88a16,16,0,0,0,16,16v88a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM208,192H48V104H208ZM224,88H32V64H224V88ZM96,136a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,136Z" />
//                    </svg>
//                  </div>
//                  <div className="space-y-1">
//                    <h2 className="font-semibold text-base text-gray-200 transition-colors group-hover:text-white sm:text-lg">
//                      Enviar projeto a partir de um arquivo ZIP
//                    </h2>
//                    <span className="text-secondary text-sm">
//                      Faça upload de um arquivo .zip contendo o seu projeto já preparado. É rápido, simples e ideal para quem prefere enviar os arquivos manualmente.
//                    </span>
//                  </div>
//                </div>
//              </main>
//
//              {/* Seção de perguntas frequentes */}
//              <FaqSection />
//            </div>
//          </div>
//        )}
//
//        {/* Renderiza o formulário de upload se o tipo for 'archive' e plano permitir */}
//        {type === 'archive' && <UploadFormArchive />}
//
//        {/* Modal de plano se não puder fazer deploy */}
//        {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
//      </div>
//
//      <Footer lang={lang} />
//    </>
//  );
//}

//frontend/src/app/[lang]/upload/page.jsx

//'use client';
//
//import { useSearchParams, useRouter, usePathname, useParams } from 'next/navigation';
//import { useState, useEffect } from 'react';
//import DefaultHeader from '@/components/Recycles/DefaultHeader';
//import Footer from '@/components/Recycles/Footer';
//import UploadFormArchive from '@/components/buttons/UploadFormArchive';
//import Link from 'next/link';
//import FaqSection from '@/components/sections/FaqSection';
//import PlanModal from '@/components/modals/PlanModal';
//
//export default function UploadPage() {
//  const searchParams = useSearchParams();
//  const router = useRouter();
//  const pathname = usePathname();
//  const type = searchParams.get('type');
//  const { lang } = useParams();
//
//  const [username, setUsername] = useState('');
//  const [plan, setPlan] = useState('');
//  const [canDeploy, setCanDeploy] = useState(false);
//  const [showPlanModal, setShowPlanModal] = useState(false);
//
//  // ✅ Verificação acontece apenas ao clicar nos cards
//  const handleSelect = async (selectedType) => {
//    try {
//      const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//
//      if (!data.username || !data.role) {
//        router.replace(`/${lang}/signin`);
//        return;
//      }
//
//      const statusRes = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const statusData = await statusRes.json();
//
//      if (!statusData.canDeploy) {
//        setShowPlanModal(true);
//        return;
//      }
//
//      const url = `${pathname}?type=${selectedType}`;
//      router.replace(url);
//    } catch {
//      router.replace(`/${lang}/signin`);
//    }
//  };
//
//  return (
//    <>
//      <DefaultHeader />
//
//      <div className="relative min-h-[calc(100dvh-80px)] flex-1 bg-grid-virtus-600/[0.2] pt-8 pb-12">
//        {!type && (
//          <div className="container flex max-w-5xl flex-col items-center gap-24 font-sans text-gray-200 sm:py-6">
//            <div className="w-full space-y-6">
//              <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                <div className="w-full text-left">
//                  <Link
//                    className="mb-4 flex items-center gap-2 text-secondary text-xs"
//                    href={`/${lang}/dashboard`}
//                  >
//                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                    </svg>
//                    Voltar para a dashboard
//                  </Link>
//                  <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                  <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                </div>
//
//                {/* Botão de snapshot */}
//                <Link
//                  role="button"
//                  href={`/${lang}/dashboard/snapshots`}
//                  className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                >
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm-8-48A95.44,95.44,0,0,0,60.08,60.15C52.81,67.51,46.35,74.59,40,82V64a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H49c7.15-8.42,14.27-16.35,22.39-24.57a80,80,0,1,1,1.66,114.75,8,8,0,1,0-11,11.64A96,96,0,1,0,128,32Z" />
//                  </svg>
//                  Importar de uma Snapshot
//                </Link>
//              </header>
//
//              <main className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                {/* GitHub Card */}
//                <div
//                  role="button"
//                  tabIndex={0}
//                  style={{ opacity: 1 }}
//                  onClick={() => handleSelect('github')}
//                  className="group relative flex h-70 cursor-pointer flex-col justify-between rounded-xl border border-gray-800 bg-background p-6 transition-all duration-300 hover:border-blue-800"
//                >
//                  <div>
//                    <img alt="Github Logo" width={48} height={48} src="/assets/companies/small/github.svg" style={{ color: 'transparent' }} />
//                  </div>
//                  <div className="space-y-1">
//                    <h2 className="font-semibold text-base text-gray-200 transition-colors group-hover:text-white sm:text-lg">
//                      Importar projeto diretamente do GitHub
//                    </h2>
//                    <span className="text-secondary text-sm">
//                      Conecte seu repositório do GitHub e importe o código em poucos cliques. Sempre que quiser, basta reenviar ou atualizar o projeto sem complicação.
//                    </span>
//                  </div>
//                </div>
//                {/* ZIP Card */}
//                <div
//                  role="button"
//                  tabIndex={0}
//                  style={{ opacity: 1 }}
//                  onClick={() => handleSelect('archive')}
//                  className="group relative flex h-70 cursor-pointer flex-col justify-between rounded-xl border border-gray-800 bg-background p-6 transition-all duration-300 hover:border-blue-800"
//                >
//                  <div>
//                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M224,48H32A16,16,0,0,0,16,64V88a16,16,0,0,0,16,16v88a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM208,192H48V104H208ZM224,88H32V64H224V88ZM96,136a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,136Z" />
//                    </svg>
//                  </div>
//                  <div className="space-y-1">
//                    <h2 className="font-semibold text-base text-gray-200 transition-colors group-hover:text-white sm:text-lg">
//                      Enviar projeto a partir de um arquivo ZIP
//                    </h2>
//                    <span className="text-secondary text-sm">
//                      Faça upload de um arquivo .zip contendo o seu projeto já preparado. É rápido, simples e ideal para quem prefere enviar os arquivos manualmente.
//                    </span>
//                  </div>
//                </div>
//              </main>
//
//              {/* Seção de perguntas frequentes */}
//              <FaqSection />
//            </div>
//          </div>
//        )}
//
//        {/* Renderiza o formulário de upload se o tipo for 'archive' e plano permitir */}
//        {type === 'archive' && <UploadFormArchive />}
//
//        {/* Modal de plano se não puder fazer deploy */}
//        {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
//      </div>
//
//      <Footer lang={lang} />
//    </>
//  );
//}

//frontend/src/app/[lang]/upload/page.jsx

//'use client';
//
//import { useSearchParams, useRouter, usePathname, useParams } from 'next/navigation';
//// import { useEffect, useState } from 'react';
//import DefaultHeader from '@/components/Recycles/DefaultHeader';
//import Footer from '@/components/Recycles/Footer';
//import UploadFormArchive from '@/components/buttons/UploadFormArchive';
//import Link from 'next/link';
//// import UploadFormGithub from '@/components/buttons/UploadFormGithub'; // quando estiver pronto
//import FaqSection from '@/components/sections/FaqSection';
//
//
//export default function UploadPage() {
//  const searchParams = useSearchParams();
//  const router = useRouter();
//  const pathname = usePathname();
//  const type = searchParams.get('type');
//  const { lang } = useParams();
//
//  const handleSelect = (selectedType) => {
//    const url = `${pathname}?type=${selectedType}`;
//    router.replace(url);
//  };
//
//  // função de deploy (ainda não usada diretamente aqui)
//  const handleDeployClick = async () => {
//    if (!selectedFile) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", selectedFile);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.id) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      setSelectedFile(null);
//    }
//  };
//
//  return (
//    <>
//      <DefaultHeader />
//
//      <div className="relative min-h-[calc(100dvh-80px)] flex-1 bg-grid-virtus-600/[0.2] pt-8 pb-12">
//        {!type && (
//          <div className="container flex max-w-5xl flex-col items-center gap-24 font-sans text-gray-200 sm:py-6">
//            <div className="w-full space-y-6">
//              <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                <div className="w-full text-left">
//                  <Link
//                    className="mb-4 flex items-center gap-2 text-secondary text-xs"
//                    href={`/${lang}/dashboard`}
//                  >
//                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                    </svg>
//                    Voltar para a dashboard
//                  </Link>
//                  <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                  <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                </div>
//
//                {/* Botão de snapshot */}
//                <Link
//                  role="button"
//                  href={`/${lang}/dashboard/snapshots`}
//                  className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//                >
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm-8-48A95.44,95.44,0,0,0,60.08,60.15C52.81,67.51,46.35,74.59,40,82V64a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H49c7.15-8.42,14.27-16.35,22.39-24.57a80,80,0,1,1,1.66,114.75,8,8,0,1,0-11,11.64A96,96,0,1,0,128,32Z" />
//                  </svg>
//                  Importar de uma Snapshot
//                </Link>
//              </header>
//
//              <main className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                {/* GitHub Card */}
//                <div
//                  role="button"
//                  tabIndex={0}
//                  style={{ opacity: 1 }}
//                  onClick={() => handleSelect('github')}
//                  className="group relative flex h-70 cursor-pointer flex-col justify-between rounded-xl border border-gray-800 bg-background p-6 transition-all duration-300 hover:border-blue-800"
//                >
//                  <div>
//                    <img alt="Github Logo" width={48} height={48} src="/assets/companies/small/github.svg" style={{ color: 'transparent' }} />
//                  </div>
//                  <div className="space-y-1">
//                    <h2 className="font-semibold text-base text-gray-200 transition-colors group-hover:text-white sm:text-lg">
//                      Importar projeto diretamente do GitHub
//                    </h2>
//                    <span className="text-secondary text-sm">
//                      Conecte seu repositório do GitHub e importe o código em poucos cliques. Sempre que quiser, basta reenviar ou atualizar o projeto sem complicação.
//                    </span>
//                  </div>
//                </div>
//
//                {/* ZIP Card */}
//                <div
//                  role="button"
//                  tabIndex={0}
//                  style={{ opacity: 1 }}
//                  onClick={() => handleSelect('archive')}
//                  className="group relative flex h-70 cursor-pointer flex-col justify-between rounded-xl border border-gray-800 bg-background p-6 transition-all duration-300 hover:border-blue-800"
//                >
//                  <div>
//                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M224,48H32A16,16,0,0,0,16,64V88a16,16,0,0,0,16,16v88a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM208,192H48V104                      H208ZM224,88H32V64H224V88ZM96,136a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,136Z" />
//                    </svg>
//                  </div>
//                  <div className="space-y-1">
//                    <h2 className="font-semibold text-base text-gray-200 transition-colors group-hover:text-white sm:text-lg">
//                      Enviar projeto a partir de um arquivo ZIP
//                    </h2>
//                    <span className="text-secondary text-sm">
//                      Faça upload de um arquivo .zip contendo o seu projeto já preparado. É rápido, simples e ideal para quem prefere enviar os arquivos manualmente.
//                    </span>
//                  </div>
//                </div>
//              </main>
//              <FaqSection />
//            </div>
//          </div>
//        )}
//
//        {/* Renderiza o formulário de upload se o tipo for 'archive' */}
//        {type === 'archive' && <UploadFormArchive />}
//      </div>
//      <Footer lang={lang} />
//    </>
//  );
//}

//frontend/src/app/[lang]/upload/page.jsx

//'use client';
//
//import { useSearchParams, useRouter, usePathname, useParams } from 'next/navigation';
////import { useEffect, useState } from 'react';
//import DefaultHeader from '@/components/Recycles/DefaultHeader';
//import UploadFormArchive from '@/components/buttons/UploadFormArchive';
//import Link from 'next/link';
////import UploadFormGithub from '@/components/buttons/UploadFormGithub'; // quando estiver pronto
//
//export default function UploadPage() {
//  const searchParams = useSearchParams();
//  const router = useRouter();
//  const pathname = usePathname();
//  const type = searchParams.get('type');
//  const { lang } = useParams();
//
//  const handleSelect = (selectedType) => {
//    const url = `${pathname}?type=${selectedType}`;
//    router.replace(url);
//  };
//
//  const handleDeployClick = async () => {
//    if (!selectedFile) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", selectedFile);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.id) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      setSelectedFile(null);
//    }
//  };
//
//  return (
//    <>
//      <DefaultHeader />
//
//      <div className="relative min-h-[calc(100dvh-80px)] flex-1 bg-grid-virtus-600/[0.2] pt-8 pb-12">
//        {!type && (
//          <div className="container flex max-w-5xl flex-col items-center gap-24 font-sans text-gray-200 sm:py-6">
//            <div className="w-full space-y-6">
//              <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//                <div className="w-full text-left">
//                  <Link
//                    className="mb-4 flex items-center gap-2 text-secondary text-xs"
//                    href={`/${lang}/dashboard`}
//                  >
//                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                    </svg>
//                    Voltar para a dashboard
//                  </Link>
//                  <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                  <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//                </div>
//              </header>
//
//              <main className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                {/* GitHub Card */}
//                <div
//                  role="button"
//                  tabIndex={0}
//                  style={{ opacity: 1 }}
//                  onClick={() => handleSelect('github')}
//                  className="group relative flex h-70 cursor-pointer flex-col justify-between rounded-xl border border-gray-800 bg-background p-6 transition-all duration-300 hover:border-blue-800"
//                >
//                  <div>
//                    <img alt="Github Logo" width={48} height={48} src="/assets/companies/small/github.svg" style={{ color: 'transparent' }} />
//                  </div>
//                  <div className="space-y-1">
//                    <h2 className="font-semibold text-base text-gray-200 transition-colors group-hover:text-white sm:text-lg">
//                      Importar projeto diretamente do GitHub
//                    </h2>
//                    <span className="text-secondary text-sm">
//                      Conecte seu repositório do GitHub e importe o código em poucos cliques. Sempre que quiser, basta reenviar ou atualizar o projeto sem complicação.
//                    </span>
//                  </div>
//                </div>
//
//                {/* ZIP Card */}
//                <div
//                  role="button"
//                  tabIndex={0}
//                  style={{ opacity: 1 }}
//                  onClick={() => handleSelect('archive')}
//                  className="group relative flex h-70 cursor-pointer flex-col justify-between rounded-xl border border-gray-800 bg-background p-6 transition-all duration-300 hover:border-blue-800"
//                >
//                  <div>
//                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M224,48H32A16,16,0,0,0,16,64V88a16,16,0,0,0,16,16v88a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Z..." />
//                    </svg>
//                  </div>
//                  <div className="space-y-1">
//                    <h2 className="font-semibold text-base text-gray-200 transition-colors group-hover:text-white sm:text-lg">
//                      Enviar projeto a partir de um arquivo ZIP
//                    </h2>
//                    <span className="text-secondary text-sm">
//                      Faça upload de um arquivo .zip contendo o seu projeto já preparado. É rápido, simples e ideal para quem prefere enviar os arquivos manualmente.
//                    </span>
//                  </div>
//                </div>
//              </main>
//            </div>
//          </div>
//        )}
//
//        {type === 'archive' && <UploadFormArchive />}
//      </div>
//    </>
//  );
//}

//'use client';
//
//import DefaultHeader from '@/components/Recycles/DefaultHeader';
//import Link from 'next/link';
//
//export default function UploadPage() {
//  return (
//    <>
//      <DefaultHeader />
//
//      <div className="relative min-h-[calc(100dvh-80px)] flex-1 bg-grid-virtus-600/[0.2] pt-8 pb-12">
//        <div className="container flex max-w-5xl flex-col items-center gap-24 font-sans text-gray-200 sm:py-6">
//          <div className="w-full space-y-6">
//            <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//              <div className="w-full text-left">
//                <Link
//                  href="/pt-br/dashboard"
//                  className="mb-4 flex items-center gap-2 text-secondary text-xs"
//                >
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                  </svg>
//                  Voltar para a dashboard
//                </Link>
//                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//              </div>
//
//              <Link
//                href="/pt-br/dashboard/snapshots"
//                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//              >
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Z..." />
//                </svg>
//                Importar de uma Snapshot
//              </Link>
//            </header>
//
//            <main className="w-full">
//              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                {/* GitHub Card */}
//                <div className="group relative flex h-70 cursor-pointer flex-col justify-between rounded-xl border border-gray-800 bg-background p-6 transition-all duration-300 hover:border-blue-800">
//                  <div>
//                    <img alt="Github Logo" width={48} height={48} src="/assets/companies/small/github.svg" />
//                  </div>
//                  <div className="space-y-1">
//                    <h2 className="font-semibold text-base text-gray-200 group-hover:text-white sm:text-lg">
//                      Importar projeto diretamente do GitHub
//                    </h2>
//                    <span className="text-secondary text-sm">
//                      Conecte seu repositório do GitHub e importe o código em poucos cliques.
//                    </span>
//                  </div>
//                </div>
//
//                {/* ZIP Card */}
//                <div
//                  className="group relative flex h-70 cursor-pointer flex-col justify-between rounded-xl border border-gray-800 bg-background p-6 transition-all duration-300 hover:border-blue-800"
//                  role="button"
//                  tabIndex={0}
//                  style={{ opacity: 1 }}
//                >
//                  <div>
//                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M224,48H32A16,16,0,0,0,16,64V88a16,16,0,0,0,16,16v88a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM208,192H48V104H208ZM224,88H32V64H224V88ZM96,136a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,136Z" />
//                    </svg>
//                  </div>
//                  <div className="space-y-1">
//                    <h2 className="font-semibold text-base text-gray-200 transition-colors group-hover:text-white sm:text-lg">
//                      Enviar projeto a partir de um arquivo ZIP
//                    </h2>
//                    <span className="text-secondary text-sm">
//                      Faça upload de um arquivo .zip contendo o seu projeto já preparado. É rápido, simples e ideal para quem prefere enviar os arquivos manualmente.
//                    </span>
//                  </div>
//                </div>
//              </div>
//            </main>
//          </div>
//        </div>
//      </div>
//
//      {/* FAQ Section */}
//      <div className="bg-background py-48">
//        <div className="container relative z-10 w-full py-24">
//          <div className="mx-auto max-w-4xl space-y-16">
//            <header className="w-full max-w-5xl text-center">
//              <h1 className="font-bold text-3xl text-white sm:text-4xl">Perguntas frequentes</h1>
//              <p className="mt-2 text-gray-400 text-lg">
//                Está com dúvidas de como fazer o upload? Veja as perguntas mais frequentes.
//              </p>
//            </header>
//
//            {/* Aqui você pode inserir seu componente de Accordion ou FAQ */}
//          </div>
//        </div>
//      </div>
//    </>
//  );
//}

//frontend/src/app/[lang]/upload/page.jsx

//'use client';
//
//import DefaultHeader from '@/components/Recycles/DefaultHeader';
//import Link from 'next/link';
//
//export default function UploadPage() {
//  return (
//    <>
//      <DefaultHeader />
//
//      <div className="relative min-h-[calc(100dvh-80px)] flex-1 bg-grid-virtus-600/[0.2] pt-8 pb-12">
//        <div className="container flex max-w-5xl flex-col items-center gap-24 font-sans text-gray-200 sm:py-6">
//          <div className="w-full space-y-6">
//            <header className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//              <div className="w-full text-left">
//                <Link
//                  href="/pt-br/dashboard"
//                  className="mb-4 flex items-center gap-2 text-secondary text-xs"
//                >
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
//                  </svg>
//                  Voltar para a dashboard
//                </Link>
//                <h1 className="font-bold text-3xl text-white sm:text-4xl">Vamos construir algo novo</h1>
//                <p className="mt-2 text-gray-400 text-lg">Siga as instruções abaixo para enviar sua aplicação.</p>
//              </div>
//
//              <Link
//                href="/pt-br/dashboard/snapshots"
//                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 max-sm:w-full"
//              >
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Z..." />
//                </svg>
//                Importar de uma Snapshot
//              </Link>
//            </header>
//
//            <main className="w-full">
//              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                {/* GitHub Card */}
//                <div className="group relative flex h-70 cursor-pointer flex-col justify-between rounded-xl border border-gray-800 bg-background p-6 transition-all duration-300 hover:border-blue-800">
//                  <div>
//                    <img alt="Github Logo" width={48} height={48} src="/assets/companies/small/github.svg" />
//                  </div>
//                  <div className="space-y-1">
//                    <h2 className="font-semibold text-base text-gray-200 group-hover:text-white sm:text-lg">
//                      Importar projeto diretamente do GitHub
//                    </h2>
//                    <span className="text-secondary text-sm">
//                      Conecte seu repositório do GitHub e importe o código em poucos cliques.
//                    </span>
//                  </div>
//                </div>
//
//                {/* ZIP Card */}
//                <div className="group relative flex h-70 cursor-pointer flex-col justify-between rounded-xl border border-gray-800 bg-background p-6 transition-all duration-300 hover:border-blue-800">
//                  <div>
//                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256">
//                      <path d="M224,48H32A16,16,0,0,0,16,64V88a16,16,0,0,0,16,16v88a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Z..." />
//                    </svg>
//                  </div>
//                  <div className="space-y-1">
//                    <h2 className="font-semibold text-base text-gray-200 group-hover:text-white sm:text-lg">
//                      Enviar projeto a partir de um arquivo ZIP
//                    </h2>
//                    <span className="text-secondary text-sm">
//                      Faça upload de um arquivo .zip contendo o seu projeto já preparado.
//                    </span>
//                  </div>
//                </div>
//              </div>
//            </main>
//          </div>
//        </div>
//      </div>
//
//      {/* FAQ Section */}
//      <div className="bg-background py-48">
//        <div className="container relative z-10 w-full py-24">
//          <div className="mx-auto max-w-4xl space-y-16">
//            <header className="w-full max-w-5xl text-center">
//              <h1 className="font-bold text-3xl text-white sm:text-4xl">Perguntas frequentes</h1>
//              <p className="mt-2 text-gray-400 text-lg">
//                Está com dúvidas de como fazer o upload? Veja as perguntas mais frequentes.
//              </p>
//            </header>
//
//            {/* Aqui você pode inserir seu componente de Accordion ou FAQ */}
//          </div>
//        </div>
//      </div>
//    </>
//  );
//}

//frontend/src/app/[lang]/upload/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import UploadForm from "../../../components/UploadForm";
//import { messages } from './messages';
//import '../../styles/globais.css'; // ✅ Estilos globais aplicados
//import { hasPermission } from '@/utils/permissions'; // ← novo import
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function UploadPage() {
//  const pathname = usePathname();
//  const router = useRouter();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//  const [status, setStatus] = useState("");
//  const [loading, setLoading] = useState(true); // ← novo estado
//  const [username, setUsername] = useState("");
//  const [role, setRole] = useState("");
//  //const [canDeploy] = useState(true);
//  //const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//
//  // ✅ Verifica se o usuário está logado
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//        const data = await res.json();
//
//        if (!data.username || !data.role || !hasPermission(data.role, 'upload')) {
//          router.replace(`/${lang}/`);
//          return;
//        }
//
//        setUsername(data.username);
//        setRole(data.role);
//        setLoading(false);
//      } catch {
//        router.replace(`/${lang}/`);
//      }
//    };
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
//  //// ⏳ Enquanto verifica sessão, não renderiza nada
//  //useEffect(() => {
//  //  if (!loading && canDeploy && showUpgradeModal) {
//  //    setShowUpgradeModal(false);
//  //    setStatus("");
//  //  }
//  //}, [loading, canDeploy, showUpgradeModal]);
//
//  //if (loading) return null;
//
//  return (
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6">
//
//        <h1 className="text-2xl font-bold text-center">{dict.title}</h1>
//        <p className="text-sm text-gray-400 text-center">{dict.description}</p>
//
//        {/* 📤 Formulário de upload com textos localizados */}
//        <UploadForm
//          buttonText={dict.submitLabel}
//          successMessage={dict.success}
//        />
//
//        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//          <a href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</a>
//          <a href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</a>
//        </div>
//
//        <div className="flex justify-center mt-6">
//          <img src="/cloudflare-logo.png" alt="Cloudflare" width={100} height={24} />
//        </div>
//
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/dashboard/upload/page.jsx

//'use client';
//
//import { useEffect } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import UploadForm from "../../../../components/UploadForm";
//import { messages } from './messages';
////import '../../../styles/globais.css'; // ✅ Estilos globais aplicados
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function UploadPage() {
//  const pathname = usePathname();
//  const router = useRouter();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  // ✅ Verifica se o usuário está logado
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      }
//    };
//    checkSession();
//  }, []);
//
//  return (
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6">
//
//        <h1 className="text-2xl font-bold text-center">{dict.title}</h1>
//        <p className="text-sm text-gray-400 text-center">{dict.description}</p>
//
//        {/* 📤 Formulário de upload com textos localizados */}
//        <UploadForm
//          buttonText={dict.submitLabel}
//          successMessage={dict.success}
//        />
//
//        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//          <a href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</a>
//          <a href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</a>
//        </div>
//
//        <div className="flex justify-center mt-6">
//          <img src="/cloudflare-logo.png" alt="Cloudflare" width={100} height={24} />
//        </div>
//
//      </div>
//    </main>
//  );
//}

// USA A LÓGICA DE RENDERIZAR PARA A P´GINA INICIAL

//'use client';
//
//import { useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import UploadForm from "../../../../components/UploadForm";
//import { messages } from './messages';
//import { useSessionGuard } from '@/hooks/useSessionGuard';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function UploadPage() {
//  const pathname = usePathname();
//  const router = useRouter();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [loading, setLoading] = useState(true);
//  const [username, setUsername] = useState('');
//  const [role, setRole] = useState('');
//
//  useSessionGuard({
//    lang,
//    permission: 'upload',
//    redirectTo: `/${lang}/`, // ← visitante será redirecionado
//    onValidSession: ({ username, role }) => {
//      setUsername(username);
//      setRole(role);
//      setLoading(false);
//    },
//  });
//
//  if (loading) return null;
//
//  return (
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6">
//        <h1 className="text-2xl font-bold text-center">{dict.title}</h1>
//        <p className="text-sm text-gray-400 text-center">{dict.description}</p>
//
//        <UploadForm
//          buttonText={dict.submitLabel}
//          successMessage={dict.success}
//        />
//
//        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//          <a href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</a>
//          <a href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</a>
//        </div>
//
//        <div className="flex justify-center mt-6">
//          <img src="/cloudflare-logo.png" alt="Cloudflare" width={100} height={24} />
//        </div>
//      </div>
//    </main>
//  );
//}

// REDIRECIONA USUÁRIO LOGADO PARA DASHBOARD

//'use client';
//
//import { useGuestGuard } from '@/hooks/useGuestGuard';
//import { usePathname } from 'next/navigation';
//import UploadForm from "../../../../components/UploadForm";
//import { messages } from './messages';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function UploadPage() {
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  useGuestGuard({ lang, redirectTo: `/${lang}/dashboard` });
//
//  return (
//    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
//      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl space-y-6">
//        <h1 className="text-2xl font-bold text-center">{dict.title}</h1>
//        <p className="text-sm text-gray-400 text-center">{dict.description}</p>
//
//        <UploadForm
//          buttonText={dict.submitLabel}
//          successMessage={dict.success}
//        />
//
//        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
//          <a href={`/${lang}/privacy`} className="hover:text-white">{dict.privacy}</a>
//          <a href={`/${lang}/terms`} className="hover:text-white">{dict.terms}</a>
//        </div>
//
//        <div className="flex justify-center mt-6">
//          <img src="/cloudflare-logo.png" alt="Cloudflare" width={100} height={24} />
//        </div>
//      </div>
//    </main>
//  );
//}

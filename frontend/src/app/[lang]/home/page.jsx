//frontend/src/app/[lang]/home/page.jsx -> Home Page

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { messages } from '@/app/[lang]/messages/home/section1';
import Section1 from '@/components/sections/home/section1';
import Section2 from '@/components/sections/home/section2';
import Section3 from '@/components/sections/home/section3';
import Section4 from '@/components/sections/home/section4';
import Section5 from '@/components/sections/home/section5';
import Section6 from '@/components/sections/home/section6';
import Section7 from '@/components/sections/home/section7';
import Header from '@/components/Recycles/Header';
import Footer from '@/components/Recycles/Footer';
import '../../styles/virtus.css';

function getLangFromPath(pathname) {
    const segment = pathname?.split('/')[1]?.toLowerCase() || '';
    const supported = Object.keys(messages);
    return supported.includes(segment) ? segment : 'pt-br';
}

export default function HomePage() {
    const pathname = usePathname();
    const router = useRouter();
    const lang = getLangFromPath(pathname);
    //const dict = messages[lang];
    

    const [username, setUsername] = useState(null);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
                const data = await res.json();

                if (data?.username) {
                    setUsername(data.username);
                }
            } catch {
                // Sessão inválida ou erro de rede — ignora
            }
        };

        checkSession();
    }, []);

    return (
        <>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="w-full bg-background ">

                    {/* Seção 1: Hero */}
                    <Section1 lang={lang} username={username} />

                    {/* Seção 2: Tecnologias suportadas */}
                    <Section2 />

                    {/* Seção 3: Bots e recursos */}
                    <Section3 />
                    {/* Seção 4: Hospedagem de Sites */}
                    <Section4 />
                    {/* Seção 5: Armazenamento de Blobs */}
                    <Section5 />
                    {/* Seção 6: Recursos da plataforma  */}
                    <Section6 />
                    {/* Seção 7: Infraestrutura empresarial */}
                    <Section7 />
                    {/* Seção 8: Sessão extra com CEO */}

                    <Footer />
                </main>
            </div>
        </>
    );
}

//frontend/src/app/[lang]/home/page.jsx -> Home Page

//'use client';
//
//import { useEffect, useState } from 'react';
//import { usePathname, useRouter } from 'next/navigation';
//import Header from '@/components/Recycles/Header';
//import Link from 'next/link';
//import '../../styles/virtus.css';
//import { PlanOrDashboardButton } from '@/components/PlanOrDashboardButton';
//
//const messages = {
//  'pt-br': {
//    slogan: 'sua plataforma completa',
//    description:
//      'Potencialize sua presença online com o poder da Virtus Cloud, sua hospedagem definitiva para bots e sites! Transforme seu sonho em realidade com segurança, privacidade e suporte premium excepcional.',
//    plans: 'Confira nossos planos',
//    dashboard: 'Ir para o painel',
//    about: 'Saiba mais',
//  },
//  en: {
//    slogan: 'your complete platform',
//    description:
//      'Boost your online presence with the power of Virtus Cloud, your ultimate hosting solution for bots and websites! Make your dream come true with security, privacy, and exceptional premium support.',
//    plans: 'View our plans',
//    dashboard: 'Go to dashboard',
//    about: 'Learn more',
//  },
//  es: {
//    slogan: 'tu plataforma completa',
//    description:
//      'Impulsa tu presencia online con el poder de Virtus Cloud, tu solución definitiva de alojamiento para bots y sitios web. Haz realidad tu sueño con seguridad, privacidad y soporte premium excepcional.',
//    plans: 'Consulta nuestros planes',
//    dashboard: 'Ir al panel',
//    about: 'Saber más',
//  },
//  zh: {
//    slogan: '您的完整平台',
//    description:
//      '通过 Virtus Cloud 提升您的线上影响力，这是针对网站与机器人的终极托管方案。享受卓越支持、隐私保护与安全性能，助您梦想成真。',
//    plans: '查看方案',
//    dashboard: '进入面板',
//    about: '了解更多',
//  },
//};
//
//function getLangFromPath(pathname) {
//  const segment = pathname?.split('/')[1]?.toLowerCase() || '';
//  const supported = Object.keys(messages);
//  return supported.includes(segment) ? segment : 'pt-br';
//}
//
//export default function HomePage() {
//  const pathname = usePathname();
//  const router = useRouter();
//  const lang = getLangFromPath(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState(null);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//        const data = await res.json();
//
//        if (data?.username) {
//          setUsername(data.username);
//        }
//      } catch {
//        // Sessão inválida ou erro de rede — ignora
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  return (
//  <>
//    <Header />
//    <main className="w-full bg-background bg-grid-virtus-600/[0.375]">
//      
//      {/* Seção 1: Hero */}
//      <section
//        id="main"
//        className="relative h-[max(500px,calc(100dvh-80px))] max-h-[900px] rounded-4xl px-4 py-16 sm:mx-4 sm:px-6 sm:py-36 flex items-center justify-center"
//      >
//        <div className="-mt-6 flex h-full select-none flex-col items-center justify-center text-center">
//          <div className="max-w-2xl lg:max-w-5xl">
//            <h1
//              translate="no"
//              className="font-extrabold text-5xl text-primary leading-snug tracking-tight max-sm:mt-4 sm:text-6xl md:text-8xl motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-150"
//            >
//              Virtus Cloud
//            </h1>
//            <h2 className="bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-600 bg-clip-text text-transparent font-extrabold text-4xl tracking-tight sm:text-4xl md:text-6xl motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-300">
//              {dict.slogan}
//            </h2>
//            <p className="my-6 font-medium text-base text-secondary sm:mx-auto lg:mx-0 motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-450">
//              {dict.description}
//            </p>
//          </div>
//
//          <div className="grid justify-center gap-4 py-0.5 sm:grid-cols-2 motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-600">
//            <button
//              onClick={() => router.push(`/${lang}/pricing`)}
//              className="group relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
//            >
//              <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//                <PlanOrDashboardButton dict={dict} username={username} />
//              </span>
//              <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                </svg>
//              </div>
//            </button>
//
//            <a
//              href="https://localhost:3000/about"
//              target="_blank"
//              role="button"
//              aria-label="Acessar a documentação"
//              className="group relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4"
//            >
//              <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//                {dict.about}
//              </span>
//              <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//                </svg>
//              </div>
//            </a>
//          </div>
//        </div>
//      </section>
//
//      {/* Seção 2: Tecnologias suportadas */}
//      <section className="w-full bg-background bg-virtus-900 py-16">
//        <div className="container flex flex-col items-center justify-center px-4 sm:px-6">
//          <div className="mb-6 flex flex-col items-center justify-center text-center">
//            <h2 className="font-bold text-4xl lg:tracking-tight">
//              Apoie seu desenvolvimento com flexibilidade e potência
//            </h2>
//            <p className="mt-4 max-w-3xl text-base text-secondary">
//              Com suporte para as principais tecnologias, como Java, JavaScript, PHP, Elixir, Ruby on Rails e muito mais, nossa hospedagem garante a compatibilidade e a performance que você precisa para criar projetos incríveis.
//            </p>
//          </div>
//
//          <div className="flex max-w-4xl flex-wrap items-center justify-center gap-2.5">
//            {[
//              'python', 'typescript', 'javascript', 'go', 'java', 'csharp', 'rust', 'php',
//              'kotlin', 'elixir', 'dotnetcore', 'spring', 'react', 'nextjs', 'vuejs',
//              'angularjs', 'nestjs', 'laravel', 'django'
//            ].map((lang) => (
//              <div key={lang} className="flex h-18 w-18 flex-col items-center justify-center gap-2 rounded-xl border border-border-secondary px-2 py-4">
//                <div className="block rounded-md duration-300 hover:opacity-100">
//                  <img
//                    alt={`${lang} Icon`}
//                    width={32}
//                    height={32}
//                    loading="lazy"
//                    decoding="async"
//                    className="rounded-md"
//                    src={`/assets/languages/${lang}.svg`}
//                    style={{ color: 'transparent' }}
//                  />
//                </div>
//              </div>
//            ))}
//          </div>
//
//          <span className="mt-6 text-center font-bold text-base text-secondary uppercase">
//            Confiado por milhares de desenvolvedores
//          </span>
//        </div>
//      </section>
//
//            {/* Seção 3: Bots e recursos */}
//      <section className="container relative my-24 px-4 sm:my-48 sm:px-6">
//        <div className="flex flex-col lg:flex-row justify-between gap-12">
//          
//          {/* Conteúdo textual e botão */}
//          <div className="flex flex-col gap-4 max-w-2xl">
//            <div className="flex items-center gap-3">
//              <div className="flex items-center gap-2 text-blue-500">
//                <img src="/assets/logo.jpg" alt="Virtus Cloud Logo" width={16} height={16} />
//                <span className="font-medium">Bots</span>
//              </div>
//              <span className="text-virtus-400 text-xs">|</span>
//              <span className="font-normal text-blue-500">Virtus Cloud</span>
//            </div>
//
//            <div className="space-y-1">
//              <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl leading-tight">
//                Hospede seu{" "}
//                <span className="text-blue-500">WhatsApp</span> bot.
//              </h2>
//              <h2 className="max-w-lg text-secondary">
//                Eleve sua hospedagem de bots com a plataforma líder da América Latina. Nossa solução garante desempenho e confiabilidade inigualáveis, proporcionando hospedagem sem esforço e de alta qualidade para todas as suas necessidades de bots. Escolha-nos para obter o melhor em hospedagem de bots de ponta.
//              </h2>
//            </div>
//
//            <a
//              href="/pt-br/bots"
//              className="group relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4"
//            >
//              <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//                Explore mais
//              </span>
//              <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//                </svg>
//              </div>
//            </a>
//
//            <div className="mt-6 flex flex-col gap-4 md:flex-row">
//              <div className="flex-1 space-y-2 rounded-md border border-virtus-700 p-4 md:max-w-60">
//                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500">
//                  <path d="M101.85,191.14C97.34,201,82.29,224,40,224a8,8,0,0,1-8-8c0-42.29,23-57.34,32.86-61.85a8,8,0,0,1,6.64,14.56c-6.43,2.93-20.62,12.36-23.12,38.91,26.55-2.5,36-16.69,38.91-23.12a8,8,0,1,1,14.56,6.64Zm122-144a16,16,0,0,0-15-15c-12.58-.75-44.73.4-71.4,27.07h0L88,108.7A8,8,0,0,1,76.67,97.39l26.56-26.57A4,4,0,0,0,100.41,64H74.35A15.9,15.9,0,0,0,63,68.68L28.7,103a16,16,0,0,0,9.07,27.16l38.47,5.37,44.21,44.21,5.37,38.49a15.94,15.94,0,0,0,10.78,12.92,16.11,16.11,0,0,0,5.1.83A15.91,15.91,0,0,0,153,227.3L187.32,193A16,16,0,0,0,192,181.65V155.59a4,4,0,0,0-6.83-2.82l-26.57,26.56a8,8,0,0,1-11.71-.42,8.2,8.2,0,0,1,.6-11.1l49.27-49.27h0C223.45,91.86,224.6,59.71,223.85,47.12Z" />
//                </svg>
//                <div>
//                  <h2 className="font-semibold">Dinâmico</h2>
//                  <span className="text-secondary text-sm">
//                    Oferecemos um serviço de hospedagem de bots dinâmico e inteligente com uma ampla variedade de endereços IP públicos para garantir a operação ininterrupta do bot.
//                  </span>
//                </div>
//              </div>
//
//              <div className="flex-1 space-y-2 rounded-md border border-virtus-700 p-4 md:max-w-60">
//                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500">
//                  <path d="M128,40a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,40Zm45.66,61.66-40,40a8,8,0,0,1-11.32-11.32l40-40a8,8,0,0,1,11.32,11.32ZM96,16a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,16Z" />
//                </svg>
//                <div>
//                  <h2 className="font-semibold">24/7 Uptime</h2>
//                  <span className="text-secondary text-sm">
//                    Reinicie automaticamente seu projeto se ele ficar off-line devido a erros de código, graças à nossa tecnologia exclusiva de reinicialização automática.
//                  </span>
//                </div>
//              </div>
//            </div>
//          </div>
//
//          {/* Imagem ilustrativa */}
//          <div className="hidden lg:flex items-center">
//            <img src="/undraw/services/bots.svg" alt="Bots" width={400} height={400} />
//          </div>
//        </div>
//              </section>
//      </main>
//    </>
//  );
//}

//frontend/src/app/[lang]/home/page.jsx -> Home Page

//'use client';
//
//import { usePathname, useRouter } from 'next/navigation';
//import Header from '@/components/Header';
//import Link from 'next/link';
//import '../../styles/virtus.css';
//import { PlanOrDashboardButton } from '@/components/PlanOrDashboardButton';
//
//
//const messages = {
//  'pt-br': {
//    slogan: 'sua plataforma completa',
//    description:
//      'Potencialize sua presença online com o poder da Virtus Cloud, sua hospedagem definitiva para bots e sites! Transforme seu sonho em realidade com segurança, privacidade e suporte premium excepcional.',
//    plans: 'Confira nossos planos',
//    about: 'Saiba mais',
//  },
//  en: {
//    slogan: 'your complete platform',
//    description:
//      'Boost your online presence with the power of Virtus Cloud, your ultimate hosting solution for bots and websites! Make your dream come true with security, privacy, and exceptional premium support.',
//    plans: 'View our plans',
//    about: 'Learn more',
//  },
//  es: {
//    slogan: 'tu plataforma completa',
//    description:
//      'Impulsa tu presencia online con el poder de Virtus Cloud, tu solución definitiva de alojamiento para bots y sitios web. Haz realidad tu sueño con seguridad, privacidad y soporte premium excepcional.',
//    plans: 'Consulta nuestros planes',
//    about: 'Saber más',
//  },
//  zh: {
//    slogan: '您的完整平台',
//    description:
//      '通过 Virtus Cloud 提升您的线上影响力，这是针对网站与机器人的终极托管方案。享受卓越支持、隐私保护与安全性能，助您梦想成真。',
//    plans: '查看方案',
//    about: '了解更多',
//  },
//};
//
//function getLangFromPath(pathname) {
//  const segment = pathname?.split('/')[1]?.toLowerCase() || '';
//  const supported = Object.keys(messages);
//  return supported.includes(segment) ? segment : 'pt-br';
//}
//
//export default function HomePage() {
//  const pathname = usePathname();
//  const router = useRouter();
//  const lang = getLangFromPath(pathname);
//  const dict = messages[lang];
//
//  return (
//  <>
//    <Header />
//    <main className="w-full bg-background bg-grid-virtus-600/[0.375]">
//      
//      {/* Seção 1: Hero */}
//      <section
//        id="main"
//        className="relative h-[max(500px,calc(100dvh-80px))] max-h-[900px] rounded-4xl px-4 py-16 sm:mx-4 sm:px-6 sm:py-36 flex items-center justify-center"
//      >
//        <div className="-mt-6 flex h-full select-none flex-col items-center justify-center text-center">
//          <div className="max-w-2xl lg:max-w-5xl">
//            <h1
//              translate="no"
//              className="font-extrabold text-5xl text-primary leading-snug tracking-tight max-sm:mt-4 sm:text-6xl md:text-8xl motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-150"
//            >
//              Virtus Cloud
//            </h1>
//            <h2 className="bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-600 bg-clip-text text-transparent font-extrabold text-4xl tracking-tight sm:text-4xl md:text-6xl motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-300">
//              {dict.slogan}
//            </h2>
//            <p className="my-6 font-medium text-base text-secondary sm:mx-auto lg:mx-0 motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-450">
//              {dict.description}
//            </p>
//          </div>
//
//          <div className="grid justify-center gap-4 py-0.5 sm:grid-cols-2 motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-600">
//            <button
//              onClick={() => router.push(`/${lang}/pricing`)}
//              className="group relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
//            >
//              <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//                {dict.plans}
//              </span>
//              <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                </svg>
//              </div>
//            </button>
//
//            <a
//              href="https://localhost:3000/about"
//              target="_blank"
//              role="button"
//              aria-label="Acessar a documentação"
//              className="group relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4"
//            >
//              <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//                {dict.about}
//              </span>
//              <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//                </svg>
//              </div>
//            </a>
//          </div>
//        </div>
//      </section>
//
//      {/* Seção 2: Tecnologias suportadas */}
//      <section className="w-full bg-background bg-virtus-900 py-16">
//        <div className="container flex flex-col items-center justify-center px-4 sm:px-6">
//          <div className="mb-6 flex flex-col items-center justify-center text-center">
//            <h2 className="font-bold text-4xl lg:tracking-tight">
//              Apoie seu desenvolvimento com flexibilidade e potência
//            </h2>
//            <p className="mt-4 max-w-3xl text-base text-secondary">
//              Com suporte para as principais tecnologias, como Java, JavaScript, PHP, Elixir, Ruby on Rails e muito mais, nossa hospedagem garante a compatibilidade e a performance que você precisa para criar projetos incríveis.
//            </p>
//          </div>
//
//          <div className="flex max-w-4xl flex-wrap items-center justify-center gap-2.5">
//            {[
//              'python', 'typescript', 'javascript', 'go', 'java', 'csharp', 'rust', 'php',
//              'kotlin', 'elixir', 'dotnetcore', 'spring', 'react', 'nextjs', 'vuejs',
//              'angularjs', 'nestjs', 'laravel', 'django'
//            ].map((lang) => (
//              <div key={lang} className="flex h-18 w-18 flex-col items-center justify-center gap-2 rounded-xl border border-border-secondary px-2 py-4">
//                <div className="block rounded-md duration-300 hover:opacity-100">
//                  <img
//                    alt={`${lang} Icon`}
//                    width={32}
//                    height={32}
//                    loading="lazy"
//                    decoding="async"
//                    className="rounded-md"
//                    src={`/assets/languages/${lang}.svg`}
//                    style={{ color: 'transparent' }}
//                  />
//                </div>
//              </div>
//            ))}
//          </div>
//
//          <span className="mt-6 text-center font-bold text-base text-secondary uppercase">
//            Confiado por milhares de desenvolvedores
//          </span>
//        </div>
//      </section>
//
//            {/* Seção 3: Bots e recursos */}
//      <section className="container relative my-24 px-4 sm:my-48 sm:px-6">
//        <div className="flex flex-col lg:flex-row justify-between gap-12">
//          
//          {/* Conteúdo textual e botão */}
//          <div className="flex flex-col gap-4 max-w-2xl">
//            <div className="flex items-center gap-3">
//              <div className="flex items-center gap-2 text-blue-500">
//                <img src="/assets/logo.svg" alt="Virtus Cloud Logo" width={16} height={16} />
//                <span className="font-medium">Bots</span>
//              </div>
//              <span className="text-virtus-400 text-xs">|</span>
//              <span className="font-normal text-blue-500">Virtus Cloud</span>
//            </div>
//
//            <div className="space-y-1">
//              <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl leading-tight">
//                Hospede seu{" "}
//                <span className="text-blue-500">WhatsApp</span> bot.
//              </h2>
//              <h2 className="max-w-lg text-secondary">
//                Eleve sua hospedagem de bots com a plataforma líder da América Latina. Nossa solução garante desempenho e confiabilidade inigualáveis, proporcionando hospedagem sem esforço e de alta qualidade para todas as suas necessidades de bots. Escolha-nos para obter o melhor em hospedagem de bots de ponta.
//              </h2>
//            </div>
//
//            <a
//              href="/pt-br/bots"
//              className="group relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4"
//            >
//              <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//                Explore mais
//              </span>
//              <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//                </svg>
//              </div>
//            </a>
//
//            <div className="mt-6 flex flex-col gap-4 md:flex-row">
//              <div className="flex-1 space-y-2 rounded-md border border-virtus-700 p-4 md:max-w-60">
//                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500">
//                  <path d="M101.85,191.14C97.34,201,82.29,224,40,224a8,8,0,0,1-8-8c0-42.29,23-57.34,32.86-61.85a8,8,0,0,1,6.64,14.56c-6.43,2.93-20.62,12.36-23.12,38.91,26.55-2.5,36-16.69,38.91-23.12a8,8,0,1,1,14.56,6.64Zm122-144a16,16,0,0,0-15-15c-12.58-.75-44.73.4-71.4,27.07h0L88,108.7A8,8,0,0,1,76.67,97.39l26.56-26.57A4,4,0,0,0,100.41,64H74.35A15.9,15.9,0,0,0,63,68.68L28.7,103a16,16,0,0,0,9.07,27.16l38.47,5.37,44.21,44.21,5.37,38.49a15.94,15.94,0,0,0,10.78,12.92,16.11,16.11,0,0,0,5.1.83A15.91,15.91,0,0,0,153,227.3L187.32,193A16,16,0,0,0,192,181.65V155.59a4,4,0,0,0-6.83-2.82l-26.57,26.56a8,8,0,0,1-11.71-.42,8.2,8.2,0,0,1,.6-11.1l49.27-49.27h0C223.45,91.86,224.6,59.71,223.85,47.12Z" />
//                </svg>
//                <div>
//                  <h2 className="font-semibold">Dinâmico</h2>
//                  <span className="text-secondary text-sm">
//                    Oferecemos um serviço de hospedagem de bots dinâmico e inteligente com uma ampla variedade de endereços IP públicos para garantir a operação ininterrupta do bot.
//                  </span>
//                </div>
//              </div>
//
//              <div className="flex-1 space-y-2 rounded-md border border-virtus-700 p-4 md:max-w-60">
//                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500">
//                  <path d="M128,40a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,40Zm45.66,61.66-40,40a8,8,0,0,1-11.32-11.32l40-40a8,8,0,0,1,11.32,11.32ZM96,16a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,16Z" />
//                </svg>
//                <div>
//                  <h2 className="font-semibold">24/7 Uptime</h2>
//                  <span className="text-secondary text-sm">
//                    Reinicie automaticamente seu projeto se ele ficar off-line devido a erros de código, graças à nossa tecnologia exclusiva de reinicialização automática.
//                  </span>
//                </div>
//              </div>
//            </div>
//          </div>
//
//          {/* Imagem ilustrativa */}
//          <div className="hidden lg:flex items-center">
//            <img src="/undraw/services/bots.svg" alt="Bots" width={400} height={400} />
//          </div>
//        </div>
//              </section>
//      </main>
//    </>
//  );
//}

//frontend/src/app/[lang]/home/page.jsx -> Home Page

//'use client';
//
//import { usePathname, useRouter } from 'next/navigation';
//import Header from '@/components/Header';
//import Link from 'next/link';
//import '../../styles/virtus.css';
//
//const messages = {
//  'pt-br': {
//    slogan: 'sua plataforma completa',
//    description:
//      'Potencialize sua presença online com o poder da Virtus Cloud, sua hospedagem definitiva para bots e sites! Transforme seu sonho em realidade com segurança, privacidade e suporte premium excepcional.',
//    plans: 'Confira nossos planos',
//    about: 'Saiba mais',
//  },
//  en: {
//    slogan: 'your complete platform',
//    description:
//      'Boost your online presence with the power of Virtus Cloud, your ultimate hosting solution for bots and websites! Make your dream come true with security, privacy, and exceptional premium support.',
//    plans: 'View our plans',
//    about: 'Learn more',
//  },
//  es: {
//    slogan: 'tu plataforma completa',
//    description:
//      'Impulsa tu presencia online con el poder de Virtus Cloud, tu solución definitiva de alojamiento para bots y sitios web. Haz realidad tu sueño con seguridad, privacidad y soporte premium excepcional.',
//    plans: 'Consulta nuestros planes',
//    about: 'Saber más',
//  },
//  zh: {
//    slogan: '您的完整平台',
//    description:
//      '通过 Virtus Cloud 提升您的线上影响力，这是针对网站与机器人的终极托管方案。享受卓越支持、隐私保护与安全性能，助您梦想成真。',
//    plans: '查看方案',
//    about: '了解更多',
//  },
//};
//
//function getLangFromPath(pathname) {
//  const segment = pathname?.split('/')[1]?.toLowerCase() || '';
//  const supported = Object.keys(messages);
//  return supported.includes(segment) ? segment : 'pt-br';
//}
//
//export default function HomePage() {
//  const pathname = usePathname();
//  const router = useRouter();
//  const lang = getLangFromPath(pathname);
//  const dict = messages[lang];
//
//  return (
//    <>
//      <Header />
//      <main className="pt-24 min-h-screen w-full bg-background bg-grid-virtus-600/[0.375] flex items-center justify-center">
//        <section
//          id="main"
//          className="relative h-[max(500px,calc(100dvh-80px))] max-h-[900px] overflow-hidden rounded-4xl px-4 py-16 sm:mx-4 sm:px-6 sm:py-36 flex items-center justify-center"
//        >
//          <div className="-mt-6 flex h-full select-none flex-col items-center justify-center text-center">
//            <div className="max-w-2xl lg:max-w-5xl">
//              <h1
//                translate="no"
//                className="font-extrabold text-5xl text-primary leading-snug tracking-tight max-sm:mt-4 sm:text-6xl md:text-8xl motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-150"
//              >
//                Virtus Cloud
//              </h1>
//              <h2 className="bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-600 bg-clip-text text-transparent font-extrabold text-4xl tracking-tight sm:text-4xl md:text-6xl motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-300">
//                {dict.slogan}
//              </h2>
//              <p className="my-6 font-medium text-base text-secondary sm:mx-auto lg:mx-0 motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-450">
//                {dict.description}
//              </p>
//            </div>
//
//            <div className="grid justify-center gap-4 py-0.5 sm:grid-cols-2 motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-600">
//              <button
//                onClick={() => router.push(`/${lang}/pricing`)}
//                className="group relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
//              >
//                <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//                  {dict.plans}
//                </span>
//                <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                  </svg>
//                </div>
//              </button>
//
//              <a
//                href="https://localhost:3000/about"
//                target="_blank"
//                role="button"
//                aria-label="Acessar a documentação"
//                className="group relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4"
//              >
//                <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//                  {dict.about}
//                </span>
//                <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//                  </svg>
//                </div>
//              </a>
//            </div>
//          </div>
//        </section>
//        {/* Seção de tecnologias suportadas */}
//        <section className="bg-virtus-900">
//          <div className="container flex flex-col items-center justify-center px-4 py-12 sm:px-6">
//            <div className="mb-6 flex flex-col items-center justify-center text-center">
//              <h2 className="font-bold text-4xl lg:tracking-tight">
//                Apoie seu desenvolvimento com flexibilidade e potência
//              </h2>
//              <p className="mt-4 max-w-3xl text-base text-secondary">
//                Com suporte para as principais tecnologias, como Java, JavaScript, PHP, Elixir, Ruby on Rails e muito mais, nossa hospedagem garante a compatibilidade e a performance que você precisa para criar projetos incríveis.
//              </p>
//            </div>
//
//            <div className="flex max-w-4xl flex-wrap items-center justify-center gap-2.5">
//              {[
//                'python', 'typescript', 'javascript', 'go', 'java', 'csharp', 'rust', 'php',
//                'kotlin', 'elixir', 'dotnetcore', 'spring', 'react', 'nextjs', 'vuejs',
//                'angularjs', 'nestjs', 'laravel', 'django'
//              ].map((lang) => (
//                <div key={lang} className="flex h-18 w-18 flex-col items-center justify-center gap-2 rounded-xl border border-border-secondary px-2 py-4">
//                  <div className="block rounded-md duration-300 hover:opacity-100">
//                    <img
//                      alt={`${lang} Icon`}
//                      width={32}
//                      height={32}
//                      loading="lazy"
//                      decoding="async"
//                      className="rounded-md"
//                      src={`/assets/languages/${lang}.svg`}
//                      style={{ color: 'transparent' }}
//                    />
//                  </div>
//                </div>
//              ))}
//            </div>
//
//            <span className="mt-6 text-center font-bold text-base text-secondary uppercase">
//              Confiado por milhares de desenvolvedores
//            </span>
//          </div>
//        </section>
//      </main>
//    </>
//  );
//}


//'use client';
//
//import { usePathname, useRouter } from 'next/navigation';
//import Link from 'next/link';
//import '../styles/virtus.css';
//
//const messages = {
//  'pt-br': {
//    banner: 'Conheça o nosso novo serviço de analytics! →',
//    slogan: 'sua plataforma completa',
//    description:
//      'Potencialize sua presença online com o poder da Virtus Cloud, sua hospedagem definitiva para bots e sites! Transforme seu sonho em realidade com segurança, privacidade e suporte premium excepcional.',
//    plans: 'Confira nossos planos',
//    about: 'Saiba mais',
//  },
//  en: {
//    banner: 'Discover our new analytics service! →',
//    slogan: 'your complete platform',
//    description:
//      'Boost your online presence with Virtus Cloud, your ultimate hosting solution for bots and websites! Make your dream real with privacy, security, and premium support.',
//    plans: 'View our plans',
//    about: 'Learn more',
//  },
//  es: {
//    banner: '¡Conoce nuestro nuevo servicio de analytics! →',
//    slogan: 'tu plataforma completa',
//    description:
//      'Impulsa tu presencia en línea con el poder de Virtus Cloud, tu solución definitiva para bots y sitios web. Haz realidad tu sueño con seguridad, privacidad y soporte premium.',
//    plans: 'Consulta nuestros planes',
//    about: 'Saber más',
//  },
//  zh: {
//    banner: '了解我们的全新分析服务！→',
//    slogan: '您的完整平台',
//    description:
//      '通过 Virtus Cloud 提升您的线上影响力，这是针对网站与机器人的终极托管方案。享受卓越支持、隐私保护与安全性能，助您梦想成真。',
//    plans: '查看方案',
//    about: '了解更多',
//  },
//};
//
//function getLangFromPath(pathname) {
//  const segment = pathname?.split('/')[1]?.toLowerCase() || '';
//  const supported = Object.keys(messages);
//  return supported.includes(segment) ? segment : 'pt-br';
//}
//
//export default function HomePage() {
//  const pathname = usePathname();
//  const router = useRouter();
//  const lang = getLangFromPath(pathname);
//  const dict = messages[lang];
//
//  return (
//    <main
//      style={{
//        position: "relative",
//        minHeight: "100vh",
//        width: "100%",
//        display: "flex",
//        alignItems: "center",
//        justifyContent: "center",
//        backgroundColor: "var(--background)",
//        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 32 32%22 width%3D%2232%22 height%3D%2232%22 fill%3D%22none%22 stroke%3D%22color-mix(in oklab%2C %23161a23 37.5%25%2C transparent)%22%3E%3Cpath d%3D%22M0 .5H31.5V32%22%2F%3E%3C%2Fsvg%3E")',
//        color: "var(--foreground)",
//        padding: "2.5rem 1.5rem",
//        overflow: "hidden",
//      }}
//    >
//      {/* Fundo visual */}
//      <div
//        style={{
//          position: "absolute",
//          inset: 0,
//          backgroundImage: "url('/grid.svg')",
//          opacity: 0.1,
//          zIndex: 0,
//        }}
//      />
//
//      {/* Banner fixo no topo */}
//      <div
//        style={{
//          position: "absolute",
//          top: "1.5rem",
//          fontSize: "0.875rem",
//          backgroundColor: "var(--success)",
//          padding: "0.5rem 1rem",
//          borderRadius: "9999px",
//          color: "var(--color-virtus-900)",
//          fontWeight: "600",
//          zIndex: 10,
//        }}
//      >
//        {dict.banner}
//      </div>
//
//      {/* Conteúdo centralizado */}
//      <div
//        style={{
//          textAlign: "center",
//          zIndex: 10,
//          maxWidth: "40rem",
//          animation: "fade-in 1s ease-in-out",
//        }}
//      >
//        <h1
//          style={{
//            fontSize: "4rem",
//            fontWeight: "800",
//            color: "var(--foreground)",
//            letterSpacing: "-0.05em",
//          }}
//        >
//          Virtus Cloud
//        </h1>
//        <h2
//          style={{
//            backgroundImage: "linear-gradient(to right, var(--blue-700), var(--blue-500), var(--cyan-600))",
//            WebkitBackgroundClip: "text",
//            color: "transparent",
//            fontWeight: "800",
//            fontSize: "2rem",
//            marginTop: "0.5rem",
//          }}
//        >
//          {dict.slogan}
//        </h2>
//        <p
//          style={{
//            marginTop: "1.5rem",
//            fontSize: "1.125rem",
//            color: "var(--text-color-muted)",
//          }}
//        >
//          {dict.description}
//        </p>
//
//        {/* Botões com efeito de escala */}
//        <div
//          style={{
//            marginTop: "2rem",
//            display: "flex",
//            gap: "1rem",
//            justifyContent: "center",
//            flexWrap: "wrap",
//          }}
//        >
//          <button
//            onClick={() => router.push(`/${lang}/signin`)}
//            style={{
//              backgroundColor: "var(--blue-600)",
//              color: "white",
//              padding: "0.75rem 1.5rem",
//              borderRadius: "0.5rem",
//              fontSize: "1rem",
//              fontWeight: "600",
//              cursor: "pointer",
//              transition: "transform 0.2s ease",
//            }}
//            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
//            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
//          >
//            {dict.plans}
//          </button>
//
//          <button
//            onClick={() => router.push(`/${lang}/about`)}
//            style={{
//              backgroundColor: "transparent",
//              color: "var(--blue-300)",
//              padding: "0.75rem 1.5rem",
//              borderRadius: "0.5rem",
//              fontSize: "1rem",
//              fontWeight: "600",
//              border: "1px solid var(--blue-300)",
//              cursor: "pointer",
//              transition: "transform 0.2s ease",
//            }}
//            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
//            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
//          >
//            {dict.about}
//          </button>
//        </div>
//
//        {/* Seção extra */}
//        <section style={{
//          marginTop: "4rem",
//          maxWidth: "700px",
//          fontSize: "1rem",
//          color: "var(--text-color-muted)"
//        }}>
//          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
//            Apoie seu desenvolvimento com flexibilidade e potência
//          </h2>
//          <p>
//            Nossa plataforma oferece ferramentas poderosas, desempenho otimizado e um ambiente seguro para você crescer com liberdade. Seja para projetos pessoais ou grandes operações, a Virtus Cloud está pronta para te acompanhar.
//          </p>
//        </section>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/page.jsx -> Home Page

//'use client';
//
//import { usePathname, useRouter } from 'next/navigation';
//import Link from 'next/link';
//import '../styles/virtus.css';
//
//const messages = {
//  'pt-br': {
//    banner: 'Conheça o nosso novo serviço de analytics! →',
//    slogan: 'sua plataforma completa',
//    description:
//      'Potencialize sua presença online com o poder da Virtus Cloud, sua hospedagem definitiva para bots e sites! Transforme seu sonho em realidade com segurança, privacidade e suporte premium excepcional.',
//    plans: 'Confira nossos planos',
//    about: 'Saiba mais',
//  },
//  en: {
//    banner: 'Discover our new analytics service! →',
//    slogan: 'your complete platform',
//    description:
//      'Boost your online presence with Virtus Cloud, your ultimate hosting solution for bots and websites! Make your dream real with privacy, security, and premium support.',
//    plans: 'View our plans',
//    about: 'Learn more',
//  },
//  es: {
//    banner: '¡Conoce nuestro nuevo servicio de analytics! →',
//    slogan: 'tu plataforma completa',
//    description:
//      'Impulsa tu presencia en línea con el poder de Virtus Cloud, tu solución definitiva para bots y sitios web. Haz realidad tu sueño con seguridad, privacidad y soporte premium.',
//    plans: 'Consulta nuestros planes',
//    about: 'Saber más',
//  },
//  zh: {
//    banner: '了解我们的全新分析服务！→',
//    slogan: '您的完整平台',
//    description:
//      '通过 Virtus Cloud 提升您的线上影响力，这是针对网站与机器人的终极托管方案。享受卓越支持、隐私保护与安全性能，助您梦想成真。',
//    plans: '查看方案',
//    about: '了解更多',
//  },
//};
//
//function getLangFromPath(pathname) {
//  const segment = pathname?.split('/')[1]?.toLowerCase() || '';
//  const supported = Object.keys(messages);
//  return supported.includes(segment) ? segment : 'pt-br';
//}
//
//export default function HomePage() {
//  const pathname = usePathname();
//  const router = useRouter();
//  const lang = getLangFromPath(pathname);
//  const dict = messages[lang];
//
//  return (
//    <main
//      style={{
//        position: "relative",
//        minHeight: "100vh",
//        width: "100%",
//        display: "flex",
//        alignItems: "center",
//        justifyContent: "center",
//        backgroundColor: "var(--background)",
//        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 32 32%22 width%3D%2232%22 height%3D%2232%22 fill%3D%22none%22 stroke%3D%22color-mix(in oklab%2C %23161a23 37.5%25%2C transparent)%22%3E%3Cpath d%3D%22M0 .5H31.5V32%22%2F%3E%3C%2Fsvg%3E")',
//        color: "var(--foreground)",
//        padding: "2.5rem 1.5rem",
//        overflow: "hidden",
//      }}
//    >
//      {/* Fundo visual */}
//      <div
//        style={{
//          position: "absolute",
//          inset: 0,
//          backgroundImage: "url('/grid.svg')",
//          opacity: 0.1,
//          zIndex: 0,
//        }}
//      />
//
//      {/* Banner fixo no topo */}
//      <div
//        style={{
//          position: "absolute",
//          top: "1.5rem",
//          fontSize: "0.875rem",
//          backgroundColor: "var(--success)",
//          padding: "0.5rem 1rem",
//          borderRadius: "9999px",
//          color: "var(--color-virtus-900)",
//          fontWeight: "600",
//          zIndex: 10,
//        }}
//      >
//        {dict.banner}
//      </div>
//
//      {/* Conteúdo centralizado */}
//      <div
//        style={{
//          textAlign: "center",
//          zIndex: 10,
//          maxWidth: "40rem",
//          animation: "fade-in 1s ease-in-out",
//        }}
//      >
//        <h1
//          style={{
//            fontSize: "4rem",
//            fontWeight: "800",
//            color: "var(--foreground)",
//            letterSpacing: "-0.05em",
//          }}
//        >
//          Virtus Cloud
//        </h1>
//        <h2
//          style={{
//            backgroundImage: "linear-gradient(to right, var(--blue-700), var(--blue-500), var(--cyan-600))",
//            WebkitBackgroundClip: "text",
//            color: "transparent",
//            fontWeight: "800",
//            fontSize: "2rem",
//            marginTop: "0.5rem",
//          }}
//        >
//          {dict.slogan}
//        </h2>
//        <p
//          style={{
//            marginTop: "1.5rem",
//            fontSize: "1.125rem",
//            color: "var(--text-color-muted)",
//          }}
//        >
//          {dict.description}
//        </p>
//
//        {/* Botões com efeito de escala */}
//        <div
//          style={{
//            marginTop: "2rem",
//            display: "flex",
//            gap: "1rem",
//            justifyContent: "center",
//            flexWrap: "wrap",
//          }}
//        >
//          <button
//            onClick={() => router.push(`/${lang}/signin`)}
//            style={{
//              backgroundColor: "var(--blue-600)",
//              color: "white",
//              padding: "0.75rem 1.5rem",
//              borderRadius: "0.5rem",
//              fontSize: "1rem",
//              fontWeight: "600",
//              cursor: "pointer",
//              transition: "transform 0.2s ease",
//            }}
//            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
//            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
//          >
//            {dict.plans}
//          </button>
//
//          <button
//            onClick={() => router.push(`/${lang}/about`)}
//            style={{
//              backgroundColor: "transparent",
//              color: "var(--blue-300)",
//              padding: "0.75rem 1.5rem",
//              borderRadius: "0.5rem",
//              fontSize: "1rem",
//              fontWeight: "600",
//              border: "1px solid var(--blue-300)",
//              cursor: "pointer",
//              transition: "transform 0.2s ease",
//            }}
//            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
//            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
//          >
//            {dict.about}
//          </button>
//        </div>
//
//        {/* Seção extra */}
//        <section style={{
//          marginTop: "4rem",
//          maxWidth: "700px",
//          fontSize: "1rem",
//          color: "var(--text-color-muted)"
//        }}>
//          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
//            Apoie seu desenvolvimento com flexibilidade e potência
//          </h2>
//          <p>
//            Nossa plataforma oferece ferramentas poderosas, desempenho otimizado e um ambiente seguro para você crescer com liberdade. Seja para projetos pessoais ou grandes operações, a Virtus Cloud está pronta para te acompanhar.
//          </p>
//        </section>
//      </div>
//    </main>
//  );
//}


//frontend/src/app/[lang]/page.jsx -> Home Page

//'use client';
//
//import { usePathname, useRouter } from 'next/navigation';
//import Link from 'next/link';
//import '../styles/virtus.css';
//
//const messages = {
//  'pt-br': {
//    banner: 'Conheça o nosso novo serviço de analytics! →',
//    slogan: 'sua plataforma completa',
//    description:
//      'Potencialize sua presença online com o poder da Virtus Cloud, sua hospedagem definitiva para bots e sites! Transforme seu sonho em realidade com segurança, privacidade e suporte premium excepcional.',
//    plans: 'Confira nossos planos',
//    about: 'Saiba mais',
//  },
//  en: {
//    banner: 'Discover our new analytics service! →',
//    slogan: 'your complete platform',
//    description:
//      'Boost your online presence with Virtus Cloud, your ultimate hosting solution for bots and websites! Make your dream real with privacy, security, and premium support.',
//    plans: 'View our plans',
//    about: 'Learn more',
//  },
//  es: {
//    banner: '¡Conoce nuestro nuevo servicio de analytics! →',
//    slogan: 'tu plataforma completa',
//    description:
//      'Impulsa tu presencia en línea con el poder de Virtus Cloud, tu solución definitiva para bots y sitios web. Haz realidad tu sueño con seguridad, privacidad y soporte premium.',
//    plans: 'Consulta nuestros planes',
//    about: 'Saber más',
//  },
//  zh: {
//    banner: '了解我们的全新分析服务！→',
//    slogan: '您的完整平台',
//    description:
//      '通过 Virtus Cloud 提升您的线上影响力，这是针对网站与机器人的终极托管方案。享受卓越支持、隐私保护与安全性能，助您梦想成真。',
//    plans: '查看方案',
//    about: '了解更多',
//  },
//};
//
//function getLangFromPath(pathname) {
//  const segment = pathname?.split('/')[1]?.toLowerCase() || '';
//  const supported = Object.keys(messages);
//  return supported.includes(segment) ? segment : 'pt-br';
//}
//
//export default function HomePage() {
//  const pathname = usePathname();
//  const router = useRouter();
//  const lang = getLangFromPath(pathname);
//  const dict = messages[lang];
//
//  return (
//    <main
//      style={{
//        position: "relative",
//        minHeight: "100vh",
//        display: "flex",
//        alignItems: "center",
//        justifyContent: "center",
//        backgroundColor: "var(--background)",
//        color: "var(--foreground)",
//        padding: "2.5rem 1.5rem",
//        overflow: "hidden",
//      }}
//    >
//      {/* Fundo visual */}
//      <div
//        style={{
//          position: "absolute",
//          inset: 0,
//          backgroundImage: "url('/grid.svg')",
//          opacity: 0.1,
//          zIndex: 0,
//        }}
//      />
//
//      {/* Banner fixo no topo */}
//      <div
//        style={{
//          position: "absolute",
//          top: "1.5rem",
//          fontSize: "0.875rem",
//          backgroundColor: "var(--success)",
//          padding: "0.5rem 1rem",
//          borderRadius: "9999px",
//          color: "var(--color-virtus-900)",
//          fontWeight: "600",
//          zIndex: 10,
//        }}
//      >
//        {dict.banner}
//      </div>
//
//      {/* Conteúdo centralizado */}
//      <div
//        style={{
//          textAlign: "center",
//          zIndex: 10,
//          maxWidth: "40rem",
//          animation: "fade-in 1s ease-in-out",
//        }}
//      >
//        <h1
//          style={{
//            fontSize: "4rem",
//            fontWeight: "800",
//            color: "var(--foreground)",
//            letterSpacing: "-0.05em",
//          }}
//        >
//          Virtus Cloud
//        </h1>
//        <h2
//          style={{
//            backgroundImage: "linear-gradient(to right, var(--blue-700), var(--blue-500), var(--cyan-600))",
//            WebkitBackgroundClip: "text",
//            color: "transparent",
//            fontWeight: "800",
//            fontSize: "2rem",
//            marginTop: "0.5rem",
//          }}
//        >
//          {dict.slogan}
//        </h2>
//        <p
//          style={{
//            marginTop: "1.5rem",
//            fontSize: "1.125rem",
//            color: "var(--text-color-muted)",
//          }}
//        >
//          {dict.description}
//        </p>
//
//        {/* Botões com efeito de escala */}
//        <div
//          style={{
//            marginTop: "2rem",
//            display: "flex",
//            gap: "1rem",
//            justifyContent: "center",
//            flexWrap: "wrap",
//          }}
//        >
//          <button
//            onClick={() => router.push(`/${lang}/signin`)}
//            style={{
//              backgroundColor: "var(--blue-600)",
//              color: "white",
//              padding: "0.75rem 1.5rem",
//              borderRadius: "0.5rem",
//              fontSize: "1rem",
//              fontWeight: "600",
//              cursor: "pointer",
//              transition: "transform 0.2s ease",
//            }}
//            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
//            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
//          >
//            {dict.plans}
//          </button>
//
//          <button
//            onClick={() => router.push(`/${lang}/about`)}
//            style={{
//              backgroundColor: "transparent",
//              color: "var(--blue-300)",
//              padding: "0.75rem 1.5rem",
//              borderRadius: "0.5rem",
//              fontSize: "1rem",
//              fontWeight: "600",
//              border: "1px solid var(--blue-300)",
//              cursor: "pointer",
//              transition: "transform 0.2s ease",
//            }}
//            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
//            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
//          >
//            {dict.about}
//          </button>
//        </div>
//
//        {/* Seção extra */}
//        <section style={{
//          marginTop: "4rem",
//          maxWidth: "700px",
//          fontSize: "1rem",
//          color: "var(--text-color-muted)"
//        }}>
//          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
//            Apoie seu desenvolvimento com flexibilidade e potência
//          </h2>
//          <p>
//            Nossa plataforma oferece ferramentas poderosas, desempenho otimizado e um ambiente seguro para você crescer com liberdade. Seja para projetos pessoais ou grandes operações, a Virtus Cloud está pronta para te acompanhar.
//          </p>
//        </section>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { usePathname } from 'next/navigation';
//import Link from 'next/link';
//import Image from 'next/image';
////import '../styles/globais.css';
//import '../styles/virtus.css'; // ✅ incluído como você pediu
//
//const messages = {
//  'pt-br': {
//    banner: 'Conheça o nosso novo serviço de analytics! →',
//    slogan: 'sua plataforma completa',
//    description:
//      'Potencialize sua presença online com o poder da Virtus Cloud, sua hospedagem definitiva para bots e sites! Transforme seu sonho em realidade com segurança, privacidade e suporte premium excepcional.',
//    plans: 'Confira nossos planos',
//    about: 'Saiba mais',
//  },
//  en: {
//    banner: 'Discover our new analytics service! →',
//    slogan: 'your complete platform',
//    description:
//      'Boost your online presence with Virtus Cloud, your ultimate hosting solution for bots and websites! Make your dream real with privacy, security, and premium support.',
//    plans: 'View our plans',
//    about: 'Learn more',
//  },
//  es: {
//    banner: '¡Conoce nuestro nuevo servicio de analytics! →',
//    slogan: 'tu plataforma completa',
//    description:
//      'Impulsa tu presencia en línea con el poder de Virtus Cloud, tu solución definitiva para bots y sitios web. Haz realidad tu sueño con seguridad, privacidad y soporte premium.',
//    plans: 'Consulta nuestros planes',
//    about: 'Saber más',
//  },
//  zh: {
//    banner: '了解我们的全新分析服务！→',
//    slogan: '您的完整平台',
//    description:
//      '通过 Virtus Cloud 提升您的线上影响力，这是针对网站与机器人的终极托管方案。享受卓越支持、隐私保护与安全性能，助您梦想成真。',
//    plans: '查看方案',
//    about: '了解更多',
//  },
//};
//
//function getLangFromPath(pathname) {
//  const segment = pathname?.split('/')[1]?.toLowerCase() || '';
//  const supported = Object.keys(messages);
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function HomePage() {
//  const pathname = usePathname();
//  const lang = getLangFromPath(pathname);
//  const dict = messages[lang];
//
//  return (
//    <main
//      style={{
//        position: "relative",
//        minHeight: "100vh",
//        display: "flex",
//        alignItems: "center",
//        justifyContent: "center",
//        backgroundColor: "var(--background)",
//        color: "var(--foreground)",
//        padding: "2.5rem 1.5rem",
//        overflow: "hidden",
//      }}
//    >
//      {/* Fundo visual */}
//      <div
//        style={{
//          position: "absolute",
//          inset: 0,
//          backgroundImage: "url('/grid.svg')",
//          opacity: 0.1,
//          zIndex: 0,
//        }}
//      />
//
//      {/* Banner fixo no topo */}
//      <div
//        style={{
//          position: "absolute",
//          top: "1.5rem",
//          fontSize: "0.875rem",
//          backgroundColor: "var(--success)",
//          padding: "0.5rem 1rem",
//          borderRadius: "9999px",
//          color: "var(--color-virtus-900)",
//          fontWeight: "600",
//          zIndex: 10,
//        }}
//      >
//        {dict.banner}
//      </div>
//
//      {/* Conteúdo centralizado */}
//      <div
//        style={{
//          textAlign: "center",
//          zIndex: 10,
//          maxWidth: "40rem",
//          animation: "fade-in 1s ease-in-out",
//        }}
//      >
//        <h1
//          style={{
//            fontSize: "4rem",
//            fontWeight: "800",
//            color: "var(--foreground)",
//            letterSpacing: "-0.05em",
//          }}
//        >
//          Virtus Cloud
//        </h1>
//        <h2
//          style={{
//            backgroundImage: "linear-gradient(to right, var(--blue-700), var(--blue-500), var(--cyan-600))",
//            WebkitBackgroundClip: "text",
//            color: "transparent",
//            fontWeight: "800",
//            fontSize: "2rem",
//            marginTop: "0.5rem",
//          }}
//        >
//          {dict.slogan}
//        </h2>
//        <p
//          style={{
//            marginTop: "1.5rem",
//            fontSize: "1.125rem",
//            color: "var(--text-color-muted)",
//          }}
//        >
//          {dict.description}
//        </p>
//
//        {/* Botões */}
//        <div
//          style={{
//            marginTop: "2rem",
//            display: "flex",
//            gap: "1rem",
//            justifyContent: "center",
//          }}
//        >
//          <Link href={`/${lang}/signin`}>
//            <button
//              style={{
//                backgroundColor: "var(--blue-600)",
//                color: "white",
//                fontWeight: "500",
//                padding: "0.75rem 1.25rem",
//                borderRadius: "0.5rem",
//                transition: "background-color 0.2s ease",
//              }}
//              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--blue-500)")}
//              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--blue-600)")}
//            >
//              {dict.plans}
//            </button>
//          </Link>
//          <Link href={`/${lang}/about`}>
//            <button
//              style={{
//                backgroundColor: "white",
//                color: "black",
//                fontWeight: "500",
//                padding: "0.75rem 1.25rem",
//                borderRadius: "0.5rem",
//                transition: "background-color 0.2s ease",
//              }}
//              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--gray-200)")}
//              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
//            >
//              {dict.about}
//            </button>
//          </Link>
//        </div>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { usePathname } from 'next/navigation';
//import Link from 'next/link';
//import Image from 'next/image';
//import '../styles/globais.css';
//
//const messages = {
//  'pt-br': {
//    banner: 'Conheça o nosso novo serviço de analytics! →',
//    slogan: 'sua plataforma completa',
//    description:
//      'Potencialize sua presença online com o poder da Virtus Cloud, sua hospedagem definitiva para bots e sites! Transforme seu sonho em realidade com segurança, privacidade e suporte premium excepcional.',
//    plans: 'Confira nossos planos',
//    about: 'Saiba mais',
//  },
//  en: {
//    banner: 'Discover our new analytics service! →',
//    slogan: 'your complete platform',
//    description:
//      'Boost your online presence with Virtus Cloud, your ultimate hosting solution for bots and websites! Make your dream real with privacy, security, and premium support.',
//    plans: 'View our plans',
//    about: 'Learn more',
//  },
//  es: {
//    banner: '¡Conoce nuestro nuevo servicio de analytics! →',
//    slogan: 'tu plataforma completa',
//    description:
//      'Impulsa tu presencia en línea con el poder de Virtus Cloud, tu solución definitiva para bots y sitios web. Haz realidad tu sueño con seguridad, privacidad y soporte premium.',
//    plans: 'Consulta nuestros planes',
//    about: 'Saber más',
//  },
//  zh: {
//    banner: '了解我们的全新分析服务！→',
//    slogan: '您的完整平台',
//    description:
//      '通过 Virtus Cloud 提升您的线上影响力，这是针对网站与机器人的终极托管方案。享受卓越支持、隐私保护与安全性能，助您梦想成真。',
//    plans: '查看方案',
//    about: '了解更多',
//  },
//};
//
//function getLangFromPath(pathname) {
//  const segment = pathname?.split('/')[1]?.toLowerCase() || '';
//  const supported = Object.keys(messages);
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function HomePage() {
//  const pathname = usePathname();
//  const lang = getLangFromPath(pathname);
//  const dict = messages[lang];
//
//  return (
//    <main className="relative min-h-screen flex items-center justify-center bg-black text-white px-6 py-10 overflow-hidden">
//      {/* Fundo visual */}
//      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 z-0" />
//
//      {/* Banner fixo no topo */}
//      <div className="absolute top-6 text-sm bg-green-600 px-4 py-2 rounded-full text-black font-semibold z-10">
//        {dict.banner}
//      </div>
//
//      {/* Conteúdo centralizado */}
//      <div className="text-center z-10 max-w-2xl animate-fade-in">
//        <h1 className="text-6xl font-extrabold text-white tracking-tight sm:text-7xl md:text-8xl">
//          Virtus Cloud
//        </h1>
//        <h2 className="bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-600 bg-clip-text text-transparent font-extrabold text-3xl sm:text-4xl md:text-6xl mt-2">
//          {dict.slogan}
//        </h2>
//        <p className="mt-6 text-lg text-gray-300">{dict.description}</p>
//
//        {/* Botões */}
//        <div className="mt-8 flex gap-4 justify-center">
//          <Link href={`/${lang}/signin`}>
//            <button className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-3 rounded transition">
//              {dict.plans}
//            </button>
//          </Link>
//          <Link href={`/${lang}/about`}>
//            <button className="bg-white text-black font-medium px-5 py-3 rounded hover:bg-gray-200 transition">
//              {dict.about}
//            </button>
//          </Link>
//        </div>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { usePathname } from 'next/navigation';
//import Link from 'next/link';
//import Image from 'next/image';
//import '../styles/globais.css';
//
//// Dicionário multilíngue direto no componente
//const messages = {
//  'pt-br': {
//    banner: 'Conheça o nosso novo serviço de analytics! →',
//    slogan: 'sua plataforma completa',
//    description:
//      'Potencialize sua presença online com o poder da Virtus Cloud, sua hospedagem definitiva para bots e sites! Transforme seu sonho em realidade com segurança, privacidade e suporte premium excepcional.',
//    plans: 'Confira nossos planos',
//    about: 'Saiba mais',
//  },
//  en: {
//    banner: 'Discover our new analytics service! →',
//    slogan: 'your complete platform',
//    description:
//      'Boost your online presence with Virtus Cloud, your ultimate hosting solution for bots and websites! Make your dream real with privacy, security, and premium support.',
//    plans: 'View our plans',
//    about: 'Learn more',
//  },
//  es: {
//    banner: '¡Conoce nuestro nuevo servicio de analytics! →',
//    slogan: 'tu plataforma completa',
//    description:
//      'Impulsa tu presencia en línea con el poder de Virtus Cloud, tu solución definitiva para bots y sitios web. Haz realidad tu sueño con seguridad, privacidad y soporte premium.',
//    plans: 'Consulta nuestros planes',
//    about: 'Saber más',
//  },
//  zh: {
//    banner: '了解我们的全新分析服务！→',
//    slogan: '您的完整平台',
//    description:
//      '通过 Virtus Cloud 提升您的线上影响力，这是针对网站与机器人的终极托管方案。享受卓越支持、隐私保护与安全性能，助您梦想成真。',
//    plans: '查看方案',
//    about: '了解更多',
//  },
//};
//
//// Detecta idioma da URL, por ex: /pt-br/home
//function getLangFromPath(pathname) {
//  const segment = pathname?.split('/')[1]?.toLowerCase() || '';
//  const supported = Object.keys(messages);
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function HomePage() {
//  const pathname = usePathname();
//  const lang = getLangFromPath(pathname);
//  const dict = messages[lang];
//
//  return (
//    <main className="min-h-screen bg-black text-white px-6 py-10 flex flex-col justify-center items-center relative overflow-hidden">
//      {/* Banner */}
//      <div className="absolute top-4 text-sm bg-green-600 px-4 py-2 rounded-full text-black font-semibold">
//        {dict.banner}
//      </div>
//
//      {/* Logo + Texto */}
//      <div className="text-center z-10">
//        <h1 className="text-6xl font-bold">Virtus Cloud</h1>
//        <h2 className="text-2xl text-blue-400 mt-2">{dict.slogan}</h2>
//        <p className="mt-6 max-w-3xl text-lg text-gray-300">{dict.description}</p>
//
//        {/* Botões */}
//        <div className="mt-8 flex gap-4 justify-center">
//          <Link href={`/${lang}/signin`}>
//            <button className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-3 rounded">
//              {dict.plans}
//            </button>
//          </Link>
//          <Link href={`/${lang}/about`}>
//            <button className="bg-white text-black font-medium px-5 py-3 rounded hover:bg-gray-200">
//              {dict.about}
//            </button>
//          </Link>
//        </div>
//      </div>
//
//      {/* Fundo visual */}
//      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 z-0" />
//    </main>
//  );
//}
//frontend/src/components/sections/home/section1.jsx

'use client';

import { messages } from '@/app/[lang]/messages/home/section1';
import { PlanOrDashboardButton } from '@/components/PlanOrDashboardButton';

export default function Section1({ lang, username }) {
  const dict = messages[lang] || messages['pt-br'];

  return (
    <section
      id="main"
      className="relative h-[max(500px,calc(100dvh-80px))] max-h-225 overflow-hidden rounded-4xl px-4 py-16 sm:mx-4 sm:px-6 sm:py-36"
    >
      <div className="-mt-6 flex h-full select-none flex-col items-center justify-center text-center">
        <div className="max-w-2xl lg:max-w-5xl">
          <h1
            translate="no"
            className="font-extrabold text-5xl text-primary leading-snug tracking-tight max-sm:mt-4 sm:text-6xl md:text-8xl motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-150"
          >
            Virtus Cloud
          </h1>
          <h2 className="bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-600 bg-clip-text font-extrabold text-4xl text-transparent tracking-tight sm:text-4xl md:text-6xl motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-300">
            {dict.slogan}
          </h2>
          <p className="my-6 font-medium text-base text-secondary sm:mx-auto lg:mx-0 motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-450">
            {dict.description}
          </p>
        </div>

        <div className="grid justify-center gap-4 py-0.5 sm:grid-cols-2 motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-600">
          {/* Botão dinâmico: Painel ou Planos */}
          <PlanOrDashboardButton dict={dict} username={username} />

          {/* Botão: Saiba mais */}
          <a
            href="https://docs.virtuscloud.app/"
            target="_blank"
            role="button"
            aria-label="Acessar a documentação"
            className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 group relative flex items-center"
          >
            <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
              {dict.about}
            </span>
            <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 256 256"
                strokeWidth="1"
              >
                <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

//frontend/src/components/sections/section1.jsx,

//'use client';
//
//import { messages } from '@/app/[lang]/messages/section1';
//import { PlanOrDashboardButton } from '@/components/PlanOrDashboardButton';
//
//export default function Section1({ lang, username }) {
//  const dict = messages[lang] || messages['pt-br'];
//
//  return (
//    <section
//      id="main"
//      className="relative h-[max(500px,calc(100dvh-80px))] max-h-225 overflow-hidden rounded-4xl bg-grid-virtus-600/[0.375] px-4 py-16 sm:mx-4 sm:px-6 sm:py-36"
//    >
//      <div className="-mt-6 flex h-full select-none flex-col items-center justify-center text-center">
//        <div className="max-w-2xl lg:max-w-5xl">
//          <h1
//            translate="no"
//            className="font-extrabold text-5xl text-primary leading-snug tracking-tight max-sm:mt-4 sm:text-6xl md:text-8xl motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-150"
//          >
//            Virtus Cloud
//          </h1>
//          <h2 className="bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-600 bg-clip-text font-extrabold text-4xl text-transparent tracking-tight sm:text-4xl md:text-6xl motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-300">
//            {dict.slogan}
//          </h2>
//          <p className="my-6 font-medium text-base text-secondary sm:mx-auto lg:mx-0 motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-450">
//            {dict.description}
//          </p>
//        </div>
//
//        <div className="grid justify-center gap-4 py-0.5 sm:grid-cols-2 motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-600">
//          {/* Botão dinâmico: Painel ou Planos */}
//          <PlanOrDashboardButton dict={dict} username={username} />
//
//          {/* Botão: Saiba mais */}
//          <a
//            href="https://docs.virtuscloud.app/"
//            target="_blank"
//            role="button"
//            aria-label="Acessar a documentação"
//            className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 group relative flex items-center"
//          >
//            <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//              {dict.about}
//            </span>
//            <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//              <svg
//                xmlns="http://www.w3.org/2000/svg"
//                width="18"
//                height="18"
//                fill="currentColor"
//                viewBox="0 0 256 256"
//                strokeWidth="1"
//              >
//                <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//              </svg>
//            </div>
//          </a>
//        </div>
//      </div>
//    </section>
//  );
//}

//'use client';
//
//import { messages } from '@/app/[lang]/messages/section1';
//
//export default function Section1({ lang }) {
//  const dict = messages[lang] || messages['pt-br'];
//
//  return (
//    <section
//      id="main"
//      className="relative h-[max(500px,calc(100dvh-80px))] max-h-225 overflow-hidden rounded-4xl bg-grid-virtus-600/[0.375] px-4 py-16 sm:mx-4 sm:px-6 sm:py-36"
//    >
//      <div className="-mt-6 flex h-full select-none flex-col items-center justify-center text-center">
//        <div className="max-w-2xl lg:max-w-5xl">
//          <h1
//            translate="no"
//            className="font-extrabold text-5xl text-primary leading-snug tracking-tight max-sm:mt-4 sm:text-6xl md:text-8xl motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-150"
//          >
//            Virtus Cloud
//          </h1>
//          <h2 className="bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-600 bg-clip-text font-extrabold text-4xl text-transparent tracking-tight sm:text-4xl md:text-6xl motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-300">
//            {dict.slogan}
//          </h2>
//          <p className="my-6 font-medium text-base text-secondary sm:mx-auto lg:mx-0 motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-450">
//            {dict.description}
//          </p>
//        </div>
//
//        <div className="grid justify-center gap-4 py-0.5 sm:grid-cols-2 motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-600">
//          {/* Botão: Ir para o painel */}
//          <a
//            href={`/${lang}/dashboard`}
//            role="button"
//            className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 group relative flex items-center"
//          >
//            <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//              {dict.dashboard}
//            </span>
//            <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//              <svg
//                xmlns="http://www.w3.org/2000/svg"
//                width="18"
//                height="18"
//                fill="currentColor"
//                viewBox="0 0 256 256"
//                strokeWidth="1"
//              >
//                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//              </svg>
//            </div>
//          </a>
//
//          {/* Botão: Saiba mais */}
//          <a
//            href="https://docs.virtuscloud.app/"
//            target="_blank"
//            role="button"
//            aria-label="Acessar a documentação"
//            className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 group relative flex items-center"
//          >
//            <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//              {dict.about}
//            </span>
//            <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//              <svg
//                xmlns="http://www.w3.org/2000/svg"
//                width="18"
//                height="18"
//                fill="currentColor"
//                viewBox="0 0 256 256"
//                strokeWidth="1"
//              >
//                <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//              </svg>
//            </div>
//          </a>
//        </div>
//      </div>
//    </section>
//  );
//}

//export default function Section1() {
//    const { lang } = useParams();
//    const dict = messages[lang] || messages['pt-br'];
//    
//    return (
//        <section
//            id="main"
//            className="relative h-[max(500px,calc(100dvh-80px))] max-h-225 overflow-hidden rounded-4xl bg-grid-virtus-600/[0.375] px-4 py-16 sm:mx-4 sm:px-6 sm:py-36"
//        >
//            <div className="-mt-6 flex h-full select-none flex-col items-center justify-center text-center">
//                <div className="max-w-2xl lg:max-w-5xl">
//                    <h1
//                        translate="no"
//                        className="font-extrabold text-5xl text-primary leading-snug tracking-tight max-sm:mt-4 sm:text-6xl md:text-8xl motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-150"
//                    >
//                        Virtus Cloud
//                    </h1>
//                    <h2 className="bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-600 bg-clip-text font-extrabold text-4xl text-transparent tracking-tight sm:text-4xl md:text-6xl motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-300">
//                        {dict.slogan}
//                    </h2>
//                    <p className="my-6 font-medium text-base text-secondary sm:mx-auto lg:mx-0 motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-450">
//                        {dict.description}
//                    </p>
//                </div>
//
//                <div className="grid justify-center gap-4 py-0.5 sm:grid-cols-2 motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-600">
//                    {/* Botão: Ir para o painel */}
//                    <a
//                        href="/pt-br/dashboard"
//                        role="button"
//                        className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 group relative flex items-center"
//                    >
//                        <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//                            {dict.dashboard}
//                        </span>
//                        <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//                            <svg
//                                xmlns="http://www.w3.org/2000/svg"
//                                width="18"
//                                height="18"
//                                fill="currentColor"
//                                viewBox="0 0 256 256"
//                                strokeWidth="1"
//                            >
//                                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                            </svg>
//                        </div>
//                    </a>
//
//                    {/* Botão: Saiba mais */}
//                    <a
//                        href="https://docs.virtuscloud.app/"
//                        target="_blank"
//                        role="button"
//                        aria-label="Acessar a documentação"
//                        className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 group relative flex items-center"
//                    >
//                        <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//                            {dict.about}
//                        </span>
//                        <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//                            <svg
//                                xmlns="http://www.w3.org/2000/svg"
//                                width="18"
//                                height="18"
//                                fill="currentColor"
//                                viewBox="0 0 256 256"
//                                strokeWidth="1"
//                            >
//                                <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//                            </svg>
//                        </div>
//                    </a>
//                </div>
//            </div>
//        </section>
//    );
//}

//export default function Section1() {
//  return (
//    <section
//      id="main"
//      className="relative h-[max(500px,calc(100dvh-80px))] max-h-225 overflow-hidden rounded-4xl bg-grid-virtus-600/[0.375] px-4 py-16 sm:mx-4 sm:px-6 sm:py-36"
//    >
//      <div className="-mt-6 flex h-full select-none flex-col items-center justify-center text-center">
//        <div className="max-w-2xl lg:max-w-5xl">
//          <h1
//            translate="no"
//            className="font-extrabold text-5xl text-primary leading-snug tracking-tight max-sm:mt-4 sm:text-6xl md:text-8xl motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-150"
//          >
//            Virtus Cloud
//          </h1>
//          <h2 className="bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-600 bg-clip-text font-extrabold text-4xl text-transparent tracking-tight sm:text-4xl md:text-6xl motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-300">
//            sua plataforma completa
//          </h2>
//          <p className="my-6 font-medium text-base text-secondary sm:mx-auto lg:mx-0 motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-450">
//            Potencialize sua presença online com o poder da Virtus Cloud, sua hospedagem definitiva para bots e sites! Transforme seu sonho em realidade com segurança, privacidade e suporte premium excepcional.
//          </p>
//        </div>
//
//        <div className="grid justify-center gap-4 py-0.5 sm:grid-cols-2 motion-opacity-in-0 motion-translate-y-in-[15%] motion-ease-spring-bouncier motion-delay-600">
//          <a
//            href="/pt-br/dashboard"
//            className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
//            role="button"
//          >
//            <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//              Ir para o painel
//            </span>
//            <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//              </svg>
//            </div>
//          </a>
//
//          <a
//            href="https://docs.virtuscloud.app/"
//            target="_blank"
//            className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4"
//            role="button"
//            aria-label="Acessar a documentação"
//          >
//            <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//              Saiba mais
//            </span>
//            <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//              </svg>
//            </div>
//          </a>
//        </div>
//      </div>
//    </section>
//  );
//}
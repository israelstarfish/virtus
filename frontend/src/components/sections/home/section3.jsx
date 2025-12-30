//frontend/src/components/sections/home/section3.jsx

'use client';

import { useEffect, useState } from 'react';
import { messages } from '@/app/[lang]/messages/home/section3';

export default function Section3({ lang }) {
  const dict = messages[lang] || messages['pt-br'];

  const bots = ['WhatsApp', 'Telegram', 'Discord', 'Twitch'];
  const [activeBotIndex, setActiveBotIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBotIndex((prev) => (prev + 1) % bots.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const botWidths = {
    WhatsApp: 248,
    Telegram: 220,
    Discord: 181,
    Twitch: 158,
  };

  return (
    <section className="container relative my-24 px-4 sm:my-48 sm:px-6">
      <div className="flex justify-between">
        {/* Texto à esquerda */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-blue-500">
              <img
                alt="Virtus Cloud Logo"
                loading="lazy"
                width={16}
                height={16}
                decoding="async"
                style={{ color: 'transparent' }}
                src="/assets/logo.jpg"
              />
              <span className="font-medium">{dict.label}</span>
            </div>
            <span className="text-virtus-400 text-xs">|</span>
            <span className="font-normal text-blue-500">Virtus Cloud</span>
          </div>

          <div className="space-y-1">
            <h2 className="flex flex-col gap-2 overflow-hidden font-bold text-3xl leading-tight sm:flex-row sm:gap-2.5 sm:text-4xl md:text-5xl text-nowrap">
              {dict.title}{' '}
              <div className="flex gap-2 max-md:flex-1">
                <ul
                  className="relative h-8 space-y-2 text-blue-500 md:h-12 transition-all duration-500"
                  style={{
                    top: `-${activeBotIndex * 68}px`,
                    width: `${botWidths[bots[activeBotIndex]]}px`,
                  }}
                >
                  {bots.map((bot, index) => (
                    <li
                      key={bot}
                      className={`w-fit transition-opacity ${
                        activeBotIndex === index
                          ? 'opacity-100'
                          : 'opacity-0 select-none'
                      }`}
                      data-visible={activeBotIndex === index ? 'true' : 'false'}
                    >
                      {bot}
                    </li>
                  ))}
                </ul>{' '}
                bot.
              </div>
            </h2>

            <h2 className="max-w-lg text-secondary">{dict.description}</h2>
          </div>

          <a
            href={`/${lang}/bots`}
            className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 group relative flex items-center"
            role="button"
          >
            <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
              {dict.explore}
            </span>
            <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 256 256"
                strokeWidth="1" // ← CORRETO
              >
                <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
              </svg>
            </div>
          </a>

          {/* Benefícios */}
          <div className="mt-6 flex flex-col gap-4 md:flex-row">
            <div className="flex-1 space-y-2 rounded-md border border-virtus-700 p-4 md:max-w-60">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 256 256"
                className="text-blue-500"
              >
                <path d="M101.85,191.14C97.34,201,82.29,224,40,224a8,8,0,0,1-8-8c0-42.29,23-57.34,32.86-61.85a8,8,0,0,1,6.64,14.56c-6.43,2.93-20.62,12.36-23.12,38.91,26.55-2.5,36-16.69,38.91-23.12a8,8,0,1,1,14.56,6.64Zm122-144a16,16,0,0,0-15-15c-12.58-.75-44.73.4-71.4,27.07h0L88,108.7A8,8,0,0,1,76.67,97.39l26.56-26.57A4,4,0,0,0,100.41,64H74.35A15.9,15.9,0,0,0,63,68.68L28.7,103a16,16,0,0,0,9.07,27.16l38.47,5.37,44.21,44.21,5.37,38.49a15.94,15.94,0,0,0,10.78,12.92,16.11,16.11,0,0,0,5.1.83A15.91,15.91,0,0,0,153,227.3L187.32,193A16,16,0,0,0,192,181.65V155.59a4,4,0,0,0-6.83-2.82l-26.57,26.56a8,8,0,0,1-11.71-.42,8.2,8.2,0,0,1,.6-11.1l49.27-49.27h0C223.45,91.86,224.6,59.71,223.85,47.12Z" />
              </svg>
              <div>
                <h2 className="font-semibold">{dict.benefit1_title}</h2>
                <span className="text-secondary text-sm">
                  {dict.benefit1_description}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-2 rounded-md border border-virtus-700 p-4 md:max-w-60">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 256 256"
                className="text-blue-500"
              >
                <path d="M128,40a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,40Zm45.66,61.66-40,40a8,8,0,0,1-11.32-11.32l40-40a8,8,0,0,1,11.32,11.32Z" />
              </svg>
              <div>
                <h2 className="font-semibold">{dict.benefit2_title}</h2>
                <span className="text-secondary text-sm">
                  {dict.benefit2_description}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Imagem ilustrativa */}
        <div className="hidden items-center lg:flex">
          <img
            alt="Bots"
            loading="lazy"
            width={400}
            height={400}
            decoding="async"
            style={{ color: 'transparent' }}
            src="/undraw/services/bots.svg"
          />
        </div>
      </div>
    </section>
  );
}

//import { useEffect, useState } from "react";
//
//export default function Section3() {
//  const bots = ["WhatsApp", "Telegram", "Discord", "Twitch"];
//  const [activeBotIndex, setActiveBotIndex] = useState(0);
//
//  useEffect(() => {
//    const interval = setInterval(() => {
//      setActiveBotIndex((prev) => (prev + 1) % bots.length);
//    }, 2000);
//    return () => clearInterval(interval);
//  }, []);
//
//  const botWidths = {
//    WhatsApp: 248,
//    Telegram: 220,
//    Discord: 181,
//    Twitch: 158,
//  };
//
//  return (
//    <section className="container relative my-24 px-4 sm:my-48 sm:px-6">
//      <div className="flex justify-between">
//        {/* Texto à esquerda */}
//        <div className="flex flex-col gap-4">
//          <div className="flex items-center gap-3">
//            <div className="flex items-center gap-2 text-blue-500">
//              <img
//                alt="Virtus Cloud Logo"
//                loading="lazy"
//                width={16}
//                height={16}
//                decoding="async"
//                style={{ color: "transparent" }}
//                src="/assets/logo.jpg"
//              />
//              <span className="font-medium">Bots</span>
//            </div>
//            <span className="text-virtus-400 text-xs">|</span>
//            <span className="font-normal text-blue-500">Virtus Cloud</span>
//          </div>
//
//          <div className="space-y-1">
//            <h2 className="flex flex-col gap-2 overflow-hidden font-bold text-3xl leading-tight sm:flex-row sm:gap-2.5 sm:text-4xl md:text-5xl text-nowrap">
//              Hospede seu{" "}
//              <div className="flex gap-2 max-md:flex-1">
//                <ul
//                  className="relative h-8 space-y-2 text-blue-500 md:h-12 transition-all duration-500"
//                  style={{
//                    top: `-${activeBotIndex * 68}px`,
//                    width: `${botWidths[bots[activeBotIndex]]}px`,
//                  }}
//                >
//                  {bots.map((bot, index) => (
//                    <li
//                      key={bot}
//                      className={`w-fit transition-opacity ${
//                        activeBotIndex === index
//                          ? "opacity-100"
//                          : "opacity-0 select-none"
//                      }`}
//                      data-visible={activeBotIndex === index ? "true" : "false"}
//                    >
//                      {bot}
//                    </li>
//                  ))}
//                </ul>{" "}
//                bot.
//              </div>
//            </h2>
//
//            <h2 className="max-w-lg text-secondary">
//              Eleve sua hospedagem de bots com a plataforma líder da América Latina. Nossa solução garante desempenho e confiabilidade inigualáveis, proporcionando hospedagem sem esforço e de alta qualidade para todas as suas necessidades de bots. Escolha-nos para obter o melhor em hospedagem de bots de ponta.
//            </h2>
//          </div>
//
//          <a
//            href="/pt-br/bots"
//            className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4"
//            role="button"
//          >
//            <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//              Explore mais
//            </span>
//            <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//              </svg>
//            </div>
//          </a>
//                    {/* Benefícios */}
//          <div className="mt-6 flex flex-col gap-4 md:flex-row">
//            <div className="flex-1 space-y-2 rounded-md border border-virtus-700 p-4 md:max-w-60">
//              <svg
//                xmlns="http://www.w3.org/2000/svg"
//                width="24"
//                height="24"
//                fill="currentColor"
//                viewBox="0 0 256 256"
//                className="text-blue-500"
//              >
//                <path d="M101.85,191.14C97.34,201,82.29,224,40,224a8,8,0,0,1-8-8c0-42.29,23-57.34,32.86-61.85a8,8,0,0,1,6.64,14.56c-6.43,2.93-20.62,12.36-23.12,38.91,26.55-2.5,36-16.69,38.91-23.12a8,8,0,1,1,14.56,6.64Zm122-144a16,16,0,0,0-15-15c-12.58-.75-44.73.4-71.4,27.07h0L88,108.7A8,8,0,0,1,76.67,97.39l26.56-26.57A4,4,0,0,0,100.41,64H74.35A15.9,15.9,0,0,0,63,68.68L28.7,103a16,16,0,0,0,9.07,27.16l38.47,5.37,44.21,44.21,5.37,38.49a15.94,15.94,0,0,0,10.78,12.92,16.11,16.11,0,0,0,5.1.83A15.91,15.91,0,0,0,153,227.3L187.32,193A16,16,0,0,0,192,181.65V155.59a4,4,0,0,0-6.83-2.82l-26.57,26.56a8,8,0,0,1-11.71-.42,8.2,8.2,0,0,1,.6-11.1l49.27-49.27h0C223.45,91.86,224.6,59.71,223.85,47.12Z" />
//              </svg>
//              <div>
//                <h2 className="font-semibold">Dinâmico</h2>
//                <span className="text-secondary text-sm">
//                  Oferecemos um serviço de hospedagem de bots dinâmico e inteligente com uma ampla variedade de endereços IP públicos para garantir a operação ininterrupta do bot.
//                </span>
//              </div>
//            </div>
//
//            <div className="flex-1 space-y-2 rounded-md border border-virtus-700 p-4 md:max-w-60">
//              <svg
//                xmlns="http://www.w3.org/2000/svg"
//                width="24"
//                height="24"
//                fill="currentColor"
//                viewBox="0 0 256 256"
//                className="text-blue-500"
//              >
//                <path d="M128,40a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,40Zm45.66,61.66-40,40a8,8,0,0,1-11.32-11.32l40-40a8,8,0,0,1,11.32,11.32ZM96,16a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,16Z" />
//              </svg>
//              <div>
//                <h2 className="font-semibold">24/7 Uptime</h2>
//                <span className="text-secondary text-sm">
//                  Reinicie automaticamente seu projeto se ele ficar off-line devido a erros de código, graças à nossa tecnologia exclusiva de reinicialização automática.
//                </span>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        {/* Imagem ilustrativa */}
//        <div className="hidden items-center lg:flex">
//          <img
//            alt="Bots"
//            loading="lazy"
//            width={400}
//            height={400}
//            decoding="async"
//            style={{ color: "transparent" }}
//            src="/undraw/services/bots.svg"
//          />
//        </div>
//      </div>
//    </section>
//  );
//}

//import { useEffect, useState } from "react";
//
//export default function Section3() {
//  const bots = ["WhatsApp", "Telegram", "Discord", "Twitch"];
//  const [activeBotIndex, setActiveBotIndex] = useState(0);
//
//  useEffect(() => {
//    const interval = setInterval(() => {
//      setActiveBotIndex((prev) => (prev + 1) % bots.length);
//    }, 2000); // troca a cada 2 segundos
//    return () => clearInterval(interval);
//  }, []);
//
//  return (
//    <section className="container relative my-24 px-4 sm:my-48 sm:px-6">
//      <div className="flex justify-between">
//        {/* Texto à esquerda */}
//        <div className="flex flex-col gap-4">
//          <div className="flex items-center gap-3">
//            <div className="flex items-center gap-2 text-blue-500">
//              <img
//                alt="Virtus Cloud Logo"
//                loading="lazy"
//                width={16}
//                height={16}
//                decoding="async"
//                style={{ color: "transparent" }}
//                src="/assets/logo.jpg"
//              />
//              <span className="font-medium">Bots</span>
//            </div>
//            <span className="text-virtus-400 text-xs">|</span>
//            <span className="font-normal text-blue-500">Virtus Cloud</span>
//          </div>
//
//          <div className="space-y-1">
//            <h2 className="flex flex-col gap-2 overflow-hidden font-bold text-3xl leading-tight sm:flex-row sm:gap-2.5 sm:text-4xl md:text-5xl text-nowrap">
//              Hospede seu{" "}
//              <div className="flex gap-2 max-md:flex-1">
//                <ul className="relative h-8 space-y-2 text-blue-500 md:h-12" style={{ width: "248px" }}>
//                  {bots.map((bot, index) => (
//                    <li
//                      key={bot}
//                      className={`w-fit transition-opacity ${activeBotIndex === index ? "opacity-100" : "opacity-0 select-none"
//                        }`}
//                    >
//                      {bot}
//                    </li>
//                  ))}
//                </ul>{" "}
//                bot.
//              </div>
//            </h2>
//
//            <h2 className="max-w-lg text-secondary">
//              Eleve sua hospedagem de bots com a plataforma líder da América Latina. Nossa solução garante desempenho e confiabilidade inigualáveis, proporcionando hospedagem sem esforço e de alta qualidade para todas as suas necessidades de bots. Escolha-nos para obter o melhor em hospedagem de bots de ponta.
//            </h2>
//          </div>
//
//          {/* Botão */}
//          <a
//            href="/pt-br/bots"
//            className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4"
//            role="button"
//          >
//            <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//              Explore mais
//            </span>
//            <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//              </svg>
//            </div>
//          </a>
//
//          {/* Benefícios */}
//          <div className="mt-6 flex flex-col gap-4 md:flex-row">
//            <div className="flex-1 space-y-2 rounded-md border border-virtus-700 p-4 md:max-w-60">
//              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500">
//                <path d="M101.85,191.14C97.34,201,82.29,224,40,224a8,8,0,0,1-8-8c0-42.29,23-57.34,32.86-61.85a8,8,0,0,1,6.64,14.56c-6.43,2.93-20.62,12.36-23.12,38.91,26.55-2.5,36-16.69,38.91-23.12a8,8,0,1,1,14.56,6.64Zm122-144a16,16,0,0,0-15-15c-12.58-.75-44.73.4-71.4,27.07h0L88,108.7A8,8,0,0,1,76.67,97.39l26.56-26.57A4,4,0,0,0,100.41,64H74.35A15.9,15.9,0,0,0,63,68.68L28.7,103a16,16,0,0,0,9.07,27.16l38.47,5.37,44.21,44.21,5.37,38.49a15.94,15.94,0,0,0,10.78,12.92,16.11,16.11,0,0,0,5.1.83A15.91,15.91,0,0,0,153,227.3L187.32,193A16,16,0,0,0,192,181.65V155.59a4,4,0,0,0-6.83-2.82l-26.57,26.56a8,8,0,0,1-11.71-.42,8.2,8.2,0,0,1,.6-11.1l49.27-49.27h0C223.45,91.86,224.6,59.71,223.85,47.12Z" />
//              </svg>
//              <div>
//                <h2 className="font-semibold">Dinâmico</h2>
//                <span className="text-secondary text-sm">
//                  Oferecemos um serviço de hospedagem de bots dinâmico e inteligente com uma ampla variedade de endereços IP públicos para garantir a operação ininterrupta do bot.
//                </span>
//              </div>
//            </div>
//
//            <div className="flex-1 space-y-2 rounded-md border border-virtus-700 p-4 md:max-w-60">
//              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500">
//                <path d="M128,40a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,40Zm45.66,61.66-40,40a8,8,0,0,1-11.32-11.32l40-40a8,8,0,0,1,11.32,11.32ZM96,16a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,16Z" />
//              </svg>
//              <div>
//                <h2 className="font-semibold">24/7 Uptime</h2>
//                <span className="text-secondary text-sm">
//                  Reinicie automaticamente seu projeto se ele ficar off-line devido a erros de código, graças à nossa tecnologia exclusiva de reinicialização automática.
//                </span>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        {/* Imagem ilustrativa */}
//        <div className="hidden items-center lg:flex">
//          <img
//            alt="Bots"
//            loading="lazy"
//            width={400}
//            height={400}
//            decoding="async"
//            style={{ color: "transparent" }}
//            src="/undraw/services/bots.svg"
//          />
//        </div>
//      </div>
//    </section>
//  );
//}

//export default function Section3() {
//  return (
//    <section className="container relative my-24 px-4 sm:my-48 sm:px-6">
//      <div className="flex justify-between">
//        {/* Texto à esquerda */}
//        <div className="flex flex-col gap-4">
//          <div className="flex items-center gap-3">
//            <div className="flex items-center gap-2 text-blue-500">
//              <img
//                alt="Virtus Cloud Logo"
//                loading="lazy"
//                width={16}
//                height={16}
//                decoding="async"
//                style={{ color: "transparent" }}
//                src="/assets/logo.jpg"
//              />
//              <span className="font-medium">Bots</span>
//            </div>
//            <span className="text-virtus-400 text-xs">|</span>
//            <span className="font-normal text-blue-500">Virtus Cloud</span>
//          </div>
//
//          <div className="space-y-1">
//            <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl leading-tight">
//              Hospede seu <span className="text-blue-500">WhatsApp</span> bot.
//            </h2>
//            <h2 className="max-w-lg text-secondary">
//              Eleve sua hospedagem de bots com a plataforma líder da América Latina. Nossa solução garante desempenho e confiabilidade inigualáveis, proporcionando hospedagem sem esforço e de alta qualidade para todas as suas necessidades de bots. Escolha-nos para obter o melhor em hospedagem de bots de ponta.
//            </h2>
//          </div>
//
//          {/* Botão */}
//          <a
//            href="/pt-br/bots"
//            className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4"
//            role="button"
//          >
//            <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//              Explore mais
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
//
//          {/* Benefícios */}
//          <div className="mt-6 flex flex-col gap-4 md:flex-row">
//            <div className="flex-1 space-y-2 rounded-md border border-virtus-700 p-4 md:max-w-60">
//              <svg
//                xmlns="http://www.w3.org/2000/svg"
//                width="24"
//                height="24"
//                fill="currentColor"
//                viewBox="0 0 256 256"
//                className="text-blue-500"
//              >
//                <path d="M101.85,191.14C97.34,201,82.29,224,40,224a8,8,0,0,1-8-8c0-42.29,23-57.34,32.86-61.85a8,8,0,0,1,6.64,14.56c-6.43,2.93-20.62,12.36-23.12,38.91,26.55-2.5,36-16.69,38.91-23.12a8,8,0,1,1,14.56,6.64Zm122-144a16,16,0,0,0-15-15c-12.58-.75-44.73.4-71.4,27.07h0L88,108.7A8,8,0,0,1,76.67,97.39l26.56-26.57A4,4,0,0,0,100.41,64H74.35A15.9,15.9,0,0,0,63,68.68L28.7,103a16,16,0,0,0,9.07,27.16l38.47,5.37,44.21,44.21,5.37,38.49a15.94,15.94,0,0,0,10.78,12.92,16.11,16.11,0,0,0,5.1.83A15.91,15.91,0,0,0,153,227.3L187.32,193A16,16,0,0,0,192,181.65V155.59a4,4,0,0,0-6.83-2.82l-26.57,26.56a8,8,0,0,1-11.71-.42,8.2,8.2,0,0,1,.6-11.1l49.27-49.27h0C223.45,91.86,224.6,59.71,223.85,47.12Z" />
//              </svg>
//              <div>
//                <h2 className="font-semibold">Dinâmico</h2>
//                <span className="text-secondary text-sm">
//                  Oferecemos um serviço de hospedagem de bots dinâmico e inteligente com uma ampla variedade de endereços IP públicos para garantir a operação ininterrupta do bot.
//                </span>
//              </div>
//            </div>
//
//            <div className="flex-1 space-y-2 rounded-md border border-virtus-700 p-4 md:max-w-60">
//              <svg
//                xmlns="http://www.w3.org/2000/svg"
//                width="24"
//                height="24"
//                fill="currentColor"
//                viewBox="0 0 256 256"
//                className="text-blue-500"
//              >
//                <path d="M128,40a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,40Zm45.66,61.66-40,40a8,8,0,0,1-11.32-11.32l40-40a8,8,0,0,1,11.32,11.32ZM96,16a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,16Z" />
//              </svg>
//              <div>
//                <h2 className="font-semibold">24/7 Uptime</h2>
//                <span className="text-secondary text-sm">
//                  Reinicie automaticamente seu projeto se ele ficar off-line devido a erros de código, graças à nossa tecnologia exclusiva de reinicialização automática.
//                </span>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        {/* Imagem ilustrativa */}
//        <div className="hidden items-center lg:flex">
//          <img
//            alt="Bots"
//            loading="lazy"
//            width={400}
//            height={400}
//            decoding="async"
//            style={{ color: "transparent" }}
//            src="/undraw/services/bots.svg"
//          />
//        </div>
//      </div>
//    </section>
//  );
//}
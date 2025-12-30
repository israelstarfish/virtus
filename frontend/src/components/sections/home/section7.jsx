//frontend/src/components/sections/home/section7.jsx

'use client';

import Image from 'next/image';
import { messages } from '@/app/[lang]/messages/home/section7';

export default function Section7({ lang }) {
  const dict = messages[lang] || messages['pt-br'];

  return (
    <div className="container relative py-16 md:mt-16 md:mb-16 md:py-32">
      {/* Blobs de fundo */}
      <div className="absolute right-[90%] bottom-[75%] size-40 rounded-full bg-blue-500 blur-[200px]" />
      <div className="absolute right-0 bottom-1/2 size-40 rounded-full bg-purple-500 blur-[200px]" />
      <div className="absolute right-1/2 bottom-0 size-40 rounded-full bg-indigo-500 blur-[200px]" />

      {/* Grid principal */}
      <div className="flex grid-rows-2 flex-col justify-between gap-6 lg:grid lg:grid-rows-1 xl:grid-cols-[1fr_0.75fr_1fr]">

        {/* Imagem mobile */}
        <div className="flex w-full items-center justify-center lg:hidden">
          <div className="relative h-40 w-80 sm:h-50 sm:w-[460px]">
            <Image
              src="/assets/companies/samsung/samsung-ssd.webp"
              alt="Samsung SSD Image"
              width={160}
              height={460}
              className="object-cover object-center select-none pointer-events-none"
              loading="lazy"
              decoding="async"
              draggable={false}
              style={{ color: 'transparent' }}
            />
          </div>
        </div>

        {/* Imagem desktop */}
        <div className="row-span-2 hidden w-full items-center justify-center lg:flex xl:order-2 xl:row-span-1 xl:flex">
          <div className="relative h-[460px] w-40">
            <Image
              src="/assets/companies/samsung/samsung-ssd.webp"
              alt="Samsung SSD Image"
              width={160}
              height={460}
              className="object-cover object-center select-none pointer-events-none"
              loading="lazy"
              decoding="async"
              draggable={false}
              style={{ color: 'transparent' }}
            />
          </div>
        </div>

        {/* Título e CTA */}
        <div className="flex flex-col gap-2 xl:order-1 xl:items-end">
          <span className="font-extrabold text-4xl leading-none md:text-5xl xl:text-right xl:text-6xl bg-gradient-to-br from-blue-500 to-sky-500 bg-clip-text text-transparent">
            {dict.title}
          </span>
          <p className="mt-1.5 text-secondary xl:text-right">{dict.subtitle}</p>
          <a
            href="#"
            className="group/button relative min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4 group mt-2 hidden w-fit lg:flex relative flex items-center"
            role="button"
          >
            <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
              {dict.cta}
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
                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
              </svg>
            </div>
          </a>
        </div>

        {/* Texto técnico */}
        <div className="xl:!col-start-3 order-3 col-start-2 flex flex-col gap-1.5 text-secondary xl:mt-2">
          <span className="font-bold text-lg text-primary lg:text-2xl">
            {dict.techTitle}
          </span>
          <p>{dict.techParagraph1}</p>
          <p>{dict.techParagraph2}</p>
        </div>
      </div>
    </div>
  );
}

//frontend/src/components/sections/section7.jsx

//'use client';
//
//import Image from 'next/image';
//import { messages } from '@/app/[lang]/messages/section7';
//
//export default function Section7({ lang }) {
//  const dict = messages[lang] || messages['pt-br'];
//
//  return (
//    <div className="container relative py-16 md:mt-16 md:mb-16 md:py-32">
//      {/* Blobs de fundo */}
//      <div className="absolute right-[90%] bottom-[75%] size-40 rounded-full bg-blue-500 blur-[200px]" />
//      <div className="absolute right-0 bottom-1/2 size-40 rounded-full bg-purple-500 blur-[200px]" />
//      <div className="absolute right-1/2 bottom-0 size-40 rounded-full bg-indigo-500 blur-[200px]" />
//
//      {/* Grid principal */}
//      <div className="flex grid-rows-2 flex-col justify-between gap-6 lg:grid lg:grid-rows-1 xl:grid-cols-[1fr_0.75fr_1fr]">
//        {/* Imagem mobile */}
//        <div className="flex w-full items-center justify-center lg:hidden">
//          <div className="relative h-40 w-80 sm:h-50 sm:w-115">
//            <img
//              alt="Samsung SSD Image"
//              loading="lazy"
//              decoding="async"
//              className="object-cover object-center"
//              style={{
//                position: 'absolute',
//                height: '100%',
//                width: '100%',
//                left: 0,
//                top: 0,
//                right: 0,
//                bottom: 0,
//                color: 'transparent',
//              }}
//              src="/assets/companies/samsung/samsung-ssd.webp"
//            />
//          </div>
//        </div>
//
//        {/* Imagem desktop */}
//        <div className="row-span-2 hidden w-full items-center justify-center lg:flex xl:order-2 xl:row-span-1 xl:flex">
//          <div className="relative h-115 w-40">
//            <Image
//              alt="Samsung SSD Image"
//              loading="lazy"
//              decoding="async"
//              className="object-cover object-center"
//              style={{
//                position: 'absolute',
//                height: '100%',
//                width: '100%',
//                left: 0,
//                top: 0,
//                right: 0,
//                bottom: 0,
//                color: 'transparent',
//              }}
//              src="/assets/companies/samsung/samsung-ssd.webp"
//            />
//          </div>
//        </div>
//
//        {/* Título e CTA */}
//        <div className="flex flex-col gap-2 xl:order-1 xl:items-end">
//          <span className="font-extrabold text-4xl leading-none md:text-5xl xl:text-right xl:text-6xl bg-gradient-to-br from-blue-500 to-sky-500 bg-clip-text text-transparent">
//            {dict.title}
//          </span>
//          <p className="mt-1.5 text-secondary xl:text-right">{dict.subtitle}</p>
//          <a
//            href="#"
//            className="group/button relative min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4 group mt-2 hidden w-fit lg:flex relative flex items-center"
//            role="button"
//          >
//            <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//              {dict.cta}
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
//        </div>
//
//        {/* Texto técnico */}
//        <div className="xl:!col-start-3 order-3 col-start-2 flex flex-col gap-1.5 text-secondary xl:mt-2">
//          <span className="font-bold text-lg text-primary lg:text-2xl">
//            {dict.techTitle}
//          </span>
//          <p>{dict.techParagraph1}</p>
//          <p>{dict.techParagraph2}</p>
//        </div>
//      </div>
//    </div>
//  );
//}

//frontend/src/components/sections/section7.jsx

//export default function Section7() {
//  return (
//    <div className="container relative py-16 md:mt-16 md:mb-16 md:py-32">
//      {/* Blobs de fundo */}
//      <div className="absolute right-[90%] bottom-[75%] size-40 rounded-full bg-blue-500 blur-[200px]" />
//      <div className="absolute right-0 bottom-1/2 size-40 rounded-full bg-purple-500 blur-[200px]" />
//      <div className="absolute right-1/2 bottom-0 size-40 rounded-full bg-indigo-500 blur-[200px]" />
//
//      {/* Grid principal */}
//      <div className="flex grid-rows-2 flex-col justify-between gap-6 lg:grid lg:grid-rows-1 xl:grid-cols-[1fr_0.75fr_1fr]">
//        {/* Imagem mobile */}
//        <div className="flex w-full items-center justify-center lg:hidden">
//          <div className="relative h-40 w-80 sm:h-50 sm:w-115">
//            <img
//              alt="Samsung SSD Image"
//              loading="lazy"
//              decoding="async"
//              className="object-cover object-center"
//              style={{
//                position: "absolute",
//                height: "100%",
//                width: "100%",
//                left: 0,
//                top: 0,
//                right: 0,
//                bottom: 0,
//                color: "transparent",
//              }}
//              src="/assets/companies/samsung/samsung-ssd.webp"
//            />
//          </div>
//        </div>
//
//        {/* Imagem desktop */}
//        <div className="row-span-2 hidden w-full items-center justify-center lg:flex xl:order-2 xl:row-span-1 xl:flex">
//          <div className="relative h-115 w-40">
//            <img
//              alt="Samsung SSD Image"
//              loading="lazy"
//              decoding="async"
//              className="object-cover object-center"
//              style={{
//                position: "absolute",
//                height: "100%",
//                width: "100%",
//                left: 0,
//                top: 0,
//                right: 0,
//                bottom: 0,
//                color: "transparent",
//              }}
//              src="/assets/companies/samsung/samsung-ssd.webp"
//            />
//          </div>
//        </div>
//
//        {/* Título e CTA */}
//        <div className="flex flex-col gap-2 xl:order-1 xl:items-end">
//          <span className="font-extrabold text-4xl leading-none md:text-5xl xl:text-right xl:text-6xl bg-gradient-to-br from-blue-500 to-sky-500 bg-clip-text text-transparent">
//            Infraestrutura empresarial
//          </span>
//          <p className="mt-1.5 text-secondary xl:text-right">
//            A Virtus Cloud eleva o padrão de infraestrutura com NVMe empresariais da Samsung, projetados para garantir desempenho constante e suporte a cargas de trabalho exigentes.
//          </p>
//          <a
//            href="#"
//            className="group/button relative min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4 group mt-2 hidden w-fit lg:flex relative flex items-center"
//            role="button"
//          >
//            <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//              Hospede agora na Virtus Cloud
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
//        </div>
//
//        {/* Texto técnico */}
//        <div className="xl:!col-start-3 order-3 col-start-2 flex flex-col gap-1.5 text-secondary xl:mt-2">
//          <span className="font-bold text-lg text-primary lg:text-2xl">SSDs NVME de ponta</span>
//          <p>
//            Combinamos a tecnologia de ponta para oferecer infraestrutura confiável e de alto desempenho. Com NVMe empresariais da Samsung, projetados para cargas de trabalho exigentes, garantimos alta velocidade e eficiência em operações críticas. Nossa solução inclui uplinks de 10Gbps por cluster, proporcionando conexões ultrarrápidas e estáveis, ideais para aplicações que exigem baixa latência e alta disponibilidade.
//          </p>
//          <p>
//            Essa configuração avançada é perfeita para negócios que buscam escalar com segurança e agilidade, maximizando resultados. Escolha a Virtus Cloud para transformar sua infraestrutura em uma base robusta, capaz de atender às demandas atuais e futuras do mercado.
//          </p>
//        </div>
//      </div>
//    </div>
//  );
//}
//frontend/src/components/sections/home/section5.jsx

'use client';

import { messages } from '@/app/[lang]/messages/home/section5';

export default function Section5({ lang }) {
  const dict = messages[lang] || messages['pt-br'];

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
            <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl leading-tight">
              {dict.title}
            </h2>
            <h2 className="max-w-lg text-secondary">{dict.description}</h2>
          </div>

          {/* Botão */}
          <a
            href={`/${lang}/blob`}
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
                strokeWidth="1"
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
                <path d="M128,24h0A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm78.36,64H170.71a135.28,135.28,0,0,0-22.3-45.6A88.29,88.29,0,0,1,206.37,88ZM216,128a87.61,87.61,0,0,1-3.33,24H174.16a157.44,157.44,0,0,0,0-48h38.51A87.61,87.61,0,0,1,216,128ZM128,43a115.27,115.27,0,0,1,26,45H102A115.11,115.11,0,0,1,128,43ZM102,168H154a115.11,115.11,0,0,1-26,45A115.27,115.27,0,0,1,102,168Zm-3.9-16a140.84,140.84,0,0,1,0-48h59.88a140.84,140.84,0,0,1,0,48Zm50.35,61.6a135.28,135.28,0,0,0,22.3-45.6h35.66A88.29,88.29,0,0,1,148.41,213.6Z" />
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
                <path d="M98.08,59.41A8,8,0,0,1,96,54V40a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16V72a16,16,0,0,1-16,16H127.61a8,8,0,0,1-5.92-2.62ZM53.92,34.62A8,8,0,1,0,42.08,45.38L102.64,112H24a8,8,0,0,0,0,16H56v32H48a16,16,0,0,0-16,16v32a16,16,0,0,0,16,16H80a16,16,0,0,0,16-16V176a16,16,0,0,0-16-16H72V128h45.19l84.89,93.38a8,8,0,1,0,11.84-10.76ZM232,112H164a8,8,0,0,0,0,16h20v22.83a8,8,0,1,0,16,0V128h32a8,8,0,0,0,0-16Z" />
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
            alt="Blob"
            loading="lazy"
            width={400}
            height={400}
            decoding="async"
            style={{ color: 'transparent' }}
            src="/undraw/services/blob.svg"
          />
        </div>
      </div>
    </section>
  );
}

//export default function Section5() {
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
//              <span className="font-medium">Blob Storage</span>
//            </div>
//            <span className="text-virtus-400 text-xs">|</span>
//            <span className="font-normal text-blue-500">Virtus Cloud</span>
//          </div>
//
//          <div className="space-y-1">
//            <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl leading-tight">
//              Armazenamento de blobs
//            </h2>
//            <h2 className="max-w-lg text-secondary">
//              Experimente uma gestão de ativos sem esforço com nossa solução de armazenamento sem servidor. Armazene e sirva imagens, vídeos e documentos com desempenho e segurança de alto nível, apoiado por uma rede global de entrega de conteúdo. Lançado em 14 de março de 2024 e atualmente em beta, nosso serviço oferece eficiência e confiabilidade de ponta.
//            </h2>
//          </div>
//
//          {/* Botão */}
//          <a
//            href="/pt-br/blob"
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
//                <path d="M128,24h0A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm78.36,64H170.71a135.28,135.28,0,0,0-22.3-45.6A88.29,88.29,0,0,1,206.37,88ZM216,128a87.61,87.61,0,0,1-3.33,24H174.16a157.44,157.44,0,0,0,0-48h38.51A87.61,87.61,0,0,1,216,128ZM128,43a115.27,115.27,0,0,1,26,45H102A115.11,115.11,0,0,1,128,43ZM102,168H154a115.11,115.11,0,0,1-26,45A115.27,115.27,0,0,1,102,168Zm-3.9-16a140.84,140.84,0,0,1,0-48h59.88a140.84,140.84,0,0,1,0,48Zm50.35,61.6a135.28,135.28,0,0,0,22.3-45.6h35.66A88.29,88.29,0,0,1,148.41,213.6Z" />
//              </svg>
//              <div>
//                <h2 className="font-semibold">CDN de baixa latência</h2>
//                <span className="text-secondary text-sm">
//                  Experimente desempenho de baixa latência e alto rendimento com nosso CDN, projetado para integração perfeita com qualquer aplicação para leituras e gravações rápidas e confiáveis.
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
//                <path d="M98.08,59.41A8,8,0,0,1,96,54V40a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16V72a16,16,0,0,1-16,16H127.61a8,8,0,0,1-5.92-2.62ZM53.92,34.62A8,8,0,1,0,42.08,45.38L102.64,112H24a8,8,0,0,0,0,16H56v32H48a16,16,0,0,0-16,16v32a16,16,0,0,0,16,16H80a16,16,0,0,0,16-16V176a16,16,0,0,0-16-16H72V128h45.19l84.89,93.38a8,8,0,1,0,11.84-10.76ZM232,112H164a8,8,0,0,0,0,16h20v22.83a8,8,0,1,0,16,0V128h32a8,8,0,0,0,0-16Z" />
//              </svg>
//              <div>
//                <h2 className="font-semibold">Sem taxas de trânsito</h2>
//                <span className="text-secondary text-sm">
//                  Com taxas ZERO para tráfego de entrada e saída, é simples e econômico armazenar e servir seus ativos sem se preocupar com custos adicionais.
//                </span>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        {/* Imagem ilustrativa */}
//        <div className="hidden items-center lg:flex">
//          <img
//            alt="Blob"
//            loading="lazy"
//            width={400}
//            height={400}
//            decoding="async"
//            style={{ color: "transparent" }}
//            src="/undraw/services/blob.svg"
//          />
//        </div>
//      </div>
//    </section>
//  );
//}
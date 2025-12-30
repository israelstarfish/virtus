// components/upgrade/UpgradeModal.tsx

"use client";

import PlanCard from "./PlanCard";

export default function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* 🔲 Overlay escurecido com blur */}
      <div
        data-state="open"
        data-slot="dialog-overlay"
        className="motion-duration-300 fixed inset-0 z-[500] bg-black/50 backdrop-blur-[1px] data-[state=closed]:motion-opacity-out-0 data-[state=open]:motion-opacity-in-0 transition-opacity"
        style={{ pointerEvents: "auto" }}
        data-aria-hidden="true"
        aria-hidden="true"
      />

      {/* 🧩 Modal principal centralizado */}
      <div
        role="dialog"
        aria-labelledby="upgrade-title"
        aria-describedby="upgrade-description"
        data-state="open"
        className="fixed top-1/2 left-1/2 z-[510] w-full max-w-[800px] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-md bg-gray-900 p-6 text-white shadow-lg motion-duration-300 data-[state=open]:motion-scale-in-95 data-[state=open]:motion-opacity-in-0 transition-all"
        tabIndex={-1}
        style={{ pointerEvents: "auto" }}
      >
        {/* Conteúdo interno */}
        <div className="grid auto-rows-auto overflow-auto">
          <div className="flex flex-col gap-3 px-6 py-6 pb-6 text-left">
            <h2 id="upgrade-title" className="font-semibold text-lg/6 tracking-tight">
              Realizar upgrade do plano
            </h2>
            <p id="upgrade-description" className="text-secondary text-sm" />
          </div>

          <div className="flex flex-col gap-4 px-6 pb-6 text-left text-secondary text-sm -mt-6">
            <div className="h-fit space-y-4 overflow-auto">
              <p className="text-secondary">
                Sua aplicação merece o melhor desempenho e estabilidade para continuar crescendo. Garanta mais memória, recursos exclusivos e suporte dedicado ao escolher o plano ideal para suas necessidades.
              </p>

              <div className="flex flex-col flex-wrap gap-4 sm:flex-row">
                <PlanCard
                  name="Standard"
                  price="R$ 34,90"
                  description="Base sólida para lançar aplicações com performance e escalabilidade. Recursos profissionais essenciais para estabilidade e ótima experiência do usuário."
                  ram="4 - 8 GB"
                  projects="16 - 32"
                  color="52,78,212"
                />
                <PlanCard
                  name="Pro"
                  price="R$ 100,00"
                  description="Performance máxima e confiabilidade para projetos de alta disponibilidade e processamento intenso. Solução completa para negócios que não podem parar."
                  ram="12 - 16 GB"
                  projects="48 - 64"
                  color="247,30,30"
                />
                <PlanCard
                  name="Enterprise"
                  price="R$ 299,90"
                  description="Infraestrutura definitiva para operações sem limites de escala e desempenho, com segurança e suporte premium."
                  ram="32 - 1024 GB"
                  projects="128 - 4096"
                  color="102,36,209"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="group/button inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium outline-none disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] text-secondary hover:bg-virtus-500 hover:text-primary focus-visible:ring-blue-700 p-1 text-xs absolute top-5 right-5 rounded-sm opacity-50 transition-opacity hover:cursor-pointer hover:opacity-100"
          type="button"
          data-slot="dialog-close"
          role="button"
          aria-label="Fechar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
            <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  );
}

//"use client";
//
//import PlanCard from "./PlanCard";
//
//export default function UpgradeModal({ onClose }: { onClose: () => void }) {
//  return (
//    <>
//      {/* 🔲 Overlay escurecido com blur */}
//      <div
//        data-state="open"
//        data-slot="dialog-overlay"
//        className="motion-duration-300 fixed inset-0 z-[500] bg-black/50 backdrop-blur-[1px] data-[state=closed]:opacity-0 data-[state=open]:opacity-100 transition-opacity"
//        style={{ pointerEvents: "auto" }}
//        aria-hidden="true"
//      />
//
//      {/* 🧩 Modal principal */}
//      <div
//        role="dialog"
//        aria-labelledby="upgrade-title"
//        aria-describedby="upgrade-description"
//        data-state="open"
//        className="fixed top-1/2 left-1/2 z-[510] w-full max-w-[800px] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-md bg-gray-900 p-6 text-white shadow-lg motion-duration-300 data-[state=open]:scale-95 data-[state=open]:opacity-100 transition-all"
//      >
//        <h2 id="upgrade-title" className="text-lg font-semibold mb-2">
//          Realizar upgrade do plano
//        </h2>
//        <p id="upgrade-description" className="text-sm text-gray-400 mb-6">
//          Sua aplicação merece o melhor desempenho e estabilidade para continuar crescendo. Garanta mais memória, recursos exclusivos e suporte dedicado ao escolher o plano ideal para suas necessidades.
//        </p>
//
//        <div className="flex flex-wrap gap-4">
//          <PlanCard
//            name="Standard"
//            price="R$ 34,90"
//            description="Base sólida para lançar aplicações com performance e escalabilidade."
//            ram="4 - 8 GB"
//            projects="16 - 32"
//            color="52,78,212"
//          />
//          <PlanCard
//            name="Pro"
//            price="R$ 100,00"
//            description="Performance máxima e confiabilidade para projetos de alta disponibilidade."
//            ram="12 - 16 GB"
//            projects="48 - 64"
//            color="247,30,30"
//          />
//          <PlanCard
//            name="Enterprise"
//            price="R$ 299,90"
//            description="Infraestrutura definitiva para operações sem limites de escala e desempenho."
//            ram="32 - 1024 GB"
//            projects="128 - 4096"
//            color="102,36,209"
//          />
//        </div>
//
//        {/* Botão de fechar */}
//        <button
//          onClick={onClose}
//          className="absolute top-5 right-5 p-1 text-xs rounded-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-opacity"
//          aria-label="Fechar"
//        >
//          <svg width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//            <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
//          </svg>
//        </button>
//      </div>
//    </>
//  );
//}

//"use client";
//
//import PlanCard from "./PlanCard";
//
//export default function UpgradeModal({ onClose }: { onClose: () => void }) {
//  return (
//    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
//      <div
//        role="dialog"
//        aria-labelledby="upgrade-title"
//        aria-describedby="upgrade-description"
//        className="animate-fade-in w-full max-w-[800px] translate-y-0 rounded-md bg-gray-900 p-6 text-white shadow-lg relative"
//      >
//        <h2 id="upgrade-title" className="text-lg font-semibold mb-2">
//          Realizar upgrade do plano
//        </h2>
//        <p id="upgrade-description" className="text-sm text-gray-400 mb-6">
//          Sua aplicação merece o melhor desempenho e estabilidade para continuar crescendo. Garanta mais memória, recursos exclusivos e suporte dedicado ao escolher o plano ideal para suas necessidades.
//        </p>
//
//        <div className="flex flex-wrap gap-4">
//          <PlanCard
//            name="Standard"
//            price="R$ 34,90"
//            description="Base sólida para lançar aplicações com performance e escalabilidade."
//            ram="4 - 8 GB"
//            projects="16 - 32"
//            color="52,78,212"
//          />
//          <PlanCard
//            name="Pro"
//            price="R$ 100,00"
//            description="Performance máxima e confiabilidade para projetos de alta disponibilidade."
//            ram="12 - 16 GB"
//            projects="48 - 64"
//            color="247,30,30"
//          />
//          <PlanCard
//            name="Enterprise"
//            price="R$ 299,90"
//            description="Infraestrutura definitiva para operações sem limites de escala e desempenho."
//            ram="32 - 1024 GB"
//            projects="128 - 4096"
//            color="102,36,209"
//          />
//        </div>
//
//        <button
//          onClick={onClose}
//          className="absolute top-5 right-5 p-1 text-xs rounded-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-opacity"
//          aria-label="Fechar"
//        >
//          <svg width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//            <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
//          </svg>
//        </button>
//      </div>
//    </div>
//  );
//}

// components/upgrade/UpgradeModal.tsx

//"use client";
//
//export default function UpgradeModal({ onClose }: { onClose: () => void }) {
//  return (
//    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
//      {/* Modal container */}
//      <div
//        role="dialog"
//        aria-labelledby="upgrade-title"
//        aria-describedby="upgrade-description"
//        className="animate-fade-in w-full max-w-[800px] translate-y-0 rounded-md bg-gray-900 p-6 text-white shadow-lg"
//      >
//        {/* Título e descrição */}
//        <h2 id="upgrade-title" className="text-lg font-semibold mb-2">
//          Realizar upgrade do plano
//        </h2>
//        <p id="upgrade-description" className="text-sm text-gray-400 mb-6">
//          Sua aplicação merece o melhor desempenho e estabilidade para continuar crescendo. Garanta mais memória, recursos exclusivos e suporte dedicado ao escolher o plano ideal para suas necessidades.
//        </p>
//
//        {/* Cards de plano */}
//        <div className="flex flex-wrap gap-4">
//          <PlanCard
//            name="Standard"
//            price="R$ 34,90"
//            description="Base sólida para lançar aplicações com performance e escalabilidade."
//            ram="4 - 8 GB"
//            projects="16 - 32"
//            color="52,78,212"
//          />
//          <PlanCard
//            name="Pro"
//            price="R$ 100,00"
//            description="Performance máxima e confiabilidade para projetos de alta disponibilidade."
//            ram="12 - 16 GB"
//            projects="48 - 64"
//            color="247,30,30"
//          />
//          <PlanCard
//            name="Enterprise"
//            price="R$ 299,90"
//            description="Infraestrutura definitiva para operações sem limites de escala e desempenho."
//            ram="32 - 1024 GB"
//            projects="128 - 4096"
//            color="102,36,209"
//          />
//        </div>
//
//        {/* Botão de fechar */}
//        <button
//          onClick={onClose}
//          className="absolute top-5 right-5 p-1 text-xs rounded-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-opacity"
//          aria-label="Fechar"
//        >
//          <svg width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//            <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
//          </svg>
//        </button>
//      </div>
//    </div>
//  );
//}
//
//// Subcomponente para cada plano
//function PlanCard({
//  name,
//  price,
//  description,
//  ram,
//  projects,
//  color,
//}: {
//  name: string;
//  price: string;
//  description: string;
//  ram: string;
//  projects: string;
//  color: string;
//}) {
//  return (
//    <div
//      className="flex-1 rounded-md border-2 p-4 bg-gradient-to-b from-[rgba(0,0,0,0.15)] to-transparent"
//      style={{
//        borderColor: `rgba(${color}, 0.25)`,
//        background: `linear-gradient(to bottom, rgba(${color}, 0.15), transparent)`,
//      }}
//    >
//      <div className="space-y-2 mb-4">
//        <div className="flex justify-between items-center">
//          <p className="font-semibold text-base">{name}</p>
//          <p className="font-bold text-xl" style={{ color: `rgb(${color})` }}>
//            {price}
//          </p>
//        </div>
//        <p className="text-sm text-gray-300">{description}</p>
//      </div>
//
//      <div className="grid grid-cols-2 gap-2 mb-4">
//        <PlanFeature label="RAM" value={ram} color={color} />
//        <PlanFeature label="Projetos" value={projects} color={color} />
//      </div>
//
//      <button
//        className="w-full h-9 px-3 text-sm font-normal rounded-md transition-all hover:cursor-pointer"
//        style={{
//          backgroundColor: `rgba(${color}, 0.1)`,
//        }}
//      >
//        Mais Detalhes
//      </button>
//    </div>
//  );
//}
//
//// Subcomponente para cada feature
//function PlanFeature({
//  label,
//  value,
//  color,
//}: {
//  label: string;
//  value: string;
//  color: string;
//}) {
//  return (
//    <div
//      className="flex flex-col items-center rounded-md border-2 px-2 py-2"
//      style={{ borderColor: `rgba(${color}, 0.15)` }}
//    >
//      <p className="text-sm font-medium">{value}</p>
//      <p className="text-xs text-gray-400">{label}</p>
//    </div>
//  );
//}

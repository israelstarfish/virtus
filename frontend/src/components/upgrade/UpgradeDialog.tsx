//frontend/components/upgrade/UpgradeButton.tsx

"use client";

import * as Dialog from "@radix-ui/react-dialog";
import PlanCard from "./PlanCard";
import UpgradeButton from "../buttons/UpgradeButton";

export default function UpgradeDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="bg-transparent border-none p-0"
        >
          <UpgradeButton>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-blue-600">
              <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
            </svg>
            Upgrade
          </UpgradeButton>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[500] bg-black/50 backdrop-blur-[1px] data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />

        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-[510] w-full max-w-[800px] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-md bg-gray-900 p-6 text-white shadow-lg data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
        >
          <Dialog.Title className="text-lg font-semibold mb-2">Realizar upgrade do plano</Dialog.Title>
          <Dialog.Description className="text-sm text-gray-400 mb-6">
            Sua aplicação merece o melhor desempenho e estabilidade para continuar crescendo. Garanta mais memória, recursos exclusivos e suporte dedicado ao escolher o plano ideal para suas necessidades.
          </Dialog.Description>

          <div className="flex flex-wrap gap-4">
            <PlanCard name="Standard" price="R$ 34,90" ram="4 - 8 GB" projects="16 - 32" color="52,78,212" />
            <PlanCard name="Pro" price="R$ 100,00" ram="12 - 16 GB" projects="48 - 64" color="247,30,30" />
            <PlanCard name="Enterprise" price="R$ 299,90" ram="32 - 1024 GB" projects="128 - 4096" color="102,36,209" />
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-5 right-5 p-1 text-xs rounded-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-opacity"
              aria-label="Fechar"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
              </svg>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

//"use client";
//
//import * as Dialog from "@radix-ui/react-dialog";
//import PlanCard from "./PlanCard";
//import UpgradeButton from "../buttons/UpgradeButton"; // ajuste o caminho se necessário
//
//export default function UpgradeDialog() {
//  return (
//    <Dialog.Root>
//      <Dialog.Trigger asChild>
//        <button className="inline-flex items-center gap-2 rounded-md border border-blue-300 bg-transparent px-4 py-2 text-sm text-blue-600 shadow-sm transition-all hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-700">
//          <svg width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-blue-600">
//            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//          </svg>
//          <UpgradeButton />
//        </button>
//      </Dialog.Trigger>
//
//      <Dialog.Portal>
//        <Dialog.Overlay className="fixed inset-0 z-[500] bg-black/50 backdrop-blur-[1px] data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
//
//        <Dialog.Content
//          className="fixed top-1/2 left-1/2 z-[510] w-full max-w-[800px] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-md bg-gray-900 p-6 text-white shadow-lg data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
//        >
//          <Dialog.Title className="text-lg font-semibold mb-2">Realizar upgrade do plano</Dialog.Title>
//          <Dialog.Description className="text-sm text-gray-400 mb-6">
//            Sua aplicação merece o melhor desempenho e estabilidade para continuar crescendo. Garanta mais memória, recursos exclusivos e suporte dedicado ao escolher o plano ideal para suas necessidades.
//          </Dialog.Description>
//
//          <div className="flex flex-wrap gap-4">
//            <PlanCard name="Standard" price="R$ 34,90" ram="4 - 8 GB" projects="16 - 32" color="52,78,212" />
//            <PlanCard name="Pro" price="R$ 100,00" ram="12 - 16 GB" projects="48 - 64" color="247,30,30" />
//            <PlanCard name="Enterprise" price="R$ 299,90" ram="32 - 1024 GB" projects="128 - 4096" color="102,36,209" />
//          </div>
//
//          <Dialog.Close asChild>
//            <button
//              className="absolute top-5 right-5 p-1 text-xs rounded-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-opacity"
//              aria-label="Fechar"
//            >
//              <svg width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
//              </svg>
//            </button>
//          </Dialog.Close>
//        </Dialog.Content>
//      </Dialog.Portal>
//    </Dialog.Root>
//  );
//}

//"use client";
//
//import * as Dialog from "@radix-ui/react-dialog";
//import PlanCard from "./PlanCard";
//
//export default function UpgradeDialog() {
//  return (
//    <Dialog.Root>
//      <Dialog.Trigger asChild>
//        <button className="inline-flex items-center gap-2 rounded-md border border-blue-300 bg-transparent px-4 py-2 text-sm text-blue-600 shadow-sm transition-all hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-700">
//          <svg width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-blue-600">
//            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//          </svg>
//          Upgrade
//        </button>
//      </Dialog.Trigger>
//
//      <Dialog.Portal>
//        <Dialog.Overlay className="fixed inset-0 z-[500] bg-black/50 backdrop-blur-[1px] data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
//
//        <Dialog.Content
//          className="fixed top-1/2 left-1/2 z-[510] w-full max-w-[800px] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-md bg-gray-900 p-6 text-white shadow-lg data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
//        >
//          <Dialog.Title className="text-lg font-semibold mb-2">Realizar upgrade do plano</Dialog.Title>
//          <Dialog.Description className="text-sm text-gray-400 mb-6">
//            Sua aplicação merece o melhor desempenho e estabilidade para continuar crescendo. Garanta mais memória, recursos exclusivos e suporte dedicado ao escolher o plano ideal para suas necessidades.
//          </Dialog.Description>
//
//          <div className="flex flex-wrap gap-4">
//            <PlanCard name="Standard" price="R$ 34,90" ram="4 - 8 GB" projects="16 - 32" color="52,78,212" />
//            <PlanCard name="Pro" price="R$ 100,00" ram="12 - 16 GB" projects="48 - 64" color="247,30,30" />
//            <PlanCard name="Enterprise" price="R$ 299,90" ram="32 - 1024 GB" projects="128 - 4096" color="102,36,209" />
//          </div>
//
//          <Dialog.Close asChild>
//            <button
//              className="absolute top-5 right-5 p-1 text-xs rounded-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-opacity"
//              aria-label="Fechar"
//            >
//              <svg width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
//              </svg>
//            </button>
//          </Dialog.Close>
//        </Dialog.Content>
//      </Dialog.Portal>
//    </Dialog.Root>
//  );
//}
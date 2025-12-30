
//frontend/src/app/{lang}/test/page.tsx

"use client";

import { useState } from "react";
import { UpgradeModal} from "@/components/upgrade";
import { UpgradeButton } from "@/components/buttons";
import '../../styles/virtus.css';

export default function UpgradeDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botão de abertura */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-transparent border-none p-0"
      >
        <UpgradeButton>
          <svg
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 256 256"
            className="text-blue-600"
          >
            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
          </svg>
          Upgrade
        </UpgradeButton>
      </button>

      {/* Modal */}
      {open && <UpgradeModal onClose={() => setOpen(false)} />}
    </>
  );
}

//"use client";
//
//import { UpgradeDialog } from "@/components/upgrade";
//import '../../styles/virtus.css';
//
//export default function TestOverlayPage() {
//  return (
//    <main className="min-h-screen bg-gray-100 p-10">
//      <h1 className="text-2xl font-bold mb-6">🧪 Teste de Overlay com Modal</h1>
//
//      <p className="mb-4 text-gray-600">
//        Clique no botão abaixo para abrir o modal com overlay escurecido e animação suave.
//      </p>
//
//      <UpgradeDialog />
//
//      <div className="mt-10 text-sm text-gray-500">
//        Essa página está usando <code>@radix-ui/react-dialog</code> com <code>tailwindcss-animate</code> para animar o overlay e o conteúdo do modal.
//      </div>
//    </main>
//  );
//}

// import { UpgradeDialog } from "@/components/upgrade";UpgradeModalUpgradeButton

//"use client";
//
//import { UpgradeDialog } from "@/components/upgrade";
//
//export default function TestButtonsPage() {
//  return (
//    <main className="min-h-screen bg-gray-100 p-10">
//      <h1 className="text-2xl font-bold mb-6">🧪 Galeria de Botões</h1>
//
//      <UpgradeDialog />
//    </main>
//  );
//}

//"use client";
//
//import { UpgradeDialog } from "../../../components/upgrade";
//
//export default function TestButtonsPage() {
//  return (
//    <main className="min-h-screen bg-gray-100 p-10">
//      <h1 className="text-2xl font-bold mb-6">🧪 Galeria de Botões</h1>
//
//      <UpgradeDialog />
//    </main>
//  );
//}

//"use client";
//
//import { useState } from "react";
//import UpgradeButton from "@/components/buttons/UpgradeButton";
//import { UpgradeModal } from "@/components/upgrade";
//
//export default function TestButtonsPage() {
//  const [showModal, setShowModal] = useState(false);
//
//  return (
//    <main className="min-h-screen bg-gray-100 p-10">
//      <h1 className="text-2xl font-bold mb-6">🧪 Galeria de Botões</h1>
//
//      <UpgradeButton onClick={() => setShowModal(true)} />
//
//      {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}
//    </main>
//  );
//}
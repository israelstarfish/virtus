// components/OverlayPlanos.tsx
"use client";

import { useState } from "react";

export default function OverlayPlanos() {
  const [mostrarOverlay, setMostrarOverlay] = useState(false);

  const handleMostrarOverlay = () => {
    setMostrarOverlay(!mostrarOverlay);
  };

  return (
    <div>
      <button
        onClick={handleMostrarOverlay}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Ver planos
      </button>

      {mostrarOverlay && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={handleMostrarOverlay}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-md max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Planos disponíveis</h2>
            <ul className="space-y-2 mb-4">
              <li>Plano básico: R$ 10,00/mês</li>
              <li>Plano premium: R$ 20,00/mês</li>
              <li>Plano empresarial: R$ 50,00/mês</li>
            </ul>
            <button
              onClick={handleMostrarOverlay}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
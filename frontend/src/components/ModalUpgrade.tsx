"use client";

import { useState, useEffect } from "react";

export default function ModalUpgrade() {
  const [aberto, setAberto] = useState(false);

  // Bloqueia scroll do body quando modal está aberto
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [aberto]);

  return (
    <div>
      <button
        onClick={() => setAberto(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Upgrade
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setAberto(false)}
        >
          <div
            className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Realizar upgrade de plano</h2>
            <p className="text-gray-600 mb-6">
              Sua aplicação merece o melhor desempenho e estabilidade para continuar crescendo.
            </p>

            <div className="grid gap-4">
              <PlanoCard
                nome="Standard"
                preco="R$ 34,90"
                ram="4 - 8 GB"
                projetos="16 - 32"
                cor="bg-gray-800 text-white"
              />
              <PlanoCard
                nome="Pro"
                preco="R$ 100,00"
                ram="12 - 16 GB"
                projetos="48 - 64"
                cor="bg-red-800 text-white"
              />
              <PlanoCard
                nome="Enterprise"
                preco="R$ 299,90"
                ram="32 - 1024 GB"
                projetos="128 - 4096"
                cor="bg-purple-800 text-white"
              />
            </div>

            <button
              onClick={() => setAberto(false)}
              className="mt-6 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanoCard({ nome, preco, ram, projetos, cor }: { nome: string; preco: string; ram: string; projetos: string; cor: string }) {
  return (
    <div className={`rounded-md p-4 ${cor}`}>
      <h3 className="text-lg font-semibold">{nome}</h3>
      <p className="text-sm mb-2">{preco}</p>
      <ul className="text-xs space-y-1">
        <li>💾 RAM: {ram}</li>
        <li>📁 Projetos: {projetos}</li>
      </ul>
      <button className="mt-2 text-sm underline hover:text-blue-300 transition">Mais Detalhes →</button>
    </div>
  );
}
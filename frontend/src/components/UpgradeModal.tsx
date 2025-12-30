// components/UpgradeModal.tsx
export default function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      className="fixed top-1/2 left-1/2 z-[510] w-full max-w-[800px] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-md bg-gray-900 p-6 text-white shadow-lg"
    >
      <h2 className="text-lg font-semibold mb-2">Realizar upgrade do plano</h2>
      <p className="text-sm text-gray-400 mb-6">
        Sua aplicação merece o melhor desempenho e estabilidade para continuar crescendo...
      </p>

      {/* Cards de plano aqui... */}

      {/* Botão de fechar */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-1 text-xs rounded-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-opacity"
        aria-label="Fechar"
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
          <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
        </svg>
      </button>
    </div>
  );
}
//frontend/components/buttons/UpgradeButton.tsx

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function UpgradeButton({ children, className }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border border-blue-300 bg-transparent px-4 py-2 text-sm text-blue-600 shadow-sm transition-all hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-700 ${className}`}
    >
      {children}
    </span>
  );
}

//type Props = {
//  onClick?: () => void;
//};
//
//export default function UpgradeButton({ onClick }: Props) {
//  return (
//    <button
//      onClick={onClick}
//      className="inline-flex items-center gap-2 rounded-md border border-blue-300 bg-transparent px-4 py-2 text-sm text-blue-600 shadow-sm transition-all hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-700"
//    >
//      <svg width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-blue-600">
//        <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//      </svg>
//      Upgrade
//    </button>
//  );
//}

//export default function UpgradeButton({ onClick }: { onClick: () => void }) {
//  return (
//    <button
//      onClick={onClick}
//      className="inline-flex items-center gap-2 rounded-md border border-blue-300 bg-transparent px-4 py-2 text-sm text-blue-600 shadow-sm transition-all hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-700"
//    >
//      <svg width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-blue-600">
//        <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//      </svg>
//      Upgrade
//    </button>
//  );
//}

// components/buttons/UpgradeButton.tsx

//export default function UpgradeButton() {
//  return (
//    <button
//      className="inline-flex items-center gap-2 rounded-md border border-blue-300 bg-transparent px-4 py-2 text-sm text-blue-600 shadow-sm transition-all hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-700"
//    >
//      {/* Ícone de seta para cima */}
//      <svg
//        xmlns="http://www.w3.org/2000/svg"
//        width="20"
//        height="20"
//        fill="currentColor"
//        viewBox="0 0 256 256"
//        className="text-blue-600"
//      >
//        <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//      </svg>
//      Upgrade
//    </button>
//  );
//}
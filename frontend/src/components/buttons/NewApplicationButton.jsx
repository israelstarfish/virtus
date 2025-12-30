//frontend/src/components/buttons/NewApplicationButton.jsx

'use client';

import { useRouter } from 'next/router';

export default function NewApplicationButton() {
  const router = useRouter();
  const { locale } = router;

  const handleClick = () => {
    router.push(`/${locale}/upload`);
  };

  return (
    <button
      onClick={handleClick}
      className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 w-52 flex-auto"
      role="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 256 256"
      >
        <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
      </svg>
      Nova aplicação
      <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]"></div>
    </button>
  );
}
import Image from "next/image";

export default function LanguageSwitcher() {
  return (
    <button
      type="button"
      className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
    >
      <Image
        alt="pt-br"
        width={24}
        height={24}
        className="size-6 shrink-0 select-none"
        src="/assets/countries/pt-br.svg"
      />
    </button>
  );
}
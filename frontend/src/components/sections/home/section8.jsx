//frontend/src/components/sections/home/section8.jsx

export default function Section8() {
  return (
    <div className="relative py-24 sm:py-48">
      <section className="container flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="relative flex flex-col gap-6 sm:mr-16">
          {/* CEO e cargo */}
          <div className="flex w-full gap-2">
            <div className="size-6 overflow-hidden rounded-full">
              <img
                alt="Virtus Cloud's CEO"
                loading="lazy"
                width={24}
                height={24}
                decoding="async"
                className="object-contain"
                style={{ color: "transparent" }}
                src="/_next/image?url=%2Fassets%2Fvirtuscloud-ceo.png&w=48&q=75"
              />
            </div>
            <div className="flex select-none items-center gap-2">
              <span className="font-semibold text-primary text-sm">Israel Macyel</span>
              <span className="h-4 w-0.5 bg-virtus-400" />
              <span className="text-secondary text-sm">CEO da Virtus Cloud</span>
            </div>
          </div>

          {/* Ícone decorativo */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            fill="currentColor"
            viewBox="0 0 256 256"
            className="-right-2 sm:-right-16 absolute top-2 size-8 text-blue-700 sm:size-10 lg:size-12"
          >
            <path d="M116,72v88a48.05,48.05,0,0,1-48,48,8,8,0,0,1,0-16,32,32,0,0,0,32-32v-8H40a16,16,0,0,1-16-16V72A16,16,0,0,1,40,56h60A16,16,0,0,1,116,72ZM216,56H156a16,16,0,0,0-16,16v64a16,16,0,0,0,16,16h60v8a32,32,0,0,1-32,32,8,8,0,0,0,0,16,48.05,48.05,0,0,0,48-48V72A16,16,0,0,0,216,56Z" />
          </svg>

          {/* Título com destaque */}
          <h2
            aria-label="Sua aplicação merece o serviço que faz a diferença!"
            className="font-extrabold text-3xl sm:text-4xl lg:text-6xl"
          >
            <span className="flex flex-col text-primary">
              Sua aplicação merece o serviço{" "}
              <span className="relative block text-blue-700">
                que faz a diferença!
                <div className="absolute inset-0 top-1/2 block max-h-2 w-full bg-blue-700 blur-[50px]" />
              </span>
            </span>
          </h2>

          {/* Botão CTA */}
          <div className="mt-4 w-full">
            <a
              href="/pt-br/pricing"
              className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-blue-700 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4 group relative flex items-center"
              role="button"
            >
              <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
                Comece com a Virtus Cloud
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
                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
                </svg>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
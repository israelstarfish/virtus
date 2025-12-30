//frontend/src/components/sections/home/section4.jsx

'use client';

import { messages } from '@/app/[lang]/messages/home/section4';

export default function Section4({ lang }) {
    const dict = messages[lang] || messages['pt-br'];

    return (
        <section className="container relative my-24 px-4 sm:my-48 sm:px-6">
            <div className="flex justify-between">
                {/* Texto à esquerda */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-blue-500">
                            <img
                                alt="Virtus Cloud Logo"
                                loading="lazy"
                                width={16}
                                height={16}
                                decoding="async"
                                style={{ color: 'transparent' }}
                                src="/assets/logo.jpg"
                            />
                            <span className="font-medium">{dict.label}</span>
                        </div>
                        <span className="text-virtus-400 text-xs">|</span>
                        <span className="font-normal text-blue-500">Virtus Cloud</span>
                    </div>

                    <div className="space-y-1">
                        <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl leading-tight">
                            {dict.title}
                        </h2>
                        <h2 className="max-w-lg text-secondary">{dict.description}</h2>
                    </div>

                    {/* Botão */}
                    <a
                        href={`/${lang}/sites`}
                        className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 group relative flex items-center"
                        role="button"
                    >
                        <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
                            {dict.explore}
                        </span>
                        <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                fill="currentColor"
                                viewBox="0 0 256 256"
                                strokeWidth="1" // ← CORRETO
                            >
                                <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
                            </svg>
                        </div>
                    </a>

                    {/* Benefícios */}
                    <div className="mt-6 flex flex-col gap-4 md:flex-row">
                        <div className="flex-1 space-y-2 rounded-md border border-virtus-700 p-4 md:max-w-60">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="currentColor"
                                viewBox="0 0 256 256"
                                className="text-blue-500"
                            >
                                <path d="M126.42,24C70.73,24.85,25.21,70.09,24,125.81a103.53,103.53,0,0,0,13.52,53.54,4,4,0,0,0,7.1-.3,119.35,119.35,0,0,0,11.37-51A71.77,71.77,0,0,1,83,71.83a8,8,0,1,1,9.86,12.61A55.82,55.82,0,0,0,72,128.07a135.28,135.28,0,0,1-18.45,68.35,4,4,0,0,0,.61,4.85c2,2,4.09,4,6.25,5.82a4,4,0,0,0,6-1A151.18,151.18,0,0,0,85,158.49a8,8,0,1,1,15.68,3.19,167.33,167.33,0,0,1-21.07,53.64,4,4,0,0,0,1.6,5.63c2.47,1.25,5,2.41,7.57,3.47a4,4,0,0,0,5-1.61A183,183,0,0,0,120,128.28a8.16,8.16,0,0,1,7.44-8.21,8,8,0,0,1,8.56,8,198.94,198.94,0,0,1-25.21,97.16,4,4,0,0,0,2.95,5.92q4.55.63,9.21.86a4,4,0,0,0,3.67-2.1A214.88,214.88,0,0,0,152,128.8c.05-13.25-10.3-24.49-23.54-24.74A24,24,0,0,0,104,128a8.1,8.1,0,0,1-7.29,8,8,8,0,0,1-8.71-8,40,40,0,0,1,40.42-40c22,.23,39.68,19.17,39.57,41.16a231.37,231.37,0,0,1-20.52,94.57,4,4,0,0,0,4.62,5.51,103.49,103.49,0,0,0,10.26-3,4,4,0,0,0,2.35-2.22,243.76,243.76,0,0,0,11.48-34,8,8,0,1,1,15.5,4q-1.12,4.37-2.4,8.7a4,4,0,0,0,6.46,4.17A104,104,0,0,0,126.42,24Z" />
                            </svg>
                            <div>
                                <h2 className="font-semibold">{dict.benefit1_title}</h2>
                                <span className="text-secondary text-sm">
                                    {dict.benefit1_description}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-2 rounded-md border border-virtus-700 p-4 md:max-w-60">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="currentColor"
                                viewBox="0 0 256 256"
                                className="text-blue-500"
                            >
                                <path d="M232,64a32,32,0,1,0-40,31v17a8,8,0,0,1-8,8H96a23.84,23.84,0,0,0-8,1.38V95a32,32,0,1,0-16,0v66a32,32,0,1,0,16,0V144a8,8,0,0,1,8-8h88a24,24,0,0,0,24-24V95A32.06,32.06,0,0,0,232,64ZM64,64A16,16,0,1,1,80,80,16,16,0,0,1,64,64ZM96,192a16,16,0,1,1-16-16A16,16,0,0,1,96,192Z" />
                            </svg>
                            <div>
                                <h2 className="font-semibold">{dict.benefit2_title}</h2>
                                <span className="text-secondary text-sm">
                                    {dict.benefit2_description}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Imagem ilustrativa */}
                <div className="hidden items-center lg:flex">
                    <img
                        alt="Sites"
                        loading="lazy"
                        width={400}
                        height={400}
                        decoding="async"
                        style={{ color: 'transparent' }}
                        src="/undraw/services/sites.svg"
                    />
                </div>
            </div>
        </section>
    );
}

//export default function Section4() {
//    return (
//        <section className="container relative my-24 px-4 sm:my-48 sm:px-6">
//            <div className="flex justify-between">
//                {/* Texto à esquerda */}
//                <div className="flex flex-col gap-4">
//                    <div className="flex items-center gap-3">
//                        <div className="flex items-center gap-2 text-blue-500">
//                            <img
//                                alt="Virtus Cloud Logo"
//                                loading="lazy"
//                                width={16}
//                                height={16}
//                                decoding="async"
//                                style={{ color: "transparent" }}
//                                src="/assets/logo.jpg"
//                            />
//                            <span className="font-medium">Websites</span>
//                        </div>
//                        <span className="text-virtus-400 text-xs">|</span>
//                        <span className="font-normal text-blue-500">Virtus Cloud</span>
//                    </div>
//
//                    <div className="space-y-1">
//                        <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl leading-tight">
//                            Hospedagem de Sites
//                        </h2>
//                        <h2 className="max-w-lg text-secondary">
//                            Eleve seu site com nossa plataforma de hospedagem versátil, oferecendo suporte completo para os principais frameworks como Next.js, Vite e VueJS. Aproveite uma hospedagem eficiente e sem problemas, com uma rede global de entrega de conteúdo sem custo adicional, garantindo desempenho e confiabilidade excepcionais.
//                        </h2>
//                    </div>
//
//                    {/* Botão */}
//                    <a
//                        href="/pt-br/sites"
//                        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-blue-700 h-10 px-4"
//                        role="button"
//                    >
//                        <span className="mx-[13px] transition-all duration-400 group-hover:mx-0 group-hover:mr-[26px]">
//                            Explore mais
//                        </span>
//                        <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-0 transition-all duration-400 ease-in-out group-hover:right-4 group-hover:opacity-100">
//                            <svg
//                                xmlns="http://www.w3.org/2000/svg"
//                                width="18"
//                                height="18"
//                                fill="currentColor"
//                                viewBox="0 0 256 256"
//                                strokeWidth="1"
//                            >
//                                <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//                            </svg>
//                        </div>
//                    </a>
//
//                    {/* Benefícios */}
//                    <div className="mt-6 flex flex-col gap-4 md:flex-row">
//                        <div className="flex-1 space-y-2 rounded-md border border-virtus-700 p-4 md:max-w-60">
//                            <svg
//                                xmlns="http://www.w3.org/2000/svg"
//                                width="24"
//                                height="24"
//                                fill="currentColor"
//                                viewBox="0 0 256 256"
//                                className="text-blue-500"
//                            >
//                                <path d="M126.42,24C70.73,24.85,25.21,70.09,24,125.81a103.53,103.53,0,0,0,13.52,53.54,4,4,0,0,0,7.1-.3,119.35,119.35,0,0,0,11.37-51A71.77,71.77,0,0,1,83,71.83a8,8,0,1,1,9.86,12.61A55.82,55.82,0,0,0,72,128.07a135.28,135.28,0,0,1-18.45,68.35,4,4,0,0,0,.61,4.85c2,2,4.09,4,6.25,5.82a4,4,0,0,0,6-1A151.18,151.18,0,0,0,85,158.49a8,8,0,1,1,15.68,3.19,167.33,167.33,0,0,1-21.07,53.64,4,4,0,0,0,1.6,5.63c2.47,1.25,5,2.41,7.57,3.47a4,4,0,0,0,5-1.61A183,183,0,0,0,120,128.28a8.16,8.16,0,0,1,7.44-8.21,8,8,0,0,1,8.56,8,198.94,198.94,0,0,1-25.21,97.16,4,4,0,0,0,2.95,5.92q4.55.63,9.21.86a4,4,0,0,0,3.67-2.1A214.88,214.88,0,0,0,152,128.8c.05-13.25-10.3-24.49-23.54-24.74A24,24,0,0,0,104,128a8.1,8.1,0,0,1-7.29,8,8,8,0,0,1-8.71-8,40,40,0,0,1,40.42-40c22,.23,39.68,19.17,39.57,41.16a231.37,231.37,0,0,1-20.52,94.57,4,4,0,0,0,4.62,5.51,103.49,103.49,0,0,0,10.26-3,4,4,0,0,0,2.35-2.22,243.76,243.76,0,0,0,11.48-34,8,8,0,1,1,15.5,4q-1.12,4.37-2.4,8.7a4,4,0,0,0,6.46,4.17A104,104,0,0,0,126.42,24Z" />
//                            </svg>
//                            <div>
//                                <h2 className="font-semibold">Segurança</h2>
//                                <span className="text-secondary text-sm">
//                                    Nossa solução abrangente inclui um firewall premium para proteger seu site contra ataques e acesso não autorizado e um serviço DNS premium para garantir conexões rápidas e confiáveis para seus usuários.
//                                </span>
//                            </div>
//                        </div>
//
//                        <div className="flex-1 space-y-2 rounded-md border border-virtus-700 p-4 md:max-w-60">
//                            <svg
//                                xmlns="http://www.w3.org/2000/svg"
//                                width="24"
//                                height="24"
//                                fill="currentColor"
//                                viewBox="0 0 256 256"
//                                className="text-blue-500"
//                            >
//                                <path d="M232,64a32,32,0,1,0-40,31v17a8,8,0,0,1-8,8H96a23.84,23.84,0,0,0-8,1.38V95a32,32,0,1,0-16,0v66a32,32,0,1,0,16,0V144a8,8,0,0,1,8-8h88a24,24,0,0,0,24-24V95A32.06,32.06,0,0,0,232,64ZM64,64A16,16,0,1,1,80,80,16,16,0,0,1,64,64ZM96,192a16,16,0,1,1-16-16A16,16,0,0,1,96,192Z" />
//                            </svg>
//                            <div>
//                                <h2 className="font-semibold">Implantações GitHub e CLI</h2>
//                                <span className="text-secondary text-sm">
//                                    Implante automaticamente sempre que você fizer uma alteração, garantindo que suas atualizações sejam ativas instantaneamente. Aproveite a integração perfeita e a implantação contínua, mantendo seus projetos atualizados.
//                                </span>
//                            </div>
//                        </div>
//                    </div>
//                </div>
//
//                {/* Imagem ilustrativa */}
//                <div className="hidden items-center lg:flex">
//                    <img
//                        alt="Sites"
//                        loading="lazy"
//                        width={400}
//                        height={400}
//                        decoding="async"
//                        style={{ color: "transparent" }}
//                        src="/undraw/services/sites.svg"
//                    />
//                </div>
//            </div>
//        </section>
//    );
//}
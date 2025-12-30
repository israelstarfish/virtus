"use client";

import MobileDropdown from "./MobileDropdown";
import { BotIcon, SiteIcon, BlobIcon, AnalyticsIcon } from "./icons";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function MobileMenu() {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            {/* Botão hamburguer */}
            <div className="flex items-center gap-4 xl:hidden">
                <button
                    aria-expanded={expanded}
                    aria-label="Abrir navbar"
                    className="group relative size-10 cursor-pointer select-none"
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                >
                    <span
                        className={`absolute left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 ${expanded ? "top-1/2 rotate-45" : "top-[30%] -translate-x-1/2 -translate-y-1/2"
                            }`}
                    />
                    <span
                        className={`absolute left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 ${expanded ? "opacity-0 top-1/2" : "-translate-x-1/2 -translate-y-1/2 top-1/2"
                            }`}
                    />
                    <span
                        className={`absolute left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 ${expanded ? "top-1/2 -rotate-45" : "top-[70%] -translate-x-1/2 -translate-y-1/2"
                            }`}
                    />
                </button>
            </div>

            {/* Menu colapsável */}
            <div
                aria-expanded={expanded}
                className={`w-full flex-auto overflow-y-auto py-4 xl:hidden ${expanded ? "block" : "hidden"
                    }`}
            >
                <div className="flex flex-col gap-2">
                    {/* Usuário + idioma */}
                    <div className="flex gap-2">
                        <button className="group/button h-12 w-full justify-between px-2.5 md:w-fit flex items-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 text-primary text-sm">
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="text-sm leading-none">israelmacyel</span>
                                <span className="text-[10px] text-secondary leading-none">••••••••••••@gmail.com</span>
                            </div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="currentColor"
                                viewBox="0 0 256 256"
                                className="text-secondary transition-transform duration-250"
                            >
                                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                            </svg>
                        </button>
                        <button className="group/button h-12 px-2.5 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600">
                            <Image
                                alt="pt-br"
                                width={24}
                                height={24}
                                className="size-6 shrink-0 select-none"
                                src="/assets/countries/pt-br.svg"
                            />
                        </button>
                    </div>

                    {/* Links principais */}
                    <Link href="/pt-br/pricing" className="w-full rounded-md px-1.5 py-2.5 text-secondary hover:bg-virtus-700 hover:text-primary">
                        Preços
                    </Link>
                    <Link href="/pt-br/enterprise" className="w-full rounded-md px-1.5 py-2.5 text-secondary hover:bg-virtus-700 hover:text-primary">
                        Enterprise
                    </Link>
                    <MobileDropdown
                        title="Serviços"
                        icon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="1em"
                                height="1em"
                                fill="currentColor"
                                viewBox="0 0 256 256"
                                className="relative top-px ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
                            >
                                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                            </svg>
                        }
                        items={[
                            {
                                href: "/pt-br/bots",
                                icon: <BotIcon />,
                                title: "Bots",
                                description: "Hospede seu bot do Discord, WhatsApp, Telegram e muito mais!",
                            },
                            {
                                href: "/pt-br/sites",
                                icon: <SiteIcon />,
                                title: "Sites",
                                description: "Hospede sua API, Dashboard, Lavalink e muito mais!",
                            },
                            {
                                href: "/pt-br/blob",
                                icon: <BlobIcon />,
                                title: "Blob Storage",
                                description: "Armazene arquivos com CDN inclusa de forma simples e eficiente.",
                            },
                            {
                                href: "/pt-br/analytics",
                                icon: <AnalyticsIcon />,
                                title: "Analytics",
                                description: "Monitore tráfego, usuários, erros e desempenho em tempo real.",
                            },
                        ]}
                    />
                    {/* Dropdowns como Serviços, Downloads, Suporte — modularizáveis se quiser */}
                    {/* ... conteúdo omitido para foco, mas posso seguir com eles se quiser */}
                </div>
            </div>
        </>
    );
}
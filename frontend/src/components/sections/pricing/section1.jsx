//frontend/src/components/sections/pricing/section1.jsx

'use client';

import Image from "next/image";
import * as Tooltip from '@radix-ui/react-tooltip';


export default function Section1() {
    return (
        <section
            className="relative flex flex-col gap-4 border-b bg-linear-to-t from-virtus-900 to-background pb-12"
            id="buy"
        >
            <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full stroke-border/25"
            >
                <defs>
                    <pattern
                        id="_S_1_"
                        patternUnits="userSpaceOnUse"
                        width="30"
                        height="30"
                        x="-1"
                        y="-1"
                    >
                        <path d="M.5 30V.5H30" fill="none" strokeDasharray="0"></path>
                    </pattern>
                </defs>
                <rect fill="url(#_S_1_)" width="100%" height="100%" strokeWidth="0"></rect>
            </svg>

            <div className="container z-1 mt-16 mb-4 space-y-6">
                <div className="mx-auto grid max-w-7xl grid-cols-1 items-center">
                    <div className="text-center">
                        <h1 className="font-extrabold text-3xl sm:text-5xl md:text-5xl">
                            <span className="block text-primary xl:inline">
                                Preço acessível e sem surpresas
                            </span>
                        </h1>
                        <p className="text-base text-gray-500 sm:mx-auto sm:max-w-6xl sm:text-lg md:mt-2 md:text-xl">
                            Escolha o plano ideal e impulsione seu negócio com a Virtus Cloud,
                            a plataforma empresarial robusta, com ambientes conteinerizados de
                            alto desempenho e datacenters dedicados para produção e escalabilidade.
                        </p>
                    </div>
                </div>
            </div>
            {/* Switch Mensal/Anual */}
            <div className="flex flex-col">
                <div className="container flex w-full flex-col justify-center gap-4">
                    <div className="relative flex select-none items-center justify-center gap-4">
                        <span className="font-medium text-secondary text-sm transition-colors">
                            Mensal
                        </span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked="true"
                            value="on"
                            className="peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-input"
                        >
                            <span
                                data-state="checked"
                                className="pointer-events-none block size-4.5 rounded-full bg-primary ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
                            ></span>
                        </button>
                        <span className="relative font-medium text-sm transition-colors text-primary">
                            Anual
                            <span className="items-center gap-1.5 font-semibold bg-green-400/25 text-green-500 h-5 rounded-sm px-2 text-xs/5 absolute left-full ml-2 xs:inline hidden text-nowrap">
                                Ganhe até ~4 meses grátis
                            </span>
                        </span>
                    </div>

                    <div className="flex xs:hidden flex-col items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 font-semibold bg-green-400/25 text-green-500 h-5 rounded-sm px-2 text-xs/5 text-nowrap">
                            Ganhe até ~4 meses grátis
                        </span>
                    </div>
                </div>
            </div>

            {/* Container dos planos */}
            <div className="container flex flex-wrap gap-4 pt-18 pb-8">
                {/* Card Basic começa aqui */}
                <div className="min-w-80 flex-1">
                    <div
                        className="relative flex flex-col gap-4 rounded-xl border p-6 h-full bg-background"
                        style={{ "--plan-color": "125,125,125" }}
                    >
                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                            <div className="-inset-x-100 absolute h-10 bg-[rgba(var(--plan-color),1)] blur-[200px]" />
                        </div>

                        <Image
                            alt="basic-1"
                            src="/assets/plans/basic.png"
                            width={32}
                            height={32}
                            className="w-8 h-8"
                            loading="lazy"
                        />


                        <div className="relative flex flex-col gap-1">
                            <p className="font-bold text-primary text-xl sm:text-2xl">Basic</p>
                            <p className="font-normal text-secondary text-sm sm:text-base">
                                Ponto de partida ideal para desenvolvedores e estudantes. Valide ideias,
                                teste tecnologias e hospede projetos pessoais em ambiente acessível.
                            </p>
                        </div>
                        {/* Preço Basic */}
                        <div className="flex h-full flex-col gap-4">
                            <div className="mt-1 flex flex-col justify-between gap-1">
                                <div className="flex h-6 gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted line-through">R$ 9,99</span>
                                        <span className="inline-flex items-center gap-1.5 font-semibold bg-green-400/25 text-green-500 h-5 rounded-sm px-2 text-[10px]/5">
                                            30% de desconto
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-start gap-2 items-baseline">
                                    <span className="font-extrabold text-3xl text-[rgb(var(--plan-color))] sm:text-4xl">
                                        R$ 6,99
                                    </span>
                                    <p className="text-secondary text-xs">por mês pago anualmente</p>
                                </div>
                            </div>
                        </div>

                        {/* Botão Basic */}
                        <div className="w-full space-y-4 rounded-md">
                            <button
                                className="relative inline-flex items-center justify-center gap-2 rounded-md font-medium text-primary h-12 px-6 text-base w-full bg-[rgba(var(--plan-color),0.75)] hover:bg-[rgba(var(--plan-color),0.50)]"
                            >
                                Comece agora
                            </button>
                        </div>

                        {/* Atributos Basic */}
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
                                        Até 8
                                    </span>
                                    <span className="text-muted text-xs uppercase">Projetos</span>
                                </div>

                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
                                        Até 4
                                    </span>
                                    <span className="text-muted text-xs uppercase">Bancos de dados</span>
                                </div>
                            </div>

                            <div className="flex w-full flex-wrap items-center gap-2">
                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
                                    <span className="font-semibold text-primary text-xs md:text-sm">5 - 15 GB</span>
                                    <span className="text-muted text-xs">Blob</span>
                                </div>
                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
                                    <span className="font-semibold text-primary text-xs md:text-sm">1 - 2 GB</span>
                                    <span className="text-muted text-xs">RAM</span>
                                </div>
                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
                                    <span className="font-semibold text-primary text-xs md:text-sm">2</span>
                                    <span className="text-muted text-xs">vCPU</span>
                                </div>
                            </div>
                        </div>
                        {/* Features Basic */}
                        <div className="mt-2 flex flex-col gap-3">
                            <div className="flex items-start gap-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1em"
                                    height="1em"
                                    fill="currentColor"
                                    viewBox="0 0 256 256"
                                    className="size-5 shrink-0 text-green-400"
                                >
                                    <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
                                </svg>
                                <button
                                    data-state="closed"
                                    data-slot="tooltip-trigger"
                                    className="cursor-pointer text-left text-sm underline decoration-square-400 decoration-dashed underline-offset-4"
                                >
                                    Hospedagem de <span className="font-bold">sites e bots</span>
                                </button>
                            </div>
                            <div className="flex items-start gap-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1em"
                                    height="1em"
                                    fill="currentColor"
                                    viewBox="0 0 256 256"
                                    className="size-5 shrink-0 text-green-400"
                                >
                                    <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
                                </svg>
                                <button
                                    data-state="closed"
                                    data-slot="tooltip-trigger"
                                    className="cursor-pointer text-left text-sm underline decoration-square-400 decoration-dashed underline-offset-4"
                                >
                                    Deploy instantâneo via <span className="font-bold">GitHub</span>
                                </button>
                            </div>
                            <div className="flex items-start gap-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1em"
                                    height="1em"
                                    fill="currentColor"
                                    viewBox="0 0 256 256"
                                    className="size-5 shrink-0 text-green-400"
                                >
                                    <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
                                </svg>
                                <button
                                    data-state="closed"
                                    data-slot="tooltip-trigger"
                                    className="cursor-pointer text-left text-sm underline decoration-square-400 decoration-dashed underline-offset-4"
                                >
                                    15 GB de <span className="font-bold">armazenamento no Blob</span>
                                </button>
                            </div>
                            <div className="flex items-start gap-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1em"
                                    height="1em"
                                    fill="currentColor"
                                    viewBox="0 0 256 256"
                                    className="size-5 shrink-0 text-green-400"
                                >
                                    <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
                                </svg>
                                <button
                                    data-state="closed"
                                    data-slot="tooltip-trigger"
                                    className="cursor-pointer text-left text-sm underline decoration-square-400 decoration-dashed underline-offset-4"
                                >
                                    SSD Samsung <span className="font-bold">NVMe Enterprise</span>
                                </button>
                            </div>

                            <div className="flex items-start gap-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1em"
                                    height="1em"
                                    fill="currentColor"
                                    viewBox="0 0 256 256"
                                    className="size-5 shrink-0 text-green-400"
                                >
                                    <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
                                </svg>
                                <button
                                    data-state="closed"
                                    data-slot="tooltip-trigger"
                                    className="cursor-pointer text-left text-sm underline decoration-square-400 decoration-dashed underline-offset-4"
                                >
                                    Firewall <span className="font-bold">Square Cloud WAF</span>
                                </button>
                            </div>
                            <div className="flex items-start gap-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1em"
                                    height="1em"
                                    fill="currentColor"
                                    viewBox="0 0 256 256"
                                    className="size-5 shrink-0 text-green-400"
                                >
                                    <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
                                </svg>
                                <button
                                    data-state="closed"
                                    data-slot="tooltip-trigger"
                                    className="cursor-pointer text-left text-sm underline decoration-square-400 decoration-dashed underline-offset-4"
                                >
                                    Tecnologia exclusiva <span className="font-bold">Auto Restart</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Pro começa aqui */}
                <div className="min-w-80 flex-1">
                    <div
                        className="relative flex flex-col gap-4 rounded-xl border p-6 h-full bg-background"
                        style={{ "--plan-color": "52,78,212" }}
                    >
                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                            <div className="-inset-x-100 absolute h-10 bg-[rgba(var(--plan-color),1)] blur-[200px]" />
                        </div>

                        <Image
                            alt="pro-4"
                            src="/assets/plans/pro.png"
                            width={32}
                            height={32}
                            className="w-8 h-8"
                            loading="lazy"
                        />

                        <div className="absolute top-6 right-6">
                            <div className="flex h-8 items-center gap-2 rounded-md bg-gradient-to-b from-[rgba(var(--plan-color),0.15)] to-[rgba(var(--plan-color),0.35)] px-3">
                                <p className="font-semibold text-[13px] text-primary uppercase">
                                    Mais Popular
                                </p>
                            </div>
                        </div>

                        <div className="relative flex flex-col gap-1">
                            <p className="font-bold text-primary text-xl sm:text-2xl">Pro</p>
                            <p className="font-normal text-secondary text-sm sm:text-base">
                                Base sólida para lançar aplicações com performance e escalabilidade.
                                Recursos profissionais essenciais para estabilidade e ótima experiência do usuário.
                            </p>
                        </div>
                        {/* Preço Pro */}
                        <div className="flex h-full flex-col gap-4">
                            <div className="mt-1 flex flex-col justify-between gap-1">
                                <div className="flex h-6 gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted line-through">R$ 34,90</span>
                                        <span className="inline-flex items-center gap-1.5 font-semibold bg-green-400/25 text-green-500 h-5 rounded-sm px-2 text-[10px]/5">
                                            30% de desconto
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-start gap-2 items-baseline">
                                    <span className="font-extrabold text-3xl text-[rgb(var(--plan-color))] sm:text-4xl">
                                        R$ 24,90
                                    </span>
                                    <p className="text-secondary text-xs">por mês pago anualmente</p>
                                </div>
                            </div>
                        </div>

                        {/* Botão Pro */}
                        <div className="w-full space-y-4 rounded-md">
                            <button
                                className="relative inline-flex items-center justify-center gap-2 rounded-md font-medium text-primary h-12 px-6 text-base w-full bg-[rgba(var(--plan-color),0.75)] hover:bg-[rgba(var(--plan-color),0.50)]"
                            >
                                Comece agora
                            </button>
                        </div>

                        {/* Atributos Pro */}
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
                                        Até 32
                                    </span>
                                    <span className="text-muted text-xs uppercase">Projetos</span>
                                </div>

                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
                                        Até 16
                                    </span>
                                    <span className="text-muted text-xs uppercase">Bancos de dados</span>
                                </div>
                            </div>

                            <div className="flex w-full flex-wrap items-center gap-2">
                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
                                    <span className="font-semibold text-primary text-xs md:text-sm">30 - 100 GB</span>
                                    <span className="text-muted text-xs">Blob</span>
                                </div>
                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
                                    <span className="font-semibold text-primary text-xs md:text-sm">4 - 8 GB</span>
                                    <span className="text-muted text-xs">RAM</span>
                                </div>
                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
                                    <span className="font-semibold text-primary text-xs md:text-sm">4</span>
                                    <span className="text-muted text-xs">vCPU</span>
                                </div>
                            </div>
                        </div>
                        {/* Features Pro */}
                        <div className="mt-2 flex flex-col gap-3">
                            <p className="font-bold text-primary-foreground text-sm">
                                Tudo que o Basic possui, mais:
                            </p>
                            <div className="flex items-start gap-3">
                                <span className="size-5 shrink-0 text-green-400">✔</span>
                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
                                    Configure o seu <span className="font-bold">próprio domínio</span>
                                </button>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="size-5 shrink-0 text-green-400">✔</span>
                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
                                    Network IPv4 dinâmica <span className="font-bold">por projeto</span>
                                </button>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="size-5 shrink-0 text-green-400">✔</span>
                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
                                    Notificações Instantâneas <span className="font-bold">por E-mail</span>
                                </button>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="size-5 shrink-0 text-green-400">✔</span>
                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
                                    Conexão Dedicada de <span className="font-bold">10 Gbps</span>
                                </button>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="size-5 shrink-0 text-green-400">✔</span>
                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
                                    Network priorizada em <span className="font-bold">todos os projetos</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Premium começa aqui */}
                <div className="min-w-80 flex-1">
                    <div
                        className="relative flex flex-col gap-4 rounded-xl border p-6 h-full bg-background"
                        style={{ "--plan-color": "247,30,30" }}
                    >
                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                            <div className="-inset-x-100 absolute h-10 bg-[rgba(var(--plan-color),1)] blur-[200px]" />
                        </div>

                        <Image
                            alt="premium-12"
                            src="/assets/plans/premium.png"
                            width={32}
                            height={32}
                            className="w-8 h-8"
                            loading="lazy"
                        />

                        <div className="relative flex flex-col gap-1">
                            <p className="font-bold text-primary text-xl sm:text-2xl">Premium</p>
                            <p className="font-normal text-secondary text-sm sm:text-base">
                                Performance máxima e confiabilidade para projetos de alta disponibilidade
                                e processamento intenso. Solução completa para negócios que não podem parar.
                            </p>
                        </div>
                        {/* Preço Premium */}
                        <div className="flex h-full flex-col gap-4">
                            <div className="mt-1 flex flex-col justify-between gap-1">
                                <div className="flex h-6 gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted line-through">R$ 100,00</span>
                                        <span className="inline-flex items-center gap-1.5 font-semibold bg-green-400/25 text-green-500 h-5 rounded-sm px-2 text-[10px]/5">
                                            30% de desconto
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-start gap-2 items-baseline">
                                    <span className="font-extrabold text-3xl text-[rgb(var(--plan-color))] sm:text-4xl">
                                        R$ 70,00
                                    </span>
                                    <p className="text-secondary text-xs">por mês pago anualmente</p>
                                </div>
                            </div>
                        </div>

                        {/* Botão Premium */}
                        <div className="w-full space-y-4 rounded-md">
                            <button
                                className="relative inline-flex items-center justify-center gap-2 rounded-md font-medium text-primary h-12 px-6 text-base w-full bg-[rgba(var(--plan-color),0.75)] hover:bg-[rgba(var(--plan-color),0.50)]"
                            >
                                Comece agora
                            </button>
                        </div>

                        {/* Atributos Premium */}
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
                                        Até 64
                                    </span>
                                    <span className="text-muted text-xs uppercase">Projetos</span>
                                </div>

                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
                                        Até 32
                                    </span>
                                    <span className="text-muted text-xs uppercase">Bancos de dados</span>
                                </div>
                            </div>

                            <div className="flex w-full flex-wrap items-center gap-2">
                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
                                    <span className="font-semibold text-primary text-xs md:text-sm">200 - 250 GB</span>
                                    <span className="text-muted text-xs">Blob</span>
                                </div>
                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
                                    <span className="font-semibold text-primary text-xs md:text-sm">12 - 16 GB</span>
                                    <span className="text-muted text-xs">RAM</span>
                                </div>
                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
                                    <span className="font-semibold text-primary text-xs md:text-sm">6 - 8</span>
                                    <span className="text-muted text-xs">vCPU</span>
                                </div>
                            </div>
                        </div>

                        {/* Features Premium */}
                        <div className="mt-2 flex flex-col gap-3">
                            <p className="font-bold text-primary-foreground text-sm">
                                Tudo que o Pro possui, mais:
                            </p>
                            <div className="flex items-start gap-3">
                                <span className="size-5 shrink-0 text-green-400">✔</span>
                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
                                    Snapshots automáticos <span className="font-bold">diários</span>
                                </button>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="size-5 shrink-0 text-green-400">✔</span>
                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
                                    <span className="font-bold">Suporte prioritário</span>, sem tempo de espera
                                </button>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="size-5 shrink-0 text-green-400">✔</span>
                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
                                    <span className="font-bold">Gerencie projetos grandes</span> com sua equipe
                                </button>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="size-5 shrink-0 text-green-400">✔</span>
                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
                                    <span className="font-bold">Processamento turbo</span> para máxima velocidade
                                </button>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="size-5 shrink-0 text-green-400">✔</span>
                                <span className="text-secondary text-sm">
                                    Recursos extras para <span className="font-bold">mais desempenho</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

//frontend/src/components/sections/pricing/section1.jsx
//
//'use client';
//
//import Image from "next/image";
//import * as Tooltip from '@radix-ui/react-tooltip';
//
//
//export default function Section1() {
//    return (
//        <section
//            className="relative flex flex-col gap-4 border-b bg-linear-to-t from-virtus-900 to-background pb-12"
//            id="buy"
//        >
//            <svg
//                aria-hidden="true"
//                className="pointer-events-none absolute inset-0 h-full w-full stroke-border/25"
//            >
//                <defs>
//                    <pattern
//                        id="_S_1_"
//                        patternUnits="userSpaceOnUse"
//                        width="30"
//                        height="30"
//                        x="-1"
//                        y="-1"
//                    >
//                        <path d="M.5 30V.5H30" fill="none" strokeDasharray="0"></path>
//                    </pattern>
//                </defs>
//                <rect fill="url(#_S_1_)" width="100%" height="100%" strokeWidth="0"></rect>
//            </svg>
//
//            <div className="container z-1 mt-16 mb-4 space-y-6">
//                <div className="mx-auto grid max-w-7xl grid-cols-1 items-center">
//                    <div className="text-center">
//                        <h1 className="font-extrabold text-3xl sm:text-5xl md:text-5xl">
//                            <span className="block text-primary xl:inline">
//                                Preço acessível e sem surpresas
//                            </span>
//                        </h1>
//                        <p className="text-base text-gray-500 sm:mx-auto sm:max-w-6xl sm:text-lg md:mt-2 md:text-xl">
//                            Escolha o plano ideal e impulsione seu negócio com a Virtus Cloud,
//                            a plataforma empresarial robusta, com ambientes conteinerizados de
//                            alto desempenho e datacenters dedicados para produção e escalabilidade.
//                        </p>
//                    </div>
//                </div>
//            </div>
//            {/* Switch Mensal/Anual */}
//            <div className="flex flex-col">
//                <div className="container flex w-full flex-col justify-center gap-4">
//                    <div className="relative flex select-none items-center justify-center gap-4">
//                        <span className="font-medium text-secondary text-sm transition-colors">
//                            Mensal
//                        </span>
//                        <button
//                            type="button"
//                            role="switch"
//                            aria-checked="true"
//                            value="on"
//                            className="peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-input"
//                        >
//                            <span
//                                data-state="checked"
//                                className="pointer-events-none block size-4.5 rounded-full bg-primary ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
//                            ></span>
//                        </button>
//                        <span className="relative font-medium text-sm transition-colors text-primary">
//                            Anual
//                            <span className="items-center gap-1.5 font-semibold bg-green-400/25 text-green-500 h-5 rounded-sm px-2 text-xs/5 absolute left-full ml-2 xs:inline hidden text-nowrap">
//                                Ganhe até ~4 meses grátis
//                            </span>
//                        </span>
//                    </div>
//
//                    <div className="flex xs:hidden flex-col items-center gap-2">
//                        <span className="inline-flex items-center gap-1.5 font-semibold bg-green-400/25 text-green-500 h-5 rounded-sm px-2 text-xs/5 text-nowrap">
//                            Ganhe até ~4 meses grátis
//                        </span>
//                    </div>
//                </div>
//            </div>
//
//            {/* Container dos planos */}
//            <div className="container flex flex-wrap gap-4 pt-18 pb-8">
//                {/* Card Basic começa aqui */}
//                <div className="min-w-80 flex-1">
//                    <div
//                        className="relative flex flex-col gap-4 rounded-xl border p-6 h-full bg-background"
//                        style={{ "--plan-color": "125,125,125" }}
//                    >
//                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
//                            <div className="-inset-x-100 absolute h-10 bg-[rgba(var(--plan-color),1)] blur-[200px]" />
//                        </div>
//
//                        <Image
//                            alt="basic-1"
//                            src="/assets/plans/basic.png"
//                            width={32}
//                            height={32}
//                            className="w-8 h-8"
//                            loading="lazy"
//                        />
//
//
//                        <div className="relative flex flex-col gap-1">
//                            <p className="font-bold text-primary text-xl sm:text-2xl">Basic</p>
//                            <p className="font-normal text-secondary text-sm sm:text-base">
//                                Ponto de partida ideal para desenvolvedores e estudantes. Valide ideias,
//                                teste tecnologias e hospede projetos pessoais em ambiente acessível.
//                            </p>
//                        </div>
//                        {/* Preço Basic */}
//                        <div className="flex h-full flex-col gap-4">
//                            <div className="mt-1 flex flex-col justify-between gap-1">
//                                <div className="flex h-6 gap-2">
//                                    <div className="flex items-center gap-2">
//                                        <span className="text-muted line-through">R$ 9,99</span>
//                                        <span className="inline-flex items-center gap-1.5 font-semibold bg-green-400/25 text-green-500 h-5 rounded-sm px-2 text-[10px]/5">
//                                            30% de desconto
//                                        </span>
//                                    </div>
//                                </div>
//
//                                <div className="flex justify-start gap-2 items-baseline">
//                                    <span className="font-extrabold text-3xl text-[rgb(var(--plan-color))] sm:text-4xl">
//                                        R$ 6,99
//                                    </span>
//                                    <p className="text-secondary text-xs">por mês pago anualmente</p>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão Basic */}
//                        <div className="w-full space-y-4 rounded-md">
//                            <button
//                                className="relative inline-flex items-center justify-center gap-2 rounded-md font-medium text-primary h-12 px-6 text-base w-full bg-[rgba(var(--plan-color),0.75)] hover:bg-[rgba(var(--plan-color),0.50)]"
//                            >
//                                Comece agora
//                            </button>
//                        </div>
//
//                        {/* Atributos Basic */}
//                        <div className="flex flex-col gap-2">
//                            <div className="flex gap-2">
//                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
//                                        Até 8
//                                    </span>
//                                    <span className="text-muted text-xs uppercase">Projetos</span>
//                                </div>
//
//                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
//                                        Até 4
//                                    </span>
//                                    <span className="text-muted text-xs uppercase">Bancos de dados</span>
//                                </div>
//                            </div>
//
//                            <div className="flex w-full flex-wrap items-center gap-2">
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">5 - 15 GB</span>
//                                    <span className="text-muted text-xs">Blob</span>
//                                </div>
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">1 - 2 GB</span>
//                                    <span className="text-muted text-xs">RAM</span>
//                                </div>
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">2</span>
//                                    <span className="text-muted text-xs">vCPU</span>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Features Basic */}
//                        <div className="mt-2 flex flex-col gap-3">
//                            <div className="flex items-start gap-3">
//                                <svg
//                                    xmlns="http://www.w3.org/2000/svg"
//                                    width="1em"
//                                    height="1em"
//                                    fill="currentColor"
//                                    viewBox="0 0 256 256"
//                                    className="size-5 shrink-0 text-green-400"
//                                >
//                                    <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
//                                </svg>
//                                <button
//                                    data-state="closed"
//                                    data-slot="tooltip-trigger"
//                                    className="cursor-pointer text-left text-sm underline decoration-square-400 decoration-dashed underline-offset-4"
//                                >
//                                    Hospedagem de <span className="font-bold">sites e bots</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <svg
//                                    xmlns="http://www.w3.org/2000/svg"
//                                    width="1em"
//                                    height="1em"
//                                    fill="currentColor"
//                                    viewBox="0 0 256 256"
//                                    className="size-5 shrink-0 text-green-400"
//                                >
//                                    <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
//                                </svg>
//                                <button
//                                    data-state="closed"
//                                    data-slot="tooltip-trigger"
//                                    className="cursor-pointer text-left text-sm underline decoration-square-400 decoration-dashed underline-offset-4"
//                                >
//                                    Deploy instantâneo via <span className="font-bold">GitHub</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <svg
//                                    xmlns="http://www.w3.org/2000/svg"
//                                    width="1em"
//                                    height="1em"
//                                    fill="currentColor"
//                                    viewBox="0 0 256 256"
//                                    className="size-5 shrink-0 text-green-400"
//                                >
//                                    <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
//                                </svg>
//                                <button
//                                    data-state="closed"
//                                    data-slot="tooltip-trigger"
//                                    className="cursor-pointer text-left text-sm underline decoration-square-400 decoration-dashed underline-offset-4"
//                                >
//                                    15 GB de <span className="font-bold">armazenamento no Blob</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <svg
//                                    xmlns="http://www.w3.org/2000/svg"
//                                    width="1em"
//                                    height="1em"
//                                    fill="currentColor"
//                                    viewBox="0 0 256 256"
//                                    className="size-5 shrink-0 text-green-400"
//                                >
//                                    <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
//                                </svg>
//                                <button
//                                    data-state="closed"
//                                    data-slot="tooltip-trigger"
//                                    className="cursor-pointer text-left text-sm underline decoration-square-400 decoration-dashed underline-offset-4"
//                                >
//                                    SSD Samsung <span className="font-bold">NVMe Enterprise</span>
//                                </button>
//                            </div>
//
//                            <div className="flex items-start gap-3">
//                                <svg
//                                    xmlns="http://www.w3.org/2000/svg"
//                                    width="1em"
//                                    height="1em"
//                                    fill="currentColor"
//                                    viewBox="0 0 256 256"
//                                    className="size-5 shrink-0 text-green-400"
//                                >
//                                    <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
//                                </svg>
//                                <button
//                                    data-state="closed"
//                                    data-slot="tooltip-trigger"
//                                    className="cursor-pointer text-left text-sm underline decoration-square-400 decoration-dashed underline-offset-4"
//                                >
//                                    Firewall <span className="font-bold">Square Cloud WAF</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <svg
//                                    xmlns="http://www.w3.org/2000/svg"
//                                    width="1em"
//                                    height="1em"
//                                    fill="currentColor"
//                                    viewBox="0 0 256 256"
//                                    className="size-5 shrink-0 text-green-400"
//                                >
//                                    <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
//                                </svg>
//                                <button
//                                    data-state="closed"
//                                    data-slot="tooltip-trigger"
//                                    className="cursor-pointer text-left text-sm underline decoration-square-400 decoration-dashed underline-offset-4"
//                                >
//                                    Tecnologia exclusiva <span className="font-bold">Auto Restart</span>
//                                </button>
//                            </div>
//                        </div>
//                    </div>
//                </div>
//
//                {/* Card Pro começa aqui */}
//                <div className="min-w-80 flex-1">
//                    <div
//                        className="relative flex flex-col gap-4 rounded-xl border p-6 h-full bg-background"
//                        style={{ "--plan-color": "52,78,212" }}
//                    >
//                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
//                            <div className="-inset-x-100 absolute h-10 bg-[rgba(var(--plan-color),1)] blur-[200px]" />
//                        </div>
//
//                        <Image
//                            alt="pro-4"
//                            src="/assets/plans/pro.png"
//                            width={32}
//                            height={32}
//                            className="w-8 h-8"
//                            loading="lazy"
//                        />
//
//                        <div className="absolute top-6 right-6">
//                            <div className="flex h-8 items-center gap-2 rounded-md bg-gradient-to-b from-[rgba(var(--plan-color),0.15)] to-[rgba(var(--plan-color),0.35)] px-3">
//                                <p className="font-semibold text-[13px] text-primary uppercase">
//                                    Mais Popular
//                                </p>
//                            </div>
//                        </div>
//
//                        <div className="relative flex flex-col gap-1">
//                            <p className="font-bold text-primary text-xl sm:text-2xl">Pro</p>
//                            <p className="font-normal text-secondary text-sm sm:text-base">
//                                Base sólida para lançar aplicações com performance e escalabilidade.
//                                Recursos profissionais essenciais para estabilidade e ótima experiência do usuário.
//                            </p>
//                        </div>
//                        {/* Preço Pro */}
//                        <div className="flex h-full flex-col gap-4">
//                            <div className="mt-1 flex flex-col justify-between gap-1">
//                                <div className="flex h-6 gap-2">
//                                    <div className="flex items-center gap-2">
//                                        <span className="text-muted line-through">R$ 34,90</span>
//                                        <span className="inline-flex items-center gap-1.5 font-semibold bg-green-400/25 text-green-500 h-5 rounded-sm px-2 text-[10px]/5">
//                                            30% de desconto
//                                        </span>
//                                    </div>
//                                </div>
//
//                                <div className="flex justify-start gap-2 items-baseline">
//                                    <span className="font-extrabold text-3xl text-[rgb(var(--plan-color))] sm:text-4xl">
//                                        R$ 24,90
//                                    </span>
//                                    <p className="text-secondary text-xs">por mês pago anualmente</p>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão Pro */}
//                        <div className="w-full space-y-4 rounded-md">
//                            <button
//                                className="relative inline-flex items-center justify-center gap-2 rounded-md font-medium text-primary h-12 px-6 text-base w-full bg-[rgba(var(--plan-color),0.75)] hover:bg-[rgba(var(--plan-color),0.50)]"
//                            >
//                                Comece agora
//                            </button>
//                        </div>
//
//                        {/* Atributos Pro */}
//                        <div className="flex flex-col gap-2">
//                            <div className="flex gap-2">
//                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
//                                        Até 32
//                                    </span>
//                                    <span className="text-muted text-xs uppercase">Projetos</span>
//                                </div>
//
//                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
//                                        Até 16
//                                    </span>
//                                    <span className="text-muted text-xs uppercase">Bancos de dados</span>
//                                </div>
//                            </div>
//
//                            <div className="flex w-full flex-wrap items-center gap-2">
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">30 - 100 GB</span>
//                                    <span className="text-muted text-xs">Blob</span>
//                                </div>
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">4 - 8 GB</span>
//                                    <span className="text-muted text-xs">RAM</span>
//                                </div>
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">4</span>
//                                    <span className="text-muted text-xs">vCPU</span>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Features Pro */}
//                        <div className="mt-2 flex flex-col gap-3">
//                            <p className="font-bold text-primary-foreground text-sm">
//                                Tudo que o Basic possui, mais:
//                            </p>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    Configure o seu <span className="font-bold">próprio domínio</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    Network IPv4 dinâmica <span className="font-bold">por projeto</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    Notificações Instantâneas <span className="font-bold">por E-mail</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    Conexão Dedicada de <span className="font-bold">10 Gbps</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    Network priorizada em <span className="font-bold">todos os projetos</span>
//                                </button>
//                            </div>
//                        </div>
//                    </div>
//                </div>
//
//                {/* Card Premium começa aqui */}
//                <div className="min-w-80 flex-1">
//                    <div
//                        className="relative flex flex-col gap-4 rounded-xl border p-6 h-full bg-background"
//                        style={{ "--plan-color": "247,30,30" }}
//                    >
//                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
//                            <div className="-inset-x-100 absolute h-10 bg-[rgba(var(--plan-color),1)] blur-[200px]" />
//                        </div>
//
//                        <Image
//                            alt="premium-12"
//                            src="/assets/plans/premium.png"
//                            width={32}
//                            height={32}
//                            className="w-8 h-8"
//                            loading="lazy"
//                        />
//
//                        <div className="relative flex flex-col gap-1">
//                            <p className="font-bold text-primary text-xl sm:text-2xl">Premium</p>
//                            <p className="font-normal text-secondary text-sm sm:text-base">
//                                Performance máxima e confiabilidade para projetos de alta disponibilidade
//                                e processamento intenso. Solução completa para negócios que não podem parar.
//                            </p>
//                        </div>
//                        {/* Preço Premium */}
//                        <div className="flex h-full flex-col gap-4">
//                            <div className="mt-1 flex flex-col justify-between gap-1">
//                                <div className="flex h-6 gap-2">
//                                    <div className="flex items-center gap-2">
//                                        <span className="text-muted line-through">R$ 100,00</span>
//                                        <span className="inline-flex items-center gap-1.5 font-semibold bg-green-400/25 text-green-500 h-5 rounded-sm px-2 text-[10px]/5">
//                                            30% de desconto
//                                        </span>
//                                    </div>
//                                </div>
//
//                                <div className="flex justify-start gap-2 items-baseline">
//                                    <span className="font-extrabold text-3xl text-[rgb(var(--plan-color))] sm:text-4xl">
//                                        R$ 70,00
//                                    </span>
//                                    <p className="text-secondary text-xs">por mês pago anualmente</p>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão Premium */}
//                        <div className="w-full space-y-4 rounded-md">
//                            <button
//                                className="relative inline-flex items-center justify-center gap-2 rounded-md font-medium text-primary h-12 px-6 text-base w-full bg-[rgba(var(--plan-color),0.75)] hover:bg-[rgba(var(--plan-color),0.50)]"
//                            >
//                                Comece agora
//                            </button>
//                        </div>
//
//                        {/* Atributos Premium */}
//                        <div className="flex flex-col gap-2">
//                            <div className="flex gap-2">
//                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
//                                        Até 64
//                                    </span>
//                                    <span className="text-muted text-xs uppercase">Projetos</span>
//                                </div>
//
//                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
//                                        Até 32
//                                    </span>
//                                    <span className="text-muted text-xs uppercase">Bancos de dados</span>
//                                </div>
//                            </div>
//
//                            <div className="flex w-full flex-wrap items-center gap-2">
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">200 - 250 GB</span>
//                                    <span className="text-muted text-xs">Blob</span>
//                                </div>
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">12 - 16 GB</span>
//                                    <span className="text-muted text-xs">RAM</span>
//                                </div>
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">6 - 8</span>
//                                    <span className="text-muted text-xs">vCPU</span>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Features Premium */}
//                        <div className="mt-2 flex flex-col gap-3">
//                            <p className="font-bold text-primary-foreground text-sm">
//                                Tudo que o Pro possui, mais:
//                            </p>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    Snapshots automáticos <span className="font-bold">diários</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    <span className="font-bold">Suporte prioritário</span>, sem tempo de espera
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    <span className="font-bold">Gerencie projetos grandes</span> com sua equipe
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    <span className="font-bold">Processamento turbo</span> para máxima velocidade
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <span className="text-secondary text-sm">
//                                    Recursos extras para <span className="font-bold">mais desempenho</span>
//                                </span>
//                            </div>
//                        </div>
//                    </div>
//                </div>
//            </div>
//        </section>
//    );
//}

//frontend/src/components/sections/pricing/section1.jsx

//'use client';
//
//import Image from "next/image";
//
//export default function Section1() {
//    return (
//        <section
//            className="relative flex flex-col gap-4 border-b bg-linear-to-t from-virtus-900 to-background pb-12"
//            id="buy"
//        >
//            <svg
//                aria-hidden="true"
//                className="pointer-events-none absolute inset-0 h-full w-full stroke-border/25"
//            >
//                <defs>
//                    <pattern
//                        id="_S_1_"
//                        patternUnits="userSpaceOnUse"
//                        width="30"
//                        height="30"
//                        x="-1"
//                        y="-1"
//                    >
//                        <path d="M.5 30V.5H30" fill="none" strokeDasharray="0"></path>
//                    </pattern>
//                </defs>
//                <rect fill="url(#_S_1_)" width="100%" height="100%" strokeWidth="0"></rect>
//            </svg>
//
//            <div className="container z-1 mt-16 mb-4 space-y-6">
//                <div className="mx-auto grid max-w-7xl grid-cols-1 items-center">
//                    <div className="text-center">
//                        <h1 className="font-extrabold text-3xl sm:text-5xl md:text-5xl">
//                            <span className="block text-primary xl:inline">
//                                Preço acessível e sem surpresas
//                            </span>
//                        </h1>
//                        <p className="text-base text-gray-500 sm:mx-auto sm:max-w-6xl sm:text-lg md:mt-2 md:text-xl">
//                            Escolha o plano ideal e impulsione seu negócio com a Virtus Cloud,
//                            a plataforma empresarial robusta, com ambientes conteinerizados de
//                            alto desempenho e datacenters dedicados para produção e escalabilidade.
//                        </p>
//                    </div>
//                </div>
//            </div>
//            {/* Switch Mensal/Anual */}
//            <div className="flex flex-col">
//                <div className="container flex w-full flex-col justify-center gap-4">
//                    <div className="relative flex select-none items-center justify-center gap-4">
//                        <span className="font-medium text-secondary text-sm transition-colors">
//                            Mensal
//                        </span>
//                        <button
//                            type="button"
//                            role="switch"
//                            aria-checked="true"
//                            value="on"
//                            className="peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-input"
//                        >
//                            <span
//                                data-state="checked"
//                                className="pointer-events-none block size-4.5 rounded-full bg-primary ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
//                            ></span>
//                        </button>
//                        <span className="relative font-medium text-sm transition-colors text-primary">
//                            Anual
//                            <span className="items-center gap-1.5 font-semibold bg-green-400/25 text-green-500 h-5 rounded-sm px-2 text-xs/5 absolute left-full ml-2 xs:inline hidden text-nowrap">
//                                Ganhe até ~4 meses grátis
//                            </span>
//                        </span>
//                    </div>
//
//                    <div className="flex xs:hidden flex-col items-center gap-2">
//                        <span className="inline-flex items-center gap-1.5 font-semibold bg-green-400/25 text-green-500 h-5 rounded-sm px-2 text-xs/5 text-nowrap">
//                            Ganhe até ~4 meses grátis
//                        </span>
//                    </div>
//                </div>
//            </div>
//
//            {/* Container dos planos */}
//            <div className="container flex flex-wrap gap-4 pt-18 pb-8">
//                {/* Card Basic começa aqui */}
//                <div className="min-w-80 flex-1">
//                    <div
//                        className="relative flex flex-col gap-4 rounded-xl border p-6 h-full bg-background"
//                        style={{ "--plan-color": "125,125,125" }}
//                    >
//                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
//                            <div className="-inset-x-100 absolute h-10 bg-[rgba(var(--plan-color),1)] blur-[200px]" />
//                        </div>
//
//                        <Image
//                            alt="basic-1"
//                            src="/assets/plans/basic.png"
//                            width={32}
//                            height={32}
//                            className="w-8 h-8"
//                            loading="lazy"
//                        />
//
//
//                        <div className="relative flex flex-col gap-1">
//                            <p className="font-bold text-primary text-xl sm:text-2xl">Basic</p>
//                            <p className="font-normal text-secondary text-sm sm:text-base">
//                                Ponto de partida ideal para desenvolvedores e estudantes. Valide ideias,
//                                teste tecnologias e hospede projetos pessoais em ambiente acessível.
//                            </p>
//                        </div>
//                        {/* Preço Basic */}
//                        <div className="flex h-full flex-col gap-4">
//                            <div className="mt-1 flex flex-col justify-between gap-1">
//                                <div className="flex h-6 gap-2">
//                                    <div className="flex items-center gap-2">
//                                        <span className="text-muted line-through">R$ 9,99</span>
//                                        <span className="inline-flex items-center gap-1.5 font-semibold bg-green-400/25 text-green-500 h-5 rounded-sm px-2 text-[10px]/5">
//                                            30% de desconto
//                                        </span>
//                                    </div>
//                                </div>
//
//                                <div className="flex justify-start gap-2 items-baseline">
//                                    <span className="font-extrabold text-3xl text-[rgb(var(--plan-color))] sm:text-4xl">
//                                        R$ 6,99
//                                    </span>
//                                    <p className="text-secondary text-xs">por mês pago anualmente</p>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão Basic */}
//                        <div className="w-full space-y-4 rounded-md">
//                            <button
//                                className="relative inline-flex items-center justify-center gap-2 rounded-md font-medium text-primary h-12 px-6 text-base w-full bg-[rgba(var(--plan-color),0.75)] hover:bg-[rgba(var(--plan-color),0.50)]"
//                            >
//                                Comece agora
//                            </button>
//                        </div>
//
//                        {/* Atributos Basic */}
//                        <div className="flex flex-col gap-2">
//                            <div className="flex gap-2">
//                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
//                                        Até 8
//                                    </span>
//                                    <span className="text-muted text-xs uppercase">Projetos</span>
//                                </div>
//
//                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
//                                        Até 4
//                                    </span>
//                                    <span className="text-muted text-xs uppercase">Bancos de dados</span>
//                                </div>
//                            </div>
//
//                            <div className="flex w-full flex-wrap items-center gap-2">
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">5 - 15 GB</span>
//                                    <span className="text-muted text-xs">Blob</span>
//                                </div>
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">1 - 2 GB</span>
//                                    <span className="text-muted text-xs">RAM</span>
//                                </div>
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">2</span>
//                                    <span className="text-muted text-xs">vCPU</span>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Features Basic */}
//                        <div className="mt-2 flex flex-col gap-3">
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    Hospedagem de <span className="font-bold">sites e bots</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    Deploy instantâneo via <span className="font-bold">GitHub</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    15 GB de <span className="font-bold">armazenamento no Blob</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    SSD Samsung <span className="font-bold">NVMe Enterprise</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    Firewall <span className="font-bold">Virtus Cloud WAF</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    Tecnologia exclusiva <span className="font-bold">Auto Restart</span>
//                                </button>
//                            </div>
//                        </div>
//                    </div>
//                </div>
//
//                {/* Card Pro começa aqui */}
//                <div className="min-w-80 flex-1">
//                    <div
//                        className="relative flex flex-col gap-4 rounded-xl border p-6 h-full bg-background"
//                        style={{ "--plan-color": "52,78,212" }}
//                    >
//                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
//                            <div className="-inset-x-100 absolute h-10 bg-[rgba(var(--plan-color),1)] blur-[200px]" />
//                        </div>
//
//                        <Image
//                            alt="pro-4"
//                            src="/assets/plans/pro.png"
//                            width={32}
//                            height={32}
//                            className="w-8 h-8"
//                            loading="lazy"
//                        />
//
//                        <div className="absolute top-6 right-6">
//                            <div className="flex h-8 items-center gap-2 rounded-md bg-gradient-to-b from-[rgba(var(--plan-color),0.15)] to-[rgba(var(--plan-color),0.35)] px-3">
//                                <p className="font-semibold text-[13px] text-primary uppercase">
//                                    Mais Popular
//                                </p>
//                            </div>
//                        </div>
//
//                        <div className="relative flex flex-col gap-1">
//                            <p className="font-bold text-primary text-xl sm:text-2xl">Pro</p>
//                            <p className="font-normal text-secondary text-sm sm:text-base">
//                                Base sólida para lançar aplicações com performance e escalabilidade.
//                                Recursos profissionais essenciais para estabilidade e ótima experiência do usuário.
//                            </p>
//                        </div>
//                        {/* Preço Pro */}
//                        <div className="flex h-full flex-col gap-4">
//                            <div className="mt-1 flex flex-col justify-between gap-1">
//                                <div className="flex h-6 gap-2">
//                                    <div className="flex items-center gap-2">
//                                        <span className="text-muted line-through">R$ 34,90</span>
//                                        <span className="inline-flex items-center gap-1.5 font-semibold bg-green-400/25 text-green-500 h-5 rounded-sm px-2 text-[10px]/5">
//                                            30% de desconto
//                                        </span>
//                                    </div>
//                                </div>
//
//                                <div className="flex justify-start gap-2 items-baseline">
//                                    <span className="font-extrabold text-3xl text-[rgb(var(--plan-color))] sm:text-4xl">
//                                        R$ 24,90
//                                    </span>
//                                    <p className="text-secondary text-xs">por mês pago anualmente</p>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão Pro */}
//                        <div className="w-full space-y-4 rounded-md">
//                            <button
//                                className="relative inline-flex items-center justify-center gap-2 rounded-md font-medium text-primary h-12 px-6 text-base w-full bg-[rgba(var(--plan-color),0.75)] hover:bg-[rgba(var(--plan-color),0.50)]"
//                            >
//                                Comece agora
//                            </button>
//                        </div>
//
//                        {/* Atributos Pro */}
//                        <div className="flex flex-col gap-2">
//                            <div className="flex gap-2">
//                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
//                                        Até 32
//                                    </span>
//                                    <span className="text-muted text-xs uppercase">Projetos</span>
//                                </div>
//
//                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
//                                        Até 16
//                                    </span>
//                                    <span className="text-muted text-xs uppercase">Bancos de dados</span>
//                                </div>
//                            </div>
//
//                            <div className="flex w-full flex-wrap items-center gap-2">
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">30 - 100 GB</span>
//                                    <span className="text-muted text-xs">Blob</span>
//                                </div>
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">4 - 8 GB</span>
//                                    <span className="text-muted text-xs">RAM</span>
//                                </div>
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">4</span>
//                                    <span className="text-muted text-xs">vCPU</span>
//                                </div>
//                            </div>
//                        </div>
//                        {/* Features Pro */}
//                        <div className="mt-2 flex flex-col gap-3">
//                            <p className="font-bold text-primary-foreground text-sm">
//                                Tudo que o Basic possui, mais:
//                            </p>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    Configure o seu <span className="font-bold">próprio domínio</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    Network IPv4 dinâmica <span className="font-bold">por projeto</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    Notificações Instantâneas <span className="font-bold">por E-mail</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    Conexão Dedicada de <span className="font-bold">10 Gbps</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    Network priorizada em <span className="font-bold">todos os projetos</span>
//                                </button>
//                            </div>
//                        </div>
//                    </div>
//                </div>
//
//                {/* Card Premium começa aqui */}
//                <div className="min-w-80 flex-1">
//                    <div
//                        className="relative flex flex-col gap-4 rounded-xl border p-6 h-full bg-background"
//                        style={{ "--plan-color": "247,30,30" }}
//                    >
//                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
//                            <div className="-inset-x-100 absolute h-10 bg-[rgba(var(--plan-color),1)] blur-[200px]" />
//                        </div>
//
//                        <Image
//                            alt="premium-12"
//                            src="/assets/plans/premium.png"
//                            width={32}
//                            height={32}
//                            className="w-8 h-8"
//                            loading="lazy"
//                        />
//
//                        <div className="relative flex flex-col gap-1">
//                            <p className="font-bold text-primary text-xl sm:text-2xl">Premium</p>
//                            <p className="font-normal text-secondary text-sm sm:text-base">
//                                Performance máxima e confiabilidade para projetos de alta disponibilidade
//                                e processamento intenso. Solução completa para negócios que não podem parar.
//                            </p>
//                        </div>
//                        {/* Preço Premium */}
//                        <div className="flex h-full flex-col gap-4">
//                            <div className="mt-1 flex flex-col justify-between gap-1">
//                                <div className="flex h-6 gap-2">
//                                    <div className="flex items-center gap-2">
//                                        <span className="text-muted line-through">R$ 100,00</span>
//                                        <span className="inline-flex items-center gap-1.5 font-semibold bg-green-400/25 text-green-500 h-5 rounded-sm px-2 text-[10px]/5">
//                                            30% de desconto
//                                        </span>
//                                    </div>
//                                </div>
//
//                                <div className="flex justify-start gap-2 items-baseline">
//                                    <span className="font-extrabold text-3xl text-[rgb(var(--plan-color))] sm:text-4xl">
//                                        R$ 70,00
//                                    </span>
//                                    <p className="text-secondary text-xs">por mês pago anualmente</p>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Botão Premium */}
//                        <div className="w-full space-y-4 rounded-md">
//                            <button
//                                className="relative inline-flex items-center justify-center gap-2 rounded-md font-medium text-primary h-12 px-6 text-base w-full bg-[rgba(var(--plan-color),0.75)] hover:bg-[rgba(var(--plan-color),0.50)]"
//                            >
//                                Comece agora
//                            </button>
//                        </div>
//
//                        {/* Atributos Premium */}
//                        <div className="flex flex-col gap-2">
//                            <div className="flex gap-2">
//                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
//                                        Até 64
//                                    </span>
//                                    <span className="text-muted text-xs uppercase">Projetos</span>
//                                </div>
//
//                                <div className="flex flex-1 flex-col items-center justify-between rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="flex items-center gap-1.5 font-semibold text-primary text-xs sm:text-sm">
//                                        Até 32
//                                    </span>
//                                    <span className="text-muted text-xs uppercase">Bancos de dados</span>
//                                </div>
//                            </div>
//
//                            <div className="flex w-full flex-wrap items-center gap-2">
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">200 - 250 GB</span>
//                                    <span className="text-muted text-xs">Blob</span>
//                                </div>
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">12 - 16 GB</span>
//                                    <span className="text-muted text-xs">RAM</span>
//                                </div>
//                                <div className="flex flex-1 flex-col justify-center rounded-md border-2 border-[rgba(var(--plan-color),0.15)] px-4 py-2 text-center">
//                                    <span className="font-semibold text-primary text-xs md:text-sm">6 - 8</span>
//                                    <span className="text-muted text-xs">vCPU</span>
//                                </div>
//                            </div>
//                        </div>
//
//                        {/* Features Premium */}
//                        <div className="mt-2 flex flex-col gap-3">
//                            <p className="font-bold text-primary-foreground text-sm">
//                                Tudo que o Pro possui, mais:
//                            </p>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    Snapshots automáticos <span className="font-bold">diários</span>
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    <span className="font-bold">Suporte prioritário</span>, sem tempo de espera
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    <span className="font-bold">Gerencie projetos grandes</span> com sua equipe
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <button className="cursor-pointer text-left text-sm underline decoration-virtus-400 decoration-dashed underline-offset-4">
//                                    <span className="font-bold">Processamento turbo</span> para máxima velocidade
//                                </button>
//                            </div>
//                            <div className="flex items-start gap-3">
//                                <span className="size-5 shrink-0 text-green-400">✔</span>
//                                <span className="text-secondary text-sm">
//                                    Recursos extras para <span className="font-bold">mais desempenho</span>
//                                </span>
//                            </div>
//                        </div>
//                    </div>
//                </div>
//            </div>
//        </section>
//    );
//}
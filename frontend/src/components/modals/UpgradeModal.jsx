//frontend/src/components/modals/UpgradeModal.jsx

'use client';

import { useEffect, useRef } from 'react';

export default function UpgradeModal({ onClose }) {
    const titleRef = useRef(null);
    const modalRef = useRef(null);

    const plans = [
        {
            name: 'Pro',
            price: 'R$ 29,99',
            color: '52,78,212',
            ram: '4 - 8 GB',
            projects: '16 - 32',
            description: 'Base sólida para lançar aplicações com performance e escalabilidade. Recursos profissionais essenciais para estabilidade e ótima experiência do usuário.',
        },
        {
            name: 'Premium',
            price: 'R$ 99,99',
            color: '247,30,30',
            ram: '12 - 16 GB',
            projects: '48 - 64',
            description: 'Performance máxima e confiabilidade para projetos de alta disponibilidade e processamento intenso. Solução completa para negócios que não podem parar.',
        },
        {
            name: 'Enterprise',
            price: 'R$ 299,99',
            color: '102,36,209',
            ram: '32 - 1024 GB',
            projects: '128 - 4096',
            description: 'Infraestrutura definitiva para operações sem limites de escala e desempenho, com segurança e suporte premium.',
        },
    ];

    useEffect(() => {
        // Foco automático no título
        if (titleRef.current) titleRef.current.focus();

        // Scroll lock
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.setAttribute('data-scroll-locked', 'true');
        document.body.style.overflow = 'hidden';
        document.body.style.marginRight = `${scrollbarWidth}px`;

        // ESC para fechar
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        const handleTab = (e) => {
            if (e.key !== 'Tab') return;
            const focusableElements = modalRef.current?.querySelectorAll(
                'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
            );
            const elements = Array.from(focusableElements || []);
            if (elements.length === 0) return;

            const first = elements[0];
            const last = elements[elements.length - 1];

            if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            } else if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        };
        window.addEventListener('keydown', handleTab);

        return () => {
            document.body.removeAttribute('data-scroll-locked');
            document.body.style.overflow = '';
            document.body.style.marginRight = '';
            window.removeEventListener('keydown', handleEsc);
            window.removeEventListener('keydown', handleTab);
        };
    }, [onClose]);

    return (
        <div
            data-state="open"
            data-slot="dialog-overlay"
            className="motion-duration-300 fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] data-[state=open]:motion-opacity-in-0"
            style={{ pointerEvents: 'auto' }}
            aria-hidden="true"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-labelledby="upgrade-title"
                aria-describedby="upgrade-description"
                data-state="open"
                className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 w-full overflow-hidden rounded-md bg-virtus-800 outline-none motion-duration-200 data-[state=open]:motion-scale-in-95 data-[state=open]:motion-opacity-in-0 max-w-5xl h-fit max-md:top-0 max-md:bottom-0 max-md:h-full max-md:translate-y-0 max-md:overflow-auto max-md:p-0"
                tabIndex={-1}
                style={{ pointerEvents: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="overflow-y-clip" style={{ height: '636px' }}>
                    <div className="grid auto-rows-auto overflow-auto">
                        <div className="flex flex-col gap-3 px-6 py-6 pb-6 text-left">
                            <h2
                                id="upgrade-title"
                                ref={titleRef}
                                tabIndex={-1}
                                className="font-semibold text-lg/6 tracking-tight focus:outline-none"
                            >
                                Realizar upgrade do plano
                            </h2>
                            <p id="upgrade-description" className="text-secondary text-sm" />
                        </div>

                        <div className="flex flex-col gap-4 px-6 pb-6 text-left text-secondary text-sm -mt-6">
                            <div className="h-fit space-y-4 overflow-auto">
                                <p className="text-secondary">
                                    Sua aplicação merece o melhor desempenho e estabilidade para continuar crescendo. Garanta mais memória, recursos exclusivos e suporte dedicado ao escolher o plano ideal para suas necessidades.
                                </p>

                                <div className="flex flex-col flex-wrap gap-4 sm:flex-row">
                                    {plans.map((plan) => (
                                        <div
                                            key={plan.name}
                                            className="flex-1 rounded-md border-2 bg-background bg-linear-to-b from-[rgba(var(--plan-color),0.15)] to-transparent px-2 py-2 sm:basis-[calc(50%-16px)] md:px-4 md:py-3"
                                            style={{ '--plan-color': plan.color, borderColor: `rgba(${plan.color},0.25)` }}
                                        >
                                            <div className="flex h-full flex-col justify-between gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="font-semibold text-base text-primary">{plan.name}</p>
                                                        <p className="font-bold text-[rgb(var(--plan-color))] text-xl">{plan.price}</p>
                                                    </div>
                                                    <p>{plan.description}</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="relative flex flex-col items-center rounded-md border-2 px-2 py-2" style={{ borderColor: `rgba(${plan.color},0.15)` }}>
                                                            <p className="font-medium text-primary text-sm">{plan.ram}</p>
                                                            <p className="text-secondary text-xs">RAM</p>
                                                        </div>
                                                        <div className="relative flex flex-col items-center rounded-md border-2 px-2 py-2" style={{ borderColor: `rgba(${plan.color},0.15)` }}>
                                                            <p className="font-medium text-primary text-sm">{plan.projects}</p>
                                                            <p className="text-secondary text-xs">Projetos</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer h-9 px-3 font-normal text-sm w-full"
                                                        style={{ backgroundColor: `rgba(${plan.color},0.1)` }}
                                                    >
                                                        Mais Detalhes
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botão de fechar */}
                <button
                    className="group/button inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium outline-none text-secondary hover:bg-virtus-500 hover:text-primary focus-visible:ring-blue-700 p-1 text-xs absolute top-5 right-5 rounded-sm opacity-50 transition-opacity hover:cursor-pointer hover:opacity-100"
                    type="button"
                    onClick={onClose}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
                    </svg>
                    <span className="sr-only">Close</span>
                </button>
            </div>

            {/* Focus guard */}
            <span
                data-radix-focus-guard=""
                tabIndex={0}
                style={{ outline: 'none', opacity: 0, position: 'fixed', pointerEvents: 'none' }}
                aria-hidden="true"
            />
        </div>
    );
}

//'use client';
//
//import { useEffect } from 'react';
//
//export default function UpgradeModal({ onClose }) {
//  const plans = [
//    {
//      name: 'Standard',
//      price: 'R$ 34,90',
//      color: '52,78,212',
//      ram: '4 - 8 GB',
//      projects: '16 - 32',
//      description: 'Base sólida para lançar aplicações com performance e escalabilidade. Recursos profissionais essenciais para estabilidade e ótima experiência do usuário.',
//    },
//    {
//      name: 'Pro',
//      price: 'R$ 100,00',
//      color: '247,30,30',
//      ram: '12 - 16 GB',
//      projects: '48 - 64',
//      description: 'Performance máxima e confiabilidade para projetos de alta disponibilidade e processamento intenso. Solução completa para negócios que não podem parar.',
//    },
//    {
//      name: 'Enterprise',
//      price: 'R$ 299,90',
//      color: '102,36,209',
//      ram: '32 - 1024 GB',
//      projects: '128 - 4096',
//      description: 'Infraestrutura definitiva para operações sem limites de escala e desempenho, com segurança e suporte premium.',
//    },
//  ];
//
//  // Bloqueia rolagem do body e escuta ESC
//  useEffect(() => {
//    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
//    document.body.setAttribute('data-scroll-locked', 'true');
//    document.body.style.overflow = 'hidden';
//    document.body.style.marginRight = `${scrollbarWidth}px`;
//
//    const handleEsc = (e) => {
//      if (e.key === 'Escape') onClose();
//    };
//    window.addEventListener('keydown', handleEsc);
//
//    return () => {
//      document.body.removeAttribute('data-scroll-locked');
//      document.body.style.overflow = '';
//      document.body.style.marginRight = '';
//      window.removeEventListener('keydown', handleEsc);
//    };
//  }, [onClose]);
//
//  return (
//    <div
//      data-state="open"
//      data-slot="dialog-overlay"
//      className="motion-duration-300 fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] data-[state=open]:motion-opacity-in-0"
//      style={{ pointerEvents: 'auto' }}
//      aria-hidden="true"
//      onClick={onClose}
//    >
//      <div
//        role="dialog"
//        aria-labelledby="upgrade-title"
//        aria-describedby="upgrade-description"
//        data-state="open"
//        className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 w-full overflow-hidden rounded-md bg-virtus-800 outline-none motion-duration-200 data-[state=open]:motion-scale-in-95 data-[state=open]:motion-opacity-in-0 max-w-5xl h-fit max-md:top-0 max-md:bottom-0 max-md:h-full max-md:translate-y-0 max-md:overflow-auto max-md:p-0"
//        tabIndex={-1}
//        style={{ pointerEvents: 'auto' }}
//        onClick={(e) => e.stopPropagation()}
//      >
//        <div className="overflow-y-clip" style={{ height: '636px' }}>
//          <div className="grid auto-rows-auto overflow-auto">
//            <div className="flex flex-col gap-3 px-6 py-6 pb-6 text-left">
//              <h2 id="upgrade-title" className="font-semibold text-lg/6 tracking-tight">Realizar upgrade do plano</h2>
//              <p id="upgrade-description" className="text-secondary text-sm" />
//            </div>
//
//            <div className="flex flex-col gap-4 px-6 pb-6 text-left text-secondary text-sm -mt-6">
//              <div className="h-fit space-y-4 overflow-auto">
//                <p className="text-secondary">
//                  Sua aplicação merece o melhor desempenho e estabilidade para continuar crescendo. Garanta mais memória, recursos exclusivos e suporte dedicado ao escolher o plano ideal para suas necessidades.
//                </p>
//
//                <div className="flex flex-col flex-wrap gap-4 sm:flex-row">
//                  {plans.map((plan) => (
//                    <div
//                      key={plan.name}
//                      className="flex-1 rounded-md border-2 bg-background bg-linear-to-b from-[rgba(var(--plan-color),0.15)] to-transparent px-2 py-2 sm:basis-[calc(50%-16px)] md:px-4 md:py-3"
//                      style={{ '--plan-color': plan.color, borderColor: `rgba(${plan.color},0.25)` }}
//                    >
//                      <div className="flex h-full flex-col justify-between gap-4">
//                        <div className="space-y-2">
//                          <div className="flex items-center justify-between gap-2">
//                            <p className="font-semibold text-base text-primary">{plan.name}</p>
//                            <p className="font-bold text-[rgb(var(--plan-color))] text-xl">{plan.price}</p>
//                          </div>
//                          <p>{plan.description}</p>
//                        </div>
//
//                        <div className="space-y-2">
//                          <div className="grid grid-cols-2 gap-2">
//                            <div className="relative flex flex-col items-center rounded-md border-2 px-2 py-2" style={{ borderColor: `rgba(${plan.color},0.15)` }}>
//                              <p className="font-medium text-primary text-sm">{plan.ram}</p>
//                              <p className="text-secondary text-xs">RAM</p>
//                            </div>
//                            <div className="relative flex flex-col items-center rounded-md border-2 px-2 py-2" style={{ borderColor: `rgba(${plan.color},0.15)` }}>
//                              <p className="font-medium text-primary text-sm">{plan.projects}</p>
//                              <p className="text-secondary text-xs">Projetos</p>
//                            </div>
//                          </div>
//
//                          <button
//                            className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer h-9 px-3 font-normal text-sm w-full"
//                            style={{ backgroundColor: `rgba(${plan.color},0.1)` }}
//                          >
//                            Mais Detalhes
//                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                            </svg>
//                          </button>
//                        </div>
//                      </div>
//                    </div>
//                  ))}
//                </div>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        {/* Botão de fechar */}
//        <button
//          className="group/button inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium outline-none text-secondary hover:bg-virtus-500 hover:text-primary focus-visible:ring-blue-700 p-1 text-xs absolute top-5 right-5 rounded-sm opacity-50 transition-opacity hover:cursor-pointer hover:opacity-100"
//          type="button"
//          onClick={onClose}
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//            <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
//          </svg>
//          <span className="sr-only">Close</span>
//        </button>
//      </div>
//
//      {/* Focus guard */}
//      <span
//        data-radix-focus-guard=""
//        tabIndex={0}
//        style={{ outline: 'none', opacity: 0, position: 'fixed', pointerEvents: 'none' }}
//        aria-hidden="true"
//      />
//    </div>
//  );
//}

//'use client';
//
//import { useEffect } from 'react';
//
//export default function UpgradeModal({ onClose }) {
//  const plans = [
//    {
//      name: 'Standard',
//      price: 'R$ 34,90',
//      color: '52,78,212',
//      ram: '4 - 8 GB',
//      projects: '16 - 32',
//      description: 'Base sólida para lançar aplicações com performance e escalabilidade. Recursos profissionais essenciais para estabilidade e ótima experiência do usuário.',
//    },
//    {
//      name: 'Pro',
//      price: 'R$ 100,00',
//      color: '247,30,30',
//      ram: '12 - 16 GB',
//      projects: '48 - 64',
//      description: 'Performance máxima e confiabilidade para projetos de alta disponibilidade e processamento intenso. Solução completa para negócios que não podem parar.',
//    },
//    {
//      name: 'Enterprise',
//      price: 'R$ 299,90',
//      color: '102,36,209',
//      ram: '32 - 1024 GB',
//      projects: '128 - 4096',
//      description: 'Infraestrutura definitiva para operações sem limites de escala e desempenho, com segurança e suporte premium.',
//    },
//  ];
//
//  // ESC para fechar
//  useEffect(() => {
//    const handleEsc = (e) => {
//      if (e.key === 'Escape') onClose();
//    };
//    window.addEventListener('keydown', handleEsc);
//    return () => window.removeEventListener('keydown', handleEsc);
//  }, [onClose]);
//
//  return (
//    <div
//      data-state="open"
//      data-slot="dialog-overlay"
//      className="motion-duration-300 fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] data-[state=open]:motion-opacity-in-0"
//      style={{ pointerEvents: 'auto' }}
//      aria-hidden="true"
//      onClick={onClose}
//    >
//      <div
//        role="dialog"
//        aria-labelledby="upgrade-title"
//        aria-describedby="upgrade-description"
//        data-state="open"
//        className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 w-full overflow-hidden rounded-md bg-virtus-800 outline-none motion-duration-200 data-[state=open]:motion-scale-in-95 data-[state=open]:motion-opacity-in-0 max-w-5xl h-fit max-md:top-0 max-md:bottom-0 max-md:h-full max-md:translate-y-0 max-md:overflow-auto max-md:p-0"
//        tabIndex={-1}
//        style={{ pointerEvents: 'auto' }}
//        onClick={(e) => e.stopPropagation()}
//      >
//        <div className="overflow-y-clip" style={{ height: '636px' }}>
//          <div className="grid auto-rows-auto overflow-auto">
//            <div className="flex flex-col gap-3 px-6 py-6 pb-6 text-left">
//              <h2 id="upgrade-title" className="font-semibold text-lg/6 tracking-tight">Realizar upgrade do plano</h2>
//              <p id="upgrade-description" className="text-secondary text-sm" />
//            </div>
//
//            <div className="flex flex-col gap-4 px-6 pb-6 text-left text-secondary text-sm -mt-6">
//              <div className="h-fit space-y-4 overflow-auto">
//                <p className="text-secondary">
//                  Sua aplicação merece o melhor desempenho e estabilidade para continuar crescendo. Garanta mais memória, recursos exclusivos e suporte dedicado ao escolher o plano ideal para suas necessidades.
//                </p>
//
//                <div className="flex flex-col flex-wrap gap-4 sm:flex-row">
//                  {plans.map((plan) => (
//                    <div
//                      key={plan.name}
//                      className="flex-1 rounded-md border-2 bg-background bg-linear-to-b from-[rgba(var(--plan-color),0.15)] to-transparent px-2 py-2 sm:basis-[calc(50%-16px)] md:px-4 md:py-3"
//                      style={{ '--plan-color': plan.color, borderColor: `rgba(${plan.color},0.25)` }}
//                    >
//                      <div className="flex h-full flex-col justify-between gap-4">
//                        <div className="space-y-2">
//                          <div className="flex items-center justify-between gap-2">
//                            <p className="font-semibold text-base text-primary">{plan.name}</p>
//                            <p className="font-bold text-[rgb(var(--plan-color))] text-xl">{plan.price}</p>
//                          </div>
//                          <p>{plan.description}</p>
//                        </div>
//
//                        <div className="space-y-2">
//                          <div className="grid grid-cols-2 gap-2">
//                            <div className="relative flex flex-col items-center rounded-md border-2 px-2 py-2" style={{ borderColor: `rgba(${plan.color},0.15)` }}>
//                              <p className="font-medium text-primary text-sm">{plan.ram}</p>
//                              <p className="text-secondary text-xs">RAM</p>
//                            </div>
//                            <div className="relative flex flex-col items-center rounded-md border-2 px-2 py-2" style={{ borderColor: `rgba(${plan.color},0.15)` }}>
//                              <p className="font-medium text-primary text-sm">{plan.projects}</p>
//                              <p className="text-secondary text-xs">Projetos</p>
//                            </div>
//                          </div>
//
//                          <button
//                            className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer h-9 px-3 font-normal text-sm w-full"
//                            style={{ backgroundColor: `rgba(${plan.color},0.1)` }}
//                          >
//                            Mais Detalhes
//                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                            </svg>
//                          </button>
//                        </div>
//                      </div>
//                    </div>
//                  ))}
//                </div>
//              </div>
//            </div>
//          </div>
//        </div>
//
//        {/* Botão de fechar */}
//        <button
//          className="group/button inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium outline-none text-secondary hover:bg-virtus-500 hover:text-primary focus-visible:ring-blue-700 p-1 text-xs absolute top-5 right-5 rounded-sm opacity-50 transition-opacity hover:cursor-pointer hover:opacity-100"
//          type="button"
//          onClick={onClose}
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//            <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
//          </svg>
//          <span className="sr-only">Close</span>
//        </button>
//      </div>
//
//      {/* Focus guard */}
//      <span
//        data-radix-focus-guard=""
//        tabIndex={0}
//        style={{ outline: 'none', opacity: 0, position: 'fixed', pointerEvents: 'none' }}
//        aria-hidden="true"
//      />
//    </div>
//  );
//}

//'use client';
//
//export default function UpgradeModal({ onClose }) {
//  const plans = [
//    {
//      name: 'Standard',
//      price: 'R$ 34,90',
//      color: '52,78,212',
//      ram: '4 - 8 GB',
//      projects: '16 - 32',
//      description: 'Base sólida para lançar aplicações com performance e escalabilidade.',
//    },
//    {
//      name: 'Pro',
//      price: 'R$ 100,00',
//      color: '247,30,30',
//      ram: '12 - 16 GB',
//      projects: '48 - 64',
//      description: 'Performance máxima e confiabilidade para projetos de alta disponibilidade.',
//    },
//    {
//      name: 'Enterprise',
//      price: 'R$ 299,90',
//      color: '102,36,209',
//      ram: '32 - 1024 GB',
//      projects: '128 - 4096',
//      description: 'Infraestrutura definitiva para operações sem limites de escala e desempenho.',
//    },
//  ];
//
//  return (
//    <div
//      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
//      onClick={onClose}
//    >
//      <div
//        role="dialog"
//        aria-labelledby="upgrade-title"
//        aria-describedby="upgrade-description"
//        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl rounded-md bg-virtus-800 p-6 shadow-xl outline-none"
//        onClick={(e) => e.stopPropagation()}
//      >
//        <div className="flex justify-between items-start mb-4">
//          <h2 id="upgrade-title" className="font-semibold text-lg text-primary">Realizar upgrade do plano</h2>
//          <button
//            onClick={onClose}
//            className="text-secondary hover:text-primary hover:bg-virtus-500 p-1 rounded-sm transition-opacity opacity-50 hover:opacity-100"
//          >
//            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
//            </svg>
//          </button>
//        </div>
//
//        <p id="upgrade-description" className="text-secondary text-sm mb-4">
//          Sua aplicação merece o melhor desempenho e estabilidade para continuar crescendo. Garanta mais memória, recursos exclusivos e suporte dedicado ao escolher o plano ideal para suas necessidades.
//        </p>
//
//        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//          {plans.map((plan) => (
//            <div
//              key={plan.name}
//              className="flex flex-col justify-between gap-4 rounded-md border-2 px-4 py-3"
//              style={{
//                borderColor: `rgba(${plan.color},0.25)`,
//                background: `linear-gradient(to bottom, rgba(${plan.color},0.15), transparent)`,
//              }}
//            >
//              <div className="space-y-2">
//                <div className="flex items-center justify-between">
//                  <p className="font-semibold text-base text-primary">{plan.name}</p>
//                  <p className="font-bold text-xl" style={{ color: `rgb(${plan.color})` }}>{plan.price}</p>
//                </div>
//                <p className="text-secondary text-sm">{plan.description}</p>
//              </div>
//              <div className="space-y-2">
//                <div className="grid grid-cols-2 gap-2">
//                  <div className="flex flex-col items-center rounded-md border-2 px-2 py-2" style={{ borderColor: `rgba(${plan.color},0.15)` }}>
//                    <p className="font-medium text-primary text-sm">{plan.ram}</p>
//                    <p className="text-secondary text-xs">RAM</p>
//                  </div>
//                  <div className="flex flex-col items-center rounded-md border-2 px-2 py-2" style={{ borderColor: `rgba(${plan.color},0.15)` }}>
//                    <p className="font-medium text-primary text-sm">{plan.projects}</p>
//                    <p className="text-secondary text-xs">Projetos</p>
//                  </div>
//                </div>
//                <button className="group/button inline-flex items-center justify-center gap-2 rounded-md h-9 px-3 w-full text-sm font-normal bg-[rgb(var(--plan-color))]/10 hover:bg-[rgb(var(--plan-color))]/15" style={{ backgroundColor: `rgba(${plan.color},0.1)` }}>
//                  Mais Detalhes
//                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                  </svg>
//                </button>
//              </div>
//            </div>
//          ))}
//        </div>
//      </div>
//    </div>
//  );
//}

//'use client';
//
//export default function UpgradeModal({ onClose }) {
//  const plans = [
//    {
//      name: 'Standard',
//      price: 'R$ 34,90',
//      color: '52,78,212',
//      ram: '4 - 8 GB',
//      projects: '16 - 32',
//      description: 'Base sólida para lançar aplicações com performance e escalabilidade.',
//    },
//    {
//      name: 'Pro',
//      price: 'R$ 100,00',
//      color: '247,30,30',
//      ram: '12 - 16 GB',
//      projects: '48 - 64',
//      description: 'Performance máxima e confiabilidade para projetos de alta disponibilidade.',
//    },
//    {
//      name: 'Enterprise',
//      price: 'R$ 299,90',
//      color: '102,36,209',
//      ram: '32 - 1024 GB',
//      projects: '128 - 4096',
//      description: 'Infraestrutura definitiva para operações sem limites de escala e desempenho.',
//    },
//  ];
//
//  return (
//    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//      <div
//        role="dialog"
//        aria-labelledby="upgrade-title"
//        aria-describedby="upgrade-description"
//        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl rounded-md bg-virtus-800 p-6 shadow-xl outline-none"
//      >
//        <div className="flex justify-between items-start mb-4">
//          <h2 id="upgrade-title" className="font-semibold text-lg text-primary">Realizar upgrade do plano</h2>
//          <button
//            onClick={onClose}
//            className="text-secondary hover:text-primary hover:bg-virtus-500 p-1 rounded-sm transition-opacity opacity-50 hover:opacity-100"
//          >
//            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
//            </svg>
//          </button>
//        </div>
//
//        <p id="upgrade-description" className="text-secondary text-sm mb-4">
//          Sua aplicação merece o melhor desempenho e estabilidade para continuar crescendo. Garanta mais memória, recursos exclusivos e suporte dedicado ao escolher o plano ideal para suas necessidades.
//        </p>
//
//        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//          {plans.map((plan) => (
//            <div
//              key={plan.name}
//              className="flex flex-col justify-between gap-4 rounded-md border-2 px-4 py-3"
//              style={{
//                borderColor: `rgba(${plan.color},0.25)`,
//                background: `linear-gradient(to bottom, rgba(${plan.color},0.15), transparent)`,
//              }}
//            >
//              <div className="space-y-2">
//                <div className="flex items-center justify-between">
//                  <p className="font-semibold text-base text-primary">{plan.name}</p>
//                  <p className="font-bold text-xl" style={{ color: `rgb(${plan.color})` }}>{plan.price}</p>
//                </div>
//                <p className="text-secondary text-sm">{plan.description}</p>
//              </div>
//              <div className="space-y-2">
//                <div className="grid grid-cols-2 gap-2">
//                  <div className="flex flex-col items-center rounded-md border-2 px-2 py-2" style={{ borderColor: `rgba(${plan.color},0.15)` }}>
//                    <p className="font-medium text-primary text-sm">{plan.ram}</p>
//                    <p className="text-secondary text-xs">RAM</p>
//                  </div>
//                  <div className="flex flex-col items-center rounded-md border-2 px-2 py-2" style={{ borderColor: `rgba(${plan.color},0.15)` }}>
//                    <p className="font-medium text-primary text-sm">{plan.projects}</p>
//                    <p className="text-secondary text-xs">Projetos</p>
//                  </div>
//                </div>
//                <button className="group/button inline-flex items-center justify-center gap-2 rounded-md h-9 px-3 w-full text-sm font-normal bg-[rgb(var(--plan-color))]/10 hover:bg-[rgb(var(--plan-color))]/15" style={{ backgroundColor: `rgba(${plan.color},0.1)` }}>
//                  Mais Detalhes
//                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                  </svg>
//                </button>
//              </div>
//            </div>
//          ))}
//        </div>
//      </div>
//    </div>
//  );
//}
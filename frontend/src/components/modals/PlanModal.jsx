//frontend/src/components/modals/PlanModal.jsx

'use client';

import { useEffect, useRef } from 'react';

export default function PlanModal({ onClose }) {
  const titleRef = useRef(null);
  const modalRef = useRef(null);

  const plans = [
    {
      name: 'Basic',
      price: 'R$ 7,99',
      color: '125,125,125',
      ram: '1 - 2 GB',
      projects: 'Até 8',
      description:
        'Ponto de partida ideal para desenvolvedores e estudantes. Valide ideias, teste tecnologias e hospede projetos pessoais em ambiente acessível.',
    },
    {
      name: 'Pro',
      price: 'R$ 29,99',
      color: '52,78,212',
      ram: '12 - 16 GB',
      projects: 'Até 64',
      description:
        'Base sólida para lançar aplicações com performance e escalabilidade. Recursos profissionais essenciais para estabilidade e ótima experiência do usuário.',
    },
    {
      name: 'Premium',
      price: 'R$ 99,99',
      color: '247,30,30',
      ram: '32 GB+',
      projects: 'Ilimitado',
      description:
        'Infraestrutura de alto desempenho para aplicações críticas e escaláveis. Ideal para empresas que exigem máxima performance e suporte dedicado.',
    },
  ];

  useEffect(() => {
    if (titleRef.current) titleRef.current.focus();

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.setAttribute('data-scroll-locked', 'true');
    document.body.style.overflow = 'hidden';
    document.body.style.marginRight = `${scrollbarWidth}px`;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
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

    window.addEventListener('keydown', handleEsc);
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
        aria-labelledby="plan-title"
        aria-describedby="plan-description"
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
                id="plan-title"
                ref={titleRef}
                tabIndex={-1}
                className="font-semibold text-lg/6 tracking-tight focus:outline-none"
              >
                Obtenha um plano para suas aplicações
              </h2>
              <p id="plan-description" className="text-secondary text-sm" />
            </div>

            <div className="flex flex-col gap-4 px-6 pb-6 text-left text-secondary text-sm -mt-6">
              <div className="h-fit space-y-4 overflow-auto">
                <p className="text-secondary">
                  Escolha o plano que melhor atende às suas necessidades e comece a desenvolver com uma infraestrutura otimizada para produção.
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
                            <div
                              className="relative flex flex-col items-center rounded-md border-2 px-2 py-2"
                              style={{ borderColor: `rgba(${plan.color},0.15)` }}
                            >
                              <p className="font-medium text-primary text-sm">{plan.ram}</p>
                              <p className="text-secondary text-xs">RAM</p>
                            </div>
                            <div
                              className="relative flex flex-col items-center rounded-md border-2 px-2 py-2"
                              style={{ borderColor: `rgba(${plan.color},0.15)` }}
                            >
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
          <span className="sr-only">Fechar</span>
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

//frontend/src/components/modals/PlanModal.jsx

//'use client';
//
//import { useEffect, useRef } from 'react';
//
//export default function PlanModal({ onClose }) {
//  const titleRef = useRef(null);
//  const modalRef = useRef(null);
//
//  const plans = [
//    {
//      name: 'Basic',
//      price: 'R$ 0,00',
//      color: '125,125,125',
//      ram: '1 - 2 GB',
//      projects: 'Até 8',
//      description:
//        'Ponto de partida ideal para desenvolvedores e estudantes. Valide ideias, teste tecnologias e hospede projetos pessoais em ambiente acessível.',
//    },
//    {
//      name: 'Pro',
//      price: 'R$ 39,90',
//      color: '52,78,212',
//      ram: '12 - 16 GB',
//      projects: 'Até 64',
//      description:
//        'Base sólida para lançar aplicações com performance e escalabilidade. Recursos profissionais essenciais para estabilidade e ótima experiência do usuário.',
//    },
//    {
//      name: 'Premium',
//      price: 'R$ 99,90',
//      color: '255,215,0',
//      ram: '32 GB+',
//      projects: 'Ilimitado',
//      description:
//        'Infraestrutura de alto desempenho para aplicações críticas e escaláveis. Ideal para empresas que exigem máxima performance e suporte dedicado.',
//    },
//  ];
//
//  useEffect(() => {
//    if (titleRef.current) titleRef.current.focus();
//
//    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
//    document.body.setAttribute('data-scroll-locked', 'true');
//    document.body.style.overflow = 'hidden';
//    document.body.style.marginRight = `${scrollbarWidth}px`;
//
//    const handleEsc = (e) => {
//      if (e.key === 'Escape') onClose();
//    };
//    const handleTab = (e) => {
//      if (e.key !== 'Tab') return;
//      const focusableElements = modalRef.current?.querySelectorAll(
//        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
//      );
//      const elements = Array.from(focusableElements || []);
//      if (elements.length === 0) return;
//
//      const first = elements[0];
//      const last = elements[elements.length - 1];
//
//      if (!e.shiftKey && document.activeElement === last) {
//        e.preventDefault();
//        first.focus();
//      } else if (e.shiftKey && document.activeElement === first) {
//        e.preventDefault();
//        last.focus();
//      }
//    };
//
//    window.addEventListener('keydown', handleEsc);
//    window.addEventListener('keydown', handleTab);
//
//    return () => {
//      document.body.removeAttribute('data-scroll-locked');
//      document.body.style.overflow = '';
//      document.body.style.marginRight = '';
//      window.removeEventListener('keydown', handleEsc);
//      window.removeEventListener('keydown', handleTab);
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
//        ref={modalRef}
//        role="dialog"
//        aria-labelledby="plan-title"
//        aria-describedby="plan-description"
//        data-state="open"
//        className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 w-full overflow-hidden rounded-md bg-virtus-800 outline-none motion-duration-200 data-[state=open]:motion-scale-in-95 data-[state=open]:motion-opacity-in-0 max-w-5xl h-fit max-md:top-0 max-md:bottom-0 max-md:h-full max-md:translate-y-0 max-md:overflow-auto max-md:p-0"
//        tabIndex={-1}
//        style={{ pointerEvents: 'auto' }}
//        onClick={(e) => e.stopPropagation()}
//      >
//        <div className="overflow-y-clip" style={{ height: '636px' }}>
//          <div className="grid auto-rows-auto overflow-auto">
//            <div className="flex flex-col gap-3 px-6 py-6 pb-6 text-left">
//              <h2
//                id="plan-title"
//                ref={titleRef}
//                tabIndex={-1}
//                className="font-semibold text-lg/6 tracking-tight focus:outline-none"
//              >
//                Obtenha um plano para suas aplicações
//              </h2>
//              <p id="plan-description" className="text-secondary text-sm" />
//            </div>
//
//            <div className="flex flex-col gap-4 px-6 pb-6 text-left text-secondary text-sm -mt-6">
//              <div className="h-fit space-y-4 overflow-auto">
//                <p className="text-secondary">
//                  Escolha o plano que melhor atende às suas necessidades e comece a desenvolver com uma infraestrutura otimizada para produção.
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
//                            <div
//                              className="relative flex flex-col items-center rounded-md border-2 px-2 py-2"
//                              style={{ borderColor: `rgba(${plan.color},0.15)` }}
//                            >
//                              <p className="font-medium text-primary text-sm">{plan.ram}</p>
//                              <p className="text-secondary text-xs">RAM</p>
//                            </div>
//                            <div
//                              className="relative flex flex-col items-center rounded-md border-2 px-2 py-2"
//                              style={{ borderColor: `rgba(${plan.color},0.15)` }}
//                            >
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
//                {/* Botão de fechar */}
//        <button
//          className="group/button inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium outline-none text-secondary hover:bg-virtus-500 hover:text-primary focus-visible:ring-blue-700 p-1 text-xs absolute top-5 right-5 rounded-sm opacity-50 transition-opacity hover:cursor-pointer hover:opacity-100"
//          type="button"
//          onClick={onClose}
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//            <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
//          </svg>
//          <span className="sr-only">Fechar</span>
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
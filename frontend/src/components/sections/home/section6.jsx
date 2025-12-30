//frontend/src/components/sections/home/section6.jsx

'use client';

import { messages } from '@/app/[lang]/messages/home/section6';

export default function Section6({ lang }) {
  const dict = messages[lang] || messages['pt-br'];

  const icons = [
    <path d="M140,80v41.21l34.17,20.5a12,12,0,1,1-12.34,20.58l-40-24A12,12,0,0,1,116,128V80a12,12,0,0,1,24,0ZM128,28A99.38,99.38,0,0,0,57.24,57.34c-4.69,4.74-9,9.37-13.24,14V64a12,12,0,0,0-24,0v40a12,12,0,0,0,12,12H72a12,12,0,0,0,0-24H57.77C63,86,68.37,80.22,74.26,74.26a76,76,0,1,1,1.58,109,12,12,0,0,0-16.48,17.46A100,100,0,1,0,128,28Z" />,
    <path d="M224,196h-4V40a12,12,0,0,0-12-12H152a12,12,0,0,0-12,12V76H96A12,12,0,0,0,84,88v36H48a12,12,0,0,0-12,12v60H32a12,12,0,0,0,0,24H224a12,12,0,0,0,0-24ZM164,52h32V196H164Zm-56,48h32v96H108ZM60,148H84v48H60Z" />,
    <path d="M216,36H40A20,20,0,0,0,20,56V200a20,20,0,0,0,20,20H216a20,20,0,0,0,20-20V56A20,20,0,0,0,216,36Zm-4,24V84H44V60ZM44,196V108H212v88Z" />,
    <path d="M244,116H186.79a60,60,0,0,0-117.58,0H12a12,12,0,0,0,0,24H69.21a60,60,0,0,0,117.58,0H244a12,12,0,0,0,0-24ZM128,164a36,36,0,1,1,36-36A36,36,0,0,1,128,164Z" />,
    <path d="M204.73,51.85A108.07,108.07,0,0,0,20,128v56a28,28,0,0,0,28,28H64a28,28,0,0,0,28-28V144a28,28,0,0,0-28-28H44.84A84.05,84.05,0,0,1,128,44h.64a83.7,83.7,0,0,1,82.52,72H192a28,28,0,0,0-28,28v40a28,28,0,0,0,28,28h19.6A20,20,0,0,1,192,228H136a12,12,0,0,0,0,24h56a44.05,44.05,0,0,0,44-44V128A107.34,107.34,0,0,0,204.73,51.85ZM64,140a4,4,0,0,1,4,4v40a4,4,0,0,1-4,4H48a4,4,0,0,1-4-4V140Zm124,44V144a4,4,0,0,1,4-4h20v48H192A4,4,0,0,1,188,184Z" />,
    <path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm0,192a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,212Zm0-144a44,44,0,0,0-33.61,72.41l-9.86,32.06A12,12,0,0,0,96,188h64a12,12,0,0,0,11.47-15.53l-9.86-32.06A44,44,0,0,0,128,68Zm8.53,72.51L143.75,164h-31.5l7.22-23.49a12,12,0,0,0-4-12.89,20,20,0,1,1,25,0A12,12,0,0,0,136.53,140.51Z" />,
  ];

  return (
    <div className="relative bg-virtus-900 py-16 sm:py-32">
      <section className="container relative z-1 px-4 sm:px-6">
        <div className="mt-16 md:mt-0">
          <h2 className="font-bold text-3xl lg:text-5xl lg:tracking-tight">
            {dict.title}
          </h2>
          <p className="mt-4 text-base text-secondary">{dict.description}</p>
        </div>

        <div className="mt-16 grid gap-16 sm:grid-cols-2 md:grid-cols-3">
          {dict.features.map(({ title, description }, index) => (
            <div key={title} className="flex items-start gap-4">
              <div className="mt-1 shrink-0 rounded-full bg-blue-700/50 p-2 shadow-blue-700/10 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  {icons[index]}
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="mt-2 text-secondary text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

//frontend/src/components/sections/section6.jsx

//'use client';
//
//import { messages } from '@/app/[lang]/messages/section6';
//
//export default function Section6({ lang }) {
//  const dict = messages[lang] || messages['pt-br'];
//
//  const icons = [
//    <path d="M140,80v41.21l34.17,20.5a12,12,0,1,1-12.34,20.58l-40-24A12,12,0,0,1,116,128V80a12,12,0,0,1,24,0ZM128,28A99.38..." />,
//    <path d="M224,196h-4V40a12,12,0,0,0-12-12H152a12,12,0,0,0-12,12V76H96A12,12,0,0,0,84,88v36H48a12,12,0,0,0-12,12v60H32a12..." />,
//    <path d="M216,36H40A20,20,0,0,0,20,56V200a20,20,0,0,0,20,20H216a20,20,0,0,0,20-20V56A20,20,0,0,0,216,36Zm-4,24V84H44V60ZM44..." />,
//    <path d="M244,116H186.79a60,60,0,0,0-117.58,0H12a12,12,0,0,0,0,24H69.21a60,60,0,0,0,117.58,0H244a12,12,0,0,0,0-24ZM128..." />,
//    <path d="M204.73,51.85A108.07,108.07,0,0,0,20,128v56a28,28,0,0,0,28,28H64a28,28,0,0,0,28-28V144a28,28,0,0,0-28-28H44.84..." />,
//    <path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm0,192a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,212Zm0..." />,
//  ];
//
//  return (
//    <div className="relative bg-virtus-900 py-16 sm:py-32">
//      <section className="container relative z-1 px-4 sm:px-6">
//        <div className="mt-16 md:mt-0">
//          <h2 className="font-bold text-3xl lg:text-5xl lg:tracking-tight">
//            {dict.title}
//          </h2>
//          <p className="mt-4 text-base text-secondary">{dict.description}</p>
//        </div>
//
//        <div className="mt-16 grid gap-16 sm:grid-cols-2 md:grid-cols-3">
//          {dict.features.map(({ title, description }, index) => (
//            <div key={title} className="flex items-start gap-4">
//              <div className="mt-1 shrink-0 rounded-full bg-blue-700/50 p-2 shadow-blue-700/10 shadow-lg">
//                <svg
//                  xmlns="http://www.w3.org/2000/svg"
//                  width="20"
//                  height="20"
//                  fill="currentColor"
//                  viewBox="0 0 256 256"
//                >
//                  {icons[index]}
//                </svg>
//              </div>
//              <div>
//                <h3 className="font-semibold text-lg">{title}</h3>
//                <p className="mt-2 text-secondary text-sm leading-relaxed">
//                  {description}
//                </p>
//              </div>
//            </div>
//          ))}
//        </div>
//      </section>
//    </div>
//  );
//}

//export default function Section6() {
//  const features = [
//    {
//      title: "Snapshots automatizados",
//      description:
//        "Proteja seus dados com snapshots automáticos. Configure, recupere e mantenha a segurança da sua aplicação facilmente. Simples, eficiente e confiável.",
//      icon: (
//        <path d="M140,80v41.21l34.17,20.5a12,12,0,1,1-12.34,20.58l-40-24A12,12,0,0,1,116,128V80a12,12,0,0,1,24,0ZM128,28A99.38,99.38,0,0,0,57.24,57.34c-4.69,4.74-9,9.37-13.24,14V64a12,12,0,0,0-24,0v40a12,12,0,0,0,12,12H72a12,12,0,0,0,0-24H57.77C63,86,68.37,80.22,74.26,74.26a76,76,0,1,1,1.58,109,12,12,0,0,0-16.48,17.46A100,100,0,1,0,128,28Z" />
//      ),
//    },
//    {
//      title: "Métricas da aplicação",
//      description:
//        "Monitore desempenho com métricas detalhadas. Acompanhe uso, erros e tempo de resposta em tempo real. Melhore continuamente sua aplicação.",
//      icon: (
//        <path d="M224,196h-4V40a12,12,0,0,0-12-12H152a12,12,0,0,0-12,12V76H96A12,12,0,0,0,84,88v36H48a12,12,0,0,0-12,12v60H32a12,12,0,0,0,0,24H224a12,12,0,0,0,0-24ZM164,52h32V196H164Zm-56,48h32v96H108ZM60,148H84v48H60Z" />
//      ),
//    },
//    {
//      title: "Analise de tráfego",
//      description:
//        "Analise tráfego, SEO e desempenho. Obtenha insights claros para melhorar o site e garantir resultados excepcionais. Fácil de usar.",
//      icon: (
//        <path d="M216,36H40A20,20,0,0,0,20,56V200a20,20,0,0,0,20,20H216a20,20,0,0,0,20-20V56A20,20,0,0,0,216,36Zm-4,24V84H44V60ZM44,196V108H212v88Z" />
//      ),
//    },
//    {
//      title: "Integração Contínua",
//      description:
//        "Automatize o deploy com integração via GitHub e CLI. Cada alteração é implementada instantaneamente, garantindo que sua aplicação estja sempre ativas sem esforço manual.",
//      icon: (
//        <path d="M244,116H186.79a60,60,0,0,0-117.58,0H12a12,12,0,0,0,0,24H69.21a60,60,0,0,0,117.58,0H244a12,12,0,0,0,0-24ZM128,164a36,36,0,1,1,36-36A36,36,0,0,1,128,164Z" />
//      ),
//    },
//    {
//      title: "Suporte",
//      description:
//        "Suporte rápido e dedicado. Resolva dúvidas e problemas de forma eficiente, garantindo uma experiência perfeita com nossa plataforma.",
//      icon: (
//        <path d="M204.73,51.85A108.07,108.07,0,0,0,20,128v56a28,28,0,0,0,28,28H64a28,28,0,0,0,28-28V144a28,28,0,0,0-28-28H44.84A84.05,84.05,0,0,1,128,44h.64a83.7,83.7,0,0,1,82.52,72H192a28,28,0,0,0-28,28v40a28,28,0,0,0,28,28h19.6A20,20,0,0,1,192,228H136a12,12,0,0,0,0,24h56a44.05,44.05,0,0,0,44-44V128A107.34,107.34,0,0,0,204.73,51.85ZM64,140a4,4,0,0,1,4,4v40a4,4,0,0,1-4,4H48a4,4,0,0,1-4-4V140Zm124,44V144a4,4,0,0,1,4-4h20v48H192A4,4,0,0,1,188,184Z" />
//      ),
//    },
//    {
//      title: "Certificado SSL",
//      description:
//        "Garanta segurança com SSL. Criptografe dados e proteja conexões, garantindo a confiança dos usuários. Fácil e essencial.",
//      icon: (
//        <path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm0,192a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,212Zm0-144a44,44,0,0,0-33.61,72.41l-9.86,32.06A12,12,0,0,0,96,188h64a12,12,0,0,0,11.47-15.53l-9.86-32.06A44,44,0,0,0,128,68Zm8.53,72.51L143.75,164h-31.5l7.22-23.49a12,12,0,0,0-4-12.89,20,20,0,1,1,25,0A12,12,0,0,0,136.53,140.51Z" />
//      ),
//    },
//  ];
//
//  return (
//    <div className="relative bg-virtus-900 py-16 sm:py-32">
//      <section className="container relative z-1 px-4 sm:px-6">
//        <div className="mt-16 md:mt-0">
//          <h2 className="font-bold text-3xl lg:text-5xl lg:tracking-tight">
//            Tudo que você precisa para sua aplicação
//          </h2>
//          <p className="mt-4 text-base text-secondary">
//            Gerencie aplicações com eficiência. Monitore métricas, proteja dados, otimize desempenho e garanta segurança com nossas soluções confiáveis e práticas.
//          </p>
//        </div>
//
//        <div className="mt-16 grid gap-16 sm:grid-cols-2 md:grid-cols-3">
//          {features.map(({ title, description, icon }) => (
//            <div key={title} className="flex items-start gap-4">
//              <div className="mt-1 shrink-0 rounded-full bg-blue-700/50 p-2 shadow-blue-700/10 shadow-lg">
//                <svg
//                  xmlns="http://www.w3.org/2000/svg"
//                  width="20"
//                  height="20"
//                  fill="currentColor"
//                  viewBox="0 0 256 256"
//                >
//                  {icon}
//                </svg>
//              </div>
//              <div>
//                <h3 className="font-semibold text-lg">{title}</h3>
//                <p className="mt-2 text-secondary text-sm leading-relaxed">
//                  {description}
//                </p>
//              </div>
//            </div>
//          ))}
//        </div>
//      </section>
//    </div>
//  );
//}
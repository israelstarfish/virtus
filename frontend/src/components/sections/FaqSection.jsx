'use client';

import * as Accordion from '@radix-ui/react-accordion';

const faqItems = [
  {
    value: 'item-1',
    question: 'O que exatamente eu consigo hospedar na Virtus Cloud?',
    answer: (
      <>
        <p>
          Na <span className="font-bold">Virtus Cloud</span>, você pode hospedar desde aplicações simples até projetos robustos em produção. Nossa plataforma suporta diferentes linguagens e frameworks modernos, como <span className="font-bold">Node.js</span>, <span className="font-bold">Python</span>, <span className="font-bold">Java</span>, <span className="font-bold">Go</span>, <span className="font-bold">PHP</span>, <span className="font-bold">.NET</span>, entre outros.
        </p>
        <p>
          Isso inclui <span className="font-bold">APIs REST e GraphQL</span>, <span className="font-bold">bots para Discord e Telegram</span>, <span className="font-bold">aplicações web fullstack</span>, <span className="font-bold">sistemas empresariais em Java</span>, <span className="font-bold">dashboards em Python</span>, <span className="font-bold">front-ends integrados ao back-end</span> e <span className="font-bold">microserviços distribuídos</span>.
        </p>
        <p>
          Nossa infraestrutura é <span className="font-bold">segura</span>, <span className="font-bold">escalável</span> e de <span className="font-bold">alta disponibilidade</span>, ideal para portfólios, MVPs e sistemas complexos.
        </p>
      </>
    ),
  },
  {
    value: 'item-2',
    question: 'É possível aumentar os recursos do meu projeto conforme ele cresce?',
    answer: (
      <p>
        Sim! Você pode escalar seu projeto conforme a demanda aumenta. Basta acessar o painel da aplicação e escolher um plano superior ou adicionar recursos extras como memória, CPU ou armazenamento.
      </p>
    ),
  },
  {
    value: 'item-3',
    question: 'Como posso escolher o subdomínio do meu projeto durante o upload?',
    answer: (
      <>
        <p>
          Durante o upload do seu projeto na <span className="font-bold">Virtus Cloud</span>, você pode definir o <span className="font-bold">subdomínio</span> de maneira simples e intuitiva. Escolha entre enviar via <span className="font-bold">GitHub</span> ou arquivo <span className="font-bold">.zip</span>, habilite a opção <span className="font-bold">“Publicação na Web”</span> e insira o nome desejado.
        </p>
        <p>
          Para garantir o funcionamento correto, configure o <span className="font-bold">host</span> como <code className="code inline-block h-fit truncate align-middle text-xs/5">0.0.0.0</code> e a <span className="font-bold">porta</span> como <code className="code inline-block h-fit truncate align-middle text-xs/5">80</code> em seu projeto.
        </p>
        <p>
          Após a publicação, sua aplicação ficará disponível em um endereço no formato <span className="font-bold">seusubdominio.virtusweb.app</span>, pronto para ser compartilhado com o público.
        </p>
      </>
    ),
  },
  {
    value: 'item-4',
    question: 'Como configurar um domínio personalizado para o meu projeto?',
    answer: (
      <p>
        Para configurar um domínio personalizado, acesse o painel do seu projeto, vá até a aba <span className="font-bold">Domínios</span> e adicione o domínio desejado. Você precisará configurar um registro <span className="font-bold">CNAME</span> apontando para <code className="code inline-block h-fit truncate align-middle text-xs/5">cname.virtusweb.app</code> no seu provedor de DNS. Após a propagação, seu domínio estará ativo.
      </p>
    ),
  },
  {
    value: 'item-5',
    question: 'Como posso criar ou reenviar uma snapshot da minha aplicação?',
    answer: (
      <p>
        No painel da aplicação, vá até a aba <span className="font-bold">Snapshots</span> e clique em <span className="font-bold">“Criar nova”</span> ou <span className="font-bold">“Reenviar”</span>. Isso permite salvar o estado atual do seu projeto e restaurá-lo quando quiser.
      </p>
    ),
  },
  {
    value: 'item-6',
    question: 'Posso hospedar projetos que precisam ser buildados antes de rodar?',
    answer: (
      <p>
        Sim! Basta incluir um script de build no seu projeto, como <code className="code inline-block h-fit truncate align-middle text-xs/5">npm run build</code> ou equivalente. A Virtus Cloud executa esse processo automaticamente antes de iniciar sua aplicação.
      </p>
    ),
  },
];

export default function FaqSection() {
  return (
    <div className="bg-background">
      <div className="relative py-24">
        {/* Background visuals */}
        <div className="absolute inset-0 z-1 overflow-x-clip">
          <div className="absolute top-40 left-[20%] size-50 bg-blue-500/35 blur-[148px]" />
          <div className="absolute -top-10 right-[25%] size-50 bg-blue-500/15 blur-[148px]" />
          <div className="absolute right-[15%] bottom-0 size-50 bg-blue-500/35 blur-[148px]" />
        </div>

        {/* FAQ content */}
        <div className="container relative z-10 w-full py-24">
          <div className="mx-auto max-w-4xl space-y-16">
            <header className="w-full max-w-5xl text-center">
              <h1 className="font-bold text-3xl text-white sm:text-4xl">Perguntas frequentes</h1>
              <p className="mt-2 text-gray-400 text-lg">
                Está com dúvidas de como fazer o upload? Veja as perguntas mais frequentes.
              </p>
            </header>

            <Accordion.Root type="single" collapsible className="flex w-full flex-col gap-4">
              {faqItems.map(({ value, question, answer }) => (
                <Accordion.Item
                  key={value}
                  value={value}
                  className="rounded-md border-none bg-transparent transition hover:bg-accent/75 data-[state=open]:bg-accent"
                >
                  <Accordion.Header className="flex">
                    <Accordion.Trigger className="flex flex-1 gap-4 rounded-md py-4 text-left font-medium text-sm outline-none transition-all hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 h-16 items-center justify-start px-4 [&[data-state=open]>svg]:rotate-180">
                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                      </svg>
                      {question}
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down px-4 pb-4 pt-0 flex flex-col gap-4 text-balance">
                    {answer || <p>Em breve adicionaremos a resposta para essa pergunta.</p>}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </div>
      </div>
    </div>
  );
}

//'use client';
//
//import * as Accordion from '@radix-ui/react-accordion';
//
//const faqItems = [
//  {
//    value: 'item-1',
//    question: 'O que exatamente eu consigo hospedar na Virtus Cloud?',
//    answer: (
//      <>
//        <p>
//          Na <span className="font-bold">Virtus Cloud</span>, você pode hospedar desde aplicações simples até projetos robustos em produção. Nossa plataforma suporta diferentes linguagens e frameworks modernos, como <span className="font-bold">Node.js</span>, <span className="font-bold">Python</span>, <span className="font-bold">Java</span>, <span className="font-bold">Go</span>, <span className="font-bold">PHP</span>, <span className="font-bold">.NET</span>, entre outros.
//        </p>
//        <p>
//          Isso inclui <span className="font-bold">APIs REST e GraphQL</span>, <span className="font-bold">bots para Discord e Telegram</span>, <span className="font-bold">aplicações web fullstack</span>, <span className="font-bold">sistemas empresariais em Java</span>, <span className="font-bold">dashboards em Python</span>, <span className="font-bold">front-ends integrados ao back-end</span> e <span className="font-bold">microserviços distribuídos</span>.
//        </p>
//        <p>
//          Nossa infraestrutura é <span className="font-bold">segura</span>, <span className="font-bold">escalável</span> e de <span className="font-bold">alta disponibilidade</span>, ideal para portfólios, MVPs e sistemas complexos.
//        </p>
//      </>
//    ),
//  },
//  {
//    value: 'item-2',
//    question: 'É possível aumentar os recursos do meu projeto conforme ele cresce?',
//  },
//  {
//    value: 'item-3',
//    question: 'Como posso escolher o subdomínio do meu projeto durante o upload?',
//  },
//  {
//    value: 'item-4',
//    question: 'Como configurar um domínio personalizado para o meu projeto?',
//  },
//  {
//    value: 'item-5',
//    question: 'Como posso criar ou reenviar uma snapshot da minha aplicação?',
//  },
//  {
//    value: 'item-6',
//    question: 'Posso hospedar projetos que precisam ser buildados antes de rodar?',
//  },
//];
//
//export default function FaqSection() {
//  return (
//    <div className="bg-background">
//      <div className="relative py-24">
//        {/* Background visuals */}
//        <div className="absolute inset-0 z-1 overflow-x-clip">
//          <svg aria-hidden="true" className="pointer-events-none absolute w-full right-[70%] bottom-0 h-90 stroke-border/35">
//            <defs>
//              <pattern id="faq-pattern-1" width="30" height="30" patternUnits="userSpaceOnUse" x="-1" y="-1">
//                <path d="M.5 30V.5H30" fill="none" />
//              </pattern>
//            </defs>
//            <rect fill="url(#faq-pattern-1)" width="100%" height="100%" strokeWidth="0" />
//          </svg>
//          <svg aria-hidden="true" className="pointer-events-none absolute w-full top-0 left-[70%] h-90 stroke-border/35">
//            <defs>
//              <pattern id="faq-pattern-2" width="30" height="30" patternUnits="userSpaceOnUse" x="-1" y="-1">
//                <path d="M.5 30V.5H30" fill="none" />
//              </pattern>
//            </defs>
//            <rect fill="url(#faq-pattern-2)" width="100%" height="100%" strokeWidth="0" />
//          </svg>
//          <div className="absolute top-40 left-[20%] size-50 bg-blue-500/35 blur-[148px]" />
//          <div className="absolute -top-10 right-[25%] size-50 bg-blue-500/15 blur-[148px]" />
//          <div className="absolute right-[15%] bottom-0 size-50 bg-blue-500/35 blur-[148px]" />
//        </div>
//
//        {/* FAQ content */}
//        <div className="container relative z-10 w-full py-24">
//          <div className="mx-auto max-w-4xl space-y-16">
//            <header className="w-full max-w-5xl text-center">
//              <h1 className="font-bold text-3xl text-white sm:text-4xl">Perguntas frequentes</h1>
//              <p className="mt-2 text-gray-400 text-lg">
//                Está com dúvidas de como fazer o upload? Veja as perguntas mais frequentes.
//              </p>
//            </header>
//
//            <Accordion.Root type="single" collapsible className="flex w-full flex-col gap-4">
//              {faqItems.map(({ value, question, answer }) => (
//                <Accordion.Item
//                  key={value}
//                  value={value}
//                  className="rounded-md border-none bg-transparent transition hover:bg-accent/75 data-[state=open]:bg-accent"
//                >
//                  <Accordion.Header className="flex">
//                    <Accordion.Trigger className="flex flex-1 gap-4 rounded-md py-4 text-left font-medium text-sm outline-none transition-all hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 h-16 items-center justify-start px-4 [&[data-state=open]>svg]:rotate-180">
//                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                      </svg>
//                      {question}
//                    </Accordion.Trigger>
//                  </Accordion.Header>
//                  <Accordion.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down px-4 pb-4 pt-0 flex flex-col gap-4 text-balance">
//                    {answer || <p>Em breve adicionaremos a resposta para essa pergunta.</p>}
//                  </Accordion.Content>
//                </Accordion.Item>
//              ))}
//            </Accordion.Root>
//          </div>
//        </div>
//      </div>
//    </div>
//  );
//}
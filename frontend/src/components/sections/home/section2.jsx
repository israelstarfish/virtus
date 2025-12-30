// frontend/src/components/sections/home/section2.jsx

'use client';

import { messages } from '@/app/[lang]/messages/home/section2';

export default function Section2({ lang }) {
  const dict = messages[lang] || messages['pt-br'];

  // Lista de tecnologias com link para documentação/tutorial
  const technologies = [
    { code: 'python', url: 'https://docs.virtuscloud.app/pt-br/articles/getting-started-with-python' },
    { code: 'typescript', url: 'https://docs.virtuscloud.app/pt-br/articles/getting-started-with-nodejs' },
    { code: 'javascript', url: 'https://docs.virtuscloud.app/pt-br/articles/getting-started-with-nodejs' },
    { code: 'go', url: 'https://docs.virtuscloud.app/pt-br/articles/getting-started-with-go' },
    { code: 'ruby', url: 'https://docs.virtuscloud.app/pt-br/articles/getting-started-with-ruby' },
    { code: 'java', url: 'https://docs.virtuscloud.app/pt-br/articles/getting-started-with-java' },
    { code: 'csharp', url: 'https://docs.virtuscloud.app/pt-br/articles/getting-started-with-csharp' },
    { code: 'rust', url: 'https://docs.virtuscloud.app/pt-br/articles/getting-started-with-rust' },
    { code: 'php', url: 'https://docs.virtuscloud.app/pt-br/articles/getting-started-with-php' },
    { code: 'kotlin', url: 'https://docs.virtuscloud.app/pt-br/articles/getting-started-with-java' },
    { code: 'elixir', url: 'https://docs.virtuscloud.app/pt-br/articles/getting-started-with-elixir' },
    { code: 'dotnetcore', url: 'https://docs.virtuscloud.app/pt-br/articles/getting-started-with-csharp' },
    { code: 'spring', url: 'https://docs.virtuscloud.app/pt-br/tutorials/api/spring-boot' },
    { code: 'react', url: 'https://docs.virtuscloud.app/pt-br/tutorials/website/react' },
    { code: 'nextjs', url: 'https://docs.virtuscloud.app/pt-br/tutorials/website/nextjs' },
    { code: 'vuejs', url: 'https://docs.virtuscloud.app/pt-br/tutorials/website/vue' },
    { code: 'angularjs', url: 'https://docs.virtuscloud.app/pt-br/articles/getting-started-with-nodejs' },
    { code: 'nestjs', url: 'https://docs.virtuscloud.app/pt-br/tutorials/api/nestjs' },
    { code: 'laravel', url: 'https://docs.virtuscloud.app/pt-br/articles/getting-started-with-php' },
    { code: 'django', url: 'https://docs.virtuscloud.app/pt-br/tutorials/api/django' },
  ];

  return (
    <section className="bg-virtus-900">
      <div className="container flex flex-col items-center justify-center px-4 py-12 sm:px-6">
        {/* Título e descrição */}
        <div className="mb-6 flex flex-col items-center justify-center text-center">
          <h2 className="font-bold text-4xl lg:tracking-tight">
            {dict.title}
          </h2>
          <p className="mt-4 max-w-3xl text-base text-secondary">
            {dict.description}
          </p>
        </div>

        {/* Ícones com links */}
        <div className="flex max-w-4xl flex-wrap items-center justify-center gap-2.5">
          {technologies.map(({ code, url }) => (
            <a
              key={code}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-18 w-18 flex-col items-center justify-center gap-2 rounded-xl border border-border px-2 py-4"
            >
              <div className="block rounded-md hover:opacity-100">
                <img
                  alt={`${code} Icon`}
                  loading="lazy"
                  width={32}
                  height={32}
                  decoding="async"
                  className="rounded-md"
                  style={{ color: 'transparent' }}
                  src={`/assets/languages/${code}.svg`}
                />
              </div>
            </a>
          ))}
        </div>

        {/* Texto final */}
        <span className="mt-6 text-center font-bold text-base text-secondary uppercase">
          {dict.trusted}
        </span>
      </div>
    </section>
  );
}

//frontend/src/components/sections/section2.jsx

//'use client';
//
//import { messages } from '@/app/[lang]/messages/section2';
//
//export default function Section2({ lang }) {
//  const dict = messages[lang] || messages['pt-br'];
//
//  const languages = [
//    'python', 'typescript', 'javascript', 'go', 'java', 'csharp', 'rust', 'php',
//    'kotlin', 'elixir', 'dotnetcore', 'spring', 'react', 'nextjs', 'vuejs',
//    'angularjs', 'nestjs', 'laravel', 'django',
//  ];
//
//  return (
//    <section className="bg-virtus-900">
//      <div className="container flex flex-col items-center justify-center px-4 py-12 sm:px-6">
//        <div className="mb-6 flex flex-col items-center justify-center text-center">
//          <h2 className="font-bold text-4xl lg:tracking-tight">
//            {dict.title}
//          </h2>
//          <p className="mt-4 max-w-3xl text-base text-secondary">
//            {dict.description}
//          </p>
//        </div>
//
//        <div className="flex max-w-4xl flex-wrap items-center justify-center gap-2.5">
//          {languages.map((lang) => (
//            <div
//              key={lang}
//              className="flex h-18 w-18 flex-col items-center justify-center gap-2 rounded-xl border border-border px-2 py-4"
//            >
//              <div className="block rounded-md duration-300 hover:opacity-100">
//                <img
//                  alt={`${lang} Icon`}
//                  loading="lazy"
//                  width={32}
//                  height={32}
//                  decoding="async"
//                  className="rounded-md"
//                  style={{ color: 'transparent' }}
//                  src={`/assets/languages/${lang}.svg`}
//                />
//              </div>
//            </div>
//          ))}
//        </div>
//
//        <span className="mt-6 text-center font-bold text-base text-secondary uppercase">
//          {dict.trusted}
//        </span>
//      </div>
//    </section>
//  );
//}

//export default function Section2() {
//  const languages = [
//    "python", "typescript", "javascript", "go", "java", "csharp", "rust", "php",
//    "kotlin", "elixir", "dotnetcore", "spring", "react", "nextjs", "vuejs",
//    "angularjs", "nestjs", "laravel", "django"
//  ];
//
//  return (
//    <section className="bg-virtus-900">
//      <div className="container flex flex-col items-center justify-center px-4 py-12 sm:px-6">
//        <div className="mb-6 flex flex-col items-center justify-center text-center">
//          <h2 className="font-bold text-4xl lg:tracking-tight">
//            Apoie seu desenvolvimento com flexibilidade e potência
//          </h2>
//          <p className="mt-4 max-w-3xl text-base text-secondary">
//            Com suporte para as principais tecnologias, como Java, JavaScript, PHP, Elixir, Ruby on Rails e muito mais, nossa hospedagem garante a compatibilidade e a performance que você precisa para criar projetos incríveis.
//          </p>
//        </div>
//
//        <div className="flex max-w-4xl flex-wrap items-center justify-center gap-2.5">
//          {languages.map((lang) => (
//            <div
//              key={lang}
//              className="flex h-18 w-18 flex-col items-center justify-center gap-2 rounded-xl border border-border px-2 py-4"
//            >
//              <div className="block rounded-md duration-300 hover:opacity-100">
//                <img
//                  alt={`${lang} Icon`}
//                  loading="lazy"
//                  width={32}
//                  height={32}
//                  decoding="async"
//                  className="rounded-md"
//                  style={{ color: "transparent" }}
//                  src={`/assets/languages/${lang}.svg`}
//                />
//              </div>
//            </div>
//          ))}
//        </div>
//
//        <span className="mt-6 text-center font-bold text-base text-secondary uppercase">
//          Confiado por milhares de desenvolvedores
//        </span>
//      </div>
//    </section>
//  );
//}
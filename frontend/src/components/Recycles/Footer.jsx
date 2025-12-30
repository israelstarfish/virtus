// frontend/src/components/Footer.jsx

'use client';

import { useLang } from '@/hooks/useLang';
import { messages } from '@/app/[lang]/messages/footer';

export default function Footer() {

  const lang = useLang();
  const dict = messages[lang] || messages['pt-br'];

  return (
    <footer className="z-49 border-virtus-700 border-t bg-virtus-900 py-12 pb-8">
      <div className="container flex w-full flex-col justify-between gap-4 lg:flex-row">
        <div className="flex flex-col gap-6">
          <div className="space-y-3 lg:max-w-sm">
            <h2 className="font-bold text-3xl text-primary">{dict.slogan}</h2>
            <div className="flex gap-2 text-sm">
              <span className="inline-block text-secondary">{dict.madeIn}</span>
              <img
                alt="Brazil Country Image"
                loading="lazy"
                width={16}
                height={16}
                decoding="async"
                style={{ color: 'transparent' }}
                src="/assets/countries/pt-br.svg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-4">
              {dict.social.map(({ alt, href }) => (
                <a
                  key={alt}
                  className="brightness-50 transition-all hover:brightness-100"
                  rel="noopener noreferrer"
                  target="_blank"
                  href={`https://go.virtuscloud.app/${href}`}
                >
                  <img
                    alt={alt}
                    loading="lazy"
                    width={24}
                    height={24}
                    decoding="async"
                    style={{ color: 'transparent' }}
                    src={`/assets/companies/small/${href}.svg`}
                  />
                </a>
              ))}
            </div>
          </div>

          <a
            className="flex w-fit items-center gap-2.5 text-nowrap rounded-md border border-virtus-700 px-4 py-2 text-secondary text-sm"
            href="https://status.virtuscloud.app/"
          >
            <span className="flex items-center justify-center rounded-full bg-green-500">
              <span className="block size-2.5 rounded-full bg-inherit animate-ping" />
            </span>
            <span>{dict.status}</span>
          </a>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 gap-8 lg:grid-cols-3 xl:flex">
          {dict.sections.map(({ title, links }) => (
            <div key={title}>
              <h2 className="mb-4 font-semibold text-base text-primary uppercase">{title}</h2>
              <ul className="text-gray-400">
                {links.map(([label, href, external]) => (
                  <li key={label} className="mb-2">
                    <a
                      className="flex items-center gap-2 text-sm hover:underline"
                      target={external ? '_blank' : '_self'}
                      rel={external ? 'noopener noreferrer' : undefined}
                      href={href}
                    >
                      {label}
                      {external && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="1em"
                          height="1em"
                          fill="currentColor"
                          viewBox="0 0 256 256"
                        >
                          <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
                        </svg>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        <div
          data-orientation="horizontal"
          role="none"
          className="shrink-0 bg-virtus-600 h-px w-full my-8"
        />
        <div className="flex w-full flex-col justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="text-secondary text-xs" translate="no">
                Virtus Cloud LTDA
              </div>
              <span className="whitespace-nowrap text-wrap text-secondary text-xs">
                00.000.000/0001-00
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-6 lg:flex-row lg:items-center">
            <a className="text-secondary text-sm hover:underline" href={`/${lang}/legal`}>
              {dict.terms}
            </a>
            <a className="text-secondary text-sm hover:underline" href={`/${lang}/legal/policy`}>
              {dict.policy}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// frontend/src/components/Footer.jsx

//'use client';
//
//import { usePathname } from 'next/navigation';
//import { messages } from '@/app/[lang]/messages/footer';
//
//export default function Footer() {
//  const pathname = usePathname();
//
//  function getLang(pathname) {
//    const segment = pathname.split('/')[1];
//    const supported = ['pt-br', 'en', 'es', 'zh'];
//    return supported.includes(segment) ? segment : 'pt-br';
//  }
//
//  const lang = getLang(pathname);
//  const dict = messages[lang] || messages['pt-br'];
//
//  return (
//    <footer className="z-49 border-virtus-700 border-t bg-virtus-900 py-12 pb-8">
//      <div className="container flex w-full flex-col justify-between gap-4 lg:flex-row">
//        <div className="flex flex-col gap-6">
//          <div className="space-y-3 lg:max-w-sm">
//            <h2 className="font-bold text-3xl text-primary">{dict.slogan}</h2>
//            <div className="flex gap-2 text-sm">
//              <span className="inline-block text-secondary">{dict.madeIn}</span>
//              <img
//                alt="Brazil Country Image"
//                loading="lazy"
//                width={16}
//                height={16}
//                decoding="async"
//                style={{ color: 'transparent' }}
//                src="/assets/countries/pt-br.svg"
//              />
//            </div>
//          </div>
//
//          <div className="space-y-2">
//            <div className="flex gap-4">
//              {dict.social.map(({ alt, href }) => (
//                <a
//                  key={alt}
//                  className="brightness-50 transition-all hover:brightness-100"
//                  rel="noopener noreferrer"
//                  target="_blank"
//                  href={`https://go.virtuscloud.app/${href}`}
//                >
//                  <img
//                    alt={alt}
//                    loading="lazy"
//                    width={24}
//                    height={24}
//                    decoding="async"
//                    style={{ color: 'transparent' }}
//                    src={`/assets/companies/small/${href}.svg`}
//                  />
//                </a>
//              ))}
//            </div>
//          </div>
//
//          <a
//            className="flex w-fit items-center gap-2.5 text-nowrap rounded-md border border-virtus-700 px-4 py-2 text-secondary text-sm"
//            href="https://status.virtuscloud.app/"
//          >
//            <span className="flex items-center justify-center rounded-full bg-green-500">
//              <span className="block size-2.5 rounded-full bg-inherit animate-ping" />
//            </span>
//            <span>{dict.status}</span>
//          </a>
//        </div>
//
//        <div className="grid grid-cols-1 xs:grid-cols-2 gap-8 lg:grid-cols-3 xl:flex">
//          {dict.sections.map(({ title, links }) => (
//            <div key={title}>
//              <h2 className="mb-4 font-semibold text-base text-primary uppercase">{title}</h2>
//              <ul className="text-gray-400">
//                {links.map(([label, href, external]) => (
//                  <li key={label} className="mb-2">
//                    <a
//                      className="flex items-center gap-2 text-sm hover:underline"
//                      target={external ? '_blank' : '_self'}
//                      rel={external ? 'noopener noreferrer' : undefined}
//                      href={href}
//                    >
//                      {label}
//                      {external && (
//                        <svg
//                          xmlns="http://www.w3.org/2000/svg"
//                          width="1em"
//                          height="1em"
//                          fill="currentColor"
//                          viewBox="0 0 256 256"
//                        >
//                          <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//                        </svg>
//                      )}
//                    </a>
//                  </li>
//                ))}
//              </ul>
//            </div>
//          ))}
//        </div>
//      </div>
//
//      <div className="container">
//        <div
//          data-orientation="horizontal"
//          role="none"
//          className="shrink-0 bg-virtus-600 h-px w-full my-8"
//        />
//        <div className="flex w-full flex-col justify-between gap-4 sm:flex-row">
//          <div className="flex items-center gap-4">
//            <div className="flex flex-col">
//              <div className="text-secondary text-xs" translate="no">
//                Virtus Cloud LTDA
//              </div>
//              <span className="whitespace-nowrap text-wrap text-secondary text-xs">
//                00.000.000/0001-00
//              </span>
//            </div>
//          </div>
//          <div className="flex flex-col justify-center gap-6 lg:flex-row lg:items-center">
//            <a className="text-secondary text-sm hover:underline" href={`/${lang}/legal`}>
//              {dict.terms}
//            </a>
//            <a className="text-secondary text-sm hover:underline" href={`/${lang}/legal/policy`}>
//              {dict.policy}
//            </a>
//          </div>
//        </div>
//      </div>
//    </footer>
//  );
//}

//frontend/src/components/Footer.jsx

//'use client';
//
//import { messages } from '@/app/[lang]/messages/footer';
//
//export default function Footer({ lang }) {
//  const dict = messages[lang] || messages['pt-br'];
//
//  return (
//    <footer className="z-49 border-virtus-700 border-t bg-virtus-900 py-12 pb-8">
//      <div className="container flex w-full flex-col justify-between gap-4 lg:flex-row">
//        <div className="flex flex-col gap-6">
//          <div className="space-y-3 lg:max-w-sm">
//            <h2 className="font-bold text-3xl text-primary">{dict.slogan}</h2>
//            <div className="flex gap-2 text-sm">
//              <span className="inline-block text-secondary">{dict.madeIn}</span>
//              <img
//                alt="Brazil Country Image"
//                loading="lazy"
//                width={16}
//                height={16}
//                decoding="async"
//                style={{ color: 'transparent' }}
//                src="/assets/countries/pt-br.svg"
//              />
//            </div>
//          </div>
//
//          <div className="space-y-2">
//            <div className="flex gap-4">
//              {dict.social.map(({ alt, href }) => (
//                <a
//                  key={alt}
//                  className="brightness-50 transition-all hover:brightness-100"
//                  rel="noopener noreferrer"
//                  target="_blank"
//                  href={`https://go.virtuscloud.app/${href}`}
//                >
//                  <img
//                    alt={alt}
//                    loading="lazy"
//                    width={24}
//                    height={24}
//                    decoding="async"
//                    style={{ color: 'transparent' }}
//                    src={`/assets/companies/small/${href}.svg`}
//                  />
//                </a>
//              ))}
//            </div>
//          </div>
//
//          <a
//            className="flex w-fit items-center gap-2.5 text-nowrap rounded-md border border-virtus-700 px-4 py-2 text-secondary text-sm"
//            href="https://status.virtuscloud.app/"
//          >
//            <span className="flex items-center justify-center rounded-full bg-green-500">
//              <span className="block size-2.5 rounded-full bg-inherit animate-ping" />
//            </span>
//            <span>{dict.status}</span>
//          </a>
//        </div>
//
//        <div className="grid grid-cols-1 xs:grid-cols-2 gap-8 lg:grid-cols-3 xl:flex">
//          {dict.sections.map(({ title, links }) => (
//            <div key={title}>
//              <h2 className="mb-4 font-semibold text-base text-primary uppercase">{title}</h2>
//              <ul className="text-gray-400">
//                {links.map(([label, href, external]) => (
//                  <li key={label} className="mb-2">
//                    <a
//                      className="flex items-center gap-2 text-sm hover:underline"
//                      target={external ? '_blank' : '_self'}
//                      rel={external ? 'noopener noreferrer' : undefined}
//                      href={href}
//                    >
//                      {label}
//                      {external && (
//                        <svg
//                          xmlns="http://www.w3.org/2000/svg"
//                          width="1em"
//                          height="1em"
//                          fill="currentColor"
//                          viewBox="0 0 256 256"
//                        >
//                          <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//                        </svg>
//                      )}
//                    </a>
//                  </li>
//                ))}
//              </ul>
//            </div>
//          ))}
//        </div>
//      </div>
//
//      <div className="container">
//        <div
//          data-orientation="horizontal"
//          role="none"
//          className="shrink-0 bg-virtus-600 h-px w-full my-8"
//        />
//        <div className="flex w-full flex-col justify-between gap-4 sm:flex-row">
//          <div className="flex items-center gap-4">
//            <div className="flex flex-col">
//              <div className="text-secondary text-xs" translate="no">
//                Virtus Cloud LTDA
//              </div>
//              <span className="whitespace-nowrap text-wrap text-secondary text-xs">
//                00.000.000/0001-00
//              </span>
//            </div>
//          </div>
//          <div className="flex flex-col justify-center gap-6 lg:flex-row lg:items-center">
//            <a className="text-secondary text-sm hover:underline" href={`/${lang}/legal`}>
//              {dict.terms}
//            </a>
//            <a className="text-secondary text-sm hover:underline" href={`/${lang}/legal/policy`}>
//              {dict.policy}
//            </a>
//          </div>
//        </div>
//      </div>
//    </footer>
//  );
//}

//frontend/src/components/Footer.jsx

//'use client';
//
//import { messages } from '@/app/[lang]/messages/footer';
//
//export default function Footer({ lang }) {
//  const dict = messages[lang] || messages['pt-br'];
//
//  return (
//    <footer className="z-49 border-virtus-700 border-t bg-virtus-900 py-12 pb-8">
//      <div className="container flex w-full flex-col justify-between gap-4 lg:flex-row">
//        <div className="flex flex-col gap-6">
//          <div className="space-y-3 lg:max-w-sm">
//            <h2 className="font-bold text-3xl text-primary">{dict.slogan}</h2>
//            <div className="flex gap-2 text-sm">
//              <span className="inline-block text-secondary">{dict.madeIn}</span>
//              <img
//                alt="Brazil Country Image"
//                loading="lazy"
//                width={16}
//                height={16}
//                decoding="async"
//                style={{ color: 'transparent' }}
//                src="/assets/countries/pt-br.svg"
//              />
//            </div>
//          </div>
//
//          <div className="space-y-2">
//            <div className="flex gap-4">
//              {dict.social.map(({ alt, href }) => (
//                <a
//                  key={alt}
//                  className="brightness-50 transition-all hover:brightness-100"
//                  rel="noopener noreferrer"
//                  target="_blank"
//                  href={`https://go.virtuscloud.app/${href}`}
//                >
//                  <img
//                    alt={alt}
//                    loading="lazy"
//                    width={24}
//                    height={24}
//                    decoding="async"
//                    style={{ color: 'transparent' }}
//                    src={`/assets/companies/small/${href}.svg`}
//                  />
//                </a>
//              ))}
//            </div>
//          </div>
//
//          <a
//            className="flex w-fit items-center gap-2.5 text-nowrap rounded-md border border-virtus-700 px-4 py-2 text-secondary text-sm"
//            href="https://status.virtuscloud.app/"
//          >
//            <span className="flex items-center justify-center rounded-full bg-green-500">
//              <span className="block size-2.5 rounded-full bg-inherit animate-ping" />
//            </span>
//            <span>{dict.status}</span>
//          </a>
//        </div>
//
//        <div className="grid grid-cols-1 xs:grid-cols-2 gap-8 lg:grid-cols-3 xl:flex">
//          {dict.sections.map(({ title, links }) => (
//            <div key={title}>
//              <h2 className="mb-4 font-semibold text-base text-primary uppercase">{title}</h2>
//              <ul className="text-gray-400">
//                {links.map(([label, href, external]) => (
//                  <li key={label} className="mb-2">
//                    <a
//                      className="flex items-center gap-2 text-sm hover:underline"
//                      target={external ? '_blank' : '_self'}
//                      rel={external ? 'noopener noreferrer' : undefined}
//                      href={href}
//                    >
//                      {label}
//                      {external && (
//                        <svg
//                          xmlns="http://www.w3.org/2000/svg"
//                          width="1em"
//                          height="1em"
//                          fill="currentColor"
//                          viewBox="0 0 256 256"
//                        >
//                          <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//                        </svg>
//                      )}
//                    </a>
//                  </li>
//                ))}
//              </ul>
//            </div>
//          ))}
//        </div>
//      </div>
//
//      <div className="container">
//        <div
//          data-orientation="horizontal"
//          role="none"
//          className="shrink-0 bg-virtus-600 h-px w-full my-8"
//        />
//        <div className="flex w-full flex-col justify-between gap-4 sm:flex-row">
//          <div className="flex items-center gap-4">
//            <div className="flex flex-col">
//              <div className="text-secondary text-xs" translate="no">
//                Virtus Cloud LTDA
//              </div>
//              <span className="whitespace-nowrap text-wrap text-secondary text-xs">
//                00.000.000/0001-00
//              </span>
//            </div>
//          </div>
//          <div className="flex flex-col justify-center gap-6 lg:flex-row lg:items-center">
//            <a className="text-secondary text-sm hover:underline" href="/legal">
//              {dict.terms}
//            </a>
//            <a className="text-secondary text-sm hover:underline" href="/legal/policy">
//              {dict.policy}
//            </a>
//          </div>
//        </div>
//      </div>
//    </footer>
//  );
//}

//export default function Footer() {
//  return (
//    <footer className="z-49 border-virtus-700 border-t bg-virtus-900 py-12 pb-8">
//          <div className="container flex w-full flex-col justify-between gap-4 lg:flex-row">
//            <div className="flex flex-col gap-6">
//              <div className="space-y-3 lg:max-w-sm">
//                <h2 className="font-bold text-3xl text-primary">DEMOCRATIZANDO SONHOS</h2>
//                <div className="flex gap-2 text-sm">
//                  <span className="inline-block text-secondary">Feito com ❤️ no Brasil</span>
//                  <img
//                    alt="Brazil Country Image"
//                    loading="lazy"
//                    width={16}
//                    height={16}
//                    decoding="async"
//                    style={{ color: "transparent" }}
//                    src="/assets/countries/pt-br.svg"
//                  />
//                </div>
//              </div>
//
//              <div className="space-y-2">
//                <div className="flex gap-4">
//                  {[
//                    { alt: "Discord", href: "discord" },
//                    { alt: "Instagram", href: "instagram" },
//                    { alt: "Threads", href: "threads" },
//                    { alt: "Youtube", href: "youtube" },
//                    { alt: "Twitter", href: "twitter" },
//                    { alt: "LinkedIn", href: "linkedin" },
//                    { alt: "Github", href: "github" },
//                  ].map(({ alt, href }) => (
//                    <a
//                      key={alt}
//                      className="brightness-50 transition-all hover:brightness-100"
//                      rel="noopener noreferrer"
//                      target="_blank"
//                      href={`https://go.virtuscloud.app/${href}`}
//                    >
//                      <img
//                        alt={alt}
//                        loading="lazy"
//                        width={24}
//                        height={24}
//                        decoding="async"
//                        style={{ color: "transparent" }}
//                        src={`/assets/companies/small/${href}.svg`}
//                      />
//                    </a>
//                  ))}
//                </div>
//              </div>
//
//              <a
//                className="flex w-fit items-center gap-2.5 text-nowrap rounded-md border border-virtus-700 px-4 py-2 text-secondary text-sm"
//                href="https://status.virtuscloud.app/"
//              >
//                <span className="flex items-center justify-center rounded-full bg-green-500">
//                  <span className="block size-2.5 rounded-full bg-inherit animate-ping" />
//                </span>
//                <span>Status do Sistema</span>
//              </a>
//            </div>
//
//            <div className="grid grid-cols-1 xs:grid-cols-2 gap-8 lg:grid-cols-3 xl:flex">
//              {[
//                {
//                  title: "Minha Conta",
//                  links: [
//                    ["Informações da Conta", "/pt-br/account"],
//                    ["Segurança da Conta", "/pt-br/account/security"],
//                    ["Conexões da Conta", "/pt-br/account/connections"],
//                    ["Enviar uma Aplicação", "/pt-br/upload"],
//                    ["Resgatar Código", "/pt-br/account/redeem"],
//                  ],
//                },
//                {
//                  title: "Produto",
//                  links: [
//                    ["Preços", "/pt-br/pricing"],
//                    ["Bots", "/pt-br/bots"],
//                    ["Sites", "/pt-br/sites"],
//                    ["Blob", "/pt-br/blob"],
//                    ["Analytics", "/pt-br/analytics"],
//                  ],
//                },
//                {
//                  title: "Recursos",
//                  links: [
//                    ["Começo Rápido", "https://docs.virtuscloud.app/pt-br/getting-started/quick-start", true],
//                    ["Documentação da API", "https://docs.virtuscloud.app/pt-br/api-reference/authentication", true],
//                    ["Documentação do Blob", "https://docs.virtuscloud.app/pt-br/blob-reference/authentication", true],
//                    ["Kits de Desenvolvimento", "/pt-br/resources/sdks"],
//                    ["Extensão do Visual Studio Code", "/pt-br/resources/vscode-extension"],
//                    ["Interface de Linha de Comando", "/pt-br/resources/cli"],
//                  ],
//                },
//                {
//                  title: "Empresa",
//                  links: [
//                    ["Sobre", "/pt-br/about"],
//                    ["Contato", "/pt-br/sac"],
//                    ["Plataforma", "https://docs.virtuscloud.app/pt-br/platform/overview", true],
//                    ["Limites e Restrições", "https://docs.virtuscloud.app/pt-br/platform/limitations-and-restrictions", true],
//                    ["Reportar Abuso", "/pt-br/report-abuse"],
//                  ],
//                },
//              ].map(({ title, links }) => (
//                <div key={title}>
//                  <h2 className="mb-4 font-semibold text-base text-primary uppercase">{title}</h2>
//                  <ul className="text-gray-400">
//                    {links.map(([label, href, external]) => (
//                      <li key={label} className="mb-2">
//                        <a
//                          className="flex items-center gap-2 text-sm hover:underline"
//                          target={external ? "_blank" : "_self"}
//                          rel={external ? "noopener noreferrer" : undefined}
//                          href={href}
//                        >
//                          {label}
//                          {external && (
//                            <svg
//                              xmlns="http://www.w3.org/2000/svg"
//                              width="1em"
//                              height="1em"
//                              fill="currentColor"
//                              viewBox="0 0 256 256"
//                            >
//                              <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//                            </svg>
//                          )}
//                        </a>
//                      </li>
//                    ))}
//                  </ul>
//                </div>
//              ))}
//            </div>
//          </div>
//
//          <div className="container">
//            <div
//              data-orientation="horizontal"
//              role="none"
//              className="shrink-0 bg-virtus-600 h-px w-full my-8"
//            />
//            <div className="flex w-full flex-col justify-between gap-4 sm:flex-row">
//              <div className="flex items-center gap-4">
//                <div className="flex flex-col">
//                  <div className="text-secondary text-xs" translate="no">
//                    Virtus Cloud LTDA
//                  </div>
//                  <span className="whitespace-nowrap text-wrap text-secondary text-xs">
//                    00.000.000/0001-00
//                  </span>
//                </div>
//              </div>
//              <div className="flex flex-col justify-center gap-6 lg:flex-row lg:items-center">
//                <a className="text-secondary text-sm hover:underline" href="/legal">
//                  Termos de Serviço
//                </a>
//                <a className="text-secondary text-sm hover:underline" href="/legal/policy">
//                  Política de Uso
//                </a>
//              </div>
//            </div>
//          </div>
//        </footer>
//  );
//}
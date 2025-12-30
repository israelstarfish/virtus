//frontend/src/app/[lang]/legal/policy/page.jsx

'use client';

import Header from '@/components/Recycles/Header';
import Footer from '@/components/Recycles/Footer';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { policyMessages } from '@/app/[lang]/messages/policy';

export default function PolicyPage() {
  const { lang } = useParams();
  const t = policyMessages[lang] || policyMessages['pt-br'];

  return (
    <>
      <Header />
      <main className="prose container my-16 max-w-7xl">
        <div className="not-prose pb-6 text-center">
          <h4 className="text-3xl font-extrabold text-primary sm:text-4xl md:text-4xl">
            {t.title}
          </h4>
          <p className="text-base text-secondary sm:mx-auto sm:max-w-6xl sm:text-lg md:mt-2">
            {t.LanguageSelect}
          </p>
        </div>

        <h3 id="these-terms-contain">{t.containsTitle}</h3>
        <ul>
          {t.contains.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h3 id="user-awareness">{t.awareTitle}</h3>
        <ul>
          <li>{t.aware[0]}</li>
          <li>{t.aware[1]}</li>
          <li>{t.aware[2]}</li>
          <li>
            {t.aware[3]}
            <Link href="https://discord.com/terms">{t.aware[4]}</Link>
            {t.aware[5]}
            <Link href="https://discord.com/guidelines">{t.aware[6]}</Link>
            {t.aware[7]}
          </li>
          <li>
            {t.aware[8]} <Link href={`/${lang}/sac`}>{t.aware[9]}</Link>
          </li>
        </ul>

        <h3 id="allowed-content">{t.allowedTitle}</h3>
        <ul>
          {t.allowed.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h3 id="forbidden-content">{t.forbiddenTitle}</h3>
        <ul>
          {t.forbidden.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h3 id="prohibited-practices">{t.practicesTitle}</h3>
        <ul>
          {t.practices.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}

//frontend/src/app/[lang]/legal/policy/page.jsx

//'use client';
//
//import Header from '@/components/Recycles/Header';
//import Footer from '@/components/Recycles/Footer';
//import Link from 'next/link';
//import { useParams } from 'next/navigation';
//import { policyMessages } from '@/app/[lang]/messages/policy';
//
//export default function PolicyPage() {
//  const { lang } = useParams();
//  const t = policyMessages[lang] || policyMessages['pt-br'];
//
//  return (
//    <>
//      <Header />
//      <main className="prose container my-16 max-w-7xl">
//        <div className="not-prose pb-6 text-center">
//          <h4 className="text-3xl font-extrabold text-primary sm:text-4xl md:text-4xl">
//            {t.title}
//          </h4>
//          <p className="text-base text-secondary sm:mx-auto sm:max-w-6xl sm:text-lg md:mt-2">
//            {t.availableOnly}
//          </p>
//        </div>
//
//        <h3 id="these-terms-contain">{t.containsTitle}</h3>
//        <ul>
//          {t.contains.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//
//        <h3 id="user-awareness">{t.awareTitle}</h3>
//        <ul>
//          <li>{t.aware[0]}</li>
//          <li>{t.aware[1]}</li>
//          <li>{t.aware[2]}</li>
//          <li>
//            {t.aware[3]}
//            <Link href="https://discord.com/terms">{t.aware[4]}</Link>
//            {t.aware[5]}
//            <Link href="https://discord.com/guidelines">{t.aware[6]}</Link>
//            {t.aware[7]}
//          </li>
//          <li>
//            {t.aware[8]} <Link href={`/${lang}/sac`}>{t.aware[9]}</Link>
//          </li>
//        </ul>
//
//        <h3 id="allowed-content">{t.allowedTitle}</h3>
//        <ul>
//          {t.allowed.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//
//        <h3 id="forbidden-content">{t.forbiddenTitle}</h3>
//        <ul>
//          {t.forbidden.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//
//        <h3 id="prohibited-practices">{t.practicesTitle}</h3>
//        <ul>
//          {t.practices.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//      </main>
//      <Footer lang={lang} />
//    </>
//  );
//}

//frontend/src/app/[lang]/legal/policy/page.jsx

//'use client';
//
//import DefaultHeader from '@/components/Recycles/DefaultHeader';
//import Footer from '@/components/Recycles/Footer';
//import Link from 'next/link';
//import { useParams } from 'next/navigation';
//import { policyMessages } from '@/app/[lang]/messages/policy';
//
//export default function PolicyPage() {
//  const { lang } = useParams();
//  const t = policyMessages[lang] || policyMessages['pt-br'];
//
//  return (
//    <>
//      <DefaultHeader />
//      <main className="prose container my-16 max-w-7xl">
//        <div className="not-prose pb-6 text-center">
//          <h4 className="text-3xl font-extrabold text-primary sm:text-4xl md:text-4xl">
//            {t.title}
//          </h4>
//          <p className="text-base text-secondary sm:mx-auto sm:max-w-6xl sm:text-lg md:mt-2">
//            {t.availableOnly}
//          </p>
//        </div>
//
//        <h3 id="esses-termos-contêm">{t.containsTitle}</h3>
//        <ul>
//          {t.contains.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//
//        <h3 id="o-que-o-usuário-deve-estar-ciente">{t.awareTitle}</h3>
//        <ul>
//          <li>{t.aware[0]}</li>
//          <li>{t.aware[1]}</li>
//          <li>{t.aware[2]}</li>
//          <li>
//            {t.aware[3]}
//            <Link href="https://discord.com/terms">{t.aware[4]}</Link>
//            {t.aware[5]}
//            <Link href="https://discord.com/guidelines">{t.aware[6]}</Link>
//            {t.aware[7]}
//          </li>
//          <li>{t.aware[8]} <Link href={`/${lang}/sac`}>{t.aware[9]}</Link></li>
//        </ul>
//
//        <h3 id="conteudo-permitido">{t.allowedTitle}</h3>
//        <ul>
//          {t.allowed.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//
//        <h3 id="conteudo-proibido">{t.forbiddenTitle}</h3>
//        <ul>
//          {t.forbidden.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//
//        <h3 id="praticas-proibidas">{t.practicesTitle}</h3>
//        <ul>
//          {t.practices.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//      </main>
//      <Footer lang={lang} />
//    </>
//  );
//}

//'use client';
//
//import DefaultHeader from '@/components/Recycles/DefaultHeader';
//import Footer from '@/components/Recycles/Footer';
//import Link from 'next/link';
//import { useParams } from 'next/navigation';
//import { policyMessages } from '@/app/[lang]/messages/policy';
//
//export default function PolicyPage() {
//  const { lang } = useParams();
//  const t = policyMessages[lang] || policyMessages['pt-br'];
//
//  return (
//    <>
//      <DefaultHeader />
//      <main className="prose container my-16 max-w-7xl">
//        <div className="not-prose pb-6 text-center">
//          <h4 className="text-3xl font-extrabold text-primary sm:text-4xl md:text-4xl">
//            {t.title}
//          </h4>
//          <p className="text-base text-secondary sm:mx-auto sm:max-w-6xl sm:text-lg md:mt-2">
//            {t.availableOnly}
//          </p>
//        </div>
//
//        <h3 id="esses-termos-contêm">Esses termos contêm:</h3>
//        <ul>
//          {t.contains.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//
//        <h3 id="o-que-o-usuário-deve-estar-ciente">O que o usuário deve estar ciente:</h3>
//        <ul>
//          <li>{t.aware[0]}</li>
//          <li>{t.aware[1]}</li>
//          <li>{t.aware[2]}</li>
//          <li>
//            {t.aware[5]}
//            <Link href="https://discord.com/terms">{t.aware[6]}</Link>
//            {t.aware[7]}
//            <Link href="https://discord.com/guidelines">{t.aware[8]}</Link>
//            {t.aware[9]}
//          </li>
//          <li>
//            {t.aware[10]} <Link href={`/${lang}/sac`}>{t.aware[11]}</Link>
//          </li>
//        </ul>
//
//        <h3 id="conteudo-permitido">1. Conteúdo permitido</h3>
//        <ul>
//          {t.allowed.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//
//        <h3 id="conteudo-proibido">2. Conteúdo proibido</h3>
//        <ul>
//          {t.forbidden.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//
//        <h3 id="praticas-proibidas">3. Práticas proibidas</h3>
//        <ul>
//          {t.practices.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//      </main>
//      <Footer lang={lang} />
//    </>
//  );
//}

//frontend/src/app/[lang]/legal/policy/page.jsx

//'use client';
//
//import DefaultHeader from '@/components/Recycles/DefaultHeader';
//import Footer from '@/components/Recycles/Footer';
//import Link from 'next/link';
//import { useParams } from 'next/navigation';
//import { policyMessages } from '@/app/[lang]/messages/policy';
//
//export default function PolicyPage() {
//  const { lang } = useParams();
//  const t = policyMessages[lang] || policyMessages['pt-br'];
//
//  return (
//    <>
//      <DefaultHeader />
//      <main className="prose container my-16 max-w-7xl">
//        <div className="not-prose pb-6 text-center">
//          <h4 className="text-3xl font-extrabold text-primary sm:text-4xl md:text-4xl">
//            {t.title}
//          </h4>
//          <p className="text-base text-secondary sm:mx-auto sm:max-w-6xl sm:text-lg md:mt-2">
//            {t.availableOnly}
//          </p>
//        </div>
//
//        <h3 id="esses-termos-contêm">Esses termos contêm:</h3>
//        <ul>
//          {t.contains.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//
//        <h3 id="o-que-o-usuário-deve-estar-ciente">O que o usuário deve estar ciente:</h3>
//        <ul>
//          <li>{t.aware[0]}</li>
//          <li>{t.aware[1]}</li>
//          <li>{t.aware[2]}</li>
//          <li>
//            {t.aware[5]}
//            <Link href={t.aware[3]}>{t.aware[6]}</Link>
//            {t.aware[7]}
//            <Link href={t.aware[4]}>{t.aware[8]}</Link>
//            {t.aware[9]}
//          </li>
//          <li>
//            {t.aware[10]} <Link href={`/${lang}/sac`}>{t.aware[11]}</Link>
//          </li>
//        </ul>
//
//        <h3 id="conteudo-permitido">1. Conteúdo permitido</h3>
//        <ul>
//          {t.allowed.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//
//        <h3 id="conteudo-proibido">2. Conteúdo proibido</h3>
//        <ul>
//          {t.forbidden.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//
//        <h3 id="praticas-proibidas">3. Práticas proibidas</h3>
//        <ul>
//          {t.practices.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//      </main>
//      <Footer lang={lang} />
//    </>
//  );
//}

//frontend/src/app/[lang]/legal/policy/page.jsx

//'use client';
//
//import DefaultHeader from '@/components/Recycles/DefaultHeader';
//import Footer from '@/components/Recycles/Footer';
//import Link from 'next/link';
//import { useParams } from 'next/navigation';
//import { policyMessages } from '@/app/[lang]/messages/policy';
//
//export default function PolicyPage() {
//  const { lang } = useParams();
//  const t = policyMessages[lang] || policyMessages['pt-br'];
//
//  return (
//    <>
//      <DefaultHeader />
//      <main className="prose container my-16 max-w-7xl">
//        <div className="not-prose pb-6 text-center">
//          <h4 className="text-3xl font-extrabold text-primary sm:text-4xl md:text-4xl">
//            {t.title}
//          </h4>
//          <p className="text-base text-secondary sm:mx-auto sm:max-w-6xl sm:text-lg md:mt-2">
//            {t.availableOnly}
//          </p>
//        </div>
//
//        <h3 id="esses-termos-contêm">Esses termos contêm:</h3>
//        <ul>
//          {t.contains.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//
//        <h3 id="o-que-o-usuário-deve-estar-ciente">O que o usuário deve estar ciente:</h3>
//        <ul>
//          <li>{t.aware[0]}</li>
//          <li>{t.aware[1]}</li>
//          <li>{t.aware[2]}</li>
//          <li>
//            Os <Link href={t.aware[3]}>Termos de Serviço</Link> e as{' '}
//            <Link href={t.aware[4]}>Diretrizes da Comunidade</Link> do Discord também se aplicam.
//          </li>
//          <li>
//            {t.aware[5]} <Link href={`/${lang}/sac`}>{t.aware[6]}</Link>
//          </li>
//        </ul>
//
//        <h3 id="conteudo-permitido">1. Conteúdo permitido</h3>
//        <ul>
//          {t.allowed.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//
//        <h3 id="conteudo-proibido">2. Conteúdo proibido</h3>
//        <ul>
//          {t.forbidden.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//
//        <h3 id="praticas-proibidas">3. Práticas proibidas</h3>
//        <ul>
//          {t.practices.map((item, i) => (
//            <li key={i}>{item}</li>
//          ))}
//        </ul>
//      </main>
//      <Footer lang={lang} />
//    </>
//  );
//}

//'use client';
//
//import DefaultHeader from '@/components/Recycles/DefaultHeader';
//import Footer from '@/components/Recycles/Footer';
//import Link from 'next/link';
//import { useParams } from 'next/navigation';
//
//export default function PolicyPage() {
//  const { lang } = useParams();
//
//  return (
//    <>
//      <DefaultHeader />
//      <main className="prose container my-16 max-w-7xl">
//        <div className="not-prose pb-6 text-center">
//          <h4 className="text-3xl font-extrabold text-primary sm:text-4xl md:text-4xl">
//            Política de Uso
//          </h4>
//          <p className="text-base text-secondary sm:mx-auto sm:max-w-6xl sm:text-lg md:mt-2">
//            Disponível apenas em Português (Brasil). [25/05/2024]
//          </p>
//        </div>
//
//        <h3 id="esses-termos-contêm">Esses termos contêm:</h3>
//        <ul>
//          <li>Ações proibidas.</li>
//          <li>Conteúdos que são permitidos e não permitidos.</li>
//          <li>Punições em caso de descumprimento.</li>
//        </ul>
//
//        <h3 id="o-que-o-usuário-deve-estar-ciente">O que o usuário deve estar ciente:</h3>
//        <ul>
//          <li>Ao se cadastrar, você concorda com os Termos de Serviço e Políticas de Uso.</li>
//          <li>A Virtus Cloud não possui vínculo com Discord, WhatsApp, Telegram, Guilded, X (Twitter) ou outras plataformas.</li>
//          <li>É sua responsabilidade acompanhar atualizações dos termos.</li>
//          <li>Os <Link href="https://discord.com/terms">Termos de Serviço</Link> e as <Link href="https://discord.com/guidelines">Diretrizes da Comunidade</Link> do Discord também se aplicam.</li>
//          <li>Dúvidas? Entre em contato com nosso <Link href={`/${lang}/sac`}>Serviço de Atendimento ao Cliente (SAC)</Link>.</li>
//        </ul>
//
//        <h3 id="conteudo-permitido">1. Conteúdo permitido</h3>
//        <ul>
//          <li>Hospedagem de websites, APIs, dashboards, bots e soluções como Lavalink.</li>
//          <li>Suporte a linguagens: JS, TS, Python, Java, PHP, Ruby, Rust, Elixir e Go.</li>
//          <li>Aplicações não devem infringir termos de plataformas externas.</li>
//        </ul>
//
//        <h3 id="conteudo-proibido">2. Conteúdo proibido</h3>
//        <ul>
//          <li>Aplicações com conteúdo criminoso, malicioso ou ilegal.</li>
//          <li>Violação de direitos autorais.</li>
//          <li>Promoção de intolerância, golpes, fraudes ou discurso de ódio.</li>
//          <li>Hospedagem de malware, vírus ou softwares maliciosos.</li>
//          <li>Tráfico de pessoas, drogas, armas ou bens ilegais.</li>
//          <li>Incitação à autolesão ou suicídio.</li>
//          <li>Mineração de criptomoedas sem autorização.</li>
//          <li>Spam ou comunicações não autorizadas.</li>
//        </ul>
//
//        <h3 id="praticas-proibidas">3. Práticas proibidas</h3>
//        <ul>
//          <li>Upload de conteúdo difamatório, ofensivo ou ilegal.</li>
//          <li>Distribuição de vírus, worms ou arquivos corrompidos.</li>
//          <li>Fraudes financeiras e esquemas de pirâmide.</li>
//          <li>Transmitir conteúdo prejudicial a menores.</li>
//          <li>Fingir ser outra pessoa.</li>
//          <li>Violação de direitos de privacidade e propriedade intelectual.</li>
//          <li>Promover atividades ilegais ou interferir em outros usuários.</li>
//          <li>Testes de carga sem consentimento (DDoS).</li>
//          <li>Hospedar aplicações acima de 10GB.</li>
//          <li>Burlar plano estudantil com múltiplas contas.</li>
//          <li>Hospedar bots maliciosos ou self-bots.</li>
//          <li>Hospedar scripts de machine learning sem autorização.</li>
//        </ul>
//      </main>
//      <Footer lang={lang} />
//    </>
//  );
//}
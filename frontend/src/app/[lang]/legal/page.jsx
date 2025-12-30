// frontend/src/app/[lang]/legal/page.jsx

'use client';

import Header from '@/components/Recycles/Header';
import Footer from '@/components/Recycles/Footer';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import '../../styles/virtus.css';

export default function LegalPage() {
  const { lang } = useParams();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);


  return (
    <>
      <Header />
      <main className="prose container my-16 max-w-7xl">
        <div className="not-prose pb-6 text-center">
          <h4 className="text-3xl font-extrabold text-primary sm:text-4xl md:text-4xl">
            Termos de Serviço
          </h4>
          <p className="text-base text-secondary sm:mx-auto sm:max-w-6xl sm:text-lg md:mt-2">
            Disponível em Português (Brasil). [12/07/2024]
          </p>
        </div>

        <h3 id="esses-termos-contêm">Esses termos contêm:</h3>
        <ul>
          <li>Punições aplicáveis em caso de descumprimento.</li>
          <li>Informações sobre os Serviços e Produtos da Virtus Cloud.</li>
          <li>Informações suplementares sobre os dados que coletamos de você.</li>
          <li>O compromisso que você deve assumir ao utilizar os Serviços da Virtus Cloud.</li>
        </ul>

        <h3 id="o-que-o-usuário-deve-estar-ciente-sem-exceção">
          O que o usuário deve estar ciente, sem exceção:
        </h3>
        <ul>
          <li>
            A partir do momento que você se cadastra na Virtus Cloud, você concorda com os Termos de Serviço e Políticas de Uso.
          </li>
          <li>
            A Virtus Cloud não possuí qualquer vínculo com Discord Inc., WhatsApp, Telegram, Guilded, X (Twitter) ou outras plataformas.
          </li>
          <li>
            É sua responsabilidade manter-se informado sobre as atualizações dos termos da Virtus Cloud e, independentemente da leitura, você concorda com as informações descritas neste documento.
          </li>
          <li>
            Os <Link href="https://discord.com/terms">Termos de Serviço</Link>, bem como as{' '}
            <Link href="https://discord.com/guidelines">Diretrizes da Comunidade</Link> do Discord estão condicionados a esse termo.
          </li>
          <li>
            Caso tenha alguma dúvida sobre este documento, entre em contato com nosso{' '}
            <Link href="https://virtuscloud.app/sac">Serviço de Atendimento ao Cliente (SAC)</Link>.
          </li>
        </ul>
                <h3 id="1-uso-dos-serviços-da-virtus-cloud">1. Uso dos Serviços da Virtus Cloud</h3>
        <p>
          Ao visitar o site e/ou contratar um serviço, você, o CLIENTE, concorda com os presentes Termos de Serviço, que incluem os termos e condições adicionais e as políticas mencionadas neste documento. Esses Termos se aplicem a todos os usuários do site, incluindo clientes, contratados, fornecedores, parceiros, colaboradores, contribuidores e demais stakeholders.
        </p>
        <ol type="a">
          <li>É importante ressaltar que a VIRTUS CLOUD se destina exclusivamente à hospedagem de produtos e serviços digitais, como bots e websites. A plataforma não oferece suporte para produtos físicos ou serviços que envolvam entregas físicas.</li>
          <li>O uso dos serviços da VIRTUS CLOUD está condicionado à sua adesão aos Termos de Serviço e à Política de Uso. O descumprimento de qualquer uma dessas políticas poderá resultar na suspensão ou encerramento da sua conta.</li>
          <li>O uso dos serviços da VIRTUS CLOUD não exige que você seja membro de nossa comunidade no Discord. No entanto, o servidor serve como um canal de comunicação oficial da plataforma.</li>
          <li>A VIRTUS CLOUD reserva-se o direito de suspender ou encerrar o acesso aos seus serviços caso você descumpra estes Termos de Serviço ou seja banido do servidor oficial da VIRTUS CLOUD no Discord.</li>
          <li>Ao utilizar os serviços da VIRTUS CLOUD, você se compromete a cumprir todas as leis, regulamentações e portarias aplicáveis, incluindo, mas não se limitando a leis de proteção de dados, direitos autorais e exportação de software.</li>
          <li>Você concorda em não acessar ou tentar acessar qualquer interface administrativa dos nossos serviços por meios não autorizados. Isso inclui, mas não se limita a, o uso de bots, scripts automatizados ou tentativas de engenharia reversa. O acesso a essas interfaces é permitido exclusivamente mediante autorização prévia.</li>
          <li>É estritamente proibido utilizar os serviços da VIRTUS CLOUD para qualquer atividade que possa prejudicar, interferir ou interromper o funcionamento da plataforma ou de seus servidores. Isso inclui, mas não se limita a, ataques de negação de serviço (DoS/DDoS), exploração de vulnerabilidades e envio de tráfego malicioso.</li>
          <li>Cada plano oferecido possui um limite de uso claramente definido. Você concorda em respeitar esses limites e não tentar burlar ou excedê-los por meios não autorizados. Caso necessite de recursos adicionais, entre em contato com nossa equipe para discutir as opções disponíveis.</li>
          <li>Qualquer tentativa de burlar as regras da plataforma, realizar atividades maliciosas ou prejudicar a experiência de outros usuários resultará na suspensão imediata e definitiva de todos os serviços, sem direito a reembolso.</li>
        </ol>

        <h3 id="2-coleta-de-dados-e-informações-complementares">2. Coleta de Dados e Informações Complementares</h3>
        <ol type="a">
          <li>Para utilizar os serviços da VIRTUS CLOUD, é necessário realizar um cadastro. Durante o processo de cadastro, podem ser coletadas informações como seu ID do Discord, e-mail, país de origem e endereço IP. Você é responsável por manter sua conta protegida e pelo uso que dela é feito. Em caso de atividades suspeitas ou uso não autorizado de sua conta, você deve informar a equipe da VIRTUS CLOUD imediatamente. Caso o cadastro não seja realizado utilizando o Discord, a VIRTUS CLOUD coletará informações como nome, e-mail, país de origem e endereço IP.</li>
          <li>A VIRTUS CLOUD não tem acesso às suas credenciais de login e senha. Caso encontre dificuldades para acessar sua conta através de parceiros de autenticação, como o Discord via OAuth2, recomendamos que utilize o método de autenticação por e-mail disponível na página de login da VIRTUS CLOUD.</li>
          <li>O uso de VPNs (Redes Virtuais Privadas) é estritamente proibido, exceto mediante autorização prévia de um membro da equipe da VIRTUS CLOUD. Qualquer tentativa de utilização de VPNs sem a devida permissão poderá resultar na suspensão dos serviços da VIRTUS CLOUD.</li>
          <li>A VIRTUS CLOUD valoriza sua privacidade e trata suas informações com a máxima confidencialidade. As informações coletadas são compartilhadas com terceiros apenas para viabilizar a prestação de serviços com empresas do grupo e parceiros comerciais, para validar dados com entidades de proteção ao crédito, e para cumprir obrigações legais com autoridades judiciais, administrativas ou regulatórias.</li>
          <li>Por motivos de segurança, a VIRTUS CLOUD pode restringir seu acesso a determinadas funcionalidades. Apenas funções que não prejudiquem os serviços da VIRTUS CLOUD e que garantam a segurança de todos os clientes e usuários estarão disponíveis.</li>
        </ol>

        <h3 id="3-seus-direitos-ao-utilizar-os-serviços-da-virtus-cloud">3. Seus Direitos ao Utilizar os Serviços da Virtus Cloud</h3>
        <ol type="a">
          <li>Você concorda e entende que a utilização dos serviços da VIRTUS CLOUD está condicionada ao cumprimento da Política de Uso.</li>
          <li>Você concorda e entende que a transferência de um plano para outra conta ou entre usuários da VIRTUS CLOUD não é permitida, mesmo que ambas as contas sejam de titularidade do mesmo usuário.</li>
          <li>Você concorda e entende que pode solicitar o cancelamento definitivo dos Serviços da VIRTUS CLOUD a qualquer momento, desde que não haja nenhum plano ativo em sua conta.</li>
          <li>Você concorda e entende que a solicitação de cancelamento dos serviços da VIRTUS CLOUD pode resultar na suspensão definitiva de sua conta, como medida de segurança.</li>
          <li>Você tem o direito de utilizar os serviços da VIRTUS CLOUD, independentemente do plano contratado, desde que não viole nenhuma cláusula destes Termos de Serviço.</li>
          <li>Você pode utilizar os serviços da VIRTUS CLOUD de acordo com suas funcionalidades, para qualquer finalidade permitida, desde que utilize apenas as funções disponibilizadas para seu plano.</li>
          <li>Se sua conta for indevidamente bloqueada, é sua responsabilidade comunicar a equipe da VIRTUS CLOUD imediatamente para resolução do problema.</li>
        </ol>

        <h3 id="4-política-de-serviço-e-privacidade">4. Política de Serviço e Privacidade</h3>
        <ol type="a">
          <li>A VIRTUS CLOUD é uma empresa que coleta dados pessoais dos usuários em seus sites e se compromete a utilizar os dados coletados de acordo com as instruções e termos estabelecidos com os prestadores de serviços terceirizados e conforme a legislação aplicável. Esses dados podem ser fornecidos diretamente pelos usuários ou coletados automaticamente durante a navegação. Destacamos também a importância da leitura do Artigo sobre a Coleta de Dados e Informações Complementares.</li>
          <li>A VIRTUS CLOUD usa cookies para melhorar a navegação do usuário em seu site e oferecer uma experiência personalizada. Cookies de sessão e persistentes, bem como cookies de terceiros, são usados para coletar informações sobre o uso do site. A declaração informa que os usuários podem gerenciar ou desativar os cookies em seus navegadores, mas isso pode limitar a experiência de navegação no site.</li>
          <li>Você tem a obrigação e concorda em preservar os arquivos, direitos legais e demais afins de sua aplicação. Você poderá incluir dependentes que serão responsáveis em moderar sua aplicação, porém, deve ter em mente tais permissões que serão adicionadas aos seus moderadores. A VIRTUS CLOUD não se responsabiliza pelas permissões que nas quais você atribuiu para os seus moderadores....</li>
          <li>Os arquivos da sua aplicação serão mantidos em segurança com a VIRTUS CLOUD enquanto seus arquivos estiverem sidos mantidos na VIRTUS CLOUD.</li>
          <li>Nenhum membro da equipe da VIRTUS CLOUD, exceto a equipe de engenharia e técnica designada, tem acesso aos arquivos das aplicações dos clientes. Este acesso é estritamente controlado para garantir a privacidade e segurança dos dados. Apenas os usuários têm a capacidade de alterar e modificar seus arquivos conforme necessário. É política rigorosa da VIRTUS CLOUD que nenhum membro da equipe solicite arquivos das aplicações dos clientes ou informações confidenciais, como CPF, senhas, ou qualquer outra informação pessoal sensível. Essas medidas visam proteger integralmente a confidencialidade dos nossos clientes e manter a integridade dos serviços que oferecemos.</li>
          <li>Reiteramos nosso compromisso com a privacidade e segurança dos usuários. Em caso de dúvidas relacionadas às políticas de privacidade existentes, não hesite em entrar em contato conosco.</li>
        </ol>

        <h3 id="5-política-de-reembolso-e-informações-complementares">5. Política de Reembolso e Informações Complementares</h3>
        <ol type="a">
          <li>Todas as compras realizadas na VIRTUS CLOUD são feitas por sua livre e espontânea vontade. Você tem total controle sobre suas compras e decide o que comprar e quando comprar.</li>
          <li>O reembolso é aplicável apenas para transações realizadas diretamente através do site oficial da VIRTUS CLOUD, conforme os planos disponíveis. A VIRTUS CLOUD não se responsabiliza por transações feitas com terceiros, exceto com sua prévia autorização.</li>
          <li>A abertura de uma disputa diretamente com a empresa processadora de pagamentos (ex.: Mercado Pago, Stripe, etc.) resultará no cancelamento imediato da sua conta e plano, resultando também na perda do direito ao reembolso. A abertura de uma disputa via o mecanismo de medidas extraordinárias de devolução de valores (MED) gerenciado pelo Banco Central (BACEN) ou qualquer outra entidade reguladora resultará também nas penalidades já citadas. É importante destacar que o MED não deve ser utilizado em casos de desacordo comercial, conforme as políticas do Banco Central.</li>
          <li>Você pode cancelar seu plano a qualquer momento, sem custos adicionais. Para solicitar o cancelamento, entre em contato com nossa equipe de suporte através dos canais de atendimento. Após o cancelamento, você não terá mais acesso aos recursos da plataforma e não terá direito ao reembolso do valor pago. Após o período de 7 (sete) dias corridos a partir da data do primeiro pagamento, o plano não poderá ser reembolsado ou cancelado.</li>
          <li>A solicitação de reembolso deve ser encaminhada exclusivamente à equipe da VIRTUS CLOUD, conforme descrito na cláusula 5.f. Em caso de qualquer violação das cláusulas destes Termos ou das políticas de uso, o reembolso não será concedido. Atos ilegais ou que violem direitos autorais também resultam na perda do direito ao reembolso. É necessário e será solicitado a nota fiscal de serviço recebida por e-mail no momento da compra do plano.</li>
          <li>A solicitação de reembolso deve ser feita exclusivamente via finance@virtuscloud.app (e-mail) e deve conter as seguintes informações: nome completo, e-mail de cadastro, id de cadastro, referência da fatura e data de compra exata (relacionada a fatura). Também é necessário anexar a nota fiscal de serviço recebida por e-mail no momento da transação. Importante destacar que: em qualquer suspeita de fraude, a solicitação de reembolso será negada.</li>
        </ol>

        <h3 id="6-conteúdo-na-virtus-cloud-e-remoção-de-conteúdo">6. Conteúdo na Virtus Cloud e Remoção de Conteúdo</h3>
        <ol type="a">
          <li>Você é o único responsável pelo conteúdo que armazena...</li>
          <li>A VIRTUS CLOUD não se responsabiliza pelo conteúdo que você publica...</li>
          <li>A VIRTUS CLOUD reserva-se o direito de fiscalizar e remover conteúdo inadequado...</li>
          <li>Sua aplicação pode ser desativada automaticamente se atividades suspeitas forem detectadas...</li>
        </ol>
                <h3 id="7-manutenções-e-atualizações">7. Manutenções e Atualizações</h3>
        <ol type="a">
          <li>As manutenções dos serviços da VIRTUS CLOUD serão realizadas sempre que necessário...</li>
          <li>As manutenções podem ocasionar instabilidade e indisponibilidade parcial ou total...</li>
          <li>A VIRTUS CLOUD compromete-se a agendar as manutenções com antecedência...</li>
          <li>Todas as manutenções serão comunicadas previamente, exceto as de segurança...</li>
          <li>A VIRTUS CLOUD reconhece que as manutenções podem causar transtornos...</li>
        </ol>

        <h3 id="8-licença-da-virtus-cloud-e-restrições">8. Licença da Virtus Cloud e Restrições</h3>
        <ol type="a">
          <li>Você não pode tentar copiar, modificar ou extrair o código-fonte dos Serviços...</li>
          <li>A VIRTUS CLOUD poderá convidar você para testar ou utilizar comandos/sistemas em fase beta...</li>
          <li>É expressamente proibido desativar ou tentar contornar mecanismos de segurança...</li>
        </ol>

        <h3 id="9-indenização">9. Indenização</h3>
        <ol type="a">
          <li>Ao utilizar os Serviços da VIRTUS CLOUD, você concorda em isentar a empresa de quaisquer reivindicações de terceiros...</li>
          <li>Ao violar qualquer Termo ou Política de Uso da VIRTUS CLOUD, você poderá estar sujeito a cobranças judiciais...</li>
          <li>A VIRTUS CLOUD reserva-se o direito de cobrar multas de indenização por danos causados...</li>
        </ol>

        <h3 id="10-modificação-na-sua-aplicação">10. Modificação na sua aplicação</h3>
        <ol type="a">
          <li>Nenhuma informação de sua aplicação será modificada durante a hospedagem...</li>
          <li>A VIRTUS CLOUD não se responsabiliza por modificações feitas em sua aplicação caso outras pessoas tenham acesso...</li>
          <li>A VIRTUS CLOUD não se responsabiliza por modificações feitas por usuários não autorizados...</li>
        </ol>
                <h3 id="11-responsabilidade-da-virtus-cloud-com-você">
          11. Responsabilidade da Virtus Cloud com você
        </h3>
        <ol type="a">
          <li>A VIRTUS CLOUD reserva-se o direito de preservar suas informações, incluindo sua aplicação, a partir do momento em que você utiliza os Serviços.</li>
          <li>A equipe da VIRTUS CLOUD não se responsabiliza pela perda de arquivos de sua aplicação. É de total responsabilidade sua realizar o backup.</li>
          <li>A VIRTUS CLOUD possui sistemas robustos de backup, mas em caso de falha global a responsabilidade continua sendo sua.</li>
          <li>Backups são realizados diariamente ou semanalmente conforme plano contratado e disponibilizados na aba Snapshots.</li>
          <li>A VIRTUS CLOUD não se responsabiliza por falhas de cópia de segurança. É responsabilidade do usuário realizar backups regularmente.</li>
          <li>A VIRTUS CLOUD não se responsabiliza por qualquer perda de dados ou danos decorrentes de migração ou falha global.</li>
        </ol>

        <h3 id="12-propriedade-intelectual">12. Propriedade Intelectual</h3>
        <ol type="a">
          <li>Você reserva-se o direito de responder acusações judiciais em seu nome.</li>
          <li>Sua aplicação pode ser removida mediante notificações válidas.</li>
          <li>Você concorda em não utilizar ou modificar arquivos de terceiros sem autorização.</li>
          <li>Você concorda que é de sua responsabilidade auditar os arquivos de suas aplicações.</li>
          <li>Você concorda que sua conta poderá ser suspensa em caso de violação de direitos autorais.</li>
        </ol>

        <h3 id="13-outros-conteúdos">13. Outros conteúdos</h3>
        <ol type="a">
          <li>A VIRTUS CLOUD reserva-se o direito de divulgar seu conteúdo hospedado, preservando a privacidade.</li>
          <li>Com seu consentimento, sua aplicação poderá ser utilizada para fins de marketing.</li>
          <li>Com seu consentimento, feedbacks e comentários públicos poderão ser utilizados para aprimoramento da plataforma.</li>
        </ol>

        <h3 id="14-alteração-nos-termos-de-serviço">14. Alteração nos Termos de Serviço</h3>
        <ol type="a">
          <li>A VIRTUS CLOUD reserva-se o direito de atualizar os Termos periodicamente.</li>
          <li>É sua responsabilidade revisar e concordar com as atualizações, independentemente da leitura.</li>
          <li>A VIRTUS CLOUD comunicará as atualizações via site ou outros meios apropriados.</li>
          <li>As atualizações entram em vigor na data especificada na comunicação.</li>
        </ol>

        <h3 id="15-recomendações">15. Recomendações</h3>
        <ol type="a">
          <li>A VIRTUS CLOUD não emitirá recomendações formais sobre planos, mas usuários ou equipe podem sugerir.</li>
          <li>A decisão de implementar sugestões cabe exclusivamente a você.</li>
        </ol>

        <h3 id="16-política-de-uso">16. Política de Uso</h3>
        <ol type="a">
          <li>Reiteramos que todas as cláusulas presentes nesse termo também se aplicam à nossa política de uso.</li>
        </ol>

        <h3 id="17-poder-judicial">17. Poder Judicial</h3>
        <ol type="a">
          <li>Todo o conteúdo utilizado na VIRTUS CLOUD está proibido para fins comerciais sem autorização.</li>
          <li>A VIRTUS CLOUD pode enviar avisos e notificações diretamente a você.</li>
          <li>É responsabilidade exclusiva do usuário a entrega de produtos comercializados em sua aplicação.</li>
          <li>Em caso de litígio, a decisão judicial determinará os direitos de ambas as partes.</li>
          <li>A VIRTUS CLOUD reserva-se o direito de comunicar-se por e-mail utilizando o domínio virtuscloud.app.</li>
          <li>Você e a VIRTUS CLOUD concordam em submeter-se exclusivamente aos tribunais de Goiânia, Goiás, Brasil.</li>
          <li>Terceiros autorizados podem utilizar nome e logotipo da VIRTUS CLOUD conforme diretrizes e aprovação prévia.</li>
        </ol>
      </main>
      <Footer />
    </>
  );
}


//frontend/src/app/[lang]/legal/page.jsx

//'use client';
//
//import DefaultHeader from '@/components/Recycles/DefaultHeader';
//import Footer from '@/components/Recycles/Footer';
//import Link from 'next/link';
//import { useParams } from 'next/navigation';
//
//export default function LegalPage() {
//  const { lang } = useParams();
//
//  return (
//    <>
//      <DefaultHeader />
//      <main className="prose container my-16 max-w-4xl">
//        <div className="not-prose text-center mb-10">
//          <h1 className="text-4xl font-bold text-primary">Documentos Legais</h1>
//          <p className="text-secondary mt-2 text-lg">
//            Aqui você encontra os documentos que regem o uso da plataforma.
//          </p>
//        </div>
//
//        <ul className="space-y-4">
//          <li>
//            <Link href={`/${lang}/legal/policy`} className="text-blue-600 hover:underline">
//              Política de Uso
//            </Link>
//          </li>
//          <li>
//            <Link href="https://discord.com/terms" target="_blank" className="text-blue-600 hover:underline">
//              Termos de Serviço do Discord
//            </Link>
//          </li>
//          <li>
//            <Link href="https://discord.com/guidelines" target="_blank" className="text-blue-600 hover:underline">
//              Diretrizes da Comunidade do Discord
//            </Link>
//          </li>
//          <li>
//            <Link href={`/${lang}/sac`} className="text-blue-600 hover:underline">
//              Serviço de Atendimento ao Cliente (SAC)
//            </Link>
//          </li>
//        </ul>
//      </main>
//      <Footer lang={lang} />
//    </>
//  );
//}
'use client';

import { usePathname } from 'next/navigation';
import '../../styles/globais.css';

export default function TermsPage() {
  const pathname = usePathname();
  const lang = pathname.split('/')[1];
  const isPtBr = lang === 'pt-br';

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold border-b border-gray-700 pb-4">
          Termos de Serviço
        </h1>

        <p className="text-sm text-gray-400">
          Disponível apenas em Português (Brasil). <span className="italic">[06/08/2025]</span>
        </p>

        <section className="space-y-4">
          <p>Ao se cadastrar na Virtus Cloud, você concorda com os Termos de Serviço e com a Política de Uso.</p>
          <p>A Virtus Cloud não possui vínculo com plataformas como Discord Inc., WhatsApp, Telegram, Guilded, X (Twitter), ou outras.</p>
          <p>É sua responsabilidade manter-se informado sobre atualizações dos termos. Concorda com eles mesmo sem leitura.</p>
          <p>Esses termos contêm informações sobre punições, serviços, dados coletados, compromissos e obrigações legais.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold pt-6 border-t border-gray-700">1. Uso dos Serviços da Virtus Cloud</h2>
          <p>Destinado à hospedagem de produtos digitais, como bots e sites. Proibido uso físico ou entregas.</p>
          <p>Violação de políticas resulta em suspensão ou encerramento de conta, sem necessidade de vínculo Discord.</p>
          <p>Banimento no servidor da Virtus Cloud pode gerar suspensão de acesso.</p>
          <p>Você deve seguir leis de proteção de dados, direitos autorais e exportação de software.</p>
          <p>É proibido acessar áreas administrativas por meios não autorizados.</p>
          <p>Proibidas atividades como DoS/DDoS, exploração de vulnerabilidades ou envio de tráfego malicioso.</p>
          <p>Planos possuem limites definidos. Burlar esses limites resulta em suspensão sem reembolso.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold pt-6 border-t border-gray-700">2. Coleta de Dados</h2>
          <p>Dados coletados: ID do Discord, e-mail, país de origem, IP. Sem Discord: nome, e-mail, país e IP.</p>
          <p>Usuário responsável pela segurança da conta e comunicação em casos suspeitos.</p>
          <p>A Virtus Cloud não possui acesso à senha do usuário. Autenticação por e-mail é recomendada.</p>
          <p>VPNs proibidas sem autorização expressa da equipe. Uso indevido resulta em suspensão.</p>
          <p>Dados podem ser compartilhados com parceiros ou para obrigações legais.</p>
          <p>Acesso às funcionalidades pode ser limitado por segurança.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold pt-6 border-t border-gray-700">3. Direitos do Usuário</h2>
          <p>Uso dos serviços condicionado ao cumprimento das políticas da Virtus Cloud.</p>
          <p>Não é permitida transferência de plano entre contas, mesmo que do mesmo titular.</p>
          <p>Cancelamento definitivo permitido caso não haja plano ativo. Pode implicar suspensão de conta.</p>
          <p>Você pode utilizar os serviços conforme seu plano e sem violar os termos.</p>
          <p>Bloqueios indevidos devem ser reportados imediatamente à equipe.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold pt-6 border-t border-gray-700">4. Política de Serviço e Privacidade</h2>
          <p>A Virtus Cloud coleta dados pessoais conforme legislação e termos acordados.</p>
          <p>Cookies são usados para personalizar navegação. Podem ser desativados, com impacto na experiência.</p>
          <p>Usuário responsável por moderadores e permissões atribuídas à aplicação.</p>
          <p>Arquivos mantidos em segurança. Acesso restrito à equipe técnica designada.</p>
          <p>A Virtus Cloud não solicita arquivos pessoais, senhas ou CPF.</p>
        </section>

                <section className="space-y-4">
          <h2 className="text-xl font-semibold pt-6 border-t border-gray-700">5. Política de Reembolso</h2>
          <p>Compras são feitas por livre vontade. Reembolsos aplicáveis apenas para transações via site oficial da Virtus Cloud.</p>
          <p>A Virtus Cloud não se responsabiliza por transações realizadas com terceiros sem autorização prévia.</p>
          <p>Disputas abertas junto à processadora de pagamentos (ex: Mercado Pago, Stripe) resultarão em cancelamento imediato da conta e perda do direito ao reembolso.</p>
          <p>O uso de mecanismos como o MED (Banco Central) em desacordos comerciais também resulta nas penalidades citadas.</p>
          <p>Você pode cancelar seu plano a qualquer momento. Após o cancelamento, perde o acesso e o direito ao reembolso.</p>
          <p>O reembolso só é válido dentro do prazo de 7 dias corridos a partir da data do primeiro pagamento.</p>
          <p>A solicitação deve ser enviada para <code>finance@virtuscloud.app</code> contendo: nome completo, e-mail, ID de cadastro, referência da fatura, data de compra e nota fiscal. Em caso de fraude, o reembolso será negado.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold pt-6 border-t border-gray-700">6. Conteúdo e Remoção</h2>
          <p>Você é exclusivamente responsável pelo conteúdo armazenado, transmitido ou publicado na Virtus Cloud.</p>
          <p>A Virtus Cloud não se responsabiliza pelo conteúdo hospedado pelos usuários.</p>
          <p>Aplicações podem ser fiscalizadas ou removidas sem aviso, em caso de violação, suspeita ou ordem judicial.</p>
          <p>Conteúdo como spam, malware, phishing ou adulto será removido automaticamente.</p>
          <p>Aplicações com atividades suspeitas serão desativadas automaticamente.</p>
          <p>Você deve garantir conformidade com os termos da Virtus Cloud e de outras plataformas utilizadas.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold pt-6 border-t border-gray-700">7. Manutenções</h2>
          <p>As manutenções ocorrem quando necessário, visando estabilidade e segurança dos serviços.</p>
          <p>Elas podem gerar instabilidades ou indisponibilidades temporárias.</p>
          <p>A Virtus Cloud compromete-se a agendar manutenções fora dos horários de pico e comunicá-las no portal de status.</p>
          <p>Manutenções críticas (segurança, desempenho) podem ocorrer sem aviso prévio.</p>
          <p>Não há responsabilidade da Virtus Cloud por inatividades durante esse período.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold pt-6 border-t border-gray-700">8. Licença e Restrições</h2>
          <p>Você não pode copiar, modificar, decompor ou tentar extrair o código-fonte dos serviços da Virtus Cloud sem autorização legal ou da equipe Virtus Cloud.</p>
          <p>Sistemas em fase beta poderão ser disponibilizados para testes antecipados.</p>
          <p>É proibido desativar ou contornar os mecanismos de segurança da plataforma. Isso resultará em suspensão imediata dos serviços.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold pt-6 border-t border-gray-700">9. Indenização</h2>
          <p>Você concorda em isentar a Virtus Cloud, seus parceiros e colaboradores de quaisquer reclamações relacionadas a:</p>
          <ul className="list-disc list-inside text-gray-300">
            <li>Violação destes Termos</li>
            <li>Uso indevido dos serviços</li>
            <li>Violação de leis ou regulamentos</li>
            <li>Conteúdo ou aplicação hospedada</li>
          </ul>
          <p>Isso inclui despesas jurídicas, perdas e danos. A Virtus Cloud notificará você por escrito ou digitalmente.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold pt-6 border-t border-gray-700">10. Modificação na Aplicação</h2>
          <p>A Virtus Cloud não modifica suas aplicações durante a hospedagem, mas pode removê-las em caso de violação ou denúncia válida.</p>
          <p>Você é responsável por controlar o acesso ao seu repositório ou integrações que façam deploy automático.</p>
          <p>Modificações feitas por usuários não autorizados são de responsabilidade exclusiva do titular da conta.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold pt-6 border-t border-gray-700">11. Responsabilidade da Virtus Cloud</h2>
          <p>A Virtus Cloud preserva suas informações enquanto você utilizar os serviços.</p>
          <p>A equipe não se responsabiliza pela perda de arquivos. Você deve fazer backup dos seus dados.</p>
          <p>Backups são realizados diariamente ou semanalmente, conforme o plano contratado, e exibidos como snapshots.</p>
          <p>Falhas de backup podem ocorrer por arquivos corrompidos. Ainda assim, o usuário é responsável pelos backups regulares.</p>
          <p>A Virtus Cloud não responde por perdas de dados causadas por falhas globais ou migração entre servidores.</p>
        </section>

                <section className="space-y-4">
          <h2 className="text-xl font-semibold pt-6 border-t border-gray-700">12. Propriedade Intelectual</h2>
          <p>Você responde por acusações judiciais relacionadas às suas aplicações.</p>
          <p>Aplicações podem ser removidas após notificações válidas.</p>
          <p>É proibido hospedar arquivos modificados de terceiros sem autorização.</p>
          <p>Violação de copyright resulta em suspensão imediata dos serviços.</p>
          <p>Auditoria dos arquivos é responsabilidade do usuário.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold pt-6 border-t border-gray-700">13. Outros conteúdos</h2>
          <p>A Virtus Cloud poderá divulgar conteúdos hospedados, respeitando a privacidade.</p>
          <p>Com seu consentimento, aplicações podem ser usadas para fins de marketing.</p>
          <p>Feedback público pode ser utilizado com sua autorização, sempre que possível.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold pt-6 border-t border-gray-700">14. Alteração nos Termos de Serviço</h2>
          <p>A Virtus Cloud pode atualizar os termos e políticas periodicamente para manter conformidade.</p>
          <p>Você concorda com os termos atualizados independentemente da leitura.</p>
          <p>As atualizações entram em vigor na data especificada. O uso contínuo constitui aceitação.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold pt-6 border-t border-gray-700">15. Recomendações</h2>
          <p>A Virtus Cloud não recomenda formalmente planos, mas usuários e equipe podem fazer sugestões. A decisão final é sua.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold pt-6 border-t border-gray-700">16. Política de Uso</h2>
          <p>Todos os termos aqui descritos também são aplicáveis à Política de Uso da Virtus Cloud.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold pt-6 border-t border-gray-700">17. Poder Judicial</h2>
          <p>É proibido usar conteúdo da Virtus Cloud para fins comerciais sem autorização.</p>
          <p>A Virtus Cloud pode enviar e-mails e notificações diretamente a você.</p>
          <p>Você é responsável por produtos vendidos em suas aplicações. A Virtus Cloud não media pagamentos com terceiros.</p>
          <p>Litígios serão resolvidos nos tribunais municipais de Caucaia, Ceará, Brasil.</p>
          <p>Uso de logotipo e nome da Virtus Cloud só é permitido com aprovação prévia, conforme diretrizes.</p>
        </section>

        <footer className="border-t border-gray-700 pt-6 text-sm text-center text-gray-400">
          Este documento foi atualizado em <strong>06 de agosto de 2025</strong> e está sujeito a alterações sem aviso prévio. Para dúvidas, entre em contato com o SAC da Virtus Cloud.
        </footer>

        {!isPtBr && (
          <div className="mt-10 text-center text-sm text-yellow-500">
            Tradução dos termos não disponível para este idioma.
          </div>
        )}
      </div>
    </main>
  );
}
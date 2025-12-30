// frontend/utils/routeSections.ts

export const routeSectionMap: Record<string, string> = {
    
    // ROTAS AUTENTICADAS/DASHBOARD
    '/upload': 'upload',
    '/dashboard': 'dashboard',
    '/dashboard/databases': 'databases',
    '/dashboard/snapshots': 'snapshots',
    '/dashboard/blobs': 'blobs_upload', // envio de arquivos // Blobs para serem enviados clicando em um botão
    '/dashboard/accounts': 'settings',
    '/dashboard/accounts/security': 'security',
    '/dashboard/accounts/connections': 'connections',
    '/dashboard/accounts/invoices': 'invoices',
    '/dashboard/accounts/blobs': 'blobs_view', // visualização de métricas // Para visualizar os blobs em tempo real, arquivos e tamanho.
    '/dashboard/accounts/redeem': 'redeem',
    '/dashboard/support': 'support',

    // ROTAS DE UPGRADE
    '/pay': 'pay',
    '/pricing': 'pricing',

    // ROTAS PÚBLICAS
    '/enterprise': 'public',
    '/bots': 'public',
    '/sites': 'public',
    '/blobs': 'public',
    '/analytics': 'public',
    '/sac': 'public',
    '/report-abuse': 'public',
    '/about': 'public',
    '/legal': 'public',
    '/legal/policy': 'public',
};

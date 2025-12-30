// frontend/utils/permissions.ts

import { routeSectionMap } from './routeSections';

// 🔐 Permissões por seção (usado para proteger páginas inteiras)
export const roleSections: Record<string, string[]> = {
  admin: [
    'dashboard', 'upload', 'databases', 'snapshots', 'blobs_upload', 'blobs_view',
    'settings', 'security', 'connections', 'invoices', 'redeem',
    'support', 'pay', 'pricing', 'metrics', 'containers', 'plans', 'users'
  ],
  staff: [
    'dashboard', 'upload', 'databases', 'snapshots', 'blobs_upload', 'blobs_view',
    'settings', 'security', 'connections', 'invoices',
    'support', 'pay', 'pricing', 'metrics', 'containers'
  ],
  dev: [
    'dashboard', 'upload', 'databases', 'snapshots', 'blobs_upload', 'blobs_view',
    'settings', 'security', 'connections', 'invoices', 'redeem',
    'support', 'pay', 'pricing', 'deploy', 'export', 'containers'
  ],
  support: [
    'dashboard', 'blobs_view', 'settings', 'security', 'connections',
    'support', 'metrics', 'history'
  ],
  user: [
    'dashboard', 'upload', 'blobs_upload', 'blobs_view', 'settings', 'security',
    'connections', 'invoices', 'redeem', 'apps', 'pay', 'pricing'
  ],
};

// ✅ Verifica se o usuário tem permissão para acessar uma seção
export function hasPermission(role: string, section: string): boolean {
  return hasSectionPermission(role, section);
}

// ✅ Verifica se o usuário pode acessar uma seção
export function hasSectionPermission(role: string, section: string): boolean {
  return roleSections[role]?.includes(section) ?? false;
}

// 🔧 Permissões por ação (usado para proteger funcionalidades específicas)
export const roleActions: Record<string, string[]> = {
  admin:   ['view_dashboard', 'edit_settings', 'upload_files', 'manage_users', 'view_metrics', 'export_data'],
  staff:   ['view_dashboard', 'upload_files', 'view_metrics'],
  dev:     ['view_dashboard', 'upload_files', 'deploy_apps', 'export_data'],
  support: ['view_dashboard', 'view_metrics', 'view_history'],
  user:    ['view_dashboard', 'upload_files', 'view_apps'],
};

// ✅ Verifica se o usuário pode executar uma ação específica
export function hasActionPermission(role: string, action: string): boolean {
  return roleActions[role]?.includes(action) ?? false;
}

// 🚀 Verifica se o usuário pode fazer deploy (ação + plano ativo)
export function canDeploy(role: string, plan: string): boolean {
  return hasActionPermission(role, 'deploy_apps') && plan !== 'no-plan';
}

// 📋 (Opcional) Log de tentativas de acesso
export function logAccessAttempt(username: string, target: string, type: 'section' | 'action', result: 'granted' | 'denied') {
  console.log(`[AUDIT] ${username} tentou acessar ${type} "${target}" → ${result}`);
}
// 🧪 Validação de cobertura das seções

export function validateSectionCoverage() {
  const allSections = Object.values(roleSections).flat();
  const allMapped = Object.values(routeSectionMap);

  const uncovered = allMapped.filter(section => !allSections.includes(section));
  if (uncovered.length > 0) {
    console.warn('⚠️ Seções não cobertas por nenhuma role:', uncovered);
  }
}


// frontend/utils/permissions.ts

//// 🔐 Permissões por seção (usado para proteger páginas inteiras)
//export const roleSections: Record<string, string[]> = {
//  admin:   ['dashboard', 'upload', 'settings', 'admin', 'metrics', 'containers', 'plans', 'users'],
//  staff:   ['dashboard', 'upload', 'settings', 'metrics', 'containers'],
//  dev:     ['dashboard', 'upload', 'settings', 'deploy', 'containers', 'export'],
//  support: ['dashboard', 'metrics', 'history'],
//  user:    ['dashboard', 'upload', 'settings', 'apps'],
//};
//
//// ✅ Verifica se o usuário tem permissão para acessar uma seção
//export function hasPermission(role: string, section: string): boolean {
//  return hasSectionPermission(role, section);
//}
//
//// ✅ Verifica se o usuário pode acessar uma seção
//export function hasSectionPermission(role: string, section: string): boolean {
//  return roleSections[role]?.includes(section) ?? false;
//}
//
//// 🔧 Permissões por ação (usado para proteger funcionalidades específicas)
//export const roleActions: Record<string, string[]> = {
//  admin:   ['view_dashboard', 'edit_settings', 'upload_files', 'manage_users', 'view_metrics', 'export_data'],
//  staff:   ['view_dashboard', 'upload_files', 'view_metrics'],
//  dev:     ['view_dashboard', 'upload_files', 'deploy_apps', 'export_data'],
//  support: ['view_dashboard', 'view_metrics', 'view_history'],
//  user:    ['view_dashboard', 'upload_files', 'view_apps'],
//};
//
//// ✅ Verifica se o usuário pode executar uma ação específica
//export function hasActionPermission(role: string, action: string): boolean {
//  return roleActions[role]?.includes(action) ?? false;
//}
//
//// 🚀 Verifica se o usuário pode fazer deploy (ação + plano ativo)
//export function canDeploy(role: string, plan: string): boolean {
//  return hasActionPermission(role, 'deploy_apps') && plan !== 'no-plan';
//}
//
//// 📋 (Opcional) Log de tentativas de acesso
//export function logAccessAttempt(username: string, target: string, type: 'section' | 'action', result: 'granted' | 'denied') {
//  console.log(`[AUDIT] ${username} tentou acessar ${type} "${target}" → ${result}`);
//}

// hasPermission por hasSectionPermission

// 🎯 Mapeamento de permissões por tipo de usuário
//export const rolePermissions: Record<string, string[]> = {
//  admin:   ['dashboard', 'upload', 'settings', 'admin', 'metrics', 'containers', 'plans', 'users'],
//  staff:   ['dashboard', 'upload', 'settings', 'metrics', 'containers'],
//  dev:     ['dashboard', 'upload', 'settings', 'deploy', 'containers', 'export'],
//  support: ['dashboard', 'metrics', 'history'],
//  user:    ['dashboard', 'upload', 'settings', 'apps'],
//};
//
//// ✅ Verifica se o usuário tem permissão para acessar uma seção
//export function hasPermission(role: string, section: string): boolean {
//  return rolePermissions[role]?.includes(section) ?? false;
//}
//
//// 🚀 Verifica se o usuário pode fazer deploy (precisa da permissão + plano ativo)
//export function canDeploy(role: string, plan: string): boolean {
//  return hasPermission(role, 'deploy') && plan !== 'no-plan';
//}
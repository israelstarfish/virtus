//frontend/src/app/upload/page.jsx

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

const supportedLangs = ['pt-br', 'en', 'es', 'zh'];

// 🔍 Detecta o idioma preferido do usuário com base no header
async function detectLang() {
  const headerList = await headers();
  const acceptLang = headerList.get('accept-language') || '';

  const preferred = acceptLang
    .split(',')
    .map(lang => lang.split(';')[0].toLowerCase());

  const matched = preferred.find(lang =>
    supportedLangs.includes(lang)
  );

  return matched || 'en'; // 🌐 Fallback para inglês se não encontrar
}

// 🔁 Redireciona para a versão localizada da página
export default async function Page() {
  const lang = await detectLang();
  redirect(`/${lang}/upload`); // ou /${lang}/dashboard/upload
}

//import { redirect } from 'next/navigation'
//import { headers } from 'next/headers'
//
//const supportedLangs = ['pt-br', 'en', 'es', 'zh']
//
//async function detectLang() {
//  const headerList = await headers()
//  const acceptLang = headerList.get('accept-language') || ''
//
//  const preferred = acceptLang
//    .split(',')
//    .map(lang => lang.split(';')[0].toLowerCase())
//
//  const matched = preferred.find(lang =>
//    supportedLangs.includes(lang)
//  )
//
//  return matched || 'en' // fallback se não encontrar
//}
//
//export default async function Page() {
//  const lang = await detectLang()
//  redirect(`/${lang}/dashboard/upload`) // ou /${lang}/dashboard
//}
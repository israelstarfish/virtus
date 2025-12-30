//src/app/layout.tsx

import './styles/virtus.css';
import { messages } from '../messages';
import { getLangFromCookie } from '../utils/getLangFromCookie';
//import AntiInspect from '@/components/secure/AntiInspect';

export function generateMetadata() {
const lang = getLangFromCookie();
  const dict = messages[lang] || messages['pt-br'];


  return {
    title: dict.title,
    description: dict.description,
  };
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getLangFromCookie();
;
  
  return (
    <html lang="pt-br" className="notranslate" translate="no">
      <body className="min-h-screen h-full flex flex-col bg-login-pattern bg-repeat bg-black text-white">
        
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full transition-opacity duration-300 ease-in-out opacity-100">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

//src/app/layout.tsx

//import './styles/virtus.css';
//import { messages } from '../messages';
//import { getLangFromCookie } from '../utils/getLangFromCookie';
//import AntiInspect from '@/components/secure/AntiInspect';
//
//export function generateMetadata() {
//const lang = getLangFromCookie();
//  const dict = messages[lang] || messages['pt-br'];
//
//
//  return {
//    title: dict.title,
//    description: dict.description,
//  };
//}
//
//
//export default function RootLayout({ children }: { children: React.ReactNode }) {
//  const lang = getLangFromCookie();
//;
//  
//  return (
//    <html lang="pt-br" className="notranslate" translate="no">
//      <body className="min-h-screen h-full flex flex-col bg-login-pattern bg-repeat bg-black text-white">
//        <AntiInspect />
//        <div className="flex-1 flex items-center justify-center">
//          <div className="w-full transition-opacity duration-300 ease-in-out opacity-100">
//            {children}
//          </div>
//        </div>
//      </body>
//    </html>
//  );
//}

//src/app/layout.tsx

//import './styles/virtus.css';
//import { messages } from '../messages';
//
//export function generateMetadata({ params }) {
//  // Tenta extrair o idioma da URL
//  const lang = Array.isArray(params?.lang) ? params.lang[0] : params?.lang;
//  const dict = messages[lang] || messages['pt-br'];
//
//  return {
//    title: dict.title,
//    description: dict.description,
//  };
//}
//
//export default function RootLayout({ children }: { children: React.ReactNode }) {
//  return (
//    <html lang="pt-br" className="notranslate" translate="no">
//      <body className="min-h-screen h-full flex flex-col bg-login-pattern bg-repeat bg-black text-white">
//        <div className="flex-1 flex items-center justify-center">
//          <div className="w-full transition-opacity duration-300 ease-in-out opacity-100">
//            {children}
//          </div>
//        </div>
//      </body>
//    </html>
//  );
//}

//src/app/layout.tsx

//import './styles/virtus.css';
//import { messages } from '../messages';
//
//export function generateMetadata({ params }) {
//  const dict = messages[params.lang] || messages['pt-br'];
//
//  return {
//    title: dict.title,
//    description: dict.description,
//  };
//}
//
//export default function RootLayout({ children, params }) {
//  const lang = params.lang;
//
//  return (
//    <html lang={lang} className="notranslate" translate="no">
//      <body className="min-h-screen h-full flex flex-col bg-login-pattern bg-repeat bg-black text-white">
//        <div className="flex-1 flex items-center justify-center">
//          <div className="w-full transition-opacity duration-300 ease-in-out opacity-100">
//            {children}
//          </div>
//        </div>
//      </body>
//    </html>
//  );
//}

//import './styles/virtus.css';
//import { messages } from '../messages';
//
//export const metadata = {
//  title: messages.en.title,
//  description: messages.en.description,
//};
//
//export default function RootLayout({ children }: { children: React.ReactNode }) {
//  return (
//    <html>
//      <body className="min-h-screen h-full flex flex-col bg-login-pattern bg-repeat bg-black text-white">
//        <div className="flex-1 flex items-center justify-center">
//          <div className="w-full transition-opacity duration-300 ease-in-out opacity-100">
//            {children}
//          </div>
//        </div>
//      </body>
//    </html>
//  );
//}

//src/app/layout.tsx

//import './styles/virtus.css';
//import { messages } from '../messages';
//
//export const metadata = {
//  title: messages.ptBR.title,
//  description: messages.ptBR.description,
//};
//
//export default function RootLayout({ children }: { children: React.ReactNode }) {
//  return (
//    <html lang="en" className="notranslate" translate="no">
//      <body className="min-h-screen h-full flex flex-col bg-login-pattern bg-repeat bg-black text-white">
//        <div className="flex-1 flex items-center justify-center">
//          <div className="w-full transition-opacity duration-300 ease-in-out opacity-100">
//            {children}
//          </div>
//        </div>
//      </body>
//    </html>
//  );
//}

////src/app/layout.tsx
//
//import './styles/virtus.css';
//import { messages } from '../messages';
//
//export const metadata = {
//  title: messages.ptBR.title,
//  description: messages.ptBR.description,
//};
//
//export default function RootLayout({ children }: { children: React.ReactNode }) {
//  return (
//    <html lang="en" className="notranslate" translate="no">
//      <body className="min-h-screen h-full flex flex-col bg-login-pattern bg-repeat bg-black text-white">
//        <div className="flex-1 flex items-center justify-center bg-grid-virtus-600/[0.375]">
//          <div className="w-full transition-opacity duration-300 ease-in-out opacity-100">
//            {children}
//          </div>
//        </div>
//      </body>
//    </html>
//  );
//}

//import type { Metadata } from 'next';
//import './styles/virtus.css';
//import { messages } from 'messages';
//
//export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
//  const dict = messages[params.lang] || messages.en;
//
//  return {
//    title: dict.title,
//    description: dict.description,
//  };
//}
//
//export default function RootLayout({
//  children,
//  params,
//}: {
//  children: React.ReactNode;
//  params: { lang: string };
//}) {
//  const lang = params.lang;
//
//  return (
//    <html lang={lang} className="notranslate" translate="no">
//      <body className="min-h-screen h-full flex flex-col bg-login-pattern bg-repeat bg-black text-white">
//        <div className="flex-1 flex items-center justify-center bg-grid-virtus-600/[0.375]">
//          <div className="w-full transition-opacity duration-300 ease-in-out opacity-100">
//            {children}
//          </div>
//        </div>
//      </body>
//    </html>
//  );
//}

//frontend/src/app/[lang]/layout.tsx

//import type { Metadata } from 'next';
//import './styles/virtus.css';
////import './styles/globais.css';
//
//
//export const titles = {
//  'pt-br': {
//    title: 'Virtus Cloud | Hospedagem Cloud para Bots, Sites, APIs e DBs. Robusta e Escalável',
//    description: 'Crie sua conta com seu e-mail e acesse com segurança.',
//  },
//  en: {
//    title: 'Virtus Cloud | Cloud Hosting for Bots, Sites, APIs and DBs. Robust and Scalable',
//    description: 'Create your account with your email and access securely.',
//  },
//  es: {
//    title: 'Virtus Cloud | Hosting en la Nube para Bots, Sitios, APIs y Bases de Datos. Robusto y Escalable',
//    description: 'Crea tu cuenta con tu correo y accede con seguridad.',
//  },
//  zh: {
//    title: 'Virtus Cloud | 适用于机器人、网站、API 和数据库的云托管。强大且可扩展',
//    description: '使用您的电子邮件创建账户并安全访问。',
//  },
//};
//
//export async function generateMetadata({
//  params: paramsPromise,
//}: {
//  params: Promise<{ lang: string }>;
//}): Promise<Metadata> {
//  const { lang } = await paramsPromise;
//  const dict = titles[lang] || titles.en;
//
//  return {
//    title: dict.title,
//    description: dict.description,
//  };
//}
//
//export default async function RootLayout({
//  children,
//  params: paramsPromise,
//}: {
//  children: React.ReactNode;
//  params: Promise<{ lang: string }>;
//}) {
//  const { lang } = await paramsPromise;
//
//  return (
//    <html lang={lang} className="notranslate" translate="no">
//      <body className="min-h-screen h-full flex flex-col bg-login-pattern bg-repeat bg-black text-white">
//        {/* Layout persistente */}
//        <div className="flex-1 flex items-center justify-center bg-grid-virtus-600/[0.375]">
//          {/* Conteúdo com transição */}
//          <div className="w-full transition-opacity duration-300 ease-in-out opacity-100">
//            {children}
//          </div>
//        </div>
//      </body>
//    </html>
//  );
//}

//export function generateMetadata({
//  params,
//}: {
//  params?: { lang?: string };
//}): Metadata {
//  const lang = params?.lang || 'en';
//  const dict = messages[lang] || messages.en;
//
//  return {
//    title: dict.title,
//    description: dict.description,
//  };
//}

//import './styles/virtus.css';
//import { messages } from '../messages';
//
//export const metadata = {
//  title: messages.en.title,
//  description: messages.en.description,
//};
//
//export default function RootLayout({ children }: { children: React.ReactNode }) {
//  return (
//    <html lang="en" className="notranslate" translate="no">
//      <body className="min-h-screen h-full flex flex-col bg-login-pattern bg-repeat bg-black text-white">
//        <div className="flex-1 flex items-center justify-center bg-grid-virtus-600/[0.375]">
//          <div className="w-full transition-opacity duration-300 ease-in-out opacity-100">
//            {children}
//          </div>
//        </div>
//      </body>
//    </html>
//  );
//}
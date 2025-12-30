// frontend/src/components/LanguageSelector.jsx

// frontend/src/components/LanguageSelector.jsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { headerMessages } from '@/app/[lang]/messages/header';
import { useLang } from '@/hooks/useLang';   // <-- import do hook

export default function LanguageSelector() {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const lang = useLang();                     // <-- uso do hook
  const dict = headerMessages[lang] || headerMessages['pt-br'];
  const ref = useRef(null);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'pt-br', label: 'Português' },
    { code: 'es', label: 'Español' },
    { code: 'zh', label: '中国人' },
  ];

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={showLangMenu}
        aria-controls="language-menu"
        onClick={() => setShowLangMenu(!showLangMenu)}
        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
      >
        <img
          alt={lang}
          src={`/assets/countries/${lang}.svg`}
          width={24}
          height={24}
          loading="lazy"
          decoding="async"
          className="size-6 shrink-0 select-none"
          style={{ color: 'transparent' }}
        />
      </button>

      {showLangMenu && (
        <div
          id="language-menu"
          role="menu"
          aria-orientation="vertical"
          className="absolute bg-background right-0 mt-2 z-50 rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-1"
          style={{
            width: 'max(180px, var(--radix-dropdown-menu-trigger-width, 180px))',
            maxHeight: 'var(--radix-dropdown-menu-content-available-height)',
            outline: 'none',
          }}
        >
          <span className="block w-full px-2 py-2 text-secondary text-xs whitespace-nowrap text-left">
            {dict.selectLanguage}
          </span>
          {languages.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              role="menuitem"
              onClick={() => {
                if (code !== lang) {
                  router.replace(pathname.replace(lang, code));
                }
                setShowLangMenu(false);
              }}
              className="w-full bg-background flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
            >
              <img
                alt={label}
                src={`/assets/countries/${code}.svg`}
                width={20}
                height={20}
                loading="lazy"
                decoding="async"
                style={{ color: 'transparent' }}
              />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

//'use client';
//
//import { useState, useRef, useEffect } from 'react';
//import { useRouter } from 'next/navigation';
//import { headerMessages } from '@/app/[lang]/messages/header';
//
//export default function LanguageSelector({ lang, pathname }) {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const router = useRouter();
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//  const ref = useRef(null);
//
//  const languages = [
//    { code: 'en', label: 'English' },
//    { code: 'pt-br', label: 'Português' },
//    { code: 'es', label: 'Español' },
//    { code: 'zh', label: '中国人' },
//  ];
//
//  // Fecha ao clicar fora
//  useEffect(() => {
//    function handleClickOutside(event) {
//      if (ref.current && !ref.current.contains(event.target)) {
//        setShowLangMenu(false);
//      }
//    }
//    document.addEventListener('mousedown', handleClickOutside);
//    return () => {
//      document.removeEventListener('mousedown', handleClickOutside);
//    };
//  }, []);
//
//  return (
//    <div className="relative" ref={ref}>
//      <button
//        type="button"
//        aria-haspopup="menu"
//        aria-expanded={showLangMenu}
//        aria-controls="language-menu"
//        onClick={() => setShowLangMenu(!showLangMenu)}
//        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//      >
//        <img
//          alt={lang}
//          src={`/assets/countries/${lang}.svg`}
//          width={24}
//          height={24}
//          loading="lazy"
//          decoding="async"
//          className="size-6 shrink-0 select-none"
//          style={{ color: 'transparent' }}
//        />
//      </button>
//
//      {showLangMenu && (
//        <div
//          id="language-menu"
//          role="menu"
//          aria-orientation="vertical"
//          className="absolute bg-background right-0 mt-2 z-50 rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-1"
//          style={{
//            width: 'max(180px, var(--radix-dropdown-menu-trigger-width, 180px))',
//            maxHeight: 'var(--radix-dropdown-menu-content-available-height)',
//            outline: 'none',
//          }}
//        >
//          <span className="block w-full px-2 py-2 text-secondary text-xs whitespace-nowrap text-left">
//            {dict.selectLanguage}
//          </span>
//          {languages.map(({ code, label }) => (
//            <button
//              key={code}
//              type="button"
//              role="menuitem"
//              onClick={() => {
//                if (code !== lang) {
//                  router.replace(pathname.replace(lang, code));
//                }
//                setShowLangMenu(false);
//              }}
//              className="w-full bg-background flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//            >
//              <img
//                alt={label}
//                src={`/assets/countries/${code}.svg`}
//                width={20}
//                height={20}
//                loading="lazy"
//                decoding="async"
//                style={{ color: 'transparent' }}
//              />
//              {label}
//            </button>
//          ))}
//        </div>
//      )}
//    </div>
//  );
//}

// frontend/src/components/LanguageSelector.jsx

//'use client';
//
//import { useState, useRef, useEffect } from 'react';
//import { useRouter } from 'next/navigation';
//import { headerMessages } from '@/app/[lang]/messages/header';
//
//export default function LanguageSelector({ lang, pathname }) {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const router = useRouter();
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//  const ref = useRef(null);
//
//  const languages = [
//    { code: 'en', label: 'English' },
//    { code: 'pt-br', label: 'Português' },
//    { code: 'es', label: 'Español' },
//    { code: 'zh', label: '中国人' },
//  ];
//
//  // Fecha ao clicar fora
//  useEffect(() => {
//    function handleClickOutside(event) {
//      if (ref.current && !ref.current.contains(event.target)) {
//        setShowLangMenu(false);
//      }
//    }
//    document.addEventListener('mousedown', handleClickOutside);
//    return () => {
//      document.removeEventListener('mousedown', handleClickOutside);
//    };
//  }, []);
//
//  return (
//    <div className="relative" ref={ref}>
//      <button
//        type="button"
//        aria-haspopup="menu"
//        aria-expanded={showLangMenu}
//        aria-controls="language-menu"
//        onClick={() => setShowLangMenu(!showLangMenu)}
//        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//      >
//        <img
//          alt={lang}
//          src={`/assets/countries/${lang}.svg`}
//          width={24}
//          height={24}
//          loading="lazy"
//          decoding="async"
//          className="size-6 shrink-0 select-none"
//          style={{ color: 'transparent' }}
//        />
//      </button>
//
//      {showLangMenu && (
//        <div
//          id="language-menu"
//          role="menu"
//          aria-orientation="vertical"
//          className="absolute right-0 mt-2 z-50 rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-1 motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
//          style={{
//            // Nunca menor que 220px; se o trigger for maior, acompanha
//            width: 'max(180px, var(--radix-dropdown-menu-trigger-width, 180px))',
//            // Mantém limite de altura do Radix, se existir
//            maxHeight: 'var(--radix-dropdown-menu-content-available-height)',
//            outline: 'none',
//          }}
//        >
//          <span className="block w-full px-2 py-2 text-secondary text-xs whitespace-nowrap text-left">
//            {dict.selectLanguage}
//          </span>
//          {languages.map(({ code, label }) => (
//            <button
//              key={code}
//              type="button"
//              role="menuitem"
//              onClick={() => {
//                if (code !== lang) {
//                  router.replace(pathname.replace(lang, code));
//                }
//                setShowLangMenu(false);
//              }}
//              className="w-full flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//            >
//              <img
//                alt={label}
//                src={`/assets/countries/${code}.svg`}
//                width={20}
//                height={20}
//                loading="lazy"
//                decoding="async"
//                style={{ color: 'transparent' }}
//              />
//              {label}
//            </button>
//          ))}
//        </div>
//      )}
//    </div>
//  );
//}

// frontend/src/components/LanguageSelector.jsx

//'use client';
//
//import { useState, useRef, useEffect } from 'react';
//import { useRouter } from 'next/navigation';
//import { headerMessages } from '@/app/[lang]/messages/header';
//
//export default function LanguageSelector({ lang, pathname }) {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const router = useRouter();
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//  const ref = useRef(null);
//
//  const languages = [
//    { code: 'en', label: 'English' },
//    { code: 'pt-br', label: 'Português' },
//    { code: 'es', label: 'Español' },
//    { code: 'zh', label: '中国人' },
//  ];
//
//  // Fecha ao clicar fora
//  useEffect(() => {
//    function handleClickOutside(event) {
//      if (ref.current && !ref.current.contains(event.target)) {
//        setShowLangMenu(false);
//      }
//    }
//    document.addEventListener('mousedown', handleClickOutside);
//    return () => {
//      document.removeEventListener('mousedown', handleClickOutside);
//    };
//  }, []);
//
//  return (
//    <div className="relative" ref={ref}>
//      <button
//        type="button"
//        aria-haspopup="menu"
//        aria-expanded={showLangMenu}
//        aria-controls="language-menu"
//        onClick={() => setShowLangMenu(!showLangMenu)}
//        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//      >
//        <img
//          alt={lang}
//          src={`/assets/countries/${lang}.svg`}
//          width={24}
//          height={24}
//          loading="lazy"
//          decoding="async"
//          className="size-6 shrink-0 select-none"
//          style={{ color: 'transparent' }}
//        />
//      </button>
//
//      {showLangMenu && (
//        <div
//          id="language-menu"
//          role="menu"
//          aria-orientation="vertical"
//          className="absolute right-0 mt-2 z-50 w-[220px] rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-1 motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
//        >
//          <span className="block w-full px-2 py-2 text-secondary text-xs whitespace-nowrap text-center">
//            {dict.selectLanguage}
//          </span>
//          {languages.map(({ code, label }) => (
//            <button
//              key={code}
//              type="button"
//              role="menuitem"
//              onClick={() => {
//                if (code !== lang) {
//                  router.replace(pathname.replace(lang, code));
//                }
//                setShowLangMenu(false);
//              }}
//              className="w-full flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//            >
//              <img
//                alt={label}
//                src={`/assets/countries/${code}.svg`}
//                width={20}
//                height={20}
//                loading="lazy"
//                decoding="async"
//                style={{ color: 'transparent' }}
//              />
//              {label}
//            </button>
//          ))}
//        </div>
//      )}
//    </div>
//  );
//}

//frontend/src/components/LanguageSelector.jsx

//'use client';
//
//import { useState } from 'react';
//import { useRouter } from 'next/navigation';
//import { headerMessages } from '@/app/[lang]/messages/header';
//
//
//export default function LanguageSelector({ lang, pathname }) {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const router = useRouter();
//  const dict = headerMessages[lang] || headerMessages['pt-br'];
//
//  const languages = [
//    { code: 'en', label: 'English' },
//    { code: 'pt-br', label: 'Português' },
//    { code: 'es', label: 'Español' },
//    { code: 'zh', label: '中国人' },
//  ];
//
//  return (
//    <div className="relative">
//      <button
//        type="button"
//        aria-haspopup="menu"
//        aria-expanded={showLangMenu}
//        aria-controls="language-menu"
//        onClick={() => setShowLangMenu(!showLangMenu)}
//        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//      >
//        <img
//          alt={lang}
//          src={`/assets/countries/${lang}.svg`}
//          width={24}
//          height={24}
//          loading="lazy"
//          decoding="async"
//          className="size-6 shrink-0 select-none"
//          style={{ color: 'transparent' }}
//        />
//      </button>
//
//      {showLangMenu && (
//        <div
//          id="language-menu"
//          role="menu"
//          aria-orientation="vertical"
//          className="absolute right-0 mt-2 z-50 min-w-fit rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-1 motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
//        >
//          <span className="block w-full px-2 py-2 text-secondary text-xs whitespace-nowrap text-center">
//            {dict.selectLanguage}
//          </span>
//          {languages.map(({ code, label }) => (
//            <button
//              key={code}
//              type="button"
//              role="menuitem"
//              onClick={() => {
//                if (code !== lang) {
//                  router.replace(pathname.replace(lang, code));
//                }
//                setShowLangMenu(false);
//              }}
//              className="w-full flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//            >
//              <img
//                alt={label}
//                src={`/assets/countries/${code}.svg`}
//                width={20}
//                height={20}
//                loading="lazy"
//                decoding="async"
//                style={{ color: 'transparent' }}
//              />
//              {label}
//            </button>
//          ))}
//        </div>
//      )}
//    </div>
//  );
//}

//frontend/src/components/LanguageSelector.jsx

//'use client';
//
//import { useState } from 'react';
//import { useRouter } from 'next/navigation';
//
//export default function LanguageSelector({ lang, pathname }) {
//  const [showLangMenu, setShowLangMenu] = useState(false);
//  const router = useRouter();
//
//  const languages = [
//    { code: 'en', label: 'English' },
//    { code: 'pt-br', label: 'Português' },
//    { code: 'es', label: 'Español' },
//    { code: 'zh', label: '中国人' },
//  ];
//
//  return (
//    <div className="relative">
//      <button
//        type="button"
//        aria-haspopup="menu"
//        aria-expanded={showLangMenu}
//        aria-controls="language-menu"
//        onClick={() => setShowLangMenu(!showLangMenu)}
//        className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5"
//      >
//        <img
//          alt={lang}
//          src={`/assets/countries/${lang}.svg`}
//          width={24}
//          height={24}
//          loading="lazy"
//          decoding="async"
//          className="size-6 shrink-0 select-none"
//          style={{ color: 'transparent' }}
//        />
//      </button>
//
//      {showLangMenu && (
//        <div
//          id="language-menu"
//          role="menu"
//          aria-orientation="vertical"
//          className="absolute right-0 mt-2 z-50 min-w-fit rounded-md bg-virtus-800 text-sm text-white shadow-md border border-virtus-600 p-1 motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
//        >
//          <span className="block w-full px-2 py-2 text-secondary text-xs whitespace-nowrap text-center">
//            {dict.selectLanguage}
//          </span>
//          {languages.map(({ code, label }) => (
//            <button
//              key={code}
//              type="button"
//              role="menuitem"
//              onClick={() => {
//                if (code !== lang) {
//                  router.replace(pathname.replace(lang, code));
//                }
//                setShowLangMenu(false);
//              }}
//              className="w-full flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//            >
//              <img
//                alt={label}
//                src={`/assets/countries/${code}.svg`}
//                width={20}
//                height={20}
//                loading="lazy"
//                decoding="async"
//                style={{ color: 'transparent' }}
//              />
//              {label}
//            </button>
//          ))}
//        </div>
//      )}
//    </div>
//  );
//}
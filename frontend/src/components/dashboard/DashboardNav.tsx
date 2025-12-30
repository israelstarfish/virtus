//frontend/src/components/dashboard/DashboardNav.tsx

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

type Tab = {
  label: string;
  href: string;
};

interface IndicatorStyle {
  left: number;
  width: number;
}

export default function DashboardNav() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle>({ left: 0, width: 0 });

  const { lang } = router.query;
  const langStr = typeof lang === 'string' ? lang : Array.isArray(lang) ? lang[0] : 'pt-br';

  const tabs: Tab[] = [
    { label: 'Aplicações', href: `/${langStr}/dashboard` },
    { label: 'Banco de Dados', href: `/${langStr}/dashboard/databases` },
    { label: 'Snapshots', href: `/${langStr}/dashboard/snapshots` },
    { label: 'Blob', href: `/${langStr}/dashboard/blob` },
    { label: 'Minha conta', href: `/${langStr}/account` },
    { label: 'Suporte', href: `/${langStr}/dashboard/support` },
  ];

  useEffect(() => {
    const activeTab = tabs.find((tab) => router.pathname === tab.href || router.pathname.startsWith(tab.href));
    const el = tabRefs.current[activeTab?.href ?? ''];
    if (el && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setIndicatorStyle({
        left: rect.left - containerRect.left,
        width: rect.width,
      });
    }
  }, [router.pathname]);

  return (
    <nav ref={containerRef} className="relative">
      <ul className="flex relative">
        {tabs.map((tab) => (
          <li key={tab.href} className="relative">
            <a
              href={tab.href}
              ref={(el) => {
                tabRefs.current[tab.href] = el;
              }}
              className={`group flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                router.pathname.startsWith(tab.href) ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              {tab.label}
            </a>
          </li>
        ))}
        <span
          className="absolute bottom-0 h-[2px] bg-blue-500 rounded-md transition-all duration-300"
          style={{
            width: `${indicatorStyle.width}px`,
            transform: `translateX(${indicatorStyle.left}px)`,
          }}
        />
      </ul>
    </nav>
  );
}

//import { useEffect, useRef, useState } from 'react';
//import { useRouter } from 'next/router';
//
//type Tab = {
//  label: string;
//  href: string;
//};
//
//interface IndicatorStyle {
//  left: number;
//  width: number;
//}
//
//const tabs: Tab[] = [
//  { label: 'Aplicações', href: `/${lang}/dashboard` },
//  { label: 'Banco de Dados', href: `/${lang}/dashboard/databases` },
//  { label: 'Snapshots', href: `/${lang}/dashboard/snapshots` },
//  { label: 'Blob', href: `/${lang}/dashboard/blob` },
//  { label: 'Minha conta', href: `/${lang}/account` },
//  { label: 'Suporte', href: `/${lang}/dashboard/support` },
//];
//
//export default function DashboardNav(): JSX.Element {
//  const router = useRouter();
//  const containerRef = useRef<HTMLDivElement>(null);
//  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
//  const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle>({ left: 0, width: 0 });
//
//  useEffect(() => {
//    const activeTab = tabs.find((tab) => router.pathname === tab.href || router.pathname.startsWith(tab.href));
//    const el = tabRefs.current[activeTab?.href ?? ''];
//    if (el && containerRef.current) {
//      const containerRect = containerRef.current.getBoundingClientRect();
//      const rect = el.getBoundingClientRect();
//      setIndicatorStyle({
//        left: rect.left - containerRect.left,
//        width: rect.width,
//      });
//    }
//  }, [router.pathname]);
//
//  return (
//    <nav ref={containerRef} className="relative">
//      <ul className="flex relative">
//        {tabs.map((tab) => (
//          <li key={tab.href} className="relative">
//            <a
//              href={tab.href}
//              ref={(el) => (tabRefs.current[tab.href] = el)}
//              className={`group flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
//                router.pathname.startsWith(tab.href) ? 'text-blue-500' : 'text-gray-400'
//              }`}
//            >
//              {tab.label}
//            </a>
//          </li>
//        ))}
//        <span
//          className="absolute bottom-0 h-[2px] bg-blue-500 rounded-md transition-all duration-300"
//          style={{
//            width: `${indicatorStyle.width}px`,
//            transform: `translateX(${indicatorStyle.left}px)`,
//          }}
//        />
//      </ul>
//    </nav>
//  );
//}
// frontend/src/app/[lang]/pricing/page.jsx

'use client';

import Header from '@/components/Recycles/Header';
import Footer from '@/components/Recycles/Footer';
import { usePathname } from 'next/navigation';
import Section1 from '@/components/sections/pricing/section1';


export default function PricingPage() {
  const pathname = usePathname();

  function getLang(pathname) {
    const segment = pathname.split('/')[1];
    const supported = ['pt-br', 'en', 'es', 'zh'];
    return supported.includes(segment) ? segment : 'pt-br';
  }

  const lang = getLang(pathname);

  return (
    <main>
      {/* Header fixo no topo */}
      <Header />

      {/* Container principal da página */}
      <div className="relative">
        {/* Aqui você vai inserir as sessões que me mandar */}
        <Section1 />
      </div>

      {/* Footer fixo no final */}
      <Footer />
    </main>
  );
}

//'use client';
//
//import Header from '@/components/Recycles/Header';
//import Footer from '@/components/Recycles/Footer';
//
//export default function PricingPage() {
//  return (
//    <main>
//      {/* Header fixo no topo */}
//      <Header />
//
//      {/* Container principal da página */}
//      <div className="relative">
//        {/* Aqui você vai inserir as sessões que me mandar */}
//      </div>
//
//      {/* Footer fixo no final */}
//      <Footer lang={lang} />
//    </main>
//  );
//}
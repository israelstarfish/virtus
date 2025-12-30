//frontend/src/components/Recycles/Header/Logo.jsx

'use client';

import Link from "next/link";
import Image from "next/image";

export default function Logo({ lang = "pt-br" }) {
  return (
    <div className="flex h-[80px] items-center gap-2 justify-self-start">
      <div className="transition-opacity hover:opacity-75">
        <Link href={`/${lang}/home`} tabIndex={-1}>
          <div className="relative block">
            <Image
              alt="Virtus Cloud Logo"
              width={60}
              height={12}
              src="/assets/logo-with-name.png"
              style={{ color: "transparent" }}
              priority
            />
          </div>
        </Link>
      </div>
    </div>
  );
}

//frontend/src/components/Recycles/Header/Logo.jsx

//'use client';
//
//import Link from "next/link";
//import Image from "next/image";
//
//export default function Logo({ lang = "pt-br" }) {
//  return (
//    <div className="flex h-[80px] items-center gap-2 justify-self-start">
//      <div className="transition-opacity hover:opacity-75">
//        <Link href={`/${lang}/home`} tabIndex={-1}>
//          <div className="relative block aspect-[419/128] h-[34px]">
//            <Image
//              alt="Virtus Cloud Logo"
//              width={60}
//              height={12}
//              src="/assets/logo-with-name.png"
//              style={{ color: "transparent" }}
//              priority
//            />
//          </div>
//        </Link>
//      </div>
//    </div>
//  );
//}

//frontend/src/components/Recycles/Header/Logo.jsx

//import Link from "next/link";
//import Image from "next/image";
//
//export default function Logo({ lang = "pt-br" }) {
//  return (
//    <div className="flex h-[80px] items-center gap-2 justify-self-start">
//      <div className="transition-opacity hover:opacity-75">
//        <Link href={`/${lang}/home`} tabIndex={-1}>
//          <div className="relative block">
//            <Image
//              alt="Virtus Cloud Logo"
//              width={60}
//              height={12}
//              src="/assets/logo-with-name.png"
//              style={{ color: "transparent" }}
//              priority
//            />
//          </div>
//        </Link>
//      </div>
//    </div>
//  );
//}

//import Link from "next/link";
//import Image from "next/image";
//
//export default function Logo() {
//  return (
//    <div className="flex h-[80px] items-center gap-2 justify-self-start">
//      <div className="transition-opacity hover:opacity-75">
//        <Link href="/pt-br/home" tabIndex={-1}>
//          <div className="relative block aspect-[419/128] h-8.5">
//            <Image
//              alt="Virtus Cloud Logo"
//              width={128}
//              height={36}
//              src="/assets/logo-with-name.png"
//              style={{ color: "transparent" }}
//            />
//          </div>
//        </Link>
//      </div>
//    </div>
//  );
//}
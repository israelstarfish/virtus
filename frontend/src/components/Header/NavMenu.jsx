"use client";

import Link from "next/link";

export default function NavMenu() {
  return (
    <nav
      aria-label="Main"
      className="group/navigation-menu relative z-50 flex max-w-max flex-1 items-center justify-center"
    >
      <ul className="group flex flex-1 list-none items-center justify-center gap-1">
        <li>
          <Link
            href="/pt-br/pricing"
            className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-secondary text-sm transition-colors hover:bg-blue-200/5 hover:text-primary"
          >
            Preços
          </Link>
        </li>
        <li>
          <Link
            href="/pt-br/enterprise"
            className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-secondary text-sm transition-colors hover:bg-blue-200/5 hover:text-primary"
          >
            Enterprise
          </Link>
        </li>
        <li>
          <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-secondary text-sm transition-colors hover:bg-blue-200/5 hover:text-primary">
            Serviços
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              fill="currentColor"
              viewBox="0 0 256 256"
              className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
            >
              <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
            </svg>
          </button>
        </li>
        <li>
          <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-secondary text-sm transition-colors hover:bg-blue-200/5 hover:text-primary">
            Downloads
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              fill="currentColor"
              viewBox="0 0 256 256"
              className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
            >
              <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
            </svg>
          </button>
        </li>
        <li>
          <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-secondary text-sm transition-colors hover:bg-blue-200/5 hover:text-primary">
            Centro de Suporte
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              fill="currentColor"
              viewBox="0 0 256 256"
              className="relative top-[1px] ml-1 size-3 transition duration-250 group-data-[state=open]:rotate-180"
            >
              <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
}
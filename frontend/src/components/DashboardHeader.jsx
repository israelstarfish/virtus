//frontend/src/components/DashboardHeader.jsx

'use client';

import Link from 'next/link';

export default function DashboardHeader() {
    return (
        <header className="group sticky top-0 z-50 max-h-screen min-h-20 w-full border-virtus-600 border-b bg-background/75 bg-black-900 backdrop-blur-2xl max-xl:overflow-auto">
            <div className="container flex min-h-[80px] flex-col">
                <div className="flex items-center justify-between">
                    <div className="flex h-[80px] items-center gap-2 justify-self-start">
                        <Link href="/pt-br/home" className="transition-opacity hover:opacity-75" tabIndex={-1}>
                            <div className="relative block aspect-[419/128] h-8.5">
                                <img
                                    alt="Virtus Cloud Logo"
                                    width={128}
                                    height={36}
                                    src="/_next/image?url=%2Fassets%2Flogo-with-name.png&w=256&q=75"
                                    style={{ color: 'transparent' }}
                                />
                            </div>
                        </Link>
                    </div>

                    <div className="hidden items-center gap-4 justify-self-end sm:flex">
                        <button type="button" className="group/button relative inline-flex min-w-fit shrink-0 items-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 w-full justify-between px-2.5 md:w-fit">
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="text-sm leading-none">israelmacyel</span>
                                <span className="text-[10px] text-secondary leading-none">••••••••••••@gmail.com</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-secondary transition-transform duration-250 group-data-[state=open]:rotate-180">
                                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                            </svg>
                        </button>

                        <button type="button" className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5">
                            <img
                                alt="pt-br"
                                width={24}
                                height={24}
                                src="/assets/contries/pt-br.svg"
                                className="size-6 shrink-0 select-none"
                                style={{ color: 'transparent' }}
                            />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 sm:hidden">
                        <button aria-label="Abrir navbar" className="group relative size-10 cursor-pointer select-none" type="button">
                            <span className="absolute top-[30%] left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 -translate-x-1/2 -translate-y-1/2 group-aria-expanded:top-1/2 group-aria-expanded:rotate-45" />
                            <span className="absolute top-1/2 left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 -translate-x-1/2 -translate-y-1/2 group-aria-expanded:opacity-0" />
                            <span className="absolute top-[70%] left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 -translate-x-1/2 -translate-y-1/2 group-aria-expanded:-rotate-45 group-aria-expanded:top-1/2" />
                        </button>
                    </div>
                </div>

                <div className="flex h-[45px] flex-col justify-between lg:flex-row lg:items-center">
                    <nav className="flex flex-1 items-center">
                        <ul className="flex w-full items-center overflow-x-hidden overflow-y-hidden">
                            <Link href="/pt-br/dashboard" className="group relative z-20 mx-0.5 flex items-center gap-1 whitespace-nowrap py-1.5 transition-all hover:rounded-md">
                                <span className="flex size-full items-center gap-2 rounded-md px-2 py-1.5 text-secondary text-sm hover:bg-virtus-700 group-aria-selected:text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                        <path d="M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z" />
                                    </svg>
                                    Aplicações
                                </span>
                                <span className="absolute inset-0 top-[96%] z-50 h-[2px] rounded-md bg-blue-500 contain-strict" style={{ opacity: 1 }} />
                            </Link>

                            <Link href="/pt-br/dashboard/databases" className="group relative z-20 mx-0.5 flex items-center gap-1 whitespace-nowrap py-1.5 transition-all hover:rounded-md">
                                <span className="flex size-full items-center gap-2 rounded-md px-2 py-1.5 text-secondary text-sm hover:bg-virtus-700 group-aria-selected:text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                        <path d="M128,24C74.17,24,32,48.6,32,80v96c0,31.4,42.17,56,96,56s96-24.6,96-56V80C224,48.6,181.83,24,128,24Zm80,104c0,9.62-7.88,19.43-21.61,26.92C170.93,163.35,150.19,168,128,168s-42.93-4.65-58.39-13.08C55.88,147.43,48,137.62,48,128V111.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64ZM69.61,53.08C85.07,44.65,105.81,40,128,40s42.93,4.65,58.39,13.08C200.12,60.57,208,70.38,208,80s-7.88,19.43-21.61,26.92C170.93,115.35,150.19,120,128,120s-42.93-4.65-58.39-13.08C55.88,99.43,48,89.62,48,80S55.88,60.57,69.61,53.08ZM186.39,202.92C170.93,211.35,150.19,216,128,216s-42.93-4.65-58.39-13.08C55.88,195.43,48,185.62,48,176V159.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64V176C208,185.62,200.12,195.43,186.39,202.92Z" />
                                    </svg>
                                    <div className="flex items-center gap-2">Banco de Dados</div>
                                </span>
                            </Link>

                            <Link href="/pt-br/dashboard/snapshots" className="group relative z-20 mx-0.5 flex items-center gap-1 whitespace-nowrap py-1.5 transition-all hover:rounded-md">
                                <span className="flex size-full items-center gap-2 rounded-md px-2 py-1.5 text-secondary text-sm hover:bg-virtus-700 group-aria-selected:text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                        <path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm-8-48A95.44,95.44,0,0,0,60.08,60.15C52.81,67.51,46.35,74.59,40,82V64a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H49c7.15-8.42,14.27-16.35,22.39-24.57a80,80,0,1,1,1.66,114.75,8,8,0,1,0-11,11.64A96,96,0,1,0,128,32Z" />
                                    </svg>
                                    Snapshots
                                </span>
                            </Link>

                            <Link href="/pt-br/dashboard/blob" className="group relative z-20 mx-0.5 flex items-center gap-1 whitespace-nowrap py-1.5 transition-all hover:rounded-md">
                                <span className="flex size-full items-center gap-2 rounded-md px-2 py-1.5 text-secondary text-sm hover:bg-virtus-700 group-aria-selected:text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                        <path d="M178.34,165.66,160,147.31V208a8,8,0,0,1-16,0V147.31l-18.34,18.35a8,8,0,0,1-11.32-11.32l32-32a8,8,0,0,1,11.32,0l32,32a8,8,0,0,1-11.32,11.32ZM160,40A88.08,88.08,0,0,0,81.29,88.68,64,64,0,1,0,72,216h40a8,8,0,0,0,0-16H72a48,48,0,0,1,0-96c1.1,0,2.2,0,3.29.12A88,88,0,0,0,72,128a8,8,0,0,0,16,0,72,72,0,1,1,100.8,66,8,8,0,0,0,3.2,15.34,7.9,7.9,0,0,0,3.2-.68A88,88,0,0,0,160,40Z" />
                                    </svg>
                                    Blob
                                </span>
                            </Link>

                            <div role="none" className="shrink-0 bg-virtus-600 w-px mx-2 h-5" aria-hidden="true" />

                            <Link href="/pt-br/account" className="group relative z-20 mx-0.5 flex items-center gap-1 whitespace-nowrap py-1.5 transition-all hover:rounded-md">
                                <span className="flex size-full items-center gap-2 rounded-md px-2 py-1.5 text-secondary text-sm hover:bg-virtus-700 group-aria-selected:text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                        <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" />
                                    </svg>
                                    Minha conta
                                </span>
                            </Link>

                            <Link href="/pt-br/dashboard/support" className="group relative z-20 mx-0.5 flex items-center gap-1 whitespace-nowrap py-1.5 transition-all hover:rounded-md">
                                <span className="flex size-full items-center gap-2 rounded-md px-2 py-1.5 text-secondary text-sm hover:bg-virtus-700 group-aria-selected:text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                        <path d="M201.89,54.66A103.43,103.43,0,0,0,128.79,24H128A104,104,0,0,0,24,128v56a24,24,0,0,0,24,24H64a24,24,0,0,0,24-24V144a24,24,0,0,0-24-24H40.36A88.12,88.12,0,0,1,190.54,65.93,87.39,87.39,0,0,1,215.65,120H192a24,24,0,0,0-24,24v40a24,24,0,0,0,24,24h24a24,24,0,0,1-24,24H136a8,8,0,0,0,0,16h56a40,40,0,0,0,40-40V128A103.41,103.41,0,0,0,201.89,54.66ZM64,136a8,8,0,0,1,8,8v40a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V136Zm128,56a8,8,0,0,1-8-8V144a8,8,0,0,1,8-8h24v56Z" />
                                    </svg>
                                    Suporte
                                </span>
                            </Link>
                        </ul>
                    </nav>
                    <div className="hidden items-center gap-4 lg:flex">
                        <Link href="/pt-br/resources/cli" target="_blank" className="flex h-10 items-center gap-2 text-sm max-lg:my-2">
                            Baixar CLI
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
                            </svg>
                        </Link>

                        <div className="shrink-0 bg-virtus-600 h-5 w-[2px]" />

                        <Link href="/pt-br/resources/vscode-extension" target="_blank" className="flex h-10 items-center gap-2 text-sm max-lg:my-2">
                            Extensão VSCode
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

//'use client';
//
//import Link from 'next/link';
//
//export default function DashboardHeader() {
//    return (
//        <header className="group sticky top-0 z-50 max-h-screen min-h-20 w-full border-virtus-600 border-b bg-background/75 bg-black-900 backdrop-blur-2xl max-xl:overflow-auto">
//            <div className="container flex min-h-[80px] flex-col">
//                <div className="flex items-center justify-between">
//                    <div className="flex h-[80px] items-center gap-2 justify-self-start">
//                        <Link href="/pt-br/home" className="transition-opacity hover:opacity-75" tabIndex={-1}>
//                            <div className="relative block aspect-[419/128] h-8.5">
//                                <img
//                                    alt="virtus Cloud Logo"
//                                    width={128}
//                                    height={36}
//                                    src="/_next/image?url=%2Fassets%2Flogo-with-name.png&w=256&q=75"
//                                    style={{ color: 'transparent' }}
//                                />
//                            </div>
//                        </Link>
//                    </div>
//
//                    <div className="hidden items-center gap-4 justify-self-end sm:flex">
//                        <button type="button" className="group/button relative inline-flex min-w-fit shrink-0 items-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 w-full justify-between px-2.5 md:w-fit">
//                            <div className="flex flex-col items-start gap-0.5">
//                                <span className="text-sm leading-none">israelmacyel</span>
//                                <span className="text-[10px] text-secondary leading-none">••••••••••••@gmail.com</span>
//                            </div>
//                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-secondary transition-transform duration-250 group-data-[state=open]:rotate-180">
//                                <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                            </svg>
//                        </button>
//
//                        <button type="button" className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 px-2.5">
//                            <img
//                                alt="pt-br"
//                                width={24}
//                                height={24}
//                                src="/assets/contries/pt-br.svg"
//                                className="size-6 shrink-0 select-none"
//                                style={{ color: 'transparent' }}
//                            />
//                        </button>
//                    </div>
//
//                    <div className="flex items-center gap-4 sm:hidden">
//                        <button aria-label="Abrir navbar" className="group relative size-10 cursor-pointer select-none" type="button">
//                            <span className="absolute top-[30%] left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 -translate-x-1/2 -translate-y-1/2 group-aria-expanded:top-1/2 group-aria-expanded:rotate-45" />
//                            <span className="absolute top-1/2 left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 -translate-x-1/2 -translate-y-1/2 group-aria-expanded:opacity-0" />
//                            <span className="absolute top-[70%] left-1/2 h-[2px] w-4/6 bg-virtus-50 transition-all duration-200 -translate-x-1/2 -translate-y-1/2 group-aria-expanded:-rotate-45 group-aria-expanded:top-1/2" />
//                        </button>
//                    </div>
//                </div>
//
//                <div className="flex h-[45px] flex-col justify-between lg:flex-row lg:items-center">
//                    <nav className="flex flex-1 items-center">
//                        <ul className="flex w-full items-center overflow-x-hidden overflow-y-hidden">
//                            <Link href="/pt-br/dashboard" className="group relative z-20 mx-0.5 flex items-center gap-1 whitespace-nowrap py-1.5 transition-all hover:rounded-md">
//                                <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-secondary text-sm hover:bg-virtus-700 group-aria-selected:text-primary">Aplicações</span>
//                            </Link>
//                            <Link href="/pt-br/dashboard/databases" className="group relative z-20 mx-0.5 flex items-center gap-1 whitespace-nowrap py-1.5 transition-all hover:rounded-md">
//                                <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-secondary text-sm hover:bg-virtus-700 group-aria-selected:text-primary">Banco de Dados</span>
//                            </Link>
//                            <Link href="/pt-br/dashboard/snapshots" className="group relative z-20 mx-0.5 flex items-center gap-1 whitespace-nowrap py-1.5 transition-all hover:rounded-md">
//                                <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-secondary text-sm hover:bg-virtus-700 group-aria-selected:text-primary">Snapshots</span>
//                            </Link>
//                            <Link href="/pt-br/dashboard/blob" className="group relative z-20 mx-0.5 flex items-center gap-1 whitespace-nowrap py-1.5 transition-all hover:rounded-md">
//                                <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-secondary text-sm hover:bg-virtus-700 group-aria-selected:text-primary">Blob</span>
//                            </Link>
//                            <div className="shrink-0 bg-virtus-600 w-px mx-2 h-5" />
//                            <Link href="/pt-br/account" className="group relative z-20 mx-0.5 flex items-center gap-1 whitespace-nowrap py-1.5 transition-all hover:rounded-md">
//                                <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-secondary text-sm hover:bg-virtus-700 group-aria-selected:text-primary">Minha conta</span>
//                            </Link>
//                            <Link href="/pt-br/dashboard/support" className="group relative z-20 mx-0.5 flex items-center gap-1 whitespace-nowrap py-1.5 transition-all hover:rounded-md">
//                                <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-secondary text-sm hover:bg-virtus-700 group-aria-selected:text-primary">Suporte</span>
//                            </Link>
//                        </ul>
//                    </nav>
//
//                    <div className="hidden items-center gap-4 lg:flex">
//                        <Link href="/pt-br/resources/cli" target="_blank" className="flex h-10 items-center gap-2 text-sm max-lg:my-2">
//                            Baixar CLI
//                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//                            </svg>
//                        </Link>
//
//                        <div className="shrink-0 bg-virtus-600 h-5 w-[2px]" />
//
//                        <Link href="/pt-br/resources/vscode-extension" target="_blank" className="flex h-10 items-center gap-2 text-sm max-lg:my-2">
//                            Extensão VSCode
//                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
//                            </svg>
//                        </Link>
//                    </div>
//                </div>
//            </div>
//        </header>
//    );
//}
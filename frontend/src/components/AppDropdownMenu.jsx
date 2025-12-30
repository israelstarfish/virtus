//frontend/src/components/AppDropdownMenu.jsx

import { useParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import '../app/styles/virtus.css';

export function AppDropdownMenu({ app, onAction }) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isProcessing, setIsProcessing] = useState(null); // "start" | "restart" | "stop" | null
    const menuRef = useRef(null);
    const triggerRef = useRef(null);

    const appId = app.ID || app.ContainerName;
    const normalizedStatus = (app.status || "").toLowerCase();
    const canStart = normalizedStatus !== "running";
    const canStop = normalizedStatus === "running";
    const canRestart = normalizedStatus === "running";
    const { lang } = useParams();
    const base = `/${lang}/dashboard/applications/${appId}`;

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                !triggerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleOpenMenu() {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 10,
                left: rect.left,
            });
        }
        setIsOpen((prev) => !prev);
    }

    const handleMenuAction = async (type) => {
        setIsProcessing(type);
        await onAction(type, app);
        await new Promise((r) => setTimeout(r, 300));
        setIsProcessing(null);
        setIsOpen(false);
    };

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                data-state={isOpen ? 'open' : 'closed'}
                data-slot="dropdown-menu-trigger"
                onClick={handleOpenMenu}
                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-5">
                    <path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z" />
                </svg>
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    role="menu"
                    aria-orientation="vertical"
                    className="fixed z-50 min-w-[8rem] w-fit rounded-md border bg-popover p-1 text-popover-foreground shadow-md motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
                    style={{ top: position.top, left: position.left }}
                >
                    <div className="flex gap-2">
                        <div className="flex w-full justify-start gap-2 rounded-md max-sm:[&>*]:flex-1">
                            {/* ▶️ Iniciar */}
                            <button
                                onClick={() => handleMenuAction("start")}
                                disabled={!canStart || isProcessing !== null}
                                role="button"
                                aria-disabled={!canStart || isProcessing !== null}
                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 font-normal text-sm"
                            >
                                {isProcessing === "start" ? (
                                    <span className="animate-spin rounded-full border-2 size-3.5 border-green-500 border-l-green-500/25"></span>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-500">
                                        <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z" />
                                    </svg>
                                )}
                                Iniciar
                            </button>
                            {/* 🔁 Reiniciar */}
                            <button
                                onClick={() => handleMenuAction("restart")}
                                disabled={!canRestart || isProcessing !== null}
                                role="button"
                                aria-disabled={!canRestart || isProcessing !== null}
                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 font-normal text-sm"
                            >
                                {isProcessing === "restart" ? (
                                    <span className="animate-spin rounded-full border-2 size-3.5 border-blue-500 border-l-blue-500/25"></span>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-500">
                                        <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z" />
                                    </svg>
                                )}
                                Reiniciar
                            </button>

                            {/* ⏸️ Parar */}
                            <button
                                onClick={() => handleMenuAction("stop")}
                                disabled={!canStop || isProcessing !== null}
                                role="button"
                                aria-disabled={!canStop || isProcessing !== null}
                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-9 px-3 font-normal text-sm"
                            >
                                {isProcessing === "stop" ? (
                                    <span className="animate-spin rounded-full border-2 size-3.5 border-red-500 border-l-red-500/25"></span>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-red-500">
                                        <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" />
                                    </svg>
                                )}
                                Parar
                            </button>
                        </div>
                    </div>

                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />

                    <a
                        href={base}
                        role="menuitem"
                        className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground"
                    >
                        Favoritar
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
                        </svg>
                    </a>
                    <a href={base} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
                        Visualizar
                    </a>
                    <a href={`${base}/files`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
                        Arquivos
                    </a>
                    <a href={`${base}/settings`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
                        Configurações
                    </a>

                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />

                    <button
                        onClick={() => handleMenuAction("delete")}
                        disabled={isProcessing !== null}
                        role="menuitem"
                        aria-disabled={isProcessing !== null}
                        data-slot="dropdown-menu-item"
                        data-variant="destructive"
                        data-radix-collection-item
                        data-orientation="vertical"
                        data-highlighted
                        tabIndex={0}
                        className="data-[variant=destructive]:*:[svg]:!text-destructive relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[disabled]:opacity-50 data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 text-red-500 hover:bg-red-900"
                    >
                        {isProcessing === "delete" ? (
                            <span className="animate-spin rounded-full border-2 size-3.5 border-red-500 border-l-red-500/25"></span>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M216,48H176V40a16,16,0,0,0-16-16H96A16,16,0,0,0,80,40v8H40A16,16,0,0,0,40,64H48V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a16,16,0,0,0,0-32ZM96,40h64v8H96ZM192,208H64V64H192Z" />
                            </svg>
                        )}
                        Deletar aplicação
                    </button>
                </div>
            )}
        </>
    );
}

//frontend/src/components/AppDropdownMenu.jsx

//import { useParams } from 'next/navigation';
//import { useState, useRef, useEffect } from 'react';
//import '../app/styles/virtus.css';
//
//export function AppDropdownMenu({ app, onAction }) {
//    const [isOpen, setIsOpen] = useState(false);
//    const [position, setPosition] = useState({ top: 0, left: 0 });
//    const [isProcessing, setIsProcessing] = useState(null); // "start" | "restart" | "stop" | null
//    const menuRef = useRef(null);
//    const triggerRef = useRef(null);
//
//    const appId = app.ID || app.ContainerName;
//    const normalizedStatus = (app.status || "").toLowerCase();
//    const canStart = normalizedStatus !== "running";
//    const canStop = normalizedStatus === "running";
//    const canRestart = normalizedStatus === "running";
//    const { lang } = useParams();
//    const base = `/${lang}/dashboard/applications/${appId}`;
//
//    useEffect(() => {
//        function handleClickOutside(event) {
//            if (
//                menuRef.current &&
//                !menuRef.current.contains(event.target) &&
//                !triggerRef.current.contains(event.target)
//            ) {
//                setIsOpen(false);
//            }
//        }
//        document.addEventListener('mousedown', handleClickOutside);
//        return () => document.removeEventListener('mousedown', handleClickOutside);
//    }, []);
//
//    function handleOpenMenu() {
//        if (triggerRef.current) {
//            const rect = triggerRef.current.getBoundingClientRect();
//            setPosition({
//                top: rect.bottom + 10,
//                left: rect.left,
//            });
//        }
//        setIsOpen((prev) => !prev);
//    }
//
//    const handleMenuAction = async (type) => {
//        setIsProcessing(type);
//        await onAction(type, app);
//        await new Promise((r) => setTimeout(r, 300));
//        setIsProcessing(null);
//        setIsOpen(false);
//    };
//
//    return (
//        <>
//            <button
//                ref={triggerRef}
//                type="button"
//                aria-haspopup="menu"
//                aria-expanded={isOpen}
//                data-state={isOpen ? 'open' : 'closed'}
//                data-slot="dropdown-menu-trigger"
//                onClick={handleOpenMenu}
//                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//            >
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-5">
//                    <path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z" />
//                </svg>
//            </button>
//
//            {isOpen && (
//                <div
//                    ref={menuRef}
//                    role="menu"
//                    aria-orientation="vertical"
//                    className="fixed z-50 min-w-[8rem] w-fit rounded-md border bg-popover p-1 text-popover-foreground shadow-md motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
//                    style={{ top: position.top, left: position.left }}
//                >
//                    <div className="flex gap-2">
//                        <div className="flex w-full justify-start gap-2 rounded-md max-sm:[&>*]:flex-1">
//                            {/* ▶️ Iniciar */}
//                            <button
//                                onClick={() => handleMenuAction("start")}
//                                disabled={!canStart || isProcessing !== null}
//                                role="button"
//                                aria-disabled={!canStart || isProcessing !== null}
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 font-normal text-sm"
//                            >
//                                {isProcessing === "start" ? (
//                                    <span className="animate-spin rounded-full border-2 size-3.5 border-green-500 border-l-green-500/25"></span>
//                                ) : (
//                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-500">
//                                        <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z" />
//                                    </svg>
//                                )}
//                                Iniciar
//                            </button>
//                            {/* 🔁 Reiniciar */}
//                            <button
//                                onClick={() => handleMenuAction("restart")}
//                                disabled={!canRestart || isProcessing !== null}
//                                className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal"
//                            >
//                                {isProcessing === "restart" ? (
//                                    <span className="animate-spin rounded-full border-2 size-3.5 border-blue-500 border-l-blue-500/25"></span>
//                                ) : (
//                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-500">
//                                        <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z" />
//                                    </svg>
//                                )}
//                                Reiniciar
//                            </button>
//
//                            {/* ⏸️ Parar */}
//                            <button
//                                onClick={() => handleMenuAction("stop")}
//                                disabled={!canStop || isProcessing !== null}
//                                role="button"
//                                aria-disabled={!canStop || isProcessing !== null}
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-9 px-3 font-normal text-sm"
//                            >
//                                {isProcessing === "stop" ? (
//                                    <span className="animate-spin rounded-full border-2 size-3.5 border-red-500 border-l-red-500/25"></span>
//                                ) : (
//                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-red-500">
//                                        <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" />
//                                    </svg>
//                                )}
//                                Parar
//                            </button>
//                        </div>
//                    </div>
//
//                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//                    <a
//                        href={base}
//                        role="menuitem"
//                        className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                    >
//                        Favoritar
//                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//                        </svg>
//                    </a>
//                    <a href={base} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//                        Visualizar
//                    </a>
//                    <a href={`${base}/files`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//                        Arquivos
//                    </a>
//                    <a href={`${base}/settings`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//                        Configurações
//                    </a>
//
//                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//                    <button
//                        onClick={() => handleMenuAction("delete")}
//                        disabled={isProcessing !== null}
//                        role="menuitem"
//                        aria-disabled={isProcessing !== null}
//                        data-slot="dropdown-menu-item"
//                        data-variant="destructive"
//                        data-radix-collection-item
//                        data-orientation="vertical"
//                        data-highlighted
//                        tabIndex={0}
//                        className="data-[variant=destructive]:*:[svg]:!text-destructive relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[disabled]:opacity-50 data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 text-red-500 hover:bg-red-900"
//                    >
//                        {isProcessing === "delete" ? (
//                            <span className="animate-spin rounded-full border-2 size-3.5 border-red-500 border-l-red-500/25"></span>
//                        ) : (
//                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                <path d="M216,48H176V40a16,16,0,0,0-16-16H96A16,16,0,0,0,80,40v8H40A16,16,0,0,0,40,64H48V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a16,16,0,0,0,0-32ZM96,40h64v8H96ZM192,208H64V64H192Z" />
//                            </svg>
//                        )}
//                        Deletar aplicação
//                    </button>
//                </div>
//            )}
//        </>
//    );
//}

//frontend/src/components/AppDropdownMenu.jsx

//import { useState, useRef, useEffect } from 'react';
//import '../app/styles/virtus.css';
//
//export function AppDropdownMenu({ app, onAction }) {
//    const [isOpen, setIsOpen] = useState(false);
//    const [position, setPosition] = useState({ top: 0, left: 0 });
//    const [isProcessing, setIsProcessing] = useState(null); // "start" | "restart" | "stop" | null
//    const menuRef = useRef(null);
//    const triggerRef = useRef(null);
//
//    const appId = app.ID || app.ContainerName;
//    const normalizedStatus = (app.status || "").toLowerCase();
//    const canStart = normalizedStatus !== "running";
//    const canStop = normalizedStatus === "running";
//    const canRestart = normalizedStatus === "running";
//
//    useEffect(() => {
//        function handleClickOutside(event) {
//            if (
//                menuRef.current &&
//                !menuRef.current.contains(event.target) &&
//                !triggerRef.current.contains(event.target)
//            ) {
//                setIsOpen(false);
//            }
//        }
//        document.addEventListener('mousedown', handleClickOutside);
//        return () => document.removeEventListener('mousedown', handleClickOutside);
//    }, []);
//
//    function handleOpenMenu() {
//        if (triggerRef.current) {
//            const rect = triggerRef.current.getBoundingClientRect();
//            setPosition({
//                top: rect.bottom + 10,
//                left: rect.left,
//            });
//        }
//        setIsOpen((prev) => !prev);
//    }
//
//    const handleMenuAction = async (type) => {
//        setIsProcessing(type);
//        await onAction(type, app);
//        await new Promise((r) => setTimeout(r, 300));
//        setIsProcessing(null);
//        setIsOpen(false);
//    };
//
//    return (
//        <>
//            <button
//                ref={triggerRef}
//                type="button"
//                aria-haspopup="menu"
//                aria-expanded={isOpen}
//                data-state={isOpen ? 'open' : 'closed'}
//                data-slot="dropdown-menu-trigger"
//                onClick={handleOpenMenu}
//                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//            >
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-5">
//                    <path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z" />
//                </svg>
//            </button>
//
//            {isOpen && (
//                <div
//                    ref={menuRef}
//                    role="menu"
//                    aria-orientation="vertical"
//                    className="fixed z-50 min-w-[8rem] w-fit rounded-md border bg-popover p-1 text-popover-foreground shadow-md motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
//                    style={{ top: position.top, left: position.left }}
//                >
//                    <div className="flex gap-2">
//                        <div className="flex w-full justify-start gap-2 rounded-md max-sm:[&>*]:flex-1">
//                            {/* ▶️ Iniciar */}
//                            <button
//                                onClick={() => handleMenuAction("start")}
//                                disabled={!canStart || isProcessing !== null}
//                                role="button"
//                                aria-disabled={!canStart || isProcessing !== null}
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 font-normal text-sm"
//                            >
//                                {isProcessing === "start" ? (
//                                    <span className="animate-spin rounded-full border-2 size-3.5 border-green-500 border-l-green-500/25"></span>
//                                ) : (
//                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-500">
//                                        <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z" />
//                                    </svg>
//                                )}
//                                Iniciar
//                            </button>
//                            {/* 🔁 Reiniciar */}
//                            <button
//                                onClick={() => handleMenuAction("restart")}
//                                disabled={!canRestart || isProcessing !== null}
//                                className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal"
//                            >
//                                {isProcessing === "restart" ? (
//                                    <span className="animate-spin rounded-full border-2 size-3.5 border-blue-500 border-l-blue-500/25"></span>
//                                ) : (
//                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-500">
//                                        <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z" />
//                                    </svg>
//                                )}
//                                Reiniciar
//                            </button>
//
//                            {/* ⏸️ Parar */}
//                            <button
//                                onClick={() => handleMenuAction("stop")}
//                                disabled={!canStop || isProcessing !== null}
//                                role="button"
//                                aria-disabled={!canStop || isProcessing !== null}
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-9 px-3 font-normal text-sm"
//                            >
//                                {isProcessing === "stop" ? (
//                                    <span className="animate-spin rounded-full border-2 size-3.5 border-red-500 border-l-red-500/25"></span>
//                                ) : (
//                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-red-500">
//                                        <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" />
//                                    </svg>
//                                )}
//                                Parar
//                            </button>
//                        </div>
//                    </div>
//
//                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//                    <a
//                        href={`/pt-br/dashboard/applications/${appId}`}
//                        role="menuitem"
//                        className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                    >
//                        Favoritar
//                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//                        </svg>
//                    </a>
//                    <a
//                        href={`/pt-br/dashboard/applications/${appId}`}
//                        className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground"
//                    >
//                        Visualizar
//                    </a>
//                    <a href={`/pt-br/dashboard/applications/${appId}/files`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//                        Arquivos
//                    </a>
//                    <a href={`/pt-br/dashboard/applications/${appId}/settings`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//                        Configurações
//                    </a>
//
//                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//                    <button
//                        onClick={() => handleMenuAction("delete")}
//                        disabled={isProcessing !== null}
//                        role="menuitem"
//                        aria-disabled={isProcessing !== null}
//                        data-slot="dropdown-menu-item"
//                        data-variant="destructive"
//                        data-radix-collection-item
//                        data-orientation="vertical"
//                        data-highlighted
//                        tabIndex={0}
//                        className="data-[variant=destructive]:*:[svg]:!text-destructive relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[disabled]:opacity-50 data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 text-red-500 hover:bg-red-900"
//                    >
//                        {isProcessing === "delete" ? (
//                            <span className="animate-spin rounded-full border-2 size-3.5 border-red-500 border-l-red-500/25"></span>
//                        ) : (
//                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                <path d="M216,48H176V40a16,16,0,0,0-16-16H96A16,16,0,0,0,80,40v8H40A16,16,0,0,0,40,64H48V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a16,16,0,0,0,0-32ZM96,40h64v8H96ZM192,208H64V64H192Z" />
//                            </svg>
//                        )}
//                        Deletar aplicação
//                    </button>
//                </div>
//            )}
//        </>
//    );
//}

//import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
//import { useState } from 'react';
//
//export function AppDropdownMenu({ app, onAction }) {
//  const [isProcessing, setIsProcessing] = useState(null); // "start" | "restart" | "stop" | "delete" | null
//  const appId = app.ID || app.ContainerName;
//  const normalizedStatus = (app.status || "").toLowerCase();
//  const canStart = normalizedStatus !== "running";
//  const canStop = normalizedStatus === "running";
//  const canRestart = normalizedStatus === "running";
//
//  const handleMenuAction = async (type) => {
//    setIsProcessing(type);
//    await onAction(type, app);
//    await new Promise((r) => setTimeout(r, 300));
//    setIsProcessing(null);
//  };
//
//  return (
//    <DropdownMenu.Root>
//      <DropdownMenu.Trigger asChild>
//        <button
//          type="button"
//          data-slot="dropdown-menu-trigger"
//          className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-5">
//            <path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z" />
//          </svg>
//        </button>
//      </DropdownMenu.Trigger>
//
//      <DropdownMenu.Portal>
//        <DropdownMenu.Content
//          sideOffset={10}
//          className="z-50 min-w-[8rem] w-fit rounded-md border bg-popover p-1 text-popover-foreground shadow-md motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
//        >
//          <div className="flex gap-2">
//            <div className="flex w-full justify-start gap-2 rounded-md max-sm:[&>*]:flex-1">
//              {/* ▶️ Iniciar */}
//              <DropdownMenu.Item
//                disabled={!canStart || isProcessing !== null}
//                onSelect={() => handleMenuAction("start")}
//                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-9 px-3 font-normal text-sm"
//              >
//                {isProcessing === "start" ? (
//                  <span className="animate-spin rounded-full border-2 size-3.5 border-green-500 border-l-green-500/25"></span>
//                ) : (
//                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-500">
//                    <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z" />
//                  </svg>
//                )}
//                Iniciar
//              </DropdownMenu.Item>
//
//              {/* 🔁 Reiniciar */}
//              <DropdownMenu.Item
//                disabled={!canRestart || isProcessing !== null}
//                onSelect={() => handleMenuAction("restart")}
//                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-9 px-3 font-normal text-sm"
//              >
//                {isProcessing === "restart" ? (
//                  <span className="animate-spin rounded-full border-2 size-3.5 border-blue-500 border-l-blue-500/25"></span>
//                ) : (
//                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-500">
//                    <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z" />
//                  </svg>
//                )}
//                Reiniciar
//              </DropdownMenu.Item>
//
//              {/* ⏸️ Parar */}
//              <DropdownMenu.Item
//                disabled={!canStop || isProcessing !== null}
//                onSelect={() => handleMenuAction("stop")}
//                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-9 px-3 font-normal text-sm"
//              >
//                {isProcessing === "stop" ? (
//                  <span className="animate-spin rounded-full border-2 size-3.5 border-red-500 border-l-red-500/25"></span>
//                ) : (
//                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-red-500">
//                    <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" />
//                  </svg>
//                )}
//                Parar
//              </DropdownMenu.Item>
//            </div>
//          </div>
//                    <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />
//
//          <DropdownMenu.Item asChild>
//            <a
//              href={`/pt-br/dashboard/applications/${appId}`}
//              role="menuitem"
//              data-slot="dropdown-menu-item"
//              className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground outline-hidden hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//            >
//              Visualizar
//            </a>
//          </DropdownMenu.Item>
//
//          <DropdownMenu.Item asChild>
//            <a
//              href={`/pt-br/dashboard/applications/${appId}/files`}
//              role="menuitem"
//              data-slot="dropdown-menu-item"
//              className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground outline-hidden hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//            >
//              Arquivos
//            </a>
//          </DropdownMenu.Item>
//
//          <DropdownMenu.Item asChild>
//            <a
//              href={`/pt-br/dashboard/applications/${appId}/settings`}
//              role="menuitem"
//              data-slot="dropdown-menu-item"
//              className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground outline-hidden hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//            >
//              Configurações
//            </a>
//          </DropdownMenu.Item>
//
//          <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />
//
//          <DropdownMenu.Item
//            disabled={isProcessing !== null}
//            onSelect={() => handleMenuAction("delete")}
//            role="menuitem"
//            data-slot="dropdown-menu-item"
//            data-variant="destructive"
//            className="data-[variant=destructive]:*:[svg]:!text-destructive relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden data-[variant=destructive]:text-destructive hover:bg-red-900 focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20 disabled:pointer-events-none disabled:opacity-50"
//          >
//            {isProcessing === "delete" ? (
//              <span className="animate-spin rounded-full border-2 size-3.5 border-red-500 border-l-red-500/25"></span>
//            ) : (
//              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-red-500">
//                <path d="M216,48H176V40a16,16,0,0,0-16-16H96A16,16,0,0,0,80,40v8H40A16,16,0,0,0,40,64H48V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a16,16,0,0,0,0-32ZM96,40h64v8H96ZM192,208H64V64H192Z" />
//              </svg>
//            )}
//            Deletar aplicação
//          </DropdownMenu.Item>
//        </DropdownMenu.Content>
//      </DropdownMenu.Portal>
//    </DropdownMenu.Root>
//  );
//}

//frontend/src/components/AppDropdownMenu.jsx

//import { useState, useRef, useEffect } from 'react';
//import '../app/styles/virtus.css';
//
//export function AppDropdownMenu({ app, onAction }) {
//    const [isOpen, setIsOpen] = useState(false);
//    const [position, setPosition] = useState({ top: 0, left: 0 });
//    const [isProcessing, setIsProcessing] = useState(null); // "start" | "restart" | "stop" | null
//    const [highlighted, setHighlighted] = useState(null); // "start" | "restart" | "stop" | "delete" | null
//    const menuRef = useRef(null);
//    const triggerRef = useRef(null);
//
//    const appId = app.ID || app.ContainerName;
//    const normalizedStatus = (app.status || "").toLowerCase();
//    const canStart = normalizedStatus !== "running";
//    const canStop = normalizedStatus === "running";
//    const canRestart = normalizedStatus === "running";
//
//    useEffect(() => {
//        function handleClickOutside(event) {
//            if (
//                menuRef.current &&
//                !menuRef.current.contains(event.target) &&
//                !triggerRef.current.contains(event.target)
//            ) {
//                setIsOpen(false);
//            }
//        }
//        document.addEventListener('mousedown', handleClickOutside);
//        return () => document.removeEventListener('mousedown', handleClickOutside);
//    }, []);
//
//    function handleOpenMenu() {
//        if (triggerRef.current) {
//            const rect = triggerRef.current.getBoundingClientRect();
//            setPosition({
//                top: rect.bottom + 10,
//                left: rect.left,
//            });
//        }
//        setIsOpen((prev) => !prev);
//    }
//
//    const handleMenuAction = async (type) => {
//        setIsProcessing(type);
//        await onAction(type, app);
//        await new Promise((r) => setTimeout(r, 300));
//        setIsProcessing(null);
//        setIsOpen(false);
//    };
//
//    return (
//        <>
//            <button
//                ref={triggerRef}
//                type="button"
//                aria-haspopup="menu"
//                aria-expanded={isOpen}
//                data-state={isOpen ? 'open' : 'closed'}
//                data-slot="dropdown-menu-trigger"
//                onClick={handleOpenMenu}
//                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//            >
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-5">
//                    <path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z" />
//                </svg>
//            </button>
//
//            {isOpen && (
//                <div
//                    ref={menuRef}
//                    role="menu"
//                    aria-orientation="vertical"
//                    className="fixed z-50 min-w-[8rem] w-fit rounded-md border bg-popover p-1 text-popover-foreground shadow-md motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
//                    style={{ top: position.top, left: position.left }}
//                >
//                    <div className="flex gap-2">
//                        <div className="flex w-full justify-start gap-2 rounded-md max-sm:[&>*]:flex-1">
//                            {/* ▶️ Iniciar */}
//                            <button
//                                onClick={() => handleMenuAction("start")}
//                                disabled={!canStart || isProcessing !== null}
//                                role="button"
//                                aria-disabled={!canStart || isProcessing !== null}
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-9 px-3 font-normal text-sm"
//                            >
//                                {isProcessing === "start" ? (
//                                    <span className="animate-spin rounded-full border-2 size-3.5 border-green-500 border-l-green-500/25"></span>
//                                ) : (
//                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-500">
//                                        <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z" />
//                                    </svg>
//                                )}
//                                Iniciar
//                            </button>
//                            {/* 🔁 Reiniciar */}
//                            <button
//                                onClick={() => handleMenuAction("restart")}
//                                disabled={!canRestart || isProcessing !== null}
//                                className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal"
//                            >
//                                {isProcessing === "restart" ? (
//                                    <span className="animate-spin rounded-full border-2 size-3.5 border-blue-500 border-l-blue-500/25"></span>
//                                ) : (
//                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-500">
//                                        <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z" />
//                                    </svg>
//                                )}
//                                Reiniciar
//                            </button>
//
//                            {/* ⏸️ Parar */}
//                            <button
//                                onClick={() => handleMenuAction("stop")}
//                                disabled={!canStop || isProcessing !== null}
//                                role="button"
//                                aria-disabled={!canStop || isProcessing !== null}
//                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-9 px-3 font-normal text-sm"
//                            >
//                                {isProcessing === "stop" ? (
//                                    <span className="animate-spin rounded-full border-2 size-3.5 border-red-500 border-l-red-500/25"></span>
//                                ) : (
//                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-red-500">
//                                        <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" />
//                                    </svg>
//                                )}
//                                Parar
//                            </button>
//                        </div>
//                    </div>
//
//                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//                    <a
//                        href={`/pt-br/dashboard/applications/${appId}`}
//                        role="menuitem"
//                        className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                    >
//                        Favoritar
//                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//                        </svg>
//                    </a>
//                    <a
//                        href={`/pt-br/dashboard/applications/${appId}`}
//                        className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground"
//                    >
//                        Visualizar
//                    </a>
//                    <a href={`/pt-br/dashboard/applications/${appId}/files`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//                        Arquivos
//                    </a>
//                    <a href={`/pt-br/dashboard/applications/${appId}/settings`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//                        Configurações
//                    </a>
//
//                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//                    <button
//                        onClick={() => handleMenuAction("delete")}
//                        disabled={isProcessing !== null}
//                        role="menuitem"
//                        aria-disabled={isProcessing !== null}
//                        data-slot="dropdown-menu-item"
//                        data-variant="destructive"
//                        data-radix-collection-item
//                        data-orientation="vertical"
//                        data-highlighted
//                        tabIndex={0}
//                        className="data-[variant=destructive]:*:[svg]:!text-destructive relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[disabled]:opacity-50 data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 text-red-500 hover:bg-red-900"
//                    >
//                        {isProcessing === "delete" ? (
//                            <span className="animate-spin rounded-full border-2 size-3.5 border-red-500 border-l-red-500/25"></span>
//                        ) : (
//                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                                <path d="M216,48H176V40a16,16,0,0,0-16-16H96A16,16,0,0,0,80,40v8H40A16,16,0,0,0,40,64H48V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a16,16,0,0,0,0-32ZM96,40h64v8H96ZM192,208H64V64H192Z" />
//                            </svg>
//                        )}
//                        Deletar aplicação
//                    </button>
//                </div>
//            )}
//        </>
//    );
//}

//import { useState, useRef, useEffect } from 'react';
//import '../app/styles/virtus.css';
//
//export function AppDropdownMenu({ app, onAction }) {
//    const [isOpen, setIsOpen] = useState(false);
//    const [position, setPosition] = useState({ top: 0, left: 0 });
//    const menuRef = useRef(null);
//    const triggerRef = useRef(null);
//    const [isProcessing, setIsProcessing] = useState(false);
//    const appId = app.ID || app.ContainerName;
//    const normalizedStatus = (app.status || "").toLowerCase();
//
//    const canStart = normalizedStatus !== "running";
//    const canStop = normalizedStatus === "running";
//    const canRestart = normalizedStatus === "running";
//
//    useEffect(() => {
//        function handleClickOutside(event) {
//            if (
//                menuRef.current &&
//                !menuRef.current.contains(event.target) &&
//                !triggerRef.current.contains(event.target)
//            ) {
//                setIsOpen(false);
//            }
//        }
//        document.addEventListener('mousedown', handleClickOutside);
//        return () => document.removeEventListener('mousedown', handleClickOutside);
//    }, []);
//
//    function handleOpenMenu() {
//        if (triggerRef.current) {
//            const rect = triggerRef.current.getBoundingClientRect();
//            setPosition({
//                top: rect.bottom + 10, // 10px de margem abaixo do botão
//                left: rect.left,
//            });
//        }
//        setIsOpen((prev) => !prev);
//    }
//
//    return (
//        <>
//            <button
//                ref={triggerRef}
//                type="button"
//                aria-haspopup="menu"
//                aria-expanded={isOpen}
//                data-state={isOpen ? 'open' : 'closed'}
//                data-slot="dropdown-menu-trigger"
//                onClick={handleOpenMenu}
//                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//            >
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-5">
//                    <path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z" />
//                </svg>
//            </button>
//
//            {isOpen && (
//                <div
//                    ref={menuRef}
//                    role="menu"
//                    aria-orientation="vertical"
//                    className="fixed z-50 min-w-[8rem] w-fit rounded-md border bg-popover p-1 text-popover-foreground shadow-md motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
//                    style={{
//                        top: position.top,
//                        left: position.left,
//                    }}
//                >
//                    <div className="flex gap-2">
//                        <div className="flex w-full justify-start gap-2 rounded-md max-sm:[&>*]:flex-1">
//                            <button
//                                onClick={(e) => onAction("start", app)}
//                                disabled={!canStart || isProcessing}
//                                role="button"
//                                aria-disabled={!canStart || isProcessing}
//                                className={`group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-9 px-3 font-normal text-sm`}
//                            >
//                                {isProcessing ? (
//                                    <span className="animate-spin rounded-full border-2 size-3.5 border-green-500 border-l-green-500/25"></span>
//                                ) : (
//                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-500">
//                                        <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z" />
//                                    </svg>
//                                )}
//                                Iniciar
//                            </button>
//
//                            <button
//                                onClick={(e) => onAction("restart", app)}
//                                disabled={!canRestart || isProcessing}
//                                className={`group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal ${(!canRestart || isProcessing) ? "opacity-50 cursor-not-allowed" : ""}`}
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-500">
//                                    <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z" />
//                                </svg>
//                                Reiniciar
//                            </button>
//
//                            <button
//                                onClick={(e) => onAction("stop", app)}
//                                disabled={!canStop || isProcessing}
//                                role="button"
//                                aria-disabled={!canStop || isProcessing}
//                                className={`group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-9 px-3 font-normal text-sm`}
//                            >
//                                {isProcessing ? (
//                                    <span className="animate-spin rounded-full border-2 size-3.5 border-red-500 border-l-red-500/25"></span>
//                                ) : (
//                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-red-500">
//                                        <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" />
//                                    </svg>
//                                )}
//                                Parar
//                            </button>
//                        </div>
//                    </div>
//
//                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//                    <a
//                        href={`/pt-br/dashboard/applications/${appId}`}
//                        role="menuitem"
//                        className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                    >
//                        Favoritar
//                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//                        </svg>
//                    </a>
//                    <a
//                        href={`/pt-br/dashboard/applications/${appId}`}
//                        className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground"
//                    >
//                        Visualizar
//                    </a>
//                    <a href={`/pt-br/dashboard/applications/${appId}/files`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//                        Arquivos
//                    </a>
//                    <a href={`/pt-br/dashboard/applications/${appId}/settings`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//                        Configurações
//                    </a>
//
//                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//                    <button role="menuitem" className="block w-full px-2 py-1.5 text-sm rounded-sm text-red-500 hover:bg-red-900">
//                        Deletar aplicação
//                    </button>
//                </div>
//            )}
//        </>
//    );
//}

//frontend/src/components/AppDropdownMenu.jsx

//import { useState, useRef, useEffect } from 'react';
//import '../app/styles/virtus.css';
//
//export function AppDropdownMenu({ app }) {
//    const [isOpen, setIsOpen] = useState(false);
//    const [position, setPosition] = useState({ top: 0, left: 0 });
//    const menuRef = useRef(null);
//    const triggerRef = useRef(null);
//    const [isProcessing, setIsProcessing] = useState(false);
//    const appId = app.ID || app.ContainerName;
//    const normalizedStatus = (app.status || "").toLowerCase();
//
//    const canStart = normalizedStatus !== "running";
//    const canStop = normalizedStatus === "running";
//    const canRestart = normalizedStatus === "running";
//
//    useEffect(() => {
//        function handleClickOutside(event) {
//            if (
//                menuRef.current &&
//                !menuRef.current.contains(event.target) &&
//                !triggerRef.current.contains(event.target)
//            ) {
//                setIsOpen(false);
//            }
//        }
//        document.addEventListener('mousedown', handleClickOutside);
//        return () => document.removeEventListener('mousedown', handleClickOutside);
//    }, []);
//
//    function handleOpenMenu() {
//        if (triggerRef.current) {
//            const rect = triggerRef.current.getBoundingClientRect();
//            setPosition({
//                top: rect.bottom + 10, // 10px de margem abaixo do botão
//                left: rect.left,
//            });
//        }
//        setIsOpen((prev) => !prev);
//    }
//
//    const handleCommand = async (e, action) => {
//        e.preventDefault(); // evita comportamento padrão
//        setIsProcessing(true);
//
//        const token = localStorage.getItem("token");
//        const containerId = app.ContainerName || app.ID;
//        console.log("🔧 Enviando ação:", action, "para", containerId);
//
//        const startTime = performance.now();
//
//        const res = await fetch(`/api/app/${action}?id=${containerId}`, {
//            method: "POST",
//            headers: {
//                Authorization: `Bearer ${token}`,
//                "Content-Type": "application/json",
//            },
//            credentials: "include",
//        });
//
//        const endTime = performance.now();
//        const duration = ((endTime - startTime) / 1000).toFixed(2);
//
//        const data = await res.json();
//        alert(`${data.message || "Ação executada."} ⏱️ (${duration}s)`);
//
//        setIsProcessing(false);
//        setIsOpen(false);
//    };
//    
//    //// 🔧 Executa uma ação no backend para o app atual
//    //const handleCommand = async (e, action) => {
//    //    e.stopPropagation(); // 🛑 Impede que o clique feche o dropdown ou propague
//    //
//    //    setIsProcessing(true); // ⏳ Desabilita os botões durante o processo
//    //
//    //    // 🔐 Recupera o token de autenticação salvo localmente
//    //    const token = localStorage.getItem("token");
//    //
//    //    // 🆔 Usa o ID do container como identificador da aplicação
//    //    const containerId = app.ContainerName || app.ID;
//    //    console.log("🔧 Enviando ação:", action, "para", containerId);
//    //
//    //    // ⏱️ Medição de tempo de execução
//    //    const startTime = performance.now();
//    //
//    //    // 🌐 Envia requisição para o backend
//    //    const res = await fetch(`/api/app/${action}?id=${containerId}`, {
//    //        method: "POST",
//    //        headers: {
//    //            Authorization: `Bearer ${token}`,
//    //            "Content-Type": "application/json",
//    //        },
//    //        credentials: "include",
//    //    });
//    //
//    //    const endTime = performance.now();
//    //    const duration = ((endTime - startTime) / 1000).toFixed(2);
//    //
//    //    // 📩 Exibe mensagem de retorno
//    //    const data = await res.json();
//    //    alert(`${data.message || "Ação executada."} ⏱️ (${duration}s)`);
//    //
//    //    setIsProcessing(false); // ✅ Reabilita os botões
//    //    setIsOpen(false);       // 🚪 Fecha o menu dropdown
//    //};
//
//    return (
//        <>
//            <button
//                ref={triggerRef}
//                type="button"
//                aria-haspopup="menu"
//                aria-expanded={isOpen}
//                data-state={isOpen ? 'open' : 'closed'}
//                data-slot="dropdown-menu-trigger"
//                onClick={handleOpenMenu}
//                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//            >
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-5">
//                    <path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z" />
//                </svg>
//            </button>
//
//            {isOpen && (
//                <div
//                    ref={menuRef}
//                    role="menu"
//                    aria-orientation="vertical"
//                    className="fixed z-50 min-w-[8rem] w-fit rounded-md border bg-popover p-1 text-popover-foreground shadow-md motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
//                    style={{
//                        top: position.top,
//                        left: position.left,
//                    }}
//                >
//                    <div className="flex gap-2">
//                        <div className="flex w-full justify-start gap-2 rounded-md max-sm:[&>*]:flex-1">
//                            <button
//                                onClick={(e) => handleCommand(e, "start")}
//                                disabled={!canStart || isProcessing}
//                                className={`group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal ${(!canStart || isProcessing) ? "opacity-50 cursor-not-allowed" : ""}`}
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-500">
//                                    <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z" />
//                                </svg>
//                                Iniciar
//                            </button>
//
//                            <button
//                                onClick={(e) => handleCommand(e, "restart")}
//                                disabled={!canRestart || isProcessing}
//                                className={`group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-500">
//                                    <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z" />
//                                </svg>
//                                Reiniciar
//                            </button>
//
//                            <button
//                                onClick={(e) => handleCommand(e, "stop")}
//                                disabled={!canStop || isProcessing}
//                                className={`group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-red-500">
//                                    <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" />
//                                </svg>
//                                Parar
//                            </button>
//                        </div>
//                    </div>
//
//                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//                    <a
//                        href={`/pt-br/dashboard/applications/${appId}`}
//                        role="menuitem"
//                        className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                    >
//                        Favoritar
//                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//                        </svg>
//                    </a>
//                    <a
//                        href={`/pt-br/dashboard/applications/${appId}`}
//                        className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground"
//                    >
//                        Visualizar
//                    </a>
//                    <a href={`/pt-br/dashboard/applications/${appId}/files`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//                        Arquivos
//                    </a>
//                    <a href={`/pt-br/dashboard/applications/${appId}/settings`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//                        Configurações
//                    </a>
//
//                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//                    <button role="menuitem" className="block w-full px-2 py-1.5 text-sm rounded-sm text-red-500 hover:bg-red-900">
//                        Deletar aplicação
//                    </button>
//                </div>
//            )}
//        </>
//    );
//}

//frontend/src/components/AppDropdownMenu.jsx

//import { useState, useRef, useEffect } from 'react';
//import '../app/styles/virtus.css';
//
//export function AppDropdownMenu({ appId }) {
//    const [isOpen, setIsOpen] = useState(false);
//    const [position, setPosition] = useState({ top: 0, left: 0 });
//    const menuRef = useRef(null);
//    const triggerRef = useRef(null);
//    const [isProcessing, setIsProcessing] = useState(false);
//
//    useEffect(() => {
//        function handleClickOutside(event) {
//            if (
//                menuRef.current &&
//                !menuRef.current.contains(event.target) &&
//                !triggerRef.current.contains(event.target)
//            ) {
//                setIsOpen(false);
//            }
//        }
//        document.addEventListener('mousedown', handleClickOutside);
//        return () => document.removeEventListener('mousedown', handleClickOutside);
//    }, []);
//
//    function handleOpenMenu() {
//        if (triggerRef.current) {
//            const rect = triggerRef.current.getBoundingClientRect();
//            setPosition({
//                top: rect.bottom + 10, // 10px de margem abaixo do botão
//                left: rect.left,
//            });
//        }
//        setIsOpen((prev) => !prev);
//    }
//    // 🔧 Executa uma ação no backend para o app atual
//    const handleCommand = async (action) => {
//        setIsProcessing(true); // ⏳ desabilita botões
//
//        // 🔐 Recupera o token de autenticação salvo localmente
//        const token = localStorage.getItem("token");
//
//        // 🆔 Usa o ID do container como identificador da aplicação
//        const res = await fetch(`/api/app/${action}?id=${appId}`, {
//            method: "POST",
//            headers: {
//                Authorization: `Bearer ${token}`,
//                "Content-Type": "application/json",
//            },
//            credentials: "include",
//        });
//
//        // 📩 Exibe mensagem de retorno da API
//        const data = await res.json();
//        alert(data.message || "Ação executada.");
//
//        setIsProcessing(false); // ✅ reabilita botões
//
//        // 🚪 Fecha o menu dropdown após a ação
//        setIsOpen(false);
//    };
//
//    return (
//        <>
//            <button
//                ref={triggerRef}
//                type="button"
//                aria-haspopup="menu"
//                aria-expanded={isOpen}
//                data-state={isOpen ? 'open' : 'closed'}
//                data-slot="dropdown-menu-trigger"
//                onClick={handleOpenMenu}
//                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//            >
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-5">
//                    <path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z" />
//                </svg>
//            </button>
//
//            {isOpen && (
//                <div
//                    ref={menuRef}
//                    role="menu"
//                    aria-orientation="vertical"
//                    className="fixed z-50 min-w-[8rem] w-fit rounded-md border bg-popover p-1 text-popover-foreground shadow-md motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
//                    style={{
//                        top: position.top,
//                        left: position.left,
//                    }}
//                >
//                    <div className="flex gap-2">
//                        <div className="flex w-full justify-start gap-2 rounded-md max-sm:[&>*]:flex-1">
//                            <button
//                                onClick={() => handleCommand("start")}
//                                disabled={isProcessing}
//                                className={`group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-500">
//                                    <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z" />
//                                </svg>
//                                Iniciar
//                            </button>
//
//                            <button
//                                onClick={() => handleCommand("restart")}
//                                disabled={isProcessing}
//                                className={`group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-500">
//                                    <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z" />
//                                </svg>
//                                Reiniciar
//                            </button>
//
//                            <button
//                                onClick={() => handleCommand("stop")}
//                                disabled={isProcessing}
//                                className={`group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
//                            >
//                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-red-500">
//                                    <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" />
//                                </svg>
//                                Parar
//                            </button>
//                        </div>
//                    </div>
//
//                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//                    <a
//                        href={`/pt-br/dashboard/applications/${appId}`}
//                        role="menuitem"
//                        className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                    >
//                        Favoritar
//                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//                        </svg>
//                    </a>
//                    <a
//                        href={`/pt-br/dashboard/applications/${appId}`}
//                        className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground"
//                    >
//                        Visualizar
//                    </a>
//                    <a href={`/pt-br/dashboard/applications/${appId}/files`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//                        Arquivos
//                    </a>
//                    <a href={`/pt-br/dashboard/applications/${appId}/settings`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//                        Configurações
//                    </a>
//
//                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//                    <button role="menuitem" className="block w-full px-2 py-1.5 text-sm rounded-sm text-red-500 hover:bg-red-900">
//                        Deletar aplicação
//                    </button>
//                </div>
//            )}
//        </>
//    );
//}

//import { useState, useRef, useEffect } from 'react';
//import '../app/styles/virtus.css';
//
//export function AppDropdownMenu({ appId }) {
//    const [isOpen, setIsOpen] = useState(false);
//    const [position, setPosition] = useState({ top: 0, left: 0 });
//    const menuRef = useRef(null);
//    const triggerRef = useRef(null);
//
//    useEffect(() => {
//        function handleClickOutside(event) {
//            if (
//                menuRef.current &&
//                !menuRef.current.contains(event.target) &&
//                !triggerRef.current.contains(event.target)
//            ) {
//                setIsOpen(false);
//            }
//        }
//        document.addEventListener('mousedown', handleClickOutside);
//        return () => document.removeEventListener('mousedown', handleClickOutside);
//    }, []);
//
//    function handleOpenMenu() {
//        if (triggerRef.current) {
//            const rect = triggerRef.current.getBoundingClientRect();
//            setPosition({
//                top: rect.bottom + 10, // 10px de margem abaixo do botão
//                left: rect.left,
//            });
//        }
//        setIsOpen((prev) => !prev);
//    }
//
//    return (
//        <>
//            <button
//                ref={triggerRef}
//                type="button"
//                aria-haspopup="menu"
//                aria-expanded={isOpen}
//                data-state={isOpen ? 'open' : 'closed'}
//                data-slot="dropdown-menu-trigger"
//                onClick={handleOpenMenu}
//                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//            >
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-5">
//                    <path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z" />
//                </svg>
//            </button>
//
//            {isOpen && (
//                <div
//                    ref={menuRef}
//                    role="menu"
//                    aria-orientation="vertical"
//                    className="fixed z-50 min-w-[8rem] w-fit rounded-md border bg-popover p-1 text-popover-foreground shadow-md motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
//                    style={{
//                        top: position.top,
//                        left: position.left,
//                    }}
//                >
//                    <div className="flex gap-2">
//                        <div className="flex w-full justify-start gap-2 rounded-md max-sm:[&>*]:flex-1">
//                            <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal">
//                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-500">
//                                    <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z" />
//                                </svg>
//                                Iniciar
//                            </button>
//
//                            <button disabled className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal opacity-50 cursor-not-allowed">
//                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-500">
//                                    <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z" />
//                                </svg>
//                                Reiniciar
//                            </button>
//
//                            <button disabled className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal opacity-50 cursor-not-allowed">
//                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-red-500">
//                                    <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" />
//                                </svg>
//                                Parar
//                            </button>
//                        </div>
//                    </div>
//
//                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//                    <a
//                        href={`/pt-br/dashboard/applications/${appId}`}
//                        role="menuitem"
//                        className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                    >
//                        Favoritar
//                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//                        </svg>
//                    </a>
//                    <a
//                        href={`/pt-br/dashboard/applications/${appId}`}
//                        className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground"
//                    >
//                        Visualizar
//                    </a>
//                    <a href={`/pt-br/dashboard/applications/${appId}/files`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//                        Arquivos
//                    </a>
//                    <a href={`/pt-br/dashboard/applications/${appId}/settings`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//                        Configurações
//                    </a>
//
//                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//                    <button role="menuitem" className="block w-full px-2 py-1.5 text-sm rounded-sm text-red-500 hover:bg-red-900">
//                        Deletar aplicação
//                    </button>
//                </div>
//            )}
//        </>
//    );
//}

//import { useState, useRef, useEffect } from 'react';
//
//export function AppDropdownMenu({ appId }) {
//    const [isOpen, setIsOpen] = useState(false);
//    const menuRef = useRef(null);
//    const triggerRef = useRef(null);
//    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
//
//    useEffect(() => {
//        function handleClickOutside(event) {
//            if (
//                menuRef.current &&
//                !menuRef.current.contains(event.target) &&
//                !triggerRef.current.contains(event.target)
//            ) {
//                setIsOpen(false);
//            }
//        }
//        document.addEventListener('mousedown', handleClickOutside);
//        return () => document.removeEventListener('mousedown', handleClickOutside);
//    }, []);
//
//    return (
//        <div className="relative z-50">
//            <button
//                ref={triggerRef}
//                type="button"
//                aria-haspopup="menu"
//                aria-expanded={isOpen}
//                data-state={isOpen ? 'open' : 'closed'}
//                data-slot="dropdown-menu-trigger"
//                onClick={(e) => {
//                    const rect = e.currentTarget.getBoundingClientRect();
//                    setDropdownPosition({
//                        top: rect.bottom,
//                        left: rect.left,
//                    });
//                    setIsOpen((prev) => !prev);
//                }}
//                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//            >
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-5">
//                    <path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z" />
//                </svg>
//            </button>
//
//            {isOpen && (
//                <div
//                    ref={menuRef}
//                    role="menu"
//                    aria-orientation="vertical"
//                    className="fixed z-50 min-w-[8rem] w-fit rounded-md border bg-popover p-1 text-popover-foreground shadow-md motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
//                    style={{
//                        top: dropdownPosition.top,
//                        left: dropdownPosition.left,
//                        transform: 'translateY(10px)',
//                    }}
//                >
//                    <div className="flex gap-2">
//                        <div className="flex w-full justify-start gap-2 rounded-md max-sm:[&>*]:flex-1">
//                            <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal">
//                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-500">
//                                    <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z" />
//                                </svg>
//                                Iniciar
//                            </button>
//
//                            <button disabled className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal opacity-50 cursor-not-allowed">
//                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-500">
//                                    <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z" />
//                                </svg>
//                                Reiniciar
//                            </button>
//
//                            <button disabled className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal opacity-50 cursor-not-allowed">
//                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-red-500">
//                                    <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" />
//                                </svg>
//                                Parar
//                            </button>
//                        </div>
//                    </div>
//
//                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//                    <a
//                        href={`/pt-br/dashboard/applications/${appId}`}
//                        role="menuitem"
//                        className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//                    >
//                        Favoritar
//                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//                        </svg>
//                    </a>
//
//                    <a href={`/pt-br/dashboard/applications/${appId}/files`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//                        Arquivos
//                    </a>
//                    <a href={`/pt-br/dashboard/applications/${appId}/settings`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//                        Configurações
//                    </a>
//
//                    <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//                    <button role="menuitem" className="block w-full px-2 py-1.5 text-sm rounded-sm text-red-500 hover:bg-red-900">
//                        Deletar aplicação
//                    </button>
//                </div>
//            )}
//        </div>
//    );
//}
//
//import { useState, useRef, useEffect } from 'react';
//
//export function AppDropdownMenu({ appId }) {
//  const [isOpen, setIsOpen] = useState(false);
//  const menuRef = useRef(null);
//  const triggerRef = useRef(null);
//
//  useEffect(() => {
//    function handleClickOutside(event) {
//      if (
//        menuRef.current &&
//        !menuRef.current.contains(event.target) &&
//        !triggerRef.current.contains(event.target)
//      ) {
//        setIsOpen(false);
//      }
//    }
//    document.addEventListener('mousedown', handleClickOutside);
//    return () => document.removeEventListener('mousedown', handleClickOutside);
//  }, []);
//
//  return (
//    <div className="relative z-50">
//      <button
//        ref={triggerRef}
//        type="button"
//        aria-haspopup="menu"
//        aria-expanded={isOpen}
//        data-state={isOpen ? 'open' : 'closed'}
//        data-slot="dropdown-menu-trigger"
//        onClick={() => setIsOpen((prev) => !prev)}
//        className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//      >
//        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-5">
//          <path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z" />
//        </svg>
//      </button>
//
//      {isOpen && (
//        <div
//          ref={menuRef}
//          role="menu"
//          aria-orientation="vertical"
//          className="absolute right-0 top-full mt-2 w-fit min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-50 motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
//        >
//          <div className="flex gap-2">
//            <div className="flex w-full justify-start gap-2 rounded-md max-sm:[&>*]:flex-1">
//              <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal">
//                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-500">
//                  <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z" />
//                </svg>
//                Iniciar
//              </button>
//
//              <button disabled className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal opacity-50 cursor-not-allowed">
//                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-500">
//                  <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z" />
//                </svg>
//                Reiniciar
//              </button>
//
//              <button disabled className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal opacity-50 cursor-not-allowed">
//                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-red-500">
//                  <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" />
//                </svg>
//                Parar
//              </button>
//            </div>
//          </div>
//
//          <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//          <a
//            href={`/pt-br/dashboard/applications/${appId}`}
//            role="menuitem"
//            className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//          >
//            Favoritar
//            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//            </svg>
//          </a>
//
//          <a href={`/pt-br/dashboard/applications/${appId}/files`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//            Arquivos
//          </a>
//          <a href={`/pt-br/dashboard/applications/${appId}/settings`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//            Configurações
//          </a>
//
//          <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//          <button role="menuitem" className="block w-full px-2 py-1.5 text-sm rounded-sm text-red-500 hover:bg-red-900">
//            Deletar aplicação
//          </button>
//        </div>
//      )}
//    </div>
//  );
//}

//import { useState, useRef, useEffect } from 'react';
//
//export function AppDropdownMenu({ appId }) {
//  const [isOpen, setIsOpen] = useState(false);
//  const menuRef = useRef(null);
//  const triggerRef = useRef(null);
//
//  useEffect(() => {
//    function handleClickOutside(event) {
//      if (
//        menuRef.current &&
//        !menuRef.current.contains(event.target) &&
//        !triggerRef.current.contains(event.target)
//      ) {
//        setIsOpen(false);
//      }
//    }
//    document.addEventListener('mousedown', handleClickOutside);
//    return () => document.removeEventListener('mousedown', handleClickOutside);
//  }, []);
//
//  return (
//    <div className="relative z-50">
//      <button
//        ref={triggerRef}
//        type="button"
//        aria-haspopup="menu"
//        aria-expanded={isOpen}
//        data-state={isOpen ? 'open' : 'closed'}
//        data-slot="dropdown-menu-trigger"
//        onClick={() => setIsOpen((prev) => !prev)}
//        className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//      >
//        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-5">
//          <path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z" />
//        </svg>
//      </button>
//
//      {isOpen && (
//        <div
//          ref={menuRef}
//          role="menu"
//          aria-orientation="vertical"
//          className="absolute right-0 top-full mt-2 w-fit min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-50 motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
//        >
//          <div className="flex gap-2">
//            <div className="flex w-full justify-start gap-2 rounded-md max-sm:[&>*]:flex-1">
//              <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal">
//                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-500">
//                  <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z" />
//                </svg>
//                Iniciar
//              </button>
//
//              <button disabled className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal opacity-50 cursor-not-allowed">
//                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-500">
//                  <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z" />
//                </svg>
//                Reiniciar
//              </button>
//
//              <button disabled className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal opacity-50 cursor-not-allowed">
//                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-red-500">
//                  <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" />
//                </svg>
//                Parar
//              </button>
//            </div>
//          </div>
//
//          <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//          <a
//            href={`/pt-br/dashboard/applications/${appId}`}
//            role="menuitem"
//            className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//          >
//            Favoritar
//            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//            </svg>
//          </a>
//
//          <a href={`/pt-br/dashboard/applications/${appId}/files`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//            Arquivos
//          </a>
//          <a href={`/pt-br/dashboard/applications/${appId}/settings`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//            Configurações
//          </a>
//
//          <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//          <button role="menuitem" className="block w-full px-2 py-1.5 text-sm rounded-sm text-red-500 hover:bg-red-900">
//            Deletar aplicação
//          </button>
//        </div>
//      )}
//    </div>
//  );
//}

//import { useState, useRef, useEffect } from 'react';
//import { createPortal } from 'react-dom';
//
//export function AppDropdownMenu({ appId }) {
//  const [isOpen, setIsOpen] = useState(false);
//  const menuRef = useRef(null);
//
//  useEffect(() => {
//    function handleClickOutside(event) {
//      if (menuRef.current && !menuRef.current.contains(event.target)) {
//        setIsOpen(false);
//      }
//    }
//    document.addEventListener('mousedown', handleClickOutside);
//    return () => document.removeEventListener('mousedown', handleClickOutside);
//  }, []);
//
//  const dropdownContent = (
//    <div
//      ref={menuRef}
//      role="menu"
//      aria-orientation="vertical"
//      className="mt-4 w-fit min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-50 motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
//    >
//      <div className="flex gap-2">
//        <div className="flex w-full justify-start gap-2 rounded-md max-sm:[&>*]:flex-1">
//          <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal">
//            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-500">
//              <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z" />
//            </svg>
//            Iniciar
//          </button>
//
//          <button disabled className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal opacity-50 cursor-not-allowed">
//            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-500">
//              <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z" />
//            </svg>
//            Reiniciar
//          </button>
//
//          <button disabled className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal opacity-50 cursor-not-allowed">
//            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-red-500">
//              <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" />
//            </svg>
//            Parar
//          </button>
//        </div>
//      </div>
//
//      <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//      <a
//        href={`/pt-br/dashboard/applications/${appId}`}
//        role="menuitem"
//        className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//      >
//        Favoritar
//        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//          <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//        </svg>
//      </a>
//
//      <a href={`/pt-br/dashboard/applications/${appId}/files`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//        Arquivos
//      </a>
//      <a href={`/pt-br/dashboard/applications/${appId}/settings`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//        Configurações
//      </a>
//
//      <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//      <button role="menuitem" className="block w-full px-2 py-1.5 text-sm rounded-sm text-red-500 hover:bg-red-900">
//        Deletar aplicação
//      </button>
//    </div>
//  );
//
//  return (
//    <>
//      <div className="relative z-50">
//        <button
//          type="button"
//          aria-haspopup="menu"
//          aria-expanded={isOpen}
//          data-state={isOpen ? 'open' : 'closed'}
//          data-slot="dropdown-menu-trigger"
//          onClick={() => setIsOpen((prev) => !prev)}
//          className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//        >
//          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-5">
//            <path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z" />
//          </svg>
//        </button>
//      </div>
//
//      {isOpen && createPortal(dropdownContent, document.getElementById('dropdown-root'))}
//    </>
//  );
//}

//import { useState, useRef, useEffect } from 'react';
//
//export function AppDropdownMenu({ appId }) {
//  const [isOpen, setIsOpen] = useState(false);
//  const menuRef = useRef(null);
//
//  useEffect(() => {
//    function handleClickOutside(event) {
//      if (menuRef.current && !menuRef.current.contains(event.target)) {
//        setIsOpen(false);
//      }
//    }
//    document.addEventListener('mousedown', handleClickOutside);
//    return () => document.removeEventListener('mousedown', handleClickOutside);
//  }, []);
//
//  return (
//    <div className="relative z-50">
//      <button
//        type="button"
//        aria-haspopup="menu"
//        aria-expanded={isOpen}
//        data-state={isOpen ? 'open' : 'closed'}
//        data-slot="dropdown-menu-trigger"
//        onClick={() => setIsOpen((prev) => !prev)}
//        className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//      >
//        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-5">
//          <path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z" />
//        </svg>
//      </button>
//
//      {isOpen && (
//        <div
//          ref={menuRef}
//          role="menu"
//          aria-orientation="vertical"
//          className="absolute right-0 mt-2 w-fit min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-50 motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300"
//        >
//          <div className="flex gap-2">
//            <div className="flex w-full justify-start gap-2 rounded-md max-sm:[&>*]:flex-1">
//              <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal">
//                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-500">
//                  <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z" />
//                </svg>
//                Iniciar
//              </button>
//
//              <button disabled className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal opacity-50 cursor-not-allowed">
//                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-500">
//                  <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z" />
//                </svg>
//                Reiniciar
//              </button>
//
//              <button disabled className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal opacity-50 cursor-not-allowed">
//                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-red-500">
//                  <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" />
//                </svg>
//                Parar
//              </button>
//            </div>
//          </div>
//
//          <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//          <a
//            href={`/pt-br/dashboard/applications/${appId}`}
//            role="menuitem"
//            className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground"
//          >
//            Favoritar
//            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//            </svg>
//          </a>
//
//          <a href={`/pt-br/dashboard/applications/${appId}/files`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//            Arquivos
//          </a>
//          <a href={`/pt-br/dashboard/applications/${appId}/settings`} className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">
//            Configurações
//          </a>
//
//          <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//          <button role="menuitem" className="block w-full px-2 py-1.5 text-sm rounded-sm text-red-500 hover:bg-red-900">
//            Deletar aplicação
//          </button>
//        </div>
//      )}
//    </div>
//  );
//}

//import { useState, useRef, useEffect } from 'react';
//
//export function AppDropdownMenu() {
//  const [isOpen, setIsOpen] = useState(false);
//  const menuRef = useRef(null);
//
//  // Fecha o menu ao clicar fora
//  useEffect(() => {
//    function handleClickOutside(event) {
//      if (menuRef.current && !menuRef.current.contains(event.target)) {
//        setIsOpen(false);
//      }
//    }
//    document.addEventListener('mousedown', handleClickOutside);
//    return () => document.removeEventListener('mousedown', handleClickOutside);
//  }, []);
//
//  return (
//    <div className="relative z-50">
//      <button
//        type="button"
//        aria-haspopup="menu"
//        aria-expanded={isOpen}
//        aria-controls="app-dropdown-menu"
//        data-state={isOpen ? 'open' : 'closed'}
//        data-slot="dropdown-menu-trigger"
//        onClick={() => setIsOpen((prev) => !prev)}
//        className="flex size-7 cursor-pointer items-center justify-center rounded-md text-virtus-200 hover:bg-virtus-700"
//      >
//        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-5">
//          <path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z" />
//        </svg>
//      </button>
//
//      {isOpen && (
//        <div
//          ref={menuRef}
//          id="app-dropdown-menu"
//          role="menu"
//          aria-orientation="vertical"
//          className="absolute right-0 mt-2 w-fit min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-50 motion-safe:animate-in motion-safe:fade-in"
//        >
//          <div className="flex gap-2">
//            <div className="flex w-full justify-start gap-2 rounded-md max-sm:[&>*]:flex-1">
//              <button className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal">
//                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-500">
//                  <path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z" />
//                </svg>
//                Iniciar
//              </button>
//
//              <button disabled className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal opacity-50 cursor-not-allowed">
//                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-500">
//                  <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z" />
//                </svg>
//                Reiniciar
//              </button>
//
//              <button disabled className="group/button inline-flex items-center justify-center gap-2 rounded-md bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 h-9 px-3 text-sm text-primary font-normal opacity-50 cursor-not-allowed">
//                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-red-500">
//                  <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" />
//                </svg>
//                Parar
//              </button>
//            </div>
//          </div>
//
//          <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//          <a href="/pt-br/dashboard/applications/ID" role="menuitem" className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground">
//            Favoritar
//            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z" />
//            </svg>
//          </a>
//
//          <a href="/pt-br/dashboard/applications/ID" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">Visualizar</a>
//          <a href="/pt-br/dashboard/applications/ID/files" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">Arquivos</a>
//          <a href="/pt-br/dashboard/applications/ID/settings" className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent text-muted-foreground">Configurações</a>
//
//          <div className="-mx-1 my-1 h-px bg-border" role="separator" />
//
//          <button role="menuitem" className="block w-full px-2 py-1.5 text-sm rounded-sm text-red-500 hover:bg-red-900">
//            Deletar aplicação
//          </button>
//        </div>
//      )}
//    </div>
//  );
//}
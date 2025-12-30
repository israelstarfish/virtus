//frontend/src/components/UserDropdownMenu.jsx

'use client';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Link from 'next/link';
import { useState } from 'react';
import { PlanBadge } from '@/components/PlanBadge';
import { planOrder, getPlanTier } from '@/utils/planUtils';

function getNextPlan(currentPlan) {
    const index = planOrder.indexOf(currentPlan);
    return index >= 0 && index < planOrder.length - 1 ? planOrder[index + 1] : null;
}

export function UserDropdownMenu({ username, email, role, plan, lang = 'pt-br', onLogout, loading }) {
    const [open, setOpen] = useState(false);
    const nextPlan = getNextPlan(plan);

    return (
        <DropdownMenu.Root open={open} onOpenChange={setOpen}>
            <DropdownMenu.Trigger asChild>
                <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={open}
                    id="radix-_r_0_"
                    className="group relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 w-full justify-between px-2.5 md:w-fit"
                >
                    <div className="relative flex flex-col items-start gap-0.5">
                        <span className="text-sm leading-none">{username}</span>
                        <span className="text-[10px] text-secondary leading-none group-data-[state=open]:hidden">
                            {email?.replace(/^[^@]+/, '••••••••••••')}
                        </span>
                        <span className="text-[10px] text-secondary leading-none hidden group-data-[state=open]:inline">
                            {email}
                        </span>
                        {loading && (
                            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-md">
                                <div className="absolute -translate-x-full top-0 left-0 h-full w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent blur-[6px]" />
                            </div>
                        )}
                    </div>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                        className={`text-secondary transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
                    >
                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                    </svg>
                </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
                side="bottom"
                align="center"
                id="radix-_r_1_"
                aria-labelledby="radix-_r_0_"
                className="z-50 max-h-[--radix-dropdown-menu-content-available-height] origin-[--radix-dropdown-menu-content-transform-origin] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300 motion-safe:data-[side=bottom]:motion-translate-y-in-[-25px] motion-safe:data-[side=top]:motion-translate-y-in-[25px] motion-safe:data-[side=left]:motion-translate-x-in-[25px] motion-safe:data-[side=right]:motion-translate-x-in-[-25px] group flex w-fit min-w-70 flex-col gap-1"
            >
                <div className="flex flex-col gap-0.5 p-2">
                    <div className="flex items-center justify-between gap-1.5">
                        <span className="font-medium text-xs">{username}</span>
                        <span
                            className="select-none rounded-sm bg-gradient-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] px-1.5 py-0.5 font-medium text-primary text-xs capitalize hover:bg-virtus-800"
                            style={{ '--bg-color': '#000000' }}
                        >
                            <PlanBadge plan={plan} tier={getPlanTier(plan)} />
                        </span>
                    </div>
                    <span className="text-secondary text-xs">{email}</span>
                    <Link
                        href={`/${lang}/pay?state=renew`}
                        className="mt-2 flex items-center gap-1 text-link text-xs"
                    >
                        Renovar Plano
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
                        </svg>
                    </Link>
                </div>

                <div role="separator" className="-mx-1 my-1 h-px bg-border" />

                <div className="flex gap-1">
                    <Link
                        href={`/${lang}/dashboard`}
                        className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground w-full"
                    >
                        Aplicações
                    </Link>
                    <Link
                        href={`/${lang}/upload`}
                        className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 size-8 ring-0! ring-offset-0!"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
                        </svg>
                    </Link>
                </div>
                <Link
                    href={`/${lang}/dashboard/databases`}
                    className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground justify-between"
                >
                    <span className="flex items-center gap-2">Banco de dados</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M196,35.52C177.62,25.51,153.48,20,128,20S78.38,25.51,60,35.52C39.37,46.79,28,62.58,28,80v96c0,17.42,11.37,33.21,32,44.48,18.35,10,42.49,15.52,68,15.52s49.62-5.51,68-15.52c20.66-11.27,32-27.06,32-44.48V80C228,62.58,216.63,46.79,196,35.52ZM204,128c0,17-31.21,36-76,36s-76-19-76-36v-8.46a88.9,88.9,0,0,0,8,4.94c18.35,10,42.49,15.52,68,15.52s49.62-5.51,68-15.52a88.9,88.9,0,0,0,8-4.94ZM128,44c44.79,0,76,19,76,36s-31.21,36-76,36S52,97,52,80,83.21,44,128,44Zm0,168c-44.79,0-76-19-76-36v-8.46a88.9,88.9,0,0,0,8,4.94c18.35,10,42.49,15.52,68,15.52s49.62-5.51,68-15.52a88.9,88.9,0,0,0,8-4.94V176C204,193,172.79,212,128,212Z" />
                    </svg>
                </Link>

                <Link
                    href={`/${lang}/dashboard/snapshots`}
                    className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground justify-between"
                >
                    Snapshots
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M140,80v41.21l34.17,20.5a12,12,0,1,1-12.34,20.58l-40-24A12,12,0,0,1,116,128V80a12,12,0,0,1,24,0ZM128,28A99.38,99.38,0,0,0,57.24,57.34c-4.69,4.74-9,9.37-13.24,14V64a12,12,0,0,0-24,0v40a12,12,0,0,0,12,12H72a12,12,0,0,0,0-24H57.77C63,86,68.37,80.22,74.26,74.26a76,76,0,1,1,1.58,109,12,12,0,0,0-16.48,17.46A100,100,0,1,0,128,28Z" />
                    </svg>
                </Link>

                <Link
                    href={`/${lang}/dashboard/blob`}
                    className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground justify-between"
                >
                    Blob
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M196.49,151.51a12,12,0,0,1-17,17L168,157v51a12,12,0,0,1-24,0V157l-11.51,11.52a12,12,0,1,1-17-17l32-32a12,12,0,0,1,17,0ZM160,36A92.08,92.08,0,0,0,79,84.37,68,68,0,1,0,72,220h28a12,12,0,0,0,0-24H72a44,44,0,0,1-1.81-87.95A91.7,91.7,0,0,0,68,128a12,12,0,0,0,24,0,68,68,0,1,1,132.6,21.29,12,12,0,1,0,22.8,7.51A92.06,92.06,0,0,0,160,36Z" />
                    </svg>
                </Link>

                <Link
                    href={`/${lang}/account`}
                    className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground justify-between"
                >
                    Minha Conta
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M128,76a52,52,0,1,0,52,52A52.06,52.06,0,0,0,128,76Zm0,80a28,28,0,1,1,28-28A28,28,0,0,1,128,156Zm92-27.21v-1.58l14-17.51a12,12,0,0,0,2.23-10.59A111.75,111.75,0,0,0,225,71.89,12,12,0,0,0,215.89,66L193.61,63.5l-1.11-1.11L190,40.1A12,12,0,0,0,184.11,31a111.67,111.67,0,0,0-27.23-11.27A12,12,0,0,0,146.3,22L128.79,36h-1.58L109.7,22a12,12,0,0,0-10.59-2.23A111.75,111.75,0,0,0,71.89,31.05,12,12,0,0,0,66,40.11L63.5,62.39,62.39,63.5,40.1,66A12,12,0,0,0,31,71.89,111.67,111.67,0,0,0,19.77,99.12,12,12,0,0,0,22,109.7l14,17.51v1.58L22,146.3a12,12,0,0,0-2.23,10.59,111.75,111.75,0,0,0,11.29,27.22A12,12,0,0,0,40.11,190l22.28,2.48,1.11,1.11L66,215.9A12,12,0,0,0,71.89,225a111.67,111.67,0,0,0,27.23,11.27A12,12,0,0,0,109.7,234l17.51-14h1.58l17.51,14a12,12,0,0,0,10.59,2.23A111.75,111.75,0,0,0,184.11,225a12,12,0,0,0,5.91-9.06l2.48-22.28,1.11-1.11L215.9,190a12,12,0,0,0,9.06-5.91,111.67,111.67,0,0,0,11.27-27.23A12,12,0,0,0,234,146.3Zm-24.12-4.89a70.1,70.1,0,0,1,0,8.2,12,12,0,0,0,2.61,8.22l12.84,16.05A86.47,86.47,0,0,1,207,166.86l-20.43,2.27a12,12,0,0,0-7.65,4,69,69,0,0,1-5.8,5.8,12,12,0,0,0-4,7.65L166.86,207a86.47,86.47,0,0,1-10.49,4.35l-16.05-12.85a12,12,0,0,0-7.5-2.62c-.24,0-.48,0-.72,0a70.1,70.1,0,0,1-8.2,0,12.06,12.06,0,0,0-8.22,2.6L99.63,211.33A86.47,86.47,0,0,1,89.14,207l-2.27-20.43a12,12,0,0,0-4-7.65,69,69,0,0,1-5.8-5.8,12,12,0,0,0-7.65-4L49,166.86a86.47,86.47,0,0,1-4.35-10.49l12.84-16.05a12,12,0,0,0,2.61-8.22,70.1,70.1,0,0,1,0-8.2,12,12,0,0,0-2.61-8.22L44.67,99.63A86.47,86.47,0,0,1,49,89.14l20.43-2.27a12,12,0,0,0,7.65-4,69,69,0,0,1,5.8-5.8,12,12,0,0,0,4-7.65L89.14,49a86.47,86.47,0,0,1,10.49-4.35l16.05,12.85a12.06,12.06,0,0,0,8.22,2.6,70.1,70.1,0,0,1,8.2,0,12,12,0,0,0,8.22-2.6l16.05-12.85A86.47,86.47,0,0,1,166.86,49l2.27,20.43a12,12,0,0,0,4,7.65,69,69,0,0,1,5.8,5.8,12,12,0,0,0,7.65,4L207,89.14a86.47,86.47,0,0,1,4.35,10.49l-12.84,16.05A12,12,0,0,0,195.88,123.9Z" />
                    </svg>
                </Link>

                {nextPlan && (
                    <>
                        <div role="separator" className="-mx-1 my-1 h-px bg-border" />
                        <div role="menuitem" className="w-full">
                            <button
                                className="group/button relative inline-flex min-w-fit shrink-0 items-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 h-10 px-4 justify-center bg-[rgba(var(--bg-color),0.25)] text-primary hover:bg-[rgba(var(--bg-color),0.375)] w-full"
                                style={{ '--bg-color': '52,78,212' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-black/1 to-black/50" />
                                <span className="z-1">Evoluir para {nextPlan.charAt(0).toUpperCase() + nextPlan.slice(1)}</span>
                                <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
                            </button>
                        </div>
                    </>
                )}
                <div role="separator" className="-mx-1 my-1 h-px bg-border" />
                <DropdownMenu.Item asChild>
                    <button
                        onClick={onLogout}
                        className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground text-red-500 hover:bg-red-500/10 w-full justify-between"
                    >
                        Encerrar sessão
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 256 256"
                            className="size-4"
                        >
                            <path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z" />
                        </svg>
                    </button>
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
}


//frontend/src/components/UserDropdownMenu.jsx

//'use client';
//import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
//import Link from 'next/link';
//import { useState } from 'react';
//import { PlanBadge } from '@/components/PlanBadge';
//import { planOrder, getPlanTier } from '@/utils/planUtils';
//
//function getNextPlan(currentPlan) {
//  const index = planOrder.indexOf(currentPlan);
//  return index >= 0 && index < planOrder.length - 1 ? planOrder[index + 1] : null;
//}
//
//export function UserDropdownMenu({ username, email, role, plan, lang = 'pt-br', onLogout, loading }) {
//  const [open, setOpen] = useState(false);
//  const nextPlan = getNextPlan(plan);
//
//  return (
//    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
//      <DropdownMenu.Trigger asChild>
//        <button
//          type="button"
//          aria-haspopup="menu"
//          aria-expanded={open}
//          id="radix-_r_0_"
//          className="group relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 w-full justify-between px-2.5 md:w-fit"
//        >
//          <div className="relative flex flex-col items-start gap-0.5">
//            <span className="text-sm leading-none">{username}</span>
//            <span className="text-[10px] text-secondary leading-none group-data-[state=open]:hidden">
//              {email?.replace(/^[^@]+/, '••••••••••••')}
//            </span>
//            <span className="text-[10px] text-secondary leading-none hidden group-data-[state=open]:inline">
//              {email}
//            </span>
//            {loading && (
//              <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-md">
//                <div className="absolute -translate-x-full top-0 left-0 h-full w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent blur-[6px]" />
//              </div>
//            )}
//          </div>
//          <svg
//            xmlns="http://www.w3.org/2000/svg"
//            width="20"
//            height="20"
//            fill="currentColor"
//            viewBox="0 0 256 256"
//            className={`text-secondary transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
//          >
//            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//          </svg>
//        </button>
//      </DropdownMenu.Trigger>
//            <DropdownMenu.Content
//        side="bottom"
//        align="center"
//        id="radix-_r_1_"
//        aria-labelledby="radix-_r_0_"
//        className="z-50 max-h-[--radix-dropdown-menu-content-available-height] origin-[--radix-dropdown-menu-content-transform-origin] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md motion-safe:motion-scale-in-95 motion-opacity-in-0 motion-duration-300 motion-safe:data-[side=bottom]:motion-translate-y-in-[-25px] motion-safe:data-[side=top]:motion-translate-y-in-[25px] motion-safe:data-[side=left]:motion-translate-x-in-[25px] motion-safe:data-[side=right]:motion-translate-x-in-[-25px] group flex w-fit min-w-70 flex-col gap-1"
//      >
//        <div className="flex flex-col gap-0.5 p-2">
//          <div className="flex items-center justify-between gap-1.5">
//            <span className="font-medium text-xs">{username}</span>
//            <span
//              className="select-none rounded-sm bg-gradient-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] px-1.5 py-0.5 font-medium text-primary text-xs capitalize hover:bg-virtus-800"
//              style={{ '--bg-color': '#000000' }}
//            >
//              <PlanBadge plan={plan} tier={getPlanTier(plan)} />
//            </span>
//          </div>
//          <span className="text-secondary text-xs">{email}</span>
//          <Link
//            href={`/${lang}/pay?state=renew`}
//            className="mt-2 flex items-center gap-1 text-link text-xs"
//          >
//            Renovar Plano
//            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//            </svg>
//          </Link>
//        </div>
//
//        <div role="separator" className="-mx-1 my-1 h-px bg-border" />
//
//        <div className="flex gap-1">
//          <Link
//            href={`/${lang}/dashboard`}
//            className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground w-full"
//          >
//            Aplicações
//          </Link>
//          <Link
//            href={`/${lang}/upload`}
//            className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 size-8 ring-0! ring-offset-0!"
//          >
//            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
//            </svg>
//          </Link>
//        </div>
//                <Link
//          href={`/${lang}/dashboard/databases`}
//          className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground justify-between"
//        >
//          <span className="flex items-center gap-2">Banco de dados</span>
//          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//            <path d="M196,35.52C177.62,25.51,153.48,20,128,20S78.38,25.51,60,35.52..." />
//          </svg>
//        </Link>
//
//        <Link
//          href={`/${lang}/dashboard/snapshots`}
//          className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground justify-between"
//        >
//          Snapshots
//          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//            <path d="M140,80v41.21l34.17,20.5a12,12,0,1,1-12.34,20.58..." />
//          </svg>
//        </Link>
//
//        <Link
//          href={`/${lang}/dashboard/blob`}
//          className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground justify-between"
//        >
//          Blob
//          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//            <path d="M196.49,151.51a12,12,0,0,1-17,17L168,157v51a12,12,0,0,1-24,0V157l-11.51,11.52a12,12,0,1,1-17-17l32-32a12,12,0,0,1,17,0Z" />
//          </svg>
//        </Link>
//
//        <Link
//          href={`/${lang}/account`}
//          className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground justify-between"
//        >
//          Minha Conta
//          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//            <path d="M128,76a52,52,0,1,0,52,52A52.06,52.06,0,0,0,128,76Z..." />
//          </svg>
//        </Link>
//
//        {nextPlan && (
//          <>
//            <div role="separator" className="-mx-1 my-1 h-px bg-border" />
//            <div role="menuitem" className="w-full">
//              <button
//                className="group/button relative inline-flex min-w-fit shrink-0 items-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 h-10 px-4 justify-center bg-[rgba(var(--bg-color),0.25)] text-primary hover:bg-[rgba(var(--bg-color),0.375)] w-full"
//                style={{ '--bg-color': '52,78,212' }}
//              >
//                <div className="absolute inset-0 bg-gradient-to-b from-black/1 to-black/50" />
//                <span className="z-1">Evoluir para {nextPlan.charAt(0).toUpperCase() + nextPlan.slice(1)}</span>
//                <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//              </button>
//            </div>
//          </>
//        )}
//                <div role="separator" className="-mx-1 my-1 h-px bg-border" />
//        <DropdownMenu.Item asChild>
//          <button
//            onClick={onLogout}
//            className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground text-red-500 hover:bg-red-500/10 w-full justify-between"
//          >
//            Encerrar sessão
//            <svg
//              xmlns="http://www.w3.org/2000/svg"
//              width="16"
//              height="16"
//              fill="currentColor"
//              viewBox="0 0 256 256"
//              className="size-4"
//            >
//              <path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z" />
//            </svg>
//          </button>
//        </DropdownMenu.Item>
//      </DropdownMenu.Content>
//    </DropdownMenu.Root>
//  );
//}

//frontend/src/components/UserDropdownMenu.jsx

//'use client';
//import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
//import Link from 'next/link';
//import { useState } from 'react';
//import { PlanBadge } from '@/components/PlanBadge';
//import { planOrder, getPlanTier } from '@/utils/planUtils';
//
//function getNextPlan(currentPlan) {
//    const index = planOrder.indexOf(currentPlan);
//    return index >= 0 && index < planOrder.length - 1 ? planOrder[index + 1] : null;
//}
//
//export function UserDropdownMenu({ username, email, role, plan, lang = 'pt-br', onLogout, loading }) {
//    const [open, setOpen] = useState(false);
//    const nextPlan = getNextPlan(plan);
//
//    return (
//        <DropdownMenu.Root open={open} onOpenChange={setOpen}>
//            <DropdownMenu.Trigger asChild>
//                <button
//                    type="button"
//                    aria-haspopup="menu"
//                    aria-expanded={open}
//                    id="radix-_r_0_"
//                    className="group relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 w-full justify-between px-2.5 md:w-fit"
//                >
//                    <div className="relative flex flex-col items-start gap-0.5">
//                        <span className="text-sm leading-none">{username}</span>
//                        <span
//                            className="text-[10px] text-secondary leading-none group-data-[state=open]:hidden"
//                        >
//                            {email?.replace(/^[^@]+/, '••••••••••••')}
//                        </span>
//                        <span
//                            className="text-[10px] text-secondary leading-none hidden group-data-[state=open]:inline"
//                        >
//                            {email}
//                        </span>
//
//                        {loading && (
//                            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-md">
//                                <div className="absolute -translate-x-full top-0 left-0 h-full w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent blur-[6px]" />
//                            </div>
//                        )}
//                    </div>
//                    <svg
//                        xmlns="http://www.w3.org/2000/svg"
//                        width="20"
//                        height="20"
//                        fill="currentColor"
//                        viewBox="0 0 256 256"
//                        className={`text-secondary transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
//                    >
//                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                    </svg>
//                </button>
//            </DropdownMenu.Trigger>
//
//            <DropdownMenu.Content
//                side="bottom"
//                align="center"
//                id="radix-_r_1_"
//                aria-labelledby="radix-_r_0_"
//                className="z-600 overflow-hidden rounded-md border border-virtus-600 bg-background p-2 text-white shadow-md motion-scale-in-95 motion-opacity-in-[0%] motion-translate-x-in-[0%] motion-translate-y-in-[-25px] motion-duration-300 motion-duration-[0.25s]/opacity group flex w-fit min-w-70 flex-col gap-1"
//            >
//                {/* Perfil */}
//                <div className="flex flex-col gap-0.5 p-2">
//                    <div className="flex items-center justify-between gap-1.5">
//                        <span className="font-medium text-xs">{username}</span>
//                        <PlanBadge plan={plan} tier={getPlanTier(plan)} />
//                    </div>
//                    <span className="text-secondary text-xs">{email}</span>
//                    <Link href={`/${lang}/pay?state=renew`} className="mt-2 flex items-center gap-1 text-link text-xs">
//                        Renovar Plano
//                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                        </svg>
//                    </Link>
//                </div>
//
//                <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//
//                {/* Links */}
//                <div className="flex gap-1">
//                    <Link href={`/${lang}/dashboard`} className="menu-item w-full">Aplicações</Link>
//                    <Link href={`/${lang}/upload`} className="menu-icon-button">
//                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
//                        </svg>
//                    </Link>
//                </div>
//
//                <Link href={`/${lang}/dashboard/databases`} className="menu-item-icon justify-between">
//                    <span className="flex items-center gap-2">Banco de dados</span>
//                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M196,35.52C177.62,25.51,153.48,20,128,20S78.38,25.51,60,35.52..." />
//                    </svg>
//                </Link>
//
//                <Link href={`/${lang}/dashboard/snapshots`} className="menu-item-icon justify-between">
//                    Snapshots
//                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M140,80v41.21l34.17,20.5a12,12,0,1,1-12.34,20.58..." />
//                    </svg>
//                </Link>
//
//                <Link href={`/${lang}/account`} className="menu-item-icon justify-between">
//                    Configurações
//                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M128,76a52,52,0,1,0,52,52A52.06,52.06,0,0,0,128,76Z..." />
//                    </svg>
//                </Link>
//
//                {/* Upgrade */}
//                {nextPlan && (
//                    <>
//                        <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//                        <DropdownMenu.Item asChild>
//                            <Link
//                                href={`/${lang}/pay?upgrade=${nextPlan}`}
//                                className="group/button relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background h-10 px-4 justify-center bg-[rgba(var(--bg-color),0.25)] text-primary hover:bg-[rgba(var(--bg-color),0.375)] w-full relative"
//                                style={{ '--bg-color': '52,78,212' }}
//                            >
//                                <div className="absolute inset-0 bg-gradient-to-b from-black/1 to-black/50" />
//                                <span className="z-1">Evoluir para {nextPlan.charAt(0).toUpperCase() + nextPlan.slice(1)}</span>
//                                <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//                            </Link>
//                        </DropdownMenu.Item>
//                    </>
//                )}
//
//                <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//
//                {/* Logout */}
//                <DropdownMenu.Item asChild>
//                    <button
//                        onClick={onLogout}
//                        className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-red-500/10 text-red-500 w-full justify-between"
//                    >
//                        Encerrar sessão
//                        <svg
//                            xmlns="http://www.w3.org/2000/svg"
//                            width="16"
//                            height="16"
//                            fill="currentColor"
//                            viewBox="0 0 256 256"
//                            className="size-4"
//                        >
//                            <path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z" />
//                        </svg>
//                    </button>
//                </DropdownMenu.Item>
//            </DropdownMenu.Content>
//        </DropdownMenu.Root>
//    );
//}

//frontend/src/components/UserDropdownMenu.jsx

//'use client';
//import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
//import Link from 'next/link';
//import { useState } from 'react';
//import { PlanBadge } from '@/components/PlanBadge';
//import { planOrder, getPlanTier } from '@/utils/planUtils';
//
//function getNextPlan(currentPlan) {
//    const index = planOrder.indexOf(currentPlan);
//    return index >= 0 && index < planOrder.length - 1 ? planOrder[index + 1] : null;
//}
//
//export function UserDropdownMenu({ username, email, role, plan, lang = 'pt-br', onLogout, loading }) {
//    const [open, setOpen] = useState(false);
//    const nextPlan = getNextPlan(plan);
//
//    return (
//        <DropdownMenu.Root open={open} onOpenChange={setOpen}>
//            <DropdownMenu.Trigger asChild>
//                <button
//                    type="button"
//                    aria-haspopup="menu"
//                    aria-expanded={open}
//                    id="radix-_r_0_"
//                    className="group relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 w-full justify-between px-2.5 md:w-fit"
//                >
//                    <div className="relative flex flex-col items-start gap-0.5">
//                        <span className="text-sm leading-none">{username}</span>
//                        <span
//                            className="text-[10px] text-secondary leading-none group-data-[state=open]:hidden"
//                        >
//                            {email?.replace(/^[^@]+/, '••••••••••••')}
//                        </span>
//                        <span
//                            className="text-[10px] text-secondary leading-none hidden group-data-[state=open]:inline"
//                        >
//                            {email}
//                        </span>
//
//                        {loading && (
//                            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-md">
//                                <div className="absolute -translate-x-full top-0 left-0 h-full w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent blur-[6px]" />
//                            </div>
//                        )}
//                    </div>
//                    <svg
//                        xmlns="http://www.w3.org/2000/svg"
//                        width="20"
//                        height="20"
//                        fill="currentColor"
//                        viewBox="0 0 256 256"
//                        className={`text-secondary transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
//                    >
//                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                    </svg>
//                </button>
//            </DropdownMenu.Trigger>
//
//            <DropdownMenu.Content
//                side="bottom"
//                align="center"
//                id="radix-_r_1_"
//                aria-labelledby="radix-_r_0_"
//                className="z-600 overflow-hidden rounded-md border border-virtus-600 bg-background p-2 text-white shadow-md motion-scale-in-95 motion-opacity-in-[0%] motion-translate-x-in-[0%] motion-translate-y-in-[-25px] motion-duration-300 motion-duration-[0.25s]/opacity group flex w-fit min-w-70 flex-col gap-1"
//            >
//                {/* Perfil */}
//                <div className="flex flex-col gap-0.5 p-2">
//                    <div className="flex items-center justify-between gap-1.5">
//                        <span className="font-medium text-xs">{username}</span>
//                        <PlanBadge plan={plan} tier={getPlanTier(plan)} />
//                    </div>
//                    <span className="text-secondary text-xs">{email}</span>
//                    <Link href={`/${lang}/pay?state=renew`} className="mt-2 flex items-center gap-1 text-link text-xs">
//                        Renovar Plano
//                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                        </svg>
//                    </Link>
//                </div>
//
//                <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//
//                {/* Links */}
//                <div className="flex gap-1">
//                    <Link href={`/${lang}/dashboard`} className="menu-item w-full">Aplicações</Link>
//                    <Link href={`/${lang}/upload`} className="menu-icon-button">
//                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
//                        </svg>
//                    </Link>
//                </div>
//
//                <Link href={`/${lang}/dashboard/databases`} className="menu-item-icon justify-between">
//                    <span className="flex items-center gap-2">Banco de dados</span>
//                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M196,35.52C177.62,25.51,153.48,20,128,20S78.38,25.51,60,35.52..." />
//                    </svg>
//                </Link>
//
//                <Link href={`/${lang}/dashboard/snapshots`} className="menu-item-icon justify-between">
//                    Snapshots
//                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M140,80v41.21l34.17,20.5a12,12,0,1,1-12.34,20.58..." />
//                    </svg>
//                </Link>
//
//                <Link href={`/${lang}/account`} className="menu-item-icon justify-between">
//                    Configurações
//                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M128,76a52,52,0,1,0,52,52A52.06,52.06,0,0,0,128,76Z..." />
//                    </svg>
//                </Link>
//
//                {/* Upgrade */}
//                {nextPlan && (
//                    <>
//                        <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//                        <DropdownMenu.Item asChild>
//                            <Link
//                                href={`/${lang}/pay?upgrade=${nextPlan}`}
//                                className="group/button relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background h-10 px-4 justify-center bg-[rgba(var(--bg-color),0.25)] text-primary hover:bg-[rgba(var(--bg-color),0.375)] w-full relative"
//                                style={{ '--bg-color': '52,78,212' }}
//                            >
//                                <div className="absolute inset-0 bg-gradient-to-b from-black/1 to-black/50" />
//                                <span className="z-1">Evoluir para {nextPlan.charAt(0).toUpperCase() + nextPlan.slice(1)}</span>
//                                <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//                            </Link>
//                        </DropdownMenu.Item>
//                    </>
//                )}
//
//                <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//
//                {/* Logout */}
//                <DropdownMenu.Item asChild>
//                    <button
//                        onClick={onLogout}
//                        className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-red-500/10 text-red-500 w-full justify-between"
//                    >
//                        Encerrar sessão
//                        <svg
//                            xmlns="http://www.w3.org/2000/svg"
//                            width="16"
//                            height="16"
//                            fill="currentColor"
//                            viewBox="0 0 256 256"
//                            className="size-4"
//                        >
//                            <path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z" />
//                        </svg>
//                    </button>
//                </DropdownMenu.Item>
//            </DropdownMenu.Content>
//        </DropdownMenu.Root>
//    );
//}

//frontend/src/components/UserDropdownMenu.jsx

//'use client';
//import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
//import Link from 'next/link';
//import { useState } from 'react';
//import { PlanBadge } from '@/components/PlanBadge';
//import { planOrder, getPlanTier } from '@/utils/planUtils';
//
//function getNextPlan(currentPlan) {
//    const index = planOrder.indexOf(currentPlan);
//    return index >= 0 && index < planOrder.length - 1 ? planOrder[index + 1] : null;
//}
//
//export function UserDropdownMenu({ username, email, role, plan, lang = 'pt-br', onLogout, loading }) {
//    const [open, setOpen] = useState(false);
//    const nextPlan = getNextPlan(plan);
//
//    return (
//        <DropdownMenu.Root open={open} onOpenChange={setOpen}>
//            <DropdownMenu.Trigger asChild>
//                <button
//                    type="button"
//                    aria-haspopup="menu"
//                    aria-expanded={open}
//                    id="radix-_r_0_"
//                    className="group relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 w-full justify-between px-2.5 md:w-fit"
//                >
//                    <div className="relative flex flex-col items-start gap-0.5">
//                        <span className="text-sm leading-none">{username}</span>
//                        <span className="text-[10px] text-secondary leading-none">
//                            {email?.replace(/(.{3}).+(@.+)/, '$1••••••••••••$2')}
//                        </span>
//
//                        {loading && (
//                            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-md">
//                                <div className="absolute -translate-x-full top-0 left-0 h-full w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent blur-[6px]" />
//                            </div>
//                        )}
//                    </div>
//                    <svg
//                        xmlns="http://www.w3.org/2000/svg"
//                        width="20"
//                        height="20"
//                        fill="currentColor"
//                        viewBox="0 0 256 256"
//                        className={`text-secondary transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
//                    >
//                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                    </svg>
//                </button>
//            </DropdownMenu.Trigger>
//
//            <DropdownMenu.Content
//                side="bottom"
//                align="center"
//                id="radix-_r_1_"
//                aria-labelledby="radix-_r_0_"
//                className="z-600 overflow-hidden rounded-md border border-virtus-600 bg-background p-2 text-white shadow-md motion-scale-in-95 motion-opacity-in-[0%] motion-translate-x-in-[0%] motion-translate-y-in-[-25px] motion-duration-300 motion-duration-[0.25s]/opacity group flex w-fit min-w-70 flex-col gap-1"
//            >
//                {/* Perfil */}
//                <div className="flex flex-col gap-0.5 p-2">
//                    <div className="flex items-center justify-between gap-1.5">
//                        <span className="font-medium text-xs">{username}</span>
//                        <PlanBadge plan={plan} tier={getPlanTier(plan)} />
//                    </div>
//                    <span className="text-secondary text-xs">{email}</span>
//                    <Link href={`/${lang}/pay?state=renew`} className="mt-2 flex items-center gap-1 text-link text-xs">
//                        Renovar Plano
//                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                        </svg>
//                    </Link>
//                </div>
//
//                <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//
//                {/* Links */}
//                <div className="flex gap-1">
//                    <Link href={`/${lang}/dashboard`} className="menu-item w-full">Aplicações</Link>
//                    <Link href={`/${lang}/upload`} className="menu-icon-button">
//                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
//                        </svg>
//                    </Link>
//                </div>
//
//                <Link href={`/${lang}/dashboard/databases`} className="menu-item-icon justify-between">
//                    <span className="flex items-center gap-2">Banco de dados</span>
//                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M196,35.52C177.62,25.51,153.48,20,128,20S78.38,25.51,60,35.52..." />
//                    </svg>
//                </Link>
//
//                <Link href={`/${lang}/dashboard/snapshots`} className="menu-item-icon justify-between">
//                    Snapshots
//                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M140,80v41.21l34.17,20.5a12,12,0,1,1-12.34,20.58..." />
//                    </svg>
//                </Link>
//
//                <Link href={`/${lang}/account`} className="menu-item-icon justify-between">
//                    Configurações
//                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M128,76a52,52,0,1,0,52,52A52.06,52.06,0,0,0,128,76Z..." />
//                    </svg>
//                </Link>
//
//                {/* Upgrade */}
//                {nextPlan && (
//                    <>
//                        <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//                        <DropdownMenu.Item asChild>
//                            <Link
//                                href={`/${lang}/pay?upgrade=${nextPlan}`}
//                                className="group/button relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 focus-visible:ring-offset-background h-10 px-4 justify-center bg-[rgba(var(--bg-color),0.25)] text-primary hover:bg-[rgba(var(--bg-color),0.375)] w-full relative"
//                                style={{ '--bg-color': '52,78,212' }}
//                            >
//                                <div className="absolute inset-0 bg-gradient-to-b from-black/1 to-black/50" />
//                                <span className="z-1">Evoluir para {nextPlan.charAt(0).toUpperCase() + nextPlan.slice(1)}</span>
//                                <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//                            </Link>
//                        </DropdownMenu.Item>
//                    </>
//                )}
//
//                <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//
//                {/* Logout */}
//                <DropdownMenu.Item asChild>
//                    <button
//                        onClick={onLogout}
//                        className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-red-500/10 text-red-500 w-full justify-between"
//                    >
//                        Encerrar sessão
//                        <svg
//                            xmlns="http://www.w3.org/2000/svg"
//                            width="16"
//                            height="16"
//                            fill="currentColor"
//                            viewBox="0 0 256 256"
//                            className="size-4"
//                        >
//                            <path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z" />
//                        </svg>
//                    </button>
//                </DropdownMenu.Item>
//            </DropdownMenu.Content>
//        </DropdownMenu.Root>
//    );
//}

//frontend/src/components/UserDropdownMenu.jsx

//'use client';
//import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
//import Link from 'next/link';
//import { useState } from 'react';
//import { PlanBadge } from '@/components/PlanBadge';
//
//const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//
//function getNextPlan(currentPlan) {
//    const index = planOrder.indexOf(currentPlan);
//    return index >= 0 && index < planOrder.length - 1 ? planOrder[index + 1] : null;
//}
//
//export function UserDropdownMenu({ username, email, role, plan, lang = 'pt-br', onLogout, loading }) {
//    const [open, setOpen] = useState(false);
//    const nextPlan = getNextPlan(plan);
//    const tier = ['basic', 'pro', 'premium', 'enterprise'].indexOf(plan) + 1;
//
//    //console.log('Plano atual:', plan);
//
//    return (
//        <DropdownMenu.Root open={open} onOpenChange={setOpen}>
//            <DropdownMenu.Trigger asChild>
//                <button
//                    type="button"
//                    aria-haspopup="menu"
//                    aria-expanded={open}
//                    id="radix-_r_0_"
//                    className="group relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 w-full justify-between px-2.5 md:w-fit"
//                >
//                    <div className="relative flex flex-col items-start gap-0.5">
//                        <span className="text-sm leading-none">{username}</span>
//                        <span className="text-[10px] text-secondary leading-none">
//                            {email?.replace(/(.{3}).+(@.+)/, '$1••••••••••••$2')}
//                        </span>
//
//                        {loading && (
//                            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-md">
//                                <div className="absolute -translate-x-full top-0 left-0 h-full w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent blur-[6px]" />
//                            </div>
//                        )}
//                    </div>
//                    <svg
//                        xmlns="http://www.w3.org/2000/svg"
//                        width="20"
//                        height="20"
//                        fill="currentColor"
//                        viewBox="0 0 256 256"
//                        className={`text-secondary transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
//                    >
//                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                    </svg>
//                </button>
//            </DropdownMenu.Trigger>
//
//            <DropdownMenu.Content
//                side="bottom"
//                align="center"
//                id="radix-_r_1_"
//                aria-labelledby="radix-_r_0_"
//                className="z-600 overflow-hidden rounded-md border border-virtus-600 bg-background p-2 text-white shadow-md motion-scale-in-95 motion-opacity-in-[0%] motion-translate-x-in-[0%] motion-translate-y-in-[-25px] motion-duration-300 motion-duration-[0.25s]/opacity group flex w-fit min-w-70 flex-col gap-1"
//            >
//                {/* Perfil */}
//                <div className="flex flex-col gap-0.5 p-2">
//                    <div className="flex items-center justify-between gap-1.5">
//                        <span className="font-medium text-xs">{username}</span>
//                        <PlanBadge plan={plan} tier={tier} />
//                    </div>
//                    <span className="text-secondary text-xs">{email}</span>
//                    <Link href={`/${lang}/pay?state=renew`} className="mt-2 flex items-center gap-1 text-link text-xs">
//                        Renovar Plano
//                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                        </svg>
//                    </Link>
//                </div>
//
//                <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//
//                {/* Links */}
//                <div className="flex gap-1">
//                    <Link href={`/${lang}/dashboard`} className="menu-item w-full">Aplicações</Link>
//                    <Link href={`/${lang}/upload`} className="menu-icon-button">
//                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
//                        </svg>
//                    </Link>
//                </div>
//
//                <Link href={`/${lang}/dashboard/databases`} className="menu-item-icon justify-between">
//                    <span className="flex items-center gap-2">Banco de dados</span>
//                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M196,35.52C177.62,25.51,153.48,20,128,20S78.38,25.51,60,35.52..." />
//                    </svg>
//                </Link>
//
//                <Link href={`/${lang}/dashboard/snapshots`} className="menu-item-icon justify-between">
//                    Snapshots
//                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M140,80v41.21l34.17,20.5a12,12,0,1,1-12.34,20.58..." />
//                    </svg>
//                </Link>
//
//                <Link href={`/${lang}/account`} className="menu-item-icon justify-between">
//                    Configurações
//                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M128,76a52,52,0,1,0,52,52A52.06,52.06,0,0,0,128,76Z..." />
//                    </svg>
//                </Link>
//
//                {/* Upgrade */}
//                {nextPlan && (
//                    <>
//                        <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//                        <DropdownMenu.Item asChild>
//                            <Link
//                                href={`/${lang}/pay?upgrade=${nextPlan}`}
//                                className="group/button relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 focus-visible:ring-offset-background h-10 px-4 justify-center bg-[rgba(var(--bg-color),0.25)] text-primary hover:bg-[rgba(var(--bg-color),0.375)] w-full relative"
//                                style={{ '--bg-color': '52,78,212' }}
//                            >
//                                <div className="absolute inset-0 bg-gradient-to-b from-black/1 to-black/50" />
//                                <span className="z-1">Evoluir para {nextPlan.charAt(0).toUpperCase() + nextPlan.slice(1)}</span>
//                                <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//                            </Link>
//                        </DropdownMenu.Item>
//                    </>
//                )}
//
//                <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//
//                {/* Logout */}
//                <DropdownMenu.Item asChild>
//                    <button
//                        onClick={onLogout}
//                        className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-red-500/10 text-red-500 w-full justify-between"
//                    >
//                        Encerrar sessão
//                        <svg
//                            xmlns="http://www.w3.org/2000/svg"
//                            width="16"
//                            height="16"
//                            fill="currentColor"
//                            viewBox="0 0 256 256"
//                            className="size-4"
//                        >
//                            <path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z" />
//                        </svg>
//                    </button>
//                </DropdownMenu.Item>
//            </DropdownMenu.Content>
//        </DropdownMenu.Root>
//    );
//}

//frontend/src/components/UserDropdownMenu.jsx

//'use client';
//import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
//import Link from 'next/link';
//import { useState } from 'react';
//import { PlanBadge } from '@/components/PlanBadge';
//
//const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//
//function getNextPlan(currentPlan) {
//    const index = planOrder.indexOf(currentPlan);
//    return index >= 0 && index < planOrder.length - 1 ? planOrder[index + 1] : null;
//}
//
//export function UserDropdownMenu({ username, email, role, plan, lang = 'pt-br', onLogout }) {
//    const [open, setOpen] = useState(false);
//    const nextPlan = getNextPlan(plan);
//    const tier = ['basic', 'pro', 'premium', 'enterprise'].indexOf(plan) + 1;
//    
//    //console.log('Plano atual:', plan);
//
//    return (
//        <DropdownMenu.Root open={open} onOpenChange={setOpen}>
//            <DropdownMenu.Trigger asChild>
//                <button
//                    type="button"
//                    aria-haspopup="menu"
//                    aria-expanded={open}
//                    id="radix-_r_0_"
//                    className="group relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 w-full justify-between px-2.5 md:w-fit"
//                >
//                    <div className="flex flex-col items-start gap-0.5">
//                        <span className="text-sm leading-none">{username}</span>
//                        <span className="text-[10px] text-secondary leading-none">
//                            {email?.replace(/(.{3}).+(@.+)/, '$1••••••••••••$2')}
//                        </span>
//                    </div>
//                    <svg
//                        xmlns="http://www.w3.org/2000/svg"
//                        width="20"
//                        height="20"
//                        fill="currentColor"
//                        viewBox="0 0 256 256"
//                        className={`text-secondary transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
//                    >
//                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                    </svg>
//                </button>
//            </DropdownMenu.Trigger>
//
//            <DropdownMenu.Content
//                side="bottom"
//                align="center"
//                id="radix-_r_1_"
//                aria-labelledby="radix-_r_0_"
//                className="z-600 overflow-hidden rounded-md border border-virtus-600 bg-background p-2 text-white shadow-md motion-scale-in-95 motion-opacity-in-[0%] motion-translate-x-in-[0%] motion-translate-y-in-[-25px] motion-duration-300 motion-duration-[0.25s]/opacity group flex w-fit min-w-70 flex-col gap-1"
//            >
//                {/* Perfil */}
//                <div className="flex flex-col gap-0.5 p-2">
//                    <div className="flex items-center justify-between gap-1.5">
//                        <span className="font-medium text-xs">{username}</span>
//                        <PlanBadge plan={plan} tier={tier} />
//                    </div>
//                    <span className="text-secondary text-xs">{email}</span>
//                    <Link href={`/${lang}/pay?state=renew`} className="mt-2 flex items-center gap-1 text-link text-xs">
//                        Renovar Plano
//                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                        </svg>
//                    </Link>
//                </div>
//
//                <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//
//                {/* Links */}
//                <div className="flex gap-1">
//                    <Link href={`/${lang}/dashboard`} className="menu-item w-full">Aplicações</Link>
//                    <Link href={`/${lang}/upload`} className="menu-icon-button">
//                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
//                        </svg>
//                    </Link>
//                </div>
//
//                <Link href={`/${lang}/dashboard/databases`} className="menu-item-icon justify-between">
//                    <span className="flex items-center gap-2">Banco de dados</span>
//                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M196,35.52C177.62,25.51,153.48,20,128,20S78.38,25.51,60,35.52..." />
//                    </svg>
//                </Link>
//
//                <Link href={`/${lang}/dashboard/snapshots`} className="menu-item-icon justify-between">
//                    Snapshots
//                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M140,80v41.21l34.17,20.5a12,12,0,1,1-12.34,20.58..." />
//                    </svg>
//                </Link>
//
//                <Link href={`/${lang}/account`} className="menu-item-icon justify-between">
//                    Configurações
//                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                        <path d="M128,76a52,52,0,1,0,52,52A52.06,52.06,0,0,0,128,76Z..." />
//                    </svg>
//                </Link>
//
//                {/* Upgrade */}
//                {nextPlan && (
//                    <>
//                        <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//                        <DropdownMenu.Item asChild>
//                            <Link
//                                href={`/${lang}/pay?upgrade=${nextPlan}`}
//                                className="group/button relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 focus-visible:ring-offset-background h-10 px-4 justify-center bg-[rgba(var(--bg-color),0.25)] text-primary hover:bg-[rgba(var(--bg-color),0.375)] w-full relative"
//                                style={{ '--bg-color': '52,78,212' }}
//                            >
//                                <div className="absolute inset-0 bg-gradient-to-b from-black/1 to-black/50" />
//                                <span className="z-1">Evoluir para {nextPlan.charAt(0).toUpperCase() + nextPlan.slice(1)}</span>
//                                <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//                            </Link>
//                        </DropdownMenu.Item>
//                    </>
//                )}
//
//                <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//
//                {/* Logout */}
//                <DropdownMenu.Item asChild>
//                    <button
//                        onClick={onLogout}
//                        className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-red-500/10 text-red-500 w-full justify-between"
//                    >
//                        Encerrar sessão
//                        <svg
//                            xmlns="http://www.w3.org/2000/svg"
//                            width="16"
//                            height="16"
//                            fill="currentColor"
//                            viewBox="0 0 256 256"
//                            className="size-4"
//                        >
//                            <path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z" />
//                        </svg>
//                    </button>
//                </DropdownMenu.Item>
//            </DropdownMenu.Content>
//        </DropdownMenu.Root>
//    );
//}

//
//'use client';
//import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
//import Link from 'next/link';
//import { useState } from 'react';
//
//const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];
//
//function getNextPlan(currentPlan) {
//  const index = planOrder.indexOf(currentPlan);
//  return index >= 0 && index < planOrder.length - 1 ? planOrder[index + 1] : null;
//}
//
//export function UserDropdownMenu({ username, email, role, plan, lang = 'pt-br', onLogout }) {
//  const [open, setOpen] = useState(false);
//  const nextPlan = getNextPlan(plan);
//
//  return (
//    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
//      <DropdownMenu.Trigger asChild>
//        <button
//          type="button"
//          aria-haspopup="menu"
//          aria-expanded={open}
//          id="radix-_r_0_"
//          className="group relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 w-full justify-between px-2.5 md:w-fit"
//        >
//          <div className="flex flex-col items-start gap-0.5">
//            <span className="text-sm leading-none">{username}</span>
//            <span className="text-[10px] text-secondary leading-none">
//              {email?.replace(/(.{3}).+(@.+)/, '$1••••••••••••$2')}
//            </span>
//          </div>
//          <svg
//            xmlns="http://www.w3.org/2000/svg"
//            width="20"
//            height="20"
//            fill="currentColor"
//            viewBox="0 0 256 256"
//            className={`text-secondary transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
//          >
//            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//          </svg>
//        </button>
//      </DropdownMenu.Trigger>
//
//      <DropdownMenu.Content
//        side="bottom"
//        align="center"
//        id="radix-_r_1_"
//        aria-labelledby="radix-_r_0_"
//        className="z-600 overflow-hidden rounded-md border border-virtus-600 bg-background p-2 text-white shadow-md motion-scale-in-95 motion-opacity-in-[0%] motion-translate-x-in-[0%] motion-translate-y-in-[-25px] motion-duration-300 motion-duration-[0.25s]/opacity group flex w-fit min-w-70 flex-col gap-1"
//      >
//        {/* Perfil */}
//        <div className="flex flex-col gap-0.5 p-2">
//          <div className="flex items-center justify-between gap-1.5">
//            <span className="font-medium text-xs">{username}</span>
//            <span
//              className="select-none rounded-sm bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] px-1.5 py-0.5 font-medium text-primary text-xs capitalize hover:bg-virtus-800"
//              style={{ '--bg-color': '125,125,125' }}
//            >
//              {role}
//            </span>
//          </div>
//          <span className="text-secondary text-xs">{email}</span>
//          <Link href={`/${lang}/pay?state=renew`} className="mt-2 flex items-center gap-1 text-link text-xs">
//            Renovar Plano
//            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//            </svg>
//          </Link>
//        </div>
//
//        <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//
//        {/* Links */}
//        <div className="flex gap-1">
//          <Link href={`/${lang}/dashboard`} className="menu-item w-full">Aplicações</Link>
//          <Link href={`/${lang}/upload`} className="menu-icon-button">
//            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
//            </svg>
//          </Link>
//        </div>
//
//        <Link href={`/${lang}/dashboard/databases`} className="menu-item-icon justify-between">
//          <span className="flex items-center gap-2">Banco de dados</span>
//          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//            <path d="M196,35.52C177.62,25.51,153.48,20,128,20S78.38,25.51,60,35.52..." />
//          </svg>
//        </Link>
//
//        <Link href={`/${lang}/dashboard/snapshots`} className="menu-item-icon justify-between">
//          Snapshots
//          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//            <path d="M140,80v41.21l34.17,20.5a12,12,0,1,1-12.34,20.58..." />
//          </svg>
//        </Link>
//
//        <Link href={`/${lang}/account`} className="menu-item-icon justify-between">
//          Configurações
//          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//            <path d="M128,76a52,52,0,1,0,52,52A52.06,52.06,0,0,0,128,76Z..." />
//          </svg>
//        </Link>
//
//                {/* Upgrade */}
//        {nextPlan && (
//          <>
//            <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//            <DropdownMenu.Item asChild>
//              <Link
//                href={`/${lang}/pay?upgrade=${nextPlan}`}
//                className="group/button relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 focus-visible:ring-offset-background h-10 px-4 justify-center bg-[rgba(var(--bg-color),0.25)] text-primary hover:bg-[rgba(var(--bg-color),0.375)] w-full relative"
//                style={{ '--bg-color': '52,78,212' }}
//              >
//                <div className="absolute inset-0 bg-gradient-to-b from-black/1 to-black/50" />
//                <span className="z-1">Evoluir para {nextPlan.charAt(0).toUpperCase() + nextPlan.slice(1)}</span>
//                <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//              </Link>
//            </DropdownMenu.Item>
//          </>
//        )}
//
//        <div role="separator" className="-mx-2 my-2 h-px bg-virtus-500" />
//
//        {/* Logout */}
//        <DropdownMenu.Item asChild>
//          <button
//            onClick={onLogout}
//            className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-red-500/10 text-red-500 w-full justify-between"
//          >
//            Encerrar sessão
//            <svg
//              xmlns="http://www.w3.org/2000/svg"
//              width="16"
//              height="16"
//              fill="currentColor"
//              viewBox="0 0 256 256"
//              className="size-4"
//            >
//              <path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z" />
//            </svg>
//          </button>
//        </DropdownMenu.Item>
//      </DropdownMenu.Content>
//    </DropdownMenu.Root>
//  );
//}

//'use client';
//import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
//import Link from 'next/link';
//import { useState } from 'react';
//
//const planOrder = [
//    'no-plan',
//    'test',
//    'basic',
//    'pro',
//    'premium',
//    'enterprise',
//];
//
//function getNextPlan(currentPlan) {
//    const index = planOrder.indexOf(currentPlan);
//    return index >= 0 && index < planOrder.length - 1 ? planOrder[index + 1] : null;
//}
//
//export function UserDropdownMenu({ username, email, role, plan, lang = 'pt-br', onLogout }) {
//    const [open, setOpen] = useState(false);
//    const nextPlan = getNextPlan(plan);
//
//    return (
//        <DropdownMenu.Root open={open} onOpenChange={setOpen}>
//            <DropdownMenu.Trigger asChild>
//                <button
//                    type="button"
//                    aria-haspopup="menu"
//                    aria-expanded={open}
//                    className="group relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 w-full justify-between px-2.5 md:w-fit"
//                >
//                    <div className="flex flex-col items-start gap-0.5">
//                        <span className="text-sm leading-none">{username}</span>
//                        <span className="text-[10px] text-secondary leading-none">
//                            {email?.replace(/(.{3}).+(@.+)/, '$1••••••••••••$2')}
//                        </span>
//                    </div>
//                    <svg
//                        xmlns="http://www.w3.org/2000/svg"
//                        width="20"
//                        height="20"
//                        fill="currentColor"
//                        viewBox="0 0 256 256"
//                        className={`text-secondary transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
//                    >
//                        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                    </svg>
//                </button>
//            </DropdownMenu.Trigger>
//
//            <DropdownMenu.Content
//                side="bottom"
//                align="center"
//                className="z-600 overflow-hidden rounded-md border border-virtus-600 bg-background p-2 text-white shadow-md flex w-fit min-w-70 flex-col gap-1"
//            >
//                {/* Perfil */}
//                <div className="flex flex-col gap-0.5 p-2">
//                    <div className="flex items-center justify-between gap-1.5">
//                        <span className="font-medium text-xs">{username}</span>
//                        <span className="select-none rounded-sm bg-virtus-700 px-1.5 py-0.5 font-medium text-primary text-xs capitalize">
//                            {role}
//                        </span>
//                    </div>
//                    <span className="text-secondary text-xs">{email}</span>
//                    <Link href={`/${lang}/pay?state=renew`} className="mt-2 flex items-center gap-1 text-link text-xs">
//                        Renovar Plano
//                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                        </svg>
//                    </Link>
//                </div>
//
//                {/* Upgrade de plano */}
//                {nextPlan && (
//                    <>
//                        <div className="-mx-2 my-2 h-px bg-virtus-500" />
//                        <DropdownMenu.Item asChild>
//                            <Link
//                                href={`/${lang}/pay?upgrade=${nextPlan}`}
//                                className="group/button relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 h-10 px-4 justify-center bg-[rgba(var(--bg-color),0.25)] text-primary hover:bg-[rgba(var(--bg-color),0.375)] w-full relative"
//                                style={{ '--bg-color': '52,78,212' }}
//                            >
//                                <div className="absolute inset-0 bg-gradient-to-b from-black/1 to-black/50" />
//                                <span className="z-1">Evoluir para {nextPlan.charAt(0).toUpperCase() + nextPlan.slice(1)}</span>
//                                <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//                            </Link>
//                        </DropdownMenu.Item>
//                    </>
//                )}
//
//                <div className="-mx-2 my-2 h-px bg-virtus-500" />
//
//                {/* Links */}
//                <DropdownMenu.Item asChild>
//                    <Link href={`/${lang}/dashboard`} className="menu-item">Aplicações</Link>
//                </DropdownMenu.Item>
//
//                <DropdownMenu.Item asChild>
//                    <Link href={`/${lang}/upload`} className="menu-icon-button">
//                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
//                        </svg>
//                    </Link>
//                </DropdownMenu.Item>
//
//                <DropdownMenu.Item asChild>
//                    <Link href={`/${lang}/dashboard/databases`} className="menu-item-icon">
//                        Banco de dados
//                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M196,35.52C177.62,25.51,153.48,20,128,20S78.38,25.51,60,35.52..." />
//                        </svg>
//                    </Link>
//                </DropdownMenu.Item>
//
//                <DropdownMenu.Item asChild>
//                    <Link href={`/${lang}/dashboard/snapshots`} className="menu-item-icon">
//                        Snapshots
//                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M140,80v41.21l34.17,20.5a12,12,0,1,1-12.34,20.58..." />
//                        </svg>
//                    </Link>
//                </DropdownMenu.Item>
//
//                <DropdownMenu.Item asChild>
//                    <Link href={`/${lang}/account`} className="menu-item-icon">
//                        Configurações
//                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//                            <path d="M128,76a52,52,0,1,0,52,52A52.06,52.06,0,0,0,128,76Z..." />
//                        </svg>
//                    </Link>
//                </DropdownMenu.Item>
//
//                <div className="-mx-2 my-2 h-px bg-virtus-500" />
//
//                {/* Logout */}
//                <DropdownMenu.Item asChild>
//                    <button
//                        onClick={onLogout}
//                        className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-red-500/10 text-red-500 w-full justify-between"
//                    >
//                        Encerrar sessão
//                        <svg
//                            xmlns="http://www.w3.org/2000/svg"
//                            width="16"
//                            height="16"
//                            fill="currentColor"
//                            viewBox="0 0 256 256"
//                            className="size-4"
//                        >
//                            <path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z" />
//                        </svg>
//                    </button>
//                </DropdownMenu.Item>
//            </DropdownMenu.Content>
//        </DropdownMenu.Root>
//    );
//}

//'use client';
//import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
//import Link from 'next/link';
//import { useState } from 'react';
//
//export function UserDropdownMenu({ username, email, role, lang = 'pt-br', onLogout }) {
//  const [open, setOpen] = useState(false);
//
//  return (
//    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
//      <DropdownMenu.Trigger asChild>
//        <button
//          type="button"
//          aria-haspopup="menu"
//          aria-expanded={open}
//          className="group relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 w-full justify-between px-2.5 md:w-fit"
//        >
//          <div className="flex flex-col items-start gap-0.5">
//            <span className="text-sm leading-none">{username}</span>
//            <span className="text-[10px] text-secondary leading-none">
//              {email?.replace(/(.{3}).+(@.+)/, '$1••••••••••••$2')}
//            </span>
//          </div>
//          <svg
//            xmlns="http://www.w3.org/2000/svg"
//            width="20"
//            height="20"
//            fill="currentColor"
//            viewBox="0 0 256 256"
//            className={`text-secondary transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
//          >
//            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//          </svg>
//        </button>
//      </DropdownMenu.Trigger>
//
//      <DropdownMenu.Content
//        side="bottom"
//        align="center"
//        className="z-600 overflow-hidden rounded-md border border-virtus-600 bg-background p-2 text-white shadow-md flex w-fit min-w-70 flex-col gap-1"
//      >
//        <div className="flex flex-col gap-0.5 p-2">
//          <div className="flex items-center justify-between gap-1.5">
//            <span className="font-medium text-xs">{username}</span>
//            <span className="select-none rounded-sm bg-virtus-700 px-1.5 py-0.5 font-medium text-primary text-xs capitalize">
//              {role}
//            </span>
//          </div>
//          <span className="text-secondary text-xs">{email}</span>
//          <Link href={`/${lang}/pay?state=renew`} className="mt-2 flex items-center gap-1 text-link text-xs">
//            Renovar Plano
//            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//            </svg>
//          </Link>
//        </div>
//
//        <div className="-mx-2 my-2 h-px bg-virtus-500" />
//
//        <DropdownMenu.Item asChild>
//          <Link href={`/${lang}/dashboard`} className="menu-item">Aplicações</Link>
//        </DropdownMenu.Item>
//
//        <DropdownMenu.Item asChild>
//          <Link href={`/${lang}/upload`} className="menu-icon-button">
//            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
//            </svg>
//          </Link>
//        </DropdownMenu.Item>
//
//        <DropdownMenu.Item asChild>
//          <Link href={`/${lang}/dashboard/databases`} className="menu-item-icon">
//            Banco de dados
//            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M196,35.52C177.62,25.51,153.48,20,128,20S78.38,25.51,60,35.52..." />
//            </svg>
//          </Link>
//        </DropdownMenu.Item>
//
//        <DropdownMenu.Item asChild>
//          <Link href={`/${lang}/dashboard/snapshots`} className="menu-item-icon">
//            Snapshots
//            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M140,80v41.21l34.17,20.5a12,12,0,1,1-12.34,20.58..." />
//            </svg>
//          </Link>
//        </DropdownMenu.Item>
//
//        <DropdownMenu.Item asChild>
//          <Link href={`/${lang}/account`} className="menu-item-icon">
//            Configurações
//            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M128,76a52,52,0,1,0,52,52A52.06,52.06,0,0,0,128,76Z..." />
//            </svg>
//          </Link>
//        </DropdownMenu.Item>
//
//        <div className="-mx-2 my-2 h-px bg-virtus-500" />
//
//        <DropdownMenu.Item asChild>
//          <button
//            onClick={onLogout}
//            className="menu-item-icon text-red-500 hover:bg-red-500/10"
//          >
//            Encerrar sessão
//            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64..." />
//            </svg>
//          </button>
//        </DropdownMenu.Item>
//      </DropdownMenu.Content>
//    </DropdownMenu.Root>
//  );
//}

//'use client';
//import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
//import Link from 'next/link';
//import { useState } from 'react';
//
//export function UserDropdownMenu({ username, email, role, lang = 'pt-br', onLogout }) {
//  const [open, setOpen] = useState(false);
//
//  return (
//    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
//      <DropdownMenu.Trigger asChild>
//        <button
//          type="button"
//          aria-haspopup="menu"
//          aria-expanded={open}
//          className="group relative inline-flex min-w-fit items-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap text-primary transition-all select-none hover:cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-12 w-full justify-between px-2.5 md:w-fit"
//        >
//          <div className="flex flex-col items-start gap-0.5">
//            <span className="text-sm leading-none">{username}</span>
//            <span className="text-[10px] text-secondary leading-none">
//              {email?.replace(/(.{3}).+(@.+)/, '$1••••••••••••$2')}
//            </span>
//          </div>
//          <svg
//            xmlns="http://www.w3.org/2000/svg"
//            width="20"
//            height="20"
//            fill="currentColor"
//            viewBox="0 0 256 256"
//            className={`text-secondary transition-transform duration-250 ${open ? 'rotate-180' : ''}`}
//          >
//            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//          </svg>
//        </button>
//      </DropdownMenu.Trigger>
//
//      <DropdownMenu.Content
//        side="bottom"
//        align="center"
//        className="z-600 overflow-hidden rounded-md border border-virtus-600 bg-background p-2 text-white shadow-md flex w-fit min-w-70 flex-col gap-1"
//      >
//        <div className="flex flex-col gap-0.5 p-2">
//          <div className="flex items-center justify-between gap-1.5">
//            <span className="font-medium text-xs">{username}</span>
//            <span className="select-none rounded-sm bg-virtus-700 px-1.5 py-0.5 font-medium text-primary text-xs capitalize">
//              {role}
//            </span>
//          </div>
//          <span className="text-secondary text-xs">{email}</span>
//          <Link href={`/${lang}/pay?state=renew`} className="mt-2 flex items-center gap-1 text-link text-xs">
//            Renovar Plano
//            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//            </svg>
//          </Link>
//        </div>
//
//        <div className="-mx-2 my-2 h-px bg-virtus-500" />
//
//        <DropdownMenu.Item asChild>
//          <Link href={`/${lang}/dashboard`} className="menu-item">Aplicações</Link>
//        </DropdownMenu.Item>
//
//        <DropdownMenu.Item asChild>
//          <Link href={`/${lang}/upload`} className="menu-icon-button">
//            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
//            </svg>
//          </Link>
//        </DropdownMenu.Item>
//
//        <DropdownMenu.Item asChild>
//          <Link href={`/${lang}/dashboard/databases`} className="menu-item-icon">
//            Banco de dados
//            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M196,35.52C177.62,25.51,153.48,20,128,20S78.38,25.51,60,35.52..." />
//            </svg>
//          </Link>
//        </DropdownMenu.Item>
//
//        <DropdownMenu.Item asChild>
//          <Link href={`/${lang}/dashboard/snapshots`} className="menu-item-icon">
//            Snapshots
//            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M140,80v41.21l34.17,20.5a12,12,0,1,1-12.34,20.58..." />
//            </svg>
//          </Link>
//        </DropdownMenu.Item>
//
//        <DropdownMenu.Item asChild>
//          <Link href={`/${lang}/account`} className="menu-item-icon">
//            Configurações
//            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M128,76a52,52,0,1,0,52,52A52.06,52.06,0,0,0,128,76Z..." />
//            </svg>
//          </Link>
//        </DropdownMenu.Item>
//
//        <div className="-mx-2 my-2 h-px bg-virtus-500" />
//
//        <DropdownMenu.Item asChild>
//          <button
//            onClick={onLogout}
//            className="menu-item-icon text-red-500 hover:bg-red-500/10"
//          >
//            Encerrar sessão
//            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64..." />
//            </svg>
//          </button>
//        </DropdownMenu.Item>
//      </DropdownMenu.Content>
//    </DropdownMenu.Root>
//  );
//}
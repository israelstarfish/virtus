// src/utils/getLangFromCookie.ts

import { cookies } from 'next/headers';

export async function getLangFromCookie(): Promise<string> {
  const cookieStore = await cookies();
  const lang = cookieStore.get('virtuscloud.locale')?.value;
  return lang || 'pt-br';
}

// src/utils/getLangFromCookie.ts

//import { cookies } from 'next/headers';
//
//export async function getLangFromCookie(): Promise<string> {
//  const cookieStore = await cookies();
//  const lang = cookieStore.get('virtuscloud.lang')?.value;
//  return lang || 'pt-br';
//}

// src/utils/getLangFromCookie.ts

//import { cookies } from 'next/headers';
//import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
//
//export function getLangFromCookie(): string {
//  const cookieStore = cookies() as unknown as ReadonlyRequestCookies;
//  return cookieStore.get('virtuscloud.lang')?.value || 'pt-br';
//}

//src/utils/getLangFromCookie.ts

//import { cookies } from 'next/headers';
//
//export function getLangFromCookie(): string {
//  const cookieStore = cookies();
//  return cookieStore.get('virtuscloud.lang')?.value || 'pt-br';
//}
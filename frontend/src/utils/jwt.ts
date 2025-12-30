// utils/jwt.ts
export function decodeJwt(token: string): Record<string, any> | null {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
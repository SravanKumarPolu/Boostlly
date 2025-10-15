import { logError, logDebug, logWarning } from "./logger";
// Runtime-safe environment access helpers

export type EnvMap = Record<string, string | undefined>;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// Read environment variables from Next.js (NEXT_PUBLIC_*) or Vite (import.meta.env.VITE_*)
export function readEnv(keys: string[]): EnvMap {
  const map: EnvMap = {};
  for (const key of keys) {
    let value: string | undefined;
    if (isBrowser()) {
      // Next.js exposes NEXT_PUBLIC_* on process.env in the browser as well
      // Vite exposes variables on import.meta.env
      // Try both safely
      // @ts-ignore - process may be undefined in some runtimes
      value = typeof process !== "undefined" ? process.env?.[key] : undefined;
      // Vite environment variables are handled at build time
      // For runtime, we only use process.env
    } else {
      // Node.js - build time
      value = process.env?.[key];
    }
    map[key] = value;
  }
  return map;
}

export function mask(value: string | undefined, keep: number = 3): string {
  if (!value) return "absent";
  if (value.length <= keep) return "*".repeat(value.length);
  return value.slice(0, keep) + "***";
}

export function debugEnv(prefix: string, keys: string[]): void {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production")
    return;
  const map = readEnv(keys);
  const maskedEnv = Object.fromEntries(
    Object.entries(map).map(([k, v]: [string, string | undefined]) => [
      k,
      mask(v),
    ]),
  );
  // eslint-disable-next-line no-console
  logDebug(`[boostlly][env] ${prefix}`, { env: maskedEnv });
}

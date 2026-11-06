// Rate limit แบบ fixed window ต่อ IP (in-memory, single instance) — NFR-07
import { now } from './clock';
import { processState } from './process-state';
import { rateLimitEnabled } from './runtime-profile';

const WINDOW_MS = 60_000;

export const LIMITS = { analyze: 30, login: 10 } as const;

export function hitRateLimit(scope: keyof typeof LIMITS, ip: string): boolean {
  if (!rateLimitEnabled()) return false;
  const buckets = processState().buckets;
  const key = `${scope}:${ip}`;
  const t = now().getTime();
  const b = buckets.get(key);
  if (!b || t - b.start >= WINDOW_MS || t < b.start) {
    buckets.set(key, { start: t, count: 1 });
    return false;
  }
  buckets.set(key, { start: b.start, count: b.count + 1 });
  return b.count + 1 > LIMITS[scope];
}

export function resetRateLimits(): void {
  processState().buckets.clear();
}

// โปรไฟล์การทำงานของ runtime (อ่านจาก env ครั้งเดียวต่อการเรียก)
import { STANDARD_PROFILE, type CalcProfile } from '@/domain/types';

export interface RuntimeProfile {
  readonly calc: CalcProfile;
  readonly lockAfterFailures: number;
  readonly lockMinutes: number;
  readonly idleMinutes: number;
}

export function runtimeProfile(): RuntimeProfile {
  const legacy = process.env.BUG_MODE === '1';
  return {
    calc: legacy ? { letterTermMode: 'set', minPrefix: 0 } : STANDARD_PROFILE,
    lockAfterFailures: legacy ? 6 : 5,
    lockMinutes: 15,
    idleMinutes: 30,
  };
}

export const isBugModeFlag = (): '0' | '1' => (process.env.BUG_MODE === '1' ? '1' : '0');
export const rateLimitEnabled = (): boolean => process.env.RATE_LIMIT_ENABLED !== 'false';
export const testResetAllowed = (): boolean => process.env.ALLOW_TEST_RESET === '1';
export const cookieSecure = (): boolean => process.env.COOKIE_SECURE === 'true';

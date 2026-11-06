import path from 'node:path';

/** ค่าคงที่ร่วมของชุดทดสอบ */
export const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
/** วันล็อกจาก TEST-DATA §1 (เวลา) */
export const LOCK_NOW = '2026-11-06T09:00:00+07:00';
export const IS_GIF = process.env.GIF === '1';
export const E2E_ROOT = path.resolve(__dirname, '..');
export const REPORT_DIR = path.join(E2E_ROOT, 'test-report');
export const PLAN_PATH = path.resolve(E2E_ROOT, '..', 'TEST-PLAN.md');
export const FFMPEG =
  process.env.FFMPEG ??
  path.join(process.env.LOCALAPPDATA ?? '', 'ffmpeg', 'ffmpeg-master-latest-win64-gpl', 'bin', 'ffmpeg.exe');

/** บัญชีจาก TEST-DATA §2 */
export const USERS = {
  editor: { username: 'editor.test', password: 'Editor#Test2026' },
  editor2: { username: 'editor2.test', password: 'Editor2#Test2026' },
  admin: { username: 'admin.test', password: 'Admin#Test2026' },
  admin2: { username: 'admin2.test', password: 'Admin2#Test2026' },
  locked: { username: 'locked.test', password: 'Locked#Test2026' },
} as const;
export type UserKey = keyof typeof USERS;

/** ดึงรหัส TC จากชื่อ test */
export function tcIdOf(title: string): string {
  const m = /^(TC-[A-Z]+-\d+)/.exec(title);
  return m ? m[1] : title.replace(/[^\w-]+/g, '_').slice(0, 40);
}

// นาฬิกาเดียวของระบบ — ทุกโค้ดต้องอ่านเวลาผ่าน now()
// clockFixedAt = null → เวลาจริง · ตั้งค่าโดย POST /api/test/reset {now} (เก็บใน app_clock ด้วย)
import { query } from '@/infrastructure/db';
import { processState } from './process-state';

export function now(): Date {
  return new Date(processState().clockFixedAt ?? Date.now());
}

export function setClock(at: Date | null): void {
  const s = processState();
  s.clockFixedAt = at ? at.getTime() : null;
  s.clockLoaded = true;
}

/** โหลดค่านาฬิกาจาก DB ครั้งแรก (กรณี container restart) */
export async function ensureClockLoaded(): Promise<void> {
  const s = processState();
  if (s.clockLoaded) return;
  try {
    const rows = await query<{ fixed_at: Date | null }>('SELECT fixed_at FROM app_clock WHERE id = 1');
    s.clockFixedAt = rows[0]?.fixed_at ? new Date(rows[0].fixed_at).getTime() : null;
  } finally {
    s.clockLoaded = true;
  }
}

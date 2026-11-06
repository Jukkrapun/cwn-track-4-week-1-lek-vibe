// State ระดับ process ที่ต้องใช้ร่วมกันทุก route bundle (Next.js อาจโหลดโมดูลซ้ำแยกตาม route)
interface ProcessState {
  clockFixedAt: number | null;
  clockLoaded: boolean;
  buckets: Map<string, { start: number; count: number }>;
}

const KEY = Symbol.for('mongkol.process-state');
const holder = globalThis as unknown as Record<symbol, ProcessState | undefined>;

export function processState(): ProcessState {
  holder[KEY] ??= { clockFixedAt: null, clockLoaded: false, buckets: new Map() };
  return holder[KEY];
}

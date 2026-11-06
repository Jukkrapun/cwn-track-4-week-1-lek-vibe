import fs from 'node:fs';
import { PLAN_PATH } from './env';

export interface PlanCase {
  id: string;
  module: string;
  what: string;
  technique: string;
  priority: 'P1' | 'P2' | 'P3';
  data: string;
  expected: string;
  source: string;
}

const MODULE_TAG: Record<string, string> = {
  PH: '@phone', LP: '@plate', CT: '@content', AU: '@auth', AD: '@admin', SEC: '@security', UI: '@ui',
};

/** อ่านตาราง TC จาก TEST-PLAN.md หัวข้อ 5 (แหล่งเดียวของผลที่คาดหวัง) */
export function loadPlan(file = PLAN_PATH): Map<string, PlanCase> {
  const cases = new Map<string, PlanCase>();
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = /^\|\s*(?:✚\s*)?(TC-[A-Z]+-\d+)\s*\|/.exec(line);
    if (!m) continue;
    const cols = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cols.length < 9) continue;
    const [, module, what, , technique, priority, data, expected, source] = cols;
    cases.set(m[1], { id: m[1], module, what, technique, priority: priority as PlanCase['priority'], data, expected, source });
  }
  return cases;
}

const PLAN = loadPlan();

/** คืน title/tag/annotation ของ TC ตามแผน — ใช้ใน test(...) ทุกตัว */
export function tc(id: string) {
  const c = PLAN.get(id);
  if (!c) throw new Error(`ไม่พบ ${id} ใน TEST-PLAN.md`);
  const mod = MODULE_TAG[id.split('-')[1]] ?? '@other';
  return {
    title: `${id} ${c.what.replace(/\*\*/g, '')}`,
    details: {
      tag: [mod, `@${c.priority}`],
      annotation: [
        { type: 'ผลที่คาดหวัง', description: c.expected },
        { type: 'ที่มา', description: c.source },
        { type: 'ข้อมูล', description: c.data },
      ],
    },
  };
}

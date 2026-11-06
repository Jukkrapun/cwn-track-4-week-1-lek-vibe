// StatsRepository — นับจำนวนครั้งเท่านั้น ไม่มีค่าที่ผู้ใช้กรอก (BR-PV-01, I-8)
import { query } from './db';

export type UsageType = 'PHONE' | 'PLATE' | 'PAIR_SEARCH' | 'ARTICLE_VIEW';

export async function incrementUsage(type: UsageType, at: Date): Promise<void> {
  const day = new Date(at.getTime() + 7 * 3600_000).toISOString().slice(0, 10);
  await query(
    `INSERT INTO usage_stat (date, type, count) VALUES ($1, $2, 1)
     ON CONFLICT (date, type) DO UPDATE SET count = usage_stat.count + 1`,
    [day, type],
  );
}

export async function usageTotals(): Promise<{ type: UsageType; total: number }[]> {
  const rows = await query<{ type: UsageType; total: string }>('SELECT type, SUM(count)::text AS total FROM usage_stat GROUP BY type ORDER BY type');
  return rows.map((r) => ({ type: r.type, total: Number(r.total) }));
}

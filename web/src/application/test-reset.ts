// POST /api/test/reset — ล้างทุกตารางกลับเป็น seed ใน transaction เดียว + ล็อกนาฬิกา
import fs from 'node:fs';
import path from 'node:path';
import { withTransaction } from '@/infrastructure/db';
import { setClock } from '@/shared/clock';
import { resetRateLimits } from '@/shared/rate-limit';

export const DEFAULT_TEST_NOW = '2026-11-06T09:00:00+07:00';
const TABLES = [
  'request_log', 'login_attempt', 'session', 'audit_log', 'usage_stat', 'article_reference', 'article', 'article_category',
  'category', 'occupation_pair', 'avoid_pattern', 'birthday_rule', 'letter_value', 'sum_grade', 'pair_meaning_member',
  'pair_meaning', 'rule_set', 'rule_set_version', 'app_user', 'app_clock',
];

let seedSql: string | null = null;
function loadSeed(): string {
  seedSql ??= fs.readFileSync(path.join(process.cwd(), 'sql', 'seed.sql'), 'utf8');
  return seedSql;
}

export async function resetDatabase(at: Date): Promise<void> {
  const sql = loadSeed();
  await withTransaction(async (client) => {
    await client.query(`TRUNCATE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`);
    await client.query(sql);
    await client.query('UPDATE app_clock SET fixed_at = $1 WHERE id = 1', [at]);
  });
  setClock(at);
  resetRateLimits();
}

export async function setTestClock(at: Date): Promise<void> {
  await withTransaction(async (client) => {
    await client.query('UPDATE app_clock SET fixed_at = $1 WHERE id = 1', [at]);
  });
  setClock(at);
}

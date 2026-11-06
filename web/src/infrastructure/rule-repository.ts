// RuleRepository — อ่าน/เขียน Rule Set และเวอร์ชันใน PostgreSQL (แทน file store ตาม ADR-002)
import type { PoolClient } from 'pg';
import {
  BIRTH_DAYS,
  type BirthDay,
  type CategoryOption,
  type LetterRuleSet,
  type PairGrade,
  type PairMeaningRule,
  type PairRuleSet,
  type PlateRuleSet,
  type RuleSetRef,
} from '@/domain/types';
import { getPool, query, type Queryable } from './db';

export const RULE_SET_IDS = {
  pairs: 'pairs-common-belief-mock',
  wongnai: 'plate-wongnai-v1',
  allianz: 'plate-allianz-v1',
  categories: 'phone-categories-mock',
} as const;

export interface VersionRow {
  id: string;
  rule_set_id: string;
  rule_set_name: string;
  version: string | null;
  status: 'DRAFT' | 'APPROVED' | 'PUBLISHED' | 'SUPERSEDED';
  source_name: string;
  source_url: string | null;
  is_mock: boolean;
  based_on_version_id: string | null;
  based_on_version: string | null;
  created_by: string;
  created_by_name: string;
  approved_by: string | null;
  approved_by_name: string | null;
  effective_at: Date | null;
  created_at: Date;
}

const VERSION_SELECT = `
  SELECT v.id, v.rule_set_id, rs.name AS rule_set_name, v.version, v.status, v.source_name, v.source_url, v.is_mock,
         v.based_on_version_id, b.version AS based_on_version, v.created_by, cu.username AS created_by_name,
         v.approved_by, au.username AS approved_by_name, v.effective_at, v.created_at
    FROM rule_set_version v
    JOIN rule_set rs ON rs.id = v.rule_set_id
    JOIN app_user cu ON cu.id = v.created_by
    LEFT JOIN app_user au ON au.id = v.approved_by
    LEFT JOIN rule_set_version b ON b.id = v.based_on_version_id`;

export async function findPublishedVersion(ruleSetId: string, db: Queryable = getPool()): Promise<VersionRow | null> {
  const rows = await query<VersionRow>(`${VERSION_SELECT} JOIN rule_set p ON p.published_version_id = v.id WHERE p.id = $1`, [ruleSetId], db);
  return rows[0] ?? null;
}

export async function findVersion(id: string, db: Queryable = getPool()): Promise<VersionRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const rows = await query<VersionRow>(`${VERSION_SELECT} WHERE v.id = $1`, [id], db);
  return rows[0] ?? null;
}

export async function findVersionByLabel(ruleSetId: string, version: string, db: Queryable = getPool()): Promise<VersionRow | null> {
  const rows = await query<VersionRow>(`${VERSION_SELECT} WHERE v.rule_set_id = $1 AND v.version = $2`, [ruleSetId, version], db);
  return rows[0] ?? null;
}

export async function findOpenDraft(ruleSetId: string, db: Queryable = getPool()): Promise<VersionRow | null> {
  const rows = await query<VersionRow>(`${VERSION_SELECT} WHERE v.rule_set_id = $1 AND v.status IN ('DRAFT','APPROVED')`, [ruleSetId], db);
  return rows[0] ?? null;
}

export async function listVersions(db: Queryable = getPool()): Promise<VersionRow[]> {
  return query<VersionRow>(`${VERSION_SELECT} ORDER BY v.rule_set_id, v.created_at, v.version NULLS LAST`, [], db);
}

export async function listRuleSets(db: Queryable = getPool()): Promise<{ id: string; name: string; domain: string; published_version: string | null }[]> {
  return query(
    `SELECT rs.id, rs.name, rs.domain, v.version AS published_version FROM rule_set rs LEFT JOIN rule_set_version v ON v.id = rs.published_version_id ORDER BY rs.id`,
    [],
    db,
  );
}

function refOf(v: VersionRow): RuleSetRef {
  return { id: v.rule_set_id, name: v.rule_set_name, version: v.version ?? 'draft', source: v.source_name, sourceUrl: v.source_url, isMock: v.is_mock };
}

export async function loadPairGroups(versionId: string, db: Queryable = getPool()): Promise<PairMeaningRule[]> {
  const rows = await query<{ pair_group: string; grade: string; categories: string[]; pros: string | null; cons: string | null; source: string }>(
    'SELECT pair_group, grade, categories, pros, cons, source FROM pair_meaning WHERE rule_set_version_id = $1 ORDER BY sort_order, pair_group',
    [versionId],
    db,
  );
  return rows.map((r) => ({
    pairs: r.pair_group.split('|'),
    grade: r.grade.toLowerCase() as PairGrade,
    categories: r.categories,
    pros: r.pros,
    cons: r.cons,
    source: r.source,
  }));
}

export async function loadPairRuleSet(version: VersionRow, db: Queryable = getPool()): Promise<PairRuleSet> {
  return { ...refOf(version), groups: await loadPairGroups(version.id, db) };
}

const toDay = (d: string): BirthDay => d.toLowerCase().replace('_', '-') as BirthDay;

export async function loadPlateRuleSet(version: VersionRow, db: Queryable = getPool()): Promise<PlateRuleSet> {
  const [letters, sums, days, avoids, occ] = await Promise.all([
    query<{ letter: string; value: number }>('SELECT letter, value FROM letter_value WHERE rule_set_version_id = $1', [version.id], db),
    query<{ sum_value: number; grade: string; meaning: string | null }>('SELECT sum_value, grade, meaning FROM sum_grade WHERE rule_set_version_id = $1', [version.id], db),
    query<{ day: string; kind: string; value: string }>("SELECT day, kind, value FROM birthday_rule WHERE rule_set_version_id = $1 AND kind <> 'AVOID_LETTER' ORDER BY value", [version.id], db),
    query<{ kind: string; value: string; reason: string }>('SELECT kind, value, reason FROM avoid_pattern WHERE rule_set_version_id = $1 ORDER BY precedence, value', [version.id], db),
    query<{ group_key: string; pair: string }>('SELECT group_key, pair FROM occupation_pair WHERE rule_set_version_id = $1 ORDER BY group_key, sort_order', [version.id], db),
  ]);
  const birthday = Object.fromEntries(BIRTH_DAYS.map((d) => [d, { lucky: [] as number[], avoid: [] as number[] }])) as Record<BirthDay, { lucky: number[]; avoid: number[] }>;
  for (const r of days) birthday[toDay(r.day)][r.kind === 'LUCKY_DIGIT' ? 'lucky' : 'avoid'].push(Number(r.value));
  const occupationPairs: Record<string, string[]> = {};
  for (const r of occ) (occupationPairs[r.group_key] ??= []).push(r.pair);
  return {
    ...refOf(version),
    letterValues: Object.fromEntries(letters.map((l) => [l.letter, l.value])),
    sumGrades: Object.fromEntries(sums.map((s) => [s.sum_value, { grade: s.grade.toLowerCase() as 'excellent' | 'avoid', meaning: s.meaning }])),
    birthday,
    avoidPairs: Object.fromEntries(avoids.filter((a) => a.kind === 'PAIR').map((a) => [a.value, a.reason])),
    avoidPatterns: avoids.filter((a) => a.kind === 'PATTERN').map((a) => ({ id: a.value, reason: a.reason })),
    occupationPairs,
  };
}

export async function loadLetterRuleSet(version: VersionRow, db: Queryable = getPool()): Promise<LetterRuleSet> {
  const rows = await query<{ day: string; value: string }>(
    "SELECT day, value FROM birthday_rule WHERE rule_set_version_id = $1 AND kind = 'AVOID_LETTER' ORDER BY value",
    [version.id],
    db,
  );
  const avoidLetters = Object.fromEntries(BIRTH_DAYS.map((d) => [d, [] as string[]])) as Record<BirthDay, string[]>;
  for (const r of rows) avoidLetters[toDay(r.day)].push(r.value);
  return { ...refOf(version), avoidLetters };
}

export interface CategoryRow {
  id: string;
  type: 'OCCUPATION' | 'GOAL' | 'PHONE_TYPE';
  label: string;
  enabled: boolean;
  rule_ref: string | null;
  description: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  created_by_name: string | null;
  approved_by_name: string | null;
}

export async function listCategories(db: Queryable = getPool()): Promise<CategoryRow[]> {
  return query<CategoryRow>(
    `SELECT c.id, c.type, c.label, c.enabled, c.rule_ref, c.description, c.status, cu.username AS created_by_name, au.username AS approved_by_name
       FROM category c LEFT JOIN app_user cu ON cu.id = c.created_by LEFT JOIN app_user au ON au.id = c.approved_by
      ORDER BY c.type, c.sort_order, c.id`,
    [],
    db,
  );
}

export async function activeCategories(db: Queryable = getPool()): Promise<CategoryOption[]> {
  const rows = await query<{ id: string; type: CategoryOption['type']; label: string; rule_ref: string | null }>(
    "SELECT id, type, label, rule_ref FROM category WHERE enabled AND status = 'PUBLISHED' ORDER BY type, sort_order, id",
    [],
    db,
  );
  return rows.map((r) => ({ id: r.id, type: r.type, label: r.label, ruleRef: r.rule_ref }));
}

/** คัดลอกเนื้อหาทั้งหมดของเวอร์ชันหนึ่งไปยังเวอร์ชันใหม่ (ใช้กับ Draft และ Rollback) */
export async function cloneVersionContent(fromId: string, toId: string, client: PoolClient): Promise<void> {
  await client.query(
    `INSERT INTO pair_meaning (rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order)
     SELECT $2, pair_group, grade, categories, pros, cons, source, sort_order FROM pair_meaning WHERE rule_set_version_id = $1`,
    [fromId, toId],
  );
  await client.query(
    `INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair)
     SELECT n.id, $2, m.pair FROM pair_meaning_member m
       JOIN pair_meaning o ON o.id = m.pair_meaning_id
       JOIN pair_meaning n ON n.rule_set_version_id = $2 AND n.pair_group = o.pair_group
      WHERE m.rule_set_version_id = $1`,
    [fromId, toId],
  );
  for (const t of [
    ['sum_grade', 'sum_value, grade, meaning'],
    ['letter_value', 'letter, value'],
    ['birthday_rule', 'day, kind, value'],
    ['avoid_pattern', 'kind, value, reason, precedence'],
    ['occupation_pair', 'group_key, pair, sort_order'],
  ]) {
    await client.query(`INSERT INTO ${t[0]} (rule_set_version_id, ${t[1]}) SELECT $2, ${t[1]} FROM ${t[0]} WHERE rule_set_version_id = $1`, [fromId, toId]);
  }
}

export async function insertPairGroup(versionId: string, rule: PairMeaningRule, client: PoolClient): Promise<void> {
  const order = await client.query<{ n: number }>('SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM pair_meaning WHERE rule_set_version_id = $1', [versionId]);
  const ins = await client.query<{ id: string }>(
    `INSERT INTO pair_meaning (rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [versionId, rule.pairs.join('|'), rule.grade.toUpperCase(), rule.categories, rule.pros, rule.cons, rule.source, order.rows[0].n],
  );
  for (const p of rule.pairs) {
    await client.query('INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ($1, $2, $3)', [ins.rows[0].id, versionId, p]);
  }
}

export async function updatePairGroup(versionId: string, rule: PairMeaningRule, client: PoolClient): Promise<void> {
  await client.query(
    'UPDATE pair_meaning SET grade = $3, categories = $4, pros = $5, cons = $6, source = $7 WHERE rule_set_version_id = $1 AND pair_group = $2',
    [versionId, rule.pairs.join('|'), rule.grade.toUpperCase(), rule.categories, rule.pros, rule.cons, rule.source],
  );
}

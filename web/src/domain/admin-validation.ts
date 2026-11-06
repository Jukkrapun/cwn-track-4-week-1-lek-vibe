// Validate payload คู่เลขของหลังบ้าน (BR-AD-03/04, §4.4) — pure
import { fail, ok, type Result } from './errors';
import { PAIR_CATEGORIES, type PairGrade, type PairMeaningRule } from './types';

const MAX_TEXT = 500;
const MAX_SOURCE = 255;

export interface PairDraftInput {
  readonly pairs: string[];
  readonly grade: PairGrade;
  readonly categories: string[];
  readonly pros: string | null;
  readonly cons: string | null;
  readonly source: string;
}

const isStr = (v: unknown): v is string => typeof v === 'string';
const optText = (v: unknown): string | null | undefined => (v === null || v === undefined || v === '' ? null : isStr(v) ? v : undefined);

export function validatePairDraft(body: Record<string, unknown>): Result<PairDraftInput> {
  const rawPairs = body.pairs;
  if (!Array.isArray(rawPairs) || rawPairs.length === 0 || rawPairs.length > 4) return fail('PAIR_INVALID', 'pairs');
  if (!rawPairs.every((p) => isStr(p) && /^[0-9]{2}$/.test(p))) return fail('PAIR_INVALID', 'pairs');
  const pairs = [...new Set(rawPairs as string[])];

  const source = isStr(body.source) ? body.source.trim() : '';
  if (source === '') return fail('SOURCE_REQUIRED', 'source');
  if (source.length > MAX_SOURCE) return fail('VALIDATION_LENGTH', 'source');

  const pros = optText(body.pros);
  const cons = optText(body.cons);
  if (pros === undefined || cons === undefined) return fail('INVALID_REQUEST', pros === undefined ? 'pros' : 'cons');
  if ((pros?.length ?? 0) > MAX_TEXT) return fail('VALIDATION_LENGTH', 'pros');
  if ((cons?.length ?? 0) > MAX_TEXT) return fail('VALIDATION_LENGTH', 'cons');
  if (pros === null && cons === null) return fail('VALIDATION_LENGTH', 'pros');

  const grade = body.grade;
  if (grade !== 'good' && grade !== 'caution' && grade !== 'avoid') return fail('INVALID_OPTION', 'grade');
  const categories = body.categories ?? [];
  if (!Array.isArray(categories) || !categories.every((c) => isStr(c) && (PAIR_CATEGORIES as readonly string[]).includes(c))) {
    return fail('INVALID_OPTION', 'categories');
  }
  return ok({ pairs, grade, categories: categories as string[], pros, cons, source });
}

/** BR-AD-03: คู่ใดซ้ำกับกลุ่มอื่นใน Rule Set เดียวกัน */
export function findDuplicatePair(input: readonly string[], groups: readonly PairMeaningRule[], ignoreGroup: string | null = null): string | null {
  for (const g of groups) {
    if (ignoreGroup !== null && g.pairs.join('|') === ignoreGroup) continue;
    const hit = input.find((p) => g.pairs.includes(p));
    if (hit) return hit;
  }
  return null;
}

/** เวอร์ชันถัดไป: เพิ่ม patch และคง suffix เช่น 0.1.0-mock → 0.1.1-mock */
export function nextVersion(existing: readonly string[]): string {
  const parsed = existing
    .map((v) => v.match(/^(\d+)\.(\d+)\.(\d+)(-.+)?$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => ({ major: +m[1], minor: +m[2], patch: +m[3], suffix: m[4] ?? '' }))
    .sort((a, b) => a.major - b.major || a.minor - b.minor || a.patch - b.patch);
  const top = parsed[parsed.length - 1] ?? { major: 1, minor: 0, patch: -1, suffix: '' };
  return `${top.major}.${top.minor}.${top.patch + 1}${top.suffix}`;
}

export interface PairDiffEntry {
  readonly group: string;
  readonly change: 'added' | 'removed' | 'changed';
  readonly before: PairMeaningRule | null;
  readonly after: PairMeaningRule | null;
}

export function diffPairGroups(before: readonly PairMeaningRule[], after: readonly PairMeaningRule[]): PairDiffEntry[] {
  const key = (g: PairMeaningRule) => g.pairs.join('|');
  const sig = (g: PairMeaningRule) => JSON.stringify([g.grade, [...g.categories].sort(), g.pros, g.cons, g.source]);
  const b = new Map(before.map((g) => [key(g), g]));
  const a = new Map(after.map((g) => [key(g), g]));
  const out: PairDiffEntry[] = [];
  for (const [k, g] of a) {
    const old = b.get(k);
    if (!old) out.push({ group: k, change: 'added', before: null, after: g });
    else if (sig(old) !== sig(g)) out.push({ group: k, change: 'changed', before: old, after: g });
  }
  for (const [k, g] of b) if (!a.has(k)) out.push({ group: k, change: 'removed', before: g, after: null });
  return out;
}

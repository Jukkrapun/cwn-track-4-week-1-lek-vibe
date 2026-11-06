// PhoneAnalysis — normalize · validate · pairs (BR-PH-01..06) — pure
import { fail, ok, type Result } from './errors';
import { lookupPair, meaningOf } from './pairs';
import { thaiDigitsToArabic } from './text';
import type { Grade, PairRuleSet } from './types';

const MAX_RAW_LENGTH = 20;
const PHONE_LENGTH = 10;
const MOBILE_SECOND_DIGITS = new Set(['6', '8', '9']);
/** หลักแรกที่เริ่มอ่านคู่เลข (นับหลักแรก = 1) — ไม่ดู 3 หลักแรก */
export const PAIR_START_DIGIT = 4;

export function normalizePhone(raw: string): Result<string> {
  const trimmed = thaiDigitsToArabic(raw.trim());
  if (trimmed === '') return fail('PHONE_REQUIRED', 'number');
  const compact = trimmed.replace(/[\s-]/g, '');
  if (!/^\+?[0-9]+$/.test(compact)) return fail('PHONE_INVALID_CHAR', 'number');
  if (raw.length > MAX_RAW_LENGTH) return fail('PHONE_INVALID_LENGTH', 'number');

  let digits = compact;
  if (compact.startsWith('+66')) digits = `0${compact.slice(3)}`;
  else if (compact.startsWith('+')) digits = compact.slice(1);
  else if (compact.startsWith('66') && compact.length === 11) digits = `0${compact.slice(2)}`;

  if (digits[0] !== '0') return fail('PHONE_NOT_MOBILE', 'number');
  if (digits.length >= 2 && !MOBILE_SECOND_DIGITS.has(digits[1])) return fail('PHONE_NOT_MOBILE', 'number');
  if (digits.length !== PHONE_LENGTH) return fail('PHONE_INVALID_LENGTH', 'number');
  return ok(digits);
}

export interface PhonePair {
  readonly position: string;
  readonly pair: string;
  readonly grade: Grade;
  readonly categories: readonly string[];
  readonly meaning: string | null;
  readonly pros: string | null;
  readonly cons: string | null;
}

/** คู่ d[i]d[i+1] สำหรับ i = 4..9 (นับหลักแรก = 1) → 6 คู่ (ตำแหน่ง 4-5 … 9-10) */
export function extractPhonePairs(normalized: string): { position: string; pair: string }[] {
  const result: { position: string; pair: string }[] = [];
  for (let i = PAIR_START_DIGIT - 1; i < normalized.length - 1; i += 1) {
    result.push({ position: `${i + 1}-${i + 2}`, pair: normalized.slice(i, i + 2) });
  }
  return result;
}

export function analyzePhonePairs(normalized: string, rules: PairRuleSet): PhonePair[] {
  return extractPhonePairs(normalized).map(({ position, pair }) => {
    const rule = lookupPair(rules, pair);
    return {
      position,
      pair,
      grade: rule ? rule.grade : 'no-data',
      categories: rule ? [...rule.categories] : [],
      meaning: rule ? meaningOf(rule) : null,
      pros: rule?.pros ?? null,
      cons: rule?.cons ?? null,
    };
  });
}

// PlateAnalysis — parse · sums · birthday · pairs · patterns (BR-LP-01..10) — pure
import { fail, ok, type Result } from './errors';
import { gradePlatePair } from './pairs';
import { THAI_CONSONANTS, thaiDigitsToArabic } from './text';
import {
  BIRTH_DAY_LABELS,
  STANDARD_PROFILE,
  type BirthDay,
  type CalcProfile,
  type Grade,
  type LetterRuleSet,
  type PairRuleSet,
  type PlateRuleSet,
} from './types';

const MAX_RAW_LENGTH = 30;

export interface ParsedPlate {
  readonly prefix: string;
  readonly letters: string;
  readonly digits: string;
}

export function parsePlate(raw: string, profile: CalcProfile = STANDARD_PROFILE): Result<ParsedPlate> {
  const text = thaiDigitsToArabic(raw.trim());
  if (text === '') return fail('PLATE_LETTERS_REQUIRED', 'letters');
  if (text.length > MAX_RAW_LENGTH) return fail('PLATE_INVALID_FORMAT', 'plate');
  for (const ch of text) {
    if (!/[0-9\s-]/.test(ch) && !THAI_CONSONANTS.has(ch)) return fail('PLATE_INVALID_LETTER', 'letters');
  }
  const compact = text.replace(/[\s-]/g, '');
  const m = compact.match(/^([0-9]*)([ก-ฮ]*)([0-9]*)$/);
  if (!m) return fail('PLATE_INVALID_FORMAT', 'plate');
  const [, prefix, letters, digits] = m;
  if (letters === '') return fail('PLATE_LETTERS_REQUIRED', 'letters');
  if ([...letters].length > 2) return fail('PLATE_INVALID_FORMAT', 'letters');
  if (prefix.length > 1) return fail('PLATE_INVALID_FORMAT', 'prefix');
  if (prefix !== '' && Number(prefix) < profile.minPrefix) return fail('PLATE_INVALID_PREFIX', 'prefix');
  if (digits === '') return fail('PLATE_DIGITS_REQUIRED', 'digits');
  if (digits.length > 4) return fail('PLATE_INVALID_FORMAT', 'digits');
  if (digits.startsWith('0')) return fail('PLATE_LEADING_ZERO', 'digits');
  return ok({ prefix, letters, digits });
}

export interface SumTerm {
  readonly label: string;
  readonly value: number | null;
  readonly kind: 'prefix' | 'digit' | 'letter';
}
export interface PlateSum {
  readonly method: 'digits-only' | 'with-letters';
  readonly terms: readonly SumTerm[];
  readonly formula: string;
  readonly total: number | null;
  readonly reduced: number | null;
  readonly grade: 'excellent' | 'avoid' | 'no-data';
  readonly meaning: string | null;
}

export function digitalRoot(n: number): number {
  return n === 0 ? 0 : 1 + ((n - 1) % 9);
}

function letterTerms(letters: string, rules: PlateRuleSet, profile: CalcProfile): SumTerm[] {
  const chars = [...letters];
  const list = profile.letterTermMode === 'set' ? [...new Set(chars)] : chars;
  return list.map((c) => ({ label: c, value: rules.letterValues[c] ?? null, kind: 'letter' as const }));
}

function buildSum(method: PlateSum['method'], terms: SumTerm[], rules: PlateRuleSet): PlateSum {
  const hasUnknown = terms.some((t) => t.value === null);
  const total = hasUnknown ? null : terms.reduce((s, t) => s + (t.value ?? 0), 0);
  const parts = terms.map((t) => (t.kind === 'letter' ? `${t.label}(${t.value ?? '?'})` : String(t.value)));
  const g = total === null ? undefined : rules.sumGrades[total];
  return {
    method,
    terms,
    formula: `${parts.join(' + ')} = ${total ?? 'ไม่มีข้อมูล'}`,
    total,
    reduced: total === null ? null : digitalRoot(total),
    grade: g ? g.grade : 'no-data',
    meaning: g ? g.meaning : null,
  };
}

export function computeSums(plate: ParsedPlate, rules: PlateRuleSet, profile: CalcProfile = STANDARD_PROFILE): PlateSum[] {
  const digitTerms: SumTerm[] = [
    ...(plate.prefix ? [{ label: plate.prefix, value: Number(plate.prefix), kind: 'prefix' as const }] : []),
    ...[...plate.digits].map((d) => ({ label: d, value: Number(d), kind: 'digit' as const })),
  ];
  return [
    buildSum('digits-only', digitTerms, rules),
    buildSum('with-letters', [...digitTerms, ...letterTerms(plate.letters, rules, profile)], rules),
  ];
}

export interface PlatePairResult {
  readonly position: string;
  readonly pair: string;
  readonly grade: Grade;
  readonly reason: string | null;
  readonly meaning: string | null;
  readonly pros: string | null;
  readonly cons: string | null;
}

/** คู่เลขติดกันของส่วนตัวเลข (ไม่รวมเลขนำหน้า) */
export function computePlatePairs(digits: string, rules: PlateRuleSet, meanings: PairRuleSet): PlatePairResult[] {
  const result: PlatePairResult[] = [];
  for (let i = 0; i < digits.length - 1; i += 1) {
    const pair = digits.slice(i, i + 2);
    const g = gradePlatePair(pair, rules, meanings);
    result.push({
      position: `${i + 1}-${i + 2}`,
      pair,
      grade: g.grade,
      reason: g.reason,
      meaning: g.rule ? (g.rule.pros ?? g.rule.cons) : null,
      pros: g.rule?.pros ?? null,
      cons: g.rule?.cons ?? null,
    });
  }
  return result;
}

export interface PatternHit {
  readonly id: string;
  readonly reason: string;
}

/**
 * one-bracket: ตัวเลข ≥ 3 หลักที่ขึ้นต้นและลงท้ายด้วย 1 (ตัวอย่างในกฎ: 1771, 1001)
 * front-back-13: [ASSUMPTION] หลักแรก + หลักสุดท้ายของตัวเลข = 13 (กฎต้นทางไม่มีตัวอย่าง)
 */
export function detectPatterns(digits: string, rules: PlateRuleSet): PatternHit[] {
  const checks: Record<string, (d: string) => boolean> = {
    'one-bracket': (d) => d.length >= 3 && d.startsWith('1') && d.endsWith('1'),
    'front-back-13': (d) => d.length >= 2 && Number(d[0]) + Number(d[d.length - 1]) === 13,
  };
  return rules.avoidPatterns.filter((p) => checks[p.id]?.(digits)).map((p) => ({ id: p.id, reason: p.reason }));
}

export interface BirthdayResult {
  readonly day: BirthDay;
  readonly luckyDigits: readonly number[];
  readonly avoidDigits: readonly number[];
  readonly highlightDigits: readonly { value: string; position: number; reason: string; source: string }[];
  readonly highlightLetters: readonly { char: string; reason: string; source: string }[];
}

export function analyzeBirthday(plate: ParsedPlate, day: BirthDay, rules: PlateRuleSet, letterRules: LetterRuleSet): BirthdayResult {
  const dayRule = rules.birthday[day];
  const label = BIRTH_DAY_LABELS[day];
  const numberChars = [...plate.prefix, ...plate.digits];
  const highlightDigits = numberChars
    .map((d, i) => ({ d, i }))
    .filter(({ d }) => dayRule.avoid.includes(Number(d)))
    .map(({ d, i }) => ({ value: d, position: i + 1, reason: `เลข ${d} เป็นเลขที่ควรเลี่ยงสำหรับผู้เกิดวัน${label} ตาม ${rules.source}`, source: rules.id }));
  const avoidLetters = letterRules.avoidLetters[day] ?? [];
  const highlightLetters = [...plate.letters]
    .filter((c) => avoidLetters.includes(c))
    .map((c) => ({ char: c, reason: `อักษร ${c} เป็นอักษรที่ควรเลี่ยงสำหรับผู้เกิดวัน${label} ตาม ${letterRules.source}`, source: letterRules.id }));
  return { day, luckyDigits: dayRule.lucky, avoidDigits: dayRule.avoid, highlightDigits, highlightLetters };
}

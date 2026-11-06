// เสนอเลขทะเบียนตามวันเกิด — pure · ประกอบจากกฎที่มีอยู่เท่านั้น (ไม่สร้างกฎใหม่)
// เงื่อนไข: ตัวเลข 2–4 หลักจาก "เลขมงคลของวัน" ล้วน · ไม่มีคู่ควรเลี่ยง/ควรระวัง · ไม่ตรงรูปแบบควรเลี่ยง · ผลรวมระดับ excellent
import { computePlatePairs, detectPatterns } from './plate';
import { BIRTH_DAY_LABELS, type BirthDay, type LetterRuleSet, type PairRuleSet, type PlateRuleSet } from './types';

export const SUGGEST_LIMIT = 8;
/** ทะเบียนมีตัวเลข 1–4 หลัก · 1 หลักไม่มีคู่เลขให้ตรวจ จึงเสนอ 2–4 หลัก */
const SUGGEST_LENGTHS = [4, 3, 2] as const;

export interface PlateSuggestion {
  readonly digits: string;
  readonly display: string;
  readonly sum: number;
  readonly sumMethod: 'digits-only' | 'with-letters';
  readonly sumMeaning: string | null;
  readonly goodPairs: number;
  readonly pairs: readonly string[];
}

export interface PlateSuggestResult {
  readonly day: BirthDay;
  readonly letters: string;
  readonly luckyDigits: readonly number[];
  readonly avoidDigits: readonly number[];
  readonly letterWarnings: readonly { char: string; reason: string; source: string }[];
  readonly suggestions: readonly PlateSuggestion[];
}

/** ทุกเลข n หลักที่ประกอบจาก digits (ไม่ขึ้นต้น 0) */
function combinations(digits: readonly number[], length: number): string[] {
  const usable = [...digits].sort((a, b) => a - b).map(String);
  let acc = [''];
  for (let i = 0; i < length; i += 1) acc = acc.flatMap((prefix) => usable.map((d) => prefix + d));
  return acc.filter((s) => !s.startsWith('0'));
}

function toSuggestion(digits: string, letterSum: number, letters: string, plate: PlateRuleSet, meanings: PairRuleSet): PlateSuggestion | null {
  if (detectPatterns(digits, plate).length > 0) return null;
  const platePairs = computePlatePairs(digits, plate, meanings);
  if (platePairs.some((p) => p.grade === 'avoid' || p.grade === 'caution')) return null;
  const sum = [...digits].reduce((t, d) => t + Number(d), 0) + letterSum;
  const grade = plate.sumGrades[sum];
  if (grade?.grade !== 'excellent') return null;
  return {
    digits,
    display: letters ? `${letters} ${digits}` : digits,
    sum,
    sumMethod: letters ? 'with-letters' : 'digits-only',
    sumMeaning: grade.meaning,
    goodPairs: platePairs.filter((p) => p.grade === 'good').length,
    pairs: platePairs.map((p) => p.pair),
  };
}

export function suggestPlates(
  input: { day: BirthDay; letters: string },
  plate: PlateRuleSet,
  meanings: PairRuleSet,
  letterRules: LetterRuleSet,
): PlateSuggestResult {
  const { day, letters } = input;
  const dayRule = plate.birthday[day];
  const chars = [...letters];
  const letterSum = chars.reduce((t, c) => t + (plate.letterValues[c] ?? 0), 0);
  const avoidLetters = letterRules.avoidLetters[day] ?? [];
  const letterWarnings = chars
    .filter((c) => avoidLetters.includes(c))
    .map((c) => ({ char: c, reason: `อักษร ${c} เป็นอักษรที่ควรเลี่ยงสำหรับผู้เกิดวัน${BIRTH_DAY_LABELS[day]} ตาม ${letterRules.source}`, source: letterRules.id }));
  const lucky = dayRule.lucky.filter((d) => !dayRule.avoid.includes(d));
  const suggestions = SUGGEST_LENGTHS.flatMap((n) => combinations(lucky, n))
    .map((d) => toSuggestion(d, letterSum, letters, plate, meanings))
    .filter((s): s is PlateSuggestion => s !== null)
    .sort((a, b) => b.goodPairs - a.goodPairs || b.digits.length - a.digits.length || a.digits.localeCompare(b.digits))
    .slice(0, SUGGEST_LIMIT);
  return { day, letters, luckyDigits: dayRule.lucky, avoidDigits: dayRule.avoid, letterWarnings, suggestions };
}

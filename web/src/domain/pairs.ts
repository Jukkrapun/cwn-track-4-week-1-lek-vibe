// Rule Engine — lookup คู่เลข + precedence (BR-PH-06, BR-LP-09, FR-CT-04) — pure
import { fail, ok, type Result } from './errors';
import { thaiDigitsToArabic } from './text';
import type { Grade, PairMeaningRule, PairRuleSet, PlateRuleSet } from './types';

export function lookupPair(rules: PairRuleSet, pair: string): PairMeaningRule | null {
  return rules.groups.find((g) => g.pairs.includes(pair)) ?? null;
}

export function meaningOf(rule: PairMeaningRule): string | null {
  return rule.pros ?? rule.cons;
}

/** ค้นหาคู่เลข: รับ 2 หลัก (รองรับเลขไทย) */
export function normalizePairQuery(raw: string): Result<string> {
  const v = thaiDigitsToArabic(raw.trim());
  if (!/^[0-9]{2}$/.test(v)) return fail('PAIR_INVALID', 'pair');
  return ok(v);
}

export function isOccupationPair(plate: PlateRuleSet, pair: string): boolean {
  return Object.values(plate.occupationPairs).some((list) => list.includes(pair));
}

export interface PlatePairGrade {
  readonly grade: Grade;
  readonly reason: string | null;
  readonly rule: PairMeaningRule | null;
}

/**
 * ระดับคู่เลขทะเบียนตาม precedence: avoidPairs > avoidPatterns > occupationPairs > ความหมายทั่วไป
 * คู่ที่อยู่ทั้ง avoidPairs และ occupationPairs (35/53) = caution และห้ามแนะนำ
 */
export function gradePlatePair(pair: string, plate: PlateRuleSet, meanings: PairRuleSet): PlatePairGrade {
  const rule = lookupPair(meanings, pair);
  const avoidReason = plate.avoidPairs[pair];
  if (avoidReason && isOccupationPair(plate, pair)) {
    return { grade: 'caution', reason: `${avoidReason} (แต่อยู่ในรายการคู่เลขตามอาชีพด้วย จึงแสดงเป็นควรระวัง)`, rule };
  }
  if (avoidReason) return { grade: 'avoid', reason: avoidReason, rule };
  if (rule) return { grade: rule.grade, reason: null, rule };
  return { grade: 'no-data', reason: null, rule: null };
}

/** คู่ที่ห้ามใช้เป็นเลขแนะนำ (avoid ของทะเบียน หรือ caution/avoid ในความหมายทั่วไป) */
export function isRecommendable(pair: string, plate: PlateRuleSet, meanings: PairRuleSet): boolean {
  if (plate.avoidPairs[pair]) return false;
  const rule = lookupPair(meanings, pair);
  return rule !== null && rule.grade === 'good';
}

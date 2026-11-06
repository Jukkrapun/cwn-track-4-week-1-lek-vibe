// คำแนะนำคู่เลขตามอาชีพ / เป้าหมาย (FR-PH-08/09) — มาจาก Rule Set เท่านั้น
import { isRecommendable, lookupPair } from './pairs';
import { PAIR_CATEGORY_LABELS, type CategoryOption, type PairCategory, type PairRuleSet, type PlateRuleSet } from './types';

export const GENERAL_RESULT_MESSAGE = 'ยังไม่มีกฎเฉพาะสำหรับอาชีพนี้ ใช้ผลวิเคราะห์ทั่วไป';

export interface Recommendation {
  readonly occupation: string | null;
  readonly goal: string | null;
  readonly matchedRule: boolean;
  readonly pairs: readonly string[];
  readonly presentInNumber: readonly string[];
  readonly reason: string;
}

export function recommend(
  occupation: CategoryOption | null,
  goal: CategoryOption | null,
  numberPairs: readonly string[],
  plate: PlateRuleSet,
  meanings: PairRuleSet,
): Recommendation | null {
  if (!occupation && !goal) return null;
  const goalCat = goal?.ruleRef ?? null;
  const fitsGoal = (p: string) => !goalCat || (lookupPair(meanings, p)?.categories.includes(goalCat) ?? false);
  const goalText = goal && goalCat ? ` และมีหมวด "${PAIR_CATEGORY_LABELS[goalCat as PairCategory] ?? goalCat}" ตาม ${meanings.name}` : '';

  let pairs: string[];
  let matchedRule = true;
  let reason: string;
  const occList = occupation?.ruleRef ? plate.occupationPairs[occupation.ruleRef] : undefined;

  if (occupation && !occList) {
    matchedRule = false;
    pairs = [];
    reason = GENERAL_RESULT_MESSAGE;
  } else if (occupation && occList) {
    pairs = occList.filter((p) => isRecommendable(p, plate, meanings) && fitsGoal(p));
    reason = `คู่เลขที่ ${plate.source} จัดไว้สำหรับกลุ่มอาชีพ "${occupation.label}"${goalText} โดยไม่รวมคู่ที่อยู่ในรายการควรเลี่ยงหรือควรระวัง`;
  } else {
    pairs = meanings.groups.filter((g) => g.grade === 'good' && goalCat && g.categories.includes(goalCat)).flatMap((g) => [...g.pairs]);
    reason = `คู่เลขระดับดีที่มีหมวด "${PAIR_CATEGORY_LABELS[goalCat as PairCategory] ?? goalCat}" ตาม ${meanings.name}`;
  }
  return {
    occupation: occupation?.id ?? null,
    goal: goal?.id ?? null,
    matchedRule,
    pairs,
    presentInNumber: pairs.filter((p) => numberPairs.includes(p)),
    reason,
  };
}

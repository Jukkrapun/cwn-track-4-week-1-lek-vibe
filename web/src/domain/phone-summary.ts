// สรุปคู่เลขตามหมวด (กราฟเบอร์โทร) — pure, ไม่สร้างกฎใหม่ นับจากระดับของคู่ที่วิเคราะห์แล้วเท่านั้น
import { PAIR_CATEGORIES, type PairCategory } from './types';

export interface SummarizablePair {
  readonly grade: string;
  readonly categories: readonly string[];
}

export interface CategorySummary {
  readonly category: PairCategory;
  /** จำนวนคู่ด้านส่งเสริม (good/excellent + caution) */
  readonly positive: number;
  /** จำนวนคู่ด้านควรระวัง (avoid + caution) */
  readonly negative: number;
}

const POSITIVE_GRADES = new Set(['good', 'excellent', 'caution']);
const NEGATIVE_GRADES = new Set(['avoid', 'caution']);

/** caution มีทั้งข้อดีและข้อควรระวัง จึงนับทั้งสองฝั่ง · no-data ไม่นับ */
export function summarizeByCategory(pairs: readonly SummarizablePair[]): CategorySummary[] {
  return PAIR_CATEGORIES.map((category) => {
    const inCategory = pairs.filter((p) => p.categories.includes(category));
    return {
      category,
      positive: inCategory.filter((p) => POSITIVE_GRADES.has(p.grade)).length,
      negative: inCategory.filter((p) => NEGATIVE_GRADES.has(p.grade)).length,
    };
  });
}

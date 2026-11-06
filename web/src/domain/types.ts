// ชนิดข้อมูลของ Domain — ไม่มี I/O
export type PairGrade = 'good' | 'caution' | 'avoid';
export type Grade = PairGrade | 'no-data';
export type SumGradeValue = 'excellent' | 'avoid';
export type BirthDay = 'sun' | 'mon' | 'tue' | 'wed-day' | 'wed-night' | 'thu' | 'fri' | 'sat';

export const BIRTH_DAYS: readonly BirthDay[] = ['sun', 'mon', 'tue', 'wed-day', 'wed-night', 'thu', 'fri', 'sat'];
export const BIRTH_DAY_LABELS: Record<BirthDay, string> = {
  sun: 'อาทิตย์',
  mon: 'จันทร์',
  tue: 'อังคาร',
  'wed-day': 'พุธ (กลางวัน)',
  'wed-night': 'พุธ (กลางคืน)',
  thu: 'พฤหัสบดี',
  fri: 'ศุกร์',
  sat: 'เสาร์',
};
export const PAIR_CATEGORIES = ['work', 'money', 'love', 'communication', 'health', 'luck'] as const;
export type PairCategory = (typeof PAIR_CATEGORIES)[number];
export const PAIR_CATEGORY_LABELS: Record<PairCategory, string> = {
  work: 'การงาน',
  money: 'การเงิน',
  love: 'ความรัก',
  communication: 'การสื่อสาร',
  health: 'สุขภาพ',
  luck: 'โชคลาภ',
};

export interface RuleSetRef {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly source: string;
  readonly sourceUrl: string | null;
  readonly isMock: boolean;
}

export interface PairMeaningRule {
  readonly pairs: readonly string[];
  readonly grade: PairGrade;
  readonly categories: readonly string[];
  readonly pros: string | null;
  readonly cons: string | null;
  readonly source: string;
}

export interface PairRuleSet extends RuleSetRef {
  readonly groups: readonly PairMeaningRule[];
}

export interface PlateRuleSet extends RuleSetRef {
  readonly letterValues: Readonly<Record<string, number>>;
  readonly sumGrades: Readonly<Record<number, { grade: SumGradeValue; meaning: string | null }>>;
  readonly birthday: Readonly<Record<BirthDay, { lucky: readonly number[]; avoid: readonly number[] }>>;
  readonly avoidPairs: Readonly<Record<string, string>>;
  readonly avoidPatterns: readonly { id: string; reason: string }[];
  readonly occupationPairs: Readonly<Record<string, readonly string[]>>;
}

export interface LetterRuleSet extends RuleSetRef {
  readonly avoidLetters: Readonly<Record<BirthDay, readonly string[]>>;
}

export interface CategoryOption {
  readonly id: string;
  readonly type: 'OCCUPATION' | 'GOAL' | 'PHONE_TYPE';
  readonly label: string;
  readonly ruleRef: string | null;
}

/** ตัวเลือกการคำนวณที่ส่งมาจาก Application layer */
export interface CalcProfile {
  readonly letterTermMode: 'each' | 'set';
  readonly minPrefix: 0 | 1;
}
export const STANDARD_PROFILE: CalcProfile = { letterTermMode: 'each', minPrefix: 1 };

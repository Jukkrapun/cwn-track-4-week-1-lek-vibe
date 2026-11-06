// Application service: วิเคราะห์เบอร์ / ทะเบียน / ค้นหาคู่เลข — ใช้ Rule Set ที่ Published เท่านั้น
import { AppError } from '@/domain/errors';
import { meaningOf, lookupPair, normalizePairQuery } from '@/domain/pairs';
import { analyzePhonePairs, normalizePhone } from '@/domain/phone';
import { analyzeBirthday, computePlatePairs, computeSums, detectPatterns, parsePlate } from '@/domain/plate';
import { suggestPlates } from '@/domain/plate-suggest';
import { recommend } from '@/domain/recommendation';
import { maskPhone, maskPlate, THAI_CONSONANTS } from '@/domain/text';
import { BIRTH_DAYS, type BirthDay, type CategoryOption, type LetterRuleSet, type PairRuleSet, type PlateRuleSet, type RuleSetRef } from '@/domain/types';
import {
  activeCategories,
  findPublishedVersion,
  loadLetterRuleSet,
  loadPairRuleSet,
  loadPlateRuleSet,
  RULE_SET_IDS,
} from '@/infrastructure/rule-repository';
import { incrementUsage } from '@/infrastructure/stats-repository';
import { now } from '@/shared/clock';
import { runtimeProfile } from '@/shared/runtime-profile';

export const PHONE_DISCLAIMER = 'ผลลัพธ์ตามความเชื่อ ไม่ใช่ข้อเท็จจริงทางวิทยาศาสตร์';
export const PLATE_NOTICES = ['ไม่ได้ยืนยันสถานะทะเบียน', 'เป็นความเชื่อ ไม่ใช่ข้อห้ามตามกฎหมาย'] as const;

export interface PublishedRules {
  pairs: PairRuleSet;
  plate: PlateRuleSet;
  letters: LetterRuleSet;
  categoriesRef: RuleSetRef;
  categories: CategoryOption[];
}

/** NFR-19: โหลดกฎไม่ได้ → INTERNAL_ERROR */
export async function loadPublishedRules(): Promise<PublishedRules> {
  const [pv, wv, av, cv] = await Promise.all(
    [RULE_SET_IDS.pairs, RULE_SET_IDS.wongnai, RULE_SET_IDS.allianz, RULE_SET_IDS.categories].map((id) => findPublishedVersion(id)),
  );
  if (!pv || !wv || !av || !cv) throw new AppError('INTERNAL_ERROR');
  const [pairs, plate, letters, categories] = await Promise.all([loadPairRuleSet(pv), loadPlateRuleSet(wv), loadLetterRuleSet(av), activeCategories()]);
  return {
    pairs,
    plate,
    letters,
    categoriesRef: { id: cv.rule_set_id, name: cv.rule_set_name, version: cv.version ?? '', source: cv.source_name, sourceUrl: null, isMock: cv.is_mock },
    categories,
  };
}

const refJson = (r: RuleSetRef) => ({ id: r.id, name: r.name, version: r.version, source: r.source, sourceUrl: r.sourceUrl, isMock: r.isMock });

function optionalString(body: Record<string, unknown>, key: string): string | null {
  const v = body[key];
  if (v === undefined || v === null || v === '') return null;
  if (typeof v !== 'string') throw new AppError('INVALID_REQUEST', key);
  return v;
}

function pickCategory(cats: CategoryOption[], type: CategoryOption['type'], id: string | null, field: string): CategoryOption | null {
  if (id === null) return null;
  const c = cats.find((x) => x.type === type && x.id === id);
  if (!c) throw new AppError('INVALID_OPTION', field);
  return c;
}

export async function analyzePhone(body: Record<string, unknown>, onMasked: (m: string) => void) {
  if (typeof body.number !== 'string') throw new AppError('INVALID_REQUEST', 'number');
  const n = normalizePhone(body.number);
  onMasked(maskPhone(n.ok ? n.value : body.number));
  if (!n.ok) throw new AppError(n.code, n.field);
  const rules = await loadPublishedRules();
  const occupation = pickCategory(rules.categories, 'OCCUPATION', optionalString(body, 'occupation'), 'occupation');
  const goal = pickCategory(rules.categories, 'GOAL', optionalString(body, 'goal'), 'goal');
  const pairs = analyzePhonePairs(n.value, rules.pairs);
  await incrementUsage('PHONE', now());
  return {
    normalized: n.value,
    ruleSet: refJson(rules.pairs),
    pairs,
    recommendation: recommend(occupation, goal, pairs.map((p) => p.pair), rules.plate, rules.pairs),
    recommendationSource: occupation || goal ? refJson(rules.plate) : null,
    categoriesRuleSet: refJson(rules.categoriesRef),
    disclaimer: PHONE_DISCLAIMER,
  };
}

export async function analyzePlate(body: Record<string, unknown>, onMasked: (m: string) => void) {
  const profile = runtimeProfile().calc;
  let raw: string;
  if (typeof body.plate === 'string') raw = body.plate;
  else {
    const parts = ['prefix', 'letters', 'digits'].map((k) => optionalString(body, k) ?? '');
    raw = `${parts[0].trim()}${parts[1].trim()} ${parts[2].trim()}`;
  }
  optionalString(body, 'province'); // BR-LP-10: รับได้แต่ไม่ใช้คำนวณ
  const birthDayRaw = optionalString(body, 'birthDay');
  const p = parsePlate(raw, profile);
  if (!p.ok) {
    onMasked('***');
    throw new AppError(p.code, p.field);
  }
  onMasked(maskPlate(p.value.prefix, p.value.letters, p.value.digits));
  if (birthDayRaw !== null && !BIRTH_DAYS.includes(birthDayRaw as BirthDay)) throw new AppError('INVALID_OPTION', 'birthDay');
  const rules = await loadPublishedRules();
  const sums = computeSums(p.value, rules.plate, profile);
  await incrementUsage('PLATE', now());
  return {
    plate: {
      prefix: p.value.prefix,
      letters: [...p.value.letters].map((c) => ({ char: c, value: rules.plate.letterValues[c] ?? null })),
      digits: p.value.digits,
      display: `${p.value.prefix}${p.value.letters} ${p.value.digits}`,
    },
    ruleSets: [
      { ...refJson(rules.plate), usedFor: 'sums, birthDayDigits, avoidPairs, patterns' },
      { ...refJson(rules.letters), usedFor: 'avoidLetters' },
      { ...refJson(rules.pairs), usedFor: 'pairMeanings' },
    ],
    sums,
    pairs: computePlatePairs(p.value.digits, rules.plate, rules.pairs),
    patterns: detectPatterns(p.value.digits, rules.plate),
    birthDay: birthDayRaw ? analyzeBirthday(p.value, birthDayRaw as BirthDay, rules.plate, rules.letters) : null,
    disclaimer: 'ข้อมูลตามความเชื่อ ไม่ใช่ข้อเท็จจริงทางวิทยาศาสตร์หรือข้อกำหนดทางกฎหมาย การขับขี่อย่างปลอดภัยสำคัญที่สุด',
    notices: [...PLATE_NOTICES],
  };
}

const MAX_SUGGEST_LETTERS = 2;

/** เสนอเลขทะเบียนตามวันเกิด — วันเกิดบังคับ · หมวดอักษรไม่บังคับ (ถ้ากรอกใช้คิดผลรวมรวมค่าอักษร) */
export async function suggestPlate(body: Record<string, unknown>, onMasked: (m: string) => void) {
  onMasked('***');
  const day = optionalString(body, 'birthDay');
  if (day === null) throw new AppError('BIRTHDAY_REQUIRED', 'birthDay');
  if (!BIRTH_DAYS.includes(day as BirthDay)) throw new AppError('INVALID_OPTION', 'birthDay');
  const letters = (optionalString(body, 'letters') ?? '').replace(/[\s-]/g, '');
  if ([...letters].some((c) => !THAI_CONSONANTS.has(c))) throw new AppError('PLATE_INVALID_LETTER', 'letters');
  if ([...letters].length > MAX_SUGGEST_LETTERS) throw new AppError('PLATE_INVALID_FORMAT', 'letters');
  const rules = await loadPublishedRules();
  await incrementUsage('PLATE', now());
  return {
    ...suggestPlates({ day: day as BirthDay, letters }, rules.plate, rules.pairs, rules.letters),
    ruleSets: [
      { ...refJson(rules.plate), usedFor: 'birthDayDigits, sums, avoidPairs, patterns' },
      { ...refJson(rules.letters), usedFor: 'avoidLetters' },
      { ...refJson(rules.pairs), usedFor: 'pairMeanings' },
    ],
    disclaimer: 'ข้อมูลตามความเชื่อ ไม่ใช่ข้อเท็จจริงทางวิทยาศาสตร์หรือข้อกำหนดทางกฎหมาย การขับขี่อย่างปลอดภัยสำคัญที่สุด',
    notices: [...PLATE_NOTICES],
  };
}

export async function searchPair(raw: string) {
  const q = normalizePairQuery(raw.slice(0, 50));
  if (!q.ok) throw new AppError(q.code, q.field);
  const rules = await loadPublishedRules();
  const rule = lookupPair(rules.pairs, q.value);
  await incrementUsage('PAIR_SEARCH', now());
  return {
    pair: q.value,
    group: rule ? rule.pairs : [q.value],
    grade: rule ? rule.grade : 'no-data',
    meaning: rule ? meaningOf(rule) : null,
    pros: rule?.pros ?? null,
    cons: rule?.cons ?? null,
    categories: rule ? [...rule.categories] : [],
    source: rule?.source ?? null,
    ruleSet: refJson(rules.pairs),
  };
}

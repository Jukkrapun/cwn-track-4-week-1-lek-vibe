// สร้าง Rule Set ของ Domain จาก reference-data JSON (ใช้เฉพาะใน unit test)
import fs from 'node:fs';
import path from 'node:path';
import { BIRTH_DAYS, type BirthDay, type LetterRuleSet, type PairRuleSet, type PlateRuleSet } from '../../src/domain/types';

const ref = path.resolve(__dirname, '../../../user-story/reference-data');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const read = (f: string): any => JSON.parse(fs.readFileSync(path.join(ref, f), 'utf8'));

export function loadPairs(): PairRuleSet {
  const j = read('pair-meanings.json');
  return {
    id: j.ruleSetId, name: 'ความหมายคู่เลข', version: j.version, source: j.source.name, sourceUrl: null, isMock: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groups: j.pairs.map((p: any) => ({ pairs: p.pairs, grade: p.grade, categories: p.categories, pros: p.pros, cons: p.cons, source: j.source.name })),
  };
}

export function loadPlate(): PlateRuleSet {
  const j = read('plate-rules.json');
  const letterValues: Record<string, number> = {};
  for (const [v, ls] of Object.entries(j.letterValues)) if (!v.startsWith('_')) for (const l of ls as string[]) letterValues[l] = Number(v);
  const sumGrades: PlateRuleSet['sumGrades'] = {};
  for (const g of j.sumGrades) for (const s of g.sums) (sumGrades as Record<number, unknown>)[s] = { grade: g.grade, meaning: g.pros ?? g.cons };
  const birthday = Object.fromEntries(BIRTH_DAYS.map((d) => [d, j.birthDay[d]])) as PlateRuleSet['birthday'];
  const avoidPairs: Record<string, string> = {};
  for (const g of j.avoidPairs) for (const p of g.pairs) avoidPairs[p] = g.reason;
  return {
    id: j.ruleSetId, name: 'Wongnai', version: j.version, source: j.source.name, sourceUrl: j.source.url, isMock: false,
    letterValues, sumGrades, birthday, avoidPairs,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    avoidPatterns: j.avoidPatterns.map((p: any) => ({ id: p.id, reason: p.description })),
    occupationPairs: j.occupationPairs,
  };
}

export function loadLetters(): LetterRuleSet {
  const j = read('plate-rules-allianz.json');
  const avoidLetters = Object.fromEntries(BIRTH_DAYS.map((d: BirthDay) => [d, j.birthDay[d].avoidLetters])) as LetterRuleSet['avoidLetters'];
  return { id: j.ruleSetId, name: 'Allianz', version: j.version, source: j.source.name, sourceUrl: j.source.url, isMock: false, avoidLetters };
}

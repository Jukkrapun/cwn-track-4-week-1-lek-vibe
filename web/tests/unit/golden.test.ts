import { describe, expect, it } from 'vitest';
import golden from '../../src/domain/fixtures/golden-cases.json';
import { analyzePhonePairs, normalizePhone } from '../../src/domain/phone';
import { analyzeBirthday, computePlatePairs, computeSums, parsePlate } from '../../src/domain/plate';
import type { BirthDay } from '../../src/domain/types';
import { loadLetters, loadPairs, loadPlate } from './fixtures';

const pairs = loadPairs();
const plate = loadPlate();
const letters = loadLetters();

describe('Golden — phone pairs (NFR-03)', () => {
  it.each(golden.phonePairs)('$id $number', (c) => {
    const n = normalizePhone(c.number);
    expect(n.ok).toBe(true);
    if (!n.ok) return;
    expect(analyzePhonePairs(n.value, pairs).map(({ pair, grade }) => ({ pair, grade }))).toEqual(c.pairs);
  });
});

const plateCases = [...golden.plateSums, ...golden.plateBirthday, ...golden.platePairs];
describe('Golden — plate sums / pairs / birthday', () => {
  it.each(plateCases)('$id $plate', (c) => {
    const p = parsePlate(c.plate);
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    expect(p.value).toEqual({ prefix: c.prefix, letters: c.letters, digits: c.digits });
    const [d, l] = computeSums(p.value, plate);
    expect([d.total, d.grade, l.total, l.grade]).toEqual([c.sumDigits, c.gradeDigits, c.sumLetters, c.gradeLetters]);
    expect(computePlatePairs(p.value.digits, plate, pairs).map(({ pair, grade }) => ({ pair, grade }))).toEqual(c.pairs);
    if ('day' in c) {
      const bc = c as unknown as { highlightDigits: string[]; highlightLetters: string[] };
      const b = analyzeBirthday(p.value, c.day as BirthDay, plate, letters);
      expect(b.highlightDigits.map((h) => h.value)).toEqual(bc.highlightDigits);
      expect(b.highlightLetters.map((h) => h.char)).toEqual(bc.highlightLetters);
    }
  });
});

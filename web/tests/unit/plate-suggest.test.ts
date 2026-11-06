import { describe, expect, it } from 'vitest';
import { computePlatePairs, detectPatterns } from '../../src/domain/plate';
import { suggestPlates, SUGGEST_LIMIT } from '../../src/domain/plate-suggest';
import { BIRTH_DAYS } from '../../src/domain/types';
import { loadLetters, loadPairs, loadPlate } from './fixtures';

const plate = loadPlate();
const pairs = loadPairs();
const letters = loadLetters();

describe('suggestPlates — เสนอเลขทะเบียนตามวันเกิด', () => {
  it.each(BIRTH_DAYS)('%s: every suggestion follows all existing rules', (day) => {
    const r = suggestPlates({ day, letters: '' }, plate, pairs, letters);
    expect(r.suggestions.length).toBeLessThanOrEqual(SUGGEST_LIMIT);
    for (const s of r.suggestions) {
      expect(s.digits).toMatch(/^[1-9][0-9]{1,3}$/);
      for (const d of s.digits) expect(plate.birthday[day].lucky).toContain(Number(d));
      expect(computePlatePairs(s.digits, plate, pairs).some((p) => p.grade === 'avoid' || p.grade === 'caution')).toBe(false);
      expect(detectPatterns(s.digits, plate)).toEqual([]);
      expect(plate.sumGrades[s.sum]?.grade).toBe('excellent');
    }
  });

  it('is deterministic and sorted by good pairs, then longer number, then numerically', () => {
    const a = suggestPlates({ day: 'sun', letters: '' }, plate, pairs, letters);
    const b = suggestPlates({ day: 'sun', letters: '' }, plate, pairs, letters);
    expect(a).toEqual(b);
    for (let i = 1; i < a.suggestions.length; i += 1) {
      const [prev, cur] = [a.suggestions[i - 1], a.suggestions[i]];
      const longer = prev.digits.length > cur.digits.length;
      const same = prev.goodPairs === cur.goodPairs && prev.digits.length === cur.digits.length;
      expect(prev.goodPairs > cur.goodPairs || (prev.goodPairs === cur.goodPairs && longer) || (same && prev.digits < cur.digits)).toBe(true);
    }
  });

  it('with letters: sum includes letter values and display shows the letters', () => {
    const r = suggestPlates({ day: 'sun', letters: 'กข' }, plate, pairs, letters);
    for (const s of r.suggestions) {
      const digitSum = [...s.digits].reduce((t, d) => t + Number(d), 0);
      expect(s.sum).toBe(digitSum + plate.letterValues['ก'] + plate.letterValues['ข']);
      expect(s.sumMethod).toBe('with-letters');
      expect(s.display).toBe(`กข ${s.digits}`);
    }
  });

  it('without letters: uses digits-only sum', () => {
    const r = suggestPlates({ day: 'mon', letters: '' }, plate, pairs, letters);
    for (const s of r.suggestions) expect(s.sumMethod).toBe('digits-only');
  });

  it('warns when a chosen letter is an avoid-letter for that day', () => {
    const day = BIRTH_DAYS.find((d) => letters.avoidLetters[d].length > 0)!;
    const bad = letters.avoidLetters[day][0];
    const r = suggestPlates({ day, letters: bad }, plate, pairs, letters);
    expect(r.letterWarnings.map((w) => w.char)).toEqual([bad]);
  });

  it.each(BIRTH_DAYS)('%s: always has suggestions when no letters are given', (day) => {
    expect(suggestPlates({ day, letters: '' }, plate, pairs, letters).suggestions.length).toBeGreaterThan(0);
  });

  it('sun + กข has no combination passing every rule → empty list (UI shows a message)', () => {
    expect(suggestPlates({ day: 'sun', letters: 'กข' }, plate, pairs, letters).suggestions).toEqual([]);
  });

  it('returns luckyDigits / avoidDigits of the day for display', () => {
    const r = suggestPlates({ day: 'tue', letters: '' }, plate, pairs, letters);
    expect(r.luckyDigits).toEqual(plate.birthday.tue.lucky);
    expect(r.avoidDigits).toEqual(plate.birthday.tue.avoid);
  });
});

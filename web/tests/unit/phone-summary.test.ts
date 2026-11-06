import { describe, expect, it } from 'vitest';
import { analyzePhonePairs } from '../../src/domain/phone';
import { summarizeByCategory } from '../../src/domain/phone-summary';
import { PAIR_CATEGORIES } from '../../src/domain/types';
import { loadPairs } from './fixtures';

const pair = (grade: string, categories: string[]) => ({ grade, categories });

describe('summarizeByCategory', () => {
  it('returns every category in fixed order even when no pair matches', () => {
    const r = summarizeByCategory([]);
    expect(r.map((c) => c.category)).toEqual([...PAIR_CATEGORIES]);
    expect(r.every((c) => c.positive === 0 && c.negative === 0)).toBe(true);
  });

  it('counts good on the positive side and avoid on the negative side', () => {
    const r = summarizeByCategory([pair('good', ['money']), pair('good', ['money', 'work']), pair('avoid', ['money'])]);
    expect(r.find((c) => c.category === 'money')).toMatchObject({ positive: 2, negative: 1 });
    expect(r.find((c) => c.category === 'work')).toMatchObject({ positive: 1, negative: 0 });
  });

  it('counts caution on both sides because it has pros and cons', () => {
    const r = summarizeByCategory([pair('caution', ['love'])]);
    expect(r.find((c) => c.category === 'love')).toMatchObject({ positive: 1, negative: 1 });
  });

  it('ignores no-data pairs and unknown categories', () => {
    const r = summarizeByCategory([pair('no-data', []), pair('good', ['unknown'])]);
    expect(r.every((c) => c.positive === 0 && c.negative === 0)).toBe(true);
  });

  it('PD-G01 0812345678 — totals never exceed the 6 analysed pairs', () => {
    const pairs = analyzePhonePairs('0812345678', loadPairs());
    for (const c of summarizeByCategory(pairs)) {
      expect(c.positive).toBeLessThanOrEqual(pairs.length);
      expect(c.negative).toBeLessThanOrEqual(pairs.length);
    }
  });
});

import { describe, expect, it } from 'vitest';
import { analyzeBirthday, computePlatePairs, computeSums, detectPatterns, digitalRoot, parsePlate } from '../../src/domain/plate';
import { loadLetters, loadPairs, loadPlate } from './fixtures';

const plate = loadPlate();
const pairs = loadPairs();

function parsed(input: string) {
  const p = parsePlate(input);
  if (!p.ok) throw new Error(`parse failed: ${input}`);
  return p.value;
}

describe('parsePlate — LD-V*', () => {
  it.each([
    ['กข 1234', '', 'กข', '1234'], ['1กข 234', '1', 'กข', '234'], ['ก 1', '', 'ก', '1'], ['กข1234', '', 'กข', '1234'],
    ['กข-1234', '', 'กข', '1234'], ['9ฆฆ 9999', '9', 'ฆฆ', '9999'], ['๑กข ๑๒๓๔', '1', 'กข', '1234'],
  ])('%s', (input, prefix, letters, digits) => {
    expect(parsePlate(input)).toEqual({ ok: true, value: { prefix, letters, digits } });
  });
});

describe('parsePlate — LD-I*', () => {
  it.each([
    ['0กข 1', 'PLATE_INVALID_PREFIX'], ['10กข 1', 'PLATE_INVALID_FORMAT'], ['12กข 34', 'PLATE_INVALID_FORMAT'],
    ['1234', 'PLATE_LETTERS_REQUIRED'], ['กขค 123', 'PLATE_INVALID_FORMAT'], ['AB 1234', 'PLATE_INVALID_LETTER'],
    ['กา 123', 'PLATE_INVALID_LETTER'], ['ก่ข 12', 'PLATE_INVALID_LETTER'], ['กข', 'PLATE_DIGITS_REQUIRED'],
    ['กข 12345', 'PLATE_INVALID_FORMAT'], ['กข 0', 'PLATE_LEADING_ZERO'], ['กข 0123', 'PLATE_LEADING_ZERO'],
    ['', 'PLATE_LETTERS_REQUIRED'], ["' OR 1=1 --", 'PLATE_INVALID_LETTER'], ['ก1ข2', 'PLATE_INVALID_FORMAT'], ['ฤ 1', 'PLATE_INVALID_LETTER'],
  ])('%j → %s', (input, code) => {
    const r = parsePlate(input);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe(code);
  });
});

describe('sums — LD-S*', () => {
  it.each([
    ['ก 1', 1, 2], ['9ฆฆ 9999', 45, 51], ['9ฎฎ 9999', 45, 63], ['1ก 1', 2, 3], ['กข 9999', 36, 39], ['ศส 5656', 22, 36],
  ])('%s → %i / %i', (input, d, l) => {
    const [a, b] = computeSums(parsed(input), plate);
    expect([a.total, b.total]).toEqual([d, l]);
  });
  it('formula & reduce (LD-S15)', () => {
    const [a, b] = computeSums(parsed('1กข 5900'), plate);
    expect(a.formula).toBe('1 + 5 + 9 + 0 + 0 = 15');
    expect(b.formula).toBe('1 + 5 + 9 + 0 + 0 + ก(1) + ข(2) = 18');
    expect(a.reduced).toBe(6);
    expect(digitalRoot(0)).toBe(0);
  });
  it('letter without value → no-data', () => {
    expect(computeSums(parsed('ฃ 1'), plate)[1]).toMatchObject({ total: null, grade: 'no-data' });
  });
  it('set mode counts repeated letters once', () => {
    expect(computeSums(parsed('ฆฆ 9999'), plate, { letterTermMode: 'set', minPrefix: 1 })[1].total).toBe(39);
  });
});

describe('patterns & pairs', () => {
  it.each([['1771', ['one-bracket']], ['1001', ['one-bracket']], ['3070', []], ['49', ['front-back-13']], ['7', []]])('%s', (d, ids) => {
    expect(detectPatterns(d, plate).map((p) => p.id)).toEqual(ids);
  });
  it('ก 7 has no pairs; 00 avoid reason; 35 caution; 55 good', () => {
    expect(computePlatePairs('7', plate, pairs)).toEqual([]);
    expect(computePlatePairs('5900', plate, pairs)[2]).toMatchObject({ grade: 'avoid', reason: 'เชื่อว่ารถซ่อมบ่อย' });
    expect(computePlatePairs('3553', plate, pairs).map((p) => p.grade)).toEqual(['caution', 'good', 'caution']);
  });
  it('mon avoids vowels only → no consonant highlighted', () => {
    expect(analyzeBirthday(parsed('กข 1234'), 'mon', plate, loadLetters()).highlightLetters).toEqual([]);
  });
  it('prefix 0 allowed only with minPrefix 0', () => {
    expect(parsePlate('0กข 1', { letterTermMode: 'each', minPrefix: 0 }).ok).toBe(true);
  });
});

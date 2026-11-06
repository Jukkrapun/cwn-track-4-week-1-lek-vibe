import { describe, expect, it } from 'vitest';
import { analyzePhonePairs, extractPhonePairs, normalizePhone } from '../../src/domain/phone';
import { normalizePairQuery, lookupPair } from '../../src/domain/pairs';
import { recommend, GENERAL_RESULT_MESSAGE } from '../../src/domain/recommendation';
import { maskPhone, maskPlate } from '../../src/domain/text';
import { loadPairs, loadPlate } from './fixtures';

describe('normalizePhone — PD-V*', () => {
  it.each([
    ['0812345678'], ['0612345678'], ['0912345678'], ['081-234-5678'], ['081 234 5678'], ['+66812345678'],
    ['66812345678'], ['  0812345678  '], ['๐๘๑๒๓๔๕๖๗๘'], ['+66-81-234-5678'],
  ])('%s is valid', (input) => {
    const r = normalizePhone(input);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toMatch(/^0[689]\d{8}$/);
  });
  it('normalizes to 0812345678', () => {
    expect(normalizePhone('+66-81-234-5678')).toEqual({ ok: true, value: '0812345678' });
  });
});

describe('normalizePhone — PD-I*', () => {
  it.each([
    ['', 'PHONE_REQUIRED'], ['   ', 'PHONE_REQUIRED'], ['081234567', 'PHONE_INVALID_LENGTH'],
    ['08123456789', 'PHONE_INVALID_LENGTH'], ['08123', 'PHONE_INVALID_LENGTH'], ['081234567890', 'PHONE_INVALID_LENGTH'],
    ['+6681234567', 'PHONE_INVALID_LENGTH'], ['+668123456789', 'PHONE_INVALID_LENGTH'], ['08a2345678', 'PHONE_INVALID_CHAR'],
    ['0812.345.678', 'PHONE_INVALID_CHAR'], ['021234567', 'PHONE_NOT_MOBILE'], ['0512345678', 'PHONE_NOT_MOBILE'],
    ['0712345678', 'PHONE_NOT_MOBILE'], ['1812345678', 'PHONE_NOT_MOBILE'], ['+1 202 555 0100', 'PHONE_NOT_MOBILE'],
    ['0'.repeat(21), 'PHONE_INVALID_LENGTH'], ['<script>alert(1)</script>', 'PHONE_INVALID_CHAR'], ['<b>', 'PHONE_INVALID_CHAR'],
  ])('%j → %s', (input, code) => {
    const r = normalizePhone(input);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe(code);
  });
});

describe('pairs', () => {
  const rules = loadPairs();
  it('extracts 6 pairs with positions 4-5 … 9-10 (skips first 3 digits)', () => {
    const p = extractPhonePairs('0812345678');
    expect(p).toHaveLength(6);
    expect(p[0]).toEqual({ position: '4-5', pair: '23' });
    expect(p[5]).toEqual({ position: '9-10', pair: '78' });
  });
  it('no-data pair has no prediction', () => {
    const r = analyzePhonePairs('0812334567', rules)[1];
    expect(r).toMatchObject({ pair: '33', grade: 'no-data', pros: null, cons: null, meaning: null });
  });
  it('24 and 42 share meaning; 00 avoid', () => {
    expect(lookupPair(rules, '24')).toBe(lookupPair(rules, '42'));
    expect(lookupPair(rules, '00')?.cons).toBe('เก็บตัว เครียดง่าย อารมณ์แปรปรวน ควรดูแลสุขภาพ');
  });
  it.each([['24', true], ['๒๔', true], ['2', false], ['245', false], ['ab', false], ['<img src=x>', false]])('pair query %s', (q, valid) => {
    expect(normalizePairQuery(q).ok).toBe(valid);
  });
});

describe('recommend — PD-O*', () => {
  const pairs = loadPairs();
  const plate = loadPlate();
  const trade = { id: 'trade', type: 'OCCUPATION' as const, label: 'ค้าขาย', ruleRef: 'trade-online' };
  const freelance = { id: 'freelance', type: 'OCCUPATION' as const, label: 'ฟรีแลนซ์', ruleRef: null };
  const tech = { id: 'technician-engineer', type: 'OCCUPATION' as const, label: 'ช่าง', ruleRef: 'technician-doctor-engineer-traveler' };
  const money = { id: 'money', type: 'GOAL' as const, label: 'การเงิน', ruleRef: 'money' };
  it('trade gives pairs + reason', () => {
    const r = recommend(trade, null, ['89', '24'], plate, pairs);
    expect(r?.matchedRule).toBe(true);
    expect(r?.pairs).toContain('24');
    expect(r?.presentInNumber).toEqual(['24', '89']);
  });
  it('none selected → null', () => expect(recommend(null, null, [], plate, pairs)).toBeNull());
  it('freelance → general message', () => {
    expect(recommend(freelance, null, [], plate, pairs)).toMatchObject({ matchedRule: false, reason: GENERAL_RESULT_MESSAGE });
  });
  it('money goal → every pair has money category', () => {
    const r = recommend(null, money, [], plate, pairs);
    expect(r?.pairs.length).toBeGreaterThan(0);
    for (const p of r!.pairs) expect(lookupPair(pairs, p)?.categories).toContain('money');
  });
  it('35/53 never recommended', () => {
    expect(recommend(tech, null, [], plate, pairs)?.pairs).not.toContain('35');
  });
});

describe('mask', () => {
  it('phone', () => expect(maskPhone('0812345678')).toBe('081****678'));
  it('plate', () => expect(maskPlate('', 'กข', '1234')).toBe('กข **34'));
});

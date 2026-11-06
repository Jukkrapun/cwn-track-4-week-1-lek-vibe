import type { Page } from '@playwright/test';
import { test, expect, gotoReady } from '../support/fixtures';
import { tc } from '../support/plan';
import { analyzePlate, readPairs, suggestPlateUi } from '../support/pages';
import { code, message, phone, plate, suggestPlate } from '../support/helpers';
import type { ApiResult } from '../support/api';

type Sum = { method: string; total: number | null; grade: string };
const sums = (r: ApiResult) => {
  const list: Sum[] = r.body?.data?.sums ?? [];
  const d = list.find((s) => s.method === 'digits-only');
  const l = list.find((s) => s.method === 'with-letters');
  return { digits: d?.total, digitsGrade: d?.grade, letters: l?.total, lettersGrade: l?.grade };
};
const pairsOf = (r: ApiResult) => (r.body?.data?.pairs ?? []) as Array<{ pair: string; grade: string }>;

{
  const t = tc('TC-LP-01');
  test(t.title, t.details, async ({ page }) => {
    await test.step('เปิด /plate กรอก 1กข 5900 + วันเกิด sun แล้ววิเคราะห์', async () => {
      await gotoReady(page, '/plate');
      const res = await analyzePlate(page, { prefix: '1', letters: 'กข', digits: '5900', birthDay: 'sun' });
      expect.soft(res?.status()).toBe(200);
    });
    await test.step('ผลรวมเฉพาะตัวเลข 15 (excellent) · รวมอักษร 18 (no-data) — ไม่ใช่ค่าลด 6/9', async () => {
      await expect.soft(page.getByTestId('sum-digits')).toHaveAttribute('data-value', '15');
      await expect.soft(page.getByTestId('sum-digits-grade')).toHaveAttribute('data-grade', 'excellent');
      await expect.soft(page.getByTestId('sum-letters')).toHaveAttribute('data-value', '18');
      await expect.soft(page.getByTestId('sum-letters-grade')).toHaveAttribute('data-grade', 'no-data');
    });
    await test.step('คู่เลข 3 คู่เท่านั้น: 59 good / 90 avoid / 00 avoid (ไม่มีคู่ 15)', async () => {
      const pairs = await readPairs(page, page.getByTestId('plate-result'));
      expect.soft(pairs).toEqual([
        { pair: '59', grade: 'good' },
        { pair: '90', grade: 'avoid' },
        { pair: '00', grade: 'avoid' },
      ]);
    });
    await test.step('Highlight อักษร ข และไม่มี Highlight เลข', async () => {
      const letters = await page.getByTestId('highlight-letter').evaluateAll((els) => els.map((e) => e.getAttribute('data-value')));
      expect.soft(letters).toEqual(['ข']);
      await expect.soft(page.getByTestId('highlight-digit')).toHaveCount(0);
    });
  });
}

{
  const t = tc('TC-LP-02');
  test(t.title, t.details, async ({ api }) => {
    const r = await plate(await api.client(), { plate: '9ฎฎ 9999' });
    expect.soft(sums(r)).toEqual({ digits: 45, digitsGrade: 'excellent', letters: 63, lettersGrade: 'excellent' });
  });
}

{
  const t = tc('TC-LP-03');
  test(t.title, t.details, async ({ api }) => {
    const c = await api.client();
    await test.step('ก 1 → 1 / 2 ไม่มีข้อมูลทั้งคู่ และไม่มีคู่เลข', async () => {
      const r = await plate(c, { plate: 'ก 1' });
      expect.soft(sums(r)).toEqual({ digits: 1, digitsGrade: 'no-data', letters: 2, lettersGrade: 'no-data' });
      expect.soft(pairsOf(r)).toEqual([]);
    });
    await test.step('1ก 1 → 2 / 3 (นับเลขนำหน้า)', async () => {
      const r = await plate(c, { plate: '1ก 1' });
      const s = sums(r);
      expect.soft(s.digits).toBe(2);
      expect.soft(s.letters).toBe(3);
    });
  });
}

{
  const t = tc('TC-LP-04');
  test(t.title, t.details, async ({ api }) => {
    const r = await plate(await api.client(), { plate: 'กข 1234' });
    expect.soft(sums(r)).toEqual({ digits: 10, digitsGrade: 'no-data', letters: 13, lettersGrade: 'avoid' });
  });
}

{
  const t = tc('TC-LP-05');
  test(t.title, t.details, async ({ api }) => {
    const c = await api.client();
    await test.step('กข 9999 → 36 / 39', async () => {
      const s = sums(await plate(c, { plate: 'กข 9999' }));
      expect.soft([s.digits, s.letters]).toEqual([36, 39]);
    });
    await test.step('กข 12345 → ข้อความรูปแบบ', async () => {
      const r = await plate(c, { plate: 'กข 12345' });
      expect.soft(r.status).toBe(400);
      expect.soft(message(r)).toBe('รองรับรูปแบบ [เลข 1 หลัก] [พยัญชนะไทย 1–2 ตัว] [เลข 1–4 หลัก]');
    });
    await test.step('กข 0123 → ตัวเลขทะเบียนต้องไม่ขึ้นต้นด้วย 0', async () => {
      const r = await plate(c, { plate: 'กข 0123' });
      expect.soft(r.status).toBe(400);
      expect.soft(message(r)).toBe('ตัวเลขทะเบียนต้องไม่ขึ้นต้นด้วย 0');
    });
  });
}

{
  const t = tc('TC-LP-06');
  test(t.title, t.details, async ({ api }) => {
    const c = await api.client();
    const cases: Array<[string, string]> = [
      ['0กข 1', 'เลขนำหน้าต้องเป็น 1–9'],
      ['10กข 1', 'รองรับรูปแบบ [เลข 1 หลัก] [พยัญชนะไทย 1–2 ตัว] [เลข 1–4 หลัก]'],
      ['AB 1234', 'รองรับเฉพาะพยัญชนะไทย'],
      ['กข', 'กรุณากรอกตัวเลขทะเบียน'],
    ];
    for (const [input, msg] of cases) {
      await test.step(`${input} → "${msg}"`, async () => {
        const r = await plate(c, { plate: input });
        expect.soft(r.status, input).toBe(400);
        expect.soft(message(r), input).toBe(msg);
      });
    }
  });
}

{
  const t = tc('TC-LP-07');
  test(t.title, t.details, async ({ api }) => {
    const c = await api.client();
    await test.step('ดท 7777 + thu: Highlight เลข 7 ×4 (wongnai) + อักษร ด, ท (allianz)', async () => {
      const r = await plate(c, { plate: 'ดท 7777', birthDay: 'thu' });
      const bd = r.body?.data?.birthDay ?? {};
      const digits: Array<{ value: string; source: string }> = bd.highlightDigits ?? [];
      const letters: Array<{ char: string; source: string }> = bd.highlightLetters ?? [];
      expect.soft(digits.filter((d) => d.value === '7')).toHaveLength(4);
      expect.soft(letters.map((l) => l.char).sort()).toEqual(['ด', 'ท'].sort());
      expect.soft([...new Set(digits.map((d) => d.source))]).toEqual(['plate-wongnai-v1']);
      expect.soft([...new Set(letters.map((l) => l.source))]).toEqual(['plate-allianz-v1']);
    });
    await test.step('กข 12 + birthDay holiday → 400 INVALID_OPTION', async () => {
      const r = await plate(c, { plate: 'กข 12', birthDay: 'holiday' });
      expect.soft(r.status).toBe(400);
      expect.soft(code(r)).toBe('INVALID_OPTION');
    });
  });
}

{
  const t = tc('TC-LP-08');
  test(t.title, t.details, async ({ api }) => {
    const c = await api.client();
    const expected = [
      { pair: '12', grade: 'avoid' },
      { pair: '23', grade: 'good' },
      { pair: '34', grade: 'avoid' },
    ];
    for (const province of ['กรุงเทพมหานคร', 'เชียงใหม่', '']) {
      await test.step(`กข 1234 + จังหวัด "${province || '(ว่าง)'}"`, async () => {
        const r = await plate(c, { prefix: '', letters: 'กข', digits: '1234', province });
        const s = sums(r);
        expect.soft([s.digits, s.letters], province).toEqual([10, 13]);
        expect.soft(pairsOf(r).map(({ pair, grade }) => ({ pair, grade })), province).toEqual(expected);
      });
    }
  });
}

{
  const t = tc('TC-LP-09');
  test(t.title, t.details, async ({ api }) => {
    const c = await api.client();
    await test.step('ขค 1771 → เตือน one-bracket · 17/77/71 avoid · 16 / 22', async () => {
      const r = await plate(c, { plate: 'ขค 1771' });
      const patterns: Array<{ id: string }> = r.body?.data?.patterns ?? [];
      expect.soft(patterns.map((p) => p.id)).toContain('one-bracket');
      expect.soft(pairsOf(r).map(({ pair, grade }) => ({ pair, grade }))).toEqual([
        { pair: '17', grade: 'avoid' },
        { pair: '77', grade: 'avoid' },
        { pair: '71', grade: 'avoid' },
      ]);
      const s = sums(r);
      expect.soft([s.digits, s.letters]).toEqual([16, 22]);
    });
    await test.step('1กข 5900 → ไม่มีคำเตือนรูปแบบ', async () => {
      const r = await plate(c, { plate: '1กข 5900' });
      expect.soft(r.body?.data?.patterns ?? null).toEqual([]);
    });
  });
}

{
  const t = tc('TC-LP-10');
  test(t.title, t.details, async ({ api }) => {
    const c = await api.client();
    await test.step('กข 3553 → 35 caution · 55 good · 53 caution', async () => {
      const r = await plate(c, { plate: 'กข 3553' });
      expect.soft(pairsOf(r).map((p) => p.grade)).toEqual(['caution', 'good', 'caution']);
    });
    await test.step('กข 3070 → 30/07/70 avoid ทั้ง 3', async () => {
      const r = await plate(c, { plate: 'กข 3070' });
      expect.soft(pairsOf(r).map((p) => `${p.pair}:${p.grade}`)).toEqual(['30:avoid', '07:avoid', '70:avoid']);
    });
    await test.step('0835353535 + technician-engineer → good ×6 (ความหมายทั่วไป) และไม่แนะนำ 35/53', async () => {
      const r = await phone(c, { number: '0835353535', occupation: 'technician-engineer' });
      const grades = ((r.body?.data?.pairs ?? []) as Array<{ grade: string }>).map((p) => p.grade);
      expect.soft(grades).toEqual(Array(6).fill('good'));
      const rec: string[] = r.body?.data?.recommendation?.pairs ?? [];
      expect.soft(rec).not.toContain('35');
      expect.soft(rec).not.toContain('53');
    });
  });
}

const readSuggestions = async (page: Page) => {
  const items = page.getByTestId('suggested-plate');
  const out: Array<{ digits: string; sum: number }> = [];
  for (let i = 0; i < (await items.count()); i++) {
    out.push({ digits: (await items.nth(i).getAttribute('data-digits')) ?? '', sum: Number(await items.nth(i).getAttribute('data-sum')) });
  }
  return out;
};

{
  const t = tc('TC-LP-11');
  test(t.title, t.details, async ({ page }) => {
    await gotoReady(page, '/plate');
    await test.step('เลือกแค่วันพฤหัสบดี → ปุ่มเปลี่ยนเป็น "แนะนำเลขทะเบียน"', async () => {
      await page.getByTestId('birthday-select').selectOption('thu');
      await expect.soft(page.getByTestId('plate-submit')).toHaveText('แนะนำเลขทะเบียน');
    });
    await test.step('thu ไม่กรอกอักษร: 8 เลข + ผลรวมตามแผน · เลขส่งเสริม 1, 4, 5, 9 · ควรเลี่ยง 7', async () => {
      const res = await suggestPlateUi(page, { birthDay: 'thu' });
      expect.soft(res?.status()).toBe(200);
      const s = await readSuggestions(page);
      expect.soft(s.map((x) => x.digits)).toEqual(['1419', '1445', '1454', '1455', '1544', '1545', '1554', '1599']);
      expect.soft(s.map((x) => x.sum)).toEqual([15, 14, 14, 15, 14, 15, 15, 24]);
      for (const x of s) expect.soft(x.digits, 'ไม่มีเลข 7').not.toContain('7');
      await expect.soft(page.getByTestId('suggest-lucky-digits')).toHaveText('1, 4, 5, 9');
      await expect.soft(page.getByTestId('suggest-avoid-digits')).toHaveText('7');
    });
    await test.step('thu + กข: เลขแนะนำตามแผน · URL ยังเป็น /plate', async () => {
      await suggestPlateUi(page, { birthDay: 'thu', letters: 'กข' });
      const s = await readSuggestions(page);
      expect.soft(s.map((x) => x.digits)).toEqual(['1415', '1514', '1515', '4151', '4494', '4944', '5141', '5151']);
      await expect.soft(page.getByTestId('suggested-plate').first()).toContainText('กข 1415');
      await expect.soft(page).toHaveURL(/\/plate$/);
    });
  });
}

{
  const t = tc('TC-LP-12');
  test(t.title, t.details, async ({ page, api }) => {
    await test.step('sun + กข → ไม่มีผล (suggest-empty) + เตือนอักษร ข', async () => {
      await gotoReady(page, '/plate');
      await suggestPlateUi(page, { birthDay: 'sun', letters: 'กข' });
      await expect.soft(page.getByTestId('suggest-empty')).toBeVisible();
      await expect.soft(page.getByTestId('suggested-plate')).toHaveCount(0);
      const warns = page.getByTestId('suggest-letter-warning');
      await expect.soft(warns).toHaveCount(1);
      await expect.soft(warns.first()).toHaveAttribute('data-value', 'ข');
    });
    const c = await api.client();
    const cases: Array<[Record<string, unknown>, string]> = [
      [{}, 'BIRTHDAY_REQUIRED'],
      [{ birthDay: 'xx' }, 'INVALID_OPTION'],
      [{ birthDay: 'mon', letters: 'กขค' }, 'PLATE_INVALID_FORMAT'],
      [{ birthDay: 'thu', letters: 'AB' }, 'PLATE_INVALID_LETTER'],
    ];
    for (const [body, errCode] of cases) {
      await test.step(`API suggest ${JSON.stringify(body)} → 400 ${errCode}`, async () => {
        const r = await suggestPlate(c, body);
        expect.soft(r.status).toBe(400);
        expect.soft(code(r)).toBe(errCode);
      });
    }
    await test.step('ฟอร์มกรอกตัวเลขแต่ไม่กรอกอักษร → PLATE_LETTERS_REQUIRED เหมือนเดิม', async () => {
      await analyzePlate(page, { letters: '', digits: '1234', birthDay: 'thu' });
      await expect.soft(page.getByTestId('plate-error')).toHaveAttribute('data-code', 'PLATE_LETTERS_REQUIRED');
    });
  });
}

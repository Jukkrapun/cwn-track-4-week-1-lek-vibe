import type { Page } from '@playwright/test';
import { test, expect, gotoReady } from '../support/fixtures';
import { tc } from '../support/plan';
import { analyzePhone, readPairs } from '../support/pages';
import { code, message, phone, phoneStat } from '../support/helpers';

const PD_G01 = ['23', '34', '45', '56', '67', '78'];

{
  const t = tc('TC-PH-01');
  test(t.title, t.details, async ({ page }) => {
    await test.step('เปิดหน้าแรกแล้วกดเมนู "เบอร์โทร"', async () => {
      await gotoReady(page, '/');
      await page.getByTestId('nav-phone').click();
      await expect(page).toHaveURL(/\/phone$/);
    });
    await test.step('กรอก 0891245678 + เลือกอาชีพ trade แล้ววิเคราะห์ (ไม่ login)', async () => {
      const res = await analyzePhone(page, '0891245678', { occupation: 'trade' });
      expect.soft(res?.status(), 'HTTP วิเคราะห์').toBe(200);
    });
    await test.step('ตรวจ 6 คู่ (ตำแหน่ง 4–10) ตามลำดับและระดับ', async () => {
      const pairs = await readPairs(page, page.getByTestId('phone-result'));
      expect.soft(pairs.map((p) => p.pair)).toEqual(['12', '24', '45', '56', '67', '78']);
      expect.soft(pairs.map((p) => p.grade)).toEqual(['avoid', 'good', 'good', 'good', 'avoid', 'good']);
    });
    await test.step('มีคำแนะนำอาชีพ + เหตุผล และ URL ยังเป็น /phone', async () => {
      await expect.soft(page.getByTestId('recommendation')).toBeVisible();
      await expect.soft(page.getByTestId('recommendation-reason')).not.toBeEmpty();
      expect.soft(new URL(page.url()).pathname).toBe('/phone');
    });
  });
}

{
  const t = tc('TC-PH-02');
  test(t.title, t.details, async ({ page }) => {
    await gotoReady(page, '/phone');
    for (const input of ['081-234-5678', '+66812345678', '66812345678', '๐๘๑๒๓๔๕๖๗๘']) {
      await test.step(`วิเคราะห์ "${input}" ต้องได้คู่ของ 0812345678`, async () => {
        const res = await analyzePhone(page, input);
        expect.soft(res?.status(), `${input} HTTP`).toBe(200);
        const pairs = await readPairs(page, page.getByTestId('phone-result'));
        expect.soft(pairs.map((p) => p.pair), `${input} คู่เลข`).toEqual(PD_G01);
      });
    }
  });
}

{
  const t = tc('TC-PH-03');
  test(t.title, t.details, async ({ page }) => {
    await gotoReady(page, '/phone');
    const cases: Array<[string, string]> = [
      ['081234567', 'กรุณากรอกเบอร์มือถือ 10 หลัก'],
      ['08123456789', 'กรุณากรอกเบอร์มือถือ 10 หลัก'],
      ['', 'กรุณากรอกเบอร์มือถือ'],
    ];
    for (const [input, msg] of cases) {
      await test.step(`กรอก "${input || '(ว่าง)'}" ต้องขึ้น "${msg}"`, async () => {
        await analyzePhone(page, input);
        await expect.soft(page.getByTestId('phone-error')).toHaveText(msg);
      });
    }
    await test.step('กรอก 0812345678 (10 หลัก) ต้องได้ 6 คู่', async () => {
      await analyzePhone(page, '0812345678');
      expect.soft(await readPairs(page, page.getByTestId('phone-result'))).toHaveLength(6);
    });
  });
}

{
  const t = tc('TC-PH-04');
  test(t.title, t.details, async ({ page }) => {
    await gotoReady(page, '/phone');
    for (const ok of ['0612345678', '0912345678']) {
      await test.step(`${ok} ต้องผ่าน (6 คู่)`, async () => {
        await analyzePhone(page, ok);
        expect.soft(await readPairs(page, page.getByTestId('phone-result')), ok).toHaveLength(6);
      });
    }
    for (const bad of ['0512345678', '0712345678']) {
      await test.step(`${bad} ต้องขึ้น "รองรับเฉพาะเบอร์มือถือ"`, async () => {
        await analyzePhone(page, bad);
        await expect.soft(page.getByTestId('phone-error')).toHaveText('รองรับเฉพาะเบอร์มือถือ');
      });
    }
  });
}

{
  const t = tc('TC-PH-05');
  test(t.title, t.details, async ({ api }) => {
    const c = await api.client();
    for (const input of ['08a2345678', '0812.345.678']) {
      await test.step(`ส่ง "${input}" ต้องได้ 400 PHONE_INVALID_CHAR`, async () => {
        const r = await phone(c, { number: input });
        expect.soft(r.status, input).toBe(400);
        expect.soft(code(r), input).toBe('PHONE_INVALID_CHAR');
        expect.soft(message(r), input).toBe('กรุณากรอกเบอร์มือถือ 10 หลัก');
      });
    }
  });
}

{
  const t = tc('TC-PH-06');
  test(t.title, t.details, async ({ api }) => {
    const c = await api.client();
    const r = await test.step('วิเคราะห์ PD-G09 0861313347', () => phone(c, { number: '0861313347' }));
    const pairs: Array<{ pair: string; grade: string; pros: string | null; cons: string | null; meaning: string | null }> = r.body?.data?.pairs ?? [];
    await test.step('ตรวจคู่และระดับ: ควรเลี่ยง ×4 + ไม่มีข้อมูล ×2 (33, 47)', async () => {
      expect.soft(pairs.map((p) => p.pair)).toEqual(['13', '31', '13', '33', '34', '47']);
      expect.soft(pairs.map((p) => p.grade)).toEqual(['avoid', 'avoid', 'avoid', 'no-data', 'avoid', 'no-data']);
    });
    await test.step('คู่ไม่มีข้อมูลต้องไม่มีข้อดี/ข้อควรระวัง/ความหมาย', async () => {
      for (const p of pairs.filter((x) => x.grade === 'no-data')) {
        expect.soft({ pros: p.pros, cons: p.cons, meaning: p.meaning }, `คู่ ${p.pair}`).toEqual({ pros: null, cons: null, meaning: null });
      }
    });
  });
}

{
  const t = tc('TC-PH-07');
  test(t.title, t.details, async ({ api }) => {
    const c = await api.client();
    await test.step('อาชีพ freelance ต้องมีข้อความ "ใช้ผลวิเคราะห์ทั่วไป"', async () => {
      const r = await phone(c, { number: '0891245678', occupation: 'freelance' });
      expect.soft(r.status).toBe(200);
      expect.soft(JSON.stringify(r.body?.data?.recommendation ?? {})).toContain('ใช้ผลวิเคราะห์ทั่วไป');
    });
    await test.step('เป้าหมาย money: คู่แนะนำ ≥ 1 คู่ และทุกคู่มีหมวด money', async () => {
      const r = await phone(c, { number: '0891245678', goal: 'money' });
      const pairs: string[] = r.body?.data?.recommendation?.pairs ?? [];
      expect.soft(pairs.length, 'จำนวนคู่แนะนำ').toBeGreaterThanOrEqual(1);
      for (const p of pairs) {
        const cats: string[] = (await c.get(`/api/v1/pairs/${p}`)).body?.data?.categories ?? [];
        expect.soft(cats, `คู่ ${p} ต้องมีหมวด money`).toContain('money');
      }
    });
  });
}

{
  const t = tc('TC-PH-08');
  test(t.title, t.details, async ({ api }) => {
    const c = await api.client();
    for (const body of [
      { number: '0891245678', occupation: 'astronaut' },
      { number: '0891245678', goal: 'fly' },
    ]) {
      await test.step(`ส่ง ${JSON.stringify(body)} ต้องได้ 400 INVALID_OPTION`, async () => {
        const r = await phone(c, body);
        expect.soft(r.status).toBe(400);
        expect.soft(code(r)).toBe('INVALID_OPTION');
      });
    }
  });
}

{
  const t = tc('TC-PH-09');
  test(t.title, t.details, async ({ page, api }) => {
    const admin = await api.as('admin');
    const before = await test.step('อ่านสถิติ PHONE ก่อนกด', () => phoneStat(admin));
    const requests: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('/api/v1/phone/analyze') && r.method() === 'POST') requests.push(r.url());
    });
    await test.step('กรอก 0812345678 แล้วคลิกปุ่มวิเคราะห์ 2 ครั้งติดกันจริง', async () => {
      await gotoReady(page, '/phone');
      await page.getByTestId('phone-input').fill('0812345678');
      const box = await page.getByTestId('phone-submit').boundingBox();
      if (!box) throw new Error('ไม่พบปุ่มวิเคราะห์');
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      await page.mouse.click(x, y);
      await page.mouse.click(x, y);
      await expect(page.getByTestId('phone-result')).toBeVisible();
      await expect(page.getByTestId('phone-submit')).toBeEnabled();
      await page.waitForLoadState('networkidle');
    });
    await test.step('ตรวจ: ส่งคำขอวิเคราะห์ 1 ครั้ง และสถิติ PHONE +1', async () => {
      expect.soft(requests.length, 'จำนวน request วิเคราะห์').toBe(1);
      const after = await phoneStat(admin);
      expect.soft(after - before, 'สถิติ PHONE ที่เพิ่ม').toBe(1);
    });
  });
}

{
  const t = tc('TC-PH-10');
  const CATEGORIES = ['work', 'money', 'love', 'communication', 'health', 'luck'];
  const readChart = async (page: Page) => {
    const rows = page.getByTestId('category-chart').getByTestId('category-row');
    const order: string[] = [];
    const out: Record<string, [number, number]> = {};
    for (let i = 0; i < (await rows.count()); i++) {
      const r = rows.nth(i);
      const cat = (await r.getAttribute('data-category')) ?? '';
      order.push(cat);
      out[cat] = [Number(await r.getAttribute('data-positive')), Number(await r.getAttribute('data-negative'))];
    }
    return { order, out };
  };
  test(t.title, t.details, async ({ page }) => {
    await gotoReady(page, '/phone');
    await test.step('PD-G02 0891245678: 6 แถวตามลำดับ และค่า (+,−) ตามแผน', async () => {
      await analyzePhone(page, '0891245678');
      const { order, out } = await readChart(page);
      expect.soft(order).toEqual(CATEGORIES);
      expect.soft(out).toEqual({ work: [1, 0], money: [2, 1], love: [2, 1], communication: [2, 0], health: [0, 1], luck: [1, 0] });
      await expect.soft(page.getByTestId('category-chart')).toContainText('ไม่ใช่คำทำนายเพิ่ม');
    });
    await test.step('PD-G03 0861313737: work 0,3 · communication 0,3 · health 0,6 · หมวดอื่น 0,0', async () => {
      await analyzePhone(page, '0861313737');
      const { out } = await readChart(page);
      expect.soft(out).toEqual({ work: [0, 3], money: [0, 0], love: [0, 0], communication: [0, 3], health: [0, 6], luck: [0, 0] });
    });
  });
}

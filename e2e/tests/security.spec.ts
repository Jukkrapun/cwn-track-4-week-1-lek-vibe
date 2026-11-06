import { test, expect, gotoReady } from '../support/fixtures';
import { tc } from '../support/plan';
import { analyzePhone, analyzePlate } from '../support/pages';
import { code, message, phone, phoneStat } from '../support/helpers';
import type { Response } from '@playwright/test';

const PHONE = '0812345678';
const STACK_HINT = /\bat\s|\.tsx?:\d|\.js:\d|node_modules|[A-Za-z]:\\|\/app\/|stack/i;

async function errorCode(res: Response | null) {
  if (!res) return undefined;
  const body = await res.json().catch(() => ({}));
  return body?.error?.code;
}

{
  const t = tc('TC-SEC-01');
  test(t.title, t.details, async ({ page, api }) => {
    const dialogs: string[] = [];
    page.on('dialog', async (d) => {
      dialogs.push(d.message());
      await d.dismiss();
    });
    await test.step('phone: <script>alert(1)</script> → PHONE_INVALID_CHAR', async () => {
      await gotoReady(page, '/phone');
      const res = await analyzePhone(page, '<script>alert(1)</script>');
      expect.soft(await errorCode(res)).toBe('PHONE_INVALID_CHAR');
    });
    await test.step('pairs: <img src=x onerror=alert(1)> → PAIR_INVALID', async () => {
      const payload = '<img src=x onerror=alert(1)>';
      await gotoReady(page, '/pairs');
      await page.getByTestId('pair-search-input').fill(payload);
      await page.getByTestId('pair-search-submit').click();
      await expect.soft(page.getByTestId('pair-search-error')).toBeVisible();
      const r = await (await api.client()).get(`/api/v1/pairs/${encodeURIComponent(payload)}`);
      expect.soft(code(r)).toBe('PAIR_INVALID');
    });
    await test.step('articles: "><svg onload=alert(1)> → แสดงเป็นข้อความ', async () => {
      const payload = '"><svg onload=alert(1)>';
      await gotoReady(page, '/articles');
      await page.getByTestId('article-search-input').fill(payload);
      await page.getByTestId('article-search-submit').click();
      await page.waitForURL(/[?&]q=/);
      await expect(page.locator('html[data-ready="true"]')).toHaveCount(1);
      await expect.soft(page.locator('svg[onload]')).toHaveCount(0);
      await expect.soft(page.getByTestId('article-search-query')).toContainText(payload);
    });
    await test.step("plate letters: ' OR 1=1 -- → PLATE_INVALID_LETTER", async () => {
      await gotoReady(page, '/plate');
      const res = await analyzePlate(page, { letters: "' OR 1=1 --", digits: '1234' });
      expect.soft(await errorCode(res)).toBe('PLATE_INVALID_LETTER');
    });
    await test.step('ไม่มี dialog เด้งเลย', async () => {
      expect.soft(dialogs).toEqual([]);
    });
  });
}

{
  const t = tc('TC-SEC-02');
  test(t.title, t.details, async ({ page, api }) => {
    const admin = await api.as('admin');
    const before = await phoneStat(admin);
    const analyzeRequests: Array<{ method: string; url: string }> = [];
    page.on('request', (r) => {
      if (r.url().includes('/api/v1/phone/analyze')) analyzeRequests.push({ method: r.method(), url: r.url() });
    });
    await test.step('วิเคราะห์ 0812345678 → URL ไม่มีเบอร์ · request เป็น POST', async () => {
      await gotoReady(page, '/phone');
      await analyzePhone(page, PHONE);
      expect.soft(page.url()).not.toContain(PHONE);
      expect.soft(analyzeRequests.map((r) => r.method)).toEqual(['POST']);
      expect.soft(analyzeRequests.every((r) => !r.url.includes(PHONE))).toBe(true);
    });
    await test.step('localStorage / sessionStorage / cookie ไม่มีเบอร์', async () => {
      const storage = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }) + document.cookie);
      expect.soft(storage).not.toContain(PHONE);
      const cookies = await page.context().cookies();
      expect.soft(JSON.stringify(cookies)).not.toContain(PHONE);
    });
    await test.step('หลังรีโหลด /phone: ช่องเบอร์ว่างและไม่มีผลเดิม', async () => {
      await page.reload();
      await expect(page.locator('html[data-ready="true"]')).toHaveCount(1);
      await expect.soft(page.getByTestId('phone-input')).toHaveValue('');
      await expect.soft(page.getByTestId('phone-result')).toHaveCount(0);
    });
    await test.step('stats PHONE +1 และ response stats ไม่มีเบอร์', async () => {
      expect.soft((await phoneStat(admin)) - before).toBe(1);
      expect.soft((await admin.get('/api/v1/admin/stats')).text).not.toContain(PHONE);
    });
    await test.step('GET /api/v1/phone/analyze ไม่ได้ผลวิเคราะห์ (4xx)', async () => {
      const r = await (await api.client()).get(`/api/v1/phone/analyze?number=${PHONE}`);
      expect.soft(r.status).toBeGreaterThanOrEqual(400);
      expect.soft(r.status).toBeLessThan(500);
    });
  });
}

{
  const t = tc('TC-SEC-03');
  test(t.title, t.details, async ({ api }) => {
    const c = await api.client();
    await test.step('SEC-05 number เป็นชนิดตัวเลข → 400 ไม่มี stack trace', async () => {
      const r = await c.raw('/api/v1/phone/analyze', '{"number": 812345678}');
      expect.soft(r.status).toBe(400);
      expect.soft(r.text).not.toMatch(STACK_HINT);
    });
    await test.step('SEC-06 not-json → 400 ไม่มี stack trace', async () => {
      const r = await c.raw('/api/v1/phone/analyze', 'not-json');
      expect.soft(r.status).toBe(400);
      expect.soft(r.text).not.toMatch(STACK_HINT);
    });
    await test.step('SEC-07 __proto__ → 200 ได้ 6 คู่ และ /admin/me ยัง 401', async () => {
      const r = await c.raw('/api/v1/phone/analyze', '{"number":"0812345678","__proto__":{"admin":true}}');
      expect.soft(r.status).toBe(200);
      expect.soft(r.body?.data?.pairs ?? []).toHaveLength(6);
      expect.soft((await c.get('/api/v1/admin/me')).status).toBe(401);
    });
  });
}

{
  const t = tc('TC-SEC-04');
  test(t.title, t.details, async ({ api }) => {
    const c = await api.client();
    await test.step('ครั้งที่ 1–30 → 200', async () => {
      const statuses: number[] = [];
      for (let i = 0; i < 30; i++) statuses.push((await phone(c, { number: PHONE })).status);
      expect.soft(statuses).toEqual(Array(30).fill(200));
    });
    await test.step('ครั้งที่ 31 → 429 RATE_LIMITED + ข้อความใช้งานถี่เกิน', async () => {
      const r = await phone(c, { number: PHONE });
      expect.soft(r.status).toBe(429);
      expect.soft(code(r)).toBe('RATE_LIMITED');
      expect.soft(message(r) ?? '').toContain('ถี่');
    });
    await test.step('เลื่อนเวลา +1 นาที → 200', async () => {
      await c.post('/api/test/clock', { advanceMinutes: 1 });
      expect.soft((await phone(c, { number: PHONE })).status).toBe(200);
    });
  });
}

{
  const t = tc('TC-SEC-05');
  test(t.title, t.details, async ({ api }) => {
    const c = await api.client();
    const statuses: number[] = [];
    await test.step('nobody.test รหัสผิด 11 ครั้ง', async () => {
      for (let i = 0; i < 11; i++) statuses.push((await c.post('/api/v1/admin/login', { username: 'nobody.test', password: 'wrong' })).status);
    });
    await test.step('ครั้งที่ 1–10 → 401 · ครั้งที่ 11 → 429', async () => {
      expect.soft(statuses.slice(0, 10)).toEqual(Array(10).fill(401));
      expect.soft(statuses[10]).toBe(429);
    });
  });
}



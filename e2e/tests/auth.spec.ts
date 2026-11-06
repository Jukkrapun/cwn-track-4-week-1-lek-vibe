import { test, expect, gotoReady } from '../support/fixtures';
import { tc } from '../support/plan';
import { uiLogin } from '../support/pages';
import { code, message, versions } from '../support/helpers';
import { USERS } from '../support/env';
import type { ApiClient } from '../support/api';

const LOCKED_MSG = 'บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่ใน 15 นาที';
const login = (c: ApiClient, username: string, password: string) => c.post('/api/v1/admin/login', { username, password });
const advance = (c: ApiClient, minutes: number) => c.post('/api/test/clock', { advanceMinutes: minutes });

{
  const t = tc('TC-AU-01');
  test(t.title, t.details, async ({ page, api }) => {
    const c = await api.client();
    await test.step('admin.test รหัสถูก → 200 และเข้า /admin ได้', async () => {
      const r = await login(c, USERS.admin.username, USERS.admin.password);
      expect.soft(r.status).toBe(200);
      await uiLogin(page, 'admin');
      await gotoReady(page, '/admin');
      expect.soft(new URL(page.url()).pathname).toBe('/admin');
    });
    const wrong = await test.step('admin.test รหัสผิด → 401', async () => {
      const r = await login(c, USERS.admin.username, 'wrong');
      expect.soft(r.status).toBe(401);
      expect.soft(message(r)).toBe('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      return r;
    });
    await test.step('nobody.test → 401 ข้อความเดียวกันทุกตัวอักษร', async () => {
      const r = await login(c, 'nobody.test', 'wrong');
      expect.soft(r.status).toBe(401);
      expect.soft(message(r)).toBe(message(wrong));
    });
  });
}

{
  const t = tc('TC-AU-02');
  test(t.title, t.details, async ({ api }) => {
    const c = await api.client();
    const { username, password } = USERS.locked;
    await test.step('locked.test ผิดครั้งที่ 5 → 423 + ข้อความล็อก', async () => {
      const r = await login(c, username, 'wrong');
      expect.soft(r.status).toBe(423);
      expect.soft(message(r)).toBe(LOCKED_MSG);
    });
    await test.step('รหัสถูกทันที → 423', async () => {
      expect.soft((await login(c, username, password)).status).toBe(423);
    });
    await test.step('เลื่อน +14 นาที → 423', async () => {
      await advance(c, 14);
      expect.soft((await login(c, username, password)).status).toBe(423);
    });
    await test.step('เลื่อนอีก 1 นาที (รวม +15) → 200', async () => {
      await advance(c, 1);
      expect.soft((await login(c, username, password)).status).toBe(200);
    });
    await test.step('admin.test ผิด 4 ครั้งแล้วรหัสถูก → 200', async () => {
      for (let i = 0; i < 4; i++) await login(c, USERS.admin.username, 'wrong');
      expect.soft((await login(c, USERS.admin.username, USERS.admin.password)).status).toBe(200);
    });
  });
}

{
  const t = tc('TC-AU-03');
  test(t.title, t.details, async ({ page, api }) => {
    const clock = await api.client('clock');
    await uiLogin(page, 'admin');
    await test.step('idle 29 นาทีแล้วเปิด /admin → ยังอยู่หลังบ้าน', async () => {
      await advance(clock, 29);
      await gotoReady(page, '/admin');
      expect.soft(new URL(page.url()).pathname).toBe('/admin');
    });
    await test.step('idle 30 นาที (นับจากใช้งานล่าสุด) แล้วเปิด /admin → /admin/login', async () => {
      await advance(clock, 30);
      await gotoReady(page, '/admin');
      expect.soft(new URL(page.url()).pathname).toBe('/admin/login');
    });
  });
}

{
  const t = tc('TC-AU-04');
  test(t.title, t.details, async ({ page, api }) => {
    const guest = await api.client();
    const calls: Array<[string, () => ReturnType<ApiClient['get']>]> = [
      ['GET /api/v1/admin/me', () => guest.get('/api/v1/admin/me')],
      ['GET /api/v1/admin/audit', () => guest.get('/api/v1/admin/audit')],
      ['POST /api/v1/admin/pairs', () => guest.post('/api/v1/admin/pairs', { pairs: ['47', '74'], grade: 'good', categories: ['work'], pros: 'ทดสอบ: ความคิดสร้างสรรค์', cons: null, source: 'Test Fixture' })],
      ['POST /api/v1/admin/versions/x/publish', () => guest.post('/api/v1/admin/versions/x/publish', { baseVersion: '0.1.0-mock' })],
    ];
    for (const [name, call] of calls) {
      await test.step(`${name} ไม่มี cookie → 401 UNAUTHENTICATED`, async () => {
        const r = await call();
        expect.soft(r.status, name).toBe(401);
        expect.soft(code(r), name).toBe('UNAUTHENTICATED');
        expect.soft(message(r), name).toBe('กรุณาเข้าสู่ระบบ');
      });
    }
    await test.step('ไม่มี Draft ใหม่เกิดขึ้น', async () => {
      const admin = await api.as('admin');
      expect.soft((await versions(admin)).filter((v) => v.status === 'DRAFT')).toHaveLength(0);
    });
    await test.step('เปิด /admin → redirect /admin/login', async () => {
      await gotoReady(page, '/admin');
      expect.soft(new URL(page.url()).pathname).toBe('/admin/login');
    });
  });
}

{
  const t = tc('TC-AU-05');
  test(t.title, t.details, async ({ page }) => {
    await test.step('admin.test login → กดออกจากระบบ', async () => {
      await uiLogin(page, 'admin');
      await gotoReady(page, '/admin/pairs');
      await Promise.all([page.waitForURL(/\/admin\/login/), page.getByTestId('logout-button').click()]);
    });
    await test.step('เปิด /admin/pairs → /admin/login', async () => {
      await gotoReady(page, '/admin/pairs');
      expect.soft(new URL(page.url()).pathname).toBe('/admin/login');
    });
    await test.step('กด Back → ต้องไม่เห็นหน้าหลังบ้าน', async () => {
      await page.goBack();
      await page.waitForLoadState('load');
      await expect.soft(page).toHaveURL(/\/admin\/login/);
    });
    await test.step('GET /api/v1/admin/me (cookie เดิมของเบราว์เซอร์) → 401', async () => {
      const r = await page.request.get('/api/v1/admin/me');
      expect.soft(r.status()).toBe(401);
    });
  });
}

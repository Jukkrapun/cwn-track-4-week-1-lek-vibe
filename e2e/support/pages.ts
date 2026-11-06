import type { Page, Response } from '@playwright/test';
import { expect, gotoReady } from './fixtures';
import { USERS, type UserKey } from './env';

/** แผนเขียนระดับเป็นภาษาไทยบางจุด — แปลงให้ตรงกับค่า data-grade */
export const GRADE = { good: 'good', caution: 'caution', avoid: 'avoid', noData: 'no-data', excellent: 'excellent' } as const;

/** อ่านคู่เลขบนจอ [pair, grade] ตามลำดับ */
export async function readPairs(page: Page, scope = page.locator('body')) {
  const rows = scope.getByTestId('pair-row');
  const n = await rows.count();
  const out: Array<{ pair: string; grade: string }> = [];
  for (let i = 0; i < n; i++) {
    const r = rows.nth(i);
    out.push({ pair: (await r.getAttribute('data-pair')) ?? '', grade: (await r.getAttribute('data-grade')) ?? '' });
  }
  return out;
}

/** กรอกเบอร์ + กดวิเคราะห์ แล้วรอจน API ตอบและหน้าเว็บแสดงผล/ข้อผิดพลาดเสร็จ */
export async function analyzePhone(page: Page, number: string, opts: { occupation?: string; goal?: string } = {}): Promise<Response | null> {
  await page.getByTestId('phone-input').fill(number);
  if (opts.occupation !== undefined) await page.getByTestId('occupation-select').selectOption(opts.occupation);
  if (opts.goal !== undefined) await page.getByTestId('goal-select').selectOption(opts.goal);
  return submitAndSettle(page, '/api/v1/phone/analyze', 'phone-submit', 'phone-result', 'phone-error');
}

/**
 * กดปุ่มแล้วรอ "หน้าเว็บคิดเสร็จ": ถ้ามีคำขอไป API รอ response แล้วรอผล/ข้อผิดพลาดที่ตรงกับสถานะ
 * ถ้าหน้าเว็บตรวจเองไม่ส่งคำขอ (validation ฝั่งหน้าเว็บ) รอข้อความ error · ไม่รอค่าเฉพาะใด ๆ
 */
async function submitAndSettle(page: Page, apiPath: string, submitId: string, okId: string, errId: string): Promise<Response | null> {
  const resPromise = page
    .waitForResponse((r) => r.url().includes(apiPath) && r.request().method() === 'POST', { timeout: 5_000 })
    .catch(() => null);
  await page.getByTestId(submitId).click();
  const res = await resPromise;
  await expect(page.getByTestId(submitId)).toBeEnabled();
  if (res && res.ok()) await expect(page.getByTestId(okId)).toBeVisible();
  else await expect(page.getByTestId(errId).first()).toBeVisible();
  return res;
}

/** กรอกทะเบียน + กดวิเคราะห์ แล้วรอผล */
export async function analyzePlate(
  page: Page,
  plate: { prefix?: string; letters: string; digits?: string; province?: string; birthDay?: string },
): Promise<Response | null> {
  await page.getByTestId('plate-prefix').fill(plate.prefix ?? '');
  await page.getByTestId('plate-letters').fill(plate.letters);
  await page.getByTestId('plate-digits').fill(plate.digits ?? '');
  if (plate.province !== undefined) await page.getByTestId('plate-province').fill(plate.province);
  if (plate.birthDay !== undefined) await page.getByTestId('birthday-select').selectOption(plate.birthDay);
  return submitAndSettle(page, '/api/v1/plate/analyze', 'plate-submit', 'plate-result', 'plate-error');
}

/** เลือกแค่วันเกิด (+ หมวดอักษรถ้ามี) ไม่กรอกตัวเลข แล้วกด "แนะนำเลขทะเบียน" รอผล */
export async function suggestPlateUi(page: Page, opts: { birthDay: string; letters?: string }): Promise<Response | null> {
  await page.getByTestId('plate-prefix').fill('');
  await page.getByTestId('plate-letters').fill(opts.letters ?? '');
  await page.getByTestId('plate-digits').fill('');
  await page.getByTestId('birthday-select').selectOption(opts.birthDay);
  return submitAndSettle(page, '/api/v1/plate/suggest', 'plate-submit', 'plate-suggest-result', 'plate-error');
}

/** Login หลังบ้านผ่านหน้าเว็บ */
export async function uiLogin(page: Page, user: UserKey) {
  await gotoReady(page, '/admin/login');
  await page.getByTestId('login-username').fill(USERS[user].username);
  await page.getByTestId('login-password').fill(USERS[user].password);
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/v1/admin/login')),
    page.getByTestId('login-submit').click(),
  ]);
  await page.waitForURL((u) => !u.pathname.startsWith('/admin/login'));
}

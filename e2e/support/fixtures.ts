import path from 'node:path';
import { test as base, expect, request, type Page } from '@playwright/test';
import { ApiLog } from './api';
import { BASE_URL, IS_GIF, LOCK_NOW, REPORT_DIR, tcIdOf } from './env';
import { convertVideo } from './media';
import { overlayScript } from './overlay';

interface Fixtures {
  /** POST /api/test/reset ก่อนทุก test (auto) */
  resetData: void;
  /** ตัวเรียก API ที่บันทึก log ลง test-report/logs/<TC>-<browser>.log */
  api: ApiLog;
}

export const test = base.extend<Fixtures>({
  resetData: [
    async ({}, use) => {
      const ctx = await request.newContext({ baseURL: BASE_URL });
      const res = await ctx.post('/api/test/reset', { data: { now: LOCK_NOW } });
      if (!res.ok()) throw new Error(`reset ไม่สำเร็จ: ${res.status()} ${await res.text()}`);
      await ctx.dispose();
      await use();
    },
    { auto: true },
  ],

  api: async ({}, use, testInfo) => {
    const log = new ApiLog();
    await use(log);
    const file = path.join(REPORT_DIR, 'logs', `${tcIdOf(testInfo.title)}-${testInfo.project.name}.log`);
    await log.dispose(file);
  },

  context: async ({ context }, use, testInfo) => {
    if (IS_GIF) await context.addInitScript(overlayScript(testInfo.title));
    await use(context);
  },

  page: async ({ page }, use, testInfo) => {
    await use(page);
    if (!IS_GIF) return;
    const video = page.video();
    if (!video) return;
    await page.context().close();
    const webm = await video.path();
    const out = convertVideo(webm, tcIdOf(testInfo.title));
    await testInfo.attach('gif', { path: out.gif, contentType: 'image/gif' });
  },
});

export { expect };

/** รอให้หน้าเว็บพร้อม (html[data-ready=true]) */
export async function gotoReady(page: Page, url: string) {
  const res = await page.goto(url);
  await expect(page.locator('html[data-ready="true"]')).toHaveCount(1);
  return res;
}

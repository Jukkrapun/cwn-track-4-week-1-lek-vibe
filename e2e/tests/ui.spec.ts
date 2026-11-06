import type { Page } from '@playwright/test';
import { test, expect, gotoReady } from '../support/fixtures';
import { tc } from '../support/plan';
import { analyzePhone, analyzePlate } from '../support/pages';

const BANNED = ['แม่นที่สุด', 'รับประกัน', 'พิสูจน์แล้ว', 'รวยแน่นอน'];
const SLUGS = ['how-to-read-phone-pairs', 'plate-sum-two-methods', 'birthday-and-plate', 'belief-disclaimer'];

/** รอ animation แบบจบได้ (เช่น ผลลัพธ์เลื่อนเข้า) ให้จบก่อนวัด — animation วนไม่รู้จบไม่นับ */
async function waitAnimations(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
}

async function overflow(page: Page) {
  await waitAnimations(page);
  // ความกว้างที่มองเห็นจริง = clientWidth (ไม่รวม scrollbar แนวตั้ง) — scrollWidth เกินค่านี้ = มี Scroll แนวนอน
  return page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, width: document.documentElement.clientWidth }));
}

{
  const t = tc('TC-UI-01');
  test(t.title, t.details, async ({ page }) => {
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 800 });
      const pages: Array<[string, (p: Page) => Promise<unknown>]> = [
        ['/', async () => undefined],
        ['/phone', (p) => analyzePhone(p, '0891245678')],
        ['/plate', (p) => analyzePlate(p, { prefix: '1', letters: 'กข', digits: '5900' })],
        ['/articles', async () => undefined],
      ];
      for (const [url, prepare] of pages) {
        await test.step(`${width}px ${url}: scrollWidth ≤ ความกว้างจอ (ไม่มี Scroll แนวนอน)`, async () => {
          await gotoReady(page, url);
          await prepare(page);
          const o = await overflow(page);
          test.info().annotations.push({ type: 'หลักฐาน', description: `${width}px ${url}: scrollWidth ${o.scrollWidth} / clientWidth ${o.width}` });
          expect.soft(o.scrollWidth, `${width}px ${url} scrollWidth (clientWidth ${o.width})`).toBeLessThanOrEqual(o.width);
        });
      }
    }
  });
}

{
  const t = tc('TC-UI-02');
  test(t.title, t.details, async ({ page }) => {
    await test.step('ผลเบอร์ 0891245678: เวอร์ชัน 0.1.0-mock + ป้าย "ข้อมูลตัวอย่าง" + ความเชื่อ', async () => {
      await gotoReady(page, '/phone');
      await analyzePhone(page, '0891245678');
      const result = page.getByTestId('phone-result');
      await expect.soft(result.getByTestId('ruleset-version')).toContainText('0.1.0-mock');
      await expect.soft(result.getByTestId('demo-badge')).toContainText('ข้อมูลตัวอย่าง');
      await expect.soft(page.getByTestId('disclaimer').first()).toContainText('ความเชื่อ');
    });
    await test.step('ผลทะเบียน 1กข 5900: ไม่ได้ยืนยันสถานะทะเบียน + ความเชื่อ ไม่ใช่ข้อห้ามตามกฎหมาย', async () => {
      await gotoReady(page, '/plate');
      await analyzePlate(page, { prefix: '1', letters: 'กข', digits: '5900' });
      await expect.soft(page.getByTestId('plate-status-notice')).toContainText('ไม่ได้ยืนยันสถานะทะเบียน');
      await expect.soft(page.getByTestId('plate-belief-notice')).toContainText('ความเชื่อ');
      await expect.soft(page.getByTestId('plate-belief-notice')).toContainText('ไม่ใช่ข้อห้ามตามกฎหมาย');
    });
  });
}

{
  const t = tc('TC-UI-03');
  test(t.title, t.details, async ({ page }) => {
    const pages: Array<[string, (p: Page) => Promise<unknown>]> = [
      ['/', async () => undefined],
      ['/phone', (p) => analyzePhone(p, '0812345678')],
      ['/plate', (p) => analyzePlate(p, { letters: 'กข', digits: '1234' })],
      ['/pairs?q=24', async () => undefined],
      ['/articles', async () => undefined],
      ...SLUGS.map((s) => [`/articles/${s}`, async () => undefined] as [string, (p: Page) => Promise<unknown>]),
    ];
    for (const [url, prepare] of pages) {
      await test.step(`สแกนคำต้องห้ามที่ ${url}`, async () => {
        await gotoReady(page, url);
        await prepare(page);
        const text = await page.evaluate(() => document.body.innerText);
        for (const word of BANNED) expect.soft(text, `${url} มีคำ "${word}"`).not.toContain(word);
      });
    }
  });
}

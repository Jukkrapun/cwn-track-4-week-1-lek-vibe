import { test, expect, gotoReady } from '../support/fixtures';
import { tc } from '../support/plan';
import { code } from '../support/helpers';
import type { Page } from '@playwright/test';

async function searchPair(page: Page, q: string) {
  await gotoReady(page, '/pairs');
  await page.getByTestId('pair-search-input').fill(q);
  await page.getByTestId('pair-search-submit').click();
  await expect(page.getByTestId('pair-result').or(page.getByTestId('pair-search-error')).first()).toBeVisible();
}

{
  const t = tc('TC-CT-01');
  test(t.title, t.details, async ({ page }) => {
    for (const q of ['24', '42', '๒๔']) {
      await test.step(`ค้น "${q}" ต้องได้ ดี + "มีเสน่ห์ คนเมตตา มนุษยสัมพันธ์ดี มีเพื่อนช่วยเหลือ"`, async () => {
        await searchPair(page, q);
        const result = page.getByTestId('pair-result');
        await expect.soft(result, q).toHaveAttribute('data-grade', 'good');
        await expect.soft(result.getByTestId('pair-meaning'), q).toContainText('มีเสน่ห์ คนเมตตา มนุษยสัมพันธ์ดี มีเพื่อนช่วยเหลือ');
      });
    }
  });
}

{
  const t = tc('TC-CT-02');
  test(t.title, t.details, async ({ page }) => {
    const grades: Array<[string, string]> = [
      ['00', 'avoid'],
      ['33', 'no-data'],
    ];
    for (const [q, grade] of grades) {
      await test.step(`ค้น ${q} → ${grade}`, async () => {
        await searchPair(page, q);
        await expect.soft(page.getByTestId('pair-result'), q).toHaveAttribute('data-grade', grade);
      });
    }
    for (const q of ['2', '245', 'ab']) {
      await test.step(`ค้น "${q}" → "กรุณากรอกเลข 2 หลัก"`, async () => {
        await searchPair(page, q);
        await expect.soft(page.getByTestId('pair-search-error'), q).toHaveText('กรุณากรอกเลข 2 หลัก');
      });
    }
  });
}

{
  const t = tc('TC-CT-03');
  test(t.title, t.details, async ({ page, api }) => {
    const slugs = async () => page.getByTestId('article-item').evaluateAll((els) => els.map((e) => e.getAttribute('data-slug')));
    const search = async (q: string) => {
      await gotoReady(page, '/articles');
      await page.getByTestId('article-search-input').fill(q);
      await page.getByTestId('article-search-submit').click();
      await page.waitForURL(/[?&]q=/);
      await expect(page.locator('html[data-ready="true"]')).toHaveCount(1);
    };
    await test.step('ค้น "ผลรวม" → มี plate-sum-two-methods', async () => {
      await search('ผลรวม');
      expect.soft(await slugs()).toContain('plate-sum-two-methods');
    });
    await test.step('กรองหมวด plate → 2 บทความ', async () => {
      await gotoReady(page, '/articles');
      await page.getByTestId('article-filter-plate').click();
      await page.waitForURL(/category=plate/);
      await expect(page.getByTestId('article-item').first()).toBeVisible();
      expect.soft((await slugs()).sort()).toEqual(['birthday-and-plate', 'plate-sum-two-methods']);
    });
    await test.step('ก×100 → ไม่มี error', async () => {
      await search('ก'.repeat(100));
      await expect.soft(page.getByTestId('article-search-error')).toHaveCount(0);
    });
    await test.step('ก×101 → error QUERY_TOO_LONG + ข้อความแจ้งคำค้นยาวเกิน', async () => {
      await search('ก'.repeat(101));
      await expect.soft(page.getByTestId('article-search-error')).toContainText('ยาวเกิน');
      const r = await (await api.client()).get(`/api/v1/articles?q=${encodeURIComponent('ก'.repeat(101))}`);
      expect.soft(code(r)).toBe('QUERY_TOO_LONG');
    });
    await test.step('ค้น "zzzz-ไม่มี" → สถานะไม่พบบทความ', async () => {
      await search('zzzz-ไม่มี');
      await expect.soft(page.getByTestId('article-empty')).toBeVisible();
    });
  });
}

{
  const t = tc('TC-CT-04');
  test(t.title, t.details, async ({ page }) => {
    await test.step('เปิด plate-sum-two-methods: ผู้เขียน/วันที่/แหล่ง Wongnai', async () => {
      await gotoReady(page, '/articles/plate-sum-two-methods');
      await expect.soft(page.getByTestId('article-author')).toContainText('ทีมเนื้อหา (ทดสอบ)');
      await expect.soft(page.getByTestId('article-updated')).toContainText('2026-11-02');
      await expect.soft(page.getByTestId('article-references')).toContainText('Wongnai');
    });
    await test.step('เปิด /articles/not-exist → HTTP 404', async () => {
      const res = await page.goto('/articles/not-exist');
      expect.soft(res?.status()).toBe(404);
      await expect.soft(page.getByTestId('not-found')).toBeVisible();
    });
  });
}

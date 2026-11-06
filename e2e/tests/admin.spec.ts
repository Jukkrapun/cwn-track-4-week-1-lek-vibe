import type { Page } from '@playwright/test';
import { test, expect, gotoReady } from '../support/fixtures';
import { tc } from '../support/plan';
import { uiLogin } from '../support/pages';
import { BASE_URL, LOCK_NOW } from '../support/env';
import {
  AD_C01, PAIRS_RULESET, SEED_VERSION, auditRows, code, createDraftD01, message, pairGrade, phone, publishedVersion, versions,
} from '../support/helpers';

/** อ่านระดับคู่ 47 จากหน้า /pairs?q=47 (เปิดใหม่ = หลังรีโหลด) */
async function pageGrade47(page: Page) {
  await gotoReady(page, '/pairs?q=47');
  const result = page.getByTestId('pair-result');
  await expect(result).toBeVisible();
  return result.getAttribute('data-grade');
}

async function resetSeed(page: Page) {
  const r = await page.request.post(`${BASE_URL}/api/test/reset`, { data: { now: LOCK_NOW } });
  expect(r.ok(), 'reset กลางเทสต์').toBeTruthy();
}

{
  const t = tc('TC-AD-01');
  test(t.title, t.details, async ({ page, api }) => {
    const { draftId } = await test.step('editor.test สร้าง Draft AD-D01', () => createDraftD01(api));
    const admin = await api.as('admin');
    const guest = await api.client();

    await test.step('หลัง Draft: คู่ 47 ยังไม่มีข้อมูล (API ทันที + หน้า /pairs)', async () => {
      expect.soft(await pairGrade(guest, '47')).toBe('no-data');
      expect.soft(await pageGrade47(page)).toBe('no-data');
    });

    const newVersion = await test.step('admin.test Approve + Publish (baseVersion 0.1.0-mock)', async () => {
      expect.soft((await admin.post(`/api/v1/admin/versions/${draftId}/approve`)).status).toBe(200);
      const pub = await admin.post(`/api/v1/admin/versions/${draftId}/publish`, { baseVersion: SEED_VERSION });
      expect.soft(pub.status).toBe(200);
      return pub.body?.data?.version as string | undefined;
    });

    await test.step('หลัง Publish: เวอร์ชันใหม่ ≠ 0.1.0-mock, 47 = good ทันที · ผลเบอร์ใช้เวอร์ชันใหม่ · หลังรีโหลดเหมือนกัน', async () => {
      expect.soft(newVersion).toBeTruthy();
      expect.soft(newVersion).not.toBe(SEED_VERSION);
      expect.soft(await pairGrade(guest, '47')).toBe('good');
      const r = await phone(guest, { number: '0812347000' });
      expect.soft(r.body?.data?.ruleSet?.version).toBe(newVersion);
      expect.soft(await pageGrade47(page)).toBe('good');
    });

    const rolled = await test.step('admin.test Rollback ไป 0.1.0-mock', async () => {
      const r = await admin.post('/api/v1/admin/rules/rollback', {
        ruleSetId: PAIRS_RULESET, targetVersion: SEED_VERSION, baseVersion: newVersion,
      });
      expect.soft(r.status).toBe(200);
      return r.body?.data?.version as string | undefined;
    });

    await test.step('หลัง Rollback: เวอร์ชันใหม่อีกตัว, 47 = ไม่มีข้อมูล ทันทีและหลังรีโหลด · ประวัติเดิมอยู่ + Superseded', async () => {
      expect.soft(rolled).toBeTruthy();
      expect.soft(rolled).not.toBe(SEED_VERSION);
      expect.soft(rolled).not.toBe(newVersion);
      expect.soft(await publishedVersion(admin)).toBe(rolled);
      expect.soft(await pairGrade(guest, '47')).toBe('no-data');
      expect.soft(await pageGrade47(page)).toBe('no-data');
      const all = await versions(admin);
      const status = (v?: string) => all.find((x) => x.version === v)?.status;
      expect.soft(status(SEED_VERSION), 'สถานะ 0.1.0-mock').toBe('SUPERSEDED');
      expect.soft(status(newVersion), `สถานะ ${newVersion}`).toBe('SUPERSEDED');
    });

    await test.step('Audit 4 แถวตามลำดับ', async () => {
      const rows = (await auditRows(admin))
        .slice()
        .sort((a: any, b: any) => Number(a.seq) - Number(b.seq))
        .map((r) => `${r.action}/${r.actor}`);
      expect.soft(rows).toEqual(['DRAFT_SAVED/editor.test', 'APPROVED/admin.test', 'PUBLISHED/admin.test', 'ROLLBACK/admin.test']);
    });
  });
}

{
  const t = tc('TC-AD-02');
  test(t.title, t.details, async ({ api }) => {
    const { editor, draftId } = await createDraftD01(api);
    await test.step('editor.test Approve งานตัวเอง → 403 FORBIDDEN_SELF_APPROVE', async () => {
      const r = await editor.post(`/api/v1/admin/versions/${draftId}/approve`);
      expect.soft(r.status).toBe(403);
      expect.soft(code(r)).toBe('FORBIDDEN_SELF_APPROVE');
      expect.soft(message(r)).toBe('ไม่สามารถอนุมัติงานของตนเองได้');
    });
    await test.step('Audit ไม่มีแถว APPROVED', async () => {
      const rows = await auditRows(await api.as('admin'));
      expect.soft(rows.filter((r) => r.action === 'APPROVED')).toHaveLength(0);
    });
  });
}

{
  const t = tc('TC-AD-03');
  test(t.title, t.details, async ({ page, api }) => {
    const { editor, draftId } = await createDraftD01(api);
    const editor2 = await api.as('editor2');
    const checks: Array<[string, () => ReturnType<typeof editor.get>]> = [
      ['editor2.test approve Draft ของ editor.test', () => editor2.post(`/api/v1/admin/versions/${draftId}/approve`)],
      ['editor.test publish', () => editor.post(`/api/v1/admin/versions/${draftId}/publish`, { baseVersion: SEED_VERSION })],
      ['editor.test GET /api/v1/admin/audit', () => editor.get('/api/v1/admin/audit')],
      ['editor.test ปิดหมวด trade', () => editor.patch('/api/v1/admin/categories/trade', { enabled: false })],
    ];
    for (const [name, call] of checks) {
      await test.step(`${name} → 403 FORBIDDEN`, async () => {
        const r = await call();
        expect.soft(r.status, name).toBe(403);
        expect.soft(code(r), name).toBe('FORBIDDEN');
        expect.soft(message(r), name).toBe('ไม่มีสิทธิ์ดำเนินการ');
      });
    }
    await test.step('หลังถูกปฏิเสธ trade ยังอยู่ใน dropdown /phone', async () => {
      await gotoReady(page, '/phone');
      await expect.soft(page.getByTestId('occupation-select').locator('option[value="trade"]')).toHaveCount(1);
    });
  });
}

{
  const t = tc('TC-AD-04');
  test(t.title, t.details, async ({ api }) => {
    const { draftId } = await createDraftD01(api);
    const admin = await api.as('admin');
    const admin2 = await api.as('admin2');
    expect((await admin.post(`/api/v1/admin/versions/${draftId}/approve`)).status, 'approve ก่อน publish').toBe(200);
    const countPublished = async () => (await versions(admin)).filter((v) => v.version !== null).length;
    const before = await countPublished();
    const [a, b] = await test.step('admin.test + admin2.test Publish พร้อมกัน baseVersion=0.1.0-mock', () =>
      Promise.all([
        admin.post(`/api/v1/admin/versions/${draftId}/publish`, { baseVersion: SEED_VERSION }),
        admin2.post(`/api/v1/admin/versions/${draftId}/publish`, { baseVersion: SEED_VERSION }),
      ]),
    );
    await test.step('คนแรก 200 · คนที่สอง 409 VERSION_CONFLICT · เวอร์ชันใหม่ +1', async () => {
      expect.soft([a.status, b.status].sort()).toEqual([200, 409]);
      const loser = a.status === 409 ? a : b;
      expect.soft(code(loser)).toBe('VERSION_CONFLICT');
      expect.soft(message(loser) ?? '').toContain('เผยแพร่เวอร์ชันอื่น');
      expect.soft((await countPublished()) - before).toBe(1);
    });
  });
}

{
  const t = tc('TC-AD-05');
  test(t.title, t.details, async ({ page, api }) => {
    await createDraftD01(api);
    const admin = await api.as('admin');
    const approveResponses: number[] = [];
    page.on('response', (r) => {
      if (/\/api\/v1\/admin\/versions\/[^/]+\/approve$/.test(r.url())) approveResponses.push(r.status());
    });
    await test.step('admin.test เปิด /admin/versions แล้วคลิก Approve 2 ครั้งติดกันจริง', async () => {
      await uiLogin(page, 'admin');
      await gotoReady(page, '/admin/versions');
      const btn = page.locator('[data-testid="version-row"][data-status="DRAFT"]').getByTestId('approve-button');
      await expect(btn).toBeVisible();
      const box = await btn.boundingBox();
      if (!box) throw new Error('ไม่พบปุ่ม Approve');
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await expect(page.getByTestId('version-success').or(page.getByTestId('version-error')).first()).toBeVisible();
      await page.waitForLoadState('networkidle');
    });
    await test.step('ถ้ามีคำขอที่ 2 ต้องถูกปฏิเสธ (4xx) · Approve ซ้ำผ่าน API ต้อง 4xx + ข้อความสถานะ', async () => {
      api.add(`[ui] approve responses จากการคลิก 2 ครั้ง: ${JSON.stringify(approveResponses)}`);
      test.info().annotations.push({ type: 'หลักฐาน', description: `approve responses จากหน้าเว็บ: ${JSON.stringify(approveResponses)}` });
      expect.soft(approveResponses.filter((s) => s === 200), 'approve สำเร็จ').toHaveLength(1);
      for (const s of approveResponses.slice(1)) expect.soft(s, 'approve ครั้งถัดไป').toBeGreaterThanOrEqual(400);
      const draft = (await versions(admin)).find((v) => v.status === 'APPROVED');
      const again = await admin.post(`/api/v1/admin/versions/${draft?.id}/approve`);
      expect.soft(again.status).toBeGreaterThanOrEqual(400);
      expect.soft(again.status).toBeLessThan(500);
      expect.soft(message(again) ?? '').toContain('สถานะ');
    });
    await test.step('Audit มี APPROVED 1 แถว', async () => {
      const approved = (await auditRows(admin)).filter((r) => r.action === 'APPROVED');
      test.info().annotations.push({ type: 'หลักฐาน', description: `Audit APPROVED = ${approved.length} แถว` });
      expect.soft(approved).toHaveLength(1);
    });
    await test.step('Draft ใหม่ (หลัง reset) Publish ก่อน Approve → 4xx และเวอร์ชันไม่เปลี่ยน', async () => {
      await resetSeed(page);
      const { draftId } = await createDraftD01(api);
      const admin2 = await api.as('admin');
      const r = await admin2.post(`/api/v1/admin/versions/${draftId}/publish`, { baseVersion: SEED_VERSION });
      expect.soft(r.status).toBeGreaterThanOrEqual(400);
      expect.soft(r.status).toBeLessThan(500);
      expect.soft(await publishedVersion(admin2)).toBe(SEED_VERSION);
    });
  });
}

{
  const t = tc('TC-AD-06');
  test(t.title, t.details, async ({ api }) => {
    const editor = await api.as('editor');
    const base = { grade: 'good', categories: ['work'], pros: 'ทดสอบ', cons: null, source: 'Test Fixture' };
    await test.step('คู่ 24 (ซ้ำ) → 409 "มีคู่เลขนี้แล้ว"', async () => {
      const r = await editor.post('/api/v1/admin/pairs', { ...base, pairs: ['24'] });
      expect.soft(r.status).toBe(409);
      expect.soft(message(r)).toBe('มีคู่เลขนี้แล้ว');
    });
    await test.step('source ว่าง → 400 SOURCE_REQUIRED + ข้อความแจ้งต้องระบุแหล่งอ้างอิง', async () => {
      const r = await editor.post('/api/v1/admin/pairs', { ...base, pairs: ['68'], source: '' });
      expect.soft(r.status).toBe(400);
      expect.soft(code(r)).toBe('SOURCE_REQUIRED');
      expect.soft(message(r) ?? '').toContain('แหล่งอ้างอิง');
    });
    for (const p of ['7', 'abc']) {
      await test.step(`คู่ "${p}" → 400 "กรุณากรอกเลข 2 หลัก"`, async () => {
        const r = await editor.post('/api/v1/admin/pairs', { ...base, pairs: [p] });
        expect.soft(r.status, p).toBe(400);
        expect.soft(message(r), p).toBe('กรุณากรอกเลข 2 หลัก');
      });
    }
  });
}

{
  const t = tc('TC-AD-07');
  test(t.title, t.details, async ({ api }) => {
    const editor = await api.as('editor');
    const base = { pairs: ['33'], grade: 'good', categories: ['work'], cons: null, source: 'Test Fixture', pros: 'ทดสอบ' };
    await test.step('pros ก×501 → 400 VALIDATION_LENGTH', async () => {
      const r = await editor.post('/api/v1/admin/pairs', { ...base, pros: 'ก'.repeat(501) });
      expect.soft(r.status).toBe(400);
      expect.soft(code(r)).toBe('VALIDATION_LENGTH');
    });
    await test.step('source a×256 → 400 VALIDATION_LENGTH + ข้อความความยาวไม่อยู่ในช่วง', async () => {
      const r = await editor.post('/api/v1/admin/pairs', { ...base, source: 'a'.repeat(256) });
      expect.soft(r.status).toBe(400);
      expect.soft(code(r)).toBe('VALIDATION_LENGTH');
      expect.soft(message(r) ?? '').toContain('ความยาว');
    });
    await test.step('pros ก×500 → 200 บันทึก Draft ได้', async () => {
      const r = await editor.post('/api/v1/admin/pairs', { ...base, pros: 'ก'.repeat(500) });
      expect.soft(r.status).toBe(200);
    });
  });
}

{
  const t = tc('TC-AD-08');
  test(t.title, t.details, async ({ page, api }) => {
    const editor = await api.as('editor');
    const admin = await api.as('admin');
    const option = () => page.getByTestId('occupation-select').locator('option', { hasText: 'ครูออนไลน์' });
    await test.step('ruleRef not-exist (AD-C03) → 400 INVALID_OPTION', async () => {
      const r = await editor.post('/api/v1/admin/categories', { ...AD_C01, ruleRef: 'not-exist' });
      expect.soft(r.status).toBe(400);
      expect.soft(code(r)).toBe('INVALID_OPTION');
    });
    await test.step('editor.test สร้าง AD-C01 → admin.test เผยแพร่', async () => {
      expect.soft((await editor.post('/api/v1/admin/categories', AD_C01)).status).toBe(200);
      expect.soft((await admin.post(`/api/v1/admin/categories/${AD_C01.id}/publish`)).status).toBe(200);
    });
    await test.step('เปิด /phone ใหม่ → dropdown มี "ครูออนไลน์"', async () => {
      await gotoReady(page, '/phone');
      await expect.soft(option()).toHaveCount(1);
    });
    await test.step('admin.test ปิดหมวด → เปิด /phone ใหม่ไม่มี "ครูออนไลน์" + API teacher-online → 400 INVALID_OPTION', async () => {
      expect.soft((await admin.patch(`/api/v1/admin/categories/${AD_C01.id}`, { enabled: false })).status).toBe(200);
      await gotoReady(page, '/phone');
      await expect.soft(option()).toHaveCount(0);
      const r = await phone(await api.client(), { number: '0891245678', occupation: AD_C01.id });
      expect.soft(r.status).toBe(400);
      expect.soft(code(r)).toBe('INVALID_OPTION');
    });
  });
}

{
  const t = tc('TC-AD-09');
  test(t.title, t.details, async ({ page, api }) => {
    await createDraftD01(api);
    await test.step('admin.test เปิด Diff ของ Draft ที่ /admin/versions', async () => {
      await uiLogin(page, 'admin');
      await gotoReady(page, '/admin/versions');
      await page.locator('[data-testid="version-row"][data-status="DRAFT"]').getByTestId('diff-button').click();
      await expect(page.getByTestId('diff-panel')).toBeVisible();
    });
    await test.step('Diff มีคู่ 47 และ 74 (ไม่มีข้อมูล → good) และไม่มีคู่อื่นเปลี่ยน', async () => {
      const entries = page.getByTestId('diff-entry');
      await expect.soft(entries).toHaveCount(1);
      await expect.soft(entries.first()).toContainText('47');
      await expect.soft(entries.first()).toContainText('74');
      await expect.soft(entries.first()).toContainText(/good|ดี/);
    });
    await test.step('ก่อน Approve /api/v1/pairs/47 ยังไม่มีข้อมูล', async () => {
      expect.soft(await pairGrade(await api.client(), '47')).toBe('no-data');
    });
  });
}

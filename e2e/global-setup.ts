import fs from 'node:fs';
import path from 'node:path';
import { request } from '@playwright/test';
import { BASE_URL, IS_GIF, LOCK_NOW, REPORT_DIR } from './support/env';

/** Entry E-3/E-4 ของ TEST-PLAN §6.1 + อ่าน data-bug-mode เก็บไว้ใส่รายงาน */
export default async function globalSetup() {
  const ctx = await request.newContext({ baseURL: BASE_URL });
  try {
    const health = await ctx.get('/api/health');
    const body = await health.json().catch(() => ({}));
    if (!(body.ok === true && body.db === true)) {
      throw new Error(`/api/health ไม่พร้อม: ${JSON.stringify(body)} — หยุดรัน (E-3)`);
    }
    const html = await (await ctx.get('/')).text();
    const bugMode = /data-bug-mode="([^"]*)"/.exec(html)?.[1] ?? 'unknown';

    const reset = await ctx.post('/api/test/reset', { data: { now: LOCK_NOW } });
    const resetBody = await reset.json().catch(() => ({}));
    if (!resetBody.success) throw new Error(`reset ไม่สำเร็จ: ${JSON.stringify(resetBody)} — หยุดรัน (E-4)`);

    fs.mkdirSync(path.join(REPORT_DIR, 'runs'), { recursive: true });
    const meta = {
      runId: process.env.RUN_ID,
      gif: IS_GIF,
      startedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      bugMode,
      lockNow: LOCK_NOW,
      resetNow: resetBody.data?.now,
    };
    fs.writeFileSync(path.join(REPORT_DIR, 'runs', `${process.env.RUN_ID}.meta.json`), JSON.stringify(meta, null, 2));
  } finally {
    await ctx.dispose();
  }
}

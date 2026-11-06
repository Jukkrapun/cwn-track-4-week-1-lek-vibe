import type { ApiClient, ApiLog } from './api';

export const PAIRS_RULESET = 'pairs-common-belief-mock';
export const SEED_VERSION = '0.1.0-mock';

/** Payload AD-D01 (TEST-DATA §8.1) */
export const AD_D01 = {
  pairs: ['47', '74'],
  grade: 'good',
  categories: ['work'],
  pros: 'ทดสอบ: ความคิดสร้างสรรค์',
  cons: null,
  source: 'Test Fixture',
};

/** Payload AD-C01 (TEST-DATA §8.2) */
export const AD_C01 = {
  id: 'teacher-online',
  type: 'OCCUPATION',
  label: 'ครูออนไลน์',
  enabled: true,
  ruleRef: 'government-teacher',
};

export function phone(c: ApiClient, body: Record<string, unknown>) {
  return c.post('/api/v1/phone/analyze', body);
}

export function suggestPlate(c: ApiClient, body: Record<string, unknown>) {
  return c.post('/api/v1/plate/suggest', body);
}

export function plate(c: ApiClient, body: Record<string, unknown>) {
  return c.post('/api/v1/plate/analyze', body);
}

/** สถิติ PHONE ปัจจุบัน (อ่านด้วย admin) */
export async function phoneStat(admin: ApiClient): Promise<number> {
  const r = await admin.get('/api/v1/admin/stats');
  const usage: Array<{ type: string; total: number }> = r.body?.data?.usage ?? [];
  return usage.filter((u) => u.type === 'PHONE').reduce((s, u) => s + Number(u.total), 0);
}

export async function versions(admin: ApiClient): Promise<Array<{ id: string; version: string | null; status: string; ruleId: string }>> {
  const r = await admin.get('/api/v1/admin/rule-sets');
  return (r.body?.data?.versions ?? []).filter((v: { ruleId: string }) => v.ruleId === PAIRS_RULESET);
}

export async function publishedVersion(admin: ApiClient): Promise<string | undefined> {
  return (await versions(admin)).find((v) => v.status === 'PUBLISHED')?.version ?? undefined;
}

export async function auditRows(admin: ApiClient): Promise<Array<{ action: string; actor: string }>> {
  const r = await admin.get('/api/v1/admin/audit');
  return r.body?.data?.items ?? [];
}

/** editor.test สร้าง Draft AD-D01 คืน draftId */
export async function createDraftD01(api: ApiLog): Promise<{ editor: ApiClient; draftId: string }> {
  const editor = await api.as('editor');
  const r = await editor.post('/api/v1/admin/pairs', AD_D01);
  const draftId = r.body?.data?.draftId;
  if (!draftId) throw new Error(`สร้าง Draft AD-D01 ไม่สำเร็จ: ${r.status} ${r.text}`);
  return { editor, draftId };
}

export async function pairGrade(c: ApiClient, pair: string): Promise<string | undefined> {
  return (await c.get(`/api/v1/pairs/${pair}`)).body?.data?.grade;
}

export const code = (r: { body: any }) => r.body?.error?.code;
export const message = (r: { body: any }) => r.body?.error?.message;

// RuleManagement: Draft → Approve → Publish → Superseded · Rollback = เวอร์ชันใหม่ (BR-AD-01..04, FR-AD-02..06)
import type { PoolClient } from 'pg';
import { diffPairGroups, findDuplicatePair, nextVersion, validatePairDraft } from '@/domain/admin-validation';
import { AppError } from '@/domain/errors';
import { analyzePhonePairs, normalizePhone } from '@/domain/phone';
import type { PairRuleSet } from '@/domain/types';
import goldenCases from '@/domain/fixtures/golden-cases.json';
import { appendAudit } from '@/infrastructure/audit-repository';
import { query, withTransaction } from '@/infrastructure/db';
import {
  cloneVersionContent,
  findOpenDraft,
  findPublishedVersion,
  findVersion,
  findVersionByLabel,
  insertPairGroup,
  loadPairGroups,
  loadPairRuleSet,
  RULE_SET_IDS,
  updatePairGroup,
  type VersionRow,
} from '@/infrastructure/rule-repository';
import { now } from '@/shared/clock';
import type { SessionInfo } from './identity-service';

const lockRuleSet = (client: PoolClient, id: string) => client.query('SELECT id FROM rule_set WHERE id = $1 FOR UPDATE', [id]);

async function versionLabels(client: PoolClient, ruleSetId: string): Promise<string[]> {
  const r = await client.query<{ version: string }>('SELECT version FROM rule_set_version WHERE rule_set_id = $1 AND version IS NOT NULL', [ruleSetId]);
  return r.rows.map((x) => x.version);
}

/** หา/สร้าง Draft ที่เปิดอยู่ของ Rule Set (clone จากเวอร์ชันที่ Published) */
async function ensureDraft(client: PoolClient, ruleSetId: string, user: SessionInfo): Promise<VersionRow> {
  await lockRuleSet(client, ruleSetId);
  const open = await findOpenDraft(ruleSetId, client);
  if (open) {
    if (open.status !== 'DRAFT') throw new AppError('INVALID_STATE');
    return open;
  }
  const pub = await findPublishedVersion(ruleSetId, client);
  if (!pub) throw new AppError('NOT_FOUND');
  const ins = await client.query<{ id: string }>(
    `INSERT INTO rule_set_version (rule_set_id, status, source_name, source_url, is_mock, based_on_version_id, created_by, created_at)
     VALUES ($1, 'DRAFT', $2, $3, $4, $5, $6, $7) RETURNING id`,
    [ruleSetId, pub.source_name, pub.source_url, pub.is_mock, pub.id, user.userId, now()],
  );
  await cloneVersionContent(pub.id, ins.rows[0].id, client);
  return (await findVersion(ins.rows[0].id, client))!;
}

export async function savePairDraft(body: Record<string, unknown>, user: SessionInfo, requestId: string, mode: 'create' | 'update') {
  const v = validatePairDraft(body);
  if (!v.ok) throw new AppError(v.code, v.field);
  const input = v.value;
  return withTransaction(async (client) => {
    const draft = await ensureDraft(client, RULE_SET_IDS.pairs, user);
    const groups = await loadPairGroups(draft.id, client);
    const sameSet = (g: { pairs: readonly string[] }) => g.pairs.length === input.pairs.length && input.pairs.every((p) => g.pairs.includes(p));
    const existing = groups.find(sameSet) ?? null;
    let before: unknown = null;
    if (mode === 'create') {
      if (findDuplicatePair(input.pairs, groups)) throw new AppError('PAIR_DUPLICATE', 'pairs');
      await insertPairGroup(draft.id, input, client);
    } else {
      if (!existing) throw new AppError('NOT_FOUND', 'pairs');
      before = existing.grade;
      await updatePairGroup(draft.id, { ...input, pairs: existing.pairs }, client);
    }
    await appendAudit(
      { actorId: user.userId, role: user.role, action: 'DRAFT_SAVED', entityType: 'pair', entityId: input.pairs.join('|'), before, after: input.grade, requestId, at: now() },
      client,
    );
    return { draftId: draft.id, ruleSetId: draft.rule_set_id, status: 'DRAFT', pairs: input.pairs, grade: input.grade };
  });
}

export async function diffDraft(versionId: string) {
  const draft = await findVersion(versionId);
  if (!draft) throw new AppError('NOT_FOUND');
  const base = draft.based_on_version_id ? await findVersion(draft.based_on_version_id) : await findPublishedVersion(draft.rule_set_id);
  const [before, after] = await Promise.all([base ? loadPairGroups(base.id) : [], loadPairGroups(draft.id)]);
  return { versionId, baseVersion: base?.version ?? null, changes: diffPairGroups(before, after) };
}

/** Preview: รัน Golden phone cases + เบอร์ทดสอบเพิ่มเติมกับ Draft เทียบกับ Published (ADR-005) */
export async function previewDraft(versionId: string, extraNumbers: unknown) {
  const draft = await findVersion(versionId);
  if (!draft) throw new AppError('NOT_FOUND');
  const pub = await findPublishedVersion(draft.rule_set_id);
  if (!pub) throw new AppError('NOT_FOUND');
  const [draftRules, pubRules]: PairRuleSet[] = await Promise.all([loadPairRuleSet(draft), loadPairRuleSet(pub)]);
  const extras = Array.isArray(extraNumbers) ? extraNumbers.filter((x): x is string => typeof x === 'string').slice(0, 5) : [];
  const cases = [...goldenCases.phonePairs.map((c) => ({ id: c.id, number: c.number })), ...extras.map((n, i) => ({ id: `EXTRA-${i + 1}`, number: n }))];
  type PreviewRow = { id: string; number: string; error: string | null; changes: { position: string; pair: string; before: string; after: string }[] };
  const results = cases.map((c): PreviewRow => {
    const n = normalizePhone(c.number);
    if (!n.ok) return { id: c.id, number: c.number, error: n.code, changes: [] };
    const a = analyzePhonePairs(n.value, pubRules);
    const b = analyzePhonePairs(n.value, draftRules);
    const changes = a.flatMap((p, i) => (p.grade !== b[i].grade ? [{ position: p.position, pair: p.pair, before: p.grade, after: b[i].grade }] : []));
    return { id: c.id, number: n.value, error: null, changes };
  });
  return { versionId, publishedVersion: pub.version, casesRun: cases.length, changedCases: results.filter((r) => r.changes.length > 0).length, results };
}

export async function approveVersion(versionId: string, user: SessionInfo, requestId: string) {
  return withTransaction(async (client) => {
    const v = await findVersion(versionId, client);
    if (!v) throw new AppError('NOT_FOUND');
    if (v.created_by === user.userId) throw new AppError('FORBIDDEN_SELF_APPROVE');
    if (user.role !== 'ADMIN') throw new AppError('FORBIDDEN');
    if (v.status !== 'DRAFT') throw new AppError('INVALID_STATE');
    await client.query("UPDATE rule_set_version SET status = 'APPROVED', approved_by = $2 WHERE id = $1", [versionId, user.userId]);
    await appendAudit(
      { actorId: user.userId, role: user.role, action: 'APPROVED', entityType: 'version', entityId: `${v.rule_set_id}:draft`, before: 'DRAFT', after: 'APPROVED', requestId, at: now() },
      client,
    );
    return { versionId, status: 'APPROVED' };
  });
}

async function switchPublished(client: PoolClient, ruleSetId: string, oldId: string, newId: string, version: string): Promise<void> {
  const at = now();
  await client.query("UPDATE rule_set_version SET status = 'SUPERSEDED' WHERE id = $1", [oldId]);
  await client.query("UPDATE rule_set_version SET status = 'PUBLISHED', version = $2, effective_at = $3 WHERE id = $1", [newId, version, at]);
  await client.query('UPDATE rule_set SET published_version_id = $2 WHERE id = $1', [ruleSetId, newId]);
}

export async function publishVersion(versionId: string, baseVersion: unknown, user: SessionInfo, requestId: string) {
  if (user.role !== 'ADMIN') throw new AppError('FORBIDDEN');
  if (typeof baseVersion !== 'string' || baseVersion === '') throw new AppError('INVALID_REQUEST', 'baseVersion');
  return withTransaction(async (client) => {
    const pre = await findVersion(versionId, client);
    if (!pre) throw new AppError('NOT_FOUND');
    await lockRuleSet(client, pre.rule_set_id);
    const pub = await findPublishedVersion(pre.rule_set_id, client);
    if (!pub || pub.version !== baseVersion) throw new AppError('VERSION_CONFLICT', 'baseVersion');
    const v = (await findVersion(versionId, client))!;
    if (v.status !== 'APPROVED') throw new AppError('INVALID_STATE');
    const version = nextVersion(await versionLabels(client, v.rule_set_id));
    await appendAudit(
      { actorId: user.userId, role: user.role, action: 'PUBLISHED', entityType: 'rule_set', entityId: v.rule_set_id, before: pub.version, after: version, requestId, at: now() },
      client,
    );
    await switchPublished(client, v.rule_set_id, pub.id, v.id, version);
    return { ruleSetId: v.rule_set_id, versionId, version, previousVersion: pub.version };
  });
}

export async function rollbackRuleSet(body: Record<string, unknown>, user: SessionInfo, requestId: string) {
  if (user.role !== 'ADMIN') throw new AppError('FORBIDDEN');
  const { ruleSetId, targetVersion, baseVersion } = body;
  if (typeof ruleSetId !== 'string' || typeof targetVersion !== 'string') throw new AppError('INVALID_REQUEST');
  return withTransaction(async (client) => {
    await lockRuleSet(client, ruleSetId);
    const pub = await findPublishedVersion(ruleSetId, client);
    if (!pub) throw new AppError('NOT_FOUND');
    if (typeof baseVersion === 'string' && baseVersion !== pub.version) throw new AppError('VERSION_CONFLICT', 'baseVersion');
    const target = await findVersionByLabel(ruleSetId, targetVersion, client);
    if (!target || target.status !== 'SUPERSEDED') throw new AppError('INVALID_STATE', 'targetVersion');
    if (await findOpenDraft(ruleSetId, client)) throw new AppError('INVALID_STATE');
    const version = nextVersion(await versionLabels(client, ruleSetId));
    const ins = await client.query<{ id: string }>(
      `INSERT INTO rule_set_version (rule_set_id, status, source_name, source_url, is_mock, based_on_version_id, created_by, approved_by, created_at)
       VALUES ($1, 'DRAFT', $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [ruleSetId, target.source_name, target.source_url, target.is_mock, target.id, target.created_by, user.userId === target.created_by ? target.approved_by : user.userId, now()],
    );
    await cloneVersionContent(target.id, ins.rows[0].id, client);
    await appendAudit(
      {
        actorId: user.userId, role: user.role, action: 'ROLLBACK', entityType: 'rule_set', entityId: ruleSetId,
        before: pub.version, after: { version, from: target.version }, requestId, at: now(),
      },
      client,
    );
    await switchPublished(client, ruleSetId, pub.id, ins.rows[0].id, version);
    return { ruleSetId, version, rolledBackTo: target.version, previousVersion: pub.version };
  });
}

export async function discardDraft(versionId: string, user: SessionInfo, requestId: string) {
  return withTransaction(async (client) => {
    const v = await findVersion(versionId, client);
    if (!v) throw new AppError('NOT_FOUND');
    if (v.status !== 'DRAFT') throw new AppError('INVALID_STATE');
    if (v.created_by !== user.userId && user.role !== 'ADMIN') throw new AppError('FORBIDDEN');
    await client.query('DELETE FROM rule_set_version WHERE id = $1', [versionId]);
    await appendAudit(
      { actorId: user.userId, role: user.role, action: 'DRAFT_DISCARDED', entityType: 'version', entityId: `${v.rule_set_id}:draft`, before: 'DRAFT', after: null, requestId, at: now() },
      client,
    );
    return { versionId, discarded: true };
  });
}

export async function draftPairGroups(versionId: string) {
  return loadPairGroups(versionId);
}

export const countAudit = async () => Number((await query<{ n: string }>('SELECT count(*)::text AS n FROM audit_log'))[0].n);

// หมวดอาชีพ / เป้าหมาย (US-AD-003, FR-AD-08, I-9)
import { AppError } from '@/domain/errors';
import { PAIR_CATEGORIES } from '@/domain/types';
import { appendAudit } from '@/infrastructure/audit-repository';
import { withTransaction } from '@/infrastructure/db';
import { findPublishedVersion, RULE_SET_IDS } from '@/infrastructure/rule-repository';
import { now } from '@/shared/clock';
import type { SessionInfo } from './identity-service';

interface CategoryRecord {
  id: string;
  type: string;
  label: string;
  enabled: boolean;
  rule_ref: string | null;
  status: string;
  created_by: string | null;
}

export async function createCategory(body: Record<string, unknown>, user: SessionInfo, requestId: string) {
  const { id, type, label, enabled, ruleRef } = body;
  if (typeof id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id) || id.length > 64) throw new AppError('INVALID_REQUEST', 'id');
  if (type !== 'OCCUPATION' && type !== 'GOAL') throw new AppError('INVALID_OPTION', 'type');
  if (typeof label !== 'string' || label.trim() === '' || label.length > 100) throw new AppError('VALIDATION_LENGTH', 'label');
  const ref = ruleRef === undefined || ruleRef === null || ruleRef === '' ? null : ruleRef;
  if (ref !== null && typeof ref !== 'string') throw new AppError('INVALID_OPTION', 'ruleRef');
  return withTransaction(async (client) => {
    if (ref !== null) {
      let exists: boolean;
      if (type === 'GOAL') exists = (PAIR_CATEGORIES as readonly string[]).includes(ref);
      else {
        const pub = await findPublishedVersion(RULE_SET_IDS.wongnai, client);
        const r = await client.query('SELECT 1 FROM occupation_pair WHERE rule_set_version_id = $1 AND group_key = $2 LIMIT 1', [pub?.id, ref]);
        exists = (r.rowCount ?? 0) > 0;
      }
      if (!exists) throw new AppError('INVALID_OPTION', 'ruleRef');
    }
    const dup = await client.query('SELECT 1 FROM category WHERE id = $1', [id]);
    if ((dup.rowCount ?? 0) > 0) throw new AppError('PAIR_DUPLICATE', 'id');
    const order = await client.query<{ n: number }>('SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM category WHERE type = $1', [type]);
    const isEnabled = enabled !== false;
    await client.query(
      `INSERT INTO category (id, type, label, enabled, rule_ref, status, created_by, sort_order) VALUES ($1, $2, $3, $4, $5, 'DRAFT', $6, $7)`,
      [id, type, label.trim(), isEnabled, ref, user.userId, order.rows[0].n],
    );
    await appendAudit(
      { actorId: user.userId, role: user.role, action: 'CATEGORY_CREATED', entityType: 'category', entityId: id, before: null, after: { type, label, enabled: isEnabled, ruleRef: ref, status: 'DRAFT' }, requestId, at: now() },
      client,
    );
    return { id, status: 'DRAFT' };
  });
}

async function loadCategory(client: import('pg').PoolClient, id: string): Promise<CategoryRecord> {
  const r = await client.query<CategoryRecord>('SELECT id, type, label, enabled, rule_ref, status, created_by FROM category WHERE id = $1 FOR UPDATE', [id]);
  if (!r.rows[0]) throw new AppError('NOT_FOUND');
  return r.rows[0];
}

export async function publishCategory(id: string, user: SessionInfo, requestId: string) {
  return withTransaction(async (client) => {
    const c = await loadCategory(client, id);
    if (c.created_by === user.userId) throw new AppError('FORBIDDEN_SELF_APPROVE');
    if (user.role !== 'ADMIN') throw new AppError('FORBIDDEN');
    if (c.status !== 'DRAFT') throw new AppError('INVALID_STATE');
    await client.query("UPDATE category SET status = 'PUBLISHED', approved_by = $2 WHERE id = $1", [id, user.userId]);
    await appendAudit({ actorId: user.userId, role: user.role, action: 'CATEGORY_PUBLISHED', entityType: 'category', entityId: id, before: 'DRAFT', after: 'PUBLISHED', requestId, at: now() }, client);
    return { id, status: 'PUBLISHED' };
  });
}

export async function toggleCategory(id: string, enabled: unknown, user: SessionInfo, requestId: string) {
  if (user.role !== 'ADMIN') throw new AppError('FORBIDDEN');
  if (typeof enabled !== 'boolean') throw new AppError('INVALID_REQUEST', 'enabled');
  return withTransaction(async (client) => {
    const c = await loadCategory(client, id);
    await client.query('UPDATE category SET enabled = $2 WHERE id = $1', [id, enabled]);
    await appendAudit({ actorId: user.userId, role: user.role, action: 'CATEGORY_TOGGLED', entityType: 'category', entityId: id, before: { enabled: c.enabled }, after: { enabled }, requestId, at: now() }, client);
    return { id, enabled };
  });
}

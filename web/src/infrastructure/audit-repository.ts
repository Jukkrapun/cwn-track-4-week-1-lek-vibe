// AuditRepository — append-only (I-7)
import { query, type Queryable, getPool } from './db';

export interface AuditInput {
  actorId: string;
  role: 'EDITOR' | 'ADMIN';
  action: 'DRAFT_SAVED' | 'APPROVED' | 'PUBLISHED' | 'ROLLBACK' | 'CATEGORY_CREATED' | 'CATEGORY_PUBLISHED' | 'CATEGORY_TOGGLED' | 'DRAFT_DISCARDED';
  entityType: string;
  entityId: string;
  before: unknown;
  after: unknown;
  requestId: string;
  at: Date;
}

export async function appendAudit(e: AuditInput, db: Queryable): Promise<void> {
  await query(
    `INSERT INTO audit_log (actor_id, role, action, entity_type, entity_id, before, after, request_id, at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [e.actorId, e.role, e.action, e.entityType, e.entityId, e.before === null ? null : JSON.stringify(e.before), e.after === null ? null : JSON.stringify(e.after), e.requestId, e.at],
    db,
  );
}

export interface AuditRow {
  seq: string;
  actor: string;
  role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before: unknown;
  after: unknown;
  request_id: string;
  at: Date;
}

export async function listAudit(limit = 200, db: Queryable = getPool()): Promise<AuditRow[]> {
  return query<AuditRow>(
    `SELECT a.seq, u.username AS actor, a.role, a.action, a.entity_type, a.entity_id, a.before, a.after, a.request_id, a.at
       FROM audit_log a JOIN app_user u ON u.id = a.actor_id ORDER BY a.seq LIMIT $1`,
    [limit],
    db,
  );
}

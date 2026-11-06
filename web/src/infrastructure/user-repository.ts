// UserRepository + Session
import { query, getPool, type Queryable } from './db';

export interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  role: 'EDITOR' | 'ADMIN';
  failed_login_count: number;
  locked_until: Date | null;
}

export async function findUserByUsername(username: string, db: Queryable = getPool()): Promise<UserRow | null> {
  const rows = await query<UserRow>('SELECT id, username, password_hash, role, failed_login_count, locked_until FROM app_user WHERE username = $1', [username], db);
  return rows[0] ?? null;
}

export async function updateLoginState(id: string, failed: number, lockedUntil: Date | null, db: Queryable = getPool()): Promise<void> {
  await query('UPDATE app_user SET failed_login_count = $2, locked_until = $3 WHERE id = $1', [id, failed, lockedUntil], db);
}

export async function recordLoginAttempt(username: string, userId: string | null, success: boolean, result: string, at: Date): Promise<void> {
  await query('INSERT INTO login_attempt (username, user_id, success, result, at) VALUES ($1, $2, $3, $4, $5)', [username.slice(0, 64), userId, success, result, at]);
}

export async function createSession(tokenHash: string, userId: string, at: Date): Promise<void> {
  await query('INSERT INTO session (token_hash, user_id, created_at, last_seen_at) VALUES ($1, $2, $3, $3)', [tokenHash, userId, at]);
}

export interface SessionUser {
  token_hash: string;
  last_seen_at: Date;
  revoked_at: Date | null;
  id: string;
  username: string;
  role: 'EDITOR' | 'ADMIN';
}

export async function findSession(tokenHash: string): Promise<SessionUser | null> {
  const rows = await query<SessionUser>(
    `SELECT s.token_hash, s.last_seen_at, s.revoked_at, u.id, u.username, u.role
       FROM session s JOIN app_user u ON u.id = s.user_id WHERE s.token_hash = $1`,
    [tokenHash],
  );
  return rows[0] ?? null;
}

export async function touchSession(tokenHash: string, at: Date): Promise<void> {
  await query('UPDATE session SET last_seen_at = $2 WHERE token_hash = $1', [tokenHash, at]);
}

export async function revokeSession(tokenHash: string, at: Date): Promise<void> {
  await query('UPDATE session SET revoked_at = $2 WHERE token_hash = $1 AND revoked_at IS NULL', [tokenHash, at]);
}

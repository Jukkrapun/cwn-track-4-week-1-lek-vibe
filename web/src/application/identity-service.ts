// Identity: login · lockout · session idle · RBAC (FR-AD-01, NFR-05/06, ADR-006)
import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { AppError } from '@/domain/errors';
import {
  createSession,
  findSession,
  findUserByUsername,
  recordLoginAttempt,
  revokeSession,
  touchSession,
  updateLoginState,
} from '@/infrastructure/user-repository';
import { now } from '@/shared/clock';
import { runtimeProfile } from '@/shared/runtime-profile';

export const SESSION_COOKIE = 'mongkol_session';
const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.1n2b1Q1Sv3x3wXYDq9u0PpnjzF5a';

export interface SessionInfo {
  readonly userId: string;
  readonly username: string;
  readonly role: 'EDITOR' | 'ADMIN';
  readonly tokenHash: string;
}

export const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');

export async function login(usernameRaw: unknown, passwordRaw: unknown): Promise<{ token: string; user: { username: string; role: string } }> {
  if (typeof usernameRaw !== 'string' || typeof passwordRaw !== 'string' || usernameRaw.length > 64 || passwordRaw.length > 200) {
    throw new AppError('AUTH_INVALID');
  }
  const username = usernameRaw.trim();
  const at = now();
  const policy = runtimeProfile();
  const user = await findUserByUsername(username);
  if (!user) {
    await bcrypt.compare(passwordRaw, DUMMY_HASH);
    await recordLoginAttempt(username, null, false, 'AUTH_INVALID', at);
    throw new AppError('AUTH_INVALID');
  }
  const lockActive = user.locked_until !== null && user.locked_until.getTime() > at.getTime();
  if (lockActive) {
    await recordLoginAttempt(username, user.id, false, 'AUTH_LOCKED', at);
    throw new AppError('AUTH_LOCKED');
  }
  const lockExpired = user.locked_until !== null;
  const baseFailures = lockExpired ? 0 : user.failed_login_count;
  const valid = await bcrypt.compare(passwordRaw, user.password_hash);
  if (!valid) {
    const failures = baseFailures + 1;
    const locked = failures >= policy.lockAfterFailures;
    await updateLoginState(user.id, failures, locked ? new Date(at.getTime() + policy.lockMinutes * 60_000) : null);
    await recordLoginAttempt(username, user.id, false, locked ? 'AUTH_LOCKED' : 'AUTH_INVALID', at);
    throw new AppError(locked ? 'AUTH_LOCKED' : 'AUTH_INVALID');
  }
  await updateLoginState(user.id, 0, null);
  const token = randomBytes(32).toString('base64url');
  await createSession(hashToken(token), user.id, at);
  await recordLoginAttempt(username, user.id, true, 'OK', at);
  return { token, user: { username: user.username, role: user.role } };
}

/** คืน session ที่ยังไม่ idle เกิน 30 นาที และต่ออายุ last_seen */
export async function resolveSession(token: string | undefined, touch = true): Promise<SessionInfo | null> {
  if (!token || token.length > 100) return null;
  const tokenHash = hashToken(token);
  const s = await findSession(tokenHash);
  if (!s || s.revoked_at) return null;
  const at = now();
  if (at.getTime() - s.last_seen_at.getTime() >= runtimeProfile().idleMinutes * 60_000) {
    await revokeSession(tokenHash, at);
    return null;
  }
  if (touch) await touchSession(tokenHash, at);
  return { userId: s.id, username: s.username, role: s.role, tokenHash };
}

export async function logout(token: string | undefined): Promise<void> {
  if (token) await revokeSession(hashToken(token), now());
}

export function requireRole(session: SessionInfo | null, roles: readonly ('EDITOR' | 'ADMIN')[]): SessionInfo {
  if (!session) throw new AppError('UNAUTHENTICATED');
  if (!roles.includes(session.role)) throw new AppError('FORBIDDEN');
  return session;
}

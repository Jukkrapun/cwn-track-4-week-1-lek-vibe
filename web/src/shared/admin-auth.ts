// ตรวจ session + RBAC ฝั่ง Server ทุก request (NFR-05) และป้องกัน CSRF ด้วย Origin
import type { NextRequest } from 'next/server';
import { AppError } from '@/domain/errors';
import { requireRole, resolveSession, SESSION_COOKIE, type SessionInfo } from '@/application/identity-service';

export async function adminSession(req: NextRequest, roles: readonly ('EDITOR' | 'ADMIN')[] = ['EDITOR', 'ADMIN']): Promise<SessionInfo> {
  if (req.method !== 'GET') {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host && new URL(origin).host !== host) throw new AppError('FORBIDDEN');
  }
  const session = await resolveSession(req.cookies.get(SESSION_COOKIE)?.value);
  return requireRole(session, roles);
}

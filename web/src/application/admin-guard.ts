// Guard สำหรับหน้า /admin/* (Server Component) — ไม่ login หรือ idle เกิน 30 นาที → redirect /admin/login
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ensureClockLoaded } from '@/shared/clock';
import { resolveSession, SESSION_COOKIE, type SessionInfo } from './identity-service';

export async function requireAdminPage(): Promise<SessionInfo> {
  await ensureClockLoaded();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await resolveSession(token);
  if (!session) redirect('/admin/login');
  return session;
}

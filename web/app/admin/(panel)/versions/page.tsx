import type { Metadata } from 'next';
import { requireAdminPage } from '@/application/admin-guard';
import { VersionsAdmin } from '@/components/admin/VersionsAdmin';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'เวอร์ชัน Rule', description: 'Diff · Preview · Approve · Publish · Rollback' };

export default async function Page() {
  const s = await requireAdminPage();
  return <VersionsAdmin role={s.role} username={s.username} />;
}

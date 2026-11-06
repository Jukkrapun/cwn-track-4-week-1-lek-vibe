import type { Metadata } from 'next';
import { requireAdminPage } from '@/application/admin-guard';
import { PairsAdmin } from '@/components/admin/PairsAdmin';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'จัดการความหมายคู่เลข', description: 'สร้าง/แก้ Draft ความหมายคู่เลข' };

export default async function Page() {
  const s = await requireAdminPage();
  return <PairsAdmin role={s.role} />;
}

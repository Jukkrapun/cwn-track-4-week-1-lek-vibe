import type { Metadata } from 'next';
import { requireAdminPage } from '@/application/admin-guard';
import { CategoriesAdmin } from '@/components/admin/CategoriesAdmin';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'หมวดอาชีพ/เป้าหมาย', description: 'สร้าง เปิด/ปิด และเผยแพร่หมวด' };

export default async function Page() {
  const s = await requireAdminPage();
  return <CategoriesAdmin role={s.role} username={s.username} />;
}

import Link from 'next/link';
import { requireAdminPage } from '@/application/admin-guard';
import { LogoutButton } from '@/components/admin/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const s = await requireAdminPage();
  const items = [
    { href: '/admin', label: 'ภาพรวม', id: 'dashboard' },
    { href: '/admin/pairs', label: 'ความหมายคู่เลข', id: 'pairs' },
    { href: '/admin/versions', label: 'เวอร์ชัน Rule', id: 'versions' },
    { href: '/admin/categories', label: 'หมวดอาชีพ/เป้าหมาย', id: 'categories' },
    ...(s.role === 'ADMIN' ? [{ href: '/admin/audit', label: 'Audit Log', id: 'audit' }] : []),
  ];
  return (
    <div className="admin-shell">
      <aside className="card admin-nav" aria-label="เมนูหลังบ้าน">
        <p data-testid="admin-user">
          <strong>{s.username}</strong> <span className="status" data-testid="admin-role">{s.role}</span>
        </p>
        <nav aria-label="เมนูหลังบ้าน">
          <ul>
            {items.map((i) => (
              <li key={i.href}><Link href={i.href} data-testid={`admin-nav-${i.id}`}>{i.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="actions"><LogoutButton /></div>
      </aside>
      <div>{children}</div>
    </div>
  );
}

import type { Metadata } from 'next';
import { requireAdminPage } from '@/application/admin-guard';
import { listAudit } from '@/infrastructure/audit-repository';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Audit Log', description: 'ประวัติการเปลี่ยนแปลง (append-only)' };

const fmt = (d: Date) => new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Asia/Bangkok' }).format(d);
const show = (v: unknown) => (v === null || v === undefined ? '—' : typeof v === 'string' ? v : JSON.stringify(v));

export default async function AuditPage() {
  const s = await requireAdminPage();
  if (s.role !== 'ADMIN') return <section className="card"><h1>Audit Log</h1><p className="alert alert-error" role="alert">ไม่มีสิทธิ์ดำเนินการ</p></section>;
  const rows = await listAudit();
  return (
    <section className="card">
      <h1>Audit Log</h1>
      <p className="muted">บันทึกแบบเพิ่มได้อย่างเดียว · เวลาเก็บเป็น UTC แสดงผลเป็นเวลาไทย</p>
      <div className="table-wrap">
        <table data-testid="audit-table">
          <thead><tr><th>#</th><th>เวลา</th><th>ผู้ทำ</th><th>Role</th><th>การกระทำ</th><th>รายการ</th><th>ค่าเดิม → ค่าใหม่</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={7}>ยังไม่มีรายการ</td></tr>}
            {rows.map((r) => (
              <tr key={r.seq} data-testid="audit-row" data-action={r.action} data-actor={r.actor}>
                <td>{r.seq}</td>
                <td><time dateTime={r.at.toISOString()}>{fmt(r.at)}</time></td>
                <td>{r.actor}</td>
                <td>{r.role}</td>
                <td><strong>{r.action}</strong></td>
                <td>{r.entity_type} <code>{r.entity_id}</code></td>
                <td>{show(r.before)} → {show(r.after)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

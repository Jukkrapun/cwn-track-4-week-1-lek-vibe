import type { Metadata } from 'next';
import Link from 'next/link';
import { listRuleSets, listVersions } from '@/infrastructure/rule-repository';
import { usageTotals } from '@/infrastructure/stats-repository';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'ภาพรวมหลังบ้าน', description: 'สถิติการใช้งานและสถานะ Rule Set' };

const LABEL: Record<string, string> = { PHONE: 'วิเคราะห์เบอร์', PLATE: 'วิเคราะห์ทะเบียน', PAIR_SEARCH: 'ค้นหาคู่เลข', ARTICLE_VIEW: 'เปิดอ่านบทความ' };

export default async function Dashboard() {
  const [usage, ruleSets, versions] = await Promise.all([usageTotals(), listRuleSets(), listVersions()]);
  const open = versions.filter((v) => v.status === 'DRAFT' || v.status === 'APPROVED');
  return (
    <>
      <h1>ภาพรวม</h1>
      <section className="card" aria-labelledby="usage">
        <h2 id="usage">สถิติการใช้งาน (เฉพาะจำนวนครั้ง)</h2>
        <div className="stat-row">
          {Object.keys(LABEL).map((k) => (
            <div key={k} className="stat" data-testid={`stat-${k.toLowerCase()}`}>
              <div className="num">{usage.find((u) => u.type === k)?.total ?? 0}</div>
              <div className="muted">{LABEL[k]}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="card" aria-labelledby="rs">
        <h2 id="rs">Rule Set ที่ใช้งาน</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Rule Set</th><th>ชื่อ</th><th>เวอร์ชันที่ Published</th></tr></thead>
            <tbody>
              {ruleSets.map((r) => (
                <tr key={r.id} data-testid="dashboard-ruleset" data-rule-set={r.id}><td><code>{r.id}</code></td><td>{r.name}</td><td data-testid="dashboard-published-version">{r.published_version}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p data-testid="dashboard-open-drafts">Draft ที่รอดำเนินการ: {open.length} รายการ · <Link href="/admin/versions">จัดการเวอร์ชัน</Link></p>
      </section>
    </>
  );
}

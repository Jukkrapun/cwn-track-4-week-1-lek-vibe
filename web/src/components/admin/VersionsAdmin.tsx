'use client';

import { useCallback, useEffect, useState } from 'react';
import { callApi } from '../api-client';

interface Version {
  id: string;
  ruleId: string;
  version: string | null;
  status: string;
  source: string;
  sourceUrl: string | null;
  isMock: boolean;
  basedOn: string | null;
  createdBy: string;
  approvedBy: string | null;
  effectiveAt: string | null;
}
interface RuleSetRow {
  id: string;
  name: string;
  published_version: string | null;
}
interface DiffEntry {
  group: string;
  change: string;
  before: { grade: string; pros: string | null } | null;
  after: { grade: string; pros: string | null } | null;
}
interface Preview {
  casesRun: number;
  changedCases: number;
  results: { id: string; number: string; changes: { position: string; pair: string; before: string; after: string }[] }[];
}

const fmt = (iso: string | null) => (iso ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok' }).format(new Date(iso)) : '—');

export function VersionsAdmin({ role, username }: { role: string; username: string }) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [ruleSets, setRuleSets] = useState<RuleSetRow[]>([]);
  const [diff, setDiff] = useState<{ id: string; changes: DiffEntry[] } | null>(null);
  const [preview, setPreview] = useState<{ id: string; data: Preview } | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const r = await callApi<{ ruleSets: RuleSetRow[]; versions: Version[] }>('/api/v1/admin/rule-sets');
    if (r.success) {
      setVersions(r.data.versions);
      setRuleSets(r.data.ruleSets);
    }
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function act(label: string, url: string, method: 'POST' | 'DELETE', body?: unknown) {
    const r = await callApi<Record<string, unknown>>(url, method, body ?? {});
    setMsg(r.success ? { ok: true, text: `${label} สำเร็จ${r.data.version ? ` → เวอร์ชัน ${String(r.data.version)}` : ''}` } : { ok: false, text: r.error.message });
    await load();
  }
  async function showDiff(id: string) {
    const r = await callApi<{ changes: DiffEntry[] }>(`/api/v1/admin/versions/${id}/diff`);
    if (r.success) setDiff({ id, changes: r.data.changes });
  }
  async function runPreview(id: string) {
    const r = await callApi<Preview>(`/api/v1/admin/versions/${id}/preview`, 'POST', { numbers: ['0812345678'] });
    if (r.success) setPreview({ id, data: r.data });
  }
  const publishedOf = (ruleId: string) => ruleSets.find((r) => r.id === ruleId)?.published_version ?? '';

  return (
    <>
      <h1>เวอร์ชัน Rule</h1>
      <p className="muted">Workflow: Editor สร้าง Draft → Admin (ไม่ใช่ผู้สร้าง) Approve → Publish (ตรวจ baseVersion) · Rollback สร้างเวอร์ชันใหม่โดยไม่ลบประวัติ</p>
      <div aria-live="polite">
        {msg && <p className={`alert ${msg.ok ? 'alert-ok' : 'alert-error'}`} role={msg.ok ? 'status' : 'alert'} data-testid={msg.ok ? 'version-success' : 'version-error'}>{msg.text}</p>}
      </div>
      <section className="card">
        <div className="table-wrap">
          <table data-testid="versions-table">
            <thead><tr><th>ruleId</th><th>version</th><th>status</th><th>source</th><th>effectiveAt</th><th>ผู้สร้าง / ผู้อนุมัติ</th><th>การดำเนินการ</th></tr></thead>
            <tbody>
              {versions.map((v) => {
                const isOwn = v.createdBy === username;
                return (
                  <tr key={v.id} data-testid="version-row" data-rule-set={v.ruleId} data-version={v.version ?? 'draft'} data-status={v.status}>
                    <td><code>{v.ruleId}</code></td>
                    <td>{v.version ?? <em>draft</em>}{v.basedOn && <div className="muted" style={{ fontSize: '0.8rem' }}>จาก {v.basedOn}</div>}</td>
                    <td><span className={`status status-${v.status}`}>{v.status}</span>{v.isMock && <div className="muted" style={{ fontSize: '0.8rem' }}>mock</div>}</td>
                    <td className="muted">{v.source}</td>
                    <td>{fmt(v.effectiveAt)}</td>
                    <td>{v.createdBy}<br /><span className="muted">{v.approvedBy ?? '—'}</span></td>
                    <td>
                      <div className="actions" style={{ marginTop: 0 }}>
                        {(v.status === 'DRAFT' || v.status === 'APPROVED') && (
                          <>
                            <button type="button" className="btn btn-ghost btn-sm" data-testid="diff-button" onClick={() => showDiff(v.id)}>Diff</button>
                            <button type="button" className="btn btn-ghost btn-sm" data-testid="preview-button" onClick={() => runPreview(v.id)}>Preview</button>
                          </>
                        )}
                        {v.status === 'DRAFT' && role === 'ADMIN' && !isOwn && (
                          <button type="button" className="btn btn-sm" data-testid="approve-button" onClick={() => act('Approve', `/api/v1/admin/versions/${v.id}/approve`, 'POST')}>Approve</button>
                        )}
                        {v.status === 'DRAFT' && (isOwn || role === 'ADMIN') && (
                          <button type="button" className="btn btn-ghost btn-sm" data-testid="discard-button" onClick={() => act('ยกเลิก Draft', `/api/v1/admin/versions/${v.id}`, 'DELETE')}>ยกเลิก Draft</button>
                        )}
                        {v.status === 'APPROVED' && role === 'ADMIN' && (
                          <button type="button" className="btn btn-gold btn-sm" data-testid="publish-button" onClick={() => act('Publish', `/api/v1/admin/versions/${v.id}/publish`, 'POST', { baseVersion: publishedOf(v.ruleId) })}>
                            Publish (base {publishedOf(v.ruleId)})
                          </button>
                        )}
                        {v.status === 'SUPERSEDED' && role === 'ADMIN' && (
                          <button type="button" className="btn btn-ghost btn-sm" data-testid="rollback-button" onClick={() => act('Rollback', '/api/v1/admin/rules/rollback', 'POST', { ruleSetId: v.ruleId, targetVersion: v.version, baseVersion: publishedOf(v.ruleId) })}>
                            Rollback ไปเวอร์ชันนี้
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      {diff && (
        <section className="card" aria-labelledby="diff-title" data-testid="diff-panel">
          <h2 id="diff-title">Diff เทียบกับเวอร์ชันฐาน ({diff.changes.length} รายการ)</h2>
          {diff.changes.length === 0 ? <p className="muted">ไม่มีความเปลี่ยนแปลง</p> : (
            <ul>
              {diff.changes.map((c) => (
                <li key={c.group} data-testid="diff-entry" data-change={c.change}>
                  <strong>{c.group}</strong> — {c.change}: {c.before ? `${c.before.grade} (${c.before.pros ?? '—'})` : '—'} → {c.after ? `${c.after.grade} (${c.after.pros ?? '—'})` : '—'}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      {preview && (
        <section className="card" aria-labelledby="preview-title" data-testid="preview-panel">
          <h2 id="preview-title">Preview กับ Golden Test ({preview.data.casesRun} เคส · เปลี่ยนผล {preview.data.changedCases} เคส)</h2>
          <ul>
            {preview.data.results.filter((r) => r.changes.length > 0).map((r) => (
              <li key={r.id} data-testid="preview-change">
                {r.id} {r.number}: {r.changes.map((c) => `คู่ ${c.pair} (${c.position}) ${c.before} → ${c.after}`).join(', ')}
              </li>
            ))}
          </ul>
          {preview.data.changedCases > 0 && <p className="alert alert-error" role="note">มีเคสที่ผลเปลี่ยน — โปรดตรวจสอบก่อน Publish (ADR-005)</p>}
        </section>
      )}
    </>
  );
}

'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { PAIR_CATEGORIES } from '@/domain/types';
import { callApi } from '../api-client';
import { categoryLabel, GradeBadge } from '../ui';

interface Group {
  pairs: string[];
  grade: string;
  categories: string[];
  pros: string | null;
  cons: string | null;
  source: string;
}
interface PairsData {
  published: { id: string; version: string; groups: Group[] } | null;
  draft: { id: string; status: string; createdBy: string; groups: Group[] } | null;
}

const EMPTY = { pairs: '', grade: 'good', categories: [] as string[], pros: '', cons: '', source: '' };

export function PairsAdmin({ role }: { role: string }) {
  const [data, setData] = useState<PairsData | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [mode, setMode] = useState<'create' | 'update'>('create');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const r = await callApi<PairsData>('/api/v1/admin/pairs');
    if (r.success) setData(r.data);
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = {
      pairs: form.pairs.split(/[\s,/|]+/).filter(Boolean),
      grade: form.grade,
      categories: form.categories,
      pros: form.pros || null,
      cons: form.cons || null,
      source: form.source,
    };
    const r = await callApi<{ draftId: string }>('/api/v1/admin/pairs', mode === 'create' ? 'POST' : 'PUT', body);
    if (r.success) {
      setMsg({ ok: true, text: `บันทึก Draft แล้ว (คู่ ${body.pairs.join('/')}) — สถานะ Draft ยังไม่มีผลต่อผู้ใช้จนกว่า Admin จะ Publish` });
      setForm(EMPTY);
      setMode('create');
      await load();
    } else setMsg({ ok: false, text: r.error.message });
  }

  function edit(g: Group) {
    setMode('update');
    setForm({ pairs: g.pairs.join(','), grade: g.grade, categories: [...g.categories], pros: g.pros ?? '', cons: g.cons ?? '', source: g.source });
  }

  const groups = data?.draft?.groups ?? data?.published?.groups ?? [];
  return (
    <>
      <h1>ความหมายคู่เลข</h1>
      <p className="muted">
        Rule Set <code>pairs-common-belief-mock</code> · Published <strong data-testid="admin-published-version">{data?.published?.version ?? '…'}</strong>
        {data?.draft && (
          <>
            {' '}· มี Draft เปิดอยู่ (<span className={`status status-${data.draft.status}`} data-testid="draft-status">{data.draft.status}</span> โดย {data.draft.createdBy})
          </>
        )}
      </p>
      <form className="card" onSubmit={onSubmit} noValidate aria-label="ฟอร์มคู่เลข" data-testid="pair-form">
        <h2>{mode === 'create' ? 'เพิ่มคู่เลข (Draft)' : 'แก้ไขคู่เลข (Draft)'}</h2>
        <div className="form-grid cols-2">
          <div className="field">
            <label htmlFor="pf-pairs">คู่เลขในกลุ่ม</label>
            <input id="pf-pairs" data-testid="pair-form-pairs" value={form.pairs} readOnly={mode === 'update'} onChange={(e) => setForm({ ...form, pairs: e.target.value })} aria-describedby="pf-pairs-hint pair-form-msg" />
            <span id="pf-pairs-hint" className="hint">เลข 2 หลัก คั่นด้วย , เช่น 67,76</span>
          </div>
          <div className="field">
            <label htmlFor="pf-grade">ระดับ</label>
            <select id="pf-grade" data-testid="pair-form-grade" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
              <option value="good">ดี (good)</option>
              <option value="caution">ควรระวัง (caution)</option>
              <option value="avoid">ควรเลี่ยง (avoid)</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="pf-pros">ข้อดี</label>
            <textarea id="pf-pros" data-testid="pair-form-pros" rows={2} value={form.pros} onChange={(e) => setForm({ ...form, pros: e.target.value })} aria-describedby="pf-len" />
          </div>
          <div className="field">
            <label htmlFor="pf-cons">ข้อควรระวัง</label>
            <textarea id="pf-cons" data-testid="pair-form-cons" rows={2} value={form.cons} onChange={(e) => setForm({ ...form, cons: e.target.value })} aria-describedby="pf-len" />
          </div>
          <div className="field">
            <label htmlFor="pf-source">แหล่งอ้างอิง (บังคับ)</label>
            <input id="pf-source" data-testid="pair-form-source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} aria-describedby="pair-form-msg" />
          </div>
          <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ fontWeight: 600 }}>หมวด</legend>
            <div className="chip-row">
              {PAIR_CATEGORIES.map((c) => (
                <label key={c} className="chip">
                  <input
                    type="checkbox"
                    style={{ width: 'auto' }}
                    data-testid={`pair-form-category-${c}`}
                    checked={form.categories.includes(c)}
                    onChange={(e) => setForm({ ...form, categories: e.target.checked ? [...form.categories, c] : form.categories.filter((x) => x !== c) })}
                  />
                  {categoryLabel(c)}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <p id="pf-len" className="hint">ข้อความยาวได้ไม่เกิน 500 ตัวอักษร · แหล่งอ้างอิงไม่เกิน 255 ตัวอักษร</p>
        <div id="pair-form-msg" aria-live="polite">
          {msg && (
            <p className={`alert ${msg.ok ? 'alert-ok' : 'alert-error'}`} role={msg.ok ? 'status' : 'alert'} data-testid={msg.ok ? 'pair-form-success' : 'pair-form-error'}>
              {msg.text}
            </p>
          )}
        </div>
        <div className="actions">
          <button className="btn" type="submit" data-testid="pair-form-submit">บันทึก Draft</button>
          {mode === 'update' && (
            <button className="btn btn-ghost" type="button" onClick={() => { setMode('create'); setForm(EMPTY); }}>ยกเลิกการแก้ไข</button>
          )}
          {role === 'EDITOR' && <span className="muted">Editor บันทึก Draft ได้ · การอนุมัติทำโดย Admin คนอื่น</span>}
        </div>
      </form>
      <section className="card" aria-labelledby="groups-title">
        <h2 id="groups-title">{data?.draft ? 'เนื้อหาใน Draft' : 'เนื้อหาที่ Published'} ({groups.length} กลุ่ม)</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>คู่</th><th>ระดับ</th><th>หมวด</th><th>ข้อดี / ข้อควรระวัง</th><th>แหล่ง</th><th></th></tr></thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.pairs.join('|')} data-testid="admin-pair-group" data-group={g.pairs.join('|')}>
                  <td><strong>{g.pairs.join(' / ')}</strong></td>
                  <td><GradeBadge grade={g.grade} /></td>
                  <td>{g.categories.map(categoryLabel).join(', ')}</td>
                  <td>{g.pros ?? '—'}<br /><span className="muted">{g.cons ?? '—'}</span></td>
                  <td className="muted">{g.source}</td>
                  <td><button className="btn btn-ghost btn-sm" type="button" onClick={() => edit(g)}>แก้ไข</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

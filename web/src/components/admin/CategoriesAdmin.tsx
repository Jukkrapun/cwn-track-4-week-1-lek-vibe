'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { callApi } from '../api-client';

interface Category {
  id: string;
  type: string;
  label: string;
  enabled: boolean;
  rule_ref: string | null;
  status: string;
  created_by_name: string | null;
}

const EMPTY = { id: '', type: 'OCCUPATION', label: '', ruleRef: '', enabled: true };

export function CategoriesAdmin({ role, username }: { role: string; username: string }) {
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const r = await callApi<{ items: Category[] }>('/api/v1/admin/categories');
    if (r.success) setItems(r.data.items);
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function run(p: Promise<{ success: boolean; error: { message: string } | null }>, ok: string) {
    const r = await p;
    setMsg(r.success ? { ok: true, text: ok } : { ok: false, text: r.error?.message ?? '' });
    await load();
  }
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void run(callApi('/api/v1/admin/categories', 'POST', { ...form, ruleRef: form.ruleRef || null }), `สร้างหมวด ${form.id} เป็น Draft แล้ว — ต้องให้ Admin คนอื่นเผยแพร่`).then(() => setForm(EMPTY));
  }

  return (
    <>
      <h1>หมวดอาชีพ / เป้าหมาย</h1>
      <form className="card" onSubmit={onSubmit} noValidate aria-label="ฟอร์มหมวด">
        <h2>สร้างหมวดใหม่ (Draft)</h2>
        <div className="form-grid cols-2">
          <div className="field">
            <label htmlFor="cf-id">รหัส (kebab-case)</label>
            <input id="cf-id" data-testid="category-form-id" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} aria-describedby="category-msg" />
          </div>
          <div className="field">
            <label htmlFor="cf-type">ประเภท</label>
            <select id="cf-type" data-testid="category-form-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="OCCUPATION">อาชีพ</option>
              <option value="GOAL">เป้าหมาย</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="cf-label">ชื่อที่แสดง</label>
            <input id="cf-label" data-testid="category-form-label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="cf-ref">ruleRef</label>
            <input id="cf-ref" data-testid="category-form-ruleref" value={form.ruleRef} onChange={(e) => setForm({ ...form, ruleRef: e.target.value })} aria-describedby="cf-ref-hint category-msg" />
            <span id="cf-ref-hint" className="hint">อาชีพ: กลุ่มใน occupationPairs เช่น government-teacher · เป้าหมาย: หมวดคู่เลข เช่น money</span>
          </div>
        </div>
        <div id="category-msg" aria-live="polite">
          {msg && <p className={`alert ${msg.ok ? 'alert-ok' : 'alert-error'}`} role={msg.ok ? 'status' : 'alert'} data-testid={msg.ok ? 'category-success' : 'category-error'}>{msg.text}</p>}
        </div>
        <div className="actions"><button className="btn" type="submit" data-testid="category-form-submit">บันทึก Draft</button></div>
      </form>
      <section className="card">
        <div className="table-wrap">
          <table data-testid="categories-table">
            <thead><tr><th>รหัส</th><th>ประเภท</th><th>ชื่อ</th><th>ruleRef</th><th>สถานะ</th><th>ใช้งาน</th><th></th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} data-testid="category-row" data-category={c.id} data-enabled={String(c.enabled)} data-status={c.status}>
                  <td><code>{c.id}</code></td>
                  <td>{c.type}</td>
                  <td>{c.label}</td>
                  <td className="muted">{c.rule_ref ?? '—'}</td>
                  <td><span className={`status status-${c.status}`}>{c.status}</span></td>
                  <td>{c.enabled ? 'เปิด' : 'ปิด'}</td>
                  <td>
                    <div className="actions" style={{ marginTop: 0 }}>
                      {role === 'ADMIN' && c.status === 'DRAFT' && c.created_by_name !== username && (
                        <button type="button" className="btn btn-gold btn-sm" data-testid="category-publish" onClick={() => run(callApi(`/api/v1/admin/categories/${c.id}/publish`, 'POST', {}), `เผยแพร่ ${c.id} แล้ว`)}>เผยแพร่</button>
                      )}
                      {role === 'ADMIN' && c.type !== 'PHONE_TYPE' && (
                        <button type="button" className="btn btn-ghost btn-sm" data-testid="category-toggle" onClick={() => run(callApi(`/api/v1/admin/categories/${c.id}`, 'PATCH', { enabled: !c.enabled }), `${c.enabled ? 'ปิด' : 'เปิด'}ใช้งาน ${c.id} แล้ว`)}>
                          {c.enabled ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

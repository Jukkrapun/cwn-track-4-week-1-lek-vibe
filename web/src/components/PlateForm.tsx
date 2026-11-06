'use client';

import { useState, type FormEvent } from 'react';
import { BIRTH_DAY_LABELS, BIRTH_DAYS } from '@/domain/types';
import { callApi, type ApiError } from './api-client';
import { PlateSuggestView, type PlateSuggestResult } from './PlateSuggestView';
import { DemoBadge, Disclaimer, GradeBadge, RuleSetMeta, type RuleSetInfo } from './ui';

interface SumView {
  method: 'digits-only' | 'with-letters';
  formula: string;
  total: number | null;
  reduced: number | null;
  grade: string;
  meaning: string | null;
}
interface PlateResult {
  plate: { prefix: string; letters: { char: string; value: number | null }[]; digits: string; display: string };
  ruleSets: (RuleSetInfo & { usedFor: string })[];
  sums: SumView[];
  pairs: { position: string; pair: string; grade: string; reason: string | null; meaning: string | null }[];
  patterns: { id: string; reason: string }[];
  birthDay: {
    day: string;
    luckyDigits: number[];
    highlightDigits: { value: string; position: number; reason: string; source: string }[];
    highlightLetters: { char: string; reason: string; source: string }[];
  } | null;
  disclaimer: string;
  notices: string[];
}

const FIELD_OF: Record<string, string> = { prefix: 'plate-prefix', letters: 'plate-letters', digits: 'plate-digits', plate: 'plate-letters', birthDay: 'birthday-select' };

export function PlateForm() {
  const [form, setForm] = useState({ prefix: '', letters: '', digits: '', province: '', birthDay: '' });
  const [result, setResult] = useState<PlateResult | null>(null);
  const [suggest, setSuggest] = useState<PlateSuggestResult | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);
  const [province, setProvince] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    // ไม่กรอกตัวเลข + เลือกวันเกิด → เสนอเลขทะเบียน (หมวดอักษรไม่บังคับ)
    if (form.digits.trim() === '' && form.prefix.trim() === '' && form.birthDay !== '') {
      setBusy(true);
      const s = await callApi<PlateSuggestResult>('/api/v1/plate/suggest', 'POST', { birthDay: form.birthDay, letters: form.letters || undefined });
      setBusy(false);
      setResult(null);
      setSuggest(s.success ? s.data : null);
      setError(s.success ? null : s.error);
      return;
    }
    setBusy(true);
    setSuggest(null);
    const r = await callApi<PlateResult>('/api/v1/plate/analyze', 'POST', {
      prefix: form.prefix,
      letters: form.letters,
      digits: form.digits,
      province: form.province || undefined,
      birthDay: form.birthDay || undefined,
    });
    setBusy(false);
    if (r.success) {
      setResult(r.data);
      setProvince(form.province);
      setError(null);
    } else {
      setResult(null);
      setError(r.error);
    }
  }

  const errorFor = error ? (FIELD_OF[error.field ?? 'plate'] ?? 'plate-letters') : null;
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });
  const describe = (id: string, hint: string) => (errorFor === id ? `${hint} plate-error` : hint);

  return (
    <>
      <form className="card" onSubmit={onSubmit} noValidate aria-label="ฟอร์มวิเคราะห์ทะเบียนรถ">
        <div className="form-grid cols-4">
          <div className="field">
            <label htmlFor="plate-prefix">เลขนำหน้า</label>
            <input id="plate-prefix" data-testid="plate-prefix" inputMode="numeric" maxLength={3} value={form.prefix} onChange={set('prefix')} aria-invalid={errorFor === 'plate-prefix'} aria-describedby={describe('plate-prefix', 'prefix-hint')} />
            <span id="prefix-hint" className="hint">ไม่บังคับ (1–9)</span>
          </div>
          <div className="field">
            <label htmlFor="plate-letters">หมวดอักษร</label>
            <input id="plate-letters" data-testid="plate-letters" maxLength={30} autoComplete="off" value={form.letters} onChange={set('letters')} aria-invalid={errorFor === 'plate-letters'} aria-describedby={describe('plate-letters', 'letters-hint')} />
            <span id="letters-hint" className="hint">พยัญชนะไทย 1–2 ตัว (ไม่บังคับเมื่อขอเลขแนะนำ)</span>
          </div>
          <div className="field">
            <label htmlFor="plate-digits">ตัวเลข</label>
            <input id="plate-digits" data-testid="plate-digits" inputMode="numeric" maxLength={10} value={form.digits} onChange={set('digits')} aria-invalid={errorFor === 'plate-digits'} aria-describedby={describe('plate-digits', 'digits-hint')} />
            <span id="digits-hint" className="hint">1–9999 · เว้นว่างได้เมื่อขอเลขแนะนำ</span>
          </div>
          <div className="field">
            <label htmlFor="plate-province">จังหวัด</label>
            <input id="plate-province" data-testid="plate-province" maxLength={60} value={form.province} onChange={set('province')} aria-describedby="province-hint" />
            <span id="province-hint" className="hint">ไม่บังคับ · ไม่มีผลต่อการคำนวณ</span>
          </div>
        </div>
        <div className="form-grid cols-2" style={{ marginTop: '1rem' }}>
          <div className="field">
            <label htmlFor="birthday-select">วันเกิดของผู้ขับขี่ (ไม่บังคับ)</label>
            <select id="birthday-select" data-testid="birthday-select" value={form.birthDay} onChange={set('birthDay')} aria-describedby={describe('birthday-select', 'birthday-hint')}>
              <option value="">— ไม่ระบุ —</option>
              {BIRTH_DAYS.map((d) => (
                <option key={d} value={d}>
                  วัน{BIRTH_DAY_LABELS[d]}
                </option>
              ))}
            </select>
            <span id="birthday-hint" className="hint">วันพุธแยกกลางวัน / กลางคืน · เลือกแค่วันเกิด (ไม่กรอกตัวเลข) เพื่อดูเลขทะเบียนแนะนำ</span>
          </div>
        </div>
        {error && (
          <p id="plate-error" className="field-error" role="alert" data-testid="plate-error" data-code={error.code} style={{ marginTop: '0.75rem' }}>
            {error.message}
          </p>
        )}
        <div className="actions">
          <button type="submit" className="btn" data-testid="plate-submit" disabled={busy}>
            {busy ? 'กำลังวิเคราะห์…' : form.digits.trim() === '' && form.prefix.trim() === '' && form.birthDay !== '' ? 'แนะนำเลขทะเบียน' : 'วิเคราะห์ทะเบียน'}
          </button>
        </div>
      </form>
      {result && <PlateResultView r={result} province={province} />}
      {suggest && <PlateSuggestView r={suggest} />}
    </>
  );
}

function SumBox({ s }: { s: SumView }) {
  const key = s.method === 'digits-only' ? 'sum-digits' : 'sum-letters';
  return (
    <div className="sum-box">
      <h3>{s.method === 'digits-only' ? 'ผลรวมเฉพาะตัวเลข' : 'ผลรวมรวมค่าอักษร (ทักษา)'}</h3>
      <p className="sum-total" data-testid={key} data-value={s.total ?? ''}>
        {s.total ?? 'ไม่มีข้อมูล'}
      </p>
      <p className="formula" data-testid={`${key}-formula`}>
        {s.formula}
      </p>
      <p>
        ระดับ: <GradeBadge grade={s.grade} testId={`${key}-grade`} />
      </p>
      <p data-testid={`${key}-meaning`}>{s.meaning ?? 'ไม่มีข้อมูล'}</p>
      {s.reduced !== null && <p className="muted">ถ้าลดเหลือหลักเดียว (ไม่ใช่ค่าเริ่มต้น): {s.reduced}</p>}
    </div>
  );
}

function PlateResultView({ r, province }: { r: PlateResult; province: string }) {
  const [wongnai, allianz, meanings] = r.ruleSets;
  return (
    <section className="card reveal" aria-labelledby="plate-result-title" data-testid="plate-result">
      <p className="eyebrow">ผลการวิเคราะห์</p>
      <h2 id="plate-result-title" className="sr-only">
        ผลวิเคราะห์ทะเบียน {r.plate.display}
      </h2>
      <div className="plate-visual" data-testid="plate-display">
        <span className="plate-main">{r.plate.display}</span>
        <span className="plate-province">{province || '—'}</span>
      </div>
      <p className="muted" data-testid="plate-letter-values">
        ค่าอักษร: {r.plate.letters.map((l) => `${l.char} = ${l.value ?? 'ไม่มีข้อมูล'}`).join(' · ')}
      </p>
      <RuleSetMeta rs={wongnai} label="ผลรวม / เลขตามวันเกิด / คู่ควรเลี่ยง" />

      <div className="sum-grid">
        {r.sums.map((s) => (
          <SumBox key={s.method} s={s} />
        ))}
      </div>

      <h3 style={{ marginTop: '1.5rem' }}>คู่เลขของส่วนตัวเลข</h3>
      {r.pairs.length === 0 ? (
        <p data-testid="plate-no-pairs">ทะเบียนนี้มีตัวเลขหลักเดียว จึงไม่มีคู่เลข</p>
      ) : (
        <ul className="pair-list">
          {r.pairs.map((p) => (
            <li key={p.position} className="pair-row" data-testid="pair-row" data-pair={p.pair} data-grade={p.grade} data-position={p.position}>
              <div className="pair-head">
                <span className="pair-num">{p.pair}</span>
                <GradeBadge grade={p.grade} testId="pair-grade" />
              </div>
              <p data-testid="pair-meaning">{p.meaning ?? 'ไม่มีข้อมูล'}</p>
              {p.reason && (
                <p data-testid="pair-reason">
                  <span className="label">เหตุผล:</span> {p.reason}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="muted" style={{ fontSize: '0.85rem' }}>
        ความหมายคู่เลขจาก {meanings.name} ({meanings.version}) {meanings.isMock && <DemoBadge />}
      </p>

      {r.patterns.length > 0 && (
        <div>
          <h3 style={{ marginTop: '1.25rem' }}>รูปแบบที่ควรเลี่ยง</h3>
          {r.patterns.map((p) => (
            <p key={p.id} className="pattern-warning" data-testid="pattern-warning" data-pattern={p.id} role="note">
              <span aria-hidden="true">⚠ </span>
              {p.reason} <code>({p.id})</code> — ตาม {wongnai.source}
            </p>
          ))}
        </div>
      )}

      {r.birthDay && (
        <section style={{ marginTop: '1.25rem' }} aria-labelledby="bd-title" data-testid="birthday-result">
          <h3 id="bd-title">ตามวันเกิด</h3>
          <p>
            เลขส่งเสริม:{' '}
            <span data-testid="lucky-digits">{r.birthDay.luckyDigits.join(', ')}</span> <span className="muted">(แหล่ง: {wongnai.source})</span>
          </p>
          <p>เลขที่ควรเลี่ยงที่พบในทะเบียน (แหล่ง: {wongnai.source}):</p>
          {r.birthDay.highlightDigits.length === 0 ? (
            <p className="muted" data-testid="no-highlight-digit">ไม่พบ</p>
          ) : (
            <ul className="chip-row">
              {r.birthDay.highlightDigits.map((h) => (
                <li key={`${h.position}`} className="chip chip-warn" data-testid="highlight-digit" data-value={h.value} data-reason={h.reason} data-source={h.source} title={h.reason}>
                  <span aria-hidden="true">✕</span> {h.value} <span className="sr-only">{h.reason}</span>
                </li>
              ))}
            </ul>
          )}
          <p>อักษรที่ควรเลี่ยงที่พบในทะเบียน (แหล่ง: {allianz.source}):</p>
          {r.birthDay.highlightLetters.length === 0 ? (
            <p className="muted" data-testid="no-highlight-letter">ไม่พบ</p>
          ) : (
            <ul className="chip-row">
              {r.birthDay.highlightLetters.map((h, i) => (
                <li key={`${h.char}-${i}`} className="chip chip-warn" data-testid="highlight-letter" data-value={h.char} data-reason={h.reason} data-source={h.source} title={h.reason}>
                  <span aria-hidden="true">✕</span> {h.char} <span className="sr-only">{h.reason}</span>
                </li>
              ))}
            </ul>
          )}
          <RuleSetMeta rs={allianz} label="อักษรที่ควรเลี่ยง" testIds={false} />
        </section>
      )}

      <ul className="notice-list">
        <li data-testid="plate-status-notice">{r.notices[0]}</li>
        <li data-testid="plate-belief-notice">{r.notices[1]}</li>
      </ul>
      <Disclaimer text={r.disclaimer} />
    </section>
  );
}

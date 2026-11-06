'use client';

import { useState, type FormEvent } from 'react';
import { callApi, type ApiError } from './api-client';
import { PhoneCategoryChart } from './PhoneCategoryChart';
import { categoryLabel, Disclaimer, GradeBadge, RuleSetMeta, type RuleSetInfo } from './ui';

interface Option {
  id: string;
  label: string;
}
interface PhonePairView {
  position: string;
  pair: string;
  grade: string;
  categories: string[];
  meaning: string | null;
  pros: string | null;
  cons: string | null;
}
interface PhoneResult {
  normalized: string;
  ruleSet: RuleSetInfo;
  pairs: PhonePairView[];
  recommendation: { occupation: string | null; goal: string | null; matchedRule: boolean; pairs: string[]; presentInNumber: string[]; reason: string } | null;
  recommendationSource: RuleSetInfo | null;
  categoriesRuleSet: RuleSetInfo;
  disclaimer: string;
}

export function PhoneForm({ occupations, goals }: { occupations: Option[]; goals: Option[] }) {
  const [number, setNumber] = useState('');
  const [occupation, setOccupation] = useState('');
  const [goal, setGoal] = useState('');
  const [result, setResult] = useState<PhoneResult | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);

  async function analyze(next: { occupation: string; goal: string }) {
    setBusy(true);
    const r = await callApi<PhoneResult>('/api/v1/phone/analyze', 'POST', {
      number,
      occupation: next.occupation || undefined,
      goal: next.goal || undefined,
    });
    setBusy(false);
    if (r.success) {
      setResult(r.data);
      setError(null);
    } else {
      setResult(null);
      setError(r.error);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void analyze({ occupation, goal });
  }

  function onOption(kind: 'occupation' | 'goal', value: string) {
    const next = { occupation, goal, [kind]: value };
    if (kind === 'occupation') setOccupation(value);
    else setGoal(value);
    if (result) void analyze(next);
  }

  const numberError = error && (error.field === 'number' || error.field === null);
  const optionError = error && (error.field === 'occupation' || error.field === 'goal');

  return (
    <>
      <form className="card" onSubmit={onSubmit} noValidate aria-label="ฟอร์มวิเคราะห์เบอร์โทรศัพท์">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="phone-input">เบอร์มือถือ</label>
            <input
              id="phone-input"
              data-testid="phone-input"
              name="number"
              inputMode="numeric"
              autoComplete="off"
              placeholder="เช่น 081-234-5678"
              maxLength={30}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              aria-invalid={numberError ? 'true' : 'false'}
              aria-describedby={numberError ? 'phone-hint phone-error' : 'phone-hint'}
            />
            <span id="phone-hint" className="hint">รองรับ 0XXXXXXXXX, +66, มีขีดหรือเว้นวรรค และเลขไทย</span>
            {numberError && (
              <p id="phone-error" className="field-error" role="alert" data-testid="phone-error">
                {error.message}
              </p>
            )}
          </div>
        </div>
        <div className="form-grid cols-2" style={{ marginTop: '1rem' }}>
          <div className="field">
            <label htmlFor="occupation-select">อาชีพ (ไม่บังคับ)</label>
            <select id="occupation-select" data-testid="occupation-select" value={occupation} onChange={(e) => onOption('occupation', e.target.value)} aria-describedby={optionError ? 'option-error' : undefined}>
              <option value="">— ไม่ระบุ —</option>
              {occupations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="goal-select">เป้าหมาย (ไม่บังคับ)</label>
            <select id="goal-select" data-testid="goal-select" value={goal} onChange={(e) => onOption('goal', e.target.value)} aria-describedby={optionError ? 'option-error' : undefined}>
              <option value="">— ไม่ระบุ —</option>
              {goals.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {optionError && (
          <p id="option-error" className="field-error" role="alert" data-testid="option-error" style={{ marginTop: '0.75rem' }}>
            {error.message}
          </p>
        )}
        <div className="actions">
          <button type="submit" className="btn" data-testid="phone-submit" disabled={busy}>
            {busy ? 'กำลังวิเคราะห์…' : 'วิเคราะห์เบอร์'}
          </button>
        </div>
      </form>

      {result && <PhoneResultView result={result} occupations={occupations} />}
    </>
  );
}

function PhoneResultView({ result, occupations }: { result: PhoneResult; occupations: Option[] }) {
  const rec = result.recommendation;
  const occLabel = rec?.occupation ? occupations.find((o) => o.id === rec.occupation)?.label : null;
  return (
    <section className="card reveal" aria-labelledby="phone-result-title" data-testid="phone-result">
      <p className="eyebrow">ผลการวิเคราะห์</p>
      <h2 id="phone-result-title">
        เบอร์ <span data-testid="phone-normalized">{result.normalized}</span>
      </h2>
      <RuleSetMeta rs={result.ruleSet} />
      <h3 style={{ marginTop: '1.25rem' }}>คู่เลข 6 คู่ (หลักที่ 4–10)</h3>
      <ul className="pair-list">
        {result.pairs.map((p) => (
          <li key={p.position} className="pair-row" data-testid="pair-row" data-pair={p.pair} data-grade={p.grade} data-position={p.position}>
            <div className="pair-head">
              <span>
                <span className="pair-num">{p.pair}</span> <span className="pair-pos">ตำแหน่ง {p.position}</span>
              </span>
              <GradeBadge grade={p.grade} testId="pair-grade" />
            </div>
            <p data-testid="pair-meaning">{p.meaning ?? 'ไม่มีข้อมูล'}</p>
            {p.pros && (
              <p data-testid="pair-pros">
                <span className="label">ข้อดี:</span> {p.pros}
              </p>
            )}
            {p.cons && (
              <p data-testid="pair-cons">
                <span className="label">ข้อควรระวัง:</span> {p.cons}
              </p>
            )}
            {p.categories.length > 0 && (
              <p data-testid="pair-categories">
                <span className="label">หมวด:</span> {p.categories.map(categoryLabel).join(', ')}
              </p>
            )}
          </li>
        ))}
      </ul>
      <PhoneCategoryChart pairs={result.pairs} />

      {rec && (
        <section className="card" style={{ marginTop: '1.25rem' }} aria-labelledby="rec-title" data-testid="recommendation">
          <h3 id="rec-title">คู่เลขแนะนำ{occLabel ? ` สำหรับอาชีพ${occLabel}` : ''}</h3>
          {rec.matchedRule || rec.pairs.length > 0 ? (
            <>
              {rec.pairs.length > 0 ? (
                <ul className="chip-row" data-testid="recommendation-pairs">
                  {rec.pairs.map((p) => (
                    <li key={p} className="chip" data-testid="recommended-pair" data-pair={p}>
                      {p}
                      {rec.presentInNumber.includes(p) && <span> · มีในเบอร์นี้</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p data-testid="recommendation-empty">ไม่มีคู่เลขที่ตรงทั้งอาชีพและเป้าหมายตามกฎ</p>
              )}
              <p className="muted" data-testid="recommendation-reason">
                เหตุผล: {rec.reason}
              </p>
            </>
          ) : (
            <p data-testid="recommendation-general">{rec.reason}</p>
          )}
          {!rec.matchedRule && rec.pairs.length > 0 && <p data-testid="recommendation-general">ยังไม่มีกฎเฉพาะสำหรับอาชีพนี้ ใช้ผลวิเคราะห์ทั่วไป</p>}
          {result.recommendationSource && <RuleSetMeta rs={result.recommendationSource} label="กฎคู่เลขตามอาชีพ" testIds={false} />}
          <RuleSetMeta rs={result.categoriesRuleSet} label="รายการอาชีพ/เป้าหมาย" testIds={false} />
        </section>
      )}
      <Disclaimer text={result.disclaimer} />
    </section>
  );
}

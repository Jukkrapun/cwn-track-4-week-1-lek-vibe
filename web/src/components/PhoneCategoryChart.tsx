import type { ReactNode } from 'react';
import { summarizeByCategory, type SummarizablePair } from '@/domain/phone-summary';
import type { PairCategory } from '@/domain/types';
import { categoryLabel } from './ui';

/** ช่องต่อฝั่ง = จำนวนคู่สูงสุดที่วิเคราะห์ (หลักที่ 4–10 = 6 คู่) */
const SEGMENTS = 6;

const ICON_PROPS = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const ICONS: Record<PairCategory, ReactNode> = {
  work: (
    <svg {...ICON_PROPS}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18" /></svg>
  ),
  money: (
    <svg {...ICON_PROPS}><path d="M4 20V14M9 20v-9M14 20v-6M19 20V8" /><path d="m4 10 5-5 4 3 6-5" /></svg>
  ),
  love: (
    <svg {...ICON_PROPS}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>
  ),
  communication: (
    <svg {...ICON_PROPS}><path d="M4 5h16v11H9l-5 4V5Z" /><path d="M8 10h8M8 13h5" /></svg>
  ),
  health: (
    <svg {...ICON_PROPS}><path d="M3 12h4l2-5 4 10 2-5h6" /></svg>
  ),
  luck: (
    <svg {...ICON_PROPS}><path d="M12 12c-3-5-8-3-6 0 2 3 6 0 6 0Zm0 0c5-3 3-8 0-6-3 2 0 6 0 6Zm0 0c3 5 8 3 6 0-2-3-6 0-6 0Zm0 0c-5 3-3 8 0 6 3-2 0-6 0-6Z" /></svg>
  ),
};

function Side({ count, kind }: { count: number; kind: 'negative' | 'positive' }) {
  // ฝั่งลบเติมจากกลางออกซ้าย ฝั่งบวกเติมจากกลางออกขวา
  const filled = Array.from({ length: SEGMENTS }, (_, i) => (kind === 'negative' ? i >= SEGMENTS - count : i < count));
  return (
    <div className={`cat-side cat-${kind}`}>
      {filled.map((on, i) => (
        <span key={i} className={on ? 'seg on' : 'seg'} />
      ))}
    </div>
  );
}

export function PhoneCategoryChart({ pairs }: { pairs: readonly SummarizablePair[] }) {
  const rows = summarizeByCategory(pairs);
  return (
    <section className="cat-chart" aria-labelledby="cat-chart-title" data-testid="category-chart">
      <h3 id="cat-chart-title">ภาพรวมตามหมวด</h3>
      <p className="muted cat-legend">
        <span className="dot dot-neg" /> ควรเลี่ยง/ควรระวัง <span className="dot dot-pos" /> ส่งเสริม/ควรระวัง — นับจำนวนคู่เลขด้านบนในแต่ละหมวด ไม่ใช่คำทำนายเพิ่ม
      </p>
      <ul className="cat-rows">
        {rows.map((r) => (
          <li
            key={r.category}
            className="cat-row"
            data-testid="category-row"
            data-category={r.category}
            data-positive={r.positive}
            data-negative={r.negative}
            aria-label={`${categoryLabel(r.category)}: ส่งเสริม ${r.positive} คู่ ควรระวัง ${r.negative} คู่`}
          >
            <span className="cat-label">{categoryLabel(r.category)}</span>
            <div className="cat-track" aria-hidden="true">
              <Side count={r.negative} kind="negative" />
              <span className="cat-icon">{ICONS[r.category]}</span>
              <Side count={r.positive} kind="positive" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

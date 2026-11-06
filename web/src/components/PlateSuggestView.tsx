import { BIRTH_DAY_LABELS, type BirthDay } from '@/domain/types';
import { DemoBadge, Disclaimer, RuleSetMeta, type RuleSetInfo } from './ui';

export interface PlateSuggestResult {
  day: BirthDay;
  letters: string;
  luckyDigits: number[];
  avoidDigits: number[];
  letterWarnings: { char: string; reason: string; source: string }[];
  suggestions: { digits: string; display: string; sum: number; sumMethod: 'digits-only' | 'with-letters'; sumMeaning: string | null; goodPairs: number; pairs: string[] }[];
  ruleSets: (RuleSetInfo & { usedFor: string })[];
  disclaimer: string;
  notices: string[];
}

export function PlateSuggestView({ r }: { r: PlateSuggestResult }) {
  const [wongnai, allianz, meanings] = r.ruleSets;
  const dayLabel = BIRTH_DAY_LABELS[r.day];
  return (
    <section className="card reveal" aria-labelledby="suggest-title" data-testid="plate-suggest-result" data-day={r.day}>
      <p className="eyebrow">เลขทะเบียนแนะนำ</p>
      <h2 id="suggest-title">
        เสริมดวงผู้เกิดวัน{dayLabel}
        {r.letters && <span className="muted"> · หมวด {r.letters}</span>}
      </h2>
      <p>
        เลขส่งเสริมของวัน{dayLabel}: <span data-testid="suggest-lucky-digits">{r.luckyDigits.join(', ')}</span> · เลขที่ควรเลี่ยง:{' '}
        <span data-testid="suggest-avoid-digits">{r.avoidDigits.join(', ')}</span>
      </p>

      {r.letterWarnings.map((w) => (
        <p key={w.char} className="pattern-warning" role="note" data-testid="suggest-letter-warning" data-value={w.char}>
          <span aria-hidden="true">⚠ </span>
          {w.reason}
        </p>
      ))}

      {r.suggestions.length === 0 ? (
        <p data-testid="suggest-empty">
          ไม่พบเลขที่ผ่านทุกกฎสำหรับวัน{dayLabel}
          {r.letters ? ` เมื่อใช้หมวด ${r.letters} ลองเปลี่ยนหมวดอักษรหรือเว้นว่างไว้` : ''}
        </p>
      ) : (
        <ul className="suggest-grid" data-testid="suggest-list">
          {r.suggestions.map((s) => (
            <li key={s.digits} className="suggest-item" data-testid="suggested-plate" data-digits={s.digits} data-sum={s.sum}>
              <span className="plate-visual suggest-plate">
                <span className="plate-main">{s.display}</span>
              </span>
              <span className="suggest-sum">
                ผลรวม{s.sumMethod === 'with-letters' ? 'รวมค่าอักษร' : 'ตัวเลข'} <strong>{s.sum}</strong>
              </span>
              {s.sumMeaning && <span className="muted suggest-meaning">{s.sumMeaning}</span>}
              <span className="muted suggest-pairs">คู่เลข {s.pairs.join(' · ')}</span>
            </li>
          ))}
        </ul>
      )}

      <details className="suggest-how">
        <summary>เลือกเลขเหล่านี้อย่างไร</summary>
        <ul>
          <li>ใช้เฉพาะเลขส่งเสริมของวัน{dayLabel} ไม่มีเลขที่ควรเลี่ยง</li>
          <li>ไม่มีคู่เลขที่ควรเลี่ยงหรือควรระวัง และไม่ตรงรูปแบบที่ควรเลี่ยง</li>
          <li>ผลรวม{r.letters ? 'รวมค่าอักษร' : 'ตัวเลข'}อยู่ในระดับดีเยี่ยม</li>
          <li>เรียงจากจำนวนคู่เลขที่ดีมากไปน้อย แสดงไม่เกิน 8 เลข</li>
        </ul>
      </details>
      <RuleSetMeta rs={wongnai} label="เลขตามวันเกิด / ผลรวม / คู่ควรเลี่ยง" testIds={false} />
      <RuleSetMeta rs={allianz} label="อักษรที่ควรเลี่ยง" testIds={false} />
      <p className="muted" style={{ fontSize: '0.85rem' }}>
        ความหมายคู่เลขจาก {meanings.name} ({meanings.version}) {meanings.isMock && <DemoBadge />}
      </p>
      <ul className="notice-list">
        <li>{r.notices[0]} · เลขที่แนะนำอาจถูกจดทะเบียนไปแล้ว</li>
        <li>{r.notices[1]}</li>
      </ul>
      <Disclaimer text={r.disclaimer} />
    </section>
  );
}

// Presentational components ใช้ร่วมกัน
import { PAIR_CATEGORY_LABELS, type PairCategory } from '@/domain/types';

const GRADE_TEXT: Record<string, { icon: string; label: string }> = {
  good: { icon: '✓', label: 'ดี' },
  excellent: { icon: '★', label: 'ดีเยี่ยม' },
  caution: { icon: '!', label: 'ควรระวัง' },
  avoid: { icon: '✕', label: 'ควรเลี่ยง' },
  'no-data': { icon: '–', label: 'ไม่มีข้อมูล' },
};

export function GradeBadge({ grade, testId }: { grade: string; testId?: string }) {
  const g = GRADE_TEXT[grade] ?? GRADE_TEXT['no-data'];
  return (
    <span className={`grade grade-${grade}`} data-testid={testId} data-grade={grade}>
      <span aria-hidden="true">{g.icon}</span>
      {g.label}
    </span>
  );
}

export const categoryLabel = (c: string): string => PAIR_CATEGORY_LABELS[c as PairCategory] ?? c;

export interface RuleSetInfo {
  id: string;
  name: string;
  version: string;
  source: string;
  sourceUrl: string | null;
  isMock: boolean;
}

export function DemoBadge() {
  return (
    <span className="demo-badge" data-testid="demo-badge">
      <span aria-hidden="true">◈</span>ข้อมูลตัวอย่าง
    </span>
  );
}

export function RuleSetMeta({ rs, label = 'Rule Set', testIds = true }: { rs: RuleSetInfo; label?: string; testIds?: boolean }) {
  return (
    <ul className="ruleset-meta" aria-label={`ที่มาของผลลัพธ์: ${label}`}>
      <li>
        {label}: <strong data-testid={testIds ? 'ruleset-name' : undefined}>{rs.name}</strong> (<code>{rs.id}</code>)
      </li>
      <li>
        เวอร์ชัน <strong data-testid={testIds ? 'ruleset-version' : undefined}>{rs.version}</strong>
      </li>
      <li>
        แหล่งอ้างอิง:{' '}
        <strong data-testid={testIds ? 'ruleset-source' : undefined}>
          {rs.sourceUrl ? (
            <a href={rs.sourceUrl} target="_blank" rel="noopener noreferrer">
              {rs.source}
            </a>
          ) : (
            rs.source
          )}
        </strong>
      </li>
      {rs.isMock && (
        <li>
          <DemoBadge />
        </li>
      )}
    </ul>
  );
}

export function Disclaimer({ text }: { text: string }) {
  return (
    <p className="disclaimer" data-testid="disclaimer">
      <span aria-hidden="true">☾ </span>
      {text}
    </p>
  );
}

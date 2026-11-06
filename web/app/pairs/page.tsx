import type { Metadata } from 'next';
import Link from 'next/link';
import { AppError } from '@/domain/errors';
import { searchPair } from '@/application/analysis-service';
import { categoryLabel, Disclaimer, GradeBadge, RuleSetMeta } from '@/components/ui';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'ความหมายคู่เลข', description: 'ค้นหาความหมายคู่เลข 2 หลักตาม Rule Set ที่ Published' };

type SP = Promise<{ q?: string | string[] }>;

export default async function PairsPage({ searchParams }: { searchParams: SP }) {
  const raw = (await searchParams).q;
  const q = typeof raw === 'string' ? raw : '';
  let result: Awaited<ReturnType<typeof searchPair>> | null = null;
  let error: string | null = null;
  if (q !== '') {
    try {
      result = await searchPair(q);
    } catch (e) {
      if (e instanceof AppError) error = e.message;
      else throw e;
    }
  }
  return (
    <>
      <section className="page-hero">
        <div>
          <p className="eyebrow">US-CT-002</p>
          <h1>ความหมายคู่เลข</h1>
          <p className="lead">กรอกเลข 2 หลัก (00–99) คู่ที่สลับกันอยู่ในกลุ่มเดียวกันจะได้ผลเดียวกัน</p>
        </div>
        <img src="/assets/pairs.svg" alt="ภาพประกอบกระดานทักษาและคู่เลข" width={360} height={240} />
      </section>
      <form className="card" method="get" action="/pairs" role="search" aria-label="ค้นหาคู่เลข">
        <div className="form-grid cols-2">
          <div className="field">
            <label htmlFor="pair-search-input">คู่เลข</label>
            <input id="pair-search-input" name="q" data-testid="pair-search-input" inputMode="numeric" maxLength={50} defaultValue={q} aria-invalid={error ? 'true' : 'false'} aria-describedby={error ? 'pair-hint pair-search-error' : 'pair-hint'} />
            <span id="pair-hint" className="hint">เช่น 24, 89, 00</span>
            {error && <p id="pair-search-error" className="field-error" role="alert" data-testid="pair-search-error">{error}</p>}
          </div>
        </div>
        <div className="actions">
          <button className="btn" type="submit" data-testid="pair-search-submit">ค้นหา</button>
        </div>
      </form>
      {result && (
        <section className="card reveal" aria-labelledby="pair-result-title" data-testid="pair-result" data-pair={result.pair} data-grade={result.grade}>
          <div className="pair-head">
            <h2 id="pair-result-title">
              คู่ <span className="pair-num">{result.pair}</span> <span className="muted" style={{ fontSize: '1rem' }}>กลุ่ม {result.group.join(' / ')}</span>
            </h2>
            <GradeBadge grade={result.grade} testId="pair-grade" />
          </div>
          <p data-testid="pair-meaning">{result.meaning ?? 'ไม่มีข้อมูล'}</p>
          {result.pros && <p data-testid="pair-pros"><span className="muted">ข้อดี:</span> {result.pros}</p>}
          {result.cons && <p data-testid="pair-cons"><span className="muted">ข้อควรระวัง:</span> {result.cons}</p>}
          {result.categories.length > 0 && <p data-testid="pair-categories"><span className="muted">หมวด:</span> {result.categories.map(categoryLabel).join(', ')}</p>}
          <RuleSetMeta rs={result.ruleSet} />
          <Disclaimer text="ความหมายคู่เลขเป็นความเชื่อ ไม่ใช่ข้อเท็จจริงทางวิทยาศาสตร์" />
        </section>
      )}
      <p className="muted" style={{ marginTop: '1rem' }}>อยากดูทั้งเบอร์? <Link href="/phone">วิเคราะห์เบอร์โทร</Link></p>
    </>
  );
}

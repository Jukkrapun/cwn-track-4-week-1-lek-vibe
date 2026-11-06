import type { Metadata } from 'next';
import Link from 'next/link';
import { listArticleCategories, searchArticles } from '@/infrastructure/article-repository';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'บทความ', description: 'บทความความรู้เรื่องคู่เลข ผลรวมทะเบียน และขอบเขตของความเชื่อ' };

type SP = Promise<{ q?: string | string[]; category?: string | string[] }>;

export default async function ArticlesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q.trim() : '';
  const category = typeof sp.category === 'string' && sp.category !== '' ? sp.category : null;
  const tooLong = [...q].length > 100;
  const [cats, items] = await Promise.all([listArticleCategories(), tooLong ? Promise.resolve([]) : searchArticles(q, category)]);
  const href = (c: string | null) => {
    const p = new URLSearchParams();
    if (q && !tooLong) p.set('q', q);
    if (c) p.set('category', c);
    const s = p.toString();
    return s ? `/articles?${s}` : '/articles';
  };
  return (
    <>
      <p className="eyebrow">US-CT-001</p>
      <h1>บทความ</h1>
      <form className="card" method="get" action="/articles" role="search" aria-label="ค้นหาบทความ">
        {category && <input type="hidden" name="category" value={category} />}
        <div className="field">
          <label htmlFor="article-search-input">ค้นหาจากชื่อหรือเนื้อหา</label>
          <input id="article-search-input" data-testid="article-search-input" name="q" defaultValue={q} aria-invalid={tooLong ? 'true' : 'false'} aria-describedby={tooLong ? 'article-search-error' : undefined} />
          {tooLong && <p id="article-search-error" className="field-error" role="alert" data-testid="article-search-error">คำค้นยาวเกิน 100 ตัวอักษร</p>}
        </div>
        <div className="actions">
          <button className="btn" type="submit" data-testid="article-search-submit">ค้นหา</button>
        </div>
        <nav className="filter-row" aria-label="กรองตามหมวด">
          <Link className="btn btn-ghost btn-sm" href={href(null)} aria-current={category === null ? 'true' : undefined} data-testid="article-filter-all">ทั้งหมด</Link>
          {cats.map((c) => (
            <Link key={c.id} className="btn btn-ghost btn-sm" href={href(c.id)} aria-current={category === c.id ? 'true' : undefined} data-testid={`article-filter-${c.id}`}>{c.label}</Link>
          ))}
        </nav>
      </form>
      {q && !tooLong && <p className="muted" data-testid="article-search-query">ผลการค้นหา: {q}</p>}
      {!tooLong && items.length === 0 ? (
        <div className="card empty-state" data-testid="article-empty">
          <img src="/assets/empty.svg" alt="" width={220} height={160} />
          <p>ไม่พบบทความที่ตรงกับคำค้น</p>
          <Link href="/articles">ดูบทความทั้งหมด</Link>
        </div>
      ) : (
        <ul className="article-list">
          {items.map((a) => (
            <li key={a.slug} data-testid="article-item" data-slug={a.slug} data-category={a.category_id}>
              <Link href={`/articles/${a.slug}`} className="card tile article-card">
                {a.cover && <img src={a.cover} alt="" width={480} height={270} />}
                <span className="eyebrow">{a.category_label}</span>
                <h2 data-testid="article-title">{a.title}</h2>
                <p className="muted">{a.description}</p>
                <span className="muted" style={{ fontSize: '0.85rem' }}>ปรับปรุง {a.updated_at} · {a.author}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

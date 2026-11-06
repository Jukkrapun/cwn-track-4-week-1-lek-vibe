import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Markdown } from '@/components/Markdown';
import { Disclaimer } from '@/components/ui';
import { findArticle } from '@/infrastructure/article-repository';
import { incrementUsage } from '@/infrastructure/stats-repository';
import { now } from '@/shared/clock';

export const dynamic = 'force-dynamic';
type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const a = await findArticle((await params).slug);
  return a ? { title: a.title, description: a.description } : { title: 'ไม่พบหน้า' };
}

export default async function ArticlePage({ params }: { params: P }) {
  const a = await findArticle((await params).slug);
  if (!a) notFound();
  await incrementUsage('ARTICLE_VIEW', now());
  return (
    <article className="card article-body">
      <p className="eyebrow">{a.category_label}</p>
      <h1 data-testid="article-heading">{a.title}</h1>
      <p className="muted">
        ผู้เขียน <span data-testid="article-author">{a.author}</span> · ปรับปรุงเมื่อ <time dateTime={a.updated_at} data-testid="article-updated">{a.updated_at}</time>
      </p>
      {a.cover && <img src={a.cover} alt="" width={960} height={540} style={{ borderRadius: 12, marginBottom: '1rem' }} />}
      <Markdown source={a.body_markdown} />
      <section aria-labelledby="refs" data-testid="article-references">
        <h2 id="refs">แหล่งอ้างอิง</h2>
        {a.references.length === 0 ? (
          <p className="muted">บทความนี้ไม่มีแหล่งอ้างอิงภายนอก</p>
        ) : (
          <ul>
            {a.references.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" data-testid="article-reference-link">{r.title}</a>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Disclaimer text="เนื้อหาเป็นความเชื่อ ไม่ใช่ข้อเท็จจริงทางวิทยาศาสตร์" />
      <p><Link href="/articles">← กลับไปหน้ารายการบทความ</Link></p>
    </article>
  );
}

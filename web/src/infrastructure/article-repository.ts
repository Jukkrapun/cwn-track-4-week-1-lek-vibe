// ArticleRepository — บทความ (Static Markdown ที่ seed ลง DB)
import { query } from './db';

export interface ArticleSummary {
  slug: string;
  title: string;
  description: string;
  category_id: string;
  category_label: string;
  author: string;
  updated_at: string;
  cover: string | null;
}
export interface Article extends ArticleSummary {
  body_markdown: string;
  references: { title: string; url: string }[];
}

const SUMMARY = `SELECT a.slug, a.title, a.description, a.category_id, c.label AS category_label, a.author,
                        to_char(a.updated_at, 'YYYY-MM-DD') AS updated_at, a.cover
                   FROM article a JOIN article_category c ON c.id = a.category_id`;

export async function searchArticles(q: string, category: string | null): Promise<ArticleSummary[]> {
  const like = `%${q.replace(/[\\%_]/g, (m) => '\\' + m)}%`;
  return query<ArticleSummary>(
    `${SUMMARY} WHERE ($1 = '' OR a.title ILIKE $2 OR a.body_markdown ILIKE $2 OR a.description ILIKE $2)
                  AND ($3::text IS NULL OR a.category_id = $3) ORDER BY a.updated_at DESC, a.slug`,
    [q, like, category],
  );
}

export async function listArticleCategories(): Promise<{ id: string; label: string }[]> {
  return query('SELECT id, label FROM article_category ORDER BY id');
}

export async function findArticle(slug: string): Promise<Article | null> {
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return null;
  const rows = await query<ArticleSummary & { body_markdown: string }>(`${SUMMARY.replace('a.cover', 'a.cover, a.body_markdown')} WHERE a.slug = $1`, [slug]);
  if (!rows[0]) return null;
  const refs = await query<{ title: string; url: string }>('SELECT title, url FROM article_reference WHERE article_slug = $1 ORDER BY sort_order', [slug]);
  return { ...rows[0], references: refs };
}

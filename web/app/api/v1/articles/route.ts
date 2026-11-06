import { AppError } from '@/domain/errors';
import { searchArticles } from '@/infrastructure/article-repository';
import { envelopeOk, handle } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req, ctx) => {
  const sp = new URL(req.url).searchParams;
  const q = (sp.get('q') ?? '').trim();
  if ([...q].length > 100) throw new AppError('QUERY_TOO_LONG', 'q');
  const items = await searchArticles(q, sp.get('category') || null);
  return envelopeOk({ items, total: items.length }, ctx.requestId);
});

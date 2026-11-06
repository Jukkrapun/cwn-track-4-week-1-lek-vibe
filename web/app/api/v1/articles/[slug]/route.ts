import { AppError } from '@/domain/errors';
import { findArticle } from '@/infrastructure/article-repository';
import { envelopeOk, handle } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const GET = handle(async (_req, ctx, params) => {
  const a = await findArticle(params.slug ?? '');
  if (!a) throw new AppError('NOT_FOUND');
  return envelopeOk(a, ctx.requestId);
});

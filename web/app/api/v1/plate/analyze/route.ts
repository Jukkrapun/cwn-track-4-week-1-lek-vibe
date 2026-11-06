import { AppError } from '@/domain/errors';
import { analyzePlate } from '@/application/analysis-service';
import { envelopeOk, handle, readJsonBody } from '@/shared/http';
import { hitRateLimit } from '@/shared/rate-limit';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req, ctx) => {
  if (hitRateLimit('analyze', ctx.ip)) throw new AppError('RATE_LIMITED');
  const body = await readJsonBody(req);
  return envelopeOk(await analyzePlate(body, (m) => (ctx.maskedInput = m)), ctx.requestId);
});

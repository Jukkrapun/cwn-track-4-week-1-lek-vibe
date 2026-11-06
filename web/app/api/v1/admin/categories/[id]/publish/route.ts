import { publishCategory } from '@/application/category-service';
import { adminSession } from '@/shared/admin-auth';
import { envelopeOk, handle } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req, ctx, params) => {
  const s = await adminSession(req);
  return envelopeOk(await publishCategory(params.id, s, ctx.requestId), ctx.requestId);
});

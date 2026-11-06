import { toggleCategory } from '@/application/category-service';
import { adminSession } from '@/shared/admin-auth';
import { envelopeOk, handle, readJsonBody } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const PATCH = handle(async (req, ctx, params) => {
  const s = await adminSession(req);
  const body = await readJsonBody(req);
  return envelopeOk(await toggleCategory(params.id, body.enabled, s, ctx.requestId), ctx.requestId);
});

import { approveVersion } from '@/application/rule-management';
import { adminSession } from '@/shared/admin-auth';
import { envelopeOk, handle } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req, ctx, params) => {
  const s = await adminSession(req);
  return envelopeOk(await approveVersion(params.id, s, ctx.requestId), ctx.requestId);
});

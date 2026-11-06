import { publishVersion } from '@/application/rule-management';
import { adminSession } from '@/shared/admin-auth';
import { envelopeOk, handle, readJsonBody } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req, ctx, params) => {
  const s = await adminSession(req);
  const body = await readJsonBody(req);
  return envelopeOk(await publishVersion(params.id, body.baseVersion, s, ctx.requestId), ctx.requestId);
});

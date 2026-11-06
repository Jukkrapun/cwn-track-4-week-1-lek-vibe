import { rollbackRuleSet } from '@/application/rule-management';
import { adminSession } from '@/shared/admin-auth';
import { envelopeOk, handle, readJsonBody } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req, ctx) => {
  const s = await adminSession(req);
  return envelopeOk(await rollbackRuleSet(await readJsonBody(req), s, ctx.requestId), ctx.requestId);
});

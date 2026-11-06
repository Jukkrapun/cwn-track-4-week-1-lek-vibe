import { diffDraft } from '@/application/rule-management';
import { adminSession } from '@/shared/admin-auth';
import { envelopeOk, handle } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req, ctx, params) => {
  await adminSession(req);
  return envelopeOk(await diffDraft(params.id), ctx.requestId);
});

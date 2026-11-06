import { usageTotals } from '@/infrastructure/stats-repository';
import { adminSession } from '@/shared/admin-auth';
import { envelopeOk, handle } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req, ctx) => {
  await adminSession(req);
  return envelopeOk({ usage: await usageTotals() }, ctx.requestId);
});

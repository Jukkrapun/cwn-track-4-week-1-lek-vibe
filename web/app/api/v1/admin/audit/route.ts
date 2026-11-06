import { listAudit } from '@/infrastructure/audit-repository';
import { adminSession } from '@/shared/admin-auth';
import { envelopeOk, handle } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req, ctx) => {
  await adminSession(req, ['ADMIN']);
  return envelopeOk({ items: await listAudit() }, ctx.requestId);
});

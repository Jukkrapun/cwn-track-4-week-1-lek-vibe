import { adminSession } from '@/shared/admin-auth';
import { envelopeOk, handle } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req, ctx) => {
  const s = await adminSession(req);
  return envelopeOk({ username: s.username, role: s.role }, ctx.requestId);
});

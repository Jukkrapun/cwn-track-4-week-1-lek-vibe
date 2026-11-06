import { createCategory } from '@/application/category-service';
import { listCategories } from '@/infrastructure/rule-repository';
import { adminSession } from '@/shared/admin-auth';
import { envelopeOk, handle, readJsonBody } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req, ctx) => {
  await adminSession(req);
  return envelopeOk({ items: await listCategories() }, ctx.requestId);
});

export const POST = handle(async (req, ctx) => {
  const s = await adminSession(req);
  return envelopeOk(await createCategory(await readJsonBody(req), s, ctx.requestId), ctx.requestId);
});

import { previewDraft } from '@/application/rule-management';
import { adminSession } from '@/shared/admin-auth';
import { envelopeOk, handle } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req, ctx, params) => {
  await adminSession(req);
  const text = await req.text();
  let numbers: unknown = [];
  try {
    numbers = text ? (JSON.parse(text) as { numbers?: unknown }).numbers : [];
  } catch {
    numbers = [];
  }
  return envelopeOk(await previewDraft(params.id, numbers), ctx.requestId);
});

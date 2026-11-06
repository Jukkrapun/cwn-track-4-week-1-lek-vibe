import { savePairDraft } from '@/application/rule-management';
import { findOpenDraft, findPublishedVersion, loadPairGroups, RULE_SET_IDS } from '@/infrastructure/rule-repository';
import { adminSession } from '@/shared/admin-auth';
import { envelopeOk, handle, readJsonBody } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req, ctx) => {
  await adminSession(req);
  const [pub, draft] = await Promise.all([findPublishedVersion(RULE_SET_IDS.pairs), findOpenDraft(RULE_SET_IDS.pairs)]);
  return envelopeOk(
    {
      published: pub ? { id: pub.id, version: pub.version, groups: await loadPairGroups(pub.id) } : null,
      draft: draft ? { id: draft.id, status: draft.status, createdBy: draft.created_by_name, groups: await loadPairGroups(draft.id) } : null,
    },
    ctx.requestId,
  );
});

export const POST = handle(async (req, ctx) => {
  const s = await adminSession(req);
  return envelopeOk(await savePairDraft(await readJsonBody(req), s, ctx.requestId, 'create'), ctx.requestId);
});

export const PUT = handle(async (req, ctx) => {
  const s = await adminSession(req);
  return envelopeOk(await savePairDraft(await readJsonBody(req), s, ctx.requestId, 'update'), ctx.requestId);
});

import { listRuleSets, listVersions } from '@/infrastructure/rule-repository';
import { adminSession } from '@/shared/admin-auth';
import { envelopeOk, handle } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req, ctx) => {
  await adminSession(req);
  const [ruleSets, versions] = await Promise.all([listRuleSets(), listVersions()]);
  return envelopeOk(
    {
      ruleSets,
      versions: versions.map((v) => ({
        id: v.id, ruleId: v.rule_set_id, version: v.version, status: v.status, source: v.source_name, sourceUrl: v.source_url,
        isMock: v.is_mock, basedOn: v.based_on_version, createdBy: v.created_by_name, approvedBy: v.approved_by_name,
        effectiveAt: v.effective_at, createdAt: v.created_at,
      })),
    },
    ctx.requestId,
  );
});

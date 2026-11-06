import { activeCategories } from '@/infrastructure/rule-repository';
import { envelopeOk, handle } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const GET = handle(async (_req, ctx) => {
  const all = await activeCategories();
  return envelopeOk(
    { occupations: all.filter((c) => c.type === 'OCCUPATION'), goals: all.filter((c) => c.type === 'GOAL'), phoneTypes: all.filter((c) => c.type === 'PHONE_TYPE') },
    ctx.requestId,
  );
});

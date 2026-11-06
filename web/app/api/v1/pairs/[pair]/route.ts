import { searchPair } from '@/application/analysis-service';
import { envelopeOk, handle } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const GET = handle(async (_req, ctx, params) => envelopeOk(await searchPair(decodeURIComponent(params.pair ?? '')), ctx.requestId));

import { NextResponse } from 'next/server';
import { AppError } from '@/domain/errors';
import { DEFAULT_TEST_NOW, resetDatabase } from '@/application/test-reset';
import { envelopeOk, handle } from '@/shared/http';
import { testResetAllowed } from '@/shared/runtime-profile';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req, ctx) => {
  if (!testResetAllowed()) return new NextResponse('Not Found', { status: 404 });
  const text = await req.text();
  let nowRaw: unknown = DEFAULT_TEST_NOW;
  if (text.trim() !== '') {
    let b: unknown;
    try {
      b = JSON.parse(text);
    } catch {
      throw new AppError('INVALID_REQUEST');
    }
    if (b && typeof b === 'object' && (b as Record<string, unknown>).now !== undefined) nowRaw = (b as Record<string, unknown>).now;
  }
  const at = typeof nowRaw === 'string' ? new Date(nowRaw) : new Date(NaN);
  if (Number.isNaN(at.getTime())) throw new AppError('INVALID_REQUEST', 'now');
  await resetDatabase(at);
  return envelopeOk({ reset: true, now: at.toISOString() }, ctx.requestId);
});

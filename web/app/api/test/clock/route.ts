import { NextResponse } from 'next/server';
import { AppError } from '@/domain/errors';
import { setTestClock } from '@/application/test-reset';
import { now } from '@/shared/clock';
import { envelopeOk, handle, readJsonBody } from '@/shared/http';
import { testResetAllowed } from '@/shared/runtime-profile';

export const dynamic = 'force-dynamic';

/** ตั้งเวลา {now:"ISO"} หรือเลื่อนเวลา {advanceMinutes:n} — ใช้เฉพาะโหมดทดสอบ */
export const POST = handle(async (req, ctx) => {
  if (!testResetAllowed()) return new NextResponse('Not Found', { status: 404 });
  const b = await readJsonBody(req);
  let at: Date;
  if (typeof b.advanceMinutes === 'number' && Number.isFinite(b.advanceMinutes)) at = new Date(now().getTime() + b.advanceMinutes * 60_000);
  else if (typeof b.now === 'string') at = new Date(b.now);
  else throw new AppError('INVALID_REQUEST');
  if (Number.isNaN(at.getTime())) throw new AppError('INVALID_REQUEST', 'now');
  await setTestClock(at);
  return envelopeOk({ now: at.toISOString() }, ctx.requestId);
});

// Route handler wrapper: Request ID · envelope {success,data,error} · error ไม่มี stack (NFR-09/18)
import { NextResponse, type NextRequest } from 'next/server';
import { AppError, ERROR_CATALOG, type ErrorCode } from '@/domain/errors';
import { ensureClockLoaded } from './clock';
import { logError, logRequest } from './logger';

export interface HandlerContext {
  readonly requestId: string;
  readonly ip: string;
  maskedInput: string | null;
}

export type Params = Record<string, string>;
type Handler = (req: NextRequest, ctx: HandlerContext, params: Params) => Promise<NextResponse>;
type RouteCtx = { params: Promise<Params> };

export function envelopeError(code: ErrorCode, field: string | null, requestId: string): NextResponse {
  return NextResponse.json(
    { success: false, data: null, error: { code, message: ERROR_CATALOG[code].message, field } },
    { status: ERROR_CATALOG[code].status, headers: { 'X-Request-Id': requestId, 'Cache-Control': 'no-store' } },
  );
}

export function envelopeOk(data: unknown, requestId: string, status = 200): NextResponse {
  return NextResponse.json({ success: true, data, error: null }, { status, headers: { 'X-Request-Id': requestId, 'Cache-Control': 'no-store' } });
}

export function clientIp(req: NextRequest): string {
  return req.headers.get('x-real-ip') ?? 'local';
}

export async function readJsonBody(req: NextRequest): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (text.length > 20_000) throw new AppError('INVALID_REQUEST');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new AppError('INVALID_REQUEST');
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new AppError('INVALID_REQUEST');
  return parsed as Record<string, unknown>;
}

export function handle(fn: Handler): (req: NextRequest, route?: RouteCtx) => Promise<NextResponse> {
  return async (req: NextRequest, route?: RouteCtx) => {
    const requestId = crypto.randomUUID();
    const started = performance.now();
    const ctx: HandlerContext = { requestId, ip: clientIp(req), maskedInput: null };
    let res: NextResponse;
    try {
      await ensureClockLoaded();
      res = await fn(req, ctx, route ? await route.params : {});
    } catch (err) {
      if (err instanceof AppError) res = envelopeError(err.code, err.field, requestId);
      else {
        logError(requestId, err);
        res = envelopeError('INTERNAL_ERROR', null, requestId);
      }
    }
    res.headers.set('X-Request-Id', requestId);
    await logRequest({
      requestId,
      method: req.method,
      path: new URL(req.url).pathname,
      status: res.status,
      maskedInput: ctx.maskedInput,
      durationMs: Math.round(performance.now() - started),
    });
    return res;
  };
}

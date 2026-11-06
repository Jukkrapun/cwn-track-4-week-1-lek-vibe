import { AppError } from '@/domain/errors';
import { login, SESSION_COOKIE } from '@/application/identity-service';
import { envelopeOk, handle, readJsonBody } from '@/shared/http';
import { hitRateLimit } from '@/shared/rate-limit';
import { cookieSecure } from '@/shared/runtime-profile';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req, ctx) => {
  if (hitRateLimit('login', ctx.ip)) throw new AppError('RATE_LIMITED');
  const body = await readJsonBody(req);
  const r = await login(body.username, body.password);
  const res = envelopeOk({ user: r.user }, ctx.requestId);
  res.cookies.set(SESSION_COOKIE, r.token, { httpOnly: true, sameSite: 'strict', secure: cookieSecure(), path: '/' });
  return res;
});

import { logout, SESSION_COOKIE } from '@/application/identity-service';
import { envelopeOk, handle } from '@/shared/http';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req, ctx) => {
  await logout(req.cookies.get(SESSION_COOKIE)?.value);
  const res = envelopeOk({ loggedOut: true }, ctx.requestId);
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 0 });
  return res;
});

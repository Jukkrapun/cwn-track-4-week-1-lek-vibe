// ใส่ X-Request-Id ให้ทุก response ของหน้าเว็บ (API ใส่เองใน handler) — NFR-18
import { NextResponse, type NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/api/')) return NextResponse.next();
  const res = NextResponse.next();
  res.headers.set('X-Request-Id', crypto.randomUUID());
  return res;
}

export const config = { matcher: ['/((?!_next/static|_next/image|assets/|favicon|icon.svg).*)'] };

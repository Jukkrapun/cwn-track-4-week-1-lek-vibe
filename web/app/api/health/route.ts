import { NextResponse } from 'next/server';
import { query } from '@/infrastructure/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  let db = false;
  try {
    await Promise.race([query('SELECT 1'), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))]);
    db = true;
  } catch {
    db = false;
  }
  return NextResponse.json({ ok: true, db }, { headers: { 'X-Request-Id': crypto.randomUUID(), 'Cache-Control': 'no-store' } });
}

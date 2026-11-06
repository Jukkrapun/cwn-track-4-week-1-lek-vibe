// Structured JSON log — รับเฉพาะค่าที่ mask แล้ว (NFR-11, NFR-18)
import { query } from '@/infrastructure/db';
import { now } from './clock';

export interface RequestLogEntry {
  readonly requestId: string;
  readonly method: string;
  readonly path: string;
  readonly status: number;
  readonly maskedInput: string | null;
  readonly durationMs: number;
}

export async function logRequest(e: RequestLogEntry): Promise<void> {
  const at = now();
  process.stdout.write(`${JSON.stringify({ level: 'info', at: at.toISOString(), ...e })}\n`);
  await query(
    'INSERT INTO request_log (request_id, method, path, status, masked_input, duration_ms, at) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [e.requestId, e.method, e.path.slice(0, 200), e.status, e.maskedInput, e.durationMs, at],
  ).catch(() => undefined);
}

export function logError(requestId: string, err: unknown): void {
  const name = err instanceof Error ? err.name : 'Error';
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`${JSON.stringify({ level: 'error', at: now().toISOString(), requestId, name, message })}\n`);
}

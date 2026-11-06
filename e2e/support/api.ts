import fs from 'node:fs';
import path from 'node:path';
import { request, type APIRequestContext, type APIResponse } from '@playwright/test';
import { BASE_URL, USERS, type UserKey } from './env';

export interface ApiResult<T = any> {
  status: number;
  body: T;
  text: string;
  headers: Record<string, string>;
}

/** ตัวเรียก API ที่บันทึก log ทุกคำขอ (หลักฐานของ test ที่ยิง API อย่างเดียว) */
export class ApiLog {
  readonly lines: string[] = [];
  private readonly contexts: APIRequestContext[] = [];

  add(line: string) {
    this.lines.push(`${new Date().toISOString()} ${line}`);
  }

  async client(label = 'guest'): Promise<ApiClient> {
    const ctx = await request.newContext({ baseURL: BASE_URL });
    this.contexts.push(ctx);
    return new ApiClient(ctx, this, label);
  }

  /** client ที่ login แล้ว (cookie แยกต่อผู้ใช้) */
  async as(user: UserKey): Promise<ApiClient> {
    const c = await this.client(USERS[user].username);
    const r = await c.post('/api/v1/admin/login', USERS[user]);
    if (r.status !== 200) throw new Error(`login ${user} ไม่สำเร็จ: ${r.status} ${r.text}`);
    return c;
  }

  async dispose(file?: string) {
    await Promise.all(this.contexts.map((c) => c.dispose()));
    if (file && this.lines.length) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, this.lines.join('\n') + '\n', 'utf8');
    }
  }
}

export class ApiClient {
  constructor(readonly ctx: APIRequestContext, private readonly log: ApiLog, readonly label: string) {}

  private async wrap(method: string, url: string, run: () => Promise<APIResponse>, body?: unknown): Promise<ApiResult> {
    const res = await run();
    const text = await res.text();
    let parsed: any = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      // ไม่ใช่ JSON — เก็บเป็นข้อความดิบ
    }
    const reqBody = body === undefined ? '' : ` ${typeof body === 'string' ? body : JSON.stringify(body)}`.slice(0, 300);
    this.log.add(`[${this.label}] ${method} ${url}${reqBody} -> ${res.status()} ${text.slice(0, 400)}`);
    return { status: res.status(), body: parsed, text, headers: res.headers() };
  }

  get(url: string) {
    return this.wrap('GET', url, () => this.ctx.get(url));
  }
  delete(url: string) {
    return this.wrap('DELETE', url, () => this.ctx.delete(url));
  }
  post(url: string, data?: unknown) {
    return this.wrap('POST', url, () => this.ctx.post(url, { data: data ?? {} }), data);
  }
  patch(url: string, data?: unknown) {
    return this.wrap('PATCH', url, () => this.ctx.patch(url, { data: data ?? {} }), data);
  }
  /** ส่ง body ดิบ (JSON เสีย ฯลฯ) */
  raw(url: string, body: string) {
    return this.wrap('POST', url, () => this.ctx.post(url, { data: body, headers: { 'content-type': 'application/json' } }), body);
  }
}

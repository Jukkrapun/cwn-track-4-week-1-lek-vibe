// fetch helper ฝั่ง Browser — ส่งข้อมูลทาง POST body เท่านั้น (NFR-10)
export interface ApiError {
  code: string;
  message: string;
  field: string | null;
}
export type ApiResult<T> = { success: true; data: T; error: null } | { success: false; data: null; error: ApiError };

export async function callApi<T>(url: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET', body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
      credentials: 'same-origin',
    });
    return (await res.json()) as ApiResult<T>;
  } catch {
    return { success: false, data: null, error: { code: 'INTERNAL_ERROR', message: 'ระบบขัดข้อง กรุณาลองใหม่', field: null } };
  }
}

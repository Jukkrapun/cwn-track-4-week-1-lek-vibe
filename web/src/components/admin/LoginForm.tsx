'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { callApi } from '../api-client';

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await callApi<{ user: { role: string } }>('/api/v1/admin/login', 'POST', { username, password });
    setBusy(false);
    if (r.success) router.replace('/admin');
    else setError(r.error.message);
  }
  return (
    <form onSubmit={onSubmit} noValidate className="form-grid">
      <div className="field">
        <label htmlFor="login-username">ชื่อผู้ใช้</label>
        <input id="login-username" data-testid="login-username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} aria-describedby={error ? 'login-error' : undefined} aria-invalid={error ? 'true' : 'false'} />
      </div>
      <div className="field">
        <label htmlFor="login-password">รหัสผ่าน</label>
        <input id="login-password" data-testid="login-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby={error ? 'login-error' : undefined} aria-invalid={error ? 'true' : 'false'} />
      </div>
      {error && <p id="login-error" className="field-error" role="alert" data-testid="login-error">{error}</p>}
      <div className="actions"><button className="btn" type="submit" data-testid="login-submit" disabled={busy}>{busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}</button></div>
    </form>
  );
}

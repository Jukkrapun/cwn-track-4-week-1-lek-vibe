'use client';

import { useRouter } from 'next/navigation';
import { callApi } from '../api-client';

export function LogoutButton() {
  const router = useRouter();
  return (
    <button type="button" className="btn btn-ghost btn-sm" data-testid="logout-button" onClick={async () => { await callApi('/api/v1/admin/logout', 'POST', {}); router.replace('/admin/login'); }}>
      ออกจากระบบ
    </button>
  );
}

import type { Metadata } from 'next';
import { LoginForm } from '@/components/admin/LoginForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'เข้าสู่ระบบหลังบ้าน', description: 'สำหรับ Content Editor และ Admin' };

export default function LoginPage() {
  return (
    <section className="card" style={{ maxWidth: 440, margin: '2rem auto' }}>
      <p className="eyebrow">หลังบ้าน</p>
      <h1>เข้าสู่ระบบ</h1>
      <LoginForm />
    </section>
  );
}

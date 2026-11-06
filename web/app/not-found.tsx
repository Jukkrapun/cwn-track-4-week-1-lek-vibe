import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="card empty-state" data-testid="not-found">
      <img src="/assets/not-found.svg" alt="ภาพดาวหลงทางบนท้องฟ้า" width={260} height={200} />
      <h1>ไม่พบหน้าที่ต้องการ (404)</h1>
      <p className="muted">หน้านี้อาจถูกย้ายหรือไม่มีอยู่</p>
      <div className="actions" style={{ justifyContent: 'center' }}>
        <Link className="btn" href="/articles" data-testid="back-to-articles">กลับไปหน้ารายการบทความ</Link>
        <Link className="btn btn-ghost" href="/">หน้าแรก</Link>
      </div>
    </section>
  );
}

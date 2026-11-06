import type { Metadata } from 'next';
import { PlateForm } from '@/components/PlateForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'วิเคราะห์ทะเบียนรถ', description: 'ผลรวมทะเบียน 2 แบบ วันเกิด คู่เลข และรูปแบบที่ควรเลี่ยง พร้อมแหล่งอ้างอิงแยกกัน' };

export default function PlatePage() {
  return (
    <>
      <section className="page-hero">
        <div>
          <p className="eyebrow">US-LP-001 – 005</p>
          <h1>วิเคราะห์ทะเบียนรถ</h1>
          <p className="lead">รูปแบบที่รองรับ: [เลข 1 หลัก] [พยัญชนะไทย 1–2 ตัว] [เลข 1–4 หลัก] เช่น 1กข 5900 · ผลรวมและเลขตามวันเกิดใช้ Wongnai ส่วนอักษรที่ควรเลี่ยงใช้ Allianz Ayudhya</p>
        </div>
        <img src="/assets/plate.svg" alt="ภาพประกอบป้ายทะเบียนบนกระดานทักษา" width={360} height={240} />
      </section>
      <PlateForm />
    </>
  );
}

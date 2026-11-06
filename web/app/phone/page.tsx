import type { Metadata } from 'next';
import { PhoneForm } from '@/components/PhoneForm';
import { activeCategories } from '@/infrastructure/rule-repository';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'วิเคราะห์เบอร์โทรศัพท์', description: 'แยกคู่เลข 6 คู่ของเบอร์มือถือตาม Rule Set ที่ระบุแหล่งอ้างอิง' };

export default async function PhonePage() {
  const cats = await activeCategories();
  const pick = (t: string) => cats.filter((c) => c.type === t).map((c) => ({ id: c.id, label: c.label }));
  return (
    <>
      <section className="page-hero">
        <div>
          <p className="eyebrow">US-PH-001 · 002 · 004</p>
          <h1>วิเคราะห์เบอร์โทรศัพท์</h1>
          <p className="lead">กรอกเบอร์มือถือ 10 หลัก ระบบจะอ่านคู่เลขติดกันจากหลักที่ 4 ถึง 10 ได้ 6 คู่ (ไม่ดู 3 หลักแรก) ข้อมูลที่กรอกส่งทาง POST และไม่ถูกบันทึก</p>
        </div>
        <img src="/assets/phone.svg" alt="ภาพประกอบโทรศัพท์ล้อมด้วยดวงดาวและยันต์" width={360} height={240} />
      </section>
      <PhoneForm occupations={pick('OCCUPATION')} goals={pick('GOAL')} />
    </>
  );
}

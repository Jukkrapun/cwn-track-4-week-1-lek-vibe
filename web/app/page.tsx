import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <section className="home-hero" aria-labelledby="home-title">
        <div>
          <p className="eyebrow">ศาสตร์แห่งตัวเลข · ตามความเชื่อ</p>
          <h1 id="home-title">
            อ่าน<em>คู่เลข</em>ของเบอร์โทรและทะเบียนรถ อย่างมีที่มา
          </h1>
          <p className="lead">ทุกผลลัพธ์มาจาก Rule Set ที่ระบุชื่อ เวอร์ชัน และแหล่งอ้างอิงเสมอ ระบบไม่คิดคำทำนายขึ้นเอง และไม่เก็บเบอร์หรือทะเบียนที่คุณกรอก</p>
          <div className="actions">
            <Link className="btn" href="/phone" data-testid="cta-phone">วิเคราะห์เบอร์โทร</Link>
            <Link className="btn btn-ghost" href="/plate" data-testid="cta-plate">วิเคราะห์ทะเบียนรถ</Link>
          </div>
        </div>
        <img className="hero-art hero-photo" src="/assets/hero-astrologer.webp" alt="ภาพพอร์ตเทรตชายในชุดคลุมโหราศาสตร์สีดำทอง" width={840} height={1120} fetchPriority="high" />
      </section>
      <section aria-label="เครื่องมือ" className="bento">
        <Link href="/phone" className="card tile tall">
          <img src="/assets/phone.svg" alt="" width={320} height={200} />
          <h2>เบอร์โทรศัพท์</h2>
          <p className="muted">แยกคู่เลข 6 คู่จากหลักที่ 4–10 พร้อมระดับ ข้อดี ข้อควรระวัง และคู่เลขแนะนำตามอาชีพ</p>
          <span className="go">เริ่มวิเคราะห์ →</span>
        </Link>
        <Link href="/plate" className="card tile">
          <img src="/assets/plate.svg" alt="" width={320} height={200} />
          <h2>ทะเบียนรถ</h2>
          <p className="muted">ผลรวม 2 แบบ วันเกิด และรูปแบบที่ควรเลี่ยง</p>
          <span className="go">ไปที่ทะเบียน →</span>
        </Link>
        <Link href="/pairs" className="card tile">
          <img src="/assets/pairs.svg" alt="" width={320} height={200} />
          <h2>ความหมายคู่เลข</h2>
          <p className="muted">ค้นหาคู่ 00–99 (24 กับ 42 ได้ผลเดียวกัน)</p>
          <span className="go">ค้นหา →</span>
        </Link>
        <Link href="/articles" className="card tile tile-wide">
          <h2>บทความความรู้</h2>
          <p className="muted">วิธีอ่านคู่เลข ผลรวมทะเบียน และขอบเขตของความเชื่อ</p>
          <span className="go">อ่านบทความ →</span>
        </Link>
      </section>
    </>
  );
}

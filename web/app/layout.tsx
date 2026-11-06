import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Link from 'next/link';
import { ReadyMarker } from '@/components/ReadyMarker';
import { isBugModeFlag } from '@/shared/runtime-profile';
import './globals.css';

const plex = localFont({
  src: [
    { path: './fonts/plex-thai-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/plex-thai-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/plex-thai-700.woff2', weight: '700', style: 'normal' },
    { path: './fonts/plex-latin-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/plex-latin-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/plex-latin-700.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-plex',
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { default: 'LekVibe · เช็กไวบ์เลข ก่อนเลือกเบอร์และป้าย', template: '%s · LekVibe' },
  description: 'วิเคราะห์คู่เลขเบอร์โทรศัพท์และทะเบียนรถตามความเชื่อ พร้อมระบุแหล่งอ้างอิงของทุกกฎ',
};

const NAV = [
  { href: '/phone', label: 'เบอร์โทร' },
  { href: '/plate', label: 'ทะเบียนรถ' },
  { href: '/pairs', label: 'ความหมายคู่เลข' },
  { href: '/articles', label: 'บทความ' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" data-bug-mode={isBugModeFlag()} className={plex.variable}>
      <body>
        <ReadyMarker />
        <div className="sky" aria-hidden="true" />
        <a className="skip-link" href="#main">ข้ามไปยังเนื้อหา</a>
        <header className="site-header">
          <Link href="/" className="brand" data-testid="nav-home">
            <span className="brand-mark" aria-hidden="true">✦</span>
            <span>
              LekVibe <span className="brand-sub">เช็กไวบ์เลข</span>
            </span>
          </Link>
          <nav aria-label="เมนูหลัก">
            <ul className="nav-list">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} data-testid={`nav-${n.href.slice(1)}`}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main id="main" className="site-main">
          {children}
        </main>
        <footer className="site-footer">
          <p>เนื้อหาทั้งหมดเป็นความเชื่อ ไม่ใช่ข้อเท็จจริงทางวิทยาศาสตร์ · ระบบไม่เก็บเบอร์หรือทะเบียนที่คุณกรอก</p>
          <p>
            <Link href="/admin/login">สำหรับเจ้าหน้าที่</Link>
          </p>
        </footer>
      </body>
    </html>
  );
}

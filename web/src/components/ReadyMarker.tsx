'use client';

import { useEffect } from 'react';

/** ตั้ง <html data-ready="true"> หลัง hydrate เสร็จ (สำหรับ Playwright) */
export function ReadyMarker() {
  useEffect(() => {
    document.documentElement.dataset.ready = 'true';
  }, []);
  return null;
}

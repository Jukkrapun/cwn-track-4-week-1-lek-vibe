/**
 * สคริปต์ที่ฉีดเข้าเพจเฉพาะโหมด GIF: ป้ายชื่อ test มุมซ้ายล่าง + วงแดงตรงจุดคลิก
 * ผูกกับ <html> (ไม่ใช่ <body>) เพื่อไม่ให้ไปปนใน document.body.innerText
 */
export function overlayScript(label: string): string {
  return `(() => {
    const LABEL = ${JSON.stringify(label)};
    const mount = () => {
      if (!document.documentElement || document.getElementById('__e2e_label')) return;
      const el = document.createElement('div');
      el.id = '__e2e_label';
      el.textContent = LABEL;
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'position:fixed;left:6px;bottom:6px;max-width:calc(100vw - 12px);z-index:2147483647;' +
        'background:rgba(17,24,39,.85);color:#fff;font:600 13px/1.3 system-ui,sans-serif;padding:4px 8px;' +
        'border-radius:6px;pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box';
      document.documentElement.appendChild(el);
    };
    document.addEventListener('pointerdown', (e) => {
      const dot = document.createElement('div');
      dot.setAttribute('aria-hidden', 'true');
      dot.style.cssText = 'position:fixed;width:34px;height:34px;margin:-17px 0 0 -17px;border:4px solid #e11d48;' +
        'border-radius:50%;z-index:2147483647;pointer-events:none;box-sizing:border-box;left:' + e.clientX + 'px;top:' + e.clientY + 'px';
      document.documentElement.appendChild(dot);
      setTimeout(() => dot.remove(), 900);
    }, true);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
    setInterval(mount, 500);
  })();`;
}

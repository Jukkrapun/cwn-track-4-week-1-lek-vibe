// สร้างภาพประกอบ SVG ทั้งหมด (ไม่มี Codex CLI ในเครื่อง) → public/assets/
// ธีม: ท้องฟ้ากลางคืน ดวงดาว ยันต์ ลายกนก ผังดวง 12 ภพ กระดานทักษา · ไม่มีตัวอักษรหรือโลโก้
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets');
fs.mkdirSync(out, { recursive: true });

const GOLD = '#D4AF37';
const LILAC = '#C4B5FD';
const PURPLE = '#7C3AED';

// ตัวสร้างเลขสุ่มแบบกำหนด seed เพื่อให้ไฟล์เหมือนเดิมทุกครั้ง
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}
function stars(w, h, n, seed) {
  const r = rng(seed);
  return Array.from({ length: n }, () => {
    const x = (r() * w).toFixed(1);
    const y = (r() * h).toFixed(1);
    const rad = (r() * 1.6 + 0.4).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${rad}" fill="#fff" opacity="${(r() * 0.6 + 0.3).toFixed(2)}"/>`;
  }).join('');
}
const defs = (id) => `<defs>
  <radialGradient id="${id}-bg" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#2a1a52"/><stop offset="0.6" stop-color="#140d29"/><stop offset="1" stop-color="#0E0A1A"/></radialGradient>
  <radialGradient id="${id}-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${PURPLE}" stop-opacity="0.55"/><stop offset="1" stop-color="${PURPLE}" stop-opacity="0"/></radialGradient>
  <linearGradient id="${id}-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dd8a"/><stop offset="0.5" stop-color="${GOLD}"/><stop offset="1" stop-color="#8a6d1c"/></linearGradient>
</defs>`;

/** วงล้อผังดวง 12 ภพ */
function wheel(cx, cy, r, id) {
  const spokes = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    return `<line x1="${cx + Math.cos(a) * r * 0.42}" y1="${cy + Math.sin(a) * r * 0.42}" x2="${cx + Math.cos(a) * r}" y2="${cy + Math.sin(a) * r}"/>`;
  }).join('');
  const dots = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6 + Math.PI / 12;
    return `<circle cx="${(cx + Math.cos(a) * r * 0.72).toFixed(1)}" cy="${(cy + Math.sin(a) * r * 0.72).toFixed(1)}" r="${r * 0.035}" fill="url(#${id}-gold)"/>`;
  }).join('');
  return `<g fill="none" stroke="url(#${id}-gold)" stroke-width="1.4">
    <circle cx="${cx}" cy="${cy}" r="${r}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.92}" stroke-opacity="0.6"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.42}"/>${spokes}</g>${dots}`;
}
/** ยันต์: สี่เหลี่ยมซ้อน + เส้นทแยง */
function yantra(cx, cy, s, id, opacity = 1) {
  const h = s / 2;
  return `<g fill="none" stroke="url(#${id}-gold)" stroke-width="1.2" opacity="${opacity}">
    <rect x="${cx - h}" y="${cy - h}" width="${s}" height="${s}"/>
    <rect x="${cx - h * 0.8}" y="${cy - h * 0.8}" width="${s * 0.8}" height="${s * 0.8}" transform="rotate(45 ${cx} ${cy})"/>
    <circle cx="${cx}" cy="${cy}" r="${h * 0.55}"/>
    <path d="M${cx - h} ${cy - h} L${cx + h} ${cy + h} M${cx + h} ${cy - h} L${cx - h} ${cy + h}" stroke-opacity="0.5"/>
    <path d="M${cx} ${cy - h * 0.55} L${cx + h * 0.48} ${cy + h * 0.28} L${cx - h * 0.48} ${cy + h * 0.28} Z"/></g>`;
}
/** ลายกนก (เปลวไฟ) แบบเส้น */
function kanok(x, y, s, id, flip = 1) {
  return `<path transform="translate(${x} ${y}) scale(${s * flip} ${s})" fill="none" stroke="url(#${id}-gold)" stroke-width="${1.4 / s}" stroke-linecap="round"
    d="M0 0 C20 -10 30 -40 18 -62 C34 -50 40 -22 30 -6 C46 -18 52 -44 44 -70 C64 -48 60 -12 36 4 C60 0 76 -16 82 -38 C92 -10 70 14 40 14 C20 14 6 8 0 0 Z"/>`;
}
/** กระดานทักษา 3x3 */
function board(x, y, s, id) {
  const c = s / 3;
  const cells = [];
  for (let i = 0; i < 3; i += 1) for (let j = 0; j < 3; j += 1) {
    cells.push(`<rect x="${x + i * c}" y="${y + j * c}" width="${c}" height="${c}"/>`);
    cells.push(`<circle cx="${x + i * c + c / 2}" cy="${y + j * c + c / 2}" r="${c * (0.08 + ((i + j) % 3) * 0.04)}" fill="url(#${id}-gold)" stroke="none"/>`);
  }
  return `<g fill="none" stroke="url(#${id}-gold)" stroke-width="1.3">${cells.join('')}</g>`;
}
const frame = (w, h, id) => `<rect x="6" y="6" width="${w - 12}" height="${h - 12}" rx="22" fill="none" stroke="url(#${id}-gold)" stroke-opacity="0.55"/>`;
const svg = (w, h, id, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${defs(id)}<rect width="${w}" height="${h}" rx="28" fill="url(#${id}-bg)"/>${stars(w, h, Math.round((w * h) / 2600), w + h)}${body}${frame(w, h, id)}</svg>`;
const moon = (x, y, r, id) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}-gold)"/><circle cx="${x + r * 0.42}" cy="${y - r * 0.18}" r="${r * 0.9}" fill="#140d29"/>`;

const files = {
  'hero.svg': svg(560, 560, 'h', `<circle cx="280" cy="280" r="250" fill="url(#h-glow)"/>${wheel(280, 280, 200, 'h')}${yantra(280, 280, 150, 'h')}${moon(450, 110, 34, 'h')}${kanok(60, 520, 1.3, 'h')}${kanok(500, 520, 1.3, 'h', -1)}`),
  'phone.svg': svg(360, 240, 'p', `<circle cx="180" cy="120" r="110" fill="url(#p-glow)"/><rect x="140" y="38" width="80" height="164" rx="16" fill="#1C1430" stroke="url(#p-gold)" stroke-width="2"/><rect x="150" y="58" width="60" height="110" rx="6" fill="none" stroke="${LILAC}" stroke-opacity="0.6"/>${yantra(180, 112, 40, 'p')}<circle cx="180" cy="186" r="6" fill="none" stroke="url(#p-gold)"/>${kanok(30, 210, 0.9, 'p')}${kanok(330, 210, 0.9, 'p', -1)}${moon(300, 52, 18, 'p')}`),
  'plate.svg': svg(360, 240, 'l', `<circle cx="180" cy="120" r="110" fill="url(#l-glow)"/>${board(30, 40, 120, 'l')}<rect x="150" y="80" width="180" height="90" rx="12" fill="#f5f2ea" stroke="#14102a" stroke-width="4"/><rect x="156" y="86" width="168" height="78" rx="9" fill="none" stroke="${GOLD}" stroke-width="2"/><g fill="#14102a"><rect x="172" y="106" width="22" height="34" rx="4"/><rect x="202" y="106" width="22" height="34" rx="4"/><circle cx="252" cy="123" r="10"/><circle cx="278" cy="123" r="10"/><circle cx="304" cy="123" r="10"/></g><rect x="190" y="148" width="100" height="6" rx="3" fill="#14102a" opacity="0.5"/>${moon(310, 48, 16, 'l')}`),
  'pairs.svg': svg(360, 240, 'r', `<circle cx="180" cy="120" r="110" fill="url(#r-glow)"/>${board(105, 45, 150, 'r')}${kanok(40, 200, 0.8, 'r')}${kanok(320, 200, 0.8, 'r', -1)}`),
  'cover-phone-pairs.svg': svg(480, 270, 'a', `<circle cx="240" cy="135" r="130" fill="url(#a-glow)"/>${wheel(160, 135, 90, 'a')}<rect x="290" y="60" width="80" height="150" rx="16" fill="#1C1430" stroke="url(#a-gold)" stroke-width="2"/>${yantra(330, 130, 40, 'a')}`),
  'cover-plate-sum.svg': svg(480, 270, 'b', `<circle cx="240" cy="135" r="130" fill="url(#b-glow)"/>${board(60, 60, 150, 'b')}<g stroke="url(#b-gold)" stroke-width="6" stroke-linecap="round"><path d="M290 135 h50 M315 110 v50"/><path d="M370 120 h50 M370 150 h50"/></g>`),
  'cover-birthday.svg': svg(480, 270, 'c', `<circle cx="240" cy="135" r="130" fill="url(#c-glow)"/>${Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return `<circle cx="${(240 + Math.cos(a) * 95).toFixed(1)}" cy="${(135 + Math.sin(a) * 95).toFixed(1)}" r="14" fill="none" stroke="url(#c-gold)" stroke-width="2"/>`; }).join('')}${moon(240, 135, 42, 'c')}`),
  'cover-disclaimer.svg': svg(480, 270, 'd', `<circle cx="240" cy="135" r="130" fill="url(#d-glow)"/>${yantra(240, 135, 150, 'd')}${kanok(70, 240, 1, 'd')}${kanok(410, 240, 1, 'd', -1)}`),
  'empty.svg': svg(220, 160, 'e', `<circle cx="110" cy="80" r="70" fill="url(#e-glow)"/>${yantra(110, 80, 70, 'e', 0.7)}<circle cx="150" cy="40" r="4" fill="${LILAC}"/>`),
  'not-found.svg': svg(260, 200, 'n', `<circle cx="130" cy="100" r="90" fill="url(#n-glow)"/>${wheel(130, 100, 70, 'n')}<path d="M190 40 l40 -24" stroke="${LILAC}" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 6"/><circle cx="232" cy="15" r="5" fill="url(#n-gold)"/>`),
};
for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(out, name), content);

// ลายยันต์พื้นหลัง (โปร่งใส จางมาก)
const pattern = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 520" width="520" height="520"><defs><linearGradient id="y-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${GOLD}"/><stop offset="1" stop-color="${LILAC}"/></linearGradient></defs><g opacity="0.07">${yantra(130, 130, 140, 'y')}${wheel(390, 390, 90, 'y')}${kanok(330, 140, 0.9, 'y')}${kanok(130, 420, 0.9, 'y', -1)}</g></svg>`;
fs.writeFileSync(path.join(out, 'yantra-pattern.svg'), pattern);
console.log(Object.keys(files).length + 1, 'assets');

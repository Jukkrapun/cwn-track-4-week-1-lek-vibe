// Utility ข้อความ (pure)
const THAI_ZERO = 0x0e50;

/** แปลงเลขไทย ๐–๙ เป็น 0–9 (BR-PH-02) */
export function thaiDigitsToArabic(input: string): string {
  return input.replace(/[๐-๙]/g, (c) => String(c.charCodeAt(0) - THAI_ZERO));
}

/** พยัญชนะไทย 44 ตัว (ก–ฮ ไม่รวม ฤ ฦ) — BR-LP-03 */
export const THAI_CONSONANTS: ReadonlySet<string> = new Set(
  Array.from({ length: 0x0e2e - 0x0e01 + 1 }, (_, i) => String.fromCharCode(0x0e01 + i)).filter((c) => c !== 'ฤ' && c !== 'ฦ'),
);

/** Mask เบอร์ เช่น 0812345678 → 081****678 (NFR-11) */
export function maskPhone(value: string): string {
  const v = value.trim();
  if (v.length < 7) return '*'.repeat(Math.min(v.length, 10));
  return `${v.slice(0, 3)}****${v.slice(-3)}`;
}

/** Mask ทะเบียน เช่น กข 1234 → กข **34 (NFR-11) */
export function maskPlate(prefix: string, letters: string, digits: string): string {
  const keep = digits.length > 2 ? digits.slice(-2) : '';
  return `${prefix}${letters} ${'*'.repeat(Math.max(digits.length - keep.length, 0))}${keep}`.trim();
}

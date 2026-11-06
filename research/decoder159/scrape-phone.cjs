// เก็บผล "ทำนายเบอร์" จาก decoder159.com ให้ครอบคลุมคู่เลข 00–99 (ใช้ข้อมูลอ้างอิง ระบุแหล่งที่มา)
const path = require('path');
const fs = require('fs');
const { chromium } = require(path.resolve(__dirname, '../../e2e/node_modules/playwright'));
const URL = 'https://decoder159.com/%E0%B8%97%E0%B8%B3%E0%B8%99%E0%B8%B2%E0%B8%A2%E0%B9%80%E0%B8%9A%E0%B8%AD%E0%B8%A3%E0%B9%8C?phone=';
const DELAY_MS = 3000;

function deBruijn() { const k = 10, n = 2, a = Array(k * n).fill(0), seq = [];
  const db = (t, p) => { if (t > n) { if (n % p === 0) for (let j = 1; j <= p; j++) seq.push(a[j]); }
    else { a[t] = a[t - p]; db(t + 1, p); for (let j = a[t - p] + 1; j < k; j++) { a[t] = j; db(t + 1, t); } } };
  db(1, 1); return seq.join('') + seq[0]; }

function parse(text) {
  const out = []; const re = /(เลขดี|เลขเสีย)\nหมายเลข\n(\d{2})\n([\s\S]*?)(?=\n(?:เลขดี|เลขเสีย)\nหมายเลข\n|$)/g;
  let m; while ((m = re.exec(text))) out.push({ pair: m[2], grade: m[1] === 'เลขดี' ? 'good' : 'bad', text: m[3].trim() });
  return out; }

(async () => {
  const s = deBruijn(); const phones = [];
  if (process.env.ONLY) phones.length = 0; else
  for (let i = 0; i < s.length - 1; i += 7) phones.push(('08' + s.slice(i, i + 8)).padEnd(10, '9'));
  const extra = (process.argv[2] || '').split(',').filter(Boolean); phones.push(...extra);
  const browser = await chromium.launch(); const page = await browser.newPage({ locale: 'th-TH' });
  const results = [];
  for (const phone of phones) {
    await page.goto(URL + phone, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.getByText('ผลวิเคราะห์ทำนายเบอร์').waitFor({ timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(DELAY_MS);
    const t = await page.locator('body').innerText();
    const body = t.slice(t.indexOf('ผลวิเคราะห์ทำนายเบอร์'), t.indexOf('ติดตามอาจารย์'));
    results.push({ phone, items: parse(body), raw: body }); console.log(phone, results.at(-1).items.length);
  }
  await browser.close();
  const pairs = {}; for (const r of results) for (const it of r.items) pairs[it.pair] ??= { grade: it.grade, text: it.text, seenIn: r.phone };
  const allPairsInPhones = new Set(); for (const p of phones) for (let i = 0; i < 9; i++) allPairsInPhones.add(p.slice(i, i + 2));
  fs.writeFileSync(path.join(__dirname, 'raw-phones.json'), JSON.stringify({
    source: 'https://decoder159.com/ทำนายเบอร์', collectedAt: new Date().toISOString(), phones, results,
    pairs, testedPairs: [...allPairsInPhones].sort(),
    noDataPairs: [...allPairsInPhones].filter((p) => !pairs[p]).sort() }, null, 1));
})();

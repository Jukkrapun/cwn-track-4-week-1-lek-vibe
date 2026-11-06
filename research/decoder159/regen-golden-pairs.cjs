// คำนวณ "grade ของคู่เลข" ใน user-story/test-cases/golden-cases.json ใหม่จาก reference-data
// (ผลรวม/วันเกิดไม่เปลี่ยน) — phone: ความหมายทั่วไป · plate: avoidPairs+occupation=caution > avoidPairs=avoid > ความหมายทั่วไป
const fs = require('fs');
const path = require('path');

const ref = path.resolve(__dirname, '../../user-story/reference-data');
const goldenPath = path.resolve(__dirname, '../../user-story/test-cases/golden-cases.json');
const meanings = JSON.parse(fs.readFileSync(path.join(ref, 'pair-meanings.json'), 'utf8'));
const plate = JSON.parse(fs.readFileSync(path.join(ref, 'plate-rules.json'), 'utf8'));
const golden = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));

const meaningGrade = (pair) => meanings.pairs.find((g) => g.pairs.includes(pair))?.grade ?? 'no-data';
const avoid = new Set(plate.avoidPairs.flatMap((g) => g.pairs));
const occupation = new Set(Object.values(plate.occupationPairs).flat());
const plateGrade = (pair) => {
  if (avoid.has(pair) && occupation.has(pair)) return 'caution';
  if (avoid.has(pair)) return 'avoid';
  return meaningGrade(pair);
};

let changed = 0;
const regrade = (pairs, fn) => pairs.map(({ pair, grade }) => {
  const next = fn(pair);
  if (next !== grade) changed += 1;
  return { pair, grade: next };
});

const out = {
  ...golden,
  _note: `${golden._note} · คู่เลขใช้ Rule Set ${meanings.ruleSetId} v${meanings.version} (${meanings.source.name}) สร้างใหม่ด้วย research/decoder159/regen-golden-pairs.cjs`,
  generatedAt: '2026-11-07',
  phonePairs: golden.phonePairs.map((c) => ({ ...c, pairs: regrade(c.pairs, meaningGrade) })),
  plateSums: golden.plateSums.map((c) => ({ ...c, pairs: regrade(c.pairs, plateGrade) })),
  plateBirthday: golden.plateBirthday.map((c) => ({ ...c, pairs: regrade(c.pairs, plateGrade) })),
  platePairs: golden.platePairs.map((c) => ({ ...c, pairs: regrade(c.pairs, plateGrade) })),
};
fs.writeFileSync(goldenPath, JSON.stringify(out, null, 2) + '\n');
console.log(`เปลี่ยน grade ${changed} จุด`);

// สร้าง Seed SQL จาก reference-data JSON + บทความ Markdown (รันบนเครื่อง dev: npm run gen:seed)
// Output: ../db/init/02-seed.sql และ sql/seed.sql (ใช้กับ POST /api/test/reset) — ห้ามแก้ไฟล์ output ด้วยมือ
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(here, '..');
const repoDir = path.resolve(webDir, '..');
const refDir = path.join(repoDir, 'user-story', 'reference-data');
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(refDir, f), 'utf8'));

const pairs = readJson('pair-meanings.json');
const phoneCats = readJson('phone-categories.json');
const wongnai = readJson('plate-rules.json');
const allianz = readJson('plate-rules-allianz.json');

const q = (v) => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const arr = (xs) => `ARRAY[${xs.map(q).join(',')}]::text[]`;
const out = [];
const emit = (s) => out.push(s);

// ---------- ผู้ใช้ (รหัสผ่านเก็บเป็น bcrypt hash เท่านั้น) ----------
const users = [
  { id: '00000000-0000-4000-8000-000000000001', username: 'editor.test',  pw: 'Editor#Test2026',  role: 'EDITOR', failed: 0 },
  { id: '00000000-0000-4000-8000-000000000002', username: 'editor2.test', pw: 'Editor2#Test2026', role: 'EDITOR', failed: 0 },
  { id: '00000000-0000-4000-8000-000000000003', username: 'admin.test',   pw: 'Admin#Test2026',   role: 'ADMIN',  failed: 0 },
  { id: '00000000-0000-4000-8000-000000000004', username: 'admin2.test',  pw: 'Admin2#Test2026',  role: 'ADMIN',  failed: 0 },
  { id: '00000000-0000-4000-8000-000000000005', username: 'locked.test',  pw: 'Locked#Test2026',  role: 'EDITOR', failed: 4 },
];
const EDITOR = users[0].id;
const ADMIN = users[2].id;
const SEED_AT = '2026-11-06T00:00:00Z';

emit('-- สร้างอัตโนมัติโดย web/scripts/gen-seed.mjs — ห้ามแก้มือ');
emit("SET client_encoding = 'UTF8';");
emit('-- ผู้ใช้หลังบ้าน (password = bcrypt hash, cost 10)');
for (const u of users) {
  const hash = bcrypt.hashSync(u.pw, 10);
  emit(`INSERT INTO app_user (id, username, password_hash, role, failed_login_count, created_at) VALUES (${q(u.id)}, ${q(u.username)}, ${q(hash)}, '${u.role}', ${u.failed}, ${q(SEED_AT)});`);
}

// ---------- Rule Sets ----------
const V = {
  pairs: '10000000-0000-4000-8000-000000000001',
  wongnai: '10000000-0000-4000-8000-000000000002',
  allianz: '10000000-0000-4000-8000-000000000003',
  cats: '10000000-0000-4000-8000-000000000004',
};
const ruleSets = [
  { id: pairs.ruleSetId, domain: 'PHONE', name: 'ความหมายคู่เลข (ความเชื่อทั่วไป)', vid: V.pairs, version: pairs.version, source: pairs.source.name, url: null, mock: true },
  { id: wongnai.ruleSetId, domain: 'PLATE', name: 'ทะเบียนรถมงคล — Wongnai', vid: V.wongnai, version: wongnai.version, source: wongnai.source.name, url: wongnai.source.url, mock: false },
  { id: allianz.ruleSetId, domain: 'PLATE', name: 'ทะเบียนรถมงคล — Allianz Ayudhya', vid: V.allianz, version: allianz.version, source: allianz.source.name, url: allianz.source.url, mock: false },
  { id: phoneCats.ruleSetId, domain: 'PHONE', name: 'หมวดเบอร์ / อาชีพ / เป้าหมาย', vid: V.cats, version: phoneCats.version, source: 'นิยามสมมติสำหรับพัฒนาและทดสอบ (OQ-04)', url: null, mock: true },
];
emit('\n-- Rule Sets: สร้างเวอร์ชันเป็น DRAFT ใส่เนื้อหา แล้วจึง Publish (I-3)');
for (const r of ruleSets) {
  emit(`INSERT INTO rule_set (id, domain, name) VALUES (${q(r.id)}, '${r.domain}', ${q(r.name)});`);
  emit(`INSERT INTO rule_set_version (id, rule_set_id, version, status, source_name, source_url, is_mock, created_by, approved_by, created_at) VALUES (${q(r.vid)}, ${q(r.id)}, NULL, 'DRAFT', ${q(r.source)}, ${q(r.url)}, ${r.mock}, ${q(EDITOR)}, ${q(ADMIN)}, ${q(SEED_AT)});`);
}

// ความหมายคู่เลข
emit('\n-- pair-meanings.json');
pairs.pairs.forEach((p, i) => {
  const pmId = `20000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`;
  emit(`INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES (${q(pmId)}, ${q(V.pairs)}, ${q(p.pairs.join('|'))}, '${p.grade.toUpperCase()}', ${arr(p.categories)}, ${q(p.pros)}, ${q(p.cons)}, ${q(pairs.source.name)}, ${i});`);
  for (const pr of p.pairs) emit(`INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES (${q(pmId)}, ${q(V.pairs)}, ${q(pr)});`);
});

// Wongnai
emit('\n-- plate-rules.json (Wongnai)');
for (const [value, letters] of Object.entries(wongnai.letterValues)) {
  if (value.startsWith('_')) continue;
  for (const l of letters) emit(`INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES (${q(V.wongnai)}, ${q(l)}, ${Number(value)});`);
}
for (const g of wongnai.sumGrades) {
  for (const s of g.sums) emit(`INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES (${q(V.wongnai)}, ${s}, '${g.grade.toUpperCase()}', ${q(g.pros ?? g.cons)});`);
}
const dayKey = (d) => d.toUpperCase().replace('-', '_');
const emitBirthday = (vid, rules, withLetters) => {
  for (const [day, r] of Object.entries(rules)) {
    if (day.startsWith('_')) continue;
    for (const d of r.lucky) emit(`INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES (${q(vid)}, '${dayKey(day)}', 'LUCKY_DIGIT', ${q(d)});`);
    for (const d of r.avoid) emit(`INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES (${q(vid)}, '${dayKey(day)}', 'AVOID_DIGIT', ${q(d)});`);
    if (withLetters) for (const l of r.avoidLetters ?? []) emit(`INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES (${q(vid)}, '${dayKey(day)}', 'AVOID_LETTER', ${q(l)});`);
  }
};
emitBirthday(V.wongnai, wongnai.birthDay, false);
for (const g of wongnai.avoidPairs) {
  for (const pr of g.pairs) emit(`INSERT INTO avoid_pattern (rule_set_version_id, kind, value, reason, precedence) VALUES (${q(V.wongnai)}, 'PAIR', ${q(pr)}, ${q(g.reason)}, 1);`);
}
for (const p of wongnai.avoidPatterns) emit(`INSERT INTO avoid_pattern (rule_set_version_id, kind, value, reason, precedence) VALUES (${q(V.wongnai)}, 'PATTERN', ${q(p.id)}, ${q(p.description)}, 2);`);
for (const [key, prs] of Object.entries(wongnai.occupationPairs)) {
  prs.forEach((pr, i) => emit(`INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES (${q(V.wongnai)}, ${q(key)}, ${q(pr)}, ${i});`));
}

// Allianz (ใช้เฉพาะ avoidLetters ในผลวิเคราะห์ — เก็บเลขไว้ครบเพื่ออ้างอิง)
emit('\n-- plate-rules-allianz.json');
emitBirthday(V.allianz, allianz.birthDay, true);

// Publish ทุก Rule Set
emit('\n-- Publish seed versions');
for (const r of ruleSets) {
  emit(`UPDATE rule_set_version SET status = 'PUBLISHED', version = ${q(r.version)}, effective_at = ${q(SEED_AT)} WHERE id = ${q(r.vid)};`);
  emit(`UPDATE rule_set SET published_version_id = ${q(r.vid)} WHERE id = ${q(r.id)};`);
}

// ---------- หมวด ----------
emit('\n-- phone-categories.json: หมวดเบอร์ 5 · อาชีพ 8 · เป้าหมาย 5');
const occupationMeta = {
  trade: ['ค้าขาย', 'trade-online'],
  business: ['ธุรกิจส่วนตัว', null],
  office: ['พนักงานออฟฟิศ', 'office-service-sales'],
  executive: ['ผู้บริหาร', null],
  service: ['งานบริการ', 'office-service-sales'],
  freelance: ['ฟรีแลนซ์', null],
  'government-teacher': ['ข้าราชการ / ครู', 'government-teacher'],
  'technician-engineer': ['ช่าง / วิศวกร', 'technician-doctor-engineer-traveler'],
};
const goalMeta = {
  negotiation: ['การเจรจา', 'communication'],
  money: ['การเงิน', 'money'],
  relationship: ['ความสัมพันธ์', 'love'],
  health: ['สุขภาพ', 'health'],
  career: ['การงาน', 'work'],
};
phoneCats.categories.forEach((c, i) => {
  const desc = [c.ruleMock, c.pros && `ข้อดี: ${c.pros}`, c.cons && `ข้อเสีย: ${c.cons}`].filter(Boolean).join(' · ');
  emit(`INSERT INTO category (id, type, label, enabled, rule_ref, description, status, sort_order) VALUES (${q(c.id)}, 'PHONE_TYPE', ${q(c.label)}, ${c.enabled}, NULL, ${q(desc)}, 'PUBLISHED', ${i});`);
});
phoneCats.occupations.forEach((id, i) => {
  const [label, ref] = occupationMeta[id];
  emit(`INSERT INTO category (id, type, label, enabled, rule_ref, status, sort_order) VALUES (${q(id)}, 'OCCUPATION', ${q(label)}, true, ${q(ref)}, 'PUBLISHED', ${i});`);
});
phoneCats.goals.forEach((id, i) => {
  const [label, ref] = goalMeta[id];
  emit(`INSERT INTO category (id, type, label, enabled, rule_ref, status, sort_order) VALUES (${q(id)}, 'GOAL', ${q(label)}, true, ${q(ref)}, 'PUBLISHED', ${i});`);
});

// ---------- บทความ ----------
emit('\n-- บทความ (content/articles/*.md)');
emit(`INSERT INTO article_category (id, label) VALUES ('phone', 'เบอร์โทรศัพท์'), ('plate', 'ทะเบียนรถ'), ('general', 'ความรู้ทั่วไป');`);
const parseFrontMatter = (text) => {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('missing front-matter');
  const meta = { references: [] };
  let ref = null;
  for (const line of m[1].split('\n')) {
    const item = line.match(/^\s+-\s+title:\s*(.+)$/);
    const url = line.match(/^\s+url:\s*(.+)$/);
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (item) { ref = { title: item[1].trim() }; meta.references.push(ref); }
    else if (url && ref) ref.url = url[1].trim();
    else if (kv && kv[1] !== 'references') meta[kv[1]] = kv[2].trim();
  }
  return { meta, body: m[2].trim() };
};
const artDir = path.join(webDir, 'content', 'articles');
const slugs = ['how-to-read-phone-pairs', 'plate-sum-two-methods', 'birthday-and-plate', 'belief-disclaimer'];
for (const slug of slugs) {
  const { meta, body } = parseFrontMatter(fs.readFileSync(path.join(artDir, `${slug}.md`), 'utf8').replace(/\r\n/g, '\n'));
  emit(`INSERT INTO article (slug, title, description, category_id, author, updated_at, cover, body_markdown) VALUES (${q(slug)}, ${q(meta.title)}, ${q(meta.description)}, ${q(meta.category)}, ${q(meta.author)}, ${q(meta.updatedAt)}, ${q(meta.cover)}, ${q(body)});`);
  meta.references.forEach((r, i) => emit(`INSERT INTO article_reference (article_slug, title, url, sort_order) VALUES (${q(slug)}, ${q(r.title)}, ${q(r.url)}, ${i});`));
}

// ---------- นาฬิกา ----------
emit('\n-- นาฬิกาแอป: NULL = ใช้เวลาจริง (POST /api/test/reset จะล็อกเวลา)');
emit('INSERT INTO app_clock (id, fixed_at) VALUES (1, NULL);');

const sql = out.join('\n') + '\n';
fs.writeFileSync(path.join(repoDir, 'db', 'init', '02-seed.sql'), sql);
fs.mkdirSync(path.join(webDir, 'sql'), { recursive: true });
fs.writeFileSync(path.join(webDir, 'sql', 'seed.sql'), sql);
fs.copyFileSync(path.join(repoDir, 'user-story', 'test-cases', 'golden-cases.json'), path.join(webDir, 'src', 'domain', 'fixtures', 'golden-cases.json'));
console.log(`seed: ${out.length} statements`);

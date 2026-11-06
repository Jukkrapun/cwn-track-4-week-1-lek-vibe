/* eslint-disable */
// สร้าง e2e/index.html (ไฟล์เดียว เปิดด้วยดับเบิลคลิก) จาก test-report/runs/*.json + TEST-PLAN.md + triage.json
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const REPORT = path.join(ROOT, 'test-report');
const RUNS = path.join(REPORT, 'runs');
const PLAN = path.resolve(ROOT, '..', 'TEST-PLAN.md');
const TRIAGE = path.join(ROOT, 'triage.json');
const OUT = path.join(ROOT, 'index.html');
const BROWSERS = ['chromium', 'firefox', 'webkit'];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const md = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const strip = (s) => String(s ?? '').replace(/\u001b\[[0-9;]*m/g, '');

function loadPlan() {
  const cases = [];
  for (const line of fs.readFileSync(PLAN, 'utf8').split(/\r?\n/)) {
    const m = /^\|\s*(?:✚\s*)?(TC-[A-Z]+-\d+)\s*\|/.exec(line);
    if (!m) continue;
    const cols = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cols.length < 9) continue;
    cases.push({ id: m[1], module: cols[1], what: cols[2], priority: cols[5], expected: cols[7], source: cols[8] });
  }
  return cases;
}

function flattenSpecs(suite, out = []) {
  for (const spec of suite.specs || []) out.push(spec);
  for (const s of suite.suites || []) flattenSpecs(s, out);
  return out;
}

/** อ่านผลรอบหนึ่ง → { id, meta, results: {browser: {TC: {...}}} } */
function loadRun(file) {
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const id = path.basename(file, '.json');
  const metaFile = path.join(RUNS, `${id}.meta.json`);
  const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};
  const results = {};
  for (const spec of json.suites.flatMap((s) => flattenSpecs(s))) {
    const tc = (/^(TC-[A-Z]+-\d+)/.exec(spec.title) || [])[1];
    if (!tc) continue;
    for (const t of spec.tests) {
      const r = t.results[t.results.length - 1] || {};
      const errors = (r.errors || []).map((e) => strip(e.message).split('\n').slice(0, 4).join('\n'));
      (results[t.projectName] ||= {})[tc] = {
        status: r.status === 'passed' ? 'passed' : r.status || 'notrun',
        duration: r.duration,
        errors,
        evidence: (t.annotations || []).filter((a) => a.type === 'หลักฐาน').map((a) => a.description),
      };
    }
  }
  return { id, meta, startedAt: meta.startedAt || json.stats?.startTime, gif: id.startsWith('gif-'), results };
}

function summarize(plan, res = {}) {
  const p1 = plan.filter((c) => c.priority === 'P1');
  const passed = plan.filter((c) => res[c.id]?.status === 'passed');
  const p1Passed = p1.filter((c) => res[c.id]?.status === 'passed');
  const need = Math.ceil(plan.length * 0.95);
  const ran = plan.filter((c) => res[c.id]).length;
  return {
    total: plan.length, ran, passed: passed.length, failed: plan.length - passed.length,
    p1Total: p1.length, p1Passed: p1Passed.length, need,
    x1: p1Passed.length === p1.length, x2: passed.length >= need,
    ok: p1Passed.length === p1.length && passed.length >= need,
  };
}

function build() {
  const plan = loadPlan();
  const runFiles = fs.existsSync(RUNS) ? fs.readdirSync(RUNS).filter((f) => f.endsWith('.json') && !f.endsWith('.meta.json')) : [];
  const runs = runFiles.map((f) => loadRun(path.join(RUNS, f))).sort((a, b) => String(a.startedAt).localeCompare(String(b.startedAt)));
  const fullRuns = runs.filter((r) => !r.gif && r.id.startsWith('run-'));
  const latest = fullRuns[fullRuns.length - 1];
  const previous = fullRuns[fullRuns.length - 2];
  const triage = fs.existsSync(TRIAGE) ? JSON.parse(fs.readFileSync(TRIAGE, 'utf8')) : { items: [] };
  const triageOf = (tc, browser) => (triage.items || []).find((t) => t.tc === tc && (!t.browsers || t.browsers.includes(browser)));
  const bugMode = latest?.meta?.bugMode ?? 'unknown';
  const media = (tc, kind) => {
    const rel = kind === 'gif' ? `test-report/gifs/${tc}.gif` : `test-report/videos/${tc}.mp4`;
    return fs.existsSync(path.join(ROOT, rel)) ? rel : null;
  };
  const log = (tc, browser) => {
    const rel = `test-report/logs/${tc}-${browser}.log`;
    return fs.existsSync(path.join(ROOT, rel)) ? rel : null;
  };

  const cards = BROWSERS.map((b) => {
    const s = summarize(plan, latest?.results[b]);
    return `<section class="card ${s.ok ? 'ok' : 'bad'}">
      <div class="card-head"><span class="browser">${b}</span><span class="verdict">${s.ok ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์'}</span></div>
      <div class="big">${s.passed}<small>/${s.total}</small></div>
      <ul class="crit">
        <li class="${s.x1 ? 'y' : 'n'}">X-1 P1 ผ่านทั้งหมด: <b>${s.p1Passed}/${s.p1Total}</b></li>
        <li class="${s.x2 ? 'y' : 'n'}">X-2 ผ่านรวม ≥ 95%: <b>${s.passed}/${s.total}</b> (ต้อง ≥ ${s.need})</li>
        <li>รันจริง ${s.ran}/${s.total} · ไม่ได้รัน/ล้มนับเป็นไม่ผ่าน</li>
      </ul></section>`;
  }).join('');

  const statusCell = (tc, b) => {
    const r = latest?.results[b]?.[tc];
    if (!r) return `<td class="st notrun">ไม่ได้รัน</td>`;
    const t = r.status === 'passed' ? null : triageOf(tc, b);
    const changed = previous && previous.results[b]?.[tc] && previous.results[b][tc].status !== r.status ? ' <span class="flaky" title="ผลต่างจากรอบก่อน">≠รอบก่อน</span>' : '';
    const label = r.status === 'passed' ? '✓ ผ่าน' : '✗ ล้ม';
    const tri = t ? `<span class="tri tri-${esc(t.category)}">${esc(t.category)}</span>` : r.status === 'passed' ? '' : '<span class="tri">ยังไม่จำแนก</span>';
    const lg = log(tc, b);
    return `<td class="st ${r.status === 'passed' ? 'pass' : 'fail'}">${label}${changed}${tri}${lg ? ` <a href="${lg}">log</a>` : ''}</td>`;
  };

  const rows = plan.map((c) => {
    const gif = media(c.id, 'gif');
    const mp4 = media(c.id, 'mp4');
    const failures = BROWSERS.map((b) => ({ b, r: latest?.results[b]?.[c.id] })).filter((x) => x.r && x.r.status !== 'passed');
    const detail = failures.length
      ? `<details><summary>รายละเอียดที่ล้ม</summary>${failures.map(({ b, r }) => {
          const t = triageOf(c.id, b);
          return `<div class="fx"><b>${b}</b>${t ? ` — <span class="tri tri-${esc(t.category)}">${esc(t.category)}</span> ${md(t.reason)}` : ''}
            ${r.evidence.length ? `<div class="ev">หลักฐาน: ${r.evidence.map(esc).join(' · ')}</div>` : ''}
            <pre>${esc(r.errors.join('\n---\n')).slice(0, 1500)}</pre></div>`;
        }).join('')}</details>`
      : '';
    return `<tr data-p="${esc(c.priority)}">
      <td class="id">${esc(c.id)}</td>
      <td>${md(c.what)}<div class="exp">คาดหวัง: ${md(c.expected)}</div>${detail}</td>
      <td><span class="pri pri-${esc(c.priority)}">${esc(c.priority)}</span></td>
      <td>${esc(c.source)}</td>
      ${BROWSERS.map((b) => statusCell(c.id, b)).join('')}
      <td class="media">${gif ? `<a href="${gif}">GIF</a>` : '—'} ${mp4 ? `<a href="${mp4}">MP4</a>` : ''}</td>
    </tr>`;
  }).join('');

  const runRows = runs.map((r) => {
    const cells = BROWSERS.map((b) => {
      if (!r.results[b]) return '<td>—</td>';
      const s = summarize(plan, r.results[b]);
      return `<td>${s.passed} ผ่าน / ${s.ran - s.passed} ล้ม ${s.ok ? '<span class="y">✓ผ่านเกณฑ์</span>' : '<span class="n">✗ไม่ผ่านเกณฑ์</span>'}</td>`;
    }).join('');
    return `<tr><td><code>${esc(r.id)}</code></td><td>${r.gif ? 'GIF (chromium ช้า)' : r.id.startsWith('sleep-') ? 'ไม่นับ (เครื่องพักกลางรัน)' : 'ปกติ'}</td><td>${esc(r.meta.bugMode ?? '?')}</td>${cells}</tr>`;
  }).join('');

  const stableNote = previous
    ? (() => {
        const diffs = [];
        for (const b of BROWSERS) for (const c of plan) {
          const a = previous.results[b]?.[c.id]?.status;
          const z = latest.results[b]?.[c.id]?.status;
          if (a && z && a !== z) diffs.push(`${c.id} (${b}: ${a} → ${z})`);
        }
        return diffs.length ? `<p class="n">ผลไม่นิ่งระหว่าง 2 รอบล่าสุด: ${diffs.map(esc).join(', ')}</p>` : '<p class="y">ผล 2 รอบล่าสุดตรงกันทุกข้อทุกเบราว์เซอร์ (นิ่ง)</p>';
      })()
    : '<p>มีผลรอบเดียว ยังเทียบความนิ่งไม่ได้</p>';

  const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ผลทดสอบ E2E</title>
<style>
:root{--bg:#f6f5f2;--fg:#1d1b22;--muted:#6b6576;--card:#fff;--line:#e3dfe8;--ok:#127a46;--okbg:#e5f6ec;--bad:#b42335;--badbg:#fdecee;--accent:#6b3fd6;--warn:#9a6200;--warnbg:#fff4dc}
@media (prefers-color-scheme:dark){:root{--bg:#141219;--fg:#ece8f3;--muted:#a49db3;--card:#1e1b26;--line:#332e3f;--ok:#4cd391;--okbg:#14301f;--bad:#ff8094;--badbg:#3a1820;--accent:#b49bff;--warn:#f1c062;--warnbg:#3a2c0e}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.55 "Sarabun","Noto Sans Thai",system-ui,sans-serif}
main{max-width:1280px;margin:0 auto;padding:28px 16px 60px}h1{font-size:28px;margin:0 0 4px}h2{margin:36px 0 12px;font-size:20px}
.sub{color:var(--muted);margin:0 0 18px}.mode{display:inline-block;padding:3px 10px;border-radius:999px;font-weight:700;font-size:13px;margin-left:8px;vertical-align:middle}
.mode-0{background:var(--okbg);color:var(--ok)}.mode-1{background:var(--warnbg);color:var(--warn)}.mode-unknown{background:var(--line)}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}
.card{background:var(--card);border:1px solid var(--line);border-left:6px solid var(--bad);border-radius:12px;padding:16px}
.card.ok{border-left-color:var(--ok)}.card-head{display:flex;justify-content:space-between;align-items:center}
.browser{font-weight:700;text-transform:capitalize}.verdict{font-weight:800;padding:2px 10px;border-radius:999px;background:var(--badbg);color:var(--bad)}
.card.ok .verdict{background:var(--okbg);color:var(--ok)}.big{font-size:38px;font-weight:800;margin:6px 0}.big small{font-size:18px;color:var(--muted)}
.crit{margin:0;padding-left:18px;font-size:14px}.y{color:var(--ok)}.n{color:var(--bad)}
.tablewrap{overflow-x:auto;border:1px solid var(--line);border-radius:12px;background:var(--card)}
table{border-collapse:collapse;width:100%;min-width:900px}th,td{padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top;text-align:left;font-size:14px}
th{position:sticky;top:0;background:var(--card);font-size:13px;color:var(--muted)}td.id{font-weight:700;white-space:nowrap}
.exp{color:var(--muted);font-size:12.5px;margin-top:4px}.st{white-space:nowrap}.st.pass{color:var(--ok);font-weight:700}.st.fail{color:var(--bad);font-weight:700}.st.notrun{color:var(--muted)}
.tri{display:block;font-size:12px;font-weight:700;margin-top:3px;color:var(--warn)}.tri-เว็บผิด{color:var(--bad)}.tri-แผนผิด{color:var(--accent)}
.flaky{font-size:11px;color:var(--warn)}.pri{font-weight:800;padding:1px 8px;border-radius:6px;background:var(--line)}.pri-P1{background:var(--badbg);color:var(--bad)}
.media a,.st a{color:var(--accent)}details{margin-top:6px}summary{cursor:pointer;color:var(--accent);font-size:13px}
pre{white-space:pre-wrap;font-size:12px;background:var(--bg);padding:8px;border-radius:8px;margin:6px 0}.fx{margin-top:6px}.ev{font-size:12.5px;margin-top:4px}
code{font-size:12.5px}.filters{margin:8px 0;display:flex;gap:6px;flex-wrap:wrap}.filters button{border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:999px;padding:4px 12px;cursor:pointer}
.filters button[aria-pressed=true]{background:var(--accent);color:#fff;border-color:var(--accent)}
</style></head><body><main>
<h1>ผลทดสอบ E2E — LekVibe <span class="mode mode-${esc(bugMode)}">BUG_MODE=${esc(bugMode)}</span></h1>
<p class="sub">ตามเกณฑ์ TEST-PLAN.md หัวข้อ 6 · ตัดสินแยกทีละเบราว์เซอร์ · รอบล่าสุด <code>${esc(latest?.id ?? '-')}</code> · เวลาเว็บล็อกที่ ${esc(latest?.meta?.lockNow ?? '-')}</p>
<div class="cards">${cards}</div>
<h2>ทุก Test case (${plan.length} ข้อ)</h2>
<div class="filters" role="group" aria-label="กรอง"><button data-f="all" aria-pressed="true">ทั้งหมด</button><button data-f="fail" aria-pressed="false">เฉพาะที่ล้ม</button><button data-f="P1" aria-pressed="false">P1</button></div>
<div class="tablewrap"><table><thead><tr><th>รหัส</th><th>สิ่งที่ทดสอบ</th><th>ระดับ</th><th>ที่มา</th>${BROWSERS.map((b) => `<th>${b}</th>`).join('')}<th>หลักฐาน</th></tr></thead><tbody>${rows}</tbody></table></div>
<h2>ทุกรอบที่รัน (เทียบความนิ่ง)</h2>${stableNote}
<div class="tablewrap"><table><thead><tr><th>รอบ</th><th>ชนิด</th><th>BUG_MODE</th>${BROWSERS.map((b) => `<th>${b}</th>`).join('')}</tr></thead><tbody>${runRows}</tbody></table></div>
<p class="sub">การจำแนกข้อที่ล้มอ่านจาก <code>e2e/triage.json</code> · ข้อ "แผนผิด" ยังนับเป็นล้มจนกว่าจะแก้แผน · สร้างเมื่อ ${esc(new Date().toISOString())}</p>
</main><script>
document.querySelectorAll('.filters button').forEach(function(b){b.addEventListener('click',function(){
document.querySelectorAll('.filters button').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});
var f=b.getAttribute('data-f');document.querySelectorAll('tbody tr[data-p]').forEach(function(tr){
var show=f==='all'||(f==='P1'&&tr.getAttribute('data-p')==='P1')||(f==='fail'&&tr.querySelector('.st.fail,.st.notrun'));tr.style.display=show?'':'none'})})});
</script></body></html>`;
  fs.writeFileSync(OUT, html, 'utf8');
  process.stdout.write(`เขียน ${OUT}\n`);
}

build();

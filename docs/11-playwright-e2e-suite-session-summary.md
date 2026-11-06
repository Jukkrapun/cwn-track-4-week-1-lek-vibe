# สรุป Session — สร้างชุดทดสอบ Playwright E2E (`e2e/`) จาก TEST-PLAN.md และรายงาน `e2e/index.html`

> **วันที่:** 2026-11-06 ถึง 2026-11-07 · **อินพุต:** [`TEST-PLAN.md`](../TEST-PLAN.md) v0.2 (45 TC) จาก [session 06](06-test-plan-completion-and-review-session-summary.md), `test-data/test-data.md` (แทน TEST-DATA.md), [`web/SPEC.md`](../web/SPEC.md) (testid / API / error), [`TEST-RUN-1.md`](../TEST-RUN-1.md) + [`EXPLORATION.md`](../EXPLORATION.md) (ผลที่เคยเจอ LAB 8–9)
> **ผลลัพธ์:** โฟลเดอร์ [`e2e/`](../e2e/) (Playwright TypeScript 45 test × 3 เบราว์เซอร์) · [`e2e/index.html`](../e2e/index.html) · [`e2e/triage.json`](../e2e/triage.json) · เพิ่มหัวข้อ "ชุดทดสอบ E2E" ใน [`CLAUDE.md`](../CLAUDE.md)
> **ข้อจำกัดที่ทำตาม:** ไม่แก้โค้ดใน `web/` และ `db/` · ไม่เปิด `web/BUGS.md` และ `_solution/` · ไม่แก้ผลที่คาดหวังให้ผ่าน · ยังไม่ได้ commit

## 1. คำขอ

0. เช็ก `node -v`, `ffmpeg -version`, `/api/health` ก่อน — ไม่พร้อมให้หยุด
1. `playwright.config`: chromium / firefox / webkit · `th-TH` · `Asia/Bangkok` · `GIF=1` อัดวิดีโอช้าเฉพาะ chromium
2. `global-setup`: เช็ก health · อ่าน `data-bug-mode` · reset พร้อมวันล็อก · reset ก่อนทุก test (fixture) · `workers: 1`
3. test ครบหัวข้อ 5 (ชื่อขึ้นต้นด้วยรหัส TC, แยกไฟล์ตามโมดูล, tag `@โมดูล @P1|P2|P3`, annotation ผลที่คาดหวัง + ที่มา, `test.step` ภาษาไทย, `expect.soft`, testid จาก SPEC, "กดซ้ำ" = คลิก 2 ครั้งจริง, ผล LAB 8–9 ต้องเจอซ้ำ)
4. หลักฐาน: GIF + MP4 ต่อ TC ที่เปิดหน้าเว็บ (ป้ายชื่อซ้ายล่าง + วงแดงจุดคลิก) · test API อย่างเดียวบันทึก log
5. รายงานหน้าเดียว `e2e/index.html` (เกณฑ์หัวข้อ 6 แยกเบราว์เซอร์ · ป้าย BUG_MODE · ตารางทุก TC · การจำแนกจาก `triage.json`)
6. เขียน 2 test แรกให้ผ่าน + ได้ GIF/MP4 ก่อน · 7. เขียน CLAUDE.md · รันซ้ำเช็กความนิ่ง · จำแนกข้อที่ล้ม

## 2. ขั้นตอนที่ทำ

| ขั้น | สิ่งที่ทำ | ผล |
| --- | --- | --- |
| 0 | เช็กสภาพแวดล้อม | node v24.22.1 ✅ · health `{"ok":true,"db":true}` ✅ · **ffmpeg ไม่มี → หยุดแจ้งผู้ใช้** |
| 0.1 | ติดตั้ง ffmpeg (ผู้ใช้ขอ) — เครื่องไม่มี winget จึงดาวน์โหลด BtbN build | `%LOCALAPPDATA%\ffmpeg\ffmpeg-master-latest-win64-gpl\bin` + เพิ่ม PATH ผู้ใช้ · ชุดทดสอบใช้ path เต็ม (ตั้ง `$env:FFMPEG` ทับได้) |
| 1 | สร้างโปรเจกต์ `e2e/` (`@playwright/test` 1.56.1, TS) + ติดตั้ง 3 เบราว์เซอร์ | — |
| 2 | ดูรูปร่าง API/หน้าเว็บ (curl/node) — stats, rule-sets, diff, audit, plate birthDay | ใช้ตั้ง helper |
| 3 | เขียน support (env/plan/api/fixtures/pages/helpers/overlay/media) + TC-PH-01, TC-PH-02 | ผ่าน 2/2 · ได้ GIF+MP4 · ตรวจเฟรมวิดีโอเห็นป้ายชื่อและวงแดง |
| 4 | เขียนที่เหลือ 43 TC | Chromium รอบแรก 44/45 |
| 5 | รันเต็ม 3 เบราว์เซอร์ 5 รอบ + รอบ GIF · ดูภาพ/log ของข้อที่ล้ม · แก้ test ที่เขียนผิด · บันทึก triage | ดูข้อ 4–5 |
| 6 | เขียน `scripts/build-report.js` → `index.html` + หัวข้อ E2E ใน CLAUDE.md | — |

## 3. โครงสร้างที่สร้าง

| ไฟล์ | หน้าที่ |
| --- | --- |
| `playwright.config.ts` | 3 projects · `workers: 1` · timeout 60s (GIF 180s) · reporter `list` + `json` → `test-report/runs/<RUN_ID>.json` (แยกไฟล์ทุกรอบ) · GIF=1 → chromium อย่างเดียว `video: on`, `slowMo: 400` · Chromium ปิด `--hide-scrollbars` |
| `global-setup.ts` | Entry E-3/E-4 · อ่าน `data-bug-mode` · เขียน `<RUN_ID>.meta.json` |
| `support/plan.ts` | อ่านตาราง TC จาก TEST-PLAN.md → title / tag / annotation (ผลที่คาดหวังจากแผนโดยตรง) |
| `support/fixtures.ts` | reset auto ก่อนทุก test · `api` (log ต่อ TC/เบราว์เซอร์) · ฉีด overlay + แปลงวิดีโอเมื่อ GIF=1 |
| `support/pages.ts` | `analyzePhone`/`analyzePlate` รอ response + ปุ่มกลับมาใช้ได้ + ผล/ข้อผิดพลาด (ไม่รอค่าเฉพาะ) · `readPairs` · `uiLogin` |
| `support/api.ts`, `helpers.ts` | client ต่อผู้ใช้ (cookie แยก) · payload AD-D01/AD-C01 · stats / versions / audit |
| `support/overlay.ts`, `media.ts` | ป้ายชื่อผูกกับ `<html>` (ไม่ปนใน `body.innerText` ของ TC-UI-03) · ffmpeg → `gifs/<TC>.gif`, `videos/<TC>.mp4` |
| `tests/*.spec.ts` | phone 9 · plate 10 · content 4 · auth 5 · admin 9 · security 5 · ui 3 = **45** |
| `scripts/build-report.js` | `npm run report` → `index.html` (ไฟล์เดียว, ไม่ต้องมี server) |

การตัดสินใจสำคัญ:

- **"กดซ้ำ"** (TC-PH-09, TC-AD-05) ใช้ `page.mouse.click` 2 ครั้งติดกันที่กลางปุ่ม แล้วนับ request / stats / Audit จากระบบ
- **TC-AD-08** ยิง AD-C03 (`ruleRef: not-exist`) ก่อนสร้าง AD-C01 เพื่อไม่ให้ id ซ้ำบัง error ที่ต้องการตรวจ
- **TC-AD-05** ส่วน "Publish ก่อน Approve" reset กลางเทสต์ เพราะระบบเปิด Draft ได้ 1 ชุดต่อ Rule Set
- **TC-UI-01** เปิด scrollbar ใน Chromium (headless ซ่อนโดยปริยาย) ให้เหมือน Chrome ตอนสำรวจ และเทียบ `scrollWidth` กับ `clientWidth`

## 4. ผลรันทุกรอบ (BUG_MODE=0)

| รอบ | chromium | firefox | webkit |
| --- | --- | --- | --- |
| 1 | 44 / 1 ✅ | 43 / 2 ❌ | 43 / 2 ❌ |
| 2 | 43 / 2 ❌ | 43 / 2 ❌ | 43 / 2 ❌ |
| 3 (หลังแก้ TC-UI-01) | 43 / 2 ❌ | 44 / 1 ❌ | 43 / 2 ❌ |
| 4 | ไม่นับ — เครื่องพักกลางรัน (3.3 ชม.) · เก็บเป็น `sleep-run-…` | | |
| 5 | 44 / 1 ✅ | 45 / 0 ✅ | 45 / 0 ✅ |
| GIF (chromium ช้า) | 43 / 2 ✅ (ล้มแต่ P2) | — | — |

เกณฑ์ (TEST-PLAN §6.2): P1 19/19 และผ่าน ≥ 43/45 · ❌ ทุกครั้งเกิดจาก TC-AD-05 (P1)
**ผลไม่นิ่ง** — รายงานใช้รอบล่าสุด (5) ตัดสิน จึงขึ้น "ผ่านเกณฑ์" ทั้ง 3 เบราว์เซอร์ แต่ข้อเสนอคือถือ TC-AD-05 เป็น P1 ล้มจนกว่าเว็บจะแก้ race

หลักฐาน: **GIF 24 · MP4 24** (ทุก TC ที่เปิดหน้าเว็บ) · log สำหรับ TC ที่ยิง API อย่างเดียว 21 ข้อ

## 5. การจำแนกข้อที่ล้ม (บันทึกใน `triage.json`)

| TC | เบราว์เซอร์ | จำแนก | เหตุผล / หลักฐาน |
| --- | --- | --- | --- |
| TC-AD-05 (P1) | ทั้ง 3 | **เว็บผิด** | คลิก Approve 2 ครั้ง → `200, 200` และ Audit APPROVED 2 แถว · Approve ซ้ำแบบเรียงผ่าน API ได้ 409 ถูกต้อง → เป็น race ล้มรอบ 1–3 ผ่านรอบ 5 |
| TC-PH-09 | ทั้ง 3 | **เว็บผิด** | คลิก 2 ครั้ง → POST 2 ครั้ง, stats +2 · ล้มตามจังหวะ (FF รอบ 1–2, WK รอบ 3, Chromium รอบ GIF) |
| TC-UI-01 | chromium | **เว็บผิด** | 360px หน้าแรก scrollWidth 347 > clientWidth 345 — ตรงกับ TEST-RUN-1 (ผล LAB เจอซ้ำ) ล้มทุกรอบ |
| TC-UI-01 | webkit (รอบ 1–2) | **test เขียนผิด → แก้แล้ว** | วัดขณะผลยังเล่น animation (ค่าแกว่ง 370/383/390…) · แก้ให้รอ animation แบบจบได้ก่อนวัด ค่าคาดหวังไม่เปลี่ยน |
| TC-AD-08, TC-AU-01 | webkit (รอบ 4) | สภาพแวดล้อม (ไม่นับ) | เครื่องพัก test ใช้ 1.5 ชม. |

ไม่มีข้อที่จำแนกว่า "แผนผิด"

## 6. สิ่งที่แก้ระหว่างทาง (test เขียนผิดจริงเท่านั้น)

| เรื่อง | ก่อน | หลัง |
| --- | --- | --- |
| TC-UI-01 วัดผิดค่า | เทียบกับ `innerWidth` + headless ไม่มี scrollbar → ผ่านทั้งที่ LAB เคยเจอบั๊ก | เทียบ `clientWidth` + เปิด scrollbar Chromium → เจอ 347/345 ซ้ำ |
| TC-UI-01 จังหวะวัด | วัดทันทีหลังผลขึ้น | รอ animation แบบจบได้ก่อน |
| `analyzePhone`/`analyzePlate` | รอ response เสมอ (ค้างถ้าหน้าเว็บตรวจเองไม่ส่งคำขอ) | รอ response ถ้ามี (≤ 5s) + ปุ่มกลับมาใช้ได้ แล้วรอผลหรือ error ตามสถานะ |
| TC-AD-05 หลักฐาน | ไม่เห็นค่า status | เพิ่ม annotation "หลักฐาน" (approve responses, จำนวน APPROVED) ลงรายงาน |

## 7. ไฟล์ที่แก้/สร้าง

- ใหม่: `e2e/` ทั้งโฟลเดอร์ (`package.json`, `tsconfig.json`, `.gitignore`, `playwright.config.ts`, `global-setup.ts`, `support/*`, `tests/*`, `scripts/build-report.js`, `triage.json`, `index.html`)
- ใหม่ (ไม่ commit): `e2e/test-report/` (runs, artifacts, logs, gifs, videos)
- แก้: `CLAUDE.md` — เพิ่มหัวข้อ "ชุดทดสอบ E2E" (โครงสร้าง, คำสั่ง db/web/BUG_MODE, วิธีเขียน test ใหม่)
- นอก repo: ติดตั้ง ffmpeg ที่ `%LOCALAPPDATA%\ffmpeg` + PATH ผู้ใช้

> หมายเหตุ: หลังจบ session นี้ `e2e/triage.json` ถูกแก้เพิ่มจากที่อื่น (มีรายการโหมดบั๊ก เช่น TC-LP-02 "ล้มใหม่ในโหมดบั๊ก") — เนื้อหานั้นไม่ได้มาจาก session นี้

## 8. งานถัดไป

1. ตัดสินว่ารายงานควรถือ TC-AD-05 เป็นล้ม (แนะนำ) หรือใช้รอบล่าสุด — ถ้าถือเป็นล้ม ให้ปรับ `build-report.js` ให้ตัดสินจาก "รอบที่แย่ที่สุด" หรือรวมหลายรอบ
2. แจ้งทีมเว็บ 3 บั๊ก: Approve race (P1), วิเคราะห์ส่งซ้ำ (P2), การ์ดหน้าแรกล้น 2px ที่ 360px (P2)
3. รันชุดเดิมใน `BUG_MODE=1` แล้วจำแนกเพิ่มใน `triage.json` → `npm run report`
4. Commit `e2e/` + CLAUDE.md (ยังไม่ได้ commit)

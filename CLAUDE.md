# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ภาพรวม

Repository ของ Web Application "ระบบเลขมงคลและทะเบียนรถมงคล" (ชื่อผลิตภัณฑ์ **LekVibe** — เดิม "เลขมงคล · Mongkol Number"; ชื่อทางเทคนิค `mongkol-*` คงเดิม) — มีเอกสาร User Story/Requirement/Design, **โค้ด MVP Phase 1** (14 Stories) ใน `db/` + `web/` และชุดทดสอบ (แผน, ผลรัน, Playwright E2E ใน `e2e/`, ล่าบั๊ก BUG_MODE) เอกสารทั้งหมดเขียนเป็นภาษาไทย ให้เขียนเอกสารใหม่เป็นภาษาไทยเช่นกัน

## โค้ด (MVP Phase 1)

สถาปัตยกรรม: Next.js 16 (App Router, TS strict) full-stack + PostgreSQL 16 (ไลบรารี `pg`, SQL parameterized, ไม่ใช้ ORM) แยก 2 Docker project คุยกันผ่าน network `mongkol-net`

- `db/` — `docker-compose.yml` (container `mongkol-db`, พอร์ต 5433, volume `mongkol-pgdata`), `init/01-schema.sql` (ตาราง ERD + Invariant I-1..I-9 เป็น constraint/trigger), `init/02-seed.sql` (**generated**)
- `web/src/domain/` — pure function (normalize/validate/pairs/sums/birthday/patterns/precedence/recommendation) ไม่มี I/O · `web/src/infrastructure/` — Repository (pg) · `web/src/application/` — service (analysis, identity, rule-management, category, test-reset) · `web/src/shared/` — http envelope, clock `now()`, rate limit, logger (mask), runtime profile · `web/app/` — หน้าเว็บ + Route Handlers `/api/v1/*`
- State ระดับ process (นาฬิกา, rate limit) ต้องเก็บผ่าน `src/shared/process-state.ts` (globalThis) เพราะ Next โหลดโมดูลแยกตาม route
- เวลา: ทุกโค้ดอ่านผ่าน `now()` (`src/shared/clock.ts`) ห้าม `Date.now()` ตรง ๆ
- Seed: แก้ `user-story/reference-data/*.json` หรือ `web/content/articles/*.md` แล้วรัน `npm run gen:seed` (เขียนทั้ง `db/init/02-seed.sql` และ `web/sql/seed.sql`, คัดลอก golden-cases)
- เอกสารโค้ด: `web/SPEC.md` (หน้า/testid/error/API/env), `web/ASSETS.md`, `web/BUGS.md` (เฉลย BUG_MODE — ห้ามอ้างในที่อื่น)

คำสั่ง (PowerShell, ในโฟลเดอร์ `web/`):

```powershell
npm install; npm run build; npm test; npm run lint; npm run typecheck   # vitest: unit + Golden cases
docker network create mongkol-net                                        # ครั้งแรก
cd ..\db; docker compose up -d; cd ..\web; docker compose up -d --build  # db ต้อง healthy ก่อน
Invoke-RestMethod -Method Post http://localhost:3000/api/test/reset     # ล้างเป็น seed + ล็อกเวลา 2026-11-06T09:00+07:00
pwsh -File tests\api\verify-api.ps1                                      # ตรวจกฎตาม TEST-DATA ผ่าน API (172 ข้อ)
npx vitest run tests/unit/plate.test.ts -t "LD-S"                        # รันเทสต์เดี่ยว
```

ถ้า schema เปลี่ยน ต้องลบ volume ก่อน: `cd db; docker compose down -v; docker compose up -d`

## ชุดทดสอบ E2E (`e2e/` — Playwright TypeScript)

สร้างจาก `TEST-PLAN.md` หัวข้อ 5 (48 TC) · **ห้ามแก้โค้ดใน `web/` และ `db/` · ห้ามเปิด `web/BUGS.md` และ `_solution/`**

```text
e2e/
├── playwright.config.ts   # chromium/firefox/webkit · th-TH · Asia/Bangkok · workers 1 · GIF=1 = chromium อัดวิดีโอช้า
├── global-setup.ts        # เช็ก /api/health · อ่าน data-bug-mode · reset · เขียน test-report/runs/<RUN_ID>.meta.json
├── support/
│   ├── env.ts             # BASE_URL, LOCK_NOW (2026-11-06T09:00+07:00), USERS, path ffmpeg
│   ├── plan.ts            # อ่านตาราง TC จาก TEST-PLAN.md → title / tag / annotation (ผลที่คาดหวัง + ที่มา)
│   ├── fixtures.ts        # test/expect: reset ก่อนทุก test (auto) · api (log) · ป้ายชื่อ + วงแดง + แปลงวิดีโอ (GIF=1)
│   ├── api.ts             # ApiLog/ApiClient — cookie แยกต่อผู้ใช้ · log ลง test-report/logs/<TC>-<browser>.log
│   ├── pages.ts           # analyzePhone/analyzePlate (รอหน้าเว็บคิดเสร็จ), readPairs, uiLogin
│   ├── helpers.ts         # payload AD-D01/AD-C01, stats, versions, audit
│   ├── overlay.ts, media.ts  # ป้าย/วงแดง · ffmpeg → gifs/<TC>.gif + videos/<TC>.mp4
├── tests/<โมดูล>.spec.ts  # phone · plate · content · auth · admin · security · ui (1 test = 1 TC)
├── scripts/build-report.js  # → e2e/index.html (ไฟล์เดียว เปิดด้วยดับเบิลคลิก)
├── triage.json            # การจำแนกข้อที่ล้ม: เว็บผิด / แผนผิด / test เขียนผิด
└── test-report/           # runs/*.json (ทุกรอบ), artifacts/, logs/, gifs/, videos/ (git ignore)
```

เปิดระบบ + BUG_MODE (PowerShell):

```powershell
docker network create mongkol-net                                  # ครั้งแรก
cd db;  docker compose up -d                                       # รอ mongkol-db (healthy)
cd ..\web; $env:BUG_MODE='0'; docker compose up -d --build          # BUG_MODE=1 เปิดบั๊กฝึกทดสอบ (ต้อง up ใหม่ทุกครั้งที่เปลี่ยน)
Invoke-RestMethod http://localhost:3000/api/health                  # ต้องได้ ok=true, db=true
(Invoke-WebRequest http://localhost:3000 -UseBasicParsing).Content -match 'data-bug-mode="(\d)"' | Out-Null; $Matches[1]  # ดูโหมดปัจจุบัน
```

รันทดสอบ (ในโฟลเดอร์ `e2e/`):

```powershell
npm install; npx playwright install
npx playwright test                         # 3 เบราว์เซอร์ — ทุกรอบเก็บ test-report/runs/run-*.json แยกไฟล์
npx playwright test --project=chromium -g "TC-PH-01"   # รันข้อเดียว
npm run test:gif                            # chromium ช้า + วิดีโอ → test-report/gifs, videos (ต้องมี ffmpeg; ตั้ง $env:FFMPEG ได้)
npm run report                              # สร้าง e2e/index.html ใหม่ (อ่าน runs + triage.json)
```

วิธีเขียน test ใหม่:

1. เพิ่ม/แก้แถว TC ใน `TEST-PLAN.md` ก่อน (ผลที่คาดหวังมาจากแผนเท่านั้น — ห้ามแก้ตามที่เว็บแสดง)
2. ในไฟล์ `tests/<โมดูล>.spec.ts`: `const t = tc('TC-XX-NN'); test(t.title, t.details, async ({ page, api }) => { ... })` — ชื่อ/tag `@โมดูล @P1|P2|P3`/annotation มาจากแผนอัตโนมัติ
3. import `test, expect` จาก `support/fixtures` (ได้ reset ก่อนทุก test) · หา element ด้วย `data-testid` จาก `web/SPEC.md` · แบ่งขั้นตอนด้วย `test.step('ภาษาไทย')` · ตรวจด้วย `expect.soft`
4. ค่าที่มาจาก API ให้รอหน้าเว็บคิดเสร็จ (`analyzePhone`/`analyzePlate` รอ response + ปุ่มกลับมาใช้ได้) ไม่ใช้ `waitForTimeout` และห้ามรอจนได้ค่าที่อยากได้
5. "กดซ้ำ" = `page.mouse.click` 2 ครั้งติดกัน แล้วนับผลในระบบ (request/stats/audit) · ต่อผู้ใช้ใช้ `api.as('admin')` (cookie แยก)
6. test ที่ใช้ `page` ได้ GIF/MP4 อัตโนมัติในโหมด GIF · test ที่ใช้แต่ `api` ได้ log อัตโนมัติ
7. ข้อที่ล้ม: ดูภาพ/GIF/log ก่อน → บันทึก `triage.json` → `npm run report` · แก้ได้เฉพาะ test ที่เขียนผิดจริง

## โครงสร้างเอกสาร

ลำดับความน่าเชื่อถือ (ถ้าขัดกันให้ยึดไฟล์ที่อยู่ก่อน): `requirement/` → `test-data/` → `design/` → `user-story/reference-data/` → `web/SPEC.md`

- `requirement/system-requirements.md` — SRS v1.0 (FR/BR/NFR, ค่าขอบ §4, ข้อความ Output/Error §5 คำต่อคำ)
- `test-data/test-data.md` — Test Data v1.1 (seed + ค่าที่คาดหวัง; คู่เลขมาจาก decoder159.com)
- `design/` — architecture (ADR-001–006), use-case, flowchart, sequence, erd (15 Entity + Invariants)
- `user-story/reference-data/*.json` — ค่ากฎ/คู่เลข/หมวด (แหล่งของ seed) · `user-story/test-cases/` — golden-cases.json + playwright-test-cases.md
- `research/decoder159/` — สคริปต์ดึง/สร้างความหมายคู่เลขและ regenerate golden
- `BUILD-PROMPT.md` — prompt สร้าง `db/` + `web/` ใหม่ทั้งหมด
- งานทดสอบ (ตามลำดับ): `EXPLORATION.md` (สำรวจเว็บ, ภาพใน `exploration/`) → `TEST-PLAN.md` (v0.2, 48 TC) → `PLAN-REVIEW.md` → `TEST-RUN-1.md` (รันมือผ่าน Playwright MCP) → `e2e/` (อัตโนมัติ) → `BUG-HUNT.md` (ผล BUG_MODE=1; ผลโหมดปกติเก็บที่ `e2e/normal-mode/`)
- `docs/01…12-*-session-summary.md` — สรุปแต่ละ session ตามลำดับงาน (เพิ่มไฟล์เลขถัดไปเมื่อจบ session ใหม่)
- `.claude/skills/` — `user-story-reviewer`, `system-analyst`, `solution-architect`

- `user-story/numerology-user-stories-review.md` — **เอกสารต้นทาง** User Stories (v1.3, 8 Epics / 42 Stories, MVP 14 Stories, EP-01…EP-08) รวม Product Vision, Personas, User Journeys, Technical Considerations, MVP Backlog (§16), Open Questions OQ-xx (§17), Definition of Ready (§19) และ Decision Log (§20)
- `user-story/review-report/numerology-user-stories-review-report.md` — **รายงาน Review** ของเอกสาร **v1.3** (2026-11-06) สถานะสรุป: **Needs Clarification** (Critical 1 / High 6 / Medium 11 / Low 5)
  - §3.1 มีตาราง Traceability ประเด็นจาก Review v1.2 (GAP-001…034: ปิด 10 / เปิด 14 / Deferred 10); ประเด็นใหม่ของ v1.3 ใช้ GAP-035 ขึ้นไป — คง ID เดิมเมื่อ Review รอบถัดไป
- `.claude/skills/user-story-reviewer/SKILL.md` — Skill สำหรับ Review User Story (บทบาท Senior BA/SA/PO/QA) ใช้ผ่าน `/user-story-reviewer` และรูปแบบรายงานต้องตามโครง 12 หัวข้อของ Skill นี้

## แนวทางเมื่อแก้ไขเอกสาร

- รหัสต้องคงที่และอ้างอิงข้ามไฟล์ได้: Story `US-<กลุ่ม>-<เลข>` (เช่น US-PH-001, US-LP-002, US-RV-001, US-AD-002), Open Question `OQ-xx`, Gap `GAP-xxx` — เมื่อเพิ่ม/ลบ Story ให้อัปเดตตาราง Epic Overview (§5), ตัวเลขใน §16 และ Version/หมายเหตุหัวเอกสาร
- ติดป้ายสถานะข้อมูลใน Report: `[CONFIRMED]` / `[ASSUMPTION]` / `[OPEN QUESTION]` / `[RECOMMENDATION]` — ห้ามสรุปกฎเลขศาสตร์เองโดยไม่มีแหล่งอ้างอิง
- เนื้อหาเป็นความเชื่อ: ต้องมี disclaimer, ระบุแหล่ง/เวอร์ชันของ Rule Set แยกตามแหล่ง, ห้ามใช้ถ้อยคำแนว "แม่นที่สุด"; tabien2you ใช้อ้างอิงได้เฉพาะ UX ไม่ใช่สูตรคำนวณ

- ใน §17 ของเอกสารต้นทาง (ตั้งแต่ v1.3) Decision ใช้ป้าย **Decided** (Scope/Product รอ PO Sign-off) / **Assumption** (ค่าตั้งต้นรอ Domain Expert/Legal) / **Deferred** (ตามฟีเจอร์ที่เลื่อน) — เมื่อมีการยืนยัน ให้อัปเดตทั้ง §17 และ Decision Log §20

## สถานะปัจจุบัน (v1.3 — Proposed รอ PO Sign-off)

- **MVP Phase 1 = 14 Stories:** US-PH-001/002/004, US-LP-001–005, US-CT-001/002, US-AD-001/002/003/005 (AD-005 เฉพาะ Approve + Rollback)
- ย้ายเป็น P1: US-PH-003 (คะแนน), US-PH-006/007 (ค้นหาเบอร์ — มาพร้อม Marketplace), EP-07 รีวิว US-RV-001–005 (มาพร้อมสมาชิก)
- หลักการ MVP: Guest-only, 1 Rule Set แบบ fixed (Default ตาม Wongnai), บทความ Static Markdown, ไม่เก็บค่าที่ Guest กรอก, Validation เบอร์ตาม §17.1
- ห้ามถือ Decision/Assumption ใน v1.3 เป็นข้อยุติจนกว่าจะมี Sign-off

## สิ่งที่ต้องทำต่อ

1. PO Sign-off Decision v1.3 (§16, §17, §20)
2. Domain Expert ยืนยัน Assumption OQ-02/06/07/19 + ส่ง Golden Test Cases (≥10 เคส/ฟีเจอร์) — §17.2
3. Legal ตรวจสิทธิการใช้เนื้อหา (OQ-01) และ Disclaimer — Block Go-live ไม่ Block Dev
4. จาก Review v1.3 (High): แก้ข้อขัดแย้ง OQ-01 vs OQ-19 (ที่มาของ Rule Set Default), ตัดสิน US-PH-004 (ไม่มีแหล่งกฎ Mapping อาชีพ→คู่เลขเบอร์ — เพิ่มใน §17.2 หรือย้าย P1), เพิ่ม Story Back-office Login & Role (เสนอ US-AD-007) + แก้ Actor AD-001/002 ตาม OQ-12, ตั้ง Content Backlog ความหมายคู่เลข/ผลรวม
5. งานต่อเนื่อง: แก้ AC/Journey §14 ให้ตรง v1.3, ย้ายค่ากฎออกจาก AC LP-003/004/006, Spike Rule Engine & versioning + Golden Test runner, DPIA ก่อนเริ่ม EP-07

เมื่อแก้โค้ด ให้รัน `npm test`, `npm run lint`, `npm run build` และ `tests/api/verify-api.ps1` ก่อนส่งงาน

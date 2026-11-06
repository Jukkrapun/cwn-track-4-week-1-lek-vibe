# BUILD PROMPT — เว็บ "LekVibe" (MVP Phase 1)

> คัดลอกทั้งไฟล์ไปวางให้ Claude หน้าต่างใหม่ · เปิดหน้าต่างนั้นที่ root ของ repo `workshop-04-V2`

---

คุณคือ Full-stack Engineer ช่วยสร้างเว็บ **"LekVibe"** ขึ้นใหม่ทั้งหมดในโฟลเดอร์ `db/` และ `web/` ของ repo นี้
ทุกข้อความในเว็บและเอกสารต้องเป็นภาษาไทย ทำตามขั้นที่ 0–11 ตามลำดับ **ถ้าขั้นไหนไม่ผ่าน ให้หยุดและบอกสาเหตุ อย่าข้ามไปขั้นถัดไป**

## 0. อ่านก่อนเริ่ม (แหล่งความจริงตามลำดับ ถ้าขัดกันให้ใช้ไฟล์ที่อยู่ก่อน)
1. `requirement/system-requirements.md` — FR / BR / NFR, ค่าขอบ §4, Output/Error §5 (ข้อความ error ใช้คำต่อคำ)
2. `test-data/test-data.md` — seed และค่าที่คาดหวังทุกค่า
3. `design/*.md` — architecture, erd, sequence, flowchart, use-case
4. `user-story/reference-data/*.json` — ค่ากฎ (ห้ามแต่งกฎเลขศาสตร์เอง) · `user-story/test-cases/golden-cases.json`
- **ข้อยกเว้น:** DESIGN กำหนดให้เก็บข้อมูลเป็นไฟล์ JSON แต่งานนี้ให้ใช้ **PostgreSQL** แทน ส่วนเลเยอร์ Domain / Service / Repository ให้คงไว้ตาม architecture.md
- ขอบเขตงานคือ 14 Stories ใน MVP เท่านั้น ห้ามทำ Marketplace / รีวิว / สมาชิก / คะแนน 0–100

## 1. Stack
- Next.js (App Router, TypeScript strict) · PostgreSQL 16 · ไลบรารี `pg` เขียน SQL ตรง ๆ แบบ parameterized (`$1`) **ห้ามใช้ ORM**
- Domain (normalize, validate, pairs, sums, birthday, patterns, precedence) เป็น pure function ไม่มี I/O และมี unit test
- เก็บรหัสผ่านเป็น bcrypt hash · API ตอบแบบ envelope `{success,data,error}` ตาม §5.3 · ทุก response มี `X-Request-Id`

## 2. Docker — 2 โปรเจกต์ คุยกันผ่าน network `mongkol-net`
**db/** (`db/docker-compose.yml`)
- container `mongkol-db` ใช้ image `postgres:16-alpine` · volume `mongkol-pgdata` · พอร์ต `5433:5432`
- healthcheck `pg_isready` · network `mongkol-net` (สร้างเป็นแบบ external)
- `db/init/01-schema.sql` สร้างตารางตาม `design/erd.md` ครบทุก entity และบังคับ Invariants/State ตาม ERD ด้วย constraint เท่าที่ทำได้
  - ข้อมูลใน TEST-DATA ที่ ERD ยังไม่มีตาราง ให้เพิ่มตารางได้ เช่น `login_attempt`, `session`, `app_clock`, `request_log` (ต้อง mask ค่า)
- `db/init/02-seed.sql` ใส่ seed ตาม TEST-DATA ทุกค่า ได้แก่ ผู้ใช้ 5 คน (`locked.test` มี `failed_login_count=4`), Rule Set 4 ชุดพร้อมเวอร์ชัน, ค่ากฎทั้งหมดจาก reference-data JSON, หมวดอาชีพ 8 · เป้าหมาย 5, บทความ 4 เรื่องพร้อม references
  - ใส่รหัสผ่านเป็น hash ที่คำนวณไว้ล่วงหน้า ห้ามมี plain text

**web/** (`web/docker-compose.yml` + `web/Dockerfile` แบบ multi-stage)
- container `mongkol-web` · พอร์ต `3000:3000` · `DATABASE_URL=postgres://...@mongkol-db:5432/...` · network `mongkol-net`
- `next.config` ตั้ง `output: "standalone"` · env `HOSTNAME=0.0.0.0`, `TZ=Asia/Bangkok`, `BUG_MODE=0`, `ALLOW_TEST_RESET=1`
- healthcheck ใช้ `node -e` เรียก `http://localhost:3000/api/health` ซึ่งตอบ `{"ok":true,"db":true}` และตอบ `db:false` เมื่อต่อฐานข้อมูลไม่ได้ (HTTP 200 ทั้งคู่)
- **ห้ามต่อฐานข้อมูลตอน build:** ทุกหน้าที่อ่าน DB ต้องเป็น dynamic และสร้าง pool แบบ lazy
- ตั้งค่า resource limits ทั้ง 2 container (`deploy.resources.limits`): db 1 CPU / 512MB, web 1 CPU / 768MB — ตรวจ `docker info` ก่อนว่าเครื่องยังเหลือ headroom
- ลำดับการเปิด: `docker network create mongkol-net` (ถ้ายังไม่มี) → เปิด db → รอจน healthy → เปิด web

## 3. Windows
- ต้องไม่มีไฟล์ `.sh` ที่ต้องรันเอง · ทุกคำสั่งต้องรันใน PowerShell ได้ (ใช้ `docker compose`, `npm`, `node`)
- เพิ่ม `.gitattributes` ใส่ `* text=auto eol=lf` และ `*.png binary`
- ก่อนเปิด container ให้รัน `docker ps --filter publish=3000` และ `--filter publish=5433` ถ้ามี container อื่นใช้พอร์ตอยู่ (เช่น petshop จากบทก่อน) ให้ `docker stop` ก่อน และบอกผมว่าหยุดตัวไหน

## 4. รูปภาพ (ห้ามใช้รูปจากเน็ต เก็บทุกรูปไว้ที่ `web/public/assets/`)
- รัน `codex --version` ก่อน
- **ถ้ามี Codex CLI:** สั่ง `codex exec` ให้ใช้เครื่องมือสร้างรูปในตัวของ Codex โทนดูดวงไทย ดำ/ม่วง เช่น ท้องฟ้ากลางคืน ดวงดาว ยันต์ ลายกนกสีทอง ห้ามมีตัวอักษรหรือโลโก้แบรนด์จริงในรูป
  รายการรูป: hero หน้าแรก, ภาพประกอบหน้า `/phone` `/plate` `/pairs`, ปกบทความ 4 เรื่อง, ภาพ empty state, ภาพหน้า 404
  Codex เก็บรูปไว้ใต้ `~/.codex/generated_images` ให้คัดลอกมาที่ `web/public/assets/` แล้วย่อเป็น WebP กว้างไม่เกิน 1600px ด้วย node + `sharp`
  รูปไหนสร้างไม่สำเร็จ ให้ทำรูปนั้นรูปเดียวเป็น SVG/CSS แทน
- **ถ้าไม่มี Codex CLI:** Claude สร้างรูปทั้งหมดเองเป็น SVG/CSS
- เขียน `web/ASSETS.md` เป็นตาราง: `ไฟล์ | ใช้ที่หน้าไหน | สร้างด้วย Codex หรือ SVG/CSS`

## 5. ดีไซน์
- ธีมมืด ดำ/ม่วง แนวดูดวงไทย ใช้สีพื้นหลังดำม่วง `#0E0A1A`, การ์ด `#1C1430`, สีหลักม่วง `#7C3AED`, ม่วงอ่อน `#C4B5FD` และข้อความ `#EDE9FE`
  - ใช้ทอง `#D4AF37` เป็นสีเน้นเล็กน้อย · ทุกคู่สีของข้อความต้องผ่านค่าคอนทราสต์ WCAG AA
  - ลวดลาย: ยันต์/ลายกนกเส้นบาง, ดวงดาว, จักรราศี, ผังดวง 12 ภพ, กระดานทักษา เป็นพื้นหลังจาง ๆ (ห้ามบังเนื้อหา)
  - การ์ดผลลัพธ์ให้ดูเหมือนไพ่หรือแผ่นยันต์ มีขอบทองบาง ๆ · ระดับคู่เลขใช้สีพร้อมไอคอน/ข้อความ ไม่ใช้สีอย่างเดียว
- ฟอนต์ไทยอ่านง่าย (เช่น IBM Plex Sans Thai หรือ Noto Sans Thai) ติดตั้งเป็นไฟล์ local ผ่าน `next/font/local` ห้ามโหลดจาก CDN
- การ์ดมีเงา (glow ม่วงจาง ๆ) · animation นุ่ม ๆ เช่น ดาวระยิบ หรือการ์ดค่อย ๆ เปิดเมื่อแสดงผล และต้องเคารพ `prefers-reduced-motion` · ใช้งานบนจอ 375px ได้ (รองรับถึง 360px) โดยไม่มี scroll แนวนอน
- ผ่าน WCAG 2.2 AA (NFR-14/15) · ใช้คีย์บอร์ดอย่างเดียวได้ · ข้อความ error ผูกกับ input ผ่าน `aria-describedby`

## 6. ฟีเจอร์ (ครบตาม FR ทุกข้อ ตัวเลขทุกตัวต้องตรงตาม BR และ TEST-DATA)
- หน้า `/`, `/phone`, `/plate`, `/pairs`, `/articles`, `/articles/[slug]`, 404, `/admin/login`, `/admin` (dashboard), `/admin/pairs`, `/admin/categories`, `/admin/versions`, `/admin/audit`
- `/phone` (FR-PH-01–09): normalize → validate → แสดง 8 คู่พร้อมตำแหน่ง/ระดับ/ความหมาย · เลือกอาชีพ/เป้าหมายได้ · แสดง Rule Set + เวอร์ชัน + แหล่งอ้างอิง
- `/plate` (FR-LP-01–11): แสดงผลรวม 2 แบบพร้อมสูตรบวกทีละตัว · วันเกิด 8 ค่า · คู่เลข · pattern · ระบุแหล่งแยกกัน (Wongnai / Allianz) · แสดง disclaimer 2 ข้อความ
- `/pairs`, `/articles` (FR-CT-01–04): ค้นหาคู่เลข (24 กับ 42 ได้ผลเดียวกัน) · ค้นหาและกรองบทความ · slug ที่ไม่มีให้ตอบ 404
- `/admin` (FR-AD-01–08, BR-AD-01–04): Editor สร้าง Draft → Admin ดู Diff/Preview → Approve → Publish (ตรวจ `baseVersion` และตอบ 409 เมื่อชนกัน) → Rollback ด้วยการสร้างเวอร์ชันใหม่ · ห้าม self-approve · เปิด/ปิดหมวด · ดู Audit Log (append-only)
  - **ปุ่ม Publish ต้องมีผลทันที:** เวอร์ชันใหม่ถูกใช้ในผลวิเคราะห์ครั้งถัดไป และนับสถิติ/บันทึก Audit ครบตาม TEST-DATA §8.4
- Security/Privacy: ล็อกบัญชีหลังผิด 5 ครั้งนาน 15 นาที · session idle 30 นาที · rate limit 30/10 ครั้งต่อนาที (ปิดได้ด้วย `RATE_LIMIT_ENABLED=false`) · ส่งเบอร์/ทะเบียนทาง POST เท่านั้น · log ต้อง mask ค่า · ไม่เก็บค่าที่ Guest กรอก
- Compliance: ห้ามมีคำต้องห้ามตาม TEST-DATA §10 · ข้อมูล mock ต้องแสดง `demo-badge` "ข้อมูลตัวอย่าง" · ทุกหน้าผลลัพธ์มี disclaimer

## 7. กฎตายตัว ไม่มี AI จริง
- ทุกการ "วิเคราะห์" และ "คำแนะนำ" มาจาก Rule Set ในฐานข้อมูลเท่านั้น ห้ามเรียก API ภายนอก ห้ามสร้างคำทำนายเอง (คู่ที่ไม่มีข้อมูลต้องแสดง `ไม่มีข้อมูล`)
- ห้ามโหลด script / analytics / font จากภายนอก (ตั้ง CSP ให้ `default-src 'self'`)

## 8. รองรับการทดสอบ
- ใส่ `data-testid` ให้ทุกปุ่ม ช่องกรอก ผลลัพธ์ และข้อความ error โดยใช้ชื่อเดียวกับใน `user-story/test-cases/playwright-test-cases.md` ก่อน (เช่น `occupation-select`, `demo-badge`) ชื่อที่ไม่มีในไฟล์นั้นให้ตั้งแบบ kebab-case
- `<html lang="th" data-ready="true" data-bug-mode="0|1">` โดยตั้ง `data-ready` หลัง hydrate เสร็จ
- `POST /api/test/reset` (ใช้ได้เฉพาะเมื่อ `ALLOW_TEST_RESET=1` ถ้าไม่ได้ตั้งให้ตอบ 404)
  - ล้างข้อมูลทุกตารางกลับเป็นค่าตาม seed ใน transaction เดียว
  - รับ body `{"now":"<ISO>"}` เพื่อล็อก "วันนี้" ของเว็บ (ใช้กับ lockout, session, audit, updatedAt) ถ้าไม่ส่ง `now` ให้ใช้ `2026-11-06T09:00:00+07:00`
  - ทุกโค้ดต้องอ่านเวลาผ่านฟังก์ชัน `now()` ตัวเดียว ห้ามเรียก `Date.now()` ตรง ๆ

## 9. BUG_MODE (env ของ web ค่าเริ่มต้น `0`)
- เมื่อ `BUG_MODE=1` ให้เปิดบั๊ก 3 ตัว โดย Claude เลือกเองจาก BR ใน system-requirements.md:
  1. เรื่อง **การคำนวณตัวเลข** (ผลรวม / คู่เลข / ระดับ)
  2. เรื่อง **การตรวจสอบ input** (เบอร์ / ทะเบียน / ค่าขอบ)
  3. เรื่อง **ตัวเลขหรือสถานะที่ต้องอัปเดตหลังทำรายการ** (เวอร์ชัน / Audit / สถานะ Rule / ตัวนับล็อกอิน)
- บั๊กทุกตัวต้องเป็นแบบที่ "ถ้าลอกค่าจากหน้าจอไปเป็นผลที่คาดหวัง จะจับไม่ได้" คือหน้าจอต้องดูสมเหตุสมผล จับได้ด้วยการเทียบกับ TEST-DATA เท่านั้น
- เขียนเฉลยไว้ที่ `web/BUGS.md` ที่เดียว ห้ามบอกในแชท ห้ามเขียนใน SPEC.md และห้ามตั้งชื่อตัวแปร/คอมเมนต์ที่เดาง่าย (เช่น `bug`, `wrong`)

## 10. เขียน `web/SPEC.md`
- หน้าเว็บทั้งหมด + Actor ที่เข้าได้
- กฎที่ใช้ในแต่ละหน้าโยงกับรหัส FR / BR / NFR
- `data-testid` ทุกตัว แยกตามหน้า
- ข้อความ error คำต่อคำ พร้อม code และ HTTP status
- API ทุกเส้น: method, path, body, response ตัวอย่าง
- ผู้ใช้ seed และรหัสผ่านทดสอบ
- วิธีรัน, reset, ตัวแปร env
- อัปเดต `CLAUDE.md` ที่ root ให้มีคำสั่ง build / test / run และสถาปัตยกรรมจริง

## 11. ขั้นสุดท้าย — ตรวจและส่งมอบ
1. `npm run build`, `npm test` (unit test ของ Domain รวม Golden cases) และ lint ต้องผ่าน
2. เปิด db แล้วเปิด web · รอจนทั้ง 2 container เป็น `healthy` (`docker ps`) · เรียก `/api/health` ต้องได้ `{"ok":true,"db":true}`
3. เรียก `/api/test/reset` แล้วใช้ PowerShell (`Invoke-RestMethod`) ยิง API ตรวจกฎตาม TEST-DATA ทุก Key ที่ยิงทาง API ได้ ได้แก่ PD-*, LD-*, SD-*, AD-D*, AD-C*, LG-*, SEC-*, ค่าขอบ §4 · ตรวจด้วย `BUG_MODE=0` · รายงานผลเป็น **"ผ่าน X / Y ข้อ"** และแสดงรายการข้อที่ไม่ผ่านพร้อมค่าที่ได้จริง
4. เปิด http://localhost:3000 ให้ผมดู (`Start-Process`)
5. สรุปเป็นตาราง `ขั้น | สถานะ | หมายเหตุ` · **ห้ามบอกว่าเลือกบั๊กอะไร**

# สรุป Session — สร้างเว็บ LekVibe ตาม BUILD-PROMPT.md

> **วันที่:** 2026-11-06 ถึง 2026-11-07 · **อินพุต:** [`BUILD-PROMPT.md`](../BUILD-PROMPT.md) (ผลของ [session 01](01-build-prompt-session-summary.md))
> **ผลลัพธ์:** โค้ด MVP Phase 1 (14 Stories) ใน [`db/`](../db) และ [`web/`](../web) รันบน Docker ได้ · ตรวจกฎผ่าน API ได้ **ผ่าน 172 / 172 ข้อ** (`BUG_MODE=0`)
> **หมายเหตุ:** เอกสารนี้ไม่มีรายละเอียดของบั๊กใน BUG_MODE (เฉลยอยู่ที่ `web/BUGS.md` ที่เดียว) · ยังไม่ได้ commit

## 1. คำขอ
ผู้ใช้สั่ง "อ่าน BUILD-PROMPT.md แล้วเริ่มงานได้เลย" ให้ทำขั้นที่ 0–11 ตามลำดับ ถ้าขั้นไหนไม่ผ่านให้หยุด

## 2. แหล่งข้อมูลที่อ่าน (ขั้น 0)
- `requirement/system-requirements.md`: FR / BR / NFR, ค่าขอบ §4, ข้อความ error §5
- `test-data/test-data.md`: seed และค่าที่คาดหวัง
- `design/architecture.md`, `erd.md`, `sequence.md`
- `user-story/reference-data/*.json` และ `user-story/test-cases/golden-cases.json`, `playwright-test-cases.md` (ชื่อ `data-testid`)

## 3. สิ่งที่สร้าง

| ส่วน | ไฟล์หลัก | สาระ |
| --- | --- | --- |
| ฐานข้อมูล | `db/docker-compose.yml`, `db/init/01-schema.sql`, `db/init/02-seed.sql` | `mongkol-db` (postgres:16-alpine, พอร์ต 5433, volume `mongkol-pgdata`, 1 CPU / 512MB) · ตารางครบตาม ERD และเพิ่ม `session`, `login_attempt`, `app_clock`, `request_log`, `pair_meaning_member` · Invariant I-1..I-9 บังคับด้วย CHECK / partial unique index / trigger (state machine, immutable version, audit append-only) |
| Seed | `web/scripts/gen-seed.mjs` → `db/init/02-seed.sql` + `web/sql/seed.sql` | สร้างจาก reference-data JSON และบทความ Markdown 4 เรื่อง (`web/content/articles/`) · ผู้ใช้ 5 คน (bcrypt hash), Rule Set 4 ชุด, อาชีพ 8 / เป้าหมาย 5 / หมวดเบอร์ 5 |
| Domain | `web/src/domain/*` | pure function: normalize/validate เบอร์, parse ทะเบียน, ผลรวม 2 แบบ, วันเกิด, คู่เลข + precedence, pattern, คำแนะนำอาชีพ/เป้าหมาย, validation หลังบ้าน |
| Infrastructure / Application | `web/src/infrastructure/*`, `web/src/application/*` | Repository แบบ pg (SQL parameterized) · service วิเคราะห์, identity (lockout/session idle), rule-management (Draft → Approve → Publish → Rollback), category, test-reset |
| Shared | `web/src/shared/*` | envelope `{success,data,error}` + `X-Request-Id`, นาฬิกา `now()`, rate limit, logger ที่ mask ค่า, runtime profile |
| หน้าเว็บ | `web/app/*`, `web/src/components/*` | `/`, `/phone`, `/plate`, `/pairs`, `/articles`, `/articles/[slug]`, 404, `/admin/login`, `/admin`, `/admin/pairs`, `/admin/versions` (+ alias `/admin/rules`), `/admin/categories`, `/admin/audit` |
| API | `web/app/api/**` | 25 route: `/api/health`, `/api/test/reset`, `/api/test/clock`, `/api/v1/*` (รายละเอียดใน `web/SPEC.md` §5) |
| Docker web | `web/Dockerfile`, `web/docker-compose.yml` | multi-stage, `output: "standalone"`, healthcheck ด้วย `node -e`, 1 CPU / 768MB, network `mongkol-net` |
| รูปภาพ | `web/scripts/gen-assets.mjs` → `web/public/assets/*.svg` | เครื่องไม่มี Codex CLI จึงสร้าง SVG 11 ไฟล์ + favicon (ท้องฟ้ากลางคืน ยันต์ ลายกนก ผังดวง กระดานทักษา) |
| ทดสอบ | `web/tests/unit/*`, `web/tests/api/verify-api.ps1` | Vitest 116 เคส (รวม Golden) · สคริปต์ PowerShell ตรวจกฎตาม TEST-DATA 172 ข้อ |
| เอกสาร | `web/SPEC.md`, `web/ASSETS.md`, `web/BUGS.md`, `CLAUDE.md` | SPEC: หน้า/Actor/กฎ/testid/error/API/ผู้ใช้ seed/env · CLAUDE.md อัปเดตสถาปัตยกรรมและคำสั่งจริง |

## 4. ปัญหาที่เจอและวิธีแก้

| ปัญหา | สาเหตุ | วิธีแก้ |
| --- | --- | --- |
| Bash heredoc ตัดไฟล์ที่มีข้อความไทยกลางทาง | Git Bash บน Windows กับ heredoc ยาวที่มีอักขระหลายไบต์ | เปลี่ยนไปสร้างไฟล์ด้วย Write tool และสคริปต์ Node |
| ลบ Draft แล้ว trigger immutable ขัดขวาง | ตอน cascade ลบลูก แถวแม่ถูกลบไปแล้ว สถานะจึงเป็น NULL | ให้ trigger อนุญาตเมื่อหาแถวแม่ไม่เจอ |
| SEC-01 ได้ `PHONE_INVALID_LENGTH` แทน `PHONE_INVALID_CHAR` | ตรวจความยาวดิบ > 20 ก่อนตรวจอักขระ | สลับให้ตรวจอักขระก่อน |
| เลื่อนนาฬิกา/reset แล้ว rate limit ไม่ถูกล้าง | Next.js โหลดโมดูลแยกตาม route ทำให้ state ในโมดูลไม่ใช้ร่วมกัน | ย้าย state ไปไว้ที่ `src/shared/process-state.ts` (globalThis) |
| สคริปต์ PowerShell ส่ง body ว่าง | `[string]$Raw = $null` กลายเป็น `''` | ตรวจด้วย `$PSBoundParameters.ContainsKey('Raw')` |
| PRV-05 เทียบข้อความไทยจาก `docker exec` ไม่ตรง | encoding ของ console | ตั้ง `[Console]::OutputEncoding = UTF8` |
| Favicon 404 / header กินพื้นที่บนมือถือ | ยังไม่มีไอคอน / header เป็น sticky | เพิ่ม `app/icon.svg` · ยกเลิก sticky ที่จอ ≤ 640px |

## 5. การตัดสินใจที่เอกสารไม่ได้ระบุ (บันทึกใน SPEC.md แล้ว)
- **`front-back-13`:** [ASSUMPTION] หลักแรก + หลักสุดท้ายของตัวเลข = 13 เพราะกฎต้นทางไม่มีตัวอย่าง (รอ Domain Expert)
- **`one-bracket`:** ตัวเลขอย่างน้อย 3 หลักที่ขึ้นต้นและลงท้ายด้วย 1
- **อาชีพ → กฎ:** trade, office, service, government-teacher, technician-engineer ผูกกับ `occupationPairs` ของ Wongnai · business, executive, freelance ไม่มีกฎ จึงแสดง "ใช้ผลวิเคราะห์ทั่วไป" (ตรงกับประเด็น US-PH-004 ใน Review)
- **เป้าหมาย → หมวดคู่เลข:** negotiation→communication, money, relationship→love, health, career→work
- **คู่เลขทะเบียน:** คู่ที่อยู่ทั้ง `avoidPairs` และ `occupationPairs` (35/53) ให้เป็น `caution` · คำแนะนำตัดคู่ที่ไม่ใช่ `good` ออก
- **เวอร์ชันใหม่:** patch + 1 และคง suffix (`0.1.0-mock` → `0.1.1-mock`) · Rollback สร้างเวอร์ชันใหม่จากเวอร์ชันที่ `SUPERSEDED`
- **Error code ที่เพิ่มเอง:** `VALIDATION_LENGTH`, `INVALID_REQUEST`, `VERSION_CONFLICT`, `INVALID_STATE`, `NOT_FOUND`
- **Login:** ไม่บันทึกใน Audit (เก็บที่ `login_attempt`) เพื่อให้ Audit ตรงกับ TEST-DATA §8.4
- **หมวดใหม่:** สร้างเป็น Draft และต้องให้ Admin คนอื่นเผยแพร่ (BR-AD-01)
- **`/api/test/clock`:** เพิ่มเพื่อเลื่อนเวลาใน LG-06–08
- **Cookie `Secure`:** ปิดเป็นค่าเริ่มต้นเพราะ demo รันบน http (`COOKIE_SECURE=true` เมื่อใช้ HTTPS)

## 6. ผลการตรวจ (ขั้น 11)

| ขั้น | สถานะ | หมายเหตุ |
| --- | --- | --- |
| 0–1 อ่านเอกสาร / Stack | ✅ | PostgreSQL แทนไฟล์ JSON ตามข้อยกเว้น |
| 2 Docker | ✅ | `mongkol-db` และ `mongkol-web` healthy · ตรวจ headroom แล้ว (16 CPU / 15GB) |
| 3 Windows | ✅ | ไม่มี container อื่นใช้พอร์ต 3000 / 5433 อยู่ จึงไม่ได้หยุด container ใด |
| 4 รูปภาพ | ✅ | ไม่มี Codex CLI → ใช้ SVG ทั้งหมด |
| 5 ดีไซน์ | ✅ | ตรวจด้วย Playwright ที่ 375px ไม่มี scroll แนวนอน |
| 6–8 ฟีเจอร์ / กฎตายตัว / รองรับการทดสอบ | ✅ | |
| 9 BUG_MODE | ✅ | เปิด `BUG_MODE=1` แล้วสคริปต์จับได้ จากนั้นสลับกลับเป็น `0` |
| 10 SPEC.md / CLAUDE.md | ✅ | |
| 11 build / test / lint / API | ✅ | build, lint, typecheck ผ่าน · Vitest 116/116 · `/api/health` = `{"ok":true,"db":true}` · **ผ่าน 172 / 172 ข้อ** · เปิด http://localhost:3000 แล้ว |

## 7. วิธีรันซ้ำ (PowerShell)

```powershell
docker network create mongkol-net                 # ครั้งแรกเท่านั้น
cd db;  docker compose up -d                       # รอ healthy
cd ..\web; docker compose up -d --build
Invoke-RestMethod -Method Post http://localhost:3000/api/test/reset
pwsh -File tests\api\verify-api.ps1
```

## 8. สิ่งที่ค้าง
- ยังไม่ได้ commit (branch `main`)
- ยังไม่มี Playwright E2E ครบชุดใน `web/` (ตรวจ UI แค่ smoke ที่ 375px) · การตรวจ a11y ด้วย axe ยังไม่ได้รัน
- Assumption ข้อ 5 ต้องรอ Domain Expert / PO ยืนยัน

# LekVibe — ระบบเลขมงคลและทะเบียนรถมงคล (MVP Phase 1)

Web Application สำหรับวิเคราะห์เบอร์มือถือและทะเบียนรถตามหลักเลขศาสตร์ (Guest ไม่ต้อง Login) พร้อมระบบหลังบ้านจัดการกฎ/เวอร์ชัน และชุดทดสอบครบวงจร ตั้งแต่ User Story → Requirement → Design → Code → Test

> ⚠️ เนื้อหาเป็นความเชื่อส่วนบุคคล ไม่ใช่ข้อเท็จจริงทางวิทยาศาสตร์ — ข้อมูลกฎในระบบเป็น **ข้อมูลตัวอย่าง** สำหรับ Demo/Workshop

## ฟีเจอร์ (14 Stories)

| กลุ่ม | Story | ความสามารถ |
| --- | --- | --- |
| เบอร์มือถือ | US-PH-001/002/004 | Normalize เบอร์ (เลขไทย, `-`, `+66`), วิเคราะห์คู่เลข, คู่เลขแนะนำตามอาชีพ/เป้าหมาย |
| ทะเบียนรถ | US-LP-001–005 | ผลรวม 2 แบบพร้อมสูตร, ตรวจรูปแบบทะเบียน, วันเกิด, แหล่งกฎแยกตาม Rule Set |
| เนื้อหา | US-CT-001/002 | ค้นความหมายคู่เลข, บทความ (Static Markdown) |
| หลังบ้าน | US-AD-001/002/003/005 | จัดการคู่เลข/หมวด, Draft → Approve, Rollback, Audit Log, สิทธิ์ admin/editor |

## สถาปัตยกรรม

- **Next.js 16** (App Router, TypeScript strict) — หน้าเว็บ + Route Handlers `/api/v1/*` (envelope `{success,data,error}`)
- **PostgreSQL 16** ผ่านไลบรารี `pg` (SQL parameterized, ไม่ใช้ ORM) · Invariant บังคับด้วย constraint/trigger
- แบ่งชั้น `domain` (pure function) → `application` (service) → `infrastructure` (repository) → `app` (UI/API)
- 2 Docker project (`db/`, `web/`) คุยกันผ่าน network `mongkol-net`

## โครงสร้าง Repository

```text
user-story/      User Stories v1.3, รายงาน Review, reference-data (ค่ากฎ JSON), golden test cases
requirement/     System Requirements Specification (FR/BR/NFR)
test-data/       Test Data Specification (seed + ค่าที่คาดหวัง)
design/          Architecture/ADR, Use Case, Flowchart, Sequence, ERD
research/        สคริปต์ดึงข้อมูลคู่เลข (decoder159)
db/              docker-compose + init SQL (schema, seed — generated)
web/             แอป Next.js + unit tests + API verify script (ดู web/SPEC.md)
e2e/             Playwright E2E (48 TC × 3 เบราว์เซอร์) + รายงาน HTML
exploration/     ภาพหน้าจอจากการสำรวจเว็บ
docs/            สรุปแต่ละ session (01–12)
*.md (root)      BUILD-PROMPT, EXPLORATION, TEST-PLAN, PLAN-REVIEW, TEST-RUN-1, BUG-HUNT
```

## เริ่มต้นใช้งาน

ต้องมี: Docker Desktop, Node.js 22+, PowerShell 7

```powershell
docker network create mongkol-net                       # ครั้งแรกเท่านั้น
cd db;  docker compose up -d                            # รอ mongkol-db healthy (พอร์ต 5433)
cd ..\web; $env:BUG_MODE='0'; docker compose up -d --build
Invoke-RestMethod http://localhost:3000/api/health     # ok=true, db=true
```

เปิด http://localhost:3000 · รีเซ็ตข้อมูลเป็น seed (และล็อกเวลา 2026-11-06T09:00+07:00):

```powershell
Invoke-RestMethod -Method Post http://localhost:3000/api/test/reset
```

ถ้า schema เปลี่ยน: `cd db; docker compose down -v; docker compose up -d`

ผู้ใช้ทดสอบหลังบ้านดูได้ที่ `test-data/test-data.md`

## พัฒนาและทดสอบ

ในโฟลเดอร์ `web/`:

```powershell
npm install
npm test            # vitest: unit + Golden cases
npm run lint; npm run typecheck; npm run build
npm run gen:seed    # หลังแก้ user-story/reference-data/*.json หรือ web/content/articles/*.md
pwsh -File tests\api\verify-api.ps1   # ตรวจกฎผ่าน API (ต้องเปิดระบบอยู่)
```

E2E ในโฟลเดอร์ `e2e/`:

```powershell
npm install; npx playwright install
npx playwright test                                   # chromium / firefox / webkit
npx playwright test --project=chromium -g "TC-PH-01"  # รันข้อเดียว
npm run test:gif                                      # อัด GIF/MP4 (ต้องมี ffmpeg)
npm run report                                        # สร้าง e2e/index.html
```

### BUG_MODE

ตั้ง `$env:BUG_MODE='1'` แล้ว `docker compose up -d --build` ใหม่ เพื่อเปิดบั๊กสำหรับฝึกทดสอบ ผลการล่าบั๊กอยู่ใน [BUG-HUNT.md](BUG-HUNT.md)

## เอกสารสำคัญ

- [User Stories](user-story/numerology-user-stories-review.md) · [Review Report](user-story/review-report/numerology-user-stories-review-report.md)
- [System Requirements](requirement/system-requirements.md) · [Test Data](test-data/test-data.md) · [Design](design/README.md)
- [Web SPEC](web/SPEC.md) · [Test Plan](TEST-PLAN.md) · [Test Run 1](TEST-RUN-1.md) · [Bug Hunt](BUG-HUNT.md)
- แนวทางสำหรับ Claude Code: [CLAUDE.md](CLAUDE.md)

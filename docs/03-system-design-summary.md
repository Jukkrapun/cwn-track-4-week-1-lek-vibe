# สรุปเอกสาร — System Design (`design/`)

> **วันที่:** 2026-11-06 · **ผลลัพธ์:** [`design/`](../design/README.md) — [architecture](../design/architecture.md), [use-case](../design/use-case.md), [flowchart](../design/flowchart.md), [erd](../design/erd.md), [sequence](../design/sequence.md) v1.0 · **สถานะ:** Accepted (Demo)
> **ที่มา:** [System Requirements](../requirement/system-requirements.md) (ดูสรุปขั้นก่อนหน้าที่ [`02-system-requirements-summary.md`](02-system-requirements-summary.md)) · [User Stories v1.3](../user-story/numerology-user-stories-review.md) · [Reference Data](../user-story/reference-data/README.md)
> **ขอบเขต:** MVP Phase 1 = 14 Stories · แผนภาพทั้งหมดเป็น Mermaid (ดูใน VS Code Markdown Preview หรือ GitHub)

## 1. วัตถุประสงค์
- แปลง Requirement (FR/BR/NFR) เป็นการออกแบบที่นำไปสร้างเว็บได้ทันที ทั้งโครงสถาปัตยกรรม ข้อมูล และลำดับการทำงาน
- บันทึกการตัดสินใจทางเทคนิคเป็น ADR เพื่อให้รู้ว่าเลือกอะไร เพราะอะไร และยอมเสียอะไร
- ผูก Use Case กลับไปยัง Story และรหัส Playwright Test Case เพื่อตรวจย้อนกลับได้

## 2. ไฟล์ในโฟลเดอร์ `design/`
| ไฟล์ | เนื้อหา |
| --- | --- |
| `architecture.md` | System Context, Logical Architecture, Module ↔ Requirement, Technology Radar, ADR-001–006, Failure Modes, NFR Coverage, โครงโฟลเดอร์ที่เสนอ |
| `use-case.md` | Use Case Diagram + 12 Use Case Specifications (UC-01…UC-12) + Traceability |
| `flowchart.md` | วิเคราะห์เบอร์, วิเคราะห์ทะเบียน, Rule Lifecycle (Draft → Publish → Rollback), Admin Login |
| `erd.md` | Logical ERD 15 Entity, Invariant I-1…I-9, State Diagram ของ Rule Set Version, Mapping ไปยังไฟล์ |
| `sequence.md` | Phone analyze, Plate analyze, Login, Draft → Publish, Rollback, การรัน Playwright E2E |

## 3. สถาปัตยกรรม
- **System Context:** ผู้ใช้ 3 กลุ่ม (Guest / Content Editor / Admin) ใช้ Next.js Web App ตัวเดียว · **ไม่มีระบบภายนอกใน MVP** (ไม่เชื่อมกรมการขนส่งทางบก และ Payment)
- **Logical Architecture แบ่ง 4 ชั้น:**

| ชั้น | ส่วนประกอบ |
| --- | --- |
| Middleware / Route Handlers | `/api/v1/*` · Rate limit · Auth · Request ID · Security headers |
| Domain (pure TS ไม่มี I/O) | PhoneAnalysis (normalize/validate/pairs) · PlateAnalysis (parse/sums/birthday/patterns) · Rule Engine (lookup/precedence) |
| Application Services | RuleManagement · Content · Identity · Audit |
| Infrastructure (Repository) | RuleRepository · AuditRepository · UserRepository · StatsRepository |

| Module | FR / NFR หลัก |
| --- | --- |
| PhoneAnalysis | FR-PH-01–09, BR-PH-01–06 |
| PlateAnalysis | FR-LP-01–11, BR-LP-01–10 |
| Rule Engine | NFR-03, BR-LP-09 |
| RuleManagement | FR-AD-02–08, BR-AD-01–04, NFR-04 |
| Identity | FR-AD-01, NFR-05–07 |
| Audit | FR-AD-06, NFR-13 |
| Content | FR-CT-01–04 |
| Middleware | NFR-07–12, NFR-18 |

## 4. Architecture Decision Records
| ADR | การตัดสินใจ | ข้อแลกเปลี่ยน |
| --- | --- | --- |
| ADR-001 | Next.js Full-stack (Route Handlers เป็น API) แทน Next.js + .NET | รันคำสั่งเดียว Playwright เริ่มได้ทันที · ถ้าย้ายไป .NET ต้องเขียน Domain ใหม่ (คง Contract `/api/v1`) |
| ADR-002 | File-based Store (JSON) ผ่าน Repository Pattern | เปลี่ยนเป็น PostgreSQL ได้โดยไม่แตะ Domain · ไม่รองรับหลาย instance ต้องใช้ atomic write |
| ADR-003 | Rule Set เป็น Immutable Version — Publish สร้างเวอร์ชันใหม่, Rollback = clone เวอร์ชันเก่าเป็นเวอร์ชันใหม่ | ทุกผลอ้างเวอร์ชันได้แน่นอน · ไฟล์สะสม |
| ADR-004 | Stateless Analysis — `POST` ไม่มี persistence เก็บเฉพาะตัวนับ, Logger บังคับ mask | ลดความเสี่ยง PDPA · debug ได้แค่ Request ID + ค่าที่ mask |
| ADR-005 | Golden Tests เป็น Gate ก่อน Publish — เคสเปลี่ยนผลต้องแสดง Diff ให้ Admin ยืนยัน | กันกฎผิดหลุด · ต้อง regenerate Golden เมื่อแก้กฎโดยตั้งใจ |
| ADR-006 | Session Cookie (`HttpOnly; Secure; SameSite=Strict`, idle 30 นาที) แทน JWT | revoke ได้ทันที · session in-memory หายเมื่อ restart |

**Technology Radar:** Adopt — Next.js + TS, Zod, JSON + Repository, Playwright + axe, Vitest, argon2/bcrypt · Hold — .NET แยก · Assess — PostgreSQL, Redis (rate limit)

## 5. Use Case (12 ข้อ)
| Use Case | Actor | Stories |
| --- | --- | --- |
| UC-01 วิเคราะห์เบอร์ / UC-02 แนะนำตามอาชีพ (extend) | Guest | PH-001, 002 / PH-004 |
| UC-03 วิเคราะห์ทะเบียน / UC-04 ตรวจตามวันเกิด (extend) | Guest | LP-001, 003–005 / LP-002, 004 |
| UC-05 อ่านบทความ / UC-06 ค้นหาความหมายคู่เลข | Guest | CT-001 / CT-002 |
| UC-07 Login หลังบ้าน | Editor, Admin | AD-001 |
| UC-08 จัดการ Draft · UC-09 Preview + Golden test | Editor, Admin | AD-001, 003 / AD-002 |
| UC-10 Approve & Publish · UC-11 Rollback · UC-12 Audit Log | Admin | AD-002 / AD-005 |

## 6. Data Model (ERD)
- **15 Entity:** USER, RULE_SET, RULE_SET_VERSION, PAIR_MEANING, SUM_GRADE, LETTER_VALUE, BIRTHDAY_RULE, AVOID_PATTERN, CATEGORY, CATEGORY_RULE, AUDIT_LOG, USAGE_STAT, ARTICLE, ARTICLE_CATEGORY, ARTICLE_REFERENCE
- Guest **ไม่มี Entity** (ADR-004) · ออกแบบเชิงสัมพันธ์ตั้งแต่ต้นเพื่อย้ายไป PostgreSQL ได้ตรง ๆ
- **State ของ RULE_SET_VERSION:** `DRAFT → APPROVED → PUBLISHED → SUPERSEDED` (APPROVED ย้อนเป็น DRAFT ได้เมื่อ reject · Rollback = clone เป็น DRAFT ใหม่)

| Invariant | สาระ | ที่มา |
| --- | --- | --- |
| I-1 | ผู้ Approve ≠ ผู้สร้าง | BR-AD-01 |
| I-2 | PUBLISHED ได้ครั้งละ 1 เวอร์ชันต่อ Rule Set และตรงกับตัวชี้ | ADR-003 |
| I-3 | เวอร์ชันที่ไม่ใช่ DRAFT ห้ามแก้เนื้อหา | ADR-003 |
| I-4 / I-5 | กลุ่มคู่เลขไม่ซ้ำในเวอร์ชัน · `source` ห้ามว่าง | BR-AD-03/04 |
| I-6 | ค่าอักษร 1–9 และอักษรหนึ่งตัวมีค่าเดียว | BR-LP-06 |
| I-7 / I-8 | Audit append-only · Usage stat ห้ามมีค่าที่ผู้ใช้กรอก | NFR-13, BR-PV-01 |
| I-9 | Category rule ต้องชี้ Category ที่มีอยู่ | FR-AD-07 |

## 7. Flow และ Sequence ที่สำคัญ
- **วิเคราะห์เบอร์ / ทะเบียน:** Rate limit → Validate (ไม่ผ่านคืน Error Code) → Domain คำนวณ → Rule Engine ใช้ precedence → เพิ่มตัวนับ → คืนผลพร้อม Rule Set/เวอร์ชัน/แหล่ง
- **Login:** ตรวจ `locked_until` ก่อน · ผิด 5 ครั้งล็อก 15 นาที · สำเร็จออก Session Cookie
- **Draft → Publish:** Preview รัน Golden test → Approve (ถ้าเป็นผู้สร้างถูกปฏิเสธ) → Publish ตรวจ `baseVersion` (ไม่ตรง = 409 `VERSION_CONFLICT`) → เขียน Audit **ก่อน** สลับตัวชี้ ถ้า Audit ล้มเหลวให้ยกเลิก
- **Playwright E2E:** เริ่ม Web Server แล้วรอ `/api/health` = 200 ก่อนรันทดสอบ

## 8. Failure Modes ที่ออกแบบรับไว้
| สถานการณ์ | วิธีรับมือ |
| --- | --- |
| Rule Set โหลดไม่ได้ / JSON เสีย | Validate ด้วย Zod ตอน startup · ล้ม = `INTERNAL_ERROR` ห้ามแสดงผลที่ไม่มีกฎ |
| ยิงถี่ / กดซ้ำ | Rate limit 30/นาที/IP → 429 · ปุ่ม disable ระหว่างโหลด · API idempotent |
| Admin 2 คน Publish พร้อมกัน | Optimistic lock ด้วย `baseVersion` → 409 |
| เขียนไฟล์ค้างครึ่งทาง | เขียน temp แล้ว `rename` · สลับ `published.json` เป็นขั้นสุดท้าย |
| Brute force Login | Lockout 5 ครั้ง/15 นาที + rate limit 10/นาที |

**ความเสี่ยงที่ยอมรับ (Demo):** Single instance, session หายเมื่อ restart, ไม่มี backup อัตโนมัติ

## 9. การนำไปใช้ต่อ
- **BUILD-PROMPT / เว็บ MVP:** ใช้การแบ่งชั้น Domain / Application / Infrastructure / Shared, ERD และ Invariant ชุดนี้ · ตอนสร้างจริงเปลี่ยน File Store เป็น **PostgreSQL 16** (ตามทาง ADR-002) และบังคับ I-1…I-9 เป็น constraint/trigger ใน `db/init/01-schema.sql`
- **TEST-PLAN / E2E:** ใช้ตาราง Traceability ใน `use-case.md` และ Flow ข้อผิดพลาดใน `sequence.md` เป็นฐานของ Test Case

## 10. สิ่งที่ต้องทำต่อ
1. ADR-002 และ Mapping ไปยังไฟล์ใน `erd.md` ไม่ตรงกับเว็บจริงที่ใช้ PostgreSQL — ควรเพิ่ม ADR ใหม่ (Supersede ADR-002) และแก้ Technology Radar ให้ PostgreSQL เป็น Adopt
2. ADR-001 ระบุ `npm run dev` แต่เว็บจริงรันผ่าน Docker Compose 2 project (`db/`, `web/`) — ควรปรับ Consequences และ sequence ของ Playwright
3. โครงโฟลเดอร์ใน `architecture.md` §7 ยังเป็นแบบ File Store (`data/`) ควรอัปเดตให้ตรงกับ `web/src/*` และ `e2e/`

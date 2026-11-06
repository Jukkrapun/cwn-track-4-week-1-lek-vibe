# User Story Review Report — ระบบเลขมงคลและทะเบียนรถมงคล

> **Reviewed Document:** `user-story/numerology-user-stories-review.md`  
> **Document Version:** 1.3 (8 Epics / 42 Stories / MVP Phase 1 = 14 Stories)  
> **Previous Review:** v1.2 (2026-11-06) — Not Ready (Critical 6 / High 12 / Medium 11 / Low 5)  
> **Review Date:** 2026-11-06  
> **Reviewer Roles:** Senior BA (Primary), System Analyst, QA Analyst, Product Owner, Solution Architect  
> **Review Type:** Requirement Quality Gate ก่อน Backlog Refinement / Estimation (Re-review หลัง v1.3 ตัดสิน Blocker)  
> **หมายเหตุ:** Decision ใน v1.3 ทุกข้อมีสถานะ **Proposed — รอ PO Sign-off** หรือ **Assumption** รายงานนี้จึงติดป้าย [ASSUMPTION] กับ Decision เหล่านั้น ยกเว้นข้อความที่อยู่ในเอกสารจริงจะติด [CONFIRMED] ในความหมาย "ระบุชัดในเอกสาร" ไม่ใช่ "Stakeholder อนุมัติแล้ว"

---

## 1. Executive Summary

- **Document / Version:** User Stories & Requirement Review v1.3 (Draft for Team Review)
- **Business Objective:** [CONFIRMED §2] ให้ Guest วิเคราะห์เบอร์โทรศัพท์และทะเบียนรถตามความเชื่อ พร้อมเหตุผล/แหล่งอ้างอิง/เวอร์ชันกฎที่ตรวจสอบย้อนหลังได้ และต่อยอดสู่สมาชิก รีวิว Marketplace
- **Overall Readiness:** **Needs Clarification** (ดีขึ้นจาก Not Ready ใน v1.2)
- **จำนวนประเด็นที่ยังเปิด (กระทบ MVP):** Critical **1** / High **6** / Medium **11** / Low **5** (รวม 23)
- **ประเด็นจาก v1.2:** ปิดแล้ว 10 ข้อ, ยังเปิด/บางส่วน 14 ข้อ, เลื่อนตามฟีเจอร์ (Deferred) 10 ข้อ — ดูตาราง Traceability §3.1

**สิ่งที่ v1.3 ปรับปรุงได้ดี**
- ลด MVP เหลือ 14 Stories และตัวเลข §16 ตรงกับรายการแล้ว
- ย้าย US-PH-003, US-PH-006/007 และ EP-07 ออกจาก MVP พร้อมเหตุผล — ปิด Dependency กับ US-MB-001
- กำหนด Validation เบอร์ (§17.1), รูปแบบทะเบียน (OQ-05), Retention ของ Guest (OQ-11), Publish Workflow 2 ขั้น (OQ-12)
- ดึง US-AD-005 (Approve + Rollback) เข้า P0 และมี Decision Log ระบุวันที่ (§20)
- แยก Blocker ที่ต้องได้จากคนนอกทีมไว้ชัดเจน (§17.2) และกำหนดว่า Story จะ Done เมื่อ Golden Tests ผ่าน

**ประเด็นหลักที่ยังเหลือ**
1. **[Critical]** กฎเลขศาสตร์ทั้งหมดยังเป็น Assumption และยังไม่มี Golden Test Cases — ทีมเริ่มเขียนโครงได้ แต่ QA ยังตรวจผล Pass/Fail ไม่ได้
2. **[High, ใหม่]** OQ-01 ห้ามคัดลอกสูตรเฉพาะของเว็บอ้างอิง แต่ OQ-19 ใช้ Default "ตาม Wongnai" และ AC ของ US-LP-003/004 ยังมีค่าของ Wongnai — สองข้อนี้ขัดกัน
3. **[High, ใหม่]** US-PH-004 (แนะนำตามอาชีพ) อยู่ใน MVP แต่ไม่มีแหล่งกฎ Mapping อาชีพ→คู่เลขของเบอร์ และไม่อยู่ในรายการที่ Domain Expert ต้องยืนยัน (§17.2)
4. **[High, ใหม่]** MVP เป็น Guest-only แต่ Content Editor/Admin ต้อง Login เพื่อทำ Workflow ของ OQ-12 — ไม่มี Story หรือ RBAC สำหรับ Back-office
5. **[High, ใหม่]** ต้องเรียบเรียงความหมายคู่เลข/ผลรวมเองทั้งหมด (OQ-01) แต่ไม่มี Owner, จำนวน หรือกำหนดส่งของเนื้อหา
6. **[High]** Decision ทั้งหมดใน v1.3 ยังรอ PO Sign-off

---

## 2. Scope & Understanding

### Confirmed Scope — MVP Phase 1 [CONFIRMED §16, สถานะ Proposed]
| กลุ่ม | Stories | ขอบเขตที่ระบุ |
| --- | --- | --- |
| วิเคราะห์เบอร์ | US-PH-001, 002, 004 | 1 Rule Set fixed, ไม่มี Selector ศาสตร์ |
| วิเคราะห์ทะเบียน | US-LP-001 – 005 | รถยนต์ส่วนบุคคลมาตรฐาน, ผลรวม 2 แบบ |
| เนื้อหา | US-CT-001, 002 | บทความ Static Markdown ใน repo |
| Back-office | US-AD-001, 002, 003, 005 | AD-005 เฉพาะ Approve + Rollback |

### Out of Scope [CONFIRMED §2.2, §16, OQ-05/08]
- ชำระเงิน/Escrow/โอนกรรมสิทธิ์, รับประกันผล, สูตรที่ไม่มีสิทธิใช้
- ตรวจทะเบียนว่าง (แสดงข้อความว่าไม่ได้ยืนยันสถานะ)
- จักรยานยนต์/ป้ายพิเศษ, ระบบสมาชิก, รีวิว, คะแนน 0–100, ค้นหาเบอร์, เลือกศาสตร์, CMS

### Actors / Personas
| Actor | ใน MVP | ข้อสังเกต |
| --- | --- | --- |
| Guest | ✅ | [CONFIRMED] |
| Content Editor | ✅ (สร้าง Draft กฎ/ความหมาย — OQ-12) | ต้อง Login แต่ไม่มี Story Identity ใน P0 (GAP-012) |
| Admin | ✅ (Approve/Publish/Rollback) | เช่นเดียวกัน |
| Domain Expert | นอกระบบ (ยืนยันกฎ + Golden Tests) | ไม่อยู่ใน §3 |
| Member, Buyer, Seller, Moderator | ❌ (P1–P3) | Moderator ยังไม่อยู่ใน §3 |

### Dependencies
- **Domain Expert:** ยืนยัน OQ-02/06/07/19, ตารางค่าอักษรทักษา, Golden Tests ≥ 10 เคส/ฟีเจอร์ (§17.2)
- **Content:** ความหมายคู่เลข 00–99 (เบอร์/ทะเบียน), ความหมายผลรวม, บทความ Static — เรียบเรียงเองตาม OQ-01
- **Legal:** สิทธิเนื้อหา + Disclaimer (Block Go-live, ไม่ Block Dev)
- **PO:** Sign-off §16, §17, §20
- **Internal:** US-PH-002/LP-005/CT-002 → US-AD-001 (ข้อมูลความหมาย); ทุก Story วิเคราะห์ → US-AD-002 (Rule Engine); US-AD-002 → US-AD-005 (Approve)

---

## 3. Requirement Gap Analysis

### 3.1 Traceability — สถานะประเด็นจาก Review v1.2

| v1.2 ID | เรื่อง | สถานะใน v1.3 | หลักฐาน |
| --- | --- | --- | --- |
| GAP-001 | ไม่มี Rule Spec | **ยังเปิด (Critical)** — เป็น Assumption | OQ-02/06/07/19, §17.2 |
| GAP-002 | ฝังค่ากฎใน AC LP-003/004/006 | **ยังเปิด (High)** — ค่ายังอยู่ใน AC | §8 |
| GAP-003 | ค้นหาเบอร์ไม่มีแหล่งข้อมูล | ✅ ปิด — ย้าย P1 | §16 |
| GAP-004 | ตัวเลข MVP §16 ไม่ตรง | ✅ ปิด — 14 Stories | §16 |
| GAP-005 | รีวิว P0 พึ่ง MB-001 | ✅ ปิด — EP-07 เป็น P1 | §16, OQ-13 |
| GAP-006 | สิทธิเนื้อหา | **บางส่วน** — กำหนดหลักการแล้ว แต่ขัดกับ OQ-19 (GAP-035) | OQ-01 |
| GAP-007 | ตารางค่าอักษรทักษา | **ยังเปิด** — รวมใน GAP-001 | OQ-07 |
| GAP-008 | รูปแบบทะเบียน | ✅ ปิด (Proposed) — เหลือ Edge (GAP-041) | OQ-05 |
| GAP-009 | Validation เบอร์ | ✅ ปิด (Proposed) — เหลือ Edge (GAP-040) | §17.1 |
| GAP-010 | Approve/Rollback อยู่ P1 | ✅ ปิด — AD-005 P0 | §13, OQ-12 |
| GAP-011 | P0 อ้าง "ศาสตร์ที่เลือก" | **บางส่วน** — §16 ชัดแล้ว แต่ AC/Journey ยังไม่แก้ (GAP-038) | §16 |
| GAP-012 | ไม่มี Moderator/Domain Expert + RBAC | **ยังเปิด (High)** — ขยายเป็นเรื่อง Back-office Identity | §3 |
| GAP-013 | DPIA / Retention | ✅ ปิดสำหรับ MVP (ไม่เก็บค่า Guest) — DPIA ย้ายไปพร้อม EP-07 | OQ-11 |
| GAP-014 | RV-005 อ้าง OQ-11 ผิด | **ยังเปิด (Medium, P1)** | §12 |
| GAP-015 | RV-002 กรองป้ายยืนยัน | Deferred (ทั้งคู่ P1) | — |
| GAP-016 | สูตรคะแนน | ✅ ปิด — ย้าย P1 | OQ-03 |
| GAP-017 | นิยามหมวดเบอร์ | Deferred — แต่ AD-003 P0 ยังมีหมวดเบอร์ (GAP-042) | OQ-04 |
| GAP-018 / 019 / 020 | ทะเบียน Marketplace / ระเบียบขนส่ง / State model | Deferred (P2) | OQ-18 |
| GAP-021 | Actor "User" | **ยังเปิด (Low)** | — |
| GAP-022 | Admin vs Content Editor | **บางส่วน** — OQ-12 ตัดสินแล้ว แต่ Actor ใน AD-001/002 ยังเป็น Admin (รวมใน GAP-012) | OQ-12 |
| GAP-023 | วันพุธกลางคืน | ✅ ปิด (Assumption) | OQ-06 |
| GAP-024 | Cardinality อาชีพ/เป้าหมาย | **ยังเปิด (Medium)** | US-PH-004 |
| GAP-025 – 028 | เงื่อนไขค้นหา / SLA / Fraud threshold / Auth | Deferred (P1) | — |
| GAP-029 | NFR ไม่มีตัวเลข | **ยังเปิด (Medium)** | §15 |
| GAP-030 | คำเตือนขับขี่ | **ยังเปิด (Low)** | US-LP-004 |
| GAP-031 | Pagination บทความ | **ยังเปิด (Low)** | US-CT-001 |
| GAP-032 | Decision Log ว่าง | ✅ ปิด | §20 |
| GAP-033 | §5 ไม่มีคอลัมน์ Priority | **ยังเปิด (Low)** | §5 |
| GAP-034 | นิยาม "ใกล้เคียง" | Deferred (P1) | — |

### 3.2 ประเด็นที่ยังเปิด (กระทบ MVP)

| ID | Story / Section | Finding | Evidence Status | Severity | Impact | Recommendation | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GAP-001 | OQ-02, 06, 07, 19; §17.2 | กฎเลขศาสตร์ทั้งหมดเป็น Assumption (ตำแหน่งคู่เลข, ตารางวันเกิด, ตารางค่าอักษรทักษา, Default Rule Set) และยังไม่มี Golden Test Cases | [ASSUMPTION] | **Critical** | Dev ทำ Rule Engine แบบ config ได้ แต่ US-PH-001/002, US-LP-002–005 Done และทดสอบผลไม่ได้ | Domain Expert ส่ง Rule Data + Golden Tests พร้อมกำหนดวันส่ง; ทีมทำ Engine กับข้อมูลทดสอบ (Stub) ระหว่างรอ | Domain Expert |
| GAP-035 | OQ-01 vs OQ-19 | **[ใหม่]** OQ-01 บอกให้ "เรียบเรียงเองจากความรู้สาธารณะ ห้ามคัดลอกสูตรเฉพาะของเว็บอ้างอิง" แต่ OQ-19 ให้ Default = Wongnai ทั้งตาราง | [CONFIRMED] (ขัดกันในเอกสาร) | High | ไม่ชัดว่า Rule Data มาจากไหน, เสี่ยงลิขสิทธิ์ตอน Go-live | ระบุให้ชัดว่า "ใช้ Wongnai เป็นแหล่งอ้างอิงเพื่อเทียบ แต่ Rule Set เรียบเรียง/ตรวจโดย Domain Expert" หรือขออนุญาต Wongnai | PO / Legal / Domain Expert |
| GAP-002 | US-LP-003, US-LP-004, US-LP-006 | AC ยังมีค่ากฎ (กลุ่มผลรวม 14/41…, คู่เลข 13/31/37/73/35/53, 00/03/30/07/70, รูปแบบ 1771/1001, รายการอาชีพ) | [ASSUMPTION] | High | ทีมอาจเขียนค่าลงโค้ดแทน config; ค่าอาจเปลี่ยนเมื่อ Domain Expert ยืนยัน | ย้ายค่าไปเป็น "Draft Rule Data" แยกจาก AC; AC เหลือ "ตาม Rule Set ที่ Publish" | BA |
| GAP-036 | US-PH-004 (P0) | **[ใหม่]** ไม่มีแหล่งกฎ Mapping อาชีพ/เป้าหมาย → คู่เลขของ**เบอร์โทร** (Wongnai เป็นเรื่องทะเบียน) และไม่อยู่ในรายการ §17.2 | [OPEN QUESTION] | High | Story P0 ไม่มีข้อมูลให้แสดง หรือจะตกไปที่ "ผลวิเคราะห์ทั่วไป" ทุกครั้ง | เพิ่ม Mapping นี้ในรายการ §17.2 หรือย้าย US-PH-004 เป็น P1 | PO / Domain Expert |
| GAP-012 | §3, OQ-12, US-AD-001/002/003/005 | **[ขยาย]** MVP เป็น "Guest-only ไม่มีระบบสมาชิก" แต่ Content Editor/Admin ต้อง Login, แยกสิทธิ์ และ "ห้ามผู้สร้าง Approve เอง" — ไม่มี Story Back-office Authentication/RBAC ใน P0; Actor ของ AD-001/002 ยังเป็น Admin ไม่ตรงกับ OQ-12 | [CONFIRMED] | High | Back-office เปิดโล่งหรือ Estimate ขาด; Segregation of Duties ทำไม่ได้ | เพิ่ม Story "US-AD-007 — Back-office Login + Role (Editor/Admin)" ใน P0 และแก้ Actor ให้ตรง OQ-12 | PO / Security |
| GAP-039 | US-AD-001, US-CT-002, US-PH-002, US-LP-005 | **[ใหม่]** ต้องเรียบเรียงความหมายคู่เลข 00–99 (เบอร์ และทะเบียนอาจคนละชุด) + ความหมายผลรวม + บทความเอง แต่ไม่มี Owner, จำนวน หรือกำหนดส่ง | [OPEN QUESTION] | High | ระบบเสร็จแต่ไม่มีเนื้อหาให้ Go-live; ทุกคู่แสดง "ไม่มีข้อมูล" | ตั้ง Content Backlog แยก (จำนวนรายการ, Owner, วันส่ง, ผู้ตรวจ) | PO / Content / Domain Expert |
| GAP-037 | §16, §17, §20 | Decision ทั้งหมดใน v1.3 ยังเป็น Proposed/Assumption | [CONFIRMED] | High | Scope เปลี่ยนได้ระหว่าง Sprint | PO Sign-off ก่อน Sprint Planning และอัปเดต §20 | PO |
| GAP-038 | US-PH-001, US-LP-001, US-LP-002, §14 | **[ใหม่]** AC/Journey ไม่ตรงกับ Decision: PH-001/LP-002 ยังเขียน "ศาสตร์ที่เลือก"; LP-002 ยังมี "กรณีวันที่จริง"; LP-001 ยังรับ "จังหวัด (กรณีเกี่ยวข้อง)"; Journey 14.1 ยังมี "เลือกศาสตร์", "คะแนน", "ค้นหาเบอร์แนะนำ", "บันทึกผลเมื่อเข้าสู่ระบบ"; 14.2 ยังมี "เลือกศาสตร์" | [CONFIRMED] | Medium | UX/QA ทำงานจากเนื้อหาที่ขัดกับ Scope | แก้ AC และ Journey ให้ตรง v1.3 หรือทำเครื่องหมาย (P1) | BA / UX |
| GAP-040 | §17.1 | Validation ยังไม่ครอบคลุม: 10 หลักขึ้นต้น 00/01/1x, `+66 0812345678` (มี 0 เกิน), เลขไทย ๐–๙, วงเล็บ/จุด, ช่องว่างหัว-ท้าย | [OPEN QUESTION] | Medium | ผลไม่สม่ำเสมอระหว่าง Frontend/Backend | เพิ่มแถวในตาราง §17.1 | PO / SA |
| GAP-041 | OQ-05, US-LP-001/005 | รูปแบบทะเบียน: ไม่ระบุพยัญชนะที่รองรับ (ฃ ฅ, สระ/วรรณยุกต์), ป้ายเลข 1 หลัก (`กข 1`) ไม่มีคู่เลขให้วิเคราะห์, ระยะห่าง/ขีดระหว่างหมวดกับเลข, เลขนำหน้า 0 (`กข 0123`) | [OPEN QUESTION] | Medium | Parser และ LP-005 ทำงานไม่ตรงกัน | เพิ่มตาราง Validation ทะเบียนแบบเดียวกับ §17.1 | PO / Domain Expert |
| GAP-044 | US-LP-003 | ยังไม่ระบุว่าลดผลรวมเป็นหลักเดียวเมื่อใด และตารางระดับผลรวมครอบคลุมทุกค่าหรือไม่ | [OPEN QUESTION] | Medium | ผลรวมสูตร (ข) อาจเกินช่วงตาราง | รวมไว้ใน Rule Data ที่ Domain Expert ยืนยัน + ค่า Default `ไม่มีข้อมูล` | Domain Expert |
| GAP-046 | US-LP-004 | "เลขหน้ารวมเลขหลังได้ 13" — "เลขหน้า" คือเลขนำหน้าหมวด หรือครึ่งแรกของเลข 4 หลัก | [OPEN QUESTION] | Medium | ตีความได้ 2 แบบ ทดสอบไม่ได้ | Domain Expert ให้นิยาม + ตัวอย่าง | Domain Expert |
| GAP-042 | US-AD-003 (P0) | CRUD "หมวดเบอร์" อยู่ใน P0 แต่การใช้งานหมวดเบอร์ (PH-007, OQ-04) ถูกเลื่อน | [CONFIRMED] | Medium | ทำงานเกินจำเป็นใน MVP | จำกัด AD-003 ใน MVP เป็นอาชีพ/เป้าหมาย | PO |
| GAP-043 | US-AD-005, OQ-12 | "ขั้นต่ำ: Approve + Rollback" ไม่ระบุว่า AC ข้อใดอยู่ใน MVP (เช่น หน้าแสดง Audit); "Rollback ได้ทันที" — ต้องผ่าน Approve หรือไม่ ใครทำได้ | [OPEN QUESTION] | Medium | Estimate ไม่ได้, ช่องโหว่ Segregation of Duties | ระบุ AC ของ MVP ให้ชัด + สิทธิ์ Rollback | PO |
| GAP-024 | US-PH-004 | เลือกอาชีพ/เป้าหมายได้กี่รายการ ผลเมื่อกฎขัดกัน | [OPEN QUESTION] | Medium | UX/Logic ไม่ชัด | กำหนด Cardinality | PO |
| GAP-047 | US-PH-004, US-LP-006, US-RV-001, US-AD-003 | รายการอาชีพตัวอย่างยังไม่ตรงกัน 3 ชุด | [CONFIRMED] | Medium | Master data ซ้ำซ้อน | ใช้ Master list เดียวจาก AD-003 | BA |
| GAP-029 | §15 | ไม่มีตัวเลข NFR: Latency, Rate limit (กัน Scraping ฐานความหมาย), Availability | [CONFIRMED] | Medium | Sizing/ป้องกัน Bot ไม่ได้ | กำหนด Baseline ก่อน Architecture | Architect |
| GAP-014 | US-RV-005 (P1) | ยังอ้าง "ปิดบังเลข (ดู OQ-11)" แต่ OQ-11 คือ Retention ของ Guest | [CONFIRMED] | Medium | ไม่มี Owner ของ Masking policy เมื่อเริ่ม P1 | เพิ่ม OQ-21 Masking policy | BA |
| GAP-045 | §12, §20 | หมายเหตุหัว EP-07 ยังเขียน "รีวิวประสบการณ์ใช้เลข (P0)" และ Dependency เดิม; §20 มีตารางเก่าค้าง (บรรทัด `--- | --- |` + แถว TBD) ทำให้ Markdown เสีย | [CONFIRMED] | Low | อ่านแล้วสับสน | ลบส่วนที่ค้าง | BA |
| GAP-021 | หลาย Story | Actor "User" ไม่ระบุ Guest/Member | [CONFIRMED] | Low | — (MVP เป็น Guest-only) | เปลี่ยนเป็น Guest ใน Story P0 | BA |
| GAP-030 | US-LP-004 | ข้อความเตือนขับขี่ปลอดภัยยังไม่มี Copy ที่อนุมัติ | [CONFIRMED] | Low | Copy ไม่สม่ำเสมอ | Content/Legal อนุมัติ | Content |
| GAP-031 | US-CT-001 | บทความ Static: ไม่ระบุ Pagination/การเรียง/SEO metadata | [CONFIRMED] | Low | — | เพิ่ม AC | BA |
| GAP-033 | §5 | ตาราง Epic ไม่แสดงจำนวน P0/P1/P2 ต่อ Epic | [CONFIRMED] | Low | มองภาพ MVP ยาก | เพิ่มคอลัมน์ | BA |

---

## 4. Ambiguities & Conflicts

| ID | Original Wording | Ambiguity / Conflict | Risk | Question |
| --- | --- | --- | --- | --- |
| AMB-01 | OQ-01 "ห้ามคัดลอกข้อความ/สูตรเฉพาะของเว็บอ้างอิง" vs OQ-19 "Default = Wongnai" | ขัดกันโดยตรง (GAP-035) | ลิขสิทธิ์ | Rule Set Default คือ "ของทีม (อ้างอิง Wongnai)" หรือ "ของ Wongnai"? |
| AMB-02 | US-LP-006 "รับอาชีพ (ใช้รายการเดียวกับ US-PH-004) เช่น ค้าขาย/ออนไลน์, ราชการ/ครู…" | ตัวอย่างไม่ตรงกับ PH-004 | Master data แตก | Master list อยู่ที่ AD-003 ใช่หรือไม่? |
| AMB-03 | §16 "Guest-only: ไม่มีระบบสมาชิกใน Phase 1" vs OQ-12 "Content Editor สร้าง Draft → Admin Approve" | Guest-only หมายถึงฝั่งผู้ใช้เท่านั้น? | Back-office Auth ไม่ถูก Estimate | Back-office Login อยู่ใน MVP ใช่หรือไม่? |
| AMB-04 | OQ-12 "Rollback ไปเวอร์ชันก่อนหน้าได้ทันที" | ต้อง Approve หรือไม่ / ใครทำได้ | ข้าม Workflow 2 ขั้น | Rollback ต้องผ่าน Admin เท่านั้นหรือไม่? |
| AMB-05 | OQ-06 "แสดงคำอธิบายช่วง 18:00–05:59" | คนเกิดวันพฤหัสฯ 03:00 จัดเป็นพุธกลางคืนหรือพฤหัสฯ? | ผู้ใช้เลือกผิด | ข้อความอธิบายจะเขียนอย่างไร? |
| AMB-06 | OQ-02 "ตำแหน่ง 2–10 (ข้าม 0 ตัวแรก) = 8 คู่" | สอดคล้องทางคณิต (9 หลัก → 8 คู่) แต่ "ข้าม 0" ใช้กับทุกเบอร์เพราะ Normalize แล้วขึ้นต้น 0 เสมอ — ควรเขียนเป็น "หลักที่ 2–10" | ตีความผิด | ยืนยันถ้อยคำ |
| AMB-07 | US-LP-003 "13/31/37 กลุ่มควรเลี่ยง" + US-LP-004 "เลขหน้ารวมเลขหลังได้ 13" | 13 ใช้ทั้งมิติผลรวมและรูปแบบ | ผลซ้ำ | แสดงทั้งสองกฎหรือรวมเป็นหนึ่ง? |
| AMB-08 | OQ-07 "แสดงทั้ง 2 ผลรวม" vs US-LP-003 "ระดับผลรวม ตาม Rule Set" | ระดับผลรวมคิดจากผลรวมแบบใด หรือทั้งสอง | UI/Logic | แสดงระดับแยกต่อผลรวมใช่หรือไม่? |
| AMB-09 | US-PH-004 "หากไม่มี Rule สำหรับอาชีพที่เลือก ใช้ผลวิเคราะห์ทั่วไปแทน" | "ผลวิเคราะห์ทั่วไป" = ผลของ PH-002 หรือข้อความแนะนำทั่วไป | UX | แสดงอะไรแน่? |

---

## 5. Missing Business Rules

| ID | Missing Rule | Business Impact | Proposed Clarification |
| --- | --- | --- | --- |
| BR-01 | Rule Data ที่ยืนยันแล้ว: ตำแหน่งคู่เลข, ตารางวันเกิด 8 วัน, ตารางค่าอักษรทักษา | Done ไม่ได้ | §17.2 ข้อ 1 + กำหนดวันส่ง |
| BR-02 | Mapping อาชีพ/เป้าหมาย → คู่เลขเบอร์ | US-PH-004 ไม่มีข้อมูล | เพิ่มใน §17.2 หรือเลื่อน Story |
| BR-03 | ความหมายคู่เลขของเบอร์ vs ทะเบียน — ใช้ชุดเดียวกันหรือแยก | Data model / Content | Domain Expert ตัดสิน |
| BR-04 | การลดผลรวมเป็นหลักเดียว + ตารางระดับผลรวมครบทุกค่า | ผลรวมไม่ deterministic | Rule Data |
| BR-05 | ลำดับความสำคัญเมื่อกฎขัดกัน (คู่ดี / ผลรวมควรเลี่ยง) | สรุปขัดกัน | แสดงทุกกฎ ไม่สรุปรวม [RECOMMENDATION] |
| BR-06 | สิทธิ์ Rollback และผลกับผลวิเคราะห์ที่กำลังแสดง | Integrity | PO |
| BR-07 | นิยาม "เลขหน้า/เลขหลัง" ใน US-LP-004 | ทดสอบไม่ได้ | Domain Expert |
| BR-08 | พยัญชนะที่รองรับและการจัดการอักษรที่ไม่มีในตารางทักษา | Parser / ผลรวม (ข) | Domain Expert |
| BR-09 | Version-pinning: Guest ไม่มีประวัติ แต่ผลที่แชร์/Bookmark (ถ้ามี) จะคำนวณใหม่ด้วยเวอร์ชันล่าสุดหรือไม่ | ความสอดคล้อง | PO — หากไม่มี Share link ใน MVP ให้ระบุว่า Out of Scope |
| BR-10 | ข้อความ Disclaimer มาตรฐานและตำแหน่งที่ต้องแสดง | Legal | Legal / Content |

---

## 6. Proposed User Story Improvements

### US-PH-001 — ตรวจสอบเบอร์โทรศัพท์
- **Original:** "แสดงผลแยกด้าน … เฉพาะเมื่อศาสตร์ที่เลือกมีกฎรองรับ"; "ตามกฎ Validation ที่ตกลงกัน"
- **Suggested Revision:** [RECOMMENDATION] "…เฉพาะเมื่อ Rule Set Default มีกฎรองรับ" และ "ตาม Validation Table §17.1"
- **Reason:** GAP-038 — ให้ AC ตรง Decision และทดสอบได้

### US-PH-004 — แนะนำเบอร์ตามอาชีพ
- **Suggested Revision:** [RECOMMENDATION] ทางเลือก (ก) คงใน P0 แต่เพิ่ม Mapping อาชีพ→คู่เลขเข้า §17.2 และ Golden Tests; (ข) ย้ายเป็น P1 แล้วใน MVP ให้แสดงแค่ความหมายคู่เลขตามหมวด (การงาน/การเงิน)
- **Reason:** GAP-036

### US-LP-001 / US-LP-002 — ทะเบียนและวันเกิด
- **Suggested Revision:** [RECOMMENDATION] LP-001: "จังหวัด — ไม่บังคับ ไม่มีผลต่อการคำนวณ (OQ-05)" + อ้างตาราง Validation ทะเบียน; LP-002: ตัด AC "กรณีวันที่จริง" หรือทำเครื่องหมาย Out of Scope และแก้ "ตามศาสตร์ที่เลือก" เป็น "ตาม Rule Set Default"
- **Reason:** GAP-038, GAP-041

### US-LP-003 / US-LP-004 — ผลรวมและเลขควรเลี่ยง
- **Suggested Revision:** [RECOMMENDATION] ย้ายค่าตัวอย่างไป Appendix "Draft Rule Data — Source: Wongnai — Assumption"; AC ระบุ "ระดับผลรวม/คู่เลขควรเลี่ยงตาม Rule Set ที่ Publish"; แยก LP-004 เป็น (ก) กาลกิณีตามวันเกิด (ข) คู่เลข/รูปแบบควรเลี่ยง
- **Reason:** GAP-002, INVEST-S

### US-AD-001 / US-AD-002 — Actor
- **Suggested Revision:** [RECOMMENDATION] "As a **Content Editor** I want to สร้าง/แก้ Draft …" และเพิ่ม AC "Admin Approve/Publish; ผู้สร้างไม่สามารถ Approve เองได้"
- **Reason:** ให้ตรง OQ-12 (GAP-012)

### US-AD-005 — Audit Log และ Rollback (ขั้นต่ำ)
- **Suggested Revision:** [RECOMMENDATION] ระบุ AC ของ MVP: (1) Approve/Publish 2 ขั้น (2) Rollback ไปเวอร์ชันก่อนหน้า โดย Admin เท่านั้น (3) บันทึกผู้ทำ/เวลา ทุก Publish/Rollback — ส่วนหน้า UI Audit Log เต็มรูปแบบเป็น P1
- **Reason:** GAP-043

### [ใหม่] US-AD-007 — Back-office Login & Role [P0] [RECOMMENDATION]
- **As a** Content Editor / Admin **I want to** เข้าสู่ระบบหลังบ้านตาม Role **so that** จัดการกฎและความหมายได้อย่างปลอดภัย
- AC เสนอ: Login เฉพาะบัญชีที่ Admin สร้าง (ไม่มี Self-register); Role = Editor/Admin; Guest เข้า Back-office ไม่ได้; บันทึก Audit การ Login
- **Reason:** GAP-012, AMB-03

### US-AD-003 — จัดการหมวด
- **Suggested Revision:** [RECOMMENDATION] MVP = อาชีพ/เป้าหมายเท่านั้น; หมวดเบอร์ (มังกร/หงส์…) ย้ายพร้อม PH-007
- **Reason:** GAP-042

### §14 User Journeys
- **Suggested Revision:** [RECOMMENDATION] ตัด/ทำเครื่องหมาย (P1) ที่ขั้น "เลือกศาสตร์", "คะแนน", "ค้นหาเบอร์แนะนำ", "บันทึกผลเมื่อเข้าสู่ระบบ"; เพิ่มขั้น "แสดงข้อความไม่ได้ยืนยันสถานะทะเบียน" (OQ-08)

---

## 7. Acceptance Criteria

### Confirmed Criteria [CONFIRMED ในเอกสาร — รอ PO Sign-off]
- วิเคราะห์ได้โดยไม่ Login (US-PH-001, US-LP-001)
- แสดงชื่อ Rule Set และเวอร์ชันบนหน้าผลลัพธ์ ไม่มี Selector (§16)
- ไม่มีกฎ → `ไม่มีข้อมูล` (US-PH-002, US-LP-005, US-CT-002)
- Validation เบอร์ตาม §17.1 (5 กรณี)
- ป้ายทะเบียนรูปแบบ `[เลข 1 หลัก?][พยัญชนะไทย 1–2][เลข 1–4]`, จังหวัดไม่มีผลต่อการคำนวณ (OQ-05)
- แสดงผลรวม 2 แบบพร้อมป้าย (OQ-07)
- ไม่เก็บค่าที่ Guest กรอก, Log ต้อง Mask (OQ-11)
- Publish 2 ขั้น ห้ามผู้สร้าง Approve เอง, Rollback ได้ (OQ-12)
- แสดงข้อความว่าไม่ได้ยืนยันสถานะทะเบียน (OQ-08)
- Story Done เมื่อ Golden Tests ผ่าน (§17.2)

### Proposed Criteria [RECOMMENDATION]
> ค่าใน `<…>` รอ Stakeholder ยืนยัน — ตัวอย่างเลขใน Examples ไม่ใช่กฎเลขศาสตร์

```gherkin
Feature: Validation เบอร์โทรศัพท์ (US-PH-001, §17.1)

  Scenario Outline: รับและ Normalize เบอร์
    Given Guest อยู่ที่หน้าเช็คเบอร์
    When Guest กรอก "<input>" และกดวิเคราะห์
    Then ระบบ "<result>"
    Examples:
      | input          | result                                         |
      | 0812345678     | วิเคราะห์ด้วยค่า 0812345678                     |
      | 081-234-5678   | Normalize เป็น 0812345678 แล้ววิเคราะห์          |
      | 081 234 5678   | Normalize เป็น 0812345678 แล้ววิเคราะห์          |
      | +66812345678   | Normalize เป็น 0812345678 แล้ววิเคราะห์          |
      | 66812345678    | Normalize เป็น 0812345678 แล้ววิเคราะห์          |
      | 0612345678     | วิเคราะห์ (ขึ้นต้น 06)                          |
      | 021234567      | แสดง "รองรับเฉพาะเบอร์มือถือ"                    |
      | 0712345678     | แสดง "รองรับเฉพาะเบอร์มือถือ"                    |
      | 08123          | แสดง "กรุณากรอกเบอร์มือถือ 10 หลัก"              |
      | 08a2345678     | แสดง "กรุณากรอกเบอร์มือถือ 10 หลัก"              |
      | +660812345678  | <รอยืนยัน — GAP-040>                            |
      | ๐๘๑๒๓๔๕๖๗๘     | <รอยืนยัน — GAP-040>                            |
      | 0112345678     | <รอยืนยัน — GAP-040>                            |

  Scenario: Validation ล้มเหลวต้องไม่เรียก Rule Engine
    When Guest กรอกเบอร์ที่ไม่ผ่าน Validation
    Then ระบบแสดงข้อความ Error และไม่แสดงผลวิเคราะห์ใด ๆ
```

```gherkin
Feature: คู่เลขเบอร์ (US-PH-002, OQ-02)

  Scenario: ตัดคู่เลขตาม Config ของ Rule Set
    Given Rule Set Default กำหนดตำแหน่งคู่เลข = หลักที่ 2–10 แบบติดกัน <Assumption>
    When Guest วิเคราะห์ 0812345678
    Then ระบบแสดง 8 คู่ตามลำดับ: 81, 12, 23, 34, 45, 56, 67, 78
    And แต่ละคู่แสดงความหมาย/หมวด หรือ "ไม่มีข้อมูล"

  Scenario: ผลลัพธ์ Deterministic และระบุเวอร์ชัน
    Given Rule Set เวอร์ชัน "<v>" Published
    When วิเคราะห์เบอร์เดิมซ้ำ
    Then ผลเหมือนกันทุกครั้ง และหน้าผลแสดงชื่อ Rule Set + "<v>"
```

```gherkin
Feature: ทะเบียนรถ (US-LP-001, US-LP-003, OQ-05, OQ-07)

  Scenario Outline: รูปแบบทะเบียน
    When Guest กรอก "<plate>"
    Then ระบบ "<result>"
    Examples:
      | plate      | result                                          |
      | กข 1234    | แยกหมวด "กข" และเลข "1234" แล้ววิเคราะห์          |
      | 1กข 234    | แยกเลขนำ "1" หมวด "กข" เลข "234" แล้ววิเคราะห์    |
      | ก 12       | แยกหมวด "ก" เลข "12" แล้ววิเคราะห์                |
      | กข 12345   | แจ้งรูปแบบไม่รองรับ                              |
      | กขค 123    | แจ้งรูปแบบไม่รองรับ                              |
      | กข 1       | <วิเคราะห์ผลรวม; คู่เลข = ไม่มีข้อมูล? — GAP-041> |

  Scenario: จังหวัดไม่มีผลต่อการคำนวณ
    Given ทะเบียน "กข 1234"
    When วิเคราะห์โดยระบุจังหวัด A และจังหวัด B
    Then ผลรวมและคู่เลขเหมือนกันทั้งสองครั้ง

  Scenario: แสดงผลรวม 2 แบบพร้อมวิธีคำนวณ
    Given ตารางค่าอักษรเวอร์ชัน "<v>" Published
    When Guest วิเคราะห์ "กข 1234"
    Then แสดง "ผลรวมเฉพาะตัวเลข" = 1+2+3+4 = 10
    And แสดง "ผลรวมรวมค่าอักษร" พร้อมค่าของ ก และ ข ตามตาราง "<v>"
    And แสดงข้อความว่าระบบไม่ได้ยืนยันสถานะทะเบียน
```

```gherkin
Feature: วันเกิด (US-LP-002, OQ-06)

  Scenario: บังคับเลือกพุธกลางวัน/กลางคืน
    When Guest เลือกวันเกิด "พุธ"
    Then ระบบให้เลือก "พุธกลางวัน" หรือ "พุธกลางคืน" พร้อมคำอธิบายช่วงเวลา
    And ไม่ถามวันที่หรือเวลาเกิดจริง
```

```gherkin
Feature: Rule Workflow (US-AD-002, US-AD-005, OQ-12)

  Scenario: ผู้สร้าง Approve เองไม่ได้
    Given Content Editor A สร้าง Draft Rule
    When A พยายาม Approve Draft นั้น
    Then ระบบปฏิเสธ

  Scenario: Publish ต้องผ่าน Golden Tests
    Given Draft Rule ที่ทำให้ Golden Test อย่างน้อย 1 เคสล้มเหลว
    When Admin กด Publish
    Then ระบบปฏิเสธและแสดงเคสที่ล้มเหลว

  Scenario: Rollback ไม่ลบประวัติ
    Given Rule Set v2 Published และมี v1 ก่อนหน้า
    When Admin Rollback ไป v1
    Then v1 กลับมา Active และประวัติ v2 + การ Rollback ถูกบันทึกไว้

  Scenario: Guest เข้าหลังบ้านไม่ได้
    When ผู้ที่ไม่ได้ Login เรียกหน้า/API ของ Back-office
    Then ระบบตอบ 401 และไม่เปิดเผยข้อมูล Draft
```

```gherkin
Feature: Privacy ของ Guest (OQ-11)

  Scenario: ไม่เก็บค่าที่กรอก
    When Guest วิเคราะห์ 0812345678
    Then ไม่มีค่า 0812345678 ในฐานข้อมูลหรือ Log แบบไม่ Mask
    And นับเพิ่มเฉพาะสถิติรวม (จำนวนครั้ง/ประเภทการวิเคราะห์)
```

---

## 8. Edge Cases / Error Scenarios

| ID | Scenario | Expected Behavior | Confirmation Needed |
| --- | --- | --- | --- |
| EC-01 | `+66 0812345678` (มี 0 เกิน) | Normalize หรือ Error | PO (GAP-040) |
| EC-02 | เลขไทย ๐–๙ / Full-width digits | แปลงหรือ Error | PO |
| EC-03 | 10 หลักขึ้นต้น 00, 01, 1x | Error ข้อความใด | PO |
| EC-04 | วาง (Paste) เบอร์ที่มีวงเล็บ/จุด | Normalize หรือ Error | PO |
| EC-05 | ทะเบียนเลข 1 หลัก (`กข 1`) | ผลรวมได้ คู่เลขไม่มี | Domain Expert |
| EC-06 | ทะเบียนเลขนำหน้า 0 (`กข 0123`) | รับหรือไม่ | PO |
| EC-07 | อักษร ฃ ฅ หรือมีสระ/วรรณยุกต์ | แจ้งไม่รองรับ | Domain Expert |
| EC-08 | กรอกทะเบียนไม่มีช่องว่าง/มีขีด (`กข1234`, `กข-1234`) | Normalize | PO |
| EC-09 | ผลรวมไม่มีในตารางระดับ | `ไม่มีข้อมูล` | Domain Expert |
| EC-10 | กฎคู่เลขดีแต่ผลรวมควรเลี่ยง | แสดงทั้งคู่พร้อมเหตุผล | Domain Expert |
| EC-11 | ไม่มี Rule Set Published (ช่วงแรก/หลัง Rollback ผิดพลาด) | หน้าแสดงสถานะปิดปรับปรุง | PO |
| EC-12 | Rollback ระหว่างผู้ใช้กำลังดูผล | ผลเดิมแสดงเวอร์ชันที่ใช้; Refresh ได้เวอร์ชันใหม่ | Architect |
| EC-13 | เลือกอาชีพที่ไม่มี Rule | ผลวิเคราะห์ทั่วไป (นิยามตาม AMB-09) | PO |
| EC-14 | Bot ยิงวิเคราะห์ 00–99 ทุกคู่เพื่อดูดฐานความหมาย | Rate limit / CAPTCHA | Architect (GAP-029) |
| EC-15 | Content Editor แก้ Draft ที่อีกคนกำลัง Review | Lock หรือ Version conflict | SA |
| EC-16 | บัญชี Admin มีเพียงคนเดียว (Approve ไม่ได้เพราะห้าม Approve งานตนเอง) | ต้องมีอย่างน้อย 2 บัญชี | PO |

---

## 9. Technical Risks & Dependencies

- **Integration:** ไม่มี External API ใน MVP [CONFIRMED] — ความเสี่ยงต่ำ
- **Security / Privacy:**
  - Back-office Authentication/RBAC ไม่มี Story (GAP-012) — ความเสี่ยงสูงสุดด้าน Security ของ MVP
  - ข้อมูล Guest ไม่เก็บ (OQ-11) ลดความเสี่ยง PDPA ได้มาก — ต้องตรวจว่า Analytics/APM/CDN Log ไม่เก็บค่า Query string ของเบอร์ [RECOMMENDATION: ส่งค่าผ่าน POST body]
  - ไม่มี Rate limit ที่กำหนดเป็นตัวเลข — ฐานความหมายที่เรียบเรียงเองถูก Scrape ได้ง่าย
- **Performance / Reliability:** การคำนวณเป็น Deterministic ขนาดเล็ก Cache Rule Set ตามเวอร์ชันได้ [ASSUMPTION] — ยังต้องมี SLO
- **Rule Correctness:**
  - Golden Tests ≥ 10 เคส/ฟีเจอร์ อาจไม่พอสำหรับผลรวมสูตร (ข) ที่มีพยัญชนะ 44 ตัว [RECOMMENDATION: ให้มีอย่างน้อย 1 เคสต่อพยัญชนะที่รองรับ หรือทดสอบตารางค่าอักษรแยก]
  - Rule Engine แบบ Config ต้องรองรับการเปลี่ยนตำแหน่งคู่เลข/ตารางโดยไม่แก้โค้ด เพราะทั้งหมดยังเป็น Assumption
- **Follow-up Review Needed:**
  - **Spike:** Rule Set schema + Versioning + Golden Test runner (ผูกกับ Publish gate)
  - **Architecture:** ยืนยัน §15 (Next.js → .NET → PostgreSQL) — Static Markdown บทความเหมาะกับ SSG ของ Next.js
  - **Legal:** OQ-01 vs OQ-19, Disclaimer
  - **Security:** Back-office Auth (ไม่จำเป็นต้องเป็นระบบสมาชิกเต็มรูปแบบ)

---

## 10. INVEST & Definition of Ready

### INVEST (Story ใน MVP)

| Check | Status | Notes |
| --- | --- | --- |
| I — Independent | Pass (ดีขึ้น) | Dependency กับ MB-001/RV ถูกตัดแล้ว; เหลือ Dependency ภายใน AD-001/002 ที่จัดลำดับได้ |
| N — Negotiable | Partial | LP-003/004/006 ยังล็อกค่ากฎใน AC |
| V — Valuable | Pass | |
| E — Estimable | Partial | Estimate โครงได้; ยังขาด Back-office Auth (GAP-012) และขนาดงาน Content (GAP-039) |
| S — Small | Partial | LP-003 (6 AC), LP-004 (7 AC) ยังใหญ่ |
| T — Testable | **Fail** | ไม่มี Golden Tests และกฎเป็น Assumption (GAP-001) |

### Readiness รายเรื่อง (MVP 14 Stories)

| Story | Readiness | เหลืออะไร |
| --- | --- | --- |
| US-PH-001 | **Needs Clarification** | PO Sign-off §17.1, Edge GAP-040, แก้ AC "ศาสตร์ที่เลือก" |
| US-PH-002 | Needs Clarification | Golden Tests + ความหมายคู่เลข (GAP-001, GAP-039) |
| US-PH-004 | **Not Ready** | ไม่มีแหล่งกฎ Mapping อาชีพ (GAP-036) |
| US-LP-001 | Needs Clarification | Edge ทะเบียน (GAP-041) |
| US-LP-002 | Needs Clarification | ยืนยันตารางวันเกิด (OQ-19) |
| US-LP-003 | Needs Clarification | ตารางค่าอักษร, การลดหลัก, ตารางระดับ (GAP-001, GAP-044), GAP-002 |
| US-LP-004 | Needs Clarification | GAP-002, GAP-046 + แนะนำแยก Story |
| US-LP-005 | Needs Clarification | ความหมายคู่เลข (GAP-039), ป้าย 1 หลัก |
| US-CT-001 | **Ready for Refinement** (Static) | เพิ่ม AC Pagination/SEO (Low) |
| US-CT-002 | Needs Clarification | เนื้อหาความหมาย (GAP-039) |
| US-AD-001 | Needs Clarification | แก้ Actor ตาม OQ-12, Back-office Auth |
| US-AD-002 | Needs Clarification | Back-office Auth, Golden Test runner |
| US-AD-003 | Needs Clarification | ตัดหมวดเบอร์ออกจาก MVP (GAP-042) |
| US-AD-005 | Needs Clarification | ระบุ AC ขั้นต่ำ + สิทธิ์ Rollback (GAP-043) |

> "Ready for Refinement" ในที่นี้หมายถึงพร้อมนำเข้า Refinement ไม่ได้หมายถึงอนุมัติ Scope แทน PO

### Definition of Ready (§19)

| Check | Status | Notes |
| --- | --- | --- |
| Business Value + AC ตรวจสอบได้ | Partial | AC บางข้อยังไม่ตรง Decision (GAP-038) |
| Input/Output + Validation ชัดเจน | Pass (Proposed) | §17.1 + OQ-05 — เหลือ Edge |
| กฎเลขศาสตร์ได้รับอนุมัติ | **Fail** | Assumption ทั้งหมด |
| Wireframe / UX Flow | Partial | Journey §14 ยังไม่อัปเดตตาม v1.3, ยังไม่มี Wireframe |
| Dependency / Integration ระบุแล้ว | Pass | §17.2 ชัดเจน |
| Estimate และแตก Task ได้ | Partial | ได้สำหรับโครง Engine/Validation; Back-office Auth และ Content ยังไม่ได้ Estimate |

---

## 11. Stakeholder Questions (High → Low Impact)

| Priority | Question | Why It Matters | Owner |
| --- | --- | --- | --- |
| 1 | Domain Expert จะส่ง Rule Data ที่ยืนยัน + Golden Tests ได้วันที่เท่าไร? | กำหนดวันที่ Story วิเคราะห์จะ Done | Domain Expert / PO |
| 2 | Rule Set Default เป็นของทีม (อ้างอิง Wongnai) หรือใช้ตารางของ Wongnai โดยตรง? ถ้าใช้ตรง ขออนุญาตแล้วหรือยัง? | ขัดกันระหว่าง OQ-01 กับ OQ-19 | PO / Legal |
| 3 | US-PH-004 ใช้ Mapping อาชีพ→คู่เลขของเบอร์จากแหล่งใด — หรือย้ายเป็น P1? | Story P0 ไม่มีข้อมูล | PO / Domain Expert |
| 4 | Back-office Login (Editor/Admin) อยู่ใน MVP ใช่หรือไม่ และใช้วิธีใด? | Security + Estimate | PO / Security |
| 5 | ใครเขียน/ตรวจความหมายคู่เลข 00–99 และความหมายผลรวม ส่งเมื่อใด? เบอร์กับทะเบียนใช้ชุดเดียวกันหรือไม่? | Go-live readiness | PO / Content |
| 6 | PO จะ Sign-off v1.3 เมื่อใด? | เริ่ม Sprint | PO |
| 7 | Rollback ต้องผ่าน Approve หรือไม่ ใครทำได้? | Segregation of Duties | PO |
| 8 | Validation Edge ของเบอร์และทะเบียน (GAP-040/041) | Parser/Error message | PO / Domain Expert |
| 9 | "เลขหน้ารวมเลขหลังได้ 13" นิยามอย่างไร? | ทดสอบได้ | Domain Expert |
| 10 | Rate limit และ SLO baseline? | ป้องกัน Scraping/Sizing | Architect |
| 11 | ข้อความ Disclaimer และคำเตือนขับขี่ — ใครอนุมัติ? | Legal/Brand | Legal / Content |

---

## 12. Action Items & Final Readiness

| # | Action | Owner | Priority | Blocking? |
| --- | --- | --- | --- | --- |
| 1 | ส่ง Rule Data ที่ยืนยัน (OQ-02/06/07/19 + ตารางค่าอักษร + การลดหลัก + ตารางระดับผลรวม) และ Golden Tests พร้อมกำหนดวันส่ง | Domain Expert | Critical | **Yes** — Block Done ของ Story วิเคราะห์ (ไม่ Block เริ่ม Dev) |
| 2 | แก้ข้อขัดแย้ง OQ-01 vs OQ-19 (ที่มาของ Rule Set Default) | PO / Legal / Domain Expert | High | Yes — Block Go-live |
| 3 | ตัดสิน US-PH-004: เพิ่ม Mapping อาชีพ→คู่เลขใน §17.2 หรือย้ายเป็น P1 | PO | High | **Yes** (US-PH-004) |
| 4 | เพิ่ม Story Back-office Login & Role (เสนอ US-AD-007) + แก้ Actor AD-001/002 ตาม OQ-12 + เพิ่ม Domain Expert/Moderator ใน §3 | PO / BA / Security | High | **Yes** (EP-08) |
| 5 | ตั้ง Content Backlog: ความหมายคู่เลข/ผลรวม/บทความ (จำนวน, Owner, ผู้ตรวจ, วันส่ง) | PO / Content | High | Yes — Block Go-live |
| 6 | PO Sign-off Decision v1.3 (§16, §17, §20) | PO | High | **Yes** — Block Sprint Planning |
| 7 | ย้ายค่ากฎออกจาก AC ของ US-LP-003/004/006 ไปเป็น Draft Rule Data | BA | High | No |
| 8 | แก้ AC และ Journey §14 ให้ตรง v1.3 (GAP-038) | BA / UX | Medium | No |
| 9 | เพิ่มตาราง Validation ทะเบียน + Edge ของเบอร์ใน §17.1 | PO / SA | Medium | No (แต่ควรเสร็จก่อนเริ่ม PH-001/LP-001) |
| 10 | ระบุ AC ขั้นต่ำของ US-AD-005 + สิทธิ์ Rollback | PO | Medium | No |
| 11 | จำกัด US-AD-003 ใน MVP เป็นอาชีพ/เป้าหมาย | PO | Medium | No |
| 12 | นิยาม "เลขหน้า/เลขหลัง" (LP-004) และแยก LP-004 เป็น 2 Story | Domain Expert / BA | Medium | No |
| 13 | รวม Master list อาชีพเป็นชุดเดียว (AD-003) | BA | Medium | No |
| 14 | NFR baseline: Rate limit, SLO | Architect | Medium | No |
| 15 | เพิ่ม OQ-21 Masking policy (สำหรับ US-RV-005, P1) | BA | Medium | No |
| 16 | Spike Rule Set schema + Versioning + Golden Test runner | Engineering | High | No (ทำขนานกับ #1) |
| 17 | ลบตารางเก่าที่ค้างใน §20 และหมายเหตุ P0 ที่ค้างใน §12 EP-07 | BA | Low | No |
| 18 | เปลี่ยน Actor "User" เป็น Guest ใน Story P0; เพิ่มคอลัมน์ Priority ใน §5 | BA | Low | No |
| 19 | AC บทความ Static: Pagination/SEO; Copy คำเตือนขับขี่ | BA / Content | Low | No |

**Final Status:** **Needs Clarification**

**Rationale:**
v1.3 ปิด Blocker ด้าน Scope ที่พบใน v1.2 ได้ครบ ทั้งตัวเลข MVP, Dependency ของรีวิว, แหล่งข้อมูลการค้นหาเบอร์, Validation, รูปแบบทะเบียน, Retention และ Publish Workflow ทีมจึงเริ่ม Refinement และ Spike โครง Rule Engine, Validation และบทความ Static ได้ทันทีหลัง PO Sign-off

แต่ยังไม่ถึง Ready เพราะ (1) กฎเลขศาสตร์ทั้งหมดยังเป็น Assumption และยังไม่มี Golden Tests ทำให้ Story วิเคราะห์ทดสอบผลไม่ได้ (Critical) (2) US-PH-004 ไม่มีแหล่งกฎ — สถานะ Not Ready (3) ไม่มี Story สำหรับ Back-office Login/RBAC ทั้งที่ Workflow ของ OQ-12 ต้องใช้ (4) ที่มาของ Rule Set Default ขัดกันระหว่าง OQ-01 กับ OQ-19 และ (5) เนื้อหาความหมายที่ต้องเรียบเรียงเองยังไม่มีแผน

**[RECOMMENDATION] ลำดับถัดไป:** PO Sign-off → ตัดสิน US-PH-004 + เพิ่ม US-AD-007 → Spike Rule Engine ขนานกับ Domain Expert ทำ Golden Tests → แตก API/Data Model สำหรับ SA

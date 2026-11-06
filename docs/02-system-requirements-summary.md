# สรุปเอกสาร — System Requirements Specification (`requirement/system-requirements.md`)

> **วันที่:** 2026-11-06 · **ผลลัพธ์:** [`system-requirements.md`](../requirement/system-requirements.md) v1.0 · **สถานะ:** Accepted (Demo)
> **ที่มา:** [User Stories v1.3](../user-story/numerology-user-stories-review.md) · [Reference Data](../user-story/reference-data/README.md) · [Playwright Test Cases](../user-story/test-cases/playwright-test-cases.md) (ดูสรุปขั้นก่อนหน้าที่ [`00-user-story-session-summary.md`](00-user-story-session-summary.md))
> **ขอบเขต:** MVP Phase 1 = 14 Stories — US-PH-001/002/004, US-LP-001–005, US-CT-001/002, US-AD-001/002/003/005

## 1. วัตถุประสงค์
- แปลง User Stories v1.3 ให้เป็น Requirement ที่ทดสอบได้ โดยมีทั้ง FR, BR, ค่าขอบ, สเปก API, NFR และ Data Model
- ทุกข้อของ FR ผูกกับ Story และรหัส Test Case ใน `playwright-test-cases.md` เพื่อตรวจย้อนกลับได้
- คำศัพท์: **"ต้อง"** = บังคับและทดสอบได้ · **"ควร"** = ทางเลือก

## 2. Actors & System Boundary
| Actor | สิทธิ์ |
| --- | --- |
| Guest | วิเคราะห์เบอร์และทะเบียน อ่านบทความ ค้นหาคู่เลข โดยไม่ต้อง Login |
| Content Editor | สร้างและแก้ Draft ของกฎ ความหมายคู่เลข และหมวด |
| Admin | ทำได้ทุกอย่างที่ Editor ทำได้ และ Approve / Publish / Rollback / ดู Audit Log ได้ |
| Rule Store | ไฟล์ JSON ใน `reference-data/` (ในเอกสารยังไม่มีฐานข้อมูลจริง) |

**นอกขอบเขต:** สมาชิก รีวิว Marketplace คะแนน 0–100 การตรวจสถานะทะเบียนกับกรมการขนส่งทางบก และการชำระเงิน

## 3. ตัวเลขสรุป
| หมวด | จำนวน | รายละเอียด |
| --- | ---: | --- |
| Functional Requirements | 32 | FR-PH 9 · FR-LP 11 · FR-CT 4 · FR-AD 8 |
| Business Rules | 23 | BR-PH 6 · BR-LP 10 · BR-AD 4 · BR-CM 2 · BR-PV 1 |
| Non-Functional Requirements | 20 | Performance, Correctness, Security, Privacy, Audit, A11y, Compatibility, Usability, Observability, Availability, Compliance |
| Error Codes | 22 | HTTP 400 / 401 / 403 / 409 / 423 / 429 / 500 |
| Entities | 7 | RuleSet, PairMeaning, PlateRule, Category, Article, AuditLog, UsageStat |

## 4. Functional Requirements ที่สำคัญ
| กลุ่ม | ประเด็นหลัก |
| --- | --- |
| เบอร์โทร (FR-PH) | Normalize แล้ว Validate · แยกคู่เลขติดกันตำแหน่ง 2–10 ได้ **8 คู่** · แสดงระดับ `good`/`caution`/`avoid`/`no-data` · ถ้าไม่มีข้อมูลให้แสดง `ไม่มีข้อมูล` ห้ามแต่งคำทำนายเอง · แสดง Rule Set, เวอร์ชัน และแหล่งทุกครั้ง · เลือกอาชีพหรือเป้าหมายได้ (ไม่บังคับ) |
| ทะเบียน (FR-LP) | คำนวณผลรวม **2 แบบพร้อมกัน** (เฉพาะตัวเลข / รวมค่าอักษร) พร้อมแสดงสูตรทีละตัว · วันเกิด 8 ค่า (แยกพุธกลางวันและกลางคืน) · Highlight เลขและอักษรที่ควรเลี่ยง · ตรวจรูปแบบ `one-bracket` และ `front-back-13` · แสดง "ไม่ได้ยืนยันสถานะทะเบียน" ทุกครั้ง |
| เนื้อหา (FR-CT) | บทความ Static Markdown กรองหมวดและค้นหาได้ · Slug ที่ไม่มีอยู่ได้หน้า 404 · ค้นหาคู่เลขแบบกลุ่ม (24 = 42) |
| หลังบ้าน (FR-AD) | ต้อง Login และมี Role · Draft → Diff/Preview → Approve → Publish · Rollback สร้างเวอร์ชันใหม่โดยไม่ลบประวัติ · ทุกการกระทำต้องลง Audit Log · เปิด/ปิดหมวดได้ |

## 5. Business Rules ที่ต้องระวัง
- **BR-PH-01…04:** ตัดช่องว่างและขีด → แปลงเลขไทยเป็นอารบิก → แปลง `+66`/`66` เป็น `0` → ต้องเหลือ 10 หลักพอดีและขึ้นต้น `06`/`08`/`09`
- **BR-LP-01…04:** รูปแบบ `[1–9 ไม่บังคับ][พยัญชนะไทย 1–2 ตัว][1–9999 ไม่ขึ้นต้นด้วย 0]`
- **BR-LP-06/07:** ผลรวมรวมอักษรใช้ค่าทักษา (ฎ ฏ ฐ = 9) และ**ไม่ลดเหลือหลักเดียว**
- **BR-LP-08:** เลขตามวันเกิดใช้ `plate-wongnai-v1` ส่วนอักษรที่ควรเลี่ยงใช้ `plate-allianz-v1` และต้องระบุแหล่งแยกกัน
- **BR-LP-09:** ลำดับความสำคัญ `avoidPairs` > `avoidPatterns` > `occupationPairs` > ความหมายทั่วไป · คู่ 35/53 = `caution`
- **BR-AD-01/02:** ผู้สร้างห้าม Approve งานของตนเอง · สถานะ `Draft → Approved → Published → Superseded`
- **BR-CM / BR-PV:** ห้ามใช้คำ "แม่นที่สุด / รับประกัน / พิสูจน์แล้ว" · ข้อมูล Mock ต้องมีป้าย · ห้ามเก็บค่าที่ Guest กรอก

## 6. ค่าขอบและช่วงผลลัพธ์ (ตัวอย่าง)
| รายการ | ผ่าน | ไม่ผ่าน |
| --- | --- | --- |
| เบอร์ | 10 หลัก, `+66` + 9 หลัก, prefix 06/08/09 | 9 หรือ 11 หลัก (`PHONE_INVALID_LENGTH`), prefix 05/07 (`PHONE_NOT_MOBILE`) |
| ทะเบียน | `ก 1`, `9กข 9999` | `0กข 1`, `กขค 1`, `กข 10000`, `กข 0123` |
| ผลรวม | เฉพาะตัวเลข 1–45 · รวมอักษร 2–63 | — |
| อื่น ๆ | ค้นหาคู่เลข `00`–`99` · คำค้นไม่เกิน 100 ตัวอักษร | Rate limit ครั้งที่ 31 ต่อนาที → 429 · Login ผิด 5 ครั้ง → ล็อก 15 นาที · Session idle 30 นาที |

## 7. Output Specification
- `POST /api/v1/phone/analyze` → คืน `normalized`, `ruleSet` (มี `isMock`), `pairs[]`, `recommendation`, `disclaimer`
- `POST /api/v1/plate/analyze` → คืน `plate`, `ruleSets[]`, `sums[]` (2 วิธี พร้อม `terms`), `pairs[]`, `patterns[]`, `birthDay`, `notices[]`
- ทุก Response ใช้ envelope `{ success, data, error }` · ใน Error มี `code`, `message` (ภาษาไทย) และ `field` · ห้ามส่ง Stack trace

## 8. NFR ที่สำคัญ
| หมวด | ข้อกำหนด |
| --- | --- |
| Performance | p95 ≤ 500 ms ที่ 50 ผู้ใช้พร้อมกัน · LCP ≤ 2.5 วินาที บน Mobile 4G |
| Correctness | Deterministic และ Golden Tests ต้องผ่านทุกเคสก่อน Publish |
| Security | RBAC ฝั่ง Server · Hash รหัสผ่าน (bcrypt/argon2) · Rate limit · CSP |
| Privacy | ส่งข้อมูลผ่าน POST body เท่านั้น · ไม่เก็บใน Browser Storage · Mask ค่าใน Log (`081****678`) |
| Audit | Append-only และบันทึกเวลาเป็น UTC |
| A11y / Compatibility | WCAG 2.2 AA · ใช้ด้วยคีย์บอร์ดได้ · Chrome, Firefox, Safari · จอกว้าง 360 px ขึ้นไป |
| Observability | มี `X-Request-Id` ในทุก Response |

## 9. Assumptions ของเอกสาร
1. Rule Store เป็นไฟล์ JSON และการ Publish คือการเขียนไฟล์เวอร์ชันใหม่ (Demo)
2. บัญชี Editor และ Admin สร้างไว้ล่วงหน้าด้วย Seed ไม่มีหน้าสมัคร
3. Audit Log เก็บเวลาเป็น UTC และแสดงเป็นเวลาไทย (UTC+7)
4. ตาม BR-LP-04 เคส `PP-006` เปลี่ยนเป็นทะเบียน `กข 3070` แล้ว

## 10. การนำไปใช้ต่อ
- **BUILD-PROMPT / เว็บ MVP:** ใช้ FR, BR, Error Code และ Output Spec ชุดนี้ · ตอนสร้างเว็บจริงเปลี่ยน Rule Store เป็น PostgreSQL แต่คงเลเยอร์ Domain / Service / Repository ไว้
- **TEST-PLAN / E2E:** ใช้ค่าขอบใน §4 และรหัส Test ในตาราง FR เป็นฐานของ Test Case

## 11. สิ่งที่ต้องทำต่อ
1. อัปเดต Revision History เมื่อ User Story เปลี่ยน หรือเมื่อ Domain Expert ยืนยันกฎแล้ว
2. Assumption ข้อ 1 ไม่ตรงกับเว็บจริงที่ใช้ PostgreSQL ควรแก้ §1 และ §8 ให้ตรงกัน
3. ประเด็นที่ยังเปิดจากรีวิว User Story (เช่น Story สำหรับ Login หลังบ้าน) ยังไม่มีใน Story ต้นทาง แม้ FR-AD-01 และ NFR-06 จะกำหนดไว้แล้ว

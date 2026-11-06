# สรุป Session — เขียนและรีวิว User Stories (โฟลเดอร์ `user-story/`)

> **วันที่:** 2026-11-06 · **ผลลัพธ์:** [`numerology-user-stories-review.md`](../user-story/numerology-user-stories-review.md) v1.3, [รายงาน Review v1.3](../user-story/review-report/numerology-user-stories-review-report.md), [`reference-data/`](../user-story/reference-data/README.md), [`test-cases/`](../user-story/test-cases/playwright-test-cases.md)
> **ข้อจำกัดของขั้นนี้:** ทำเฉพาะเอกสาร ยังไม่มีโค้ด และยังไม่มีฐานข้อมูลจริง (ใช้ Reference/Mock Data แทน)

## 1. คำขอ
- เขียน User Stories ของ Web Application **"ระบบเลขมงคลและทะเบียนรถมงคล"** เพื่อใช้ทำ Product Discovery, Refinement, UX Design และประมาณงาน
- รีวิวเอกสารด้วย Skill `/user-story-reviewer` (มุม Senior BA/SA/PO/QA) แล้วแก้ไขตามผลรีวิวจนพร้อมเริ่มพัฒนา
- เตรียมข้อมูลอ้างอิงและ Test Case เพื่อให้ขั้นสร้างเว็บและขั้นทดสอบนำไปใช้ต่อได้

## 2. แหล่งอ้างอิง
| แหล่ง | ใช้อ้างอิง |
| --- | --- |
| DECODER159 | แนวคิดวิเคราะห์เบอร์ จัดกลุ่มเบอร์ ค้นหาเบอร์ บทความ ซื้อขายเบอร์ |
| Allianz | เลขดี/เลข และอักษรที่ควรเลี่ยงตามวันเกิด ความหมายผลรวม |
| Wongnai | ผลรวม 2 แบบ (เฉพาะตัวเลข / รวมค่าอักษรตามหลักทักษา) ระดับผลรวม กาลกิณี เลขตามอาชีพ |
| tabien2you | ใช้ได้เฉพาะ UX (รายการทะเบียน ราคา สถานะ) เพราะหน้าเว็บไม่เปิดเผยสูตร |

ข้อกำหนดที่ใช้ตลอดทั้งเอกสาร:
- เนื้อหาเป็นความเชื่อ จึงต้องแสดง Disclaimer
- ทุกกฎต้องระบุแหล่งและเวอร์ชันของ Rule Set
- ห้ามใช้ถ้อยคำแนว "แม่นที่สุด"
- ห้ามคัดลอกข้อความต้นฉบับ ให้เก็บเฉพาะสรุปสาระ

## 3. วิวัฒนาการของเอกสาร
| เวอร์ชัน | สิ่งที่เปลี่ยน |
| --- | --- |
| v1.0 | ร่างแรก: Personas, Epics, Stories, Journeys, Technical Considerations |
| v1.1 | เพิ่ม EP-07 ระบบรีวิวและความน่าเชื่อถือ (US-RV-001…009) |
| v1.2 | เพิ่มแหล่งทะเบียนรถ Wongnai/tabien2you · ผลรีวิวคือ **Not Ready** (Critical 6 / High 12 / Medium 11 / Low 5) |
| v1.3 | ตัดสิน Blocker: ลด MVP เหลือ 14 Stories, ตอบ OQ หลัก, เพิ่ม §17.1 Validation เบอร์, §17.2 Blocker และ Decision Log §20 · ผลรีวิวคือ **Needs Clarification** (Critical 1 / High 6 / Medium 11 / Low 5) |

## 4. โครงขอบเขต — 8 Epics / 42 Stories
| Epic | ขอบเขต | Stories | ใน MVP |
| --- | --- | ---: | --- |
| EP-01 | วิเคราะห์เบอร์โทรศัพท์ | 5 | US-PH-001, 002, 004 |
| EP-02 | ค้นหาและแนะนำเบอร์ | 4 | — (P1 มาพร้อม Marketplace) |
| EP-03 | วิเคราะห์ทะเบียนรถ | 7 | US-LP-001 – 005 |
| EP-04 | Knowledge Base & บทความ | 3 | US-CT-001 (Static Markdown), 002 |
| EP-05 | สมาชิกและการเปรียบเทียบ | 3 | — |
| EP-06 | Marketplace | 5 | — (Phase 3) |
| EP-07 | รีวิวและความน่าเชื่อถือ | 9 | — (P1 มาพร้อมสมาชิก + ต้องทำ DPIA) |
| EP-08 | Admin & Rule Management | 6 | US-AD-001, 002, 003, 005 (เฉพาะ Approve + Rollback) |

**หลักการของ MVP Phase 1 (14 Stories):** รองรับเฉพาะ Guest · ใช้ Rule Set แบบ fixed ชุดเดียว (ไม่มีตัวเลือกศาสตร์) · บทความเป็น Static Markdown · ไม่เก็บค่าที่ Guest กรอก · ไม่ตรวจว่าทะเบียนว่างหรือไม่

## 5. การตัดสินใจหลัก (Decision Log §20 — ทุกข้อเป็น Accepted (Demo))
| หัวข้อ | การตัดสินใจ |
| --- | --- |
| บริบทโปรเจกต์ | เป็น Demo (การบ้าน) เจ้าของโปรเจกต์มอบให้ Claude ตัดสินแทน PO/Domain Expert ถ้านำไปใช้จริงต้องทบทวนใหม่ |
| Validation เบอร์ (§17.1) | รับเฉพาะมือถือ 10 หลักที่ขึ้นต้น 06/08/09 · ตัดขีดและช่องว่าง และแปลง `+66`/`66` เป็น `0` · ไม่รับเบอร์บ้าน |
| คู่เลขเบอร์ (OQ-02) | ใช้คู่ติดกันตำแหน่ง 2–10 รวม 8 คู่ ใช้ Rule Set `pairs-common-belief-mock` ถ้าคู่ใดไม่มีข้อมูลให้แสดง "ไม่มีข้อมูล" |
| รูปแบบทะเบียน (OQ-05) | รองรับเฉพาะรถยนต์ส่วนบุคคลมาตรฐาน `[เลข 0–1 หลัก][พยัญชนะ 1–2 ตัว][เลข 1–4 หลัก]` · จังหวัดไม่มีผลต่อการคำนวณ |
| ผลรวมทะเบียน (OQ-07) | แสดง 2 แบบพร้อมป้ายกำกับ: เฉพาะตัวเลข และรวมค่าอักษรตามหลักทักษา |
| Rule Set ทะเบียน (OQ-19) | ใช้ `plate-wongnai-v1` เป็นค่าเริ่มต้น และเก็บ `plate-allianz-v1` แยกไว้ (ปิดใน MVP) เพราะสองแหล่งขัดกัน 7 ใน 8 วัน · อักษรที่ควรเลี่ยงใช้ข้อมูลของ Allianz และระบุแหล่งในผลลัพธ์ |
| ลำดับความสำคัญของกฎ | ควรเลี่ยง > แนะนำตามอาชีพ > ความหมายทั่วไป → 35/53 แสดงเป็น "ควรระวัง" |
| ข้อมูล Guest (OQ-11) | ไม่เก็บค่าที่กรอก เก็บเฉพาะสถิติรวม และต้อง mask ค่าใน Log |
| Publish กฎ (OQ-12) | 2 ขั้น: Editor สร้าง Draft → Admin Approve · ผู้สร้างห้าม Approve เอง · Rollback ได้ทันที |
| Marketplace (OQ-09) | มีเฉพาะ Listing และการติดต่อผู้ขาย ไม่มีธุรกรรมในระบบ (Phase 3) |

## 6. ผลรีวิว v1.3 — ประเด็นที่ยังเปิด
1. **[Critical]** กฎเลขศาสตร์ยังเป็น Assumption ทั้งหมด และยังไม่มี Golden Test Cases จาก Domain Expert
2. **[High]** OQ-01 ห้ามคัดลอกสูตรของเว็บอ้างอิง แต่ OQ-19 ใช้ค่าเริ่มต้น "ตาม Wongnai" ซึ่งขัดกัน
3. **[High]** US-PH-004 ไม่มีแหล่งกฎที่จับคู่อาชีพกับคู่เลขของเบอร์
4. **[High]** ไม่มี Story สำหรับ Login และ Role ของหลังบ้าน (เสนอเพิ่ม US-AD-007)
5. **[High]** ยังไม่มีผู้รับผิดชอบและกำหนดส่งเนื้อหาความหมายคู่เลขและผลรวม
6. **[High]** Decision ของ v1.3 ยังรอ PO Sign-off

ตาราง Traceability §3.1 ติดตามประเด็นจากรีวิว v1.2 (GAP-001…034): ปิดแล้ว 10 / ยังเปิด 14 / เลื่อนออกไป (Deferred) 10 · ประเด็นใหม่เริ่มที่ GAP-035

## 7. ข้อมูลอ้างอิงและ Test Case ที่สร้าง
| ไฟล์ | เนื้อหา | สถานะ |
| --- | --- | --- |
| `reference-data/plate-rules.json` | สูตรผลรวม ค่าอักษร ระดับผลรวม เลขตามวันเกิดและอาชีพ (Wongnai) | Draft |
| `reference-data/plate-rules-allianz.json` | เลขและอักษรที่ควรเลี่ยงตามวันเกิด (Allianz) | Draft |
| `reference-data/source-comparison.md` | ตารางเทียบแหล่งข้อมูลและจุดที่ขัดแย้งกัน | ใช้ประกอบการตัดสินใจ |
| `reference-data/pair-meanings.json` | ข้อดีและข้อเสียของคู่เลข 25 กลุ่ม | Mock |
| `reference-data/phone-categories.json`, `mock-listings.json`, `mock-reviews.json` | ประเภทเบอร์ อาชีพ ประกาศ และรีวิวตัวอย่าง | Mock |
| `test-cases/golden-cases.json` | Golden Cases: คู่เลขเบอร์ 8 · ผลรวมทะเบียน 8 · วันเกิด 8 · คู่เลขทะเบียน 7 (รวม 31) | ใช้เป็น Fixture |
| `test-cases/playwright-test-cases.md` | Routes, สัญญา `data-testid`, 164 เคสใน 14 Stories พร้อมหมวด A11y, Mobile, Privacy และ Security | v1.0 |

กติกาการใช้ข้อมูล:
- ข้อมูลที่มี `status: mock` ห้ามขึ้น Production และหน้าเว็บต้องแสดงป้าย "ข้อมูลตัวอย่าง"
- ผลลัพธ์ต้องแสดง `ruleSetId`, `version` และ `source` ทุกครั้ง

## 8. การนำไปใช้ต่อ
- **ขั้น 01–02:** `BUILD-PROMPT.md` และเว็บ MVP ใช้ 14 Stories, Decision §20 และ `reference-data/` เป็น Seed (`npm run gen:seed`)
- **ขั้น 05–07:** `TEST-PLAN.md` และชุด E2E ใช้ testid และ Golden Cases จาก `test-cases/`

## 9. สิ่งที่ต้องทำต่อ
1. PO Sign-off Decision ของ v1.3 (§16, §17, §20)
2. Domain Expert ยืนยัน OQ-02/06/07/19 และส่ง Golden Test Cases อย่างน้อย 10 เคสต่อฟีเจอร์ (§17.2)
3. Legal ตรวจสิทธิการใช้เนื้อหา (OQ-01) และ Disclaimer — Block Go-live แต่ไม่ Block Dev
4. แก้ประเด็น High ในข้อ 6 · ปรับ AC และ Journey §14 ให้ตรงกับ v1.3 · ย้ายค่ากฎออกจาก AC ของ LP-003/004/006 · ทำ DPIA ก่อนเริ่ม EP-07

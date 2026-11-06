# Test Data Specification — ระบบเลขมงคลและทะเบียนรถมงคล (MVP)

> **Version:** 1.1 · **Date:** 2026-11-07 · **Status:** Accepted (Demo) · v1.1: คู่เลขเปลี่ยนเป็นข้อมูลจาก decoder159.com (research/decoder159/)
> **ใช้กับ:** [Playwright Test Cases](../user-story/test-cases/playwright-test-cases.md) · [Golden Fixture](../user-story/test-cases/golden-cases.json) · [System Requirements](../requirement/system-requirements.md) · [ERD](../design/erd.md)
> **กติกา:** ค่าที่คาดหวังทุกค่าคำนวณจาก `reference-data/` (Rule Set Default) — ถ้ากฎเปลี่ยน ต้อง regenerate ไม่แก้มือ

---

## 1. Environment & Reset

| รายการ | ค่า |
| --- | --- |
| Base URL | `http://localhost:3000` |
| คำสั่งเริ่มเซิร์ฟเวอร์ทดสอบ | `npm run start:test` (Playwright `webServer`) |
| Health check | `GET /api/health` → 200 |
| Seed source | `user-story/reference-data/*.json`, `test-data/seed/*` |
| Reset | `globalSetup` copy seed → `data/` ก่อนทุกรอบ, `globalTeardown` ลบ `data/` |
| Rate limit ในโหมดทดสอบ | ปิดเป็นค่าเริ่มต้น (`RATE_LIMIT_ENABLED=false`) — เปิดเฉพาะ spec `@security` |
| เวลา | Fix ด้วย `page.clock` ที่ `2026-11-06T09:00:00+07:00` เมื่อทดสอบ Lockout / Session |

> ข้อมูลทั้งหมดในเอกสารนี้เป็น **ข้อมูลสมมติสำหรับทดสอบ** เบอร์/ทะเบียนอาจบังเอิญตรงกับของจริง ห้ามใช้โทรหรือส่ง SMS

---

## 2. Seed — ผู้ใช้หลังบ้าน (`data/users.json`)

| Key | username | password (ทดสอบเท่านั้น) | role | สถานะเริ่มต้น | ใช้ในเคส |
| --- | --- | --- | --- | --- | --- |
| U-ED1 | `editor.test` | `Editor#Test2026` | EDITOR | ปกติ | AD-003–005, AD-013–015 |
| U-ED2 | `editor2.test` | `Editor2#Test2026` | EDITOR | ปกติ | ทดสอบ Editor ไม่เห็นปุ่ม Approve |
| U-AD1 | `admin.test` | `Admin#Test2026` | ADMIN | ปกติ | AD-006–012, AD-016–020 |
| U-AD2 | `admin2.test` | `Admin2#Test2026` | ADMIN | ปกติ | ทดสอบ Self-approve + Version conflict |
| U-LCK | `locked.test` | `Locked#Test2026` | EDITOR | `failed_login_count=4` | ผิดอีก 1 ครั้ง → ล็อก |

- เก็บใน seed เป็น **hash** เท่านั้น รหัสผ่าน plain text อ่านจาก env `TEST_*_PASSWORD` ใน CI — ค่าในตารางเป็นค่า default ของเครื่อง dev
- ห้ามใช้บัญชีเหล่านี้นอก environment ทดสอบ

---

## 3. Seed — Rule Sets

| ruleSetId | version | สถานะ | ไฟล์ | หมายเหตุ |
| --- | --- | --- | --- | --- |
| `pairs-common-belief-mock` | `0.1.0-mock` | PUBLISHED | `pair-meanings.json` | เนื้อหาจาก decoder159.com (เก็บ 2026-11-07, เรียบเรียงใหม่) · `isMock=true` → ต้องเห็น `demo-badge` |
| `plate-wongnai-v1` | `1.0.0-draft` | PUBLISHED | `plate-rules.json` | Default ทะเบียน |
| `plate-allianz-v1` | `1.0.0-draft` | PUBLISHED | `plate-rules-allianz.json` | ใช้เฉพาะ `avoidLetters` |
| `phone-categories-mock` | `0.1.0-mock` | PUBLISHED | `phone-categories.json` | อาชีพ 8 · เป้าหมาย 5 |

**ค่าอ้างอิงที่เคสใช้บ่อย**

| ข้อมูล | ค่า |
| --- | --- |
| ค่าอักษร | ก=1 · ข=2 · ฆ=3 · ค=4 · ม=5 · ด=1 · ท=1 · ศ=7 · ส=7 · ฎ=9 |
| คู่ที่ **ไม่มีข้อมูล** (ใช้ทดสอบ `no-data`) | 33, 47/74 |
| คู่ avoid (เบอร์) | 00–09 และกลับด้าน, 11, 12/21, 13/31, 17/71, 18/81, 25/52, 27/72, 34/43, 37/73, 38/83, 48/84, 57/75, 58/85, 67/76, 68/86, 77, 88 |
| คู่ caution | ไม่มีในความหมายทั่วไป · ทะเบียน: 35/53 (avoidPairs + อาชีพ) |
| ผลรวมดีเยี่ยม | 14/41, 15/51, 24/42, 36/63, 45/54, 56/65, 59/95 |
| ผลรวมควรเลี่ยง | 13, 31, 37 |

---

## 4. Seed — บทความ (`content/articles/*.md`)

| slug | title | category | author | updatedAt | references | ใช้ในเคส |
| --- | --- | --- | --- | --- | --- | --- |
| `how-to-read-phone-pairs` | วิธีอ่านคู่เลขเบอร์โทร | phone | ทีมเนื้อหา (ทดสอบ) | 2026-11-01 | 1 ลิงก์ภายนอก | AR-001–003, AR-009 |
| `plate-sum-two-methods` | ผลรวมทะเบียน 2 แบบ | plate | ทีมเนื้อหา (ทดสอบ) | 2026-11-02 | Wongnai | AR-004, AR-005 |
| `birthday-and-plate` | วันเกิดกับทะเบียนรถ | plate | ทีมเนื้อหา (ทดสอบ) | 2026-11-03 | Wongnai, Allianz | AR-004 |
| `belief-disclaimer` | เลขมงคลเป็นความเชื่อ | general | ทีมเนื้อหา (ทดสอบ) | 2026-11-04 | — | CP-001 |

| คำค้น | ผลที่คาดหวัง |
| --- | --- |
| `ผลรวม` | `plate-sum-two-methods` |
| `คู่เลข` | `how-to-read-phone-pairs` |
| `zzzz-ไม่มี` | Empty state (AR-006) |
| `ก` × 100 ตัว | ค้นได้ (ขอบบน) |
| `ก` × 101 ตัว | `QUERY_TOO_LONG` |
| slug `not-exist` | 404 (AR-007) |

---

## 5. ข้อมูลทดสอบเบอร์โทรศัพท์

### 5.1 Valid / Normalize

| Key | Input | Normalized | เคส |
| --- | --- | --- | --- |
| PD-V01 | `0812345678` | `0812345678` | PH-001 |
| PD-V02 | `0612345678` | `0612345678` | PH-002 (prefix ขอบล่าง) |
| PD-V03 | `0912345678` | `0912345678` | PH-003 (prefix ขอบบน) |
| PD-V04 | `081-234-5678` | `0812345678` | PH-004 |
| PD-V05 | `081 234 5678` | `0812345678` | PH-005 |
| PD-V06 | `+66812345678` | `0812345678` | PH-006 |
| PD-V07 | `66812345678` | `0812345678` | PH-007 |
| PD-V08 | `␠␠0812345678␠␠` | `0812345678` | PH-008 |
| PD-V09 | `๐๘๑๒๓๔๕๖๗๘` | `0812345678` | PH-016 |
| PD-V10 | `+66-81-234-5678` | `0812345678` | ผสมหลายรูปแบบ |

### 5.2 Invalid

| Key | Input | Error Code | เคส |
| --- | --- | --- | --- |
| PD-I01 | `` (ว่าง) | `PHONE_REQUIRED` | PH-015 |
| PD-I02 | `␠␠␠` | `PHONE_REQUIRED` | ช่องว่างล้วน |
| PD-I03 | `081234567` (9) | `PHONE_INVALID_LENGTH` | ขอบล่าง −1 |
| PD-I04 | `08123456789` (11) | `PHONE_INVALID_LENGTH` | ขอบบน +1 |
| PD-I05 | `08123` | `PHONE_INVALID_LENGTH` | PH-012 |
| PD-I06 | `081234567890` | `PHONE_INVALID_LENGTH` | PH-013 |
| PD-I07 | `+6681234567` | `PHONE_INVALID_LENGTH` | +66 + 8 หลัก |
| PD-I08 | `+668123456789` | `PHONE_INVALID_LENGTH` | +66 + 10 หลัก |
| PD-I09 | `08a2345678` | `PHONE_INVALID_CHAR` | PH-014 |
| PD-I10 | `0812.345.678` | `PHONE_INVALID_CHAR` | จุดไม่ใช่ตัวคั่นที่รองรับ |
| PD-I11 | `021234567` | `PHONE_NOT_MOBILE` | PH-009 |
| PD-I12 | `0512345678` | `PHONE_NOT_MOBILE` | PH-011 |
| PD-I13 | `0712345678` | `PHONE_NOT_MOBILE` | PH-010 |
| PD-I14 | `1812345678` | `PHONE_NOT_MOBILE` | ไม่ขึ้นต้น 0 |
| PD-I15 | `+1 202 555 0100` | `PHONE_NOT_MOBILE` | PH-017 |
| PD-I16 | `0` × 21 ตัว | `PHONE_INVALID_LENGTH` | ยาวเกิน 20 ก่อน Normalize |

### 5.3 Golden — คู่เลข (6 คู่ ตำแหน่ง 4–10 — ไม่ดู 3 หลักแรก, CR 2026-11-07)

| Key | เบอร์ | คู่ | Grade | เคส |
| --- | --- | --- | --- | --- |
| PD-G01 | `0812345678` | 23 34 45 56 67 78 | good avoid good good avoid good | PR-001 |
| PD-G02 | `0891245678` | 12 24 45 56 67 78 | avoid good good good avoid good | PR-002 |
| PD-G03 | `0861313737` | 13 31 13 37 73 37 | avoid avoid avoid avoid avoid avoid | PR-003 |
| PD-G04 | `0816365656` | 63 36 65 56 65 56 | good good good good good good | PR-004 |
| PD-G05 | `0927878999` | 78 87 78 89 99 99 | good good good good good good | PR-005 |
| PD-G06 | `0954242424` | 42 24 42 24 42 24 | good good good good good good | PR-006 |
| PD-G07 | `0800000000` | 00 00 00 00 00 00 | avoid avoid avoid avoid avoid avoid | PR-007 |
| PD-G08 | `0835353535` | 53 35 53 35 53 35 | good good good good good good | PR-015 |
| PD-G09 | `0861313347` | 13 31 13 33 34 47 | avoid avoid avoid no-data avoid no-data | TC-PH-06 (CR 2026-11-07: ครอบคลุม avoid + no-data หลังตัด 3 หลักแรก) |

### 5.4 อาชีพ / เป้าหมาย

| Key | เบอร์ | occupation | goal | Expected |
| --- | --- | --- | --- | --- |
| PD-O01 | `0891245678` | `trade` | — | มีคำแนะนำ + เหตุผล (OC-003) |
| PD-O02 | `0891245678` | — | — | ผลทั่วไป ไม่มี error (OC-004) |
| PD-O03 | `0891245678` | `freelance` | — | ไม่มีกฎเฉพาะ → "ใช้ผลวิเคราะห์ทั่วไป" (OC-005) |
| PD-O04 | `0891245678` | — | `money` | คู่แนะนำทุกคู่มีหมวด money (OC-007) |
| PD-O05 | `0891245678` | `astronaut` | — | `INVALID_OPTION` (ยิง API ตรง) |
| PD-O06 | `0891245678` | `trade` | `fly` | `INVALID_OPTION` |

---

## 6. ข้อมูลทดสอบทะเบียนรถ

### 6.1 Valid / Normalize

| Key | prefix | letters | digits | Input แบบรวม | เคส |
| --- | --- | --- | --- | --- | --- |
| LD-V01 | — | กข | 1234 | `กข 1234` | LP-001 |
| LD-V02 | 1 | กข | 234 | `1กข 234` | LP-002 |
| LD-V03 | — | ก | 1 | `ก 1` | LP-003 (ขอบล่างทุกส่วน) |
| LD-V04 | — | กข | 1234 | `กข1234` | LP-004 |
| LD-V05 | — | กข | 1234 | `กข-1234` | LP-005 |
| LD-V06 | 9 | ฆฆ | 9999 | `9ฆฆ 9999` | LP-006 (ขอบบนทุกส่วน) |
| LD-V07 | ๑ | กข | ๑๒๓๔ | `๑กข ๑๒๓๔` | LP-019 → `1กข 1234` |

### 6.2 Invalid

| Key | Input | Error Code | เคส |
| --- | --- | --- | --- |
| LD-I01 | `0กข 1` | `PLATE_INVALID_PREFIX` | prefix = 0 |
| LD-I02 | `10กข 1` / `12กข 34` | `PLATE_INVALID_FORMAT` | LP-009 |
| LD-I03 | `1234` | `PLATE_LETTERS_REQUIRED` | LP-012 |
| LD-I04 | `กขค 123` | `PLATE_INVALID_FORMAT` | LP-007 |
| LD-I05 | `AB 1234` | `PLATE_INVALID_LETTER` | LP-010 |
| LD-I06 | `กา 123` | `PLATE_INVALID_LETTER` | LP-013 (สระ) |
| LD-I07 | `ก่ข 12` | `PLATE_INVALID_LETTER` | วรรณยุกต์ |
| LD-I08 | `กข` | `PLATE_DIGITS_REQUIRED` | LP-011 |
| LD-I09 | `กข 12345` | `PLATE_INVALID_FORMAT` | LP-008 |
| LD-I10 | `กข 0` | `PLATE_LEADING_ZERO` | ค่า 0 |
| LD-I11 | `กข 0123` | `PLATE_LEADING_ZERO` | ขึ้นต้น 0 |
| LD-I12 | (ว่างทั้งหมด) | `PLATE_LETTERS_REQUIRED` | LP-014 |
| LD-I13 | `กข 12` + birthDay `holiday` | `INVALID_OPTION` | ยิง API ตรง |

### 6.3 Golden — ผลรวม

| Key | ทะเบียน | เฉพาะตัวเลข | Grade | รวมอักษร | Grade | เคส |
| --- | --- | ---: | --- | ---: | --- | --- |
| LD-S01 | `1กข 5900` | 15 | excellent | 18 | no-data | SM-001 |
| LD-S02 | `กข 1234` | 10 | no-data | 13 | avoid | SM-002 |
| LD-S03 | `ฆฆ 9999` | 36 | excellent | 42 | excellent | SM-003 |
| LD-S04 | `กข 4550` | 14 | excellent | 17 | no-data | SM-004 |
| LD-S05 | `กข 37` | 10 | no-data | 13 | avoid | SM-005 |
| LD-S06 | `ขค 1771` | 16 | no-data | 22 | no-data | SM-006 |
| LD-S07 | `กก 9900` | 18 | no-data | 20 | no-data | SM-007 |
| LD-S08 | `กข 6500` | 11 | no-data | 14 | excellent | SM-008 |
| LD-S09 | `ก 1` | **1** (ต่ำสุด) | no-data | **2** (ต่ำสุด) | no-data | ขอบล่าง Output |
| LD-S10 | `9ฆฆ 9999` | **45** (สูงสุด) | excellent | 51 | excellent | ขอบบน Output |
| LD-S11 | `9ฎฎ 9999` | 45 | excellent | **63** (สูงสุด) | excellent | ขอบบน Output |
| LD-S12 | `1ก 1` | 2 | no-data | 3 | no-data | prefix ถูกนับ |
| LD-S13 | `กข 9999` | 36 | excellent | 39 | no-data | |
| LD-S14 | `ศส 5656` | 22 | no-data | 36 | excellent | อักษรค่า 7 |
| LD-S15 | `1กข 5900` ลดหลักเดียว | 15 → 6 | — | — | — | SM-012 |

### 6.4 Golden — วันเกิด (เลขจาก Wongnai · อักษรจาก Allianz)

| Key | ทะเบียน | birthDay | Highlight เลข | Highlight อักษร | เคส |
| --- | --- | --- | --- | --- | --- |
| LD-B01 | `1กข 5900` | `sun` | — | ข | BD-001 |
| LD-B02 | `กข 1234` | `mon` | 1 | — | BD-002 |
| LD-B03 | `กข 1234` | `tue` | 2 | ก, ข | BD-003 |
| LD-B04 | `1กข 5900` | `wed-night` | 5 | — | BD-004 |
| LD-B05 | `1กข 5900` | `wed-day` | — | — | BD-005 |
| LD-B06 | `กข 4550` | `sat` | 4 | — | BD-006 |
| LD-B07 | `ฆฆ 9999` | `fri` | — | — | BD-007 |
| LD-B08 | `ดท 7777` | `thu` | 7 ×4 | ด, ท | BD-008 |
| LD-B09 | `กข 1234` | — | — | — | BD-010 (ไม่เลือกวันเกิด) |

### 6.5 Golden — คู่เลขและรูปแบบ

| Key | ทะเบียน | คู่ → Grade | Pattern | เคส |
| --- | --- | --- | --- | --- |
| LD-P01 | `1กข 5900` | 59 good · 90 avoid · 00 avoid | — | PP-001 |
| LD-P02 | `กข 1234` | 12 avoid · 23 good · 34 avoid | — | PP-002 |
| LD-P03 | `กข 37` | 37 avoid | — | PP-003 |
| LD-P04 | `ขค 1771` | 17 · 77 · 71 = avoid | `one-bracket` | PP-004 |
| LD-P05 | `กข 1001` | 10 avoid · 00 avoid · 01 avoid | `one-bracket` | PP-005 |
| LD-P06 | `กข 3070` | 30 · 07 · 70 = avoid | — | PP-006 |
| LD-P07 | `กข 3553` | 35 caution · 55 good · 53 caution | — | PP-007 |
| LD-P08 | `ก 7` | ไม่มีคู่ | — | PP-008 |
| LD-P09 | `1กข 5900` vs `1ขค 5900` | คู่เลขเท่ากัน (อักษรไม่มีผลต่อคู่) | — | Regression |

### 6.6 จังหวัด (ต้องไม่มีผลต่อการคำนวณ)

| Key | ทะเบียน | province | Expected |
| --- | --- | --- | --- |
| LD-R01 | `กข 1234` | กรุงเทพมหานคร | ผลเท่ากับ LD-R02 และ LD-R03 ทุกค่า (LP-016) |
| LD-R02 | `กข 1234` | เชียงใหม่ | 〃 |
| LD-R03 | `กข 1234` | (ไม่กรอก) | 〃 (LP-015) |

---

## 7. ข้อมูลทดสอบค้นหาคู่เลข

| Key | Input | Expected | เคส |
| --- | --- | --- | --- |
| SD-01 | `24` | good · "มีเสน่ห์ คนเมตตา มนุษยสัมพันธ์ดี มีเพื่อนช่วยเหลือ" | PS-001 |
| SD-02 | `42` | ผลเดียวกับ `24` | PS-002 |
| SD-03 | `89` | good · การงาน/โชคลาภ | PS-003 |
| SD-04 | `13` | avoid | PS-004 |
| SD-05 | `35` | good · pros + cons | PS-005 |
| SD-06 | `47` | `ไม่มีข้อมูล` | PS-006 |
| SD-07 | `00` | avoid · ขอบล่าง · "มีมุมมองแปลกใหม่ ชอบศึกษาเรื่องลึกลับ" | PS-011 |
| SD-08 | `33` | `ไม่มีข้อมูล` | |
| SD-09 | `2` | `PAIR_INVALID` | PS-007 |
| SD-10 | `245` | `PAIR_INVALID` | PS-008 |
| SD-11 | `ab` | `PAIR_INVALID` | PS-009 |
| SD-12 | `๒๔` | Normalize → `24` | |

---

## 8. ข้อมูลทดสอบ Admin

### 8.1 Payload คู่เลข

| Key | ผู้ทำ | Payload | Expected | เคส |
| --- | --- | --- | --- | --- |
| AD-D01 | U-ED1 | `{pairs:["47","74"], grade:"good", categories:["work"], pros:"ทดสอบ: ความคิดสร้างสรรค์", cons:null, source:"Test Fixture"}` | Draft · `/pairs?q=47` ยัง `ไม่มีข้อมูล` | AD-004 |
| AD-D02 | U-ED1 | approve AD-D01 | 403 `FORBIDDEN_SELF_APPROVE` | AD-005 |
| AD-D03 | U-AD1 | approve + publish AD-D01 (`baseVersion=0.1.0-mock`) | 200 · version ใหม่ · คู่ 47 = good (เบอร์ `0812347000`) | AD-008–009 |
| AD-D04 | U-AD1 | rollback ไป `0.1.0-mock` | version ใหม่ · คู่ 47 = `ไม่มีข้อมูล` | AD-010 |
| AD-D05 | U-ED1 | `{pairs:["24"], ...}` | 409 `PAIR_DUPLICATE` | AD-013 |
| AD-D06 | U-ED1 | `{pairs:["68"], source:""}` | 400 `SOURCE_REQUIRED` | AD-014 |
| AD-D07 | U-ED1 | `{pairs:["7"]}` / `{pairs:["abc"]}` | 400 `PAIR_INVALID` | AD-015 |
| AD-D08 | U-ED1 | `{pairs:["33"], ...}` · `pros` = "ก" × 500 | 200 (ขอบบน) | |
| AD-D09 | U-ED1 | `pros` = "ก" × 501 | 400 `VALIDATION_LENGTH` | |
| AD-D10 | U-ED1 | `source` = "a" × 256 | 400 `VALIDATION_LENGTH` | |
| AD-D11 | U-AD1 + U-AD2 | publish พร้อมกันด้วย `baseVersion` เดียวกัน | คนแรก 200 · คนที่สอง 409 `VERSION_CONFLICT` | Concurrency |

### 8.2 หมวด

| Key | Payload | Expected | เคส |
| --- | --- | --- | --- |
| AD-C01 | `{id:"teacher-online", type:"OCCUPATION", label:"ครูออนไลน์", enabled:true, ruleRef:"government-teacher"}` | หลัง Publish ปรากฏใน `occupation-select` | AD-016 |
| AD-C02 | toggle `teacher-online` → `enabled:false` | หายจาก `occupation-select` | AD-017 |
| AD-C03 | `{..., ruleRef:"not-exist"}` | 400 `INVALID_OPTION` | AD-018 |

### 8.3 Login

| Key | username | password | ครั้งที่ | Expected |
| --- | --- | --- | --- | --- |
| LG-01 | `admin.test` | ถูก | 1 | 200 + cookie |
| LG-02 | `admin.test` | `wrong` | 1 | 401 `AUTH_INVALID` |
| LG-03 | `nobody.test` | `wrong` | 1 | 401 `AUTH_INVALID` (ข้อความเดียวกับ LG-02) |
| LG-04 | `locked.test` | `wrong` | ครั้งที่ 5 รวม | 423 `AUTH_LOCKED` |
| LG-05 | `locked.test` | ถูก | ทันทีหลัง LG-04 | 423 `AUTH_LOCKED` |
| LG-06 | `locked.test` | ถูก | หลังเลื่อนนาฬิกา +15 นาที | 200 |
| LG-07 | `admin.test` | ถูก แล้ว idle 29 นาที | — | ยังใช้งานได้ |
| LG-08 | `admin.test` | ถูก แล้ว idle 30 นาที | — | redirect `/admin/login` |

### 8.4 Audit Log ที่คาดหวังหลังรันข้อ 8.1 ตามลำดับ

| # | actor | action | entity | before → after |
| --- | --- | --- | --- | --- |
| 1 | editor.test | DRAFT_SAVED | pair 47 | — → good |
| 2 | admin.test | APPROVED | version draft | DRAFT → APPROVED |
| 3 | admin.test | PUBLISHED | pairs-common-belief-mock | 0.1.0-mock → ใหม่ |
| 4 | admin.test | ROLLBACK | pairs-common-belief-mock | ใหม่ → เวอร์ชันจาก 0.1.0-mock |

> AD-D02 (ถูกปฏิเสธ) ต้อง **ไม่** สร้าง Audit ประเภท APPROVED

---

## 9. ข้อมูลทดสอบ Security / Privacy / Rate limit

| Key | ช่อง | Payload | Expected |
| --- | --- | --- | --- |
| SEC-01 | phone | `<script>alert(1)</script>` | `PHONE_INVALID_CHAR` · ไม่มี dialog |
| SEC-02 | pair search | `<img src=x onerror=alert(1)>` | `PAIR_INVALID` · ไม่มี dialog |
| SEC-03 | article search | `"><svg onload=alert(1)>` | แสดงเป็นข้อความ · ไม่มี dialog |
| SEC-04 | plate letters | `' OR 1=1 --` | `PLATE_INVALID_LETTER` |
| SEC-05 | API body | `{"number": 812345678}` (number type) | 400 · ไม่มี stack trace |
| SEC-06 | API body | `not-json` | 400 · ไม่มี stack trace |
| SEC-07 | API body | `{"number":"0812345678","__proto__":{"admin":true}}` | ไม่มีผลต่อสิทธิ์ · 200 ตามปกติ |
| SEC-08 | API | ยิง `/api/v1/phone/analyze` 30 ครั้งใน 1 นาที | ทั้งหมด 200 (ขอบ) |
| SEC-09 | API | ครั้งที่ 31 | 429 `RATE_LIMITED` |
| SEC-10 | API | `/api/v1/admin/login` ครั้งที่ 11 ใน 1 นาที | 429 |
| PRV-01 | phone | วิเคราะห์ `0812345678` | URL ไม่มี `0812345678` · request เป็น POST |
| PRV-02 | storage | หลัง PRV-01 | `localStorage`, `sessionStorage`, cookie ไม่มี `0812345678` |
| PRV-03 | log | หลัง PRV-01 | log มี `081****678` ไม่มีค่าเต็ม |
| PRV-04 | stats | หลัง PRV-01 | `stats.json` PHONE +1 และไม่มีเบอร์ |
| PRV-05 | log ทะเบียน | วิเคราะห์ `กข 1234` | log มี `กข **34` |

---

## 10. Compliance — คำต้องห้าม

| Key | คำ | ต้องไม่ปรากฏในหน้า |
| --- | --- | --- |
| CMP-01 | แม่นที่สุด | ทุกหน้า |
| CMP-02 | รับประกัน | ทุกหน้า |
| CMP-03 | พิสูจน์แล้ว | ทุกหน้า |
| CMP-04 | รวยแน่นอน | ทุกหน้า |

หน้าที่ต้องสแกน: `/`, `/phone` (+ ผลลัพธ์ PD-V01), `/plate` (+ ผลลัพธ์ LD-V01), `/pairs?q=24`, `/articles`, ทุก slug ในข้อ 4

---

## 11. Coverage — Requirement ↔ Test Data

| Requirement | Test Data |
| --- | --- |
| BR-PH-01–03 (Normalize) | PD-V04–V10 |
| BR-PH-04 (Validate) | PD-V01–V03, PD-I01–I16 |
| BR-PH-05–06 (Pairs) | PD-G01–G08 |
| FR-PH-08–09 (อาชีพ) | PD-O01–O06 |
| BR-LP-01–04 (Plate format) | LD-V01–V07, LD-I01–I13 |
| BR-LP-05–07 (Sums) | LD-S01–S15 |
| BR-LP-08 (Birthday) | LD-B01–B09 |
| BR-LP-09 (Precedence) | LD-P07, PD-G08, SD-05 |
| BR-LP-10 (Province) | LD-R01–R03 |
| FR-CT-01–04 | ข้อ 4, SD-01–SD-12 |
| BR-AD-01–04, FR-AD-* | AD-D01–D11, AD-C01–C03, ข้อ 8.4 |
| NFR-06–07 (Lockout / Rate limit) | LG-01–08, SEC-08–10 |
| NFR-08–09 (Input / Error) | SEC-01–07 |
| NFR-10–12 (Privacy) | PRV-01–05 |
| BR-CM-01 | CMP-01–04 |

**รวม:** 149 รายการข้อมูลทดสอบ (มี Key) + Seed: ผู้ใช้ 5 · Rule Set 4 · บทความ 4

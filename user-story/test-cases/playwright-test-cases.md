# Playwright E2E Test Cases — ระบบเลขมงคลและทะเบียนรถมงคล (MVP Phase 1)

> **Version:** 1.0 · **Date:** 2026-11-06 · **Scope:** 14 Stories ใน MVP (§16) · **Data:** [`../reference-data/`](../reference-data/README.md)
> ค่าที่คาดหวังทั้งหมดคำนวณจาก Rule Set Default ตาม Decision Log (§20): ทะเบียน = `plate-wongnai-v1` (+ `avoidLetters` จาก Allianz), เบอร์ = `pairs-common-belief-mock`
> Fixture สำหรับรันแบบ Data-driven: [`golden-cases.json`](golden-cases.json)

## 0. สมมติฐานสำหรับการทดสอบ

### 0.1 Routes
| Route | หน้า |
| --- | --- |
| `/phone` | เช็คเบอร์ |
| `/plate` | เช็คทะเบียน |
| `/articles`, `/articles/:slug` | บทความ |
| `/pairs` | ค้นหาความหมายคู่เลข |
| `/admin/login`, `/admin/rules`, `/admin/pairs`, `/admin/categories`, `/admin/audit` | หลังบ้าน |

### 0.2 `data-testid` ที่ Dev ต้องใส่ (สัญญาระหว่าง Dev กับ QA)
| testid | ใช้กับ |
| --- | --- |
| `phone-input`, `phone-submit`, `phone-error` | ฟอร์มเบอร์ |
| `occupation-select`, `goal-select` | ตัวเลือกอาชีพ/เป้าหมาย |
| `pair-row` (มี `data-pair`, `data-grade`, `data-position`) | แถวคู่เลขในผลลัพธ์ |
| `pair-meaning`, `pair-pros`, `pair-cons`, `pair-categories` | รายละเอียดคู่ |
| `ruleset-name`, `ruleset-version`, `ruleset-source` | ที่มาของผลลัพธ์ |
| `demo-badge` | ป้าย "ข้อมูลตัวอย่าง" |
| `disclaimer` | ข้อความว่าเป็นความเชื่อ |
| `plate-prefix`, `plate-letters`, `plate-digits`, `plate-province`, `birthday-select`, `plate-submit`, `plate-error` | ฟอร์มทะเบียน |
| `sum-digits`, `sum-digits-formula`, `sum-digits-grade` | ผลรวมแบบเฉพาะตัวเลข |
| `sum-letters`, `sum-letters-formula`, `sum-letters-grade` | ผลรวมแบบรวมอักษร |
| `highlight-digit` / `highlight-letter` (มี `data-value`, `data-reason`) | สิ่งที่ควรเลี่ยง |
| `pattern-warning` (มี `data-pattern`) | รูปแบบควรเลี่ยง |
| `plate-status-notice` | ข้อความ "ไม่ได้ยืนยันสถานะทะเบียน" |

### 0.3 Playwright Projects
`chromium`, `firefox`, `webkit`, `mobile-chrome` (Pixel 7), `mobile-safari` (iPhone 14) — เคสที่ติดแท็ก `@smoke` รันทุก Project ที่เหลือรันเฉพาะ `chromium`

### 0.4 แท็ก
`@smoke` เส้นทางหลัก · `@golden` ตรวจค่าคำนวณ · `@negative` ข้อมูลผิด · `@a11y` · `@privacy` · `@security` · `@admin` · `@mobile`

---

## 1. US-PH-001 — ตรวจสอบเบอร์โทรศัพท์ (Validation + การแสดงผล)

| ID | Tag | Input | Expected |
| --- | --- | --- | --- |
| PH-001 | @smoke | `0812345678` | แสดงผลลัพธ์ ไม่มี `phone-error` |
| PH-002 | | `0612345678` | ผ่าน (ขึ้นต้น 06) |
| PH-003 | | `0912345678` | ผ่าน (ขึ้นต้น 09) |
| PH-004 | | `081-234-5678` | ผ่าน และหัวผลลัพธ์แสดง `0812345678` |
| PH-005 | | `081 234 5678` | ผ่าน และ Normalize เป็น `0812345678` |
| PH-006 | | `+66812345678` | ผ่าน และ Normalize เป็น `0812345678` |
| PH-007 | | `66812345678` | ผ่าน และ Normalize เป็น `0812345678` |
| PH-008 | | `  0812345678  ` (มีช่องว่างหน้า/หลัง) | ผ่าน |
| PH-009 | @negative | `021234567` | error "รองรับเฉพาะเบอร์มือถือ" |
| PH-010 | @negative | `0712345678` | error "รองรับเฉพาะเบอร์มือถือ" |
| PH-011 | @negative | `0512345678` | error "รองรับเฉพาะเบอร์มือถือ" |
| PH-012 | @negative | `08123` | error "กรุณากรอกเบอร์มือถือ 10 หลัก" |
| PH-013 | @negative | `081234567890` (12 หลัก) | error "กรุณากรอกเบอร์มือถือ 10 หลัก" |
| PH-014 | @negative | `08a2345678` | error "กรุณากรอกเบอร์มือถือ 10 หลัก" |
| PH-015 | @negative | ช่องว่าง แล้วกด submit | error และ focus กลับที่ `phone-input` |
| PH-016 | @negative | `๐๘๑๒๓๔๕๖๗๘` (เลขไทย) | ตัดสินใจ: Normalize เป็นเลขอารบิกแล้วผ่าน — ถ้า Dev ไม่รองรับ ต้องแสดง error ที่ชัดเจน ห้ามล่ม |
| PH-017 | @negative | `+1 202 555 0100` | error "รองรับเฉพาะเบอร์มือถือ" |
| PH-018 | | แก้ input หลังเกิด error ให้ถูก แล้วส่งใหม่ | error หายไป และแสดงผลลัพธ์ |
| PH-019 | | กด Enter ใน input | submit ได้เหมือนกดปุ่ม |
| PH-020 | @smoke | `0812345678` | แสดง `ruleset-name`, `ruleset-version`, `ruleset-source` ไม่ว่าง |
| PH-021 | @smoke | `0812345678` | แสดง `demo-badge` และ `disclaimer` |
| PH-022 | | เข้า `/phone` โดยไม่ Login | ใช้งานได้ ไม่ redirect ไปหน้า Login |
| PH-023 | | ส่งปุ่มซ้ำเร็วๆ 5 ครั้ง | ได้ผลลัพธ์ชุดเดียว ไม่มีผลซ้อน และปุ่มถูก disable ระหว่างโหลด |
| PH-024 | | หน่วงเครือข่าย (`page.route` delay 2s) | แสดง Loading state |
| PH-025 | @negative | Mock API ตอบ 500 | แสดงข้อความ error ที่อ่านเข้าใจ และกดลองใหม่ได้ |

## 2. US-PH-002 — วิเคราะห์คู่ตัวเลข (Golden)

กฎ (OQ-02, CR 2026-11-07): ใช้คู่ติดกันตำแหน่ง 4–10 (ไม่ดู 3 หลักแรก) รวม **6 คู่**

| ID | Tag | เบอร์ | คู่ที่ต้องแสดง (ตามลำดับ) | Grade ที่คาดหวัง |
| --- | --- | --- | --- | --- |
| PR-001 | @golden @smoke | `0812345678` | 23, 34, 45, 56, 67, 78 | good, ไม่มีข้อมูล, good, good, ไม่มีข้อมูล, good |
| PR-002 | @golden | `0891245678` | 12, 24, 45, 56, 67, 78 | caution, good, good, good, ไม่มีข้อมูล, good |
| PR-003 | @golden | `0861313737` | 13, 31, 13, 37, 73, 37 | avoid, avoid, avoid, avoid, avoid, avoid |
| PR-004 | @golden | `0816365656` | 63, 36, 65, 56, 65, 56 | good, good, good, good, good, good |
| PR-005 | @golden | `0927878999` | 78, 87, 78, 89, 99, 99 | good, good, good, good, ไม่มีข้อมูล, ไม่มีข้อมูล |
| PR-006 | @golden | `0954242424` | 42, 24, 42, 24, 42, 24 | good, good, good, good, good, good |
| PR-007 | @golden | `0800000000` | 00, 00, 00, 00, 00, 00 | avoid, avoid, avoid, avoid, avoid, avoid |
| PR-008 | | `0812345678` | จำนวน `pair-row` = 6 พอดี | — |
| PR-009 | | `0812345678` | `data-position` ของคู่แรก = `4-5` และคู่สุดท้าย = `9-10` | — |
| PR-010 | | คู่ 24 ใน PR-002 | `pair-pros` = "เจรจาเก่ง ค้าขายดี" และ `pair-cons` = "อาจมีเรื่องเจ้าชู้" | — |
| PR-011 | | คู่ 45 ใน PR-002 | `pair-cons` ไม่ถูกแสดง (ค่าเป็น null) ไม่ใช่แสดงคำว่า "null" | — |
| PR-012 | | คู่ 67 ใน PR-001 | แสดง `ไม่มีข้อมูล` และไม่มีข้อความทำนายใดๆ | — |
| PR-013 | | คู่ 24 | `pair-categories` มี "การสื่อสาร" และ "การเงิน" | — |
| PR-014 | | คู่ 13 ใน PR-003 | แสดง style ของ avoid (เช่น สีแดง/ไอคอนเตือน) และมี aria-label ที่บอกระดับ ไม่ใช้สีอย่างเดียว | — |
| PR-015 | @golden | `0835353535` | 83, 35, 53, 35, 53, 35, 53, 35 | ไม่มีข้อมูล, **caution** ×7 (ตาม Decision precedence ของ 35/53) |

## 3. US-PH-004 — แนะนำตามอาชีพ/เป้าหมาย

| ID | Tag | ขั้นตอน | Expected |
| --- | --- | --- | --- |
| OC-001 | @smoke | เปิด `occupation-select` | มีตัวเลือกครบตาม `phone-categories.json` (8 อาชีพ) |
| OC-002 | | เปิด `goal-select` | มีตัวเลือกครบ 5 เป้าหมาย |
| OC-003 | | เลือก "ค้าขาย" + `0891245678` | แสดงส่วนคำแนะนำพร้อมเหตุผลตามกฎ |
| OC-004 | | ไม่เลือกอาชีพ | แสดงผลวิเคราะห์ทั่วไป ไม่มี error |
| OC-005 | | เลือกอาชีพที่ไม่มี Rule | แสดงข้อความ "ใช้ผลวิเคราะห์ทั่วไป" |
| OC-006 | | เปลี่ยนอาชีพหลังได้ผลแล้ว | ส่วนคำแนะนำอัปเดตตาม ส่วนคู่เลขไม่เปลี่ยน |
| OC-007 | | เลือกเป้าหมาย "การเงิน" | คู่ที่แนะนำทุกคู่มีหมวด money |
| OC-008 | | ใช้คีย์บอร์ดเลือก select | ทำได้ครบโดยไม่ใช้เมาส์ |

## 4. US-LP-001 — ตรวจสอบทะเบียน (Validation)

รูปแบบที่รองรับ (OQ-05): `[เลข 1 หลัก (ไม่บังคับ)][พยัญชนะไทย 1–2 ตัว][เลข 1–4 หลัก]`

| ID | Tag | Input | Expected |
| --- | --- | --- | --- |
| LP-001 | @smoke | `กข 1234` | ผ่าน |
| LP-002 | | `1กข 234` | ผ่าน (มีเลขนำหน้า) |
| LP-003 | | `ก 1` | ผ่าน (อักษร 1 ตัว เลข 1 หลัก) |
| LP-004 | | `กข1234` (ไม่มีช่องว่าง) | ผ่าน และแยกอักษร/เลขถูกต้อง |
| LP-005 | | `กข-1234` | ผ่าน และ Normalize แล้ว |
| LP-006 | | `9ฆฆ 9999` | ผ่าน |
| LP-007 | @negative | `กขค 123` (อักษร 3 ตัว) | error ระบุรูปแบบที่รองรับ |
| LP-008 | @negative | `กข 12345` (5 หลัก) | error |
| LP-009 | @negative | `12กข 34` (เลขนำหน้า 2 หลัก) | error |
| LP-010 | @negative | `AB 1234` | error "รองรับเฉพาะพยัญชนะไทย" |
| LP-011 | @negative | `กข` (ไม่มีเลข) | error |
| LP-012 | @negative | `1234` (ไม่มีอักษร) | error |
| LP-013 | @negative | `กา 123` (มีสระ) | error "รองรับเฉพาะพยัญชนะไทย" |
| LP-014 | @negative | ว่างทั้งหมด | error และ focus ที่ช่องแรก |
| LP-015 | | ไม่กรอกจังหวัด | ผ่าน (จังหวัดไม่บังคับ) |
| LP-016 | @golden | `กข 1234` + กรุงเทพฯ เทียบกับ + เชียงใหม่ | ผลรวมและคู่เลขเหมือนกันทุกค่า (จังหวัดไม่มีผลต่อการคำนวณ) |
| LP-017 | | ผลลัพธ์ใดๆ | แสดง `plate-status-notice` "ไม่ได้ยืนยันสถานะทะเบียน" |
| LP-018 | | เข้า `/plate` โดยไม่ Login | ใช้งานได้ |
| LP-019 | @negative | `๑กข ๑๒๓๔` (เลขไทย) | Normalize แล้วผ่าน หรือแสดง error ที่ชัดเจน |
| LP-020 | | ผลลัพธ์ | แสดงอักษรและตัวเลขแยกกันพร้อมค่าที่แปลง เช่น ก=1, ข=2 |

## 5. US-LP-003 — ผลรวมทะเบียน (Golden)

ค่าอักษร: ก=1, ข=2, ค=4, ฆ=3 · ผลรวมแบบเฉพาะตัวเลข **นับเลขนำหน้าด้วย**

| ID | Tag | ทะเบียน | ผลรวมเฉพาะตัวเลข | ระดับ | ผลรวมรวมอักษร | ระดับ |
| --- | --- | --- | --- | --- | --- | --- |
| SM-001 | @golden @smoke | `1กข 5900` | 1+5+9+0+0 = **15** | ดีเยี่ยม (15/51) | 15+1+2 = **18** | ไม่มีข้อมูล |
| SM-002 | @golden | `กข 1234` | **10** | ไม่มีข้อมูล | 10+3 = **13** | ควรเลี่ยง |
| SM-003 | @golden | `ฆฆ 9999` | **36** | ดีเยี่ยม (36/63) | 36+6 = **42** | ดีเยี่ยม (24/42) |
| SM-004 | @golden | `กข 4550` | **14** | ดีเยี่ยม (14/41) | **17** | ไม่มีข้อมูล |
| SM-005 | @golden | `กข 37` | **10** | ไม่มีข้อมูล | **13** | ควรเลี่ยง |
| SM-006 | @golden | `ขค 1771` | **16** | ไม่มีข้อมูล | 16+6 = **22** | ไม่มีข้อมูล |
| SM-007 | @golden | `กก 9900` | **18** | ไม่มีข้อมูล | **20** | ไม่มีข้อมูล |
| SM-008 | @golden | `กข 6500` | **11** | ไม่มีข้อมูล | **14** | ดีเยี่ยม (14/41) |
| SM-009 | | SM-001 | `sum-digits-formula` แสดง "1 + 5 + 9 + 0 + 0 = 15" | | | |
| SM-010 | | SM-001 | `sum-letters-formula` แสดงค่าอักษร "ก(1) + ข(2)" ด้วย | | | |
| SM-011 | | ทุกเคส | มีป้ายชื่อสูตรทั้ง 2 แบบชัดเจน | | | |
| SM-012 | | SM-001 | ถ้าเปิดตัวเลือกลดเหลือหลักเดียว 15 → 1+5 = **6** | | | |

## 6. US-LP-002 / US-LP-004 — วันเกิด + เลข/อักษรควรเลี่ยง (Golden)

| ID | Tag | ทะเบียน | วันเกิด | Highlight เลข | Highlight อักษร | หมายเหตุ |
| --- | --- | --- | --- | --- | --- | --- |
| BD-001 | @golden @smoke | `1กข 5900` | อาทิตย์ | ไม่มี (เลขเลี่ยงของวันอาทิตย์คือ 6) | **ข** (Allianz: อาทิตย์เลี่ยง ข) | เลขมงคล 1, 9 แสดงเป็นเลขส่งเสริม |
| BD-002 | @golden | `กข 1234` | จันทร์ | **1** | ไม่มี (จันทร์เลี่ยงสระ) | |
| BD-003 | @golden | `กข 1234` | อังคาร | **2** | **ก, ข** | |
| BD-004 | @golden | `1กข 5900` | พุธกลางคืน | **5** | ไม่มี | |
| BD-005 | @golden | `1กข 5900` | พุธกลางวัน | ไม่มี (พุธกลางวันเลี่ยง 3) | ไม่มี | |
| BD-006 | @golden | `กข 4550` | เสาร์ | **4** | ไม่มี | |
| BD-007 | @golden | `ฆฆ 9999` | ศุกร์ | ไม่มี | ไม่มี | เลข 9 แสดงเป็นเลขส่งเสริม |
| BD-008 | @golden | `ดท 7777` | พฤหัสบดี | **7** ×4 | **ด, ท** | |
| BD-009 | | วันเกิดใดๆ | — | — | — | `highlight-*` มี `data-reason` และแสดงแหล่ง (Wongnai / Allianz) |
| BD-010 | | ไม่เลือกวันเกิด | — | — | — | คำนวณผลรวม/คู่เลขได้ และแสดงข้อความชวนให้เลือกวันเกิด |
| BD-011 | | `birthday-select` | — | — | — | มี 8 ตัวเลือก (พุธแยกกลางวัน/กลางคืน) และแสดงคำอธิบาย 18:00–05:59 |
| BD-012 | | เปลี่ยนวันเกิดหลังได้ผล | — | — | — | Highlight อัปเดตทันที ผลรวมไม่เปลี่ยน |
| BD-013 | | ผลลัพธ์ | — | — | — | ข้อความ "เป็นความเชื่อ ไม่ใช่ข้อห้ามตามกฎหมาย" |

## 7. US-LP-004 / US-LP-005 — คู่เลขและรูปแบบควรเลี่ยง (Golden)

| ID | Tag | ทะเบียน | คู่เลขที่แสดง | Expected |
| --- | --- | --- | --- | --- |
| PP-001 | @golden | `1กข 5900` | 59, 90, 00 | 59 = good, 90 = ไม่มีข้อมูล, 00 = avoid (ซ่อมบ่อย) |
| PP-002 | @golden | `กข 1234` | 12, 23, 34 | caution, good, ไม่มีข้อมูล |
| PP-003 | @golden | `กข 37` | 37 | avoid (ใจร้อน/อุบัติเหตุ) |
| PP-004 | @golden | `ขค 1771` | 17, 77, 71 | ไม่มีข้อมูลทุกคู่ + `pattern-warning` = `one-bracket` |
| PP-005 | @golden | `กข 1001` | 10, 00, 01 | 00 = avoid + `pattern-warning` = `one-bracket` |
| PP-006 | @golden | `กข 3070` | 30, 07, 70 | avoid ทั้ง 3 คู่ (ซ่อมบ่อย) |
| PP-007 | @golden | `กข 3553` | 35, 55, 53 | 35 และ 53 = **caution** ตาม precedence (ไม่ใช่ good แม้อาชีพจะเป็นช่าง) |
| PP-008 | @golden | `ก 7` | — | เลข 1 หลักไม่มีคู่ แสดง "ไม่มีคู่เลขให้วิเคราะห์" |
| PP-009 | | ทุกเคส avoid | — | มีข้อความเตือนให้ขับขี่อย่างปลอดภัย และไม่ใช้ถ้อยคำข่มขู่ |

## 8. US-CT-001 — บทความ (Static)

| ID | Tag | ขั้นตอน | Expected |
| --- | --- | --- | --- |
| AR-001 | @smoke | เปิด `/articles` | มีรายการบทความอย่างน้อย 1 รายการ |
| AR-002 | | คลิกบทความแรก | ไปที่ `/articles/:slug` และ `<h1>` ตรงกับชื่อในรายการ |
| AR-003 | | หน้ารายละเอียด | แสดงผู้เขียน วันที่ปรับปรุง และแหล่งอ้างอิง |
| AR-004 | | กรองตามหมวด | แสดงเฉพาะบทความในหมวดนั้น |
| AR-005 | | ค้นหาด้วยคำในชื่อบทความ | พบบทความนั้น |
| AR-006 | @negative | ค้นหาคำที่ไม่มี | แสดง Empty state |
| AR-007 | @negative | เปิด `/articles/not-exist` | หน้า 404 พร้อมลิงก์กลับไปหน้ารายการ |
| AR-008 | | หน้ารายละเอียด | มี `<title>` และ meta description (SEO) |
| AR-009 | | ลิงก์แหล่งอ้างอิงภายนอก | เปิดด้วย `rel="noopener"` |

## 9. US-CT-002 — ค้นหาความหมายคู่เลข

| ID | Tag | Input | Expected |
| --- | --- | --- | --- |
| PS-001 | @smoke | `24` | แสดงความหมาย "เจรจาเก่ง ค้าขายดี" และชื่อ Rule Set |
| PS-002 | | `42` | ได้ผลเดียวกับ 24 (อยู่กลุ่มเดียวกัน) |
| PS-003 | | `89` | good, หมวด การเงิน/การงาน |
| PS-004 | | `13` | avoid พร้อม cons |
| PS-005 | | `35` | caution พร้อมข้อดีและข้อเสียทั้งสองฝั่ง |
| PS-006 | | `67` | แสดง `ไม่มีข้อมูล` |
| PS-007 | @negative | `2` | error "กรุณากรอกเลข 2 หลัก" |
| PS-008 | @negative | `245` | error |
| PS-009 | @negative | `ab` | error |
| PS-010 | @security | `<script>alert(1)</script>` | ไม่มี dialog เกิดขึ้น (`page.on('dialog')` ต้องไม่ถูกเรียก) และข้อความแสดงเป็น text |
| PS-011 | | `00` | avoid "ความว่างเปล่า ขาดผู้สนับสนุน" |

## 10. US-AD-001 / 002 / 003 / 005 — Admin (`@admin`)

| ID | Tag | ขั้นตอน | Expected |
| --- | --- | --- | --- |
| AD-001 | @security | Guest เปิด `/admin/rules` | redirect ไป `/admin/login` |
| AD-002 | @negative | Login รหัสผิด | error ที่ไม่บอกว่าผิดที่ username หรือ password |
| AD-003 | @smoke | Content Editor login | เห็นเมนู Rules/Pairs แต่ไม่มีปุ่ม Approve |
| AD-004 | | Editor แก้ความหมายคู่ 67 เป็น Draft | สถานะ = Draft และหน้า `/pairs?q=67` ยังแสดง `ไม่มีข้อมูล` |
| AD-005 | @security | Editor พยายาม Approve Draft ของตัวเอง (เรียก API ตรง) | ได้ 403 |
| AD-006 | | Admin เปิด Draft | เห็น Diff ระหว่างเวอร์ชันเก่ากับใหม่ |
| AD-007 | | Admin กด Preview/Test | แสดงผลของเบอร์ทดสอบก่อน Publish |
| AD-008 | | Admin Approve + Publish | `/pairs?q=67` แสดงความหมายใหม่ และ `ruleset-version` เพิ่มขึ้น |
| AD-009 | | หลัง Publish ตรวจ `/phone` เบอร์ `0812345678` | คู่ 67 ไม่ใช่ `ไม่มีข้อมูล` อีกต่อไป |
| AD-010 | | Admin กด Rollback | กลับไปเวอร์ชันก่อน และคู่ 67 กลับเป็น `ไม่มีข้อมูล` |
| AD-011 | | เปิด `/admin/audit` | มีรายการ Draft → Approve → Publish → Rollback พร้อมผู้ทำ เวลา และรายละเอียด |
| AD-012 | | หลัง Rollback | ประวัติเดิมยังอยู่ครบ ไม่ถูกลบ |
| AD-013 | @negative | เพิ่มคู่เลข `24` ซ้ำ | error "มีคู่เลขนี้แล้ว" |
| AD-014 | @negative | บันทึกคู่เลขโดยไม่ระบุแหล่งอ้างอิง | error "กรุณาระบุแหล่งอ้างอิง" |
| AD-015 | @negative | กรอกคู่เลข `7` หรือ `abc` | error validation |
| AD-016 | | สร้างอาชีพใหม่ (US-AD-003) | ปรากฏใน `occupation-select` หลัง Publish |
| AD-017 | | ปิดใช้งานอาชีพ | หายจาก `occupation-select` |
| AD-018 | | ผูกอาชีพกับกฎที่ไม่มีอยู่ | error |
| AD-019 | | Rule มีฟิลด์ `ruleId`, `source`, `version`, `status`, `effectiveAt` | แสดงครบในหน้ารายละเอียด Rule |
| AD-020 | | Logout | เข้า `/admin/*` ไม่ได้อีก |

## 11. Cross-cutting

### 11.1 Accessibility (`@a11y`, ใช้ `@axe-core/playwright`)
| ID | หน้า / ขั้นตอน | Expected |
| --- | --- | --- |
| A11Y-001 | `/phone`, `/plate`, `/pairs`, `/articles` | axe ไม่พบ violation ระดับ serious/critical |
| A11Y-002 | หน้าผลลัพธ์เบอร์ | axe ผ่าน |
| A11Y-003 | ทุก input | มี `<label>` ผูกอยู่ (`getByLabel` หาเจอ) |
| A11Y-004 | ใช้ Tab อย่างเดียวกรอกฟอร์มเบอร์จนได้ผลลัพธ์ | ทำได้ และลำดับ focus สมเหตุสมผล |
| A11Y-005 | error message | ผูกกับ input ผ่าน `aria-describedby` และมี `role="alert"` |
| A11Y-006 | grade ของคู่เลข | ไม่ใช้สีอย่างเดียว มีข้อความหรือไอคอนกำกับ |

### 11.2 Mobile (`@mobile`)
| ID | Expected |
| --- | --- |
| MB-001 | `/phone` บน iPhone 14 ไม่มี scroll แนวนอน (`scrollWidth <= clientWidth`) |
| MB-002 | `phone-input` มี `inputmode="numeric"` |
| MB-003 | ตารางคู่เลขอ่านได้บนจอแคบ |
| MB-004 | ฟอร์มทะเบียนใช้งานได้ครบบน Pixel 7 |

### 11.3 Privacy (`@privacy`) — OQ-11
| ID | ขั้นตอน | Expected |
| --- | --- | --- |
| PV-001 | วิเคราะห์เบอร์ แล้วดู URL | เบอร์ไม่อยู่ใน query string |
| PV-002 | ดัก request ด้วย `page.on('request')` | ส่งเบอร์ด้วย POST body ไม่ใช่ GET |
| PV-003 | ตรวจ `localStorage` / `sessionStorage` / cookies | ไม่มีเบอร์หรือทะเบียนที่กรอก |
| PV-004 | Reload หน้าหลังวิเคราะห์ | ฟอร์มว่าง ไม่มีค่าค้าง |
| PV-005 | ตรวจ request ไปยัง analytics ภายนอก | ไม่มีเบอร์/ทะเบียนใน payload |

### 11.4 Security (`@security`)
| ID | ขั้นตอน | Expected |
| --- | --- | --- |
| SC-001 | ใส่ `<img src=x onerror=alert(1)>` ในช่องเบอร์/ทะเบียน | ถูกปฏิเสธด้วย validation และไม่มี dialog |
| SC-002 | ยิง API วิเคราะห์ 100 ครั้งติดกัน (`request` fixture) | ได้ 429 และหน้าเว็บแสดงข้อความ "กรุณาลองใหม่ภายหลัง" |
| SC-003 | Response header | มี `Content-Security-Policy` และ `X-Content-Type-Options` |
| SC-004 | ส่ง body ผิดรูปแบบไปที่ API ตรง | ได้ 400 พร้อม error ที่ไม่เปิดเผย stack trace |

### 11.5 Content & Compliance
| ID | Expected |
| --- | --- |
| CP-001 | ไม่มีข้อความ "แม่นที่สุด" / "รับประกัน" / "พิสูจน์แล้ว" ในหน้าใดเลย (ตรวจด้วย `page.content()`) |
| CP-002 | ทุกหน้าผลลัพธ์มี `disclaimer` |
| CP-003 | ข้อมูลที่เป็น Mock มี `demo-badge` |

---

## 12. ตัวอย่างโค้ด (Data-driven)

```ts
// tests/e2e/phone-pairs.spec.ts
import { test, expect } from '@playwright/test';
import golden from '../../user-story/test-cases/golden-cases.json';

for (const c of golden.phonePairs) {
  test(`${c.id} pairs of ${c.number} @golden`, async ({ page }) => {
    await page.goto('/phone');
    await page.getByTestId('phone-input').fill(c.number);
    await page.getByTestId('phone-submit').click();

    const rows = page.getByTestId('pair-row');
    await expect(rows).toHaveCount(c.pairs.length);
    for (const [i, p] of c.pairs.entries()) {
      await expect(rows.nth(i)).toHaveAttribute('data-pair', p.pair);
      await expect(rows.nth(i)).toHaveAttribute('data-grade', p.grade);
    }
  });
}
```

```ts
// tests/e2e/plate-sum.spec.ts
for (const c of golden.plateSums) {
  test(`${c.id} sum of ${c.plate} @golden`, async ({ page }) => {
    await page.goto('/plate');
    await page.getByTestId('plate-prefix').fill(c.prefix);
    await page.getByTestId('plate-letters').fill(c.letters);
    await page.getByTestId('plate-digits').fill(c.digits);
    await page.getByTestId('plate-submit').click();
    await expect(page.getByTestId('sum-digits')).toHaveText(String(c.sumDigits));
    await expect(page.getByTestId('sum-letters')).toHaveText(String(c.sumLetters));
    await expect(page.getByTestId('sum-digits-grade')).toHaveAttribute('data-grade', c.gradeDigits);
  });
}
```

## 13. สรุปจำนวนเคส

| หมวด | จำนวน |
| --- | ---: |
| Phone validation (PH) | 25 |
| Phone pairs (PR) | 15 |
| Occupation (OC) | 8 |
| Plate validation (LP) | 20 |
| Plate sum (SM) | 12 |
| Birthday / avoid (BD) | 13 |
| Plate pairs / patterns (PP) | 9 |
| Articles (AR) | 9 |
| Pair search (PS) | 11 |
| Admin (AD) | 20 |
| A11y / Mobile / Privacy / Security / Compliance | 6 + 4 + 5 + 4 + 3 = 22 |
| **รวม** | **164** |

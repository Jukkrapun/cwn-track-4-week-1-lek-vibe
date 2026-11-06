# สรุปเอกสาร — Test Cases และ Golden Data (`user-story/test-cases/`)

> **วันที่:** 2026-11-06 · **ผลลัพธ์:** [`playwright-test-cases.md`](../user-story/test-cases/playwright-test-cases.md) v1.0 (164 เคส) · [`golden-cases.json`](../user-story/test-cases/golden-cases.json) (31 เคส)
> **ที่มา:** [User Stories v1.3](../user-story/numerology-user-stories-review.md) · [Reference Data](../user-story/reference-data/README.md) · [System Requirements](../requirement/system-requirements.md) (สรุปใน [`02-system-requirements-summary.md`](02-system-requirements-summary.md))
> **ขอบเขต:** 14 Stories ใน MVP · ค่าที่คาดหวังคำนวณจาก Rule Set Default ได้แก่ `plate-wongnai-v1` (+ `avoidLetters` จาก Allianz) และ `pairs-common-belief-mock`

## 1. วัตถุประสงค์
- กำหนดเคสทดสอบ E2E (Playwright) ของ MVP ทั้ง 14 Stories พร้อมค่าที่คาดหวังที่ตรวจได้จริง
- ตกลงเรื่อง Route และ `data-testid` ระหว่าง Dev กับ QA ก่อนเริ่มเขียนโค้ด
- ใช้ Golden Data เป็น Fixture ทั้งของ Unit Test, API Test และ E2E แบบ Data-driven

## 2. ไฟล์ในโฟลเดอร์
| ไฟล์ | เนื้อหา | หมายเหตุ |
| --- | --- | --- |
| `playwright-test-cases.md` | สมมติฐาน (Routes, testid, Projects, แท็ก), ตารางเคส 11 หมวด, ตัวอย่างโค้ด และสรุปจำนวนเคส | เขียนด้วยมือ |
| `golden-cases.json` | Input → Expected ของการคำนวณ แบ่งเป็น 4 ชุด | **สร้างอัตโนมัติจาก `reference-data/` — ห้ามแก้ด้วยมือ** ถ้าข้อมูลเปลี่ยนให้ generate ใหม่ |

## 3. สมมติฐานสำหรับการทดสอบ (§0)
| หัวข้อ | สรุป |
| --- | --- |
| Routes | `/phone`, `/plate`, `/articles`, `/articles/:slug`, `/pairs`, `/admin/login`, `/admin/rules`, `/admin/pairs`, `/admin/categories`, `/admin/audit` |
| `data-testid` | ฟอร์มเบอร์ (`phone-input/submit/error`) · `pair-row` (มี `data-pair`, `data-grade`, `data-position`) · `ruleset-name/version/source` · `demo-badge` · `disclaimer` · ฟอร์มทะเบียน (`plate-*`, `birthday-select`) · `sum-digits*`, `sum-letters*` |
| Projects | `chromium`, `firefox`, `webkit`, `mobile-chrome` (Pixel 7), `mobile-safari` (iPhone 14) · เคส `@smoke` รันทุก Project ส่วนเคสอื่นรันเฉพาะ `chromium` |
| แท็ก | `@smoke` `@golden` `@negative` `@a11y` `@privacy` `@security` `@admin` `@mobile` |

## 4. จำนวนเคสตามหมวด (§13)
| หมวด | Story | จำนวน |
| --- | --- | ---: |
| Phone validation (PH) | US-PH-001 | 25 |
| Phone pairs (PR) | US-PH-002 | 15 |
| Occupation (OC) | US-PH-004 | 8 |
| Plate validation (LP) | US-LP-001 | 20 |
| Plate sum (SM) | US-LP-003 | 12 |
| Birthday / avoid (BD) | US-LP-002, 004 | 13 |
| Plate pairs / patterns (PP) | US-LP-004, 005 | 9 |
| Articles (AR) | US-CT-001 | 9 |
| Pair search (PS) | US-CT-002 | 11 |
| Admin (AD) | US-AD-001/002/003/005 | 20 |
| A11y / Mobile / Privacy / Security / Compliance | Cross-cutting | 6 + 4 + 5 + 4 + 3 = 22 |
| **รวม** | | **164** |

## 5. Golden Data (`golden-cases.json`)
| ชุด | จำนวน | ฟิลด์หลัก |
| --- | ---: | --- |
| `phonePairs` | 8 | `number`, `pairs[]{pair, grade}` |
| `plateSums` | 8 | `plate`, `prefix`, `letters`, `digits`, `sumDigits`, `gradeDigits`, `sumLetters`, `gradeLetters`, `pairs[]` |
| `plateBirthday` | 8 | ฟิลด์เดียวกับ `plateSums` + `day`, `highlightDigits`, `highlightLetters` |
| `platePairs` | 7 | ฟิลด์เดียวกับ `plateSums` (เน้น `pairs` และรูปแบบที่ควรเลี่ยง) |
| **รวม** | **31** | |

ระดับที่ใช้: `good` / `caution` / `avoid` / `no-data` (ระดับผลรวมมี `excellent`) · ถ้าเป็น `no-data` UI ต้องแสดง "ไม่มีข้อมูล"

## 6. ตัวอย่างเคสสำคัญ
| ID | Input | Expected |
| --- | --- | --- |
| PR-001 | `0812345678` | 8 คู่ 81…78 → caution, caution, good, **ไม่มีข้อมูล**, good, good, **ไม่มีข้อมูล**, good |
| PR-007 | `0800000000` | คู่ 80 = ไม่มีข้อมูล · คู่ 00 ×7 = avoid |
| PR-009 | `0812345678` | `data-position` ของคู่แรก = `2-3` และของคู่สุดท้าย = `9-10` |
| SM-001 | `1กข 5900` | เฉพาะตัวเลข 1+5+9+0+0 = **15** (ดีเยี่ยม) · รวมอักษร 15+ก(1)+ข(2) = **18** (ไม่มีข้อมูล) |
| SM-003 | `ฆฆ 9999` | **36** (ดีเยี่ยม) · **42** (ดีเยี่ยม) |
| AD-004 → AD-010 | แก้ความหมายคู่ 67 | ตอนเป็น Draft ยังไม่มีผล → Publish แล้ว `/pairs?q=67` เปลี่ยนและเวอร์ชันเพิ่มขึ้น → Rollback แล้วกลับเป็น "ไม่มีข้อมูล" |
| AD-005 | Editor เรียก API เพื่อ Approve งานของตนเอง | ได้ 403 |

## 7. ตัวอย่างการใช้แบบ Data-driven (§12)
วน `golden.phonePairs` → เปิด `/phone` → กรอกเบอร์แล้วกดปุ่ม → ตรวจว่ามี `pair-row` ครบ 8 แถว และ `data-pair` / `data-grade` ตรงกับ Golden ทีละแถว

## 8. การนำไปใช้ต่อ
- **เว็บ MVP:** ใส่ testid ตาม §0.2 · `npm run gen:seed` คัดลอก golden-cases ไปใช้ใน Unit Test (vitest Golden cases)
- **TEST-PLAN / ชุด E2E `e2e/`:** ใช้ Route, testid และค่าที่คาดหวังจากไฟล์นี้ แต่ TEST-PLAN.md ลดเหลือ 45 TC แบบ 1 test = 1 TC
- **verify-api.ps1:** ตรวจกฎผ่าน API ตาม TEST-DATA

## 9. ข้อควรระวังและงานต่อ
1. ค่าที่คาดหวังมาจาก Rule Set ที่เป็น Draft/Mock ถ้า Domain Expert เปลี่ยนกฎ ต้อง generate `golden-cases.json` ใหม่และทบทวนตารางใน `.md`
2. Golden Cases ยังไม่ครบตามเกณฑ์ §17.2 ซึ่งกำหนดอย่างน้อย 10 เคสต่อฟีเจอร์ (ตอนนี้มี 7–8 เคสต่อชุด)
3. ตาม BR-LP-04 เคส `PP-006` เปลี่ยนเป็นทะเบียน `กข 3070` แล้ว
4. ตัวอย่างโค้ดใน §12 ใช้ path `tests/e2e/` ซึ่งต่างจากโครงที่สร้างจริงใน `e2e/tests/` ควรอัปเดตให้ตรงกัน

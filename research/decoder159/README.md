# ข้อมูลความหมายคู่เลขจาก decoder159.com

> **เก็บเมื่อ:** 2026-11-07 · **แหล่ง:** https://decoder159.com/ทำนายเบอร์ (อ.นิติกฤตย์) · robots.txt = `Allow: /`
> **ใช้ใน:** `user-story/reference-data/pair-meanings.json` (Rule Set `pairs-common-belief-mock` — คงรหัส/เวอร์ชัน `0.1.0-mock` เดิมไว้ เพราะ test และ admin flow อ้างถึง)
> **สถานะ:** `[ASSUMPTION]` รอ Domain Expert ยืนยัน (OQ-02) และ Legal ตรวจสิทธิการใช้เนื้อหา (OQ-01)

## วิธีเก็บ

1. `scrape-phone.cjs` — Playwright (chromium จาก `e2e/node_modules`) เปิด `?phone=<เบอร์>` เว้น 3 วินาที/ครั้ง
   - รอบ 1: 15 เบอร์จากลำดับ de Bruijn B(10,2) → `raw-run1-debruijn.json`
   - รอบ 2: `ONLY=1 node scrape-phone.cjs 0810000000,0812929292,...` เก็บคู่ที่ยังไม่ครอบคลุม → `raw-run2-extra.json`
2. `pairs-raw.json` — ข้อความต้นฉบับต่อคู่ (ใช้อ้างอิงเท่านั้น ไม่นำขึ้นระบบ)
3. `build-pair-meanings.cjs` — เขียน `pair-meanings.json` โดย**เรียบเรียงถ้อยคำใหม่**เป็น pros/cons สั้น ๆ พร้อมกำหนดหมวด
4. `regen-golden-pairs.cjs` — คำนวณ grade ของคู่เลขใน `user-story/test-cases/golden-cases.json` ใหม่
5. `patch-test-plan.cjs` — ปรับผลที่คาดหวังใน `TEST-PLAN.md` (ใช้ครั้งเดียว)

## สิ่งที่พบเกี่ยวกับพฤติกรรมของเว็บ

- วิเคราะห์เฉพาะ **7 หลักท้าย** (6 คู่ ตำแหน่ง 4–10) ซึ่งตรงกับ CR 2026-11-07 ของเรา
- ถือว่าคู่กลับด้านเป็นคู่เดียวกัน (10 = 01) และแสดงแต่ละคู่ครั้งเดียว
- มีเกรดแค่ 2 ระดับ คือ "เลขดี" (→ `good`) กับ "เลขเสีย" (→ `avoid`) ไม่มีระดับ caution
- คู่ที่เว็บไม่แสดงความหมาย คือ **33** และ **47/74** (→ `ไม่มีข้อมูล`)

## สรุป 53 กลุ่ม (97 คู่)

| เกรด | คู่ (รวมคู่กลับด้าน) |
| --- | --- |
| good (26) | 14 15 16 19 22 23 24 26 28 29 35 36 39 44 45 46 49 55 56 59 66 69 78 79 89 99 |
| avoid (27) | 00 01 02 03 04 05 06 07 08 09 11 12 13 17 18 25 27 34 37 38 48 57 58 67 68 77 88 |
| ไม่มีข้อมูล | 33 47 |

ทะเบียนรถยังใช้ precedence ของ Wongnai (`plate-rules.json`) ก่อนความหมายทั่วไป ดังนั้น 35/53 ในทะเบียนยังเป็น caution

## ไฟล์ที่ได้รับผลกระทบ (2026-11-07)

`pair-meanings.json`, `golden-cases.json`, `db/init/02-seed.sql`, `web/sql/seed.sql` (gen:seed), `web/tests/unit/{phone,plate}.test.ts`, `web/tests/api/verify-api.ps1`, `test-data/test-data.md` (v1.1), `TEST-PLAN.md`, `e2e/tests/{admin,auth,content,phone,plate}.spec.ts`, `e2e/support/helpers.ts`
- AD-D01 (Draft ทดสอบ) เปลี่ยนจากคู่ 67/76 → **47/74** และ AD-D08 / TC-AD-07 เปลี่ยนจาก 68/86 → **33** เพราะคู่เดิมมีข้อมูลแล้ว

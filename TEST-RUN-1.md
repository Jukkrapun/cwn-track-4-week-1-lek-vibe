# TEST-RUN-1 — รันแผน TEST-PLAN.md กับเว็บจริง

> วันที่: 2026-11-06 · เว็บ `http://localhost:3000` · Playwright MCP (Chromium) — หน้าเว็บ + `request` ยิง API ตรง (แยก browser context ต่อผู้ใช้)
> เรียก `POST /api/test/reset` ก่อนทุก TC และหลังจบ · เลื่อนเวลาด้วย `POST /api/test/clock` (AU-02, AU-03, SEC-04)
> ไม่ได้เปิดโค้ดใน `web/`, `db/`, `web/BUGS.md`, `_solution/` · ผลที่คาดหวังไม่ได้แก้ตามเว็บ

| ID | ผลที่คาดหวัง | เว็บจริง | ตรงไหม |
| --- | --- | --- | --- |
| TC-PH-01 | 8 คู่ `89 91 12 24 45 56 67 78` = good good caution good good good ไม่มีข้อมูล good · มีคำแนะนำ + เหตุผล · URL `/phone` | ได้ตามนั้นทุกคู่ (เดินจาก `/` → nav-phone) · มี `recommendation-reason` · URL `/phone` | ✅ |
| TC-PH-02 | 3 รูปแบบได้ `81 12 23 34 45 56 67 78` เท่ากัน | ทั้ง 3 ได้ `81 caution · 12 caution · 23 good · 34 no-data · 45 good · 56 good · 67 no-data · 78 good` | ✅ |
| TC-PH-03 | 9/11 หลัก → "กรุณากรอกเบอร์มือถือ 10 หลัก" · 10 หลักผ่าน · ว่าง → "กรุณากรอกเบอร์มือถือ" | 400 `PHONE_INVALID_LENGTH` ×2 ข้อความตรง · 10 หลักได้ 8 คู่ · ว่าง 400 `PHONE_REQUIRED` ข้อความตรง | ✅ |
| TC-PH-04 | 06, 09 ผ่าน · 05, 07 → "รองรับเฉพาะเบอร์มือถือ" | 06/09 ได้ 8 คู่ · 05/07 → 400 `PHONE_NOT_MOBILE` "รองรับเฉพาะเบอร์มือถือ" | ✅ |
| TC-PH-05 | 400 `PHONE_INVALID_CHAR` "กรุณากรอกเบอร์มือถือ 10 หลัก" | ตรงทั้ง 2 ค่า | ✅ |
| TC-PH-06 | ไม่มีข้อมูล ×2 + ควรเลี่ยง ×6 | `86 61` no-data · `13 31 13 37 73 37` avoid | ✅ |
| TC-PH-07 | freelance → "ใช้ผลวิเคราะห์ทั่วไป" · money → ทุกคู่แนะนำมีหมวด money | "ยังไม่มีกฎเฉพาะสำหรับอาชีพนี้ ใช้ผลวิเคราะห์ทั่วไป" · money แนะนำ 20 คู่ ทั้ง 20 มีหมวด money (ตรวจผ่าน `/api/v1/pairs/{pair}`) | ✅ |
| TC-PH-08 | 400 `INVALID_OPTION` ทั้งคู่ | 400 `INVALID_OPTION` ทั้งคู่ | ✅ |
| TC-PH-09 | request 1 ครั้ง · สถิติ PHONE +1 | ดับเบิลคลิก → request 1 ครั้ง · stats จาก `[]` เป็น PHONE total 1 | ✅ |
| TC-LP-01 | 15 (ดีเยี่ยม) / 18 (ไม่มีข้อมูล) · 59 ดี / 90 ไม่มีข้อมูล / 00 ควรเลี่ยง · Highlight อักษร ข · ไม่มี Highlight เลข | API: 15 excellent / 18 no-data · คู่ตรง · highlightLetters `[ข]` · highlightDigits `[]` · บนจอ สูตร "1 + 5 + 9 + 0 + 0 = 15" และ "… + ก(1) + ข(2) = 18" · highlight-digit 0 ตัว | ✅ |
| TC-LP-02 | 45 (ดีเยี่ยม) / 63 (ดีเยี่ยม) | 45 excellent / 63 excellent | ✅ |
| TC-LP-03 | 1 / 2 ไม่มีข้อมูลทั้งคู่ | 1 no-data / 2 no-data · ไม่มีคู่ | ✅ |
| TC-LP-04 | 10 (ไม่มีข้อมูล) / 13 (ควรเลี่ยง) | 10 no-data / 13 avoid | ✅ |
| TC-LP-05 | `กข 9999` 36 / 39 · 5 หลัก → ข้อความรูปแบบ · `0123` → "ตัวเลขทะเบียนต้องไม่ขึ้นต้นด้วย 0" | 36 / 39 · 400 `PLATE_INVALID_FORMAT` ข้อความตรง · 400 `PLATE_LEADING_ZERO` ข้อความตรง | ✅ |
| TC-LP-06 | 4 ข้อความตามตาราง §5.3 | `PLATE_INVALID_PREFIX` / `PLATE_INVALID_FORMAT` / `PLATE_INVALID_LETTER` / `PLATE_DIGITS_REQUIRED` ข้อความตรงทุกตัว | ✅ |
| TC-LP-07 | เลข 7 ×4 ตำแหน่ง · อักษร ด, ท · แหล่งแยก wongnai / allianz | 7 ที่ตำแหน่ง 1–4 (`plate-wongnai-v1`) · ด, ท (`plate-allianz-v1`) | ✅ |
| TC-LP-08 | 3 จังหวัดผลเท่ากัน 10 / 13 + คู่ 12 caution · 23 good · 34 no-data | เท่ากันทั้ง 3 | ✅ |
| TC-LP-09 | `ขค 1771` เตือน one-bracket · 16 / 22 · `1กข 5900` ไม่เตือน | `ขค 1771` pattern `one-bracket` · 16 / 22 · `1กข 5900` patterns ว่าง | ✅ |
| TC-CT-01 | 24 / 42 / ๒๔ = ดี "เจรจาเก่ง ค้าขายดี" | ตรงทั้ง 3 | ✅ |
| TC-CT-02 | 00 ควรเลี่ยง · 99 ไม่มีข้อมูล · 2/245/ab → "กรุณากรอกเลข 2 หลัก" | ตรงทุกค่า (`PAIR_INVALID`) | ✅ |
| TC-CT-03 | `ผลรวม` → `plate-sum-two-methods` · ×100 ไม่ error · ×101 `QUERY_TOO_LONG` · `zzzz-ไม่มี` ไม่พบ | ตรง · ×100 ได้ 0 รายการไม่ error · ×101 "คำค้นยาวเกิน 100 ตัวอักษร" · `zzzz` 0 รายการ | ✅ |
| TC-CT-04 | ผู้เขียน "ทีมเนื้อหา (ทดสอบ)" + 2026-11-02 + แหล่ง Wongnai · `not-exist` → 404 | หน้าบทความ: "ทีมเนื้อหา (ทดสอบ) \| 2026-11-02" · แหล่ง Wongnai · `/articles/not-exist` HTTP 404 | ✅ |
| TC-AU-01 | ถูก 200 · ผิด/ไม่มีผู้ใช้ 401 ข้อความเดียวกัน | 200 · 401 `AUTH_INVALID` "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" ×2 ตรงทุกตัวอักษร | ✅ |
| TC-AU-02 | ครั้งที่ 5 → 423 · รหัสถูก 423 · +14 → 423 · +15 → 200 · admin ผิด 4 แล้วถูก → 200 | ตามนั้นทุกขั้น ข้อความ "บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่ใน 15 นาที" | ✅ |
| TC-AU-03 | idle 29 → อยู่ `/admin` · idle 30 → `/admin/login` | 29 นาที `/admin` · 30 นาที `/admin/login` | ✅ |
| TC-AU-04 | API 4 ตัว → 401 `UNAUTHENTICATED` "กรุณาเข้าสู่ระบบ" · ไม่มี Draft ใหม่ · `/admin` → login | 401 ×4 ข้อความตรง · Draft 0 ชุด · redirect `/admin/login` | ✅ |
| TC-AU-05 | หลัง Logout ทุกหน้า → login · API 401 | `/admin/pairs` และ Back → `/admin/login` · `/admin/me` 401 | ✅ |
| TC-AD-01 | Draft แล้ว 67 ยังไม่มีข้อมูล · Publish → เวอร์ชันใหม่ 67 ดี · Rollback → เวอร์ชันใหม่อีกตัว 67 ไม่มีข้อมูล ประวัติอยู่ · Audit 4 แถว | 67 no-data → publish `0.1.1-mock` 67 good (ผลเบอร์ใช้ `0.1.1-mock` ทันที) → rollback `0.1.2-mock` 67 no-data · ประวัติ 0.1.0/0.1.1 SUPERSEDED · Audit `DRAFT_SAVED/editor.test, APPROVED/admin.test, PUBLISHED/admin.test, ROLLBACK/admin.test` | ✅ |
| TC-AD-02 | 403 `FORBIDDEN_SELF_APPROVE` · ไม่มี APPROVED | 403 ข้อความตรง · Audit มีแค่ `DRAFT_SAVED` | ✅ |
| TC-AD-03 | 403 `FORBIDDEN` ×3 | 403 "ไม่มีสิทธิ์ดำเนินการ" ×3 | ✅ |
| TC-AD-04 | 200 หนึ่งคน · 409 `VERSION_CONFLICT` หนึ่งคน · เวอร์ชันใหม่ 1 ตัว | admin2 200 · admin 409 "มีการเผยแพร่เวอร์ชันอื่นไปก่อนแล้ว…" · มี `0.1.1-mock` เพิ่ม 1 ตัว | ✅ |
| TC-AD-05 | Approve ซ้ำถูกปฏิเสธ · APPROVED 1 แถว · Publish ก่อน Approve ถูกปฏิเสธ เวอร์ชันไม่เปลี่ยน | ครั้งที่ 2 → 409 `INVALID_STATE` · APPROVED 1 แถว · publish ก่อน approve 409 · เวอร์ชันยัง `0.1.0-mock` | ✅ |
| TC-AD-06 | `24` 409 "มีคู่เลขนี้แล้ว" · source ว่าง 400 `SOURCE_REQUIRED` · `7`/`abc` "กรุณากรอกเลข 2 หลัก" | ตรงทุกค่า | ✅ |
| TC-AD-07 | 500 → 200 · 501 / source 256 → 400 `VALIDATION_LENGTH` | ตรง | ✅ |
| TC-AD-08 | Publish แล้วมี "ครูออนไลน์" · ปิดแล้วหาย + API `INVALID_OPTION` · ruleRef ผิด `INVALID_OPTION` | มี → หาย · 400 `INVALID_OPTION` ×2 | ✅ |
| TC-SEC-01 | ไม่มี dialog · error ตาม code ของแต่ละช่อง | dialog 0 · เบอร์ "…10 หลัก" · คู่ "กรุณากรอกเลข 2 หลัก" · บทความไม่มี `<svg onload>` ใน DOM · ทะเบียน "รองรับเฉพาะพยัญชนะไทย" | ✅ |
| TC-SEC-02 | URL ไม่มีเบอร์ · POST · storage/cookie ไม่มีเบอร์ · stats +1 ไม่มีเบอร์ · GET ไม่ได้ผล | URL `/phone` · `POST /api/v1/phone/analyze` · storage/cookie ไม่มี · stats PHONE 1 ไม่มีเบอร์ · GET 405 | ✅ |
| TC-SEC-03 | 400 ไม่มี stack · `__proto__` → 200 8 คู่ และ `/admin/me` 401 | 400 `INVALID_REQUEST` ×2 ไม่มี stack · 200 8 คู่ · `/admin/me` 401 | ✅ |
| TC-SEC-04 | 1–30 → 200 · 31 → 429 · +1 นาที → 200 | ตรง · ข้อความ "ใช้งานถี่เกินไป กรุณาลองใหม่ภายหลัง" | ✅ |
| TC-SEC-05 | 1–10 → 401 · 11 → 429 | `401 ×10, 429` | ✅ |
| TC-UI-01 | ทุกหน้า scrollWidth ≤ ความกว้างจอ ที่ 360 และ 390 | 390px ผ่านทุกหน้า · 360px `/phone`, `/plate`, `/articles` ผ่าน · **360px หน้าแรก `/` scrollWidth 347 > clientWidth 345** — การ์ด `a.card.tile` ล้นขวา 2px | ⚠️ |
| TC-UI-02 | เวอร์ชัน `0.1.0-mock` + "ข้อมูลตัวอย่าง" + ความเชื่อ · ทะเบียนมี 2 ข้อความ | ตรง: "ข้อมูลตัวอย่าง", "ไม่ได้ยืนยันสถานะทะเบียน", "เป็นความเชื่อ ไม่ใช่ข้อห้ามตามกฎหมาย" | ✅ |

## ⚠️ ที่ไม่ตรง

| ID | คิดว่าเป็น | เพราะอะไร |
| --- | --- | --- |
| TC-UI-01 | **บั๊กของเว็บ** (P2) | NFR-16 [D] เขียนชัดว่าจอ ≥ 360px ต้องไม่มี Scroll แนวนอน ที่ 360px หน้าแรกมีการ์ด `a.card.tile` กว้างเกินจอ 2px → เลื่อนแนวนอนได้ เป็นผลที่วัดซ้ำได้ ไม่ได้มาจากแผนเข้าใจผิด (ตอน EXPLORATION ตรวจแค่ `/phone` ที่ 390px จึงไม่เจอ) |

## สรุป

| โมดูล | จำนวน TC | ✅ | ⚠️ | P1 | P2 | P3 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| เบอร์โทร (PH) | 9 | 9 | 0 | 2 | 7 | 0 |
| ทะเบียน (LP) | 9 | 9 | 0 | 3 | 6 | 0 |
| คู่เลข/บทความ (CT) | 4 | 4 | 0 | 0 | 2 | 2 |
| Login/Session (AU) | 5 | 5 | 0 | 5 | 0 | 0 |
| หลังบ้าน (AD) | 8 | 8 | 0 | 5 | 3 | 0 |
| Security/Privacy (SEC) | 5 | 5 | 0 | 3 | 2 | 0 |
| UI | 2 | 1 | 1 | 0 | 2 | 0 |
| **รวม** | **42** | **41** | **1** | **18** | **22** | **2** |

| ที่มาที่น่าเชื่อที่สุด (1 TC นับ 1) | จำนวน |
| --- | ---: |
| [D] | 41 |
| [R] | 1 |
| [O-ยังไม่ยืนยัน] | 0 |

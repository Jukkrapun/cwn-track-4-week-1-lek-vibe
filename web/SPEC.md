# SPEC — LekVibe (MVP Phase 1)

> อ้างอิง: `requirement/system-requirements.md` (FR/BR/NFR) · `test-data/test-data.md` · `design/*.md`
> ขอบเขต: 14 Stories MVP — ไม่มี Marketplace / รีวิว / สมาชิก / คะแนน 0–100
> ข้อยกเว้นจาก DESIGN: เก็บข้อมูลใน **PostgreSQL 16** แทนไฟล์ JSON (เลเยอร์ Domain / Service / Repository คงตาม architecture.md)

## 1. หน้าเว็บและ Actor

| หน้า | Actor | กฎที่ใช้ |
| --- | --- | --- |
| `/` | ทุกคน | BR-CM-01 |
| `/phone` | Guest | FR-PH-01–09, BR-PH-01–06, BR-PV-01, NFR-10/14/15/20 |
| `/plate` | Guest | FR-LP-01–12, BR-LP-01–10, NFR-10/20 |
| `/pairs` (`?q=24`) | Guest | FR-CT-04, BR-PH-06 |
| `/articles`, `/articles/[slug]` | Guest | FR-CT-01–03 |
| 404 | ทุกคน | FR-CT-03 (มีลิงก์กลับหน้ารายการบทความ) |
| `/admin/login` | Editor, Admin | NFR-06/07 |
| `/admin` (ภาพรวม/สถิติ) | Editor, Admin | FR-AD-01, BR-PV-01 |
| `/admin/pairs` | Editor, Admin | FR-AD-02/07, BR-AD-03/04 |
| `/admin/versions` (alias `/admin/rules`) | Editor (ดู/Diff/Preview/ยกเลิก Draft ตนเอง), Admin (Approve/Publish/Rollback) | FR-AD-03–05, BR-AD-01/02 |
| `/admin/categories` | Editor (สร้าง Draft), Admin (เผยแพร่/เปิด-ปิด) | FR-AD-02/08, I-9 |
| `/admin/audit` | Admin | FR-AD-06, NFR-13 |

ทุก `/admin/*` ตรวจ session ฝั่ง server — ไม่ได้ login หรือ idle ≥ 30 นาที → redirect `/admin/login`

## 2. กฎสำคัญ (สรุป)

- **เบอร์**: ตรวจตามลำดับ ว่าง→`PHONE_REQUIRED` · อักขระนอกจาก ตัวเลข/`+`นำหน้า/`-`/ช่องว่าง → `PHONE_INVALID_CHAR` · ยาวดิบ > 20 → `PHONE_INVALID_LENGTH` · แปลง `+66`/`66`(11 หลัก) → `0…` · ไม่ขึ้นต้น `06/08/09` → `PHONE_NOT_MOBILE` · ไม่ใช่ 10 หลัก → `PHONE_INVALID_LENGTH` · คู่เลขตำแหน่ง 4–10 = 6 คู่ (ไม่ดู 3 หลักแรก) จาก `pairs-common-belief-mock`
- **ทะเบียน**: แปลงเลขไทย → อักขระนอก (ตัวเลข/พยัญชนะ 44 ตัว/ช่องว่าง/`-`) = `PLATE_INVALID_LETTER` → โครงสร้าง `[0-9]*[ก-ฮ]*[0-9]*` · อักษร 0 ตัว `PLATE_LETTERS_REQUIRED` · > 2 ตัว / นำหน้า > 1 หลัก / ตัวเลข > 4 หลัก `PLATE_INVALID_FORMAT` · นำหน้า 0 `PLATE_INVALID_PREFIX` · ไม่มีตัวเลข `PLATE_DIGITS_REQUIRED` · ขึ้นต้น 0 `PLATE_LEADING_ZERO`
- **ผลรวม** 2 แบบ (Wongnai, ไม่ลดหลักเดียว — แสดงค่าลดหลักเดียวเป็นข้อมูลเสริม) · อักษรที่ไม่มีค่าใน `letterValues` (ฃ ฅ ฑ) → ผลรวมรวมอักษร `ไม่มีข้อมูล`
- **คู่เลขทะเบียน**: ส่วนตัวเลขเท่านั้น · precedence: อยู่ทั้ง `avoidPairs` และ `occupationPairs` (35/53) → `caution` · `avoidPairs` → `avoid` + เหตุผล · ความหมายทั่วไป · ไม่มี → `no-data`
- **รูปแบบ**: `one-bracket` = ตัวเลข ≥ 3 หลักขึ้นต้นและลงท้ายด้วย 1 · `front-back-13` = [ASSUMPTION] หลักแรก + หลักสุดท้าย = 13 (กฎต้นทางไม่มีตัวอย่าง — รอ Domain Expert)
- **วันเกิด**: เลขส่งเสริม/เลขเลี่ยงจาก Wongnai (เลขนำหน้า + ตัวเลข) · อักษรเลี่ยงจาก Allianz (`สระทั้งหมด` ของวันจันทร์ไม่ตรงกับพยัญชนะใด)
- **คำแนะนำอาชีพ/เป้าหมาย**: อาชีพ → `category.rule_ref` → `occupationPairs` ของ `plate-wongnai-v1` (trade→trade-online, office/service→office-service-sales, government-teacher, technician-engineer→technician-doctor-engineer-traveler; business/executive/freelance ไม่มีกฎ → "ยังไม่มีกฎเฉพาะสำหรับอาชีพนี้ ใช้ผลวิเคราะห์ทั่วไป") · ตัดคู่ที่ไม่ใช่ `good` และคู่ใน `avoidPairs` · เป้าหมาย → หมวดคู่เลข (negotiation→communication, money, relationship→love, health, career→work)
- **Admin**: Draft เปิดได้ 1 ชุดต่อ Rule Set (clone จาก Published) · ผู้สร้างห้าม Approve (`FORBIDDEN_SELF_APPROVE` ตรวจก่อน Role) · Publish ต้องเป็น `APPROVED` และ `baseVersion` = เวอร์ชันที่ Published ปัจจุบัน (ไม่ตรง → 409 `VERSION_CONFLICT`) · เวอร์ชันใหม่ = patch+1 คง suffix (`0.1.0-mock` → `0.1.1-mock`) · Rollback = สร้างเวอร์ชันใหม่จากเวอร์ชัน `SUPERSEDED` เป้าหมาย · Publish มีผลทันทีกับผลวิเคราะห์ครั้งถัดไป
- **Audit actions**: `DRAFT_SAVED`, `APPROVED`, `PUBLISHED`, `ROLLBACK`, `CATEGORY_CREATED`, `CATEGORY_PUBLISHED`, `CATEGORY_TOGGLED`, `DRAFT_DISCARDED` (Login เก็บที่ `login_attempt` ไม่ลง Audit) · คำขอที่ถูกปฏิเสธไม่สร้าง Audit
- **Security/Privacy**: bcrypt · ล็อก 15 นาทีเมื่อผิดครบ 5 ครั้ง · session idle 30 นาที · rate limit 30/นาที (analyze) และ 10/นาที (login) ต่อ IP · ค่าที่กรอกส่งทาง POST เท่านั้น · `request_log.masked_input` เช่น `081****678`, `กข **34` · `usage_stat` เก็บแค่วัน/ประเภท/จำนวน · CSP `default-src 'self'` + `X-Content-Type-Options: nosniff` · ทุก response มี `X-Request-Id`

## 3. `data-testid` แยกตามหน้า

| หน้า | testid |
| --- | --- |
| Layout | `nav-home`, `nav-phone`, `nav-plate`, `nav-pairs`, `nav-articles` · `<html lang="th" data-ready="true" data-bug-mode="0|1">` |
| `/` | `cta-phone`, `cta-plate` |
| `/phone` | `phone-input`, `phone-submit`, `phone-error`, `occupation-select`, `goal-select`, `option-error`, `phone-result`, `phone-normalized`, `pair-row` (`data-pair`, `data-grade`, `data-position`), `pair-grade`, `pair-meaning`, `pair-pros`, `pair-cons`, `pair-categories`, `ruleset-name`, `ruleset-version`, `ruleset-source`, `demo-badge`, `disclaimer`, `recommendation`, `recommendation-pairs`, `recommended-pair` (`data-pair`), `recommendation-reason`, `recommendation-general`, `recommendation-empty`, `category-chart`, `category-row` (`data-category`, `data-positive`, `data-negative` — นับคู่ในหมวด: good/excellent/caution = บวก, avoid/caution = ลบ, no-data ไม่นับ) |
| `/plate` | `plate-prefix`, `plate-letters`, `plate-digits`, `plate-province`, `birthday-select`, `plate-submit`, `plate-error` (`data-code`), `plate-result`, `plate-display`, `plate-letter-values`, `sum-digits` / `sum-letters` (`data-value`), `sum-digits-formula`, `sum-letters-formula`, `sum-digits-grade`, `sum-letters-grade` (`data-grade`), `sum-digits-meaning`, `sum-letters-meaning`, `pair-row`, `pair-grade`, `pair-meaning`, `pair-reason`, `plate-no-pairs`, `pattern-warning` (`data-pattern`), `birthday-result`, `lucky-digits`, `highlight-digit` / `highlight-letter` (`data-value`, `data-reason`, `data-source`), `no-highlight-digit`, `no-highlight-letter`, `plate-status-notice`, `plate-belief-notice`, `ruleset-name`, `ruleset-version`, `ruleset-source`, `demo-badge`, `disclaimer`, `plate-suggest-result` (`data-day`), `suggest-lucky-digits`, `suggest-avoid-digits`, `suggest-letter-warning` (`data-value`), `suggest-list`, `suggested-plate` (`data-digits`, `data-sum`), `suggest-empty` |
| `/pairs` | `pair-search-input`, `pair-search-submit`, `pair-search-error`, `pair-result` (`data-pair`, `data-grade`), `pair-grade`, `pair-meaning`, `pair-pros`, `pair-cons`, `pair-categories`, `ruleset-*`, `demo-badge`, `disclaimer` |
| `/articles` | `article-search-input`, `article-search-submit`, `article-search-error`, `article-search-query`, `article-filter-all`, `article-filter-phone`, `article-filter-plate`, `article-filter-general`, `article-item` (`data-slug`, `data-category`), `article-title`, `article-empty` |
| `/articles/[slug]` | `article-heading`, `article-author`, `article-updated`, `article-references`, `article-reference-link` (`rel="noopener noreferrer"`), `disclaimer` |
| 404 | `not-found`, `back-to-articles` |
| `/admin/login` | `login-username`, `login-password`, `login-submit`, `login-error` |
| `/admin/*` (เมนู) | `admin-user`, `admin-role`, `admin-nav-dashboard`, `admin-nav-pairs`, `admin-nav-versions`, `admin-nav-categories`, `admin-nav-audit` (Admin เท่านั้น), `logout-button` |
| `/admin` | `stat-phone`, `stat-plate`, `stat-pair_search`, `stat-article_view`, `dashboard-ruleset` (`data-rule-set`), `dashboard-published-version`, `dashboard-open-drafts` |
| `/admin/pairs` | `admin-published-version`, `draft-status`, `pair-form`, `pair-form-pairs`, `pair-form-grade`, `pair-form-pros`, `pair-form-cons`, `pair-form-source`, `pair-form-category-<work|money|love|communication|health|luck>`, `pair-form-submit`, `pair-form-success`, `pair-form-error`, `admin-pair-group` (`data-group`) |
| `/admin/versions` | `versions-table`, `version-row` (`data-rule-set`, `data-version`, `data-status`), `diff-button`, `preview-button`, `approve-button` (เฉพาะ Admin ที่ไม่ใช่ผู้สร้าง), `discard-button`, `publish-button`, `rollback-button`, `version-success`, `version-error`, `diff-panel`, `diff-entry` (`data-change`), `preview-panel`, `preview-change` |
| `/admin/categories` | `category-form-id`, `category-form-type`, `category-form-label`, `category-form-ruleref`, `category-form-submit`, `category-success`, `category-error`, `categories-table`, `category-row` (`data-category`, `data-enabled`, `data-status`), `category-publish`, `category-toggle` |
| `/admin/audit` | `audit-table`, `audit-row` (`data-action`, `data-actor`) |

## 4. ข้อความ Error (คำต่อคำ)

Envelope: `{ "success": false, "data": null, "error": { "code", "message", "field" } }`

| Code | HTTP | ข้อความ |
| --- | --- | --- |
| `PHONE_REQUIRED` | 400 | กรุณากรอกเบอร์มือถือ |
| `PHONE_INVALID_LENGTH` | 400 | กรุณากรอกเบอร์มือถือ 10 หลัก |
| `PHONE_INVALID_CHAR` | 400 | กรุณากรอกเบอร์มือถือ 10 หลัก |
| `PHONE_NOT_MOBILE` | 400 | รองรับเฉพาะเบอร์มือถือ |
| `PLATE_INVALID_FORMAT` | 400 | รองรับรูปแบบ [เลข 1 หลัก] [พยัญชนะไทย 1–2 ตัว] [เลข 1–4 หลัก] |
| `PLATE_INVALID_PREFIX` | 400 | เลขนำหน้าต้องเป็น 1–9 |
| `PLATE_LETTERS_REQUIRED` | 400 | กรุณากรอกหมวดอักษร |
| `PLATE_INVALID_LETTER` | 400 | รองรับเฉพาะพยัญชนะไทย |
| `PLATE_DIGITS_REQUIRED` | 400 | กรุณากรอกตัวเลขทะเบียน |
| `PLATE_LEADING_ZERO` | 400 | ตัวเลขทะเบียนต้องไม่ขึ้นต้นด้วย 0 |
| `BIRTHDAY_REQUIRED` | 400 | กรุณาเลือกวันเกิดเพื่อดูเลขทะเบียนแนะนำ (`/plate/suggest`) |
| `INVALID_OPTION` | 400 | ตัวเลือกไม่ถูกต้อง (อาชีพ/เป้าหมาย/วันเกิด) |
| `PAIR_INVALID` | 400 | กรุณากรอกเลข 2 หลัก |
| `QUERY_TOO_LONG` | 400 | คำค้นยาวเกิน 100 ตัวอักษร |
| `SOURCE_REQUIRED` | 400 | กรุณาระบุแหล่งอ้างอิง |
| `VALIDATION_LENGTH` | 400 | ความยาวข้อความไม่อยู่ในช่วงที่กำหนด *(ไม่มีใน §5.3 — ตั้งเพิ่ม)* |
| `INVALID_REQUEST` | 400 | รูปแบบคำขอไม่ถูกต้อง *(JSON เสีย / ชนิดข้อมูลผิด — ตั้งเพิ่ม)* |
| `PAIR_DUPLICATE` | 409 | มีคู่เลขนี้แล้ว |
| `VERSION_CONFLICT` | 409 | มีการเผยแพร่เวอร์ชันอื่นไปก่อนแล้ว กรุณาโหลดข้อมูลใหม่ *(ตั้งเพิ่ม)* |
| `INVALID_STATE` | 409 | สถานะของรายการไม่รองรับการดำเนินการนี้ *(ตั้งเพิ่ม)* |
| `UNAUTHENTICATED` | 401 | กรุณาเข้าสู่ระบบ |
| `AUTH_INVALID` | 401 | ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง |
| `AUTH_LOCKED` | 423 | บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่ใน 15 นาที |
| `FORBIDDEN_SELF_APPROVE` | 403 | ไม่สามารถอนุมัติงานของตนเองได้ |
| `FORBIDDEN` | 403 | ไม่มีสิทธิ์ดำเนินการ |
| `NOT_FOUND` | 404 | ไม่พบข้อมูล *(ตั้งเพิ่ม)* |
| `RATE_LIMITED` | 429 | ใช้งานถี่เกินไป กรุณาลองใหม่ภายหลัง |
| `INTERNAL_ERROR` | 500 | ระบบขัดข้อง กรุณาลองใหม่ (ไม่ส่ง stack trace) |

## 5. API

| Method | Path | Body / Query | Auth |
| --- | --- | --- | --- |
| GET | `/api/health` | — → `{"ok":true,"db":true\|false}` (200 เสมอ) | — |
| POST | `/api/test/reset` | `{"now":"ISO"}` (ไม่ส่ง = `2026-11-06T09:00:00+07:00`) — 404 ถ้า `ALLOW_TEST_RESET≠1` | — |
| POST | `/api/test/clock` | `{"now":"ISO"}` หรือ `{"advanceMinutes":15}` — ตั้ง/เลื่อนนาฬิกา (โหมดทดสอบ) | — |
| POST | `/api/v1/phone/analyze` | `{"number":"081-234-5678","occupation":"trade","goal":"money"}` | — (30/นาที) |
| POST | `/api/v1/plate/analyze` | `{"prefix":"1","letters":"กข","digits":"5900","province":"…","birthDay":"sun"}` หรือ `{"plate":"1กข 5900"}` | — (30/นาที) |
| GET | `/api/v1/pairs/{pair}` | เช่น `/api/v1/pairs/24` | — |
| GET | `/api/v1/articles` | `?q=&category=phone\|plate\|general` | — |
| GET | `/api/v1/articles/{slug}` | — | — |
| GET | `/api/v1/categories` | — (อาชีพ/เป้าหมาย/หมวดเบอร์ที่เปิดใช้งาน) | — |
| POST | `/api/v1/admin/login` | `{"username","password"}` → cookie `mongkol_session` (HttpOnly, SameSite=Strict) | — (10/นาที) |
| POST | `/api/v1/admin/logout` | — | session |
| GET | `/api/v1/admin/me` | — | Editor/Admin |
| GET | `/api/v1/admin/rule-sets` | — (Rule Set + ทุกเวอร์ชัน: ruleId, version, status, source, effectiveAt, createdBy, approvedBy) | Editor/Admin |
| GET | `/api/v1/admin/pairs` | — (published + draft groups) | Editor/Admin |
| POST / PUT | `/api/v1/admin/pairs` | `{"pairs":["67","76"],"grade":"good","categories":["work"],"pros":"…","cons":null,"source":"Test Fixture"}` (POST = เพิ่ม, PUT = แก้กลุ่มเดิม) | Editor/Admin |
| GET | `/api/v1/admin/versions/{id}/diff` | — | Editor/Admin |
| POST | `/api/v1/admin/versions/{id}/preview` | `{"numbers":["0812345678"]}` (รัน Golden phone cases ด้วย) | Editor/Admin |
| POST | `/api/v1/admin/versions/{id}/approve` | — | Admin ≠ ผู้สร้าง |
| POST | `/api/v1/admin/versions/{id}/publish` | `{"baseVersion":"0.1.0-mock"}` | Admin |
| DELETE | `/api/v1/admin/versions/{id}` | — (ยกเลิก Draft) | ผู้สร้าง/Admin |
| POST | `/api/v1/admin/rules/rollback` | `{"ruleSetId":"pairs-common-belief-mock","targetVersion":"0.1.0-mock","baseVersion":"0.1.1-mock"}` | Admin |
| GET / POST | `/api/v1/admin/categories` | POST `{"id":"teacher-online","type":"OCCUPATION","label":"ครูออนไลน์","enabled":true,"ruleRef":"government-teacher"}` → Draft | Editor/Admin |
| POST | `/api/v1/admin/categories/{id}/publish` | — | Admin ≠ ผู้สร้าง |
| PATCH | `/api/v1/admin/categories/{id}` | `{"enabled":false}` | Admin |
| GET | `/api/v1/admin/audit` | — | Admin |
| GET | `/api/v1/admin/stats` | — | Editor/Admin |

ตัวอย่าง response (ย่อ):

```json
POST /api/v1/phone/analyze {"number":"0812345678"}
{ "success": true, "error": null, "data": {
  "normalized": "0812345678",
  "ruleSet": { "id": "pairs-common-belief-mock", "name": "ความหมายคู่เลข (ความเชื่อทั่วไป)", "version": "0.1.0-mock", "source": "…", "sourceUrl": null, "isMock": true },
  "pairs": [ { "position": "4-5", "pair": "23", "grade": "good", "…": "…" }, "… 6 คู่" ],
  "recommendation": null, "recommendationSource": null, "categoriesRuleSet": { "…": "…" },
  "disclaimer": "ผลลัพธ์ตามความเชื่อ ไม่ใช่ข้อเท็จจริงทางวิทยาศาสตร์" } }

POST /api/v1/plate/analyze {"plate":"1กข 5900","birthDay":"sun"}
POST /api/v1/plate/suggest {"birthDay":"thu","letters":"กข"}   # letters ไม่บังคับ → { day, letters, luckyDigits, avoidDigits, letterWarnings[], suggestions[{digits,display,sum,sumMethod,sumMeaning,goodPairs,pairs}] (≤8), ruleSets, disclaimer, notices }
{ "success": true, "error": null, "data": {
  "plate": { "prefix": "1", "letters": [{"char":"ก","value":1},{"char":"ข","value":2}], "digits": "5900", "display": "1กข 5900" },
  "ruleSets": [ {"id":"plate-wongnai-v1","usedFor":"sums, birthDayDigits, avoidPairs, patterns"}, {"id":"plate-allianz-v1","usedFor":"avoidLetters"}, {"id":"pairs-common-belief-mock","usedFor":"pairMeanings"} ],
  "sums": [ {"method":"digits-only","formula":"1 + 5 + 9 + 0 + 0 = 15","total":15,"reduced":6,"grade":"excellent","meaning":"มีเสน่ห์ การงานมั่นคง"},
            {"method":"with-letters","formula":"1 + 5 + 9 + 0 + 0 + ก(1) + ข(2) = 18","total":18,"reduced":9,"grade":"no-data","meaning":null} ],
  "pairs": [ {"pair":"59","grade":"good"}, {"pair":"90","grade":"no-data"}, {"pair":"00","grade":"avoid","reason":"เชื่อว่ารถซ่อมบ่อย"} ],
  "patterns": [],
  "birthDay": { "day": "sun", "luckyDigits": [1,8,9], "highlightDigits": [], "highlightLetters": [{"char":"ข","source":"plate-allianz-v1","reason":"…"}] },
  "notices": ["ไม่ได้ยืนยันสถานะทะเบียน", "เป็นความเชื่อ ไม่ใช่ข้อห้ามตามกฎหมาย"] } }
```

## 6. ผู้ใช้ Seed (ทดสอบเท่านั้น — เก็บเป็น bcrypt hash)

| username | password | role | สถานะเริ่มต้น |
| --- | --- | --- | --- |
| `editor.test` | `Editor#Test2026` | EDITOR | ปกติ |
| `editor2.test` | `Editor2#Test2026` | EDITOR | ปกติ |
| `admin.test` | `Admin#Test2026` | ADMIN | ปกติ |
| `admin2.test` | `Admin2#Test2026` | ADMIN | ปกติ |
| `locked.test` | `Locked#Test2026` | EDITOR | `failed_login_count=4` |

## 7. วิธีรัน / Reset / Env (PowerShell)

```powershell
docker network create mongkol-net          # ครั้งแรกเท่านั้น
cd db;  docker compose up -d                # รอ mongkol-db = healthy
cd ..\web; docker compose up -d --build     # รอ mongkol-web = healthy
Invoke-RestMethod http://localhost:3000/api/health
Invoke-RestMethod -Method Post http://localhost:3000/api/test/reset -ContentType 'application/json' -Body '{"now":"2026-11-06T09:00:00+07:00"}'
pwsh -File tests\api\verify-api.ps1         # ตรวจกฎตาม TEST-DATA ผ่าน API
```

| Env (web) | ค่าเริ่มต้น | ความหมาย |
| --- | --- | --- |
| `DATABASE_URL` | `postgres://mongkol:…@mongkol-db:5432/mongkol` | ฐานข้อมูล (pool แบบ lazy — ไม่ต่อตอน build) |
| `BUG_MODE` | `0` | `1` = เปิดบั๊กสำหรับฝึกทดสอบ |
| `ALLOW_TEST_RESET` | `1` | เปิด `/api/test/reset` และ `/api/test/clock` |
| `RATE_LIMIT_ENABLED` | `true` | `false` = ปิด rate limit |
| `COOKIE_SECURE` | `false` | `true` เมื่อรันหลัง HTTPS |
| `TZ` / `HOSTNAME` | `Asia/Bangkok` / `0.0.0.0` | |
| `POSTGRES_PASSWORD` (db + web) | `mongkol_dev_pw` | รหัสผ่าน DB สำหรับ dev — เปลี่ยนผ่าน env |

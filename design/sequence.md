# Sequence Diagrams

## 1. วิเคราะห์เบอร์โทรศัพท์ — `POST /api/v1/phone/analyze`

```mermaid
sequenceDiagram
  autonumber
  actor G as Guest
  participant UI as /phone (Browser)
  participant MW as Middleware
  participant API as Route Handler
  participant PA as PhoneAnalysis
  participant RE as Rule Engine
  participant RR as RuleRepository (memory cache)
  participant SR as StatsRepository

  G->>UI: กรอกเบอร์ + อาชีพ (optional) แล้วกดวิเคราะห์
  UI->>UI: disable ปุ่ม + แสดง Loading
  UI->>MW: POST {number, occupation, goal}
  MW->>MW: สร้าง X-Request-Id · ตรวจ rate limit (30/นาที/IP)
  alt เกิน limit
    MW-->>UI: 429 RATE_LIMITED
  else ผ่าน
    MW->>API: forward
    API->>API: Zod validate โครงสร้าง body
    API->>PA: analyze(input)
    PA->>PA: normalize → validate (BR-PH-01–04)
    alt ไม่ผ่าน
      PA-->>API: DomainError(PHONE_*)
      API-->>UI: 400 {success:false, error}
      UI-->>G: แสดง error + focus input
    else ผ่าน
      PA->>PA: แยก 6 คู่ (ตำแหน่ง 4–10)
      PA->>RE: lookupPairs(pairs, occupation, goal)
      RE->>RR: getPublished("pairs-common-belief-mock")
      RR-->>RE: RuleSetVersion (cached)
      RE-->>PA: pairs[] + recommendation + ruleSet meta
      PA-->>API: PhoneAnalysisResult
      API->>SR: increment("PHONE")
      API-->>UI: 200 {success:true, data}
      UI-->>G: แสดงคู่เลข · ruleSet/version · disclaimer · ป้ายข้อมูลตัวอย่าง
    end
  end
```

## 2. วิเคราะห์ทะเบียนรถ — `POST /api/v1/plate/analyze`

```mermaid
sequenceDiagram
  autonumber
  actor G as Guest
  participant UI as /plate
  participant API as Route Handler
  participant LA as PlateAnalysis
  participant RE as Rule Engine
  participant RR as RuleRepository

  G->>UI: กรอก prefix / letters / digits / province + เลือกวันเกิด
  UI->>API: POST {prefix, letters, digits, province, birthDay}
  API->>LA: analyze(input)
  LA->>LA: normalize + validate (BR-LP-01–04)
  alt ไม่ผ่าน
    LA-->>API: DomainError(PLATE_*)
    API-->>UI: 400 error
  else ผ่าน
    LA->>RR: getPublished("plate-wongnai-v1")
    LA->>RR: getPublished("plate-allianz-v1")
    RR-->>LA: rule sets
    LA->>LA: sumDigits, sumLetters (BR-LP-05–07)
    LA->>RE: gradeSums + gradePairs (precedence BR-LP-09)
    RE-->>LA: grades
    LA->>LA: ตรวจรูปแบบ one-bracket / front-back-13
    opt เลือกวันเกิด
      LA->>LA: lucky / highlightDigits (wongnai) / highlightLetters (allianz)
    end
    LA-->>API: PlateAnalysisResult + notices
    API-->>UI: 200 data
    UI-->>G: ผลรวม 2 แบบ + สูตร · คู่เลข · highlight · notices
  end
```

## 3. Admin Login

```mermaid
sequenceDiagram
  autonumber
  actor A as Admin/Editor
  participant UI as /admin/login
  participant API as /api/v1/admin/login
  participant ID as Identity
  participant UR as UserRepository
  participant AU as Audit

  A->>UI: username + password
  UI->>API: POST
  API->>ID: login()
  ID->>UR: findByUsername()
  UR-->>ID: user
  alt locked_until > now
    ID-->>API: AUTH_LOCKED
    API-->>UI: 423
  else รหัสผ่านผิด
    ID->>UR: failed_login_count + 1 (≥5 → lock 15 นาที)
    ID-->>API: AUTH_INVALID
    API-->>UI: 401
  else ถูกต้อง
    ID->>UR: reset failed_login_count
    ID->>ID: สร้าง session (idle 30 นาที)
    ID->>AU: append LOGIN
    API-->>UI: 200 + Set-Cookie (HttpOnly, Secure, SameSite=Strict)
    UI-->>A: redirect /admin/rules
  end
```

## 4. Draft → Preview → Approve → Publish

```mermaid
sequenceDiagram
  autonumber
  actor E as Content Editor
  actor A as Admin
  participant API as /api/v1/admin/rules
  participant RM as RuleManagement
  participant GT as Golden Runner
  participant RR as RuleRepository (file)
  participant AU as Audit

  E->>API: PUT draft (คู่ 67 = ...)
  API->>RM: saveDraft(user=E)
  RM->>RM: validate (ไม่ซ้ำ · มี source · ความยาว)
  RM->>RR: write data/rules/.../draft.json
  RM->>AU: append DRAFT_SAVED
  API-->>E: 200 Draft

  A->>API: POST preview(draftId)
  API->>GT: run(golden-cases.json, draft)
  GT-->>API: ผล + diff กับ Published
  API-->>A: แสดง diff

  A->>API: POST approve(draftId)
  API->>RM: approve(user=A)
  alt A เป็นผู้สร้าง Draft
    RM-->>API: FORBIDDEN_SELF_APPROVE
    API-->>A: 403
  else
    RM->>RR: status = APPROVED
    RM->>AU: append APPROVED
    API-->>A: 200
  end

  A->>API: POST publish(draftId, baseVersion)
  API->>RM: publish()
  RM->>RR: ตรวจ baseVersion == published ปัจจุบัน
  alt ไม่ตรง
    RM-->>API: VERSION_CONFLICT
    API-->>A: 409
  else ตรง
    RM->>RR: เขียน versions/id@new.json (temp → rename)
    RM->>AU: append PUBLISHED (before / after)
    Note over RM,AU: ถ้า Audit ล้มเหลว → ยกเลิก ไม่สลับตัวชี้
    RM->>RR: สลับ published.json → new · ตั้งเวอร์ชันเก่าเป็น SUPERSEDED
    RM->>RR: invalidate memory cache
    API-->>A: 200 {version: new}
  end
```

## 5. Rollback

```mermaid
sequenceDiagram
  autonumber
  actor A as Admin
  participant API as /api/v1/admin/rules/rollback
  participant RM as RuleManagement
  participant RR as RuleRepository
  participant AU as Audit

  A->>API: POST {ruleSetId, targetVersion, baseVersion}
  API->>RM: rollback()
  RM->>RR: อ่าน targetVersion
  RM->>RR: สร้างเวอร์ชันใหม่ (based_on = targetVersion) แบบ atomic
  RM->>AU: append ROLLBACK {from, to, newVersion}
  RM->>RR: สลับ published.json → newVersion + invalidate cache
  API-->>A: 200 — ประวัติเดิมไม่ถูกลบ
```

## 6. Playwright E2E — การรันทดสอบ

```mermaid
sequenceDiagram
  autonumber
  participant CI as CI / Developer
  participant PW as Playwright
  participant WS as webServer (npm run start:test)
  participant FS as data/ (test fixture)
  participant APP as Next.js App

  CI->>PW: npx playwright test
  PW->>FS: globalSetup: copy seed → data/ (reset)
  PW->>WS: start + รอ /api/health = 200
  loop 5 projects (chromium, firefox, webkit, mobile-chrome, mobile-safari)
    PW->>APP: รันเคสจาก playwright-test-cases.md + golden-cases.json
    APP-->>PW: DOM (data-testid) / API response
    PW->>PW: assert + axe (a11y)
  end
  PW->>FS: globalTeardown: ลบ data/ ที่สร้างระหว่างทดสอบ
  PW-->>CI: HTML report + trace (เฉพาะเคสที่ fail)
```

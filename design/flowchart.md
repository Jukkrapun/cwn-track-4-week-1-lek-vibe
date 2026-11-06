# Flowchart — ระบบเลขมงคลและทะเบียนรถมงคล

## 1. วิเคราะห์เบอร์โทรศัพท์ (UC-01, UC-02)

```mermaid
flowchart TD
  S([เริ่ม]) --> IN[/รับ number, occupation?, goal?/]
  IN --> RL{เกิน 30 ครั้ง/นาที?}
  RL -- ใช่ --> E429[429 RATE_LIMITED] --> X([จบ])
  RL -- ไม่ --> EMP{ว่าง?}
  EMP -- ใช่ --> E1[PHONE_REQUIRED] --> X
  EMP -- ไม่ --> N1[trim + ลบ '-' และช่องว่าง]
  N1 --> N2[แปลงเลขไทย ๐–๙ → 0–9]
  N2 --> N3{ขึ้นต้น +66 หรือ 66?}
  N3 -- ใช่ --> N4[แทนด้วย 0]
  N3 -- ไม่ --> C1
  N4 --> C1{เป็นตัวเลขล้วน?}
  C1 -- ไม่ --> E2[PHONE_INVALID_CHAR] --> X
  C1 -- ใช่ --> C2{ยาว 10 หลัก?}
  C2 -- ไม่ --> E3[PHONE_INVALID_LENGTH] --> X
  C2 -- ใช่ --> C3{ขึ้นต้น 06 / 08 / 09?}
  C3 -- ไม่ --> E4[PHONE_NOT_MOBILE] --> X
  C3 -- ใช่ --> P[แยกคู่ตำแหน่ง 4-5 ... 9-10 = 6 คู่]
  P --> L{{วนทุกคู่}}
  L --> F{มีในกฎ?}
  F -- ใช่ --> G1[ใส่ grade, pros, cons, categories]
  F -- ไม่ --> G2[grade = no-data]
  G1 --> L
  G2 --> L
  L -- ครบ 6 คู่ --> O{เลือกอาชีพ/เป้าหมาย?}
  O -- ไม่ --> OUT
  O -- ใช่ --> V{ค่าอยู่ในรายการที่ enabled?}
  V -- ไม่ --> E5[INVALID_OPTION] --> X
  V -- ใช่ --> R{มีกฎของอาชีพนี้?}
  R -- ใช่ --> R1[คู่แนะนำ + เหตุผล]
  R -- ไม่ --> R2[ข้อความ: ใช้ผลวิเคราะห์ทั่วไป]
  R1 --> OUT
  R2 --> OUT
  OUT[ประกอบผล + ruleSet/version + disclaimer + isMock] --> ST[Stats phone +1<br/>ไม่เก็บเบอร์]
  ST --> X
```

## 2. วิเคราะห์ทะเบียนรถ (UC-03, UC-04)

```mermaid
flowchart TD
  S([เริ่ม]) --> IN[/prefix?, letters, digits, province?, birthDay?/]
  IN --> N[Normalize: trim, ลบ '-'/ช่องว่าง, เลขไทย → อารบิก]
  N --> V1{prefix ว่าง หรือ 1–9?}
  V1 -- ไม่ --> E1[PLATE_INVALID_PREFIX] --> X([จบ])
  V1 -- ใช่ --> V2{letters 1–2 ตัว?}
  V2 -- 0 ตัว --> E2[PLATE_LETTERS_REQUIRED] --> X
  V2 -- เกิน --> E3[PLATE_INVALID_FORMAT] --> X
  V2 -- ใช่ --> V3{เป็นพยัญชนะไทยทั้งหมด?}
  V3 -- ไม่ --> E4[PLATE_INVALID_LETTER] --> X
  V3 -- ใช่ --> V4{digits 1–4 หลัก?}
  V4 -- 0 หลัก --> E5[PLATE_DIGITS_REQUIRED] --> X
  V4 -- เกิน --> E3
  V4 -- ใช่ --> V5{ขึ้นต้นด้วย 0?}
  V5 -- ใช่ --> E6[PLATE_LEADING_ZERO] --> X
  V5 -- ไม่ --> S1[sumDigits = prefix + ทุกหลัก]
  S1 --> S2[sumLetters = sumDigits + ค่าอักษรทักษา]
  S2 --> S3[หา grade ของผลรวมทั้ง 2 แบบ<br/>ไม่มี = no-data]
  S3 --> P0{digits ยาว ≥ 2?}
  P0 -- ไม่ --> P1[ไม่มีคู่เลขให้วิเคราะห์]
  P0 -- ใช่ --> P2[แยกคู่ติดกันของ digits]
  P2 --> P3[ใช้ precedence:<br/>avoidPairs > avoidPatterns > occupationPairs > ความหมายทั่วไป<br/>35/53 = caution]
  P1 --> PT
  P3 --> PT[ตรวจรูปแบบ one-bracket, front-back-13]
  PT --> B{เลือกวันเกิด?}
  B -- ไม่ --> B0[ข้อความชวนเลือกวันเกิด]
  B -- ใช่ --> B1{เป็น 1 ใน 8 ค่า?}
  B1 -- ไม่ --> E7[INVALID_OPTION] --> X
  B1 -- ใช่ --> B2[เลขส่งเสริม + highlight เลขเลี่ยง<br/>source: plate-wongnai-v1]
  B2 --> B3[highlight อักษรเลี่ยง<br/>source: plate-allianz-v1]
  B0 --> OUT
  B3 --> OUT[ประกอบผล + notices:<br/>ไม่ได้ยืนยันสถานะทะเบียน / เป็นความเชื่อ]
  OUT --> ST[Stats plate +1 · ไม่เก็บทะเบียน] --> X
```

## 3. Rule Lifecycle — Draft → Publish → Rollback (UC-08 ถึง UC-11)

```mermaid
flowchart TD
  S([Editor/Admin เปิดหน้า Rules]) --> AU{Login + Role ถูกต้อง?}
  AU -- ไม่ --> L[redirect /admin/login]
  AU -- ใช่ --> D[แก้ไข → บันทึก Draft]
  D --> V{ผ่าน Validation?<br/>ไม่ซ้ำ · มี source · ความยาว}
  V -- ไม่ --> VE[แสดง Error] --> D
  V -- ใช่ --> A1[Audit DRAFT_SAVED]
  A1 --> PV[Preview: รัน golden-cases.json กับ Draft]
  PV --> DF{ผลต่างจาก Published?}
  DF -- ใช่ --> DC[แสดง Diff ของเคสที่เปลี่ยน]
  DF -- ไม่ --> AP
  DC --> AP{ผู้กด Approve เป็น Admin<br/>และไม่ใช่ผู้สร้าง?}
  AP -- ไม่ใช่ Admin --> F1[403 FORBIDDEN]
  AP -- เป็นผู้สร้าง --> F2[403 FORBIDDEN_SELF_APPROVE]
  AP -- ใช่ --> CF{Admin ยืนยัน Diff?}
  CF -- ไม่ --> D
  CF -- ใช่ --> BV{baseVersion ยังเป็นตัวล่าสุด?}
  BV -- ไม่ --> C409[409 VERSION_CONFLICT]
  BV -- ใช่ --> W[เขียน versions/id@ver.json แบบ atomic]
  W --> A2[Audit PUBLISHED]
  A2 --> PT[สลับตัวชี้ published.json]
  PT --> RL[Reload Rule Set ใน memory]
  RL --> E([จบ: ผลวิเคราะห์ใหม่ใช้เวอร์ชันนี้])

  RB([Admin เลือก Rollback ไปเวอร์ชัน N]) --> RB1[สร้างเวอร์ชันใหม่ = เนื้อหาเวอร์ชัน N]
  RB1 --> RB2[Audit ROLLBACK from → to]
  RB2 --> PT
```

## 4. Admin Login (UC-07)

```mermaid
flowchart TD
  S([POST /api/v1/admin/login]) --> RL{เกิน 10 ครั้ง/นาที/IP?}
  RL -- ใช่ --> E1[429 RATE_LIMITED]
  RL -- ไม่ --> LK{บัญชีถูกล็อก?}
  LK -- ใช่ --> E2[423 AUTH_LOCKED]
  LK -- ไม่ --> PW{รหัสผ่านถูก?}
  PW -- ไม่ --> INC[failedCount + 1]
  INC --> C5{failedCount ≥ 5?}
  C5 -- ใช่ --> LOCK[lockedUntil = now + 15 นาที] --> E2
  C5 -- ไม่ --> E3[401 AUTH_INVALID]
  PW -- ใช่ --> RS[failedCount = 0]
  RS --> SS[สร้าง session · cookie HttpOnly Secure SameSite=Strict]
  SS --> AU[Audit LOGIN] --> OK([200 + role])
```

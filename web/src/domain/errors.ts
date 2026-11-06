// รหัส Error และข้อความภาษาไทย (คำต่อคำตาม system-requirements §5.3)
export const ERROR_CATALOG = {
  PHONE_REQUIRED: { status: 400, message: 'กรุณากรอกเบอร์มือถือ' },
  PHONE_INVALID_LENGTH: { status: 400, message: 'กรุณากรอกเบอร์มือถือ 10 หลัก' },
  PHONE_INVALID_CHAR: { status: 400, message: 'กรุณากรอกเบอร์มือถือ 10 หลัก' },
  PHONE_NOT_MOBILE: { status: 400, message: 'รองรับเฉพาะเบอร์มือถือ' },
  PLATE_INVALID_FORMAT: { status: 400, message: 'รองรับรูปแบบ [เลข 1 หลัก] [พยัญชนะไทย 1–2 ตัว] [เลข 1–4 หลัก]' },
  PLATE_INVALID_PREFIX: { status: 400, message: 'เลขนำหน้าต้องเป็น 1–9' },
  PLATE_LETTERS_REQUIRED: { status: 400, message: 'กรุณากรอกหมวดอักษร' },
  PLATE_INVALID_LETTER: { status: 400, message: 'รองรับเฉพาะพยัญชนะไทย' },
  PLATE_DIGITS_REQUIRED: { status: 400, message: 'กรุณากรอกตัวเลขทะเบียน' },
  PLATE_LEADING_ZERO: { status: 400, message: 'ตัวเลขทะเบียนต้องไม่ขึ้นต้นด้วย 0' },
  BIRTHDAY_REQUIRED: { status: 400, message: 'กรุณาเลือกวันเกิดเพื่อดูเลขทะเบียนแนะนำ' },
  INVALID_OPTION: { status: 400, message: 'ตัวเลือกไม่ถูกต้อง (อาชีพ/เป้าหมาย/วันเกิด)' },
  PAIR_INVALID: { status: 400, message: 'กรุณากรอกเลข 2 หลัก' },
  QUERY_TOO_LONG: { status: 400, message: 'คำค้นยาวเกิน 100 ตัวอักษร' },
  SOURCE_REQUIRED: { status: 400, message: 'กรุณาระบุแหล่งอ้างอิง' },
  VALIDATION_LENGTH: { status: 400, message: 'ความยาวข้อความไม่อยู่ในช่วงที่กำหนด' },
  INVALID_REQUEST: { status: 400, message: 'รูปแบบคำขอไม่ถูกต้อง' },
  PAIR_DUPLICATE: { status: 409, message: 'มีคู่เลขนี้แล้ว' },
  VERSION_CONFLICT: { status: 409, message: 'มีการเผยแพร่เวอร์ชันอื่นไปก่อนแล้ว กรุณาโหลดข้อมูลใหม่' },
  INVALID_STATE: { status: 409, message: 'สถานะของรายการไม่รองรับการดำเนินการนี้' },
  UNAUTHENTICATED: { status: 401, message: 'กรุณาเข้าสู่ระบบ' },
  AUTH_INVALID: { status: 401, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
  AUTH_LOCKED: { status: 423, message: 'บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่ใน 15 นาที' },
  FORBIDDEN_SELF_APPROVE: { status: 403, message: 'ไม่สามารถอนุมัติงานของตนเองได้' },
  FORBIDDEN: { status: 403, message: 'ไม่มีสิทธิ์ดำเนินการ' },
  NOT_FOUND: { status: 404, message: 'ไม่พบข้อมูล' },
  RATE_LIMITED: { status: 429, message: 'ใช้งานถี่เกินไป กรุณาลองใหม่ภายหลัง' },
  INTERNAL_ERROR: { status: 500, message: 'ระบบขัดข้อง กรุณาลองใหม่' },
} as const;

export type ErrorCode = keyof typeof ERROR_CATALOG;

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly field: string | null;
  constructor(code: ErrorCode, field: string | null = null) {
    super(ERROR_CATALOG[code].message);
    this.code = code;
    this.field = field;
  }
  get status(): number {
    return ERROR_CATALOG[this.code].status;
  }
}

export type Result<T> = { ok: true; value: T } | { ok: false; code: ErrorCode; field: string };
export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const fail = <T>(code: ErrorCode, field: string): Result<T> => ({ ok: false, code, field });

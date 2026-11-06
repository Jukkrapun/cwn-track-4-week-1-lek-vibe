-- =====================================================================
-- LekVibe — Schema (ตาม design/erd.md + ตารางเสริมจาก TEST-DATA)
-- PostgreSQL 16 · Invariants I-1..I-9 บังคับด้วย constraint/trigger เท่าที่ทำได้
-- =====================================================================
SET client_encoding = 'UTF8';
SET TIME ZONE 'UTC';

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- Enums ----------
CREATE TYPE user_role        AS ENUM ('EDITOR', 'ADMIN');
CREATE TYPE rule_domain      AS ENUM ('PHONE', 'PLATE');
CREATE TYPE version_status   AS ENUM ('DRAFT', 'APPROVED', 'PUBLISHED', 'SUPERSEDED');
CREATE TYPE pair_grade       AS ENUM ('GOOD', 'CAUTION', 'AVOID');
CREATE TYPE sum_grade_kind   AS ENUM ('EXCELLENT', 'AVOID');
CREATE TYPE birth_day        AS ENUM ('SUN', 'MON', 'TUE', 'WED_DAY', 'WED_NIGHT', 'THU', 'FRI', 'SAT');
CREATE TYPE birthday_kind    AS ENUM ('LUCKY_DIGIT', 'AVOID_DIGIT', 'AVOID_LETTER');
CREATE TYPE avoid_kind       AS ENUM ('PAIR', 'PATTERN');
CREATE TYPE category_type    AS ENUM ('OCCUPATION', 'GOAL', 'PHONE_TYPE');
CREATE TYPE category_status  AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE audit_action     AS ENUM ('LOGIN', 'DRAFT_SAVED', 'APPROVED', 'PUBLISHED', 'ROLLBACK',
                                      'CATEGORY_CREATED', 'CATEGORY_PUBLISHED', 'CATEGORY_TOGGLED', 'DRAFT_DISCARDED');
CREATE TYPE usage_type       AS ENUM ('PHONE', 'PLATE', 'PAIR_SEARCH', 'ARTICLE_VIEW');

-- ---------- USER ----------
CREATE TABLE app_user (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username           varchar(64) NOT NULL UNIQUE,
  password_hash      text NOT NULL CHECK (password_hash LIKE '$2%'),   -- bcrypt เท่านั้น
  role               user_role NOT NULL,
  failed_login_count int NOT NULL DEFAULT 0 CHECK (failed_login_count >= 0),
  locked_until       timestamptz NULL,
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- ---------- RULE_SET / RULE_SET_VERSION ----------
CREATE TABLE rule_set (
  id                   varchar(64) PRIMARY KEY,
  domain               rule_domain NOT NULL,
  name                 text NOT NULL,
  published_version_id uuid NULL
);

CREATE TABLE rule_set_version (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_set_id         varchar(64) NOT NULL REFERENCES rule_set(id),
  version             varchar(32) NULL,                         -- กำหนดตอน Publish
  status              version_status NOT NULL DEFAULT 'DRAFT',
  source_name         text NOT NULL CHECK (length(btrim(source_name)) > 0),
  source_url          text NULL,
  is_mock             boolean NOT NULL DEFAULT false,
  based_on_version_id uuid NULL REFERENCES rule_set_version(id),
  created_by          uuid NOT NULL REFERENCES app_user(id),
  approved_by         uuid NULL REFERENCES app_user(id),
  effective_at        timestamptz NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_version UNIQUE (rule_set_id, version),
  -- I-1: ผู้สร้างห้าม Approve งานตนเอง
  CONSTRAINT ck_not_self_approve CHECK (approved_by IS NULL OR approved_by <> created_by),
  -- เวอร์ชันที่ Approved ขึ้นไปต้องมีผู้อนุมัติ
  CONSTRAINT ck_approved_has_approver CHECK (status = 'DRAFT' OR approved_by IS NOT NULL),
  -- เวอร์ชันที่ Published/Superseded ต้องมีหมายเลขเวอร์ชันและวันมีผล
  CONSTRAINT ck_published_has_version CHECK (status IN ('DRAFT', 'APPROVED') OR (version IS NOT NULL AND effective_at IS NOT NULL))
);

-- I-2: มี PUBLISHED ได้ครั้งละ 1 เวอร์ชันต่อ rule_set
CREATE UNIQUE INDEX uq_one_published ON rule_set_version (rule_set_id) WHERE status = 'PUBLISHED';
-- เปิด Draft/Approved ได้ครั้งละ 1 ชุดต่อ rule_set
CREATE UNIQUE INDEX uq_one_open_draft ON rule_set_version (rule_set_id) WHERE status IN ('DRAFT', 'APPROVED');

ALTER TABLE rule_set
  ADD CONSTRAINT fk_published_version FOREIGN KEY (published_version_id) REFERENCES rule_set_version(id) DEFERRABLE INITIALLY DEFERRED;

-- I-2 (ต่อ): ตัวชี้ published ต้องชี้เวอร์ชันของ rule_set เดียวกันที่สถานะ PUBLISHED
CREATE FUNCTION trg_check_published_pointer() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.published_version_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM rule_set_version v
     WHERE v.id = NEW.published_version_id AND v.rule_set_id = NEW.id AND v.status = 'PUBLISHED') THEN
    RAISE EXCEPTION 'published_version_id must reference a PUBLISHED version of the same rule set';
  END IF;
  RETURN NEW;
END $$;
CREATE CONSTRAINT TRIGGER published_pointer_check AFTER INSERT OR UPDATE ON rule_set
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION trg_check_published_pointer();

-- State machine: DRAFT→APPROVED→PUBLISHED→SUPERSEDED (APPROVED→DRAFT = reject)
CREATE FUNCTION trg_version_transition() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    IF OLD.status <> 'DRAFT' AND (OLD.version IS DISTINCT FROM NEW.version
        OR OLD.source_name IS DISTINCT FROM NEW.source_name OR OLD.created_by IS DISTINCT FROM NEW.created_by) THEN
      RAISE EXCEPTION 'I-3: version % is immutable', OLD.id;
    END IF;
    RETURN NEW;
  END IF;
  IF (OLD.status, NEW.status) IN (('DRAFT','APPROVED'), ('APPROVED','DRAFT'), ('APPROVED','PUBLISHED'),
                                  ('DRAFT','PUBLISHED'), ('PUBLISHED','SUPERSEDED')) THEN
    -- DRAFT→PUBLISHED ใช้เฉพาะ Seed และ Rollback (สร้างเวอร์ชันใหม่จากเวอร์ชันเก่าที่เคยอนุมัติแล้ว)
    IF OLD.status = 'DRAFT' AND NEW.status = 'PUBLISHED' AND NEW.approved_by IS NULL THEN
      RAISE EXCEPTION 'direct publish requires approver';
    END IF;
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'invalid status transition % -> %', OLD.status, NEW.status;
END $$;
CREATE TRIGGER version_transition BEFORE UPDATE ON rule_set_version
  FOR EACH ROW EXECUTE FUNCTION trg_version_transition();

-- I-3: เนื้อหาของเวอร์ชันที่ไม่ใช่ DRAFT ห้ามแก้
CREATE FUNCTION trg_child_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_id uuid;
  v_status version_status;
BEGIN
  v_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.rule_set_version_id ELSE NEW.rule_set_version_id END;
  SELECT status INTO v_status FROM rule_set_version WHERE id = v_id;
  IF v_status IS NOT NULL AND v_status <> 'DRAFT' THEN
    RAISE EXCEPTION 'I-3: cannot modify content of % version', v_status;
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END $$;

-- ---------- PAIR_MEANING ----------
CREATE TABLE pair_meaning (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_set_version_id uuid NOT NULL REFERENCES rule_set_version(id) ON DELETE CASCADE,
  pair_group          varchar(32) NOT NULL CHECK (pair_group ~ '^[0-9]{2}(\|[0-9]{2})*$'),
  grade               pair_grade NOT NULL,
  categories          text[] NOT NULL DEFAULT '{}'
                      CHECK (categories <@ ARRAY['work','money','love','communication','health','luck']::text[]),
  pros                varchar(500) NULL CHECK (pros IS NULL OR length(pros) >= 1),
  cons                varchar(500) NULL CHECK (cons IS NULL OR length(cons) >= 1),
  source              varchar(255) NOT NULL CHECK (length(btrim(source)) >= 1),   -- I-5
  sort_order          int NOT NULL DEFAULT 0,
  CONSTRAINT uq_pair_group UNIQUE (rule_set_version_id, pair_group)                -- I-4
);
-- I-4 (ต่อ): คู่หนึ่งอยู่ได้แค่กลุ่มเดียวต่อเวอร์ชัน
CREATE TABLE pair_meaning_member (
  pair_meaning_id     uuid NOT NULL REFERENCES pair_meaning(id) ON DELETE CASCADE,
  rule_set_version_id uuid NOT NULL REFERENCES rule_set_version(id) ON DELETE CASCADE,
  pair                char(2) NOT NULL CHECK (pair ~ '^[0-9]{2}$'),
  PRIMARY KEY (rule_set_version_id, pair)
);

-- ---------- SUM_GRADE ----------
CREATE TABLE sum_grade (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_set_version_id uuid NOT NULL REFERENCES rule_set_version(id) ON DELETE CASCADE,
  sum_value           int NOT NULL CHECK (sum_value BETWEEN 1 AND 99),
  grade               sum_grade_kind NOT NULL,
  meaning             text NULL,
  CONSTRAINT uq_sum_value UNIQUE (rule_set_version_id, sum_value)
);

-- ---------- LETTER_VALUE ----------
CREATE TABLE letter_value (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_set_version_id uuid NOT NULL REFERENCES rule_set_version(id) ON DELETE CASCADE,
  letter              varchar(1) NOT NULL CHECK (letter ~ '^[ก-ฮ]$'),
  value               int NOT NULL CHECK (value BETWEEN 1 AND 9),                  -- I-6
  CONSTRAINT uq_letter UNIQUE (rule_set_version_id, letter)                       -- I-6
);

-- ---------- BIRTHDAY_RULE ----------
CREATE TABLE birthday_rule (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_set_version_id uuid NOT NULL REFERENCES rule_set_version(id) ON DELETE CASCADE,
  day                 birth_day NOT NULL,
  kind                birthday_kind NOT NULL,
  value               varchar(32) NOT NULL,
  CONSTRAINT uq_birthday UNIQUE (rule_set_version_id, day, kind, value),
  CONSTRAINT ck_digit_value CHECK (kind = 'AVOID_LETTER' OR value ~ '^[0-9]$')
);

-- ---------- AVOID_PATTERN ----------
CREATE TABLE avoid_pattern (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_set_version_id uuid NOT NULL REFERENCES rule_set_version(id) ON DELETE CASCADE,
  kind                avoid_kind NOT NULL,
  value               varchar(32) NOT NULL,
  reason              text NOT NULL,
  precedence          int NOT NULL,
  CONSTRAINT uq_avoid UNIQUE (rule_set_version_id, kind, value),
  CONSTRAINT ck_pair_value CHECK (kind = 'PATTERN' OR value ~ '^[0-9]{2}$')
);

-- ---------- OCCUPATION_PAIR (occupationPairs ของ Rule Set ทะเบียน — เป้าหมายของ CATEGORY.rule_ref) ----------
CREATE TABLE occupation_pair (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_set_version_id uuid NOT NULL REFERENCES rule_set_version(id) ON DELETE CASCADE,
  group_key           varchar(64) NOT NULL,
  pair                char(2) NOT NULL CHECK (pair ~ '^[0-9]{2}$'),
  sort_order          int NOT NULL DEFAULT 0,
  CONSTRAINT uq_occupation_pair UNIQUE (rule_set_version_id, group_key, pair)
);

CREATE TRIGGER pair_meaning_immutable        BEFORE INSERT OR UPDATE OR DELETE ON pair_meaning        FOR EACH ROW EXECUTE FUNCTION trg_child_immutable();
CREATE TRIGGER pair_meaning_member_immutable BEFORE INSERT OR UPDATE OR DELETE ON pair_meaning_member FOR EACH ROW EXECUTE FUNCTION trg_child_immutable();
CREATE TRIGGER sum_grade_immutable           BEFORE INSERT OR UPDATE OR DELETE ON sum_grade           FOR EACH ROW EXECUTE FUNCTION trg_child_immutable();
CREATE TRIGGER letter_value_immutable        BEFORE INSERT OR UPDATE OR DELETE ON letter_value        FOR EACH ROW EXECUTE FUNCTION trg_child_immutable();
CREATE TRIGGER birthday_rule_immutable       BEFORE INSERT OR UPDATE OR DELETE ON birthday_rule       FOR EACH ROW EXECUTE FUNCTION trg_child_immutable();
CREATE TRIGGER avoid_pattern_immutable       BEFORE INSERT OR UPDATE OR DELETE ON avoid_pattern       FOR EACH ROW EXECUTE FUNCTION trg_child_immutable();
CREATE TRIGGER occupation_pair_immutable     BEFORE INSERT OR UPDATE OR DELETE ON occupation_pair     FOR EACH ROW EXECUTE FUNCTION trg_child_immutable();

-- ---------- CATEGORY ----------
CREATE TABLE category (
  id          varchar(64) PRIMARY KEY CHECK (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  type        category_type NOT NULL,
  label       varchar(100) NOT NULL CHECK (length(btrim(label)) >= 1),
  enabled     boolean NOT NULL DEFAULT true,
  rule_ref    varchar(64) NULL,          -- OCCUPATION → occupation_pair.group_key · GOAL → หมวดคู่เลข (I-9 ตรวจใน Application)
  description text NULL,
  status      category_status NOT NULL DEFAULT 'PUBLISHED',
  created_by  uuid NULL REFERENCES app_user(id),
  approved_by uuid NULL REFERENCES app_user(id),
  sort_order  int NOT NULL DEFAULT 0,
  CONSTRAINT ck_category_self_approve CHECK (approved_by IS NULL OR created_by IS NULL OR approved_by <> created_by)
);

-- ---------- AUDIT_LOG (I-7 append-only) ----------
CREATE TABLE audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seq         bigserial NOT NULL UNIQUE,
  actor_id    uuid NOT NULL REFERENCES app_user(id),
  role        user_role NOT NULL,
  action      audit_action NOT NULL,
  entity_type varchar(64) NOT NULL,
  entity_id   varchar(128) NOT NULL,
  before      jsonb NULL,
  after       jsonb NULL,
  request_id  varchar(64) NOT NULL,
  at          timestamptz NOT NULL
);
CREATE FUNCTION trg_audit_append_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'I-7: audit_log is append-only';
END $$;
CREATE TRIGGER audit_append_only BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION trg_audit_append_only();

-- ---------- USAGE_STAT (I-8 ไม่มีค่าที่ผู้ใช้กรอก — มีแค่วันที่/ประเภท/จำนวน) ----------
CREATE TABLE usage_stat (
  date  date NOT NULL,
  type  usage_type NOT NULL,
  count int NOT NULL DEFAULT 0 CHECK (count >= 0),
  PRIMARY KEY (date, type)
);

-- ---------- ARTICLE ----------
CREATE TABLE article_category (
  id    varchar(32) PRIMARY KEY,
  label varchar(100) NOT NULL
);
CREATE TABLE article (
  slug          varchar(100) PRIMARY KEY CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title         varchar(200) NOT NULL,
  description   varchar(300) NOT NULL,
  category_id   varchar(32) NOT NULL REFERENCES article_category(id),
  author        varchar(100) NOT NULL,
  updated_at    date NOT NULL,
  cover         varchar(200) NULL,
  body_markdown text NOT NULL
);
CREATE TABLE article_reference (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug varchar(100) NOT NULL REFERENCES article(slug) ON DELETE CASCADE,
  title        varchar(200) NOT NULL,
  url          text NOT NULL CHECK (url ~ '^https://'),
  sort_order   int NOT NULL DEFAULT 0
);

-- ---------- ตารางเสริม (ไม่มีใน ERD) ----------
-- Session ของหลังบ้าน (ADR-006) — เก็บ hash ของ token เท่านั้น
CREATE TABLE session (
  token_hash   char(64) PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL,
  revoked_at   timestamptz NULL
);
-- ประวัติการ Login (ไม่เก็บรหัสผ่าน)
CREATE TABLE login_attempt (
  id         bigserial PRIMARY KEY,
  username   varchar(64) NOT NULL,
  user_id    uuid NULL REFERENCES app_user(id) ON DELETE SET NULL,
  success    boolean NOT NULL,
  result     varchar(32) NOT NULL,
  at         timestamptz NOT NULL
);
-- นาฬิกาของแอป (POST /api/test/reset {now}) — แถวเดียว
CREATE TABLE app_clock (
  id       int PRIMARY KEY CHECK (id = 1),
  fixed_at timestamptz NULL
);
-- Request log — input ถูก mask เสมอ (NFR-11)
CREATE TABLE request_log (
  id           bigserial PRIMARY KEY,
  request_id   varchar(64) NOT NULL,
  method       varchar(8) NOT NULL,
  path         varchar(200) NOT NULL,
  status       int NOT NULL,
  masked_input text NULL,
  duration_ms  int NOT NULL,
  at           timestamptz NOT NULL
);

CREATE INDEX ix_audit_at ON audit_log (seq);
CREATE INDEX ix_request_log_at ON request_log (id);

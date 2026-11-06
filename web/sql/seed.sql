-- สร้างอัตโนมัติโดย web/scripts/gen-seed.mjs — ห้ามแก้มือ
SET client_encoding = 'UTF8';
-- ผู้ใช้หลังบ้าน (password = bcrypt hash, cost 10)
INSERT INTO app_user (id, username, password_hash, role, failed_login_count, created_at) VALUES ('00000000-0000-4000-8000-000000000001', 'editor.test', '$2b$10$maXIGR26l99fBZkv1mmAGeK4BpxBw8L6qSEhph3w7J0Q1qojDlALe', 'EDITOR', 0, '2026-11-06T00:00:00Z');
INSERT INTO app_user (id, username, password_hash, role, failed_login_count, created_at) VALUES ('00000000-0000-4000-8000-000000000002', 'editor2.test', '$2b$10$YFdX7LR0c1LieFvYgVgoNOGjXnxvQB36k.Lo7LYBN5ePJSNgfmZra', 'EDITOR', 0, '2026-11-06T00:00:00Z');
INSERT INTO app_user (id, username, password_hash, role, failed_login_count, created_at) VALUES ('00000000-0000-4000-8000-000000000003', 'admin.test', '$2b$10$b5wdK09KevPskxlaxMHWFeQ2UUbJA89m3fIxeqvPK5KHm7OJ3kWZe', 'ADMIN', 0, '2026-11-06T00:00:00Z');
INSERT INTO app_user (id, username, password_hash, role, failed_login_count, created_at) VALUES ('00000000-0000-4000-8000-000000000004', 'admin2.test', '$2b$10$DKzY7mbkif5Onl35bjoS3OBUAVJ1EKz/XElqiRtwSZCD471s4fIDu', 'ADMIN', 0, '2026-11-06T00:00:00Z');
INSERT INTO app_user (id, username, password_hash, role, failed_login_count, created_at) VALUES ('00000000-0000-4000-8000-000000000005', 'locked.test', '$2b$10$TvXtTRIic6P6ttvBRPTfV.NuTIzIJ.iw18iE746p.cbAwCaB9MReS', 'EDITOR', 4, '2026-11-06T00:00:00Z');

-- Rule Sets: สร้างเวอร์ชันเป็น DRAFT ใส่เนื้อหา แล้วจึง Publish (I-3)
INSERT INTO rule_set (id, domain, name) VALUES ('pairs-common-belief-mock', 'PHONE', 'ความหมายคู่เลข (ความเชื่อทั่วไป)');
INSERT INTO rule_set_version (id, rule_set_id, version, status, source_name, source_url, is_mock, created_by, approved_by, created_at) VALUES ('10000000-0000-4000-8000-000000000001', 'pairs-common-belief-mock', NULL, 'DRAFT', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', NULL, true, '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', '2026-11-06T00:00:00Z');
INSERT INTO rule_set (id, domain, name) VALUES ('plate-wongnai-v1', 'PLATE', 'ทะเบียนรถมงคล — Wongnai');
INSERT INTO rule_set_version (id, rule_set_id, version, status, source_name, source_url, is_mock, created_by, approved_by, created_at) VALUES ('10000000-0000-4000-8000-000000000002', 'plate-wongnai-v1', NULL, 'DRAFT', 'Wongnai — เลขทะเบียนรถมงคล', 'https://www.wongnai.com/articles/lucky-car-registration', false, '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', '2026-11-06T00:00:00Z');
INSERT INTO rule_set (id, domain, name) VALUES ('plate-allianz-v1', 'PLATE', 'ทะเบียนรถมงคล — Allianz Ayudhya');
INSERT INTO rule_set_version (id, rule_set_id, version, status, source_name, source_url, is_mock, created_by, approved_by, created_at) VALUES ('10000000-0000-4000-8000-000000000003', 'plate-allianz-v1', NULL, 'DRAFT', 'Allianz Ayudhya — เลขทะเบียนรถมงคล', 'https://www.allianz.co.th/th_TH/did-you-know/motor-insurance-article/lucky-license-plates.html', false, '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', '2026-11-06T00:00:00Z');
INSERT INTO rule_set (id, domain, name) VALUES ('phone-categories-mock', 'PHONE', 'หมวดเบอร์ / อาชีพ / เป้าหมาย');
INSERT INTO rule_set_version (id, rule_set_id, version, status, source_name, source_url, is_mock, created_by, approved_by, created_at) VALUES ('10000000-0000-4000-8000-000000000004', 'phone-categories-mock', NULL, 'DRAFT', 'นิยามสมมติสำหรับพัฒนาและทดสอบ (OQ-04)', NULL, true, '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', '2026-11-06T00:00:00Z');

-- pair-meanings.json
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '14|41', 'GOOD', ARRAY['work','communication']::text[], 'ผู้ใหญ่เอ็นดู พูดมีหลักการน่าเชื่อถือ เด่นงานเจรจาและวางแผน', 'อาจดูเป็นผู้ใหญ่เกินวัย', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 0);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '14');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '41');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '15|51', 'GOOD', ARRAY['love','luck']::text[], 'ใจดี มีเมตตา มีเสน่ห์ คนรักใคร่ เรียนรู้เก่ง สมาธิดี', 'ใจอ่อน มักช่วยคนอื่นจนเหนื่อยเอง', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 1);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '15');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '51');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', '16|61', 'GOOD', ARRAY['money','work']::text[], 'หาเงินเก่ง วางแผนการเงินระยะยาว รอบคอบ', 'ระแวงคนง่าย เลือกมาก ความรักสมหวังช้า', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 2);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', '16');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', '61');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', '19|91', 'GOOD', ARRAY['work','luck']::text[], 'โดดเด่น มีวิสัยทัศน์ ทันสมัย ได้ชื่อเสียง เหมาะงานต่างประเทศ/เทคโนโลยี', 'มั่นใจตัวเองสูง อาจดูถือตัว', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 3);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', '19');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', '91');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000001', '22', 'GOOD', ARRAY['communication','money']::text[], 'ช่างคิดช่างจินตนาการ พูดจานุ่มนวล คนรอบข้างชอบ การเงินคล่องมือ', 'บางครั้งคิดมากและฝันมากกว่าลงมือ', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 4);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000001', '22');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', '23|32', 'GOOD', ARRAY['money','communication']::text[], 'ตรงไปตรงมา ขยัน กล้าตัดสินใจ เก่งการขายและเจรจา', 'อารมณ์ร้อน ทิฐิสูง ไม่ค่อยฟังใคร', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 5);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', '23');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', '32');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000001', '24|42', 'GOOD', ARRAY['love','communication']::text[], 'มีเสน่ห์ คนเมตตา มนุษยสัมพันธ์ดี มีเพื่อนช่วยเหลือ', 'มีเรื่องเกี่ยวกับเพศตรงข้ามเข้ามาบ่อย', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 6);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000001', '24');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000001', '42');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000001', '26|62', 'GOOD', ARRAY['communication','money']::text[], 'คำพูดมีเสน่ห์ ใช้คำพูดสร้างรายได้ เป็นที่ปรึกษาที่ดี', 'ได้ดีเพราะปาก ก็อาจเสียเพราะปากได้เช่นกัน', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 7);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000001', '26');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000001', '62');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000001', '28|82', 'GOOD', ARRAY['money','luck']::text[], 'มีโชคการเงินก้อนใหญ่ หมุนเงินเก่ง ใจกว้าง มีบริวาร', 'ใช้เงินเก่งพอ ๆ กับหาเงิน ชอบเสี่ยง', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 8);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000001', '28');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000001', '82');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000001', '29|92', 'GOOD', ARRAY['love','money']::text[], 'มีเสน่ห์ หาเงินคล่อง มีผู้อุปถัมภ์ ชอบศิลปะและความงาม', 'ใช้จ่ายกับความสวยงามและของสะสมมาก', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 9);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000001', '29');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000001', '92');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000001', '35|53', 'GOOD', ARRAY['work']::text[], 'ส่งเสริมอำนาจและภาวะผู้นำ ผู้ใหญ่สนับสนุน งานก้าวหน้า', 'เคร่งครัด อาจดูดุและเข้าถึงยาก', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 10);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000001', '35');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000001', '53');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000001', '36|63', 'GOOD', ARRAY['money','luck']::text[], 'มีพรสวรรค์เฉพาะตัว มีคนช่วยเหลือตลอด ค้าขายได้ดี', 'ทำตามอารมณ์ หยิ่งในตัวเอง', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 11);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000001', '36');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000001', '63');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000001', '39|93', 'GOOD', ARRAY['luck','work']::text[], 'มีโชคด้านการแข่งขันและเสี่ยงโชค ตัดสินใจแม่น สนใจเทคโนโลยี', 'ชอบความตื่นเต้น ถ้าไม่ยั้งคิดอาจมีปัญหา', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 12);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000001', '39');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000001', '93');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000001', '44', 'GOOD', ARRAY['communication','work']::text[], 'ฉลาด ทันข่าวสาร วางแผนเก่ง ได้เดินทางและพบผู้คนมาก', 'อยู่นิ่งไม่เป็น เหนื่อยจากการเคลื่อนไหวตลอด', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 13);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000001', '44');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000001', '45|54', 'GOOD', ARRAY['work','communication']::text[], 'ปัญญาดี ใฝ่รู้ พูดมีเหตุผล ผู้ใหญ่เมตตา มีลางสังหรณ์', 'อาจจริงจังกับหลักการมากเกินไป', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 14);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000001', '45');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000001', '54');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000016', '10000000-0000-4000-8000-000000000001', '46|64', 'GOOD', ARRAY['love','communication']::text[], 'ร่าเริง พูดเพราะ เอาใจเก่ง มีเสน่ห์ สู้งานหนัก', 'เพื่อนที่เข้าหาบางส่วนหวังผลประโยชน์', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 15);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000016', '10000000-0000-4000-8000-000000000001', '46');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000016', '10000000-0000-4000-8000-000000000001', '64');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000017', '10000000-0000-4000-8000-000000000001', '49|94', 'GOOD', ARRAY['communication','work']::text[], 'คิดเร็ว ทำงานไว ทันข่าวสาร เก่งการสื่อสาร รวมถึงกับต่างชาติ', 'เร็วจนคนรอบข้างตามไม่ทัน', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 16);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000017', '10000000-0000-4000-8000-000000000001', '49');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000017', '10000000-0000-4000-8000-000000000001', '94');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000018', '10000000-0000-4000-8000-000000000001', '55', 'GOOD', ARRAY['work','health']::text[], 'ชีวิตก้าวหน้ามั่นคง ใฝ่รู้ ชอบถ่ายทอดความรู้ จิตใจสงบ', 'ค่อนข้างอนุรักษ์นิยม', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 17);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000018', '10000000-0000-4000-8000-000000000001', '55');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000019', '10000000-0000-4000-8000-000000000001', '56|65', 'GOOD', ARRAY['money','love']::text[], 'ปัญญาคู่ทรัพย์ หารายได้หลายทาง มีโชคและผู้อุปถัมภ์ ความรักดี', 'บางครั้งเฉื่อยและไม่ขยัน', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 18);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000019', '10000000-0000-4000-8000-000000000001', '56');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000019', '10000000-0000-4000-8000-000000000001', '65');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000020', '10000000-0000-4000-8000-000000000001', '59|95', 'GOOD', ARRAY['luck']::text[], 'มีสิ่งศักดิ์สิทธิ์คุ้มครอง ลางสังหรณ์ดี มีโชคลาภไม่คาดคิด', 'ชอบเรื่องเร้นลับจนห่างเรื่องทางโลก', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 19);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000020', '10000000-0000-4000-8000-000000000001', '59');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000020', '10000000-0000-4000-8000-000000000001', '95');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000021', '10000000-0000-4000-8000-000000000001', '66', 'GOOD', ARRAY['love']::text[], 'อ่อนหวาน มองโลกแง่ดี รสนิยมดี ร่าเริงเป็นที่รัก', 'สนุกจนขาดความจริงจัง', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 20);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000021', '10000000-0000-4000-8000-000000000001', '66');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000022', '10000000-0000-4000-8000-000000000001', '69|96', 'GOOD', ARRAY['love','money']::text[], 'มีเสน่ห์ รสนิยมดี เด่นงานศิลปะ ความงาม และบันเทิง', 'ชอบเพ้อฝัน', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 21);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000022', '10000000-0000-4000-8000-000000000001', '69');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000022', '10000000-0000-4000-8000-000000000001', '96');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000023', '10000000-0000-4000-8000-000000000001', '78|87', 'GOOD', ARRAY['money','luck']::text[], 'ส่งเสริมความร่ำรวย มีโชคก้อนใหญ่ มีพวกพ้องและบริวาร', 'เสียเงินและเวลากับสังคมมาก', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 22);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000023', '10000000-0000-4000-8000-000000000001', '78');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000023', '10000000-0000-4000-8000-000000000001', '87');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000024', '10000000-0000-4000-8000-000000000001', '79|97', 'GOOD', ARRAY['luck','work']::text[], 'มองการณ์ไกล มีมุมมองแปลกใหม่ ลางสังหรณ์แม่น มีโชคแปลก ๆ', 'คนรอบข้างอาจไม่เข้าใจความคิด เหมาะทำงานคนเดียว', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 23);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000024', '10000000-0000-4000-8000-000000000001', '79');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000024', '10000000-0000-4000-8000-000000000001', '97');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000025', '10000000-0000-4000-8000-000000000001', '89|98', 'GOOD', ARRAY['work','luck']::text[], 'เจ้าระเบียบ ทันสมัย มีพลังในการทำงาน สนใจเทคโนโลยี', 'เข้มงวด เผด็จการ เข้าใจยาก', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 24);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000025', '10000000-0000-4000-8000-000000000001', '89');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000025', '10000000-0000-4000-8000-000000000001', '98');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000026', '10000000-0000-4000-8000-000000000001', '99', 'GOOD', ARRAY['luck']::text[], 'ผูกพันสิ่งศักดิ์สิทธิ์ มีเรื่องเหลือเชื่อในทางดี', 'อ่อนไหวง่าย ใช้ความรู้สึกมากกว่าเหตุผล', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 25);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000026', '10000000-0000-4000-8000-000000000001', '99');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000027', '10000000-0000-4000-8000-000000000001', '00', 'AVOID', ARRAY['health']::text[], 'มีมุมมองแปลกใหม่ ชอบศึกษาเรื่องลึกลับ', 'เก็บตัว เครียดง่าย อารมณ์แปรปรวน ควรดูแลสุขภาพ', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 26);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000027', '10000000-0000-4000-8000-000000000001', '00');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000028', '10000000-0000-4000-8000-000000000001', '01|10', 'AVOID', ARRAY['work']::text[], 'พึ่งตนเองได้ มั่นใจในตัวเอง', 'ทำงานกับคนหมู่มากแล้วมีปัญหา ทำคุณคนไม่ขึ้น', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 27);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000028', '10000000-0000-4000-8000-000000000001', '01');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000028', '10000000-0000-4000-8000-000000000001', '10');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000029', '10000000-0000-4000-8000-000000000001', '02|20', 'AVOID', ARRAY['love']::text[], 'มีเสน่ห์ ใจดี', 'ดึงดูดความรักซับซ้อน มีมือที่สาม คิดมาก', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 28);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000029', '10000000-0000-4000-8000-000000000001', '02');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000029', '10000000-0000-4000-8000-000000000001', '20');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000030', '10000000-0000-4000-8000-000000000001', '03|30', 'AVOID', ARRAY['communication','health']::text[], 'กล้า ช่างสังเกต จับผิดเก่ง', 'ใจร้อน วู่วาม มีปากเสียงง่าย', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 29);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000030', '10000000-0000-4000-8000-000000000001', '03');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000030', '10000000-0000-4000-8000-000000000001', '30');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000031', '10000000-0000-4000-8000-000000000001', '04|40', 'AVOID', ARRAY['communication']::text[], 'ชอบบุกเบิก มีไหวพริบ หาข้อมูลเก่ง', 'ไปรู้ความลับคนอื่น เสี่ยงเรื่องนินทา', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 30);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000031', '10000000-0000-4000-8000-000000000001', '04');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000031', '10000000-0000-4000-8000-000000000001', '40');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000032', '10000000-0000-4000-8000-000000000001', '05|50', 'AVOID', ARRAY['work']::text[], 'ใฝ่ธรรมะ รู้จักพอ มีเหตุผล', 'ขัดแย้งกับผู้ใหญ่หรือเจ้านาย ถูกเพ่งเล็ง', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 31);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000032', '10000000-0000-4000-8000-000000000001', '05');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000032', '10000000-0000-4000-8000-000000000001', '50');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000033', '10000000-0000-4000-8000-000000000001', '06|60', 'AVOID', ARRAY['money','love']::text[], 'มีรสนิยม มีจินตนาการ โรแมนติก', 'เสียทรัพย์ง่าย ให้ยืมไม่ได้คืน ใช้จ่ายเกินตัว', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 32);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000033', '10000000-0000-4000-8000-000000000001', '06');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000033', '10000000-0000-4000-8000-000000000001', '60');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000034', '10000000-0000-4000-8000-000000000001', '07|70', 'AVOID', ARRAY['health']::text[], 'อดทน เก็บความลับได้ดี', 'เครียด กดดัน ปัญหารุมเร้า ไม่ค่อยได้พัก', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 33);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000034', '10000000-0000-4000-8000-000000000001', '07');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000034', '10000000-0000-4000-8000-000000000001', '70');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000035', '10000000-0000-4000-8000-000000000001', '08|80', 'AVOID', ARRAY['money']::text[], 'ใจถึง รักเพื่อน', 'ใจร้อน หูเบา หลงเงินทอง เสี่ยงอบายมุข', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 34);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000035', '10000000-0000-4000-8000-000000000001', '08');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000035', '10000000-0000-4000-8000-000000000001', '80');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000036', '10000000-0000-4000-8000-000000000001', '09|90', 'AVOID', ARRAY['luck']::text[], 'มีญาณสัมผัส สนใจศาสตร์ลึกลับ', 'ชีวิตผันผวนจากเรื่องพิสูจน์ไม่ได้', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 35);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000036', '10000000-0000-4000-8000-000000000001', '09');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000036', '10000000-0000-4000-8000-000000000001', '90');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000037', '10000000-0000-4000-8000-000000000001', '11', 'AVOID', ARRAY['work']::text[], 'กล้าตัดสินใจ เป็นผู้นำ เหมาะงานบุกเบิกระยะสั้น', 'ดื้อ ถือตัว ใจร้อน ขาดความรอบคอบ', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 36);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000037', '10000000-0000-4000-8000-000000000001', '11');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000038', '10000000-0000-4000-8000-000000000001', '12|21', 'AVOID', ARRAY['health']::text[], 'มีจินตนาการ ความคิดไม่เหมือนใคร', 'อารมณ์สองขั้ว ขัดแย้งในใจ ตัดสินใจไม่แน่นอน', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 37);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000038', '10000000-0000-4000-8000-000000000001', '12');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000038', '10000000-0000-4000-8000-000000000001', '21');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000039', '10000000-0000-4000-8000-000000000001', '13|31', 'AVOID', ARRAY['health','communication']::text[], 'ตัดสินใจเร็ว ทำงานว่องไว', 'พูดโผงผาง ใจร้อน ระวังอุบัติเหตุ', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 38);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000039', '10000000-0000-4000-8000-000000000001', '13');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000039', '10000000-0000-4000-8000-000000000001', '31');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000040', '10000000-0000-4000-8000-000000000001', '17|71', 'AVOID', ARRAY['work']::text[], 'เก่ง มั่นใจ มักได้ทำงานใหญ่', 'ถือตัว ไม่ฟังใคร ขาดคนสนับสนุน', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 39);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000040', '10000000-0000-4000-8000-000000000001', '17');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000040', '10000000-0000-4000-8000-000000000001', '71');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000041', '10000000-0000-4000-8000-000000000001', '18|81', 'AVOID', ARRAY['money']::text[], 'ใจกล้า กล้าแสดงความเห็น', 'เจ้าอารมณ์ หูเบา ชีวิตขึ้นลงแรง ระวังถูกโกง', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 40);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000041', '10000000-0000-4000-8000-000000000001', '18');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000041', '10000000-0000-4000-8000-000000000001', '81');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000042', '10000000-0000-4000-8000-000000000001', '25|52', 'AVOID', ARRAY['work','health']::text[], 'มีปัญญา บุคลิกน่าเชื่อถือ', 'ต้องสู้ด้วยตัวเอง ไม่มีโชคช่วย ควรดูแลสุขภาพระยะยาว', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 41);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000042', '10000000-0000-4000-8000-000000000001', '25');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000042', '10000000-0000-4000-8000-000000000001', '52');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000043', '10000000-0000-4000-8000-000000000001', '27|72', 'AVOID', ARRAY['money','love']::text[], 'ใช้ของดี มีรสนิยม', 'เสี่ยงหนี้สิน ใช้จ่ายเกินตัว มีปัญหาเรื่องความรัก', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 42);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000043', '10000000-0000-4000-8000-000000000001', '27');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000043', '10000000-0000-4000-8000-000000000001', '72');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000044', '10000000-0000-4000-8000-000000000001', '34|43', 'AVOID', ARRAY['communication']::text[], 'พูดตรง เด็ดขาด ปกครองคนได้', 'วาจาเผ็ดร้อน เกิดศัตรูเพราะคำพูด', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 43);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000044', '10000000-0000-4000-8000-000000000001', '34');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000044', '10000000-0000-4000-8000-000000000001', '43');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000045', '10000000-0000-4000-8000-000000000001', '37|73', 'AVOID', ARRAY['health','work']::text[], 'ทรหด อดทน ขยัน', 'อุปสรรคมาก แรงกดดันสูง ระวังอุบัติเหตุ', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 44);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000045', '10000000-0000-4000-8000-000000000001', '37');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000045', '10000000-0000-4000-8000-000000000001', '73');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000046', '10000000-0000-4000-8000-000000000001', '38|83', 'AVOID', ARRAY['work']::text[], 'คิดไว ทำไว แก้ปัญหาเฉพาะหน้าได้', 'ใช้อารมณ์ตัดสิน สิ่งที่สร้างมาพังง่าย', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 45);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000046', '10000000-0000-4000-8000-000000000001', '38');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000046', '10000000-0000-4000-8000-000000000001', '83');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000047', '10000000-0000-4000-8000-000000000001', '48|84', 'AVOID', ARRAY['communication']::text[], 'ไหวพริบดี ปรับตัวเก่ง', 'ปัญหาวุ่นวายไม่จบ คำพูดเสี่ยงสร้างเรื่อง', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 46);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000047', '10000000-0000-4000-8000-000000000001', '48');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000047', '10000000-0000-4000-8000-000000000001', '84');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000048', '10000000-0000-4000-8000-000000000001', '57|75', 'AVOID', ARRAY['work']::text[], 'ยืนหยัดในความถูกต้อง', 'ขัดแย้งกับผู้ใหญ่ ทำคุณคนไม่ขึ้น', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 47);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000048', '10000000-0000-4000-8000-000000000001', '57');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000048', '10000000-0000-4000-8000-000000000001', '75');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000049', '10000000-0000-4000-8000-000000000001', '58|85', 'AVOID', ARRAY['work']::text[], 'รู้ทันคน แก้ปัญหาเก่ง', 'ปัญหาเข้ามาให้แก้ไม่หยุด', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 48);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000049', '10000000-0000-4000-8000-000000000001', '58');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000049', '10000000-0000-4000-8000-000000000001', '85');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000050', '10000000-0000-4000-8000-000000000001', '67|76', 'AVOID', ARRAY['money','love']::text[], 'มุ่งมั่นหาเงิน มีรสนิยม', 'รายจ่ายสูง มีหนี้ ความรักมีอุปสรรค', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 49);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000050', '10000000-0000-4000-8000-000000000001', '67');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000050', '10000000-0000-4000-8000-000000000001', '76');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000051', '10000000-0000-4000-8000-000000000001', '68|86', 'AVOID', ARRAY['money']::text[], 'เข้าสังคมเก่ง สนุกสนาน', 'ใช้เงินฟุ่มเฟือย เก็บเงินไม่อยู่ เสี่ยงอบายมุข', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 50);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000051', '10000000-0000-4000-8000-000000000001', '68');
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000051', '10000000-0000-4000-8000-000000000001', '86');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000052', '10000000-0000-4000-8000-000000000001', '77', 'AVOID', ARRAY['work','health']::text[], 'รับผิดชอบสูง ละเอียด สู้งานหนัก', 'เครียดและกดดันสูง ผ่อนคลายไม่เป็น', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 51);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000052', '10000000-0000-4000-8000-000000000001', '77');
INSERT INTO pair_meaning (id, rule_set_version_id, pair_group, grade, categories, pros, cons, source, sort_order) VALUES ('20000000-0000-4000-8000-000000000053', '10000000-0000-4000-8000-000000000001', '88', 'AVOID', ARRAY['money']::text[], 'ใจใหญ่ กล้าได้กล้าเสีย', 'ชอบเสี่ยง เสี่ยงการพนันและอบายมุข', 'decoder159.com (อ.นิติกฤตย์) — หน้า "ทำนายเบอร์"', 52);
INSERT INTO pair_meaning_member (pair_meaning_id, rule_set_version_id, pair) VALUES ('20000000-0000-4000-8000-000000000053', '10000000-0000-4000-8000-000000000001', '88');

-- plate-rules.json (Wongnai)
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ก', 1);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ด', 1);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ถ', 1);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ท', 1);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ภ', 1);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ฤ', 1);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ข', 2);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'บ', 2);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ป', 2);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ง', 2);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ช', 2);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ต', 3);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ฒ', 3);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ฆ', 3);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ค', 4);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ธ', 4);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ร', 4);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ญ', 4);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ษ', 4);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ฉ', 5);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ฌ', 5);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ณ', 5);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'น', 5);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ม', 5);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ห', 5);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ฮ', 5);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ฬ', 5);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'จ', 6);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ล', 6);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ว', 6);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'อ', 6);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ฦ', 6);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ซ', 7);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ศ', 7);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ส', 7);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ย', 8);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ผ', 8);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ฝ', 8);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'พ', 8);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ฟ', 8);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ฎ', 9);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ฏ', 9);
INSERT INTO letter_value (rule_set_version_id, letter, value) VALUES ('10000000-0000-4000-8000-000000000002', 'ฐ', 9);
INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES ('10000000-0000-4000-8000-000000000002', 14, 'EXCELLENT', 'การงานก้าวหน้า มีผู้สนับสนุน');
INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES ('10000000-0000-4000-8000-000000000002', 41, 'EXCELLENT', 'การงานก้าวหน้า มีผู้สนับสนุน');
INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES ('10000000-0000-4000-8000-000000000002', 15, 'EXCELLENT', 'มีเสน่ห์ การงานมั่นคง');
INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES ('10000000-0000-4000-8000-000000000002', 51, 'EXCELLENT', 'มีเสน่ห์ การงานมั่นคง');
INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES ('10000000-0000-4000-8000-000000000002', 24, 'EXCELLENT', 'ค้าขายดี เจรจาเก่ง');
INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES ('10000000-0000-4000-8000-000000000002', 42, 'EXCELLENT', 'ค้าขายดี เจรจาเก่ง');
INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES ('10000000-0000-4000-8000-000000000002', 36, 'EXCELLENT', 'โชคด้านความรักและการเงิน');
INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES ('10000000-0000-4000-8000-000000000002', 63, 'EXCELLENT', 'โชคด้านความรักและการเงิน');
INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES ('10000000-0000-4000-8000-000000000002', 45, 'EXCELLENT', 'ปลอดภัย มีผู้ใหญ่อุปถัมภ์');
INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES ('10000000-0000-4000-8000-000000000002', 54, 'EXCELLENT', 'ปลอดภัย มีผู้ใหญ่อุปถัมภ์');
INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES ('10000000-0000-4000-8000-000000000002', 56, 'EXCELLENT', 'มั่งคั่ง การเงินดี');
INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES ('10000000-0000-4000-8000-000000000002', 65, 'EXCELLENT', 'มั่งคั่ง การเงินดี');
INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES ('10000000-0000-4000-8000-000000000002', 59, 'EXCELLENT', 'แคล้วคลาด สุขภาพดี');
INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES ('10000000-0000-4000-8000-000000000002', 95, 'EXCELLENT', 'แคล้วคลาด สุขภาพดี');
INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES ('10000000-0000-4000-8000-000000000002', 13, 'AVOID', 'เชื่อว่าเกี่ยวกับความใจร้อน อุบัติเหตุ');
INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES ('10000000-0000-4000-8000-000000000002', 31, 'AVOID', 'เชื่อว่าเกี่ยวกับความใจร้อน อุบัติเหตุ');
INSERT INTO sum_grade (rule_set_version_id, sum_value, grade, meaning) VALUES ('10000000-0000-4000-8000-000000000002', 37, 'AVOID', 'เชื่อว่าเกี่ยวกับความใจร้อน อุบัติเหตุ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'SUN', 'LUCKY_DIGIT', '1');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'SUN', 'LUCKY_DIGIT', '8');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'SUN', 'LUCKY_DIGIT', '9');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'SUN', 'AVOID_DIGIT', '6');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'MON', 'LUCKY_DIGIT', '2');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'MON', 'LUCKY_DIGIT', '4');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'MON', 'LUCKY_DIGIT', '6');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'MON', 'LUCKY_DIGIT', '7');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'MON', 'AVOID_DIGIT', '1');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'TUE', 'LUCKY_DIGIT', '3');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'TUE', 'LUCKY_DIGIT', '5');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'TUE', 'LUCKY_DIGIT', '8');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'TUE', 'LUCKY_DIGIT', '9');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'TUE', 'AVOID_DIGIT', '2');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'WED_DAY', 'LUCKY_DIGIT', '2');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'WED_DAY', 'LUCKY_DIGIT', '4');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'WED_DAY', 'LUCKY_DIGIT', '5');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'WED_DAY', 'LUCKY_DIGIT', '8');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'WED_DAY', 'AVOID_DIGIT', '3');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'WED_NIGHT', 'LUCKY_DIGIT', '1');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'WED_NIGHT', 'LUCKY_DIGIT', '7');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'WED_NIGHT', 'LUCKY_DIGIT', '8');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'WED_NIGHT', 'LUCKY_DIGIT', '9');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'WED_NIGHT', 'AVOID_DIGIT', '5');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'THU', 'LUCKY_DIGIT', '1');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'THU', 'LUCKY_DIGIT', '4');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'THU', 'LUCKY_DIGIT', '5');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'THU', 'LUCKY_DIGIT', '9');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'THU', 'AVOID_DIGIT', '7');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'FRI', 'LUCKY_DIGIT', '3');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'FRI', 'LUCKY_DIGIT', '5');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'FRI', 'LUCKY_DIGIT', '6');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'FRI', 'LUCKY_DIGIT', '9');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'FRI', 'AVOID_DIGIT', '8');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'SAT', 'LUCKY_DIGIT', '3');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'SAT', 'LUCKY_DIGIT', '7');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'SAT', 'LUCKY_DIGIT', '8');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'SAT', 'LUCKY_DIGIT', '9');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000002', 'SAT', 'AVOID_DIGIT', '4');
INSERT INTO avoid_pattern (rule_set_version_id, kind, value, reason, precedence) VALUES ('10000000-0000-4000-8000-000000000002', 'PAIR', '13', 'เชื่อว่าใจร้อน เสี่ยงเฉี่ยวชน', 1);
INSERT INTO avoid_pattern (rule_set_version_id, kind, value, reason, precedence) VALUES ('10000000-0000-4000-8000-000000000002', 'PAIR', '31', 'เชื่อว่าใจร้อน เสี่ยงเฉี่ยวชน', 1);
INSERT INTO avoid_pattern (rule_set_version_id, kind, value, reason, precedence) VALUES ('10000000-0000-4000-8000-000000000002', 'PAIR', '37', 'เชื่อว่าใจร้อน เสี่ยงเฉี่ยวชน', 1);
INSERT INTO avoid_pattern (rule_set_version_id, kind, value, reason, precedence) VALUES ('10000000-0000-4000-8000-000000000002', 'PAIR', '73', 'เชื่อว่าใจร้อน เสี่ยงเฉี่ยวชน', 1);
INSERT INTO avoid_pattern (rule_set_version_id, kind, value, reason, precedence) VALUES ('10000000-0000-4000-8000-000000000002', 'PAIR', '35', 'เชื่อว่าใจร้อน เสี่ยงเฉี่ยวชน', 1);
INSERT INTO avoid_pattern (rule_set_version_id, kind, value, reason, precedence) VALUES ('10000000-0000-4000-8000-000000000002', 'PAIR', '53', 'เชื่อว่าใจร้อน เสี่ยงเฉี่ยวชน', 1);
INSERT INTO avoid_pattern (rule_set_version_id, kind, value, reason, precedence) VALUES ('10000000-0000-4000-8000-000000000002', 'PAIR', '00', 'เชื่อว่ารถซ่อมบ่อย', 1);
INSERT INTO avoid_pattern (rule_set_version_id, kind, value, reason, precedence) VALUES ('10000000-0000-4000-8000-000000000002', 'PAIR', '03', 'เชื่อว่ารถซ่อมบ่อย', 1);
INSERT INTO avoid_pattern (rule_set_version_id, kind, value, reason, precedence) VALUES ('10000000-0000-4000-8000-000000000002', 'PAIR', '30', 'เชื่อว่ารถซ่อมบ่อย', 1);
INSERT INTO avoid_pattern (rule_set_version_id, kind, value, reason, precedence) VALUES ('10000000-0000-4000-8000-000000000002', 'PAIR', '07', 'เชื่อว่ารถซ่อมบ่อย', 1);
INSERT INTO avoid_pattern (rule_set_version_id, kind, value, reason, precedence) VALUES ('10000000-0000-4000-8000-000000000002', 'PAIR', '70', 'เชื่อว่ารถซ่อมบ่อย', 1);
INSERT INTO avoid_pattern (rule_set_version_id, kind, value, reason, precedence) VALUES ('10000000-0000-4000-8000-000000000002', 'PATTERN', 'one-bracket', 'เลข 1 คร่อมหน้า-หลัง', 2);
INSERT INTO avoid_pattern (rule_set_version_id, kind, value, reason, precedence) VALUES ('10000000-0000-4000-8000-000000000002', 'PATTERN', 'front-back-13', 'เลขหน้ารวมเลขหลังได้ 13', 2);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'trade-online', '24', 0);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'trade-online', '42', 1);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'trade-online', '46', 2);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'trade-online', '64', 3);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'trade-online', '78', 4);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'trade-online', '87', 5);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'trade-online', '89', 6);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'government-teacher', '15', 0);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'government-teacher', '51', 1);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'government-teacher', '45', 2);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'government-teacher', '54', 3);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'government-teacher', '59', 4);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'office-service-sales', '23', 0);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'office-service-sales', '32', 1);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'office-service-sales', '24', 2);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'office-service-sales', '42', 3);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'office-service-sales', '36', 4);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'office-service-sales', '63', 5);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'technician-doctor-engineer-traveler', '35', 0);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'technician-doctor-engineer-traveler', '53', 1);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'technician-doctor-engineer-traveler', '39', 2);
INSERT INTO occupation_pair (rule_set_version_id, group_key, pair, sort_order) VALUES ('10000000-0000-4000-8000-000000000002', 'technician-doctor-engineer-traveler', '93', 3);

-- plate-rules-allianz.json
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SUN', 'LUCKY_DIGIT', '1');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SUN', 'LUCKY_DIGIT', '2');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SUN', 'LUCKY_DIGIT', '3');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SUN', 'LUCKY_DIGIT', '4');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SUN', 'LUCKY_DIGIT', '9');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SUN', 'AVOID_DIGIT', '6');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SUN', 'AVOID_DIGIT', '7');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SUN', 'AVOID_DIGIT', '8');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SUN', 'AVOID_LETTER', 'ข');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SUN', 'AVOID_LETTER', 'ศ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SUN', 'AVOID_LETTER', 'ษ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SUN', 'AVOID_LETTER', 'ส');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SUN', 'AVOID_LETTER', 'ห');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SUN', 'AVOID_LETTER', 'ฬ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SUN', 'AVOID_LETTER', 'อ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SUN', 'AVOID_LETTER', 'ฮ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'MON', 'LUCKY_DIGIT', '2');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'MON', 'LUCKY_DIGIT', '3');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'MON', 'LUCKY_DIGIT', '5');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'MON', 'LUCKY_DIGIT', '7');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'MON', 'LUCKY_DIGIT', '9');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'MON', 'AVOID_DIGIT', '1');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'MON', 'AVOID_DIGIT', '4');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'MON', 'AVOID_DIGIT', '6');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'MON', 'AVOID_DIGIT', '8');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'MON', 'AVOID_LETTER', 'สระทั้งหมด');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'TUE', 'LUCKY_DIGIT', '1');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'TUE', 'LUCKY_DIGIT', '3');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'TUE', 'LUCKY_DIGIT', '5');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'TUE', 'LUCKY_DIGIT', '6');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'TUE', 'LUCKY_DIGIT', '9');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'TUE', 'AVOID_DIGIT', '2');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'TUE', 'AVOID_DIGIT', '4');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'TUE', 'AVOID_DIGIT', '7');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'TUE', 'AVOID_DIGIT', '8');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'TUE', 'AVOID_LETTER', 'ก');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'TUE', 'AVOID_LETTER', 'ข');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'TUE', 'AVOID_LETTER', 'ค');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'TUE', 'AVOID_LETTER', 'ฆ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'TUE', 'AVOID_LETTER', 'ง');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_DAY', 'LUCKY_DIGIT', '1');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_DAY', 'LUCKY_DIGIT', '4');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_DAY', 'LUCKY_DIGIT', '5');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_DAY', 'LUCKY_DIGIT', '7');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_DAY', 'LUCKY_DIGIT', '9');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_DAY', 'AVOID_DIGIT', '2');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_DAY', 'AVOID_DIGIT', '3');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_DAY', 'AVOID_DIGIT', '6');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_DAY', 'AVOID_DIGIT', '8');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_DAY', 'AVOID_LETTER', 'จ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_DAY', 'AVOID_LETTER', 'ฉ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_DAY', 'AVOID_LETTER', 'ช');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_DAY', 'AVOID_LETTER', 'ซ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_DAY', 'AVOID_LETTER', 'ฌ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_DAY', 'AVOID_LETTER', 'ญ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_NIGHT', 'LUCKY_DIGIT', '1');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_NIGHT', 'LUCKY_DIGIT', '4');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_NIGHT', 'LUCKY_DIGIT', '5');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_NIGHT', 'LUCKY_DIGIT', '7');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_NIGHT', 'LUCKY_DIGIT', '9');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_NIGHT', 'AVOID_DIGIT', '2');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_NIGHT', 'AVOID_DIGIT', '3');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_NIGHT', 'AVOID_DIGIT', '6');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_NIGHT', 'AVOID_DIGIT', '8');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_NIGHT', 'AVOID_LETTER', 'บ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_NIGHT', 'AVOID_LETTER', 'ป');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_NIGHT', 'AVOID_LETTER', 'ผ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_NIGHT', 'AVOID_LETTER', 'ฝ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_NIGHT', 'AVOID_LETTER', 'ภ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'WED_NIGHT', 'AVOID_LETTER', 'ม');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'THU', 'LUCKY_DIGIT', '1');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'THU', 'LUCKY_DIGIT', '3');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'THU', 'LUCKY_DIGIT', '5');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'THU', 'LUCKY_DIGIT', '7');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'THU', 'LUCKY_DIGIT', '8');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'THU', 'AVOID_DIGIT', '2');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'THU', 'AVOID_DIGIT', '4');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'THU', 'AVOID_DIGIT', '6');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'THU', 'AVOID_DIGIT', '9');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'THU', 'AVOID_LETTER', 'ด');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'THU', 'AVOID_LETTER', 'ต');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'THU', 'AVOID_LETTER', 'ถ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'THU', 'AVOID_LETTER', 'ท');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'THU', 'AVOID_LETTER', 'ธ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'THU', 'AVOID_LETTER', 'น');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'FRI', 'LUCKY_DIGIT', '3');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'FRI', 'LUCKY_DIGIT', '5');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'FRI', 'LUCKY_DIGIT', '6');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'FRI', 'LUCKY_DIGIT', '7');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'FRI', 'LUCKY_DIGIT', '9');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'FRI', 'AVOID_DIGIT', '1');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'FRI', 'AVOID_DIGIT', '2');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'FRI', 'AVOID_DIGIT', '4');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'FRI', 'AVOID_DIGIT', '8');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'FRI', 'AVOID_LETTER', 'ย');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'FRI', 'AVOID_LETTER', 'ร');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'FRI', 'AVOID_LETTER', 'ล');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'FRI', 'AVOID_LETTER', 'ว');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SAT', 'LUCKY_DIGIT', '2');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SAT', 'LUCKY_DIGIT', '4');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SAT', 'LUCKY_DIGIT', '6');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SAT', 'LUCKY_DIGIT', '7');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SAT', 'LUCKY_DIGIT', '9');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SAT', 'AVOID_DIGIT', '1');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SAT', 'AVOID_DIGIT', '3');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SAT', 'AVOID_DIGIT', '5');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SAT', 'AVOID_DIGIT', '8');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SAT', 'AVOID_LETTER', 'ฎ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SAT', 'AVOID_LETTER', 'ฏ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SAT', 'AVOID_LETTER', 'ฐ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SAT', 'AVOID_LETTER', 'ฑ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SAT', 'AVOID_LETTER', 'ฒ');
INSERT INTO birthday_rule (rule_set_version_id, day, kind, value) VALUES ('10000000-0000-4000-8000-000000000003', 'SAT', 'AVOID_LETTER', 'ณ');

-- Publish seed versions
UPDATE rule_set_version SET status = 'PUBLISHED', version = '0.1.0-mock', effective_at = '2026-11-06T00:00:00Z' WHERE id = '10000000-0000-4000-8000-000000000001';
UPDATE rule_set SET published_version_id = '10000000-0000-4000-8000-000000000001' WHERE id = 'pairs-common-belief-mock';
UPDATE rule_set_version SET status = 'PUBLISHED', version = '1.0.0-draft', effective_at = '2026-11-06T00:00:00Z' WHERE id = '10000000-0000-4000-8000-000000000002';
UPDATE rule_set SET published_version_id = '10000000-0000-4000-8000-000000000002' WHERE id = 'plate-wongnai-v1';
UPDATE rule_set_version SET status = 'PUBLISHED', version = '1.0.0-draft', effective_at = '2026-11-06T00:00:00Z' WHERE id = '10000000-0000-4000-8000-000000000003';
UPDATE rule_set SET published_version_id = '10000000-0000-4000-8000-000000000003' WHERE id = 'plate-allianz-v1';
UPDATE rule_set_version SET status = 'PUBLISHED', version = '0.1.0-mock', effective_at = '2026-11-06T00:00:00Z' WHERE id = '10000000-0000-4000-8000-000000000004';
UPDATE rule_set SET published_version_id = '10000000-0000-4000-8000-000000000004' WHERE id = 'phone-categories-mock';

-- phone-categories.json: หมวดเบอร์ 5 · อาชีพ 8 · เป้าหมาย 5
INSERT INTO category (id, type, label, enabled, rule_ref, description, status, sort_order) VALUES ('dragon', 'PHONE_TYPE', 'เบอร์มังกร', true, NULL, 'มีชุดเลข 789 หรือคู่ 78/87 + 89/98 · ข้อดี: อำนาจ บารมี การเงินก้อนใหญ่ ธุรกิจ/ลงทุน/บริหาร · ข้อเสีย: ดุดัน อารมณ์ร้อน อาจขัดแย้งกับผู้ใหญ่', 'PUBLISHED', 0);
INSERT INTO category (id, type, label, enabled, rule_ref, description, status, sort_order) VALUES ('phoenix', 'PHONE_TYPE', 'เบอร์หงส์', true, NULL, 'มีคู่เลข 36/63 หรือ 56/65 ใน 4 หลักท้าย', 'PUBLISHED', 1);
INSERT INTO category (id, type, label, enabled, rule_ref, description, status, sort_order) VALUES ('rich', 'PHONE_TYPE', 'เบอร์เศรษฐี', true, NULL, 'มีคู่ 89/98 หรือ 56/65 และไม่มีคู่ grade=avoid', 'PUBLISHED', 2);
INSERT INTO category (id, type, label, enabled, rule_ref, description, status, sort_order) VALUES ('vip', 'PHONE_TYPE', 'เบอร์ VIP', true, NULL, '4 หลักท้ายเป็นเลขเดียวกัน เช่น xxxx-x9999', 'PUBLISHED', 3);
INSERT INTO category (id, type, label, enabled, rule_ref, description, status, sort_order) VALUES ('pretty', 'PHONE_TYPE', 'เบอร์สวย', true, NULL, 'มีเลขเรียง/เลขซ้ำ/เลขสลับ เช่น 1234, 2424', 'PUBLISHED', 4);
INSERT INTO category (id, type, label, enabled, rule_ref, status, sort_order) VALUES ('trade', 'OCCUPATION', 'ค้าขาย', true, 'trade-online', 'PUBLISHED', 0);
INSERT INTO category (id, type, label, enabled, rule_ref, status, sort_order) VALUES ('business', 'OCCUPATION', 'ธุรกิจส่วนตัว', true, NULL, 'PUBLISHED', 1);
INSERT INTO category (id, type, label, enabled, rule_ref, status, sort_order) VALUES ('office', 'OCCUPATION', 'พนักงานออฟฟิศ', true, 'office-service-sales', 'PUBLISHED', 2);
INSERT INTO category (id, type, label, enabled, rule_ref, status, sort_order) VALUES ('executive', 'OCCUPATION', 'ผู้บริหาร', true, NULL, 'PUBLISHED', 3);
INSERT INTO category (id, type, label, enabled, rule_ref, status, sort_order) VALUES ('service', 'OCCUPATION', 'งานบริการ', true, 'office-service-sales', 'PUBLISHED', 4);
INSERT INTO category (id, type, label, enabled, rule_ref, status, sort_order) VALUES ('freelance', 'OCCUPATION', 'ฟรีแลนซ์', true, NULL, 'PUBLISHED', 5);
INSERT INTO category (id, type, label, enabled, rule_ref, status, sort_order) VALUES ('government-teacher', 'OCCUPATION', 'ข้าราชการ / ครู', true, 'government-teacher', 'PUBLISHED', 6);
INSERT INTO category (id, type, label, enabled, rule_ref, status, sort_order) VALUES ('technician-engineer', 'OCCUPATION', 'ช่าง / วิศวกร', true, 'technician-doctor-engineer-traveler', 'PUBLISHED', 7);
INSERT INTO category (id, type, label, enabled, rule_ref, status, sort_order) VALUES ('negotiation', 'GOAL', 'การเจรจา', true, 'communication', 'PUBLISHED', 0);
INSERT INTO category (id, type, label, enabled, rule_ref, status, sort_order) VALUES ('money', 'GOAL', 'การเงิน', true, 'money', 'PUBLISHED', 1);
INSERT INTO category (id, type, label, enabled, rule_ref, status, sort_order) VALUES ('relationship', 'GOAL', 'ความสัมพันธ์', true, 'love', 'PUBLISHED', 2);
INSERT INTO category (id, type, label, enabled, rule_ref, status, sort_order) VALUES ('health', 'GOAL', 'สุขภาพ', true, 'health', 'PUBLISHED', 3);
INSERT INTO category (id, type, label, enabled, rule_ref, status, sort_order) VALUES ('career', 'GOAL', 'การงาน', true, 'work', 'PUBLISHED', 4);

-- บทความ (content/articles/*.md)
INSERT INTO article_category (id, label) VALUES ('phone', 'เบอร์โทรศัพท์'), ('plate', 'ทะเบียนรถ'), ('general', 'ความรู้ทั่วไป');
INSERT INTO article (slug, title, description, category_id, author, updated_at, cover, body_markdown) VALUES ('how-to-read-phone-pairs', 'วิธีอ่านคู่เลขเบอร์โทร', 'อธิบายวิธีแยกคู่เลข 6 คู่จากเบอร์มือถือ 10 หลัก และการอ่านระดับคู่เลขตาม Rule Set ที่ระบบใช้', 'phone', 'ทีมเนื้อหา (ทดสอบ)', '2026-11-01', '/assets/cover-phone-pairs.svg', '## คู่เลขคืออะไร

ในความเชื่อเรื่องเลขมงคล เบอร์มือถือ 10 หลักจะถูกอ่านเป็น **คู่เลขติดกัน** โดยไม่นับ 3 หลักแรก (รหัสเครือข่าย เช่น 081) ระบบจึงเริ่มจากหลักที่ 4 ไปจนถึงหลักที่ 10 ได้ทั้งหมด 6 คู่

ตัวอย่าง เบอร์ 081-234-5678 จะได้คู่เลข 23, 34, 45, 56, 67 และ 78

## ระดับของคู่เลข

- **ดี** — คู่เลขที่ความเชื่อทั่วไปมองว่าส่งเสริม
- **ควรระวัง** — มีทั้งด้านดีและด้านที่ควรระวัง
- **ควรเลี่ยง** — คู่เลขที่ความเชื่อทั่วไปมองว่าไม่ส่งเสริม
- **ไม่มีข้อมูล** — Rule Set ที่ใช้ยังไม่มีความหมายของคู่นี้ ระบบจะไม่คิดคำทำนายขึ้นเอง

## ข้อควรรู้

ความหมายของคู่เลขในระบบนี้เป็นข้อมูลตัวอย่างที่รอผู้เชี่ยวชาญตรวจทาน ผลลัพธ์เป็นความเชื่อ ไม่ใช่ข้อเท็จจริงทางวิทยาศาสตร์');
INSERT INTO article_reference (article_slug, title, url, sort_order) VALUES ('how-to-read-phone-pairs', 'Wongnai — เลขทะเบียนรถมงคล (แหล่งอ้างอิงแนวคิดเรื่องคู่เลข)', 'https://www.wongnai.com/articles/lucky-car-registration', 0);
INSERT INTO article (slug, title, description, category_id, author, updated_at, cover, body_markdown) VALUES ('plate-sum-two-methods', 'ผลรวมทะเบียน 2 แบบ', 'เปรียบเทียบการหาผลรวมทะเบียนรถแบบเฉพาะตัวเลข และแบบรวมค่าอักษรตามตารางทักษา', 'plate', 'ทีมเนื้อหา (ทดสอบ)', '2026-11-02', '/assets/cover-plate-sum.svg', '## แบบที่ 1 — ผลรวมเฉพาะตัวเลข

นำเลขนำหน้าหมวด (ถ้ามี) และตัวเลขทุกหลักของทะเบียนมาบวกกัน เช่น 1กข 5900 ได้ 1 + 5 + 9 + 0 + 0 = 15

## แบบที่ 2 — ผลรวมรวมค่าอักษร

แปลงพยัญชนะในหมวดอักษรเป็นตัวเลข 1–9 ตามตารางทักษา แล้วบวกเพิ่มจากแบบที่ 1 เช่น ก = 1 และ ข = 2 ดังนั้น 1กข 5900 ได้ 15 + 1 + 2 = 18

## การตีความ

ระบบอ่านผลรวมแบบ 2 หลักตาม Rule Set ของ Wongnai โดยไม่ลดเหลือหลักเดียวเป็นค่าเริ่มต้น ผลรวมที่ไม่มีในตารางจะแสดงว่า "ไม่มีข้อมูล"');
INSERT INTO article_reference (article_slug, title, url, sort_order) VALUES ('plate-sum-two-methods', 'Wongnai — เลขทะเบียนรถมงคล', 'https://www.wongnai.com/articles/lucky-car-registration', 0);
INSERT INTO article (slug, title, description, category_id, author, updated_at, cover, body_markdown) VALUES ('birthday-and-plate', 'วันเกิดกับทะเบียนรถ', 'เลขส่งเสริมและเลขหรืออักษรที่ควรเลี่ยงตามวันเกิด 8 วัน โดยระบุแหล่งข้อมูลแยกกัน', 'plate', 'ทีมเนื้อหา (ทดสอบ)', '2026-11-03', '/assets/cover-birthday.svg', '## วันเกิด 8 วัน

ความเชื่อเรื่องทักษาแบ่งวันพุธเป็นกลางวันและกลางคืน จึงมีวันเกิดให้เลือกทั้งหมด 8 ค่า

## เลขส่งเสริมและเลขที่ควรเลี่ยง

ระบบใช้ตารางเลขตามวันเกิดจาก **Wongnai** และใช้รายการ **อักษรที่ควรเลี่ยง** จาก **Allianz Ayudhya** เพราะสองแหล่งให้ข้อมูลไม่ตรงกันทั้งหมด หน้าผลลัพธ์จึงระบุแหล่งของแต่ละรายการแยกกัน

## ข้อควรรู้

เป็นความเชื่อ ไม่ใช่ข้อห้ามตามกฎหมาย การขับขี่อย่างปลอดภัยสำคัญที่สุด');
INSERT INTO article_reference (article_slug, title, url, sort_order) VALUES ('birthday-and-plate', 'Wongnai — เลขทะเบียนรถมงคล', 'https://www.wongnai.com/articles/lucky-car-registration', 0);
INSERT INTO article_reference (article_slug, title, url, sort_order) VALUES ('birthday-and-plate', 'Allianz Ayudhya — เลขทะเบียนรถมงคล', 'https://www.allianz.co.th/th_TH/did-you-know/motor-insurance-article/lucky-license-plates.html', 1);
INSERT INTO article (slug, title, description, category_id, author, updated_at, cover, body_markdown) VALUES ('belief-disclaimer', 'เลขมงคลเป็นความเชื่อ', 'ขอบเขตของข้อมูลในระบบเลขมงคล และเหตุผลที่ทุกผลลัพธ์ต้องมีข้อความกำกับ', 'general', 'ทีมเนื้อหา (ทดสอบ)', '2026-11-04', '/assets/cover-disclaimer.svg', '## ผลลัพธ์เป็นความเชื่อ

ข้อมูลเลขมงคลในระบบนี้รวบรวมจากความเชื่อและบทความที่ระบุแหล่งไว้ ไม่ใช่ข้อเท็จจริงทางวิทยาศาสตร์ และไม่มีผลทางกฎหมาย

## ระบบไม่เก็บข้อมูลที่คุณกรอก

เบอร์โทรและทะเบียนที่กรอกใช้เพื่อคำนวณเท่านั้น ระบบเก็บเพียงจำนวนครั้งที่มีการวิเคราะห์

## ข้อมูลตัวอย่าง

ข้อมูลที่มีป้าย "ข้อมูลตัวอย่าง" ยังรอผู้เชี่ยวชาญตรวจทาน โปรดใช้วิจารณญาณ');

-- นาฬิกาแอป: NULL = ใช้เวลาจริง (POST /api/test/reset จะล็อกเวลา)
INSERT INTO app_clock (id, fixed_at) VALUES (1, NULL);

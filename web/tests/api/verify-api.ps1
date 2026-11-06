# ตรวจกฎตาม TEST-DATA ผ่าน API (PowerShell 7+) — ใช้: pwsh -File tests/api/verify-api.ps1 [-BaseUrl http://localhost:3000]
param([string]$BaseUrl = 'http://localhost:3000', [string]$DbContainer = 'mongkol-db')
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$OutputEncoding = [Text.Encoding]::UTF8
$script:results = [System.Collections.Generic.List[object]]::new()
$script:analyzeCalls = 0

function Invoke-Api {
  param([string]$Method = 'GET', [string]$Path, $Body = $null, [string]$Raw = $null, $Session = $null)
  $p = @{ Uri = "$BaseUrl$Path"; Method = $Method; SkipHttpErrorCheck = $true; ContentType = 'application/json; charset=utf-8' }
  if ($PSBoundParameters.ContainsKey('Raw')) { $p.Body = [Text.Encoding]::UTF8.GetBytes($Raw) }
  elseif ($null -ne $Body) { $p.Body = [Text.Encoding]::UTF8.GetBytes(($Body | ConvertTo-Json -Depth 10 -Compress)) }
  if ($Session) { $p.WebSession = $Session }
  $r = Invoke-WebRequest @p
  $text = [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray())
  $json = $null
  try { $json = $text | ConvertFrom-Json -Depth 20 } catch { }
  [pscustomobject]@{ Status = [int]$r.StatusCode; Json = $json; Text = $text; Headers = $r.Headers }
}
function Check([string]$Key, [bool]$Pass, [string]$Actual) {
  $script:results.Add([pscustomobject]@{ Key = $Key; Pass = $Pass; Actual = $Actual })
}
function Code($r) { if ($r.Json -and $r.Json.error) { $r.Json.error.code } else { "HTTP $($r.Status)" } }
function Reset-App { $null = Invoke-Api POST '/api/test/reset' -Raw '{"now":"2026-11-06T09:00:00+07:00"}'; $script:analyzeCalls = 0 }
function Advance([double]$Minutes) { $null = Invoke-Api POST '/api/test/clock' -Body @{ advanceMinutes = $Minutes } }
# ขยับนาฬิกาทุก 25 ครั้งเพื่อไม่ให้ชน rate limit 30/นาที ระหว่างตรวจกฎ
function Analyze([string]$Kind, $Body) {
  if ($script:analyzeCalls -ge 25) { Advance 1.01; $script:analyzeCalls = 0 }
  $script:analyzeCalls++
  Invoke-Api POST "/api/v1/$Kind/analyze" -Body $Body
}
function Login([string]$User, [string]$Pw) {
  $s = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $r = Invoke-Api POST '/api/v1/admin/login' -Body @{ username = $User; password = $Pw } -Session $s
  [pscustomobject]@{ Session = $s; Resp = $r }
}
function Grades($r) { ($r.Json.data.pairs | ForEach-Object { "$($_.pair):$($_.grade)" }) -join ' ' }
function PsqlScalar([string]$Sql) { (docker exec $DbContainer psql -U mongkol -d mongkol -tAc $Sql | Out-String).Trim() }

Reset-App

# ===================== เบอร์โทร =====================
$pdV = [ordered]@{ 'PD-V01' = '0812345678'; 'PD-V02' = '0612345678'; 'PD-V03' = '0912345678'; 'PD-V04' = '081-234-5678'; 'PD-V05' = '081 234 5678'
  'PD-V06' = '+66812345678'; 'PD-V07' = '66812345678'; 'PD-V08' = '  0812345678  '; 'PD-V09' = '๐๘๑๒๓๔๕๖๗๘'; 'PD-V10' = '+66-81-234-5678' }
$pdVExp = @{ 'PD-V02' = '0612345678'; 'PD-V03' = '0912345678' }
foreach ($k in $pdV.Keys) {
  $r = Analyze 'phone' @{ number = $pdV[$k] }
  $exp = if ($pdVExp[$k]) { $pdVExp[$k] } else { '0812345678' }
  $n = $r.Json.data.normalized
  Check $k ($r.Status -eq 200 -and $n -eq $exp -and @($r.Json.data.pairs).Count -eq 6) "status=$($r.Status) normalized=$n"
}
$pdI = [ordered]@{ 'PD-I01' = @('', 'PHONE_REQUIRED'); 'PD-I02' = @('   ', 'PHONE_REQUIRED'); 'PD-I03' = @('081234567', 'PHONE_INVALID_LENGTH')
  'PD-I04' = @('08123456789', 'PHONE_INVALID_LENGTH'); 'PD-I05' = @('08123', 'PHONE_INVALID_LENGTH'); 'PD-I06' = @('081234567890', 'PHONE_INVALID_LENGTH')
  'PD-I07' = @('+6681234567', 'PHONE_INVALID_LENGTH'); 'PD-I08' = @('+668123456789', 'PHONE_INVALID_LENGTH'); 'PD-I09' = @('08a2345678', 'PHONE_INVALID_CHAR')
  'PD-I10' = @('0812.345.678', 'PHONE_INVALID_CHAR'); 'PD-I11' = @('021234567', 'PHONE_NOT_MOBILE'); 'PD-I12' = @('0512345678', 'PHONE_NOT_MOBILE')
  'PD-I13' = @('0712345678', 'PHONE_NOT_MOBILE'); 'PD-I14' = @('1812345678', 'PHONE_NOT_MOBILE'); 'PD-I15' = @('+1 202 555 0100', 'PHONE_NOT_MOBILE')
  'PD-I16' = @(('0' * 21), 'PHONE_INVALID_LENGTH') }
$msg = @{ PHONE_REQUIRED = 'กรุณากรอกเบอร์มือถือ'; PHONE_INVALID_LENGTH = 'กรุณากรอกเบอร์มือถือ 10 หลัก'; PHONE_INVALID_CHAR = 'กรุณากรอกเบอร์มือถือ 10 หลัก'; PHONE_NOT_MOBILE = 'รองรับเฉพาะเบอร์มือถือ' }
foreach ($k in $pdI.Keys) {
  $r = Analyze 'phone' @{ number = $pdI[$k][0] }
  $c = Code $r
  Check $k ($r.Status -eq 400 -and $c -eq $pdI[$k][1] -and $r.Json.error.message -eq $msg[$c]) "status=$($r.Status) code=$c msg=$($r.Json.error.message)"
}
$pdG = [ordered]@{
  'PD-G01' = @('0812345678', '23:good 34:avoid 45:good 56:good 67:avoid 78:good')
  'PD-G02' = @('0891245678', '12:avoid 24:good 45:good 56:good 67:avoid 78:good')
  'PD-G03' = @('0861313737', '13:avoid 31:avoid 13:avoid 37:avoid 73:avoid 37:avoid')
  'PD-G04' = @('0816365656', '63:good 36:good 65:good 56:good 65:good 56:good')
  'PD-G05' = @('0927878999', '78:good 87:good 78:good 89:good 99:good 99:good')
  'PD-G06' = @('0954242424', '42:good 24:good 42:good 24:good 42:good 24:good')
  'PD-G07' = @('0800000000', '00:avoid 00:avoid 00:avoid 00:avoid 00:avoid 00:avoid')
  'PD-G08' = @('0835353535', '53:good 35:good 53:good 35:good 53:good 35:good') }
foreach ($k in $pdG.Keys) {
  $r = Analyze 'phone' @{ number = $pdG[$k][0] }
  $g = Grades $r
  $pos = ($r.Json.data.pairs | Select-Object -First 1).position + '..' + ($r.Json.data.pairs | Select-Object -Last 1).position
  Check $k ($g -eq $pdG[$k][1] -and $pos -eq '4-5..9-10') "$g [$pos]"
}
$r = Analyze 'phone' @{ number = '0891245678'; occupation = 'trade' }
$rec = $r.Json.data.recommendation
Check 'PD-O01' ($r.Status -eq 200 -and $rec.matchedRule -and @($rec.pairs).Count -gt 0 -and $rec.reason) "matched=$($rec.matchedRule) pairs=$($rec.pairs -join ',')"
$r = Analyze 'phone' @{ number = '0891245678' }
Check 'PD-O02' ($r.Status -eq 200 -and $null -eq $r.Json.data.recommendation) "status=$($r.Status) rec=$($r.Json.data.recommendation)"
$r = Analyze 'phone' @{ number = '0891245678'; occupation = 'freelance' }
Check 'PD-O03' ($r.Status -eq 200 -and -not $r.Json.data.recommendation.matchedRule -and $r.Json.data.recommendation.reason -like '*ใช้ผลวิเคราะห์ทั่วไป*') "reason=$($r.Json.data.recommendation.reason)"
$r = Analyze 'phone' @{ number = '0891245678'; goal = 'money' }
$pairsMoney = @($r.Json.data.recommendation.pairs)
$allMoney = $true
foreach ($p in $pairsMoney) { $s = Invoke-Api GET "/api/v1/pairs/$p"; if (-not ($s.Json.data.categories -contains 'money')) { $allMoney = $false } }
Check 'PD-O04' ($r.Status -eq 200 -and $pairsMoney.Count -gt 0 -and $allMoney) "pairs=$($pairsMoney -join ',') allMoney=$allMoney"
$r = Analyze 'phone' @{ number = '0891245678'; occupation = 'astronaut' }
Check 'PD-O05' ($r.Status -eq 400 -and (Code $r) -eq 'INVALID_OPTION') (Code $r)
$r = Analyze 'phone' @{ number = '0891245678'; occupation = 'trade'; goal = 'fly' }
Check 'PD-O06' ($r.Status -eq 400 -and (Code $r) -eq 'INVALID_OPTION') (Code $r)

# ===================== ทะเบียน =====================
$ldV = [ordered]@{ 'LD-V01' = @('กข 1234', '', 'กข', '1234'); 'LD-V02' = @('1กข 234', '1', 'กข', '234'); 'LD-V03' = @('ก 1', '', 'ก', '1')
  'LD-V04' = @('กข1234', '', 'กข', '1234'); 'LD-V05' = @('กข-1234', '', 'กข', '1234'); 'LD-V06' = @('9ฆฆ 9999', '9', 'ฆฆ', '9999'); 'LD-V07' = @('๑กข ๑๒๓๔', '1', 'กข', '1234') }
foreach ($k in $ldV.Keys) {
  $e = $ldV[$k]
  $r = Analyze 'plate' @{ plate = $e[0] }
  $d = $r.Json.data.plate
  $letters = ($d.letters | ForEach-Object { $_.char }) -join ''
  Check $k ($r.Status -eq 200 -and $d.prefix -eq $e[1] -and $letters -eq $e[2] -and $d.digits -eq $e[3]) "status=$($r.Status) $($d.prefix)|$letters|$($d.digits)"
}
$ldI = [ordered]@{ 'LD-I01' = @('0กข 1', 'PLATE_INVALID_PREFIX'); 'LD-I02a' = @('10กข 1', 'PLATE_INVALID_FORMAT'); 'LD-I02b' = @('12กข 34', 'PLATE_INVALID_FORMAT')
  'LD-I03' = @('1234', 'PLATE_LETTERS_REQUIRED'); 'LD-I04' = @('กขค 123', 'PLATE_INVALID_FORMAT'); 'LD-I05' = @('AB 1234', 'PLATE_INVALID_LETTER')
  'LD-I06' = @('กา 123', 'PLATE_INVALID_LETTER'); 'LD-I07' = @('ก่ข 12', 'PLATE_INVALID_LETTER'); 'LD-I08' = @('กข', 'PLATE_DIGITS_REQUIRED')
  'LD-I09' = @('กข 12345', 'PLATE_INVALID_FORMAT'); 'LD-I10' = @('กข 0', 'PLATE_LEADING_ZERO'); 'LD-I11' = @('กข 0123', 'PLATE_LEADING_ZERO'); 'LD-I12' = @('', 'PLATE_LETTERS_REQUIRED') }
foreach ($k in $ldI.Keys) {
  $r = Analyze 'plate' @{ plate = $ldI[$k][0] }
  Check $k ($r.Status -eq 400 -and (Code $r) -eq $ldI[$k][1]) "status=$($r.Status) code=$(Code $r)"
}
$r = Analyze 'plate' @{ prefix = ''; letters = ''; digits = '' }
Check 'LD-I12 (แยกช่อง)' ((Code $r) -eq 'PLATE_LETTERS_REQUIRED') (Code $r)
$r = Analyze 'plate' @{ plate = 'กข 12'; birthDay = 'holiday' }
Check 'LD-I13' ($r.Status -eq 400 -and (Code $r) -eq 'INVALID_OPTION') (Code $r)

$ldS = [ordered]@{ 'LD-S01' = @('1กข 5900', 15, 'excellent', 18, 'no-data'); 'LD-S02' = @('กข 1234', 10, 'no-data', 13, 'avoid'); 'LD-S03' = @('ฆฆ 9999', 36, 'excellent', 42, 'excellent')
  'LD-S04' = @('กข 4550', 14, 'excellent', 17, 'no-data'); 'LD-S05' = @('กข 37', 10, 'no-data', 13, 'avoid'); 'LD-S06' = @('ขค 1771', 16, 'no-data', 22, 'no-data')
  'LD-S07' = @('กก 9900', 18, 'no-data', 20, 'no-data'); 'LD-S08' = @('กข 6500', 11, 'no-data', 14, 'excellent'); 'LD-S09' = @('ก 1', 1, 'no-data', 2, 'no-data')
  'LD-S10' = @('9ฆฆ 9999', 45, 'excellent', 51, 'excellent'); 'LD-S11' = @('9ฎฎ 9999', 45, 'excellent', 63, 'excellent'); 'LD-S12' = @('1ก 1', 2, 'no-data', 3, 'no-data')
  'LD-S13' = @('กข 9999', 36, 'excellent', 39, 'no-data'); 'LD-S14' = @('ศส 5656', 22, 'no-data', 36, 'excellent') }
foreach ($k in $ldS.Keys) {
  $e = $ldS[$k]
  $r = Analyze 'plate' @{ plate = $e[0] }
  $s = $r.Json.data.sums
  $act = "$($s[0].total)/$($s[0].grade) $($s[1].total)/$($s[1].grade)"
  Check $k ($act -eq "$($e[1])/$($e[2]) $($e[3])/$($e[4])") $act
}
$r = Analyze 'plate' @{ plate = '1กข 5900' }
Check 'LD-S15' ($r.Json.data.sums[0].total -eq 15 -and $r.Json.data.sums[0].reduced -eq 6 -and $r.Json.data.sums[0].formula -eq '1 + 5 + 9 + 0 + 0 = 15') "total=$($r.Json.data.sums[0].total) reduced=$($r.Json.data.sums[0].reduced) formula=$($r.Json.data.sums[0].formula)"

$ldB = [ordered]@{ 'LD-B01' = @('1กข 5900', 'sun', '', 'ข'); 'LD-B02' = @('กข 1234', 'mon', '1', ''); 'LD-B03' = @('กข 1234', 'tue', '2', 'ก,ข')
  'LD-B04' = @('1กข 5900', 'wed-night', '5', ''); 'LD-B05' = @('1กข 5900', 'wed-day', '', ''); 'LD-B06' = @('กข 4550', 'sat', '4', '')
  'LD-B07' = @('ฆฆ 9999', 'fri', '', ''); 'LD-B08' = @('ดท 7777', 'thu', '7,7,7,7', 'ด,ท') }
foreach ($k in $ldB.Keys) {
  $e = $ldB[$k]
  $r = Analyze 'plate' @{ plate = $e[0]; birthDay = $e[1] }
  $b = $r.Json.data.birthDay
  $hd = ($b.highlightDigits | ForEach-Object { $_.value }) -join ','
  $hl = ($b.highlightLetters | ForEach-Object { $_.char }) -join ','
  $src = (@($b.highlightDigits) + @($b.highlightLetters) | Where-Object { $_ -and (-not $_.reason -or -not $_.source) }).Count -eq 0
  Check $k ($hd -eq $e[2] -and $hl -eq $e[3] -and $src) "digits=[$hd] letters=[$hl] reason+source=$src"
}
$r = Analyze 'plate' @{ plate = 'กข 1234' }
Check 'LD-B09' ($r.Status -eq 200 -and $null -eq $r.Json.data.birthDay) "birthDay=$($r.Json.data.birthDay)"

$ldP = [ordered]@{ 'LD-P01' = @('1กข 5900', '59:good 90:avoid 00:avoid', ''); 'LD-P02' = @('กข 1234', '12:avoid 23:good 34:avoid', '')
  'LD-P03' = @('กข 37', '37:avoid', ''); 'LD-P04' = @('ขค 1771', '17:avoid 77:avoid 71:avoid', 'one-bracket')
  'LD-P05' = @('กข 1001', '10:avoid 00:avoid 01:avoid', 'one-bracket'); 'LD-P06' = @('กข 3070', '30:avoid 07:avoid 70:avoid', '')
  'LD-P07' = @('กข 3553', '35:caution 55:good 53:caution', ''); 'LD-P08' = @('ก 7', '', '') }
foreach ($k in $ldP.Keys) {
  $e = $ldP[$k]
  $r = Analyze 'plate' @{ plate = $e[0] }
  $g = Grades $r
  $pt = ($r.Json.data.patterns | ForEach-Object { $_.id }) -join ','
  Check $k ($r.Status -eq 200 -and $g -eq $e[1] -and $pt -eq $e[2]) "pairs=[$g] patterns=[$pt]"
}
$a = Analyze 'plate' @{ plate = '1กข 5900' }; $b2 = Analyze 'plate' @{ plate = '1ขค 5900' }
Check 'LD-P09' ((Grades $a) -eq (Grades $b2)) "$(Grades $a) vs $(Grades $b2)"
$r1 = Analyze 'plate' @{ plate = 'กข 1234'; province = 'กรุงเทพมหานคร' }
$r2 = Analyze 'plate' @{ plate = 'กข 1234'; province = 'เชียงใหม่' }
$r3 = Analyze 'plate' @{ plate = 'กข 1234' }
$j1 = $r1.Json.data | ConvertTo-Json -Depth 10 -Compress; $j2 = $r2.Json.data | ConvertTo-Json -Depth 10 -Compress; $j3 = $r3.Json.data | ConvertTo-Json -Depth 10 -Compress
Check 'LD-R01' ($j1 -eq $j3) 'กรุงเทพฯ vs ไม่กรอก'
Check 'LD-R02' ($j2 -eq $j3) 'เชียงใหม่ vs ไม่กรอก'
Check 'LD-R03' ($r3.Status -eq 200) "status=$($r3.Status)"

# ค่าขอบ §4.2/§4.3 ที่ไม่ซ้ำกับ LD-*
$bd = [ordered]@{ 'B4.2 prefix=9' = @('9กข 1', 200, ''); 'B4.2 3 อักษร' = @('กขค 1', 400, 'PLATE_INVALID_FORMAT'); 'B4.2 กข 9999' = @('กข 9999', 200, '')
  'B4.2 5 หลัก' = @('กข 10000', 400, 'PLATE_INVALID_FORMAT'); 'B4.2 หลักเดียว' = @('กข 1', 200, '') }
foreach ($k in $bd.Keys) { $r = Analyze 'plate' @{ plate = $bd[$k][0] }; Check $k ($r.Status -eq $bd[$k][1] -and ($bd[$k][2] -eq '' -or (Code $r) -eq $bd[$k][2])) "status=$($r.Status) $(Code $r)" }
$r = Analyze 'plate' @{ plate = 'กข 7' }; Check 'B4.3 คู่ทะเบียนต่ำสุด 0' (@($r.Json.data.pairs).Count -eq 0) "count=$(@($r.Json.data.pairs).Count)"
$r = Analyze 'plate' @{ plate = 'กข 1234' }; Check 'B4.3 คู่ทะเบียนสูงสุด 3' (@($r.Json.data.pairs).Count -eq 3) "count=$(@($r.Json.data.pairs).Count)"

# ===================== ค้นหาคู่เลข =====================
$sd = [ordered]@{ 'SD-01' = @('24', 'good', 'มีเสน่ห์ คนเมตตา มนุษยสัมพันธ์ดี มีเพื่อนช่วยเหลือ'); 'SD-03' = @('89', 'good', ''); 'SD-04' = @('13', 'avoid', ''); 'SD-05' = @('35', 'good', '')
  'SD-06' = @('47', 'no-data', ''); 'SD-07' = @('00', 'avoid', 'มีมุมมองแปลกใหม่ ชอบศึกษาเรื่องลึกลับ'); 'SD-08' = @('33', 'no-data', '') }
foreach ($k in $sd.Keys) {
  $r = Invoke-Api GET "/api/v1/pairs/$($sd[$k][0])"; $d = $r.Json.data
  $ok = $r.Status -eq 200 -and $d.grade -eq $sd[$k][1] -and ($sd[$k][2] -eq '' -or $d.meaning -eq $sd[$k][2])
  if ($k -eq 'SD-03') { $ok = $ok -and ($d.categories -contains 'work') -and ($d.categories -contains 'luck') }
  if ($k -eq 'SD-04') { $ok = $ok -and $d.cons }
  if ($k -eq 'SD-05') { $ok = $ok -and $d.pros -and $d.cons }
  if ($k -in 'SD-06', 'SD-08') { $ok = $ok -and $null -eq $d.meaning }
  Check $k $ok "grade=$($d.grade) meaning=$($d.meaning) cats=$($d.categories -join ',')"
}
$a = Invoke-Api GET '/api/v1/pairs/24'; $b2 = Invoke-Api GET '/api/v1/pairs/42'
Check 'SD-02' ($a.Json.data.meaning -eq $b2.Json.data.meaning -and $a.Json.data.grade -eq $b2.Json.data.grade) "42=$($b2.Json.data.grade)/$($b2.Json.data.meaning)"
foreach ($x in @(@('SD-09', '2'), @('SD-10', '245'), @('SD-11', 'ab'))) {
  $r = Invoke-Api GET "/api/v1/pairs/$($x[1])"; Check $x[0] ($r.Status -eq 400 -and (Code $r) -eq 'PAIR_INVALID' -and $r.Json.error.message -eq 'กรุณากรอกเลข 2 หลัก') "$(Code $r)"
}
$r = Invoke-Api GET "/api/v1/pairs/$([uri]::EscapeDataString('๒๔'))"; Check 'SD-12' ($r.Json.data.pair -eq '24' -and $r.Json.data.grade -eq 'good') "pair=$($r.Json.data.pair)"

# ===================== บทความ (§4 seed + §4.4) =====================
function ArticleSearch([string]$q) { Invoke-Api GET "/api/v1/articles?q=$([uri]::EscapeDataString($q))" }
$r = ArticleSearch 'ผลรวม'; Check 'ART ผลรวม' (($r.Json.data.items | ForEach-Object slug) -contains 'plate-sum-two-methods') (($r.Json.data.items | ForEach-Object slug) -join ',')
$r = ArticleSearch 'คู่เลข'; Check 'ART คู่เลข' (($r.Json.data.items | ForEach-Object slug) -contains 'how-to-read-phone-pairs') (($r.Json.data.items | ForEach-Object slug) -join ',')
$r = ArticleSearch 'zzzz-ไม่มี'; Check 'ART empty' ($r.Status -eq 200 -and $r.Json.data.total -eq 0) "total=$($r.Json.data.total)"
$r = ArticleSearch ('ก' * 100); Check 'ART ก×100' ($r.Status -eq 200) "status=$($r.Status)"
$r = ArticleSearch ('ก' * 101); Check 'ART ก×101' ($r.Status -eq 400 -and (Code $r) -eq 'QUERY_TOO_LONG') (Code $r)
$r = Invoke-Api GET '/api/v1/articles?category=plate'; Check 'ART filter plate' ((@($r.Json.data.items | Where-Object { $_.category_id -ne 'plate' }).Count -eq 0) -and $r.Json.data.total -eq 2) "total=$($r.Json.data.total)"
$r = Invoke-Api GET '/articles/not-exist'; Check 'ART not-exist 404' ($r.Status -eq 404) "status=$($r.Status)"
$r = Invoke-Api GET '/api/v1/articles?q='; Check 'ART ว่าง=ทั้งหมด' ($r.Json.data.total -eq 4) "total=$($r.Json.data.total)"

# ===================== Admin — คู่เลข (8.1) + Audit (8.4) =====================
Reset-App
$ed = Login 'editor.test' 'Editor#Test2026'; $ad = Login 'admin.test' 'Admin#Test2026'; $ad2 = Login 'admin2.test' 'Admin2#Test2026'
$r = Invoke-Api POST '/api/v1/admin/pairs' -Session $ed.Session -Body @{ pairs = @('47', '74'); grade = 'good'; categories = @('work'); pros = 'ทดสอบ: ความคิดสร้างสรรค์'; cons = $null; source = 'Test Fixture' }
$draftId = $r.Json.data.draftId
$q = Invoke-Api GET '/api/v1/pairs/47'
Check 'AD-D01' ($r.Status -eq 200 -and $r.Json.data.status -eq 'DRAFT' -and $q.Json.data.grade -eq 'no-data') "status=$($r.Status) draft=$($r.Json.data.status) pairs67=$($q.Json.data.grade)"
$r = Invoke-Api POST "/api/v1/admin/versions/$draftId/approve" -Session $ed.Session
Check 'AD-D02' ($r.Status -eq 403 -and (Code $r) -eq 'FORBIDDEN_SELF_APPROVE') "status=$($r.Status) $(Code $r)"
$ap = Invoke-Api POST "/api/v1/admin/versions/$draftId/approve" -Session $ad.Session
$pb = Invoke-Api POST "/api/v1/admin/versions/$draftId/publish" -Session $ad.Session -Body @{ baseVersion = '0.1.0-mock' }
$newVer = $pb.Json.data.version
$q = Invoke-Api GET '/api/v1/pairs/47'
$ph = Analyze 'phone' @{ number = '0812347000' }
$p67 = ($ph.Json.data.pairs | Where-Object { $_.pair -eq '47' }).grade
Check 'AD-D03' ($ap.Status -eq 200 -and $pb.Status -eq 200 -and $newVer -and $newVer -ne '0.1.0-mock' -and $q.Json.data.grade -eq 'good' -and $ph.Json.data.ruleSet.version -eq $newVer -and $p67 -eq 'good') "approve=$($ap.Status) publish=$($pb.Status) version=$newVer pairs67=$($q.Json.data.grade) phone67=$p67 phoneVer=$($ph.Json.data.ruleSet.version)"
$rb = Invoke-Api POST '/api/v1/admin/rules/rollback' -Session $ad.Session -Body @{ ruleSetId = 'pairs-common-belief-mock'; targetVersion = '0.1.0-mock'; baseVersion = $newVer }
$q = Invoke-Api GET '/api/v1/pairs/47'
Check 'AD-D04' ($rb.Status -eq 200 -and $rb.Json.data.version -ne $newVer -and $rb.Json.data.version -ne '0.1.0-mock' -and $q.Json.data.grade -eq 'no-data' -and $q.Json.data.ruleSet.version -eq $rb.Json.data.version) "status=$($rb.Status) version=$($rb.Json.data.version) pairs67=$($q.Json.data.grade)"
$au = Invoke-Api GET '/api/v1/admin/audit' -Session $ad.Session
$rows = @($au.Json.data.items)
$sig = ($rows | ForEach-Object { "$($_.actor):$($_.action)" }) -join ' '
$expSig = 'editor.test:DRAFT_SAVED admin.test:APPROVED admin.test:PUBLISHED admin.test:ROLLBACK'
$detail = $rows.Count -eq 4 -and $rows[0].entity_id -eq '47|74' -and $rows[0].after -eq 'good' -and $rows[1].before -eq 'DRAFT' -and $rows[1].after -eq 'APPROVED' -and $rows[2].before -eq '0.1.0-mock' -and $rows[2].after -eq $newVer -and $rows[3].before -eq $newVer -and $rows[3].after.from -eq '0.1.0-mock'
Check 'AUDIT-8.4' ($sig -eq $expSig -and $detail) $sig
$vs = Invoke-Api GET '/api/v1/admin/rule-sets' -Session $ad.Session
$hist = ($vs.Json.data.versions | Where-Object { $_.ruleId -eq 'pairs-common-belief-mock' } | ForEach-Object { "$($_.version):$($_.status)" }) -join ' '
Check 'AD-012 ประวัติไม่ถูกลบ' ($hist -eq "0.1.0-mock:SUPERSEDED ${newVer}:SUPERSEDED $($rb.Json.data.version):PUBLISHED") $hist

$r = Invoke-Api POST '/api/v1/admin/pairs' -Session $ed.Session -Body @{ pairs = @('24'); grade = 'good'; categories = @(); pros = 'x'; source = 'Test Fixture' }
Check 'AD-D05' ($r.Status -eq 409 -and (Code $r) -eq 'PAIR_DUPLICATE' -and $r.Json.error.message -eq 'มีคู่เลขนี้แล้ว') "status=$($r.Status) $(Code $r)"
$r = Invoke-Api POST '/api/v1/admin/pairs' -Session $ed.Session -Body @{ pairs = @('68'); source = '' }
Check 'AD-D06' ($r.Status -eq 400 -and (Code $r) -eq 'SOURCE_REQUIRED') "status=$($r.Status) $(Code $r)"
$r1 = Invoke-Api POST '/api/v1/admin/pairs' -Session $ed.Session -Body @{ pairs = @('7') }
$r2 = Invoke-Api POST '/api/v1/admin/pairs' -Session $ed.Session -Body @{ pairs = @('abc') }
Check 'AD-D07' ($r1.Status -eq 400 -and (Code $r1) -eq 'PAIR_INVALID' -and (Code $r2) -eq 'PAIR_INVALID') "$(Code $r1) / $(Code $r2)"
$r = Invoke-Api POST '/api/v1/admin/pairs' -Session $ed.Session -Body @{ pairs = @('33'); grade = 'good'; categories = @('work'); pros = ('ก' * 500); source = 'Test Fixture' }
Check 'AD-D08' ($r.Status -eq 200) "status=$($r.Status) $(Code $r)"
$r = Invoke-Api POST '/api/v1/admin/pairs' -Session $ed.Session -Body @{ pairs = @('16', '61'); grade = 'good'; categories = @(); pros = ('ก' * 501); source = 'Test Fixture' }
Check 'AD-D09' ($r.Status -eq 400 -and (Code $r) -eq 'VALIDATION_LENGTH') "status=$($r.Status) $(Code $r)"
$r = Invoke-Api POST '/api/v1/admin/pairs' -Session $ed.Session -Body @{ pairs = @('16', '61'); grade = 'good'; categories = @(); pros = 'x'; source = ('a' * 256) }
Check 'AD-D10' ($r.Status -eq 400 -and (Code $r) -eq 'VALIDATION_LENGTH') "status=$($r.Status) $(Code $r)"
# AD-D11: Draft (จาก AD-D08) → Approve → admin + admin2 publish พร้อมกันด้วย baseVersion เดียวกัน
$cur = $rb.Json.data.version
$d11 = (Invoke-Api GET '/api/v1/admin/pairs' -Session $ad.Session).Json.data.draft.id
$null = Invoke-Api POST "/api/v1/admin/versions/$d11/approve" -Session $ad.Session
$jobs = @($ad.Session, $ad2.Session) | ForEach-Object -Parallel {
  $p = @{ Uri = "$using:BaseUrl/api/v1/admin/versions/$using:d11/publish"; Method = 'POST'; SkipHttpErrorCheck = $true; ContentType = 'application/json'; Body = (@{ baseVersion = $using:cur } | ConvertTo-Json); WebSession = $_ }
  $r = Invoke-WebRequest @p
  "$([int]$r.StatusCode):$((($r.Content | ConvertFrom-Json).error).code)"
} -ThrottleLimit 2
$sorted = ($jobs | Sort-Object) -join ' '
Check 'AD-D11' ($sorted -eq '200: 409:VERSION_CONFLICT') $sorted

# ===================== Admin — หมวด (8.2) =====================
function OccIds { ((Invoke-Api GET '/api/v1/categories').Json.data.occupations | ForEach-Object id) }
$r = Invoke-Api POST '/api/v1/admin/categories' -Session $ed.Session -Body @{ id = 'teacher-online'; type = 'OCCUPATION'; label = 'ครูออนไลน์'; enabled = $true; ruleRef = 'government-teacher' }
$before = OccIds
$p = Invoke-Api POST '/api/v1/admin/categories/teacher-online/publish' -Session $ad.Session
$after = OccIds
Check 'AD-C01' ($r.Status -eq 200 -and -not ($before -contains 'teacher-online') -and $p.Status -eq 200 -and ($after -contains 'teacher-online')) "create=$($r.Status) beforePublish=$($before -contains 'teacher-online') publish=$($p.Status) after=$($after -contains 'teacher-online')"
$t = Invoke-Api PATCH '/api/v1/admin/categories/teacher-online' -Session $ad.Session -Body @{ enabled = $false }
$after2 = OccIds
$ph = Analyze 'phone' @{ number = '0891245678'; occupation = 'teacher-online' }
Check 'AD-C02' ($t.Status -eq 200 -and -not ($after2 -contains 'teacher-online') -and (Code $ph) -eq 'INVALID_OPTION') "toggle=$($t.Status) listed=$($after2 -contains 'teacher-online') analyze=$(Code $ph)"
$r = Invoke-Api POST '/api/v1/admin/categories' -Session $ed.Session -Body @{ id = 'ghost-job'; type = 'OCCUPATION'; label = 'ไม่มีกฎ'; enabled = $true; ruleRef = 'not-exist' }
Check 'AD-C03' ($r.Status -eq 400 -and (Code $r) -eq 'INVALID_OPTION') "status=$($r.Status) $(Code $r)"
$r = Invoke-Api GET '/api/v1/admin/audit' -Session $ed.Session
Check 'RBAC Editor ดู Audit ไม่ได้' ($r.Status -eq 403 -and (Code $r) -eq 'FORBIDDEN') "status=$($r.Status)"
$r = Invoke-Api GET '/api/v1/admin/pairs'
Check 'RBAC Guest เรียก admin API' ($r.Status -eq 401 -and (Code $r) -eq 'UNAUTHENTICATED') "status=$($r.Status)"

# ===================== Login (8.3) =====================
Reset-App
$l = Login 'admin.test' 'Admin#Test2026'
$cookie = $l.Session.Cookies.GetCookies("$BaseUrl") | Where-Object Name -eq 'mongkol_session'
Check 'LG-01' ($l.Resp.Status -eq 200 -and $cookie -and $cookie.HttpOnly) "status=$($l.Resp.Status) cookie=$([bool]$cookie) httpOnly=$($cookie.HttpOnly)"
$l2 = Login 'admin.test' 'wrong'
Check 'LG-02' ($l2.Resp.Status -eq 401 -and (Code $l2.Resp) -eq 'AUTH_INVALID') "status=$($l2.Resp.Status) $(Code $l2.Resp)"
$l3 = Login 'nobody.test' 'wrong'
Check 'LG-03' ($l3.Resp.Status -eq 401 -and $l3.Resp.Json.error.message -eq $l2.Resp.Json.error.message) "status=$($l3.Resp.Status) msg=$($l3.Resp.Json.error.message)"
$l4 = Login 'locked.test' 'wrong'
Check 'LG-04' ($l4.Resp.Status -eq 423 -and (Code $l4.Resp) -eq 'AUTH_LOCKED') "status=$($l4.Resp.Status) $(Code $l4.Resp)"
$l5 = Login 'locked.test' 'Locked#Test2026'
Check 'LG-05' ($l5.Resp.Status -eq 423 -and (Code $l5.Resp) -eq 'AUTH_LOCKED') "status=$($l5.Resp.Status) $(Code $l5.Resp)"
Advance 15
$l6 = Login 'locked.test' 'Locked#Test2026'
Check 'LG-06' ($l6.Resp.Status -eq 200) "status=$($l6.Resp.Status) $(Code $l6.Resp)"
$s = Login 'admin.test' 'Admin#Test2026'
Advance 29
$m = Invoke-Api GET '/api/v1/admin/me' -Session $s.Session
Check 'LG-07' ($m.Status -eq 200) "status=$($m.Status)"
Advance 30
$pg = Invoke-WebRequest -Uri "$BaseUrl/admin" -WebSession $s.Session -MaximumRedirection 0 -SkipHttpErrorCheck -ErrorAction SilentlyContinue
$loc = "$($pg.Headers.Location)"
$m2 = Invoke-Api GET '/api/v1/admin/me' -Session $s.Session
Check 'LG-08' ($pg.StatusCode -in 303, 307, 308 -and $loc -like '*/admin/login*' -and $m2.Status -eq 401) "page=$($pg.StatusCode) location=$loc api=$($m2.Status)"
$guest = Invoke-WebRequest -Uri "$BaseUrl/admin/rules" -MaximumRedirection 0 -SkipHttpErrorCheck -ErrorAction SilentlyContinue
Check 'AD-001 Guest /admin/rules' ("$($guest.Headers.Location)" -like '*/admin/login*') "status=$($guest.StatusCode) location=$($guest.Headers.Location)"

# ===================== Security / Privacy (9) =====================
Reset-App
$r = Analyze 'phone' @{ number = '<script>alert(1)</script>' }; Check 'SEC-01' ((Code $r) -eq 'PHONE_INVALID_CHAR') (Code $r)
$r = Invoke-Api GET "/api/v1/pairs/$([uri]::EscapeDataString('<img src=x onerror=alert(1)>'))"; Check 'SEC-02' ((Code $r) -eq 'PAIR_INVALID') (Code $r)
$x = '"><svg onload=alert(1)>'
$r = Invoke-Api GET "/articles?q=$([uri]::EscapeDataString($x))"
Check 'SEC-03' ($r.Status -eq 200 -and $r.Text -notlike '*<svg onload=alert(1)>*' -and $r.Text -like '*&lt;svg onload=alert(1)&gt;*') "status=$($r.Status) escaped=$($r.Text -like '*&lt;svg*')"
$r = Analyze 'plate' @{ prefix = ''; letters = "' OR 1=1 --"; digits = '12' }; Check 'SEC-04' ((Code $r) -eq 'PLATE_INVALID_LETTER') (Code $r)
$r = Analyze 'phone' @{ number = 812345678 }; Check 'SEC-05' ($r.Status -eq 400 -and $r.Text -notmatch 'at\s+\S+\s+\(|stack') "status=$($r.Status) $(Code $r)"
$r = Invoke-Api POST '/api/v1/phone/analyze' -Raw 'not-json'; $script:analyzeCalls++; Check 'SEC-06' ($r.Status -eq 400 -and $r.Text -notmatch 'stack|SyntaxError') "status=$($r.Status) $(Code $r)"
$r = Invoke-Api POST '/api/v1/phone/analyze' -Raw '{"number":"0812345678","__proto__":{"admin":true}}'; $script:analyzeCalls++
$adm = Invoke-Api GET '/api/v1/admin/audit'
Check 'SEC-07' ($r.Status -eq 200 -and $adm.Status -eq 401) "analyze=$($r.Status) admin=$($adm.Status)"
Advance 1.01
$codes = 1..30 | ForEach-Object { (Invoke-Api POST '/api/v1/phone/analyze' -Body @{ number = '0812345678' }).Status }
Check 'SEC-08' (@($codes | Where-Object { $_ -ne 200 }).Count -eq 0) "non200=$(@($codes | Where-Object { $_ -ne 200 }).Count)"
$r = Invoke-Api POST '/api/v1/phone/analyze' -Body @{ number = '0812345678' }
Check 'SEC-09' ($r.Status -eq 429 -and (Code $r) -eq 'RATE_LIMITED') "status=$($r.Status) $(Code $r)"
Reset-App
$lc = 1..11 | ForEach-Object { (Invoke-Api POST '/api/v1/admin/login' -Body @{ username = 'nobody.test'; password = 'x' }).Status }
Check 'SEC-10' ($lc[9] -eq 401 -and $lc[10] -eq 429) "10th=$($lc[9]) 11th=$($lc[10])"

Reset-App
$ad = Login 'admin.test' 'Admin#Test2026'
$st0 = ((Invoke-Api GET '/api/v1/admin/stats' -Session $ad.Session).Json.data.usage | Where-Object type -eq 'PHONE').total
if (-not $st0) { $st0 = 0 }
$r = Analyze 'phone' @{ number = '0812345678' }
Check 'PRV-01' ($r.Status -eq 200 -and $r.Headers['X-Request-Id']) "POST body · X-Request-Id=$($r.Headers['X-Request-Id'])"
$cookies = ($ad.Session.Cookies.GetAllCookies() | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ';'
Check 'PRV-02 (cookie)' ($cookies -notlike '*0812345678*') 'cookie ไม่มีเบอร์'
$logs = PsqlScalar "SELECT string_agg(coalesce(masked_input,''), ' ') FROM request_log WHERE path = '/api/v1/phone/analyze'"
$full = PsqlScalar "SELECT count(*) FROM request_log WHERE masked_input LIKE '%0812345678%'"
Check 'PRV-03' ($logs -like '*081****678*' -and $full -eq '0') "log=$logs full=$full"
$st1 = ((Invoke-Api GET '/api/v1/admin/stats' -Session $ad.Session).Json.data.usage | Where-Object type -eq 'PHONE').total
$statsHasNumber = PsqlScalar "SELECT count(*) FROM usage_stat WHERE type::text LIKE '%0812%'"
Check 'PRV-04' ($st1 -eq $st0 + 1 -and $statsHasNumber -eq '0') "PHONE $st0 → $st1"
$null = Analyze 'plate' @{ plate = 'กข 1234' }
$pl = PsqlScalar "SELECT masked_input FROM request_log WHERE path = '/api/v1/plate/analyze' ORDER BY id DESC LIMIT 1"
Check 'PRV-05' ($pl -eq 'กข **34') "log=$pl"
$h = Invoke-WebRequest -Uri "$BaseUrl/phone" -SkipHttpErrorCheck
Check 'NFR-08/18 headers' ("$($h.Headers['Content-Security-Policy'])" -like "*default-src 'self'*" -and "$($h.Headers['X-Content-Type-Options'])" -eq 'nosniff' -and $h.Headers['X-Request-Id']) "CSP+nosniff+X-Request-Id"

# ===================== Compliance (10) =====================
$banned = @('แม่นที่สุด', 'รับประกัน', 'พิสูจน์แล้ว', 'รวยแน่นอน')
$pages = @('/', '/phone', '/plate', '/pairs?q=24', '/articles', '/articles/how-to-read-phone-pairs', '/articles/plate-sum-two-methods', '/articles/birthday-and-plate', '/articles/belief-disclaimer')
$texts = @($pages | ForEach-Object { (Invoke-Api GET $_).Text })
$texts += (Analyze 'phone' @{ number = '0812345678' }).Text
$texts += (Analyze 'plate' @{ plate = 'กข 1234' }).Text
for ($i = 0; $i -lt $banned.Count; $i++) {
  $hit = @($texts | Where-Object { $_ -like "*$($banned[$i])*" }).Count
  Check "CMP-0$($i + 1)" ($hit -eq 0) "พบ $hit หน้า"
}

# ===================== สรุป =====================
$pass = @($script:results | Where-Object Pass).Count
$total = $script:results.Count
Write-Output ''
Write-Output "ผ่าน $pass / $total ข้อ"
$failed = @($script:results | Where-Object { -not $_.Pass })
if ($failed.Count -gt 0) {
  Write-Output 'ข้อที่ไม่ผ่าน:'
  $failed | ForEach-Object { Write-Output ("  ✗ {0}: {1}" -f $_.Key, $_.Actual) }
  exit 1
}

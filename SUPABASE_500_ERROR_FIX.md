# Supabase 500 오류 해결 가이드

## 🚨 오류: HTTP 500 "Error sending confirmation email"

이 오류는 Supabase 서버에서 이메일을 보내려고 할 때 발생하는 서버 측 오류입니다.

## ✅ 단계별 해결 방법

### 1단계: Supabase 로그 확인 (가장 중요!)

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **로그 확인**
   - 좌측 메뉴: **Logs** → **Auth Logs**
   - 또는 **Logs** → **Postgres Logs**
   - 최근 에러 로그 확인
   - SMTP 관련 에러 메시지 확인

3. **에러 메시지 확인**
   - "SMTP", "email", "send" 등의 키워드로 검색
   - 정확한 에러 원인 확인

### 2단계: 네이버 메일 IMAP/SMTP 사용 설정 확인 (필수!)

**가장 흔한 원인입니다!**

1. **네이버 메일 접속**
   - https://mail.naver.com
   - 로그인

2. **환경설정**
   - 우측 상단 톱니바퀴 아이콘 클릭
   - 또는 "환경설정" 메뉴 클릭

3. **POP3/IMAP 설정**
   - 환경설정 → "POP3/IMAP 설정"
   - 또는 "보안" → "POP3/IMAP 설정"

4. **IMAP/SMTP 사용 활성화**
   - "IMAP/SMTP 사용함" 선택
   - "저장" 또는 "확인" 버튼 클릭

⚠️ **중요:** 이 설정이 없으면 SMTP 연결이 실패하고 500 오류가 발생합니다!

### 3단계: Supabase SMTP 설정 재확인

1. **SMTP 설정 위치**
   - **Project Settings** → **Auth** → **SMTP Settings**

2. **설정 항목 정확히 확인**

   ```
   ✅ Enable Custom SMTP: 체크되어 있어야 함
   
   SMTP Host: smtp.naver.com
   (정확히 입력 - 대소문자 구분, 오타 없이!)
   
   SMTP Port: 587
   (TLS 자동 활성화)
   
   SMTP User: your-id@naver.com
   (전체 이메일 주소 - 사용자 ID만이 아님!)
   예: abc123@naver.com (올바름)
   예: abc123 (잘못됨)
   
   SMTP Password: [네이버 메일 비밀번호]
   (네이버 메일 로그인에 사용하는 비밀번호)
   (특수문자 포함 시 URL 인코딩 필요할 수 있음)
   
   Sender Email: your-id@naver.com
   (SMTP User와 정확히 동일하게 설정)
   
   Sender Name: My Speaking AI (선택사항, 권장)
   ```

3. **설정 저장**
   - 모든 항목 입력 후 "Save" 버튼 클릭
   - 저장 후 잠시 기다림 (설정 적용 시간 필요)

### 4단계: 네이버 메일 보안 설정 확인

1. **네이버 계정 보안 설정**
   - 네이버 계정 설정 → 보안
   - "로그인 보안" 확인

2. **2단계 인증**
   - 2단계 인증이 활성화되어 있으면
   - 일반 비밀번호로 작동하는지 확인
   - 필요시 앱 비밀번호 생성 고려

### 5단계: 테스트

1. **Supabase 대시보드에서 테스트**
   - Project Settings → Auth → SMTP Settings
   - "Send Test Email" 버튼 클릭
   - 테스트 이메일 주소 입력 (네이버 메일 주소 권장)
   - 전송 확인
   - 에러 메시지 확인

2. **에러 메시지에 따른 해결**
   - 테스트 실패 시 에러 메시지 확인
   - 아래의 "일반적인 오류 해결" 참고

## 🔍 일반적인 오류 원인 및 해결

### 오류 1: "Authentication failed" 또는 "535 Authentication failed"

**원인:**
- SMTP User에 전체 이메일 주소가 아닌 사용자 ID만 입력
- 비밀번호 오류
- IMAP/SMTP 사용 설정이 안 되어 있음

**해결:**
- SMTP User: `your-id@naver.com` (전체 이메일 주소)
- 비밀번호 확인 (특수문자 포함 시 주의)
- 네이버 메일에서 IMAP/SMTP 사용 설정 확인

### 오류 2: "Connection timeout" 또는 "Connection refused"

**원인:**
- SMTP Host 주소 오류
- 포트 번호 오류
- 네트워크 문제

**해결:**
- SMTP Host: `smtp.naver.com` (정확히 입력, 대소문자 구분)
- 포트: `587` 확인
- 네트워크 연결 확인

### 오류 3: "Sender address rejected"

**원인:**
- Sender Email이 SMTP User와 일치하지 않음
- 발신자 이메일 주소 오류

**해결:**
- Sender Email과 SMTP User를 정확히 동일하게 설정
- 예: 둘 다 `your-id@naver.com`

### 오류 4: "IMAP/SMTP not enabled" 또는 "550 Access denied"

**원인:**
- 네이버 메일에서 IMAP/SMTP 사용 설정이 안 되어 있음

**해결:**
- 네이버 메일 → 환경설정 → POP3/IMAP 설정
- "IMAP/SMTP 사용함" 선택
- 저장

### 오류 5: "Rate limit exceeded" 또는 "Daily sending limit"

**원인:**
- 네이버 메일 일일 발신 한도 초과 (약 300개)

**해결:**
- 다음 날까지 대기
- 또는 SendGrid, Mailgun 등 전문 이메일 서비스 사용

## 🧪 디버깅 방법

### 1. Supabase 로그 확인

1. **Auth Logs 확인**
   - Logs → Auth Logs
   - 최근 에러 로그 확인
   - SMTP 관련 에러 메시지 확인

2. **Postgres Logs 확인**
   - Logs → Postgres Logs
   - 데이터베이스 관련 에러 확인

### 2. 브라우저 콘솔 확인

1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭 확인
3. Network 탭 확인
4. `/auth/v1/signup` 요청 확인
5. Response 확인 (에러 메시지)

### 3. Supabase 대시보드 테스트

1. **테스트 이메일 전송**
   - Project Settings → Auth → SMTP Settings
   - "Send Test Email" 버튼 클릭
   - 에러 메시지 확인

## 📋 체크리스트

### 네이버 메일 설정:
- [ ] 네이버 메일에서 IMAP/SMTP 사용 설정 활성화됨
- [ ] 환경설정 → POP3/IMAP 설정 → "IMAP/SMTP 사용함" 선택됨
- [ ] 네이버 메일 비밀번호 확인

### Supabase SMTP 설정:
- [ ] Enable Custom SMTP 체크됨
- [ ] SMTP Host: `smtp.naver.com` (정확히 입력, 대소문자 구분)
- [ ] SMTP Port: `587` (TLS 자동 활성화)
- [ ] SMTP User: `your-id@naver.com` (전체 이메일 주소)
- [ ] SMTP Password: 네이버 메일 비밀번호 (정확히 입력)
- [ ] Sender Email: `your-id@naver.com` (SMTP User와 정확히 동일)
- [ ] Sender Name: 설정됨 (선택사항, 권장)
- [ ] 설정 저장 완료

### 테스트:
- [ ] Supabase 대시보드에서 테스트 이메일 전송 성공
- [ ] 실제 회원가입으로 이메일 수신 확인
- [ ] Supabase 로그에서 에러 없음 확인

## 💡 추가 팁

1. **비밀번호 특수문자**
   - 비밀번호에 특수문자가 있으면 URL 인코딩이 필요할 수 있습니다
   - 하지만 대부분의 경우 그대로 입력해도 작동합니다

2. **설정 저장 후 대기**
   - SMTP 설정을 저장한 후 즉시 테스트하지 말고
   - 몇 초 기다린 후 테스트하세요

3. **네이버 메일 일일 발신 한도**
   - 네이버 메일은 일일 약 300개 이메일 발신 제한이 있습니다
   - 한도 초과 시 500 오류가 발생할 수 있습니다

4. **프로덕션 환경**
   - 많은 사용자가 있는 경우 SendGrid, Mailgun 등 전문 이메일 서비스 사용 권장
   - 더 높은 발신 한도와 신뢰도 제공

## 🔗 참고 링크

- [네이버 메일 IMAP/SMTP 설정](https://help.naver.com/alias/mail/newmail05.naver)
- [Supabase SMTP 설정 문서](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase 로그 확인](https://supabase.com/dashboard/project/_/logs)

## ✅ 해결 순서 요약

1. **Supabase 로그 확인** (에러 원인 파악)
2. **네이버 메일에서 IMAP/SMTP 사용 설정** (가장 중요!)
3. **Supabase SMTP 설정 재확인**
4. **테스트 이메일 전송**
5. **에러 메시지 확인 및 해결**
6. **실제 회원가입 테스트**

## 🚨 가장 흔한 원인

**네이버 메일에서 IMAP/SMTP 사용 설정이 안 되어 있는 경우가 90% 이상입니다!**

먼저 이것을 확인하세요:
1. 네이버 메일 접속
2. 환경설정 → POP3/IMAP 설정
3. "IMAP/SMTP 사용함" 선택
4. 저장

이것만으로도 대부분의 경우 해결됩니다!


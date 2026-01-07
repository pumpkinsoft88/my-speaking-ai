# SMTP 오류 지속 발생 해결 가이드

## 🚨 여전히 "Error sending confirmation email" 오류 발생

Supabase SMTP 설정을 수정했는데도 여전히 오류가 발생하는 경우, 다음을 확인하세요.

## ✅ 단계별 확인 및 해결

### 1단계: Supabase 로그 확인 (가장 중요!)

HTTP 500 오류의 정확한 원인을 파악하려면 Supabase 로그를 확인해야 합니다.

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **로그 확인**
   - 좌측 메뉴: **Logs** → **Auth Logs**
   - 최근 에러 로그 확인 (회원가입 시점)
   - SMTP 관련 에러 메시지 확인

3. **에러 메시지 확인**
   - "SMTP", "email", "send", "authentication", "connection", "535", "550" 등의 키워드로 검색
   - 정확한 에러 원인 확인

**확인해야 할 에러 메시지:**
- `535 Authentication failed` → 인증 실패 (Username 또는 Password 오류)
- `550 Access denied` → IMAP/SMTP 사용 설정 미활성화
- `Connection timeout` → 네트워크 또는 호스트 오류
- `Rate limit exceeded` → 이메일 발신 한도 초과

### 2단계: Supabase SMTP 설정 재확인

1. **SMTP 설정 위치**
   - Authentication → Email → SMTP Settings 탭

2. **설정 항목 정확히 확인**

   ```
   ✅ Enable Custom SMTP: 체크되어 있어야 함
   
   SMTP Host: smtp.naver.com
   (정확히 입력 - 대소문자 구분, 오타 없이!)
   
   SMTP Port: 465 또는 587
   (465 = SSL, 587 = TLS)
   
   Username: bigbangceo@naver.com
   (⚠️ 전체 이메일 주소 - 반드시 @naver.com 포함!)
   (❌ 잘못됨: bigbangceo)
   (✅ 올바름: bigbangceo@naver.com)
   
   Password: [네이버 메일 비밀번호]
   (정확히 입력 - 특수문자 포함 시 주의)
   
   Sender Email: bigbangceo@naver.com
   (Username과 정확히 동일하게 설정)
   
   Sender Name: Chinese Speak AI
   ```

3. **설정 저장 확인**
   - "Save changes" 버튼이 클릭되었는지 확인
   - 저장 후 몇 초 기다림 (설정 적용 시간 필요)

### 3단계: 네이버 메일 설정 재확인

1. **네이버 메일 IMAP/SMTP 사용 설정**
   - 네이버 메일 접속: https://mail.naver.com
   - 환경설정 → POP3/IMAP 설정
   - "IMAP/SMTP 사용함" 선택되어 있는지 확인
   - 저장 확인

2. **네이버 메일 비밀번호 확인**
   - 네이버 메일 로그인이 정상적으로 되는지 확인
   - 비밀번호가 올바른지 확인

### 4단계: Rate Limits 확인

1. **Rate Limits 설정 확인**
   - Authentication → Rate Limits
   - "Rate limit for sending emails" 확인
   - 현재 값: `10 emails/h` (시간당 10개)

2. **한도 초과 확인**
   - 여러 번 테스트했다면 한도에 도달했을 수 있음
   - 한도 초과 시 500 오류 발생 가능

3. **해결 방법**
   - 다음 시간까지 대기
   - 또는 Rate limit 값을 증가 (예: 50 emails/h)

### 5단계: 테스트 이메일 전송

1. **Supabase 대시보드에서 테스트**
   - SMTP Settings 페이지에서 "Send Test Email" 버튼 클릭
   - 테스트 이메일 주소 입력 (네이버 메일 주소 권장)
   - 전송 확인
   - 에러 메시지 확인

2. **에러 메시지에 따른 해결**
   - 테스트 실패 시 에러 메시지 확인
   - 아래의 "일반적인 오류 해결" 참고

## 🔍 일반적인 오류 원인 및 해결

### 오류 1: "535 Authentication failed"

**원인:**
- Username에 전체 이메일 주소가 아닌 사용자 ID만 입력
- 비밀번호 오류
- IMAP/SMTP 사용 설정이 안 되어 있음

**해결:**
- Username: `bigbangceo@naver.com` (전체 이메일 주소)
- 비밀번호 확인
- 네이버 메일에서 IMAP/SMTP 사용 설정 확인

### 오류 2: "550 Access denied" 또는 "550 IMAP/SMTP not enabled"

**원인:**
- 네이버 메일에서 IMAP/SMTP 사용 설정이 안 되어 있음

**해결:**
- 네이버 메일 → 환경설정 → POP3/IMAP 설정
- "IMAP/SMTP 사용함" 선택
- 저장

### 오류 3: "Connection timeout" 또는 "Connection refused"

**원인:**
- SMTP Host 주소 오류
- 포트 번호 오류
- 네트워크 문제

**해결:**
- SMTP Host: `smtp.naver.com` (정확히 입력)
- 포트: `465` 또는 `587` 확인
- 네트워크 연결 확인

### 오류 4: "Rate limit exceeded" 또는 "Daily sending limit"

**원인:**
- 이메일 발신 한도 초과
- Rate limit 설정이 너무 낮음

**해결:**
- Rate Limits → "Rate limit for sending emails" 값 증가
- 다음 시간까지 대기

### 오류 5: "Sender address rejected"

**원인:**
- Sender Email이 Username과 일치하지 않음

**해결:**
- Sender Email과 Username을 정확히 동일하게 설정
- 예: 둘 다 `bigbangceo@naver.com`

## 🧪 디버깅 체크리스트

### Supabase 설정:
- [ ] Enable Custom SMTP 체크됨
- [ ] SMTP Host: `smtp.naver.com` (정확히 입력)
- [ ] SMTP Port: `465` 또는 `587`
- [ ] Username: `bigbangceo@naver.com` (전체 이메일 주소)
- [ ] Password: 네이버 메일 비밀번호 (정확히 입력)
- [ ] Sender Email: `bigbangceo@naver.com` (Username과 동일)
- [ ] Sender Name: 설정됨
- [ ] "Save changes" 버튼 클릭됨

### 네이버 메일 설정:
- [ ] 네이버 메일에서 IMAP/SMTP 사용 설정 활성화됨
- [ ] 환경설정 → POP3/IMAP 설정 → "IMAP/SMTP 사용함" 선택됨
- [ ] 네이버 메일 비밀번호 확인됨

### Rate Limits:
- [ ] Rate limit for sending emails 확인
- [ ] 한도 초과 여부 확인

### 테스트:
- [ ] Supabase 대시보드에서 테스트 이메일 전송 시도
- [ ] 에러 메시지 확인
- [ ] Supabase 로그 확인 (Auth Logs)

## 💡 추가 확인 사항

### 1. Supabase 로그 확인 (필수!)

가장 중요한 것은 Supabase 로그에서 정확한 에러 메시지를 확인하는 것입니다:
- Logs → Auth Logs
- 최근 에러 로그 확인
- SMTP 관련 에러 메시지 확인

### 2. 테스트 이메일 전송

Supabase 대시보드에서 테스트 이메일을 전송해보세요:
- SMTP Settings → "Send Test Email"
- 에러 메시지 확인

### 3. Port 변경 시도

현재 Port가 `465`로 설정되어 있다면 `587`로 변경해보세요:
- Port: `587` (TLS)
- 저장 후 테스트

### 4. 비밀번호 재입력

비밀번호를 다시 입력해보세요:
- Password 필드에 비밀번호 재입력
- 저장 후 테스트

## 🔗 참고

- [Supabase 로그 확인](https://supabase.com/dashboard/project/_/logs)
- [Supabase SMTP 설정](https://supabase.com/docs/guides/auth/auth-smtp)
- [네이버 메일 IMAP/SMTP 설정](https://help.naver.com/alias/mail/newmail05.naver)

## ✅ 다음 단계

1. **Supabase 로그 확인** (가장 중요!)
   - Logs → Auth Logs
   - 정확한 에러 메시지 확인

2. **에러 메시지에 따른 해결**
   - 위의 "일반적인 오류 해결" 참고

3. **테스트 이메일 전송**
   - Supabase 대시보드에서 테스트
   - 에러 메시지 확인

4. **설정 재확인**
   - 모든 설정이 정확한지 재확인
   - 저장 확인

**가장 중요한 것: Supabase 로그에서 정확한 에러 메시지를 확인하는 것입니다!**

로그의 에러 메시지를 알려주시면 더 정확한 해결 방법을 제시할 수 있습니다.


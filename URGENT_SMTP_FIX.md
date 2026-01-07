# 긴급: SMTP 오류 해결 체크리스트

## 🚨 여전히 "Error sending confirmation email" 오류 발생

다음 항목을 순서대로 확인하세요.

## ✅ 즉시 확인해야 할 사항

### 1. Supabase 로그 확인 (가장 중요!)

**이것이 가장 중요합니다!** 정확한 에러 원인을 파악하려면 로그를 확인해야 합니다.

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **로그 확인**
   - 좌측 메뉴: **Logs** → **Auth Logs**
   - 최근 에러 로그 확인 (회원가입 시점)
   - SMTP 관련 에러 메시지 확인

3. **확인해야 할 에러 메시지**
   - `535 Authentication failed` → 인증 실패
   - `550 Access denied` → IMAP/SMTP 미활성화
   - `Connection timeout` → 네트워크 오류
   - `Rate limit exceeded` → 발신 한도 초과

### 2. Supabase SMTP 설정 재확인

1. **Authentication → Email → SMTP Settings**

2. **설정 확인**
   ```
   ✅ Enable Custom SMTP: 체크
   
   Host: smtp.naver.com
   
   Port: 465 또는 587
   
   Username: bigbangceo@naver.com
   (⚠️ 반드시 @naver.com 포함!)
   
   Password: [비밀번호 재입력 시도]
   
   Sender Email: bigbangceo@naver.com
   (Username과 동일)
   ```

3. **"Save changes" 버튼 클릭**
   - 저장 후 몇 초 기다림

### 3. 테스트 이메일 전송

1. **Supabase 대시보드에서 테스트**
   - SMTP Settings 페이지에서 "Send Test Email" 버튼 클릭
   - 테스트 이메일 주소 입력
   - 전송 확인
   - **에러 메시지 확인** (가장 중요!)

### 4. Rate Limits 확인

1. **Authentication → Rate Limits**

2. **"Rate limit for sending emails" 확인**
   - 현재 값: `10 emails/h`
   - 여러 번 테스트했다면 한도 초과 가능

3. **해결 방법**
   - 값 증가 (예: `50 emails/h`)
   - 또는 다음 시간까지 대기

### 5. 네이버 메일 설정 재확인

1. **네이버 메일 접속**
   - https://mail.naver.com

2. **환경설정 → POP3/IMAP 설정**
   - "IMAP/SMTP 사용함" 선택되어 있는지 확인
   - 저장 확인

3. **비밀번호 확인**
   - 네이버 메일 로그인이 정상적으로 되는지 확인

## 🔍 가능한 원인 및 해결

### 원인 1: Username이 여전히 잘못됨

**확인:**
- Username: `bigbangceo@naver.com` (전체 이메일 주소)
- `bigbangceo`만 입력되어 있으면 안 됨

**해결:**
- Username 필드에 `bigbangceo@naver.com` 전체 입력
- "Save changes" 클릭

### 원인 2: 비밀번호 오류

**확인:**
- 네이버 메일 로그인이 정상적으로 되는지 확인
- 비밀번호가 올바른지 확인

**해결:**
- Password 필드에 비밀번호 재입력
- "Save changes" 클릭

### 원인 3: IMAP/SMTP 사용 설정 미활성화

**확인:**
- 네이버 메일 → 환경설정 → POP3/IMAP 설정
- "IMAP/SMTP 사용함" 선택되어 있는지 확인

**해결:**
- "IMAP/SMTP 사용함" 선택
- 저장

### 원인 4: Rate Limit 초과

**확인:**
- Authentication → Rate Limits
- "Rate limit for sending emails" 값 확인

**해결:**
- 값 증가 (예: `50 emails/h`)
- 또는 다음 시간까지 대기

### 원인 5: Port 설정 문제

**확인:**
- 현재 Port: `465` 또는 `587`

**해결:**
- Port를 `587`로 변경 시도
- 저장 후 테스트

## 📋 체크리스트

### 즉시 확인:
- [ ] Supabase 로그 확인 (Logs → Auth Logs)
- [ ] 정확한 에러 메시지 확인
- [ ] Username: `bigbangceo@naver.com` (전체 이메일 주소)
- [ ] Password 재입력
- [ ] "Save changes" 버튼 클릭됨
- [ ] 테스트 이메일 전송 시도
- [ ] Rate Limits 확인
- [ ] 네이버 메일 IMAP/SMTP 설정 확인

## 💡 가장 중요한 것

**Supabase 로그를 확인하세요!**

Logs → Auth Logs에서 정확한 에러 메시지를 확인하면:
- 정확한 원인 파악 가능
- 구체적인 해결 방법 제시 가능

로그의 에러 메시지를 알려주시면 더 정확한 해결 방법을 제시할 수 있습니다.

## 🔗 빠른 링크

- [Supabase 로그](https://supabase.com/dashboard/project/_/logs)
- [Supabase SMTP 설정](https://supabase.com/dashboard/project/_/settings/auth)
- [네이버 메일 설정](https://mail.naver.com)


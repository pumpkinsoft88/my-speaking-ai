# Supabase SMTP 설정 가이드

## 🚨 현재 문제

회원가입 시 메일 전송 에러가 발생합니다.

## ✅ 해결 방법

### 1단계: Supabase 대시보드에서 SMTP 설정 확인

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **SMTP 설정 위치**
   - **Project Settings** → **Auth** → **SMTP Settings**
   - 또는 **Authentication** → **Settings** → **SMTP**

### 2단계: SMTP 설정 항목 확인

다음 항목들을 확인하고 올바르게 설정하세요:

#### 필수 설정 항목:

1. **Enable Custom SMTP**
   - ✅ 체크되어 있어야 함

2. **SMTP Host**
   - 예: `smtp.gmail.com` (Gmail)
   - 예: `smtp.sendgrid.net` (SendGrid)
   - 예: `smtp.mailgun.org` (Mailgun)
   - 예: `smtp.office365.com` (Microsoft 365)

3. **SMTP Port**
   - 일반적으로 `587` (TLS) 또는 `465` (SSL)
   - Gmail: `587` (TLS 권장)
   - SendGrid: `587` 또는 `465`
   - Mailgun: `587` 또는 `465`

4. **SMTP User**
   - SMTP 서버의 사용자명 (일반적으로 이메일 주소)
   - Gmail: 전체 이메일 주소 (예: `your-email@gmail.com`)
   - SendGrid: API 키 사용자명
   - Mailgun: SMTP 사용자명

5. **SMTP Password**
   - SMTP 서버의 비밀번호 또는 앱 비밀번호
   - Gmail: 앱 비밀번호 사용 (일반 비밀번호 아님!)
   - SendGrid: API 키
   - Mailgun: SMTP 비밀번호

6. **Sender Email**
   - 발신자 이메일 주소
   - SMTP 서버에서 허용된 이메일 주소여야 함
   - Gmail: Gmail 계정 주소
   - SendGrid: 인증된 발신자 주소
   - Mailgun: 도메인에서 발신 가능한 주소

7. **Sender Name** (선택사항)
   - 발신자 이름
   - 예: "My Speaking AI"

8. **Enable Secure SMTP (TLS/SSL)**
   - ⚠️ 이 옵션이 보이지 않을 수 있습니다 (정상)
   - 포트 587을 선택하면 자동으로 TLS가 활성화됩니다
   - 포트 465를 선택하면 자동으로 SSL이 활성화됩니다
   - 별도의 체크박스가 없어도 포트 선택만으로 보안 연결이 설정됩니다

### 3단계: 일반적인 SMTP 제공자별 설정

#### Gmail 설정

1. **2단계 인증 활성화**
   - Google 계정 → 보안 → 2단계 인증 활성화

2. **앱 비밀번호 생성**
   - Google 계정 → 보안 → 2단계 인증 → 앱 비밀번호
   - "앱 선택": 메일
   - "기기 선택": 기타(맞춤 이름)
   - 이름 입력: "Supabase"
   - 생성된 16자리 비밀번호 복사

3. **Supabase SMTP 설정**
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: your-email@gmail.com
   SMTP Password: [앱 비밀번호 16자리]
   Sender Email: your-email@gmail.com
   ```
   ⚠️ 포트 587을 선택하면 자동으로 TLS가 활성화됩니다 (별도 체크박스 없어도 됨)

#### SendGrid 설정

1. **SendGrid 계정 생성**
   - https://sendgrid.com

2. **API 키 생성**
   - Settings → API Keys → Create API Key
   - 권한: "Full Access" 또는 "Mail Send"

3. **Supabase SMTP 설정**
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Password: [SendGrid API 키]
   Sender Email: [인증된 발신자 이메일]
   ```
   ⚠️ 포트 587을 선택하면 자동으로 TLS가 활성화됩니다 (별도 체크박스 없어도 됨)
   ```

#### Mailgun 설정

1. **Mailgun 계정 생성**
   - https://mailgun.com

2. **도메인 추가 및 인증**
   - 도메인 추가 및 DNS 설정

3. **SMTP 자격 증명 확인**
   - Sending → Domain Settings → SMTP credentials

4. **Supabase SMTP 설정**
   ```
   SMTP Host: smtp.mailgun.org
   SMTP Port: 587
   SMTP User: [SMTP 사용자명]
   SMTP Password: [SMTP 비밀번호]
   Sender Email: [도메인에서 발신 가능한 이메일]
   ```
   ⚠️ 포트 587을 선택하면 자동으로 TLS가 활성화됩니다 (별도 체크박스 없어도 됨)
   ```

#### 네이버 메일 설정

1. **네이버 계정 준비**
   - 네이버 메일 계정이 있어야 함
   - 이메일 주소: `your-id@naver.com`
   - 비밀번호: 네이버 메일 비밀번호

2. **네이버 메일 보안 설정 확인**
   - 네이버 메일 → 환경설정 → 보안
   - "보안 메일" 또는 "2단계 인증" 활성화 권장 (선택사항)

3. **Supabase SMTP 설정**
   ```
   SMTP Host: smtp.naver.com
   SMTP Port: 587 (TLS 권장) 또는 465 (SSL)
   SMTP User: your-id@naver.com (전체 이메일 주소)
   SMTP Password: [네이버 메일 비밀번호]
   Sender Email: your-id@naver.com
   Sender Name: [선택사항] 예: "My Speaking AI"
   ```
   ⚠️ 포트 587을 선택하면 자동으로 TLS가 활성화됩니다 (별도 체크박스 없어도 됨)
   ```

4. **중요 사항**
   - ⚠️ 네이버는 일일 발신 한도가 있습니다 (약 300개)
   - ⚠️ 스팸으로 분류될 수 있으므로 발신자 이름 설정 권장
   - ⚠️ 포트 587 사용 시 TLS 활성화 필수
   - ⚠️ 포트 465 사용 시 SSL 활성화 필수

### 4단계: 설정 저장 및 테스트

1. **설정 저장**
   - 모든 항목 입력 후 "Save" 클릭

2. **테스트 이메일 전송**
   - Supabase 대시보드에서 테스트 이메일 전송 기능 사용
   - 또는 실제 회원가입으로 테스트

## 🔍 일반적인 오류 및 해결 방법

### 오류 1: "Authentication failed"

**원인:**
- SMTP 사용자명 또는 비밀번호가 잘못됨
- Gmail의 경우 일반 비밀번호 대신 앱 비밀번호를 사용해야 함

**해결:**
- Gmail: 앱 비밀번호 생성 및 사용
- 다른 제공자: API 키 또는 SMTP 비밀번호 확인

### 오류 2: "Connection timeout"

**원인:**
- SMTP 호스트 주소가 잘못됨
- 포트 번호가 잘못됨
- 방화벽 또는 네트워크 문제

**해결:**
- SMTP 호스트 주소 확인
- 포트 번호 확인 (587 또는 465)
- TLS/SSL 설정 확인

### 오류 3: "Sender address rejected"

**원인:**
- 발신자 이메일 주소가 SMTP 서버에서 허용되지 않음
- SendGrid: 발신자 주소 인증 필요
- Mailgun: 도메인 인증 필요

**해결:**
- 발신자 이메일 주소를 SMTP 서버에서 허용된 주소로 변경
- SendGrid: Single Sender Verification 또는 Domain Authentication
- Mailgun: 도메인 인증 완료 확인

### 오류 4: "TLS/SSL connection failed"

**원인:**
- 포트와 암호화 방식 불일치
- 네트워크 문제

**해결:**
- 포트 587: TLS 자동 활성화 (별도 설정 불필요)
- 포트 465: SSL 자동 활성화 (별도 설정 불필요)
- 네트워크 연결 확인
- 방화벽 설정 확인

### 오류 5: "Rate limit exceeded"

**원인:**
- 이메일 전송 한도 초과
- 무료 플랜의 경우 일일 전송 한도 제한

**해결:**
- 이메일 전송 한도 확인
- 플랜 업그레이드 고려
- 일일 한도 내에서 사용

## 🧪 테스트 방법

### 1. Supabase 대시보드에서 테스트

1. **Project Settings** → **Auth** → **SMTP Settings**
2. "Send Test Email" 버튼 클릭
3. 테스트 이메일 주소 입력
4. 전송 확인

### 2. 실제 회원가입으로 테스트

1. 새 계정으로 회원가입
2. 이메일 수신 확인
3. 이메일이 수신되지 않으면:
   - 스팸 폴더 확인
   - Supabase 대시보드의 로그 확인
   - 브라우저 콘솔 확인

## 📋 체크리스트

### SMTP 설정:
- [ ] Enable Custom SMTP 체크됨
- [ ] SMTP Host 올바르게 설정됨
- [ ] SMTP Port 올바르게 설정됨 (587 또는 465)
- [ ] SMTP User 올바르게 설정됨
- [ ] SMTP Password 올바르게 설정됨 (앱 비밀번호 또는 API 키)
- [ ] Sender Email 올바르게 설정됨
- [ ] 포트 선택으로 TLS/SSL 자동 활성화 확인 (별도 체크박스 없어도 됨)

### Gmail 사용 시:
- [ ] 2단계 인증 활성화됨
- [ ] 앱 비밀번호 생성됨
- [ ] 앱 비밀번호를 SMTP Password로 사용

### SendGrid 사용 시:
- [ ] API 키 생성됨
- [ ] 발신자 이메일 인증됨
- [ ] SMTP User: `apikey`로 설정

### Mailgun 사용 시:
- [ ] 도메인 추가 및 인증됨
- [ ] SMTP 자격 증명 확인됨

## ✅ 설정 완료 후

1. **설정 저장**
2. **테스트 이메일 전송**
3. **새 계정으로 회원가입 테스트**
4. **이메일 수신 확인**

## 💡 추가 팁

1. **Gmail 사용 시:**
   - 무료 Gmail 계정은 일일 전송 한도가 있습니다 (약 500개)
   - 프로덕션 환경에서는 SendGrid, Mailgun 등 전문 서비스 사용 권장

2. **SendGrid 사용 시:**
   - 무료 플랜: 일일 100개 이메일
   - 발신자 이메일 인증 필수

3. **Mailgun 사용 시:**
   - 무료 플랜: 월 5,000개 이메일 (처음 3개월)
   - 도메인 인증 필수

4. **프로덕션 환경:**
   - 전문 이메일 서비스 사용 권장
   - 이메일 전송 한도 및 신뢰도 고려

## 🔗 참고 링크

- [Supabase SMTP 설정 문서](https://supabase.com/docs/guides/auth/auth-smtp)
- [Gmail 앱 비밀번호 생성](https://support.google.com/accounts/answer/185833)
- [SendGrid 문서](https://docs.sendgrid.com/)
- [Mailgun 문서](https://documentation.mailgun.com/)


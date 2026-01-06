# 네이버 메일 SMTP 오류 해결 가이드

## 🚨 오류: "Error sending confirmation email"

이 오류는 네이버 메일 SMTP 설정에 문제가 있을 때 발생합니다.

## ✅ 단계별 해결 방법

### 1단계: 네이버 메일 IMAP/SMTP 사용 설정 (필수!)

네이버 메일에서 외부 SMTP 사용을 허용해야 합니다.

1. **네이버 메일 접속**
   - https://mail.naver.com 접속
   - 네이버 메일 로그인

2. **환경설정 메뉴**
   - 우측 상단 톱니바퀴 아이콘 클릭
   - 또는 메일 화면에서 "환경설정" 메뉴 클릭

3. **POP3/IMAP 설정**
   - 환경설정 → "POP3/IMAP 설정" 메뉴로 이동
   - 또는 "보안" → "POP3/IMAP 설정"

4. **IMAP/SMTP 사용 활성화**
   - "IMAP/SMTP 사용함" 선택
   - "저장" 또는 "확인" 버튼 클릭

⚠️ **중요:** 이 설정이 없으면 SMTP 연결이 실패합니다!

### 2단계: Supabase SMTP 설정 확인

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **SMTP 설정 위치**
   - **Project Settings** → **Auth** → **SMTP Settings**

3. **설정 항목 확인**

   ```
   ✅ Enable Custom SMTP: 체크되어 있어야 함
   
   SMTP Host: smtp.naver.com
   (정확히 입력 - 오타 없이!)
   
   SMTP Port: 587
   (TLS 자동 활성화)
   
   SMTP User: your-id@naver.com
   (전체 이메일 주소 - 사용자 ID만이 아님!)
   
   SMTP Password: [네이버 메일 비밀번호]
   (네이버 메일 로그인 비밀번호)
   
   Sender Email: your-id@naver.com
   (SMTP User와 동일하게 설정)
   
   Sender Name: My Speaking AI (선택사항)
   ```

### 3단계: 일반적인 오류 원인 및 해결

#### 오류 1: "Authentication failed"

**원인:**
- SMTP User에 전체 이메일 주소가 아닌 사용자 ID만 입력
- 비밀번호 오류
- IMAP/SMTP 사용 설정이 안 되어 있음

**해결:**
- SMTP User: `your-id@naver.com` (전체 이메일 주소)
- 비밀번호 확인
- 네이버 메일에서 IMAP/SMTP 사용 설정 확인

#### 오류 2: "Connection timeout" 또는 "Connection refused"

**원인:**
- SMTP Host 주소 오류
- 포트 번호 오류
- 네트워크 문제

**해결:**
- SMTP Host: `smtp.naver.com` (정확히 입력)
- 포트: `587` 확인
- 네트워크 연결 확인

#### 오류 3: "Sender address rejected"

**원인:**
- Sender Email이 SMTP User와 일치하지 않음
- 발신자 이메일 주소 오류

**해결:**
- Sender Email과 SMTP User를 동일하게 설정
- 예: 둘 다 `your-id@naver.com`

#### 오류 4: "IMAP/SMTP not enabled"

**원인:**
- 네이버 메일에서 IMAP/SMTP 사용 설정이 안 되어 있음

**해결:**
- 네이버 메일 → 환경설정 → POP3/IMAP 설정
- "IMAP/SMTP 사용함" 선택
- 저장

### 4단계: 네이버 메일 보안 설정 확인

1. **네이버 계정 보안 설정**
   - 네이버 계정 설정 → 보안
   - "로그인 보안" 확인

2. **2단계 인증 (선택사항)**
   - 2단계 인증이 활성화되어 있으면
   - 앱 비밀번호를 생성해야 할 수 있습니다
   - 하지만 일반적으로 네이버 메일은 일반 비밀번호로 작동합니다

### 5단계: 테스트

1. **Supabase 대시보드에서 테스트**
   - Project Settings → Auth → SMTP Settings
   - "Send Test Email" 버튼 클릭
   - 테스트 이메일 주소 입력 (네이버 메일 주소 권장)
   - 전송 확인

2. **에러 메시지 확인**
   - 테스트 실패 시 에러 메시지 확인
   - 에러 메시지에 따라 위의 해결 방법 적용

3. **실제 회원가입으로 테스트**
   - 새 계정으로 회원가입
   - 브라우저 콘솔 확인 (F12)
   - 에러 메시지 확인

## 🔍 디버깅 팁

### 브라우저 콘솔 확인

1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭 확인
3. 에러 메시지 확인:
   - `❌ Sign up error:` 로그 확인
   - `📧 SMTP Error:` 로그 확인

### Supabase 로그 확인

1. Supabase 대시보드 → Logs
2. Auth 로그 확인
3. SMTP 관련 에러 확인

## 📋 체크리스트

### 네이버 메일 설정:
- [ ] 네이버 메일에서 IMAP/SMTP 사용 설정 활성화됨
- [ ] 환경설정 → POP3/IMAP 설정 → "IMAP/SMTP 사용함" 선택됨

### Supabase SMTP 설정:
- [ ] Enable Custom SMTP 체크됨
- [ ] SMTP Host: `smtp.naver.com` (정확히 입력)
- [ ] SMTP Port: `587` (TLS 자동 활성화)
- [ ] SMTP User: `your-id@naver.com` (전체 이메일 주소)
- [ ] SMTP Password: 네이버 메일 비밀번호
- [ ] Sender Email: `your-id@naver.com` (SMTP User와 동일)
- [ ] Sender Name: 설정됨 (선택사항)

### 테스트:
- [ ] Supabase 대시보드에서 테스트 이메일 전송 성공
- [ ] 실제 회원가입으로 이메일 수신 확인

## 💡 추가 팁

1. **네이버 메일 일일 발신 한도**
   - 네이버 메일은 일일 약 300개 이메일 발신 제한이 있습니다
   - 한도 초과 시 오류가 발생할 수 있습니다

2. **스팸 폴더 확인**
   - 이메일이 스팸 폴더로 갈 수 있습니다
   - 발신자 이름(Sender Name)을 설정하면 도움이 됩니다

3. **프로덕션 환경**
   - 많은 사용자가 있는 경우 SendGrid, Mailgun 등 전문 이메일 서비스 사용 권장
   - 더 높은 발신 한도와 신뢰도 제공

## 🔗 참고 링크

- [네이버 메일 IMAP/SMTP 설정](https://help.naver.com/alias/mail/newmail05.naver)
- [Supabase SMTP 설정 문서](https://supabase.com/docs/guides/auth/auth-smtp)

## ✅ 해결 순서 요약

1. **네이버 메일에서 IMAP/SMTP 사용 설정** (가장 중요!)
2. **Supabase SMTP 설정 확인**
3. **테스트 이메일 전송**
4. **에러 메시지 확인 및 해결**
5. **실제 회원가입 테스트**

가장 흔한 원인은 **네이버 메일에서 IMAP/SMTP 사용 설정이 안 되어 있는 것**입니다. 먼저 이것을 확인해보세요!


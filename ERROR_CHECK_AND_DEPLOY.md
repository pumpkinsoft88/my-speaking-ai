# 에러 확인 및 배포 가이드

## 🔍 에러 내용 재확인 방법

### 1단계: Supabase 로그 확인 (가장 중요!)

HTTP 500 오류의 정확한 원인을 파악하려면 Supabase 로그를 확인해야 합니다.

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **로그 확인**
   - 좌측 메뉴: **Logs** → **Auth Logs**
   - 또는 **Logs** → **Postgres Logs**
   - 최근 에러 로그 확인 (회원가입 시점)
   - SMTP 관련 에러 메시지 확인

3. **에러 메시지 확인**
   - "SMTP", "email", "send", "authentication", "connection" 등의 키워드로 검색
   - 정확한 에러 원인 확인

### 2단계: 브라우저 콘솔 확인

1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭 확인
3. Network 탭 확인
4. `/auth/v1/signup` 요청 확인
5. Response 탭에서 에러 메시지 확인

### 3단계: Supabase SMTP 설정 재확인

네이버 메일 IMAP/SMTP 설정을 활성화했으니, 이제 Supabase SMTP 설정을 다시 확인하세요.

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
   (정확히 입력 - 특수문자 포함 시 주의)
   
   Sender Email: your-id@naver.com
   (SMTP User와 정확히 동일하게 설정)
   
   Sender Name: My Speaking AI (선택사항, 권장)
   ```

3. **설정 저장**
   - 모든 항목 입력 후 "Save" 버튼 클릭
   - 저장 후 몇 초 기다림 (설정 적용 시간 필요)

4. **테스트 이메일 전송**
   - "Send Test Email" 버튼 클릭
   - 테스트 이메일 주소 입력 (네이버 메일 주소 권장)
   - 전송 확인
   - 에러 메시지 확인

## 📦 코드 배포 필요 여부

### 현재 수정된 파일

- `src/lib/components/SignupForm.svelte` - 에러 메시지 처리 개선

### 배포 필요 여부

**선택사항이지만 권장합니다:**

1. **배포하지 않아도 되는 경우:**
   - SMTP 설정 문제만 해결하면 작동함
   - 에러 메시지가 중요하지 않음

2. **배포를 권장하는 경우:**
   - 더 나은 에러 메시지를 보고 싶은 경우
   - 사용자에게 더 명확한 안내를 제공하고 싶은 경우
   - 디버깅을 위해 콘솔 로그를 개선하고 싶은 경우

### 배포 방법

```bash
# 변경사항 확인
git status

# 변경사항 추가
git add src/lib/components/SignupForm.svelte

# 커밋
git commit -m "Improve SMTP error message handling"

# 배포
git push
```

또는 Vercel이 자동 배포를 설정했다면, `git push`만 하면 자동으로 배포됩니다.

## ✅ 해결 순서

### 즉시 확인해야 할 사항 (배포 전)

1. **Supabase 로그 확인**
   - Logs → Auth Logs
   - 정확한 에러 원인 파악

2. **Supabase SMTP 설정 재확인**
   - 모든 항목이 정확히 입력되었는지 확인
   - 테스트 이메일 전송 시도

3. **네이버 메일 설정 확인**
   - IMAP/SMTP 사용 설정이 활성화되었는지 재확인
   - 네이버 메일 비밀번호 확인

### 배포 후 확인

1. **코드 배포** (선택사항)
2. **새 계정으로 회원가입 테스트**
3. **에러 메시지 확인**
4. **이메일 수신 확인**

## 🔍 일반적인 문제 해결

### 문제 1: 여전히 500 오류 발생

**확인 사항:**
- Supabase 로그에서 정확한 에러 메시지 확인
- SMTP 설정이 정확히 입력되었는지 확인
- 네이버 메일 IMAP/SMTP 설정이 활성화되었는지 확인
- 테스트 이메일 전송이 성공하는지 확인

**해결:**
- Supabase 로그의 에러 메시지에 따라 해결
- SMTP 설정 재입력
- 네이버 메일 설정 재확인

### 문제 2: 테스트 이메일은 성공하지만 회원가입 시 실패

**확인 사항:**
- 이메일 템플릿 설정 확인
- Redirect URL 설정 확인

**해결:**
- 이메일 템플릿이 올바르게 설정되었는지 확인
- Redirect URL이 올바르게 설정되었는지 확인

### 문제 3: "Authentication failed" 오류

**확인 사항:**
- SMTP User에 전체 이메일 주소가 입력되었는지 확인
- 비밀번호가 정확한지 확인

**해결:**
- SMTP User: `your-id@naver.com` (전체 이메일 주소)
- 비밀번호 재입력

## 📋 체크리스트

### 즉시 확인:
- [ ] Supabase 로그 확인 (에러 원인 파악)
- [ ] Supabase SMTP 설정 재확인
- [ ] 네이버 메일 IMAP/SMTP 설정 활성화 확인
- [ ] 테스트 이메일 전송 시도

### 배포 (선택사항):
- [ ] 코드 변경사항 확인
- [ ] Git 커밋 및 푸시
- [ ] 배포 확인

### 테스트:
- [ ] 새 계정으로 회원가입 테스트
- [ ] 에러 메시지 확인
- [ ] 이메일 수신 확인

## 💡 권장 사항

1. **먼저 Supabase 로그 확인**
   - 정확한 에러 원인을 파악하는 것이 가장 중요합니다
   - 로그에서 에러 메시지를 확인하면 더 정확한 해결 방법을 찾을 수 있습니다

2. **테스트 이메일 전송**
   - Supabase 대시보드에서 테스트 이메일을 전송해보세요
   - 이것이 성공하면 SMTP 설정은 올바른 것입니다

3. **코드 배포는 선택사항**
   - SMTP 설정 문제만 해결하면 작동하므로
   - 하지만 더 나은 에러 메시지를 위해 배포를 권장합니다

## 🔗 참고

- [Supabase 로그 확인](https://supabase.com/dashboard/project/_/logs)
- [Supabase SMTP 설정](https://supabase.com/docs/guides/auth/auth-smtp)


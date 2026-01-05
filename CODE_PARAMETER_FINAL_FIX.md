# Code 파라미터 문제 최종 해결 방법

## 🚨 현재 문제

**증상:**
- URL: `https://my-speaking-ai-one.vercel.app/auth/confirm?code=5833e984-2a6b-4fbc-bfb2-b80970d79133`
- 콘솔: `⚠️ PKCE code verifier not found, trying alternative method...`
- 콘솔: `⚠️ No session and no token found`
- 인증 실패

**원인:**
- 이메일 템플릿이 `{{ .ConfirmationURL }}`을 사용
- Supabase의 `/auth/v1/verify` 엔드포인트로 리디렉션
- PKCE 플로우를 사용하여 `code` 파라미터 생성
- 하지만 PKCE가 비활성화되어 있어 `exchangeCodeForSession()` 실패

## ✅ 해결 방법 (2가지 옵션)

### 옵션 1: 이메일 템플릿 수정 (권장, 가장 확실함)

**이메일 템플릿을 수정하여 `token_hash`를 직접 사용:**

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **이메일 템플릿 편집**
   - Authentication → Email Templates
   - "Confirm signup" 선택
   - "Source" 탭 클릭

3. **템플릿 수정**
   ```html
   <h2>Confirm your signup</h2>
   <p>Follow this link to confirm your user:</p>
   <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>
   ```

4. **저장**
   - "Save changes" 클릭

**결과:**
- 이메일 링크: `https://...vercel.app/auth/confirm?token_hash=...&type=email`
- `code` 파라미터 없음
- `token_hash`로 직접 인증 처리
- PKCE 문제 완전히 우회

### 옵션 2: PKCE 다시 활성화

**PKCE를 활성화하면 `code` 파라미터가 정상 작동합니다:**

1. **`src/lib/supabase/client.js` 수정**
   ```javascript
   export const supabase = createClient(PUBLIC_SUPABASE_DB_URL, PUBLIC_SUPABASE_DB_PUBLIC_KEY, {
       auth: {
           detectSessionInUrl: true,
           persistSession: true,
           autoRefreshToken: true,
           flowType: 'pkce' // PKCE 활성화
       }
   });
   ```

2. **배포 및 테스트**
   - 코드 배포
   - 새 계정으로 회원가입
   - 이메일 링크 클릭
   - `code` 파라미터로 인증 처리

**주의:**
- SvelteKit SSR 환경에서는 `@supabase/ssr` 패키지가 필요할 수 있음
- 현재는 클라이언트 사이드에서만 사용하므로 문제없을 수 있음

## 🔧 현재 코드 상태

코드는 이미 두 가지 경우를 모두 처리하도록 수정되었습니다:

1. **`code` 파라미터 처리:**
   - `exchangeCodeForSession()` 시도
   - 실패하면 세션 확인으로 넘어감

2. **`token_hash` 처리:**
   - `verifyOtp()`로 직접 인증

3. **`token` 처리:**
   - `verifyOtp()`로 직접 인증

## 🎯 권장 해결 방법

**옵션 1 (이메일 템플릿 수정)을 권장합니다:**
- 가장 확실함
- PKCE 문제 완전히 우회
- 추가 설정 불필요
- 즉시 적용 가능

## 🧪 테스트

### 옵션 1 선택 시:
1. 이메일 템플릿 수정
2. 새 계정으로 회원가입
3. 이메일 링크 확인:
   - 형식: `https://...vercel.app/auth/confirm?token_hash=...&type=email`
   - `code` 파라미터 없음
4. 링크 클릭:
   - `token_hash`로 인증 처리
   - 인증 성공 후 홈으로 리디렉션

### 옵션 2 선택 시:
1. PKCE 활성화
2. 코드 배포
3. 새 계정으로 회원가입
4. 이메일 링크 클릭:
   - `code` 파라미터로 인증 처리
   - `exchangeCodeForSession()` 성공
   - 인증 성공 후 홈으로 리디렉션

## ✅ 최종 권장 사항

**이메일 템플릿을 수정하세요!**

이것이 가장 간단하고 확실한 해결 방법입니다. PKCE 문제를 완전히 우회하고 직접 `token_hash`로 인증 처리합니다.


# Supabase 공식 문서 기준 완전한 해결 가이드

## 📚 Supabase 공식 문서 핵심 내용

### 1. Site URL의 역할
- **Site URL**은 `redirectTo`가 지정되지 않았을 때 **기본 리디렉션 URL**로 사용됩니다
- **이메일 확인(email confirmations)과 비밀번호 재설정(password resets)에 중요합니다**
- 프로덕션 URL로 설정해야 합니다

### 2. Redirect URLs의 역할
- `redirectTo` 파라미터에 사용할 수 있는 URL 목록입니다
- 와일드카드 패턴(`**`)을 사용할 수 있습니다

### 3. Vercel 배포 시 설정
문서에 따르면:
```
http://localhost:3000/**
https://*-<team-or-account-slug>.vercel.app/**
```

### 4. 이메일 템플릿 (공식 문서 예시)
```html
<a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a>
```

## 🔧 현재 프로젝트 설정 (단계별)

### 1단계: Supabase Site URL 설정

**위치:** Supabase 대시보드 → Authentication → URL Configuration

**설정 값:**
```
https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/
```

⚠️ **중요:**
- URL 끝에 슬래시(`/`) 포함 필수
- 이메일 확인의 기본 리디렉션 URL로 사용됨
- `redirectTo`가 없을 때 이 URL로 리디렉션됨

### 2단계: Supabase Redirect URLs 설정

**위치:** Supabase 대시보드 → Authentication → URL Configuration → Redirect URLs

**추가할 URL 목록 (공식 문서 기준):**

#### 로컬 개발용:
```
http://localhost:5173/**
```
> 참고: 문서는 3000 포트를 예시로 사용하지만, Vite는 기본적으로 5173 포트를 사용합니다.

#### Vercel 프로덕션용 (정확한 URL):
```
https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/**
```

#### Vercel 프리뷰 URL용 (와일드카드 패턴 - 공식 문서 형식):
```
https://*-pklabs2021s-projects.vercel.app/**
```

⚠️ **중요 사항:**
- 각 URL 끝에 `/**` 와일드카드 포함 필수
- 슬래시 없이 도메인만 입력 (예: `https://...vercel.app/**`)
- `*-pklabs2021s-projects`는 팀/계정 슬러그입니다
- `**`는 모든 경로를 포함하는 와일드카드입니다

### 3단계: 이메일 템플릿 수정 (공식 문서 기준)

**위치:** Supabase 대시보드 → Authentication → Email Templates → "Confirm signup"

**공식 문서 예시 (최종):**
```html
<!-- <h2>Confirm your signup</h2> -->

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>
```

**또는 (더 간단한 방법):**
```html
<!-- <h2>Confirm your signup</h2> -->

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>
```

⚠️ **중요:**
- `{{ .RedirectTo }}`를 사용하면 코드에서 설정한 `emailRedirectTo` 값이 사용됩니다
- `{{ .SiteURL }}`만 사용하면 Site URL로만 리디렉션됩니다 (경로 없음)
- `{{.ConfirmationURL }}`은 사용하지 마세요

### 4단계: 코드 확인

현재 코드는 이미 올바르게 설정되어 있습니다:

```javascript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: redirectURL  // 이미 /auth/confirm 포함
  }
});
```

## ✅ 최종 체크리스트

### Supabase 대시보드 설정:
- [ ] **Site URL**: `https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/` (슬래시 포함)
- [ ] **Redirect URLs**:
  - [ ] `http://localhost:5173/**`
  - [ ] `https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/**`
  - [ ] `https://*-pklabs2021s-projects.vercel.app/**`

### 이메일 템플릿:
- [ ] `{{ .RedirectTo }}` 사용 (가장 중요!)
- [ ] `/auth/confirm` 경로 포함
- [ ] 하나의 링크만 있음
- [ ] `{{.ConfirmationURL }}` 사용하지 않음
- [ ] `{{ .SiteURL }}`만 사용하지 않음

### 코드:
- [ ] `emailRedirectTo` 옵션 설정됨
- [ ] 리디렉션 URL에 `/auth/confirm` 포함됨

## 🧪 테스트 방법

### 1. 브라우저 콘솔 확인
1. 브라우저 개발자 도구 열기 (F12)
2. **Console** 탭 선택
3. 새 계정으로 회원가입 시도
4. 다음 로그 확인:
   ```
   📧 Email redirect URL: https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/auth/confirm
   ✅ Sign up successful. Email will redirect to: https://...vercel.app/auth/confirm
   ```

### 2. 이메일 링크 확인
1. 이메일 받은 편지함 확인
2. 이메일의 링크를 **마우스 오른쪽 클릭** → "링크 주소 복사"
3. URL을 텍스트 에디터에 붙여넣기
4. 확인:
   - ✅ **올바른 형식**: `https://...vercel.app/auth/confirm?token_hash=...&type=email`
   - ❌ **잘못된 형식**: `https://...vercel.app/?token_hash=...&type=email` (홈만 있음)

### 3. 링크 클릭 테스트
1. 이메일 링크 클릭
2. **예상 결과**:
   - `/auth/confirm` 페이지로 리디렉션
   - "이메일 인증 중..." 메시지 표시
   - 인증 성공 후 홈으로 리디렉션
3. **문제 발생 시**:
   - Vercel SSO 로그인 페이지로 가는 경우 → 이메일 템플릿 재확인
   - 다른 페이지로 가는 경우 → Redirect URLs 확인

## 🔍 문제별 해결 방법

### 문제 1: 이메일 링크에 `/auth/confirm` 경로가 없음

**증상:**
- 링크: `https://...vercel.app/?token_hash=...&type=email`

**원인:**
- 이메일 템플릿이 `{{ .SiteURL }}`만 사용하고 있음
- `{{ .RedirectTo }}`를 사용하지 않음

**해결:**
1. Supabase 이메일 템플릿 확인
2. `{{ .RedirectTo }}/auth/confirm` 또는 `{{ .RedirectTo }}` 사용
3. 템플릿 저장 후 새 계정으로 테스트

### 문제 2: Vercel SSO 로그인 페이지로 리디렉션됨

**증상:**
- 링크 클릭 시 `https://vercel.com/login?next=...`로 이동

**원인:**
- Supabase Redirect URLs에 올바른 URL이 추가되지 않음
- 와일드카드 패턴이 잘못됨

**해결:**
1. Supabase Redirect URLs 확인
2. `https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/**` 추가 확인
3. `https://*-pklabs2021s-projects.vercel.app/**` 추가 확인
4. 이메일 템플릿에서 `/auth/confirm` 경로 명시

### 문제 3: "Invalid redirect URL" 오류

**증상:**
- 브라우저 콘솔에 오류 메시지 표시

**원인:**
- Supabase Redirect URLs에 해당 URL이 없음
- URL 형식이 잘못됨

**해결:**
1. Supabase Redirect URLs에 해당 URL 추가
2. URL 형식 확인 (와일드카드 포함)
3. Site URL과 일치하는지 확인

## 💡 공식 문서 핵심 포인트

1. **Site URL**: 기본 리디렉션 URL (이메일 확인에 중요)
2. **Redirect URLs**: `redirectTo` 파라미터에 사용 가능한 URL 목록
3. **이메일 템플릿**: `{{ .RedirectTo }}` 사용 권장
4. **Vercel**: 와일드카드 패턴 `https://*-<team-slug>.vercel.app/**` 사용
5. **와일드카드**: `**`는 모든 경로를 포함합니다

## 🎯 가장 중요한 단계

**1순위: 이메일 템플릿 수정**
- `{{ .RedirectTo }}` 사용
- 이것이 해결되지 않으면 다른 설정을 변경해도 문제가 계속됩니다

**2순위: Redirect URLs 확인**
- 와일드카드 패턴(`/**`) 포함
- 정확한 URL 추가

**3순위: Site URL 확인**
- 프로덕션 URL로 설정
- 슬래시 포함


# Supabase 공식 문서 기준 Redirect URLs 문제 해결

## 📚 Supabase 공식 문서 핵심 내용

### 1. Site URL의 역할
- **Site URL**은 `redirectTo`가 지정되지 않았을 때 **기본 리디렉션 URL**로 사용됩니다
- **이메일 확인(email confirmations)과 비밀번호 재설정(password resets)에 중요합니다**
- 프로덕션 URL로 설정해야 합니다

### 2. Redirect URLs의 역할
- `redirectTo` 파라미터에 사용할 수 있는 URL 목록입니다
- 와일드카드 패턴을 사용할 수 있습니다

### 3. Vercel 배포 시 설정
문서에 따르면:
```
http://localhost:3000/**
https://*-<team-or-account-slug>.vercel.app/**
```

### 4. 이메일 템플릿
문서 예시:
```html
<a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a>
```

## 🔧 현재 프로젝트에 맞는 설정

### 1단계: Supabase Site URL 설정

**위치:** Supabase 대시보드 → Authentication → URL Configuration

**설정 값:**
```
https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/
```

⚠️ **중요:**
- URL 끝에 슬래시(`/`) 포함 필수
- 이메일 확인의 기본 리디렉션 URL로 사용됨

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

#### Vercel 프리뷰 URL용 (와일드카드 패턴):
```
https://*-pklabs2021s-projects.vercel.app/**
```

⚠️ **중요 사항:**
- 각 URL 끝에 `/**` 와일드카드 포함 필수
- 슬래시 없이 도메인만 입력 (예: `https://...vercel.app/**`)
- `*-pklabs2021s-projects`는 팀/계정 슬러그입니다

### 3단계: 이메일 템플릿 수정 (공식 문서 기준)

**위치:** Supabase 대시보드 → Authentication → Email Templates → "Confirm signup"

**공식 문서 예시 (수정 후):**
```html
<a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a>
```

**또는 (더 명시적인 방법):**
```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a>
```

⚠️ **중요:**
- `{{ .RedirectTo }}`를 사용하면 코드에서 설정한 `emailRedirectTo` 값이 사용됩니다
- `{{ .SiteURL }}`만 사용하면 Site URL로만 리디렉션됩니다

### 4단계: 코드 확인

현재 코드는 이미 올바르게 설정되어 있습니다:

```javascript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: redirectURL  // 이미 설정됨
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
- [ ] `{{ .RedirectTo }}` 사용
- [ ] `/auth/confirm` 경로 포함
- [ ] 하나의 링크만 있음

### 코드:
- [ ] `emailRedirectTo` 옵션 설정됨
- [ ] 리디렉션 URL에 `/auth/confirm` 포함됨

## 🧪 테스트

1. **새 계정으로 회원가입**
2. **이메일 링크 확인:**
   - `{{ .RedirectTo }}`를 사용하면: `https://...vercel.app/auth/confirm?token_hash=...&type=email`
   - `{{ .SiteURL }}`만 사용하면: `https://...vercel.app/?token_hash=...&type=email` (문제!)
3. **링크 클릭:**
   - `/auth/confirm` 페이지로 리디렉션되는지 확인

## 🔍 문제 해결

### 문제 1: 이메일 링크에 `/auth/confirm` 경로가 없음

**원인:**
- 이메일 템플릿이 `{{ .SiteURL }}`만 사용하고 있음
- `{{ .RedirectTo }}`를 사용하지 않음

**해결:**
- 이메일 템플릿을 `{{ .RedirectTo }}/auth/confirm` 형식으로 수정

### 문제 2: Vercel SSO 로그인 페이지로 리디렉션됨

**원인:**
- Redirect URLs에 올바른 URL이 추가되지 않음
- 와일드카드 패턴이 잘못됨

**해결:**
- `https://*-pklabs2021s-projects.vercel.app/**` 형식으로 추가
- 정확한 프로덕션 URL도 추가: `https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/**`

### 문제 3: "Invalid redirect URL" 오류

**원인:**
- Redirect URLs 목록에 해당 URL이 없음
- URL 형식이 잘못됨

**해결:**
- Redirect URLs에 해당 URL 추가
- 와일드카드 패턴 확인 (`/**` 포함)

## 💡 공식 문서 핵심 포인트

1. **Site URL**: 기본 리디렉션 URL (이메일 확인에 중요)
2. **Redirect URLs**: `redirectTo` 파라미터에 사용 가능한 URL 목록
3. **이메일 템플릿**: `{{ .RedirectTo }}` 사용 권장
4. **Vercel**: 와일드카드 패턴 `https://*-<team-slug>.vercel.app/**` 사용


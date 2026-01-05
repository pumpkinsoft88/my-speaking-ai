# 이메일 템플릿 최종 해결 방법

## 🚨 현재 문제

이메일 링크: `https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/?token_hash=...&type=email`

**문제점:**
- `/auth/confirm` 경로가 없음
- 홈(`/`)으로만 리디렉션됨
- `{{ .RedirectTo }}`가 작동하지 않거나 무시되고 있음

## ✅ 확실한 해결 방법

### Supabase 이메일 템플릿 수정

**Supabase 대시보드 → Authentication → Email Templates → "Confirm signup"**

**현재 (문제):**
```html
<!-- <h2>Confirm your signup</h2> -->

<p>Follow this link to confirm your user:</p>
<p><a href="{{.ConfirmationURL }}">Confirm your mail</a></p>

<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">
Confirm your mail
</a>
```

**수정 후 (최종 - 명시적 경로 사용):**
```html
<!-- <h2>Confirm your signup</h2> -->

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>
```

**또는 (더 안전한 방법):**
```html
<!-- <h2>Confirm your signup</h2> -->

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>
```

## 🔧 수정 단계

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **이메일 템플릿 편집**
   - Authentication → Email Templates
   - "Confirm signup" 선택

3. **템플릿 내용 수정**
   - **모든 기존 링크 삭제**
   - 다음 하나의 링크만 남기기:
     ```html
     <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>
     ```

4. **최종 템플릿 (전체):**
   ```html
   <!-- <h2>Confirm your signup</h2> -->

   <p>Follow this link to confirm your user:</p>
   <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>
   ```

5. **저장**
   - "Save changes" 클릭
   - 즉시 적용됨

## 📋 추가 확인 사항

### Supabase Site URL 확인
- Authentication → URL Configuration
- **Site URL**: `https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/`
  - ⚠️ URL 끝에 슬래시(`/`) 포함 확인

### Redirect URLs 확인
다음 URL이 추가되어 있는지 확인:
```
https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/**
```

## 🧪 테스트

1. **이메일 템플릿 수정 후**
2. **새 계정으로 회원가입** (기존 이메일은 이전 설정 사용)
3. **이메일 링크 확인:**
   - 링크를 마우스 오른쪽 클릭 → "링크 주소 복사"
   - 올바른 형식: `https://...vercel.app/auth/confirm?token_hash=...&type=email`
   - 잘못된 형식: `https://...vercel.app/?token_hash=...&type=email` (홈만 있음)
4. **링크 클릭 테스트:**
   - `/auth/confirm` 페이지로 리디렉션되는지 확인
   - Vercel SSO 로그인 페이지로 가지 않는지 확인

## 💡 핵심 포인트

1. **`{{ .SiteURL }}/auth/confirm` 명시적 사용**
   - `{{ .RedirectTo }}`가 작동하지 않을 수 있으므로
   - 명시적으로 경로를 지정하는 것이 더 안전

2. **하나의 링크만 사용**
   - 중복 링크 제거
   - 명확한 하나의 링크만 남기기

3. **새 계정으로 테스트**
   - 기존 이메일은 이전 설정 사용
   - 새 계정으로만 테스트


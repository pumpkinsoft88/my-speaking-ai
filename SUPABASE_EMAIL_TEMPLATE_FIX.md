# Supabase 이메일 템플릿 수정 가이드 (긴급!)

## 🚨 현재 문제

이메일 인증 링크가 Vercel SSO 로그인 페이지로 리디렉션되는 이유는 **Supabase 이메일 템플릿이 `{{ .RedirectTo }}`를 사용하지 않고 `{{ .SiteURL }}`만 사용**하고 있기 때문입니다.

## ✅ 해결 방법 (필수!)

### 1단계: Supabase 대시보드 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택

### 2단계: 이메일 템플릿 편집
1. 좌측 메뉴: **Authentication** → **Email Templates**
2. **"Confirm signup"** 템플릿 선택

### 3단계: 링크 부분 수정

**현재 (잘못된 설정):**
```html
<a href="{{ .SiteURL }}?token_hash={{ .TokenHash }}&type=email">
  Confirm your mail
</a>
```

**수정 후 (옵션 A - 권장):**
```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">
  Confirm your mail
</a>
```

**또는 (옵션 B):**
```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
  Confirm your mail
</a>
```

### 4단계: 저장
- "Save" 버튼 클릭
- 변경사항이 즉시 적용됩니다

## 📋 추가 확인 사항

### Supabase Site URL 확인
1. **Authentication** → **URL Configuration**
2. **Site URL**: `https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/`
   - ⚠️ URL 끝에 슬래시(`/`) 포함 필수!

### Redirect URLs 확인
다음 URL들이 추가되어 있는지 확인:
```
http://localhost:5173/**
https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/**
https://*-pklabs2021s-projects.vercel.app/**
```

## 🧪 테스트 방법

1. **이메일 템플릿 수정 후**
2. **새 계정으로 회원가입** (기존 이메일 링크는 이전 설정을 사용할 수 있음)
3. **이메일의 링크 확인**:
   - 링크를 마우스 오른쪽 클릭 → "링크 주소 복사"
   - URL에서 `redirect_to` 파라미터 확인
   - 올바른 형식: `redirect_to=https://...vercel.app/auth/confirm`
4. **링크 클릭 테스트**:
   - `/auth/confirm` 페이지로 리디렉션되는지 확인
   - Vercel SSO 로그인 페이지로 가지 않는지 확인

## ⚠️ 중요 사항

- **이메일 템플릿 수정이 가장 중요합니다!** 코드만 수정해도 템플릿이 `{{ .SiteURL }}`만 사용하면 문제가 계속됩니다.
- 기존 이메일 링크는 이전 설정을 사용할 수 있으므로, **새 계정으로 테스트**하세요.
- 이메일 템플릿을 수정하면 **즉시 적용**되며, 재배포가 필요 없습니다.


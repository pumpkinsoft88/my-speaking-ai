# 배포 체크리스트 - 이메일 인증 리디렉션 수정

## 1. 코드 변경사항 확인 ✅

다음 파일들이 수정되었습니다:
- `src/lib/stores/auth.js` - `signUp` 함수에서 리디렉션 URL 생성 로직 개선
- `src/lib/utils/url.js` - URL 유틸리티 함수 개선
- `src/lib/supabase/client.js` - Supabase 클라이언트 설정 최적화

## 2. Supabase 설정 확인 (배포 전 필수!)

### 2.1 Site URL 확인
1. Supabase 대시보드 → Authentication → URL Configuration
2. **Site URL**: `https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/`
   - ⚠️ **중요**: URL 끝에 슬래시(`/`) 포함 필수!

### 2.2 Redirect URLs 확인
다음 URL들이 추가되어 있는지 확인:
```
http://localhost:5173/**
https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/**
https://*-pklabs2021s-projects.vercel.app/**
```

### 2.3 이메일 템플릿 수정 (가장 중요!)
1. Supabase 대시보드 → Authentication → Email Templates
2. "Confirm signup" 템플릿 선택
3. 이메일 본문의 링크 부분을 다음 중 하나로 수정:

**옵션 A (권장):**
```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">
  Confirm your mail
</a>
```

**옵션 B:**
```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
  Confirm your mail
</a>
```

⚠️ **현재 문제**: 이메일 템플릿이 `{{ .SiteURL }}`만 사용하면 홈(`/`)으로 리디렉션됩니다.
`{{ .RedirectTo }}`를 사용하거나 `/auth/confirm` 경로를 명시적으로 추가해야 합니다.

## 3. Vercel 배포

### 3.1 Git 커밋 및 푸시
```bash
git add .
git commit -m "Fix email authentication redirect URL"
git push
```

### 3.2 Vercel 자동 배포
- Git 푸시 후 Vercel이 자동으로 배포를 시작합니다
- 또는 Vercel 대시보드에서 수동으로 재배포할 수 있습니다

### 3.3 Vercel CLI로 배포 (선택사항)
```bash
vercel --prod
```

## 4. 배포 후 테스트

1. **새 계정으로 회원가입**
   - 브라우저 콘솔 열기 (F12)
   - 회원가입 시도
   - 콘솔에서 다음 로그 확인:
     ```
     📧 Email redirect URL: https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/auth/confirm
     ```

2. **이메일 확인**
   - 이메일의 링크를 마우스 오른쪽 클릭 → "링크 주소 복사"
   - URL을 확인하여 `redirect_to` 파라미터가 `/auth/confirm`를 포함하는지 확인
   - 올바른 형식: `redirect_to=https://...vercel.app/auth/confirm`

3. **링크 클릭 테스트**
   - 이메일 링크 클릭
   - `/auth/confirm` 페이지로 리디렉션되는지 확인
   - Vercel SSO 로그인 페이지로 가지 않는지 확인

## 5. 문제 해결

### 여전히 Vercel SSO로 리디렉션되는 경우:
1. ✅ Supabase 이메일 템플릿이 `{{ .RedirectTo }}`를 사용하는지 확인
2. ✅ Supabase Redirect URLs에 올바른 URL이 추가되어 있는지 확인
3. ✅ 브라우저 캐시 및 쿠키 삭제 후 재시도
4. ✅ 새 계정으로 다시 테스트 (기존 이메일 링크는 이전 설정을 사용할 수 있음)

### 이메일 템플릿 확인 방법:
1. Supabase 대시보드 → Authentication → Email Templates
2. "Confirm signup" 템플릿의 "Subject" 또는 "Body" 확인
3. 링크 부분이 `{{ .RedirectTo }}` 또는 `{{ .SiteURL }}/auth/confirm`를 사용하는지 확인


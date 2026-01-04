# 최종 해결 가이드 - Vercel SSO 리디렉션 문제

## 🚨 문제 진단

URL을 분석하면:
- `redirect_to=https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/` (홈만 있음)
- Vercel SSO API가 중간에 개입

**원인**: Supabase 이메일 템플릿이 `{{.ConfirmationURL }}`을 사용하거나, `{{ .RedirectTo }}`가 무시되고 있음

## ✅ 확실한 해결 방법 (3단계)

### 1단계: Supabase 이메일 템플릿 완전히 수정

**Supabase 대시보드 → Authentication → Email Templates → "Confirm signup"**

**현재 템플릿 (문제):**
```html
<!-- <h2>Confirm your signup</h2> -->

<p>Follow this link to confirm your user:</p>
<p><a href="{{.ConfirmationURL }}">Confirm your mail</a></p>

<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">
Confirm your mail
</a>
```

**수정 후 (최종):**
```html
<!-- <h2>Confirm your signup</h2> -->

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>
```

**중요 사항:**
- ✅ Line 4의 `{{.ConfirmationURL }}` 링크 **완전히 삭제**
- ✅ Line 6-8의 중복 링크도 **삭제**
- ✅ **하나의 링크만 남기기**: `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email`

### 2단계: Supabase Site URL 확인 및 수정

**Supabase 대시보드 → Authentication → URL Configuration**

1. **Site URL 확인:**
   - 현재: `https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/`
   - ⚠️ URL 끝에 슬래시(`/`) 포함 확인

2. **Redirect URLs 확인:**
   다음 URL들이 **정확히** 추가되어 있는지 확인:
   ```
   http://localhost:5173/**
   https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/**
   https://*-pklabs2021s-projects.vercel.app/**
   ```
   
   ⚠️ **중요**: 
   - URL 끝에 `/**` 와일드카드 포함 필수
   - 슬래시 없이 `https://...vercel.app/**` 형식

### 3단계: 코드 재배포

```bash
# Git 커밋 및 푸시
git add .
git commit -m "Fix email authentication redirect URL"
git push

# 또는 Vercel CLI
vercel --prod
```

## 🧪 테스트 방법

### 1. 브라우저 콘솔 확인 (회원가입 시)
1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭 선택
3. 새 계정으로 회원가입
4. 다음 로그 확인:
   ```
   📧 Email redirect URL: https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/auth/confirm
   ✅ Sign up successful. Email will redirect to: https://...vercel.app/auth/confirm
   ```

### 2. 이메일 링크 확인
1. 이메일의 링크를 **마우스 오른쪽 클릭** → "링크 주소 복사"
2. URL을 텍스트 에디터에 붙여넣기
3. `redirect_to` 파라미터 확인:
   - ✅ **올바른 형식**: `redirect_to=https://...vercel.app/auth/confirm`
   - ❌ **잘못된 형식**: `redirect_to=https://...vercel.app/` (홈만 있음)

### 3. 링크 클릭 테스트
1. 이메일 링크 클릭
2. **예상 결과**: `/auth/confirm` 페이지로 리디렉션
3. **문제 발생**: Vercel SSO 로그인 페이지로 리디렉션

## 🔍 문제가 계속되면 확인할 사항

### 체크리스트:
- [ ] Supabase 이메일 템플릿에서 `{{.ConfirmationURL }}` 완전히 제거됨
- [ ] 이메일 템플릿에 `{{ .RedirectTo }}` 링크만 하나 남음
- [ ] Supabase Site URL이 올바르게 설정됨
- [ ] Supabase Redirect URLs에 올바른 URL 추가됨
- [ ] 코드가 재배포됨
- [ ] **새 계정으로 테스트** (기존 이메일은 이전 설정 사용)

### 추가 확인:
1. **Supabase 이메일 템플릿 저장 확인**
   - "Save changes" 버튼을 클릭했는지 확인
   - 변경사항이 저장되었는지 확인

2. **브라우저 캐시 삭제**
   - 브라우저 캐시 및 쿠키 삭제
   - 시크릿 모드에서 테스트

3. **새 계정으로 테스트**
   - 기존 이메일 링크는 이전 설정을 사용할 수 있음
   - 반드시 **새 계정으로 회원가입** 후 테스트

## 💡 핵심 포인트

1. **이메일 템플릿 수정이 가장 중요합니다!**
   - `{{.ConfirmationURL }}` 완전히 제거
   - `{{ .RedirectTo }}`만 사용

2. **하나의 링크만 남기기**
   - 중복 링크 제거
   - 명확한 하나의 링크만 사용

3. **새 계정으로 테스트**
   - 기존 이메일은 이전 설정 사용
   - 새 계정으로만 테스트


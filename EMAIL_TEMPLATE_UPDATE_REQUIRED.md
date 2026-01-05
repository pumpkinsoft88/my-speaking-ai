# 이메일 템플릿 수정 필요 (중요!)

## 🚨 현재 문제

**증상:**
- URL에 `code` 파라미터가 있음
- PKCE code verifier 오류 발생
- 인증 실패

**원인:**
- 이메일 템플릿이 `{{ .ConfirmationURL }}`을 사용
- 이것이 Supabase의 `/auth/v1/verify` 엔드포인트로 리디렉션
- PKCE 플로우를 비활성화했지만 Supabase가 여전히 `code` 파라미터를 사용

## ✅ 해결 방법

### Supabase 이메일 템플릿 수정 (필수!)

**위치:** Supabase 대시보드 → Authentication → Email Templates → "Confirm signup"

**현재 (문제):**
```html
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
```

**수정 후 (최종):**
```html
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>
```

**또는 (권장):**
```html
<p><a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>
```

## 🔧 수정 단계

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **이메일 템플릿 편집**
   - Authentication → Email Templates
   - "Confirm signup" 선택
   - "Source" 탭 클릭

3. **템플릿 내용 수정**
   - 기존 링크: `<a href="{{ .ConfirmationURL }}">Confirm your mail</a>`
   - 새 링크: `<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a>`

4. **최종 템플릿 (전체):**
   ```html
   <h2>Confirm your signup</h2>
   <p>Follow this link to confirm your user:</p>
   <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>
   ```

5. **저장**
   - "Save changes" 클릭
   - 즉시 적용됨

## 🎯 핵심 포인트

1. **`{{ .ConfirmationURL }}` 사용 금지**
   - 이것이 Supabase verify 엔드포인트로 리디렉션하고 PKCE 문제를 일으킵니다

2. **`token_hash` 직접 사용**
   - `{{ .TokenHash }}`를 사용하여 직접 우리 앱으로 리디렉션
   - PKCE 문제를 완전히 우회

3. **즉시 적용**
   - 템플릿 수정 후 즉시 적용됨
   - 새 계정으로 테스트 필요

## 🧪 테스트

1. **이메일 템플릿 수정 후**
2. **새 계정으로 회원가입**
3. **이메일 링크 확인:**
   - 링크 형식: `https://...vercel.app/auth/confirm?token_hash=...&type=email`
   - `code` 파라미터가 없어야 함
4. **링크 클릭:**
   - `/auth/confirm` 페이지로 리디렉션
   - `token_hash`로 인증 처리
   - 인증 성공 후 홈으로 리디렉션

## ✅ 해결 완료

이메일 템플릿을 수정하면:
- `code` 파라미터 문제 해결
- PKCE code verifier 오류 해결
- 직접 `token_hash`로 인증 처리

**가장 중요한 단계입니다!** 이메일 템플릿을 수정하지 않으면 문제가 계속됩니다.


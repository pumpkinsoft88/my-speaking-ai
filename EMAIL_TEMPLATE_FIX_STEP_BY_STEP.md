# Supabase 이메일 템플릿 수정 가이드 (단계별)

## 🔍 현재 문제

이메일 템플릿에 **두 개의 링크**가 있습니다:
1. **Line 4**: `{{.ConfirmationURL }}` 사용 (문제의 원인!)
2. **Line 6-8**: `{{ .RedirectTo }}` 사용 (올바른 설정)

`{{.ConfirmationURL }}`은 Supabase의 기본 확인 URL을 사용하여 Site URL로만 리디렉션하므로, `/auth/confirm` 경로가 포함되지 않습니다.

## ✅ 해결 방법

### 옵션 1: Line 4 제거 (권장)

**현재 템플릿:**
```html
<!-- <h2>Confirm your signup</h2> -->

<p>Follow this link to confirm your user:</p>
<p><a href="{{.ConfirmationURL }}">Confirm your mail</a></p>

<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">
Confirm your mail
</a>
```

**수정 후:**
```html
<!-- <h2>Confirm your signup</h2> -->

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>
```

**단계:**
1. Line 4의 `<p><a href="{{.ConfirmationURL }}">Confirm your mail</a></p>` 전체를 삭제
2. Line 6-8의 링크를 Line 4 위치로 이동하거나 그대로 유지
3. 중복된 링크 제거

### 옵션 2: Line 4 수정

**수정 후:**
```html
<!-- <h2>Confirm your signup</h2> -->

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>
```

**단계:**
1. Line 4의 `{{.ConfirmationURL }}`을 `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email`로 변경
2. Line 6-8의 중복 링크 제거

## 📝 최종 권장 템플릿

```html
<!-- <h2>Confirm your signup</h2> -->

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>
```

## 🔧 Supabase 대시보드에서 수정하는 방법

1. **이메일 템플릿 편집기에서:**
   - Line 4 전체를 삭제하거나 수정
   - Line 6-8의 중복 링크 제거
   - 하나의 링크만 남기기

2. **"Save changes" 버튼 클릭**

3. **즉시 적용됨** (재배포 불필요)

## 🧪 테스트

1. 이메일 템플릿 수정 후
2. **새 계정으로 회원가입** (기존 이메일은 이전 설정 사용)
3. 이메일의 링크 확인:
   - `redirect_to=https://...vercel.app/auth/confirm` 형식인지 확인
4. 링크 클릭:
   - `/auth/confirm` 페이지로 리디렉션되는지 확인
   - Vercel SSO 로그인 페이지로 가지 않는지 확인


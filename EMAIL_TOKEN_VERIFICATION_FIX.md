# 이메일 인증 토큰 검증 문제 해결

## 🚨 현재 문제

**증상:**
- 이메일 확인 링크 클릭 시 "Email link is invalid or has expired" 오류 발생
- 직접 로그인은 가능함

**원인:**
- `/auth/confirm` 페이지가 URL 쿼리 파라미터의 `token_hash`를 확인하지 않음
- 토큰을 명시적으로 검증하지 않고 세션만 확인함
- Vercel 배포 보호를 비활성화한 후 Supabase가 자동으로 세션을 설정하지 못할 수 있음

## ✅ 해결 방법

### 코드 수정 완료

`/auth/confirm` 페이지를 수정하여:
1. URL 쿼리 파라미터에서 `token_hash`와 `type` 확인
2. 토큰이 있으면 `verifyOtp()`로 명시적으로 검증
3. 토큰이 없으면 기존 세션 확인 (이미 인증된 경우)

### 수정된 로직

```javascript
// 1. URL 쿼리 파라미터에서 토큰 확인
const tokenHash = urlParams.get('token_hash');
const type = urlParams.get('type');

// 2. 토큰이 있으면 명시적으로 검증
if (tokenHash && type === 'email') {
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'email'
  });
  // 검증 성공 시 세션 설정
}

// 3. 토큰이 없으면 기존 세션 확인
else {
  const { data: { session } } = await supabase.auth.getSession();
  // 세션이 있으면 이미 인증된 상태
}
```

## 🧪 테스트 방법

### 1. 코드 배포
```bash
git add .
git commit -m "Fix email token verification in auth confirm page"
git push

# 또는 Vercel CLI
vercel --prod
```

### 2. 새 계정으로 회원가입
- 기존 이메일 링크는 이전 설정을 사용할 수 있으므로
- 반드시 새 계정으로 테스트

### 3. 이메일 링크 클릭
1. 이메일의 링크 클릭
2. 브라우저 콘솔 확인 (F12):
   - `🔐 Verifying email token...` 로그 확인
   - `✅ Email verified successfully` 로그 확인
3. 예상 결과:
   - `/auth/confirm` 페이지로 리디렉션
   - "이메일 인증 중..." 메시지 표시
   - 인증 성공 후 홈으로 리디렉션

### 4. 문제 발생 시
- 브라우저 콘솔의 에러 메시지 확인
- `❌ Token verification error:` 로그 확인
- 에러 메시지에 따라 추가 조치

## 🔍 디버깅

### 브라우저 콘솔 로그 확인

**성공 시:**
```
🔐 Verifying email token...
✅ Email verified successfully
```

**실패 시:**
```
🔐 Verifying email token...
❌ Token verification error: [에러 메시지]
```

**세션 확인 시:**
```
🔍 Checking existing session...
✅ Session found, user already authenticated
```

## 💡 추가 확인 사항

### 1. 이메일 링크 형식 확인
이메일 링크가 올바른 형식인지 확인:
- ✅ 올바른 형식: `https://...vercel.app/auth/confirm?token_hash=...&type=email`
- ❌ 잘못된 형식: `https://...vercel.app/?token_hash=...&type=email` (홈만 있음)

### 2. Supabase 이메일 템플릿 확인
이메일 템플릿이 올바른지 확인:
- `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` 형식 사용

### 3. 토큰 만료 시간 확인
- Supabase의 기본 토큰 만료 시간은 24시간입니다
- 링크를 클릭하는 시간이 너무 오래 걸리면 만료될 수 있습니다

## 🎯 핵심 포인트

1. **토큰 명시적 검증**: `verifyOtp()` 메서드 사용
2. **URL 쿼리 파라미터 확인**: `token_hash`와 `type` 확인
3. **에러 처리**: 명확한 에러 메시지 표시
4. **디버깅 로그**: 콘솔 로그로 문제 진단

## ✅ 해결 완료

코드 수정이 완료되었습니다. 이제:
1. 이메일 링크의 토큰을 명시적으로 검증합니다
2. 토큰이 유효하면 세션을 설정합니다
3. 토큰이 없거나 만료되면 명확한 에러 메시지를 표시합니다

코드를 배포한 후 새 계정으로 테스트하세요!


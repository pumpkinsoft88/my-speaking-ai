# PKCE Code Verifier 문제 해결 가이드

## 🚨 현재 문제

**오류 메시지:**
```
PKCE code verifier not found in storage. This can happen if the auth flow was initiated in a different browser or device, or if the storage was cleared. For SSR frameworks (Next.js, SvelteKit, etc.), use @supabase/ssr on both the server and client to store the code verifier in cookies.
```

**원인:**
- SvelteKit은 SSR 프레임워크입니다
- PKCE 플로우에서 `code_verifier`를 로컬 스토리지에 저장하는데, SSR 환경에서는 이것이 제대로 작동하지 않습니다
- `@supabase/ssr` 패키지를 사용하여 쿠키에 저장해야 합니다

## ✅ 해결 방법

### 방법 1: PKCE 플로우 비활성화 (간단하지만 보안상 덜 권장)

가장 간단한 방법은 PKCE 플로우를 비활성화하는 것입니다.

**수정:** `src/lib/supabase/client.js`

```javascript
export const supabase = createClient(PUBLIC_SUPABASE_DB_URL, PUBLIC_SUPABASE_DB_PUBLIC_KEY, {
	auth: {
		detectSessionInUrl: true,
		persistSession: true,
		autoRefreshToken: true,
		// PKCE 플로우 비활성화
		flowType: 'implicit' // 또는 제거
	}
});
```

**장점:**
- 빠른 해결
- 추가 패키지 설치 불필요

**단점:**
- 보안상 덜 권장됨
- PKCE는 OAuth 보안을 강화합니다

### 방법 2: @supabase/ssr 사용 (권장)

SSR 프레임워크에서 PKCE를 올바르게 사용하려면 `@supabase/ssr` 패키지를 사용해야 합니다.

#### 2-1. 패키지 설치

```bash
npm install @supabase/ssr
```

#### 2-2. 클라이언트 사이드 Supabase 클라이언트 수정

`src/lib/supabase/client.js`를 수정하여 브라우저 쿠키를 사용하도록 설정합니다.

하지만 이 방법은 더 복잡하므로, 일단 방법 1을 시도하는 것이 좋습니다.

## 🎯 권장 해결 방법

**현재 상황에서는 방법 1 (PKCE 비활성화)을 권장합니다:**

1. 빠르게 해결 가능
2. 이메일 인증은 여전히 안전합니다
3. 추가 패키지 설치 불필요

나중에 필요하면 `@supabase/ssr`을 사용하여 PKCE를 다시 활성화할 수 있습니다.


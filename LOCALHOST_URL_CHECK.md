# 로컬호스트 URL 확인 및 업데이트 가이드

## 🔍 현재 설정

**Supabase Redirect URLs에 설정된 로컬호스트 URL:**
```
http://localhost:5173/**
```

## ✅ 확인 방법

### 1. 개발 서버 실행 시 포트 확인

터미널에서 개발 서버를 실행하면 포트 번호가 표시됩니다:

```bash
npm run dev
```

**출력 예시:**
```
  VITE v7.2.6  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**확인 사항:**
- `Local:` 뒤에 표시된 포트 번호 확인
- 기본값은 `5173`이지만, 포트가 사용 중이면 자동으로 다른 포트(예: `5174`, `5175`)를 사용할 수 있습니다

### 2. 브라우저 주소창 확인

개발 서버를 실행한 후 브라우저 주소창을 확인하세요:
- `http://localhost:5173/` → 포트 5173 사용 중
- `http://localhost:5174/` → 포트 5174 사용 중
- `http://localhost:5175/` → 포트 5175 사용 중

## 🔧 업데이트가 필요한 경우

### 경우 1: 포트가 5173이 아닌 경우

**예시:** 개발 서버가 `http://localhost:5174/`에서 실행되는 경우

**Supabase 대시보드에서:**
1. **Authentication** → **URL Configuration** → **Redirect URLs**
2. 기존 `http://localhost:5173/**` 삭제 또는 수정
3. 새로운 URL 추가: `http://localhost:5174/**`
4. "Save" 클릭

### 경우 2: 여러 포트를 사용하는 경우

여러 포트를 사용한다면 모두 추가할 수 있습니다:

```
http://localhost:5173/**
http://localhost:5174/**
http://localhost:5175/**
```

### 경우 3: 포트를 고정하고 싶은 경우

`vite.config.js`에 포트를 고정할 수 있습니다:

```javascript
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: 5173, // 포트 고정
		strictPort: true // 포트가 사용 중이면 에러 발생
	},
	// ... 나머지 설정
});
```

## 📋 현재 프로젝트 기준

**현재 설정 (`http://localhost:5173/**`)이 올바른 경우:**
- ✅ Vite의 기본 포트는 5173입니다
- ✅ `package.json`에서 `"dev": "vite dev"`를 사용하고 있습니다
- ✅ 코드에서도 `http://localhost:5173`을 기본값으로 사용하고 있습니다

**따라서:**
- 개발 서버가 기본 포트 5173에서 실행되면 **업데이트 불필요**
- 다른 포트를 사용하면 **Supabase Redirect URLs 업데이트 필요**

## 🧪 테스트

### 로컬 개발 환경에서 테스트:

1. **개발 서버 실행:**
   ```bash
   npm run dev
   ```

2. **브라우저에서 접속:**
   - `http://localhost:5173/` (또는 실제 사용 중인 포트)

3. **회원가입 테스트:**
   - 새 계정으로 회원가입
   - 이메일 확인 링크 클릭
   - `/auth/confirm` 페이지로 리디렉션되는지 확인

4. **문제 발생 시:**
   - 브라우저 콘솔 확인 (F12)
   - "Invalid redirect URL" 오류가 나타나면 Supabase Redirect URLs 확인

## 💡 권장 사항

1. **기본 포트(5173) 사용 권장**
   - 대부분의 경우 기본 포트로 충분합니다
   - 포트 충돌이 발생하면 다른 포트 사용 가능

2. **와일드카드 사용**
   - `http://localhost:5173/**` 형식으로 설정하면 모든 경로 허용
   - `/auth/confirm` 경로도 자동으로 포함됨

3. **로컬 개발만 사용하는 경우**
   - 로컬 개발 환경에서만 테스트한다면 `http://localhost:5173/**` 하나만 있어도 충분합니다
   - 프로덕션 URL은 반드시 필요합니다

## ✅ 최종 확인

**Supabase Redirect URLs에 다음이 포함되어 있는지 확인:**

- [ ] `http://localhost:5173/**` (또는 실제 사용 중인 포트)
- [ ] `https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/**`
- [ ] `https://*-pklabs2021s-projects.vercel.app/**`

**로컬 개발만 하는 경우:**
- 첫 번째 URL만 있어도 됩니다

**프로덕션 배포도 하는 경우:**
- 세 개 모두 필요합니다


# 환경 변수 설정 가이드

이 가이드는 OpenAI API 키를 환경 변수로 설정하는 방법을 단계별로 설명합니다.

## 📋 목차
1. [OpenAI API 키 발급하기](#1-openai-api-키-발급하기)
2. [.env 파일 생성하기](#2-env-파일-생성하기)
3. [환경 변수 확인하기](#3-환경-변수-확인하기)
4. [문제 해결](#4-문제-해결)

---

## 1. OpenAI API 키 발급하기

### 1.1 OpenAI 웹사이트 접속
1. 브라우저에서 https://platform.openai.com 접속
2. 계정이 없다면 회원가입, 있다면 로그인

### 1.2 API 키 생성
1. 로그인 후 우측 상단 프로필 아이콘 클릭
2. "API keys" 또는 "View API keys" 클릭
3. "Create new secret key" 버튼 클릭
4. 키 이름 입력 (선택사항, 예: "my-speaking-ai")
5. "Create secret key" 클릭
6. **중요**: 생성된 API 키를 즉시 복사하세요! (한 번만 표시됩니다)
   - 형식: `sk-proj-...` 또는 `sk-...`로 시작

### 1.3 API 키 형식 예시
```
sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

## 2. .env 파일 생성하기

### 방법 1: 터미널에서 생성 (Mac/Linux)

#### 2.1 프로젝트 디렉토리로 이동
```bash
cd /Users/pklabs/my-speaking-ai
```

#### 2.2 .env 파일 생성
```bash
# 방법 A: echo 명령어 사용
echo "OPENAI_API_KEY=여기에_실제_API_키_붙여넣기" > .env

# 방법 B: cat 명령어 사용 (여러 줄 작성 가능)
cat > .env << 'EOF'
OPENAI_API_KEY=여기에_실제_API_키_붙여넣기
EOF
```

**예시:**
```bash
echo "OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz" > .env
```

### 방법 2: VS Code / Cursor에서 생성

#### 2.1 새 파일 생성
1. VS Code/Cursor에서 프로젝트 열기
2. 좌측 파일 탐색기에서 프로젝트 루트(`my-speaking-ai`) 선택
3. 새 파일 버튼 클릭 (또는 `Cmd+N` / `Ctrl+N`)
4. 파일 이름 입력: `.env` (앞에 점 포함!)

#### 2.2 파일 내용 작성
파일에 다음 내용을 입력:

```env
OPENAI_API_KEY=sk-proj-여기에_실제_API_키_붙여넣기
```

**예시:**
```env
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

#### 2.3 저장
- `Cmd+S` (Mac) 또는 `Ctrl+S` (Windows/Linux)로 저장

### 방법 3: 텍스트 에디터에서 생성

#### 2.1 텍스트 에디터 열기
- Mac: TextEdit
- Windows: 메모장
- Linux: gedit, nano 등

#### 2.2 내용 작성
```env
OPENAI_API_KEY=sk-proj-여기에_실제_API_키_붙여넣기
```

#### 2.3 저장
1. "다른 이름으로 저장" 선택
2. 파일 이름: `.env` (앞에 점 포함!)
3. 파일 형식: "모든 파일" 또는 "텍스트"
4. 저장 위치: `/Users/pklabs/my-speaking-ai` (프로젝트 루트)

---

## 3. 환경 변수 확인하기

### 3.1 파일이 생성되었는지 확인
터미널에서:
```bash
cd /Users/pklabs/my-speaking-ai
ls -la | grep .env
```

`.env` 파일이 보여야 합니다.

### 3.2 파일 내용 확인
```bash
cat .env
```

다음과 같이 표시되어야 합니다:
```
OPENAI_API_KEY=sk-proj-abc123def456ghi789...
```

**⚠️ 주의사항:**
- API 키 앞뒤에 따옴표(`"` 또는 `'`)가 없어야 합니다
- 등호(`=`) 앞뒤에 공백이 없어야 합니다
- API 키에 공백이나 줄바꿈이 없어야 합니다

### 3.3 올바른 형식 vs 잘못된 형식

✅ **올바른 형식:**
```env
OPENAI_API_KEY=sk-proj-abc123def456ghi789
```

❌ **잘못된 형식들:**
```env
# 따옴표 사용 (불필요)
OPENAI_API_KEY="sk-proj-abc123def456ghi789"

# 공백 포함
OPENAI_API_KEY = sk-proj-abc123def456ghi789

# 줄바꿈 포함
OPENAI_API_KEY=sk-proj-abc123def456
ghi789

# 주석과 함께 (주석은 별도 줄에)
OPENAI_API_KEY=sk-proj-abc123def456ghi789 # 내 API 키
```

---

## 4. 문제 해결

### 4.1 서버 재시작
`.env` 파일을 생성하거나 수정한 후에는 **반드시 서버를 재시작**해야 합니다:

```bash
# 현재 실행 중인 서버 중지 (Ctrl+C)
# 그 다음 다시 시작
npm run dev
```

### 4.2 환경 변수가 로드되지 않는 경우

#### 확인 사항:
1. `.env` 파일이 프로젝트 루트에 있는지 확인
   ```bash
   pwd  # 현재 디렉토리 확인
   ls -la .env  # .env 파일 확인
   ```

2. 파일 이름이 정확한지 확인
   - `.env` (앞에 점 포함)
   - `.env.local`, `.env.development` 등은 사용하지 않음

3. 파일 내용 형식 확인
   ```bash
   cat .env
   ```

4. 서버 재시작 확인
   - `.env` 파일 변경 후 서버를 재시작했는지 확인

### 4.3 일반적인 오류 메시지

#### "OpenAI API key not configured"
- `.env` 파일이 없거나
- `OPENAI_API_KEY`가 설정되지 않았거나
- 서버를 재시작하지 않았을 가능성

**해결:**
1. `.env` 파일 생성 확인
2. 파일 내용 확인
3. 서버 재시작

#### "Invalid API key"
- API 키가 잘못되었거나
- API 키가 만료되었을 가능성

**해결:**
1. OpenAI 플랫폼에서 새 API 키 생성
2. `.env` 파일 업데이트
3. 서버 재시작

---

## 5. 보안 주의사항

### ⚠️ 중요:
1. **`.env` 파일은 절대 Git에 커밋하지 마세요!**
   - 이미 `.gitignore`에 포함되어 있지만 확인하세요
   - API 키가 공개되면 누구나 사용할 수 있습니다

2. **API 키를 공유하지 마세요**
   - 다른 사람과 공유하지 않기
   - 공개 저장소에 올리지 않기

3. **API 키를 코드에 직접 작성하지 마세요**
   - 항상 환경 변수로 관리
   - `.env` 파일 사용

---

## 6. 빠른 참조

### .env 파일 위치
```
/Users/pklabs/my-speaking-ai/.env
```

### .env 파일 내용
```env
OPENAI_API_KEY=sk-proj-여기에_실제_API_키
```

### 서버 재시작
```bash
npm run dev
```

### 파일 확인
```bash
cat .env
```

---

---

## 7. Supabase 리디렉션 URL 설정

이메일 인증 후 리디렉션이 제대로 작동하도록 Supabase에서 리디렉션 URL을 설정해야 합니다.

### 7.1 Supabase 대시보드에서 설정

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택

2. **URL Configuration 페이지로 이동**
   - 좌측 메뉴에서 "Authentication" 클릭
   - "URL Configuration" 탭 선택

3. **Site URL 설정**
   - **Site URL**: 프로덕션 URL 설정
     - 예: `https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/`
     - **중요**: URL 끝에 슬래시(`/`)를 포함해야 합니다
   - 이 URL은 기본 리디렉션 URL로 사용됩니다
   - 이메일 인증 링크가 이 URL을 기반으로 생성됩니다

4. **Redirect URLs 추가**
   - "Redirect URLs" 섹션에서 다음 URL들을 추가:
   
   **로컬 개발용:**
   ```
   http://localhost:5173/**
   ```
   
   **Vercel 프로덕션용:**
   ```
   https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/**
   ```
   
   **Vercel 프리뷰 URL용 (와일드카드):**
   ```
   https://*-pklabs2021s-projects.vercel.app/**
   ```
   
   > **참고**: `**`는 모든 경로를 포함하는 와일드카드입니다.

5. **이메일 템플릿 확인 및 수정 (중요!)**
   - Supabase 대시보드 → Authentication → Email Templates
   - "Confirm signup" 템플릿 선택
   - 이메일 본문에서 링크 부분 확인:
   
   **권장 설정:**
   ```html
   <a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">
     Confirm your email
   </a>
   ```
   
   또는:
   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
     Confirm your email
   </a>
   ```
   
   **주의사항:**
   - `{{ .SiteURL }}`만 사용하면 Site URL로만 리디렉션됩니다
   - `{{ .RedirectTo }}`를 사용하면 `signUp` 함수에서 설정한 `emailRedirectTo` 값이 사용됩니다
   - 현재 코드는 `/auth/confirm`로 리디렉션하도록 설정되어 있으므로, `{{ .RedirectTo }}` 사용을 권장합니다

### 7.2 환경 변수 설정 (선택사항)

Vercel 배포 시 환경 변수를 설정하면 더 유연하게 관리할 수 있습니다:

**Vercel 대시보드에서 환경 변수 설정:**
1. Vercel 프로젝트 설정으로 이동
2. "Environment Variables" 섹션으로 이동
3. 다음 변수 추가:

```
PUBLIC_SITE_URL=https://my-speaking-16835l739-pklabs2021s-projects.vercel.app
```

**로컬 개발용 `.env` 파일에 추가:**
```env
PUBLIC_SITE_URL=http://localhost:5173
```

> **참고**: 환경 변수를 설정하지 않아도 앱은 자동으로 현재 URL을 사용합니다.

### 7.3 이메일 인증 흐름

1. 사용자가 회원가입
2. Supabase가 인증 이메일 전송
3. 사용자가 이메일의 링크 클릭
4. Supabase가 `/auth/confirm` 페이지로 리디렉션
5. 앱이 토큰을 확인하고 사용자 인증 완료
6. 홈 페이지로 자동 리디렉션

### 7.4 문제 해결

**이메일 인증 후 Vercel SSO 로그인 페이지로 리디렉션되는 경우:**

이 문제는 Supabase가 리디렉션 URL을 처리할 때 발생할 수 있습니다. 다음을 확인하세요:

1. **Supabase 대시보드에서 Site URL 확인**
   - Site URL이 정확한 프로덕션 URL로 설정되어 있는지 확인
   - 예: `https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/`
   - **중요**: Site URL에 슬래시(`/`)를 포함해야 합니다

2. **Redirect URLs 목록 확인**
   - 다음 URL들이 정확히 추가되어 있는지 확인:
     ```
     http://localhost:5173/**
     https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/**
     https://*-pklabs2021s-projects.vercel.app/**
     ```
   - **중요**: URL 끝에 `/**` 와일드카드를 포함해야 합니다

3. **이메일 템플릿 확인**
   - Supabase 대시보드 → Authentication → Email Templates
   - "Confirm signup" 템플릿 확인
   - 링크가 `{{ .RedirectTo }}` 또는 `{{ .SiteURL }}/auth/confirm` 형식인지 확인
   - `{{ .SiteURL }}`만 사용하는 경우 `{{ .RedirectTo }}`로 변경 권장

4. **브라우저 콘솔 확인**
   - 회원가입 시 콘솔에 "Email redirect URL: ..." 로그 확인
   - 리디렉션 URL이 올바른 절대 URL인지 확인

**"Invalid redirect URL" 오류가 발생하는 경우:**
1. Supabase Redirect URLs 목록에 해당 URL이 추가되어 있는지 확인
2. URL 형식이 정확한지 확인 (http/https, 슬래시 포함 여부)
3. 와일드카드 패턴이 올바른지 확인
4. Site URL과 Redirect URLs가 일치하는지 확인

---

## 도움이 필요하신가요?

문제가 계속되면:
1. 터미널의 서버 로그 확인
2. 브라우저 콘솔 확인
3. `.env` 파일 내용 재확인
4. 서버 재시작 확인
5. Supabase 대시보드에서 URL 설정 확인


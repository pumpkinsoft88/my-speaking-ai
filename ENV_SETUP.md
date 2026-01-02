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

## 도움이 필요하신가요?

문제가 계속되면:
1. 터미널의 서버 로그 확인
2. 브라우저 콘솔 확인
3. `.env` 파일 내용 재확인
4. 서버 재시작 확인


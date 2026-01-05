# 리디렉션 문제 해결 가이드 (단계별)

## 🔍 문제 진단부터 시작

현재 어떤 문제가 발생하는지 정확히 파악해야 합니다.

### 현재 상황 확인

1. **이메일 링크 형식 확인**
   - 이메일의 링크를 마우스 오른쪽 클릭 → "링크 주소 복사"
   - 링크가 어떤 형식인지 확인:
     - ✅ 올바른 형식: `https://...vercel.app/auth/confirm?token_hash=...&type=email`
     - ❌ 잘못된 형식: `https://...vercel.app/?token_hash=...&type=email` (홈만 있음)

2. **링크 클릭 시 어디로 가는지 확인**
   - `/auth/confirm` 페이지로 가는가?
   - Vercel SSO 로그인 페이지로 가는가?
   - 다른 곳으로 가는가?

## 📋 단계별 해결 방법

### 1단계: Supabase 이메일 템플릿 확인 및 수정

**가장 중요한 단계입니다!**

#### 1-1. Supabase 대시보드 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택

#### 1-2. 이메일 템플릿 확인
1. 좌측 메뉴: **Authentication** → **Email Templates**
2. **"Confirm signup"** 템플릿 선택
3. **"Source"** 탭 클릭
4. 현재 템플릿 내용 확인

#### 1-3. 템플릿 수정 (필수)

**현재 템플릿에 무엇이 있는지 확인:**

**문제가 있는 경우:**
- `{{.ConfirmationURL }}` 사용
- `{{ .SiteURL }}`만 사용 (경로 없음)
- 여러 개의 링크가 있음

**올바른 템플릿 (최종):**
```html
<!-- <h2>Confirm your signup</h2> -->

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your mail</a></p>
```

**수정 방법:**
1. 기존 링크 모두 삭제
2. 위의 템플릿 내용으로 교체
3. **"Save changes"** 클릭

#### 1-4. 확인
- 템플릿이 저장되었는지 확인
- "Preview" 탭에서 링크가 올바른지 확인

---

### 2단계: Supabase URL 설정 확인

#### 2-1. Site URL 확인
1. **Authentication** → **URL Configuration**
2. **Site URL** 필드 확인:
   ```
   https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/
   ```
   ⚠️ **중요**: URL 끝에 슬래시(`/`) 포함 필수!

#### 2-2. Redirect URLs 확인
**Redirect URLs** 섹션에서 다음 3개 URL이 모두 추가되어 있는지 확인:

```
http://localhost:5173/**
https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/**
https://*-pklabs2021s-projects.vercel.app/**
```

⚠️ **중요 사항:**
- 각 URL 끝에 `/**` 와일드카드 포함 필수
- 슬래시 없이 도메인만 입력 (예: `https://...vercel.app/**`)
- 각 URL을 개별적으로 추가

#### 2-3. URL 추가 방법
1. "Redirect URLs" 섹션에서 "+ Add URL" 클릭
2. URL 입력 (예: `https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/**`)
3. "Save" 클릭
4. 나머지 URL들도 동일하게 추가

---

### 3단계: 코드 확인

#### 3-1. 브라우저 콘솔 확인
1. 브라우저 개발자 도구 열기 (F12)
2. **Console** 탭 선택
3. 새 계정으로 회원가입 시도
4. 다음 로그 확인:
   ```
   📧 Email redirect URL: https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/auth/confirm
   ✅ Sign up successful. Email will redirect to: https://...vercel.app/auth/confirm
   ```

**로그가 나타나지 않으면:**
- 코드가 배포되지 않았을 수 있음
- 브라우저 캐시 문제일 수 있음

#### 3-2. 코드 배포 확인
```bash
# Git 상태 확인
git status

# 변경사항 커밋
git add .
git commit -m "Fix email authentication redirect"

# 푸시
git push

# 또는 Vercel CLI로 직접 배포
vercel --prod
```

---

### 4단계: 테스트

#### 4-1. 새 계정으로 회원가입
⚠️ **중요**: 기존 이메일 링크는 이전 설정을 사용할 수 있으므로, **반드시 새 계정으로 테스트**하세요.

#### 4-2. 이메일 확인
1. 이메일 받은 편지함 확인
2. 이메일의 링크를 **마우스 오른쪽 클릭** → "링크 주소 복사"
3. URL을 텍스트 에디터에 붙여넣기
4. 확인:
   - ✅ 올바른 형식: `https://...vercel.app/auth/confirm?token_hash=...&type=email`
   - ❌ 잘못된 형식: `https://...vercel.app/?token_hash=...&type=email`

#### 4-3. 링크 클릭 테스트
1. 이메일 링크 클릭
2. 예상 결과:
   - `/auth/confirm` 페이지로 리디렉션
   - "이메일 인증 중..." 메시지 표시
   - 인증 성공 후 홈으로 리디렉션

3. 문제 발생 시:
   - Vercel SSO 로그인 페이지로 가는 경우 → 이메일 템플릿 재확인
   - 다른 페이지로 가는 경우 → Redirect URLs 확인

---

## 🔧 문제별 해결 방법

### 문제 1: 이메일 링크에 `/auth/confirm` 경로가 없음

**증상:**
- 링크: `https://...vercel.app/?token_hash=...&type=email`

**해결:**
1. Supabase 이메일 템플릿 확인
2. `{{ .SiteURL }}/auth/confirm` 명시적으로 사용
3. 템플릿 저장 후 새 계정으로 테스트

### 문제 2: Vercel SSO 로그인 페이지로 리디렉션됨

**증상:**
- 링크 클릭 시 `https://vercel.com/login?next=...`로 이동

**해결:**
1. Supabase Redirect URLs 확인
2. `https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/**` 추가 확인
3. 이메일 템플릿에서 `/auth/confirm` 경로 명시

### 문제 3: "Invalid redirect URL" 오류

**증상:**
- 브라우저 콘솔에 오류 메시지 표시

**해결:**
1. Supabase Redirect URLs에 해당 URL 추가
2. URL 형식 확인 (와일드카드 포함)
3. Site URL과 일치하는지 확인

### 문제 4: 코드 변경사항이 반영되지 않음

**증상:**
- 브라우저 콘솔에 로그가 나타나지 않음

**해결:**
1. 코드 배포 확인
2. 브라우저 캐시 삭제
3. 시크릿 모드에서 테스트

---

## ✅ 최종 체크리스트

다음 항목을 모두 확인하세요:

- [ ] Supabase 이메일 템플릿이 `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` 형식
- [ ] 이메일 템플릿에 `{{.ConfirmationURL }}` 사용하지 않음
- [ ] 이메일 템플릿에 하나의 링크만 있음
- [ ] Supabase Site URL이 `https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/` (슬래시 포함)
- [ ] Supabase Redirect URLs에 3개 URL 모두 추가됨
- [ ] 코드가 배포됨
- [ ] 브라우저 콘솔에 올바른 리디렉션 URL 로그 표시
- [ ] 새 계정으로 테스트함
- [ ] 이메일 링크에 `/auth/confirm` 경로 포함됨
- [ ] 링크 클릭 시 `/auth/confirm` 페이지로 이동함

---

## 🆘 여전히 문제가 있으면

다음 정보를 확인하세요:

1. **이메일 링크 전체 URL** (복사해서 확인)
2. **브라우저 콘솔 로그** (F12 → Console)
3. **Supabase 이메일 템플릿 현재 내용** (스크린샷)
4. **Supabase Redirect URLs 목록** (스크린샷)

이 정보들을 확인하면 더 정확한 해결 방법을 제시할 수 있습니다.


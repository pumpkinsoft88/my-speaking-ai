# Supabase URL 설정 가이드 (현재 프로젝트 기준)

## 📍 현재 프로젝트 정보

**프로덕션 URL:**
```
https://my-speaking-16835l739-pklabs2021s-projects.vercel.app
```

## 🔧 Supabase 대시보드 설정

### 1. Site URL 설정

**위치:** Supabase 대시보드 → Authentication → URL Configuration

**설정 값:**
```
https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/
```

⚠️ **중요 사항:**
- URL 끝에 **슬래시(`/`) 포함 필수**
- `https://` 프로토콜 포함
- 도메인 이름 정확히 입력

### 2. Redirect URLs 설정

**위치:** Supabase 대시보드 → Authentication → URL Configuration → Redirect URLs

**추가해야 할 URL 목록:**

#### 로컬 개발용:
```
http://localhost:5173/**
```

#### 프로덕션용:
```
https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/**
```

#### Vercel 프리뷰 URL용 (와일드카드):
```
https://*-pklabs2021s-projects.vercel.app/**
```

⚠️ **중요 사항:**
- 각 URL 끝에 `/**` 와일드카드 포함 필수
- `https://` 또는 `http://` 프로토콜 포함
- 슬래시 없이 도메인만 입력 (예: `https://...vercel.app/**`)
- 각 URL을 개별적으로 추가

## 📋 설정 체크리스트

### Site URL:
- [ ] `https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/` (슬래시 포함)

### Redirect URLs:
- [ ] `http://localhost:5173/**`
- [ ] `https://my-speaking-16835l739-pklabs2021s-projects.vercel.app/**`
- [ ] `https://*-pklabs2021s-projects.vercel.app/**`

## 🔍 설정 확인 방법

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **URL Configuration 페이지로 이동**
   - 좌측 메뉴: Authentication
   - "URL Configuration" 탭 클릭

3. **Site URL 확인**
   - "Site URL" 필드 확인
   - 값이 정확한지 확인

4. **Redirect URLs 확인**
   - "Redirect URLs" 섹션 확인
   - 위의 3개 URL이 모두 추가되어 있는지 확인

## ⚠️ 주의사항

1. **슬래시 위치:**
   - Site URL: 끝에 슬래시 포함 (`/`)
   - Redirect URLs: 슬래시 없이 `/**` 와일드카드 사용

2. **프로토콜:**
   - 프로덕션: `https://` 사용
   - 로컬: `http://` 사용

3. **와일드카드:**
   - Redirect URLs에는 반드시 `/**` 포함
   - 이것이 없으면 특정 경로로만 리디렉션됨

## 🧪 테스트

설정 후 다음을 확인하세요:

1. **새 계정으로 회원가입**
2. **이메일 링크 확인:**
   - 링크가 `/auth/confirm` 경로를 포함하는지 확인
3. **링크 클릭:**
   - `/auth/confirm` 페이지로 리디렉션되는지 확인
   - Vercel SSO 로그인 페이지로 가지 않는지 확인


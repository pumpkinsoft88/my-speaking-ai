# Supabase 로그 확인 방법

## 📋 Supabase 로그 확인 단계별 가이드

### 1단계: Supabase 대시보드 접속

1. **브라우저에서 Supabase 대시보드 열기**
   - https://supabase.com/dashboard 접속
   - 또는 https://app.supabase.com 접속

2. **로그인**
   - Supabase 계정으로 로그인

3. **프로젝트 선택**
   - 프로젝트 목록에서 해당 프로젝트 클릭
   - 프로젝트 대시보드로 이동

### 2단계: 로그 메뉴 찾기

1. **좌측 사이드바 확인**
   - 화면 왼쪽에 메뉴가 있습니다
   - 아래로 스크롤하여 "Logs" 메뉴 찾기

2. **Logs 메뉴 클릭**
   - "Logs" 메뉴를 클릭하면 하위 메뉴가 나타납니다:
     - **Auth Logs** (인증 관련 로그)
     - **Postgres Logs** (데이터베이스 로그)
     - **API Logs** (API 관련 로그)
     - **Realtime Logs** (실시간 관련 로그)

### 3단계: Auth Logs 확인

1. **Auth Logs 클릭**
   - "Logs" → "Auth Logs" 클릭
   - 인증 관련 로그가 표시됩니다

2. **로그 화면 구성**
   - 상단: 시간 필터 (예: "Last 1 hour", "Last 24 hours", "Last 7 days")
   - 중앙: 로그 목록 (시간순으로 정렬)
   - 각 로그 항목:
     - 시간 (Timestamp)
     - 로그 레벨 (Level): Info, Warning, Error 등
     - 메시지 (Message)
     - 상세 정보 (Details)

### 4단계: 에러 로그 찾기

1. **필터 사용**
   - 로그 화면 상단에 필터 옵션이 있을 수 있습니다
   - "Error" 또는 "Warning" 레벨만 필터링

2. **최근 로그 확인**
   - 가장 최근 로그부터 확인
   - 회원가입을 시도한 시간대의 로그 확인

3. **에러 로그 식별**
   - 빨간색으로 표시된 로그 (Error 레벨)
   - "SMTP", "email", "send", "authentication" 등의 키워드가 포함된 로그

### 5단계: 에러 메시지 확인

1. **로그 항목 클릭**
   - 에러 로그 항목을 클릭하면 상세 정보가 표시됩니다

2. **확인해야 할 정보**
   - **에러 메시지**: 정확한 오류 내용
   - **상세 정보**: 추가 컨텍스트
   - **스택 트레이스**: 에러 발생 위치

3. **주요 에러 메시지 예시**
   - `535 Authentication failed` → 인증 실패
   - `550 Access denied` → 접근 거부
   - `Connection timeout` → 연결 시간 초과
   - `Rate limit exceeded` → 발신 한도 초과

## 🔍 로그에서 찾아야 할 키워드

다음 키워드로 검색하거나 확인하세요:

- `SMTP`
- `email`
- `send`
- `confirmation`
- `authentication`
- `535` (인증 실패 오류 코드)
- `550` (접근 거부 오류 코드)
- `timeout`
- `connection`
- `failed`

## 📸 로그 확인 스크린샷 가이드

### 화면 구성:

```
┌─────────────────────────────────────┐
│  Supabase Dashboard                │
├──────────┬──────────────────────────┤
│          │  Logs                     │
│  Sidebar │  ┌────────────────────┐  │
│          │  │ Auth Logs          │  │
│  Logs    │  │ Postgres Logs      │  │
│  └─ Auth │  │ API Logs           │  │
│     Logs │  │ Realtime Logs      │  │
│          │  └────────────────────┘  │
│          │                           │
│          │  [Time Filter]           │
│          │  ┌────────────────────┐  │
│          │  │ 2024-01-01 12:00   │  │
│          │  │ ERROR: SMTP...     │  │
│          │  │ [Details]          │  │
│          │  └────────────────────┘  │
│          │  ┌────────────────────┐  │
│          │  │ 2024-01-01 11:59   │  │
│          │  │ INFO: ...          │  │
│          │  └────────────────────┘  │
└──────────┴──────────────────────────┘
```

## 💡 로그 확인 팁

### 1. 시간 필터 조정
- 회원가입을 시도한 시간대에 맞춰 필터 조정
- 예: "Last 1 hour" 또는 "Last 24 hours"

### 2. 검색 기능 사용
- 로그 화면에 검색 기능이 있다면 활용
- "SMTP", "email", "error" 등으로 검색

### 3. 로그 레벨 필터링
- Error 레벨만 표시하여 에러만 확인
- Warning 레벨도 함께 확인

### 4. 로그 상세 정보 확인
- 각 로그 항목을 클릭하여 상세 정보 확인
- 스택 트레이스 확인

## 🔗 빠른 링크

### 직접 링크 (프로젝트 선택 후):
- Auth Logs: `https://supabase.com/dashboard/project/[PROJECT_ID]/logs/auth`
- Postgres Logs: `https://supabase.com/dashboard/project/[PROJECT_ID]/logs/postgres`
- API Logs: `https://supabase.com/dashboard/project/[PROJECT_ID]/logs/api`

### 일반 링크:
- 대시보드: https://supabase.com/dashboard
- 프로젝트 선택 후 Logs 메뉴 클릭

## 📋 체크리스트

### 로그 확인 전:
- [ ] Supabase 대시보드 접속
- [ ] 프로젝트 선택
- [ ] Logs 메뉴 찾기

### 로그 확인 중:
- [ ] Auth Logs 클릭
- [ ] 시간 필터 조정 (회원가입 시도 시간대)
- [ ] Error 레벨 로그 확인
- [ ] "SMTP", "email", "send" 키워드 검색

### 에러 메시지 확인:
- [ ] 에러 로그 항목 클릭
- [ ] 에러 메시지 확인
- [ ] 상세 정보 확인
- [ ] 에러 코드 확인 (535, 550 등)

## 🚨 일반적인 에러 메시지 및 해결

### `535 Authentication failed`
**의미:** 인증 실패
**원인:** Username 또는 Password 오류
**해결:** 
- Username: `bigbangceo@naver.com` (전체 이메일 주소)
- Password 재확인

### `550 Access denied` 또는 `550 IMAP/SMTP not enabled`
**의미:** 접근 거부
**원인:** 네이버 메일 IMAP/SMTP 사용 설정 미활성화
**해결:** 네이버 메일 → 환경설정 → POP3/IMAP 설정 → "IMAP/SMTP 사용함" 선택

### `Connection timeout`
**의미:** 연결 시간 초과
**원인:** 네트워크 문제 또는 SMTP Host 오류
**해결:** 
- SMTP Host: `smtp.naver.com` 확인
- 네트워크 연결 확인

### `Rate limit exceeded`
**의미:** 발신 한도 초과
**원인:** 이메일 발신 한도 초과
**해결:** 
- Rate Limits → "Rate limit for sending emails" 값 증가
- 또는 다음 시간까지 대기

## ✅ 다음 단계

1. **로그 확인**
   - Auth Logs에서 에러 메시지 확인

2. **에러 메시지 복사**
   - 에러 메시지를 복사하여 저장

3. **에러 메시지 공유**
   - 에러 메시지를 알려주시면 더 정확한 해결 방법을 제시할 수 있습니다

## 💡 추가 팁

### 로그를 찾을 수 없는 경우:
1. **프로젝트가 올바른지 확인**
   - 다른 프로젝트를 선택했을 수 있습니다

2. **권한 확인**
   - 프로젝트에 대한 접근 권한이 있는지 확인

3. **시간 필터 조정**
   - 더 넓은 시간 범위로 필터 조정 (예: "Last 7 days")

### 로그가 너무 많은 경우:
1. **필터 사용**
   - Error 레벨만 필터링
   - 특정 키워드로 검색

2. **시간 범위 축소**
   - 회원가입을 시도한 정확한 시간대로 필터 조정

## 🔗 참고

- [Supabase 로그 문서](https://supabase.com/docs/guides/platform/logs)
- [Supabase 대시보드](https://supabase.com/dashboard)

로그를 확인하신 후, 에러 메시지를 알려주시면 더 정확한 해결 방법을 제시할 수 있습니다!


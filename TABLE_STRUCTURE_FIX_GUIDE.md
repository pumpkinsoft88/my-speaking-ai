# 테이블 구조 일치 및 대화 저장 문제 해결 가이드

## 🚨 문제: 테이블 구조 불일치로 인한 대화 저장 실패

## ✅ 해결 방법

### 1단계: 통합 SQL 스크립트 실행 (필수!)

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 좌측 메뉴: **SQL Editor** 클릭
   - "New query" 클릭

3. **스크립트 실행**
   - `fix_table_structure.sql` 파일의 내용을 복사하여 붙여넣기
   - "Run" 버튼 클릭
   - 성공 메시지 확인

### 2단계: 확인 사항

#### 테이블 구조 확인

```sql
-- profiles 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- conversations 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'conversations'
ORDER BY ordinal_position;
```

**예상되는 컬럼:**

**profiles 테이블:**
- `id` (UUID, PRIMARY KEY)
- `email` (TEXT, NOT NULL)
- `name` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

**conversations 테이블:**
- `id` (UUID, PRIMARY KEY)
- `user_id` (UUID, NOT NULL, FOREIGN KEY → profiles.id)
- `title` (TEXT)
- `messages` (JSONB, NOT NULL)
- `language` (TEXT, NOT NULL)
- `level` (TEXT)
- `practice_mode` (TEXT) ⚠️ **스네이크 케이스**
- `practice_content` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

#### 뷰 확인

```sql
-- conversations_with_user 뷰 확인
SELECT * FROM conversations_with_user LIMIT 5;
```

#### 프로필 확인

```sql
-- 모든 프로필 확인
SELECT id, email, name, created_at FROM profiles;

-- 현재 사용자 프로필 확인 (인증 필요)
SELECT * FROM profiles WHERE id = auth.uid();
```

### 3단계: 테스트

1. **대화 시작**
   - 앱에서 대화 시작
   - 몇 마디 대화 나누기

2. **대화 종료**
   - 대화 종료 버튼 클릭
   - 브라우저 콘솔(F12)에서 확인:
     - `✅ 대화 저장 성공` 메시지 확인
     - 에러가 있으면 에러 메시지 확인

3. **대화 기록 확인**
   - 대화 기록 탭에서 저장된 대화 확인
   - Supabase 대시보드 → Table Editor → conversations 테이블에서 확인

## 🔍 문제 진단

### 브라우저 콘솔 확인

1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭 확인
3. 다음 로그 확인:
   - `💾 대화 저장 시도` - 저장 시작
   - `✅ 프로필 확인 완료` - 프로필 존재 확인
   - `💾 대화 저장 중...` - 저장 진행 중
   - `✅ 대화 저장 성공` - 저장 성공
   - `❌ 대화 저장 실패` - 저장 실패 (에러 코드 확인)

### 일반적인 에러 코드

- **42501**: RLS 정책 위반 → `fix_table_structure.sql` 실행 필요
- **23503**: 외래키 제약조건 위반 → 프로필이 없음 → 프로필 자동 생성 확인
- **42703**: 컬럼이 존재하지 않음 → 테이블 구조 불일치 → `fix_table_structure.sql` 실행 필요
- **PGRST116**: 레코드 없음 → 정상 (프로필 자동 생성됨)
- **PGRST301**: 네트워크 오류 → 자동 재시도됨

## 📋 주요 개선 사항

### 1. 테이블 구조 통합
- `profiles` 테이블 구조 확인 및 수정
- `conversations` 테이블 구조 확인 및 수정
- 모든 필요한 컬럼 자동 추가

### 2. 뷰 재생성
- `conversations_with_user` 뷰 재생성
- conversations와 profiles JOIN 확인

### 3. 프로필 자동 생성
- 기존 사용자 프로필 자동 생성
- 새 사용자 프로필 자동 생성 트리거 확인

### 4. RLS 정책 재설정
- 모든 RLS 정책 재생성
- 권한 문제 해결

### 5. 에러 처리 개선
- 명확한 에러 메시지 제공
- 에러 코드별 해결 방법 안내
- 테이블 구조 오류 감지 및 안내

## 💡 추가 문제 해결

### 문제 1: 여전히 저장되지 않음

**확인 사항:**
- Supabase 환경 변수가 올바르게 설정되었는지 확인
- 사용자가 로그인되어 있는지 확인
- 브라우저 콘솔의 에러 메시지 확인

**해결:**
- `fix_table_structure.sql` 다시 실행
- Supabase 대시보드에서 테이블 구조 확인
- 프로필이 존재하는지 확인

### 문제 2: 테이블 구조 오류

**확인 사항:**
- Supabase 대시보드 → Table Editor → conversations
- 컬럼 목록 확인

**해결:**
- `fix_table_structure.sql` 실행
- 누락된 컬럼 자동 추가됨

### 문제 3: 프로필이 없음

**확인 사항:**
- Supabase 대시보드 → Table Editor → profiles
- 현재 사용자의 프로필 확인

**해결:**
- `fix_table_structure.sql`의 프로필 생성 부분 실행
- 로그아웃 후 다시 로그인

## 📞 지원

문제가 계속되면 다음 정보를 확인하세요:
1. 브라우저 콘솔의 에러 메시지
2. Supabase 로그의 에러 메시지
3. 에러 코드 (42501, 23503, 42703 등)
4. 테이블 구조 확인 결과


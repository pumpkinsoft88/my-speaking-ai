# 대화 저장 문제 해결 가이드

## 🚨 문제: 대화 내용이 Supabase에 저장되지 않음

## ✅ 해결 방법

### 1단계: Supabase SQL 스크립트 실행 (필수!)

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 좌측 메뉴: **SQL Editor** 클릭
   - "New query" 클릭

3. **스크립트 실행**
   - `fix_conversation_save.sql` 파일의 내용을 복사하여 붙여넣기
   - "Run" 버튼 클릭
   - 성공 메시지 확인

### 2단계: 코드 변경사항 확인

다음 파일들이 수정되었습니다:
- ✅ `src/lib/supabase/conversations.js` - 메시지 형식 검증 및 에러 처리 개선
- ✅ `src/lib/components/RealtimeConversation.svelte` - 저장 재시도 로직 추가
- ✅ `fix_conversation_save.sql` - RLS 정책 및 테이블 구조 수정 스크립트

### 3단계: 배포

```bash
# 변경사항 확인
git status

# 변경사항 추가
git add src/lib/supabase/conversations.js
git add src/lib/components/RealtimeConversation.svelte
git add fix_conversation_save.sql
git add CONVERSATION_SAVE_FIX_GUIDE.md

# 커밋
git commit -m "Fix conversation save issue: Add message validation and retry logic"

# 푸시 및 배포
git push
```

### 4단계: 테스트

1. **대화 시작**
   - 앱에서 대화 시작
   - 몇 마디 대화 나누기

2. **대화 종료**
   - 대화 종료 버튼 클릭
   - 저장 성공 메시지 확인

3. **대화 기록 확인**
   - 대화 기록 탭에서 저장된 대화 확인
   - Supabase 대시보드에서도 확인 가능

## 🔍 문제 진단

### 브라우저 콘솔 확인

1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭 확인
3. 다음 로그 확인:
   - `💾 대화 저장 시도` - 저장 시작
   - `✅ 대화 저장 성공` - 저장 성공
   - `❌ 대화 저장 실패` - 저장 실패 (에러 코드 확인)

### Supabase 로그 확인

1. Supabase 대시보드 → **Logs** → **Postgres Logs**
2. 최근 에러 로그 확인
3. RLS 정책 관련 에러 확인

### 일반적인 에러 코드

- **42501**: RLS 정책 위반 → `fix_conversation_save.sql` 실행 필요
- **23503**: 외래키 제약조건 위반 → 프로필이 없음 → 프로필 자동 생성 확인
- **PGRST116**: 레코드 없음 → 정상 (프로필 자동 생성됨)
- **PGRST301**: 네트워크 오류 → 자동 재시도됨

## 📋 체크리스트

### 즉시 확인:
- [ ] `fix_conversation_save.sql` 스크립트 실행 완료
- [ ] RLS 정책이 올바르게 설정되었는지 확인
- [ ] 프로필이 모든 사용자에게 생성되었는지 확인
- [ ] 코드 변경사항 배포 완료

### 테스트:
- [ ] 새 대화 시작 및 종료 테스트
- [ ] 대화 기록 탭에서 저장 확인
- [ ] Supabase 대시보드에서 데이터 확인
- [ ] 브라우저 콘솔에서 에러 확인

## 💡 주요 개선 사항

### 1. 메시지 형식 검증
- 다양한 메시지 형식 지원 (배열, 문자열, 객체)
- 유효하지 않은 메시지 자동 필터링
- 저장 전 형식 정리

### 2. 에러 처리 개선
- 명확한 에러 메시지 제공
- RLS 정책 오류 감지 및 안내
- 프로필 누락 오류 감지 및 안내

### 3. 재시도 로직
- 네트워크 오류 시 자동 재시도 (최대 2회)
- 지수 백오프 적용
- 재시도 횟수 로깅

### 4. 로깅 강화
- 저장 과정의 모든 단계 로깅
- 에러 발생 시 상세 정보 제공
- 디버깅 용이성 향상

## 🔧 추가 문제 해결

### 문제 1: 여전히 저장되지 않음

**확인 사항:**
- Supabase 환경 변수가 올바르게 설정되었는지 확인
- 사용자가 로그인되어 있는지 확인
- 브라우저 콘솔의 에러 메시지 확인

**해결:**
- `fix_conversation_save.sql` 다시 실행
- Supabase 대시보드에서 RLS 정책 확인
- 프로필이 존재하는지 확인

### 문제 2: RLS 정책 오류

**확인 사항:**
- Supabase 대시보드 → **Authentication** → **Policies**
- `conversations` 테이블의 정책 확인

**해결:**
- `fix_conversation_save.sql` 실행
- 정책이 올바르게 생성되었는지 확인

### 문제 3: 프로필이 없음

**확인 사항:**
- Supabase 대시보드 → **Table Editor** → `profiles`
- 현재 사용자의 프로필 확인

**해결:**
- `fix_conversation_save.sql`의 프로필 생성 부분 실행
- 로그아웃 후 다시 로그인

## 📞 지원

문제가 계속되면 다음 정보를 확인하세요:
1. 브라우저 콘솔의 에러 메시지
2. Supabase 로그의 에러 메시지
3. 에러 코드 (42501, 23503 등)
4. 저장 시도 시점의 네트워크 상태


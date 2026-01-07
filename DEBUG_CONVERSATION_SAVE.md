# 🔍 대화 저장 문제 디버깅 가이드

## 문제: 대화 기록이 Supabase Table에 업데이트되지 않음

## 📋 체크리스트

### 1. 브라우저 콘솔 확인

대화를 종료한 후 브라우저 콘솔(F12)에서 다음 메시지들을 확인하세요:

- [ ] `💾 대화 저장 시작...` - 저장 함수가 호출되었는지 확인
- [ ] `💾 대화 저장 시도 - 사용자 ID: ...` - 사용자 인증 확인
- [ ] `✅ 프로필 확인 완료` 또는 `✅ 프로필 생성 완료` - 프로필 확인
- [ ] `💾 대화 저장 중...` - 실제 저장 시도
- [ ] `✅ 대화 저장 성공` 또는 `❌ 대화 저장 실패` - 최종 결과

### 2. 에러 메시지 확인

콘솔에 에러가 있다면 다음을 확인:

**일반적인 에러:**
- `new row violates foreign-key constraint` → 프로필이 없음
- `permission denied` → RLS 정책 문제
- `relation "conversations" does not exist` → 테이블이 생성되지 않음
- `로그인이 필요합니다` → 세션 만료

### 3. 수동 테스트

브라우저 콘솔에서 직접 테스트:

```javascript
// 1. 사용자 확인
const { data: { user }, error: userError } = await supabase.auth.getUser();
console.log('사용자:', user);
console.log('에러:', userError);

// 2. 프로필 확인
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
console.log('프로필:', profile);
console.log('프로필 에러:', profileError);

// 3. 대화 저장 테스트
const testMessages = [
  {
    role: 'user',
    content: [{ type: 'text', text: '테스트 메시지' }],
    timestamp: new Date().toISOString()
  }
];

const { data, error } = await supabase
  .from('conversations')
  .insert({
    user_id: user.id,
    title: '테스트 대화',
    messages: testMessages,
    language: 'traditional',
    level: 'beginner',
    practice_mode: 'free'
  })
  .select()
  .single();

console.log('저장 결과:', data);
console.log('저장 에러:', error);
```

### 4. Supabase Table Editor에서 확인

1. Supabase 대시보드 → Table Editor
2. `profiles` 테이블 확인
   - 현재 사용자의 프로필이 있는지 확인
   - 없으면 `fix_profiles_and_test.sql` 실행

3. `conversations` 테이블 확인
   - 테이블이 존재하는지 확인
   - RLS가 활성화되어 있는지 확인

### 5. RLS 정책 확인

Supabase SQL Editor에서 실행:

```sql
-- RLS 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'conversations'
ORDER BY policyname;
```

## 🔧 해결 방법

### 방법 1: 프로필 확인 및 생성

```sql
-- 모든 사용자에 대해 프로필 생성
INSERT INTO profiles (id, email, name)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1))
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;
```

### 방법 2: RLS 정책 재생성

```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can create own conversations" ON conversations;

-- 정책 재생성
CREATE POLICY "Users can create own conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

### 방법 3: 테이블 확인

```sql
-- conversations 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'conversations'
ORDER BY ordinal_position;
```

## 📊 일반적인 문제와 해결책

| 문제 | 원인 | 해결책 |
|------|------|--------|
| 프로필 없음 | 트리거가 작동하지 않음 | 프로필 수동 생성 |
| 외래키 오류 | profiles 테이블에 사용자 없음 | 프로필 먼저 생성 |
| 권한 오류 | RLS 정책 문제 | RLS 정책 재생성 |
| 테이블 없음 | SQL이 실행되지 않음 | conversation_tables.sql 실행 |

## ✅ 최종 확인

다음 순서로 확인:

1. ✅ 브라우저 콘솔에서 에러 메시지 확인
2. ✅ `profiles` 테이블에 현재 사용자 프로필이 있는가?
3. ✅ `conversations` 테이블이 존재하는가?
4. ✅ RLS 정책이 올바르게 설정되었는가?
5. ✅ 수동으로 데이터를 삽입할 수 있는가?


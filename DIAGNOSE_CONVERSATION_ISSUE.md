# 🔍 대화 기록 저장 문제 진단 가이드

## 문제: 대화 기록이 Supabase Table Editor에 표시되지 않음

## 📋 체크리스트

### 1. 테이블 존재 확인

Supabase 대시보드 → Table Editor에서 확인:

- [ ] `profiles` 테이블이 존재하는가?
- [ ] `conversations` 테이블이 존재하는가?

**확인 방법:**
```sql
-- Supabase SQL Editor에서 실행
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'conversations');
```

### 2. 사용자 프로필 확인

**가장 중요한 체크!** `profiles` 테이블에 사용자 프로필이 있어야 합니다.

```sql
-- 현재 로그인한 사용자의 프로필 확인
SELECT * FROM profiles;
```

**문제:** `profiles` 테이블에 사용자 프로필이 없으면 `conversations` 테이블에 데이터를 삽입할 수 없습니다 (외래키 제약조건).

**해결 방법:**
```sql
-- 수동으로 프로필 생성 (임시 해결책)
INSERT INTO profiles (id, email, name)
SELECT id, email, split_part(email, '@', 1)
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;
```

### 3. RLS 정책 확인

RLS가 활성화되어 있어도 Table Editor에서는 보여야 합니다 (서비스 역할 키 사용).

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
WHERE tablename IN ('profiles', 'conversations')
ORDER BY tablename, policyname;
```

### 4. 브라우저 콘솔 확인

대화를 종료한 후 브라우저 콘솔(F12)에서 확인:

- [ ] "✅ 대화 저장 성공" 메시지가 있는가?
- [ ] 에러 메시지가 있는가?

**예상되는 에러:**
- `new row violates foreign-key constraint` → profiles 테이블에 사용자 프로필 없음
- `permission denied` → RLS 정책 문제
- `relation "conversations" does not exist` → 테이블이 생성되지 않음

### 5. 데이터 저장 확인

브라우저 콘솔에서 직접 테스트:

```javascript
// 브라우저 콘솔에서 실행
const { data, error } = await supabase
  .from('conversations')
  .select('*')
  .limit(5);

console.log('데이터:', data);
console.log('에러:', error);
```

## 🔧 해결 방법

### 방법 1: 프로필 자동 생성 확인

`conversation_tables.sql`의 트리거가 제대로 작동하는지 확인:

```sql
-- 트리거 확인
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**트리거가 없으면:**
```sql
-- 트리거 재생성
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

### 방법 2: 기존 사용자 프로필 수동 생성

이미 가입한 사용자들의 프로필이 없는 경우:

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

### 방법 3: RLS 정책 재생성

RLS 정책이 제대로 설정되지 않은 경우:

```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can create own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;

-- 정책 재생성
CREATE POLICY "Users can create own conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations"
    ON conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
    ON conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
    ON conversations FOR DELETE
    USING (auth.uid() = user_id);
```

### 방법 4: 테이블 재생성 (최후의 수단)

모든 것이 실패한 경우:

```sql
-- 주의: 이 명령은 모든 데이터를 삭제합니다!
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 그 다음 conversation_tables.sql 전체를 다시 실행
```

## 🧪 테스트 방법

### 1. 수동 테스트

Supabase SQL Editor에서 직접 삽입 테스트:

```sql
-- 현재 사용자 ID 확인 (먼저 로그인해야 함)
SELECT auth.uid();

-- 테스트 데이터 삽입
INSERT INTO conversations (user_id, title, messages, language, level, practice_mode)
VALUES (
    auth.uid(), -- 현재 로그인한 사용자 ID
    '테스트 대화',
    '[{"role": "user", "content": [{"type": "text", "text": "안녕하세요"}]}]'::jsonb,
    'traditional',
    'beginner',
    'free'
)
RETURNING *;
```

### 2. 브라우저 콘솔 테스트

```javascript
// 1. 사용자 확인
const { data: { user } } = await supabase.auth.getUser();
console.log('사용자:', user);

// 2. 프로필 확인
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
console.log('프로필:', profile);

// 3. 대화 저장 테스트
const { data, error } = await supabase
  .from('conversations')
  .insert({
    user_id: user.id,
    title: '테스트',
    messages: [{"role": "user", "content": [{"type": "text", "text": "테스트"}]}],
    language: 'traditional',
    level: 'beginner',
    practice_mode: 'free'
  })
  .select()
  .single();
console.log('저장 결과:', data);
console.log('에러:', error);
```

## 📊 일반적인 문제와 해결책

| 문제 | 원인 | 해결책 |
|------|------|--------|
| 테이블이 없음 | SQL이 실행되지 않음 | `conversation_tables.sql` 실행 |
| 프로필이 없음 | 트리거가 작동하지 않음 | 프로필 수동 생성 또는 트리거 재생성 |
| 외래키 오류 | profiles 테이블에 사용자 없음 | 프로필 먼저 생성 |
| 권한 오류 | RLS 정책 문제 | RLS 정책 재생성 |
| 데이터는 있지만 안 보임 | Table Editor 필터 | 필터 제거 또는 새로고침 |

## ✅ 최종 확인

다음 순서로 확인:

1. ✅ `profiles` 테이블에 현재 사용자 프로필이 있는가?
2. ✅ `conversations` 테이블이 존재하는가?
3. ✅ 브라우저 콘솔에 에러가 있는가?
4. ✅ RLS 정책이 올바르게 설정되었는가?
5. ✅ 수동으로 데이터를 삽입할 수 있는가?

## 🆘 여전히 문제가 있는 경우

1. **Supabase 로그 확인**
   - Logs → Postgres Logs
   - 에러 메시지 확인

2. **브라우저 네트워크 탭 확인**
   - F12 → Network 탭
   - `/rest/v1/conversations` 요청 확인
   - 응답 상태 코드 및 에러 메시지 확인

3. **코드 디버깅**
   - `src/lib/supabase/conversations.js`의 `saveConversation` 함수에 더 많은 로그 추가


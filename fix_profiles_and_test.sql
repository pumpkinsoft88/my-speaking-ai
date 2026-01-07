-- 프로필 문제 해결 및 테스트를 위한 SQL
-- 이 파일의 SQL 쿼리를 Supabase 대시보드의 SQL Editor에서 실행하세요.

-- ============================================
-- 1. 기존 사용자 프로필 생성 (가장 중요!)
-- ============================================
-- 이미 가입한 사용자들의 프로필이 없는 경우를 대비하여 생성
INSERT INTO profiles (id, email, name)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1))
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- 확인
SELECT 
    p.id,
    p.email,
    p.name,
    p.created_at
FROM profiles p
ORDER BY p.created_at DESC
LIMIT 10;

-- ============================================
-- 2. conversations 테이블 확인
-- ============================================
-- 테이블이 존재하는지 확인
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'conversations'
ORDER BY ordinal_position;

-- ============================================
-- 3. 외래키 제약조건 확인
-- ============================================
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'conversations';

-- ============================================
-- 4. RLS 정책 확인
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('profiles', 'conversations')
ORDER BY tablename, policyname;

-- ============================================
-- 5. 트리거 확인
-- ============================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- 6. 테스트 데이터 삽입 (선택사항)
-- ============================================
-- 주의: 실제 사용자 ID로 변경해야 합니다!
-- 먼저 auth.users에서 사용자 ID를 확인하세요:
-- SELECT id, email FROM auth.users LIMIT 1;

-- 테스트 데이터 삽입 (사용자 ID를 실제 값으로 변경)
/*
INSERT INTO conversations (user_id, title, messages, language, level, practice_mode)
VALUES (
    'YOUR_USER_ID_HERE'::uuid, -- 여기를 실제 사용자 ID로 변경
    '테스트 대화',
    '[
        {"role": "user", "content": [{"type": "text", "text": "안녕하세요"}], "timestamp": "2024-01-01T00:00:00Z"},
        {"role": "assistant", "content": [{"type": "text", "text": "안녕하세요! 무엇을 도와드릴까요?"}], "timestamp": "2024-01-01T00:00:01Z"}
    ]'::jsonb,
    'traditional',
    'beginner',
    'free'
)
RETURNING *;
*/

-- ============================================
-- 7. 데이터 확인
-- ============================================
-- conversations 테이블의 모든 데이터 확인
SELECT 
    id,
    user_id,
    title,
    language,
    level,
    practice_mode,
    created_at,
    jsonb_array_length(messages) as message_count
FROM conversations
ORDER BY created_at DESC
LIMIT 10;

-- 사용자별 대화 개수 확인
SELECT 
    p.email,
    COUNT(c.id) as conversation_count
FROM profiles p
LEFT JOIN conversations c ON p.id = c.user_id
GROUP BY p.id, p.email
ORDER BY conversation_count DESC;

-- ============================================
-- 8. 문제 해결: 프로필이 없는 사용자 확인
-- ============================================
-- auth.users에는 있지만 profiles에는 없는 사용자 찾기
SELECT 
    u.id,
    u.email,
    u.created_at as user_created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 위 쿼리 결과가 있으면, 프로필을 생성해야 합니다:
-- INSERT INTO profiles (id, email, name)
-- SELECT 
--     id,
--     email,
--     COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1))
-- FROM auth.users
-- WHERE id NOT IN (SELECT id FROM profiles)
-- ON CONFLICT (id) DO NOTHING;


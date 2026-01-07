-- 대화 저장 문제 해결을 위한 SQL 스크립트
-- Supabase 대시보드의 SQL Editor에서 실행하세요.

-- ============================================
-- 1. RLS 정책 확인 및 재생성
-- ============================================

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- conversations 테이블 RLS 활성화 확인
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- conversations 정책 재생성
CREATE POLICY "Users can view own conversations"
    ON conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
    ON conversations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
    ON conversations FOR DELETE
    USING (auth.uid() = user_id);

-- profiles 정책 재생성
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. 테이블 구조 확인 및 수정
-- ============================================

-- conversations 테이블이 존재하는지 확인
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'conversations'
    ) THEN
        RAISE EXCEPTION 'conversations 테이블이 존재하지 않습니다. conversation_tables.sql을 먼저 실행하세요.';
    END IF;
END $$;

-- messages 컬럼이 JSONB인지 확인 및 수정
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'conversations' 
        AND column_name = 'messages'
        AND data_type != 'jsonb'
    ) THEN
        ALTER TABLE conversations ALTER COLUMN messages TYPE JSONB USING messages::jsonb;
        RAISE NOTICE 'messages 컬럼을 JSONB로 변환했습니다.';
    END IF;
END $$;

-- ============================================
-- 3. 프로필 자동 생성 트리거 확인
-- ============================================

-- 함수 생성 또는 교체 (DO 블록 밖에서 실행)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- 트리거가 존재하지 않으면 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. 기존 사용자 프로필 생성 (없는 경우)
-- ============================================

-- auth.users에 있지만 profiles에 없는 사용자 프로필 생성
INSERT INTO public.profiles (id, email, name)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'User')
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. 테스트 쿼리 (실제 사용자 ID로 변경 필요)
-- ============================================

-- 현재 사용자의 대화 목록 확인
-- SELECT id, title, created_at, jsonb_array_length(messages) as message_count
-- FROM conversations
-- WHERE user_id = auth.uid()
-- ORDER BY created_at DESC
-- LIMIT 10;

-- 현재 사용자의 프로필 확인
-- SELECT * FROM profiles WHERE id = auth.uid();

-- ============================================
-- 6. 권한 확인
-- ============================================

-- RLS 정책 확인
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
WHERE tablename IN ('conversations', 'profiles')
ORDER BY tablename, policyname;

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ 대화 저장 문제 해결 스크립트 실행 완료!';
    RAISE NOTICE '📋 다음 사항을 확인하세요:';
    RAISE NOTICE '   1. RLS 정책이 올바르게 설정되었는지 확인';
    RAISE NOTICE '   2. 프로필이 모든 사용자에게 생성되었는지 확인';
    RAISE NOTICE '   3. 테스트 대화 저장 시도';
END $$;


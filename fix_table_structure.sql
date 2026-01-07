-- 테이블 구조 일치 및 대화 저장 문제 해결을 위한 통합 SQL 스크립트
-- Supabase 대시보드의 SQL Editor에서 실행하세요.

-- ============================================
-- 1. 기존 테이블 및 뷰 정리
-- ============================================

-- 기존 뷰 삭제 (재생성을 위해)
DROP VIEW IF EXISTS conversations_with_user;

-- ============================================
-- 2. profiles 테이블 확인 및 생성
-- ============================================

-- profiles 테이블이 없으면 생성
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 필요한 컬럼이 없으면 추가
DO $$
BEGIN
    -- email 컬럼 확인 및 추가
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email TEXT NOT NULL DEFAULT '';
    END IF;
    
    -- name 컬럼 확인 및 추가
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN name TEXT;
    END IF;
    
    -- created_at 컬럼 확인 및 추가
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- updated_at 컬럼 확인 및 추가
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- ============================================
-- 3. conversations 테이블 확인 및 생성/수정
-- ============================================

-- conversations 테이블이 없으면 생성
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    language TEXT NOT NULL DEFAULT 'traditional',
    level TEXT DEFAULT 'beginner',
    practice_mode TEXT DEFAULT 'free',
    practice_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 필요한 컬럼이 없으면 추가
DO $$
BEGIN
    -- user_id 컬럼 확인 및 추가
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'conversations' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE conversations ADD COLUMN user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- title 컬럼 확인 및 추가
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'conversations' 
        AND column_name = 'title'
    ) THEN
        ALTER TABLE conversations ADD COLUMN title TEXT;
    END IF;
    
    -- messages 컬럼 확인 및 추가/수정
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'conversations' 
        AND column_name = 'messages'
    ) THEN
        ALTER TABLE conversations ADD COLUMN messages JSONB NOT NULL DEFAULT '[]'::jsonb;
    ELSE
        -- messages 컬럼이 있지만 JSONB가 아니면 변환
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'conversations' 
            AND column_name = 'messages'
            AND data_type != 'jsonb'
        ) THEN
            ALTER TABLE conversations ALTER COLUMN messages TYPE JSONB USING messages::jsonb;
        END IF;
    END IF;
    
    -- language 컬럼 확인 및 추가
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'conversations' 
        AND column_name = 'language'
    ) THEN
        ALTER TABLE conversations ADD COLUMN language TEXT NOT NULL DEFAULT 'traditional';
    END IF;
    
    -- level 컬럼 확인 및 추가
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'conversations' 
        AND column_name = 'level'
    ) THEN
        ALTER TABLE conversations ADD COLUMN level TEXT DEFAULT 'beginner';
    END IF;
    
    -- practice_mode 컬럼 확인 및 추가
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'conversations' 
        AND column_name = 'practice_mode'
    ) THEN
        ALTER TABLE conversations ADD COLUMN practice_mode TEXT DEFAULT 'free';
    END IF;
    
    -- practice_content 컬럼 확인 및 추가
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'conversations' 
        AND column_name = 'practice_content'
    ) THEN
        ALTER TABLE conversations ADD COLUMN practice_content TEXT;
    END IF;
    
    -- created_at 컬럼 확인 및 추가
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'conversations' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE conversations ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- updated_at 컬럼 확인 및 추가
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'conversations' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE conversations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_user_created ON conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_messages ON conversations USING GIN (messages);

-- ============================================
-- 4. updated_at 자동 업데이트 함수 및 트리거
-- ============================================

-- 함수 생성
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 트리거 생성 (기존 트리거 삭제 후 재생성)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. 프로필 자동 생성 함수 및 트리거
-- ============================================

-- 함수 생성 또는 교체
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

-- 트리거 생성 (기존 트리거 삭제 후 재생성)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. 기존 사용자 프로필 생성 (없는 경우)
-- ============================================

-- auth.users에 있지만 profiles에 없는 사용자 프로필 생성
INSERT INTO public.profiles (id, email, name)
SELECT 
    u.id,
    COALESCE(u.email, ''),
    COALESCE(u.raw_user_meta_data->>'name', split_part(COALESCE(u.email, 'unknown@example.com'), '@', 1), 'User')
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. conversations_with_user 뷰 재생성
-- ============================================

-- 뷰 생성 (conversations와 profiles를 JOIN)
-- 뷰를 재생성하면 기본적으로 SECURITY INVOKER로 생성됩니다.
-- 이렇게 하면 뷰를 조회하는 사용자의 권한과 RLS 정책이 적용됩니다.
CREATE OR REPLACE VIEW conversations_with_user AS
SELECT 
    c.id,
    c.user_id,
    p.email,
    p.name as user_name,
    c.title,
    c.messages,
    c.language,
    c.level,
    c.practice_mode,
    c.practice_content,
    c.created_at,
    c.updated_at,
    jsonb_array_length(c.messages) as message_count
FROM conversations c
JOIN profiles p ON c.user_id = p.id;

-- ============================================
-- 8. RLS 정책 설정
-- ============================================

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

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
-- 9. 테이블 구조 검증
-- ============================================

-- profiles 테이블 구조 확인
DO $$
DECLARE
    profile_columns TEXT[];
    expected_columns TEXT[] := ARRAY['id', 'email', 'name', 'created_at', 'updated_at'];
    missing_columns TEXT[];
BEGIN
    SELECT array_agg(column_name::TEXT)
    INTO profile_columns
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'profiles';
    
    SELECT array_agg(col)
    INTO missing_columns
    FROM unnest(expected_columns) AS col
    WHERE col NOT IN (SELECT unnest(profile_columns));
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'profiles 테이블에 다음 컬럼이 없습니다: %', array_to_string(missing_columns, ', ');
    END IF;
    
    RAISE NOTICE '✅ profiles 테이블 구조 검증 완료';
END $$;

-- conversations 테이블 구조 확인
DO $$
DECLARE
    conversation_columns TEXT[];
    expected_columns TEXT[] := ARRAY['id', 'user_id', 'title', 'messages', 'language', 'level', 'practice_mode', 'practice_content', 'created_at', 'updated_at'];
    missing_columns TEXT[];
BEGIN
    SELECT array_agg(column_name::TEXT)
    INTO conversation_columns
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'conversations';
    
    SELECT array_agg(col)
    INTO missing_columns
    FROM unnest(expected_columns) AS col
    WHERE col NOT IN (SELECT unnest(conversation_columns));
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'conversations 테이블에 다음 컬럼이 없습니다: %', array_to_string(missing_columns, ', ');
    END IF;
    
    RAISE NOTICE '✅ conversations 테이블 구조 검증 완료';
END $$;

-- ============================================
-- 10. 완료 메시지 및 확인 쿼리
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ 테이블 구조 일치 및 대화 저장 문제 해결 스크립트 실행 완료!';
    RAISE NOTICE '📋 다음 사항을 확인하세요:';
    RAISE NOTICE '   1. profiles 테이블 구조 확인';
    RAISE NOTICE '   2. conversations 테이블 구조 확인';
    RAISE NOTICE '   3. conversations_with_user 뷰 확인';
    RAISE NOTICE '   4. RLS 정책 확인';
    RAISE NOTICE '   5. 프로필이 모든 사용자에게 생성되었는지 확인';
    RAISE NOTICE '   6. 테스트 대화 저장 시도';
END $$;

-- 확인 쿼리 (주석 해제하여 실행 가능)
-- 테이블 구조 확인
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
-- AND table_name IN ('profiles', 'conversations')
-- ORDER BY table_name, ordinal_position;

-- 뷰 확인
-- SELECT * FROM conversations_with_user LIMIT 5;

-- 프로필 확인
-- SELECT id, email, name, created_at FROM profiles LIMIT 10;

-- 대화 확인
-- SELECT id, user_id, title, language, level, practice_mode, created_at 
-- FROM conversations 
-- ORDER BY created_at DESC 
-- LIMIT 10;


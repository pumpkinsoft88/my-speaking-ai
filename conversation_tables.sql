-- 회화 기록 저장을 위한 테이블 생성 SQL
-- 이 파일의 SQL 쿼리를 Supabase 대시보드의 SQL Editor에서 실행하세요.

-- ============================================
-- 1. 사용자 프로필 테이블 (profiles)
-- ============================================
-- Supabase Auth의 users 테이블과 연결되는 프로필 테이블
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- ============================================
-- 2. 회화 기록 테이블 (conversations)
-- ============================================
-- 사용자별 회화 기록을 저장하는 테이블
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT, -- 회화 제목 (선택사항, 첫 메시지로 자동 생성 가능)
    messages JSONB NOT NULL DEFAULT '[]'::jsonb, -- 대화 메시지 배열
    language TEXT NOT NULL DEFAULT 'traditional', -- 'traditional', 'simplified', 'english'
    level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
    practice_mode TEXT DEFAULT 'free', -- 'free', 'vocabulary', 'sentence'
    practice_content TEXT, -- 연습할 단어나 문장
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_user_created ON conversations(user_id, created_at DESC);
-- JSONB 인덱스 (메시지 검색용)
CREATE INDEX IF NOT EXISTS idx_conversations_messages ON conversations USING GIN (messages);

-- ============================================
-- 3. updated_at 자동 업데이트 함수
-- ============================================
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

-- ============================================
-- 4. 트리거 생성
-- ============================================
-- profiles 테이블의 updated_at 자동 업데이트
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- conversations 테이블의 updated_at 자동 업데이트
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. 사용자 프로필 자동 생성 함수
-- ============================================
-- 새 사용자가 가입할 때 자동으로 프로필을 생성하는 함수
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

-- ============================================
-- 6. 사용자 생성 시 프로필 자동 생성 트리거
-- ============================================
-- auth.users에 새 사용자가 생성될 때 자동으로 profiles에 프로필 생성
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 7. Row Level Security (RLS) 정책 설정
-- ============================================

-- profiles 테이블 RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- profiles 정책: 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- conversations 테이블 RLS 활성화
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- conversations 정책: 사용자는 자신의 회화 기록만 조회/생성/수정/삭제 가능
CREATE POLICY "Users can view own conversations"
    ON conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
    ON conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
    ON conversations FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 8. 유용한 뷰 생성 (선택사항)
-- ============================================
-- 회화 기록과 사용자 정보를 함께 조회하는 뷰
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
-- 실행 완료 후 확인 쿼리
-- ============================================
-- 테이블 생성 확인:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name IN ('profiles', 'conversations');

-- RLS 정책 확인:
-- SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'conversations');

-- 테스트 데이터 삽입 (선택사항, 실제 사용자 ID로 변경 필요):
-- INSERT INTO conversations (user_id, title, messages, language, level, practice_mode)
-- VALUES (
--     'YOUR_USER_ID_HERE'::uuid,
--     '첫 번째 대화',
--     '[
--         {"role": "user", "content": [{"type": "text", "text": "你好"}], "timestamp": "2024-01-01T00:00:00Z"},
--         {"role": "assistant", "content": [{"type": "text", "text": "你好！很高兴见到你。"}], "timestamp": "2024-01-01T00:00:01Z"}
--     ]'::jsonb,
--     'traditional',
--     'beginner',
--     'free'
-- );


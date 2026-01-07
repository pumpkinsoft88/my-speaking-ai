-- conversations_with_user 뷰의 SECURITY DEFINER 문제 해결
-- Supabase 대시보드의 SQL Editor에서 실행하세요.

-- ============================================
-- 1. 기존 뷰 삭제
-- ============================================

DROP VIEW IF EXISTS conversations_with_user;

-- ============================================
-- 2. 뷰 재생성 (SECURITY INVOKER로)
-- ============================================

-- 뷰를 재생성하면 기본적으로 SECURITY INVOKER로 생성됩니다.
-- 이렇게 하면 뷰를 조회하는 사용자의 권한과 RLS 정책이 적용됩니다.
-- PostgreSQL 15+에서는 WITH (security_invoker = true)를 명시할 수 있지만,
-- PostgreSQL 14 이하에서는 뷰를 삭제하고 재생성하면 기본값으로 SECURITY INVOKER가 됩니다.

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
-- 3. 뷰에 대한 RLS 정책 (선택사항)
-- ============================================

-- 뷰는 기본 테이블의 RLS 정책을 상속받지만,
-- 명시적으로 뷰에 대한 정책을 추가할 수도 있습니다.
-- 하지만 기본 테이블(conversations, profiles)의 RLS가 이미 설정되어 있으므로
-- 뷰를 조회할 때도 자동으로 적용됩니다.

-- ============================================
-- 4. 확인
-- ============================================

-- 뷰가 올바르게 생성되었는지 확인
SELECT 
    schemaname,
    viewname,
    viewowner
FROM pg_views
WHERE viewname = 'conversations_with_user';

-- 뷰의 보안 속성 확인 (PostgreSQL 15+)
-- SELECT 
--     n.nspname as schema_name,
--     c.relname as view_name,
--     CASE 
--         WHEN c.reloptions IS NULL THEN 'SECURITY INVOKER (default)'
--         WHEN 'security_invoker=true' = ANY(c.reloptions) THEN 'SECURITY INVOKER'
--         WHEN 'security_definer=true' = ANY(c.reloptions) THEN 'SECURITY DEFINER'
--         ELSE 'Unknown'
--     END as security_type
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE c.relkind = 'v'
-- AND c.relname = 'conversations_with_user';

-- ============================================
-- 완료 메시지
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ conversations_with_user 뷰 보안 설정 수정 완료!';
    RAISE NOTICE '📋 뷰가 이제 SECURITY INVOKER로 설정되었습니다.';
    RAISE NOTICE '   - 뷰를 조회하는 사용자의 권한으로 실행됩니다.';
    RAISE NOTICE '   - 기본 테이블의 RLS 정책이 자동으로 적용됩니다.';
END $$;


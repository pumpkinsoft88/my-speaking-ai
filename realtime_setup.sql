-- Supabase Realtime 활성화를 위한 SQL 쿼리
-- 이 파일의 SQL 쿼리를 Supabase 대시보드의 SQL Editor에서 실행하세요.

-- ============================================
-- 1. conversations 테이블에 Realtime 활성화
-- ============================================
-- Supabase Realtime은 기본적으로 활성화되어 있지만, 
-- 명시적으로 활성화하려면 다음 쿼리를 실행하세요.

-- Realtime 활성화 (publication에 테이블 추가)
-- 참고: Supabase는 기본적으로 모든 테이블이 Realtime에 포함되어 있습니다.
-- 하지만 명시적으로 제어하려면 다음을 사용할 수 있습니다:

-- Realtime publication 확인
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- conversations 테이블이 Realtime에 포함되어 있는지 확인
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' 
  AND tablename = 'conversations';

-- 만약 conversations 테이블이 Realtime에 포함되어 있지 않다면:
-- (일반적으로는 필요하지 않지만, 필요시에만 실행)
-- ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- ============================================
-- 2. Realtime 정책 확인
-- ============================================
-- RLS 정책이 제대로 설정되어 있는지 확인
-- (이미 conversation_tables.sql에서 설정했지만 확인용)

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
WHERE tablename = 'conversations'
ORDER BY policyname;

-- ============================================
-- 3. Realtime 연결 테스트 (선택사항)
-- ============================================
-- 다음은 클라이언트에서 테스트할 수 있는 쿼리입니다.
-- 실제로는 JavaScript 코드에서 테스트해야 합니다.

-- 참고: Realtime이 제대로 작동하는지 확인하려면:
-- 1. Supabase 대시보드 > Database > Replication 탭에서 확인
-- 2. 또는 클라이언트 코드에서 구독 상태를 확인

-- ============================================
-- 4. 성능 최적화 (선택사항)
-- ============================================
-- Realtime 구독이 많을 경우를 대비한 최적화

-- 인덱스 확인 (이미 conversation_tables.sql에서 생성했지만 확인용)
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'conversations';

-- ============================================
-- 실행 완료 후 확인
-- ============================================
-- 1. Supabase 대시보드 > Database > Replication 탭에서
--    conversations 테이블이 활성화되어 있는지 확인
-- 2. 클라이언트 코드에서 Realtime 구독이 작동하는지 테스트


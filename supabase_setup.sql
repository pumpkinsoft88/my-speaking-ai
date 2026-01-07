-- Supabase 테스트 테이블 생성 SQL
-- 이 파일의 SQL 쿼리를 Supabase 대시보드의 SQL Editor에서 실행하세요.

-- 1. 테스트용 기본 테이블 생성
CREATE TABLE IF NOT EXISTS test_table (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_test_table_email ON test_table(email);
CREATE INDEX IF NOT EXISTS idx_test_table_created_at ON test_table(created_at);

-- 3. RLS (Row Level Security) 정책 설정 (선택사항)
-- 보안을 위해 RLS를 활성화하려면 아래 주석을 해제하세요
-- ALTER TABLE test_table ENABLE ROW LEVEL SECURITY;

-- 4. 공개 읽기/쓰기 정책 (개발/테스트용)
-- 프로덕션 환경에서는 더 엄격한 정책을 설정하세요
-- CREATE POLICY "Allow public read access" ON test_table FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert access" ON test_table FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update access" ON test_table FOR UPDATE USING (true);
-- CREATE POLICY "Allow public delete access" ON test_table FOR DELETE USING (true);

-- 5. updated_at 자동 업데이트 함수 (선택사항)
-- 보안이 강화된 버전 (mutable search_path 경고 해결)
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

-- 6. updated_at 트리거 생성
CREATE TRIGGER update_test_table_updated_at
    BEFORE UPDATE ON test_table
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. 테스트 데이터 삽입 (선택사항)
INSERT INTO test_table (name, email, message) VALUES
    ('홍길동', 'hong@example.com', '첫 번째 테스트 데이터'),
    ('김철수', 'kim@example.com', '두 번째 테스트 데이터'),
    ('이영희', 'lee@example.com', '세 번째 테스트 데이터')
ON CONFLICT DO NOTHING;

-- 실행 완료 후 다음 명령어로 테이블 확인
-- SELECT * FROM test_table ORDER BY created_at DESC;


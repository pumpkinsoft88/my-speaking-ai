-- Supabase 보안 경고 해결 SQL
-- 이 파일의 SQL 쿼리를 Supabase 대시보드의 SQL Editor에서 실행하세요.

-- 1. Function 보안 경고 해결
-- update_updated_at_column 함수를 보안이 강화된 버전으로 수정

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- 보안이 강화된 함수 재생성
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

-- 함수가 정상적으로 생성되었는지 확인
SELECT 
  proname as function_name,
  prosecdef as security_definer,
  proconfig as search_path
FROM pg_proc
WHERE proname = 'update_updated_at_column';

-- 실행 완료 후 Supabase 대시보드에서 경고가 사라졌는지 확인하세요.


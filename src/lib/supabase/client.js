import { createClient } from '@supabase/supabase-js';
import { 
	PUBLIC_SUPABASE_DB_URL, 
	PUBLIC_SUPABASE_DB_PUBLIC_KEY 
} from '$env/static/public';

// 클라이언트 사이드에서 사용하기 위해 PUBLIC_ 접두사가 필요합니다
// .env 파일에 PUBLIC_SUPABASE_DB_URL과 PUBLIC_SUPABASE_DB_PUBLIC_KEY를 설정해주세요
if (!PUBLIC_SUPABASE_DB_URL || !PUBLIC_SUPABASE_DB_PUBLIC_KEY) {
	throw new Error(
		'Supabase 환경 변수가 설정되지 않았습니다.\n' +
		'.env 파일에 다음을 설정해주세요:\n' +
		'PUBLIC_SUPABASE_DB_URL=your_supabase_url\n' +
		'PUBLIC_SUPABASE_DB_PUBLIC_KEY=your_supabase_anon_key'
	);
}

export const supabase = createClient(PUBLIC_SUPABASE_DB_URL, PUBLIC_SUPABASE_DB_PUBLIC_KEY, {
	auth: {
		// 세션을 URL에서 자동으로 감지
		detectSessionInUrl: true,
		// 세션 지속성 활성화
		persistSession: true,
		// 자동 토큰 새로고침
		autoRefreshToken: true,
		// PKCE 플로우 사용 (보안 강화)
		flowType: 'pkce'
	}
});


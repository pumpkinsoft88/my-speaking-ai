import { createClient } from '@supabase/supabase-js';
import { 
	PUBLIC_SUPABASE_DB_URL, 
	PUBLIC_SUPABASE_DB_PUBLIC_KEY 
} from '$env/static/public';
import { browser } from '$app/environment';

// 클라이언트 사이드에서 사용하기 위해 PUBLIC_ 접두사가 필요합니다
// .env 파일에 PUBLIC_SUPABASE_DB_URL과 PUBLIC_SUPABASE_DB_PUBLIC_KEY를 설정해주세요

// 환경 변수 확인 (서버 사이드에서는 에러를 던지지 않고 경고만)
const supabaseUrl = PUBLIC_SUPABASE_DB_URL || '';
const supabaseKey = PUBLIC_SUPABASE_DB_PUBLIC_KEY || '';

if (browser && (!supabaseUrl || !supabaseKey)) {
	console.error(
		'⚠️ Supabase 환경 변수가 설정되지 않았습니다.\n' +
		'.env 파일에 다음을 설정해주세요:\n' +
		'PUBLIC_SUPABASE_DB_URL=your_supabase_url\n' +
		'PUBLIC_SUPABASE_DB_PUBLIC_KEY=your_supabase_anon_key'
	);
}

// 더미 클라이언트 생성 (환경 변수가 없을 때)
const createDummyClient = () => {
	return createClient('https://placeholder.supabase.co', 'placeholder-key', {
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	});
};

// Supabase 클라이언트 생성 (환경 변수가 있으면 정상 클라이언트, 없으면 더미 클라이언트)
export const supabase = (supabaseUrl && supabaseKey)
	? createClient(supabaseUrl, supabaseKey, {
		auth: {
			// 세션을 URL에서 자동으로 감지
			detectSessionInUrl: true,
			// 세션 지속성 활성화 (localStorage에 저장되어 새로고침 시에도 유지됨)
			persistSession: browser,
			// 자동 토큰 새로고침
			autoRefreshToken: true,
			// PKCE 플로우 활성화 (Supabase verify 엔드포인트의 code 파라미터 처리에 필요)
			flowType: 'pkce',
			// 세션 저장소 설정 (localStorage 사용, 브라우저에서만)
			storage: browser ? window.localStorage : undefined,
			// 세션 만료 시간 (기본값: 3600초 = 1시간)
			storageKey: 'sb-auth-token'
		},
		realtime: {
			// Realtime 연결 설정
			params: {
				eventsPerSecond: 10
			}
		}
	})
	: createDummyClient();


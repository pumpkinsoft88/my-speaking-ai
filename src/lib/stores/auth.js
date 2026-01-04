import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase/client.js';
import { browser } from '$app/environment';
import { getAuthRedirectURL } from '$lib/utils/url.js';

/**
 * 인증 상태 스토어
 */
export const authStore = writable({
	user: null,
	session: null,
	loading: true
});

/**
 * 인증 초기화
 */
export async function initAuth() {
	if (!browser) return;

	try {
		// 현재 세션 가져오기
		const { data: { session }, error } = await supabase.auth.getSession();
		
		if (error) throw error;

		authStore.set({
			user: session?.user ?? null,
			session: session,
			loading: false
		});

		// 인증 상태 변경 리스너 설정
		supabase.auth.onAuthStateChange((_event, session) => {
			authStore.set({
				user: session?.user ?? null,
				session: session,
				loading: false
			});
		});
	} catch (error) {
		console.error('Auth initialization error:', error);
		authStore.set({
			user: null,
			session: null,
			loading: false
		});
	}
}

/**
 * 이메일/비밀번호로 회원가입
 */
export async function signUp(email, password) {
	try {
		// 브라우저 환경에서는 현재 origin을 사용하여 절대 URL 생성
		// 이렇게 하면 로컬 개발, 프로덕션, 프리뷰 환경 모두 자동으로 처리됨
		let redirectURL;
		
		if (browser) {
			// 현재 origin 사용 (로컬이든 프로덕션이든 자동으로 처리)
			const origin = window.location.origin;
			redirectURL = `${origin}/auth/confirm`;
		} else {
			// 서버 사이드에서는 환경 변수 사용
			redirectURL = getAuthRedirectURL();
		}
		
		// 디버깅: 리디렉션 URL 확인
		if (browser) {
			console.log('📧 Email redirect URL:', redirectURL);
			console.log('🌐 Current origin:', window.location.origin);
		}
		
		// 절대 URL인지 확인
		if (!redirectURL.startsWith('http://') && !redirectURL.startsWith('https://')) {
			throw new Error(`Invalid redirect URL: ${redirectURL}. Must be an absolute URL.`);
		}
		
		// /auth/confirm 경로가 포함되어 있는지 확인
		if (!redirectURL.includes('/auth/confirm')) {
			console.warn('⚠️ Warning: redirect URL does not include /auth/confirm:', redirectURL);
			// 강제로 /auth/confirm 추가
			const baseURL = redirectURL.replace(/\/$/, '').split('/').slice(0, 3).join('/');
			redirectURL = `${baseURL}/auth/confirm`;
			console.log('✅ Fixed redirect URL:', redirectURL);
		}
		
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: redirectURL
			}
		});

		if (error) throw error;

		// 성공 시 리디렉션 URL 로그 출력
		if (browser && data?.user) {
			console.log('✅ Sign up successful. Email will redirect to:', redirectURL);
		}

		return { data, error: null };
	} catch (error) {
		console.error('❌ Sign up error:', error);
		return { data: null, error };
	}
}

/**
 * 이메일/비밀번호로 로그인
 */
export async function signIn(email, password) {
	try {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) throw error;

		return { data, error: null };
	} catch (error) {
		console.error('Sign in error:', error);
		return { data: null, error };
	}
}

/**
 * 로그아웃
 */
export async function signOut() {
	try {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
		return { error: null };
	} catch (error) {
		console.error('Sign out error:', error);
		return { error };
	}
}


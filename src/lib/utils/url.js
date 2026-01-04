import { browser } from '$app/environment';

/**
 * 현재 환경에 맞는 URL을 반환합니다.
 * Vercel 배포 환경에서는 자동으로 설정된 URL을 사용하고,
 * 로컬 개발 환경에서는 localhost를 사용합니다.
 * 
 * @returns {string} 현재 환경에 맞는 URL
 */
export function getURL() {
	if (browser) {
		// 클라이언트 사이드에서는 항상 현재 URL 사용
		// 이렇게 하면 Vercel 프리뷰 URL도 자동으로 처리됨
		return window.location.origin;
	} else {
		// 서버 사이드에서는 환경 변수 사용 (없으면 기본값)
		const envURL = process.env.PUBLIC_SITE_URL || process.env.PUBLIC_VERCEL_URL;
		return envURL || 'http://localhost:5173';
	}
}

/**
 * 이메일 인증 후 리디렉션할 URL을 반환합니다.
 * 항상 절대 URL을 반환합니다.
 * 
 * @param {string} [customOrigin] - 커스텀 origin URL (선택사항)
 * @returns {string} 인증 후 리디렉션 URL (절대 URL)
 */
export function getAuthRedirectURL(customOrigin = null) {
	let baseURL;
	
	if (customOrigin) {
		baseURL = customOrigin;
	} else if (browser) {
		// 브라우저에서는 현재 origin 사용
		baseURL = window.location.origin;
	} else {
		// 서버 사이드에서는 환경 변수 또는 기본값 사용
		baseURL = process.env.PUBLIC_SITE_URL || 
		          process.env.PUBLIC_VERCEL_URL || 
		          'http://localhost:5173';
	}

	// Make sure to include `https://` when not localhost.
	if (!baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
		baseURL = `https://${baseURL}`;
	}

	// Remove trailing slash if present
	baseURL = baseURL.replace(/\/$/, '');

	// 리디렉션 URL 생성
	const redirectURL = `${baseURL}/auth/confirm`;
	
	// 절대 URL인지 확인
	if (!redirectURL.startsWith('http://') && !redirectURL.startsWith('https://')) {
		throw new Error(`Invalid redirect URL: ${redirectURL}. Must be an absolute URL.`);
	}
	
	return redirectURL;
}


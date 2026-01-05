<!-- /src/routes/auth/confirm/+page.svelte -->
<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabase/client.js';
	import { authStore } from '$lib/stores/auth.js';
	import { translations } from '$lib/i18n/translations.js';
	import { browser } from '$app/environment';

	let currentLanguage = $state('korean');
	let t = $derived(translations[currentLanguage]?.auth || translations['korean'].auth);
	
	let loading = $state(true);
	let error = $state('');
	let success = $state(false);

	onMount(async () => {
		if (!browser) return;

		try {
			// URL 쿼리 파라미터에서 토큰 정보 확인
			const urlParams = new URLSearchParams(window.location.search);
			const tokenHash = urlParams.get('token_hash');
			const token = urlParams.get('token'); // Supabase verify 엔드포인트에서 사용
			const code = urlParams.get('code'); // PKCE 플로우에서 사용
			const type = urlParams.get('type');

			// URL 해시에서도 토큰 정보 확인 (Supabase가 해시에 정보를 넣을 수 있음)
			const hashParams = new URLSearchParams(window.location.hash.slice(1));
			const hashToken = hashParams.get('access_token');
			const hashType = hashParams.get('type');
			const errorCode = hashParams.get('error_code');
			const errorDescription = hashParams.get('error_description');

			console.log('🔍 URL params:', { tokenHash, token, code, type, hashToken, hashType });

			// 에러가 있는 경우 처리
			if (errorCode) {
				console.error('❌ Error from URL hash:', errorCode, errorDescription);
				error = errorDescription || t.error || '인증 중 오류가 발생했습니다.';
				loading = false;
				return;
			}

			// 1. token_hash가 있는 경우 (이메일 템플릿에서 직접 링크)
			if (tokenHash && (type === 'email' || type === 'signup')) {
				console.log('🔐 Verifying email token with token_hash...');
				
				const { data, error: verifyError } = await supabase.auth.verifyOtp({
					token_hash: tokenHash,
					type: type === 'signup' ? 'email' : type
				});

				if (verifyError) {
					console.error('❌ Token verification error:', verifyError);
					error = verifyError.message || t.error || '이메일 인증에 실패했습니다. 링크가 만료되었거나 이미 사용되었을 수 있습니다.';
					loading = false;
					return;
				}

				if (data?.user) {
					console.log('✅ Email verified successfully with token_hash');
					success = true;
					authStore.set({
						user: data.user,
						session: data.session,
						loading: false
					});

					setTimeout(() => {
						goto('/');
					}, 2000);
					return;
				}
			}

			// 2. token이 있는 경우 (Supabase verify 엔드포인트에서 리디렉션)
			if (token && (type === 'signup' || type === 'email')) {
				console.log('🔐 Verifying email token with token...');
				
				const { data, error: verifyError } = await supabase.auth.verifyOtp({
					token: token,
					type: type === 'signup' ? 'email' : type
				});

				if (verifyError) {
					console.error('❌ Token verification error:', verifyError);
					error = verifyError.message || t.error || '이메일 인증에 실패했습니다. 링크가 만료되었거나 이미 사용되었을 수 있습니다.';
					loading = false;
					return;
				}

				if (data?.user) {
					console.log('✅ Email verified successfully with token');
					success = true;
					authStore.set({
						user: data.user,
						session: data.session,
						loading: false
					});

					setTimeout(() => {
						goto('/');
					}, 2000);
					return;
				}
			}

			// 3. code 파라미터가 있는 경우 (PKCE 플로우 - Supabase verify 엔드포인트에서 리디렉션)
			if (code) {
				console.log('🔐 Code parameter found, exchanging for session (PKCE flow)...');
				
				try {
					const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
					
					if (!exchangeError && data?.user) {
						console.log('✅ Code exchanged successfully, session created');
						success = true;
						authStore.set({
							user: data.user,
							session: data.session,
							loading: false
						});
						
						setTimeout(() => {
							goto('/');
						}, 2000);
						return;
					}
					
					// exchangeCodeForSession이 실패해도, Supabase verify 엔드포인트가 이미 이메일을 인증했을 수 있음
					// 이 경우 세션이 설정되지 않았을 수 있으므로, 세션 확인으로 넘어감
					if (exchangeError) {
						console.warn('⚠️ Code exchange failed, but email may already be verified:', exchangeError.message);
						console.log('🔍 Will check if email was already verified and try to get session...');
						// 계속 진행하여 세션 확인 시도
					}
				} catch (err) {
					console.warn('⚠️ Code exchange error, but email may already be verified:', err);
					// 계속 진행하여 세션 확인 시도
				}
			}

			// 4. URL 해시에 access_token이 있는 경우
			if (hashToken && (hashType === 'signup' || hashType === 'email')) {
				console.log('🔐 Using access_token from URL hash...');
				
				// access_token을 사용하여 세션 설정
				const { data, error: signInError } = await supabase.auth.setSession({
					access_token: hashToken,
					refresh_token: hashParams.get('refresh_token') || ''
				});

				if (signInError) {
					console.error('❌ Session setting error:', signInError);
					error = signInError.message || t.error || '세션 설정에 실패했습니다.';
					loading = false;
					return;
				}

				if (data?.user) {
					console.log('✅ Session set successfully from access_token');
					success = true;
					authStore.set({
						user: data.user,
						session: data.session,
						loading: false
					});

					setTimeout(() => {
						goto('/');
					}, 2000);
					return;
				}
			}

			// 5. 토큰이 없는 경우 세션 확인 (Supabase가 자동으로 세션을 설정했을 수 있음)
			// code 파라미터가 있었지만 exchangeCodeForSession이 실패한 경우도 여기로 옴
			console.log('🔍 Checking existing session...');
			
			// 세션 확인 전에 잠시 대기 (Supabase가 세션을 설정하는 데 시간이 걸릴 수 있음)
			await new Promise(resolve => setTimeout(resolve, 500));
			
			const { data: { session }, error: sessionError } = await supabase.auth.getSession();
			
			if (sessionError) {
				console.error('❌ Session error:', sessionError);
				// code 파라미터가 있었지만 세션을 찾을 수 없는 경우
				// 이메일 인증은 완료되었을 수 있으므로, 사용자에게 로그인하도록 안내
				if (code) {
					console.log('ℹ️ Email may already be verified. User can login now.');
					success = true;
					error = '';
					loading = false;
					// 성공 메시지 대신 로그인 안내 표시
					setTimeout(() => {
						goto('/login');
					}, 2000);
					return;
				}
				error = sessionError.message || t.error || '세션을 확인할 수 없습니다.';
				loading = false;
				return;
			}

			if (session?.user) {
				console.log('✅ Session found, user already authenticated');
				success = true;
				authStore.set({
					user: session.user,
					session: session,
					loading: false
				});

				setTimeout(() => {
					goto('/');
				}, 2000);
			} else {
				// 세션이 없고 토큰도 없는 경우
				// code 파라미터가 있었지만 세션을 찾을 수 없는 경우
				// 이메일 인증은 완료되었을 수 있으므로, 사용자에게 로그인하도록 안내
				if (code) {
					console.log('ℹ️ Email may already be verified. User can login now.');
					success = true;
					error = '';
					loading = false;
					// 성공 메시지 표시 (UI에서 code가 있으면 로그인 안내 메시지 표시)
					return;
				}
				
				console.warn('⚠️ No session and no token found');
				console.warn('⚠️ URL:', window.location.href);
				error = t.error || '인증 정보를 찾을 수 없습니다. 이메일 링크가 만료되었거나 이미 사용되었을 수 있습니다.';
				loading = false;
			}
		} catch (err) {
			console.error('❌ Auth confirmation error:', err);
			error = err.message || t.error || '인증 처리 중 오류가 발생했습니다.';
			loading = false;
		}
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
	<div class="w-full max-w-md">
		<div class="rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl shadow-purple-500/10 border-2 border-white/50 p-6 sm:p-8">
			{#if loading}
				<!-- 로딩 상태 -->
				<div class="text-center">
					<div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
					<h2 class="text-xl font-bold text-slate-800 mb-2">
						{t.emailVerifying || '이메일 인증 중...'}
					</h2>
					<p class="text-sm text-slate-600">
						{t.pleaseWait || '잠시만 기다려주세요.'}
					</p>
				</div>
			{:else if success}
				<!-- 성공 상태 -->
				<div class="text-center">
					<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
						<svg
							class="w-8 h-8 text-green-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<h2 class="text-xl font-bold text-green-800 mb-2">
						{t.emailVerified || '이메일 인증 완료!'}
					</h2>
					<p class="text-sm text-green-700 mb-6">
						{code ? (t.emailVerifiedLoginMessage || '이메일 인증이 완료되었습니다. 로그인해주세요.') : (t.emailVerifiedMessage || '이메일 인증이 완료되었습니다. 잠시 후 홈으로 이동합니다.')}
					</p>
					<div class="flex flex-col sm:flex-row gap-3 justify-center">
						{#if code}
							<a
								href="/login"
								class="inline-block rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
							>
								{t.login || '로그인'}
							</a>
						{:else}
							<a
								href="/"
								class="inline-block rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
							>
								{t.goToHome || '홈으로 이동'}
							</a>
						{/if}
					</div>
				</div>
			{:else if error}
				<!-- 에러 상태 -->
				<div class="text-center">
					<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
						<svg
							class="w-8 h-8 text-red-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</div>
					<h2 class="text-xl font-bold text-red-800 mb-2">
						{t.error || '오류 발생'}
					</h2>
					<p class="text-sm text-red-700 mb-6">
						{error}
					</p>
					<div class="flex flex-col sm:flex-row gap-3 justify-center">
						<a
							href="/login"
							class="inline-block rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all text-center"
						>
							{t.login || '로그인'}
						</a>
						<a
							href="/signup"
							class="inline-block rounded-xl border-2 border-purple-200/50 bg-gradient-to-r from-white/80 to-purple-50/50 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-slate-700 shadow-lg hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/30 transition-all text-center"
						>
							{t.signup || '회원가입'}
						</a>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>


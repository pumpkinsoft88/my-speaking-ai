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
			// URL 해시에서 에러 정보 확인
			const hashParams = new URLSearchParams(window.location.hash.slice(1));
			const errorCode = hashParams.get('error_code');
			const errorDescription = hashParams.get('error_description');

			// 에러가 있는 경우 처리
			if (errorCode) {
				error = errorDescription || t.error || '인증 중 오류가 발생했습니다.';
				loading = false;
				return;
			}

			// Supabase는 이메일 링크를 클릭하면 자동으로 세션을 설정합니다
			// 세션을 확인하여 인증 상태를 업데이트합니다
			const { data: { session }, error: sessionError } = await supabase.auth.getSession();
			
			if (sessionError) {
				error = sessionError.message || t.error || '세션을 확인할 수 없습니다.';
				loading = false;
				return;
			}

			if (session?.user) {
				// 인증 성공
				success = true;
				authStore.set({
					user: session.user,
					session: session,
					loading: false
				});

				// 2초 후 홈으로 리디렉트
				setTimeout(() => {
					goto('/');
				}, 2000);
			} else {
				// 세션이 없는 경우 - 이미 만료되었거나 잘못된 링크일 수 있음
				error = t.error || '인증 정보를 찾을 수 없습니다. 이메일 링크가 만료되었거나 이미 사용되었을 수 있습니다.';
				loading = false;
			}
		} catch (err) {
			console.error('Auth confirmation error:', err);
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
						{t.emailVerifiedMessage || '이메일 인증이 완료되었습니다. 잠시 후 홈으로 이동합니다.'}
					</p>
					<a
						href="/"
						class="inline-block rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
					>
						{t.goToHome || '홈으로 이동'}
					</a>
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


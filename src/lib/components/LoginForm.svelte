<!-- /src/lib/components/LoginForm.svelte -->
<script>
	import { signIn } from '$lib/stores/auth.js';
	import { translations } from '$lib/i18n/translations.js';
	import { goto } from '$app/navigation';

	let { currentLanguage = 'korean' } = $props();
	let t = $derived(translations[currentLanguage]?.auth || translations['korean'].auth);

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	async function handleSubmit() {
		error = '';
		
		// 유효성 검사
		if (!email || !password) {
			error = t.invalidCredentials;
			return;
		}

		if (!email.includes('@')) {
			error = t.invalidEmail;
			return;
		}

		loading = true;
		const { data, error: authError } = await signIn(email, password);
		loading = false;

		if (authError) {
			error = authError.message || t.invalidCredentials;
			return;
		}

		if (data?.user) {
			// 로그인 성공 - 홈으로 리다이렉트
			goto('/');
		}
	}
</script>

<div class="w-full max-w-4xl mx-auto">
	<div class="rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl shadow-purple-500/10 border-2 border-white/50 p-4 sm:p-6 lg:p-8">
		<h2 class="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
			{t.loginTitle}
		</h2>

		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4 sm:space-y-6">
			<!-- 이메일 입력 -->
			<div>
				<label for="login-email" class="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
					{t.email}
				</label>
				<input
					id="login-email"
					type="email"
					bind:value={email}
					required
					disabled={loading}
					class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
					placeholder="user@example.com"
				/>
			</div>

			<!-- 비밀번호 입력 -->
			<div>
				<label for="login-password" class="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
					{t.password}
				</label>
				<input
					id="login-password"
					type="password"
					bind:value={password}
					required
					disabled={loading}
					class="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
					placeholder="••••••••"
				/>
			</div>

			<!-- 에러 메시지 -->
			{#if error}
				<div class="rounded-xl border-2 border-red-300/50 bg-gradient-to-br from-red-50/80 to-pink-50/80 backdrop-blur-sm px-4 py-3 text-xs sm:text-sm text-red-700">
					{error}
				</div>
			{/if}

			<!-- 로그인 버튼 -->
			<button
				type="submit"
				disabled={loading}
				class="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? '처리 중...' : t.loginButton}
			</button>

			<!-- 회원가입 링크 -->
			<div class="text-center text-xs sm:text-sm text-slate-600">
				<span>{t.noAccount}</span>
				<a href="/signup" class="ml-1 text-purple-600 font-semibold hover:text-purple-700 underline">
					{t.signup}
				</a>
			</div>
		</form>
	</div>
</div>


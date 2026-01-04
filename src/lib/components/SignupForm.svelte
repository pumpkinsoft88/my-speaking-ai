<!-- /src/lib/components/SignupForm.svelte -->
<script>
	import { signUp } from '$lib/stores/auth.js';
	import { translations } from '$lib/i18n/translations.js';
	import { goto } from '$app/navigation';

	let { currentLanguage = 'korean' } = $props();
	let t = $derived(translations[currentLanguage]?.auth || translations['korean'].auth);

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	// 비밀번호 표시/숨김 상태
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

	// 비밀번호 검증 상태
	let passwordValid = $derived(password.length >= 6);
	let passwordMatch = $derived(
		confirmPassword.length > 0 && password === confirmPassword
	);
	let passwordMismatch = $derived(
		confirmPassword.length > 0 && password !== confirmPassword
	);

	async function handleSubmit() {
		error = '';
		success = false;
		
		// 유효성 검사
		if (!email || !password || !confirmPassword) {
			error = t.invalidCredentials;
			return;
		}

		if (!email.includes('@')) {
			error = t.invalidEmail;
			return;
		}

		if (password.length < 6) {
			error = t.weakPassword;
			return;
		}

		if (password !== confirmPassword) {
			error = t.passwordMismatch;
			return;
		}

		loading = true;
		const { data, error: authError } = await signUp(email, password);
		loading = false;

		if (authError) {
			// Supabase 에러 메시지 처리
			if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
				error = t.userExists;
			} else {
				error = authError.message || t.error;
			}
			return;
		}

		if (data?.user) {
			success = true;
			// 자동 리다이렉트 제거 - 사용자가 직접 로그인 페이지로 이동하도록 함
		}
	}
</script>

<div class="w-full max-w-4xl mx-auto">
	<div class="rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl shadow-purple-500/10 border-2 border-white/50 p-4 sm:p-6 lg:p-8">
		<h2 class="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
			{t.signupTitle}
		</h2>

		{#if success}
			<!-- 성공 메시지 -->
			<div class="space-y-4 sm:space-y-6">
				<div class="rounded-xl border-2 border-green-300/50 bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm px-4 sm:px-6 py-4 sm:py-5">
					<div class="flex items-start gap-3">
						<svg class="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<div class="flex-1">
							<h3 class="text-sm sm:text-base font-bold text-green-800 mb-2">
								{t.signupSuccess}
							</h3>
							<div class="space-y-2 text-xs sm:text-sm text-green-700">
								<p class="font-medium">
									{t.emailSentTo || '인증 이메일이 다음 주소로 전송되었습니다:'}
								</p>
								<div class="flex items-center gap-2 p-2 sm:p-3 bg-white/60 rounded-lg border border-green-200/50">
									<svg class="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
									</svg>
									<span class="font-semibold text-green-800 break-all">{email}</span>
								</div>
								<p class="mt-3 text-xs sm:text-sm leading-relaxed">
									{t.emailCheckInstructions || '이메일을 확인하여 계정을 인증해주세요. 인증 후 로그인하실 수 있습니다.'}
								</p>
							</div>
						</div>
					</div>
				</div>
				
				<!-- 로그인 페이지로 이동 버튼 -->
				<div class="flex flex-col sm:flex-row gap-3">
					<a
						href="/login"
						class="flex items-center justify-center min-h-[44px] text-center rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40"
					>
						{t.goToLogin || '로그인 페이지로 이동'}
					</a>
					<a
						href="/"
						class="flex items-center justify-center min-h-[44px] text-center rounded-xl border-2 border-purple-200/50 bg-gradient-to-r from-white/80 to-purple-50/50 backdrop-blur-sm px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 shadow-lg transition-all hover:scale-105 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/30"
					>
						{t.goToHome || '홈으로 이동'}
					</a>
				</div>
			</div>
		{:else}
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4 sm:space-y-6">
				<!-- 이메일 입력 -->
				<div>
					<label for="signup-email" class="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
						{t.email}
					</label>
					<input
						id="signup-email"
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
					<label for="signup-password" class="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
						{t.password}
					</label>
					<div class="relative">
						<input
							id="signup-password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							required
							disabled={loading}
							class="w-full px-4 py-2.5 sm:py-3 pr-20 rounded-xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm outline-none focus:ring-2 {password.length > 0
								? passwordValid
									? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
									: 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
								: 'border-slate-300 focus:border-purple-500 focus:ring-purple-500/20'}"
							placeholder="••••••••"
						/>
						<div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
							{#if password.length > 0}
								<div>
									{#if passwordValid}
										<svg
											class="h-5 w-5 text-green-500"
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
									{:else}
										<svg
											class="h-5 w-5 text-red-500"
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
									{/if}
								</div>
							{/if}
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
								tabindex="-1"
							>
								{#if showPassword}
									<!-- 눈 아이콘 (숨김) -->
									<svg
										class="h-5 w-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 015.12 5.12m3.17 1.17L3 3m0 0l18 18m-3.29-3.29a9.97 9.97 0 01-1.563 3.029M12 12l-4.242-4.242M12 12l3.29 3.29"
										/>
									</svg>
								{:else}
									<!-- 눈 아이콘 (표시) -->
									<svg
										class="h-5 w-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								{/if}
							</button>
						</div>
					</div>
					{#if password.length > 0}
						<p
							class="mt-1 text-xs {passwordValid ? 'text-green-600' : 'text-red-600'}"
						>
							{#if passwordValid}
								<span class="flex items-center gap-1">
									<svg
										class="h-3 w-3"
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
									{t.passwordValid || '비밀번호가 유효합니다'}
								</span>
							{:else}
								<span class="flex items-center gap-1">
									<svg
										class="h-3 w-3"
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
									{t.weakPassword}
								</span>
							{/if}
						</p>
					{:else}
						<p class="mt-1 text-xs text-slate-500">{t.weakPassword}</p>
					{/if}
				</div>

				<!-- 비밀번호 확인 -->
				<div>
					<label for="signup-confirm-password" class="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
						{t.confirmPassword}
					</label>
					<div class="relative">
						<input
							id="signup-confirm-password"
							type={showConfirmPassword ? 'text' : 'password'}
							bind:value={confirmPassword}
							required
							disabled={loading}
							class="w-full px-4 py-2.5 sm:py-3 pr-20 rounded-xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm outline-none focus:ring-2 {confirmPassword.length > 0
								? passwordMatch
									? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
									: 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
								: 'border-slate-300 focus:border-purple-500 focus:ring-purple-500/20'}"
							placeholder="••••••••"
						/>
						<div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
							{#if confirmPassword.length > 0}
								<div>
									{#if passwordMatch}
										<svg
											class="h-5 w-5 text-green-500"
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
									{:else}
										<svg
											class="h-5 w-5 text-red-500"
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
									{/if}
								</div>
							{/if}
							<button
								type="button"
								onclick={() => (showConfirmPassword = !showConfirmPassword)}
								class="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
								tabindex="-1"
							>
								{#if showConfirmPassword}
									<!-- 눈 아이콘 (숨김) -->
									<svg
										class="h-5 w-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 015.12 5.12m3.17 1.17L3 3m0 0l18 18m-3.29-3.29a9.97 9.97 0 01-1.563 3.029M12 12l-4.242-4.242M12 12l3.29 3.29"
										/>
									</svg>
								{:else}
									<!-- 눈 아이콘 (표시) -->
									<svg
										class="h-5 w-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								{/if}
							</button>
						</div>
					</div>
					{#if confirmPassword.length > 0}
						<p
							class="mt-1 text-xs {passwordMatch ? 'text-green-600' : 'text-red-600'}"
						>
							{#if passwordMatch}
								<span class="flex items-center gap-1">
									<svg
										class="h-3 w-3"
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
									{t.passwordMatch || '비밀번호가 일치합니다'}
								</span>
							{:else}
								<span class="flex items-center gap-1">
									<svg
										class="h-3 w-3"
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
									{t.passwordMismatch}
								</span>
							{/if}
						</p>
					{/if}
				</div>

				<!-- 에러 메시지 -->
				{#if error}
					<div class="rounded-xl border-2 border-red-300/50 bg-gradient-to-br from-red-50/80 to-pink-50/80 backdrop-blur-sm px-4 py-3 text-xs sm:text-sm text-red-700">
						{error}
					</div>
				{/if}

				<!-- 회원가입 버튼 -->
				<button
					type="submit"
					disabled={loading}
					class="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? '처리 중...' : t.signupButton}
				</button>

				<!-- 로그인 링크 -->
				<div class="text-center text-xs sm:text-sm text-slate-600">
					<span>{t.hasAccount}</span>
					<a href="/login" class="ml-1 text-purple-600 font-semibold hover:text-purple-700 underline">
						{t.login}
					</a>
				</div>
			</form>
		{/if}
	</div>
</div>


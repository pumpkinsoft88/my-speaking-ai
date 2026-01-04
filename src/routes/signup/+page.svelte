<!-- /src/routes/signup/+page.svelte -->
<script>
	import SignupForm from '$lib/components/SignupForm.svelte';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import { translations } from '$lib/i18n/translations.js';
	import { authStore } from '$lib/stores/auth.js';
	import { goto } from '$app/navigation';

	let currentLanguage = $state('korean');
	let t = $derived(translations[currentLanguage]);

	// 이미 로그인된 경우 홈으로 리다이렉트
	$effect(() => {
		if ($authStore.user) {
			goto('/');
		}
	});

	function handleLanguageChange(langCode) {
		currentLanguage = langCode;
		t = translations[langCode];
	}
</script>

<style>
	.english-title-2line {
		white-space: normal !important;
		word-break: break-word;
		text-align: left !important;
		display: block;
		width: 100%;
		max-width: 280px;
		line-height: 1.3;
	}
</style>

<main class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
	<!-- 배경 장식 -->
	<div class="fixed inset-0 overflow-hidden pointer-events-none">
		<div class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl"></div>
		<div class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl"></div>
	</div>

	<div class="relative mx-auto min-h-screen max-w-6xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6 lg:pb-8">
		<!-- 헤더 -->
		<div class="mb-8 sm:mb-10 lg:mb-12">
			<div class="mx-auto w-full max-w-4xl rounded-3xl border-2 border-white/50 bg-white/70 backdrop-blur-xl shadow-2xl shadow-purple-500/10 p-4 sm:p-6 relative overflow-visible" style="z-index: 1;">
				<div class="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
					<!-- 앱 로고 및 이름 -->
					<a href="/" class="flex items-center gap-2 sm:gap-3 group flex-shrink-0 min-w-0 {currentLanguage === 'english' ? 'flex-col sm:flex-row' : ''}">
						<div class="relative rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-2 sm:p-3 shadow-lg shadow-purple-500/30 transition-transform group-hover:scale-105 flex-shrink-0">
							<svg
								class="h-6 w-6 sm:h-8 sm:w-8 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
							<div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
						</div>
						<h1 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight {currentLanguage === 'english' ? 'english-title-2line whitespace-pre-line' : 'whitespace-nowrap'}">
							{currentLanguage === 'english' ? 'Chinese Conversation\nPractice' : t.title}
						</h1>
					</a>

					<!-- 인증 버튼 및 언어 선택기 -->
					<div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
						<!-- 인증 버튼 -->
						<div class="flex items-center gap-2 sm:gap-3">
							<a
								href="/login"
								class="flex items-center justify-center min-h-[52px] sm:min-h-[56px] rounded-xl border-2 border-purple-200/50 bg-gradient-to-r from-white/80 to-purple-50/50 backdrop-blur-sm px-6 sm:px-7 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-slate-700 shadow-lg transition-all hover:scale-105 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/30 whitespace-nowrap"
							>
								{t.auth?.login || '로그인'}
							</a>
							<a
								href="/signup"
								class="flex items-center justify-center min-h-[52px] sm:min-h-[56px] rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 sm:px-7 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40 whitespace-nowrap"
							>
								{t.auth?.signup || '회원가입'}
							</a>
						</div>
						<!-- 언어 선택기 -->
						<div class="flex-shrink-0" style="position: relative; z-index: 9999;">
							<LanguageSelector {currentLanguage} onLanguageChange={handleLanguageChange} />
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 회원가입 폼 -->
		<div class="flex items-center justify-center min-h-[calc(100vh-200px)]">
			<div class="w-full max-w-4xl">
				<SignupForm {currentLanguage} />
			</div>
		</div>
	</div>
</main>


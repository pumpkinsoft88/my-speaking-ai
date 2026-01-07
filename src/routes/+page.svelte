<!-- /src/routes/+page.svelte -->
<script>
	import RealtimeConversation from '$lib/components/RealtimeConversation.svelte';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import { translations } from '$lib/i18n/translations.js';
	import { authStore, signOut } from '$lib/stores/auth.js';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let error = $state('');
	let currentLanguage = $state('korean');
	let t = $derived(translations[currentLanguage]);
	let showScrollTop = $state(false);

	function handleError(message) {
		error = message;
		setTimeout(() => {
			error = '';
		}, 5000);
	}

	function handleConversationSaved() {
		// 대화 저장 성공 시 처리 (필요시 추가)
	}

	function handleLanguageChange(langCode) {
		currentLanguage = langCode;
		t = translations[langCode];
	}

	async function handleLogout() {
		await signOut();
		goto('/login');
	}

	function scrollToTop() {
		if (browser) {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function handleScroll() {
		if (browser) {
			showScrollTop = window.scrollY > 300;
		}
	}


	onMount(() => {
		if (browser) {
			window.addEventListener('scroll', handleScroll);
			handleScroll(); // 초기 상태 확인
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('scroll', handleScroll);
		}
	});
</script>

<main class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
	<!-- 배경 장식 -->
	<div class="fixed inset-0 overflow-hidden pointer-events-none">
		<div class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl"></div>
		<div class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl"></div>
	</div>

	<div class="relative mx-auto min-h-screen max-w-5xl px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-6 pb-4 sm:pb-6">
		<!-- 헤더 -->
		<div class="mb-4 sm:mb-6">
			<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
				<!-- 인증 버튼 -->
				<div class="flex flex-wrap items-center gap-2">
					{#if $authStore.user}
						<span class="text-xs sm:text-sm text-slate-600 truncate max-w-[150px] sm:max-w-none">
							{$authStore.user.email}
						</span>
						<button
							onclick={handleLogout}
							class="rounded-lg border border-purple-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-purple-50 transition-colors"
						>
							{t.auth?.logout || '로그아웃'}
						</button>
					{:else}
						<a
							href="/login"
							class="rounded-lg border border-purple-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-purple-50 transition-colors"
						>
							{t.auth?.login || '로그인'}
						</a>
						<a
							href="/signup"
							class="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1.5 text-xs font-medium text-white shadow-md hover:shadow-lg transition-all"
						>
							{t.auth?.signup || '회원가입'}
						</a>
					{/if}
				</div>
				<!-- 언어 선택기 -->
				<div class="flex justify-end">
					<LanguageSelector {currentLanguage} onLanguageChange={handleLanguageChange} />
				</div>
			</div>
		</div>

		<!-- 제목 -->
		<div class="mb-4 sm:mb-6 text-center">
			<h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
				{t.title}
			</h1>
			<p class="mt-1 text-xs sm:text-sm text-slate-600">{t.subtitle}</p>
		</div>

		<!-- 메인 콘텐츠 - 대화 기록과 컨트롤 통합 -->
		<div class="space-y-4">
			<RealtimeConversation 
				onError={handleError} 
				{currentLanguage}
				onConversationSaved={handleConversationSaved}
			/>
		</div>

		<!-- 에러 메시지 -->
		{#if error}
			<div
				class="mx-auto mt-6 max-w-md rounded-2xl border-2 border-red-300/50 bg-gradient-to-br from-red-50/80 to-pink-50/80 backdrop-blur-sm px-6 py-4 text-center text-sm text-red-700 shadow-xl"
			>
				<div class="flex items-center justify-center gap-2">
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
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					{error}
				</div>
			</div>
		{/if}

		<!-- 푸터 정보 -->
		<div class="mt-6 text-center text-xs text-slate-500">
			<p>{t.footer}</p>
		</div>
	</div>

	<!-- 맨 위로 가기 버튼 -->
	{#if showScrollTop}
		<button
			onclick={scrollToTop}
			class="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:scale-110 hover:shadow-purple-500/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
			aria-label="맨 위로 가기"
		>
			<svg
				class="h-6 w-6"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2.5"
					d="M5 10l7-7m0 0l7 7m-7-7v18"
				/>
			</svg>
		</button>
	{/if}
</main>

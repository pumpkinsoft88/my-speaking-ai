<!-- /src/routes/+page.svelte -->
<script>
	import RealtimeConversation from '$lib/components/RealtimeConversation.svelte';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import ConversationList from '$lib/components/ConversationList.svelte';
	import ConversationDetail from '$lib/components/ConversationDetail.svelte';
	import { translations } from '$lib/i18n/translations.js';
	import { authStore, signOut } from '$lib/stores/auth.js';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let error = $state('');
	let currentLanguage = $state('korean');
	let t = $derived(translations[currentLanguage]);
	let showScrollTop = $state(false);
	let activeTab = $state('conversation'); // 'conversation' or 'history'
	let selectedConversationId = $state(null);

	function handleError(message) {
		error = message;
		setTimeout(() => {
			error = '';
		}, 5000);
	}

	function handleSelectConversation(conversationId) {
		selectedConversationId = conversationId;
	}

	function handleCloseDetail() {
		selectedConversationId = null;
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

	<div class="relative mx-auto min-h-screen max-w-6xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6 lg:pb-8">
		<!-- 헤더 -->
		<div class="mb-8 sm:mb-10 lg:mb-12">
			<div class="mx-auto w-full max-w-2xl rounded-3xl border-2 border-white/50 bg-white/70 backdrop-blur-xl shadow-2xl shadow-purple-500/10 p-4 sm:p-6 overflow-visible" style="position: relative; z-index: 1;">
				<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-3">
					<!-- 인증 버튼 -->
					<div class="flex flex-wrap items-stretch gap-2 sm:gap-3 flex-1">
						{#if $authStore.user}
							<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto flex-1 sm:flex-initial">
								<span class="text-xs sm:text-sm font-medium text-slate-600 truncate max-w-[200px] sm:max-w-none flex items-center">
									{$authStore.user.email}
								</span>
								<button
									onclick={handleLogout}
									class="flex items-center justify-center min-h-[44px] rounded-xl border-2 border-purple-200/50 bg-gradient-to-r from-white/80 to-purple-50/50 backdrop-blur-sm px-4 sm:px-5 py-2.5 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-lg transition-all hover:scale-105 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/30 whitespace-nowrap"
								>
									{t.auth?.logout || '로그아웃'}
								</button>
							</div>
						{:else}
							<div class="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto flex-1 sm:flex-initial">
								<a
									href="/login"
									class="flex items-center justify-center min-h-[44px] text-center rounded-xl border-2 border-purple-200/50 bg-gradient-to-r from-white/80 to-purple-50/50 backdrop-blur-sm px-4 sm:px-5 py-2.5 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-lg transition-all hover:scale-105 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/30 whitespace-nowrap"
								>
									{t.auth?.login || '로그인'}
								</a>
								<a
									href="/signup"
									class="flex items-center justify-center min-h-[44px] text-center rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 sm:px-5 py-2.5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40 whitespace-nowrap"
								>
									{t.auth?.signup || '회원가입'}
								</a>
							</div>
						{/if}
					</div>
					<!-- 언어 선택기 -->
					<div class="w-full sm:w-auto flex justify-end sm:justify-start flex-shrink-0" style="position: relative; z-index: 9999;">
						<LanguageSelector {currentLanguage} onLanguageChange={handleLanguageChange} />
					</div>
				</div>
			</div>
		</div>

		<!-- 제목 섹션 -->
		<div class="mb-8 sm:mb-12 lg:mb-16 flex flex-col items-center">
			<div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 mb-4">
				<!-- 모던한 아이콘 -->
				<div
					class="relative rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-3 sm:p-5 shadow-2xl shadow-purple-500/30 transition-transform hover:scale-105"
				>
					<svg
						class="h-8 w-8 sm:h-12 sm:w-12 text-white"
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
					<!-- 글로우 효과 -->
					<div class="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent"></div>
				</div>
				<div class="flex flex-col items-center sm:items-start">
					<h1
						class="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm text-center sm:text-left"
					>
						{t.title}
					</h1>
					<p class="text-base sm:text-lg lg:text-xl font-medium text-slate-600 mt-1 text-center sm:text-left">{t.subtitle}</p>
				</div>
			</div>
			<p class="text-center text-slate-600 max-w-lg text-sm sm:text-base lg:text-lg px-4">
				{t.description}
			</p>
		</div>

		<!-- 탭 메뉴 -->
		{#if $authStore.user}
			<div class="mx-auto w-full max-w-2xl mb-6">
				<div class="flex gap-2 rounded-2xl border-2 border-white/50 bg-white/70 backdrop-blur-xl p-2 shadow-lg">
					<button
						onclick={() => activeTab = 'conversation'}
						class="flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all {activeTab === 'conversation' ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}"
					>
						💬 대화하기
					</button>
					<button
						onclick={() => activeTab = 'history'}
						class="flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all {activeTab === 'history' ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}"
					>
						📚 대화 기록
					</button>
				</div>
			</div>
		{/if}

		<!-- 메인 콘텐츠 카드 -->
		<div
			class="mx-auto w-full max-w-2xl rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl shadow-purple-500/10 border-2 border-white/50 p-4 sm:p-6 lg:p-8 transition-all hover:shadow-3xl hover:shadow-purple-500/20"
		>
			{#if activeTab === 'conversation'}
				<RealtimeConversation onError={handleError} {currentLanguage} />
			{:else if activeTab === 'history' && $authStore.user}
				<ConversationList 
					{currentLanguage} 
					onSelectConversation={handleSelectConversation}
					onError={handleError}
				/>
			{/if}
		</div>

		<!-- 대화 상세 모달 -->
		{#if selectedConversationId}
			<ConversationDetail 
				conversationId={selectedConversationId}
				{currentLanguage}
				onClose={handleCloseDetail}
				onError={handleError}
			/>
		{/if}

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
		<div class="mt-8 text-center text-sm text-slate-500 font-medium">
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

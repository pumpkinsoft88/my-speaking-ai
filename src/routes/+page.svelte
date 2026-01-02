<script>
	import RealtimeConversation from '$lib/components/RealtimeConversation.svelte';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import { translations } from '$lib/i18n/translations.js';

	let error = '';
	let currentLanguage = 'traditional';
	let t = translations[currentLanguage];

	function handleError(message) {
		error = message;
		setTimeout(() => {
			error = '';
		}, 5000);
	}

	function handleLanguageChange(langCode) {
		currentLanguage = langCode;
		t = translations[langCode];
	}
</script>

<main class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
	<!-- 배경 장식 -->
	<div class="fixed inset-0 overflow-hidden pointer-events-none">
		<div class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl"></div>
		<div class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl"></div>
	</div>

	<div class="relative mx-auto min-h-screen max-w-6xl px-4 py-8">
		<!-- 헤더 -->
		<div class="mb-8 flex flex-col items-center gap-6">
			<!-- 언어 선택기 -->
			<div class="flex w-full justify-end">
				<LanguageSelector {currentLanguage} onLanguageChange={handleLanguageChange} />
			</div>

			<div class="flex items-center gap-5">
				<!-- 모던한 아이콘 -->
				<div
					class="relative rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5 shadow-2xl shadow-purple-500/30 transition-transform hover:scale-105"
				>
					<svg
						class="h-12 w-12 text-white"
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
				<div class="flex flex-col">
					<h1
						class="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm"
					>
						{t.title}
					</h1>
					<p class="text-xl font-medium text-slate-600 mt-1">{t.subtitle}</p>
				</div>
			</div>
			<p class="text-center text-slate-600 max-w-lg text-lg">
				{t.description}
			</p>
		</div>

		<!-- 메인 콘텐츠 카드 -->
		<div
			class="rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl shadow-purple-500/10 border border-white/50 p-8 lg:p-10 transition-all hover:shadow-3xl hover:shadow-purple-500/20"
		>
			<RealtimeConversation onError={handleError} {currentLanguage} />
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
		<div class="mt-8 text-center text-sm text-slate-500 font-medium">
			<p>{t.footer}</p>
		</div>
	</div>
</main>

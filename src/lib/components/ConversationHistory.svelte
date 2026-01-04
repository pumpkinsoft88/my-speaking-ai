<!-- /src/lib/components/ConversationHistory.svelte -->
<script>
	import { translations } from '$lib/i18n/translations.js';

	export let messages = [];
	export let currentLanguage = 'traditional';
	export let displayMode = 'dual'; // 'dual' or 'chinese-only'
	
	let t = translations[currentLanguage];
	
	$: {
		t = translations[currentLanguage];
	}

	// 메시지에서 중국어와 한국어 번역 분리
	function parseMessage(text) {
		if (!text) return { chinese: '', korean: '' };
		
		// 괄호 안의 한국어 번역 추출 (예: "你好 (안녕하세요)")
		const koreanMatch = text.match(/\(([^)]+)\)/g);
		let korean = '';
		let chinese = text;
		
		if (koreanMatch) {
			// 모든 한국어 번역 추출
			korean = koreanMatch.map(m => m.replace(/[()]/g, '')).join(' ');
			// 중국어 텍스트에서 괄호 부분 제거
			chinese = text.replace(/\([^)]+\)/g, '').trim();
		}
		
		return { chinese, korean };
	}
</script>

{#if messages.length > 0}
	<div
		class="w-full space-y-4 rounded-3xl border-2 border-white/50 bg-gradient-to-br from-white/70 via-purple-50/30 to-pink-50/30 backdrop-blur-xl p-4 sm:p-6 lg:p-8 shadow-2xl shadow-purple-500/10"
	>
		<!-- 헤더 -->
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-purple-200/50 pb-4">
			<h3 class="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
				<span class="text-2xl sm:text-3xl">💬</span>
				<span>{t.conversation.title}</span>
				<span class="text-xs sm:text-sm font-normal text-slate-500">({t.conversation.titleEn})</span>
			</h3>
			<span class="rounded-full bg-gradient-to-r from-purple-400 to-pink-400 px-3 sm:px-4 py-1.5 text-xs font-bold text-white shadow-md whitespace-nowrap">
				{messages.length} {t.conversation.messages}
			</span>
		</div>

		<!-- 메시지 목록 -->
		<div class="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
			{#each messages as message, index}
				<div
					class="group relative flex gap-3 sm:gap-4 rounded-2xl p-4 sm:p-5 transition-all hover:shadow-xl hover:scale-[1.02] {message.role ===
					'assistant'
						? 'bg-gradient-to-br from-purple-50/80 to-pink-50/80 border-l-4 border-purple-400 shadow-md'
						: 'bg-gradient-to-br from-indigo-50/80 to-blue-50/80 border-l-4 border-indigo-400 shadow-md'}"
				>
					<!-- 아바타 -->
					<div
						class="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl text-lg sm:text-xl font-bold shadow-lg transition-transform group-hover:scale-110 {message.role ===
						'assistant'
							? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
							: 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white'}"
					>
						{message.role === 'assistant' ? (currentLanguage === 'traditional' ? '師' : currentLanguage === 'simplified' ? '师' : 'T') : (currentLanguage === 'traditional' || currentLanguage === 'simplified' ? '你' : 'Y')}
					</div>

					<!-- 메시지 내용 -->
					<div class="flex-1 min-w-0">
						<div class="mb-2 flex items-center gap-2">
							<span
								class="text-xs sm:text-sm font-bold {message.role === 'assistant'
									? 'text-purple-700'
									: 'text-indigo-700'}"
							>
								{message.role === 'assistant' ? t.conversation.teacher : t.conversation.you}
							</span>
							<span class="text-xs text-slate-400 font-medium">
								{new Date(message.timestamp).toLocaleTimeString('ko-KR', {
									hour: '2-digit',
									minute: '2-digit'
								})}
							</span>
						</div>
						<div
							class="text-sm sm:text-base leading-relaxed {message.role === 'assistant'
								? 'text-slate-800'
								: 'text-slate-700'}"
						>
							{#if message.content && message.content[0]}
								{#if message.content[0].type === 'text'}
									{@const parsed = parseMessage(message.content[0].text)}
									{#if message.role === 'assistant' && displayMode === 'dual' && parsed.korean}
										<!-- 이중 언어 모드: 중국어 + 한국어 -->
										<div class="space-y-2">
											<p class="whitespace-pre-wrap break-words text-base sm:text-lg font-medium text-slate-900">
												{parsed.chinese || message.content[0].text}
											</p>
											<p class="whitespace-pre-wrap break-words text-xs sm:text-sm text-slate-600 italic border-l-2 border-purple-300 pl-2 sm:pl-3 py-1 bg-purple-50/50 rounded-r">
												🇰🇷 {parsed.korean}
											</p>
										</div>
									{:else}
										<!-- 중국어만 모드 또는 사용자 메시지 -->
										<p class="whitespace-pre-wrap break-words">
											{displayMode === 'chinese-only' ? parsed.chinese || message.content[0].text : message.content[0].text}
										</p>
									{/if}
								{:else}
									<div class="flex items-center gap-2 text-slate-500">
										<svg
											class="h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
											/>
										</svg>
										<span>{t.conversation.audioMessage}</span>
									</div>
								{/if}
							{:else}
								<div class="flex items-center gap-2 text-slate-400">
									<div class="h-2 w-2 animate-pulse rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
									<span>{t.conversation.processing}</span>
								</div>
							{/if}
						</div>
					</div>

					<!-- 장식 요소 -->
					{#if message.role === 'assistant'}
						<div
							class="absolute right-3 top-3 text-3xl opacity-5 transition-opacity group-hover:opacity-10"
						>
							{currentLanguage === 'traditional' ? '繁' : currentLanguage === 'simplified' ? '简' : '中'}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{:else}
	<!-- 빈 상태 -->
	<div
		class="mx-auto w-full max-w-2xl rounded-3xl border-2 border-dashed border-purple-200/50 bg-gradient-to-br from-white/60 to-purple-50/30 backdrop-blur-sm p-6 sm:p-8 lg:p-10 text-center shadow-lg"
	>
		<div class="mb-4 text-4xl sm:text-5xl">📝</div>
		<p class="text-sm sm:text-base font-semibold text-slate-600">{t.conversation.empty}</p>
	</div>
{/if}

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: linear-gradient(to bottom, #a855f7, #ec4899);
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: linear-gradient(to bottom, #9333ea, #db2777);
	}
</style>

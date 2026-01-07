<!-- /src/lib/components/ConversationHistory.svelte -->
<script>
	import { translations } from '$lib/i18n/translations.js';

	let {
		messages = [],
		currentLanguage = 'traditional',
		displayMode = 'dual', // 'dual' or 'chinese-only'
		isUserSpeaking = false, // 사용자가 말하는 중인지
		isAssistantSpeaking = false // 튜터가 말하는 중인지
	} = $props();
	
	let t = $derived(translations[currentLanguage]);

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
	<div class="w-full space-y-2 sm:space-y-3">
		<!-- 메시지 목록 -->
		<div class="space-y-2 sm:space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
			{#each messages as message, index}
				{@const isSpeaking = (message.role === 'user' && isUserSpeaking && index === messages.length - 1) || 
				          (message.role === 'assistant' && isAssistantSpeaking && index === messages.length - 1)}
				<div
					class="group relative flex gap-2 sm:gap-3 rounded-xl p-3 sm:p-4 transition-all {isSpeaking
						? message.role === 'assistant'
							? 'bg-purple-50 border-l-2 border-purple-500'
							: 'bg-indigo-50 border-l-2 border-indigo-500'
						: message.role === 'assistant'
							? 'bg-purple-50/50 border-l-2 border-purple-300'
							: 'bg-indigo-50/50 border-l-2 border-indigo-300'}"
				>
					<!-- 아바타 -->
					<div
						class="relative flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg text-sm sm:text-base font-bold {isSpeaking
							? message.role === 'assistant'
								? 'bg-purple-500 text-white ring-2 ring-purple-400/50'
								: 'bg-indigo-500 text-white ring-2 ring-indigo-400/50'
							: message.role === 'assistant'
								? 'bg-purple-500 text-white'
								: 'bg-indigo-500 text-white'}"
					>
						{#if isSpeaking}
							<!-- 말하는 중 파동 효과 -->
							<div class="absolute inset-0 rounded-2xl {message.role === 'assistant' ? 'bg-purple-400' : 'bg-indigo-400'} opacity-60 animate-ping"></div>
							<div class="absolute inset-0 rounded-2xl {message.role === 'assistant' ? 'bg-purple-300' : 'bg-indigo-300'} opacity-40 animate-pulse"></div>
						{/if}
						<span class="relative z-10">
							{message.role === 'assistant' ? (currentLanguage === 'traditional' ? '師' : currentLanguage === 'simplified' ? '师' : 'T') : (currentLanguage === 'traditional' || currentLanguage === 'simplified' ? '你' : 'Y')}
						</span>
					</div>

					<!-- 메시지 내용 -->
					<div class="flex-1 min-w-0">
						<div class="mb-1 flex items-center gap-2">
							<span class="text-xs font-semibold {message.role === 'assistant' ? 'text-purple-700' : 'text-indigo-700'}">
								{message.role === 'assistant' ? t.conversation.teacher : t.conversation.you}
							</span>
							<span class="text-xs text-slate-400">
								{new Date(message.timestamp).toLocaleTimeString('ko-KR', {
									hour: '2-digit',
									minute: '2-digit'
								})}
							</span>
							{#if isSpeaking}
								<span class="text-xs text-slate-500 animate-pulse">말하는 중...</span>
							{/if}
						</div>
						<div class="text-sm sm:text-base leading-relaxed text-slate-800">
							{#if message.content && message.content[0]}
								{#if message.content[0].type === 'text'}
									{@const parsed = parseMessage(message.content[0].text)}
									{#if message.role === 'assistant' && displayMode === 'dual' && parsed.korean}
										<!-- 이중 언어 모드: 중국어 + 한국어 -->
										<div class="space-y-1">
											<p class="whitespace-pre-wrap break-words text-sm sm:text-base font-medium text-slate-900">
												{parsed.chinese || message.content[0].text}
												{#if isSpeaking}
													<span class="inline-block ml-1 animate-bounce">|</span>
												{/if}
											</p>
											<p class="whitespace-pre-wrap break-words text-xs text-slate-600 italic border-l-2 border-purple-300 pl-2 py-0.5 bg-purple-50/50 rounded-r">
												🇰🇷 {parsed.korean}
											</p>
										</div>
									{:else}
										<!-- 중국어만 모드 또는 사용자 메시지 -->
										<p class="whitespace-pre-wrap break-words {isSpeaking ? 'animate-pulse' : ''}">
											{displayMode === 'chinese-only' ? parsed.chinese || message.content[0].text : message.content[0].text}
											{#if isSpeaking}
												<span class="inline-block ml-1 animate-bounce">|</span>
											{/if}
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

				</div>
			{/each}
		</div>
	</div>
{:else}
	<!-- 빈 상태 -->
	<div class="text-center py-8">
		<p class="text-sm text-slate-500">{t.conversation.empty}</p>
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
	
	@keyframes speaking {
		0%, 100% {
			height: 4px;
			opacity: 0.4;
		}
		50% {
			height: 20px;
			opacity: 1;
		}
	}
</style>

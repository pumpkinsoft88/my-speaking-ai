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
				{@const isSpeaking = (message.role === 'user' && isUserSpeaking && index === messages.length - 1) || 
				          (message.role === 'assistant' && isAssistantSpeaking && index === messages.length - 1)}
				<div
					class="group relative flex gap-3 sm:gap-4 rounded-2xl p-4 sm:p-5 transition-all hover:shadow-xl hover:scale-[1.02] {isSpeaking
						? message.role === 'assistant'
							? 'bg-gradient-to-br from-purple-100/90 to-pink-100/90 border-l-4 border-purple-500 shadow-xl ring-2 ring-purple-400/50 scale-[1.02]'
							: 'bg-gradient-to-br from-indigo-100/90 to-blue-100/90 border-l-4 border-indigo-500 shadow-xl ring-2 ring-indigo-400/50 scale-[1.02]'
						: message.role === 'assistant'
							? 'bg-gradient-to-br from-purple-50/80 to-pink-50/80 border-l-4 border-purple-400 shadow-md'
							: 'bg-gradient-to-br from-indigo-50/80 to-blue-50/80 border-l-4 border-indigo-400 shadow-md'}"
				>
					<!-- 아바타 -->
					<div
						class="relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl text-lg sm:text-xl font-bold shadow-lg transition-transform group-hover:scale-110 {isSpeaking
							? message.role === 'assistant'
								? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white ring-4 ring-purple-400/50 scale-110 animate-pulse'
								: 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white ring-4 ring-indigo-400/50 scale-110 animate-pulse'
							: message.role === 'assistant'
								? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
								: 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white'}"
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
						<div class="mb-2 flex items-center gap-2">
							<span
								class="text-xs sm:text-sm font-bold transition-all {isSpeaking
									? message.role === 'assistant'
										? 'text-purple-800 scale-105'
										: 'text-indigo-800 scale-105'
									: message.role === 'assistant'
										? 'text-purple-700'
										: 'text-indigo-700'}"
							>
								{message.role === 'assistant' ? t.conversation.teacher : t.conversation.you}
								{#if isSpeaking}
									<span class="ml-2 inline-flex items-center gap-1">
										<span class="relative flex h-2 w-2">
											<span class="absolute inline-flex h-full w-full animate-ping rounded-full {message.role === 'assistant' ? 'bg-purple-400' : 'bg-indigo-400'} opacity-75"></span>
											<span class="relative inline-flex h-2 w-2 rounded-full {message.role === 'assistant' ? 'bg-purple-500' : 'bg-indigo-500'}"></span>
										</span>
										<span class="text-xs font-normal animate-pulse">말하는 중...</span>
									</span>
								{/if}
							</span>
							<span class="text-xs text-slate-400 font-medium">
								{new Date(message.timestamp).toLocaleTimeString('ko-KR', {
									hour: '2-digit',
									minute: '2-digit'
								})}
							</span>
						</div>
						<div
							class="text-sm sm:text-base leading-relaxed transition-all {isSpeaking
								? message.role === 'assistant'
									? 'text-slate-900 font-medium'
									: 'text-slate-800 font-medium'
								: message.role === 'assistant'
									? 'text-slate-800'
									: 'text-slate-700'}"
						>
							{#if message.content && message.content[0]}
								{#if message.content[0].type === 'text'}
									{@const parsed = parseMessage(message.content[0].text)}
									{#if message.role === 'assistant' && displayMode === 'dual' && parsed.korean}
										<!-- 이중 언어 모드: 중국어 + 한국어 -->
										<div class="space-y-2">
											<p class="whitespace-pre-wrap break-words text-base sm:text-lg font-medium text-slate-900 {isSpeaking ? 'animate-pulse' : ''}">
												{parsed.chinese || message.content[0].text}
												{#if isSpeaking}
													<span class="inline-block ml-1 animate-bounce">|</span>
												{/if}
											</p>
											<p class="whitespace-pre-wrap break-words text-xs sm:text-sm text-slate-600 italic border-l-2 border-purple-300 pl-2 sm:pl-3 py-1 bg-purple-50/50 rounded-r {isSpeaking ? 'bg-purple-100/70' : ''}">
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

					<!-- 장식 요소 -->
					{#if message.role === 'assistant'}
						<div
							class="absolute right-3 top-3 text-3xl transition-opacity {isSpeaking ? 'opacity-20 animate-pulse' : 'opacity-5 group-hover:opacity-10'}"
						>
							{currentLanguage === 'traditional' ? '繁' : currentLanguage === 'simplified' ? '简' : '中'}
						</div>
					{/if}
					
					<!-- 말하는 중 파형 애니메이션 -->
					{#if isSpeaking}
						<div class="absolute bottom-2 right-2 flex items-end gap-1 h-6">
							<div class="w-1 bg-purple-400 rounded-full animate-[speaking_0.6s_ease-in-out_infinite] {message.role === 'assistant' ? 'bg-purple-400' : 'bg-indigo-400'}" style="animation-delay: 0s;"></div>
							<div class="w-1 bg-purple-400 rounded-full animate-[speaking_0.6s_ease-in-out_infinite] {message.role === 'assistant' ? 'bg-purple-400' : 'bg-indigo-400'}" style="animation-delay: 0.1s;"></div>
							<div class="w-1 bg-purple-400 rounded-full animate-[speaking_0.6s_ease-in-out_infinite] {message.role === 'assistant' ? 'bg-purple-400' : 'bg-indigo-400'}" style="animation-delay: 0.2s;"></div>
							<div class="w-1 bg-purple-400 rounded-full animate-[speaking_0.6s_ease-in-out_infinite] {message.role === 'assistant' ? 'bg-purple-400' : 'bg-indigo-400'}" style="animation-delay: 0.3s;"></div>
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

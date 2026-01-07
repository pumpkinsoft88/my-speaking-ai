<!-- /src/lib/components/ConversationDetail.svelte -->
<script>
	import { onMount } from 'svelte';
	import { getConversationById } from '$lib/supabase/conversations.js';
	import ConversationHistory from './ConversationHistory.svelte';
	import { translations } from '$lib/i18n/translations.js';

	export let conversationId = null;
	export let currentLanguage = 'traditional';
	export let onClose = null;
	export let onError = null;

	let t = translations[currentLanguage];
	
	$: {
		t = translations[currentLanguage];
	}

	let conversation = null;
	let loading = true;
	let displayMode = 'dual'; // 'dual' or 'chinese-only'

	// 언어별 레벨/모드 표시 텍스트
	const levelLabels = {
		beginner: '초급',
		intermediate: '중급',
		advanced: '고급'
	};

	const modeLabels = {
		free: '자유 대화',
		vocabulary: '단어 연습',
		sentence: '문장 연습'
	};

	const languageLabels = {
		traditional: '繁體中文',
		simplified: '简体中文',
		english: 'English'
	};

	async function loadConversation() {
		if (!conversationId) return;

		loading = true;
		try {
			const { data, error } = await getConversationById(conversationId);
			if (error) throw error;
			conversation = data;
			// 대화의 언어 설정에 맞춰 displayMode 조정
			if (data.language === 'english') {
				displayMode = 'chinese-only';
			}
		} catch (err) {
			console.error('대화 상세 로드 오류:', err);
			if (onError) {
				onError('대화를 불러오는데 실패했습니다.');
			}
		} finally {
			loading = false;
		}
	}

	function formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleString('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	$: if (conversationId) {
		loadConversation();
	}
</script>

{#if conversationId}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
		<div class="relative w-full max-w-4xl max-h-[90vh] rounded-3xl border-2 border-white/50 bg-gradient-to-br from-white/90 via-purple-50/50 to-pink-50/50 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
			<!-- 헤더 -->
			<div class="flex items-start justify-between p-6 border-b border-purple-200/50 bg-white/50">
				<div class="flex-1 min-w-0 pr-4">
					<h2 class="text-xl font-bold text-slate-800 mb-2 truncate">
						{conversation?.title || '대화 상세'}
					</h2>
					{#if conversation}
						<div class="flex flex-wrap items-center gap-2 text-xs mb-2">
							<span class="rounded-full bg-purple-100 px-2 py-1 font-medium text-purple-700">
								{languageLabels[conversation.language] || conversation.language}
							</span>
							<span class="rounded-full bg-indigo-100 px-2 py-1 font-medium text-indigo-700">
								{levelLabels[conversation.level] || conversation.level}
							</span>
							<span class="rounded-full bg-pink-100 px-2 py-1 font-medium text-pink-700">
								{modeLabels[conversation.practice_mode] || conversation.practice_mode}
							</span>
						</div>
						<p class="text-xs text-slate-500">
							{formatDate(conversation.created_at)}
						</p>
					{/if}
				</div>
				<button
					on:click={() => onClose && onClose()}
					class="flex-shrink-0 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
					aria-label="닫기"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- 내용 -->
			<div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
				{#if loading}
					<div class="flex items-center justify-center py-12">
						<div class="flex flex-col items-center gap-3">
							<svg class="h-8 w-8 animate-spin text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							<p class="text-sm text-slate-600">대화를 불러오는 중...</p>
						</div>
					</div>
				{:else if conversation}
					<div class="space-y-4">
						<!-- 표시 모드 선택 -->
						<div class="flex items-center gap-2 mb-4">
							<span class="text-xs font-medium text-slate-600">표시 모드:</span>
							<button
								on:click={() => displayMode = 'dual'}
								class="rounded-lg px-3 py-1 text-xs font-medium transition-all {displayMode === 'dual' ? 'bg-purple-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
							>
								이중 언어
							</button>
							<button
								on:click={() => displayMode = 'chinese-only'}
								class="rounded-lg px-3 py-1 text-xs font-medium transition-all {displayMode === 'chinese-only' ? 'bg-purple-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
							>
								중국어만
							</button>
						</div>
						<!-- 대화 기록 -->
						<ConversationHistory 
							messages={conversation.messages || []} 
							currentLanguage={conversation.language || currentLanguage} 
							{displayMode}
						/>
					</div>
				{:else}
					<div class="text-center py-12">
						<p class="text-slate-600">대화를 불러올 수 없습니다.</p>
					</div>
				{/if}
			</div>
		</div>
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


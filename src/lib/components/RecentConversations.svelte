<!-- /src/lib/components/RecentConversations.svelte -->
<script>
	import { onMount } from 'svelte';
	import { getConversations } from '$lib/supabase/conversations.js';
	import { translations } from '$lib/i18n/translations.js';

	let { 
		currentLanguage = 'traditional',
		onSelectConversation = null,
		limit = 5 // 최근 대화 개수
	} = $props();

	let t = $derived(translations[currentLanguage]);

	let conversations = [];
	let loading = true;

	const languageLabels = {
		traditional: '繁體中文',
		simplified: '简体中文',
		english: 'English'
	};

	function formatDate(dateString) {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now - date;
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days === 0) {
			return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
		} else if (days === 1) {
			return '어제';
		} else if (days < 7) {
			return `${days}일 전`;
		} else {
			return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
		}
	}

	async function loadRecentConversations() {
		loading = true;
		try {
			const { data, error } = await getConversations({ limit });
			if (error) throw error;
			conversations = data || [];
		} catch (err) {
			console.error('최근 대화 로드 오류:', err);
			conversations = [];
		} finally {
			loading = false;
		}
	}

	// 외부에서 호출할 수 있는 새로고침 함수
	export function refresh() {
		loadRecentConversations();
	}

	onMount(() => {
		loadRecentConversations();
	});
</script>

{#if !loading && conversations.length > 0}
	<div class="w-full space-y-3">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
				📚 최근 대화
			</h3>
			{#if onSelectConversation}
				<button
					onclick={() => onSelectConversation('all')}
					class="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
				>
					전체 보기 →
				</button>
			{/if}
		</div>
		<div class="space-y-2">
			{#each conversations.slice(0, limit) as conversation}
				<button
					onclick={() => onSelectConversation && onSelectConversation(conversation.id)}
					class="w-full text-left rounded-xl border-2 border-purple-200/50 bg-gradient-to-br from-white/70 via-purple-50/30 to-pink-50/30 backdrop-blur-xl p-3 transition-all hover:shadow-lg hover:scale-[1.02] hover:border-purple-300"
				>
					<div class="flex items-start justify-between gap-2">
						<div class="flex-1 min-w-0">
							<h4 class="font-semibold text-slate-800 truncate mb-1">
								{conversation.title || '제목 없음'}
							</h4>
							<div class="flex items-center gap-2 text-xs">
								<span class="rounded-full bg-purple-100 px-2 py-0.5 font-medium text-purple-700">
									{languageLabels[conversation.language] || conversation.language}
								</span>
								{#if conversation.messageCount !== undefined}
									<span class="text-slate-500">
										{conversation.messageCount}개 메시지
									</span>
								{/if}
							</div>
						</div>
						<span class="text-xs text-slate-400 flex-shrink-0">
							{formatDate(conversation.created_at)}
						</span>
					</div>
				</button>
			{/each}
		</div>
	</div>
{/if}


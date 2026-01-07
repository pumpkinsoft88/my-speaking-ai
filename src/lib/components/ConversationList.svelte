<!-- /src/lib/components/ConversationList.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { getConversations, deleteConversation } from '$lib/supabase/conversations.js';
	import { supabase } from '$lib/supabase/client.js';
	import { translations } from '$lib/i18n/translations.js';

	export let currentLanguage = 'traditional';
	export let onSelectConversation = null;
	export let onError = null;

	// 외부에서 호출할 수 있는 새로고침 함수
	export function refresh() {
		loadConversations();
	}

	let t = $derived(translations[currentLanguage]);

	let conversations = [];
	let loading = true;
	let deletingId = null;
	let realtimeChannel = null; // Realtime 구독 채널

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

	async function loadConversations() {
		loading = true;
		try {
			console.log('📋 대화 목록 로드 시작...');
			const { data, error } = await getConversations({ limit: 100 });
			
			if (error) {
				console.error('❌ 대화 목록 로드 실패:', {
					error: error,
					message: error.message,
					details: error.details,
					hint: error.hint,
					code: error.code
				});
				throw error;
			}
			
			console.log('✅ 대화 목록 로드 성공:', {
				count: data?.length || 0,
				conversations: data?.map(c => ({ id: c.id, title: c.title }))
			});
			
			conversations = data || [];
			
			if (conversations.length === 0) {
				console.log('ℹ️ 저장된 대화가 없습니다.');
			}
		} catch (err) {
			console.error('❌ 대화 목록 로드 오류:', {
				error: err,
				message: err.message,
				stack: err.stack
			});
			conversations = [];
			if (onError) {
				const errorMessage = err.message || '대화 목록을 불러오는데 실패했습니다.';
				onError(errorMessage);
			}
		} finally {
			loading = false;
		}
	}

	async function handleDelete(conversationId, event) {
		event.stopPropagation();
		if (!confirm('이 대화를 삭제하시겠습니까?')) return;

		deletingId = conversationId;
		try {
			const { error } = await deleteConversation(conversationId);
			if (error) throw error;
			// 목록에서 제거
			conversations = conversations.filter(c => c.id !== conversationId);
		} catch (err) {
			console.error('대화 삭제 오류:', err);
			if (onError) {
				onError('대화 삭제에 실패했습니다.');
			}
		} finally {
			deletingId = null;
		}
	}

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

	/**
	 * Realtime 구독 설정
	 */
	async function setupRealtimeSubscription() {
		// 기존 구독이 있으면 제거하지 않고 재사용
		if (realtimeChannel) {
			console.log('📡 Realtime 구독이 이미 존재합니다. 재사용합니다.');
			return;
		}

		// 사용자 ID 가져오기
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			console.warn('⚠️ 사용자가 로그인하지 않았습니다. Realtime 구독을 설정할 수 없습니다.');
			return;
		}

		// conversations 테이블 변경사항 구독
		realtimeChannel = supabase
			.channel(`conversations-changes-${user.id}`)
			.on(
				'postgres_changes',
				{
					event: '*', // INSERT, UPDATE, DELETE 모두 감지
					schema: 'public',
					table: 'conversations',
					filter: `user_id=eq.${user.id}` // 현재 사용자의 대화만 구독
				},
				(payload) => {
					console.log('🔄 Realtime 업데이트:', payload);
					
					// 변경사항에 따라 목록 업데이트
					if (payload.eventType === 'INSERT') {
						// 새 대화 추가
						const newConversation = payload.new;
						conversations = [
							{
								id: newConversation.id,
								title: newConversation.title,
								language: newConversation.language,
								level: newConversation.level,
								practice_mode: newConversation.practice_mode,
								created_at: newConversation.created_at,
								updated_at: newConversation.updated_at,
								messageCount: Array.isArray(newConversation.messages) ? newConversation.messages.length : 0
							},
							...conversations
						];
					} else if (payload.eventType === 'UPDATE') {
						// 대화 업데이트
						const updatedConversation = payload.new;
						conversations = conversations.map(conv =>
							conv.id === updatedConversation.id
								? {
										...conv,
										title: updatedConversation.title,
										language: updatedConversation.language,
										level: updatedConversation.level,
										practice_mode: updatedConversation.practice_mode,
										updated_at: updatedConversation.updated_at,
										messageCount: Array.isArray(updatedConversation.messages) ? updatedConversation.messages.length : conv.messageCount
									}
								: conv
						);
					} else if (payload.eventType === 'DELETE') {
						// 대화 삭제
						const deletedId = payload.old.id;
						conversations = conversations.filter(conv => conv.id !== deletedId);
					}
				}
			)
			.subscribe((status) => {
				console.log('📡 Realtime 구독 상태:', status);
				if (status === 'SUBSCRIBED') {
					console.log('✅ Realtime 구독 성공');
				} else if (status === 'CHANNEL_ERROR') {
					console.error('❌ Realtime 구독 오류');
				}
			});

		return realtimeChannel;
	}

	async function initializeSubscription() {
		// 초기 목록 로드
		await loadConversations();
		
		// 사용자 ID 가져오기
		const { data: { user } } = await supabase.auth.getUser();
		
		if (user) {
			// Realtime 구독 설정 (이미 있으면 재사용)
			if (!realtimeChannel) {
				setupRealtimeSubscription();
			} else {
				// 구독이 이미 있으면 목록만 새로고침
				await loadConversations();
			}
		}
	}

	onMount(async () => {
		await initializeSubscription();
	});

	onDestroy(() => {
		// 컴포넌트 완전히 언마운트될 때만 구독 제거
		// (탭 전환 시에는 언마운트되지 않으므로 구독 유지)
		if (realtimeChannel) {
			console.log('🗑️ ConversationList 언마운트 - Realtime 구독 제거');
			supabase.removeChannel(realtimeChannel);
			realtimeChannel = null;
		}
	});
</script>

<div class="w-full space-y-4">
	<!-- 헤더 -->
	<div class="flex items-center justify-between mb-4">
		<h2 class="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
			💬 저장된 대화
		</h2>
		<button
			on:click={loadConversations}
			class="rounded-xl border-2 border-purple-200/50 bg-gradient-to-r from-white/80 to-purple-50/50 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-slate-700 shadow-md transition-all hover:scale-105 hover:border-purple-400 hover:shadow-lg"
			disabled={loading}
		>
			{loading ? '로딩 중...' : '🔄 새로고침'}
		</button>
	</div>

	{#if loading}
		<!-- 로딩 상태 -->
		<div class="flex items-center justify-center py-12">
			<div class="flex flex-col items-center gap-3">
				<svg class="h-8 w-8 animate-spin text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
				<p class="text-sm text-slate-600">대화 목록을 불러오는 중...</p>
			</div>
		</div>
	{:else if conversations.length === 0}
		<!-- 빈 상태 -->
		<div class="rounded-3xl border-2 border-dashed border-purple-200/50 bg-gradient-to-br from-white/60 to-purple-50/30 backdrop-blur-sm p-8 text-center">
			<div class="mb-4 text-4xl">📝</div>
			<p class="text-sm font-semibold text-slate-600">저장된 대화가 없습니다</p>
			<p class="mt-2 text-xs text-slate-500 mb-4">대화를 시작하고 종료하면 자동으로 저장됩니다</p>
			<div class="mt-4 p-4 rounded-xl bg-blue-50/50 border border-blue-200/50 text-left">
				<p class="text-xs font-semibold text-blue-700 mb-2">💡 대화 저장 방법:</p>
				<ol class="text-xs text-blue-600 space-y-1 list-decimal list-inside">
					<li>대화하기 탭에서 대화를 시작하세요</li>
					<li>AI 튜터와 대화를 나누세요</li>
					<li>대화 종료 버튼을 눌러 대화를 종료하세요</li>
					<li>대화가 자동으로 저장됩니다</li>
				</ol>
			</div>
		</div>
	{:else}
		<!-- 대화 목록 -->
		<div class="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
			{#each conversations as conversation}
				<div
					class="group relative flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-2xl border-2 border-purple-200/50 bg-gradient-to-br from-white/70 via-purple-50/30 to-pink-50/30 backdrop-blur-xl p-4 transition-all hover:shadow-xl hover:scale-[1.01] cursor-pointer"
					on:click={() => onSelectConversation && onSelectConversation(conversation.id)}
					role="button"
					tabindex="0"
					on:keydown={(e) => e.key === 'Enter' && onSelectConversation && onSelectConversation(conversation.id)}
				>
					<!-- 대화 정보 -->
					<div class="flex-1 min-w-0">
						<div class="flex items-start gap-2 mb-2">
							<h3 class="font-bold text-slate-800 truncate flex-1">
								{conversation.title || '제목 없음'}
							</h3>
							<button
								on:click|stopPropagation={(e) => handleDelete(conversation.id, e)}
								class="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-100 text-red-500"
								disabled={deletingId === conversation.id}
								aria-label="삭제"
							>
								{#if deletingId === conversation.id}
									<svg class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
									</svg>
								{:else}
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								{/if}
							</button>
						</div>
						<div class="flex flex-wrap items-center gap-2 text-xs">
							<span class="rounded-full bg-purple-100 px-2 py-1 font-medium text-purple-700">
								{languageLabels[conversation.language] || conversation.language}
							</span>
							<span class="rounded-full bg-indigo-100 px-2 py-1 font-medium text-indigo-700">
								{levelLabels[conversation.level] || conversation.level}
							</span>
							<span class="rounded-full bg-pink-100 px-2 py-1 font-medium text-pink-700">
								{modeLabels[conversation.practice_mode] || conversation.practice_mode}
							</span>
							{#if conversation.messageCount !== undefined}
								<span class="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700">
									{conversation.messageCount}개 메시지
								</span>
							{/if}
						</div>
					</div>
					<!-- 날짜 정보 -->
					<div class="flex-shrink-0 text-xs text-slate-500">
						{formatDate(conversation.created_at)}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

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


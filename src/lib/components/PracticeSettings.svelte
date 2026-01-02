<script>
	import { getRecommendedContent, getRandomContent } from '$lib/data/practiceContent.js';
	
	export let level = 'beginner'; // 'beginner', 'intermediate', 'advanced'
	export let displayMode = 'dual'; // 'dual' (중국어+한국어), 'chinese-only'
	export let practiceMode = 'free'; // 'free', 'vocabulary', 'sentence'
	export let practiceContent = ''; // 연습할 단어나 문장
	export let disabled = false; // 연결 중일 때 비활성화
	
	let showCustomInput = false;
	let showRecommendations = false;
	
	$: showCustomInput = practiceMode === 'vocabulary' || practiceMode === 'sentence';
	$: recommendedContent = showCustomInput ? getRecommendedContent(level, practiceMode === 'vocabulary' ? 'vocabulary' : 'sentences') : [];
	$: randomContent = showCustomInput ? getRandomContent(level, practiceMode === 'vocabulary' ? 'vocabulary' : 'sentences', 5) : [];
	
	function insertRecommended(item) {
		if (practiceContent) {
			practiceContent = practiceContent + ', ' + item;
		} else {
			practiceContent = item;
		}
	}
	
	const levels = [
		{ value: 'beginner', label: '초급', icon: '🌱', description: '기본 단어와 간단한 문장' },
		{ value: 'intermediate', label: '중급', icon: '🌿', description: '일상 대화와 복잡한 문장' },
		{ value: 'advanced', label: '고급', icon: '🌳', description: '고급 표현과 자연스러운 대화' }
	];
	
	const displayModes = [
		{ value: 'dual', label: '이중 언어', icon: '🔤', description: '중국어 + 한국어 번역' },
		{ value: 'chinese-only', label: '중국어만', icon: '中', description: '중국어만 표시' }
	];
	
	const practiceModes = [
		{ value: 'free', label: '자유 대화', icon: '💬', description: '자유롭게 대화하기' },
		{ value: 'vocabulary', label: '단어 연습', icon: '📚', description: '특정 단어 연습하기' },
		{ value: 'sentence', label: '문장 연습', icon: '📝', description: '특정 문장 연습하기' }
	];
</script>

<div class="space-y-6">
	<!-- 레벨 선택 -->
	<div>
		<label class="mb-3 block text-sm font-bold text-slate-700">📊 학습 레벨</label>
		<div class="grid grid-cols-3 gap-3">
			{#each levels as lvl}
				<button
					type="button"
					disabled={disabled}
					class="group relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 {level === lvl.value
						? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
						: 'border-slate-200 bg-white hover:border-purple-300'}"
					on:click={() => (level = lvl.value)}
				>
					<span class="text-3xl">{lvl.icon}</span>
					<span class="text-sm font-bold {level === lvl.value ? 'text-purple-700' : 'text-slate-700'}">
						{lvl.label}
					</span>
					<span class="text-xs text-slate-500">{lvl.description}</span>
					{#if level === lvl.value}
						<div class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
							<svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
							</svg>
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>
	
	<!-- 표시 모드 선택 -->
	<div>
		<label class="mb-3 block text-sm font-bold text-slate-700">👁️ 표시 모드</label>
		<div class="grid grid-cols-2 gap-3">
			{#each displayModes as mode}
				<button
					type="button"
					disabled={disabled}
					class="group relative flex items-center gap-3 rounded-2xl border-2 p-4 transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 {displayMode === mode.value
						? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-md'
						: 'border-slate-200 bg-white hover:border-indigo-300'}"
					on:click={() => (displayMode = mode.value)}
				>
					<span class="text-2xl">{mode.icon}</span>
					<div class="flex-1 text-left">
						<div class="text-sm font-bold {displayMode === mode.value ? 'text-indigo-700' : 'text-slate-700'}">
							{mode.label}
						</div>
						<div class="text-xs text-slate-500">{mode.description}</div>
					</div>
					{#if displayMode === mode.value}
						<div class="h-5 w-5 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
							<svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
							</svg>
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>
	
	<!-- 연습 모드 선택 -->
	<div>
		<label class="mb-3 block text-sm font-bold text-slate-700">🎯 연습 모드</label>
		<div class="grid grid-cols-3 gap-3">
			{#each practiceModes as mode}
				<button
					type="button"
					disabled={disabled}
					class="group relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 {practiceMode === mode.value
						? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md'
						: 'border-slate-200 bg-white hover:border-emerald-300'}"
					on:click={() => {
						practiceMode = mode.value;
						if (mode.value === 'free') {
							practiceContent = '';
						}
					}}
				>
					<span class="text-3xl">{mode.icon}</span>
					<span class="text-sm font-bold {practiceMode === mode.value ? 'text-emerald-700' : 'text-slate-700'}">
						{mode.label}
					</span>
					<span class="text-xs text-slate-500">{mode.description}</span>
					{#if practiceMode === mode.value}
						<div class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
							<svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
							</svg>
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>
	
	<!-- 연습 내용 입력 (단어/문장 연습 모드일 때) -->
	{#if showCustomInput}
		<div>
			<label class="mb-2 block text-sm font-bold text-slate-700">
				{practiceMode === 'vocabulary' ? '📚 연습할 단어 입력' : '📝 연습할 문장 입력'}
			</label>
			<input
				type="text"
				bind:value={practiceContent}
				disabled={disabled}
				placeholder={practiceMode === 'vocabulary' ? '예: 你好, 谢谢, 再见' : '예: 今天天气很好。'}
				class="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
			/>
			<p class="mt-2 text-xs text-slate-500">
				{practiceMode === 'vocabulary'
					? '연습하고 싶은 단어를 입력하세요. 여러 단어는 쉼표로 구분할 수 있습니다.'
					: '연습하고 싶은 문장을 입력하세요. AI 튜터가 이 문장을 사용하여 대화를 이끌어갑니다.'}
			</p>
			
			<!-- 추천 단어/문장 -->
			<div class="mt-3">
				<button
					type="button"
					disabled={disabled}
					on:click={() => (showRecommendations = !showRecommendations)}
					class="flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<svg class="h-4 w-4 transition-transform {showRecommendations ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
					{practiceMode === 'vocabulary' ? '📚 추천 단어 보기' : '📝 추천 문장 보기'}
				</button>
				
				{#if showRecommendations}
					<div class="mt-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
						<p class="mb-2 text-xs font-semibold text-emerald-700">추천 {practiceMode === 'vocabulary' ? '단어' : '문장'}:</p>
						<div class="flex flex-wrap gap-2">
							{#each randomContent as item}
								<button
									type="button"
									disabled={disabled}
									on:click={() => insertRecommended(item)}
									class="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{item}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>


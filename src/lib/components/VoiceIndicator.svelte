<!-- /src/lib/components/VoiceIndicator.svelte -->
<script>
	export let label = '';
	export let isActive = false;
	export let color = 'blue'; // 'blue' or 'red'

	const colorClasses = {
		blue: {
			bg: 'bg-gradient-to-br from-indigo-500 to-blue-500',
			ring: 'ring-indigo-500/40',
			text: 'text-indigo-700',
			bgLight: 'bg-indigo-50',
			glow: 'shadow-indigo-500/50'
		},
		red: {
			bg: 'bg-gradient-to-br from-purple-500 to-pink-500',
			ring: 'ring-purple-500/40',
			text: 'text-purple-700',
			bgLight: 'bg-purple-50',
			glow: 'shadow-purple-500/50'
		}
	};

	$: colors = colorClasses[color] || colorClasses.blue;
</script>

<div class="flex flex-col items-center gap-3">
	<div
		class="relative flex h-20 w-20 items-center justify-center rounded-3xl transition-all duration-300 {isActive
			? `${colors.bg} ring-4 ${colors.ring} shadow-2xl ${colors.glow} scale-110`
			: 'bg-gradient-to-br from-slate-200 to-slate-300 shadow-md'}"
	>
		{#if isActive}
			<!-- 파동 효과 -->
			<div
				class="absolute inset-0 rounded-3xl {colors.bg} opacity-60 animate-ping"
			></div>
			<div
				class="absolute inset-0 rounded-3xl {colors.bg} opacity-40 animate-pulse"
			></div>
		{/if}
		<svg
			class="relative h-10 w-10 {isActive ? 'text-white' : 'text-slate-400'} transition-all"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
			/>
		</svg>
	</div>
	<span class="text-sm font-bold {isActive ? colors.text : 'text-slate-500'} transition-colors">
		{label}
	</span>
	{#if isActive}
		<span class="text-xs font-bold {colors.text} animate-pulse">말하는 중...</span>
	{/if}
</div>

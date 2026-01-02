<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	export let currentLanguage = 'traditional';
	export let onLanguageChange = null;

	let showDropdown = false;

	const languages = [
		{ code: 'traditional', name: '繁體中文', flag: '🇹🇼' },
		{ code: 'simplified', name: '简体中文', flag: '🇨🇳' },
		{ code: 'english', name: 'English', flag: '🇺🇸' },
		{ code: 'korean', name: '한국어', flag: '🇰🇷' }
	];

	function handleLanguageChange(langCode) {
		currentLanguage = langCode;
		showDropdown = false;
		if (onLanguageChange) {
			onLanguageChange(langCode);
		}
	}

	// 외부 클릭 시 드롭다운 닫기
	function handleClickOutside(event) {
		if (!event.target.closest('.language-selector')) {
			showDropdown = false;
		}
	}

	// 드롭다운이 열릴 때 이벤트 리스너 추가 (브라우저에서만)
	$: if (browser && showDropdown) {
		// 다음 틱에 이벤트 리스너 추가 (현재 클릭 이벤트가 처리된 후)
		setTimeout(() => {
			document.addEventListener('click', handleClickOutside);
		}, 0);
	} else if (browser) {
		// 드롭다운이 닫힐 때 이벤트 리스너 제거
		document.removeEventListener('click', handleClickOutside);
	}

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div class="relative language-selector">
	<button
		class="group flex items-center gap-3 rounded-2xl border-2 border-purple-200/50 bg-gradient-to-r from-white/80 to-purple-50/50 backdrop-blur-sm px-5 py-3 text-sm font-bold text-slate-700 shadow-lg transition-all hover:scale-105 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/30"
		on:click={() => (showDropdown = !showDropdown)}
	>
		<span class="text-2xl transition-transform group-hover:scale-110">{languages.find((l) => l.code === currentLanguage)?.flag}</span>
		<span>{languages.find((l) => l.code === currentLanguage)?.name}</span>
		<svg
			class="h-5 w-5 transition-transform duration-300 {showDropdown ? 'rotate-180' : ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2.5"
				d="M19 9l-7 7-7-7"
			/>
		</svg>
	</button>

	{#if showDropdown}
		<div
			class="absolute right-0 top-full z-50 mt-3 w-56 rounded-2xl border border-white/50 bg-white/90 backdrop-blur-xl shadow-2xl overflow-hidden"
		>
			{#each languages as lang}
				<button
					class="group flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-semibold transition-all hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 {currentLanguage ===
					lang.code
						? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
						: 'text-slate-700'}"
					on:click={() => handleLanguageChange(lang.code)}
				>
					<span class="text-2xl transition-transform group-hover:scale-125">{lang.flag}</span>
					<span class="flex-1">{lang.name}</span>
					{#if currentLanguage === lang.code}
						<svg
							class="h-5 w-5 text-purple-600 transition-transform group-hover:scale-110"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2.5"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

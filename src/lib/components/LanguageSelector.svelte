<!-- /src/lib/components/LanguageSelector.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	export let currentLanguage = 'traditional';
	export let onLanguageChange = null;

	let showDropdown = false;
	let dropdownElement;
	let buttonElement;

	const languages = [
		{ code: 'korean', name: '한국어', flag: '🇰🇷' },
		{ code: 'traditional', name: '繁體中文', flag: '🇹🇼' },
		{ code: 'simplified', name: '简体中文', flag: '🇨🇳' },
		{ code: 'english', name: 'English', flag: '🇺🇸' }
	];

	// 드롭다운 위치 조정
	function adjustDropdownPosition() {
		if (!browser || !dropdownElement || !buttonElement) return;

		const buttonRect = buttonElement.getBoundingClientRect();
		const container = buttonElement.closest('.max-w-4xl');
		
		if (!container) return;

		const containerRect = container.getBoundingClientRect();
		const containerPadding = 16; // 컨테이너의 padding 값 (p-4 = 1rem = 16px)
		const viewportPadding = 16; // viewport 경계에서의 여백
		
		// 드롭다운의 실제 너비 측정
		const dropdownRect = dropdownElement.getBoundingClientRect();
		const dropdownWidth = dropdownRect.width || 200;
		const dropdownHeight = dropdownRect.height || 200;
		
		// 버튼의 오른쪽 끝에서 컨테이너 오른쪽 끝까지의 거리
		const spaceOnRight = containerRect.right - buttonRect.right - containerPadding;
		// 버튼의 왼쪽 끝에서 컨테이너 왼쪽 끝까지의 거리
		const spaceOnLeft = buttonRect.left - containerRect.left - containerPadding;
		
		// viewport 경계 확인
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const spaceOnRightViewport = viewportWidth - buttonRect.right - viewportPadding;
		const spaceOnLeftViewport = buttonRect.left - viewportPadding;
		const spaceBelowViewport = viewportHeight - buttonRect.bottom - viewportPadding;
		
		// 사용 가능한 공간 계산 (컨테이너와 viewport 중 더 작은 값)
		const availableRight = Math.min(spaceOnRight, spaceOnRightViewport);
		const availableLeft = Math.min(spaceOnLeft, spaceOnLeftViewport);
		
		// 드롭다운의 최대 너비 설정
		const maxDropdownWidth = Math.min(360, containerRect.width - (containerPadding * 2));
		dropdownElement.style.maxWidth = `${maxDropdownWidth}px`;
		
		// 공간이 부족하면 아래로 배치
		const minRequiredSpace = Math.max(availableRight, availableLeft);
		if (minRequiredSpace < dropdownWidth && spaceBelowViewport > dropdownHeight) {
			// 아래로 배치
			dropdownElement.style.top = 'auto';
			dropdownElement.style.bottom = '100%';
			dropdownElement.style.marginTop = '0';
			dropdownElement.style.marginBottom = '0.75rem';
			// 가로 위치는 버튼과 정렬
			dropdownElement.style.left = '0';
			dropdownElement.style.right = 'auto';
			dropdownElement.style.width = '';
		} else {
			// 위로 배치 (기본)
			dropdownElement.style.top = '100%';
			dropdownElement.style.bottom = 'auto';
			dropdownElement.style.marginTop = '0.75rem';
			dropdownElement.style.marginBottom = '0';
			
			// 오른쪽 공간이 충분하면 오른쪽 정렬
			if (availableRight >= dropdownWidth) {
				dropdownElement.style.left = 'auto';
				dropdownElement.style.right = '0';
				dropdownElement.style.width = '';
			} 
			// 왼쪽 공간이 충분하면 왼쪽 정렬
			else if (availableLeft >= dropdownWidth) {
				dropdownElement.style.left = '0';
				dropdownElement.style.right = 'auto';
				dropdownElement.style.width = '';
			} 
			// 양쪽 모두 공간이 부족하면 오른쪽 정렬하고 너비 조정
			else {
				dropdownElement.style.left = 'auto';
				dropdownElement.style.right = '0';
				// 사용 가능한 공간에 맞춰 너비 조정
				const adjustedWidth = Math.max(200, Math.min(dropdownWidth, availableRight));
				dropdownElement.style.width = `${adjustedWidth}px`;
				dropdownElement.style.maxWidth = `${adjustedWidth}px`;
			}
		}
	}

	// 드롭다운이 열릴 때 위치 조정
	$: if (browser && showDropdown && dropdownElement) {
		// 드롭다운이 렌더링된 후 위치 조정
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				adjustDropdownPosition();
			});
		});
	}

	// 윈도우 리사이즈 시 위치 재조정
	function handleResize() {
		if (browser && showDropdown && dropdownElement) {
			adjustDropdownPosition();
		}
	}

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

	onMount(() => {
		if (browser) {
			window.addEventListener('resize', handleResize);
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('resize', handleResize);
			document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div class="relative language-selector w-full sm:w-auto" style="z-index: 9999;">
	<button
		bind:this={buttonElement}
		class="group flex items-center justify-center sm:justify-start gap-2 sm:gap-3 rounded-xl border-2 border-purple-200/50 bg-gradient-to-r from-white/80 to-purple-50/50 backdrop-blur-sm px-6 sm:px-7 py-3.5 sm:py-4 min-h-[52px] sm:min-h-[56px] text-base sm:text-lg font-semibold text-slate-700 shadow-lg transition-all hover:scale-105 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/30 w-full sm:w-auto whitespace-nowrap"
		on:click={() => (showDropdown = !showDropdown)}
	>
		<span class="text-2xl sm:text-3xl transition-transform group-hover:scale-110 flex-shrink-0">{languages.find((l) => l.code === currentLanguage)?.flag}</span>
		<span class="hidden sm:inline">{languages.find((l) => l.code === currentLanguage)?.name}</span>
		<svg
			class="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 flex-shrink-0 {showDropdown ? 'rotate-180' : ''}"
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
		<!-- 드롭다운 메뉴 -->
		<div
			bind:this={dropdownElement}
			class="absolute z-[9999] w-full sm:w-auto sm:min-w-[200px] rounded-2xl border-2 border-white/50 bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden"
			style="z-index: 9999; top: 100%; margin-top: 0.75rem;"
		>
			{#each languages as lang}
				<button
					class="group flex w-full flex-row items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left text-sm sm:text-base font-semibold transition-all hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 whitespace-nowrap {currentLanguage ===
					lang.code
						? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
						: 'text-slate-700'}"
					on:click={() => handleLanguageChange(lang.code)}
				>
					<span class="text-2xl sm:text-3xl transition-transform group-hover:scale-125 flex-shrink-0">{lang.flag}</span>
					<span class="flex-1 min-w-0">{lang.name}</span>
					{#if currentLanguage === lang.code}
						<svg
							class="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 transition-transform group-hover:scale-110 flex-shrink-0"
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

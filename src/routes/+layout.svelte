<!-- /src/routes/+layout.svelte -->
<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { initAuth } from '$lib/stores/auth.js';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let { children } = $props();

	// 브라우저 환경에서 즉시 인증 초기화 (새로고침 시 세션 복원)
	if (browser) {
		initAuth();
	}

	onMount(() => {
		// 추가로 인증 초기화 (이중 확인)
		if (browser) {
			initAuth();
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

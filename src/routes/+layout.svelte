<!-- /src/routes/+layout.svelte -->
<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { initAuth } from '$lib/stores/auth.js';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		// 인증 초기화
		initAuth();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

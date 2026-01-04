<!-- /src/lib/components/BillingStatus.svelte -->
<script>
	export let isConnected = false;
	export let isConnecting = false;
	export let isDisconnecting = false;

	// 과금 상태 계산
	$: billingStatus = {
		isBilling: isConnected && !isDisconnecting,
		status: isConnected && !isDisconnecting 
			? 'billing' 
			: isDisconnecting 
				? 'stopping' 
				: isConnecting 
					? 'connecting' 
					: 'stopped',
		message: isConnected && !isDisconnecting
			? '과금 중'
			: isDisconnecting
				? '종료 중'
				: isConnecting
					? '연결 중'
					: '과금 안됨',
		description: isConnected && !isDisconnecting
			? '실시간 대화가 진행 중입니다. API 사용으로 인해 과금이 발생합니다.'
			: isDisconnecting
				? '연결을 종료하는 중입니다.'
				: isConnecting
					? '연결을 시도하는 중입니다.'
					: '연결이 종료되었습니다. 현재 과금이 발생하지 않습니다.'
	};
</script>

<div class="w-full">
	<div
		class="rounded-3xl border-2 p-4 sm:p-6 lg:p-8 shadow-xl {billingStatus.status === 'billing'
			? 'bg-red-50 border-red-200'
			: billingStatus.status === 'stopping'
				? 'bg-yellow-50 border-yellow-200'
				: billingStatus.status === 'connecting'
					? 'bg-blue-50 border-blue-200'
					: 'bg-green-50 border-green-200'}"
	>
		<div class="flex items-center gap-3 sm:gap-4">
			<div
				class="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl text-xl sm:text-2xl flex-shrink-0 {billingStatus.status === 'billing'
					? 'bg-red-100'
					: billingStatus.status === 'stopping'
						? 'bg-yellow-100'
						: billingStatus.status === 'connecting'
							? 'bg-blue-100'
							: 'bg-green-100'}"
			>
				{#if billingStatus.status === 'billing'}
					💰
				{:else if billingStatus.status === 'stopping'}
					🛑
				{:else if billingStatus.status === 'connecting'}
					🔵
				{:else}
					✅
				{/if}
			</div>
			<div class="flex-1 min-w-0">
				<h3 class="text-base sm:text-lg font-bold {billingStatus.status === 'billing'
					? 'text-red-700'
					: billingStatus.status === 'stopping'
						? 'text-yellow-700'
						: billingStatus.status === 'connecting'
							? 'text-blue-700'
							: 'text-green-700'}">
					{billingStatus.message}
				</h3>
				<p class="text-xs sm:text-sm text-slate-600 mt-1">{billingStatus.description}</p>
			</div>
		</div>
	</div>
</div>

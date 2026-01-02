<script>
	export let isConnected = false;
	export let isConnecting = false;
	export let isDisconnecting = false;
	export let disconnectVerification = null;
	export let networkActivity = null;

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
				? '종료 중 (과금 중지 예정)'
				: isConnecting
					? '연결 중 (과금 시작 예정)'
					: '과금 안됨',
		description: isConnected && !isDisconnecting
			? '실시간 대화가 진행 중입니다. API 사용으로 인해 과금이 발생합니다.'
			: isDisconnecting
				? '연결을 종료하는 중입니다. 곧 과금이 중지됩니다.'
				: isConnecting
					? '연결을 시도하는 중입니다. 연결 완료 시 과금이 시작됩니다.'
					: '연결이 종료되었습니다. 현재 과금이 발생하지 않습니다.'
	};

	// 네트워크 활동 기반 추가 확인
	$: hasActiveNetwork = networkActivity && networkActivity.isActive && networkActivity.hasRecentActivity;
	$: safeToConfirm = !isConnected && !isConnecting && !isDisconnecting && 
		(!networkActivity || !networkActivity.hasRecentActivity) &&
		(disconnectVerification?.verified !== false);
</script>

<div class="mx-auto w-full max-w-2xl space-y-4">
	<!-- 과금 상태 카드 -->
	<div
		class="group relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br p-6 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl {billingStatus.status === 'billing'
			? 'from-red-50/80 via-orange-50/80 to-pink-50/80 border-red-200/50'
			: billingStatus.status === 'stopping'
				? 'from-yellow-50/80 via-amber-50/80 to-orange-50/80 border-yellow-200/50'
				: billingStatus.status === 'connecting'
					? 'from-blue-50/80 via-indigo-50/80 to-purple-50/80 border-blue-200/50'
					: 'from-emerald-50/80 via-teal-50/80 to-cyan-50/80 border-emerald-200/50'}"
	>
		<!-- 배경 그라데이션 효과 -->
		<div class="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50"></div>
		
		<div class="relative">
			<!-- 헤더 -->
			<div class="mb-5 flex items-center gap-4">
				<div
					class="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-lg transition-transform group-hover:scale-110 {billingStatus.status === 'billing'
						? 'bg-gradient-to-br from-red-400 to-pink-500'
						: billingStatus.status === 'stopping'
							? 'bg-gradient-to-br from-yellow-400 to-orange-500'
							: billingStatus.status === 'connecting'
								? 'bg-gradient-to-br from-blue-400 to-indigo-500'
								: 'bg-gradient-to-br from-emerald-400 to-teal-500'}"
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
				<div class="flex-1">
					<h3 class="text-xl font-bold {billingStatus.status === 'billing'
						? 'text-red-700'
						: billingStatus.status === 'stopping'
							? 'text-yellow-700'
							: billingStatus.status === 'connecting'
								? 'text-blue-700'
								: 'text-emerald-700'}">
						{billingStatus.message}
					</h3>
					<p class="text-sm text-slate-600 mt-1">{billingStatus.description}</p>
				</div>
			</div>

			<!-- 상태 세부 정보 -->
			<div class="space-y-3 rounded-2xl bg-white/60 backdrop-blur-sm p-5 border border-white/50">
				<!-- 연결 상태 -->
				<div class="flex items-center justify-between">
					<span class="text-sm font-semibold text-slate-700">연결 상태</span>
					<span
						class="rounded-full px-4 py-1.5 text-xs font-bold shadow-sm {isConnected
							? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white'
							: isConnecting
								? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white'
								: isDisconnecting
									? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
									: 'bg-gradient-to-r from-slate-300 to-slate-400 text-white'}"
					>
						{isConnected ? '✅ 연결됨' : isConnecting ? '🟡 연결 중' : isDisconnecting ? '🛑 종료 중' : '❌ 연결 안됨'}
					</span>
				</div>

				<!-- 과금 상태 -->
				<div class="flex items-center justify-between">
					<span class="text-sm font-semibold text-slate-700">과금 상태</span>
					<span
						class="rounded-full px-4 py-1.5 text-xs font-bold shadow-sm {billingStatus.isBilling
							? 'bg-gradient-to-r from-red-400 to-pink-400 text-white'
							: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white'}"
					>
						{billingStatus.isBilling ? '💰 과금 중' : '✅ 과금 안됨'}
					</span>
				</div>

				<!-- 네트워크 활동 -->
				{#if networkActivity}
					<div class="flex items-center justify-between">
						<span class="text-sm font-semibold text-slate-700">네트워크 활동</span>
						<span
							class="rounded-full px-4 py-1.5 text-xs font-bold shadow-sm {networkActivity.hasRecentActivity
								? 'bg-gradient-to-r from-red-400 to-pink-400 text-white'
								: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white'}"
						>
							{networkActivity.hasRecentActivity ? '⚠️ 활동 감지' : '✅ 활동 없음'}
						</span>
					</div>
				{/if}

				<!-- 종료 검증 -->
				{#if disconnectVerification}
					<div class="space-y-2 pt-2 border-t border-white/50">
						<div class="flex items-center justify-between">
							<span class="text-sm font-semibold text-slate-700">종료 검증</span>
							<span
								class="rounded-full px-4 py-1.5 text-xs font-bold shadow-sm {disconnectVerification.verified
									? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white'
									: 'bg-gradient-to-r from-red-400 to-pink-400 text-white'}"
							>
								{disconnectVerification.verified ? '✅ 검증 완료' : '⚠️ 검증 실패'}
							</span>
						</div>
						{#if !disconnectVerification.verified && disconnectVerification.checks}
							<div class="rounded-xl bg-red-50/80 backdrop-blur-sm p-3 border border-red-200/50">
								<div class="mb-2 text-xs font-bold text-red-700">실패한 검증 항목:</div>
								<div class="space-y-1.5">
									{#each Object.entries(disconnectVerification.checks) as [key, value]}
										{#if key !== 'disconnectTime' && value !== true}
											<div class="flex items-center gap-2 text-xs text-red-600">
												<span>❌</span>
												<span>
													{key === 'isConnected' ? '연결 상태' :
													 key === 'sessionNull' ? '세션 객체' :
													 key === 'agentNull' ? 'Agent 객체' :
													 key === 'noActiveTimers' ? '활성 타이머' :
													 key === 'networkInactive' ? '네트워크 활동' : key}
												</span>
											</div>
										{/if}
									{/each}
								</div>
							</div>
						{/if}
						<div class="text-xs text-slate-500 font-medium">
							종료 시간: {new Date(disconnectVerification.timestamp).toLocaleTimeString('ko-KR')}
						</div>
					</div>
				{/if}
			</div>

			<!-- 안전 확인 메시지 -->
			{#if safeToConfirm}
				<div class="mt-5 rounded-2xl border-2 border-emerald-300/50 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-sm p-4 shadow-lg">
					<div class="flex items-start gap-3">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 text-xl shadow-md">
							✅
						</div>
						<div class="flex-1">
							<p class="text-sm font-bold text-emerald-800">
								과금이 발생하지 않습니다
							</p>
							<p class="mt-1.5 text-xs text-emerald-700 leading-relaxed">
								연결이 완전히 종료되었고, 네트워크 활동이 없습니다. 현재 API 사용으로 인한 과금이 발생하지 않습니다.
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- 경고 메시지 (과금 중일 때) -->
			{#if billingStatus.isBilling}
				<div class="mt-5 rounded-2xl border-2 border-red-300/50 bg-gradient-to-br from-red-50/80 to-pink-50/80 backdrop-blur-sm p-4 shadow-lg">
					<div class="flex items-start gap-3">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-pink-400 text-xl shadow-md">
							💰
						</div>
						<div class="flex-1">
							<p class="text-sm font-bold text-red-800">
								과금이 발생하고 있습니다
							</p>
							<p class="mt-1.5 text-xs text-red-700 leading-relaxed">
								실시간 대화가 진행 중입니다. 대화를 종료하면 과금이 중지됩니다.
							</p>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- 실시간 상태 업데이트 표시 -->
	<div class="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
		<div class="h-2 w-2 animate-pulse rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"></div>
		<span>실시간 업데이트 중</span>
		<span>•</span>
		<span>마지막 확인: {new Date().toLocaleTimeString('ko-KR')}</span>
	</div>
</div>

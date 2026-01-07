<!-- /src/lib/components/RealtimeConversation.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { RealtimeClient } from '$lib/realtime/realtimeClient.js';
	import ConversationHistory from './ConversationHistory.svelte';
	import VoiceIndicator from './VoiceIndicator.svelte';
	import BillingStatus from './BillingStatus.svelte';
	import PracticeSettings from './PracticeSettings.svelte';
	import { translations } from '$lib/i18n/translations.js';

	export let onError = null;
	export let currentLanguage = 'traditional';
	
	let t = translations[currentLanguage];
	
	$: {
		t = translations[currentLanguage];
	}

	// 연습 설정
	let level = 'beginner'; // 'beginner', 'intermediate', 'advanced'
	let displayMode = 'dual'; // 'dual', 'chinese-only'
	let practiceMode = 'free'; // 'free', 'vocabulary', 'sentence'
	let practiceContent = ''; // 연습할 단어나 문장
	let showSettings = true; // 설정 패널 표시 여부

	let isConnected = false;
	let isConnecting = false;
	let isDisconnecting = false;
	let conversationHistory = [];
	let realtimeClient = null;
	let isSpeaking = false; // 사용자가 말하고 있는지
	let isListening = false; // AI가 말하고 있는지
	let disconnectVerification = null; // 종료 검증 결과
	let networkActivity = null; // 네트워크 활동 상태
	let activityCheckInterval = null; // 네트워크 활동 체크 인터벌
	
	// 디버깅 정보
	let debugInfo = {
		showDebug: false,
		lastRequest: null,
		lastResponse: null,
		lastError: null,
		requestTime: null,
		responseTime: null
	};

	async function startConversation() {
		if (isConnecting || isConnected) return;

		isConnecting = true;
		debugInfo.lastError = null;
		debugInfo.lastRequest = {
			url: '/api/realtime/key',
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			timestamp: new Date().toISOString()
		};
		debugInfo.requestTime = Date.now();
		
		console.log('🔵 [DEBUG] Starting conversation request:', debugInfo.lastRequest);
		
		try {
			const response = await fetch('/api/realtime/key', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ 
					language: currentLanguage,
					level: level,
					practiceMode: practiceMode,
					practiceContent: practiceContent
				})
			});

			debugInfo.responseTime = Date.now();
			debugInfo.lastResponse = {
				status: response.status,
				statusText: response.statusText,
				headers: Object.fromEntries(response.headers.entries()),
				timestamp: new Date().toISOString(),
				responseTime: debugInfo.responseTime - debugInfo.requestTime + 'ms'
			};
			
			console.log('🟢 [DEBUG] Response received:', debugInfo.lastResponse);

			if (!response.ok) {
				let errorMessage = 'Failed to create realtime session';
				let errorData = null;
				try {
					errorData = await response.json();
					errorMessage = errorData.details || errorData.error || errorData.message || errorMessage;
					
					// 디버깅 정보 저장
					debugInfo.lastError = {
						message: errorMessage,
						status: response.status,
						statusText: response.statusText,
						debug: errorData.debug,
						fullError: errorData
					};
					
					console.error('🔴 [DEBUG] API Error:', debugInfo.lastError);
				} catch {
					const text = await response.text();
					errorMessage = text || errorMessage;
					debugInfo.lastError = {
						message: errorMessage,
						status: response.status,
						statusText: response.statusText,
						rawResponse: text
					};
					console.error('🔴 [DEBUG] API Error (text):', debugInfo.lastError);
				}
				throw new Error(errorMessage);
			}

			const data = await response.json();
			debugInfo.lastResponse.data = data;
			console.log('✅ [DEBUG] Success response:', data);
			
			if (!data || !data.clientSecret) {
				debugInfo.lastError = {
					message: 'Invalid response: missing clientSecret',
					response: data
				};
				throw new Error('Invalid response from server: missing clientSecret');
			}

			realtimeClient = new RealtimeClient();
			realtimeClient.on('message', (messages) => {
				conversationHistory = messages;
			});
			realtimeClient.on('error', (err) => {
				if (onError) {
					onError(err.message || '실시간 대화 중 오류가 발생했습니다.');
				}
				isConnected = false;
				isSpeaking = false;
				isListening = false;
			});
			realtimeClient.on('connected', () => {
				isConnected = true;
				isConnecting = false;
				disconnectVerification = null;
				
				// 네트워크 활동 모니터링 시작
				startNetworkMonitoring();
			});
			realtimeClient.on('disconnected', (verification) => {
				isConnected = false;
				isDisconnecting = false;
				conversationHistory = [];
				isSpeaking = false;
				isListening = false;
				disconnectVerification = verification;
				
				// 네트워크 활동 모니터링 중지
				if (activityCheckInterval) {
					clearInterval(activityCheckInterval);
					activityCheckInterval = null;
				}
				
				console.log('✅ [UI] Disconnected event received, verification:', verification);
			});

			console.log('🔵 [DEBUG] Connecting to Realtime API...');
			await realtimeClient.connect(data.clientSecret, currentLanguage);
			console.log('✅ [DEBUG] Realtime connection established');
		} catch (err) {
			console.error('🔴 [DEBUG] Error starting conversation:', {
				message: err.message,
				stack: err.stack,
				debugInfo: debugInfo
			});
			
			// 에러 정보 업데이트
			if (!debugInfo.lastError) {
				debugInfo.lastError = {
					message: err.message,
					stack: err.stack,
					name: err.name
				};
			}
			
			if (onError) {
				const errorMsg = err.message || '실시간 대화를 시작할 수 없습니다.';
				onError(errorMsg);
			}
			isConnecting = false;
			isConnected = false;
		}
	}
	
	function toggleDebug() {
		debugInfo.showDebug = !debugInfo.showDebug;
	}

	function startNetworkMonitoring() {
		// 기존 인터벌 정리
		if (activityCheckInterval) {
			clearInterval(activityCheckInterval);
		}
		
		// 2초마다 네트워크 활동 확인 (연결 여부와 관계없이)
		activityCheckInterval = setInterval(() => {
			if (realtimeClient) {
				networkActivity = realtimeClient.getNetworkActivity();
			} else if (!isConnected && !isConnecting) {
				// 연결이 없을 때도 네트워크 활동이 없는지 확인
				networkActivity = {
					isActive: false,
					hasRecentActivity: false,
					requests: [],
					lastRequestTime: null
				};
			}
		}, 2000);
	}

	// 컴포넌트 마운트 시 네트워크 모니터링 시작
	onMount(() => {
		startNetworkMonitoring();
	});

	async function stopConversation() {
		if (!realtimeClient || isDisconnecting) {
			console.warn('⚠️ [UI] Cannot stop: no client or already disconnecting');
			return;
		}

		isDisconnecting = true;
		console.log('🛑 [UI] Stop conversation requested');

		// 즉시 UI 상태 업데이트 (연결 상태를 false로 설정)
		isConnected = false;
		isSpeaking = false;
		isListening = false;

		try {
			// 네트워크 활동 모니터링 중지
			if (activityCheckInterval) {
				clearInterval(activityCheckInterval);
				activityCheckInterval = null;
			}

			// 실제 종료 수행 (타임아웃 설정)
			const disconnectPromise = realtimeClient.disconnect();
			const timeoutPromise = new Promise((_, reject) => 
				setTimeout(() => reject(new Error('Disconnect timeout')), 10000)
			);

			const verification = await Promise.race([disconnectPromise, timeoutPromise])
				.catch((err) => {
					console.warn('⚠️ [UI] Disconnect timeout or error:', err.message);
					// 타임아웃이 발생해도 강제로 정리
					return {
						verified: false,
						checks: { timeout: true },
						timestamp: new Date().toISOString()
					};
				});

			disconnectVerification = verification;
			
			console.log('✅ [UI] Disconnect completed, verification:', verification);
			
			// 클라이언트 정리
			realtimeClient = null;
			conversationHistory = [];
			
			// 네트워크 활동 초기화
			networkActivity = {
				isActive: false,
				hasRecentActivity: false,
				requests: [],
				lastRequestTime: null
			};
		} catch (err) {
			console.error('❌ [UI] Error during disconnect:', err);
			// 에러가 발생해도 강제로 정리
			realtimeClient = null;
			isConnected = false;
			conversationHistory = [];
			isSpeaking = false;
			isListening = false;
			networkActivity = {
				isActive: false,
				hasRecentActivity: false,
				requests: [],
				lastRequestTime: null
			};
		} finally {
			isDisconnecting = false;
		}
	}

	onDestroy(() => {
		if (activityCheckInterval) {
			clearInterval(activityCheckInterval);
		}
		if (realtimeClient) {
			realtimeClient.disconnect();
		}
	});
</script>

<div class="space-y-6">
	<!-- 연습 설정 패널 -->
	{#if showSettings && !isConnected}
		<div class="mx-auto w-full max-w-2xl rounded-3xl border-2 border-purple-200/50 bg-gradient-to-br from-white/80 to-purple-50/40 backdrop-blur-sm p-4 sm:p-6 lg:p-8 shadow-xl">
			<div class="mb-4 sm:mb-6 flex items-center justify-between">
				<h2 class="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
					⚙️ 학습 설정
				</h2>
				<button
					on:click={() => (showSettings = false)}
					class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
					aria-label="설정 닫기"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<PracticeSettings bind:level bind:displayMode bind:practiceMode bind:practiceContent disabled={isConnecting || isConnected} />
		</div>
	{:else if !isConnected}
		<button
			on:click={() => (showSettings = true)}
			class="mx-auto w-full max-w-2xl rounded-3xl border-2 border-dashed border-purple-300/50 bg-gradient-to-br from-white/60 to-purple-50/40 backdrop-blur-sm p-4 sm:p-6 text-xs sm:text-sm font-semibold text-purple-700 hover:border-purple-400 hover:shadow-lg transition-all"
		>
			⚙️ 학습 설정 보기
		</button>
	{/if}
	
	<!-- 연결 상태 및 제어 -->
	<div class="mx-auto w-full max-w-2xl flex flex-col items-center gap-6">
		<!-- 상태 표시 -->
		<div class="flex flex-col items-center gap-4">
			<div class="flex items-center gap-3">
				<div
					class="relative h-5 w-5 rounded-full transition-all {isConnected
						? 'animate-pulse bg-gradient-to-r from-emerald-400 to-teal-400 ring-4 ring-emerald-400/30 shadow-lg shadow-emerald-400/50'
						: isConnecting
							? 'animate-pulse bg-gradient-to-r from-blue-400 to-indigo-400 ring-4 ring-blue-400/30 shadow-lg shadow-blue-400/50'
							: 'bg-gradient-to-r from-slate-300 to-slate-400'}"
				></div>
				<span class="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
					{isConnected
						? t.status.connected
						: isConnecting
							? t.status.connecting
							: t.status.waiting}
				</span>
			</div>
			{#if isConnected}
				<div class="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400/20 to-teal-400/20 backdrop-blur-sm border border-emerald-300/30 px-5 py-2 shadow-md">
					<span class="text-xs font-bold text-emerald-700">⚡ {t.features.lowLatency}</span>
				</div>
			{/if}
			{#if isDisconnecting}
				<div class="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm border border-yellow-300/30 px-5 py-2 shadow-md">
					<span class="text-xs font-bold text-yellow-700">🛑 종료 중...</span>
				</div>
			{/if}
		</div>

		<!-- 음성 상태 표시 -->
		{#if isConnected}
			<div class="flex items-center gap-8">
				<VoiceIndicator label={t.conversation.you} isActive={isSpeaking} color="blue" />
				<VoiceIndicator label={t.conversation.teacher} isActive={isListening} color="red" />
			</div>
		{/if}

		<!-- 대화 시작/종료 버튼 -->
		<button
			class="group relative flex items-center justify-center gap-2 sm:gap-3 rounded-3xl px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 text-base sm:text-lg lg:text-xl font-extrabold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 {isConnected
				? 'bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 shadow-red-500/50 hover:shadow-red-500/70'
				: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-purple-500/50 hover:shadow-purple-500/70'}"
			on:click={isConnected ? stopConversation : startConversation}
			disabled={isConnecting || isDisconnecting}
			aria-label={isConnected ? t.buttons.stop : t.buttons.start}
		>
			{#if isConnected}
				<svg
					class="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:rotate-90"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2.5"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
				<span>{t.buttons.stop}</span>
			{:else}
				<svg
					class="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:scale-110"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2.5"
						d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
					/>
				</svg>
				<span>{isConnecting ? t.buttons.connecting : t.buttons.start}</span>
			{/if}
			<!-- 글로우 효과 -->
			<div
				class="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100 blur-xl"
			></div>
		</button>
	</div>

	<!-- 과금 상태 표시 -->
	<div class="mx-auto w-full max-w-2xl">
		<BillingStatus
			{isConnected}
			{isConnecting}
			{isDisconnecting}
			{disconnectVerification}
			{networkActivity}
		/>
	</div>

	<!-- 대화 기록 -->
	<div class="mx-auto w-full max-w-2xl">
		<ConversationHistory 
			messages={conversationHistory} 
			{currentLanguage} 
			{displayMode}
		/>
	</div>

	<!-- 안내 메시지 -->
	{#if !isConnected && !isConnecting}
		<div
			class="mx-auto w-full max-w-2xl rounded-3xl border-2 border-dashed border-purple-200/50 bg-gradient-to-br from-white/60 via-purple-50/40 to-pink-50/40 backdrop-blur-sm p-6 sm:p-8 text-center shadow-xl"
		>
			<div class="mb-4 sm:mb-5 text-4xl sm:text-5xl lg:text-6xl animate-bounce">🎤</div>
			<h3 class="mb-3 text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{t.tips.title}</h3>
			<p class="mb-4 sm:mb-6 text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed">
				{t.tips.description}
			</p>
			<div class="flex flex-wrap justify-center gap-2 sm:gap-3">
				<span class="rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-md">{t.features.natural}</span>
				<span class="rounded-full bg-gradient-to-r from-purple-400 to-pink-400 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-md">{t.features.feedback}</span>
				<span class="rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-md">{t.features.lowLatency}</span>
			</div>
		</div>
	{/if}

	<!-- 대화 중 안내 -->
	{#if isConnected}
		<div
			class="mx-auto w-full max-w-2xl rounded-3xl border-2 border-emerald-300/50 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 text-center shadow-xl"
		>
			<p class="font-bold text-emerald-800 text-xs sm:text-sm">{t.tips.speaking}</p>
			<p class="mt-2 text-xs text-emerald-700 leading-relaxed">{t.tips.feedback}</p>
		</div>
	{/if}

	<!-- 디버깅 패널 -->
	<div class="mx-auto max-w-4xl">
		<button
			class="mx-auto flex items-center gap-2 rounded-xl border-2 border-purple-200/50 bg-gradient-to-r from-white/60 to-purple-50/40 backdrop-blur-sm px-4 py-2.5 text-xs font-bold text-slate-700 hover:scale-105 hover:border-purple-300 hover:shadow-lg transition-all"
			on:click={toggleDebug}
		>
			<svg
				class="h-4 w-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			{debugInfo.showDebug ? '디버깅 정보 숨기기' : '디버깅 정보 보기'}
		</button>

		{#if debugInfo.showDebug}
			<div
				class="mt-4 rounded-3xl border-2 border-purple-200/50 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 backdrop-blur-xl p-6 text-xs font-mono text-slate-100 max-h-96 overflow-y-auto shadow-2xl custom-scrollbar"
			>
				<div class="mb-4 flex items-center justify-between border-b border-purple-500/30 pb-3">
					<h4 class="text-sm font-extrabold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">🔍 디버깅 정보</h4>
					<button
						class="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:scale-105 hover:shadow-lg transition-all"
						on:click={() => {
							debugInfo = {
								showDebug: true,
								lastRequest: null,
								lastResponse: null,
								lastError: null,
								requestTime: null,
								responseTime: null
							};
						}}
					>
						초기화
					</button>
				</div>

				<!-- 요청 정보 -->
				{#if debugInfo.lastRequest}
					<div class="mb-4">
						<div class="mb-2 text-sm font-bold text-blue-400">📤 요청 (Request)</div>
						<pre class="whitespace-pre-wrap break-words rounded-xl bg-slate-800/80 backdrop-blur-sm border border-blue-500/30 p-4 text-xs shadow-lg">
{JSON.stringify(debugInfo.lastRequest, null, 2)}
						</pre>
					</div>
				{/if}

				<!-- 응답 정보 -->
				{#if debugInfo.lastResponse}
					<div class="mb-4">
						<div class="mb-2 text-sm font-bold text-green-400">📥 응답 (Response)</div>
						<pre class="whitespace-pre-wrap break-words rounded-xl bg-slate-800/80 backdrop-blur-sm border border-green-500/30 p-4 text-xs shadow-lg">
{JSON.stringify(debugInfo.lastResponse, null, 2)}
						</pre>
					</div>
				{/if}

				<!-- 에러 정보 -->
				{#if debugInfo.lastError}
					<div class="mb-4">
						<div class="mb-2 text-sm font-bold text-red-400">❌ 에러 (Error)</div>
						<pre class="whitespace-pre-wrap break-words rounded-xl bg-red-900/40 backdrop-blur-sm border border-red-500/30 p-4 text-xs text-red-200 shadow-lg">
{JSON.stringify(debugInfo.lastError, null, 2)}
						</pre>
					</div>
				{/if}

				<!-- 상태 정보 -->
				<div class="mt-4 border-t border-purple-500/30 pt-4">
					<div class="mb-2 text-sm font-bold text-yellow-400">📊 현재 상태</div>
					<div class="space-y-2 text-xs">
						<div class="flex items-center gap-2">
							<span class="font-semibold">연결 상태:</span>
							<span class="rounded-full px-3 py-1 font-bold {isConnected ? 'bg-emerald-500/20 text-emerald-300' : isConnecting ? 'bg-blue-500/20 text-blue-300' : isDisconnecting ? 'bg-yellow-500/20 text-yellow-300' : 'bg-slate-500/20 text-slate-300'}">
								{isConnected ? '✅ 연결됨' : isConnecting ? '🟡 연결 중' : isDisconnecting ? '🛑 종료 중' : '❌ 연결 안됨'}
							</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="font-semibold">대화 기록 수:</span>
							<span class="rounded-full bg-purple-500/20 px-3 py-1 font-bold text-purple-300">{conversationHistory.length}</span>
						</div>
						{#if debugInfo.requestTime && debugInfo.responseTime}
							<div class="flex items-center gap-2">
								<span class="font-semibold">응답 시간:</span>
								<span class="rounded-full bg-indigo-500/20 px-3 py-1 font-bold text-indigo-300">{debugInfo.responseTime - debugInfo.requestTime}ms</span>
							</div>
						{/if}
					</div>
				</div>

				<!-- 종료 검증 정보 -->
				{#if disconnectVerification}
					<div class="mt-4 border-t border-purple-500/30 pt-4">
						<div class="mb-3 text-sm font-bold {disconnectVerification.verified ? 'text-emerald-400' : 'text-red-400'}">
							{disconnectVerification.verified ? '✅ 종료 검증 완료' : '⚠️ 종료 검증 실패'}
						</div>
						<div class="space-y-2 text-xs">
							<div class="flex items-center gap-2">
								<span class="font-semibold text-slate-300">종료 시간:</span>
								<span class="rounded-full bg-purple-500/20 px-3 py-1 font-bold text-purple-300">
									{new Date(disconnectVerification.timestamp).toLocaleTimeString('ko-KR')}
								</span>
							</div>
							{#each Object.entries(disconnectVerification.checks) as [key, value]}
								{#if key !== 'disconnectTime'}
									<div class="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
										<span class="font-medium text-slate-300">
											{key === 'isConnected' ? '연결 상태' :
											 key === 'sessionNull' ? '세션 객체' :
											 key === 'agentNull' ? 'Agent 객체' :
											 key === 'noActiveTimers' ? '활성 타이머' :
											 key === 'networkInactive' ? '네트워크 활동' : key}:
										</span>
										<span class="rounded-full px-3 py-1 font-bold {value ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}">
											{value ? '✅ 통과' : '❌ 실패'}
										</span>
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}

				<!-- 네트워크 활동 정보 -->
				{#if networkActivity}
					<div class="mt-4 border-t border-purple-500/30 pt-4">
						<div class="mb-3 text-sm font-bold {networkActivity.hasRecentActivity ? 'text-red-400' : 'text-emerald-400'}">
							{networkActivity.hasRecentActivity ? '⚠️ 네트워크 활동 감지' : '✅ 네트워크 활동 없음'}
						</div>
						<div class="space-y-2 text-xs">
							<div class="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
								<span class="font-semibold text-slate-300">활동 상태:</span>
								<span class="rounded-full px-3 py-1 font-bold {networkActivity.isActive ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}">
									{networkActivity.isActive ? '활성' : '비활성'}
								</span>
							</div>
							<div class="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
								<span class="font-semibold text-slate-300">요청 수:</span>
								<span class="rounded-full bg-purple-500/20 px-3 py-1 font-bold text-purple-300">{networkActivity.requests.length}</span>
							</div>
							{#if networkActivity.lastRequestTime}
								<div class="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
									<span class="font-semibold text-slate-300">마지막 요청:</span>
									<span class="rounded-full bg-indigo-500/20 px-3 py-1 font-bold text-indigo-300">
										{new Date(networkActivity.lastRequestTime).toLocaleTimeString('ko-KR')}
									</span>
								</div>
							{/if}
							{#if networkActivity.recentRequests && networkActivity.recentRequests.length > 0}
								<div class="mt-3 rounded-xl bg-slate-800/60 border border-purple-500/30 p-3">
									<div class="mb-2 text-xs font-bold text-purple-300">최근 요청:</div>
									<pre class="whitespace-pre-wrap break-words rounded-lg bg-slate-900/60 p-3 text-xs border border-purple-500/20">
{JSON.stringify(networkActivity.recentRequests, null, 2)}
									</pre>
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<!-- 콘솔 안내 -->
				<div class="mt-4 border-t border-purple-500/30 pt-4 text-xs text-slate-400 font-medium">
					💡 브라우저 콘솔(F12)에서 더 자세한 로그를 확인할 수 있습니다.
				</div>
			</div>
		{/if}
	</div>
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

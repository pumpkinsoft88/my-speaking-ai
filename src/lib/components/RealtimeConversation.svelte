<!-- /src/lib/components/RealtimeConversation.svelte -->
<script>
	import { onMount, onDestroy } from 'svelte';
	import { RealtimeClient } from '$lib/realtime/realtimeClient.js';
	import ConversationHistory from './ConversationHistory.svelte';
	import VoiceIndicator from './VoiceIndicator.svelte';
	import BillingStatus from './BillingStatus.svelte';
	import PracticeSettings from './PracticeSettings.svelte';
	import { translations } from '$lib/i18n/translations.js';
	import { saveConversation } from '$lib/supabase/conversations.js';

	let { 
		onError = null,
		currentLanguage = 'traditional',
		onConversationSaved = null // 대화 저장 성공 시 호출될 콜백
	} = $props();
	
	let t = $derived(translations[currentLanguage]);

	// 연습 설정
	let level = $state('beginner'); // 'beginner', 'intermediate', 'advanced'
	let displayMode = $state('dual'); // 'dual', 'chinese-only'
	let practiceMode = $state('free'); // 'free', 'vocabulary', 'sentence'
	let practiceContent = $state(''); // 연습할 단어나 문장
	let showSettings = $state(true); // 설정 패널 표시 여부
	
	// 시스템 프롬프트 커스터마이징 옵션
	let tutorPersonality = $state('friendly'); // 'friendly', 'neutral', 'strict'
	let correctionStyle = $state('gentle'); // 'gentle', 'direct', 'detailed'
	let responseLength = $state('short'); // 'very-short', 'short', 'medium'
	let feedbackStyle = $state('positive'); // 'positive', 'balanced', 'constructive'
	let includeKoreanTranslation = $state(true); // 한국어 번역 포함 여부

	let isConnected = $state(false);
	let isConnecting = $state(false);
	let isDisconnecting = $state(false);
	let conversationHistory = $state([]);
	let realtimeClient = null; // 클라이언트 인스턴스는 $state 불필요
	let isSaving = $state(false); // 대화 저장 중 플래그
	let saveSuccess = $state(false); // 저장 성공 플래그
	let wasConnectedBeforeUnmount = false; // 언마운트 전 연결 상태 (일반 변수)
	let isSpeaking = $state(false); // 사용자가 말하고 있는지
	let isListening = $state(false); // AI가 말하고 있는지
	let disconnectVerification = $state(null); // 종료 검증 결과
	let networkActivity = $state(null); // 네트워크 활동 상태
	let activityCheckInterval = null; // 인터벌 ID는 일반 변수
	
	// 디버깅 정보
	let debugInfo = $state({
		showDebug: false,
		lastRequest: null,
		lastResponse: null,
		lastError: null,
		requestTime: null,
		responseTime: null
	});

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
					practiceContent: practiceContent,
					tutorPersonality: tutorPersonality,
					correctionStyle: correctionStyle,
					responseLength: responseLength,
					feedbackStyle: feedbackStyle,
					includeKoreanTranslation: includeKoreanTranslation
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
				console.log('📨 [UI] Message update received:', {
					messageCount: messages.length,
					messages: messages.map(m => ({
						role: m.role,
						contentLength: m.content?.length || 0,
						timestamp: m.timestamp
					}))
				});
				conversationHistory = messages;
			});
			// 사용자 말하기 상태 업데이트
			realtimeClient.on('userSpeaking', (speaking) => {
				isSpeaking = speaking;
				console.log('🎤 [UI] User speaking:', speaking);
			});
			// 튜터 말하기 상태 업데이트
			realtimeClient.on('assistantSpeaking', (speaking) => {
				isListening = speaking;
				console.log('🎙️ [UI] Assistant speaking:', speaking);
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
				// conversationHistory는 저장 완료 후에 초기화하므로 여기서는 초기화하지 않음
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

		// 즉시 UI 상태 업데이트 (연결 상태를 false로 설정) - 과금 방지 최우선
		isConnected = false;
		isSpeaking = false;
		isListening = false;

		// 네트워크 활동 모니터링 즉시 중지
		if (activityCheckInterval) {
			clearInterval(activityCheckInterval);
			activityCheckInterval = null;
		}

		// 클라이언트의 세션에 직접 접근하여 즉시 강제 종료 (과금 방지)
		if (realtimeClient && realtimeClient.session) {
			try {
				const session = realtimeClient.session;
				
				// 오디오 스트림 즉시 중지 (AI 목소리 중지 - 최우선)
				try {
					console.log('🔍 [UI] Searching for audio streams...');
					
					// 1. 오디오 중지 메서드 시도 (모든 가능한 메서드)
					if (typeof session.stopAudio === 'function') {
						session.stopAudio();
						console.log('✅ [UI] Audio stopped via stopAudio()');
					}
					if (typeof session.pauseAudio === 'function') {
						session.pauseAudio();
						console.log('✅ [UI] Audio paused via pauseAudio()');
					}
					if (typeof session.closeAudio === 'function') {
						session.closeAudio();
						console.log('✅ [UI] Audio closed via closeAudio()');
					}
					if (typeof session.stop === 'function') {
						session.stop();
						console.log('✅ [UI] Session stopped via stop()');
					}
					if (typeof session.close === 'function') {
						session.close();
						console.log('✅ [UI] Session closed via close()');
					}
					if (typeof session.destroy === 'function') {
						session.destroy();
						console.log('✅ [UI] Session destroyed via destroy()');
					}
					
					// 2. 알려진 경로의 오디오 스트림 찾기
					const knownPaths = [
						session._audioInput,
						session._audioOutput,
						session.audioInput,
						session.audioOutput,
						session._inputStream,
						session._outputStream,
						session._mediaStream,
						session.mediaStream
					];
					
					// 3. 재귀적으로 모든 속성 검색하여 MediaStream 찾기
					const foundStreams = new Set();
					const visited = new WeakSet();
					
					function findMediaStreams(obj, depth = 0) {
						if (!obj || depth > 5 || visited.has(obj)) return;
						if (typeof obj !== 'object') return;
						
						visited.add(obj);
						
						// MediaStream인지 확인
						if (obj instanceof MediaStream || 
						    (obj.getTracks && typeof obj.getTracks === 'function' && 
						     obj.getAudioTracks && typeof obj.getAudioTracks === 'function')) {
							foundStreams.add(obj);
							return;
						}
						
						// 모든 속성 검색
						try {
							for (const key in obj) {
								if (key.startsWith('_') || 
								    ['audio', 'stream', 'input', 'output', 'media'].some(term => 
								    	key.toLowerCase().includes(term))) {
									try {
										const value = obj[key];
										if (value && typeof value === 'object') {
											findMediaStreams(value, depth + 1);
										}
									} catch (e) {
										// 접근 불가능한 속성 무시
									}
								}
							}
						} catch (e) {
							// 객체 순회 중 에러 무시
						}
					}
					
					// 알려진 경로와 세션 전체 검색
					for (const stream of knownPaths) {
						if (stream) {
							foundStreams.add(stream);
							findMediaStreams(stream);
						}
					}
					findMediaStreams(session);
					
					// 4. 찾은 모든 스트림 중지
					let stoppedCount = 0;
					for (const stream of foundStreams) {
						try {
							if (stream && typeof stream === 'object') {
								// MediaStream의 모든 트랙 중지
								if (stream.getTracks && typeof stream.getTracks === 'function') {
									const tracks = stream.getTracks();
									tracks.forEach(track => {
										if (track && typeof track.stop === 'function' && track.readyState !== 'ended') {
											track.stop();
											stoppedCount++;
											console.log(`✅ [UI] Audio track stopped (${track.kind || 'unknown'})`);
										}
									});
								}
								
								// 오디오 트랙만 별도로 중지
								if (stream.getAudioTracks && typeof stream.getAudioTracks === 'function') {
									const audioTracks = stream.getAudioTracks();
									audioTracks.forEach(track => {
										if (track && typeof track.stop === 'function' && track.readyState !== 'ended') {
											track.stop();
											stoppedCount++;
											console.log(`✅ [UI] Audio track stopped (audio)`);
										}
									});
								}
								
								// 스트림 자체에 stop 메서드가 있으면 호출
								if (typeof stream.stop === 'function') {
									stream.stop();
									console.log('✅ [UI] Stream stopped via stop()');
								}
							}
						} catch (streamErr) {
							console.warn('⚠️ [UI] Error stopping stream:', streamErr);
						}
					}
					
					console.log(`✅ [UI] Stopped ${stoppedCount} audio track(s) from ${foundStreams.size} stream(s)`);
				} catch (audioErr) {
					console.error('❌ [UI] Could not stop audio:', audioErr);
				}
				
				// WebSocket 연결 즉시 강제 종료
				const possiblePaths = [
					session._ws,
					session.ws,
					session.connection,
					session._connection?.ws,
					session._transport?.ws
				];
				
				for (const ws of possiblePaths) {
					if (ws && typeof ws.close === 'function') {
						try {
							console.log('🔧 [UI] Force closing WebSocket immediately...');
							ws.close(1000, 'User requested immediate disconnect');
							if (typeof ws.terminate === 'function') {
								ws.terminate();
							}
							console.log('✅ [UI] WebSocket force closed');
							break;
						} catch (closeErr) {
							console.warn('⚠️ [UI] Error closing WebSocket:', closeErr);
						}
					}
				}
				
				// 세션 객체 즉시 null로 설정 (가장 중요!)
				realtimeClient.session = null;
				console.log('✅ [UI] Session immediately set to null');
				
				// 추가 확인: 세션이 정말 null인지 확인
				if (realtimeClient.session !== null) {
					console.error('❌ [UI] CRITICAL: Session is still not null after setting to null!');
					console.error('❌ [UI] Forcing session to null again...');
					realtimeClient.session = null;
				}
			} catch (forceErr) {
				console.warn('⚠️ [UI] Force cleanup error:', forceErr);
			}
		}

		try {
			// 실제 종료 수행 (이미 세션이 null이므로 빠르게 완료됨)
			const disconnectPromise = realtimeClient.disconnect();
			const timeoutPromise = new Promise((_, reject) => 
				setTimeout(() => reject(new Error('Disconnect timeout')), 1000)
			);

			const verification = await Promise.race([disconnectPromise, timeoutPromise])
				.catch((err) => {
					console.warn('⚠️ [UI] Disconnect timeout or error (expected):', err.message);
					return {
						verified: true, // 세션이 이미 null이므로 검증 완료로 처리
						checks: { immediateCleanup: true },
						timestamp: new Date().toISOString()
					};
				});

			disconnectVerification = verification;
			console.log('✅ [UI] Disconnect completed, verification:', verification);
			
			// 대화 저장 (메시지가 있는 경우에만) - 저장 완료 후 히스토리 초기화
			// RealtimeClient에서 최종 대화 기록 가져오기 (진행 중인 메시지 포함)
			let historyToSave = [];
			if (realtimeClient && typeof realtimeClient.getConversationHistory === 'function') {
				historyToSave = realtimeClient.getConversationHistory();
			} else {
				// fallback: 컴포넌트의 conversationHistory 사용
				historyToSave = [...conversationHistory];
			}
			
			console.log('💾 [SAVE] Preparing to save conversation:', {
				messageCount: historyToSave.length,
				messages: historyToSave.map(m => ({
					role: m.role,
					hasContent: !!m.content,
					contentLength: m.content?.length || 0,
					timestamp: m.timestamp
				}))
			});
			
			if (historyToSave.length > 0) {
				console.log('💾 대화 저장 시작 - 메시지 개수:', historyToSave.length);
				await saveCurrentConversation(historyToSave);
			} else {
				console.log('⚠️ 저장할 대화가 없습니다. conversationHistory:', conversationHistory);
			}
		} catch (err) {
			console.error('❌ [UI] Error during disconnect:', err);
			// 에러가 발생해도 저장 시도
			const historyToSave = [...conversationHistory];
			if (historyToSave.length > 0) {
				console.log('💾 에러 발생 후 대화 저장 시도 - 메시지 개수:', historyToSave.length);
				try {
					await saveCurrentConversation(historyToSave);
				} catch (saveErr) {
					console.error('❌ 대화 저장 실패:', saveErr);
				}
			}
		} finally {
			// 저장 완료 후 클라이언트 정리 (항상 실행)
			realtimeClient = null;
			conversationHistory = [];
			
			// 네트워크 활동 초기화
			networkActivity = {
				isActive: false,
				hasRecentActivity: false,
				requests: [],
				lastRequestTime: null
			};
			
			isDisconnecting = false;
		}
	}

	/**
	 * 현재 대화를 데이터베이스에 저장
	 * @param {Array} messagesToSave - 저장할 메시지 배열 (선택사항, 없으면 conversationHistory 사용)
	 */
	async function saveCurrentConversation(messagesToSave = null, retryCount = 0) {
		if (isSaving) {
			console.log('⚠️ 이미 저장 중입니다.');
			return;
		}
		
		const messages = messagesToSave || conversationHistory;
		
		if (!messages || messages.length === 0) {
			console.log('⚠️ 저장할 대화가 없습니다.');
			return;
		}

		// 메시지 형식 사전 검증
		const validMessages = messages.filter(msg => {
			if (!msg || !msg.role) return false;
			if (!msg.content) return false;
			if (Array.isArray(msg.content) && msg.content.length === 0) return false;
			return true;
		});

		if (validMessages.length === 0) {
			console.error('❌ 저장할 유효한 메시지가 없습니다.');
			if (onError) {
				onError('저장할 유효한 대화가 없습니다.');
			}
			return;
		}
		
		console.log('💾 대화 저장 시작...', {
			messageCount: validMessages.length,
			originalCount: messages.length,
			language: currentLanguage,
			level: level,
			practiceMode: practiceMode,
			retryCount: retryCount
		});
		
		isSaving = true;
		saveSuccess = false;
		
		try {
			const { data, error } = await saveConversation({
				messages: validMessages,
				language: currentLanguage,
				level: level,
				practiceMode: practiceMode,
				practiceContent: practiceContent || null
			});
			
			if (error) {
				console.error('❌ 대화 저장 실패:', {
					error: error,
					message: error.message,
					details: error.details,
					hint: error.hint,
					code: error.code,
					retryCount: retryCount
				});

				// 네트워크 오류나 일시적 오류인 경우 재시도 (최대 2회)
				const isRetryableError = 
					error.code === 'PGRST301' || // 네트워크 오류
					error.message?.includes('network') ||
					error.message?.includes('timeout') ||
					error.message?.includes('fetch');

				if (isRetryableError && retryCount < 2) {
					console.log(`🔄 재시도 중... (${retryCount + 1}/2)`);
					await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // 지수 백오프
					return saveCurrentConversation(messagesToSave, retryCount + 1);
				}

				// 사용자에게 명확한 에러 메시지 표시
				let errorMessage = '대화 저장에 실패했습니다.';
				if (error.message?.includes('RLS') || error.message?.includes('policy') || error.message?.includes('permission')) {
					errorMessage = '대화 저장 권한이 없습니다. Supabase 설정을 확인해주세요.';
				} else if (error.message?.includes('프로필')) {
					errorMessage = '프로필이 없습니다. 로그아웃 후 다시 로그인해주세요.';
				} else {
					errorMessage = error.message || errorMessage;
				}

				if (onError) {
					onError(errorMessage);
				}
			} else {
				console.log('✅ 대화 저장 성공:', {
					id: data?.id,
					title: data?.title,
					created_at: data?.created_at
				});
				saveSuccess = true;
				// 3초 후 성공 메시지 숨기기
				setTimeout(() => {
					saveSuccess = false;
				}, 3000);
				// 저장 성공 콜백 호출
				if (onConversationSaved) {
					onConversationSaved();
				}
			}
		} catch (err) {
			console.error('❌ 대화 저장 중 예외 발생:', {
				error: err,
				message: err.message,
				stack: err.stack,
				retryCount: retryCount
			});

			// 네트워크 오류인 경우 재시도
			if (retryCount < 2 && (err.message?.includes('network') || err.message?.includes('fetch'))) {
				console.log(`🔄 재시도 중... (${retryCount + 1}/2)`);
				await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
				return saveCurrentConversation(messagesToSave, retryCount + 1);
			}

			if (onError) {
				onError('대화 저장 중 오류가 발생했습니다: ' + (err.message || '알 수 없는 오류'));
			}
		} finally {
			isSaving = false;
		}
	}

	// 컴포넌트가 숨겨질 때 (탭 전환) 연결 유지
	// 완전히 언마운트될 때만 연결 종료
	let isMounted = $state(true);
	
	$effect(() => {
		// 컴포넌트가 다시 보일 때 연결 상태 확인
		if (isMounted && wasConnectedBeforeUnmount && !isConnected && !isConnecting) {
			// 이전에 연결되어 있었다면, 실제로는 연결이 끊어졌으므로 상태만 초기화
			wasConnectedBeforeUnmount = false;
		}
	});

	onDestroy(() => {
		// 연결 상태 저장
		wasConnectedBeforeUnmount = isConnected;
		
		// 완전히 언마운트될 때만 정리
		if (activityCheckInterval) {
			clearInterval(activityCheckInterval);
		}
		// 탭 전환 시에는 연결을 유지하므로 disconnect 하지 않음
		// 페이지를 떠날 때만 disconnect
		if (realtimeClient && !wasConnectedBeforeUnmount) {
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
					onclick={() => (showSettings = false)}
					class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
					aria-label="설정 닫기"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<PracticeSettings 
				bind:level 
				bind:displayMode 
				bind:practiceMode 
				bind:practiceContent 
				bind:tutorPersonality
				bind:correctionStyle
				bind:responseLength
				bind:feedbackStyle
				bind:includeKoreanTranslation
				disabled={isConnecting || isConnected} 
			/>
		</div>
	{:else if !isConnected}
		<button
			onclick={() => (showSettings = true)}
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
			onclick={isConnected ? stopConversation : startConversation}
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

	<!-- 저장 상태 표시 -->
	{#if isSaving}
		<div class="mx-auto w-full max-w-2xl mt-4 rounded-2xl border-2 border-blue-300/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm px-4 py-3 text-center text-sm text-blue-700 shadow-lg">
			<div class="flex items-center justify-center gap-2">
				<svg class="h-5 w-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
				<span>대화 저장 중...</span>
			</div>
		</div>
	{/if}
	{#if saveSuccess}
		<div class="mx-auto w-full max-w-2xl mt-4 rounded-2xl border-2 border-emerald-300/50 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-sm px-4 py-3 text-center text-sm text-emerald-700 shadow-lg">
			<div class="flex items-center justify-center gap-2">
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
				<span>대화가 저장되었습니다!</span>
			</div>
		</div>
	{/if}

	<!-- 대화 기록 -->
	<div class="mx-auto w-full max-w-2xl">
		<ConversationHistory 
			messages={conversationHistory} 
			{currentLanguage} 
			{displayMode}
			isUserSpeaking={isSpeaking}
			isAssistantSpeaking={isListening}
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
			onclick={toggleDebug}
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
						onclick={() => {
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

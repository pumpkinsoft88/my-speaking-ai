import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';

/**
 * Realtime API 클라이언트
 * 초저지연 실시간 대화를 위한 클라이언트 클래스
 */
export class RealtimeClient {
	constructor() {
		this.session = null;
		this.agent = null;
		this.isConnected = false;
		this.isDisconnecting = false;
		this.conversationHistory = [];
		this.currentAssistantMessage = null;
		this.updateThrottle = null;
		this.disconnectPromise = null;
		this.lastDisconnectTime = null;
		this.networkActivity = {
			requests: [],
			lastRequestTime: null,
			isActive: false
		};
		this.eventHandlers = {
			onMessage: null,
			onError: null,
			onConnected: null,
			onDisconnected: null
		};
		// 강제 종료를 위한 플래그
		this._forceDisconnect = false;
	}

	/**
	 * Realtime 세션 시작
	 */
	async connect(clientSecret, language = 'traditional') {
		try {
			// 언어별 튜터 이름 설정
			const tutorNames = {
				traditional: 'Traditional Chinese Tutor (Taiwan)',
				simplified: 'Simplified Chinese Tutor',
				english: 'Chinese Conversation Tutor',
				korean: '중국어 회화 튜터'
			};

			// Agent 생성 (언어별 튜터)
			// instructions는 서버에서 이미 설정되므로 여기서는 기본 설정만 사용
			this.agent = new RealtimeAgent({
				name: tutorNames[language] || tutorNames['traditional'],
				instructions: 'You are a helpful Chinese conversation tutor. Help users practice Chinese speaking with brief, natural responses.'
			});

			// Session 생성
			this.session = new RealtimeSession(this.agent);

			// 이벤트 리스너 설정
			this.setupEventListeners();

			// 연결
			await this.session.connect({
				apiKey: clientSecret
			});

			this.isConnected = true;
			if (this.eventHandlers.onConnected) {
				this.eventHandlers.onConnected();
			}

			return true;
		} catch (error) {
			console.error('Realtime connection error:', error);
			if (this.eventHandlers.onError) {
				this.eventHandlers.onError(error);
			}
			throw error;
		}
	}

	/**
	 * 이벤트 리스너 설정
	 */
	setupEventListeners() {
		// 대화 아이템 추가
		this.session.on('conversation.item.added', (event) => {
			this.recordNetworkActivity('conversation.item.added', { itemType: event.item?.type });
			if (event.item && event.item.type === 'message') {
				const message = event.item;
				if (message.role === 'assistant') {
					this.currentAssistantMessage = {
						role: 'assistant',
						content: message.content || [],
						timestamp: new Date().toISOString()
					};
				} else if (message.role === 'user') {
					this.conversationHistory.push({
						role: 'user',
						content: message.content || [],
						timestamp: new Date().toISOString()
					});
					this.notifyMessageUpdate();
				}
			}
		});

		// 대화 아이템 완료
		this.session.on('conversation.item.done', (event) => {
			if (event.item && event.item.role === 'assistant') {
				if (this.currentAssistantMessage && this.currentAssistantMessage.content.length > 0) {
					this.conversationHistory.push(this.currentAssistantMessage);
					this.currentAssistantMessage = null;
					this.notifyMessageUpdate();
				}
			}
		});

		// 텍스트 출력 (실시간 스트리밍)
		this.session.on('response.output_text.delta', (event) => {
			this.recordNetworkActivity('response.output_text.delta', { hasDelta: !!event.delta });
			if (event.delta) {
				if (!this.currentAssistantMessage) {
					this.currentAssistantMessage = {
						role: 'assistant',
						content: [{ type: 'text', text: '' }],
						timestamp: new Date().toISOString()
					};
				}
				if (this.currentAssistantMessage.content[0]?.type === 'text') {
					this.currentAssistantMessage.content[0].text += event.delta;
					this.throttledUpdate();
				}
			}
		});

		// 에러 처리
		this.session.on('error', (err) => {
			console.error('Realtime session error:', err);
			if (this.eventHandlers.onError) {
				this.eventHandlers.onError(err);
			}
		});

		// 세션 생성 완료
		this.session.on('session.created', () => {
			console.log('Realtime session created (초저지연 모드)');
		});
	}

	/**
	 * UI 업데이트 스로틀링 (초저지연 최적화)
	 */
	throttledUpdate() {
		if (this.updateThrottle) {
			clearTimeout(this.updateThrottle);
		}
		this.updateThrottle = setTimeout(() => {
			this.notifyMessageUpdate();
			this.updateThrottle = null;
		}, 100);
	}

	/**
	 * 메시지 업데이트 알림
	 */
	notifyMessageUpdate() {
		if (this.eventHandlers.onMessage) {
			this.eventHandlers.onMessage([...this.conversationHistory]);
		}
	}

	/**
	 * 이벤트 핸들러 등록
	 */
	on(event, handler) {
		if (this.eventHandlers[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] !== undefined) {
			this.eventHandlers[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] = handler;
		}
	}

	/**
	 * 연결 종료 (검증 포함)
	 */
	async disconnect() {
		// 이미 종료 중이면 중복 호출 방지
		if (this.isDisconnecting) {
			console.log('⚠️ [DISCONNECT] Already disconnecting, waiting for completion...');
			return this.disconnectPromise;
		}

		this.isDisconnecting = true;
		this.disconnectPromise = this._performDisconnect();
		
		try {
			await this.disconnectPromise;
		} finally {
			this.isDisconnecting = false;
		}

		return this.disconnectPromise;
	}

	/**
	 * 실제 종료 수행
	 */
	async _performDisconnect() {
		console.log('🛑 [DISCONNECT] Starting disconnect process...');
		const disconnectStartTime = Date.now();

		// 1. 타이머 정리
		if (this.updateThrottle) {
			clearTimeout(this.updateThrottle);
			this.updateThrottle = null;
			console.log('✅ [DISCONNECT] Timers cleared');
		}

		// 2. 상태를 먼저 false로 설정하여 추가 요청 방지
		this.isConnected = false;
		this.networkActivity.isActive = false;
		this.networkActivity.lastRequestTime = null;

		// 3. 세션 즉시 강제 종료 (과금 방지를 위해 최우선)
		// 세션이 null이 아니면 무조건 처리 (UI에서 null로 설정했어도 다시 확인)
		const sessionRef = this.session; // 참조 저장 (null일 수 있음)
		
		if (sessionRef) {
			this._forceDisconnect = true; // 강제 종료 플래그 설정
			
			console.log('🛑 [DISCONNECT] Force disconnecting session immediately...');
			console.log('🔍 [DISCONNECT] Session object exists, type:', typeof sessionRef, 'constructor:', sessionRef.constructor?.name);
			
			// 오디오 스트림 즉시 중지 (AI 목소리 중지 - 과금 방지 최우선)
			try {
				console.log('🔍 [DISCONNECT] Searching for audio streams...');
				
				// 1. 오디오 입력/출력 중지 메서드 시도
				if (typeof sessionRef.stopAudio === 'function') {
					sessionRef.stopAudio();
					console.log('✅ [DISCONNECT] Audio stopped via stopAudio()');
				}
				if (typeof sessionRef.pauseAudio === 'function') {
					sessionRef.pauseAudio();
					console.log('✅ [DISCONNECT] Audio paused via pauseAudio()');
				}
				if (typeof sessionRef.closeAudio === 'function') {
					sessionRef.closeAudio();
					console.log('✅ [DISCONNECT] Audio closed via closeAudio()');
				}
				
				// 2. 알려진 경로의 오디오 스트림 찾기
				const knownPaths = [
					sessionRef._audioInput,
					sessionRef._audioOutput,
					sessionRef.audioInput,
					sessionRef.audioOutput,
					sessionRef._inputStream,
					sessionRef._outputStream,
					sessionRef.inputStream,
					sessionRef.outputStream,
					sessionRef._mediaStream,
					sessionRef.mediaStream,
					sessionRef._stream,
					sessionRef.stream
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
						
						// Symbol 속성도 확인
						if (Object.getOwnPropertySymbols) {
							for (const sym of Object.getOwnPropertySymbols(obj)) {
								try {
									const value = obj[sym];
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
				findMediaStreams(sessionRef);
				
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
										console.log(`✅ [DISCONNECT] Audio track stopped (${track.kind || 'unknown'})`);
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
										console.log(`✅ [DISCONNECT] Audio track stopped (audio)`);
									}
								});
							}
							
							// 스트림 자체에 stop 메서드가 있으면 호출
							if (typeof stream.stop === 'function') {
								stream.stop();
								console.log('✅ [DISCONNECT] Stream stopped via stop()');
							}
						}
					} catch (streamErr) {
						console.warn('⚠️ [DISCONNECT] Error stopping stream:', streamErr);
					}
				}
				
				console.log(`✅ [DISCONNECT] Stopped ${stoppedCount} audio track(s) from ${foundStreams.size} stream(s)`);
				
				// 5. 브라우저의 모든 활성 MediaStream 중지 (최후의 수단)
				if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
					try {
						// getUserMedia로 생성된 모든 스트림은 추적이 어려우므로
						// 브라우저의 활성 오디오 컨텍스트를 확인하고 중지
						const activeAudioContexts = [];
						// AudioContext를 찾을 수 없으므로 이 부분은 건너뜀
					} catch (browserErr) {
						console.warn('⚠️ [DISCONNECT] Could not access browser media devices:', browserErr);
					}
				}
			} catch (audioErr) {
				console.error('❌ [DISCONNECT] Could not stop audio:', audioErr);
			}
			
			// 세션 disconnect() 먼저 호출 (오디오 스트림 중지를 위해 - 가장 중요!)
			// disconnect()가 내부적으로 오디오를 중지하므로 먼저 호출
			try {
				if (sessionRef && typeof sessionRef.disconnect === 'function') {
					console.log('🛑 [DISCONNECT] Calling session.disconnect() to stop audio and close connection...');
					// 매우 짧은 타임아웃 (500ms) - 빠른 종료
					await Promise.race([
						sessionRef.disconnect(),
						new Promise((_, reject) => 
							setTimeout(() => reject(new Error('Disconnect timeout')), 500)
						)
					]).catch((err) => {
						console.warn('⚠️ [DISCONNECT] Disconnect timeout (continuing with force cleanup):', err.message);
					});
					console.log('✅ [DISCONNECT] Session.disconnect() completed');
					
					// disconnect() 후에도 오디오가 남아있을 수 있으므로 다시 확인
					// (위의 오디오 중지 로직이 이미 실행되었으므로 추가 확인만)
				}
			} catch (err) {
				console.warn('⚠️ [DISCONNECT] Error calling disconnect():', err);
			}
			
			// 즉시 WebSocket 연결 강제 종료 (disconnect()가 실패한 경우 대비)
			try {
				// 모든 가능한 경로로 WebSocket 찾기
				const possiblePaths = [
					sessionRef._ws,
					sessionRef.ws,
					sessionRef.connection,
					sessionRef._connection?.ws,
					sessionRef._transport?.ws,
					sessionRef._transport?.connection,
					sessionRef._client?.ws,
					sessionRef._client?.connection,
					// 객체의 모든 속성 검색
					...Object.values(sessionRef).filter(v => v && typeof v.close === 'function'),
					...Object.values(sessionRef).filter(v => v && v.ws && typeof v.ws.close === 'function').map(v => v.ws)
				];
				
				for (const ws of possiblePaths) {
					if (ws && typeof ws.close === 'function') {
						try {
							console.log('🔧 [DISCONNECT] Force closing WebSocket connection...');
							ws.close(1000, 'User requested immediate disconnect');
							if (typeof ws.terminate === 'function') {
								ws.terminate();
							}
							console.log('✅ [DISCONNECT] WebSocket connection force closed');
							break; // 하나라도 닫히면 중단
						} catch (closeErr) {
							console.warn('⚠️ [DISCONNECT] Error closing WebSocket:', closeErr);
						}
					}
				}
			} catch (wsErr) {
				console.warn('⚠️ [DISCONNECT] Could not find/close WebSocket:', wsErr);
			}
			
			// 세션의 모든 이벤트 리스너 즉시 제거
			try {
				if (sessionRef.removeAllListeners) {
					sessionRef.removeAllListeners();
					console.log('✅ [DISCONNECT] All event listeners removed');
				}
				// off 메서드도 시도
				if (sessionRef.off) {
					sessionRef.off();
				}
			} catch (listenerErr) {
				console.warn('⚠️ [DISCONNECT] Could not remove listeners:', listenerErr);
			}
			
			// 세션 객체 즉시 null로 설정 (가장 중요!)
			// 이렇게 하면 세션의 모든 메서드 호출이 실패하게 됨
			this.session = null;
			console.log('✅ [DISCONNECT] Session object immediately set to null');
			
			// 추가 확인: 세션이 정말 null인지 확인
			if (this.session !== null) {
				console.error('❌ [DISCONNECT] CRITICAL: Session is still not null after setting to null!');
				console.error('❌ [DISCONNECT] Session value:', this.session);
				console.error('❌ [DISCONNECT] Forcing session to null again...');
				// 강제로 null 설정 (다른 방법 시도)
				try {
					Object.defineProperty(this, 'session', { value: null, writable: true, configurable: true });
				} catch (e) {
					this.session = null;
				}
			}
		} else {
			console.log('ℹ️ [DISCONNECT] No session to disconnect (already null)');
		}
		
		// 세션이 여전히 존재하면 강제로 null 설정 (최우선!)
		if (this.session !== null) {
			console.error('❌ [DISCONNECT] CRITICAL: Session still exists after cleanup!');
			console.error('❌ [DISCONNECT] Final force: Setting session to null...');
			this.session = null;
		}

		// 4. Agent 정리 (세션보다 먼저 정리)
		if (this.agent) {
			// Agent의 오디오 관련 기능도 중지 시도
			try {
				if (typeof this.agent.stop === 'function') {
					this.agent.stop();
					console.log('✅ [DISCONNECT] Agent stopped');
				}
				if (typeof this.agent.pause === 'function') {
					this.agent.pause();
					console.log('✅ [DISCONNECT] Agent paused');
				}
			} catch (agentErr) {
				console.warn('⚠️ [DISCONNECT] Error stopping agent:', agentErr);
			}
			
			this.agent = null;
			console.log('✅ [DISCONNECT] Agent object cleared');
			
			// 추가 확인: Agent가 정말 null인지 확인
			if (this.agent !== null) {
				console.error('❌ [DISCONNECT] CRITICAL: Agent is still not null after setting to null!');
				console.error('❌ [DISCONNECT] Forcing agent to null again...');
				this.agent = null;
			}
		}

		// 5. 상태 초기화
		this.conversationHistory = [];
		this.currentAssistantMessage = null;
		this.lastDisconnectTime = new Date().toISOString();

		// 세션이 null이 아니면 강제로 null 설정 (검증 실패 방지 - 최우선!)
		if (this.session !== null) {
			console.error('❌ [DISCONNECT] CRITICAL: Session is not null before final check!');
			console.error('❌ [DISCONNECT] Forcing session to null immediately...');
			this.session = null;
		}
		
		// Agent가 null이 아니면 강제로 null 설정
		if (this.agent !== null) {
			console.error('❌ [DISCONNECT] CRITICAL: Agent is not null before final check!');
			console.error('❌ [DISCONNECT] Forcing agent to null immediately...');
			this.agent = null;
		}
		
		const disconnectDuration = Date.now() - disconnectStartTime;
		console.log(`✅ [DISCONNECT] Disconnect completed in ${disconnectDuration}ms`);
		
		// 최종 확인 (강제 null 설정 후)
		const finalSessionNull = this.session === null;
		const finalAgentNull = this.agent === null;
		console.log(`📊 [DISCONNECT] Final state: isConnected=${this.isConnected}, session=${finalSessionNull}, agent=${finalAgentNull}`);
		
		if (!finalSessionNull || !finalAgentNull) {
			console.error('❌ [DISCONNECT] CRITICAL ERROR: Session or Agent is still not null!');
			console.error('❌ [DISCONNECT] Final force cleanup...');
			this.session = null;
			this.agent = null;
			this.isConnected = false;
		}

		// 6. 종료 검증
		const verification = this.verifyDisconnected();
		console.log('🔍 [DISCONNECT] Verification result:', verification);
		
		// 검증 실패 시 상세 로그 출력
		if (!verification.verified) {
			console.warn('⚠️ [DISCONNECT] Verification failed. Failed checks:', 
				Object.entries(verification.checks)
					.filter(([key, value]) => key !== 'disconnectTime' && value !== true)
					.map(([key]) => key)
			);
		}

		// 7. 이벤트 핸들러 호출
		if (this.eventHandlers.onDisconnected) {
			this.eventHandlers.onDisconnected(verification);
		}

		return verification;
	}

	/**
	 * 종료 상태 검증
	 */
	verifyDisconnected() {
		const checks = {
			isConnected: !this.isConnected,
			sessionNull: this.session === null,
			agentNull: this.agent === null,
			noActiveTimers: this.updateThrottle === null,
			networkInactive: !this.networkActivity.isActive,
			disconnectTime: this.lastDisconnectTime
		};

		const allPassed = Object.values(checks).slice(0, 5).every(v => v === true);

		return {
			verified: allPassed,
			checks: checks,
			timestamp: new Date().toISOString()
		};
	}

	/**
	 * 네트워크 활동 기록
	 */
	recordNetworkActivity(type, data) {
		if (!this.isConnected || this.isDisconnecting) {
			console.warn('⚠️ [NETWORK] Activity recorded but connection is not active:', type);
			return;
		}

		this.networkActivity.requests.push({
			type,
			data,
			timestamp: new Date().toISOString()
		});

		this.networkActivity.lastRequestTime = Date.now();
		this.networkActivity.isActive = true;

		// 최근 100개만 유지
		if (this.networkActivity.requests.length > 100) {
			this.networkActivity.requests = this.networkActivity.requests.slice(-100);
		}
	}

	/**
	 * 네트워크 활동 상태 가져오기
	 */
	getNetworkActivity() {
		return {
			...this.networkActivity,
			recentRequests: this.networkActivity.requests.slice(-10),
			hasRecentActivity: this.networkActivity.lastRequestTime && 
				(Date.now() - this.networkActivity.lastRequestTime) < 5000
		};
	}

	/**
	 * 대화 기록 가져오기
	 */
	getHistory() {
		return [...this.conversationHistory];
	}
}


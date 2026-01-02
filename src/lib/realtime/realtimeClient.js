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

		// 2. 세션 종료
		if (this.session) {
			try {
				console.log('🛑 [DISCONNECT] Disconnecting session...');
				await this.session.disconnect();
				console.log('✅ [DISCONNECT] Session disconnected successfully');
			} catch (err) {
				console.error('❌ [DISCONNECT] Error disconnecting session:', err);
				// 에러가 발생해도 계속 진행
			}
			
			// 세션 객체 정리
			this.session = null;
			console.log('✅ [DISCONNECT] Session object cleared');
		}

		// 3. Agent 정리
		if (this.agent) {
			this.agent = null;
			console.log('✅ [DISCONNECT] Agent object cleared');
		}

		// 4. 상태 초기화
		this.isConnected = false;
		this.conversationHistory = [];
		this.currentAssistantMessage = null;
		this.lastDisconnectTime = new Date().toISOString();
		
		// 5. 네트워크 활동 모니터링 중지
		this.networkActivity.isActive = false;
		this.networkActivity.lastRequestTime = null;

		const disconnectDuration = Date.now() - disconnectStartTime;
		console.log(`✅ [DISCONNECT] Disconnect completed in ${disconnectDuration}ms`);
		console.log(`📊 [DISCONNECT] Final state: isConnected=${this.isConnected}, session=${this.session === null}, agent=${this.agent === null}`);

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


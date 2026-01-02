/**
 * 다국어 번역 데이터
 */
export const translations = {
	'traditional': {
		// Traditional Chinese (繁體中文)
		code: 'traditional',
		name: '繁體中文',
		nameEn: 'Traditional Chinese',
		title: '繁體中文對話練習',
		subtitle: 'Traditional Chinese (Taiwan) Conversation Practice',
		description: 'AI 튜터와 실시간으로 대만 번체 중국어 회화를 연습하세요',
		status: {
			waiting: '대기 중',
			connecting: '연결 중...',
			connected: '대화 중'
		},
		buttons: {
			start: '대화 시작',
			stop: '대화 종료',
			connecting: '연결 중...'
		},
		conversation: {
			title: '對話記錄',
			titleEn: 'Conversation History',
			empty: '대화를 시작하면 기록이 여기에 표시됩니다',
			processing: '正在處理...',
			audioMessage: '음성 메시지',
			you: '你',
			teacher: 'AI 老師',
			messages: '條訊息'
		},
		tips: {
			title: '대만 번체 중국어 회화 연습 시작하기',
			description: '"대화 시작" 버튼을 클릭하면 AI 튜터와 실시간으로 대만 번체 중국어 회화를 연습할 수 있습니다.',
			speaking: '💡 提示：自然地用繁體中文說話吧！',
			feedback: 'AI 老師會即時回應並提供回饋。'
		},
		footer: '⚡ 超低延遲即時語音對話 | 🎯 客製化繁體中文學習 | 🇹🇼 台灣繁體中文',
		features: {
			natural: '💬 자연스러운 대화',
			feedback: '🎯 맞춤형 피드백',
			lowLatency: '⚡ 초저지연'
		}
	},
	'simplified': {
		// Simplified Chinese (简体中文)
		code: 'simplified',
		name: '简体中文',
		nameEn: 'Simplified Chinese',
		title: '简体中文对话练习',
		subtitle: 'Simplified Chinese Conversation Practice',
		description: '与AI导师实时练习简体中文对话',
		status: {
			waiting: '等待中',
			connecting: '连接中...',
			connected: '对话中'
		},
		buttons: {
			start: '开始对话',
			stop: '结束对话',
			connecting: '连接中...'
		},
		conversation: {
			title: '对话记录',
			titleEn: 'Conversation History',
			empty: '开始对话后，记录将显示在这里',
			processing: '正在处理...',
			audioMessage: '语音消息',
			you: '你',
			teacher: 'AI 老师',
			messages: '条消息'
		},
		tips: {
			title: '简体中文对话练习开始',
			description: '点击"开始对话"按钮，即可与AI导师实时练习简体中文对话。',
			speaking: '💡 提示：自然地用简体中文说话吧！',
			feedback: 'AI 老师会即时回应并提供反馈。'
		},
		footer: '⚡ 超低延迟即时语音对话 | 🎯 定制化简体中文学习',
		features: {
			natural: '💬 自然对话',
			feedback: '🎯 定制反馈',
			lowLatency: '⚡ 超低延迟'
		}
	},
	'english': {
		// English
		code: 'english',
		name: 'English',
		nameEn: 'English',
		title: 'Chinese Conversation Practice',
		subtitle: 'Learn Chinese with AI Tutor',
		description: 'Practice Chinese conversation in real-time with an AI tutor',
		status: {
			waiting: 'Waiting',
			connecting: 'Connecting...',
			connected: 'In Conversation'
		},
		buttons: {
			start: 'Start Conversation',
			stop: 'End Conversation',
			connecting: 'Connecting...'
		},
		conversation: {
			title: 'Conversation History',
			titleEn: 'Conversation History',
			empty: 'Conversation history will appear here once you start',
			processing: 'Processing...',
			audioMessage: 'Audio Message',
			you: 'You',
			teacher: 'AI Teacher',
			messages: 'messages'
		},
		tips: {
			title: 'Start Chinese Conversation Practice',
			description: 'Click "Start Conversation" to practice Chinese conversation in real-time with an AI tutor.',
			speaking: '💡 Tip: Speak naturally in Chinese!',
			feedback: 'AI teacher will respond in real-time and provide feedback.'
		},
		footer: '⚡ Ultra-low latency real-time voice | 🎯 Customized Chinese learning',
		features: {
			natural: '💬 Natural Conversation',
			feedback: '🎯 Customized Feedback',
			lowLatency: '⚡ Ultra-low Latency'
		}
	},
	'korean': {
		// Korean (한국어)
		code: 'korean',
		name: '한국어',
		nameEn: 'Korean',
		title: '중국어 회화 연습',
		subtitle: 'Chinese Conversation Practice',
		description: 'AI 튜터와 실시간으로 중국어 회화를 연습하세요',
		status: {
			waiting: '대기 중',
			connecting: '연결 중...',
			connected: '대화 중'
		},
		buttons: {
			start: '대화 시작',
			stop: '대화 종료',
			connecting: '연결 중...'
		},
		conversation: {
			title: '대화 기록',
			titleEn: 'Conversation History',
			empty: '대화를 시작하면 기록이 여기에 표시됩니다',
			processing: '처리 중...',
			audioMessage: '음성 메시지',
			you: '당신',
			teacher: 'AI 튜터',
			messages: '개 메시지'
		},
		tips: {
			title: '중국어 회화 연습 시작하기',
			description: '"대화 시작" 버튼을 클릭하면 AI 튜터와 실시간으로 중국어 회화를 연습할 수 있습니다.',
			speaking: '💡 팁: 자연스럽게 중국어로 말해보세요!',
			feedback: 'AI 튜터가 실시간으로 응답하고 피드백을 제공합니다.'
		},
		footer: '⚡ 초저지연 실시간 음성 대화 | 🎯 맞춤형 중국어 학습',
		features: {
			natural: '💬 자연스러운 대화',
			feedback: '🎯 맞춤형 피드백',
			lowLatency: '⚡ 초저지연'
		}
	}
};

/**
 * 언어별 AI 튜터 프롬프트
 */
export const tutorInstructions = {
	'traditional': `你是一位友善的繁體中文對話老師，專門幫助學習者練習台灣繁體中文。你的任務是幫助用戶練習繁體中文口語。

請遵循以下原則：
1. 使用台灣繁體中文（繁體字）與用戶對話，使用台灣常用的口語表達方式
2. 根據用戶的水平調整對話難度
3. 當用戶犯錯時，溫和地糾正並給出正確表達
4. 保持對話非常簡短，每次回覆不超過1-2句話
5. 使用台灣日常口語，避免過於正式的表達
6. 鼓勵用戶多說，給予積極的反饋
7. 可以提出簡單的問題引導對話
8. 使用台灣常用的詞彙和表達方式（例如：你好、謝謝、不好意思等）

請用繁體中文回覆，保持友善和耐心的態度。為了最低延遲，請保持回覆極簡短。`,
	'simplified': `你是一位友善的简体中文对话老师，专门帮助学习者练习简体中文。你的任务是帮助用户练习简体中文口语。

请遵循以下原则：
1. 使用简体中文与用户对话，使用常用的口语表达方式
2. 根据用户的水平调整对话难度
3. 当用户犯错时，温和地纠正并给出正确表达
4. 保持对话非常简短，每次回复不超过1-2句话
5. 使用日常口语，避免过于正式的表达
6. 鼓励用户多说，给予积极的反馈
7. 可以提出简单的问题引导对话
8. 使用常用的词汇和表达方式（例如：你好、谢谢、不好意思等）

请用简体中文回复，保持友善和耐心的态度。为了最低延迟，请保持回复极简短。`,
	'english': `You are a friendly Chinese conversation tutor helping learners practice Chinese. Your task is to help users practice Chinese speaking.

Please follow these principles:
1. Use Chinese (Traditional or Simplified based on user preference) to converse with users, using common conversational expressions
2. Adjust conversation difficulty based on user's level
3. When users make mistakes, gently correct and provide the correct expression
4. Keep conversations very brief, each response should not exceed 1-2 sentences
5. Use everyday spoken language, avoid overly formal expressions
6. Encourage users to speak more, provide positive feedback
7. Can ask simple questions to guide the conversation
8. Use common vocabulary and expressions (e.g., 你好, 谢谢, 不好意思)

Please reply in Chinese, maintain a friendly and patient attitude. For lowest latency, keep replies extremely brief.`,
	'korean': `당신은 친근한 중국어 회화 튜터입니다. 학습자들이 중국어를 연습할 수 있도록 돕는 것이 당신의 임무입니다.

다음 원칙을 따르세요:
1. 사용자와 중국어로 대화하며, 일반적인 회화 표현을 사용하세요
2. 사용자의 수준에 따라 대화 난이도를 조정하세요
3. 사용자가 실수하면 부드럽게 교정하고 올바른 표현을 제공하세요
4. 대화를 매우 짧게 유지하고, 각 응답은 1-2문장을 넘지 않도록 하세요
5. 일상 회화를 사용하고, 너무 격식적인 표현은 피하세요
6. 사용자가 더 많이 말하도록 격려하고 긍정적인 피드백을 제공하세요
7. 대화를 이끌기 위해 간단한 질문을 할 수 있습니다
8. 일반적인 어휘와 표현을 사용하세요 (예: 你好, 谢谢, 不好意思)

중국어로 답변하고, 친근하고 인내심 있는 태도를 유지하세요. 최저 지연을 위해 응답을 매우 짧게 유지하세요.`
};


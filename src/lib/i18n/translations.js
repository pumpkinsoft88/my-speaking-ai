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
		},
		auth: {
			login: '登入',
			signup: '註冊',
			logout: '登出',
			email: '電子郵件',
			password: '密碼',
			confirmPassword: '確認密碼',
			loginTitle: '登入帳號',
			signupTitle: '建立新帳號',
			noAccount: '還沒有帳號？',
			hasAccount: '已經有帳號？',
			loginButton: '登入',
			signupButton: '註冊',
			success: '成功！',
			loginSuccess: '登入成功',
			signupSuccess: '註冊成功，請檢查您的電子郵件',
			emailSentTo: '驗證電子郵件已發送至以下地址：',
			emailCheckInstructions: '請檢查您的電子郵件以驗證您的帳號。驗證後即可登入。',
			goToLogin: '前往登入頁面',
			goToHome: '返回首頁',
			error: '錯誤',
			invalidEmail: '無效的電子郵件地址',
			weakPassword: '密碼至少需要6個字符',
			passwordValid: '密碼有效',
			passwordMatch: '密碼匹配',
			passwordMismatch: '密碼不匹配',
			userExists: '此電子郵件已被使用',
			invalidCredentials: '電子郵件或密碼不正確'
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
		},
		auth: {
			login: '登录',
			signup: '注册',
			logout: '登出',
			email: '电子邮件',
			password: '密码',
			confirmPassword: '确认密码',
			loginTitle: '登录账号',
			signupTitle: '创建新账号',
			noAccount: '还没有账号？',
			hasAccount: '已经有账号？',
			loginButton: '登录',
			signupButton: '注册',
			success: '成功！',
			loginSuccess: '登录成功',
			signupSuccess: '注册成功，请检查您的电子邮件',
			emailSentTo: '验证电子邮件已发送至以下地址：',
			emailCheckInstructions: '请检查您的电子邮件以验证您的账号。验证后即可登录。',
			goToLogin: '前往登录页面',
			goToHome: '返回首页',
			error: '错误',
			invalidEmail: '无效的电子邮件地址',
			weakPassword: '密码至少需要6个字符',
			passwordValid: '密码有效',
			passwordMatch: '密码匹配',
			passwordMismatch: '密码不匹配',
			userExists: '此电子邮件已被使用',
			invalidCredentials: '电子邮件或密码不正确'
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
		},
		auth: {
			login: 'Login',
			signup: 'Sign Up',
			logout: 'Logout',
			email: 'Email',
			password: 'Password',
			confirmPassword: 'Confirm Password',
			loginTitle: 'Login to Your Account',
			signupTitle: 'Create New Account',
			noAccount: "Don't have an account?",
			hasAccount: 'Already have an account?',
			loginButton: 'Login',
			signupButton: 'Sign Up',
			success: 'Success!',
			loginSuccess: 'Login successful',
			signupSuccess: 'Sign up successful, please check your email',
			emailSentTo: 'Verification email has been sent to the following address:',
			emailCheckInstructions: 'Please check your email to verify your account. You can log in after verification.',
			goToLogin: 'Go to Login Page',
			goToHome: 'Go to Home',
			error: 'Error',
			invalidEmail: 'Invalid email address',
			weakPassword: 'Password must be at least 6 characters',
			passwordValid: 'Password is valid',
			passwordMatch: 'Passwords match',
			passwordMismatch: 'Passwords do not match',
			userExists: 'This email is already in use',
			invalidCredentials: 'Invalid email or password',
			emailVerifying: 'Verifying email...',
			pleaseWait: 'Please wait a moment.',
			emailVerified: 'Email verified!',
			emailVerifiedMessage: 'Your email has been verified. You will be redirected to the home page shortly.',
			emailVerifiedLoginMessage: 'Your email has been verified. Please log in.'
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
		},
		auth: {
			login: '로그인',
			signup: '회원가입',
			logout: '로그아웃',
			email: '이메일',
			password: '비밀번호',
			confirmPassword: '비밀번호 확인',
			loginTitle: '로그인',
			signupTitle: '회원가입',
			noAccount: '계정이 없으신가요?',
			hasAccount: '이미 계정이 있으신가요?',
			loginButton: '로그인',
			signupButton: '회원가입',
			success: '성공!',
			loginSuccess: '로그인 성공',
			signupSuccess: '회원가입 성공, 이메일을 확인해주세요',
			emailSentTo: '인증 이메일이 다음 주소로 전송되었습니다:',
			emailCheckInstructions: '이메일을 확인하여 계정을 인증해주세요. 인증 후 로그인하실 수 있습니다.',
			goToLogin: '로그인 페이지로 이동',
			goToHome: '홈으로 이동',
			error: '오류',
			invalidEmail: '유효하지 않은 이메일 주소입니다',
			weakPassword: '비밀번호는 최소 6자 이상이어야 합니다',
			passwordValid: '비밀번호가 유효합니다',
			passwordMatch: '비밀번호가 일치합니다',
			passwordMismatch: '비밀번호가 일치하지 않습니다',
			userExists: '이 이메일은 이미 사용 중입니다',
			invalidCredentials: '이메일 또는 비밀번호가 올바르지 않습니다',
			emailVerifying: '이메일 인증 중...',
			pleaseWait: '잠시만 기다려주세요.',
			emailVerified: '이메일 인증 완료!',
			emailVerifiedMessage: '이메일 인증이 완료되었습니다. 잠시 후 홈으로 이동합니다.',
			emailVerifiedLoginMessage: '이메일 인증이 완료되었습니다. 로그인해주세요.'
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


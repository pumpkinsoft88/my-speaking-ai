import { json } from '@sveltejs/kit';
import { OPENAI_API_KEY } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		if (!OPENAI_API_KEY) {
			console.error('OPENAI_API_KEY is not configured');
			return json(
				{
					error: 'OpenAI API key not configured',
					message: 'Please set OPENAI_API_KEY in your .env file'
				},
				{ status: 500 }
			);
		}

		// 요청 데이터 파싱
		const body = await request.json();
		const { 
			language = 'traditional', 
			level = 'beginner', 
			practiceMode = 'free', 
			practiceContent = '',
			tutorPersonality = 'friendly',
			correctionStyle = 'gentle',
			responseLength = 'short',
			feedbackStyle = 'positive',
			includeKoreanTranslation = true
		} = body;

		// 레벨별 설정
		const levelConfig = {
			beginner: {
				description: '초급자',
				vocabulary: '기본 단어 (예: 你好, 谢谢, 再见, 早上好, 晚上好)',
				sentence: '간단한 문장 (예: 你好吗？, 我很好, 谢谢)',
				complexity: '매우 간단하고 짧은 문장만 사용하세요. 한 번에 하나의 개념만 다루세요.'
			},
			intermediate: {
				description: '중급자',
				vocabulary: '일상 단어 (예: 今天, 天气, 工作, 学习, 朋友)',
				sentence: '일상 대화 문장 (예: 今天天气很好, 我在工作, 你吃饭了吗？)',
				complexity: '일상 대화 수준의 문장을 사용하세요. 복잡한 문법 구조를 포함할 수 있습니다.'
			},
			advanced: {
				description: '고급자',
				vocabulary: '고급 단어와 표현',
				sentence: '복잡한 문장과 고급 표현',
				complexity: '자연스럽고 유창한 대화를 유지하세요. 고급 문법과 표현을 사용할 수 있습니다.'
			}
		};

		const currentLevel = levelConfig[level] || levelConfig.beginner;

		// 연습 모드별 지침
		let practiceInstructions = '';
		if (practiceMode === 'vocabulary' && practiceContent) {
			const words = practiceContent.split(',').map(w => w.trim()).filter(w => w);
			practiceInstructions = `\n\n【단어 연습 모드】
사용자가 다음 단어들을 연습하고 있습니다: ${words.join(', ')}
- 이 단어들을 자연스럽게 대화에 포함시키세요
- 각 단어의 의미와 사용법을 설명하거나 예문을 제공하세요
- 사용자가 단어를 올바르게 사용했을 때 칭찬하세요
- 사용자가 실수하면 부드럽게 교정하세요`;
		} else if (practiceMode === 'sentence' && practiceContent) {
			practiceInstructions = `\n\n【문장 연습 모드】
사용자가 다음 문장을 연습하고 있습니다: "${practiceContent}"
- 이 문장을 중심으로 대화를 이끌어가세요
- 문장의 구조와 의미를 설명하세요
- 유사한 문장이나 변형을 제시하세요
- 사용자가 문장을 올바르게 말했을 때 칭찬하세요`;
		}

		// 언어별 기본 지침
		const languageInstructions = {
			traditional: '使用台灣繁體中文（繁體字）與用戶對話，使用台灣常用的口語表達方式',
			simplified: '使用简体中文与用户对话，使用常用的口语表达方式',
			english: 'Use Chinese (Traditional or Simplified based on user preference) to converse with users',
			korean: '사용자와 중국어로 대화하며, 일반적인 회화 표현을 사용하세요'
		};

		// 튜터 성격 설정
		const personalityMap = {
			friendly: {
				tone: '友善、溫暖、親切',
				description: '你是一位友善、溫暖的中文對話老師，專門幫助學習者練習中文。你的任務是幫助用戶練習中文口語。'
			},
			neutral: {
				tone: '專業、客觀、中立',
				description: '你是一位專業、客觀的中文對話老師，專門幫助學習자練習中文。你的任務是幫助用戶練習中文口語。'
			},
			strict: {
				tone: '嚴格、精確、認真',
				description: '你是一位嚴格、認真的中文對話老師，專門幫助學習者練習中文。你的任務是幫助用戶練習中文口語，並確保語言的準確性。'
			}
		};

		// 교정 방식 설정
		const correctionMap = {
			gentle: '當用戶犯錯時，溫和地、友善地糾正並給出正確表達，不要讓用戶感到壓力',
			direct: '當用戶犯錯時，直接、明確地指出錯誤並給出正確表達',
			detailed: '當用戶犯錯時，詳細解釋錯誤的原因，並給出正確表達和相關例句'
		};

		// 응답 길이 설정
		const responseLengthMap = {
			'very-short': '保持對話極其簡短，每次回覆不超過1句話',
			'short': '保持對話非常簡短，每次回覆不超過1-2句話',
			'medium': '保持對話簡潔，每次回覆不超過2-3句話'
		};

		// 피드백 스타일 설정
		const feedbackMap = {
			positive: '鼓勵用戶多說，給予積極、正面的反饋和讚美',
			balanced: '給予平衡的 feedback，既鼓勵用戶，也指出需要改進的地方',
			constructive: '給予建設性的 feedback，重點關注如何改進和提升'
		};

		const personality = personalityMap[tutorPersonality] || personalityMap.friendly;
		const correction = correctionMap[correctionStyle] || correctionMap.gentle;
		const responseLengthText = responseLengthMap[responseLength] || responseLengthMap.short;
		const feedback = feedbackMap[feedbackStyle] || feedbackMap.positive;

		// 한국어 번역 포함 여부에 따른 지침
		let translationInstruction = '';
		if (includeKoreanTranslation) {
			translationInstruction = `
【중요 - 반드시 준수】
- **모든 응답에서 중국어 뒤에 괄호로 한국어 번역을 반드시 포함하세요**
- 형식: 中文內容 (한국어 번역)
- 예시: 
  * 你好 (안녕하세요)
  * 今天天气很好 (오늘 날씨가 좋네요)
  * 你吃饭了吗？ (밥 먹었어요?)
  * 我很好，谢谢 (저는 잘 지내요, 감사합니다)
- 번역은 자연스러운 한국어로 제공하세요
- 중국어와 한국어 번역을 함께 제공하는 것이 필수입니다`;
		}

		// 동적 프롬프트 생성
		const instructions = `${personality.description}

【학습자 레벨】${currentLevel.description}
${currentLevel.complexity}

【기본 원칙】
1. ${languageInstructions[language] || languageInstructions.traditional}
2. 根據用戶的水平調整對話難度（當前：${currentLevel.description}）
3. ${correction}
4. ${responseLengthText}
5. 使用日常口語，避免過於正式的表達
6. ${feedback}
7. 可以提出簡單的問題引導對話
${practiceInstructions}
${translationInstruction}
${includeKoreanTranslation ? '\n請用中文回覆，保持' + personality.tone + '的態度。모든 응답에 한국어 번역을 괄호 안에 포함하세요.' : '\n請用中文回覆，保持' + personality.tone + '的態度。'}`;

		// Realtime API ephemeral key 생성
		const sessionConfig = {
			session: {
				type: 'realtime',
				model: 'gpt-realtime',
				instructions: instructions,
				tools: []
			}
		};

		console.log('Creating realtime session with config:', JSON.stringify(sessionConfig, null, 2));

		const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${OPENAI_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(sessionConfig)
		});

		console.log('OpenAI API response status:', response.status, response.statusText);

		if (!response.ok) {
			const errorText = await response.text();
			let errorData;
			try {
				errorData = JSON.parse(errorText);
			} catch {
				errorData = { message: errorText };
			}
			console.error('OpenAI API error:', {
				status: response.status,
				statusText: response.statusText,
				error: errorData
			});
			return json(
				{
					error: 'Failed to create realtime session',
					details: errorData.message || errorData.error?.message || 'Unknown error',
					debug: {
						status: response.status,
						statusText: response.statusText,
						errorData: errorData,
						requestConfig: sessionConfig
					}
				},
				{ status: response.status }
			);
		}

		const data = await response.json();
		
		if (!data || !data.value) {
			console.error('Invalid response from OpenAI API:', data);
			return json({ error: 'Invalid response from OpenAI API' }, { status: 500 });
		}

		return json({ clientSecret: data.value });
	} catch (error) {
		console.error('Error creating realtime session:', {
			message: error.message,
			stack: error.stack,
			name: error.name
		});
		return json(
			{
				error: 'Internal server error',
				message: error.message || 'Unknown error occurred'
			},
			{ status: 500 }
		);
	}
}

import { supabase } from './client.js';

/**
 * 대화 저장/조회 서비스
 */

/**
 * 현재 대화를 저장
 * @param {Object} conversationData - 저장할 대화 데이터
 * @param {Array} conversationData.messages - 대화 메시지 배열
 * @param {string} conversationData.language - 언어 설정
 * @param {string} conversationData.level - 레벨
 * @param {string} conversationData.practiceMode - 연습 모드
 * @param {string} conversationData.practiceContent - 연습 내용
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function saveConversation(conversationData) {
	try {
		const { data: { user } } = await supabase.auth.getUser();
		
		if (!user) {
			throw new Error('로그인이 필요합니다.');
		}

		// 첫 번째 사용자 메시지로 제목 생성 (없으면 기본 제목 사용)
		const firstUserMessage = conversationData.messages.find(
			msg => msg.role === 'user' && msg.content?.[0]?.text
		);
		const title = firstUserMessage 
			? firstUserMessage.content[0].text.substring(0, 50) + (firstUserMessage.content[0].text.length > 50 ? '...' : '')
			: `대화 ${new Date().toLocaleString('ko-KR')}`;

		const { data, error } = await supabase
			.from('conversations')
			.insert({
				user_id: user.id,
				title: title,
				messages: conversationData.messages,
				language: conversationData.language || 'traditional',
				level: conversationData.level || 'beginner',
				practice_mode: conversationData.practiceMode || 'free',
				practice_content: conversationData.practiceContent || null
			})
			.select()
			.single();

		if (error) throw error;

		return { data, error: null };
	} catch (error) {
		console.error('대화 저장 오류:', error);
		return { data: null, error };
	}
}

/**
 * 사용자의 모든 대화 목록 조회
 * @param {Object} options - 조회 옵션
 * @param {number} options.limit - 조회할 개수 (기본값: 50)
 * @param {number} options.offset - 오프셋 (기본값: 0)
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function getConversations(options = {}) {
	try {
		const { data: { user } } = await supabase.auth.getUser();
		
		if (!user) {
			throw new Error('로그인이 필요합니다.');
		}

		const { limit = 50, offset = 0 } = options;

		const { data, error } = await supabase
			.from('conversations')
			.select('id, title, language, level, practice_mode, created_at, updated_at, messages')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) throw error;

		// 메시지 개수 추가
		const conversationsWithCount = data.map(conv => ({
			...conv,
			messageCount: Array.isArray(conv.messages) ? conv.messages.length : 0,
			messages: undefined // 목록에서는 메시지 내용 제외 (성능 최적화)
		}));

		return { data: conversationsWithCount, error: null };
	} catch (error) {
		console.error('대화 목록 조회 오류:', error);
		return { data: null, error };
	}
}

/**
 * 특정 대화 상세 조회
 * @param {string} conversationId - 대화 ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getConversationById(conversationId) {
	try {
		const { data: { user } } = await supabase.auth.getUser();
		
		if (!user) {
			throw new Error('로그인이 필요합니다.');
		}

		const { data, error } = await supabase
			.from('conversations')
			.select('*')
			.eq('id', conversationId)
			.eq('user_id', user.id)
			.single();

		if (error) throw error;

		return { data, error: null };
	} catch (error) {
		console.error('대화 조회 오류:', error);
		return { data: null, error };
	}
}

/**
 * 대화 삭제
 * @param {string} conversationId - 대화 ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function deleteConversation(conversationId) {
	try {
		const { data: { user } } = await supabase.auth.getUser();
		
		if (!user) {
			throw new Error('로그인이 필요합니다.');
		}

		const { data, error } = await supabase
			.from('conversations')
			.delete()
			.eq('id', conversationId)
			.eq('user_id', user.id)
			.select()
			.single();

		if (error) throw error;

		return { data, error: null };
	} catch (error) {
		console.error('대화 삭제 오류:', error);
		return { data: null, error };
	}
}

/**
 * 대화 제목 업데이트
 * @param {string} conversationId - 대화 ID
 * @param {string} title - 새 제목
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function updateConversationTitle(conversationId, title) {
	try {
		const { data: { user } } = await supabase.auth.getUser();
		
		if (!user) {
			throw new Error('로그인이 필요합니다.');
		}

		const { data, error } = await supabase
			.from('conversations')
			.update({ title })
			.eq('id', conversationId)
			.eq('user_id', user.id)
			.select()
			.single();

		if (error) throw error;

		return { data, error: null };
	} catch (error) {
		console.error('대화 제목 업데이트 오류:', error);
		return { data: null, error };
	}
}


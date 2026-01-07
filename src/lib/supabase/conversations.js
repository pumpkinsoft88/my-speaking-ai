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
		const { data: { user }, error: userError } = await supabase.auth.getUser();
		
		if (userError) {
			console.error('사용자 가져오기 오류:', userError);
			throw new Error('사용자 인증 오류: ' + userError.message);
		}
		
		if (!user) {
			throw new Error('로그인이 필요합니다.');
		}

		console.log('💾 대화 저장 시도 - 사용자 ID:', user.id);
		console.log('💾 사용자 이메일:', user.email);

		// 프로필 확인 및 생성 (없으면 생성)
		let profileExists = false;
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('id')
			.eq('id', user.id)
			.single();

		if (profileError) {
			if (profileError.code === 'PGRST116') {
				// 프로필이 없는 경우 생성
				console.log('⚠️ 프로필이 없습니다. 프로필 생성 중...');
				const { data: newProfile, error: insertProfileError } = await supabase
					.from('profiles')
					.insert({
						id: user.id,
						email: user.email || '',
						name: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
					})
					.select()
					.single();

				if (insertProfileError) {
					console.error('❌ 프로필 생성 오류:', {
						error: insertProfileError,
						message: insertProfileError.message,
						details: insertProfileError.details,
						hint: insertProfileError.hint,
						code: insertProfileError.code
					});
					throw new Error('프로필 생성 실패: ' + insertProfileError.message);
				}
				console.log('✅ 프로필 생성 완료:', newProfile);
				profileExists = true;
			} else {
				console.error('❌ 프로필 확인 오류:', {
					error: profileError,
					message: profileError.message,
					code: profileError.code
				});
				throw new Error('프로필 확인 실패: ' + profileError.message);
			}
		} else {
			console.log('✅ 프로필 확인 완료:', profile);
			profileExists = true;
		}

		if (!profileExists) {
			throw new Error('프로필이 존재하지 않습니다.');
		}

		// 첫 번째 사용자 메시지로 제목 생성 (없으면 기본 제목 사용)
		const firstUserMessage = conversationData.messages.find(
			msg => msg.role === 'user' && msg.content?.[0]?.text
		);
		const title = firstUserMessage 
			? firstUserMessage.content[0].text.substring(0, 50) + (firstUserMessage.content[0].text.length > 50 ? '...' : '')
			: `대화 ${new Date().toLocaleString('ko-KR')}`;

		// 메시지 형식 검증 및 정리
		const validatedMessages = (conversationData.messages || []).map((msg, index) => {
			// 기본 형식 확인
			if (!msg.role) {
				console.warn(`⚠️ 메시지 ${index}에 role이 없습니다:`, msg);
				return null;
			}
			
			// content 배열 정리
			let content = [];
			if (Array.isArray(msg.content)) {
				content = msg.content.filter(item => {
					if (item.type === 'text' && item.text) {
						return true;
					}
					return false;
				});
			} else if (typeof msg.content === 'string') {
				// 레거시 형식 지원
				content = [{ type: 'text', text: msg.content }];
			}
			
			if (content.length === 0) {
				console.warn(`⚠️ 메시지 ${index}에 유효한 content가 없습니다:`, msg);
				return null;
			}
			
			return {
				role: msg.role,
				content: content,
				timestamp: msg.timestamp || new Date().toISOString()
			};
		}).filter(msg => msg !== null); // null 제거
		
		if (validatedMessages.length === 0) {
			throw new Error('저장할 유효한 메시지가 없습니다.');
		}

		console.log('💾 대화 저장 중...', {
			user_id: user.id,
			title: title,
			message_count: validatedMessages.length,
			original_count: conversationData.messages.length,
			messages_sample: validatedMessages.slice(0, 2)
		});

		const { data, error } = await supabase
			.from('conversations')
			.insert({
				user_id: user.id,
				title: title,
				messages: validatedMessages,
				language: conversationData.language || 'traditional',
				level: conversationData.level || 'beginner',
				practice_mode: conversationData.practiceMode || 'free',
				practice_content: conversationData.practiceContent || null
			})
			.select()
			.single();

		if (error) {
			console.error('❌ 대화 저장 실패:', {
				error: error,
				message: error.message,
				details: error.details,
				hint: error.hint,
				code: error.code
			});
			throw error;
		}

		console.log('✅ 대화 저장 성공:', data);
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
		const { data: { user }, error: userError } = await supabase.auth.getUser();
		
		if (userError) {
			console.error('❌ 사용자 가져오기 오류:', userError);
			throw new Error('사용자 인증 오류: ' + userError.message);
		}
		
		if (!user) {
			console.warn('⚠️ 사용자가 로그인하지 않았습니다.');
			throw new Error('로그인이 필요합니다.');
		}

		console.log('📋 대화 목록 조회 시작 - 사용자 ID:', user.id);

		const { limit = 50, offset = 0 } = options;

		const { data, error } = await supabase
			.from('conversations')
			.select('id, title, language, level, practice_mode, created_at, updated_at, messages')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) {
			console.error('❌ 대화 목록 조회 실패:', {
				error: error,
				message: error.message,
				details: error.details,
				hint: error.hint,
				code: error.code
			});
			throw error;
		}

		console.log('✅ 대화 목록 조회 성공:', {
			count: data?.length || 0,
			conversations: data?.map(c => ({
				id: c.id,
				title: c.title,
				messageCount: Array.isArray(c.messages) ? c.messages.length : 0
			}))
		});

		// 메시지 개수 추가
		const conversationsWithCount = (data || []).map(conv => ({
			...conv,
			messageCount: Array.isArray(conv.messages) ? conv.messages.length : 0,
			messages: undefined // 목록에서는 메시지 내용 제외 (성능 최적화)
		}));

		return { data: conversationsWithCount, error: null };
	} catch (error) {
		console.error('❌ 대화 목록 조회 오류:', {
			error: error,
			message: error.message,
			stack: error.stack
		});
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


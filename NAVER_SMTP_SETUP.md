# 네이버 메일 SMTP 설정 가이드

## 🎯 네이버 메일로 Supabase SMTP 설정하기

### 1단계: 네이버 계정 준비

1. **네이버 메일 계정 확인**
   - 네이버 메일 계정이 있어야 합니다
   - 이메일 주소: `your-id@naver.com`
   - 비밀번호: 네이버 메일 비밀번호

2. **네이버 메일 보안 설정 (선택사항, 권장)**
   - 네이버 메일 접속
   - 환경설정 → 보안
   - "보안 메일" 또는 "2단계 인증" 활성화 권장

### 2단계: Supabase 대시보드에서 SMTP 설정

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **SMTP 설정 위치**
   - **Project Settings** → **Auth** → **SMTP Settings**
   - 또는 **Authentication** → **Settings** → **SMTP**

3. **SMTP 설정 입력**

   ```
   ✅ Enable Custom SMTP: 체크
   
   SMTP Host: smtp.naver.com
   
   SMTP Port: 587 (TLS 권장) 또는 465 (SSL)
   (포트를 선택하면 자동으로 TLS/SSL이 활성화됩니다)
   
   SMTP User: your-id@naver.com
   (⚠️ 전체 이메일 주소를 입력해야 합니다!)
   (❌ 잘못됨: your-id 만 입력)
   (✅ 올바름: your-id@naver.com 전체 입력)
   
   SMTP Password: [네이버 메일 비밀번호]
   (네이버 메일 로그인에 사용하는 비밀번호)
   
   Sender Email: your-id@naver.com
   (발신자 이메일 주소)
   
   Sender Name: My Speaking AI (선택사항)
   (이메일 발신자 이름)
   ```

   ⚠️ **참고:** 
   - "Enable Secure SMTP (TLS/SSL)" 옵션이 보이지 않을 수 있습니다
   - 포트 587을 선택하면 자동으로 TLS가 활성화됩니다
   - 포트 465를 선택하면 자동으로 SSL이 활성화됩니다
   - 별도의 체크박스가 없어도 포트 선택만으로 보안 연결이 설정됩니다

### 3단계: 포트 선택

#### 옵션 1: 포트 587 (TLS) - 권장
```
SMTP Port: 587
```
- 포트 587을 선택하면 자동으로 TLS가 활성화됩니다
- 대부분의 경우 권장
- 더 안정적이고 널리 지원됨
- 별도의 "Enable Secure SMTP" 체크박스가 없어도 됩니다

#### 옵션 2: 포트 465 (SSL)
```
SMTP Port: 465
```
- 포트 465를 선택하면 자동으로 SSL이 활성화됩니다
- 일부 환경에서만 필요
- 별도의 "Enable Secure SMTP" 체크박스가 없어도 됩니다

⚠️ **중요:** 
- Supabase 대시보드에서 "Enable Secure SMTP (TLS/SSL)" 옵션이 보이지 않을 수 있습니다
- 이는 정상입니다. 포트 번호를 선택하면 자동으로 보안 연결이 설정됩니다
- 포트 587 = TLS 자동 활성화
- 포트 465 = SSL 자동 활성화

### 4단계: 설정 저장 및 테스트

1. **설정 저장**
   - 모든 항목 입력 후 "Save" 버튼 클릭
   - 저장 후 잠시 기다려야 할 수 있습니다

2. **테스트 이메일 전송**
   - Supabase 대시보드에서 "Send Test Email" 버튼 클릭
   - 테스트 이메일 주소 입력
   - 전송 확인

3. **실제 회원가입으로 테스트**
   - 새 계정으로 회원가입
   - 이메일 수신 확인
   - 스팸 폴더도 확인해보세요

## ⚠️ 중요 사항

### 네이버 메일 제한사항

1. **일일 발신 한도**
   - 네이버 메일은 일일 약 300개 이메일 발신 제한이 있습니다
   - 프로덕션 환경에서는 전문 이메일 서비스(SendGrid, Mailgun 등) 사용 권장

2. **스팸 분류 가능성**
   - 발신자 이름(Sender Name)을 설정하면 스팸으로 분류될 가능성이 줄어듭니다
   - 예: "My Speaking AI", "회사명" 등

3. **보안 설정**
   - 네이버 메일 보안 설정을 활성화하면 더 안전합니다
   - 하지만 SMTP 설정에는 영향을 주지 않습니다

### 일반적인 오류 및 해결 방법

#### 오류 1: "Authentication failed"

**원인:**
- SMTP User에 전체 이메일 주소가 아닌 사용자 ID만 입력
- 비밀번호가 잘못됨

**해결:**
- SMTP User: `your-id@naver.com` (전체 이메일 주소 입력)
- 비밀번호 확인

#### 오류 2: "Connection timeout"

**원인:**
- SMTP Host 주소 오류
- 포트 번호 오류
- TLS/SSL 설정 오류

**해결:**
- SMTP Host: `smtp.naver.com` (정확히 입력)
- 포트: `587` (TLS) 또는 `465` (SSL)
- Enable Secure SMTP 체크 확인

#### 오류 3: "TLS/SSL connection failed"

**원인:**
- 포트와 암호화 방식 불일치
- 네트워크 문제

**해결:**
- 포트 587: TLS 자동 활성화 (별도 설정 불필요)
- 포트 465: SSL 자동 활성화 (별도 설정 불필요)
- 네트워크 연결 확인
- 방화벽 설정 확인

#### 오류 4: "Sender address rejected"

**원인:**
- Sender Email이 SMTP User와 일치하지 않음

**해결:**
- Sender Email과 SMTP User를 동일하게 설정
- 예: 둘 다 `your-id@naver.com`

## 📋 체크리스트

### SMTP 설정:
- [ ] Enable Custom SMTP 체크됨
- [ ] SMTP Host: `smtp.naver.com`
- [ ] SMTP Port: `587` (TLS 권장) 또는 `465` (SSL)
- [ ] SMTP User: `your-id@naver.com` (전체 이메일 주소)
- [ ] SMTP Password: 네이버 메일 비밀번호
- [ ] Sender Email: `your-id@naver.com` (SMTP User와 동일)
- [ ] Sender Name: 설정됨 (선택사항, 권장)
- [ ] 포트 선택으로 TLS/SSL 자동 활성화 확인 (별도 체크박스 없어도 됨)

### 테스트:
- [ ] Supabase 대시보드에서 테스트 이메일 전송 성공
- [ ] 실제 회원가입으로 이메일 수신 확인
- [ ] 이메일 링크 클릭 시 정상 작동 확인

## 🧪 테스트 방법

### 1. Supabase 대시보드에서 테스트

1. **Project Settings** → **Auth** → **SMTP Settings**
2. "Send Test Email" 버튼 클릭
3. 테스트 이메일 주소 입력 (네이버 메일 주소 권장)
4. 전송 확인
5. 이메일 수신 확인 (스팸 폴더도 확인)

### 2. 실제 회원가입으로 테스트

1. 새 계정으로 회원가입
2. 이메일 수신 확인
3. 이메일이 수신되지 않으면:
   - 스팸 폴더 확인
   - Supabase 대시보드의 로그 확인
   - 브라우저 콘솔 확인
   - SMTP 설정 다시 확인

## 💡 추가 팁

1. **발신자 이름 설정**
   - Sender Name을 설정하면 스팸으로 분류될 가능성이 줄어듭니다
   - 예: "My Speaking AI", "회사명" 등

2. **일일 발신 한도**
   - 네이버 메일은 일일 약 300개 이메일 발신 제한이 있습니다
   - 많은 사용자가 있는 경우 전문 이메일 서비스 사용 권장

3. **프로덕션 환경**
   - 프로덕션 환경에서는 SendGrid, Mailgun 등 전문 이메일 서비스 사용 권장
   - 더 높은 발신 한도와 신뢰도 제공

4. **이메일 템플릿**
   - Supabase 이메일 템플릿을 커스터마이징할 수 있습니다
   - Authentication → Email Templates에서 수정

## 🔗 참고 링크

- [Supabase SMTP 설정 문서](https://supabase.com/docs/guides/auth/auth-smtp)
- [네이버 메일 도움말](https://help.naver.com/service/5673/contents/18588)

## ✅ 설정 완료 후

1. **설정 저장**
2. **테스트 이메일 전송**
3. **새 계정으로 회원가입 테스트**
4. **이메일 수신 확인**
5. **이메일 링크 클릭 테스트**

설정이 완료되면 회원가입 시 네이버 메일로 인증 이메일이 전송됩니다!


# 네이버 메일 SMTP 설정 수정 (긴급!)

## 🚨 발견된 문제

Supabase SMTP 설정 화면을 확인한 결과, **Username 필드에 전체 이메일 주소가 아닌 사용자 ID만 입력**되어 있습니다!

### 현재 설정 (잘못됨):
```
Username: bigbangceo  ❌ (사용자 ID만 입력)
```

### 올바른 설정:
```
Username: bigbangceo@naver.com  ✅ (전체 이메일 주소)
```

## ✅ 즉시 수정 방법

### 1단계: Supabase 대시보드 접속

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **SMTP 설정 위치**
   - 좌측 메뉴: **Authentication** → **Email** → **SMTP Settings** 탭

### 2단계: Username 필드 수정

1. **Username 필드 찾기**
   - "SMTP provider settings" 섹션
   - "Username" 필드

2. **Username 수정**
   - 현재 값: `bigbangceo`
   - **수정 후 값: `bigbangceo@naver.com`** (전체 이메일 주소)
   - ⚠️ **반드시 `@naver.com`을 포함해야 합니다!**

3. **다른 설정 확인**
   - Host: `smtp.naver.com` ✅ (올바름)
   - Port: `465` ✅ (SSL 사용, 작동 가능)
   - Sender email: `bigbangceo@naver.com` ✅ (올바름)
   - Sender name: `Chinese Speak AI` ✅ (올바름)

### 3단계: 설정 저장

1. **"Save changes" 버튼 클릭**
   - 우측 하단의 녹색 "Save changes" 버튼 클릭
   - 저장 후 몇 초 기다림 (설정 적용 시간 필요)

### 4단계: 테스트

1. **테스트 이메일 전송**
   - SMTP Settings 페이지에서 "Send Test Email" 버튼이 있다면 클릭
   - 또는 실제 회원가입으로 테스트

2. **회원가입 테스트**
   - 새 계정으로 회원가입 시도
   - 이메일 수신 확인

## 🔍 추가 확인 사항

### Port 설정 (선택사항)

현재 Port가 `465`로 설정되어 있습니다:
- ✅ **465 (SSL)**: 작동 가능
- ✅ **587 (TLS)**: 권장 (더 널리 지원됨)

**Port 변경이 필요한 경우:**
- Port를 `587`로 변경하면 TLS를 사용합니다
- 하지만 현재 `465`도 작동하므로, Username만 수정하면 됩니다

### Rate Limits 확인

Rate Limits 설정을 확인한 결과:
- "Rate limit for sending emails": `10 emails/h`
- 이는 시간당 10개 이메일만 전송 가능하다는 의미입니다

**테스트 시 주의:**
- 여러 번 테스트하면 한도에 도달할 수 있습니다
- 한도 초과 시 500 오류가 발생할 수 있습니다

## 📋 수정 체크리스트

### 즉시 수정:
- [ ] Username: `bigbangceo` → `bigbangceo@naver.com` (전체 이메일 주소)
- [ ] "Save changes" 버튼 클릭
- [ ] 설정 저장 완료 확인

### 확인 사항:
- [ ] Host: `smtp.naver.com` ✅
- [ ] Port: `465` 또는 `587` ✅
- [ ] Sender email: `bigbangceo@naver.com` ✅
- [ ] Sender name: `Chinese Speak AI` ✅
- [ ] Password: 올바르게 입력됨 ✅

### 테스트:
- [ ] 테스트 이메일 전송 성공
- [ ] 실제 회원가입으로 이메일 수신 확인

## 💡 왜 이 문제가 발생했나요?

네이버 메일 SMTP 서버는 인증 시 **전체 이메일 주소**를 요구합니다:
- ❌ `bigbangceo` (사용자 ID만) → 인증 실패
- ✅ `bigbangceo@naver.com` (전체 이메일 주소) → 인증 성공

이것이 "Error sending confirmation email" 및 HTTP 500 오류의 주요 원인입니다.

## ✅ 수정 후 예상 결과

1. **Username을 `bigbangceo@naver.com`으로 수정**
2. **설정 저장**
3. **회원가입 테스트**
4. **이메일 정상 수신** ✅

## 🚨 중요 사항

**Username 필드에 반드시 전체 이메일 주소를 입력해야 합니다!**
- 올바름: `bigbangceo@naver.com`
- 잘못됨: `bigbangceo`

이것만 수정하면 대부분의 경우 문제가 해결됩니다!


# 코드 재배포 가이드

## 📦 배포 전 체크리스트

### 1. 변경사항 확인
```bash
git status
```

### 2. 변경된 파일 확인
- `src/lib/realtime/realtimeClient.js` - 대화 종료 로직 개선
- `src/lib/components/RealtimeConversation.svelte` - 종료 버튼 로직 개선
- `src/lib/components/SignupForm.svelte` - SMTP 에러 메시지 개선

## 🚀 배포 방법

### 방법 1: Git을 통한 자동 배포 (권장)

Vercel이 Git 저장소와 연결되어 있다면, `git push`만 하면 자동으로 배포됩니다.

#### 1단계: 변경사항 확인
```bash
# 현재 상태 확인
git status

# 변경된 파일 확인
git diff
```

#### 2단계: 변경사항 추가
```bash
# 특정 파일만 추가
git add src/lib/realtime/realtimeClient.js
git add src/lib/components/RealtimeConversation.svelte
git add src/lib/components/SignupForm.svelte

# 또는 모든 변경사항 추가
git add .
```

#### 3단계: 커밋
```bash
# 커밋 메시지 작성
git commit -m "Fix: 대화 종료 시 API 연결 완전 종료 및 SMTP 에러 메시지 개선

- 대화 종료 시 타임아웃 설정으로 강제 정리
- 즉시 UI 상태 업데이트
- SMTP 에러 메시지 개선"
```

#### 4단계: 배포 (푸시)
```bash
# 메인 브랜치에 푸시
git push origin main

# 또는 현재 브랜치에 푸시
git push
```

#### 5단계: 배포 확인
- Vercel 대시보드에서 배포 상태 확인
- 배포 완료 후 테스트

### 방법 2: Vercel CLI를 통한 배포

Vercel CLI가 설치되어 있다면 직접 배포할 수 있습니다.

#### 1단계: Vercel CLI 설치 (없는 경우)
```bash
npm install -g vercel
```

#### 2단계: Vercel 로그인
```bash
vercel login
```

#### 3단계: 프로덕션 배포
```bash
# 프로덕션 환경에 배포
vercel --prod
```

### 방법 3: Vercel 대시보드에서 수동 배포

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 프로젝트 선택

2. **Deployments 탭**
   - "Deployments" 탭 클릭

3. **재배포**
   - 최신 배포의 "..." 메뉴 클릭
   - "Redeploy" 선택
   - 또는 "Redeploy" 버튼 클릭

## 📋 단계별 상세 가이드

### 1단계: 현재 상태 확인

```bash
# Git 상태 확인
git status

# 변경된 파일 확인
git diff src/lib/realtime/realtimeClient.js
git diff src/lib/components/RealtimeConversation.svelte
git diff src/lib/components/SignupForm.svelte
```

### 2단계: 변경사항 스테이징

```bash
# 방법 1: 특정 파일만 추가
git add src/lib/realtime/realtimeClient.js
git add src/lib/components/RealtimeConversation.svelte
git add src/lib/components/SignupForm.svelte

# 방법 2: 모든 변경사항 추가
git add .

# 방법 3: 대화형으로 선택
git add -p
```

### 3단계: 커밋

```bash
# 커밋 메시지 작성
git commit -m "Fix: 대화 종료 시 API 연결 완전 종료

- 세션 종료에 타임아웃 설정 (5초)
- 즉시 UI 상태 업데이트
- 에러 발생 시에도 리소스 정리 보장
- SMTP 에러 메시지 개선"
```

**좋은 커밋 메시지 예시:**
```
Fix: 대화 종료 시 API 연결 완전 종료

주요 변경사항:
- realtimeClient.js: 세션 종료에 타임아웃 설정
- RealtimeConversation.svelte: 즉시 UI 상태 업데이트
- SignupForm.svelte: SMTP 에러 메시지 개선

해결된 문제:
- 대화 종료 후에도 API 연결이 유지되던 문제
- 타임아웃 없이 무한 대기하던 문제
```

### 4단계: 원격 저장소에 푸시

```bash
# 메인 브랜치에 푸시
git push origin main

# 또는 현재 브랜치에 푸시
git push
```

### 5단계: 배포 확인

1. **Vercel 대시보드 확인**
   - https://vercel.com/dashboard
   - 프로젝트 선택
   - "Deployments" 탭에서 배포 상태 확인

2. **배포 로그 확인**
   - 배포 항목 클릭
   - 빌드 로그 확인
   - 에러가 없는지 확인

3. **배포 완료 대기**
   - 배포가 완료될 때까지 대기 (보통 1-3분)
   - "Ready" 상태가 되면 배포 완료

### 6단계: 테스트

1. **배포된 사이트 접속**
   - https://my-speaking-ai-one.vercel.app 접속

2. **대화 종료 테스트**
   - 대화 시작
   - 대화 종료 버튼 클릭
   - 브라우저 콘솔에서 연결 종료 확인
   - 네트워크 탭에서 WebSocket 연결 종료 확인

## 🔍 배포 중 문제 해결

### 문제 1: Git 푸시 실패

**원인:**
- 원격 저장소와 동기화되지 않음
- 권한 문제

**해결:**
```bash
# 원격 저장소 상태 확인
git fetch origin

# 원격 저장소와 동기화
git pull origin main

# 충돌 해결 후 다시 푸시
git push origin main
```

### 문제 2: Vercel 빌드 실패

**원인:**
- 빌드 에러
- 환경 변수 누락

**해결:**
1. Vercel 대시보드에서 빌드 로그 확인
2. 에러 메시지 확인
3. 로컬에서 빌드 테스트:
   ```bash
   npm run build
   ```

### 문제 3: 배포 후 작동하지 않음

**원인:**
- 캐시 문제
- 환경 변수 문제

**해결:**
1. 브라우저 캐시 삭제 (Ctrl+Shift+R 또는 Cmd+Shift+R)
2. Vercel 대시보드에서 환경 변수 확인
3. 재배포 시도

## 📋 빠른 배포 명령어

### 전체 과정을 한 번에:
```bash
# 1. 상태 확인
git status

# 2. 변경사항 추가
git add .

# 3. 커밋
git commit -m "Fix: 대화 종료 시 API 연결 완전 종료"

# 4. 배포
git push origin main
```

## ✅ 배포 후 확인 사항

### 즉시 확인:
- [ ] Vercel 대시보드에서 배포 성공 확인
- [ ] 배포된 사이트 접속 확인
- [ ] 빌드 에러 없음 확인

### 기능 테스트:
- [ ] 대화 시작 정상 작동
- [ ] 대화 종료 시 즉시 연결 종료
- [ ] 브라우저 콘솔에 종료 로그 확인
- [ ] 네트워크 탭에서 WebSocket 연결 종료 확인

## 🔗 참고 링크

- [Vercel 대시보드](https://vercel.com/dashboard)
- [Git 문서](https://git-scm.com/doc)
- [Vercel CLI 문서](https://vercel.com/docs/cli)

## 💡 팁

1. **커밋 전에 로컬 테스트**
   ```bash
   npm run dev
   # 로컬에서 테스트 후 배포
   ```

2. **작은 단위로 커밋**
   - 관련된 변경사항만 함께 커밋
   - 커밋 메시지를 명확하게 작성

3. **배포 전 체크리스트**
   - [ ] 로컬에서 빌드 성공
   - [ ] 로컬에서 테스트 완료
   - [ ] 커밋 메시지 작성 완료

## 🚀 지금 바로 배포하기

다음 명령어를 순서대로 실행하세요:

```bash
# 1. 변경사항 확인
git status

# 2. 변경사항 추가
git add src/lib/realtime/realtimeClient.js src/lib/components/RealtimeConversation.svelte src/lib/components/SignupForm.svelte

# 3. 커밋
git commit -m "Fix: 대화 종료 시 API 연결 완전 종료 및 SMTP 에러 메시지 개선"

# 4. 배포
git push origin main
```

배포가 완료되면 Vercel 대시보드에서 확인할 수 있습니다!


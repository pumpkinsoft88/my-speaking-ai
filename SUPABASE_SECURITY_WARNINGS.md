# Supabase 보안 경고 해결 가이드

## 🚨 발견된 경고 및 안내

### 1. Function `public.update_updated_at_column` has a role mutable search_path

이것은 데이터베이스 함수의 보안 경고입니다.

### 2. HaveIBeenPwned.org 통합 기능 안내

Supabase Auth의 비밀번호 보안 강화 기능입니다.

## ✅ 해결 방법

### 1단계: Function 보안 경고 해결

#### 문제 설명
- `update_updated_at_column` 함수가 `mutable search_path`를 사용하고 있습니다
- 이것은 잠재적인 보안 취약점일 수 있습니다

#### 해결 방법

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **SQL Editor 접속**
   - 좌측 메뉴: **SQL Editor** 클릭

3. **함수 수정 쿼리 실행**

   다음 SQL 쿼리를 실행하여 함수를 수정하세요:

   ```sql
   -- 기존 함수 삭제
   DROP FUNCTION IF EXISTS public.update_updated_at_column();

   -- 보안이 강화된 함수 재생성
   CREATE OR REPLACE FUNCTION public.update_updated_at_column()
   RETURNS TRIGGER
   LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public
   AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$;
   ```

4. **쿼리 실행**
   - "Run" 버튼 클릭
   - 성공 메시지 확인

#### 또는 자동 수정 (권장)

Supabase 대시보드에서 자동 수정 옵션이 있다면 사용하세요:

1. **경고 메시지 클릭**
   - 경고 메시지를 클릭하면 수정 옵션이 나타날 수 있습니다

2. **자동 수정**
   - "Fix" 또는 "Auto-fix" 버튼 클릭

### 2단계: HaveIBeenPwned.org 통합 활성화 (선택사항, 권장)

이 기능은 사용자가 유출된 비밀번호를 사용하는 것을 방지합니다.

#### 활성화 방법

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Authentication 설정**
   - 좌측 메뉴: **Authentication** → **Settings**
   - 또는 **Authentication** → **Policies**

3. **Password Security 설정 찾기**
   - "Password Security" 또는 "Password Policies" 섹션 찾기
   - "HaveIBeenPwned" 또는 "Compromised Password Check" 옵션 찾기

4. **기능 활성화**
   - "Enable HaveIBeenPwned check" 또는 유사한 옵션 체크
   - "Save" 버튼 클릭

#### 기능 설명

- **HaveIBeenPwned.org**: 유출된 비밀번호 데이터베이스
- **작동 방식**: 사용자가 회원가입하거나 비밀번호를 변경할 때, 비밀번호가 유출된 비밀번호 목록에 있는지 확인
- **보안 강화**: 유출된 비밀번호 사용 방지

#### 주의사항

- 이 기능은 선택사항입니다
- 활성화하면 사용자가 유출된 비밀번호를 사용할 수 없습니다
- 더 강력한 보안을 원하는 경우 활성화 권장

## 📋 체크리스트

### Function 보안 경고 해결:
- [ ] Supabase 대시보드 접속
- [ ] SQL Editor 접속
- [ ] 함수 수정 쿼리 실행
- [ ] 경고 해결 확인

### HaveIBeenPwned 통합 (선택사항):
- [ ] Authentication → Settings 접속
- [ ] Password Security 설정 찾기
- [ ] HaveIBeenPwned 기능 활성화 (선택사항)
- [ ] 설정 저장

## 🔍 추가 확인 사항

### Function 경고가 계속 나타나는 경우

1. **함수 확인**
   - SQL Editor에서 다음 쿼리 실행:
   ```sql
   SELECT 
     proname as function_name,
     prosecdef as security_definer,
     proconfig as search_path
   FROM pg_proc
   WHERE proname = 'update_updated_at_column';
   ```

2. **함수 재생성**
   - 위의 수정 쿼리를 다시 실행

3. **트리거 확인**
   - 함수를 사용하는 트리거가 있는지 확인:
   ```sql
   SELECT * FROM pg_trigger 
   WHERE tgname LIKE '%updated_at%';
   ```

## 💡 참고 사항

### Function 보안 경고
- 이것은 보안 경고이지만, 즉시 위험한 것은 아닙니다
- 하지만 보안을 강화하기 위해 수정하는 것이 좋습니다
- `SECURITY DEFINER`와 `SET search_path`를 명시적으로 설정하면 보안이 강화됩니다

### HaveIBeenPwned 통합
- 이 기능은 선택사항입니다
- 활성화하면 더 강력한 보안을 제공합니다
- 사용자 경험에 약간의 영향을 줄 수 있습니다 (유출된 비밀번호 사용 시 오류)

## 🔗 참고 링크

- [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
- [Supabase Authentication Settings](https://supabase.com/dashboard/project/_/settings/auth)
- [HaveIBeenPwned.org](https://haveibeenpwned.com/)

## ✅ 다음 단계

1. **Function 보안 경고 해결**
   - SQL Editor에서 함수 수정 쿼리 실행

2. **HaveIBeenPwned 통합 활성화** (선택사항)
   - Authentication Settings에서 활성화

3. **SMTP 오류 해결** (원래 문제)
   - 로그 확인 및 SMTP 설정 재확인

## ⚠️ 중요

이 경고들은 SMTP 오류와는 직접적인 관련이 없습니다. 

**SMTP 오류를 해결하려면:**
1. Supabase 로그 확인 (Auth Logs)
2. SMTP 설정 재확인
3. 네이버 메일 IMAP/SMTP 설정 확인

이 경고들은 별도로 해결하면 됩니다.


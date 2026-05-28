# mobile.md — DnDn Mobile 변경 이력

이 파일은 현재 세션에서 수행된 모든 변경 사항을 기록합니다.

---

## 1. `src/lib/api.js` — 핵심 버그 수정

### 문제
- `apiFetch`가 BE 응답(`BaseResponse<T>`)에서 데이터를 추출할 때 `payload?.result`를 참조했으나, 실제 BE 필드명은 `data`임
- 결과적으로 `loginWorker` 반환값이 `undefined` → `setStoredWorker({id: undefined, ...})` → localStorage에 `{}` 저장
- 이후 모든 API 호출에 `Authorization: Bearer undefined` 전송 → Spring Security 인증 실패

### 수정 내용
```js
// 수정 전
return payload?.result !== undefined ? payload.result : payload;

// 수정 후
return payload?.data !== undefined ? payload.data : payload;
```

### ngrok 헤더 추가
ngrok 무료 플랜은 GET 요청 시 브라우저 경고 인터스티셜 HTML 페이지(200 OK)를 반환함.
→ CORS 헤더 없는 200 응답 → `net::ERR_FAILED` 발생

```js
headers: {
  "ngrok-skip-browser-warning": "true",
  // ...
}
```

---

## 2. `src/lib/session.js` — localStorage 유효성 검사 강화

### 문제
이전에 오염된 localStorage 값(`"undefined"`, `"{}"`, `"null"`)이 저장된 경우 `getStoredWorker()`가 잘못된 객체를 반환했음

### 수정 내용
```js
export function getStoredWorker() {
  try {
    const value = localStorage.getItem(WORKER_STORAGE_KEY);
    if (!value || value === "undefined" || value === "null") {
      localStorage.removeItem(WORKER_STORAGE_KEY);
      return null;
    }
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || !parsed.id || !parsed.name) {
      localStorage.removeItem(WORKER_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(WORKER_STORAGE_KEY);
    return null;
  }
}
```

---

## 3. `src/views/HomePage.vue` — 출퇴근 버튼 및 worker 데이터 수정

### 문제
- 출근/퇴근 버튼 활성화 조건이 BE 응답 구조에 맞지 않아 항상 비활성화 상태였음
- `handleAttendance` 성공 후 `setStoredWorker(result)` 전체를 저장 → 기존 worker 데이터 덮어씀

### 수정 내용
```js
const canClockIn  = computed(() => !attendance.value?.clockIn);
const canClockOut = computed(() => Boolean(attendance.value?.clockIn) && !attendance.value?.clockOut);

async function handleAttendance(action) {
  processingAction.value = action;
  try {
    const result = await processAttendance(action);
    today.value = result;
    // attendanceStatus만 업데이트 (worker 전체 덮어쓰기 방지)
    if (result?.attendance?.attendanceStatus && worker.value) {
      setStoredWorker({ ...worker.value, attendanceStatus: result.attendance.attendanceStatus });
    }
  } catch (error) {
    window.alert(attendanceErrorMessage(error));
  } finally {
    processingAction.value = "";
  }
}
```

---

## 4. `src/views/PassPage.vue` — 동일한 출퇴근 수정

HomePage.vue와 동일한 `canClockIn` / `canClockOut` 계산 속성 및 `handleAttendance` 수정 적용.

---

## 5. `src/views/ProfilePage.vue` — "출근/배정 기록" 카드 제거

사용자 요청에 따라 ProfilePage에서 "출근/배정 기록" 카드 섹션 제거.

---

## 6. `.env` — API URL 설정

```env
VITE_API_BASE_URL=https://xxxx-xxx.ngrok-free.app
```

- `xxxx-xxx.ngrok-free.app` 부분을 실제 ngrok URL로 교체
- 변경 후 반드시 `pnpm dev:web` 재시작

### 환경별 URL 참고

| 환경 | VITE_API_BASE_URL |
|---|---|
| Android 에뮬레이터 | `http://10.0.2.2:8080` |
| iOS 시뮬레이터 | `http://localhost:8080` |
| 실기기 (LAN) | `http://<PC-LAN-IP>:8080` |
| ngrok 터널 | `https://<subdomain>.ngrok-free.app` |

---

## 7. BE: `SecurityConfig.java` — CORS 헤더 보존 수정

### 문제
Spring Security의 `sendError()` 호출 시 Tomcat이 새 에러 디스패치 컨텍스트를 생성 → CORS 헤더 소멸 → 프론트에서 CORS 오류로 인식

### 수정 내용
`sendError()` 대신 직접 응답 작성:
```java
.exceptionHandling(ex -> ex
    .authenticationEntryPoint((request, response, authException) -> {
        String origin = request.getHeader("Origin");
        if (origin != null) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Credentials", "true");
        }
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"success\":false,\"code\":3001,\"message\":\"인증이 필요합니다.\"}");
        response.getWriter().flush();
    })
    .accessDeniedHandler((request, response, denied) -> {
        String origin = request.getHeader("Origin");
        if (origin != null) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Credentials", "true");
        }
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"success\":false,\"code\":3002,\"message\":\"접근 권한이 없습니다.\"}");
        response.getWriter().flush();
    })
)
```

---

## 8. BE: `MobileWorkerService.java` — 출퇴근 로직 수정

### login() — attendance_record 필수 조건 유지
`attendance_record`에 해당 작업자가 없으면 로그인 불가 (MOBILE_WORKER_NOT_ROSTERED).
출근 전 상태인 경우에만 로그인 가능.

### getToday() — clockIn 없는 경우 canClockIn 처리
```java
if (record != null) {
    // 기존 로직
} else {
    canClockIn = true;
}
```

### recordAttendance() — CHECK_IN 시 새 레코드 생성 허용
`orElseThrow` → `orElse(null)` 변경, record가 null이면 CHECK_IN 시 새 레코드 생성.

### getAttendanceHistory() — attendance_log 테이블 사용
출퇴근 이력 조회를 `attendance_record` 대신 `attendance_log` 테이블 기반으로 재작성.

---

## 모바일 하위 페이지 접속 불가 원인 분석

**증상**: 구역 배치이력(`/worker/deployments`), 안전 사고이력(`/worker/accidents`), 서류 및 안전 현황(`/worker/docs`)이 모바일에서 접속 안 됨. PC localhost에서는 정상.

**원인**:
1. 위 페이지들은 탭 라우트가 아닌 별도 경로(`/worker/*`)
2. 라우터 가드가 각 진입 시 `getStoredWorker()`를 재평가
3. 구 `api.js`의 `payload.result` 버그로 localStorage가 `{}` 저장
4. `getStoredWorker()`가 유효하지 않은 값 반환 → `null` 처리 → `/login` 리다이렉트

**해결**: `api.js`의 `payload.data` 수정 적용 후 정상 로그인 시 자동 해결됨.

---

## 적용 방법 (실제 프로젝트 경로로 복사)

편집된 파일 경로: `C:\BEYOND24\FINAL\dndn-2.0\dndn-mobile\`  
실제 실행 경로: `C:\BEYOND\FINAL\Project\dndn-mobile\`

복사 대상 파일 (FE):
```
src/lib/api.js
src/lib/session.js
src/lib/sse.js          ← 신규
src/views/HomePage.vue
src/views/PassPage.vue
src/views/ProfilePage.vue
.env
```

복사 대상 파일 (BE):
```
dndn-core/src/main/java/org/example/dndncore/auth/security/JwtFilter.java
dndn-core/src/main/java/org/example/dndncore/auth/security/SecurityConfig.java
dndn-core/src/main/java/org/example/dndncore/mobile/service/MobileWorkerService.java
dndn-core/src/main/java/org/example/dndncore/mobile/controller/MobileWorkerSseController.java  ← 신규
dndn-core/src/main/java/org/example/dndncore/sse/SseEmitterRegistry.java
dndn-core/src/main/java/org/example/dndncore/staffing/service/StaffingService.java
dndn-core/src/main/java/org/example/dndncore/staffing/model/StaffingAssignment.java
```

적용 후:
1. BE 재시작 (Gradle bootRun)
2. `pnpm dev:web` 재시작
3. 브라우저 하드 리프레시 (`Ctrl+Shift+R`) 또는 시크릿 창에서 테스트

---

## Android APK 빌드 및 설치

### 사전 요구사항
- Android Studio 설치 (https://developer.android.com/studio)
- Android Studio 내 SDK Tools → `Android SDK Build-Tools` 설치 확인
- JDK 17 이상

### Step 1 — 집컴 프로젝트 경로에서 웹 빌드 + Capacitor 동기화

```powershell
# 경로: C:\BEYOND\FINAL\Project\dndn-mobile
cd C:\BEYOND\FINAL\Project\dndn-mobile
pnpm build:web
npx cap sync android
```

> `pnpm build:web`이 Vite로 `dist/` 를 생성하고,  
> `npx cap sync android`가 `dist/` 내용을 `android/app/src/main/assets/public/` 에 복사한다.

### Step 2 — APK 빌드 (방법 A: 커맨드라인)

```powershell
# 프로젝트 루트에서 android 폴더로 이동
cd C:\BEYOND\FINAL\Project\dndn-mobile\android

# debug APK 빌드
.\gradlew.bat assembleDebug
```

빌드 완료 후 APK 위치:
```
C:\BEYOND\FINAL\Project\dndn-mobile\android\app\build\outputs\apk\debug\app-debug.apk
```

### Step 2 — APK 빌드 (방법 B: Android Studio)

1. `C:\BEYOND\FINAL\Project\dndn-mobile` 경로에서 실행:
   ```powershell
   npx cap open android
   ```
2. Android Studio가 열리면 상단 메뉴 → **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. 빌드 완료 후 우하단 팝업 **"locate"** 클릭 → APK 파일 확인
   - 동일 경로: `android\app\build\outputs\apk\debug\app-debug.apk`

### Step 3 — 폰에 설치 (방법 A: USB + ADB)

1. 폰 설정 → **개발자 옵션** 활성화 (빌드 번호 7번 탭)
2. 개발자 옵션 → **USB 디버깅** 활성화
3. USB 케이블로 PC와 폰 연결

```powershell
# 연결 확인 (폰 이름이 뜨면 정상)
adb devices

# APK 설치
adb install C:\BEYOND\FINAL\Project\dndn-mobile\android\app\build\outputs\apk\debug\app-debug.apk
```

### Step 3 — 폰에 설치 (방법 B: 파일 전송)

1. `app-debug.apk` 파일을 카카오톡·구글 드라이브·USB 등으로 폰에 전송
2. 폰에서 파일 앱으로 APK 파일 열기
3. **"출처를 알 수 없는 앱"** 허용 팝업 → **설치** 탭

> 재설치(업데이트) 시에도 동일 절차. 서명이 같은 debug APK끼리는 덮어쓰기 설치 가능.

---

## iOS IPA 빌드 및 설치 (macOS 전용)

> iOS 빌드는 **반드시 macOS** 에서만 가능. Windows에서는 불가.

### 사전 요구사항
- macOS 환경
- Xcode 설치 (App Store)
- Apple Developer 계정 (무료 계정으로 실기기 설치 가능, 단 7일마다 재서명 필요)

### Step 1 — 웹 빌드 + Capacitor 동기화

```bash
# 경로: dndn-mobile 프로젝트 루트
cd /path/to/dndn-mobile
pnpm build:web
npx cap sync ios
```

### Step 2 — Xcode 열기

```bash
npx cap open ios
```

또는 직접 경로:
```
dndn-mobile/ios/App/App.xcworkspace  ← 반드시 .xcworkspace 파일로 열 것 (.xcodeproj 아님)
```

### Step 3 — 실기기에 설치 (무료 계정)

1. Xcode 상단 **Signing & Capabilities** 탭
2. Team → 본인 Apple ID 선택 (무료 계정 OK)
3. Bundle Identifier → 고유한 값으로 변경 (예: `com.홍길동.dndnsiteaccess`)
4. USB로 아이폰 연결 → 상단 디바이스 목록에서 본인 폰 선택
5. **▶ Run** 버튼 클릭 → 폰에 직접 설치됨

> 처음 설치 시 폰에서: **설정 → 일반 → VPN 및 기기 관리 → 개발자 앱 → 신뢰**  
> 7일 후 서명 만료 → Xcode에서 다시 Run 하면 갱신됨

### Step 3 — IPA 파일로 배포 (유료 개발자 계정, $99/년)

1. Xcode 상단 메뉴 → **Product → Archive**
2. Organizer 창 → **Distribute App → Ad Hoc** (내부 테스트용) 또는 **TestFlight**
3. 생성된 `.ipa` 파일을 AltStore·Sideloadly 등으로 설치 가능

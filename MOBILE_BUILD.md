# Mobile Build

Ionic Vue + Capacitor 기반 모바일 앱.  
**백엔드 서버**: `be24-fin-Intelli_J-DnDn-BE` (포트 8080) — 앱의 유일한 API 서버.

---

## 개발 서버 실행

```bash
# 웹 미리보기 (BE가 별도로 실행 중이어야 함)
pnpm dev

# 핸드폰 크기 미리보기
pnpm preview:phone
# → http://localhost:8090
```

## API URL 설정

앱이 접속할 BE 서버 주소를 `.env` 파일로 지정한다.

```bash
# 프로젝트 루트에 .env 파일 생성
VITE_API_BASE_URL=http://<BE-서버-IP>:8080
```

| 실행 환경 | 값 |
|----------|-----|
| 로컬 Vite dev (브라우저) | 자동 감지 → `http://localhost:8080` |
| Android 에뮬레이터 | `http://10.0.2.2:8080` |
| iOS 시뮬레이터 | `http://localhost:8080` |
| 실기기 (같은 Wi-Fi) | `http://<PC-LAN-IP>:8080` |

---

## Capacitor 빌드

```bash
# 웹 빌드 + 네이티브 동기화
pnpm cap:sync

# Android Studio 열기
pnpm android

# Xcode 열기 (macOS 전용)
pnpm ios
```

`pnpm android` / `pnpm ios` 명령은 자동으로 `pnpm build:web && npx cap sync`를 실행한 뒤 IDE를 연다.

---

## server-java 제거 안내

이전 버전의 `server-java/` 독자 서버는 삭제되었다.  
모든 API는 `be24-fin-Intelli_J-DnDn-BE`를 통해 처리된다.

```powershell
# 혹시 남아있다면 수동 삭제
Remove-Item -Recurse -Force server-java
```

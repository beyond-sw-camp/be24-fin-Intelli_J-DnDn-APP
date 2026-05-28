# 실행 가이드

로컬 개발 환경 세팅, 빌드, Docker 배포 방법을 안내합니다.

<br/>

## 요구 사항

| 도구 | 버전 |
| --- | --- |
| Node.js | 20 이상 |
| pnpm | 9 이상 |

<br/>

## 로컬 개발 환경

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 입력합니다.

```env
VITE_API_BASE_URL=https://www.dndn24.kro.kr/api
```

로컬 백엔드 서버와 연결하려면 값을 `http://localhost:8080/api` 로 변경하세요.

### 3. 개발 서버 실행

```bash
# 웹 브라우저
pnpm dev

# 모바일 (Ionic 라이브 리로드)
pnpm ionic serve
```

<br/>

## 빌드

### 웹 빌드

```bash
pnpm build
```

빌드 결과물은 `dist/` 디렉터리에 생성됩니다.

### Android 빌드

```bash
pnpm build
pnpm cap sync android
pnpm cap open android   # Android Studio 열기
```

### iOS 빌드

```bash
pnpm build
pnpm cap sync ios
pnpm cap open ios       # Xcode 열기
```

<br/>

## Docker 배포

### 이미지 빌드

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://www.dndn24.kro.kr/api \
  -t dndn-mobile:latest .
```

### 컨테이너 실행

```bash
docker run -d -p 80:80 --name dndn-mobile dndn-mobile:latest
```

### Docker Compose 사용 시

```bash
docker compose up -d
```

<br/>

## 주요 명령어 요약

| 명령어 | 설명 |
| --- | --- |
| `pnpm install` | 의존성 설치 |
| `pnpm dev` | 웹 개발 서버 실행 |
| `pnpm build` | 웹 프로덕션 빌드 |
| `pnpm cap sync` | 네이티브 프로젝트 동기화 |
| `pnpm cap open android` | Android Studio 열기 |
| `pnpm cap open ios` | Xcode 열기 |

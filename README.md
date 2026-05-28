<div align="center">

<img width="365" height="323" alt="Image" src="https://github.com/user-attachments/assets/c5cce926-7013-4f76-ad11-ac0a90afdfc0" />

### 현장 근무자를 위한 스마트 출입 관리 앱

출퇴근 기록, 오늘 배치 확인, QR 출입증, 근태 이력까지<br/>
건설 현장 근무자가 스마트폰 하나로 현장 업무를 처리하는 모바일 앱입니다.

<br/>

### 팀원

| 김민규 | 전민주 | 이한별 | 전성훈 | 최승우 |
| :---: | :---: | :---: | :---: | :---: |
| <img src="https://github.com/luel1018.png" width="96" alt="김민규"/> | <img src="https://github.com/minju0077.png" width="96" alt="전민주"/> | <img src="https://github.com/sole0714.png" width="96" alt="이한별"/> | <img src="https://github.com/1jshun.png" width="96" alt="전성훈"/> | <img src="https://github.com/sw-oo.png" width="96" alt="최승우"/> |
| [@luel1018](https://github.com/luel1018) | [@minju0077](https://github.com/minju0077) | [@sole0714](https://github.com/sole0714) | [@1jshun](https://github.com/1jshun) | [@sw-oo](https://github.com/sw-oo) |

<br/>

[![Vue](https://img.shields.io/badge/Vue-3-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)](#기술-스택)
[![Ionic](https://img.shields.io/badge/Ionic-8-3880FF?style=for-the-badge&logo=ionic&logoColor=white)](#기술-스택)
[![Capacitor](https://img.shields.io/badge/Capacitor-7-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](#기술-스택)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#기술-스택)

</div>

<br/>

## 관련 링크

| 링크 | URL |
| --- | --- |
| 홈페이지 | https://www.dndn24.kro.kr |
| 프론트엔드 레포지토리 | https://github.com/... |
| 백엔드 레포지토리 | https://github.com/... |

<br/>

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 프레임워크 | ![Vue 3](https://img.shields.io/badge/Vue_3-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white) ![Ionic Vue](https://img.shields.io/badge/Ionic_Vue_8-3880FF?style=flat-square&logo=ionic&logoColor=white) |
| 네이티브 | ![Capacitor](https://img.shields.io/badge/Capacitor_7-119EFF?style=flat-square&logo=capacitor&logoColor=white) |
| 빌드 | ![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat-square&logo=vite&logoColor=white) |
| 패키지 매니저 | ![pnpm](https://img.shields.io/badge/pnpm_9-F69220?style=flat-square&logo=pnpm&logoColor=white) |
| 배포 | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) ![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white) |

<br/>

## 앱 핵심 설계

| 항목 | 적용 기술 | 도입 이유 |
| --- | --- | --- |
| 인증 | JWT (Bearer Token), localStorage | 서버 세션 없이 토큰 기반 인증을 구현했습니다. 이름 + 전화번호로 로그인하면 JWT를 발급받아 localStorage에 저장하고, 이후 모든 API 요청 헤더에 포함합니다. |
| 실시간 배치 알림 | Server-Sent Events (SSE) | 관리자가 인력 배치를 확정하는 시점에 근무자에게 즉시 알림을 전달하기 위해 SSE를 사용했습니다. EventSource는 커스텀 헤더를 지원하지 않아 JWT를 쿼리 파라미터(`?token=`)로 전달합니다. |
| 네이티브 앱 | Capacitor | 웹 코드 베이스 하나로 Android, iOS 네이티브 앱과 PWA를 동시에 빌드합니다. |
| 라우터 가드 | Vue Router beforeEach | 모든 인증 필요 경로는 라우터 레벨에서 토큰 유무를 확인하고, 미인증 시 로그인 페이지로 리다이렉트합니다. |

<br/>

## 화면 구성

### 로그인
<img width="200" alt="로그인" src="https://github.com/user-attachments/assets/620513b0-7a2b-47e9-9de4-27819cc79808" />


### 홈 · 출퇴근
<img width="200" alt="메인페이지" src="https://github.com/user-attachments/assets/3ab7eefa-acd0-42d3-8484-fa56327e8a10" />


### QR 출입증 · 근태
<img width="200" alt="QR페이지" src="https://github.com/user-attachments/assets/00f73769-f58c-4845-87e6-1a6b28dd7c66" />
<img width="200" alt="출결 내역" src="https://github.com/user-attachments/assets/f6efd72a-5146-4660-ab20-56d7ed2983cb" />

### 프로필 · 기타
<img width="200" alt="프로필 페이지" src="https://github.com/user-attachments/assets/57064247-ed20-4c7a-acf6-a8b33b4d60b4" />
<img width="200" alt="구역 배치 이력" src="https://github.com/user-attachments/assets/c29b4d45-01a1-4c1f-b8aa-8bb698ee25ed" />
<img width="200" alt="안전 사고 이력" src="https://github.com/user-attachments/assets/8e00bccb-d74a-4077-a2b1-30081d867915" />
<img width="200" alt="서류 현황" src="https://github.com/user-attachments/assets/810ddc02-597c-4d42-83e1-aceadc231643" />


<br/>

## 주요 기능

| 기능 | 설명 |
| --- | --- |
| 로그인 | 이름 + 전화번호 인증, JWT 발급 및 저장 |
| 오늘 배치 확인 | 당일 구역 배치 정보 표시, 관리자 확정 시 SSE 실시간 알림 |
| 출퇴근 기록 | 출근 / 퇴근 버튼으로 근태 기록 |
| QR 출입증 | 현장 입장용 QR 코드 자동 생성, 근태 요약 표시 |
| 근태 이력 | 근무자별 출결 내역 조회 |
| 프로필 | 이름, 공종, 직급, 비상연락처, 혈액형 등 근무자 정보 |
| 안전 서류 | 기초안전보건교육 이수증 등 등록 서류 목록 및 열람 |
| 사고 이력 | 등록된 안전사고 기록 조회 |
| 배치 상세 | 공종별 작업 배치 내역 확인 |

<br/>

  ## 앱 기능 테스트

  ### 로그인 / 인증

  https://github.com/user-attachments/assets/67cff865-3068-4c00-ba59-966aea10e4d0

  | 시나리오 | 결과 | 비고 |
  | :---: | :---: | :---: |
  | 정상 로그인 | ✅ | - |
  | 잘못된 이름·전화번호 입력 | ✅ | 근무자 명단에 없는 이름/전화번호 입력 |
  | 로그아웃 후 토큰 삭제 확인 | ✅ | - |
  | 미인증 상태에서 보호 경로 접근 | ✅ | `/tabs/home`, `/tabs/pass` 직접 입력 시 로그인 페이지 유지 확인 |

  ### 출퇴근

  https://github.com/user-attachments/assets/9309e86d-2bea-41ab-82ae-3dea7f33da29

  | 시나리오 | 결과 | 비고 |
  | :---: | :---: | :---: |
  | 출근 처리 | ✅ | - |
  | 퇴근 처리 | ✅ | - |
  | 이미 출근한 상태에서 출근 재시도 | ✅ | 출근 버튼 비활성화로 중복 요청 원천 차단 |

  ### 실시간 배치 알림 (SSE)

  https://github.com/user-attachments/assets/189abe55-0b7d-4fa5-97e5-5a7f1bacaacb

  | 시나리오 | 결과 | 비고 |
  | :---: | :---: | :---: |
  | 관리자가 배치 확정 후 앱에서 알림 수신 | ✅ | 배치 확정·초기화 시 실시간 알림 수신 및 화면 즉시 반영 확인 |
  | SSE 연결 끊김 후 재연결 | ✅ | 모바일 와이파이 연결 해제 후 재연결 시 자동 복구 확인 |

  ### 근무 기록 / 근무자 정보 / 기타 이력 조회

  https://github.com/user-attachments/assets/90793834-52b8-4dfa-b5b5-31c32b54772d

  | 시나리오 | 결과 | 비고 |
  | :---: | :---: | :---: |
  | 근태 이력 조회 | ✅ | - |
  | 근무자 상세 정보 조회 | ✅ | - |
  | 안전 사고 이력 조회 | ✅ | - |
  | 구역 배치 이력 조회 | ✅ | - |
  | 서류 현황 조회 | ✅ | - |

<br/>

## 실행 방법

로컬 개발 환경 세팅, 빌드, Docker 배포 방법은 **[GUIDE.md](./GUIDE.md)** 를 참고해주세요.

<br/>

---

<div align="center">

Copyright © 2026 Intelli_J Team. All rights reserved.

</div>

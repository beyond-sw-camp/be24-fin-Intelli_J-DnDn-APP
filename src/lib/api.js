import { getWorkerAccessToken } from "./session";

/**
 * BE 서버 URL 결정 (우선순위 순).
 *
 * 1. 빌드 시 주입된 VITE_API_BASE_URL 환경변수
 * 2. K8s 배포 환경: 같은 도메인의 /api 경로 (Ingress가 /api → 백엔드로 라우팅)
 * 3. 로컬 개발: localhost:8081 → localhost:8080 포트 추론
 *
 * 로컬 실기기 테스트 시 .env 에 설정:
 *   VITE_API_BASE_URL=http://<PC-LAN-IP>:8080
 * 에뮬레이터:
 *   Android → http://10.0.2.2:8080
 *   iOS sim → http://localhost:8080
 */
export function getApiBaseUrl() {
  // 1순위: 빌드 시 주입된 환경변수
  const configured = import.meta.env.VITE_API_BASE_URL || "";
  if (configured.trim()) {
    return configured.trim().replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location) {
    const { protocol, hostname, port } = window.location;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    const isDevPort = port === "8081" || port === "5173";

    // 2순위: 로컬 개발 서버 (포트로 판별)
    if (isLocalhost && isDevPort) {
      return `${protocol}//${hostname}:8080`;
    }

    // 3순위: K8s 배포 환경 — 현재 도메인의 /api 경로 (Ingress 라우팅)
    // ex) https://www.dndn24.kro.kr → https://www.dndn24.kro.kr/api
    if (!isLocalhost) {
      return `${protocol}//${hostname}/api`;
    }
  }

  return "";
}

async function apiFetch(path, options = {}) {
  const headers = {
    Accept: "application/json",
    // ngrok 무료 플랜의 브라우저 경고 페이지(HTML 인터스티셜)를 건너뜀
    "ngrok-skip-browser-warning": "true",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  const accessToken = getWorkerAccessToken();
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  const payload = await readJson(response);
  if (!response.ok) {
    // BE BaseResponse 형식: { isSuccess, code, message, result }
    const message =
      payload?.message ||
      payload?.code ||
      `HTTP_${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.code = payload?.code;
    throw error;
  }

  // BE BaseResponse 형식에서 data 추출 (BaseResponse.data 필드)
  return payload?.data !== undefined ? payload.data : payload;
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

// ─────────────────────────────────────────────────
// 인증
// ─────────────────────────────────────────────────

/** POST /mobile/auth/login → { accessToken, workerIdx, name, ... } */
export async function loginWorker(name, phone) {
  return apiFetch("/mobile/auth/login", {
    method: "POST",
    body: { name, phone },
  });
}

// ─────────────────────────────────────────────────
// 작업자 데이터
// ─────────────────────────────────────────────────

/** GET /mobile/worker/profile */
export async function getWorkerProfile() {
  return apiFetch("/mobile/worker/profile");
}

/** GET /mobile/worker/today */
export async function getTodayStatus() {
  return apiFetch("/mobile/worker/today");
}

/**
 * POST /mobile/worker/attendance
 * action: "CHECK_IN" | "CHECK_OUT"
 */
export async function processAttendance(action) {
  return apiFetch("/mobile/worker/attendance", {
    method: "POST",
    body: { action },
  });
}

/**
 * GET /mobile/worker/attendance-history?days=N
 * days: 7 | 30 | 90
 */
export async function getAttendanceHistory(days) {
  return apiFetch(`/mobile/worker/attendance-history?days=${encodeURIComponent(days)}`);
}

/** GET /mobile/worker/accidents */
export async function getWorkerAccidents() {
  return apiFetch("/mobile/worker/accidents");
}

/** GET /mobile/worker/docs */
export async function getWorkerDocs() {
  return apiFetch("/mobile/worker/docs");
}

/** GET /mobile/worker/deployments */
export async function getWorkerDeployments() {
  return apiFetch("/mobile/worker/deployments");
}

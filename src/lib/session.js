/**
 * 모바일 작업자 세션 관리.
 * 인증 토큰은 BE가 발급한 Worker JWT (Bearer 방식).
 */

export const WORKER_STORAGE_KEY = "dndn.worker";
export const WORKER_ACCESS_TOKEN_KEY = "dndn.accessToken"; // BE Worker JWT

export function getStoredWorker() {
  try {
    const value = localStorage.getItem(WORKER_STORAGE_KEY);
    if (!value || value === "undefined" || value === "null") {
      localStorage.removeItem(WORKER_STORAGE_KEY); // 오염된 값 자동 정리
      return null;
    }
    const parsed = JSON.parse(value);
    // 최소 유효성 검사: id 와 name 이 있어야 진짜 worker 객체
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

export function setStoredWorker(worker) {
  localStorage.setItem(WORKER_STORAGE_KEY, JSON.stringify(worker));
  window.dispatchEvent(new CustomEvent("worker:updated", { detail: worker }));
}

export function clearStoredWorker() {
  localStorage.removeItem(WORKER_STORAGE_KEY);
  localStorage.removeItem(WORKER_ACCESS_TOKEN_KEY);
  window.dispatchEvent(new CustomEvent("worker:updated", { detail: null }));
}

export function getWorkerAccessToken() {
  return localStorage.getItem(WORKER_ACCESS_TOKEN_KEY);
}

export function setWorkerAccessToken(token) {
  localStorage.setItem(WORKER_ACCESS_TOKEN_KEY, token);
}

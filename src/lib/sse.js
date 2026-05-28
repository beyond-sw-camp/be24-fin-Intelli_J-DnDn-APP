/**
 * 모바일 작업자 SSE 유틸리티.
 * 인력배치 확정 시 BE에서 push하는 이벤트를 수신한다.
 *
 * EventSource API는 커스텀 헤더를 지원하지 않으므로
 * JWT를 query param ?token= 으로 전달한다.
 * JwtFilter가 해당 파라미터를 인식하여 인증한다.
 */
import { getApiBaseUrl } from "./api";
import { getWorkerAccessToken } from "./session";

/** 현재 열려있는 EventSource 인스턴스 */
let assignmentEventSource = null;

/**
 * 배정 SSE 스트림 연결.
 *
 * @param {function} onAssignment - 배정 이벤트 수신 시 호출: onAssignment({ type, zoneMainTitle, zoneSubTitle, placement })
 * @returns {function} disconnect 함수 (onUnmounted 등에서 호출)
 */
export function connectAssignmentSse(onAssignment) {
  disconnectAssignmentSse();

  const token = getWorkerAccessToken();
  const base = getApiBaseUrl();
  if (!token || !base) return disconnectAssignmentSse;

  // K8s 배포 시 getApiBaseUrl()이 이미 /api를 포함하므로
  // 로컬(8080 직접 연결)에서도 /mobile/sse/... 경로는 동일하게 동작한다.
  const url = `${base}/mobile/sse/assignment-stream?token=${encodeURIComponent(token)}`;

  try {
    assignmentEventSource = new EventSource(url);

    assignmentEventSource.addEventListener("assignment", (event) => {
      try {
        const data = JSON.parse(event.data);
        onAssignment(data);
      } catch {
        // JSON 파싱 실패 — 무시
      }
    });

    // ping: 연결 확인용 (처리 불필요)
    assignmentEventSource.addEventListener("ping", () => {});

    assignmentEventSource.onerror = () => {
      // 브라우저가 자동으로 재연결을 시도함 — 별도 처리 불필요
    };
  } catch {
    // EventSource 미지원 또는 네트워크 오류
  }

  return disconnectAssignmentSse;
}

/** SSE 연결 해제 */
export function disconnectAssignmentSse() {
  if (assignmentEventSource) {
    assignmentEventSource.close();
    assignmentEventSource = null;
  }
}

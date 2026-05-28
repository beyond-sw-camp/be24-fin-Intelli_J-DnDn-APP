export function statusLabel(status) {
  switch (status) {
    case "PRESENT":
      return "출근";
    case "LATE":
      return "지각";
    case "LEAVE":
      return "퇴근";
    case "EARLY_LEAVE":
      return "조퇴";
    case "PENDING":
      return "대기";
    case "ABSENT":
      return "결근";
    default:
      return "미기록";
  }
}

export function statusTone(status) {
  if (status === "PRESENT" || status === "LEAVE") return "success";
  if (status === "LATE" || status === "EARLY_LEAVE" || status === "PENDING") return "warning";
  if (status === "ABSENT") return "danger";
  return "medium";
}

export function compactTime(value) {
  return value ? value.slice(0, 5) : "--:--";
}

export function formatKoreanDate(date, style = "short") {
  if (!date) return "-";
  return new Date(`${date}T00:00:00+09:00`).toLocaleDateString("ko-KR", {
    month: style === "long" ? "long" : "numeric",
    day: "numeric",
    weekday: "short",
  });
}

export function joinDefined(parts, separator = " · ") {
  return parts.filter((part) => part && String(part).trim().length > 0).join(separator);
}

export function placementTitle(placement) {
  return placement?.zoneDisplay || "배정 대기";
}

export function placementMeta(worker, placement) {
  return joinDefined([placement?.location, placement?.assignedTrade || worker?.jobType, placement?.workTime]);
}

export function employmentLabel(value) {
  if (value === "DAILY") return "일용";
  if (value === "REGULAR") return "상용";
  return "-";
}

export function affiliationLabel(value) {
  if (value === "PARTNER") return "협력사";
  if (value === "DIRECT") return "직영";
  return "-";
}

export function jobRankLabel(value) {
  switch (value) {
    case "SITE_DIRECTOR":
      return "현장 총괄";
    case "SECTION_LEADER":
      return "공종 책임";
    case "FIELD_SUPERVISOR":
      return "현장 관리자";
    case "WORKER":
      return "작업자";
    default:
      return "-";
  }
}

export function attendanceErrorMessage(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("ATTENDANCE_NOT_FOUND")) {
    return "오늘 근무 명단이 없어 출퇴근 처리를 할 수 없습니다.";
  }
  if (message.includes("CLOCK_IN_REQUIRED")) {
    return "출근 기록이 있어야 퇴근 처리할 수 있습니다.";
  }
  return "출퇴근 처리 중 문제가 발생했습니다.";
}

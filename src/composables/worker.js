import { computed, onBeforeUnmount, ref } from "vue";
import { getStoredWorker, setStoredWorker, setWorkerAccessToken } from "@/lib/session";
import { getWorkerProfile } from "@/lib/api";

const worker = ref(getStoredWorker());

function handleWorkerUpdated(event) {
  worker.value = event.detail;
}

if (typeof window !== "undefined") {
  window.addEventListener("worker:updated", handleWorkerUpdated);
}

export function useWorker() {
  const isAuthenticated = computed(() => Boolean(worker.value));

  async function refreshWorker() {
    const res = await getWorkerProfile();
    // BE ProfileRes → 로컬 worker 객체 형태로 변환
    const updated = {
      id: res.workerIdx,
      name: res.name,
      siteName: res.siteName,
      siteCode: res.siteCode,
      jobType: res.jobType,
      jobRank: res.jobRank,
      affiliationKind: res.affiliationKind,
      employmentKind: res.employmentKind,
      phoneNumber: res.phoneNumber,
      emergencyContact: res.emergencyContact,
      emergencyRelation: res.emergencyRelation,
      bloodType: res.bloodType,
      profileImageUrl: res.profileImageUrl,
      attendanceStatus: res.attendanceStatus,
    };
    setStoredWorker(updated);
    worker.value = updated;
    return updated;
  }

  onBeforeUnmount(() => {});

  return {
    worker,
    isAuthenticated,
    refreshWorker,
  };
}

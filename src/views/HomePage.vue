<template>
  <LoadingState v-if="isLoading || !worker" />
  <ion-page v-else>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <HeaderTitle title="오늘 근무" :subtitle="`${worker.name} · ${worker.siteName || '현장 미지정'}`" />
        <StatusChip
          slot="end"
          class="header-chip"
          :label="statusLabel(currentStatus)"
          :tone="statusTone(currentStatus)"
        />
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ion-refresh="refresh">
        <ion-refresher-content />
      </ion-refresher>

      <div class="page-padding">
        <ion-card>
          <section class="assignment-card">
            <div class="assignment-top">
              <div class="icon-box">
                <ion-icon :icon="locationOutline" />
              </div>
              <StatusChip
                :label="assignmentConfirmed ? '배정 확정' : '배정 확인중'"
                :tone="assignmentConfirmed ? 'success' : 'warning'"
              />
            </div>

            <p class="section-label">오늘 배정 위치</p>
            <h1>{{ placementTitle(placement) }}</h1>
            <p class="assignment-meta">{{ placementMeta(worker, placement) || worker.siteName || "-" }}</p>
          </section>
        </ion-card>

        <ion-card>
          <div class="metric-grid">
            <div class="metric">
              <span class="metric-label">출근</span>
              <strong class="metric-value success">{{ compactTime(attendance?.clockIn) }}</strong>
            </div>
            <div class="metric">
              <span class="metric-label">퇴근</span>
              <strong :class="['metric-value', !attendance?.clockOut && 'muted']">
                {{ compactTime(attendance?.clockOut) }}
              </strong>
            </div>
            <div class="metric">
              <span class="metric-label">상태</span>
              <strong class="metric-value">{{ statusLabel(currentStatus) }}</strong>
            </div>
          </div>
        </ion-card>

        <div class="action-grid">
          <ion-button
            expand="block"
            :disabled="!canClockIn || processingAction === 'CHECK_IN'"
            @click="handleAttendance('CHECK_IN')"
          >
            <ion-spinner v-if="processingAction === 'CHECK_IN'" name="crescent" />
            <span v-else>출근 처리</span>
          </ion-button>
          <ion-button
            expand="block"
            color="dark"
            :disabled="!canClockOut || processingAction === 'CHECK_OUT'"
            @click="handleAttendance('CHECK_OUT')"
          >
            <ion-spinner v-if="processingAction === 'CHECK_OUT'" name="crescent" />
            <span v-else>퇴근 처리</span>
          </ion-button>
        </div>

        <div class="quick-grid">
          <button @click="router.push('/tabs/pass')">
            <strong>QR</strong>
            <span>출입증</span>
          </button>
          <button @click="router.push('/tabs/attendance')">
            <strong>기록</strong>
            <span>출근/배정</span>
          </button>
          <button @click="router.push('/tabs/profile')">
            <strong>프로필</strong>
            <span>내 정보</span>
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  IonButton,
  IonCard,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonToolbar,
  toastController,
} from "@ionic/vue";
import { locationOutline } from "ionicons/icons";
import HeaderTitle from "@/components/HeaderTitle.vue";
import LoadingState from "@/components/LoadingState.vue";
import StatusChip from "@/components/StatusChip.vue";
import { getTodayStatus, processAttendance } from "@/lib/api";
import { setStoredWorker } from "@/lib/session";
import { connectAssignmentSse, disconnectAssignmentSse } from "@/lib/sse";
import {
  attendanceErrorMessage,
  compactTime,
  placementMeta,
  placementTitle,
  statusLabel,
  statusTone,
} from "@/lib/labels";
import { useWorker } from "@/composables/worker";

const router = useRouter();
const { worker, refreshWorker } = useWorker();
const today = ref(null);
const isLoading = ref(true);
const processingAction = ref("");
const attendance = computed(() => today.value?.attendance);
const placement = computed(() => today.value?.placement);
const currentStatus = computed(() => attendance.value?.attendanceStatus || worker.value?.attendanceStatus);
const assignmentConfirmed = computed(() => placement.value?.assignmentConfirmed === true);
// BE 응답이 없어도 FE에서 직접 판단
const canClockIn = computed(() => !attendance.value?.clockIn);
const canClockOut = computed(() => Boolean(attendance.value?.clockIn) && !attendance.value?.clockOut);

async function loadToday() {
  today.value = await getTodayStatus();
}

async function refresh(event) {
  try {
    await refreshWorker();
    await loadToday();
  } finally {
    event.target.complete();
  }
}

async function handleAttendance(action) {
  processingAction.value = action;
  try {
    const result = await processAttendance(action);
    // result는 BE TodayRes — today 상태 직접 갱신
    today.value = result;
    // 저장된 worker의 attendanceStatus도 최신화
    if (result?.attendance?.attendanceStatus && worker.value) {
      setStoredWorker({ ...worker.value, attendanceStatus: result.attendance.attendanceStatus });
    }
  } catch (error) {
    window.alert(attendanceErrorMessage(error));
  } finally {
    processingAction.value = "";
  }
}

async function onAssignmentPush(data) {
  // POST /staffing/save 시점에만 수신되는 이벤트 — today 상태 재조회 후 유형별 토스트
  await loadToday();

  if (data?.type === "RESET") {
    // 초기화 후 저장 → 배정 대기 상태로 전환
    const toast = await toastController.create({
      message: "🔄 배정이 초기화되었습니다",
      duration: 4000,
      position: "top",
      color: "warning",
    });
    await toast.present();
    return;
  }

  // ASSIGNED — 배치 확정
  const label = data?.placement || data?.zoneSubTitle || "구역 배정됨";
  const toast = await toastController.create({
    message: `📍 배정 확정: ${label}`,
    duration: 5000,
    position: "top",
    color: "success",
  });
  await toast.present();
}

onMounted(async () => {
  try {
    await loadToday();
  } finally {
    isLoading.value = false;
  }
  connectAssignmentSse(onAssignmentPush);
});

onUnmounted(() => {
  disconnectAssignmentSse();
});
</script>

<style scoped>
.header-chip {
  margin-right: 14px;
}

.assignment-card {
  display: grid;
  gap: 8px;
  padding: 18px;
}

.assignment-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}

.icon-box {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-size: 23px;
}

h1 {
  margin: 0;
  color: #111827;
  font-size: 27px;
  font-weight: 900;
  line-height: 33px;
}

.assignment-meta {
  margin: 0;
  color: #667085;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
}

.success {
  color: #15803d;
}

.action-grid {
  display: grid;
  gap: 10px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.quick-grid button {
  display: grid;
  min-height: 92px;
  place-items: center;
  align-content: center;
  gap: 4px;
  border: 1px solid #dde3ea;
  border-radius: 8px;
  background: #ffffff;
  color: #111827;
}

.quick-grid strong {
  font-size: 16px;
  font-weight: 900;
}

.quick-grid span {
  color: #667085;
  font-size: 12px;
  font-weight: 800;
}
</style>

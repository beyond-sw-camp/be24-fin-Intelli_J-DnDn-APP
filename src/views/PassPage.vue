<template>
  <LoadingState v-if="isLoading || !worker" />
  <ion-page v-else>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <HeaderTitle title="출입증" :subtitle="today?.workDate || '오늘'" />
        <StatusChip
          slot="end"
          class="header-chip"
          :label="statusLabel(attendance?.attendanceStatus)"
          :tone="statusTone(attendance?.attendanceStatus)"
        />
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ion-refresh="refresh">
        <ion-refresher-content />
      </ion-refresher>

      <div class="page-padding">
        <ion-card>
          <section class="pass-header">
            <div class="avatar">{{ worker.name.slice(0, 1) }}</div>
            <div>
              <h2>{{ worker.name }}</h2>
              <p>{{ worker.siteName }}</p>
            </div>
          </section>

          <section class="qr-area">
            <img v-if="qrSrc" :src="qrSrc" alt="출입 QR" />
          </section>

          <section class="assignment">
            <p class="section-label">오늘 위치</p>
            <h1>{{ placementTitle(placement) }}</h1>
            <p>{{ placementMeta(worker, placement) || "-" }}</p>
          </section>
        </ion-card>

        <ion-card>
          <div class="metric-grid two">
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
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, onMounted, ref, watchEffect } from "vue";
import {
  IonButton,
  IonCard,
  IonContent,
  IonHeader,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonToolbar,
} from "@ionic/vue";
import QRCode from "qrcode";
import HeaderTitle from "@/components/HeaderTitle.vue";
import LoadingState from "@/components/LoadingState.vue";
import StatusChip from "@/components/StatusChip.vue";
import { getTodayStatus, processAttendance } from "@/lib/api";
import { setStoredWorker } from "@/lib/session";
import {
  attendanceErrorMessage,
  compactTime,
  placementMeta,
  placementTitle,
  statusLabel,
  statusTone,
} from "@/lib/labels";
import { useWorker } from "@/composables/worker";

const { worker } = useWorker();
const today = ref(null);
const isLoading = ref(true);
const processingAction = ref("");
const qrSrc = ref("");
const attendance = computed(() => today.value?.attendance);
const placement = computed(() => today.value?.placement);
// BE 응답이 없어도 FE에서 직접 판단 — API 실패 시에도 출근 버튼 활성화
const canClockIn = computed(() => !attendance.value?.clockIn);
const canClockOut = computed(() => Boolean(attendance.value?.clockIn) && !attendance.value?.clockOut);

async function loadToday() {
  today.value = await getTodayStatus();
}

async function refresh(event) {
  try {
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

watchEffect(async () => {
  if (!worker.value || !today.value) return;
  const payload = JSON.stringify({
    type: "DNDN_SITE_ACCESS",
    workerIdx: worker.value.id,
    name: worker.value.name,
    date: today.value.workDate,
  });
  qrSrc.value = await QRCode.toDataURL(payload, {
    width: 248,
    margin: 1,
    color: {
      dark: "#111827",
      light: "#ffffff",
    },
  });
});

onMounted(async () => {
  try {
    await loadToday();
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.header-chip {
  margin-right: 14px;
}

.pass-header {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  border-bottom: 1px solid #dde3ea;
  padding: 16px;
}

.avatar {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 8px;
  background: #111827;
  color: #ffffff;
  font-size: 20px;
  font-weight: 900;
}

h2 {
  margin: 0;
  color: #111827;
  font-size: 18px;
  font-weight: 900;
}

.pass-header p {
  margin: 2px 0 0;
  color: #667085;
  font-size: 13px;
  font-weight: 700;
}

.qr-area {
  display: grid;
  place-items: center;
  border-bottom: 1px solid #dde3ea;
  background: #f8fafc;
  padding: 22px;
}

.qr-area img {
  width: min(248px, 100%);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  padding: 9px;
}

.assignment {
  display: grid;
  gap: 5px;
  padding: 16px;
}

.assignment h1 {
  margin: 0;
  color: #111827;
  font-size: 20px;
  font-weight: 900;
  line-height: 26px;
}

.assignment p:last-child {
  margin: 0;
  color: #667085;
  font-size: 13px;
  font-weight: 700;
  line-height: 18px;
}

.metric-grid.two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.success {
  color: #15803d;
}

.action-grid {
  display: grid;
  gap: 10px;
}
</style>

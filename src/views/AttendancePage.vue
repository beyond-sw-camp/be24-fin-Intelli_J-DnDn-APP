<template>
  <LoadingState v-if="isLoading || !worker" />
  <ion-page v-else>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <HeaderTitle title="근무 기록" :subtitle="`${worker.name} · 최근 ${days}일`" />
      </ion-toolbar>
      <div class="filter-row">
        <button
          v-for="value in [7, 30, 90]"
          :key="value"
          :class="{ active: days === value }"
          @click="setDays(value)"
        >
          {{ value }}일
        </button>
      </div>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ion-refresh="refresh">
        <ion-refresher-content />
      </ion-refresher>

      <div class="page-padding">
        <ion-card>
          <section class="summary">
            <div class="summary-icon">기록</div>
            <div>
              <h2>출퇴근 및 일별 배정</h2>
              <p>{{ rows.length }}건의 기록</p>
            </div>
          </section>
        </ion-card>

        <template v-if="rows.length">
          <ion-card v-for="item in rows" :key="item.id">
            <article class="history-card">
              <div class="history-head">
                <div>
                  <h3>{{ formatKoreanDate(item.date, "long") }}</h3>
                  <p>{{ joinDefined([item.zoneDisplay || "배정 위치 없음", item.location]) }}</p>
                </div>
                <StatusChip :label="statusLabel(item.attendanceStatus)" :tone="statusTone(item.attendanceStatus)" />
              </div>

              <div class="metric-grid">
                <div class="metric">
                  <span class="metric-label">출근</span>
                  <strong class="metric-value">{{ compactTime(item.clockIn) }}</strong>
                </div>
                <div class="metric">
                  <span class="metric-label">퇴근</span>
                  <strong :class="['metric-value', !item.clockOut && 'muted']">
                    {{ compactTime(item.clockOut) }}
                  </strong>
                </div>
                <div class="metric">
                  <span class="metric-label">공종</span>
                  <strong class="metric-value">{{ item.assignedTrade || worker.jobType || "-" }}</strong>
                </div>
              </div>

              <div v-if="item.workTime" class="meta-bar">{{ item.workTime }}</div>
            </article>
          </ion-card>
        </template>

        <div v-else class="empty-state">
          <strong>표시할 근무 기록이 없습니다</strong>
          <p>DnDn 근무 명단이나 배정 확정 여부를 확인해 주세요.</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import {
  IonCard,
  IonContent,
  IonHeader,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonToolbar,
} from "@ionic/vue";
import HeaderTitle from "@/components/HeaderTitle.vue";
import LoadingState from "@/components/LoadingState.vue";
import StatusChip from "@/components/StatusChip.vue";
import { getAttendanceHistory } from "@/lib/api";
import { compactTime, formatKoreanDate, joinDefined, statusLabel, statusTone } from "@/lib/labels";
import { useWorker } from "@/composables/worker";

const { worker } = useWorker();
const days = ref(30);
const rows = ref([]);
const isLoading = ref(true);

async function loadHistory() {
  rows.value = await getAttendanceHistory(days.value);
}

async function setDays(value) {
  days.value = value;
}

async function refresh(event) {
  try {
    await loadHistory();
  } finally {
    event.target.complete();
  }
}

watch(days, loadHistory);

onMounted(async () => {
  try {
    await loadHistory();
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.filter-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  border-bottom: 1px solid #dde3ea;
  background: #f6f7f9;
  padding: 12px 14px;
}

.filter-row button {
  height: 40px;
  border: 1px solid #dde3ea;
  border-radius: 8px;
  background: #ffffff;
  color: #667085;
  font-size: 14px;
  font-weight: 900;
}

.filter-row button.active {
  border-color: #111827;
  background: #111827;
  color: #ffffff;
}

.summary {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-height: 74px;
  padding: 16px;
}

.summary-icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-size: 11px;
  font-weight: 900;
}

h2,
h3,
p {
  margin: 0;
}

h2 {
  color: #111827;
  font-size: 16px;
  font-weight: 900;
}

.summary p {
  margin-top: 3px;
  color: #667085;
  font-size: 13px;
  font-weight: 700;
}

.history-card {
  overflow: hidden;
}

.history-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  border-bottom: 1px solid #dde3ea;
  padding: 16px;
}

h3 {
  color: #111827;
  font-size: 16px;
  font-weight: 900;
}

.history-head p {
  margin-top: 4px;
  color: #667085;
  font-size: 13px;
  font-weight: 700;
  line-height: 18px;
}

.meta-bar {
  border-top: 1px solid #dde3ea;
  background: #f6f7f9;
  color: #667085;
  font-size: 13px;
  font-weight: 700;
  padding: 10px 16px;
}
</style>

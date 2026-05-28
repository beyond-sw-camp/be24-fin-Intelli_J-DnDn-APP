<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/profile" text="" />
        </ion-buttons>
        <HeaderTitle title="안전 사고 이력" subtitle="등록된 사고 기록" />
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="page-padding">
        <LoadingState v-if="isLoading" />

        <template v-else-if="accidents.length === 0">
          <ion-card>
            <div class="empty-state">
              <strong>사고 이력 없음</strong>
              <p>등록된 안전 사고 이력이 없습니다.</p>
            </div>
          </ion-card>
        </template>

        <template v-else>
          <ion-card v-for="item in accidents" :key="item.idx">
            <div class="accident-row">
              <div class="row-top">
                <span class="date-label">{{ formatDate(item.occurredAt) }}</span>
                <StatusChip :label="item.accidentType || '사고'" tone="danger" />
              </div>
              <dl class="detail-list">
                <div v-if="item.zoneDisplay">
                  <dt>구역</dt>
                  <dd>{{ item.zoneDisplay }}</dd>
                </div>
                <div v-if="item.resolution">
                  <dt>처리 결과</dt>
                  <dd>{{ item.resolution }}</dd>
                </div>
              </dl>
            </div>
          </ion-card>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { IonBackButton, IonButtons, IonCard, IonContent, IonHeader, IonPage, IonToolbar } from "@ionic/vue";
import HeaderTitle from "@/components/HeaderTitle.vue";
import LoadingState from "@/components/LoadingState.vue";
import StatusChip from "@/components/StatusChip.vue";
import { getWorkerAccidents } from "@/lib/api";

const isLoading = ref(true);
const accidents = ref([]);

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

onMounted(async () => {
  try {
    accidents.value = (await getWorkerAccidents()) ?? [];
  } catch (e) {
    console.error("[AccidentsPage]", e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.accident-row {
  padding: 16px;
  display: grid;
  gap: 12px;
}

.row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.date-label {
  color: #111827;
  font-size: 15px;
  font-weight: 900;
}

.detail-list {
  display: grid;
  gap: 0;
  margin: 0;
}

.detail-list div {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  border-top: 1px solid #dde3ea;
  padding: 10px 0;
}

dt {
  color: #667085;
  font-size: 12px;
  font-weight: 800;
}

dd {
  margin: 0;
  color: #111827;
  font-size: 13px;
  font-weight: 700;
  line-height: 18px;
}
</style>

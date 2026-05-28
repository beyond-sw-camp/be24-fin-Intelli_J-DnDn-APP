<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/profile" text="" />
        </ion-buttons>
        <HeaderTitle title="구역 배치이력" subtitle="확정된 배치 기록" />
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="page-padding">
        <LoadingState v-if="isLoading" />

        <template v-else-if="deployments.length === 0">
          <ion-card>
            <div class="empty-state">
              <strong>배치이력 없음</strong>
              <p>확정된 구역 배치 이력이 없습니다.</p>
            </div>
          </ion-card>
        </template>

        <template v-else>
          <ion-card v-for="item in deployments" :key="item.idx">
            <div class="deploy-row">
              <div class="row-top">
                <span class="date-label">{{ formatDate(item.assignedAt) }}</span>
                <StatusChip v-if="item.tradeName" :label="item.tradeName" tone="primary" />
              </div>
              <dl class="detail-list">
                <div v-if="item.zoneDisplay">
                  <dt>구역</dt>
                  <dd>{{ item.zoneDisplay }}</dd>
                </div>
                <div v-if="item.confirmedAt">
                  <dt>확정 시각</dt>
                  <dd>{{ item.confirmedAt }}</dd>
                </div>
                <div v-if="item.siteCode">
                  <dt>현장</dt>
                  <dd>{{ item.siteCode }}</dd>
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
import { getWorkerDeployments } from "@/lib/api";

const isLoading = ref(true);
const deployments = ref([]);

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

onMounted(async () => {
  try {
    deployments.value = (await getWorkerDeployments()) ?? [];
  } catch (e) {
    console.error("[DeploymentsPage]", e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.deploy-row {
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

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/profile" text="" />
        </ion-buttons>
        <HeaderTitle title="서류 및 안전 현황" subtitle="제출된 서류 목록" />
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="page-padding">
        <LoadingState v-if="isLoading" />

        <template v-else-if="docs.length === 0">
          <ion-card>
            <div class="empty-state">
              <strong>서류 없음</strong>
              <p>등록된 서류 및 안전 현황이 없습니다.</p>
            </div>
          </ion-card>
        </template>

        <template v-else>
          <ion-card v-for="item in docs" :key="item.idx">
            <div class="doc-row">
              <div class="doc-icon">서류</div>
              <div class="doc-info">
                <p class="doc-title">{{ item.title || "제목 없음" }}</p>
                <p v-if="item.storedFileName" class="doc-file">{{ item.storedFileName }}</p>
              </div>
              <a
                v-if="item.fileUrl"
                :href="item.fileUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="view-link"
              >열기</a>
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
import { getWorkerDocs } from "@/lib/api";

const isLoading = ref(true);
const docs = ref([]);

onMounted(async () => {
  try {
    docs.value = (await getWorkerDocs()) ?? [];
  } catch (e) {
    console.error("[DocsPage]", e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.doc-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  min-height: 72px;
  padding: 14px 16px;
}

.doc-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.10);
  color: #2563eb;
  font-size: 11px;
  font-weight: 900;
  flex-shrink: 0;
}

.doc-info {
  min-width: 0;
}

.doc-title {
  margin: 0;
  color: #111827;
  font-size: 14px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-file {
  margin: 3px 0 0;
  color: #667085;
  font-size: 12px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.view-link {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-size: 13px;
  font-weight: 900;
  text-decoration: none;
  white-space: nowrap;
}
</style>

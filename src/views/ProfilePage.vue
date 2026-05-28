<template>
  <LoadingState v-if="!worker" />
  <ion-page v-else>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <HeaderTitle title="내 정보" :subtitle="worker.siteName || '현장 미지정'" />
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="page-padding">
        <ion-card>
          <section class="profile-card">
            <div class="avatar">{{ worker.name.slice(0, 1) }}</div>
            <h1>{{ worker.name }}</h1>
            <div class="badge-row">
              <StatusChip :label="employmentLabel(worker.employmentKind)" tone="primary" />
              <StatusChip :label="affiliationLabel(worker.affiliationKind)" tone="medium" />
            </div>
          </section>
        </ion-card>

        <ion-card>
          <dl class="info-list">
            <div>
              <dt>연락처</dt>
              <dd>{{ worker.phoneNumber || "-" }}</dd>
            </div>
            <div>
              <dt>현장</dt>
              <dd>{{ worker.siteName || "-" }}</dd>
            </div>
            <div>
              <dt>공종</dt>
              <dd>{{ worker.jobType || "-" }}</dd>
            </div>
            <div>
              <dt>직책</dt>
              <dd>{{ jobRankLabel(worker.jobRank) }}</dd>
            </div>
            <div>
              <dt>비상연락처</dt>
              <dd>{{ worker.emergencyContact || "-" }}</dd>
            </div>
            <div>
              <dt>혈액형</dt>
              <dd>{{ worker.bloodType || "-" }}</dd>
            </div>
          </dl>
        </ion-card>

        <ion-card button @click="router.push('/worker/deployments')">
          <section class="history-link">
            <div class="link-icon">배치</div>
            <div>
              <h2>구역 배치이력</h2>
              <p>확정된 구역 배치 기록을 확인</p>
            </div>
          </section>
        </ion-card>

        <ion-card button @click="router.push('/worker/accidents')">
          <section class="history-link">
            <div class="link-icon danger-icon">사고</div>
            <div>
              <h2>안전 사고 이력</h2>
              <p>등록된 안전 사고 및 처리 결과 확인</p>
            </div>
          </section>
        </ion-card>

        <ion-card button @click="router.push('/worker/docs')">
          <section class="history-link">
            <div class="link-icon docs-icon">서류</div>
            <div>
              <h2>서류 및 안전 현황</h2>
              <p>제출된 서류 목록과 파일 확인</p>
            </div>
          </section>
        </ion-card>

        <ion-button expand="block" color="danger" @click="handleLogout">로그아웃</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { useRouter } from "vue-router";
import { IonButton, IonCard, IonContent, IonHeader, IonPage, IonToolbar } from "@ionic/vue";
import HeaderTitle from "@/components/HeaderTitle.vue";
import LoadingState from "@/components/LoadingState.vue";
import StatusChip from "@/components/StatusChip.vue";
import { clearStoredWorker } from "@/lib/session";
import { affiliationLabel, employmentLabel, jobRankLabel } from "@/lib/labels";
import { useWorker } from "@/composables/worker";

const router = useRouter();
const { worker } = useWorker();

function handleLogout() {
  if (!window.confirm("이 기기에서 로그아웃할까요?")) return;
  clearStoredWorker();
  // router.replace("/login") 은 Ionic 뷰 스택이 남아 흰 화면이 뜨는 문제가 있음.
  // 강제 리로드로 Ionic 상태를 완전히 초기화한다.
  window.location.replace("/login");
}
</script>

<style scoped>
.profile-card {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 22px;
  text-align: center;
}

.avatar {
  display: grid;
  width: 74px;
  height: 74px;
  place-items: center;
  border-radius: 8px;
  background: #111827;
  color: #ffffff;
  font-size: 30px;
  font-weight: 900;
}

h1,
h2,
p,
dl,
dd {
  margin: 0;
}

h1 {
  color: #111827;
  font-size: 22px;
  font-weight: 900;
}

.profile-card p {
  color: #667085;
  font-size: 14px;
  font-weight: 700;
}

.info-list {
  display: grid;
}

.info-list div {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  border-bottom: 1px solid #dde3ea;
  padding: 14px 16px;
}

.info-list div:last-child {
  border-bottom: 0;
}

dt {
  color: #667085;
  font-size: 13px;
  font-weight: 800;
}

dd {
  color: #111827;
  font-size: 14px;
  font-weight: 800;
  line-height: 19px;
  text-align: right;
}

.history-link {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-height: 76px;
  padding: 16px;
}

.link-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-size: 11px;
  font-weight: 900;
}

.link-icon.danger-icon {
  background: rgba(220, 38, 38, 0.12);
  color: #dc2626;
}

.link-icon.docs-icon {
  background: rgba(21, 128, 61, 0.12);
  color: #15803d;
}

h2 {
  color: #111827;
  font-size: 15px;
  font-weight: 900;
}

.history-link p {
  margin-top: 3px;
  color: #667085;
  font-size: 12px;
  font-weight: 700;
}
</style>

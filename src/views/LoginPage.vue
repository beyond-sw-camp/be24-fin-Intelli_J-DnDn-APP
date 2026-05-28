<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <HeaderTitle title="DnDn 현장출입" subtitle="근무자 모바일 앱" />
        <StatusChip slot="end" label="인증" tone="primary" class="header-chip" />
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="page-padding">
        <section class="brand-panel">
          <div class="logo-box">Dn</div>
          <div>
            <p>SITE ACCESS</p>
            <h1>오늘 배정과 출퇴근을 바로 확인합니다</h1>
          </div>
        </section>

        <ion-card>
          <form class="form" @submit.prevent="handleLogin">
            <label>
              <span>이름</span>
              <ion-input
                v-model="name"
                name="name"
                placeholder="근무자 이름"
                autocomplete="name"
                autocapitalize="off"
                clear-input
              />
            </label>

            <label>
              <span>전화번호</span>
              <div class="phone-row">
                <ion-input
                  v-model="phone"
                  name="phone"
                  :type="showPhone ? 'tel' : 'password'"
                  inputmode="tel"
                  autocomplete="tel"
                  placeholder="010-0000-0000"
                  maxlength="13"
                  @ion-input="formatPhone"
                  @keyup.enter="handleLogin"
                />
                <ion-button type="button" fill="outline" color="dark" class="show-button" @click="showPhone = !showPhone">
                  {{ showPhone ? "숨김" : "보기" }}
                </ion-button>
              </div>
            </label>

            <ion-button type="submit" expand="block" :disabled="isLoading || !canSubmit">
              <ion-spinner v-if="isLoading" name="crescent" />
              <span v-else>로그인</span>
            </ion-button>
          </form>
        </ion-card>

        <p class="notice">DnDn 근무자 명단에 등록된 이름과 전화번호로만 접속됩니다.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import {
  IonButton,
  IonCard,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonSpinner,
  IonToolbar,
} from "@ionic/vue";
import HeaderTitle from "@/components/HeaderTitle.vue";
import StatusChip from "@/components/StatusChip.vue";
import { loginWorker } from "@/lib/api";
import { setStoredWorker, setWorkerAccessToken } from "@/lib/session";

const phoneRegex = /^010-\d{4}-\d{4}$/;
const router = useRouter();
const name = ref("");
const phone = ref("");
const showPhone = ref(false);
const isLoading = ref(false);
const canSubmit = computed(() => name.value.trim().length > 0 && phoneRegex.test(phone.value));

function formatPhone(event) {
  const value = event.target.value || "";
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) {
    phone.value = digits;
  } else if (digits.length <= 7) {
    phone.value = `${digits.slice(0, 3)}-${digits.slice(3)}`;
  } else {
    phone.value = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  }
}

async function handleLogin() {
  if (!name.value.trim()) {
    window.alert("근무자 이름을 입력해 주세요.");
    return;
  }
  if (!phoneRegex.test(phone.value)) {
    window.alert("전화번호 형식을 확인해 주세요.\n예: 010-1234-5678");
    return;
  }

  isLoading.value = true;
  try {
    const result = await loginWorker(name.value.trim(), phone.value);
    // BE 응답: { accessToken, workerIdx, name, siteName, ... }
    setWorkerAccessToken(result.accessToken);
    // worker 객체로 변환하여 저장 (기존 composable 호환)
    setStoredWorker({
      id: result.workerIdx,
      name: result.name,
      siteName: result.siteName,
      siteCode: result.siteCode,
      jobType: result.jobType,
      jobRank: result.jobRank,
      affiliationKind: result.affiliationKind,
      employmentKind: result.employmentKind,
      phoneNumber: result.phoneNumber,
      emergencyContact: result.emergencyContact,
      emergencyRelation: result.emergencyRelation,
      bloodType: result.bloodType,
      profileImageUrl: result.profileImageUrl,
      attendanceStatus: result.attendanceStatus,
    });
    router.replace("/tabs/home");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("INVALID_CREDENTIALS") ||
      message.includes("UNAUTHORIZED") ||
      message.includes("이름 또는 전화번호")
    ) {
      window.alert("DnDn 근무자 이름과 전화번호를 확인해 주세요.");
    } else if (message.includes("근무 명단") || message.includes("NOT_ROSTERED")) {
      window.alert("오늘 근무 명단에 등록되지 않아 로그인할 수 없습니다.");
    } else {
      window.alert("로그인 중 문제가 발생했습니다.");
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.header-chip {
  margin-right: 14px;
}

.brand-panel {
  display: grid;
  min-height: 178px;
  align-content: space-between;
  border-radius: 8px;
  background: #111827;
  padding: 18px;
}

.brand-panel p {
  margin: 0 0 5px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 900;
}

.brand-panel h1 {
  margin: 0;
  color: #ffffff;
  font-size: 26px;
  font-weight: 900;
  line-height: 32px;
}

.logo-box {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border-radius: 8px;
  background: #ffffff;
  color: #111827;
  font-size: 20px;
  font-weight: 900;
}

.form {
  display: grid;
  gap: 16px;
  padding: 16px;
}

label {
  display: grid;
  gap: 7px;
  color: #111827;
  font-size: 13px;
  font-weight: 900;
}

ion-input {
  min-height: 54px;
  --background: #f6f7f9;
  --border-color: #dde3ea;
  --border-radius: 8px;
  --border-style: solid;
  --border-width: 1px;
  --color: #111827;
  --padding-start: 13px;
  --placeholder-color: #667085;
  font-size: 16px;
  font-weight: 700;
}

.phone-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 58px;
  gap: 8px;
}

.show-button {
  height: 54px;
  margin: 0;
  --border-color: #dde3ea;
  --color: #111827;
  font-size: 13px;
  white-space: nowrap;
}

.notice {
  margin: 0 2px;
  color: #667085;
  font-size: 12px;
  font-weight: 700;
  line-height: 17px;
}
</style>

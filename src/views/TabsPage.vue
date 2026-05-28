<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="homeOutline" />
          <ion-label>홈</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="pass" href="/tabs/pass">
          <ion-icon :icon="qrCodeOutline" />
          <ion-label>출입증</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="attendance" href="/tabs/attendance">
          <ion-icon :icon="calendarOutline" />
          <ion-label>근무</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon :icon="personOutline" />
          <ion-label>내 정보</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup>
import {
  IonIcon,
  IonLabel,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/vue";
import { calendarOutline, homeOutline, personOutline, qrCodeOutline } from "ionicons/icons";
</script>

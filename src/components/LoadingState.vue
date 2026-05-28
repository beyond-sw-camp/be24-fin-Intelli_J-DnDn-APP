<template>
  <ion-page>
    <ion-content>
      <div class="loading">
        <ion-spinner name="crescent" />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonContent, IonPage, IonSpinner } from "@ionic/vue";
</script>

<style scoped>
.loading {
  display: grid;
  min-height: 100vh;
  place-items: center;
}
</style>

<template>
  <ion-title>
    <div>{{ title }}</div>
    <small v-if="subtitle" class="subtitle">{{ subtitle }}</small>
  </ion-title>
</template>

<script setup>
import { IonTitle } from "@ionic/vue";

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
});
</script>

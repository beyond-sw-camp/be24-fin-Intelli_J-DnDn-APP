<template>
  <span :class="['status-chip', tone]">{{ label }}</span>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  tone: {
    type: String,
    default: "medium",
  },
});
</script>

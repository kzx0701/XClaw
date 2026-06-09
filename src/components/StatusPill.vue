<template>
  <div class="status-pill" :data-status="status">
    <span class="status-pill-dot" aria-hidden="true" />
    <span class="status-pill-text">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  status: "disconnected" | "connecting" | "connected";
}>();
</script>

<style scoped>
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.status-pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #7a7a7a;
  flex: 0 0 auto;
}

.status-pill-text {
  color: #7a7a7a;
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.12px;
  white-space: nowrap;
}

.status-pill[data-status="connected"] .status-pill-dot {
  background: #48c78e;
}

.status-pill[data-status="connected"] .status-pill-text {
  color: #8ad48a;
}

.status-pill[data-status="connecting"] .status-pill-dot {
  background: #e0a340;
}

.status-pill[data-status="connecting"] .status-pill-text {
  color: #d4c48a;
}

.status-pill[data-status="disconnected"] .status-pill-dot {
  background: #7a7a7a;
}

.status-pill[data-status="disconnected"] .status-pill-text {
  color: #7a7a7a;
}
</style>

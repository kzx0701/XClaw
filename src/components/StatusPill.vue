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
  background: #8b8b9a;
  box-shadow: 0 0 0 3px rgba(139, 139, 154, 0.12);
  flex: 0 0 auto;
}

.status-pill-text {
  color: #8b8b9a;
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

.status-pill[data-status="connected"] .status-pill-dot {
  background: #48c78e;
  box-shadow: 0 0 0 3px rgba(72, 199, 142, 0.15);
}

.status-pill[data-status="connected"] .status-pill-text {
  color: #8ad48a;
}

.status-pill[data-status="connecting"] .status-pill-dot {
  background: #e0a340;
  box-shadow: 0 0 0 3px rgba(224, 163, 64, 0.15);
}

.status-pill[data-status="connecting"] .status-pill-text {
  color: #d4c48a;
}

.status-pill[data-status="disconnected"] .status-pill-dot {
  background: #8b8b9a;
  box-shadow: 0 0 0 3px rgba(139, 139, 154, 0.12);
}

.status-pill[data-status="disconnected"] .status-pill-text {
  color: #8b8b9a;
}
</style>

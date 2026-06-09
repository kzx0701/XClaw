<template>
  <div class="page-transition-frame">
    <Transition name="page-panel" appear>
      <div :key="transitionKey" class="page-transition-panel">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  transitionKey: string
}>()
</script>

<style>
.page-transition-frame {
  position: relative;
  width: 100%;
  min-width: 0;
  min-height: 100%;
}

.page-transition-panel {
  position: relative;
  width: 100%;
  min-width: 0;
  will-change: opacity;
}

.page-panel-enter-active,
.page-panel-leave-active {
  transition: opacity 260ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.page-panel-leave-active {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.page-panel-enter-active {
  position: relative;
  z-index: 1;
}

.page-panel-enter-from {
  opacity: 0;
}

.page-panel-enter-to,
.page-panel-leave-from {
  opacity: 1;
}

.page-panel-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .page-panel-enter-active,
  .page-panel-leave-active {
    transition: none;
  }

  .page-panel-enter-from,
  .page-panel-leave-to {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
</style>

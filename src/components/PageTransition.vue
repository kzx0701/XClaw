<template>
  <Transition name="page-panel" mode="out-in" appear>
    <div :key="transitionKey" class="page-transition-panel">
      <slot />
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  transitionKey: string
}>()
</script>

<style>
.page-transition-panel {
  width: 100%;
  min-width: 0;
}

.page-panel-enter-active,
.page-panel-leave-active {
  transition:
    opacity 200ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.page-panel-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-panel-leave-to {
  opacity: 0;
  transform: translateY(-4px);
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

<template>
  <article class="resource-card" @click="$emit('select')">
    <div class="resource-card-top">
      <div class="resource-card-main">
        <span class="resource-card-icon">
          <slot name="icon" />
        </span>

        <div class="resource-card-body">
          <strong>{{ title }}</strong>
          <p :title="description">{{ description }}</p>
        </div>
      </div>

      <ChevronRight class="resource-card-enter-icon" aria-hidden="true" />
    </div>

    <div class="resource-card-foot">
      <slot name="meta" />
      <div class="resource-card-actions">
        <slot name="actions" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

defineProps<{
  description: string
  title: string
}>()

defineEmits<{
  select: []
}>()
</script>

<style scoped>
.resource-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 112px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 160ms ease;
}

.dark .resource-card {
  background: var(--surface);
  color: var(--text-primary);
}

.resource-card:hover {
  background: var(--surface-hover);
}

.dark .resource-card:hover {
  background: var(--surface-hover);
}

.resource-card:focus-visible {
  outline: none;
  background: var(--surface-hover);
}

.resource-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.resource-card-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.resource-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface-active);
  color: var(--text-primary);
  flex: 0 0 auto;
}

.dark .resource-card-icon {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.resource-card-body {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.resource-card-body strong,
.resource-card-body p {
  margin: 0;
}

.resource-card-body strong {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}

.dark .resource-card-body strong {
  color: var(--text-primary);
}

.resource-card-body p {
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .resource-card-body p {
  color: var(--text-secondary);
}

.resource-card-enter-icon {
  color: var(--text-muted);
  flex: 0 0 auto;
  transition: color 160ms ease;
}

.dark .resource-card-enter-icon {
  color: var(--text-muted);
}

.resource-card:hover .resource-card-enter-icon {
  color: var(--text-primary);
}

.dark .resource-card:hover .resource-card-enter-icon {
  color: var(--text-primary);
}

.resource-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 30px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  background: transparent;
}

.resource-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

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
  gap: 14px;
  min-height: 120px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  background: #2a2a3c;
  color: #e0e0e0;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    transform 160ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 160ms ease;
}

.resource-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  background: #32324a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.resource-card:focus-visible {
  outline: none;
  border-color: rgba(74, 127, 193, 0.3);
  box-shadow: 0 0 0 1px rgba(74, 127, 193, 0.15);
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
  border-radius: 8px;
  background: rgba(74, 127, 193, 0.12);
  color: #7aa3d9;
  flex: 0 0 auto;
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
  color: #e0e0e0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
}

.resource-card-body p {
  color: #8b8b9a;
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resource-card-enter-icon {
  color: #6b6b7a;
  flex: 0 0 auto;
  transition: color 160ms ease;
}

.resource-card:hover .resource-card-enter-icon {
  color: #8b8b9a;
}

.resource-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 30px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.resource-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

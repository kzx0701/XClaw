<template>
  <div class="workspace-header-actions">
    <Button
      v-if="showDelete"
      :icon="Trash2"
      severity="danger"
      text
      rounded
      class="workspace-delete-button"
      :aria-label="deleteLabel"
      :title="deleteLabel"
      @click="$emit('delete')"
    />
    <Button
      v-if="showBack"
      :icon="ArrowLeft"
      severity="secondary"
      text
      rounded
      class="workspace-back-button"
      :aria-label="backLabel"
      :title="backLabel"
      @click="$emit('back')"
    />
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Trash2 } from 'lucide-vue-next'

import Button from '@/components/ui/button/Button.vue'

withDefaults(defineProps<{
  backLabel?: string
  deleteLabel?: string
  showBack?: boolean
  showDelete?: boolean
}>(), {
  backLabel: '返回列表',
  deleteLabel: '删除',
  showBack: true,
  showDelete: true,
})

defineEmits<{
  back: []
  delete: []
}>()
</script>

<style scoped>
.workspace-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.workspace-delete-button,
.workspace-back-button {
  border-radius: 4px;
}

.workspace-delete-button {
  color: var(--text-muted);
}

.workspace-delete-button:hover {
  background: var(--danger-tint);
  color: var(--danger-soft);
}

.workspace-back-button {
  color: var(--text-muted);
}

.workspace-back-button:hover {
  background: var(--surface-active);
  color: var(--text-primary);
}


</style>

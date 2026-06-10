<template>
  <div class="workspace-detail-header">
    <div class="workspace-detail-header-copy">
      <div class="workspace-detail-header-title-row">
        <h2>{{ title }}</h2>
        <span v-if="statusLabel" class="workspace-detail-header-status" :data-ready="statusReady">
          {{ statusLabel }}
        </span>
      </div>
    </div>

    <div class="workspace-detail-header-actions">
      <Button
        v-if="showSave"
        variant="ghost"
        size="icon"
        class="workspace-detail-header-button workspace-detail-header-button-save"
        :aria-label="saveLabel"
        :title="saveLabel"
        @click="$emit('save')"
      >
        <Save class="h-4 w-4" />
      </Button>

      <Button
        v-if="showDelete"
        variant="ghost"
        size="icon"
        class="workspace-detail-header-button workspace-detail-header-button-danger"
        :aria-label="deleteLabel"
        :title="deleteLabel"
        @click="$emit('delete')"
      >
        <Trash2 class="h-4 w-4" />
      </Button>

      <Button
        v-if="showBack"
        variant="ghost"
        size="icon"
        class="workspace-detail-header-button"
        :aria-label="backLabel"
        :title="backLabel"
        @click="$emit('back')"
      >
        <ArrowLeft class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Save, Trash2 } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'

withDefaults(defineProps<{
  backLabel?: string
  deleteLabel?: string
  saveLabel?: string
  showBack?: boolean
  showDelete?: boolean
  showSave?: boolean
  statusLabel?: string
  statusReady?: boolean
  title: string
}>(), {
  backLabel: '返回列表',
  deleteLabel: '删除',
  saveLabel: '保存配置',
  showBack: true,
  showDelete: true,
  showSave: false,
  statusLabel: '',
  statusReady: false,
})

defineEmits<{
  back: []
  delete: []
  save: []
}>()
</script>

<style scoped>
.workspace-detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
}

.workspace-detail-header-copy {
  min-width: 0;
}

.workspace-detail-header-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.workspace-detail-header-copy h2 {
  margin: 0;
  color: #201d1d;
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.5;
}

.workspace-detail-header-status {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--warning-tint);
  color: var(--warning-soft);
  font-size: 13px;
  line-height: 1.4;
  white-space: nowrap;
}

.workspace-detail-header-status[data-ready='true'] {
  background: var(--success-tint);
  color: var(--success-soft);
}

.workspace-detail-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.workspace-detail-header-button {
  color: #424245;
}

.workspace-detail-header-button-save {
  color: #007aff;
}

.workspace-detail-header-button-danger {
  color: #d70015;
}

.workspace-detail-header-button:hover {
  background: #f1eeee;
  color: #201d1d;
}

.workspace-detail-header-button-save:hover {
  background: var(--info-tint);
  color: #0058c7;
}

.workspace-detail-header-button-danger:hover {
  background: var(--danger-tint);
  color: #a50011;
}
</style>

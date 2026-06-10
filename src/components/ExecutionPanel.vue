<template>
  <article class="panel-card execution-card">
    <header class="card-head">
      <div>
        <h3>立即执行</h3>
      </div>
      <Button class="app-primary-button" :disabled="!canRun || status === 'running'" @click="$emit('run')">
        <Play class="h-4 w-4" />
        <span>{{ status === 'running' ? '执行中...' : '开始执行' }}</span>
      </Button>
    </header>

    <div v-if="modelValue && project" class="execution-grid">
      <label class="field">
        <span>本次任务</span>
        <Select :model-value="modelValue.mode" @update:model-value="updateField('mode', $event)">
          <SelectTrigger class="w-full">
            <SelectValue placeholder="请选择任务类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in modeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </label>

      <label class="field">
        <span>部署环境</span>
        <Select :model-value="modelValue.environmentName" @update:model-value="updateField('environmentName', $event)">
          <SelectTrigger class="w-full">
            <SelectValue placeholder="请选择部署环境" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in props.environmentOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </label>

      <label v-if="modelValue.mode !== 'deploy'" class="field">
        <span>本次打包命令</span>
        <InputText
          :model-value="modelValue.overrideBuildCommand"
          class="w-full"
          @update:model-value="updateField('overrideBuildCommand', $event)"
        />
      </label>

      <label v-if="modelValue.mode !== 'deploy'" class="field">
        <span>本次产物目录</span>
        <InputText
          :model-value="modelValue.overrideOutputDir"
          class="w-full"
          @update:model-value="updateField('overrideOutputDir', $event)"
        />
      </label>

      <div v-if="modelValue.mode !== 'deploy'" class="toggle-field">
        <label class="field">
          <span>执行前检查</span>
          <div class="switch-row">
            <Switch :model-value="modelValue.runPrecheck" @update:model-value="updateBoolean('runPrecheck', Boolean($event))" />
            <small>{{ modelValue.runPrecheck ? '已启用' : '未启用' }}</small>
          </div>
        </label>
      </div>
    </div>

    <section v-if="summary.length > 0" class="summary-section">
      <header class="summary-head">
        <h4>本次任务摘要</h4>
      </header>
      <div class="summary-board">
        <div v-for="item in summary" :key="item.label" class="summary-item">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
    </section>

    <Alert v-if="statusMessage" :variant="resolveAlertVariant(statusSeverity)" :class="resolveAlertToneClass(statusSeverity)">
      <AlertDescription class="helper-message-copy">
        {{ statusMessage }}
      </AlertDescription>
    </Alert>
    <p v-if="!project || !modelValue" class="muted-paragraph">请先导入并选中项目。</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Play } from 'lucide-vue-next'
import Alert from '@/components/ui/alert/Alert.vue'
import AlertDescription from '@/components/ui/alert/AlertDescription.vue'
import { Button } from '@/components/ui/button'
import { Input as InputText } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Switch from '@/components/ui/switch/Switch.vue'

import { resolveAlertToneClass, resolveAlertVariant } from '@/lib/ui-status'
import type { ExecutionDraft, ExecutionStatus, ExecutionSummaryItem, ProjectRecord } from '@/types/task'

const props = defineProps<{
  canRun: boolean
  environmentOptions: Array<{ label: string; value: string }>
  modelValue: ExecutionDraft | null
  project: ProjectRecord | null
  status: ExecutionStatus
  statusMessage: string
  summary: ExecutionSummaryItem[]
}>()

const emit = defineEmits<{
  run: []
  'update:modelValue': [value: ExecutionDraft | null]
}>()

const modeOptions = [
  { label: '仅打包', value: 'build' },
  { label: '仅部署', value: 'deploy' },
  { label: '打包 + 部署', value: 'build-and-deploy' },
]

const statusSeverity = computed(() => {
  if (props.status === 'success') {
    return 'success'
  }

  if (props.status === 'error') {
    return 'error'
  }

  return 'secondary'
})

function updateField(field: keyof ExecutionDraft, value: string | undefined) {
  if (!props.modelValue) {
    return
  }

  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value ?? '',
  })
}

function updateBoolean(field: keyof ExecutionDraft, value: boolean | undefined) {
  if (!props.modelValue) {
    return
  }

  emit('update:modelValue', {
    ...props.modelValue,
    [field]: Boolean(value),
  })
}
</script>

<style scoped>
.execution-card {
  grid-column: 1 / -1;
  gap: 17px;
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.card-head h3 {
  margin: 0;
  color: #201d1d;
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0;
}

.execution-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 18px;
}

.field,
.toggle-field {
  display: grid;
  gap: 7px;
}

.field span {
  color: #201d1d;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0;
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
}

.switch-row small {
  color: #646262;
  font-size: 14px;
}

.summary-section {
  display: grid;
  gap: 12px;
}

.summary-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.summary-head h4 {
  margin: 0;
}

.summary-head h4 {
  color: #201d1d;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}

.summary-board {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;
}

.summary-item {
  display: grid;
  gap: 5px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #f8f7f7;
}

.summary-item span {
  color: #646262;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
}

.summary-item strong {
  color: #201d1d;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  word-break: break-word;
}

.muted-paragraph {
  margin: 0;
  color: #646262;
}

@media (max-width: 960px) {
  .card-head {
    flex-direction: column;
  }

  .summary-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .execution-grid,
  .summary-board {
    grid-template-columns: 1fr;
  }
}
</style>

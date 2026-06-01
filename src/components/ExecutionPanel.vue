<template>
  <article class="panel-card execution-card">
    <header class="card-head">
      <div>
        <h3>执行任务</h3>
        <p>先打通“仅打包”的主链路，后续再接上传部署和远端后置命令。</p>
      </div>
      <Button
        :label="status === 'running' ? '执行中...' : '开始执行'"
        icon="pi pi-play"
        :loading="status === 'running'"
        :disabled="!canRun || status === 'running'"
        @click="$emit('run')"
      />
    </header>

    <div v-if="modelValue && project" class="execution-grid">
      <label class="field">
        <span>执行模式</span>
        <Select
          :model-value="modelValue.mode"
          :options="modeOptions"
          option-label="label"
          option-value="value"
          fluid
          @update:model-value="updateField('mode', $event)"
        />
      </label>

      <label class="field">
        <span>目标环境</span>
        <Select
          :model-value="modelValue.environmentName"
          :options="environmentOptions"
          option-label="label"
          option-value="value"
          fluid
          @update:model-value="updateField('environmentName', $event)"
        />
      </label>

      <label class="field">
        <span>打包命令</span>
        <InputText
          :model-value="modelValue.overrideBuildCommand"
          fluid
          @update:model-value="updateField('overrideBuildCommand', $event)"
        />
      </label>

      <label class="field">
        <span>产物目录</span>
        <InputText
          :model-value="modelValue.overrideOutputDir"
          fluid
          @update:model-value="updateField('overrideOutputDir', $event)"
        />
      </label>

      <div class="toggle-field">
        <label class="field">
          <span>执行前置校验</span>
          <div class="switch-row">
            <ToggleSwitch :model-value="modelValue.runPrecheck" @update:model-value="updateBoolean('runPrecheck', $event)" />
            <small>{{ modelValue.runPrecheck ? '已启用' : '未启用' }}</small>
          </div>
        </label>
      </div>
    </div>

    <div v-if="summary.length > 0" class="summary-board">
      <div v-for="item in summary" :key="item.label" class="summary-item">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>

    <Message v-if="statusMessage" :severity="statusSeverity" :closable="false">
      {{ statusMessage }}
    </Message>
    <p v-if="!project || !modelValue" class="muted-paragraph">请先导入并选中项目。</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'

import type { ExecutionDraft, ExecutionStatus, ExecutionSummaryItem, ProjectRecord } from '@/types/task'

const props = defineProps<{
  canRun: boolean
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

const environmentOptions = [
  { label: 'dev', value: 'dev' },
  { label: 'test', value: 'test' },
  { label: 'prod', value: 'prod' },
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
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.card-head h3 {
  margin: 0;
}

.card-head p {
  margin: 8px 0 0;
  color: #6d7f7a;
}

.execution-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;
}

.field,
.toggle-field {
  display: grid;
  gap: 9px;
}

.field span {
  color: #2f433d;
  font-size: 13px;
  font-weight: 700;
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
}

.switch-row small {
  color: #6d7f7a;
}

.summary-board {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.summary-item {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid rgba(23, 61, 53, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.7);
}

.summary-item span {
  color: #6d7f7a;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.summary-item strong {
  color: #173d35;
  font-size: 14px;
}

.muted-paragraph {
  margin: 0;
  color: #6d7f7a;
}

@media (max-width: 960px) {
  .card-head {
    flex-direction: column;
  }

  .execution-grid,
  .summary-board {
    grid-template-columns: 1fr;
  }
}
</style>

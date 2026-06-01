<template>
  <article class="panel-card config-card">
    <header class="card-head">
      <div>
        <h3>项目配置</h3>
        <p>维护默认打包命令、产物目录和前置校验。</p>
      </div>
      <Button label="保存项目配置" icon="pi pi-save" :disabled="!project" @click="$emit('save-project')" />
    </header>

    <div v-if="project && modelValue" class="form-grid">
      <label class="field">
        <span>默认打包命令</span>
        <InputText
          :model-value="modelValue.defaultBuildCommand"
          fluid
          @update:model-value="updateField('defaultBuildCommand', $event)"
        />
      </label>

      <label class="field">
        <span>产物输出目录</span>
        <InputText
          :model-value="modelValue.defaultOutputDir"
          fluid
          @update:model-value="updateField('defaultOutputDir', $event)"
        />
      </label>

      <div class="toggle-field">
        <label class="field">
          <span>前置校验开关</span>
          <div class="switch-row">
            <ToggleSwitch
              :model-value="modelValue.defaultPrecheckEnabled"
              @update:model-value="updateBoolean('defaultPrecheckEnabled', $event)"
            />
            <small>{{ modelValue.defaultPrecheckEnabled ? '已启用' : '未启用' }}</small>
          </div>
        </label>
      </div>

      <label class="field">
        <span>前置校验命令</span>
        <InputText
          :model-value="modelValue.defaultPrecheckCommand"
          fluid
          @update:model-value="updateField('defaultPrecheckCommand', $event)"
        />
      </label>
    </div>

    <p v-else class="muted-paragraph">请先导入并选中项目。</p>
  </article>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import ToggleSwitch from 'primevue/toggleswitch'

import type { ProjectRecord } from '@/types/task'

const props = defineProps<{
  modelValue: ProjectRecord | null
  project: ProjectRecord | null
}>()

const emit = defineEmits<{
  'save-project': []
  'update:modelValue': [value: ProjectRecord | null]
}>()

function updateField(field: keyof ProjectRecord, value: string | undefined) {
  if (!props.modelValue) {
    return
  }

  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value ?? '',
  })
}

function updateBoolean(field: keyof ProjectRecord, value: boolean | undefined) {
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
.config-card {
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

.form-grid {
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

.muted-paragraph {
  margin: 0;
  color: #6d7f7a;
}

@media (max-width: 960px) {
  .card-head {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

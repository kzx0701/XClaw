<template>
  <article class="panel-card config-card">
    <header class="card-head">
      <div>
        <h3>项目环境</h3>
        <p>为 dev / test / prod 绑定默认服务器，并维护部署目录与后置命令。</p>
      </div>
      <Button
        label="保存环境配置"
        icon="pi pi-save"
        :disabled="!projectId"
        @click="$emit('save-environment')"
      />
    </header>

    <div v-if="projectId && modelValue" class="form-grid">
      <label class="field">
        <span>环境名称</span>
        <Select
          :model-value="modelValue.name"
          :options="environmentOptions"
          option-label="label"
          option-value="value"
          fluid
          @update:model-value="updateField('name', $event)"
        />
      </label>

      <label class="field">
        <span>默认服务器</span>
        <Select
          :model-value="modelValue.serverId"
          :options="serverOptions"
          option-label="label"
          option-value="value"
          placeholder="请选择服务器"
          fluid
          @update:model-value="updateField('serverId', $event)"
        />
      </label>

      <label class="field">
        <span>远端部署目录</span>
        <InputText
          :model-value="modelValue.remotePath"
          fluid
          @update:model-value="updateField('remotePath', $event)"
        />
      </label>

      <label class="field">
        <span>上传策略</span>
        <Select
          :model-value="modelValue.uploadStrategy"
          :options="uploadStrategyOptions"
          option-label="label"
          option-value="value"
          fluid
          @update:model-value="updateField('uploadStrategy', $event)"
        />
      </label>

      <label class="field">
        <span>部署后命令</span>
        <InputText
          :model-value="modelValue.postDeployCommand"
          fluid
          @update:model-value="updateField('postDeployCommand', $event)"
        />
      </label>
    </div>

    <div v-if="selectedServer" class="server-preview">
      <div class="server-preview-head">
        <h4>当前服务器摘要</h4>
        <i class="pi pi-server" aria-hidden="true" />
      </div>
      <p>主机：{{ selectedServer.host }}:{{ selectedServer.port }}</p>
      <p>用户名：{{ selectedServer.username }}</p>
      <p>认证方式：{{ selectedServer.authType === 'password' ? '密码认证' : '私钥认证' }}</p>
    </div>

    <Message v-else-if="projectId && modelValue" severity="secondary" :closable="false">
      当前环境还没有绑定默认服务器。
    </Message>
    <p v-else class="muted-paragraph">请先导入并选中项目。</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'

import type { EnvironmentFormValue, ServerRecord, UploadStrategy } from '@/types/task'

const environmentOptions = [
  { label: '开发环境 dev', value: 'dev' },
  { label: '测试环境 test', value: 'test' },
  { label: '生产环境 prod', value: 'prod' },
]

const uploadStrategyOptions: Array<{ label: string; value: UploadStrategy }> = [
  { label: '直接覆盖 overwrite', value: 'overwrite' },
  { label: '清空后上传 clear-and-upload', value: 'clear-and-upload' },
]

const props = defineProps<{
  modelValue: EnvironmentFormValue | null
  projectId: string | null
  servers: ServerRecord[]
}>()

const emit = defineEmits<{
  'save-environment': []
  'update:modelValue': [value: EnvironmentFormValue | null]
}>()

const selectedServer = computed(() =>
  props.modelValue ? props.servers.find((server) => server.id === props.modelValue?.serverId) ?? null : null,
)

const serverOptions = computed(() =>
  props.servers.map((server) => ({
    label: `${server.name} / ${server.host}:${server.port}`,
    value: server.id,
  })),
)

function updateField(field: keyof EnvironmentFormValue, value: string | UploadStrategy | undefined) {
  if (!props.modelValue) {
    return
  }

  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value ?? '',
  })
}
</script>

<style scoped>
.config-card {
  min-height: 320px;
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

.field {
  display: grid;
  gap: 9px;
}

.field span {
  color: #2f433d;
  font-size: 13px;
  font-weight: 700;
}

.server-preview {
  display: grid;
  gap: 8px;
  padding: 18px;
  border: 1px solid rgba(23, 61, 53, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
}

.server-preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.server-preview-head i {
  color: #6d7f7a;
}

.server-preview h4,
.server-preview p {
  margin: 0;
}

.server-preview h4 {
  color: #172725;
}

.server-preview p,
.muted-paragraph {
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

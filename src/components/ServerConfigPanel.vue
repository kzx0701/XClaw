<template>
  <article class="panel-card config-card">
    <header class="card-head">
      <div>
        <h3>服务器资产</h3>
        <p>集中维护服务器地址、用户名和认证方式，供多个项目环境复用。</p>
      </div>
      <div class="actions">
        <Button label="新建服务器" severity="secondary" outlined @click="$emit('create-server')" />
        <Button label="保存服务器" icon="pi pi-save" @click="$emit('save-server')" />
      </div>
    </header>

    <div class="form-grid">
      <label class="field">
        <span>服务器名称</span>
        <InputText :model-value="modelValue.name" fluid @update:model-value="updateText('name', $event)" />
      </label>

      <label class="field">
        <span>认证方式</span>
        <Select
          :model-value="modelValue.authType"
          :options="authTypeOptions"
          option-label="label"
          option-value="value"
          fluid
          @update:model-value="updateText('authType', $event)"
        />
      </label>

      <label class="field">
        <span>SSH 主机</span>
        <InputText :model-value="modelValue.host" fluid @update:model-value="updateText('host', $event)" />
      </label>

      <label class="field">
        <span>SSH 端口</span>
        <InputNumber
          :model-value="modelValue.port"
          :min="1"
          :max="65535"
          fluid
          @update:model-value="updateNumber('port', $event)"
        />
      </label>

      <label class="field">
        <span>用户名</span>
        <InputText :model-value="modelValue.username" fluid @update:model-value="updateText('username', $event)" />
      </label>

      <label v-if="modelValue.authType === 'password'" class="field">
        <span>密码</span>
        <Password
          :model-value="modelValue.password"
          :feedback="false"
          toggle-mask
          fluid
          @update:model-value="updateText('password', $event)"
        />
      </label>

      <label v-else class="field">
        <span>私钥路径</span>
        <InputText
          :model-value="modelValue.privateKeyPath"
          fluid
          @update:model-value="updateText('privateKeyPath', $event)"
        />
      </label>
    </div>

    <div v-if="servers.length > 0" class="server-list">
      <button
        v-for="server in servers"
        :key="server.id"
        class="server-item"
        type="button"
        :data-active="server.id === selectedServerId"
        @click="$emit('select-server', server.id)"
      >
        <div class="server-item-head">
          <strong>{{ server.name }}</strong>
          <i class="pi pi-server" aria-hidden="true" />
        </div>
        <span>{{ server.host }}:{{ server.port }}</span>
        <small>{{ server.username }}</small>
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Select from 'primevue/select'

import type { AuthType, ServerFormValue, ServerRecord } from '@/types/task'

const authTypeOptions: Array<{ label: string; value: AuthType }> = [
  { label: '密码认证', value: 'password' },
  { label: '私钥认证', value: 'privateKey' },
]

const props = defineProps<{
  modelValue: ServerFormValue
  selectedServerId: string | null
  servers: ServerRecord[]
}>()

const emit = defineEmits<{
  'create-server': []
  'save-server': []
  'select-server': [serverId: string]
  'update:modelValue': [value: ServerFormValue]
}>()

function updateText(field: keyof ServerFormValue, value: string | AuthType | undefined) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value ?? '',
  })
}

function updateNumber(field: keyof ServerFormValue, value: number | null | undefined) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value ?? 22,
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

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
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

.server-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.server-item {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border: 1px solid rgba(23, 61, 53, 0.08);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.78);
  color: #173d35;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease,
    background-color 160ms ease;
}

.server-item:hover {
  transform: translateY(-1px);
  border-color: rgba(23, 61, 53, 0.16);
}

.server-item[data-active='true'] {
  border-color: rgba(225, 143, 51, 0.36);
  box-shadow: inset 0 0 0 1px rgba(225, 143, 51, 0.18);
  background: linear-gradient(180deg, rgba(255, 247, 233, 0.98), rgba(255, 250, 242, 0.94));
}

.server-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.server-item-head i {
  color: #6d7f7a;
}

.server-item strong,
.server-item span,
.server-item small {
  margin: 0;
}

.server-item span,
.server-item small {
  color: #5d726b;
}

@media (max-width: 960px) {
  .card-head {
    flex-direction: column;
  }

  .actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .form-grid,
  .server-list {
    grid-template-columns: 1fr;
  }
}
</style>

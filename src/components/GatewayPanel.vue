<template>
  <article class="panel-card gateway-card">
    <header class="card-head">
      <div>
        <h3>OpenClaw 网关</h3>
        <p>连接本地 OpenClaw Gateway，后续的打包执行、部署指令和实时日志都依赖这条连接。</p>
      </div>
      <Tag :severity="connectionSeverity" rounded>{{ connectionStatusLabel }}</Tag>
    </header>

    <div class="gateway-grid">
      <div class="meta-row">
        <Tag severity="contrast" rounded>auth: {{ authMode || 'unknown' }}</Tag>
        <Tag severity="contrast" rounded>
          来源: {{ gatewayConfigSource === 'local-openclaw' ? '本机 OpenClaw' : '应用内保存' }}
        </Tag>
        <Tag :severity="gatewayUrl.trim() ? 'success' : 'danger'" rounded>
          地址{{ gatewayUrl.trim() ? '已填写' : '未填写' }}
        </Tag>
        <Tag :severity="gatewayToken.trim() ? 'success' : 'danger'" rounded>
          Token{{ gatewayToken.trim() ? '已填写' : '未填写' }}
        </Tag>
      </div>

      <section class="guide-card">
        <div class="guide-head">
          <h4>首次接入说明</h4>
          <i class="pi pi-compass" aria-hidden="true" />
        </div>
        <ol class="guide-list">
          <li>先在本机启动 OpenClaw 网关，确保它处于运行状态。</li>
          <li>填写网关地址，默认一般是 <code>ws://127.0.0.1:18789</code>。</li>
          <li>如果当前网关启用了 <code>token</code> 鉴权，需要填入对应的 Gateway Token 才能完成握手。</li>
        </ol>
        <p class="guide-note">
          当前这版通过本地桌面客户端直连 OpenClaw Gateway，不走官方浏览器 Control UI 的设备身份流程；连接参数仍由用户自行保存，避免把产品逻辑绑定在某一台开发机器上。
        </p>
      </section>

      <section class="guide-card subtle-card">
        <div class="guide-head">
          <h4>Gateway Token 是什么</h4>
          <i class="pi pi-key" aria-hidden="true" />
        </div>
        <p>
          它是 OpenClaw 网关的访问令牌。只有在网关配置为 <code>token</code> 鉴权时才需要填写；没填时，WebSocket
          虽然可能建立成功，但认证握手会失败，随后连接会被网关自动关闭。
        </p>
        <p class="guide-note">
          对普通用户来说，后续更合理的体验应该是接入向导或自动检测。当前 MVP 先保留手动填写方式，并按桌面客户端模式连接网关。
        </p>
      </section>

      <label class="field">
        <span>网关地址</span>
        <InputText
          :model-value="gatewayUrl"
          placeholder="ws://127.0.0.1:18789"
          fluid
          @update:model-value="$emit('update:gateway-url', $event ?? '')"
        />
        <small class="field-help">本地默认端口通常是 <code>18789</code>。如果你改过网关端口，这里需要同步修改。</small>
      </label>

      <label class="field">
        <span>Gateway Token</span>
        <div class="token-row">
          <InputText
            :model-value="gatewayToken"
            :type="showGatewayToken ? 'text' : 'password'"
            placeholder="输入 OpenClaw Gateway Token"
            fluid
            @update:model-value="$emit('update:gateway-token', $event ?? '')"
          />
          <Button
            icon="pi pi-copy"
            severity="secondary"
            outlined
            :disabled="!gatewayToken.trim()"
            aria-label="复制 Gateway Token"
            @click="copyGatewayToken"
          />
          <Button
            :icon="showGatewayToken ? 'pi pi-eye-slash' : 'pi pi-eye'"
            severity="secondary"
            text
            rounded
            :aria-label="showGatewayToken ? '隐藏 Gateway Token' : '显示 Gateway Token'"
            @click="showGatewayToken = !showGatewayToken"
          />
        </div>
        <small class="field-help">
          当前鉴权模式是 <code>{{ authMode }}</code>。在这个模式下，Token 不正确或为空都会导致握手失败。
        </small>
      </label>

      <div class="actions">
        <Button
          label="连接网关"
          icon="pi pi-link"
          :disabled="connectionStatus === 'connected'"
          @click="$emit('connect')"
        />
        <Button
          label="导入本机配置"
          icon="pi pi-download"
          severity="secondary"
          outlined
          :loading="isImportingLocalConfig"
          @click="$emit('import-local-config')"
        />
        <Button
          :label="isProbing ? '检测中...' : '检测网关'"
          icon="pi pi-search"
          severity="secondary"
          outlined
          :loading="isProbing"
          @click="$emit('probe')"
        />
        <Button
          label="保存配置"
          icon="pi pi-save"
          severity="secondary"
          outlined
          :loading="isSavingConfig"
          @click="$emit('save-config')"
        />
        <Button
          label="断开连接"
          icon="pi pi-times-circle"
          severity="secondary"
          text
          :disabled="connectionStatus !== 'connected'"
          @click="$emit('disconnect')"
        />
        <Button
          label="发送测试消息"
          icon="pi pi-send"
          severity="secondary"
          text
          :disabled="connectionStatus !== 'connected'"
          @click="$emit('send-ping')"
        />
      </div>

      <Message v-if="probeSummary" :severity="probeSeverity" :closable="false">
        <strong>检测结果：</strong> {{ probeSummary }}
      </Message>

      <section class="guide-card subtle-card">
        <div class="guide-head">
          <h4>连接失败时先看这里</h4>
          <i class="pi pi-info-circle" aria-hidden="true" />
        </div>
        <ul class="tips-list">
          <li>地址填对了，但一会自动关闭：通常是 Token 缺失、错误，或者当前账号没有握手权限。</li>
          <li>完全连不上：通常是 OpenClaw 网关没有启动，或者端口不是 <code>18789</code>。</li>
          <li>日志里如果只看到 <code>connect.challenge</code>，没有看到“握手完成”，说明认证阶段还没通过。</li>
        </ul>
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Tag from 'primevue/tag'

import { showToast } from '@/services/ui/toast'

const showGatewayToken = ref(false)

const props = defineProps<{
  authMode: string
  connectionStatus: 'disconnected' | 'connecting' | 'connected'
  connectionStatusLabel: string
  gatewayConfigSource: 'manual' | 'local-openclaw'
  gatewayToken: string
  gatewayUrl: string
  isImportingLocalConfig: boolean
  isProbing: boolean
  isSavingConfig: boolean
  probeStatus: 'idle' | 'success' | 'warn' | 'error'
  probeSummary: string
}>()

const connectionSeverity = computed(() => {
  if (props.connectionStatus === 'connected') {
    return 'success'
  }

  if (props.connectionStatus === 'connecting') {
    return 'warn'
  }

  return 'danger'
})

const probeSeverity = computed(() => {
  if (props.probeStatus === 'success') {
    return 'success'
  }

  if (props.probeStatus === 'warn') {
    return 'warn'
  }

  return 'error'
})

async function copyGatewayToken() {
  if (!props.gatewayToken.trim()) {
    return
  }

  try {
    await navigator.clipboard.writeText(props.gatewayToken)
    showToast('Gateway Token 已复制', 'success')
  } catch {
    showToast('复制 Gateway Token 失败', 'error')
  }
}

defineEmits<{
  connect: []
  disconnect: []
  'import-local-config': []
  probe: []
  'save-config': []
  'send-ping': []
  'update:gateway-token': [value: string]
  'update:gateway-url': [value: string]
}>()
</script>

<style scoped>
.gateway-card {
  grid-column: 1 / -1;
  min-height: auto;
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.card-head h3 {
  margin: 0;
}

.card-head p {
  margin: 8px 0 0;
  color: #6d7f7a;
}

.gateway-grid {
  display: grid;
  gap: 16px;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.guide-card {
  display: grid;
  gap: 10px;
  padding: 18px;
  border: 1px solid rgba(23, 61, 53, 0.08);
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(225, 143, 51, 0.08), transparent 45%),
    rgba(255, 255, 255, 0.72);
}

.subtle-card {
  background: rgba(248, 245, 238, 0.9);
}

.guide-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.guide-head i {
  color: #6d7f7a;
}

.guide-card h4 {
  margin: 0;
  color: #172725;
  font-size: 15px;
}

.guide-card p {
  margin: 0;
  color: #435853;
  line-height: 1.7;
}

.guide-list,
.tips-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 18px;
  color: #2f433d;
  line-height: 1.7;
}

.guide-note {
  color: #637670;
  font-size: 13px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  color: #2f433d;
  font-size: 13px;
  font-weight: 700;
}

.field-help {
  color: #5d726b;
  font-size: 12px;
  line-height: 1.6;
}

.field-help code,
.guide-note code,
.tips-list code,
.guide-list code {
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(23, 61, 53, 0.08);
  color: #173d35;
  font-size: 12px;
}

.token-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: center;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 960px) {
  .card-head {
    flex-direction: column;
  }

  .token-row {
    grid-template-columns: 1fr auto auto;
  }
}
</style>

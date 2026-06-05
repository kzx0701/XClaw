<template>
  <article class="panel-card gateway-card">
    <header class="card-head">
      <div>
        <h3>OpenClaw 网关</h3>
        <p>连接本地 OpenClaw Gateway，用于后续 AI 辅助、日志分析和智能建议；部署主流程已独立于 Gateway。</p>
      </div>
      <Badge
        :variant="resolveBadgeVariant(connectionSeverity)"
        :class="['rounded-full', resolveBadgeToneClass(connectionSeverity)]"
      >
        {{ connectionStatusLabel }}
      </Badge>
    </header>

    <div class="gateway-grid">
      <div class="meta-row">
        <Badge :variant="resolveBadgeVariant('contrast')" :class="['rounded-full', resolveBadgeToneClass('contrast')]">
          auth: {{ authMode || 'unknown' }}
        </Badge>
        <Badge :variant="resolveBadgeVariant('contrast')" :class="['rounded-full', resolveBadgeToneClass('contrast')]">
          来源: {{ gatewayConfigSource === 'local-openclaw' ? '本机 OpenClaw' : '应用内保存' }}
        </Badge>
        <Badge
          :variant="resolveBadgeVariant(gatewayUrl.trim() ? 'success' : 'danger')"
          :class="['rounded-full', resolveBadgeToneClass(gatewayUrl.trim() ? 'success' : 'danger')]"
        >
          地址{{ gatewayUrl.trim() ? '已填写' : '未填写' }}
        </Badge>
        <Badge
          :variant="resolveBadgeVariant(gatewayToken.trim() ? 'success' : 'danger')"
          :class="['rounded-full', resolveBadgeToneClass(gatewayToken.trim() ? 'success' : 'danger')]"
        >
          Token{{ gatewayToken.trim() ? '已填写' : '未填写' }}
        </Badge>
      </div>

      <section class="guide-card">
        <div class="guide-head">
          <h4>首次接入说明</h4>
          <Compass class="h-4 w-4" aria-hidden="true" />
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
          <KeyRound class="h-4 w-4" aria-hidden="true" />
        </div>
        <p>
          它是 OpenClaw 网关的访问令牌。只有在网关配置里启用 <code>token</code> 鉴权时才需要填写；没填时，WebSocket
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
          class="w-full"
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
            class="w-full"
            @update:model-value="$emit('update:gateway-token', $event ?? '')"
          />
          <Button
            variant="outline"
            :disabled="!gatewayToken.trim()"
            aria-label="复制 Gateway Token"
            @click="copyGatewayToken"
          >
            <Copy class="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            :aria-label="showGatewayToken ? '隐藏 Gateway Token' : '显示 Gateway Token'"
            @click="showGatewayToken = !showGatewayToken"
          >
            <EyeOff v-if="showGatewayToken" class="h-4 w-4" />
            <Eye v-else class="h-4 w-4" />
          </Button>
        </div>
        <small class="field-help">
          当前鉴权模式是 <code>{{ authMode }}</code>。在这个模式下，Token 不正确或为空都会导致握手失败。
        </small>
      </label>

      <div class="actions">
        <Button class="app-primary-button" :disabled="connectionStatus === 'connected'" @click="$emit('connect')">
          <PlugZap class="h-4 w-4" />
          <span>连接网关</span>
        </Button>
        <Button variant="outline" :disabled="isImportingLocalConfig" @click="$emit('import-local-config')">
          <Download class="h-4 w-4" />
          <span>{{ isImportingLocalConfig ? '导入中...' : '导入本机配置' }}</span>
        </Button>
        <Button variant="outline" :disabled="isProbing" @click="$emit('probe')">
          <Search class="h-4 w-4" />
          <span>{{ isProbing ? '检测中...' : '检测网关' }}</span>
        </Button>
        <Button variant="outline" :disabled="isSavingConfig" @click="$emit('save-config')">
          <Save class="h-4 w-4" />
          <span>{{ isSavingConfig ? '保存中...' : '保存配置' }}</span>
        </Button>
        <Button variant="ghost" :disabled="connectionStatus !== 'connected'" @click="$emit('disconnect')">
          <Unplug class="h-4 w-4" />
          <span>断开连接</span>
        </Button>
        <Button variant="ghost" :disabled="connectionStatus !== 'connected'" @click="$emit('send-ping')">
          <Send class="h-4 w-4" />
          <span>发送测试消息</span>
        </Button>
      </div>

      <Alert
        v-if="probeSummary"
        :variant="resolveAlertVariant(probeSeverity)"
        :class="resolveAlertToneClass(probeSeverity)"
      >
        <strong>检测结果：</strong> {{ probeSummary }}
      </Alert>

      <section class="guide-card subtle-card">
        <div class="guide-head">
          <h4>连接失败时先看这里</h4>
          <Info class="h-4 w-4" aria-hidden="true" />
        </div>
        <ul class="tips-list">
          <li>地址填对了，但一会自动关闭：通常是 Token 缺失、错误，或者当前账户没有握手权限。</li>
          <li>完全连不上：通常是 OpenClaw 网关没有启动，或者端口不是 <code>18789</code>。</li>
          <li>日志里如果只看到 <code>connect.challenge</code>，没有看到“握手完成”，说明认证阶段还没通过。</li>
        </ul>
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Compass,
  Copy,
  Download,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  PlugZap,
  Save,
  Search,
  Send,
  Unplug,
} from 'lucide-vue-next'
import Alert from '@/components/ui/alert/Alert.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import { Button } from '@/components/ui/button'
import { Input as InputText } from '@/components/ui/input'

import { resolveAlertToneClass, resolveAlertVariant, resolveBadgeToneClass, resolveBadgeVariant } from '@/lib/ui-status'
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
  color: #8b8b9a;
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
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  background: #252538;
}

.subtle-card {
  background: #252538;
}

.guide-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.guide-card h4 {
  margin: 0;
  color: #e0e0e0;
  font-size: 15px;
}

.guide-card p {
  margin: 0;
  color: #c8c8d8;
  line-height: 1.7;
}

.guide-list,
.tips-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 18px;
  color: #c8c8d8;
  line-height: 1.7;
}

.guide-note {
  color: #8b8b9a;
  font-size: 13px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  color: #c8c8d8;
  font-size: 13px;
  font-weight: 600;
}

.field-help {
  color: #8b8b9a;
  font-size: 12px;
  line-height: 1.6;
}

.field-help code,
.guide-note code,
.tips-list code,
.guide-list code {
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(74, 127, 193, 0.12);
  color: #7aa3d9;
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

<template>
  <section class="panel-grid">
    <article class="panel-card log-card">
      <header class="card-head">
        <div>
          <h3>运行日志</h3>
          <p class="section-note">主要记录打包、部署、网关连接与检测等执行过程中的实时日志。</p>
        </div>
        <div class="log-head-actions">
          <Badge :variant="resolveBadgeVariant('contrast')" :class="['rounded-full', 'log-stage-badge', resolveBadgeToneClass('contrast')]">
            {{ gatewayStage }}
          </Badge>
          <Button
            v-if="gatewayLogs.length > 0"
            variant="ghost"
            size="icon"
            class="log-action-btn"
            title="清空日志"
            aria-label="清空日志"
            @click="$emit('clear-logs')"
          >
            <Trash2 class="h-3.5 w-3.5" />
          </Button>
          <Button
            v-if="gatewayLogs.length > 0"
            variant="ghost"
            size="icon"
            class="log-action-btn"
            title="复制日志"
            aria-label="复制日志"
            @click="$emit('copy-logs')"
          >
            <Copy class="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>
      <div class="log-stream">
        <p v-for="entry in gatewayLogs" :key="entry.id" :data-level="entry.level">
          [{{ entry.timestamp.slice(11, 19) }}] {{ entry.message }}
        </p>
        <p v-if="gatewayLogs.length === 0" class="muted">连接网关后，这里会展示实时消息和日志。</p>
      </div>
    </article>

    <article class="panel-card">
      <header class="card-head">
        <h3>当前状态</h3>
        <Badge :variant="resolveBadgeVariant('contrast')" :class="['rounded-full', resolveBadgeToneClass('contrast')]">
          {{ connectionLabel }}
        </Badge>
      </header>
      <ul class="task-list">
        <li>项目导入：已完成</li>
        <li>环境配置：已完成</li>
        <li>网关连接：{{ connectionLabel }}</li>
        <li>当前阶段：{{ gatewayStage }}</li>
      </ul>
      <p class="muted-paragraph">{{ gatewayStageDescription }}</p>
    </article>

    <TaskHistoryPanel
      :records="taskHistoryRecords"
      :selected-record-id="selectedTaskHistoryId"
      @select-record="$emit('select-history-record', $event)"
    />

    <GatewayPanel
      :auth-mode="gatewayAuthMode"
      :connection-status="connectionStatus"
      :connection-status-label="gatewayConnectionLabel"
      :gateway-config-source="gatewayConfigSource"
      :gateway-token="gatewayToken"
      :gateway-url="gatewayUrl"
      :is-importing-local-config="isImportingLocalConfig"
      :is-probing="isProbingGateway"
      :is-saving-config="isSavingGatewayConfig"
      :probe-status="gatewayProbeStatus"
      :probe-summary="gatewayProbeSummary"
      @connect="$emit('connect-gateway')"
      @disconnect="$emit('disconnect-gateway')"
      @import-local-config="$emit('import-local-gateway-config')"
      @probe="$emit('probe-gateway')"
      @save-config="$emit('save-gateway-config')"
      @send-ping="$emit('send-gateway-ping')"
      @update:gateway-token="$emit('update:gateway-token', $event)"
      @update:gateway-url="$emit('update:gateway-url', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import { Copy, Trash2 } from "lucide-vue-next"

import Badge from "@/components/ui/badge/Badge.vue"
import Button from "@/components/ui/button/Button.vue"
import GatewayPanel from "@/components/GatewayPanel.vue"
import TaskHistoryPanel from "@/components/TaskHistoryPanel.vue"
import { resolveBadgeToneClass, resolveBadgeVariant } from "@/lib/ui-status"
import type { GatewayLogEntry } from "@/types/gateway"
import type { TaskHistoryRecord } from "@/types/task"

defineProps<{
  connectionLabel: string
  connectionStatus: "connected" | "connecting" | "disconnected"
  gatewayAuthMode: string
  gatewayConfigSource: "manual" | "local-openclaw"
  gatewayConnectionLabel: string
  gatewayLogs: GatewayLogEntry[]
  gatewayProbeStatus: "idle" | "success" | "warn" | "error"
  gatewayProbeSummary: string
  gatewayStage: string
  gatewayStageDescription: string
  gatewayToken: string
  gatewayUrl: string
  isImportingLocalConfig: boolean
  isProbingGateway: boolean
  isSavingGatewayConfig: boolean
  selectedTaskHistoryId: string | null
  taskHistoryRecords: TaskHistoryRecord[]
}>()

defineEmits<{
  "clear-logs": []
  "connect-gateway": []
  "copy-logs": []
  "disconnect-gateway": []
  "import-local-gateway-config": []
  "probe-gateway": []
  "save-gateway-config": []
  "select-history-record": [recordId: string]
  "send-gateway-ping": []
  "update:gateway-token": [value: string]
  "update:gateway-url": [value: string]
}>()
</script>

<style scoped>
.panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  min-width: 0;
}

.panel-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  min-height: 240px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  background: #2a2a3c;
  transition:
    border-color 160ms ease,
    background-color 160ms ease;
}

.panel-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
}

.log-card {
  grid-column: 1 / -1;
  min-width: 0;
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.card-head h3 {
  margin: 0;
  color: #e0e0e0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.section-note {
  margin: 8px 0 0;
  color: #8b8b9a;
  font-size: 12px;
  line-height: 1.7;
}

.task-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: #c8c8d8;
}

.log-stream {
  display: grid;
  gap: 10px;
  padding: 18px 18px 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  background: #252538;
  color: #a0a0b0;
  font-family: "SFMono-Regular", "Menlo", monospace;
  font-size: 12px;
  min-width: 0;
  max-height: 480px;
  overflow-y: auto;
  overflow-x: hidden;
}

.log-stream p {
  margin: 0;
  min-width: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.55;
}

.log-stream p[data-level="success"] {
  color: #7ec88a;
}

.log-stream p[data-level="warn"] {
  color: #d4b86a;
}

.log-stream p[data-level="error"] {
  color: #e88a8a;
}

.log-stage-badge {
  background: rgba(255, 255, 255, 0.04);
}

.log-head-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}

.log-action-btn {
  color: #6b6b7a;
  width: 28px;
  height: 28px;
}

.log-action-btn:hover {
  color: #c8c8d8;
  background: rgba(255, 255, 255, 0.06);
}

.muted {
  color: #8b8b9a;
}

.muted-paragraph {
  margin: 0;
  color: #8b8b9a;
  font-size: 12px;
  line-height: 1.7;
}

@media (max-width: 960px) {
  .panel-grid {
    grid-template-columns: 1fr;
  }
}
</style>

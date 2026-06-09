<template>
  <Dialog
    :visible="visible"
    modal
    :closable="true"
    :dismissable-mask="true"
    :close-on-escape="true"
    class="quick-deploy-dialog"
    :style="{ width: 'min(560px, calc(100vw - 32px))' }"
    @hide="$emit('hide')"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="quick-deploy-dialog-header">
        <div>
          <strong>一键部署</strong>
          <p>{{ dialogTitle }}</p>
        </div>
      </div>
    </template>

    <div class="quick-deploy-dialog-body">
      <div class="quick-deploy-context-bar">
        <strong>{{ project?.name || "--" }}</strong>
        <span class="quick-deploy-project-type">{{ project?.projectType || "unknown" }}</span>
      </div>

      <div class="quick-deploy-option-list">
        <article
          v-for="option in options"
          :key="option.environment.name"
          class="quick-deploy-option-card"
          :data-state="selectedEnvironmentName === option.environment.name ? stage : 'idle'"
        >
          <div class="quick-deploy-option-main">
            <span class="quick-deploy-option-icon">
              <Server class="h-4 w-4" aria-hidden="true" />
            </span>
            <div class="quick-deploy-option-copy">
              <div class="quick-deploy-option-head">
                <strong>{{ formatEnvironmentLabel(option.environment.name) }}</strong>
              </div>
              <p>{{ option.server ? `${option.server.name} · ${option.server.host}:${option.server.port}` : "未绑定服务器" }}</p>
            </div>
          </div>
          <Button
            class="quick-deploy-option-action"
            :loading="stage === 'running' && selectedEnvironmentName === option.environment.name"
            :disabled="!option.server || !option.environment.remotePath.trim() || stage === 'running'"
            size="sm"
            variant="secondary"
            @click="$emit('start', option)"
          >
            <Send v-if="!(stage === 'running' && selectedEnvironmentName === option.environment.name)" class="h-4 w-4" />
            <span>
              {{ stage === "running" && selectedEnvironmentName === option.environment.name ? "部署中" : "部署" }}
            </span>
          </Button>
        </article>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { Send, Server } from "lucide-vue-next"

import Button from "@/components/ui/button/Button.vue"
import Dialog from "@/components/ui/dialog/Dialog.vue"

import { formatEnvironmentLabel } from "./formatters"
import type { QuickDeployEnvironmentOption } from "./types"

defineProps<{
  dialogTitle: string
  options: QuickDeployEnvironmentOption[]
  project: QuickDeployEnvironmentOption["project"] | null
  selectedEnvironmentName: string | null
  stage: "confirm" | "running" | "success" | "error"
  visible: boolean
}>()

defineEmits<{
  hide: []
  start: [option: QuickDeployEnvironmentOption]
  "update:visible": [value: boolean]
}>()
</script>

<style scoped>
.quick-deploy-dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.quick-deploy-dialog-header strong {
  display: block;
  color: #201d1d;
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0;
}

.quick-deploy-dialog-header p {
  margin: 6px 0 0;
  color: #646262;
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: 0;
}

.quick-deploy-dialog-body {
  display: grid;
  gap: 14px;
}

.quick-deploy-context-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 0 2px 2px;
}

.quick-deploy-context-bar strong {
  color: #201d1d;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0;
}

.quick-deploy-project-type {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--info-tint);
  color: #007aff;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0;
}

.quick-deploy-option-list {
  display: grid;
  gap: 10px;
}

.quick-deploy-option-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #fdfcfc;
}

.quick-deploy-option-card[data-state="running"] {
  background: #f8f7f7;
}

.quick-deploy-option-card[data-state="success"] {
  background: var(--success-tint);
}

.quick-deploy-option-card[data-state="error"] {
  background: var(--danger-tint);
}

.quick-deploy-option-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.quick-deploy-option-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.quick-deploy-option-copy strong {
  color: #201d1d;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0;
}

.quick-deploy-option-copy p {
  color: #646262;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.quick-deploy-option-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.quick-deploy-option-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #f1eeee;
  color: #201d1d;
  flex: 0 0 auto;
}

.quick-deploy-option-action {
  min-width: 68px;
  height: 30px;
  padding-inline: 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #f8f7f7;
  color: #201d1d;
  font-size: 14px;
}

.quick-deploy-option-action:hover:not(:disabled) {
  background: #f1eeee;
  color: #201d1d;
}

.quick-deploy-option-action :deep(svg) {
  width: 13px;
  height: 13px;
}
</style>

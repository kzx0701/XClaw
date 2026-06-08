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
  color: #e0e0e0;
  font-size: 16px;
  line-height: 1.2;
}

.quick-deploy-dialog-header p {
  margin: 6px 0 0;
  color: #6b6b7a;
  font-size: 12px;
  line-height: 1.5;
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
  color: #e0e0e0;
  font-size: 15px;
  line-height: 1.3;
}

.quick-deploy-project-type {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 6px;
  background: rgba(74, 127, 193, 0.12);
  color: #7aa3d9;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
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
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  background: #2a2a3c;
}

.quick-deploy-option-card[data-state="running"] {
  border-color: rgba(74, 127, 193, 0.3);
  background: #32324a;
}

.quick-deploy-option-card[data-state="success"] {
  border-color: rgba(92, 184, 92, 0.25);
}

.quick-deploy-option-card[data-state="error"] {
  border-color: rgba(229, 92, 92, 0.25);
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
  color: #e0e0e0;
  font-size: 14px;
  line-height: 1.35;
}

.quick-deploy-option-copy p {
  color: #8b8b9a;
  font-size: 12px;
  line-height: 1.6;
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
  border-radius: 6px;
  background: rgba(74, 127, 193, 0.12);
  color: #7aa3d9;
  flex: 0 0 auto;
}

.quick-deploy-option-action {
  min-width: 68px;
  height: 30px;
  padding-inline: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #32324a;
  color: #c8c8d8;
  box-shadow: none;
  font-size: 12px;
}

.quick-deploy-option-action:hover:not(:disabled) {
  background: #3a3a52;
  border-color: rgba(255, 255, 255, 0.12);
  color: #e0e0e0;
}

.quick-deploy-option-action :deep(svg) {
  width: 13px;
  height: 13px;
}
</style>

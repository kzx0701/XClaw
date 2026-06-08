<template>
  <section class="panel-grid">
    <div class="project-detail-workspace">
      <WorkspaceDetailHeader
        v-if="projectId"
        :title="project?.name || '项目'"
        back-label="返回项目列表"
        delete-label="删除项目"
        @back="$emit('back-to-project-list')"
        @delete="projectId && $emit('delete-project', projectId)"
      />

      <Alert v-if="importError" :variant="resolveAlertVariant('error')" :class="resolveAlertToneClass('error')">
        {{ importError }}
      </Alert>

      <div class="project-insight-row">
        <div class="insight-panel insight-panel-wide">
          <ProjectOverviewCard :project="project" />
        </div>

        <div class="insight-panel">
          <article class="panel-card script-card project-script-card">
            <header class="card-head">
              <div>
                <h3>脚本摘要</h3>
                <p class="section-note">展示 `package.json` 中的脚本命令，便于快速核对当前项目的执行入口。</p>
              </div>
            </header>
            <ul v-if="project" class="task-list script-list">
              <li v-for="(command, name) in project.scripts" :key="name">
                <div class="task-item script-item">
                  <span class="script-name">{{ name }}</span>
                  <code>{{ command }}</code>
                </div>
              </li>
            </ul>
            <p v-else class="muted-paragraph">导入项目后，这里会展示 `package.json` 中的 scripts。</p>
          </article>
        </div>
      </div>

      <div class="project-detail-stack">
        <ExecutionPanel
          :model-value="executionDraft"
          :can-run="canRunExecution"
          :environment-options="executionEnvironmentOptions"
          :project="project"
          :status="executionStatus"
          :status-message="executionStatusMessage"
          :summary="executionSummary"
          @run="$emit('run-execution')"
          @update:model-value="$emit('update:execution-draft', $event)"
        />

        <ProjectConfigPanel
          :model-value="projectDraft"
          :ai-recommendation="projectAiRecommendation"
          :is-ai-analyzing="isAiAnalyzingProject"
          :project="project"
          @apply-ai-recommendation="$emit('apply-project-ai-recommendation')"
          @run-ai-analysis="$emit('run-project-ai-analysis')"
          @save-project="$emit('save-project-config')"
          @update:model-value="$emit('update:project-draft', $event)"
        />

        <EnvironmentConfigPanel
          :can-delete="environmentEditorMode === 'edit' && Boolean(environmentDraft?.name && !isPresetEnvironment)"
          :editor-draft="environmentDraft"
          :editor-mode="environmentEditorMode"
          :editor-visible="isEnvironmentEditorVisible"
          :environment-cards="environmentCards"
          :is-checking-environment="isCheckingEnvironment"
          :is-preset-environment="isPresetEnvironment"
          :project-id="projectId"
          :servers="servers"
          @check-environment="$emit('check-environment')"
          @close-editor="$emit('close-environment-editor')"
          @create-environment="$emit('create-environment')"
          @delete-environment="$emit('confirm-delete-environment')"
          @delete-environment-card="$emit('confirm-delete-environment-by-name', $event)"
          @reset-environment="$emit('reset-environment-draft')"
          @save-environment="$emit('save-environment')"
          @select-environment="$emit('select-environment', $event)"
          @update:editor-draft="$emit('update:environment-draft', $event)"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import Alert from "@/components/ui/alert/Alert.vue"
import EnvironmentConfigPanel from "@/components/EnvironmentConfigPanel.vue"
import ExecutionPanel from "@/components/ExecutionPanel.vue"
import ProjectConfigPanel from "@/components/ProjectConfigPanel.vue"
import ProjectOverviewCard from "@/components/ProjectOverviewCard.vue"
import WorkspaceDetailHeader from "@/components/workspace-header/WorkspaceDetailHeader.vue"
import { resolveAlertToneClass, resolveAlertVariant } from "@/lib/ui-status"
import type {
  EnvironmentFormValue,
  ExecutionDraft,
  ExecutionStatus,
  ExecutionSummaryItem,
  ProjectAiRecommendation,
  ProjectRecord,
  ServerRecord,
} from "@/types/task"

import type { WorkspaceEnvironmentCard } from "./types"

defineProps<{
  canRunExecution: boolean
  environmentCards: WorkspaceEnvironmentCard[]
  environmentDraft: EnvironmentFormValue | null
  environmentEditorMode: "create" | "edit"
  executionDraft: ExecutionDraft | null
  executionEnvironmentOptions: Array<{ label: string; value: string }>
  executionStatus: ExecutionStatus
  executionStatusMessage: string
  executionSummary: ExecutionSummaryItem[]
  importError: string
  isAiAnalyzingProject: boolean
  isCheckingEnvironment: boolean
  isEnvironmentEditorVisible: boolean
  isPresetEnvironment: boolean
  project: ProjectRecord | null
  projectAiRecommendation: ProjectAiRecommendation | null
  projectDraft: ProjectRecord | null
  projectId: string | null
  servers: ServerRecord[]
}>()

defineEmits<{
  "apply-project-ai-recommendation": []
  "back-to-project-list": []
  "check-environment": []
  "close-environment-editor": []
  "confirm-delete-environment": []
  "delete-project": [projectId: string]
  "confirm-delete-environment-by-name": [name: string]
  "create-environment": []
  "reset-environment-draft": []
  "run-execution": []
  "run-project-ai-analysis": []
  "save-environment": []
  "save-project-config": []
  "select-environment": [name: string]
  "update:environment-draft": [value: EnvironmentFormValue | null]
  "update:execution-draft": [value: ExecutionDraft | null]
  "update:project-draft": [value: ProjectRecord | null]
}>()
</script>

<style scoped>
.project-detail-workspace {
  display: grid;
  gap: 20px;
  min-width: 0;
  grid-column: 1 / -1;
}

.project-detail-stack {
  display: grid;
  gap: 20px;
}

.project-insight-row {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.75fr);
  gap: 20px;
  align-items: stretch;
}

.insight-panel {
  min-width: 0;
  display: flex;
}

.project-script-card {
  flex: 1;
  height: 100%;
  min-height: 420px;
  max-height: 420px;
  overflow: hidden;
}

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

.panel-card:focus-within {
  border-color: rgba(74, 127, 193, 0.25);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
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

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;
}

.task-item code {
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(74, 127, 193, 0.1);
  color: #7aa3d9;
  font-family: "SFMono-Regular", "Menlo", monospace;
  font-size: 11px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.script-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  gap: 10px;
  padding-right: 4px;
}

.script-item {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  align-items: start;
  gap: 10px 12px;
}

.script-name {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 10px;
  border-radius: 6px;
  background: rgba(74, 127, 193, 0.12);
  color: #7aa3d9;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}

.script-item code {
  flex: 1;
  display: block;
  min-width: 0;
  color: #c8c8d8;
  font-size: 13px;
  line-height: 1.65;
  white-space: normal;
  word-break: break-word;
}

.muted-paragraph {
  margin: 0;
  color: #8b8b9a;
  font-size: 12px;
  line-height: 1.7;
}

@media (max-width: 960px) {
  .panel-grid,
  .project-insight-row {
    grid-template-columns: 1fr;
  }
}
</style>

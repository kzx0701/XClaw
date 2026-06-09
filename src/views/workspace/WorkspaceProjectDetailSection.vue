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

      <ProjectOverviewCard :project="project" />

      <div v-if="isContentReady" class="project-detail-stack">
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
      </div>

      <div v-else class="project-detail-skeleton" aria-hidden="true">
        <div class="skeleton-card" />
        <div class="skeleton-card" />
        <div class="skeleton-card" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue"

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

const props = defineProps<{
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

const isContentReady = ref(false)
let contentReadyTimer: number | null = null

function scheduleContentReady() {
  isContentReady.value = false

  if (contentReadyTimer !== null) {
    window.clearTimeout(contentReadyTimer)
  }

  contentReadyTimer = window.setTimeout(() => {
    requestAnimationFrame(() => {
      isContentReady.value = true
    })
  }, 220)
}

watch(() => props.projectId, scheduleContentReady, { immediate: true })

onBeforeUnmount(() => {
  if (contentReadyTimer !== null) {
    window.clearTimeout(contentReadyTimer)
  }
})
</script>

<style scoped>
.project-detail-workspace {
  display: grid;
  gap: 24px;
  min-width: 0;
  grid-column: 1 / -1;
  width: min(1180px, 100%);
  padding-top: 24px;
}

.project-detail-stack {
  display: grid;
  gap: 17px;
}

.project-detail-skeleton {
  display: grid;
  gap: 16px;
}

.skeleton-card {
  min-height: 180px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #f8f7f7;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  min-width: 0;
}

.panel-card {
  display: flex;
  flex-direction: column;
  gap: 17px;
  min-width: 0;
  min-height: 0;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #fdfcfc;
}

.muted-paragraph {
  margin: 0;
  color: #646262;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 960px) {
  .panel-grid {
    grid-template-columns: 1fr;
  }
}
</style>

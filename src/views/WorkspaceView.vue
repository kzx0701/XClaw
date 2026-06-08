<template>
  <AppShell>
    <PageTransition :transition-key="workspace.workspacePanelKey">
      <WorkspaceProjectListSection
        v-if="workspace.appStore.activePanel === 'config' && !workspace.selectedProjectId"
        :import-error="workspace.importError"
        :is-importing="workspace.isImporting"
        :projects="projectListItems"
        @delete-project="workspace.openProjectDeleteDialog"
        @open-quick-deploy="workspace.openQuickDeployWorkspace"
        @pick-directory="workspace.handlePickDirectory"
        @select-project="workspace.handleSelectProject"
      />

      <WorkspaceProjectDetailSection
        v-else-if="workspace.appStore.activePanel === 'config'"
        :can-run-execution="workspace.canRunExecution"
        :environment-cards="workspace.environmentCards"
        :environment-draft="workspace.environmentDraft"
        :environment-editor-mode="workspace.environmentEditorMode"
        :execution-draft="workspace.executionDraft"
        :execution-environment-options="workspace.executionEnvironmentOptions"
        :execution-summary="workspace.executionSummary"
        :execution-status="workspace.executionStatus"
        :execution-status-message="workspace.executionStatusMessage"
        :import-error="workspace.importError"
        :is-ai-analyzing-project="workspace.isAiAnalyzingProject"
        :is-checking-environment="workspace.isCheckingEnvironment"
        :is-environment-editor-visible="workspace.isEnvironmentEditorVisible"
        :is-preset-environment="workspace.isPresetEnvironment"
        :project="workspace.latestScannedProject"
        :project-ai-recommendation="workspace.projectAiRecommendation"
        :project-draft="workspace.projectDraft"
        :project-id="workspace.selectedProjectId"
        :servers="workspace.servers"
        @apply-project-ai-recommendation="workspace.handleApplyProjectAiRecommendation"
        @back-to-project-list="workspace.handleBackToProjectList"
        @check-environment="workspace.handleCheckEnvironment"
        @close-environment-editor="workspace.handleCloseEnvironmentEditor"
        @confirm-delete-environment="workspace.handleConfirmDeleteEnvironment"
        @confirm-delete-environment-by-name="workspace.handleConfirmDeleteEnvironmentByName"
        @delete-project="workspace.openProjectDeleteDialog"
        @create-environment="workspace.handleCreateEnvironment"
        @reset-environment-draft="workspace.handleResetEnvironmentDraft"
        @run-execution="workspace.handleRunExecution"
        @run-project-ai-analysis="workspace.handleRunProjectAiAnalysis"
        @save-environment="workspace.handleSaveEnvironment"
        @save-project-config="workspace.handleSaveProjectConfig"
        @select-environment="workspace.handleSelectEnvironment"
        @update:environment-draft="workspace.environmentDraft = $event"
        @update:execution-draft="workspace.executionDraft = $event"
        @update:project-draft="workspace.projectDraft = $event"
      />

      <section v-else-if="workspace.appStore.activePanel === 'servers'" class="panel-grid">
        <ServerConfigPanel
          :is-creating="workspace.isCreatingServer"
          v-model="workspace.serverDraft"
          :selected-server-id="workspace.selectedServerId"
          :servers="workspace.servers"
          @check-server="workspace.handleCheckServer"
          @close-create="workspace.handleCloseCreateServer"
          @create-server="workspace.handleCreateServer"
          @delete-server-card="workspace.handleConfirmDeleteServerById"
          @save-server="workspace.handleSaveServer"
          @select-server="workspace.handleSelectServer"
        />
      </section>

      <WorkspaceLogsSection
        v-else
        :connection-label="workspace.appStore.connectionLabel"
        :connection-status="workspace.appStore.connectionStatus"
        :gateway-auth-mode="workspace.gatewayAuthMode"
        :gateway-config-source="workspace.gatewayConfigSource"
        :gateway-connection-label="workspace.gatewayConnectionLabel"
        :gateway-logs="workspace.gatewayLogs"
        :gateway-probe-status="workspace.gatewayProbeStatus"
        :gateway-probe-summary="workspace.gatewayProbeSummary"
        :gateway-stage="workspace.gatewayStage"
        :gateway-stage-description="workspace.gatewayStageDescription"
        :gateway-token="workspace.gatewayToken"
        :gateway-url="workspace.gatewayUrl"
        :is-importing-local-config="workspace.isImportingLocalConfig"
        :is-probing-gateway="workspace.isProbingGateway"
        :is-saving-gateway-config="workspace.isSavingGatewayConfig"
        :selected-task-history-id="workspace.selectedTaskHistoryId"
        :task-history-records="workspace.taskHistoryRecords"
        @clear-logs="workspace.gatewayLogs = []"
        @connect-gateway="workspace.connectGateway"
        @copy-logs="workspace.copyGatewayLogs"
        @disconnect-gateway="workspace.disconnectGateway"
        @import-local-gateway-config="workspace.handleImportLocalGatewayConfig"
        @probe-gateway="workspace.probeGatewayConnection"
        @save-gateway-config="workspace.persistGatewayConfig"
        @select-history-record="workspace.selectedTaskHistoryId = $event"
        @send-gateway-ping="workspace.sendGatewayPing"
        @update:gateway-token="workspace.gatewayToken = $event"
        @update:gateway-url="workspace.gatewayUrl = $event"
      />
    </PageTransition>

    <WorkspaceQuickDeployDialog
      :dialog-title="workspace.quickDeployDialogTitle"
      :options="workspace.quickDeployDialogOptions"
      :project="workspace.quickDeploySelectedProject"
      :selected-environment-name="workspace.quickDeployEnvironmentName"
      :stage="workspace.quickDeployStage"
      :visible="workspace.isQuickDeployDialogVisible"
      @hide="workspace.handleCloseQuickDeployDialog"
      @start="workspace.startQuickDeploy"
      @update:visible="workspace.isQuickDeployDialogVisible = $event"
    />
  </AppShell>
</template>

<script setup lang="ts">
import { computed, proxyRefs } from "vue"

import ServerConfigPanel from "@/components/ServerConfigPanel.vue"
import AppShell from "@/layouts/AppShell.vue"
import PageTransition from "@/components/PageTransition.vue"

import WorkspaceLogsSection from "./workspace/WorkspaceLogsSection.vue"
import WorkspaceProjectDetailSection from "./workspace/WorkspaceProjectDetailSection.vue"
import WorkspaceProjectListSection from "./workspace/WorkspaceProjectListSection.vue"
import WorkspaceQuickDeployDialog from "./workspace/WorkspaceQuickDeployDialog.vue"
import { useWorkspaceController } from "./workspace/useWorkspaceController"

const workspace = proxyRefs(useWorkspaceController())

const projectListItems = computed(() =>
  workspace.projectSummaries.map((project) => ({
    ...project,
    quickDeployAvailable: workspace.hasQuickDeployOptions(project.id),
  })),
)
</script>

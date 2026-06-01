<template>
  <AppShell
    :projects="projectSummaries"
    :selected-project-id="selectedProjectId"
    @delete-project="handleDeleteProject"
    @import-project="handlePickDirectory"
    @select-project="handleSelectProject"
  >
    <section v-if="appStore.activePanel === 'config'" class="panel-grid">
      <article class="panel-card emphasis-card">
        <p class="eyebrow">MVP 主链路</p>
        <h3>先打通项目导入，再接配置和执行链路。</h3>
        <p>当前已支持通过项目路径导入，并识别 package.json、脚本、项目类型和默认打包配置。</p>

        <form class="import-form" @submit.prevent="handleImport">
          <label class="field">
            <span>项目路径</span>
            <InputText v-model="projectPathInput" fluid placeholder="/Users/you/workspace/my-project" />
          </label>

          <div class="import-actions">
            <Button type="submit" :label="isImporting ? '识别中...' : '导入项目'" icon="pi pi-folder-open" :loading="isImporting" />
            <Button
              type="button"
              label="选择目录"
              icon="pi pi-search"
              severity="secondary"
              outlined
              :disabled="isImporting"
              @click="handlePickDirectory"
            />
            <Message severity="secondary" :closable="false" class="inline-message">
              当前先支持手动输入路径，后续再接目录选择器。
            </Message>
          </div>
        </form>

        <Message v-if="importError" severity="error" :closable="false">
          {{ importError }}
        </Message>
      </article>

      <ProjectOverviewCard :project="latestScannedProject" />

      <ProjectConfigPanel
        v-model="projectDraft"
        :project="latestScannedProject"
        @save-project="handleSaveProjectConfig"
      />

      <EnvironmentConfigPanel
        v-model="environmentDraft"
        :project-id="selectedProjectId"
        :servers="servers"
        @save-environment="handleSaveEnvironment"
      />

      <ExecutionPanel
        v-model="executionDraft"
        :can-run="canRunExecution"
        :project="latestScannedProject"
        :status="executionStatus"
        :status-message="executionStatusMessage"
        :summary="executionSummary"
        @run="handleRunExecution"
      />

      <article class="panel-card">
        <header class="card-head">
          <h3>脚本摘要</h3>
          <Tag severity="contrast" rounded>
            {{ latestScannedProject ? Object.keys(latestScannedProject.scripts).length : 0 }} 条
          </Tag>
        </header>
        <ul v-if="latestScannedProject" class="task-list">
          <li v-for="(command, name) in latestScannedProject.scripts" :key="name">
            <div class="task-item">
              <Tag severity="secondary" rounded>{{ name }}</Tag>
              <code>{{ command }}</code>
            </div>
          </li>
        </ul>
        <p v-else class="muted-paragraph">导入项目后，这里展示 package.json scripts。</p>
      </article>
    </section>

    <section v-else-if="appStore.activePanel === 'servers'" class="panel-grid">
      <ServerConfigPanel
        v-model="serverDraft"
        :selected-server-id="selectedServerId"
        :servers="servers"
        @create-server="handleCreateServer"
        @save-server="handleSaveServer"
        @select-server="handleSelectServer"
      />
    </section>

    <section v-else class="panel-grid">
      <GatewayPanel
        :auth-mode="gatewayAuthMode"
        :connection-status="appStore.connectionStatus"
        :connection-status-label="gatewayConnectionLabel"
        :gateway-config-source="gatewayConfigSource"
        :gateway-token="gatewayToken"
        :gateway-url="gatewayUrl"
        :is-importing-local-config="isImportingLocalConfig"
        :is-probing="isProbingGateway"
        :is-saving-config="isSavingGatewayConfig"
        :probe-status="gatewayProbeStatus"
        :probe-summary="gatewayProbeSummary"
        @connect="connectGateway"
        @disconnect="disconnectGateway"
        @import-local-config="handleImportLocalGatewayConfig"
        @probe="probeGatewayConnection"
        @save-config="persistGatewayConfig"
        @send-ping="sendGatewayPing"
        @update:gateway-token="gatewayToken = $event"
        @update:gateway-url="gatewayUrl = $event"
      />

      <article class="panel-card log-card">
        <header class="card-head">
          <h3>任务日志</h3>
          <Tag severity="contrast" rounded>{{ gatewayStage }}</Tag>
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
          <Tag severity="contrast" rounded>{{ appStore.connectionLabel }}</Tag>
        </header>
        <ul class="task-list">
          <li>项目导入：已完成</li>
          <li>环境配置：已完成</li>
          <li>网关连接：{{ appStore.connectionLabel }}</li>
          <li>当前阶段：{{ gatewayStage }}</li>
        </ul>
        <p class="muted-paragraph">{{ gatewayStageDescription }}</p>
      </article>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Tag from 'primevue/tag'

import EnvironmentConfigPanel from '@/components/EnvironmentConfigPanel.vue'
import ExecutionPanel from '@/components/ExecutionPanel.vue'
import GatewayPanel from '@/components/GatewayPanel.vue'
import ProjectConfigPanel from '@/components/ProjectConfigPanel.vue'
import ProjectOverviewCard from '@/components/ProjectOverviewCard.vue'
import ServerConfigPanel from '@/components/ServerConfigPanel.vue'
import AppShell from '@/layouts/AppShell.vue'
import { runLocalBuild } from '@/services/execution/build'
import { runLocalDeployFallback } from '@/services/execution/deploy-fallback'
import { runGatewayDeploy } from '@/services/execution/deploy'
import { loadLocalOpenClawGatewayConfig } from '@/services/openclaw/config'
import { getProjectEnvironments, upsertEnvironment } from '@/services/project/environment-repository'
import { pickProjectDirectory } from '@/services/project/pick'
import {
  deleteProject,
  getProjects,
  markProjectAsUsed,
  updateProjectConfig,
  upsertProject,
} from '@/services/project/repository'
import { scanProject } from '@/services/project/scan'
import { getServers, upsertServer } from '@/services/server/repository'
import { loadGatewayConfig, saveGatewayConfig } from '@/services/storage/gateway'
import { showToast } from '@/services/ui/toast'
import { GatewayClient } from '@/services/websocket/client'
import { probeGateway } from '@/services/websocket/probe'
import { useAppStore } from '@/stores/app'
import type { GatewayLogEntry, GatewayMessage } from '@/types/gateway'
import type { ProjectSummary } from '@/types/project'
import type {
  DeployEnvironmentRecord,
  EnvironmentFormValue,
  ExecutionDraft,
  ExecutionStatus,
  ExecutionSummaryItem,
  ProjectRecord,
  ServerFormValue,
  ServerRecord,
} from '@/types/task'

const appStore = useAppStore()

appStore.setConnectionStatus('disconnected')

const projectPathInput = ref('')
const isImporting = ref(false)
const importError = ref('')
const projects = ref<ProjectRecord[]>([])
const latestScannedProject = ref<ProjectRecord | null>(null)
const selectedProjectId = ref<string | null>(null)
const projectDraft = ref<ProjectRecord | null>(null)
const environmentDraft = ref<EnvironmentFormValue | null>(null)
const servers = ref<ServerRecord[]>([])
const selectedServerId = ref<string | null>(null)
const serverDraft = ref<ServerFormValue>(createEmptyServerDraft())
const executionDraft = ref<ExecutionDraft | null>(null)
const executionStatus = ref<ExecutionStatus>('idle')
const executionStatusMessage = ref('')
const gatewayAuthMode = ref<'token'>('token')
const gatewayConfigSource = ref<'manual' | 'local-openclaw'>('manual')
const gatewayToken = ref('')
const gatewayUrl = ref('')
const gatewayLogs = ref<GatewayLogEntry[]>([])
const gatewayStage = ref('等待连接')
const gatewayProbeSummary = ref('')
const gatewayProbeStatus = ref<'idle' | 'success' | 'warn' | 'error'>('idle')
const isImportingLocalConfig = ref(false)
const isProbingGateway = ref(false)
const reconnectCountdown = ref<number | null>(null)
const isSavingGatewayConfig = ref(false)
let gatewayClient: GatewayClient | null = null
let reconnectTimer: number | null = null
let reconnectInterval: number | null = null
let reconnectAttempts = 0
let manualDisconnectRequested = false
let shouldReconnectGateway = false

type GatewayConnectTrigger = 'manual' | 'startup' | 'reconnect'

function createLog(level: GatewayLogEntry['level'], message: string) {
  return {
    id: crypto.randomUUID(),
    level,
    message,
    timestamp: new Date().toISOString(),
  } satisfies GatewayLogEntry
}

function pushGatewayLog(level: GatewayLogEntry['level'], message: string) {
  gatewayLogs.value = [createLog(level, message), ...gatewayLogs.value].slice(0, 100)
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function summarizeGatewayMessage(message: GatewayMessage): { level: GatewayLogEntry['level']; text: string } | null {
  if (message.type === 'event') {
    const eventName = typeof message.event === 'string' ? message.event : 'unknown'

    if (eventName === 'connect.challenge') {
      return null
    }

    if (eventName === 'tick') {
      return null
    }

    if (eventName === 'health') {
      const payload = isObjectRecord(message.payload) ? message.payload : null
      const ok = payload && typeof payload.ok === 'boolean' ? payload.ok : null

      if (ok === true) {
        return {
          level: 'info',
          text: '网关健康检查正常',
        }
      }

      return {
        level: 'warn',
        text: '网关返回健康检查事件，但状态不是 ok',
      }
    }

    return {
      level: 'info',
      text: `收到网关事件：${eventName}`,
    }
  }

  if (message.type === 'res') {
    const ok = typeof message.ok === 'boolean' ? message.ok : null
    const method = typeof message.method === 'string' ? message.method : ''

    if (ok === true) {
      return {
        level: 'success',
        text: method ? `请求执行成功：${method}` : '网关请求执行成功',
      }
    }

    const error = isObjectRecord(message.error) && typeof message.error.message === 'string' ? message.error.message : ''

    return {
      level: 'error',
      text: error || '网关请求返回失败',
    }
  }

  return {
    level: 'info',
    text: `收到网关消息：${message.type}`,
  }
}

function createEmptyEnvironmentDraft(name: 'dev' | 'test' | 'prod' = 'dev'): EnvironmentFormValue {
  return {
    name,
    serverId: '',
    remotePath: '',
    uploadStrategy: 'overwrite',
    postDeployCommand: '',
    enabled: true,
  }
}

function createEmptyServerDraft(): ServerFormValue {
  return {
    name: '',
    host: '',
    port: 22,
    username: '',
    authType: 'password',
    password: '',
    privateKeyPath: '',
  }
}

function toEnvironmentDraft(environment: DeployEnvironmentRecord): EnvironmentFormValue {
  return {
    name: environment.name,
    serverId: environment.serverId,
    remotePath: environment.remotePath,
    uploadStrategy: environment.uploadStrategy,
    postDeployCommand: environment.postDeployCommand,
    enabled: environment.enabled,
  }
}

function toServerDraft(server: ServerRecord): ServerFormValue {
  return {
    name: server.name,
    host: server.host,
    port: server.port,
    username: server.username,
    authType: server.authType,
    password: server.password,
    privateKeyPath: server.privateKeyPath,
  }
}

function createExecutionDraft(project: ProjectRecord, environmentName = 'dev'): ExecutionDraft {
  return {
    environmentName,
    mode: 'build',
    overrideBuildCommand: project.defaultBuildCommand,
    overrideOutputDir: project.defaultOutputDir,
    runPrecheck: project.defaultPrecheckEnabled,
  }
}

const projectSummaries = computed<ProjectSummary[]>(() =>
  projects.value.map((project) => ({
    id: project.id,
    name: project.name,
    path: project.localPath,
    type: project.projectType,
    updatedAt: project.updatedAt,
  })),
)

const gatewayConnectionLabel = computed(() => {
  if (appStore.connectionStatus === 'connected') {
    return '已连接'
  }

  if (appStore.connectionStatus === 'connecting') {
    return '连接中'
  }

  return '未连接'
})

const gatewayStageDescription = computed(() => {
  if (appStore.connectionStatus === 'connected') {
    return '网关连接和认证都已完成，可以继续联调执行链路。'
  }

  if (appStore.connectionStatus === 'connecting') {
    return '当前正在建立 WebSocket 并等待 OpenClaw 完成握手认证。'
  }

  if (reconnectCountdown.value !== null) {
    return `网关连接已断开，系统会在 ${reconnectCountdown.value} 秒后自动重连。`
  }

  return '当前还没有可用的网关连接，后续打包、部署、日志回传都无法执行。'
})

const executionSummary = computed<ExecutionSummaryItem[]>(() => {
  if (!latestScannedProject.value || !executionDraft.value) {
    return []
  }

  return [
    {
      label: '执行模式',
      value: executionDraft.value.mode === 'build' ? '仅打包' : executionDraft.value.mode,
    },
    {
      label: '目标环境',
      value: executionDraft.value.environmentName || 'dev',
    },
    {
      label: '打包命令',
      value: executionDraft.value.overrideBuildCommand || '未配置',
    },
    {
      label: '输出目录',
      value: executionDraft.value.overrideOutputDir || latestScannedProject.value.defaultOutputDir,
    },
  ]
})

const canRunExecution = computed(() => {
  if (!latestScannedProject.value || !executionDraft.value) {
    return false
  }

  if (executionDraft.value.mode === 'build') {
    return executionDraft.value.overrideBuildCommand.trim().length > 0
  }

  if (executionDraft.value.mode === 'deploy' || executionDraft.value.mode === 'build-and-deploy') {
    return true
  }

  return false
})

function getSelectedEnvironmentConfig() {
  if (!environmentDraft.value || !executionDraft.value) {
    return null
  }

  if (environmentDraft.value.name === executionDraft.value.environmentName) {
    return environmentDraft.value
  }

  return null
}

function validateDeployContext() {
  if (!latestScannedProject.value || !executionDraft.value) {
    return { ok: false as const, message: '当前没有可执行的项目任务' }
  }

  if (appStore.connectionStatus !== 'connected' || !gatewayClient) {
    return { ok: false as const, message: '部署前必须先连接 OpenClaw 网关' }
  }

  const environmentConfig = getSelectedEnvironmentConfig()

  if (!environmentConfig) {
    return { ok: false as const, message: '请先为当前环境保存部署配置' }
  }

  if (!environmentConfig.serverId) {
    return { ok: false as const, message: '当前环境还没有绑定默认服务器' }
  }

  if (!environmentConfig.remotePath.trim()) {
    return { ok: false as const, message: '当前环境的远端部署目录不能为空' }
  }

  const server = servers.value.find((item) => item.id === environmentConfig.serverId) ?? null

  if (!server) {
    return { ok: false as const, message: '当前环境绑定的服务器不存在，请重新选择' }
  }

  if (server.authType === 'password' && !server.password.trim()) {
    return { ok: false as const, message: '当前服务器使用密码认证，但密码为空' }
  }

  if (server.authType === 'privateKey' && !server.privateKeyPath.trim()) {
    return { ok: false as const, message: '当前服务器使用私钥认证，但私钥路径为空' }
  }

  return {
    ok: true as const,
    environmentConfig,
    server,
  }
}

async function refreshProjects() {
  projects.value = await getProjects()

  if (projects.value.length > 0) {
    const selected =
      projects.value.find((project) => project.id === selectedProjectId.value) ?? projects.value[0]

    selectedProjectId.value = selected.id
    latestScannedProject.value = selected
    projectDraft.value = { ...selected }
    executionDraft.value = createExecutionDraft(selected)
    appStore.setSelectedProjectName(selected.name)
    appStore.setBannerMessage(`已载入 ${projects.value.length} 个项目记录`)
    projectPathInput.value = selected.localPath
    await loadEnvironmentDraft(selected.id)
  } else {
    selectedProjectId.value = null
    latestScannedProject.value = null
    projectDraft.value = null
    environmentDraft.value = null
    executionDraft.value = null
    projectPathInput.value = ''
    appStore.setSelectedProjectName('未选择项目')
    appStore.setBannerMessage('等待导入项目')
  }
}

async function refreshServers(preferredServerId?: string | null) {
  servers.value = await getServers()

  const targetId = preferredServerId ?? selectedServerId.value
  const matchedServer = targetId ? servers.value.find((server) => server.id === targetId) ?? null : null

  if (matchedServer) {
    selectedServerId.value = matchedServer.id
    serverDraft.value = toServerDraft(matchedServer)
    return
  }

  if (servers.value.length > 0) {
    selectedServerId.value = servers.value[0].id
    serverDraft.value = toServerDraft(servers.value[0])
    return
  }

  selectedServerId.value = null
  serverDraft.value = createEmptyServerDraft()
}

async function loadEnvironmentDraft(projectId: string) {
  const environments = await getProjectEnvironments(projectId)
  const currentProject = projects.value.find((project) => project.id === projectId) ?? latestScannedProject.value
  const preferredName = executionDraft.value?.environmentName ?? 'dev'
  const selectedEnvironment =
    environments.find((environment) => environment.name === preferredName) ??
    environments.find((environment) => environment.name === 'dev') ??
    null

  environmentDraft.value = selectedEnvironment
    ? toEnvironmentDraft(selectedEnvironment)
    : createEmptyEnvironmentDraft(preferredName as 'dev' | 'test' | 'prod')

  if (
    environmentDraft.value &&
    !environmentDraft.value.serverId &&
    currentProject?.defaultDeployServerIdByEnv?.[environmentDraft.value.name]
  ) {
    environmentDraft.value.serverId = currentProject.defaultDeployServerIdByEnv[environmentDraft.value.name] ?? ''
  }

  if (latestScannedProject.value) {
    executionDraft.value = createExecutionDraft(latestScannedProject.value, environmentDraft.value.name)
  }
}

async function handleImport() {
  importError.value = ''
  isImporting.value = true

  try {
    const scanResult = await scanProject(projectPathInput.value)
    const project = await upsertProject(scanResult)

    await refreshProjects()
    selectedProjectId.value = project.id
    latestScannedProject.value = project
    projectDraft.value = { ...project }
    executionDraft.value = createExecutionDraft(project)
    appStore.setSelectedProjectName(project.name)
    appStore.setBannerMessage(
      `已识别 ${project.projectType} 项目，默认打包命令：${project.defaultBuildCommand || '未识别'}`,
    )
    projectPathInput.value = project.localPath
  } catch (error) {
    importError.value =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : JSON.stringify(error)
    appStore.setBannerMessage('项目导入失败，请检查路径和 package.json')
  } finally {
    isImporting.value = false
  }
}

async function handlePickDirectory() {
  try {
    const selectedPath = await pickProjectDirectory()

    if (!selectedPath) {
      return
    }

    projectPathInput.value = selectedPath
    await handleImport()
  } catch (error) {
    importError.value =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : JSON.stringify(error)
    appStore.setBannerMessage('目录选择失败')
  }
}

async function handleSelectProject(projectId: string) {
  const selected = projects.value.find((project) => project.id === projectId)

  if (!selected) {
    return
  }

  selectedProjectId.value = projectId
  latestScannedProject.value = selected
  projectDraft.value = { ...selected }
  executionDraft.value = createExecutionDraft(selected, environmentDraft.value?.name ?? 'dev')
  projectPathInput.value = selected.localPath
  appStore.setSelectedProjectName(selected.name)
  appStore.setBannerMessage(`已切换到 ${selected.name}`)

  projects.value = await markProjectAsUsed(projectId)
  latestScannedProject.value = projects.value.find((project) => project.id === projectId) ?? selected
  projectDraft.value = latestScannedProject.value ? { ...latestScannedProject.value } : null
  executionDraft.value = latestScannedProject.value
    ? createExecutionDraft(latestScannedProject.value, environmentDraft.value?.name ?? 'dev')
    : null
  await loadEnvironmentDraft(projectId)
}

async function syncEnvironmentByName(environmentName: string) {
  if (!selectedProjectId.value) {
    return
  }

  const environments = await getProjectEnvironments(selectedProjectId.value)
  const matchedEnvironment = environments.find((environment) => environment.name === environmentName) ?? null
  const currentProject =
    projects.value.find((project) => project.id === selectedProjectId.value) ?? latestScannedProject.value

  environmentDraft.value = matchedEnvironment
    ? toEnvironmentDraft(matchedEnvironment)
    : createEmptyEnvironmentDraft(environmentName as 'dev' | 'test' | 'prod')

  if (
    environmentDraft.value &&
    !environmentDraft.value.serverId &&
    currentProject?.defaultDeployServerIdByEnv?.[environmentDraft.value.name]
  ) {
    environmentDraft.value.serverId = currentProject.defaultDeployServerIdByEnv[environmentDraft.value.name] ?? ''
  }
}

async function handleDeleteProject(projectId: string) {
  const deleted = projects.value.find((project) => project.id === projectId)

  projects.value = await deleteProject(projectId)

  if (selectedProjectId.value === projectId) {
    selectedProjectId.value = null
  }

  if (deleted) {
    appStore.setBannerMessage(`已删除项目记录：${deleted.name}`)
  }

  await refreshProjects()
}

async function handleSaveProjectConfig() {
  if (!projectDraft.value) {
    return
  }

  projects.value = await updateProjectConfig(projectDraft.value)
  latestScannedProject.value = projects.value.find((project) => project.id === projectDraft.value?.id) ?? null
  projectDraft.value = latestScannedProject.value ? { ...latestScannedProject.value } : null
  appStore.setBannerMessage(`已保存项目配置：${projectDraft.value?.name ?? ''}`)
  showToast('项目配置已保存', 'success')
}

async function handleSaveEnvironment() {
  if (!selectedProjectId.value || !environmentDraft.value) {
    return
  }

  await upsertEnvironment(selectedProjectId.value, environmentDraft.value)
  const currentProject = projects.value.find((project) => project.id === selectedProjectId.value) ?? null

  if (currentProject) {
    const nextProject: ProjectRecord = {
      ...currentProject,
      defaultDeployServerIdByEnv: {
        ...(currentProject.defaultDeployServerIdByEnv ?? {}),
        [environmentDraft.value.name]: environmentDraft.value.serverId,
      },
    }

    projects.value = await updateProjectConfig(nextProject)
    latestScannedProject.value = projects.value.find((project) => project.id === selectedProjectId.value) ?? nextProject
    projectDraft.value = latestScannedProject.value ? { ...latestScannedProject.value } : null
  }

  appStore.setBannerMessage(`已保存 ${environmentDraft.value.name} 环境配置`)
  showToast(`${environmentDraft.value.name} 环境配置已保存`, 'success')
}

async function handleSaveServer() {
  if (!serverDraft.value.name.trim() || !serverDraft.value.host.trim() || !serverDraft.value.username.trim()) {
    showToast('请先填写完整的服务器名称、主机和用户名', 'warning')
    return
  }

  if (serverDraft.value.authType === 'password' && !serverDraft.value.password.trim()) {
    showToast('密码认证模式下必须填写服务器密码', 'warning')
    return
  }

  if (serverDraft.value.authType === 'privateKey' && !serverDraft.value.privateKeyPath.trim()) {
    showToast('私钥认证模式下必须填写私钥路径', 'warning')
    return
  }

  const savedServer = await upsertServer(serverDraft.value, selectedServerId.value)
  await refreshServers(savedServer.id)

  if (environmentDraft.value && !environmentDraft.value.serverId) {
    environmentDraft.value = {
      ...environmentDraft.value,
      serverId: savedServer.id,
    }
  }

  appStore.setBannerMessage(`已保存服务器：${savedServer.name}`)
  showToast('服务器配置已保存', 'success')
}

function handleCreateServer() {
  selectedServerId.value = null
  serverDraft.value = createEmptyServerDraft()
  appStore.setBannerMessage('已切换到新建服务器模式')
}

function handleSelectServer(serverId: string) {
  const matchedServer = servers.value.find((server) => server.id === serverId)

  if (!matchedServer) {
    return
  }

  selectedServerId.value = serverId
  serverDraft.value = toServerDraft(matchedServer)
  appStore.setBannerMessage(`已载入服务器：${matchedServer.name}`)
}

async function handleRunExecution() {
  if (!latestScannedProject.value || !executionDraft.value) {
    return
  }

  const mode = executionDraft.value.mode

  if (mode === 'deploy' || mode === 'build-and-deploy') {
    const validation = validateDeployContext()

    if (!validation.ok) {
      executionStatus.value = 'error'
      executionStatusMessage.value = validation.message
      pushGatewayLog('error', validation.message)
      showToast(validation.message, 'warning')
      return
    }
  }

  executionStatus.value = 'running'
  executionStatusMessage.value =
    mode === 'build' ? '正在执行本地打包任务...' : mode === 'deploy' ? '正在执行远端部署任务...' : '正在执行打包与部署任务...'

  const summary = [
    `模式=${executionDraft.value.mode}`,
    `环境=${executionDraft.value.environmentName}`,
    `命令=${executionDraft.value.overrideBuildCommand}`,
    `输出目录=${executionDraft.value.overrideOutputDir}`,
    `前置校验=${executionDraft.value.runPrecheck ? '开启' : '关闭'}`,
  ].join(' | ')

  pushGatewayLog('info', `已创建执行任务：${summary}`)

  try {
    let buildOutputPath = latestScannedProject.value.localPath

    if (mode === 'build' || mode === 'build-and-deploy') {
      const result = await runLocalBuild({
        projectPath: latestScannedProject.value.localPath,
        buildCommand: executionDraft.value.overrideBuildCommand,
        outputDir: executionDraft.value.overrideOutputDir,
        precheckCommand: latestScannedProject.value.defaultPrecheckCommand,
        runPrecheck: executionDraft.value.runPrecheck,
      })

      if (result.precheckRan) {
        pushGatewayLog(
          result.precheckSuccess ? 'success' : 'error',
          result.precheckSuccess ? '前置校验执行成功' : '前置校验执行失败',
        )

        if (result.precheckOutput.trim()) {
          pushGatewayLog(result.precheckSuccess ? 'info' : 'error', result.precheckOutput.trim())
        }
      }

      if (!result.success) {
        executionStatus.value = 'error'
        executionStatusMessage.value = '打包执行失败，请查看任务日志。'
        pushGatewayLog('error', '本地打包执行失败')
        if (result.buildOutput.trim()) {
          pushGatewayLog('error', result.buildOutput.trim())
        }
        appStore.setBannerMessage('本地打包执行失败')
        showToast('本地打包执行失败', 'error')
        return
      }

      buildOutputPath = result.outputPath
      pushGatewayLog('success', `本地打包完成：${result.outputPath}`)
      if (result.buildOutput.trim()) {
        pushGatewayLog('info', result.buildOutput.trim())
      }
    }

    if (mode === 'deploy' || mode === 'build-and-deploy') {
      const validation = validateDeployContext()

      if (!validation.ok || !gatewayClient) {
        throw new Error(validation.ok ? 'OpenClaw 网关未就绪' : validation.message)
      }

      executionStatusMessage.value =
        mode === 'deploy' ? '正在通过 OpenClaw 执行远端部署...' : '本地打包完成，正在通过 OpenClaw 执行远端部署...'

      const deployContext = {
        environmentName: executionDraft.value.environmentName,
        outputPath: buildOutputPath,
        postDeployCommand: validation.environmentConfig.postDeployCommand,
        projectName: latestScannedProject.value.name,
        remotePath: validation.environmentConfig.remotePath,
        server: validation.server,
        uploadStrategy: validation.environmentConfig.uploadStrategy,
      }

      let deployResult

      try {
        deployResult = await runGatewayDeploy(gatewayClient, deployContext)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'OpenClaw 远端部署失败'

        if (message.includes('missing scope: operator.write')) {
          if (validation.server.authType !== 'privateKey') {
            throw new Error('当前网关 token 缺少 operator.write，且桌面端 SSH 兜底仅支持私钥认证。请把服务器改为私钥认证，或更换具备写权限的 Gateway Token。')
          }

          pushGatewayLog('warn', '当前网关 token 缺少 operator.write，已自动切换到桌面端 SSH 部署兜底')
          const fallbackResult = await runLocalDeployFallback(deployContext)

          if (!fallbackResult.success) {
            throw new Error('桌面端 SSH 部署兜底失败')
          }

          if (fallbackResult.commandOutput.trim()) {
            pushGatewayLog('info', fallbackResult.commandOutput.trim())
          }

          deployResult = {
            fallbackUsed: true,
            steps: fallbackResult.steps,
            success: true,
          }
        } else {
          throw error
        }
      }

      deployResult.steps.forEach((step) => pushGatewayLog('info', step))
      pushGatewayLog('success', deployResult.fallbackUsed ? '远端部署执行完成（桌面端 SSH 兜底）' : '远端部署执行完成')
    }

    executionStatus.value = 'success'
    executionStatusMessage.value =
      mode === 'build'
        ? `打包完成，产物目录：${buildOutputPath}`
        : mode === 'deploy'
          ? '远端部署执行完成'
          : `打包与部署完成，产物目录：${buildOutputPath}`

    appStore.setBannerMessage(
      mode === 'build'
        ? '本地打包执行成功'
        : mode === 'deploy'
          ? '远端部署执行成功'
          : '打包与部署执行成功',
    )
    showToast(
      mode === 'build' ? '本地打包执行成功' : mode === 'deploy' ? '远端部署执行成功' : '打包与部署执行成功',
      'success',
    )
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : mode === 'build'
          ? '执行本地打包失败'
          : '执行部署任务失败'
    executionStatus.value = 'error'
    executionStatusMessage.value = message
    pushGatewayLog('error', message)
    appStore.setBannerMessage(mode === 'build' ? '本地打包执行失败' : '部署任务执行失败')
    showToast(mode === 'build' ? '本地打包执行失败' : '部署任务执行失败', 'error')
  }
}

async function persistGatewayConfig() {
  isSavingGatewayConfig.value = true

  try {
    await saveGatewayConfig({
      authMode: gatewayAuthMode.value,
      source: gatewayConfigSource.value,
      token: gatewayToken.value,
      url: gatewayUrl.value,
    })
    pushGatewayLog('success', '已保存网关连接配置')
    appStore.setBannerMessage('已保存网关连接配置')
    showToast('网关配置已保存', 'success')
  } catch (error) {
    pushGatewayLog('error', error instanceof Error ? error.message : '保存网关连接配置失败')
    appStore.setBannerMessage('保存网关连接配置失败')
    showToast('保存网关配置失败', 'error')
  } finally {
    isSavingGatewayConfig.value = false
  }
}

async function persistGatewayConfigSilently() {
  await saveGatewayConfig({
    authMode: gatewayAuthMode.value,
    source: gatewayConfigSource.value,
    token: gatewayToken.value,
    url: gatewayUrl.value,
  })
}

function clearReconnectState() {
  if (reconnectTimer !== null) {
    window.clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  if (reconnectInterval !== null) {
    window.clearInterval(reconnectInterval)
    reconnectInterval = null
  }

  reconnectCountdown.value = null
}

function scheduleGatewayReconnect() {
  if (!shouldReconnectGateway) {
    return
  }

  clearReconnectState()
  reconnectAttempts += 1

  const delaySeconds = Math.min(3 + reconnectAttempts * 2, 12)
  reconnectCountdown.value = delaySeconds
  gatewayStage.value = '等待重连'
  pushGatewayLog('warn', `${delaySeconds} 秒后自动重连网关`)
  appStore.setBannerMessage(`网关连接已断开，${delaySeconds} 秒后自动重连`)

  reconnectInterval = window.setInterval(() => {
    if (reconnectCountdown.value === null) {
      return
    }

    if (reconnectCountdown.value <= 1) {
      reconnectCountdown.value = 0
      return
    }

    reconnectCountdown.value -= 1
  }, 1000)

  reconnectTimer = window.setTimeout(() => {
    clearReconnectState()
    void connectGateway('reconnect')
  }, delaySeconds * 1000)
}

async function probeGatewayConnection() {
  const url = gatewayUrl.value.trim()

  if (!url) {
    gatewayProbeStatus.value = 'error'
    gatewayProbeSummary.value = '请先填写网关地址，再执行检测。'
    pushGatewayLog('error', gatewayProbeSummary.value)
    appStore.setBannerMessage('请先填写网关地址')
    return
  }

  isProbingGateway.value = true
  gatewayProbeStatus.value = 'idle'
  gatewayProbeSummary.value = ''
  gatewayStage.value = '检测网关'
  pushGatewayLog('info', `开始检测网关地址：${url}`)

  try {
    const result = await probeGateway(url)

    if (result.status === 'challenge') {
      gatewayProbeStatus.value = 'success'
      gatewayStage.value = '检测通过'
      gatewayProbeSummary.value = result.message
      pushGatewayLog('success', result.message)
      appStore.setBannerMessage('网关检测通过，可以继续填写 Token 并连接')
      return
    }

    if (result.status === 'open' || result.status === 'closed') {
      gatewayProbeStatus.value = 'warn'
      gatewayStage.value = '检测异常'
      gatewayProbeSummary.value = result.message
      pushGatewayLog('warn', result.message)
      appStore.setBannerMessage('网关可达，但返回结果不符合预期')
      return
    }

    gatewayProbeStatus.value = 'error'
    gatewayStage.value = '检测失败'
    gatewayProbeSummary.value = result.message
    pushGatewayLog('error', result.message)
    appStore.setBannerMessage('网关检测失败')
  } catch (error) {
    const message = error instanceof Error ? error.message : '网关检测失败'
    gatewayProbeStatus.value = 'error'
    gatewayStage.value = '检测失败'
    gatewayProbeSummary.value = message
    pushGatewayLog('error', message)
    appStore.setBannerMessage('网关检测失败')
  } finally {
    isProbingGateway.value = false
  }
}

async function handleImportLocalGatewayConfig() {
  isImportingLocalConfig.value = true

  try {
    const config = await loadLocalOpenClawGatewayConfig()
    gatewayAuthMode.value = 'token'
    gatewayConfigSource.value = 'local-openclaw'
    gatewayUrl.value = config.url
    gatewayToken.value = config.token
    await persistGatewayConfigSilently()
    pushGatewayLog('success', `已导入本机 OpenClaw 配置：${config.sourcePath}`)
    appStore.setBannerMessage('已导入本机 OpenClaw 网关配置')
    showToast('已导入本机 OpenClaw 配置', 'success')
  } catch (error) {
    const message = error instanceof Error ? error.message : '导入本机 OpenClaw 配置失败'
    pushGatewayLog('error', message)
    appStore.setBannerMessage('导入本机 OpenClaw 配置失败')
    showToast('导入本机 OpenClaw 配置失败', 'error')
  } finally {
    isImportingLocalConfig.value = false
  }
}

function handleGatewayMessage(message: GatewayMessage | string) {
  if (typeof message === 'string') {
    pushGatewayLog('info', message)
    return
  }

  const summary = summarizeGatewayMessage(message)

  if (!summary) {
    return
  }

  gatewayStage.value =
    typeof message.type === 'string' && message.type !== 'event' ? message.type : gatewayStage.value
  pushGatewayLog(summary.level, summary.text)
}

async function connectGateway(trigger: GatewayConnectTrigger = 'manual') {
  const url = gatewayUrl.value.trim()
  const token = gatewayToken.value.trim()

  if (!url) {
    if (trigger === 'manual') {
      pushGatewayLog('error', '网关地址不能为空')
      appStore.setBannerMessage('请先填写网关地址')
    }
    return
  }

  if (!token) {
    if (trigger === 'manual') {
      pushGatewayLog('error', '当前网关鉴权模式为 token，必须先填写 Gateway Token')
      appStore.setBannerMessage('请先填写 Gateway Token')
    }
    return
  }

  if (trigger === 'manual' && gatewayConfigSource.value !== 'local-openclaw') {
    gatewayConfigSource.value = 'manual'
  }

  await persistGatewayConfigSilently()
  clearReconnectState()
  manualDisconnectRequested = false
  shouldReconnectGateway = true
  appStore.setConnectionStatus('connecting')
  gatewayStage.value = '建立连接'

  if (trigger === 'manual') {
    pushGatewayLog('info', `尝试连接 ${url}`)
  } else if (trigger === 'startup') {
    pushGatewayLog('info', `检测到已保存的网关配置，自动连接 ${url}`)
  } else {
    pushGatewayLog('info', `开始第 ${reconnectAttempts} 次自动重连：${url}`)
  }

  gatewayClient?.disconnect()
  gatewayClient = new GatewayClient(url, {
    token,
    onOpen: () => {
      gatewayStage.value = '等待握手'
      pushGatewayLog('info', 'WebSocket 已连接，等待 OpenClaw challenge')
      appStore.setBannerMessage('WebSocket 已连接，正在进行网关握手')
    },
    onClose: (event) => {
      appStore.setConnectionStatus('disconnected')
      gatewayStage.value = '连接关闭'
      pushGatewayLog('warn', `连接已关闭，code=${event.code}${event.reason ? `, reason=${event.reason}` : ''}`)

      if (!manualDisconnectRequested) {
        scheduleGatewayReconnect()
      }
    },
    onError: () => {
      appStore.setConnectionStatus('disconnected')
      gatewayStage.value = '连接异常'
      pushGatewayLog('error', '连接 OpenClaw 网关失败')
      appStore.setBannerMessage('OpenClaw 网关连接失败')
    },
    onLog: (message) => {
      pushGatewayLog('info', message)
    },
    onMessage: handleGatewayMessage,
    onAuthenticated: () => {
      clearReconnectState()
      reconnectAttempts = 0
      appStore.setConnectionStatus('connected')
      gatewayStage.value = '握手完成'
      pushGatewayLog('success', 'OpenClaw connect 握手完成')
      appStore.setBannerMessage('OpenClaw 网关已认证连接')
    },
  })
  gatewayClient.connect()
}

function disconnectGateway() {
  manualDisconnectRequested = true
  shouldReconnectGateway = false
  clearReconnectState()
  gatewayClient?.disconnect()
  gatewayClient = null
  appStore.setConnectionStatus('disconnected')
  gatewayStage.value = '手动断开'
  pushGatewayLog('warn', '已手动断开 OpenClaw 网关连接')
}

function sendGatewayPing() {
  try {
    gatewayClient?.send({
      type: 'ping',
      source: 'claw-deploy',
      timestamp: new Date().toISOString(),
    })
    pushGatewayLog('info', '已发送测试消息 ping')
  } catch (error) {
    pushGatewayLog('error', error instanceof Error ? error.message : '发送测试消息失败')
  }
}

onMounted(() => {
  void refreshProjects()
  void refreshServers()
  pushGatewayLog('info', '网关日志面板已就绪')
  void loadGatewayConfig()
    .then((config) => {
      gatewayAuthMode.value = config.authMode
      gatewayConfigSource.value = config.source
      gatewayToken.value = config.token
      gatewayUrl.value = config.url
      pushGatewayLog('info', '已加载应用本地网关连接配置')

      if (config.url.trim() && config.token.trim()) {
        void connectGateway('startup')
      }
    })
    .catch((error) => {
      pushGatewayLog('warn', error instanceof Error ? error.message : '读取本地网关配置失败')
    })
})

onBeforeUnmount(() => {
  clearReconnectState()
  gatewayClient?.disconnect()
})

watch(
  () => executionDraft.value?.environmentName,
  (environmentName, previousName) => {
    if (!environmentName || environmentName === previousName || !selectedProjectId.value) {
      return
    }

    void syncEnvironmentByName(environmentName)
  },
)
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
  gap: 18px;
  min-width: 0;
  min-height: 240px;
  padding: 22px;
  border: 1px solid rgba(23, 61, 53, 0.1);
  border-radius: 24px;
  background: rgba(255, 252, 246, 0.86);
  box-shadow: 0 18px 48px rgba(23, 61, 53, 0.08);
}

.emphasis-card {
  grid-column: 1 / -1;
  min-height: 180px;
  background:
    linear-gradient(120deg, rgba(225, 143, 51, 0.14), transparent 42%),
    rgba(255, 252, 246, 0.92);
}

.eyebrow {
  margin: 0;
  color: #8f5724;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.emphasis-card h3,
.panel-card h3 {
  margin: 0;
  color: #172725;
}

.emphasis-card p {
  max-width: 760px;
  margin: 0;
  color: #4f625c;
  line-height: 1.7;
}

.import-form {
  display: grid;
  gap: 16px;
  width: min(760px, 100%);
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

.import-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}

.inline-message {
  flex: 1 1 320px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-head span {
  color: #6d7f7a;
  font-size: 13px;
}

.task-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: #395049;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.task-item code {
  padding: 6px 10px;
  border-radius: 12px;
  background: rgba(23, 61, 53, 0.06);
  color: #173d35;
  font-family: 'SFMono-Regular', 'Menlo', monospace;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.meta-list {
  display: grid;
  gap: 10px;
  color: #395049;
}

.meta-list p {
  margin: 0;
}

.log-card {
  grid-column: 1 / -1;
  min-width: 0;
}

.log-stream {
  display: grid;
  gap: 10px;
  padding: 18px;
  border-radius: 18px;
  background: #102724;
  color: #d8ebe4;
  font-family: 'SFMono-Regular', 'Menlo', monospace;
  font-size: 13px;
  min-width: 0;
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

.log-stream p[data-level='success'] {
  color: #b5efca;
}

.log-stream p[data-level='warn'] {
  color: #f3d382;
}

.log-stream p[data-level='error'] {
  color: #ffb0a2;
}

.muted {
  color: #8daf9f;
}

.muted-paragraph {
  margin: 0;
  color: #6d7f7a;
}

@media (max-width: 960px) {
  .panel-grid {
    grid-template-columns: 1fr;
  }

  .import-actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

import { ref, computed } from "vue"
import { Rocket } from "lucide-vue-next"

import { runLocalBuild } from "@/services/execution/build"
import { runLocalDeploy } from "@/services/execution/deploy-local"
import { appendTaskHistory } from "@/services/task-history/repository"
import { useConfirm } from "@/services/ui/confirm"
import { useDeploymentProgress } from "@/services/ui/deployment-progress"
import { showToast } from "@/services/ui/toast"
import { useAppStore } from "@/stores/app"
import type { ExecutionMode, ProjectRecord, ServerRecord, TaskHistoryRecord } from "@/types/task"
import { getErrorMessage, formatEnvironmentLabel, formatUploadStrategyLabel } from "./utils"
import type { QuickDeployEnvironmentOption } from "../types"
import type { Ref } from "vue"

const BUILD_TIMEOUT_KEY = "claw-deploy:build-timeout"
const DEPLOY_TIMEOUT_KEY = "claw-deploy:deploy-timeout"
const SSH_TIMEOUT_KEY = "claw-deploy:ssh-timeout"

function loadTimeout(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const val = parseInt(raw, 10)
      if (val > 0) return val
    }
  } catch {}
  return fallback
}

interface UseQuickDeployOptions {
  selectedProjectId: Ref<string | null>
  projects: Ref<ProjectRecord[]>
  servers: Ref<ServerRecord[]>
  projectEnvironmentsMap: Ref<Map<string, any[]>>
  executionLogs: Ref<any[]>
  pushExecutionLog: (level: any, message: string) => void
  refreshDeploymentHistory: () => Promise<void>
  refreshTaskHistory: (projectId?: string) => Promise<void>
}

export function useQuickDeploy(options: UseQuickDeployOptions) {
  const appStore = useAppStore()
  const confirm = useConfirm()
  const deploymentProgress = useDeploymentProgress()

  const {
    selectedProjectId,
    projects,
    servers,
    projectEnvironmentsMap,
    executionLogs,
    pushExecutionLog,
    refreshDeploymentHistory,
    refreshTaskHistory,
  } = options

  // 保留用于卡片按钮状态展示
  const quickDeployProjectId = ref<string | null>(null)
  const quickDeployEnvironmentName = ref<string | null>(null)
  const quickDeployStage = ref<"confirm" | "running" | "success" | "error">("confirm")
  const quickDeployMessage = ref("")
  const quickDeployLogs = ref<string[]>([])

  const quickDeployOptionsByProject = computed(() => {
    const result = new Map<string, QuickDeployEnvironmentOption[]>()

    projects.value.forEach((project) => {
      const environments = projectEnvironmentsMap.value.get(project.id) ?? []
      const available = environments
        .filter((environment) => environment.enabled && (environment.name === "test" || environment.name === "prod"))
        .map((environment) => ({
          environment,
          project,
          server: servers.value.find((server) => server.id === environment.serverId) ?? null,
        }))
        .filter((item) => item.server && item.environment.remotePath.trim())

      result.set(project.id, available)
    })

    return result
  })

  function hasQuickDeployOptions(projectId: string) {
    return (quickDeployOptionsByProject.value.get(projectId) ?? []).length > 0
  }

  function pushQuickDeployLog(message: string) {
    const timestamp = new Date().toLocaleTimeString("zh-CN", {
      hour12: false,
    })
    quickDeployLogs.value = [...quickDeployLogs.value, `[${timestamp}] ${message}`]
  }

  /**
   * 入口：点击卡片部署按钮 → 弹出确认弹框 → 确认后执行部署
   */
  function startQuickDeploy(option: QuickDeployEnvironmentOption) {
    const envLabel = formatEnvironmentLabel(option.environment.name)
    const server = option.server

    confirm.require({
      header: `部署到${envLabel}`,
      icon: Rocket,
      message: `确认将「${option.project.name}」部署到${envLabel}？`,
      detailLabel: "目标服务器",
      detailValue: server ? `${server.name} (${server.host}:${server.port})` : "未配置",
      detailCode: option.environment.remotePath || "",
      rejectLabel: "取消",
      acceptLabel: "确认部署",
      accept: () => {
        executeDeploy(option)
      },
    })
  }

  /**
   * 执行部署（确认后调用）
   */
  async function executeDeploy(option: QuickDeployEnvironmentOption) {
    const envLabel = formatEnvironmentLabel(option.environment.name)

    // 前置校验
    if (!option.project.defaultBuildCommand.trim()) {
      quickDeployStage.value = "error"
      quickDeployMessage.value = "当前项目缺少默认打包命令，请先在项目配置中保存后再执行一键部署。"
      showToast(quickDeployMessage.value, "warning")
      return
    }

    if (!option.project.defaultOutputDir.trim()) {
      quickDeployStage.value = "error"
      quickDeployMessage.value = "当前项目缺少默认产物目录，请先在项目配置中保存后再执行一键部署。"
      showToast(quickDeployMessage.value, "warning")
      return
    }

    if (!option.server) {
      quickDeployStage.value = "error"
      quickDeployMessage.value = "当前环境绑定的服务器不存在，请先重新保存环境配置。"
      showToast(quickDeployMessage.value, "error")
      return
    }

    if (option.server.authType === "password" && !option.server.password.trim()) {
      quickDeployStage.value = "error"
      quickDeployMessage.value = "当前服务器使用密码认证，但密码为空。"
      showToast(quickDeployMessage.value, "error")
      return
    }

    if (option.server.authType === "privateKey" && !option.server.privateKeyPath.trim()) {
      quickDeployStage.value = "error"
      quickDeployMessage.value = "当前服务器使用私钥认证，但私钥路径为空。"
      showToast(quickDeployMessage.value, "error")
      return
    }

    // 设置卡片按钮状态
    quickDeployProjectId.value = option.project.id
    quickDeployEnvironmentName.value = option.environment.name
    quickDeployStage.value = "running"
    quickDeployMessage.value = "部署任务正在执行，请稍候。"
    quickDeployLogs.value = []

    // 创建部署进度任务
    const taskId = deploymentProgress.addTask({
      id: crypto.randomUUID(),
      projectId: option.project.id,
      projectName: option.project.name,
      environmentName: option.environment.name,
      environmentLabel: envLabel,
      serverName: option.server.name,
      serverHost: `${option.server.host}:${option.server.port}`,
      remotePath: option.environment.remotePath,
      stage: "running",
      message: "准备部署...",
      progress: 5,
      startedAt: new Date().toISOString(),
      finishedAt: null,
    })

    const startedAt = new Date().toISOString()
    const logStartCount = executionLogs.value.length
    const deployMode = option.environment.deployMode
    let buildOutputPath = `${option.project.localPath}/${option.project.defaultOutputDir}`
    let historySummary = ""
    let historyErrorMessage = ""

    pushQuickDeployLog(`准备部署项目 ${option.project.name}`)
    pushQuickDeployLog(`目标环境：${envLabel}`)
    pushQuickDeployLog(`部署方式：${deployMode === "deploy" ? "直接部署" : "打包 + 部署"}`)
    pushQuickDeployLog(`部署策略：${formatUploadStrategyLabel(option.environment.uploadStrategy)}`)
    pushQuickDeployLog(`目标目录：${option.environment.remotePath}`)

    pushExecutionLog("info", `开始一键部署：${option.project.name} -> ${envLabel}`)

    try {
      if (deployMode === "build-and-deploy") {
        deploymentProgress.updateTask(taskId, { message: "正在本地打包...", progress: 15 })

        const buildResult = await runLocalBuild({
          projectPath: option.project.localPath,
          buildCommand: option.project.defaultBuildCommand,
          outputDir: option.project.defaultOutputDir,
          precheckCommand: option.project.defaultPrecheckCommand,
          runPrecheck: option.project.defaultPrecheckEnabled,
          buildTimeout: loadTimeout(BUILD_TIMEOUT_KEY, 600),
        })

        if (buildResult.precheckRan) {
          pushQuickDeployLog(buildResult.precheckSuccess ? "前置校验执行成功" : "前置校验执行失败")
          pushExecutionLog(
            buildResult.precheckSuccess ? "success" : "error",
            buildResult.precheckSuccess ? "前置校验执行成功" : "前置校验执行失败",
          )

          if (buildResult.precheckOutput.trim()) {
            pushQuickDeployLog(buildResult.precheckOutput.trim())
            pushExecutionLog(buildResult.precheckSuccess ? "info" : "error", buildResult.precheckOutput.trim())
          }
        }

        if (!buildResult.success) {
          throw new Error(buildResult.buildOutput.trim() || "本地打包执行失败")
        }

        buildOutputPath = buildResult.outputPath
        pushQuickDeployLog(`本地打包完成：${buildResult.outputPath}`)
        deploymentProgress.updateTask(taskId, { progress: 45 })
        pushExecutionLog("success", `一键部署打包完成：${buildResult.outputPath}`)
        if (buildResult.artifactMessage.trim()) {
          pushQuickDeployLog(buildResult.artifactMessage)
          pushExecutionLog(buildResult.artifactVerified ? "info" : "warn", buildResult.artifactMessage)
        }
        if (buildResult.artifactCandidates.length > 0) {
          pushExecutionLog("info", `候选产物目录：${buildResult.artifactCandidates.join("、")}`)
        }

        if (buildResult.buildOutput.trim()) {
          pushQuickDeployLog(buildResult.buildOutput.trim())
          pushExecutionLog("info", buildResult.buildOutput.trim())
        }
      } else {
        pushQuickDeployLog(`直接使用已有产物目录：${buildOutputPath}`)
        pushExecutionLog("info", `一键部署直接使用已有产物目录：${buildOutputPath}`)
        deploymentProgress.updateTask(taskId, { progress: 40 })
      }

      deploymentProgress.updateTask(taskId, { message: "正在上传到服务器...", progress: 55 })

      pushQuickDeployLog(`开始连接服务器：${option.server.host}:${option.server.port}`)
      pushQuickDeployLog(`远端部署目录：${option.environment.remotePath}`)
      pushQuickDeployLog("部署任务已提交到桌面端后台线程执行。")

      const deployResult = await runLocalDeploy({
        environmentName: option.environment.name,
        outputPath: buildOutputPath,
        postDeployCommand: option.environment.postDeployCommand,
        projectName: option.project.name,
        remotePath: option.environment.remotePath,
        server: option.server,
        uploadStrategy: option.environment.uploadStrategy,
        sshTimeout: loadTimeout(SSH_TIMEOUT_KEY, 20),
        deployTimeout: loadTimeout(DEPLOY_TIMEOUT_KEY, 300),
      })

      deployResult.steps.forEach((step) => {
        pushQuickDeployLog(step)
        pushExecutionLog("info", step)
      })

      if (!deployResult.success) {
        throw new Error(deployResult.errorMessage || deployResult.commandOutput || "远端部署执行失败")
      }

      if (deployResult.commandOutput.trim()) {
        pushQuickDeployLog(deployResult.commandOutput.trim())
        pushExecutionLog("info", deployResult.commandOutput.trim())
      }

      deploymentProgress.updateTask(taskId, { progress: 90 })

      // 成功
      historySummary = `一键部署成功，已发布到${envLabel}`
      quickDeployStage.value = "success"
      quickDeployMessage.value = `${option.project.name} 已成功部署到 ${envLabel}。`
      pushQuickDeployLog(quickDeployMessage.value)
      pushExecutionLog("success", quickDeployMessage.value)
      appStore.setBannerMessage(quickDeployMessage.value)
      showToast("一键部署成功", "success")

      deploymentProgress.updateTask(taskId, {
        stage: "success",
        message: `已成功部署到 ${envLabel}`,
        progress: 100,
        finishedAt: new Date().toISOString(),
      })
    } catch (error) {
      const message = getErrorMessage(error, "一键部署失败")
      historySummary = `一键部署失败，目标环境 ${envLabel}`
      historyErrorMessage = message
      quickDeployStage.value = "error"
      quickDeployMessage.value = message
      pushQuickDeployLog(message)
      pushExecutionLog("error", message)
      appStore.setBannerMessage(message)
      showToast(message, "error")

      deploymentProgress.updateTask(taskId, {
        stage: "error",
        message: message,
        finishedAt: new Date().toISOString(),
      })
    } finally {
      const finishedAt = new Date().toISOString()
      const newLogs = executionLogs.value
        .slice(0, Math.max(executionLogs.value.length - logStartCount, 0))
        .map((entry) => `[${entry.timestamp.slice(11, 19)}] ${entry.message}`)
        .reverse()

      const historyRecord: TaskHistoryRecord = {
        id: crypto.randomUUID(),
        projectId: option.project.id,
        projectName: option.project.name,
        environmentName: option.environment.name,
        mode: deployMode,
        status: quickDeployStage.value === "success" ? "success" : "error",
        buildCommand: option.project.defaultBuildCommand,
        outputDir: option.project.defaultOutputDir,
        outputPath: buildOutputPath,
        serverName: option.server.name,
        serverHost: `${option.server.host}:${option.server.port}`,
        remotePath: option.environment.remotePath,
        startedAt,
        finishedAt,
        durationMs: Math.max(new Date(finishedAt).getTime() - new Date(startedAt).getTime(), 0),
        summary: historySummary || (quickDeployStage.value === "success" ? "一键部署成功" : "一键部署失败"),
        errorMessage: historyErrorMessage || undefined,
        logs: [...quickDeployLogs.value, ...newLogs].slice(-200),
      }

      await appendTaskHistory(historyRecord)
      await refreshDeploymentHistory()

      if (selectedProjectId.value === option.project.id) {
        await refreshTaskHistory(option.project.id)
      }

      // 部署结束后延迟清除卡片按钮状态（让用户看到成功/失败反馈）
      setTimeout(() => {
        if (quickDeployProjectId.value === option.project.id && quickDeployEnvironmentName.value === option.environment.name) {
          quickDeployProjectId.value = null
          quickDeployEnvironmentName.value = null
          quickDeployStage.value = "confirm"
          quickDeployMessage.value = ""
          quickDeployLogs.value = []
        }
      }, 3000)
    }
  }

  return {
    quickDeployProjectId,
    quickDeployEnvironmentName,
    quickDeployStage,
    quickDeployMessage,
    quickDeployLogs,
    quickDeployOptionsByProject,
    hasQuickDeployOptions,
    startQuickDeploy,
  }
}

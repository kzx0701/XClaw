import { reactive, computed } from "vue"

export type DeploymentTaskStage = "running" | "success" | "error"

export interface DeploymentTask {
  id: string
  projectId: string
  projectName: string
  environmentName: string
  environmentLabel: string
  serverName: string
  serverHost: string
  remotePath: string
  stage: DeploymentTaskStage
  message: string
  progress: number
  startedAt: string
  finishedAt: string | null
  dismissed: boolean
}

const tasks = reactive<DeploymentTask[]>([])

const runningTasks = computed(() => tasks.filter((t) => t.stage === "running"))
const runningCount = computed(() => runningTasks.value.length)
const hasRunning = computed(() => runningCount.value > 0)

function addTask(task: Omit<DeploymentTask, "dismissed">): string {
  const id = task.id || crypto.randomUUID()
  tasks.unshift({
    ...task,
    id,
    dismissed: false,
  })
  return id
}

function updateTask(id: string, updates: Partial<DeploymentTask>) {
  const task = tasks.find((t) => t.id === id)
  if (task) {
    Object.assign(task, updates)
  }
}

function dismissTask(id: string) {
  const task = tasks.find((t) => t.id === id)
  if (task) {
    task.dismissed = true
  }
}

function removeTask(id: string) {
  const index = tasks.findIndex((t) => t.id === id)
  if (index !== -1) {
    tasks.splice(index, 1)
  }
}

function clearFinished() {
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (tasks[i].stage !== "running") {
      tasks.splice(i, 1)
    }
  }
}

export function useDeploymentProgress() {
  return {
    tasks,
    runningTasks,
    runningCount,
    hasRunning,
    addTask,
    updateTask,
    dismissTask,
    removeTask,
    clearFinished,
  }
}

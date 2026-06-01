import { loadEnvironments, saveEnvironments } from '@/services/storage/environments'
import type { DeployEnvironmentRecord, EnvironmentFormValue } from '@/types/task'

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `env_${Date.now()}`
}

function sortEnvironments(environments: DeployEnvironmentRecord[]) {
  const order = ['dev', 'test', 'prod']

  return [...environments].sort((left, right) => {
    const leftIndex = order.indexOf(left.name)
    const rightIndex = order.indexOf(right.name)

    if (leftIndex !== -1 || rightIndex !== -1) {
      return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex)
    }

    return left.name.localeCompare(right.name)
  })
}

export async function getProjectEnvironments(projectId: string) {
  const environments = await loadEnvironments()
  return sortEnvironments(environments.filter((environment) => environment.projectId === projectId))
}

export async function upsertEnvironment(projectId: string, formValue: EnvironmentFormValue) {
  const environments = await loadEnvironments()
  const now = new Date().toISOString()
  const existing = environments.find(
    (environment) => environment.projectId === projectId && environment.name === formValue.name,
  )

  if (existing) {
    const updated: DeployEnvironmentRecord = {
      ...existing,
      ...formValue,
      updatedAt: now,
    }

    const nextEnvironments = environments.map((environment) =>
      environment.id === existing.id ? updated : environment,
    )
    await saveEnvironments(nextEnvironments)
    return updated
  }

  const created: DeployEnvironmentRecord = {
    id: generateId(),
    projectId,
    ...formValue,
    createdAt: now,
    updatedAt: now,
  }

  const nextEnvironments = [...environments, created]
  await saveEnvironments(nextEnvironments)
  return created
}

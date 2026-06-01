import type { DeployEnvironmentRecord } from '@/types/task'

const STORAGE_KEY = 'claw-deploy:environments'

function hasWindow() {
  return typeof window !== 'undefined'
}

export async function loadEnvironments(): Promise<DeployEnvironmentRecord[]> {
  if (!hasWindow()) {
    return []
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as DeployEnvironmentRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function saveEnvironments(environments: DeployEnvironmentRecord[]) {
  if (!hasWindow()) {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(environments))
}

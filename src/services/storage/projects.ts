import type { ProjectRecord } from '@/types/task'

const STORAGE_KEY = 'claw-deploy:projects'

function hasWindow() {
  return typeof window !== 'undefined'
}

export async function loadProjects(): Promise<ProjectRecord[]> {
  if (!hasWindow()) {
    return []
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as ProjectRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function saveProjects(projects: ProjectRecord[]) {
  if (!hasWindow()) {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

import type { ServerRecord } from '@/types/task'

const STORAGE_KEY = 'claw-deploy:servers'

function hasWindow() {
  return typeof window !== 'undefined'
}

export async function loadServers(): Promise<ServerRecord[]> {
  if (!hasWindow()) {
    return []
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as ServerRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function saveServers(servers: ServerRecord[]) {
  if (!hasWindow()) {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(servers))
}

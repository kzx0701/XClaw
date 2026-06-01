import { loadServers, saveServers } from '@/services/storage/servers'
import type { ServerFormValue, ServerRecord } from '@/types/task'

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `server_${Date.now()}`
}

function sortServers(servers: ServerRecord[]) {
  return [...servers].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export async function getServers() {
  const servers = await loadServers()
  return sortServers(servers)
}

export async function upsertServer(formValue: ServerFormValue, existingId?: string | null) {
  const servers = await loadServers()
  const now = new Date().toISOString()
  const existing = existingId ? servers.find((server) => server.id === existingId) : null

  if (existing) {
    const updated: ServerRecord = {
      ...existing,
      ...formValue,
      updatedAt: now,
    }

    const nextServers = servers.map((server) => (server.id === existing.id ? updated : server))
    await saveServers(sortServers(nextServers))
    return updated
  }

  const created: ServerRecord = {
    id: generateId(),
    ...formValue,
    createdAt: now,
    updatedAt: now,
  }

  const nextServers = sortServers([created, ...servers])
  await saveServers(nextServers)
  return created
}

export async function deleteServer(serverId: string) {
  const servers = await loadServers()
  const nextServers = servers.filter((server) => server.id !== serverId)
  await saveServers(sortServers(nextServers))
  return sortServers(nextServers)
}

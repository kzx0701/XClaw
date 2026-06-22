import { loadTaskHistory, saveTaskHistory } from '@/services/storage/task-history'
import type { TaskHistoryRecord } from '@/types/task'

const HISTORY_LIMIT_KEY = 'claw-deploy:history-limit'

function getHistoryLimit(): number {
  try {
    const raw = localStorage.getItem(HISTORY_LIMIT_KEY)
    if (raw) {
      const val = parseInt(raw, 10)
      if (val >= 10 && val <= 500) return val
    }
  } catch {}
  return 50
}

function sortRecords(records: TaskHistoryRecord[]) {
  return [...records].sort((left, right) => {
    return new Date(right.finishedAt).getTime() - new Date(left.finishedAt).getTime()
  })
}

export async function getTaskHistory(projectId?: string | null) {
  const records = await loadTaskHistory()

  if (!projectId) {
    return sortRecords(records)
  }

  return sortRecords(records.filter((record) => record.projectId === projectId))
}

export async function appendTaskHistory(record: TaskHistoryRecord) {
  const records = await loadTaskHistory()
  const limit = getHistoryLimit()
  const nextRecords = sortRecords([record, ...records]).slice(0, limit)
  await saveTaskHistory(nextRecords)
  return nextRecords
}

export async function deleteTaskHistoryRecord(recordId: string) {
  const records = await loadTaskHistory()
  const nextRecords = records.filter((record) => record.id !== recordId)
  await saveTaskHistory(sortRecords(nextRecords))
  return sortRecords(nextRecords)
}

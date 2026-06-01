import { invoke } from '@tauri-apps/api/core'

import { isTauriRuntime } from '@/services/project/runtime'
import type { LocalBuildRequest, LocalBuildResult } from '@/types/task'

export async function runLocalBuild(request: LocalBuildRequest): Promise<LocalBuildResult> {
  if (!isTauriRuntime()) {
    throw new Error('当前为浏览器开发模式，暂不支持执行本地打包。请使用 pnpm tauri dev 启动桌面环境。')
  }

  return invoke<LocalBuildResult>('run_local_build', {
    request,
  })
}

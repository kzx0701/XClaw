import { invoke } from '@tauri-apps/api/core'

import { isTauriRuntime } from '@/services/project/runtime'
import type { DeployExecutionContext } from '@/types/task'

interface LocalDeployResult {
  commandOutput: string
  steps: string[]
  success: boolean
}

export async function runLocalDeployFallback(context: DeployExecutionContext): Promise<LocalDeployResult> {
  if (!isTauriRuntime()) {
    throw new Error('当前为浏览器开发模式，暂不支持本地 SSH 部署兜底。请使用 pnpm tauri dev 启动桌面环境。')
  }

  return invoke<LocalDeployResult>('run_local_deploy', {
    request: {
      authType: context.server.authType,
      host: context.server.host,
      outputPath: context.outputPath,
      password: context.server.password,
      port: context.server.port,
      postDeployCommand: context.postDeployCommand,
      privateKeyPath: context.server.privateKeyPath,
      projectName: context.projectName,
      remotePath: context.remotePath,
      uploadStrategy: context.uploadStrategy,
      username: context.server.username,
    },
  })
}

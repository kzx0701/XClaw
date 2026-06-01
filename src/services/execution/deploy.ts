import type { GatewayClient } from '@/services/websocket/client'
import type { DeployExecutionContext, DeployExecutionResult } from '@/types/task'

function escapeShell(value: string) {
  return `'${value.replace(/'/g, `'\"'\"'`)}'`
}

function buildRemoteCommand(context: DeployExecutionContext) {
  const remotePath = escapeShell(context.remotePath)
  const sourcePath = escapeShell(context.outputPath)
  const uploadCommand =
    context.uploadStrategy === 'clear-and-upload'
      ? `mkdir -p ${remotePath} && rm -rf ${remotePath}/* && cp -R ${sourcePath}/. ${remotePath}/`
      : `mkdir -p ${remotePath} && cp -R ${sourcePath}/. ${remotePath}/`

  const postCommand = context.postDeployCommand.trim()

  return postCommand ? `${uploadCommand} && ${postCommand}` : uploadCommand
}

export async function runGatewayDeploy(
  gatewayClient: GatewayClient,
  context: DeployExecutionContext,
): Promise<DeployExecutionResult> {
  const steps = [
    `准备部署项目 ${context.projectName}`,
    `目标环境：${context.environmentName}`,
    `目标服务器：${context.server.name} (${context.server.host}:${context.server.port})`,
    `远端目录：${context.remotePath}`,
  ]

  const remoteCommand = buildRemoteCommand(context)

  const response = await gatewayClient.request('tools.invoke', {
    name: 'bash',
    input: {
      command: remoteCommand,
      cwd: '/',
    },
    target: {
      kind: 'ssh',
      host: context.server.host,
      port: context.server.port,
      username: context.server.username,
      auth:
        context.server.authType === 'password'
          ? {
              type: 'password',
              password: context.server.password,
            }
          : {
              type: 'privateKey',
              privateKeyPath: context.server.privateKeyPath,
            },
    },
  })

  if (!response.ok) {
    const message =
      typeof response.error?.message === 'string' ? response.error.message : 'OpenClaw 远端部署失败'
    throw new Error(message)
  }

  steps.push('远端部署命令执行完成')

  return {
    success: true,
    steps,
  }
}

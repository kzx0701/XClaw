import { open } from '@tauri-apps/plugin-dialog'

import { isTauriRuntime } from '@/services/project/runtime'

export async function pickProjectDirectory() {
  if (!isTauriRuntime()) {
    throw new Error('当前为浏览器开发模式，目录选择器仅在 Tauri 桌面环境下可用。')
  }

  const selected = await open({
    directory: true,
    multiple: false,
    title: '选择前端项目目录',
  })

  if (!selected) {
    return null
  }

  if (Array.isArray(selected)) {
    return selected[0] ?? null
  }

  return selected
}

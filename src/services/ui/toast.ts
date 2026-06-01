import type { ToastMessageOptions } from 'primevue/toast'
import type { ToastServiceMethods } from 'primevue/toastservice'

let toastApi: ToastServiceMethods | null = null

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export function registerToast(service: ToastServiceMethods) {
  toastApi = service
}

export function showToast(content: string, type: ToastType = 'info') {
  if (!toastApi) {
    return
  }

  const severity: ToastMessageOptions['severity'] =
    type === 'warning' ? 'warn' : type

  toastApi.add({
    severity,
    summary: type === 'success' ? '操作成功' : type === 'error' ? '操作失败' : '提示',
    detail: content,
    life: 2600,
  })
}

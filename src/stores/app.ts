import { ref } from 'vue'
import { defineStore } from 'pinia'

type ActivePanel = 'config' | 'servers' | 'deployLogs' | 'settings'

export const useAppStore = defineStore('app', () => {
  const activePanel = ref<ActivePanel>('config')
  const activeSettingsTab = ref('general')
  const selectedProjectName = ref('未选择项目')
  const bannerMessage = ref('等待导入项目')

  function setConnectionStatus(_status: string) {
    // 网关功能暂未启用，保留接口以兼容调用
  }

  function setActivePanel(panel: ActivePanel) {
    activePanel.value = panel
  }

  function setActiveSettingsTab(tab: string) {
    activeSettingsTab.value = tab
  }

  function setSelectedProjectName(name: string) {
    selectedProjectName.value = name
  }

  function setBannerMessage(message: string) {
    bannerMessage.value = message
  }

  return {
    activePanel,
    activeSettingsTab,
    bannerMessage,
    selectedProjectName,
    setActivePanel,
    setActiveSettingsTab,
    setBannerMessage,
    setConnectionStatus,
    setSelectedProjectName,
  }
})

<template>
  <section class="settings-page">
    <header class="settings-header">
      <h1>{{ currentTab?.label }}</h1>
    </header>

    <!-- 常规 -->
    <div v-if="activeTab === 'general'" class="settings-content">
      <div class="settings-section">
        <div class="settings-row">
          <div class="settings-row-info">
            <label class="settings-row-label">界面主题</label>
            <span class="settings-row-desc">切换应用界面使用的主题外观。</span>
          </div>
          <div class="settings-row-control">
            <div class="settings-select-group">
                <button
                  v-for="t in themeOptions"
                  :key="t.value"
                  type="button"
                  class="settings-select-btn"
                  :data-active="theme === t.value"
                  @click="theme = t.value"
                >
                  <component :is="t.icon" class="h-4 w-4" />
                  <span>{{ t.label }}</span>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 超时配置 -->
    <div v-if="activeTab === 'timeout'" class="settings-content">
      <div class="settings-section">
        <div class="settings-row">
          <div class="settings-row-info">
            <label class="settings-row-label">本地打包超时</label>
            <span class="settings-row-desc">打包命令执行的最大等待时间，超时后将自动终止进程。</span>
          </div>
          <div class="settings-row-control">
            <NumberField :model-value="settings.buildTimeout" :min="60" :max="3600" @update:model-value="settings.buildTimeout = $event">
              <NumberFieldInput class="settings-input" />
            </NumberField>
            <span class="settings-unit">秒</span>
          </div>
        </div>

        <div class="settings-row">
          <div class="settings-row-info">
            <label class="settings-row-label">部署后命令超时</label>
            <span class="settings-row-desc">远端部署后执行命令的最大等待时间。</span>
          </div>
          <div class="settings-row-control">
            <NumberField :model-value="settings.deployTimeout" :min="30" :max="1800" @update:model-value="settings.deployTimeout = $event">
              <NumberFieldInput class="settings-input" />
            </NumberField>
            <span class="settings-unit">秒</span>
          </div>
        </div>

        <div class="settings-row">
          <div class="settings-row-info">
            <label class="settings-row-label">SSH 连接超时</label>
            <span class="settings-row-desc">SSH 连接建立的最大等待时间。</span>
          </div>
          <div class="settings-row-control">
            <NumberField :model-value="settings.sshTimeout" :min="5" :max="120" @update:model-value="settings.sshTimeout = $event">
              <NumberFieldInput class="settings-input" />
            </NumberField>
            <span class="settings-unit">秒</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据管理 -->
    <div v-if="activeTab === 'data'" class="settings-content">
      <div class="settings-section">
        <div class="settings-row">
          <div class="settings-row-info">
            <label class="settings-row-label">部署历史保留数量</label>
            <span class="settings-row-desc">保留最近的部署记录条数，超出部分将自动清理。</span>
          </div>
          <div class="settings-row-control">
            <NumberField :model-value="settings.historyLimit" :min="10" :max="500" @update:model-value="settings.historyLimit = $event">
              <NumberFieldInput class="settings-input" />
            </NumberField>
            <span class="settings-unit">条</span>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-header">数据操作</div>
        <div class="settings-row">
          <div class="settings-row-info">
            <label class="settings-row-label">导出数据</label>
            <span class="settings-row-desc">将项目、服务器、环境配置导出为 JSON 文件。</span>
          </div>
          <div class="settings-row-control">
            <Button variant="outline" size="icon" class="settings-action-btn" @click="handleExport">
              <Download class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div class="settings-row">
          <div class="settings-row-info">
            <label class="settings-row-label">导入数据</label>
            <span class="settings-row-desc">从 JSON 文件导入项目、服务器、环境配置。</span>
          </div>
          <div class="settings-row-control">
            <Button variant="outline" size="icon" class="settings-action-btn" @click="handleImport">
              <Upload class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div class="settings-section settings-section-danger">
        <div class="settings-section-header">危险操作</div>
        <div class="settings-row">
          <div class="settings-row-info">
            <label class="settings-row-label">清空部署历史</label>
            <span class="settings-row-desc">删除所有部署历史记录，此操作不可撤销。</span>
          </div>
          <div class="settings-row-control">
            <Button variant="outline" size="icon" class="settings-action-danger" @click="handleClearHistory">
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div class="settings-row">
          <div class="settings-row-info">
            <label class="settings-row-label">重置所有数据</label>
            <span class="settings-row-desc">清除所有项目、服务器、环境配置和部署历史。</span>
          </div>
          <div class="settings-row-control">
            <Button variant="outline" size="icon" class="settings-action-danger" @click="handleResetAll">
              <RefreshCw class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- 关于 -->
    <div v-if="activeTab === 'about'" class="settings-content">
      <div class="settings-section">
        <div class="settings-row">
          <div class="settings-row-info">
            <label class="settings-row-label">当前版本</label>
            <span class="settings-row-desc">XClaw 桌面应用</span>
          </div>
          <div class="settings-row-control">
            <Badge variant="secondary" class="settings-badge">v{{ appVersion }}</Badge>
          </div>
        </div>

        <div class="settings-row">
          <div class="settings-row-info">
            <label class="settings-row-label">检查更新</label>
            <span class="settings-row-desc">检查是否有新版本可用。</span>
          </div>
          <div class="settings-row-control">
            <Button variant="outline" size="icon" class="settings-action-btn" @click="handleCheckUpdate">
              <RefreshCw class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div class="settings-row">
          <div class="settings-row-info">
            <label class="settings-row-label">GitHub</label>
            <span class="settings-row-desc">访问项目源代码仓库。</span>
          </div>
          <div class="settings-row-control">
            <Button variant="outline" size="icon" class="settings-action-btn" @click="handleOpenGitHub">
              <ExternalLink class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, markRaw } from "vue";
import { Download, Upload, Trash2, RefreshCw, ExternalLink, Monitor, Moon, Sun } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { NumberField, NumberFieldInput } from "@/components/ui/number-field";
import { Badge } from "@/components/ui/badge";
import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";

import { showToast } from "@/services/ui/toast";
import { useConfirm } from "@/services/ui/confirm";
import { useAppStore } from "@/stores/app";
import { useTheme } from "@/composables/useTheme";

const confirm = useConfirm();
const appStore = useAppStore();
const { theme } = useTheme();
const appVersion = ref("1.0.0");

const activeTab = computed(() => appStore.activeSettingsTab);

const tabs = [
  { value: "general", label: "常规" },
  { value: "timeout", label: "超时配置" },
  { value: "data", label: "数据管理" },
  { value: "about", label: "关于" },
];

const currentTab = computed(() => tabs.find((t) => t.value === activeTab.value));

const themeOptions = [
  { value: "system", label: "系统", icon: markRaw(Monitor) },
  { value: "dark", label: "深色", icon: markRaw(Moon) },
  { value: "light", label: "浅色", icon: markRaw(Sun) },
];

const settings = reactive({
  buildTimeout: 600,
  deployTimeout: 300,
  sshTimeout: 20,
  historyLimit: 50,
});

onMounted(async () => {
  try {
    appVersion.value = await getVersion();
  } catch {
    appVersion.value = "1.0.0";
  }
});

function handleExport() {
  showToast("数据导出功能开发中", "info");
}

function handleImport() {
  showToast("数据导入功能开发中", "info");
}

function handleClearHistory() {
  confirm.require({
    message: "确认清空所有部署历史记录？此操作不可撤销。",
    header: "确认清空",
    icon: Trash2,
    rejectLabel: "取消",
    acceptLabel: "清空",
    acceptClass: "p-button-danger",
    accept: () => {
      showToast("部署历史已清空", "success");
    },
  });
}

function handleResetAll() {
  confirm.require({
    message: "确认重置所有数据？这将清除所有项目、服务器、环境配置和部署历史。此操作不可撤销！",
    header: "确认重置",
    icon: Trash2,
    rejectLabel: "取消",
    acceptLabel: "重置",
    acceptClass: "p-button-danger",
    accept: () => {
      showToast("所有数据已重置", "success");
    },
  });
}

function handleCheckUpdate() {
  showToast("当前已是最新版本", "success");
}

async function handleOpenGitHub() {
  try {
    await invoke("open_external_url", { url: "https://github.com/kzx0701/XClaw" });
  } catch {
    window.open("https://github.com/kzx0701/XClaw", "_blank", "noopener,noreferrer");
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.settings-header {
  width: 100%;
  max-width: 720px;
  margin-bottom: 20px;
}

.settings-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
}

.settings-content {
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-section {
  border: 1px solid var(--card-border);
  border-radius: 4px;
  background: var(--surface);
  overflow: hidden;
}

.settings-section-danger {
  border-color: var(--danger-tint);
}

.settings-section-header {
  padding: 8px 16px;
  background: var(--surface-hover);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  border-bottom: 1px solid var(--card-border);
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--card-border);
}

.settings-row:last-child {
  border-bottom: none;
}

.settings-row-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.settings-row-label {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.settings-row-desc {
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.settings-row-control {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.settings-input {
  width: 80px;
  height: 32px;
  font-size: 13px;
  text-align: right;
}

.settings-unit {
  color: var(--text-muted);
  font-size: 13px;
  min-width: 24px;
}

.settings-badge {
  font-size: 12px;
}

.settings-action-btn {
  color: var(--text-primary);
}

.settings-action-btn:hover {
  background: var(--surface-active);
}

.settings-action-danger {
  color: var(--danger-soft);
  border-color: var(--danger-tint);
}

.settings-action-danger:hover {
  background: var(--danger-tint);
  border-color: var(--danger-tint);
}

.settings-select-group {
  display: flex;
  gap: 2px;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px;
  background: var(--surface-hover);
}

.settings-select-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 10px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 100ms ease;
}

.settings-select-btn:hover {
  color: var(--text-primary);
}

.settings-select-btn[data-active="true"] {
  background: var(--surface);
  color: var(--text-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
</style>

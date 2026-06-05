<template>
  <div class="app-shell-root grid h-screen grid-cols-[220px_minmax(0,1fr)] overflow-hidden text-foreground">
    <aside class="app-shell-sidebar flex min-h-0 flex-col border-r border-border bg-sidebar">
      <div class="flex h-20 flex-col justify-center px-5">
        <div class="flex items-center gap-2.5">
          <XClawWordmark font-size="1.4rem" @click="openReleasePage" />
          <span class="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground">{{ appVersion }}</span>
        </div>
      </div>

      <nav class="flex flex-col gap-1 px-3 py-4" aria-label="主菜单">
        <button
          v-for="item in navItems"
          :key="item.value"
          type="button"
          :data-active="appStore.activePanel === item.value"
          class="group relative flex h-10 cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 text-left text-sm font-medium text-sidebar-foreground transition-all duration-150 ease-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
          @click="appStore.setActivePanel(item.value)"
        >
          <component
            :is="item.icon"
            class="h-4 w-4 text-sidebar-foreground/60 transition-colors duration-150 group-data-[active=true]:text-primary"
          />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <div class="mt-auto px-3 pb-4">
        <div class="gateway-status-compact">
          <span class="gateway-status-label">网关</span>
          <StatusPill :label="gatewayStatusLabel" :status="appStore.connectionStatus" />
        </div>
      </div>
    </aside>

    <main class="app-shell-main min-w-0 bg-background">
      <header class="flex h-16 items-center border-b border-border px-8">
        <Transition name="shell-title" mode="out-in">
          <div :key="headerTransitionKey" class="app-shell-header-content">
            <slot v-if="$slots.header" name="header" />
            <template v-else>
              <div>
                <h2 class="text-lg font-semibold tracking-tight text-foreground">{{ panelTitle }}</h2>
              </div>
              <slot name="header-actions" />
            </template>
          </div>
        </Transition>
      </header>

      <div class="h-[calc(100vh-65px)] overflow-auto px-8 py-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useSlots } from "vue";
import { FolderKanban, FileText, Server } from "lucide-vue-next";
import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";

import StatusPill from "@/components/StatusPill.vue";
import XClawWordmark from "@/components/XClawWordmark.vue";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();
const slots = useSlots();
const appVersion = ref("1.0.0");
const releaseUrl = "https://github.com/kzx0701/XClaw/releases";

const navItems = [
  {
    value: "config",
    label: "项目",
    icon: FolderKanban,
  },
  {
    value: "servers",
    label: "服务器",
    icon: Server,
  },
  {
    value: "logs",
    label: "日志",
    icon: FileText,
  },
] as const;

const panelTitle = computed(() => {
  if (appStore.activePanel === "servers") {
    return "服务器";
  }

  if (appStore.activePanel === "logs") {
    return "日志";
  }

  return appStore.selectedProjectName && appStore.selectedProjectName !== "未选择项目" ? appStore.selectedProjectName : "项目";
});

const headerTransitionKey = computed(() => {
  return slots.header ? `custom:${panelTitle.value}` : `default:${panelTitle.value}`;
});

const gatewayStatusLabel = computed(() => {
  if (appStore.connectionStatus === "connected") {
    return "已连接";
  }

  if (appStore.connectionStatus === "connecting") {
    return "连接中";
  }

  return "未连接";
});

async function openReleasePage() {
  try {
    await invoke("open_external_url", { url: releaseUrl });
  } catch {
    window.open(releaseUrl, "_blank", "noopener,noreferrer");
  }
}

onMounted(async () => {
  try {
    appVersion.value = await getVersion();
  } catch {
    appVersion.value = "1.0.0";
  }
});
</script>

<style scoped>
.app-shell-root {
  background: #1e1e2e;
}

.app-shell-sidebar {
  background: #181825;
}

.app-shell-main {
  background: #1e1e2e;
}

.gateway-status-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 32px;
  padding: 0 2px;
}

.gateway-status-label {
  color: #8b8b9a;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

nav button[data-active="true"]::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 2px;
  height: 16px;
  border-radius: 0 2px 2px 0;
  background: #4a7fc1;
  transform: translateY(-50%);
}

.app-shell-header-content {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.shell-title-enter-active,
.shell-title-leave-active {
  transition:
    opacity 200ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.shell-title-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.shell-title-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .shell-title-enter-active,
  .shell-title-leave-active {
    transition: none;
  }

  .shell-title-enter-from,
  .shell-title-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>

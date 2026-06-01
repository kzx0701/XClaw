<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <p class="eyebrow">Claw Deploy</p>
        <h1>前端项目部署工作台</h1>
        <StatusPill :label="appStore.connectionLabel" :status="appStore.connectionStatus" />
      </div>

      <section class="sidebar-section">
        <div class="section-head">
          <h2>项目列表</h2>
          <Button label="导入项目" icon="pi pi-plus" severity="secondary" outlined rounded @click="$emit('import-project')" />
        </div>

        <ul class="project-list">
          <li
            v-for="project in projects"
            :key="project.id"
            class="project-card"
            :data-active="project.id === selectedProjectId"
            @click="$emit('select-project', project.id)"
          >
            <div class="project-card-head">
              <strong>{{ project.name }}</strong>
              <Button
                class="delete-button"
                label="删除"
                severity="danger"
                text
                rounded
                title="删除项目记录"
                @click.stop="$emit('delete-project', project.id)"
              />
            </div>
            <span>{{ project.type }}</span>
            <small>{{ project.path }}</small>
          </li>
        </ul>
      </section>
    </aside>

    <main class="workspace">
      <header class="workspace-header">
        <div>
          <p class="eyebrow">{{ panelEyebrow }}</p>
          <h2>{{ panelTitle }}</h2>
          <p class="banner">{{ appStore.bannerMessage }}</p>
        </div>

        <nav class="panel-switcher">
          <Button
            label="项目"
            rounded
            :severity="appStore.activePanel === 'config' ? 'contrast' : 'secondary'"
            :variant="appStore.activePanel === 'config' ? undefined : 'text'"
            @click="appStore.setActivePanel('config')"
          />
          <Button
            label="服务器"
            rounded
            :severity="appStore.activePanel === 'servers' ? 'contrast' : 'secondary'"
            :variant="appStore.activePanel === 'servers' ? undefined : 'text'"
            @click="appStore.setActivePanel('servers')"
          />
          <Button
            label="日志"
            rounded
            :severity="appStore.activePanel === 'logs' ? 'contrast' : 'secondary'"
            :variant="appStore.activePanel === 'logs' ? undefined : 'text'"
            @click="appStore.setActivePanel('logs')"
          />
        </nav>
      </header>

      <div class="workspace-body">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'

import StatusPill from '@/components/StatusPill.vue'
import { useAppStore } from '@/stores/app'
import type { ProjectSummary } from '@/types/project'

defineEmits<{
  'import-project': []
  'select-project': [projectId: string]
  'delete-project': [projectId: string]
}>()

defineProps<{
  projects: ProjectSummary[]
  selectedProjectId?: string | null
}>()

const appStore = useAppStore()

const panelEyebrow = computed(() => {
  if (appStore.activePanel === 'servers') {
    return '全局资产'
  }

  if (appStore.activePanel === 'logs') {
    return '网关与日志'
  }

  return '当前项目'
})

const panelTitle = computed(() => {
  if (appStore.activePanel === 'servers') {
    return '服务器资产库'
  }

  if (appStore.activePanel === 'logs') {
    return '网关联调与任务日志'
  }

  return appStore.selectedProjectName
})
</script>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  min-height: 100vh;
  overflow: hidden;
}

.sidebar {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 28px 22px;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.18), transparent 38%),
    linear-gradient(180deg, #0e2d2f 0%, #173d35 100%);
  color: #f6fbf7;
}

.brand h1 {
  margin: 6px 0 14px;
  font-size: 28px;
  line-height: 1.15;
}

.eyebrow {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.76;
}

.sidebar-section {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-head h2 {
  margin: 0;
  font-size: 16px;
}

.ghost-button {
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  padding: 8px 12px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.project-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
}

.project-card[data-active='true'] {
  border-color: rgba(255, 231, 182, 0.7);
  background: rgba(255, 239, 205, 0.18);
  box-shadow: inset 0 0 0 1px rgba(255, 227, 173, 0.28);
}

.project-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.project-card strong {
  font-size: 15px;
}

.project-card span,
.project-card small {
  opacity: 0.78;
}

.project-card small {
  word-break: break-all;
}

.delete-button {
  border: 0;
  padding: 0;
  background: transparent;
  color: rgba(246, 251, 247, 0.72);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.project-card[data-active='true'] .delete-button {
  color: rgba(255, 242, 214, 0.9);
}

.workspace {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background:
    linear-gradient(180deg, rgba(244, 237, 220, 0.65) 0%, rgba(244, 237, 220, 0.18) 26%, transparent 100%),
    #f7f3ea;
}

.workspace-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 28px 32px 20px;
}

.workspace-header h2 {
  margin: 6px 0 0;
  font-size: 32px;
  color: #172725;
}

.banner {
  margin: 8px 0 0;
  color: #60706a;
  font-size: 14px;
}

.panel-switcher {
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: rgba(20, 42, 38, 0.08);
}

.panel-button {
  border: 0;
  border-radius: 999px;
  padding: 10px 18px;
  background: transparent;
  color: #45625a;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.panel-button[data-active='true'] {
  background: #173d35;
  color: #f7fbf8;
}

.workspace-body {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  padding: 0 32px 32px;
  overflow: auto;
}

@media (max-width: 960px) {
  .shell {
    grid-template-columns: 1fr;
  }

  .workspace-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

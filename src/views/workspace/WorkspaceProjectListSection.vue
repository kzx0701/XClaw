<template>
  <section class="project-page">
    <article class="project-list-page">
      <WorkspaceToolbarPanel>
        <template #search>
          <div class="workspace-list-search-field">
            <Search class="workspace-list-search-icon h-4 w-4" />
            <InputText
              :model-value="searchKeyword"
              class="workspace-list-search-input"
              placeholder="搜索项目名称、本地路径..."
              @update:model-value="searchKeyword = String($event ?? '')"
            />
          </div>
        </template>

        <template #actions>
          <Button class="workspace-list-add-button" variant="secondary" :loading="isImporting" @click="$emit('pick-directory')">
            <Plus class="h-4 w-4" />
            <span>导入项目</span>
          </Button>
        </template>
      </WorkspaceToolbarPanel>

      <Alert v-if="importError" :variant="resolveAlertVariant('error')" :class="resolveAlertToneClass('error')">
        {{ importError }}
      </Alert>

      <section v-if="projects.length > 0" class="project-library-section">
        <header class="project-section-header">
          <h2>项目</h2>
        </header>

        <div v-if="filteredProjects.length > 0" class="project-card-list">
          <ResourceCard
            v-for="project in filteredProjects"
            :key="project.id"
            :description="project.path"
            :title="project.name"
            @select="$emit('select-project', project.id)"
          >
            <template #icon>
              <img class="project-icon-image" :src="projectFolderIcon" alt="" aria-hidden="true" />
            </template>

            <template #meta>
              <span class="project-type-badge">{{ project.type }}</span>
            </template>

            <template #actions>
              <button
                type="button"
                class="quick-deploy-button"
                :disabled="!project.quickDeployAvailable"
                title="一键部署"
                @click.stop="$emit('open-quick-deploy', project.id)"
              >
                <Send class="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" class="delete-project-button" title="删除项目" @click.stop="$emit('delete-project', project.id)">
                <Trash2 class="h-4 w-4" aria-hidden="true" />
              </button>
            </template>
          </ResourceCard>
        </div>

        <section v-else class="project-search-empty">
          <p>没有匹配的项目</p>
          <small>试试搜索项目名称或本地路径。</small>
        </section>
      </section>

      <section v-else class="project-empty-state">
        <FolderOpen class="project-empty-icon" :size="48" />
        <p class="project-empty-title">暂无项目</p>
        <p class="project-empty-desc">点击上方「导入项目」开始使用</p>
      </section>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { FolderOpen, Plus, Search, Send, Trash2 } from "lucide-vue-next"

import Alert from "@/components/ui/alert/Alert.vue"
import Button from "@/components/ui/button/Button.vue"
import { Input as InputText } from "@/components/ui/input"
import ResourceCard from "@/components/ResourceCard.vue"
import WorkspaceToolbarPanel from "@/components/workspace-header/WorkspaceToolbarPanel.vue"
import projectFolderBackground from "@/assets/images/folder-bg2.png"
import projectFolderIcon from "@/assets/images/folder.png"
import { resolveAlertToneClass, resolveAlertVariant } from "@/lib/ui-status"

import type { WorkspaceProjectListItem } from "./types"

defineEmits<{
  "delete-project": [projectId: string]
  "open-quick-deploy": [projectId: string]
  "pick-directory": []
  "select-project": [projectId: string]
}>()

const props = defineProps<{
  importError: string
  isImporting: boolean
  projects: WorkspaceProjectListItem[]
}>()

const searchKeyword = ref("")
const filteredProjects = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return props.projects
  }

  return props.projects.filter((project) => {
    return [project.name, project.path].some((field) => field.toLowerCase().includes(keyword))
  })
})
</script>

<style scoped>
.project-page {
  grid-column: 1 / -1;
  position: relative;
}

.project-list-page {
  display: grid;
  gap: 18px;
  grid-column: 1 / -1;
}

.workspace-list-search-field {
  position: relative;
  width: 100%;
}

.workspace-list-search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  color: #646262;
  transform: translateY(-50%);
  pointer-events: none;
}

.workspace-list-search-input {
  padding-left: 38px;
}

.workspace-list-add-button {
  height: 34px;
  padding-inline: 12px;
  border: 1px solid #201d1d;
  border-radius: 4px;
  background: #201d1d;
  color: #fdfcfc;
  font-size: 14px;
  font-weight: 500;
}

.workspace-list-add-button:hover {
  background: #0f0000;
}

.workspace-list-add-button:hover {
  background: #0f0000;
}

.workspace-list-add-button:hover {
  background: #0f0000;
}

.project-library-section {
  display: grid;
  gap: 14px;
}

.project-section-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.project-section-header h2 {
  margin: 0;
  color: #201d1d;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0;
}

.project-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 376px));
  gap: 12px;
  align-items: start;
  justify-content: start;
}

.project-icon-image {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.project-type-badge {
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-self: start;
  min-height: 22px;
  padding: 0 9px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--info-tint);
  color: #007aff;
  font-size: var(--tag-font-size);
  font-weight: 400;
  letter-spacing: 0;
  line-height: var(--tag-line-height);
}

.quick-deploy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 4px;
  border: 1px solid transparent;
  background: transparent;
  color: #007aff;
  cursor: pointer;
  opacity: 0.6;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    opacity 150ms ease;
}

.quick-deploy-button:not(:disabled):hover {
  border-color: var(--border);
  background: #f1eeee;
  color: #0056b3;
  opacity: 1;
}

.quick-deploy-button:disabled {
  color: rgba(107, 107, 122, 0.4);
  opacity: 0.3;
  cursor: not-allowed;
}

.quick-deploy-button:active {
  transform: none;
}

.delete-project-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: #d70015;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    color 150ms ease;
}

.delete-project-button:hover {
  border-color: rgba(255, 59, 48, 0.22);
  background: var(--danger-tint);
  color: #a50011;
}

.delete-project-button:active {
  transform: none;
}

.project-search-empty {
  display: grid;
  gap: 6px;
  padding: 18px 16px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #f8f7f7;
}

.project-search-empty p,
.project-search-empty small {
  margin: 0;
}

.project-search-empty p {
  color: #201d1d;
  font-size: 14px;
  font-weight: 500;
}

.project-search-empty small {
  color: #646262;
  line-height: 1.6;
}

.project-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 400px;
  padding: 40px;
}

.project-empty-icon {
  color: #c8c8ca;
}

.project-empty-title {
  margin: 0;
  color: #201d1d;
  font-size: 16px;
  font-weight: 600;
}

.dark .project-empty-title {
  color: var(--text-primary);
}

.project-empty-desc {
  margin: 0;
  color: #646262;
  font-size: 14px;
}

.dark .project-empty-desc {
  color: var(--text-secondary);
}

@media (max-width: 960px) {
  .project-card-list {
    grid-template-columns: 1fr;
  }
}
</style>

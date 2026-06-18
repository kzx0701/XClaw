<template>
  <section class="project-page">
    <article class="project-list-page">
      <WorkspaceToolbarPanel>
        <template #search>
          <div class="workspace-list-search-field">
            <Search class="workspace-list-search-icon h-4 w-4" />
            <InputText
              :model-value="searchKeyword"
              class="pl-[38px]"
              placeholder="搜索项目名称、本地路径..."
              @update:model-value="searchKeyword = String($event ?? '')"
            />
          </div>
        </template>

        <template #actions>
          <Button variant="secondary" :loading="isImporting" @click="$emit('pick-directory')">
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
              <div class="project-card-deploy-actions">
                <template v-if="getDeployOptions(project.id).length > 0">
                  <Button
                    v-for="option in getDeployOptions(project.id)"
                    :key="option.environment.name"
                    variant="outline"
                    size="sm"
                    class="deploy-env-button"
                    :class="getDeployButtonClass(project.id, option.environment.name)"
                    :loading="isDeploying(project.id, option.environment.name)"
                    :disabled="isDeployingOther(project.id, option.environment.name)"
                    @click.stop="$emit('start-quick-deploy', option)"
                  >
                    <Send v-if="!isDeploying(project.id, option.environment.name)" class="h-3.5 w-3.5" />
                    <span>{{ formatEnvironmentLabel(option.environment.name) }}</span>
                  </Button>
                </template>
                <Button
                  v-else
                  variant="ghost"
                  size="sm"
                  class="deploy-env-setup-button"
                  @click.stop="$emit('select-project', project.id)"
                >
                  <Plus class="h-3.5 w-3.5" />
                  <span>配置环境</span>
                </Button>
              </div>
            </template>

            <template #actions>
              <Button
                variant="ghost"
                size="icon-sm"
                title="删除项目"
                class="delete-project-button"
                @click.stop="$emit('delete-project', project.id)"
              >
                <Trash2 class="h-4 w-4" aria-hidden="true" />
              </Button>
            </template>
          </ResourceCard>
        </div>

        <section v-else class="project-search-empty">
          <p>没有匹配的项目</p>
          <small>试试搜索项目名称或本地路径。</small>
        </section>
      </section>

      <Empty v-else class="project-empty-state border-0">
        <EmptyMedia>
          <FolderOpen class="project-empty-icon" :size="48" />
        </EmptyMedia>
        <EmptyContent>
          <EmptyTitle class="project-empty-title">暂无项目</EmptyTitle>
          <EmptyDescription class="project-empty-desc">点击上方「导入项目」开始使用</EmptyDescription>
        </EmptyContent>
      </Empty>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { FolderOpen, Plus, Search, Send, Trash2 } from "lucide-vue-next"

import Alert from "@/components/ui/alert/Alert.vue"
import Button from "@/components/ui/button/Button.vue"
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input as InputText } from "@/components/ui/input"
import ResourceCard from "@/components/ResourceCard.vue"
import WorkspaceToolbarPanel from "@/components/workspace-header/WorkspaceToolbarPanel.vue"
import projectFolderIcon from "@/assets/images/folder.png"
import { resolveAlertToneClass, resolveAlertVariant } from "@/lib/ui-status"

import { formatEnvironmentLabel } from "./formatters"
import type { QuickDeployEnvironmentOption } from "./types"
import type { WorkspaceProjectListItem } from "./types"

defineEmits<{
  "delete-project": [projectId: string]
  "pick-directory": []
  "select-project": [projectId: string]
  "start-quick-deploy": [option: QuickDeployEnvironmentOption]
}>()

const props = defineProps<{
  deployStage: "confirm" | "running" | "success" | "error"
  deployingEnvironmentName: string | null
  deployingProjectId: string | null
  importError: string
  isImporting: boolean
  projects: WorkspaceProjectListItem[]
  quickDeployOptions: Map<string, QuickDeployEnvironmentOption[]>
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

function getDeployOptions(projectId: string): QuickDeployEnvironmentOption[] {
  return props.quickDeployOptions.get(projectId) ?? []
}

function isDeploying(projectId: string, environmentName: string): boolean {
  return props.deployStage === "running" && props.deployingProjectId === projectId && props.deployingEnvironmentName === environmentName
}

function isDeployingOther(projectId: string, environmentName: string): boolean {
  if (props.deployStage !== "running") return false
  return !(props.deployingProjectId === projectId && props.deployingEnvironmentName === environmentName)
}

function getDeployButtonClass(projectId: string, environmentName: string): string {
  if (props.deployingProjectId !== projectId || props.deployingEnvironmentName !== environmentName) return ""
  if (props.deployStage === "success") return "deploy-env-success"
  if (props.deployStage === "error") return "deploy-env-error"
  return ""
}
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
  color: var(--text-muted);
  transform: translateY(-50%);
  pointer-events: none;
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
  color: var(--text-primary);
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

.project-card-deploy-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.deploy-env-button {
  height: 26px;
  padding-inline: 8px;
  font-size: 12px;
  gap: 4px;
  border-radius: 4px;
}

.deploy-env-button :deep(svg) {
  width: 12px;
  height: 12px;
}

.deploy-env-success {
  border-color: var(--success-soft) !important;
  color: var(--success-soft) !important;
  background: var(--success-tint) !important;
}

.deploy-env-error {
  border-color: var(--danger-soft) !important;
  color: var(--danger-soft) !important;
  background: var(--danger-tint) !important;
}

.deploy-env-setup-button {
  height: 26px;
  padding-inline: 8px;
  font-size: 12px;
  gap: 4px;
  color: var(--text-muted);
}

.deploy-env-setup-button:hover {
  color: var(--text-primary);
}

.delete-project-button {
  color: var(--danger-soft);
}

.delete-project-button:hover {
  background: var(--danger-tint);
  color: var(--danger-soft);
}

.project-search-empty {
  display: grid;
  gap: 6px;
  padding: 18px 16px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface-hover);
}

.project-search-empty p,
.project-search-empty small {
  margin: 0;
}

.project-search-empty p {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.project-search-empty small {
  color: var(--text-muted);
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
  color: var(--text-muted);
}

.project-empty-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
}

.project-empty-desc {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

@media (max-width: 960px) {
  .project-card-list {
    grid-template-columns: 1fr;
  }
}
</style>

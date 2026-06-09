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

      <section v-else class="project-empty-shell">
        <div class="project-empty-hero">
          <div class="project-empty-copy">
            <div class="project-empty-copy-head">
              <span class="project-empty-eyebrow">项目工作台</span>
              <span class="project-empty-divider" aria-hidden="true" />
            </div>
            <h2>从项目开始，搭好部署工作台</h2>
            <p>导入一个本地前端项目后，这里会保留项目记录，并串联环境配置、服务器连接和部署执行流程。</p>

            <div class="project-empty-highlights" aria-hidden="true">
              <span>自动识别构建配置</span>
              <span>统一管理部署记录</span>
              <span>面向测试与生产环境</span>
            </div>

            <div class="project-empty-actions">
              <Button class="app-primary-button" :loading="isImporting" @click="$emit('pick-directory')">
                <Plus class="h-4 w-4" />
                <span>{{ isImporting ? "导入中..." : "导入第一个项目" }}</span>
              </Button>
              <div class="project-empty-tip">
                <small>支持含 `package.json` 的 Vue / React 前端项目</small>
              </div>
            </div>
          </div>

          <div class="project-empty-visual" aria-hidden="true">
            <img class="project-empty-visual-image" :src="projectFolderBackground" alt="" />
          </div>
        </div>

        <div class="project-empty-guide">
          <article class="project-empty-step">
            <span>01</span>
            <strong>导入项目</strong>
            <p>选择本地项目目录，自动识别构建命令和产物目录。</p>
          </article>
          <article class="project-empty-step">
            <span>02</span>
            <strong>配置环境</strong>
            <p>绑定服务器、远端目录和上传策略，准备测试或生产环境。</p>
          </article>
          <article class="project-empty-step">
            <span>03</span>
            <strong>执行部署</strong>
            <p>在一个工作台里完成打包、部署、验证与结果回看。</p>
          </article>
        </div>
      </section>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { Plus, Search, Send, Trash2 } from "lucide-vue-next"

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

.project-empty-shell {
  display: grid;
  gap: 22px;
  grid-column: 1 / -1;
}

.project-empty-hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  align-items: stretch;
  min-height: 420px;
  padding: 34px 34px 32px;
  border: 1px solid var(--border);
  border-radius: 0;
  background: #fdfcfc;
}

.project-empty-hero::after {
  content: none;
}

.project-empty-copy {
  position: relative;
  z-index: 1;
  display: grid;
  align-content: flex-start;
  gap: 26px;
  min-width: 0;
  max-width: 640px;
  padding-top: 10px;
}

.project-empty-copy-head {
  display: grid;
  gap: 12px;
}

.project-empty-eyebrow {
  color: #201d1d;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0;
}

.project-empty-divider {
  width: 44px;
  height: 1px;
  background: rgba(15, 0, 0, 0.12);
}

.project-empty-copy h2 {
  margin: 0;
  max-width: 560px;
  color: #201d1d;
  font-size: 28px;
  line-height: 1.5;
  font-weight: 700;
  text-wrap: balance;
}

.project-empty-copy p {
  margin: 0;
  max-width: 560px;
  color: #424245;
  font-size: 16px;
  line-height: 1.5;
}

.project-empty-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  max-width: 540px;
  margin-top: -2px;
}

.project-empty-highlights span {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #f8f7f7;
  color: #424245;
  font-size: 14px;
  letter-spacing: 0;
  line-height: 1.5;
}

.project-empty-actions {
  display: grid;
  gap: 14px;
  width: fit-content;
  padding-top: 18px;
}

.project-empty-actions :deep(.app-primary-button) {
  min-width: 272px;
  min-height: 40px;
  padding-inline: 20px;
}

.project-empty-actions :deep(.app-primary-button span) {
  font-weight: 500;
}

.project-empty-tip {
  display: grid;
  gap: 3px;
  padding-left: 4px;
}

.project-empty-tip small {
  color: #646262;
  font-size: 14px;
  line-height: 2;
  letter-spacing: 0;
}

.project-empty-visual {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.project-empty-visual-image {
  position: absolute;
  right: -20px;
  top: 50%;
  width: min(500px, 56vw);
  max-width: none;
  transform: translateY(-48%);
  opacity: 0.8;
  filter: none;
  user-select: none;
}

.project-empty-guide {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.project-empty-step {
  display: grid;
  gap: 10px;
  padding: 20px 18px 18px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #fdfcfc;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.project-empty-step::before {
  content: "";
  width: 24px;
  height: 1px;
  background: var(--border);
}

.project-empty-step span {
  color: #646262;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
}

.project-empty-step strong {
  color: #201d1d;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
}

.project-empty-step p {
  margin: 0;
  color: #424245;
  font-size: 14px;
  line-height: 1.5;
}

.project-empty-step:hover {
  background: #f8f7f7;
}

.project-empty-step:active {
  transform: none;
}

@media (max-width: 960px) {
  .project-card-list,
  .project-empty-guide {
    grid-template-columns: 1fr;
  }

  .project-empty-hero {
    padding: 20px;
    min-height: 360px;
  }

  .project-empty-copy h2 {
    font-size: 26px;
  }

  .project-empty-copy {
    gap: 22px;
    max-width: 100%;
  }

  .project-empty-visual-image {
    right: -150px;
    width: min(620px, 78vw);
    opacity: 0.18;
  }
}

@media (max-width: 640px) {
  .project-empty-shell {
    gap: 16px;
  }

  .project-empty-hero {
    padding: 18px;
    min-height: 320px;
  }

  .project-empty-copy h2 {
    font-size: 22px;
  }

  .project-empty-highlights {
    gap: 8px;
  }

  .project-empty-actions :deep(.app-primary-button) {
    min-width: 240px;
  }

  .project-empty-copy {
    gap: 18px;
    max-width: 100%;
  }

  .project-empty-copy p,
  .project-empty-highlights {
    max-width: 100%;
  }

  .project-empty-visual-image {
    right: -160px;
    width: 520px;
    opacity: 0.14;
  }
}
</style>

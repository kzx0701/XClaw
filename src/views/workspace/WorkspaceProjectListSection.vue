<template>
  <section class="panel-grid">
    <article class="project-list-page">
      <header class="project-toolbar">
        <Button class="app-primary-button" label="导入项目" :icon="Plus" :loading="isImporting" @click="$emit('pick-directory')" />
      </header>

      <Alert v-if="importError" :variant="resolveAlertVariant('error')" :class="resolveAlertToneClass('error')">
        {{ importError }}
      </Alert>

      <div v-if="projects.length > 0" class="project-card-list">
        <ResourceCard
          v-for="project in projects"
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
import { Plus, Send, Trash2 } from "lucide-vue-next"

import Alert from "@/components/ui/alert/Alert.vue"
import Button from "@/components/ui/button/Button.vue"
import ResourceCard from "@/components/ResourceCard.vue"
import projectFolderBackground from "@/assets/images/folder-bg2.png"
import projectFolderIcon from "@/assets/images/folder.png"
import { resolveAlertToneClass, resolveAlertVariant } from "@/lib/ui-status"

import type { WorkspaceProjectListItem } from "./types"

defineProps<{
  importError: string
  isImporting: boolean
  projects: WorkspaceProjectListItem[]
}>()

defineEmits<{
  "delete-project": [projectId: string]
  "open-quick-deploy": [projectId: string]
  "pick-directory": []
  "select-project": [projectId: string]
}>()
</script>

<style scoped>
.project-list-page {
  display: grid;
  gap: 14px;
  grid-column: 1 / -1;
}

.project-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 6px;
}

.project-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 420px));
  gap: 16px;
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
  border: 1px solid rgba(74, 127, 193, 0.2);
  border-radius: 6px;
  background: rgba(74, 127, 193, 0.1);
  color: #7aa3d9;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1;
}

.quick-deploy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
  border: 1px solid rgba(74, 127, 193, 0.15);
  background: transparent;
  color: #7aa3d9;
  cursor: pointer;
  opacity: 0.6;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease,
    opacity 150ms ease,
    transform 100ms ease;
}

.quick-deploy-button:not(:disabled):hover {
  background: rgba(74, 127, 193, 0.1);
  border-color: rgba(74, 127, 193, 0.25);
  color: #9bbce8;
  opacity: 1;
}

.quick-deploy-button:disabled {
  color: rgba(107, 107, 122, 0.4);
  opacity: 0.3;
  cursor: not-allowed;
  border-color: transparent;
}

.quick-deploy-button:active {
  transform: scale(0.97);
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
  border-radius: 6px;
  background: transparent;
  color: #e88a8a;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease,
    transform 100ms ease;
}

.delete-project-button:hover {
  background: rgba(229, 92, 92, 0.1);
  border-color: rgba(229, 92, 92, 0.15);
  color: #f0a0a0;
}

.delete-project-button:active {
  transform: scale(0.97);
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
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  background: #2a2a3c;
}

.project-empty-hero::after {
  content: "";
  position: absolute;
  right: -140px;
  bottom: -160px;
  width: 340px;
  height: 340px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(74, 127, 193, 0.08), transparent 70%);
  pointer-events: none;
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
  color: #7aa3d9;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
}

.project-empty-divider {
  width: 44px;
  height: 1px;
  background: linear-gradient(90deg, rgba(74, 127, 193, 0.5), rgba(74, 127, 193, 0));
}

.project-empty-copy h2 {
  margin: 0;
  max-width: 560px;
  color: #e0e0e0;
  font-size: 26px;
  line-height: 1.15;
  font-weight: 600;
  text-wrap: balance;
}

.project-empty-copy p {
  margin: 0;
  max-width: 560px;
  color: #8b8b9a;
  font-size: 14px;
  line-height: 1.8;
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
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  color: #8b8b9a;
  font-size: 11px;
  letter-spacing: 0.01em;
  line-height: 1;
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
  border-radius: 8px;
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
  color: #6b6b7a;
  font-size: 11px;
  line-height: 1.6;
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
  filter: drop-shadow(0 28px 60px rgba(2, 6, 23, 0.34));
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
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  background: #2a2a3c;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    transform 160ms cubic-bezier(0.16, 1, 0.3, 1);
}

.project-empty-step::before {
  content: "";
  width: 28px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, #4a7fc1, rgba(74, 127, 193, 0));
}

.project-empty-step span {
  color: #4a7fc1;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.project-empty-step strong {
  color: #e0e0e0;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.3;
}

.project-empty-step p {
  margin: 0;
  color: #8b8b9a;
  font-size: 13px;
  line-height: 1.7;
}

.project-empty-step:hover {
  border-color: rgba(255, 255, 255, 0.1);
  background: #32324a;
  transform: translateY(-1px);
}

.project-empty-step:active {
  transform: scale(0.985);
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

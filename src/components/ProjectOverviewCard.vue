<template>
  <article class="panel-card overview-card">
    <header class="overview-head">
      <div class="overview-title-group">
        <span class="overview-eyebrow">项目概览</span>
        <h3>{{ project?.name || '未选择项目' }}</h3>
      </div>

      <div v-if="project" class="overview-meta">
        <span>{{ project.projectType || '未知类型' }}</span>
        <span>{{ project.packageManager || '未知包管理器' }}</span>
        <span>{{ scriptCount }} 个脚本</span>
      </div>

      <span class="overview-status" :data-ready="isReady">
        <CircleCheck v-if="isReady" class="h-3.5 w-3.5" aria-hidden="true" />
        <CircleAlert v-else class="h-3.5 w-3.5" aria-hidden="true" />
        {{ isReady ? '配置完整' : '待完善' }}
      </span>
    </header>

    <div v-if="project" class="overview-body">
      <section class="primary-strip" aria-label="构建主链路">
        <div class="primary-item command-item">
          <span class="item-icon" aria-hidden="true">
            <SquareTerminal class="h-4 w-4" />
          </span>
          <div class="item-copy">
            <small>默认打包命令</small>
            <strong>{{ project.defaultBuildCommand || project.detectedBuildCommand || '未配置' }}</strong>
          </div>
        </div>

        <div class="primary-item output-item">
          <span class="item-icon" aria-hidden="true">
            <Archive class="h-4 w-4" />
          </span>
          <div class="item-copy">
            <small>默认产物目录</small>
            <strong>{{ project.defaultOutputDir || project.detectedOutputDir || '未配置' }}</strong>
          </div>
        </div>
      </section>

      <section class="secondary-grid" aria-label="项目辅助信息">
        <div class="secondary-item">
          <small>识别命令</small>
          <strong>{{ project.detectedBuildCommand || '未识别' }}</strong>
        </div>
        <div class="secondary-item">
          <small>识别目录</small>
          <strong>{{ project.detectedOutputDir || '未识别' }}</strong>
        </div>
        <div class="secondary-item check-item" :data-enabled="project.defaultPrecheckEnabled">
          <small>执行前检查</small>
          <strong>{{ project.defaultPrecheckEnabled ? '已启用' : '未启用' }}</strong>
        </div>
      </section>

      <section class="path-row" aria-label="本地路径">
        <MapPin class="h-3.5 w-3.5" aria-hidden="true" />
        <small>本地路径</small>
        <p>{{ project.localPath }}</p>
      </section>
    </div>

    <p v-else class="muted-paragraph">导入项目后，这里会展示识别出的项目基础信息。</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Archive, CircleAlert, CircleCheck, MapPin, SquareTerminal } from 'lucide-vue-next'

import type { ProjectRecord } from '@/types/task'

const props = defineProps<{
  project: ProjectRecord | null
}>()

const isReady = computed(() => Boolean(props.project?.defaultBuildCommand?.trim() && props.project?.defaultOutputDir?.trim()))
const scriptCount = computed(() => Object.keys(props.project?.scripts ?? {}).length)
</script>

<style scoped>
.overview-card {
  grid-column: 1 / -1;
  width: 100%;
  gap: 24px;
  padding: 28px;
}

.overview-head {
  display: grid;
  grid-template-columns: minmax(260px, auto) minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
}

.overview-title-group {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.overview-eyebrow {
  color: #201d1d;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0;
}

.overview-title-group h3,
.path-row p {
  margin: 0;
}

.overview-title-group h3 {
  color: #201d1d;
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0;
}

.overview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.overview-meta span,
.overview-status {
  display: inline-flex;
  align-items: center;
  min-height: 23px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
}

.overview-meta span {
  background: var(--neutral-tint);
  color: #424245;
}

.overview-status {
  gap: 6px;
  background: var(--warning-tint);
  color: var(--warning-soft);
}

.overview-status[data-ready='true'] {
  background: var(--success-tint);
  color: var(--success-soft);
}

.overview-body {
  display: grid;
  gap: 12px;
}

.primary-strip {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(260px, 0.88fr);
  min-height: 84px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #f8f7f7;
}

.primary-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  min-width: 0;
  padding: 17px;
}

.command-item {
  background: #fdfcfc;
}

.output-item {
  position: relative;
  background: #f8f7f7;
}

.output-item::before {
  content: none;
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 1px;
  background: rgba(15, 0, 0, 0.12);
}

.item-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #f1eeee;
  color: #201d1d;
  flex: 0 0 auto;
}

.output-item .item-icon {
  background: #f1eeee;
  color: #646262;
}

.item-copy,
.secondary-item {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.item-copy small,
.secondary-item small,
.path-row small {
  color: #646262;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0;
}

.item-copy strong {
  color: #201d1d;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.output-item .item-copy strong {
  color: #201d1d;
  font-size: 16px;
}

.secondary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.secondary-item {
  min-height: 58px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #f8f7f7;
}

.secondary-item strong {
  color: #201d1d;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.check-item[data-enabled='true'] strong {
  color: var(--success-soft);
}

.path-row {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  gap: 7px;
  align-items: center;
  min-height: 31px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #f8f7f7;
  color: #646262;
}

.path-row p {
  color: #424245;
  font-size: 14px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.muted-paragraph {
  margin: 0;
  color: #646262;
}

@media (max-width: 1100px) {
  .overview-head,
  .primary-strip,
  .secondary-grid {
    grid-template-columns: 1fr;
  }

  .output-item::before {
    display: none;
  }
}

@media (max-width: 640px) {
  .path-row {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .path-row small {
    display: none;
  }
}
</style>

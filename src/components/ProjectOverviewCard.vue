<template>
  <article class="panel-card overview-card">
    <header class="card-head">
      <div>
        <h3>项目概览</h3>
        <p>展示导入识别结果，便于核对当前项目上下文。</p>
      </div>
      <span class="badge">{{ project ? '已识别' : '等待导入' }}</span>
    </header>

    <div v-if="project" class="overview-grid">
      <div class="overview-item">
        <span>项目名称</span>
        <strong>{{ project.name }}</strong>
      </div>
      <div class="overview-item">
        <span>项目类型</span>
        <strong>{{ project.projectType }}</strong>
      </div>
      <div class="overview-item">
        <span>包管理器</span>
        <strong>{{ project.packageManager }}</strong>
      </div>
      <div class="overview-item">
        <span>默认打包命令</span>
        <strong>{{ project.defaultBuildCommand || '未识别' }}</strong>
      </div>
      <div class="overview-item">
        <span>默认输出目录</span>
        <strong>{{ project.defaultOutputDir }}</strong>
      </div>
      <div class="overview-item wide">
        <span>本地路径</span>
        <strong>{{ project.localPath }}</strong>
      </div>
    </div>

    <p v-else class="muted-paragraph">导入项目后，这里会展示识别出的项目基础信息。</p>
  </article>
</template>

<script setup lang="ts">
import type { ProjectRecord } from '@/types/task'

defineProps<{
  project: ProjectRecord | null
}>()
</script>

<style scoped>
.overview-card {
  grid-column: 1 / -1;
  min-height: auto;
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.card-head h3 {
  margin: 0;
}

.card-head p {
  margin: 8px 0 0;
  color: #6d7f7a;
}

.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 8px 12px;
  background: rgba(23, 61, 53, 0.08);
  color: #173d35;
  font-size: 12px;
  font-weight: 700;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 18px;
}

.overview-item {
  display: grid;
  gap: 8px;
}

.overview-item span {
  color: #6d7f7a;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.overview-item strong {
  color: #172725;
  font-size: 15px;
  word-break: break-all;
}

.wide {
  grid-column: 1 / -1;
}

.muted-paragraph {
  margin: 0;
  color: #6d7f7a;
}

@media (max-width: 960px) {
  .card-head {
    flex-direction: column;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .wide {
    grid-column: auto;
  }
}
</style>

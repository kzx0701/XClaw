<template>
  <section class="gateway-workspace">
    <article class="gateway-empty-panel">
      <div class="gateway-empty-icon" aria-hidden="true">
        <RadioTower class="h-5 w-5" />
      </div>

      <div class="gateway-empty-copy">
        <h2>网关模块待重新梳理</h2>
        <p>当前网关界面已清空，后续可以重新设计连接配置、状态检测、调用日志与能力测试流程。</p>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { RadioTower } from "lucide-vue-next"
</script>

<style scoped>
.gateway-workspace {
  display: grid;
  align-content: start;
  min-height: 100%;
  min-width: 0;
  padding-top: 20px;
}

.gateway-empty-panel {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  max-width: 620px;
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #fdfcfc;
}

.gateway-empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #f1eeee;
  color: #201d1d;
}

.gateway-empty-copy {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.gateway-empty-copy h2,
.gateway-empty-copy p {
  margin: 0;
}

.gateway-empty-copy h2 {
  color: #201d1d;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
}

.gateway-empty-copy p {
  color: #424245;
  font-size: 14px;
  line-height: 1.5;
}
</style>

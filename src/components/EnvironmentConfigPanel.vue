<template>
  <article class="panel-card config-card">
    <header class="card-head">
      <div>
        <h3>环境配置</h3>
      </div>
      <div class="actions">
        <Button class="app-primary-button" :disabled="!projectId" @click="$emit('create-environment')">
          <Plus class="h-4 w-4" />
          <span>新增环境</span>
        </Button>
      </div>
    </header>

    <div v-if="projectId" class="environment-page">
      <div v-if="environmentCards.length > 0" class="environment-list">
        <button
          v-for="environment in environmentCards"
          :key="environment.name"
          type="button"
          class="environment-card"
          :data-preset="environment.preset ? environment.name : null"
          @click="$emit('select-environment', environment.name)"
        >
          <div class="environment-card-top">
            <div class="environment-card-main">
              <span class="environment-icon">
                <component :is="environment.icon" class="h-5 w-5" aria-hidden="true" />
              </span>

              <div class="environment-card-body">
                <strong>{{ environment.label }}</strong>
                <p>{{ environment.serverLabel }}</p>
              </div>
            </div>

            <div class="environment-card-actions">
              <Button
                v-if="environment.deletable"
                variant="ghost"
                size="icon"
                class="delete-environment-button"
                aria-label="删除环境"
                title="删除环境"
                @click.stop="$emit('delete-environment-card', environment.name)"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
              <span class="environment-status-text" :data-status="environment.configured ? 'configured' : 'pending'">
                {{ environment.configured ? "已配置" : "待配置" }}
              </span>
            </div>
          </div>

          <div class="environment-card-foot">
            <span>{{ environment.remotePathLabel }}</span>
            <ChevronRight class="h-4 w-4" aria-hidden="true" />
          </div>
        </button>
      </div>

      <div v-else class="empty-state">
        <Compass class="empty-icon" aria-hidden="true" />
        <h4>还没有部署环境</h4>
        <Button class="app-primary-button" @click="$emit('create-environment')">
          <Plus class="h-4 w-4" />
          <span>新增第一个环境</span>
        </Button>
      </div>
    </div>

    <p v-else class="muted-paragraph">请先导入并选中项目。</p>

    <Drawer :open="editorVisible" direction="right" dismissible modal @update:open="handleDrawerOpenChange">
      <DrawerContent
        class="environment-drawer border border-[var(--border)] bg-[#fdfcfc] text-[#201d1d] shadow-none"
        :style="{ width: 'clamp(720px, 46vw, 860px)', maxWidth: '94vw' }"
      >
        <DrawerHeader class="drawer-head">
          <div class="drawer-head-copy">
            <p class="drawer-eyebrow">环境配置</p>
            <DrawerTitle>{{ editorTitle }}</DrawerTitle>
          </div>
        </DrawerHeader>

        <div v-if="editorDraft" class="environment-drawer-scroll">
          <section class="drawer-section">
            <div class="drawer-section-head">
              <span class="drawer-section-index">01</span>
              <h4>基础配置</h4>
            </div>

            <div class="drawer-section-card">
              <div class="create-form-grid">
                <label class="field">
                  <span>环境名称</span>
                  <InputText
                    :model-value="displayEnvironmentName"
                    :disabled="isPresetEnvironment"
                    class="w-full"
                    placeholder="例如：开发环境"
                    @update:model-value="updateField('name', $event)"
                  />
                </label>

                <label class="field">
                  <span>目标服务器</span>
                  <Select :model-value="editorDraft.serverId" @update:model-value="updateField('serverId', $event)">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="请选择服务器" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="server in serverOptions" :key="server.value" :value="server.value">
                        {{ server.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </label>

                <label class="field full-span">
                  <span>启用环境</span>
                  <div class="switch-row">
                    <Switch :model-value="editorDraft.enabled" @update:model-value="updateBoolean('enabled', Boolean($event))" />
                    <small>{{ editorDraft.enabled ? "已启用" : "未启用" }}</small>
                  </div>
                </label>

                <label class="field full-span">
                  <span>远端部署目录</span>
                  <div class="field-inline-action">
                    <InputText
                      :model-value="editorDraft.remotePath"
                      class="w-full"
                      placeholder="/root/www/project"
                      @update:model-value="updateField('remotePath', $event)"
                    />
                    <Button
                      class="environment-check-button"
                      :loading="isCheckingEnvironment"
                      :disabled="isCheckingEnvironment"
                      variant="outline"
                      @click="$emit('check-environment')"
                    >
                      <FolderSearch v-if="!isCheckingEnvironment" class="h-4 w-4" />
                      <span>{{ isCheckingEnvironment ? "检测中" : "检测" }}</span>
                    </Button>
                  </div>
                </label>
              </div>
            </div>
          </section>

          <section class="drawer-section">
            <div class="drawer-section-head">
              <span class="drawer-section-index">02</span>
              <h4>部署策略</h4>
            </div>

            <div class="drawer-section-card">
              <div class="create-form-grid">
                <label class="field">
                  <span>部署方式</span>
                  <Select :model-value="editorDraft.deployMode" @update:model-value="updateField('deployMode', $event)">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="请选择部署方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="option in deployModeOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </label>

                <label class="field">
                  <span>上传方式</span>
                  <Select :model-value="editorDraft.uploadStrategy" @update:model-value="updateField('uploadStrategy', $event)">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="请选择上传方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="option in uploadStrategyOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </label>

                <label class="field">
                  <span>部署后命令</span>
                  <InputText
                    :model-value="editorDraft.postDeployCommand"
                    class="w-full"
                    placeholder="例如：nginx -s reload"
                    @update:model-value="updateField('postDeployCommand', $event)"
                  />
                </label>
              </div>
            </div>
          </section>
        </div>

        <div class="drawer-actions environment-create-actions">
          <Button variant="secondary" @click="$emit('reset-environment')">
            <RotateCcw class="h-4 w-4" />
            <span>重置配置</span>
          </Button>
          <Button class="app-primary-button" @click="$emit('save-environment')">
            <Save class="h-4 w-4" />
            <span>保存配置</span>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ChevronRight, Compass, FolderSearch, Plus, RotateCcw, Save, Trash2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input as InputText } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Switch from "@/components/ui/switch/Switch.vue";

import type { Component } from "vue";
import type { EnvironmentFormValue, ExecutionMode, ServerRecord, UploadStrategy } from "@/types/task";

const uploadStrategyOptions: Array<{ label: string; value: UploadStrategy }> = [
  { label: "直接覆盖", value: "overwrite" },
  { label: "清空后上传", value: "clear-and-upload" },
];

const deployModeOptions: Array<{ label: string; value: Extract<ExecutionMode, "deploy" | "build-and-deploy"> }> = [
  { label: "打包 + 部署", value: "build-and-deploy" },
  { label: "直接部署", value: "deploy" },
];

type EnvironmentCardItem = {
  configured: boolean;
  deletable: boolean;
  icon: Component;
  label: string;
  name: string;
  preset: boolean;
  remotePathLabel: string;
  serverLabel: string;
};

const props = defineProps<{
  canDelete: boolean;
  editorDraft: EnvironmentFormValue | null;
  editorMode: "create" | "edit";
  editorVisible: boolean;
  environmentCards: EnvironmentCardItem[];
  isCheckingEnvironment: boolean;
  isPresetEnvironment: boolean;
  projectId: string | null;
  servers: ServerRecord[];
}>();

const emit = defineEmits<{
  "check-environment": [];
  "close-editor": [];
  "create-environment": [];
  "delete-environment": [];
  "delete-environment-card": [name: string];
  "reset-environment": [];
  "save-environment": [];
  "select-environment": [name: string];
  "update:editorDraft": [value: EnvironmentFormValue | null];
}>();

const selectedServer = computed(() =>
  props.editorDraft ? (props.servers.find((server) => server.id === props.editorDraft.serverId) ?? null) : null,
);

const serverOptions = computed(() =>
  props.servers.map((server) => ({
    label: `${server.name} / ${server.host}:${server.port}`,
    value: server.id,
  })),
);

const editorTitle = computed(() => {
  if (props.editorMode === "create") {
    return "新增自定义环境";
  }

  const environmentName =
    props.editorDraft?.name === "test" ? "测试环境" : props.editorDraft?.name === "prod" ? "生产环境" : props.editorDraft?.name;

  return `编辑 ${environmentName}`;
});

const displayEnvironmentName = computed(() => {
  if (!props.editorDraft) {
    return "";
  }

  if (props.editorDraft.name === "test") {
    return "测试环境";
  }

  if (props.editorDraft.name === "prod") {
    return "生产环境";
  }

  return props.editorDraft.name;
});

function updateField(field: keyof EnvironmentFormValue, value: string | UploadStrategy | undefined) {
  if (!props.editorDraft) {
    return;
  }

  emit("update:editorDraft", {
    ...props.editorDraft,
    [field]: value ?? "",
  });
}

function updateBoolean(field: keyof EnvironmentFormValue, value: boolean | undefined) {
  if (!props.editorDraft) {
    return;
  }

  emit("update:editorDraft", {
    ...props.editorDraft,
    [field]: Boolean(value),
  });
}

function handleDrawerOpenChange(nextOpen: boolean) {
  if (!nextOpen) {
    emit("close-editor");
  }
}
</script>

<style scoped>
.config-card {
  min-height: 0;
  gap: 17px;
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.card-head h3 {
  margin: 0;
  color: #201d1d;
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.environment-page {
  display: grid;
}

.environment-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 348px));
  gap: 10px;
  justify-content: start;
}

.environment-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 126px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #f8f7f7;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 140ms ease;
}

.environment-card:active {
  transform: none;
}

.environment-card:hover {
  background: #fdfcfc;
}

.environment-card-top,
.environment-card-foot,
.environment-card-main,
.drawer-actions {
  display: flex;
  align-items: center;
}

.environment-card-top,
.environment-card-foot,
.drawer-actions {
  justify-content: space-between;
}

.environment-card-main {
  gap: 12px;
  min-width: 0;
}

.environment-card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}

.environment-status-text {
  display: inline-flex;
  align-items: center;
  color: #646262;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

.environment-status-text::before {
  content: "";
  width: 7px;
  height: 7px;
  margin-right: 6px;
  border-radius: 999px;
  background: #9a9898;
}

.environment-status-text[data-status="configured"] {
  color: #8ad48a;
}

.environment-status-text[data-status="configured"]::before {
  background: #48c78e;
}

.environment-status-text[data-status="pending"] {
  color: #d4c48a;
}

.environment-status-text[data-status="pending"]::before {
  background: #e0a340;
}

.environment-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #f1eeee;
  color: #201d1d;
  font-size: 16px;
  flex: 0 0 auto;
}

.environment-card-body {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.environment-card-body strong {
  color: #201d1d;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0;
}

.environment-card-body p,
.environment-card-foot span,
.muted-paragraph {
  margin: 0;
  color: #646262;
}

.environment-card-body p,
.environment-card-foot span {
  font-size: 14px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.environment-card-foot {
  gap: 12px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.empty-state {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 22px 18px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #f8f7f7;
  text-align: center;
}

.empty-icon {
  width: 20px;
  height: 20px;
  color: #7a7a7a;
}

.empty-state h4,
.empty-state p {
  margin: 0;
}

.drawer-head {
  padding: 22px 24px 18px;
  border-bottom: 1px solid var(--border);
  background: #f8f7f7;
}

.drawer-head-copy {
  display: grid;
  gap: 8px;
}

.drawer-eyebrow {
  margin: 0 0 10px;
  color: #646262;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
}

.environment-drawer-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 18px 10px 20px;
}

.drawer-section {
  display: grid;
  gap: 10px;
  padding: 0;
  border: 0;
  background: transparent;
}

.drawer-section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 6px;
}

.drawer-section-head h4 {
  margin: 0;
  color: #201d1d;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
}

.drawer-section-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #f8f7f7;
  color: #646262;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.drawer-section-card {
  display: grid;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #fdfcfc;
}

.create-form-grid {
  display: grid;
  gap: 14px;
}

.field {
  display: grid;
  gap: 9px;
}

.full-span {
  grid-column: 1 / -1;
}

.field-inline-action {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.field span {
  color: #201d1d;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0;
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
}

.switch-row small {
  color: #646262;
  font-size: 14px;
}

.drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 6px;
}

.environment-create-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  justify-content: stretch;
  padding: 16px 24px 18px;
  border-top: 1px solid var(--border);
  background: #f8f7f7;
}

.environment-create-actions :deep(button) {
  height: 36px;
  min-height: 36px;
  width: 100%;
  min-width: 0;
  padding-inline: 14px;
  justify-content: center;
}

.environment-check-button {
  min-width: 92px;
  justify-content: center;
  background: #f8f7f7;
  color: #201d1d;
  border-color: var(--border);
}

.environment-check-button:hover {
  background: #f1eeee;
  color: #201d1d;
}

:deep(.environment-drawer) {
  display: flex;
  flex-direction: column;
  width: clamp(720px, 46vw, 860px);
  max-width: 94vw;
  height: 100vh;
  padding: 0;
  overflow: hidden;
  background: #fdfcfc;
}

@media (max-width: 960px) {
  .card-head,
  .drawer-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .environment-list {
    grid-template-columns: 1fr;
  }

  .environment-create-actions {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .drawer-head {
    padding: 20px 18px 16px;
  }

  .environment-drawer-scroll {
    padding: 16px 18px 18px;
  }

  .drawer-section-head {
    padding-inline: 0;
  }

  .environment-create-actions {
    padding: 14px 18px 18px;
  }
}
</style>

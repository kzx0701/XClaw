<template>
  <div class="server-page">
    <article class="server-list-page">
      <section class="server-toolbar-panel">
        <div class="server-search-row">
          <div class="server-search-field">
            <Search class="server-search-icon h-4 w-4" />
            <InputText
              :model-value="searchKeyword"
              class="server-search-input"
              placeholder="搜索服务器名称、主机或用户名..."
              @update:model-value="searchKeyword = String($event ?? '')"
            />
          </div>
        </div>

        <div class="server-actions-row">
          <Button class="server-add-button" variant="secondary" @click="$emit('create-server')">
            <Plus class="h-4 w-4" />
            <span>新增服务器</span>
          </Button>
        </div>
      </section>

      <section v-if="servers.length > 0" class="server-library-section">
        <header class="server-section-header">
          <h2>服务器</h2>
        </header>

        <div v-if="filteredServers.length > 0" class="server-card-list">
          <ResourceCard
            v-for="server in filteredServers"
            :key="server.id"
            :description="`${server.host}:${server.port}，${server.username}`"
            :title="server.name"
            @select="$emit('select-server', server.id)"
          >
            <template #icon>
              <Server class="h-5 w-5" aria-hidden="true" />
            </template>

            <template #meta>
              <span class="server-auth-badge" :data-auth-type="server.authType">
                <KeyRound v-if="server.authType === 'password'" class="h-3 w-3" aria-hidden="true" />
                <ShieldCheck v-else class="h-3 w-3" aria-hidden="true" />
                {{ server.authType === "password" ? "密码认证" : "私钥认证" }}
              </span>
            </template>

            <template #actions>
              <button
                type="button"
                class="delete-server-button"
                title="删除服务器"
                aria-label="删除服务器"
                @click.stop="$emit('delete-server-card', server.id)"
              >
                <Trash2 class="h-4 w-4" aria-hidden="true" />
              </button>
            </template>
          </ResourceCard>
        </div>

        <div v-else class="server-search-empty">
          <p>没有匹配的服务器</p>
          <small>试试搜索名称、主机地址或用户名。</small>
        </div>
      </section>

      <section v-else class="server-empty-shell">
        <div class="server-empty-hero">
          <div class="server-empty-copy">
            <div class="server-empty-copy-head">
              <span class="server-empty-eyebrow">服务器工作台</span>
              <span class="server-empty-divider" aria-hidden="true" />
            </div>
            <h2>接入服务器，部署链路才算完整</h2>
            <p>新增服务器后，就可以在项目环境里直接绑定目标机器，继续完成连接检测、目录配置和部署执行。</p>

            <div class="server-empty-highlights" aria-hidden="true">
              <span>统一管理服务器信息</span>
              <span>支持密码与私钥认证</span>
              <span>直接复用到项目环境</span>
            </div>

            <div class="server-empty-actions">
              <Button class="app-primary-button" @click="$emit('create-server')">
                <Plus class="h-4 w-4" />
                <span>新增第一台服务器</span>
              </Button>
              <div class="server-empty-tip">
                <small>支持常见 Linux 服务器</small>
              </div>
            </div>
          </div>

          <div class="server-empty-visual" aria-hidden="true">
            <img class="server-empty-visual-image" :src="serverBackground" alt="" />
          </div>
        </div>

        <div class="server-empty-guide">
          <article class="server-empty-step">
            <span>01</span>
            <strong>新增服务器</strong>
            <p>填写主机、端口、用户名和认证方式，建立可复用的服务器记录。</p>
          </article>
          <article class="server-empty-step">
            <span>02</span>
            <strong>检测连接</strong>
            <p>在保存前先完成连接测试，确认凭据和目标机器可正常访问。</p>
          </article>
          <article class="server-empty-step">
            <span>03</span>
            <strong>绑定环境</strong>
            <p>回到项目环境中直接选用这台服务器，继续配置远端目录与部署策略。</p>
          </article>
        </div>
      </section>
    </article>

    <Drawer :open="isCreating" direction="right" dismissible modal @update:open="handleDrawerOpenChange">
      <DrawerContent
        class="create-drawer server-create-drawer border-[rgba(255,255,255,0.06)] bg-[#1e1e2e] text-[#e0e0e0] shadow-[0_20px_50px_rgba(2,6,23,0.5)]"
      >
        <DrawerHeader class="server-create-header">
          <div class="server-create-head-copy">
            <p class="drawer-eyebrow">{{ editorMode === "edit" ? "编辑服务器" : "新增服务器" }}</p>
            <DrawerTitle>{{ editorMode === "edit" ? "编辑服务器配置" : "填写服务器配置" }}</DrawerTitle>
            <DrawerDescription>保存后，这台服务器就可以在项目环境里直接选择。</DrawerDescription>
          </div>
        </DrawerHeader>

        <div class="server-create-scroll">
          <section class="server-create-section">
            <div class="server-create-section-head">
              <h4>基础信息</h4>
              <p>先填写名称、主机与端口，建立一条可复用的服务器记录。</p>
            </div>

            <div class="create-form-grid">
              <Field class="server-create-field">
                <FieldLabel class="server-create-field-label">服务器名称</FieldLabel>
                <FieldContent class="server-create-field-content">
                  <InputText
                    :model-value="modelValue.name"
                    class="w-full"
                    placeholder="例如：生产服务器"
                    @update:model-value="updateText('name', $event)"
                  />
                </FieldContent>
              </Field>

              <div class="create-form-row">
                <Field class="server-create-field">
                  <FieldLabel class="server-create-field-label">认证方式</FieldLabel>
                  <FieldContent class="server-create-field-content">
                    <Select :model-value="modelValue.authType" @update:model-value="updateText('authType', $event)">
                      <SelectTrigger class="w-full">
                        <SelectValue placeholder="请选择认证方式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="option in authTypeOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>

                <Field class="server-create-field server-create-field-compact">
                  <FieldLabel class="server-create-field-label">SSH 端口</FieldLabel>
                  <FieldContent class="server-create-field-content">
                    <InputText
                      :model-value="String(modelValue.port || 22)"
                      class="w-full"
                      inputmode="numeric"
                      @update:model-value="updatePort($event)"
                    />
                  </FieldContent>
                </Field>
              </div>

              <Field class="server-create-field">
                <FieldLabel class="server-create-field-label">SSH 主机</FieldLabel>
                <FieldContent class="server-create-field-content">
                  <InputText
                    :model-value="modelValue.host"
                    class="w-full"
                    placeholder="例如：192.168.1.20"
                    @update:model-value="updateText('host', $event)"
                  />
                </FieldContent>
              </Field>
            </div>
          </section>

          <section class="server-create-section">
            <div class="server-create-section-head">
              <h4>登录凭据</h4>
              <p>根据认证方式填写用户名与密码，或配置服务器私钥路径。</p>
            </div>

            <div class="create-form-grid">
              <Field class="server-create-field">
                <FieldLabel class="server-create-field-label">用户名</FieldLabel>
                <FieldContent class="server-create-field-content">
                  <InputText
                    :model-value="modelValue.username"
                    class="w-full"
                    placeholder="例如：root"
                    @update:model-value="updateText('username', $event)"
                  />
                </FieldContent>
              </Field>

              <Field v-if="modelValue.authType === 'password'" class="server-create-field">
                <FieldLabel class="server-create-field-label">密码</FieldLabel>
                <FieldContent class="server-create-field-content">
                  <div class="password-field">
                    <InputText
                      :model-value="modelValue.password"
                      :type="showPassword ? 'text' : 'password'"
                      class="w-full pr-11"
                      placeholder="输入服务器密码"
                      @update:model-value="updateText('password', $event)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="password-toggle"
                      :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                      @click="showPassword = !showPassword"
                    >
                      <EyeOff v-if="showPassword" class="h-4 w-4" />
                      <Eye v-else class="h-4 w-4" />
                    </Button>
                  </div>
                </FieldContent>
              </Field>

              <Field v-else class="server-create-field">
                <FieldLabel class="server-create-field-label">私钥路径</FieldLabel>
                <FieldContent class="server-create-field-content">
                  <InputText
                    :model-value="modelValue.privateKeyPath"
                    class="w-full"
                    placeholder="例如：~/.ssh/id_rsa"
                    @update:model-value="updateText('privateKeyPath', $event)"
                  />
                </FieldContent>
              </Field>
            </div>
          </section>
        </div>

        <div class="drawer-actions server-create-actions">
          <Button variant="secondary" @click="$emit('check-server')">
            <Wifi class="h-4 w-4" />
            <span>测试连接</span>
          </Button>
          <Button class="app-primary-button" @click="$emit('save-server')">
            <Save class="h-4 w-4" />
            <span>保存配置</span>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { Eye, EyeOff, KeyRound, Plus, Save, Search, Server, ShieldCheck, Trash2, Wifi } from "lucide-vue-next";

import serverBackground from "@/assets/images/server-bg.png";
import ResourceCard from "@/components/ResourceCard.vue";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input as InputText } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { AuthType, ServerFormValue, ServerRecord } from "@/types/task";

const authTypeOptions: Array<{ label: string; value: AuthType }> = [
  { label: "密码认证", value: "password" },
  { label: "私钥认证", value: "privateKey" },
];

const emit = defineEmits<{
  "check-server": [];
  "close-create": [];
  "create-server": [];
  "delete-server-card": [serverId: string];
  "save-server": [];
  "select-server": [serverId: string];
  "update:modelValue": [value: ServerFormValue];
}>();

const props = defineProps<{
  isCreating: boolean;
  modelValue: ServerFormValue;
  selectedServerId: string | null;
  servers: ServerRecord[];
}>();

const showPassword = ref(false);
const searchKeyword = ref("");

const editorMode = computed(() => (props.selectedServerId ? "edit" : "create"));
const filteredServers = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();

  if (!keyword) {
    return props.servers;
  }

  return props.servers.filter((server) => {
    return [server.name, server.host, server.username].some((field) => field.toLowerCase().includes(keyword));
  });
});

function updateText(field: keyof ServerFormValue, value: string | AuthType | undefined) {
  emit("update:modelValue", {
    ...props.modelValue,
    [field]: value ?? "",
  });
}

function updateNumber(field: keyof ServerFormValue, value: number | null | undefined) {
  emit("update:modelValue", {
    ...props.modelValue,
    [field]: value ?? 22,
  });
}

function updatePort(value: string | undefined) {
  const digitsOnly = (value ?? "").replace(/\D+/g, "");
  const nextPort = digitsOnly ? Math.min(Math.max(Number(digitsOnly), 1), 65535) : 22;

  updateNumber("port", Number.isNaN(nextPort) ? 22 : nextPort);
}

function handleDrawerOpenChange(nextOpen: boolean) {
  if (!nextOpen) {
    emit("close-create");
  }
}
</script>

<style scoped>
.server-page {
  grid-column: 1 / -1;
  position: relative;
}

.server-list-page {
  grid-column: 1 / -1;
  display: grid;
  gap: 16px;
}

.server-toolbar-panel {
  display: grid;
  gap: 14px;
  margin-inline: -32px;
  padding: 14px 32px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: #2a2a3c;
}

.server-search-row {
  display: flex;
  align-items: center;
}

.server-search-field {
  position: relative;
  width: 100%;
}

.server-search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  color: #8b8b9a;
  transform: translateY(-50%);
  pointer-events: none;
}

.server-search-input {
  padding-left: 38px;
}

.server-actions-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.server-add-button {
  height: 34px;
  padding-inline: 12px;
  border-radius: 8px;
  border-color: rgba(255, 255, 255, 0.08);
  background: #4a4d63;
  color: #eef0f6;
  box-shadow: none;
  font-size: 13px;
  font-weight: 600;
}

.server-add-button:hover {
  background: #585b72;
  border-color: rgba(255, 255, 255, 0.12);
}

.server-library-section {
  display: grid;
  gap: 12px;
}

.server-section-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.server-section-header h2 {
  margin: 0;
  color: #e0e0e0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
}

.server-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 420px));
  gap: 16px;
  align-items: start;
  justify-content: start;
}

.server-search-empty {
  display: grid;
  gap: 6px;
  padding: 18px 16px;
  border: 1px dashed rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(42, 42, 60, 0.4);
}

.server-search-empty p,
.server-search-empty small {
  margin: 0;
}

.server-search-empty p {
  color: #e0e0e0;
  font-size: 14px;
  font-weight: 500;
}

.server-search-empty small {
  color: #8b8b9a;
  line-height: 1.6;
}

.server-auth-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  justify-self: start;
  min-height: 22px;
  padding: 0 9px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1;
}

.server-auth-badge[data-auth-type="password"] {
  border-color: rgba(212, 160, 58, 0.2);
  background: rgba(212, 160, 58, 0.1);
  color: #d4c48a;
}

.server-auth-badge[data-auth-type="privateKey"] {
  border-color: rgba(92, 184, 92, 0.2);
  background: rgba(92, 184, 92, 0.1);
  color: #8ad48a;
}

.delete-server-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
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

.delete-server-button:hover {
  background: rgba(229, 92, 92, 0.1);
  border-color: rgba(229, 92, 92, 0.15);
  color: #f0a0a0;
}

.delete-server-button:active {
  transform: scale(0.97);
}

.server-empty-shell {
  display: grid;
  gap: 22px;
}

.server-empty-hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-height: 400px;
  padding: 34px 34px 32px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  background: #2a2a3c;
}

.server-empty-hero::after {
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

.server-empty-copy {
  position: relative;
  z-index: 1;
  display: grid;
  align-content: flex-start;
  gap: 26px;
  min-width: 0;
  max-width: 640px;
  padding-top: 10px;
}

.server-empty-copy-head {
  display: grid;
  gap: 12px;
}

.server-empty-eyebrow {
  color: #7aa3d9;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
}

.server-empty-divider {
  width: 44px;
  height: 1px;
  background: linear-gradient(90deg, rgba(74, 127, 193, 0.5), rgba(74, 127, 193, 0));
}

.server-empty-copy h2 {
  margin: 0;
  max-width: 560px;
  color: #e0e0e0;
  font-size: 26px;
  font-weight: 600;
  line-height: 1.15;
  text-wrap: balance;
}

.server-empty-copy p {
  margin: 0;
  max-width: 560px;
  color: #8b8b9a;
  font-size: 14px;
  line-height: 1.8;
}

.server-empty-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  max-width: 540px;
  margin-top: -2px;
}

.server-empty-highlights span {
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

.server-empty-actions {
  display: grid;
  gap: 14px;
  width: fit-content;
  padding-top: 18px;
}

.server-empty-actions :deep(.app-primary-button) {
  min-width: 272px;
  min-height: 40px;
  padding-inline: 20px;
  border-radius: 8px;
}

.server-empty-actions :deep(.app-primary-button span) {
  font-weight: 500;
}

.server-empty-tip {
  display: grid;
  gap: 3px;
  padding-left: 4px;
}

.server-empty-tip small {
  color: #6b6b7a;
  font-size: 11px;
  line-height: 1.6;
}

.server-empty-visual {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.server-empty-visual-image {
  position: absolute;
  right: -20px;
  top: 50%;
  width: min(500px, 56vw);
  max-width: none;
  transform: translateY(-48%);
  opacity: 0.8;
  filter: drop-shadow(0 28px 60px rgba(0, 0, 0, 0.3));
  user-select: none;
}

.server-empty-guide {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.server-empty-step {
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

.server-empty-step::before {
  content: "";
  width: 28px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, #4a7fc1, rgba(74, 127, 193, 0));
}

.server-empty-step span {
  color: #4a7fc1;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.server-empty-step strong {
  color: #e0e0e0;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.3;
}

.server-empty-step p {
  margin: 0;
  color: #8b8b9a;
  font-size: 13px;
  line-height: 1.7;
}

.server-empty-step:hover {
  border-color: rgba(255, 255, 255, 0.1);
  background: #32324a;
  transform: translateY(-1px);
}

.server-empty-step:active {
  transform: scale(0.985);
}

.password-field {
  position: relative;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 4px;
  height: 28px;
  width: 28px;
  transform: translateY(-50%);
  color: #8b8b9a;
}

.password-toggle:hover {
  color: #c8c8d8;
}

.drawer-eyebrow {
  margin: 0 0 10px;
  color: #6b6b7a;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 6px;
}

.server-create-drawer {
  display: flex;
  flex-direction: column;
  width: min(680px, 94vw);
  max-width: min(680px, 94vw);
  height: 100vh;
  padding: 0;
  overflow: hidden;
}

.server-create-header {
  padding: 22px 24px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: #252538;
}

.server-create-head-copy {
  display: grid;
  gap: 8px;
}

.server-create-header :deep(h2),
.server-create-header :deep(p) {
  margin: 0;
}

.server-create-header :deep(h2) {
  color: #e0e0e0;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
}

.server-create-header :deep(p:last-child) {
  color: #8b8b9a;
  font-size: 13px;
  line-height: 1.7;
}

.server-create-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 18px 10px 20px;
}

.server-create-section {
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  background: #2a2a3c;
}

.server-create-section-head {
  display: grid;
  gap: 6px;
}

.server-create-section-head h4 {
  margin: 0;
  color: #e0e0e0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
}

.server-create-section-head p {
  margin: 0;
  color: #8b8b9a;
  font-size: 12px;
  line-height: 1.7;
}

.create-form-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 132px;
  gap: 10px;
  align-items: end;
}

.create-form-grid {
  display: grid;
  gap: 14px;
}

.server-create-field {
  gap: 8px;
}

.server-create-field-label {
  color: #c8c8d8;
  font-size: 12px;
  font-weight: 600;
}

.server-create-field-content {
  gap: 0;
}

.server-create-field-compact {
  min-width: 0;
}

.server-create-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  justify-content: stretch;
  padding: 16px 24px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: #252538;
}

.server-create-actions :deep(button) {
  height: 36px;
  min-height: 36px;
  width: 100%;
  min-width: 0;
  padding-inline: 14px;
  justify-content: center;
}

@media (max-width: 960px) {
  .server-toolbar-panel {
    margin-inline: -24px;
    padding-inline: 24px;
  }

  .server-empty-guide,
  .server-card-list {
    grid-template-columns: 1fr;
  }

  .server-empty-hero {
    padding: 20px;
    min-height: 360px;
  }

  .server-empty-copy {
    gap: 22px;
    max-width: 100%;
  }

  .server-empty-copy h2 {
    font-size: 26px;
  }

  .server-empty-visual-image {
    right: -150px;
    width: min(600px, 78vw);
    opacity: 0.16;
  }

  .create-form-row {
    grid-template-columns: 1fr;
  }

  .server-create-actions {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .server-toolbar-panel {
    margin-inline: -18px;
    padding-inline: 18px;
  }

  .server-empty-shell {
    gap: 16px;
  }

  .server-empty-hero {
    padding: 18px;
    min-height: 320px;
  }

  .server-empty-copy {
    gap: 18px;
    max-width: 100%;
  }

  .server-empty-copy h2 {
    font-size: 22px;
  }

  .server-empty-copy p,
  .server-empty-highlights {
    max-width: 100%;
  }

  .server-empty-actions :deep(.app-primary-button) {
    min-width: 240px;
  }

  .server-empty-visual-image {
    right: -160px;
    width: 500px;
    opacity: 0.12;
  }

  .server-create-header {
    padding: 20px 18px 16px;
  }

  .server-create-scroll {
    padding: 16px 18px 18px;
  }

  .server-create-actions {
    padding: 14px 18px 18px;
  }
}
</style>

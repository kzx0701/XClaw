<template>
  <div class="server-page">
    <article v-if="!selectedServerId" class="server-list-page">
      <header class="server-toolbar">
        <Button class="app-primary-button" @click="$emit('create-server')">
          <Plus class="h-4 w-4" />
          <span>新增服务器</span>
        </Button>
      </header>

      <div v-if="servers.length > 0" class="server-card-list">
        <article
          v-for="server in servers"
          :key="server.id"
          class="server-card"
          @click="$emit('select-server', server.id)"
        >
          <div class="server-card-top">
            <div class="server-card-main">
              <span class="server-icon">
                <Server class="h-5 w-5" aria-hidden="true" />
              </span>

              <div class="server-card-body">
                <strong>{{ server.name }}</strong>
                <span>{{ server.authType === 'password' ? '密码认证' : '私钥认证' }}</span>
                <p>{{ server.host }}:{{ server.port }}</p>
              </div>
            </div>

            <ChevronRight class="server-enter-icon" aria-hidden="true" />
          </div>

          <div class="server-card-foot">
            <span>{{ server.username }}</span>
            <Badge
              :variant="resolveBadgeVariant(server.authType === 'password' ? 'warn' : 'success')"
              :class="['rounded-full', resolveBadgeToneClass(server.authType === 'password' ? 'warn' : 'success')]"
            >
              {{ server.authType === 'password' ? 'Password' : 'SSH Key' }}
            </Badge>
          </div>
        </article>
      </div>

      <section v-else class="server-empty-shell">
        <div class="server-empty-hero">
          <div class="server-empty-copy">
            <div class="server-empty-copy-head">
              <span class="server-empty-eyebrow">服务器工作台</span>
              <span class="server-empty-divider" aria-hidden="true" />
            </div>
            <h2>接入服务器，部署链路才算完整</h2>
            <p>
              新增服务器后，就可以在项目环境里直接绑定目标机器，继续完成连接检测、目录配置和部署执行。
            </p>

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

    <article v-else class="panel-card detail-card">
      <header class="card-head">
        <div>
          <Button variant="ghost" class="back-button" @click="$emit('back-to-list')">
            <ArrowLeft class="h-4 w-4" />
            <span>返回列表</span>
          </Button>
          <h3>{{ modelValue.name || '新服务器' }}</h3>
          <p>在这里查看和编辑服务器配置。</p>
        </div>
        <div class="actions">
          <Button variant="ghost" @click="$emit('delete-server')">
            <Trash2 class="h-4 w-4" />
            <span>删除服务器</span>
          </Button>
          <Button variant="outline" @click="$emit('check-server')">
            <Wifi class="h-4 w-4" />
            <span>测试连接</span>
          </Button>
          <Button class="app-primary-button" @click="$emit('save-server')">
            <Save class="h-4 w-4" />
            <span>保存服务器</span>
          </Button>
        </div>
      </header>

      <div class="detail-summary">
        <div class="summary-item">
          <span>主机地址</span>
          <strong>{{ modelValue.host || '未填写' }}</strong>
        </div>
        <div class="summary-item">
          <span>端口</span>
          <strong>{{ modelValue.port || 22 }}</strong>
        </div>
        <div class="summary-item">
          <span>用户名</span>
          <strong>{{ modelValue.username || '未填写' }}</strong>
        </div>
        <div class="summary-item">
          <span>认证方式</span>
          <strong>{{ modelValue.authType === 'password' ? '密码认证' : '私钥认证' }}</strong>
        </div>
      </div>

      <div class="form-grid">
        <label class="field">
          <span>服务器名称</span>
          <InputText :model-value="modelValue.name" class="w-full" @update:model-value="updateText('name', $event)" />
        </label>

        <label class="field">
          <span>认证方式</span>
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
        </label>

        <label class="field">
          <span>SSH 主机</span>
          <InputText :model-value="modelValue.host" class="w-full" @update:model-value="updateText('host', $event)" />
        </label>

        <label class="field">
          <span>SSH 端口</span>
          <NumberField
            :model-value="modelValue.port"
            :min="1"
            :max="65535"
            @update:model-value="updateNumber('port', $event)"
          >
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput class="h-10 w-full rounded-lg border-[rgba(148,163,184,0.18)] bg-[#101722] px-8 text-[#cbd5e1]" />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </label>

        <label class="field">
          <span>用户名</span>
          <InputText :model-value="modelValue.username" class="w-full" @update:model-value="updateText('username', $event)" />
        </label>

        <label v-if="modelValue.authType === 'password'" class="field">
          <span>密码</span>
          <div class="password-field">
            <InputText
              :model-value="modelValue.password"
              :type="showPassword ? 'text' : 'password'"
              class="w-full pr-11"
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
        </label>

        <label v-else class="field">
          <span>私钥路径</span>
          <InputText
            :model-value="modelValue.privateKeyPath"
            class="w-full"
            @update:model-value="updateText('privateKeyPath', $event)"
          />
        </label>
      </div>
    </article>

    <Drawer :open="isCreating" direction="right" dismissible modal @update:open="handleDrawerOpenChange">
      <DrawerContent class="create-drawer border-[rgba(148,163,184,0.12)] bg-[#141a28] text-[#cbd5e1] shadow-[0_18px_40px_rgba(2,6,23,0.45)]">
        <DrawerHeader class="drawer-head">
          <div>
            <p class="drawer-eyebrow">新增服务器</p>
            <DrawerTitle>填写服务器配置</DrawerTitle>
            <DrawerDescription>保存后，这台服务器就可以在项目环境里直接选择。</DrawerDescription>
          </div>
        </DrawerHeader>

        <div class="drawer-summary">
          <div class="summary-item">
            <span>主机地址</span>
            <strong>{{ modelValue.host || '未填写' }}</strong>
          </div>
          <div class="summary-item">
            <span>认证方式</span>
            <strong>{{ modelValue.authType === 'password' ? '密码认证' : '私钥认证' }}</strong>
          </div>
        </div>

        <div class="form-grid">
          <label class="field">
            <span>服务器名称</span>
            <InputText :model-value="modelValue.name" class="w-full" @update:model-value="updateText('name', $event)" />
          </label>

          <label class="field">
            <span>认证方式</span>
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
          </label>

          <label class="field">
            <span>SSH 主机</span>
            <InputText :model-value="modelValue.host" class="w-full" @update:model-value="updateText('host', $event)" />
          </label>

          <label class="field">
            <span>SSH 端口</span>
            <NumberField
              :model-value="modelValue.port"
              :min="1"
              :max="65535"
              @update:model-value="updateNumber('port', $event)"
            >
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput class="h-10 w-full rounded-lg border-[rgba(148,163,184,0.18)] bg-[#101722] px-8 text-[#cbd5e1]" />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </label>

          <label class="field">
            <span>用户名</span>
            <InputText :model-value="modelValue.username" class="w-full" @update:model-value="updateText('username', $event)" />
          </label>

          <label v-if="modelValue.authType === 'password'" class="field">
            <span>密码</span>
            <div class="password-field">
              <InputText
                :model-value="modelValue.password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full pr-11"
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
          </label>

          <label v-else class="field">
            <span>私钥路径</span>
            <InputText
              :model-value="modelValue.privateKeyPath"
              class="w-full"
              @update:model-value="updateText('privateKeyPath', $event)"
            />
          </label>
        </div>

        <div class="drawer-actions">
          <Button variant="outline" @click="$emit('close-create')">取消</Button>
          <Button variant="outline" @click="$emit('check-server')">
            <Wifi class="h-4 w-4" />
            <span>测试连接</span>
          </Button>
          <Button class="app-primary-button" @click="$emit('save-server')">
            <Save class="h-4 w-4" />
            <span>保存服务器</span>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, ChevronRight, Eye, EyeOff, Plus, Save, Server, Trash2, Wifi } from 'lucide-vue-next'

import serverBackground from '@/assets/images/server-bg.png'
import Badge from '@/components/ui/badge/Badge.vue'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input as InputText } from '@/components/ui/input'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { resolveBadgeToneClass, resolveBadgeVariant } from '@/lib/ui-status'
import type { AuthType, ServerFormValue, ServerRecord } from '@/types/task'

const authTypeOptions: Array<{ label: string; value: AuthType }> = [
  { label: '密码认证', value: 'password' },
  { label: '私钥认证', value: 'privateKey' },
]

const emit = defineEmits<{
  'back-to-list': []
  'check-server': []
  'close-create': []
  'create-server': []
  'delete-server': []
  'save-server': []
  'select-server': [serverId: string]
  'update:modelValue': [value: ServerFormValue]
}>()

const props = defineProps<{
  isCreating: boolean
  modelValue: ServerFormValue
  selectedServerId: string | null
  servers: ServerRecord[]
}>()

const showPassword = ref(false)

function updateText(field: keyof ServerFormValue, value: string | AuthType | undefined) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value ?? '',
  })
}

function updateNumber(field: keyof ServerFormValue, value: number | null | undefined) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value ?? 22,
  })
}

function handleDrawerOpenChange(nextOpen: boolean) {
  if (!nextOpen) {
    emit('close-create')
  }
}
</script>

<style scoped>
.server-page {
  grid-column: 1 / -1;
  position: relative;
}

.server-list-page,
.detail-card {
  grid-column: 1 / -1;
}

.server-list-page {
  display: grid;
  gap: 14px;
}

.server-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 4px;
}

.server-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.server-card {
  display: grid;
  gap: 16px;
  min-width: 0;
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(30, 41, 59, 0.14), rgba(20, 26, 40, 0.96)),
    #141a28;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.02),
    0 12px 24px rgba(2, 6, 23, 0.18);
  color: #e2e8f0;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease,
    background-color 160ms ease;
}

.server-card:hover {
  border-color: rgba(59, 130, 246, 0.22);
  transform: translateY(-1px);
}

.server-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.server-card-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.server-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #101722;
  color: #93c5fd;
  flex: 0 0 auto;
}

.server-card-body {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.server-card-body strong,
.server-card-body span,
.server-card-body p,
.server-card-foot span {
  margin: 0;
}

.server-card-body strong {
  color: #f8fafc;
  font-size: 15px;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.server-card-body span {
  color: #93c5fd;
  font-size: 11px;
  font-weight: 700;
}

.server-card-body p {
  color: #8fa1bc;
  font-size: 12px;
  line-height: 1.6;
  word-break: break-all;
}

.server-enter-icon {
  color: #64748b;
  flex: 0 0 auto;
}

.server-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.server-card-foot span {
  color: #94a3b8;
  font-size: 12px;
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
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 34%),
    linear-gradient(90deg, rgba(15, 23, 42, 0.96) 0%, rgba(15, 23, 42, 0.9) 48%, rgba(15, 23, 42, 0.62) 72%, rgba(15, 23, 42, 0.28) 100%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(15, 23, 42, 0.84));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 20px 40px rgba(2, 6, 23, 0.22);
}

.server-empty-hero::after {
  content: '';
  position: absolute;
  right: -140px;
  bottom: -160px;
  width: 340px;
  height: 340px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.14), transparent 70%);
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
  color: #8fb4ff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.server-empty-divider {
  width: 44px;
  height: 1px;
  background: linear-gradient(90deg, rgba(96, 165, 250, 0.65), rgba(96, 165, 250, 0));
}

.server-empty-copy h2 {
  margin: 0;
  max-width: 560px;
  color: #f8fafc;
  font-size: 32px;
  line-height: 1.08;
  letter-spacing: -0.038em;
  text-wrap: balance;
}

.server-empty-copy p {
  margin: 0;
  max-width: 560px;
  color: #93a4bf;
  font-size: 15px;
  line-height: 1.95;
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
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.22);
  color: #9fb0c9;
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
  min-height: 44px;
  padding-inline: 20px;
  border-radius: 12px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 10px 26px rgba(37, 99, 235, 0.22);
}

.server-empty-actions :deep(.app-primary-button span) {
  font-weight: 700;
  letter-spacing: 0.01em;
}

.server-empty-tip {
  display: grid;
  gap: 3px;
  padding-left: 4px;
}

.server-empty-tip span {
  color: #e2e8f0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.server-empty-tip small {
  color: #708198;
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
  right: -60px;
  top: 50%;
  width: min(550px, 56vw);
  max-width: none;
  transform: translateY(-48%);
  opacity: 0.76;
  filter: drop-shadow(0 28px 60px rgba(2, 6, 23, 0.34));
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
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(30, 41, 59, 0.16), rgba(20, 26, 40, 0.96)),
    #141a28;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.02),
    0 8px 20px rgba(2, 6, 23, 0.14);
  transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
}

.server-empty-step::before {
  content: '';
  width: 28px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, #60a5fa, rgba(96, 165, 250, 0));
}

.server-empty-step span {
  color: #60a5fa;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.server-empty-step strong {
  color: #f8fafc;
  font-size: 15px;
  line-height: 1.3;
}

.server-empty-step p {
  margin: 0;
  color: #8fa1bc;
  font-size: 13px;
  line-height: 1.7;
}

.server-empty-step:hover {
  border-color: rgba(96, 165, 250, 0.18);
  transform: translateY(-1px);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.card-head h3 {
  margin: 10px 0 0;
  font-size: 18px;
  line-height: 1.2;
  color: #f8fafc;
}

.card-head p {
  margin: 8px 0 0;
  color: #64748b;
}

.back-button {
  padding-left: 0;
}

.detail-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.summary-item {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 8px;
  background: #101722;
}

.summary-item span {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.summary-item strong {
  color: #e2e8f0;
  word-break: break-word;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;
}

.field {
  display: grid;
  gap: 9px;
}

.field span {
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 700;
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
  color: #94a3b8;
}

.password-toggle:hover {
  color: #e2e8f0;
}

.drawer-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.drawer-head :deep(h2),
.drawer-head :deep(p) {
  margin: 0;
}

.drawer-head :deep(h2) {
  color: #e2e8f0;
  font-size: 18px;
  line-height: 1.15;
}

.drawer-head :deep(p + p) {
  margin-top: 8px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.drawer-eyebrow {
  margin: 0 0 10px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.drawer-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 6px;
}

@media (max-width: 960px) {
  .card-head {
    flex-direction: column;
  }

  .server-empty-guide,
  .server-card-list,
  .detail-summary,
  .drawer-summary,
  .form-grid {
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
}

@media (max-width: 640px) {
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
}
</style>

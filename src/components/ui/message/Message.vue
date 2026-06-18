<template>
  <Alert :class="[toneClass, props.class]" :variant="variant">
    <slot />
  </Alert>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Alert from '@/components/ui/alert/Alert.vue'

const props = withDefaults(defineProps<{
  class?: string
  closable?: boolean
  severity?: 'success' | 'warn' | 'error' | 'secondary' | 'info'
}>(), {
  class: '',
  closable: false,
  severity: 'info',
})

const variant = computed(() => {
  if (props.severity === 'error') {
    return 'destructive'
  }

  return 'default'
})

const toneClass = computed(() => {
  if (props.severity === 'success') {
    return 'border-[var(--success-soft)] bg-[var(--success-tint)] text-[var(--success)]'
  }

  if (props.severity === 'warn') {
    return 'border-[var(--warning-soft)] bg-[var(--warning-tint)] text-[var(--warning)]'
  }

  if (props.severity === 'error') {
    return 'border-[var(--danger-soft)] bg-[var(--danger-tint)] text-[var(--danger-soft)]'
  }

  if (props.severity === 'secondary') {
    return 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]'
  }

  return 'border-[var(--border)] bg-[var(--info-tint)] text-[var(--info)]'
})
</script>

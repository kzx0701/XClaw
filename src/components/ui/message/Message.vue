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
    return 'border-[#14532d] bg-[#0d2a1e] text-[#8ad48a]'
  }

  if (props.severity === 'warn') {
    return 'border-[#7c2d12] bg-[#2d1a0e] text-[#d4c48a]'
  }

  if (props.severity === 'error') {
    return 'border-[#7f1d1d] bg-[#2d1316] text-[#e06060]'
  }

  if (props.severity === 'secondary') {
    return 'border border-[var(--border)] bg-[#fdfcfc] text-[#424245]'
  }

  return 'border-[var(--border)] bg-[var(--info-tint)] text-[#007aff]'
})
</script>
